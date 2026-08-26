#!/usr/bin/env python3
import re

CONNECTORS = {
    'a', 'al', 'con', 'de', 'del', 'e', 'el', 'en', 'la', 'las', 'los',
    'para', 'por', 'un', 'una', 'y',
}


def norm_text(value):
    text = (value or '').strip().lower().translate(str.maketrans('áéíóúñü', 'aeiounu'))
    tokens = re.findall(r'[a-z0-9]+', text)
    return ' '.join(token for token in tokens if token not in CONNECTORS)


# Specific product/service families come before the generic SERVICIOS bucket so
# ties resolve toward a commercially actionable vertical.
CATEGORY_RULES = {
    'SALUD': [
        'insumo medico', 'insumos medicos', 'insumo clinico', 'insumos clinicos',
        'medicamento', 'medicamentos', 'farmaco', 'farmacos', 'farmacia',
        'insumo dental', 'insumos dentales', 'jeringa', 'canula', 'aguja',
        'cateter', 'sutura', 'ligasure', 'gasa', 'termometro', 'mascarilla',
        'guante nitrilo', 'dispositivo medico', 'dispositivos medicos',
    ],
    'LABORATORIO': [
        'laboratorio', 'reactivo', 'reactivos', 'material laboratorio',
        'materiales laboratorio', 'insumo laboratorio', 'insumos laboratorio',
        'tubo ensayo', 'pipeta', 'micropipeta', 'centrifuga', 'placa petri',
    ],
    'OFICINA': [
        'material oficina', 'materiales oficina', 'insumo oficina', 'insumos oficina',
        'articulo oficina', 'articulos oficina', 'papeleria', 'resma', 'papel carta',
        'papel oficio', 'carpeta', 'archivador', 'lapiz', 'lapices', 'cuaderno',
        'corchetera', 'sobres', 'etiquetas',
    ],
    'ALIMENTOS': [
        'alimento', 'alimentos', 'alimentacion', 'colacion', 'colaciones',
        'coffee break', 'coffe break', 'agua purificada', 'abarrotes', 'desayuno',
        'almuerzo', 'catering', 'canasta alimentos',
    ],
    'VEHICULOS': [
        'vehiculo', 'vehiculos', 'vehicular', 'neumatico', 'neumaticos',
        'repuesto vehiculo', 'repuestos vehiculo', 'repuestos automotrices',
        'lubricante', 'lubricantes', 'aceite motor', 'bateria automotriz',
        'mantencion vehicular', 'mantenimiento vehicular',
    ],
    'FERRETERIA': [
        'ferreteria', 'herramienta', 'herramientas', 'tornillo', 'tornillos',
        'perno', 'pernos', 'pintura', 'cemento', 'cable electrico',
        'material electrico', 'materiales electricos', 'material construccion',
        'materiales construccion', 'tuberia', 'madera', 'soldadura',
    ],
    'CLIMATIZACION': [
        'aire acondicionado', 'climatizacion', 'calefaccion', 'caldera',
        'ventilacion', 'equipo climatizacion',
    ],
    'TRANSPORTE': [
        'transporte', 'traslado', 'traslados', 'flete', 'fletes', 'minibus',
        'bus traslado', 'arriendo bus', 'arriendo vehiculo', 'pasajes',
    ],
    'VESTUARIO': [
        'vestuario', 'uniforme', 'uniformes', 'ropa corporativa', 'polera',
        'poleras', 'poleron', 'polerones', 'chaqueta', 'chaquetas',
    ],
    'EPP': [
        'epp', 'elementos proteccion personal', 'elemento proteccion personal',
        'casco seguridad', 'guante seguridad', 'chaleco reflectante',
        'zapato seguridad', 'calzado seguridad', 'proteccion personal',
    ],
    'DEPORTE': [
        'implemento deportivo', 'implementos deportivos', 'material deportivo',
        'materiales deportivos', 'balon deportivo', 'pelota deportiva',
        'equipamiento deportivo',
    ],
    'MOBILIARIO': [
        'silla', 'sillas', 'mesa', 'mesas', 'escritorio', 'escritorios',
        'mueble', 'muebles', 'estante', 'estantes', 'locker', 'lockers',
        'cortina roller', 'cortinas roller',
    ],
    'IMPRESION_GRAFICA': [
        'impresion', 'impresiones', 'gigantografia', 'gigantografias', 'pendon',
        'pendones', 'folleto', 'folletos', 'volante', 'volantes', 'letrero',
        'letreros', 'senaletica', 'grafica publicitaria',
    ],
    'TI': [
        'notebook', 'notebooks', 'computador', 'computadores', 'monitor', 'monitores',
        'ssd', 'servidor', 'servidores', 'software', 'licencia software', 'router',
        'switch', 'firewall', 'impresora', 'impresoras', 'toner', 'ups',
        'memoria ram', 'hosting', 'cloud', 'ciberseguridad', 'desarrollo web',
        'insumo computacional', 'insumos computacionales', 'equipamiento informatico',
        'red local', 'tablet', 'tablets',
    ],
    'ASEO': [
        'aseo', 'limpieza', 'detergente', 'detergentes', 'desinfectante',
        'desinfectantes', 'cloro', 'papel higienico', 'bolsa basura',
        'bolsas basura', 'insumo aseo', 'insumos aseo', 'articulo aseo',
        'articulos aseo', 'jabon', 'escoba', 'mopa', 'toalla papel',
    ],
    'SEGURIDAD': [
        'camara seguridad', 'camaras seguridad', 'cctv', 'alarma', 'alarmas',
        'control acceso', 'seguridad publica', 'radio comunicacion',
    ],
    'SERVICIOS': [
        'consultoria', 'consultorias', 'capacitacion', 'capacitaciones',
        'mantencion', 'mantenimiento', 'reparacion', 'reparaciones', 'asesoria',
        'asesorias', 'instalacion', 'instalaciones', 'arriendo',
    ],
}


def classify(text):
    normalized = norm_text(text)
    padded = f' {normalized} '
    best_category = 'OTROS'
    best_score = 0
    for category, keywords in CATEGORY_RULES.items():
        score = 0
        for keyword in keywords:
            phrase = norm_text(keyword)
            if phrase and f' {phrase} ' in padded:
                score += max(1, len(phrase.split()))
        if score > best_score:
            best_category = category
            best_score = score
    return best_category
