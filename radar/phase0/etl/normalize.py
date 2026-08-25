#!/usr/bin/env python3
import argparse
import csv
import hashlib
import io
import json
import math
import re
import statistics
import zipfile
from collections import Counter, defaultdict
from pathlib import Path

ALIASES = {
    'process_code': ['codigo', 'codigo_cotizacion', 'codigo proceso', 'codigo_proceso', 'id_cotizacion', 'id proceso', 'id_proceso'],
    'published_at': ['fecha_publicacion', 'fecha publicación', 'fecha de publicacion', 'fecha solicitud', 'fecha_solicitud'],
    'closes_at': ['fecha_cierre', 'fecha cierre', 'fecha de cierre'],
    'buyer_id': ['rut_comprador', 'rut comprador', 'codigo_organismo', 'id_comprador'],
    'buyer_name': ['organismo', 'organismo comprador', 'nombre_organismo', 'nombre comprador', 'comprador'],
    'buyer_region': ['region', 'región', 'region comprador', 'region_comprador'],
    'title': ['nombre', 'titulo', 'título', 'nombre_cotizacion', 'nombre cotizacion', 'requerimiento'],
    'description': ['descripcion', 'descripción', 'detalle', 'especificacion', 'especificación'],
    'budget_clp': ['presupuesto', 'monto_estimado', 'monto estimado', 'presupuesto_disponible'],
    'supplier_id': ['rut_proveedor', 'rut proveedor', 'id_proveedor'],
    'supplier_name': ['proveedor', 'nombre_proveedor', 'nombre proveedor'],
    'quoted_at': ['fecha_cotizacion', 'fecha cotizacion', 'fecha oferta', 'fecha_oferta'],
    'unit_price_clp': ['precio_unitario', 'precio unitario', 'valor_unitario', 'valor unitario'],
    'total_price_clp': ['monto_cotizado', 'monto cotizado', 'precio_total', 'precio total', 'monto oferta', 'monto_oferta'],
    'selected': ['seleccionado', 'adjudicado', 'ganador', 'es_seleccionado'],
    'item_key': ['codigo_item', 'codigo item', 'id_item', 'item'],
    'product_code': ['codigo_producto', 'codigo producto', 'producto_codigo'],
    'item_description': ['descripcion_item', 'descripcion item', 'producto', 'nombre_producto', 'nombre producto'],
    'quantity': ['cantidad', 'cantidad_solicitada', 'cantidad solicitada'],
    'unit': ['unidad', 'unidad_medida', 'unidad medida'],
}

CATEGORY_RULES = {
    'TI': ['notebook', 'computador', 'monitor', 'ssd', 'servidor', 'software', 'licencia', 'router', 'switch', 'firewall', 'impresora', 'toner', 'ups', 'memoria ram', 'hosting', 'cloud', 'ciberseguridad', 'desarrollo web'],
    'ASEO': ['detergente', 'desinfectante', 'cloro', 'papel higienico', 'bolsa basura', 'limpieza', 'aseo'],
    'FERRETERIA': ['tornillo', 'perno', 'herramienta', 'ferreteria', 'pintura', 'cemento', 'cable electrico'],
    'EPP': ['casco seguridad', 'guante seguridad', 'chaleco reflectante', 'zapato seguridad', 'proteccion personal', 'epp'],
    'MOBILIARIO': ['silla', 'mesa', 'escritorio', 'mueble', 'estante', 'locker'],
    'SALUD': ['insumo medico', 'jeringa', 'guante nitrilo', 'mascarilla', 'gasa', 'termometro'],
    'SERVICIOS': ['consultoria', 'capacitacion', 'mantencion', 'reparacion', 'asesoria'],
}


def norm_key(value):
    text = (value or '').strip().lower().translate(str.maketrans('áéíóúñü', 'aeiounu'))
    return re.sub(r'[^a-z0-9]+', ' ', text).strip()


ALIAS_NORM = {key: [norm_key(v) for v in values] for key, values in ALIASES.items()}


def pick(row, key):
    normalized = {norm_key(k): v for k, v in row.items()}
    for alias in ALIAS_NORM[key]:
        value = normalized.get(alias)
        if value is not None and str(value).strip() != '':
            return value
    return None


