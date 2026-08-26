#!/usr/bin/env python3
import argparse
import json
import os
from collections import Counter
from pathlib import Path

from open_data_ingest import (
    MAX_FREE_PROCESSES,
    d1_query,
    resolve_database,
    sql_literal,
    upsert_metrics,
)

EXPECTED_PROCESSES = 15_000
MAX_CHANGED_PROCESSES = 9_000
READ_BATCH = 300
WRITE_BATCH = 120


def rows(payload):
    result = payload.get('result') or []
    return (result[0].get('results') or []) if result else []


def scalar(account, db_id, token, sql, key):
    result_rows = rows(d1_query(account, db_id, token, sql))
    if not result_rows:
        raise RuntimeError(f'Expected one row for scalar query: {key}')
    return result_rows[0].get(key)


def chunks(values, size):
    for start in range(0, len(values), size):
        yield values[start:start + size]


def fetch_existing_categories(account, db_id, token, codes):
    existing = {}
    for batch in chunks(codes, READ_BATCH):
        literals = ','.join(sql_literal(code) for code in batch)
        payload = d1_query(
            account,
            db_id,
            token,
            f'SELECT codigo, category FROM compra_agil_raw WHERE codigo IN ({literals});',
        )
        for row in rows(payload):
            existing[row['codigo']] = row.get('category') or 'OTROS'
    return existing


def update_changed_categories(account, db_id, token, changes):
    estimated_rows_written = 0
    for batch in chunks(changes, WRITE_BATCH):
        cases = ' '.join(
            f'WHEN {sql_literal(item["codigo"])} THEN {sql_literal(item["category"])}'
            for item in batch
        )
        code_list = ','.join(sql_literal(item['codigo']) for item in batch)
        sql = (
            'UPDATE compra_agil_raw SET category = CASE codigo '
            f'{cases} ELSE category END, updated_at=datetime(\'now\') '
            f'WHERE codigo IN ({code_list});'
        )
        payload = d1_query(account, db_id, token, sql)
        for result in payload.get('result') or []:
            meta = result.get('meta') or {}
            estimated_rows_written += int(meta.get('rows_written') or 0)
        print(f'Updated categories: {min(estimated_rows_written, len(changes) * 2)} estimated indexed-row writes; processes={len(batch)} batch')
    return estimated_rows_written


def cleanup_stale_metrics(account, db_id, token, prepared):
    categories = [m['category'] for m in prepared['metrics']]
    category_list = ','.join(sql_literal(category) for category in categories)
    d1_query(
        account,
        db_id,
        token,
        f'DELETE FROM category_metrics WHERE category NOT IN ({category_list});',
    )
    d1_query(
        account,
        db_id,
        token,
        'DELETE FROM vertical_rankings '
        f'WHERE as_of_date={sql_literal(prepared["as_of_date"])} '
        f'AND category NOT IN ({category_list});',
    )


def verify_snapshot(account, db_id, token, prepared):
    payload = d1_query(
        account,
        db_id,
        token,
        'SELECT category, COUNT(*) AS process_count FROM compra_agil_raw GROUP BY category ORDER BY category;',
    )
    actual = {row['category'] or 'OTROS': int(row['process_count']) for row in rows(payload)}
    expected = {m['category']: int(m['process_count']) for m in prepared['metrics']}
    if actual != expected:
        raise RuntimeError(f'Category snapshot mismatch after apply. expected={expected} actual={actual}')

    metric_rows = int(scalar(account, db_id, token, 'SELECT COUNT(*) AS n FROM category_metrics;', 'n'))
    ranking_rows = int(scalar(
        account,
        db_id,
        token,
        f'SELECT COUNT(*) AS n FROM vertical_rankings WHERE as_of_date={sql_literal(prepared["as_of_date"])};',
        'n',
    ))
    if metric_rows != len(expected) or ranking_rows != len(expected):
        raise RuntimeError(
            f'Metric/ranking row mismatch: category_metrics={metric_rows}, rankings={ranking_rows}, expected={len(expected)}'
        )
    return actual


