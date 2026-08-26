#!/usr/bin/env python3
import argparse
import calendar
import csv
import json
import math
import os
import statistics
import sys
import urllib.parse
import urllib.request
import zipfile
from collections import Counter, defaultdict
from pathlib import Path

from normalize import classify, money, norm_key, yes

DB_NAME = 'radar-rentable-estado'
CF_API = 'https://api.cloudflare.com/client/v4'
MAX_FREE_PROCESSES = 20_000

ALIASES = {
    'code': ['CodigoCotizacion'],
    'published_at': ['FechaPublicacionParaCotizar'],
    'buyer_id': ['RUTUnidaddeCompra', 'CodigoUnidaddeCompra'],
    'buyer_name': ['RazonSocialUnidaddeCompra', 'NombreUnidaddeCompra', 'NombreOOPP'],
    'region': ['Region'],
    'title': ['NombreCotizacion'],
    'description': ['DescripcionCotizacion'],
    'budget': ['MontoTotalDisponble', 'MontoTotalDisponible'],
    'status': ['Estado'],
    'supplier_id': ['RUTProveedor'],
    'supplier_name': ['RazonSocialProveedor'],
    'selected': ['ProveedorSeleccionado'],
    'selected_amount': ['MontoTotal'],
    'product': ['ProductoCotizado', 'NombreProductoGenerico', 'DetalleCotizacion'],
    'order_code': ['CodigoOC'],
    'order_status': ['EstadoOC'],
    'accepted_at': ['FechaAceptacionOCProveedor'],
}


def pick(row, key):
    normalized = {norm_key(k): v for k, v in row.items()}
    for name in ALIASES[key]:
        value = normalized.get(norm_key(name))
        if value is not None and str(value).strip():
            return str(value).strip()
    return None


def open_csvs(archive_path):
    archive = zipfile.ZipFile(archive_path)
    try:
        for name in sorted(archive.namelist()):
            if not name.lower().endswith('.csv'):
                continue
            raw = archive.open(name)
            text = __import__('io').TextIOWrapper(raw, encoding='utf-8-sig', errors='replace', newline='')
            try:
                yield name, csv.DictReader(text, delimiter=';', quotechar='"')
            finally:
                text.close()
    finally:
        archive.close()


def period_end(period):
    year, month = map(int, period.split('-'))
    return f'{year:04d}-{month:02d}-{calendar.monthrange(year, month)[1]:02d}'