def money(value):
    if value is None:
        return None
    text = str(value).strip().replace('$', '').replace('CLP', '').replace(' ', '')
    if not text:
        return None
    if text.count(',') == 1 and text.count('.') >= 1:
        text = text.replace('.', '').replace(',', '.') if text.rfind(',') > text.rfind('.') else text.replace(',', '')
    elif text.count(',') == 1 and text.count('.') == 0:
        tail = text.split(',')[-1]
        text = text.replace(',', '.') if len(tail) <= 2 else text.replace(',', '')
    elif text.count('.') > 1:
        text = text.replace('.', '')
    try:
        parsed = float(text)
        return parsed if math.isfinite(parsed) else None
    except ValueError:
        return None


def yes(value):
    return 1 if norm_key(str(value)) in {'1', 'si', 'true', 'adjudicado', 'seleccionado', 'ganador'} else 0


def classify(text):
    normalized = norm_key(text)
    scores = {category: sum(norm_key(keyword) in normalized for keyword in keywords) for category, keywords in CATEGORY_RULES.items()}
    category, score = max(scores.items(), key=lambda pair: pair[1])
    return category if score else 'OTROS'


def clean_price(values):
    values = [v for v in values if v is not None and v > 0]
    if len(values) < 4:
        return values, 0
    logs = [math.log(v) for v in values]
    median = statistics.median(logs)
    mad = statistics.median(abs(v - median) for v in logs) or 1e-9
    kept = []
    rejected = 0
    for original, logged in zip(values, logs):
        z = 0.6745 * (logged - median) / mad
        if abs(z) > 5:
            rejected += 1
        else:
            kept.append(original)
    return kept, rejected


def read_csv_bytes(data):
    text = None
    for encoding in ('utf-8-sig', 'latin-1', 'cp1252'):
        try:
            text = data.decode(encoding)
            break
        except UnicodeDecodeError:
            pass
    if text is None:
        raise ValueError('encoding no soportado')
    sample = text[:10000]
    try:
        dialect = csv.Sniffer().sniff(sample, delimiters=';,\t|')
    except csv.Error:
        dialect = csv.excel
        dialect.delimiter = ';'
    return list(csv.DictReader(io.StringIO(text), dialect=dialect))


def load_path(path):
    path = Path(path)
    if path.suffix.lower() == '.zip':
        rows = []
        with zipfile.ZipFile(path) as archive:
            for name in archive.namelist():
                if name.lower().endswith('.csv'):
                    rows.extend(read_csv_bytes(archive.read(name)))
        return rows
    return read_csv_bytes(path.read_bytes())


def normalize(rows):
    processes, items, quotes, rejected = {}, [], [], []
    for index, row in enumerate(rows, 1):
        code = pick(row, 'process_code')
        if not code:
            rejected.append({'row': index, 'reason': 'sin_codigo_proceso'})
            continue
        title = pick(row, 'title') or ''
        description = pick(row, 'description') or ''
        item_description = pick(row, 'item_description') or ''
        combined = ' '.join([title, description, item_description])
        category = classify(combined)
        raw = json.dumps(row, ensure_ascii=False, sort_keys=True)
        processes.setdefault(code, {
            'process_code': code,
            'published_at': pick(row, 'published_at'),
            'closes_at': pick(row, 'closes_at'),
            'buyer_id': pick(row, 'buyer_id'),
            'buyer_name': pick(row, 'buyer_name'),
            'buyer_region': pick(row, 'buyer_region'),
            'title': title,
            'description': description,
            'budget_clp': money(pick(row, 'budget_clp')),
            'source': 'chilecompra_compra_agil',
            'raw_hash': hashlib.sha256(raw.encode()).hexdigest(),
        })
        if item_description or pick(row, 'product_code'):
            items.append({
                'process_code': code,
                'item_key': pick(row, 'item_key'),
                'product_code': pick(row, 'product_code'),
                'description': item_description,
                'quantity': money(pick(row, 'quantity')),
                'unit': pick(row, 'unit'),
                'category': category,
                'normalized_text': norm_key(combined),
            })
        if pick(row, 'supplier_id') or pick(row, 'supplier_name') or pick(row, 'total_price_clp'):
            quotes.append({
                'process_code': code,
                'supplier_id': pick(row, 'supplier_id'),
                'supplier_name': pick(row, 'supplier_name'),
                'quoted_at': pick(row, 'quoted_at'),
                'item_key': pick(row, 'item_key'),
                'unit_price_clp': money(pick(row, 'unit_price_clp')),
                'total_price_clp': money(pick(row, 'total_price_clp')),
                'selected': yes(pick(row, 'selected')),
                'source': 'chilecompra_compra_agil',
            })
    return list(processes.values()), items, quotes, rejected