def apply(prepared, confirm_free_only=False):
    if not confirm_free_only:
        raise SystemExit('Blocked: --confirm-free-only is required')

    processes = prepared.get('processes') or []
    if len(processes) != EXPECTED_PROCESSES:
        raise SystemExit(f'Expected exactly {EXPECTED_PROCESSES} prepared processes; got {len(processes)}')
    if len(processes) > MAX_FREE_PROCESSES:
        raise SystemExit('Prepared process count exceeds free-only guard')

    account = os.environ.get('CLOUDFLARE_ACCOUNT_ID', '').strip()
    token = os.environ.get('CLOUDFLARE_API_TOKEN', '').strip()
    if not account or not token:
        raise SystemExit('Cloudflare credentials are required')
    if not token.startswith('cfat_'):
        raise SystemExit('Expected Cloudflare Account API Token (cfat_ prefix)')

    db_id = resolve_database(account, token)
    total = int(scalar(account, db_id, token, 'SELECT COUNT(*) AS n FROM compra_agil_raw;', 'n'))
    if total != EXPECTED_PROCESSES:
        raise SystemExit(f'Blocked: existing D1 must contain exactly {EXPECTED_PROCESSES} processes; found {total}')

    prepared_map = {p['codigo']: (p.get('category') or 'OTROS') for p in processes}
    if len(prepared_map) != EXPECTED_PROCESSES:
        raise SystemExit('Blocked: prepared process codes are not unique')

    existing = fetch_existing_categories(account, db_id, token, list(prepared_map))
    if len(existing) != EXPECTED_PROCESSES:
        missing = sorted(set(prepared_map).difference(existing))[:10]
        raise SystemExit(f'Blocked: prepared cohort does not exactly match existing D1. matched={len(existing)} missing_sample={missing}')

    changes = [
        {'codigo': code, 'category': new_category, 'old_category': existing[code]}
        for code, new_category in prepared_map.items()
        if existing[code] != new_category
    ]
    transition_counts = Counter((item['old_category'], item['category']) for item in changes)
    print(f'Existing cohort verified: {total} processes')
    print(f'Changed categories: {len(changes)}')
    print('Top transitions:')
    for (old, new), count in transition_counts.most_common(20):
        print(f'  {old} -> {new}: {count}')

    if len(changes) > MAX_CHANGED_PROCESSES:
        raise SystemExit(
            f'Blocked before writes: {len(changes)} changed processes exceeds free-only diff guard {MAX_CHANGED_PROCESSES}'
        )

    estimated_rows_written = update_changed_categories(account, db_id, token, changes)
    if estimated_rows_written and estimated_rows_written > MAX_CHANGED_PROCESSES * 3:
        raise RuntimeError(
            f'Unexpected D1 rows_written meta after category updates: {estimated_rows_written}'
        )

    upsert_metrics(account, db_id, token, prepared)
    cleanup_stale_metrics(account, db_id, token, prepared)
    snapshot = verify_snapshot(account, db_id, token, prepared)

    outcome = {
        'processes_total': total,
        'changed_processes': len(changes),
        'categories': len(prepared['metrics']),
        'otros_processes': snapshot.get('OTROS', 0),
        'otros_share': round(snapshot.get('OTROS', 0) / total, 4),
        'estimated_rows_written_meta': estimated_rows_written,
        'as_of_date': prepared['as_of_date'],
    }
    print(json.dumps(outcome, ensure_ascii=False, indent=2))
    return outcome


def main():
    parser = argparse.ArgumentParser(description='Reclassify only the existing 15000-process Radar cohort in D1.')
    parser.add_argument('prepared')
    parser.add_argument('--confirm-free-only', action='store_true')
    args = parser.parse_args()
    prepared = json.loads(Path(args.prepared).read_text(encoding='utf-8'))
    apply(prepared, confirm_free_only=args.confirm_free_only)


if __name__ == '__main__':
    main()