def prepare(archive_path, period, max_processes):
    if max_processes < 10_000:
        raise SystemExit('max_processes must be at least 10000 for the Phase 0 evidence target')
    if max_processes > MAX_FREE_PROCESSES:
        raise SystemExit(f'max_processes exceeds free-only guard ({MAX_FREE_PROCESSES})')

    selected_codes = set()
    processes = {}
    rows_seen = 0
    rows_used = 0
    headers = []

    for filename, reader in open_csvs(archive_path):
        headers.append({'file': filename, 'columns': reader.fieldnames or []})
        for row in reader:
            rows_seen += 1
            code = pick(row, 'code')
            if not code:
                continue
            if code not in selected_codes:
                if len(selected_codes) >= max_processes:
                    continue
                selected_codes.add(code)
                processes[code] = {
                    'codigo': code,
                    'estado': None,
                    'published_at': None,
                    'buyer_id': None,
                    'buyer_name': None,
                    'region': None,
                    'title': None,
                    'budget_clp': None,
                    'supplier_keys': set(),
                    'selected_supplier_id': None,
                    'selected_amount_clp': None,
                    'category_votes': Counter(),
                    'sample': {},
                }
            if code not in selected_codes:
                continue

            rows_used += 1
            p = processes[code]
            p['estado'] = p['estado'] or pick(row, 'status')
            p['published_at'] = p['published_at'] or pick(row, 'published_at')
            p['buyer_id'] = p['buyer_id'] or pick(row, 'buyer_id')
            p['buyer_name'] = p['buyer_name'] or pick(row, 'buyer_name')
            p['region'] = p['region'] or pick(row, 'region')
            p['title'] = p['title'] or pick(row, 'title')
            if p['budget_clp'] is None:
                p['budget_clp'] = money(pick(row, 'budget'))

            supplier_id = pick(row, 'supplier_id')
            supplier_name = pick(row, 'supplier_name')
            supplier_key = supplier_id or supplier_name
            if supplier_key:
                p['supplier_keys'].add(supplier_key)

            combined = ' '.join(filter(None, [
                pick(row, 'title'), pick(row, 'description'), pick(row, 'product')
            ]))
            p['category_votes'][classify(combined)] += 1

            if yes(pick(row, 'selected')):
                p['selected_supplier_id'] = supplier_id or p['selected_supplier_id']
                selected_amount = money(pick(row, 'selected_amount'))
                if selected_amount and selected_amount > 0:
                    p['selected_amount_clp'] = selected_amount

            if not p['sample']:
                p['sample'] = {
                    'order_code': pick(row, 'order_code'),
                    'order_status': pick(row, 'order_status'),
                    'accepted_at': pick(row, 'accepted_at'),
                    'product': pick(row, 'product'),
                }

    result_processes = []
    for p in processes.values():
        category = p['category_votes'].most_common(1)[0][0] if p['category_votes'] else 'OTROS'
        raw_summary = json.dumps({
            'source': 'ChileCompra Datos Abiertos - Cotizaciones Compra Agil',
            'period': period,
            **p['sample'],
        }, ensure_ascii=False, separators=(',', ':'))
        result_processes.append({
            'codigo': p['codigo'],
            'estado': p['estado'],
            'published_at': p['published_at'],
            'changed_at': p['sample'].get('accepted_at'),
            'buyer_id': p['buyer_id'],
            'buyer_name': p['buyer_name'],
            'region': p['region'],
            'title': p['title'],
            'budget_clp': p['budget_clp'],
            'competitor_count': len(p['supplier_keys']),
            'selected_supplier_id': p['selected_supplier_id'],
            'selected_amount_clp': p['selected_amount_clp'],
            'category': category,
            'raw_json': raw_summary,
        })

    metrics = build_metrics(result_processes)
    return {
        'source': f'chilecompra_open_data:COT_{period}',
        'period': period,
        'as_of_date': period_end(period),
        'summary': {
            'archive_rows_scanned': rows_seen,
            'rows_for_selected_processes': rows_used,
            'processes': len(result_processes),
            'categories': len(metrics),
            'files': [h['file'] for h in headers],
        },
        'processes': result_processes,
        'metrics': metrics,
    }


def build_metrics(processes):
    groups = defaultdict(list)
    for p in processes:
        groups[p['category'] or 'OTROS'].append(p)

    metrics = []
    for category, rows in groups.items():
        budgets = [p['budget_clp'] for p in rows if p['budget_clp'] and p['budget_clp'] > 0]
        competitors = [p['competitor_count'] for p in rows if p['competitor_count'] is not None]
        buyers = Counter((p['buyer_id'] or p['buyer_name']) for p in rows if (p['buyer_id'] or p['buyer_name']))
        process_count = len(rows)
        observed_competition = [c for c in competitors if c > 0]
        low_competition = (
            sum(1 <= c <= 3 for c in observed_competition) / len(observed_competition)
            if observed_competition else 0
        )
        repeat_processes = sum(1 for p in rows if buyers.get(p['buyer_id'] or p['buyer_name'], 0) >= 2)
        repeated = repeat_processes / process_count if process_count else 0
        selected_prices = [p['selected_amount_clp'] for p in rows if p['selected_amount_clp'] and p['selected_amount_clp'] > 0]
        coverage = len(selected_prices) / process_count if process_count else 0
        median_budget = statistics.median(budgets) if budgets else None
        median_competitors = statistics.median(competitors) if competitors else 0
        demand = min(1, math.log1p(process_count) / math.log(5001))
        ticket = min(1, math.log1p(median_budget) / math.log(5_000_001)) if median_budget else 0
        score = 100 * (0.30 * demand + 0.20 * low_competition + 0.15 * repeated + 0.15 * ticket + 0.20 * coverage)
        confidence = min(1, process_count / 500) * min(1, max(len(budgets), len(selected_prices), 1) / 200)
        metrics.append({
            'category': category,
            'process_count': process_count,
            'total_budget_clp': round(sum(budgets), 2) if budgets else None,
            'median_budget_clp': round(median_budget, 2) if median_budget is not None else None,
            'median_competitors': round(float(median_competitors), 2),
            'low_competition_share': round(low_competition, 4),
            'repeated_buyer_share': round(repeated, 4),
            'price_observability': round(coverage, 4),
            'outlier_share': 0,
            'opportunity_market_score': round(score, 2),
            'score_confidence': round(confidence, 3),
        })
    return sorted(metrics, key=lambda x: x['opportunity_market_score'], reverse=True)