def market_metrics(processes, items, quotes):
    categories = defaultdict(lambda: {'processes': set(), 'budgets': [], 'buyers': [], 'quotes': defaultdict(int), 'prices': []})
    process_categories = defaultdict(Counter)
    for item in items:
        process_categories[item['process_code']][item['category']] += 1
    for process in processes:
        code = process['process_code']
        category = process_categories[code].most_common(1)[0][0] if process_categories[code] else classify(process['title'] + ' ' + process['description'])
        data = categories[category]
        data['processes'].add(code)
        data['buyers'].append(process['buyer_id'] or process['buyer_name'])
        if process['budget_clp'] and process['budget_clp'] > 0:
            data['budgets'].append(process['budget_clp'])
    for quote in quotes:
        category = process_categories[quote['process_code']].most_common(1)[0][0] if process_categories[quote['process_code']] else 'OTROS'
        data = categories[category]
        data['quotes'][quote['process_code']] += 1
        if quote['total_price_clp'] and quote['total_price_clp'] > 0:
            data['prices'].append(quote['total_price_clp'])

    output = []
    for category, data in categories.items():
        process_count = len(data['processes'])
        competitors = list(data['quotes'].values())
        budgets, _ = clean_price(data['budgets'])
        prices, rejected_prices = clean_price(data['prices'])
        low_competition = sum(v <= 3 for v in competitors) / len(competitors) if competitors else 0
        buyer_counts = Counter(v for v in data['buyers'] if v)
        repeated = sum(v for v in buyer_counts.values() if v >= 2) / max(1, sum(buyer_counts.values()))
        observability = min(1, len(prices) / max(1, process_count))
        demand = min(1, math.log1p(process_count) / math.log(101))
        ticket = min(1, math.log1p(statistics.median(budgets)) / math.log(5_000_001)) if budgets else 0
        score = 100 * (0.30 * demand + 0.20 * low_competition + 0.15 * repeated + 0.15 * ticket + 0.20 * observability)
        evidence_count = max(len(prices), len(budgets))
        confidence = min(1, process_count / 100) * (min(1, evidence_count / 50) if evidence_count else 0.15)
        output.append({
            'category': category,
            'process_count': process_count,
            'median_budget_clp': statistics.median(budgets) if budgets else None,
            'median_competitors': statistics.median(competitors) if competitors else 0,
            'low_competition_share': round(low_competition, 4),
            'repeated_buyer_share': round(repeated, 4),
            'price_observability': round(observability, 4),
            'outlier_share': round(rejected_prices / max(1, len(data['prices'])), 4),
            'opportunity_market_score': round(score, 1),
            'score_confidence': round(confidence, 2),
        })
    return sorted(output, key=lambda row: row['opportunity_market_score'], reverse=True)


def main():
    parser = argparse.ArgumentParser(description='Normaliza datos históricos de Compra Ágil y rankea verticales.')
    parser.add_argument('input')
    parser.add_argument('--out', default='output.json')
    args = parser.parse_args()
    rows = load_path(args.input)
    processes, items, quotes, rejected = normalize(rows)
    metrics = market_metrics(processes, items, quotes)
    result = {
        'summary': {
            'rows': len(rows),
            'processes': len(processes),
            'items': len(items),
            'quotes': len(quotes),
            'rejected': len(rejected),
        },
        'category_metrics': metrics,
    }
    Path(args.out).write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({**result['summary'], 'top_categories': metrics[:5]}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
