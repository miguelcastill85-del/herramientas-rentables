#!/usr/bin/env python3
import argparse
import calendar
import csv
import io
import json
import zipfile
from pathlib import Path

from normalize import classify, money, yes
from open_data_ingest import MAX_FREE_PROCESSES, build_metrics


def first(row, *keys):
    for key in keys:
        value = row.get(key)
        if value is not None and str(value).strip():
            return str(value).strip()
    return None


def period_end(period):
    year, month = map(int, period.split('-'))
    return f'{year:04d}-{month:02d}-{calendar.monthrange(year, month)[1]:02d}'


def prepare(archive_path, period, limit):
    if not 10_000 <= limit <= MAX_FREE_PROCESSES:
        raise SystemExit(f'free-only guard requires max_processes between 10000 and {MAX_FREE_PROCESSES}')

    selected = set()
    data = {}
    rows_scanned = 0
    rows_used = 0
    files = []

    with zipfile.ZipFile(archive_path) as archive:
        for name in sorted(archive.namelist()):
            if not name.lower().endswith('.csv'):
                continue
            files.append(name)
            with archive.open(name) as raw:
                text = io.TextIOWrapper(raw, encoding='utf-8-sig', errors='replace', newline='')
                reader = csv.DictReader(text, delimiter=';', quotechar='"')
                required = {'CodigoCotizacion', 'NombreCotizacion', 'RUTProveedor'}
                missing = sorted(required.difference(reader.fieldnames or []))
                if missing:
                    raise SystemExit(f'Unexpected ChileCompra schema in {name}; missing {missing}')
                for row in reader:
                    rows_scanned += 1
                    code = first(row, 'CodigoCotizacion')
                    if not code:
                        continue
                    if code not in selected:
                        if len(selected) >= limit:
                            continue
                        selected.add(code)
                        data[code] = {
                            'codigo': code,
                            'estado': first(row, 'Estado'),
                            'published_at': first(row, 'FechaPublicacionParaCotizar'),
                            'changed_at': first(row, 'FechaAceptacionOCProveedor'),
                            'buyer_id': first(row, 'RUTUnidaddeCompra', 'CodigoUnidaddeCompra'),
                            'buyer_name': first(row, 'RazonSocialUnidaddeCompra', 'NombreUnidaddeCompra', 'NombreOOPP'),
                            'region': first(row, 'Region'),
                            'title': first(row, 'NombreCotizacion'),
                            'budget_clp': money(first(row, 'MontoTotalDisponble', 'MontoTotalDisponible')),
                            'supplier_keys': set(),
                            'selected_supplier_id': None,
                            'selected_amount_clp': None,
                            'texts': [],
                            'order_code': first(row, 'CodigoOC'),
                            'order_status': first(row, 'EstadoOC'),
                        }
                    if code not in selected:
                        continue

                    rows_used += 1
                    p = data[code]
                    supplier = first(row, 'RUTProveedor', 'RazonSocialProveedor')
                    if supplier:
                        p['supplier_keys'].add(supplier)
                    if yes(first(row, 'ProveedorSeleccionado')):
                        p['selected_supplier_id'] = first(row, 'RUTProveedor') or p['selected_supplier_id']
                        amount = money(first(row, 'MontoTotal'))
                        if amount and amount > 0:
                            p['selected_amount_clp'] = amount
                    if len(p['texts']) < 4:
                        snippet = ' '.join(filter(None, [
                            first(row, 'NombreCotizacion'),
                            first(row, 'DescripcionCotizacion'),
                            first(row, 'ProductoCotizado'),
                            first(row, 'NombreProductoGenerico'),
                            first(row, 'DetalleCotizacion'),
                        ]))
                        if snippet and snippet not in p['texts']:
                            p['texts'].append(snippet)

    processes = []
    for p in data.values():
        category = classify(' '.join(p['texts']))
        raw_json = json.dumps({
            'source': 'ChileCompra Datos Abiertos - Cotizaciones Compra Agil',
            'period': period,
            'order_code': p['order_code'],
            'order_status': p['order_status'],
        }, ensure_ascii=False, separators=(',', ':'))
        processes.append({
            'codigo': p['codigo'],
            'estado': p['estado'],
            'published_at': p['published_at'],
            'changed_at': p['changed_at'],
            'buyer_id': p['buyer_id'],
            'buyer_name': p['buyer_name'],
            'region': p['region'],
            'title': p['title'],
            'budget_clp': p['budget_clp'],
            'competitor_count': len(p['supplier_keys']),
            'selected_supplier_id': p['selected_supplier_id'],
            'selected_amount_clp': p['selected_amount_clp'],
            'category': category,
            'raw_json': raw_json,
        })

    metrics = build_metrics(processes)
    return {
        'source': f'chilecompra_open_data:COT_{period}',
        'period': period,
        'as_of_date': period_end(period),
        'summary': {
            'archive_rows_scanned': rows_scanned,
            'rows_for_selected_processes': rows_used,
            'processes': len(processes),
            'categories': len(metrics),
            'files': files,
        },
        'processes': processes,
        'metrics': metrics,
    }


def main():
    parser = argparse.ArgumentParser(description='Prepare a free-tier-sized sample from official ChileCompra Compra Agil open data.')
    parser.add_argument('archive')
    parser.add_argument('--period', required=True)
    parser.add_argument('--max-processes', type=int, default=15_000)
    parser.add_argument('--out', required=True)
    args = parser.parse_args()
    prepared = prepare(args.archive, args.period, args.max_processes)
    Path(args.out).write_text(json.dumps(prepared, ensure_ascii=False), encoding='utf-8')
    print(json.dumps({
        'summary': prepared['summary'],
        'top_categories': prepared['metrics'][:8],
        'free_only_guard': f"{len(prepared['processes'])} <= {MAX_FREE_PROCESSES}",
    }, ensure_ascii=False, indent=2))
    if len(prepared['processes']) < 10_000:
        raise SystemExit('Evidence target not met: fewer than 10000 processes')


if __name__ == '__main__':
    main()