def request_json(method, url, token, body=None):
    data = None if body is None else json.dumps(body, ensure_ascii=False).encode('utf-8')
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header('Authorization', f'Bearer {token}')
    req.add_header('Content-Type', 'application/json')
    try:
        with urllib.request.urlopen(req, timeout=60) as response:
            payload = json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode('utf-8', errors='replace')[:1000]
        raise RuntimeError(f'Cloudflare API HTTP {exc.code}: {detail}') from exc
    if not payload.get('success'):
        raise RuntimeError(f'Cloudflare API failure: {payload.get("errors", [])}')
    return payload


def resolve_database(account, token):
    url = f'{CF_API}/accounts/{account}/d1/database?name={urllib.parse.quote(DB_NAME)}&per_page=10'
    payload = request_json('GET', url, token)
    matches = [x for x in payload.get('result', []) if x.get('name') == DB_NAME]
    if len(matches) != 1:
        raise RuntimeError(f'Expected exactly one D1 database named {DB_NAME}; found {len(matches)}')
    return matches[0].get('uuid')


def sql_literal(value):
    if value is None:
        return 'NULL'
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        if isinstance(value, float) and not math.isfinite(value):
            return 'NULL'
        return str(value)
    text = str(value).replace('\x00', '').replace("'", "''")
    return "'" + text + "'"


def d1_query(account, db_id, token, sql):
    url = f'{CF_API}/accounts/{account}/d1/database/{db_id}/query'
    payload = request_json('POST', url, token, {'sql': sql})
    for result in payload.get('result', []):
        if result.get('success') is False:
            raise RuntimeError('D1 query result reported failure')
    return payload


def already_loaded(account, db_id, token, source):
    sql = f"SELECT last_success_at FROM sync_state WHERE source={sql_literal(source)} LIMIT 1;"
    payload = d1_query(account, db_id, token, sql)
    rows = (payload.get('result') or [{}])[0].get('results') or []
    return bool(rows and rows[0].get('last_success_at'))


def upsert_processes(account, db_id, token, rows, batch_size=150):
    columns = [
        'codigo', 'estado', 'published_at', 'changed_at', 'buyer_id', 'buyer_name', 'region',
        'title', 'budget_clp', 'competitor_count', 'selected_supplier_id', 'selected_amount_clp',
        'category', 'raw_json'
    ]
    update_cols = [c for c in columns if c != 'codigo']
    for start in range(0, len(rows), batch_size):
        batch = rows[start:start + batch_size]
        values = []
        for row in batch:
            values.append('(' + ','.join(sql_literal(row.get(c)) for c in columns) + ')')
        sql = (
            f"INSERT INTO compra_agil_raw ({','.join(columns)}) VALUES " + ','.join(values) +
            " ON CONFLICT(codigo) DO UPDATE SET " +
            ','.join(f'{c}=excluded.{c}' for c in update_cols) +
            ",updated_at=datetime('now');"
        )
        d1_query(account, db_id, token, sql)
        print(f'Uploaded processes: {min(start + len(batch), len(rows))}/{len(rows)}')


def upsert_metrics(account, db_id, token, prepared):
    metrics = prepared['metrics']
    cols = [
        'category', 'process_count', 'total_budget_clp', 'median_budget_clp', 'median_competitors',
        'low_competition_share', 'repeated_buyer_share', 'price_observability', 'outlier_share',
        'opportunity_market_score', 'score_confidence'
    ]
    values = ['(' + ','.join(sql_literal(m.get(c)) for c in cols) + ')' for m in metrics]
    sql = (
        f"INSERT INTO category_metrics ({','.join(cols)}) VALUES " + ','.join(values) +
        " ON CONFLICT(category) DO UPDATE SET " +
        ','.join(f'{c}=excluded.{c}' for c in cols if c != 'category') +
        ",updated_at=datetime('now');"
    )
    d1_query(account, db_id, token, sql)

    rank_values = []
    for m in metrics:
        components = json.dumps({
            'median_budget_clp': m['median_budget_clp'],
            'median_competitors': m['median_competitors'],
            'low_competition_share': m['low_competition_share'],
            'repeated_buyer_share': m['repeated_buyer_share'],
            'price_observability': m['price_observability'],
            'confidence': m['score_confidence'],
        }, ensure_ascii=False, separators=(',', ':'))
        rank_values.append('(' + ','.join(sql_literal(v) for v in [
            prepared['as_of_date'], m['category'], m['process_count'], m['median_budget_clp'],
            m['median_competitors'], m['low_competition_share'], m['repeated_buyer_share'],
            m['price_observability'], m['opportunity_market_score'], components
        ]) + ')')
    rank_cols = 'as_of_date,category,opportunities,median_budget_clp,avg_competitors,low_competition_rate,repeat_buyer_rate,price_coverage,market_score,components_json'
    rank_sql = (
        f"INSERT INTO vertical_rankings ({rank_cols}) VALUES " + ','.join(rank_values) +
        " ON CONFLICT(as_of_date,category) DO UPDATE SET "
        "opportunities=excluded.opportunities,median_budget_clp=excluded.median_budget_clp,"
        "avg_competitors=excluded.avg_competitors,low_competition_rate=excluded.low_competition_rate,"
        "repeat_buyer_rate=excluded.repeat_buyer_rate,price_coverage=excluded.price_coverage,"
        "market_score=excluded.market_score,components_json=excluded.components_json;"
    )
    d1_query(account, db_id, token, rank_sql)


def apply(prepared, force=False):
    account = os.environ.get('CLOUDFLARE_ACCOUNT_ID', '').strip()
    token = os.environ.get('CLOUDFLARE_API_TOKEN', '').strip()
    if not account or not token:
        raise SystemExit('Cloudflare credentials are required for apply mode')
    if not token.startswith('cfat_'):
        raise SystemExit('Expected Cloudflare Account API Token (cfat_ prefix)')
    db_id = resolve_database(account, token)
    if already_loaded(account, db_id, token, prepared['source']) and not force:
        print(f"Source already loaded: {prepared['source']}; no writes performed.")
        return {'skipped': True, 'reason': 'already_loaded'}

    process_count = len(prepared['processes'])
    if process_count > MAX_FREE_PROCESSES:
        raise SystemExit('Prepared data exceeds free-only write guard')

    upsert_processes(account, db_id, token, prepared['processes'])
    upsert_metrics(account, db_id, token, prepared)
    sync_sql = (
        "INSERT INTO sync_state(source,cursor,last_success_at,last_error,updated_at) VALUES ("
        f"{sql_literal(prepared['source'])},{sql_literal(prepared['period'])},datetime('now'),NULL,datetime('now')) "
        "ON CONFLICT(source) DO UPDATE SET cursor=excluded.cursor,last_success_at=excluded.last_success_at,"
        "last_error=NULL,updated_at=datetime('now');"
    )
    d1_query(account, db_id, token, sync_sql)

    verify = d1_query(account, db_id, token,
        "SELECT COUNT(*) AS processes FROM compra_agil_raw; SELECT COUNT(*) AS categories FROM category_metrics;")
    result_sets = verify.get('result') or []
    processes_total = ((result_sets[0].get('results') or [{}])[0]).get('processes') if result_sets else None
    categories_total = ((result_sets[1].get('results') or [{}])[0]).get('categories') if len(result_sets) > 1 else None
    print(f'D1 verification: processes={processes_total}; categories={categories_total}')
    return {'skipped': False, 'processes_total': processes_total, 'categories_total': categories_total}


def main():
    parser = argparse.ArgumentParser(description='Streaming ingestion for ChileCompra public Compra Agil open data.')
    sub = parser.add_subparsers(dest='command', required=True)

    p = sub.add_parser('prepare')
    p.add_argument('archive')
    p.add_argument('--period', required=True)
    p.add_argument('--max-processes', type=int, default=15_000)
    p.add_argument('--out', required=True)

    a = sub.add_parser('apply')
    a.add_argument('prepared')
    a.add_argument('--force', action='store_true')

    args = parser.parse_args()
    if args.command == 'prepare':
        prepared = prepare(args.archive, args.period, args.max_processes)
        Path(args.out).write_text(json.dumps(prepared, ensure_ascii=False), encoding='utf-8')
        print(json.dumps({
            'summary': prepared['summary'],
            'top_categories': prepared['metrics'][:8],
            'free_only_guard': f'processes <= {MAX_FREE_PROCESSES}',
        }, ensure_ascii=False, indent=2))
        if prepared['summary']['processes'] < 10_000:
            raise SystemExit('Evidence target not met: fewer than 10000 processes')
    else:
        prepared = json.loads(Path(args.prepared).read_text(encoding='utf-8'))
        outcome = apply(prepared, force=args.force)
        print(json.dumps(outcome, ensure_ascii=False))


if __name__ == '__main__':
    main()
