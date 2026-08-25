# Radar Rentable Estado — Fase 0

Objetivo: convertir Compra Ágil en datos propios depurados y elegir el primer vertical por evidencia.

## Estado

Núcleo inicial implementado y listo para validación con datos reales. El entorno actual no pudo descargar el ZIP mensual oficial por bloqueo de red, por lo que la prueba masiva queda como siguiente gate operativo, no como supuesto resuelto.

## Lo que ya hace
1. Esquema D1 para procesos, ítems, cotizaciones, métricas de comprador/categoría e ingestas.
2. ETL histórico: lee CSV o ZIP de datos públicos, tolera nombres de columnas distintos, normaliza dinero y clasifica categorías.
3. Limpieza inicial de precios mediante MAD logarítmico para detectar valores extremos sin asumir distribución normal.
4. Opportunity Market Score transparente para comparar verticales.
5. Núcleo de decisión GO / REVIEW / NO_GO, rango de precio y Margin Guard.
6. Ninguna dependencia de IA pagada.

## Fuentes oficiales previstas
- Histórico mensual oficial de Cotizaciones Compra Ágil: `https://transparenciachc.blob.core.windows.net/trnspchc/COT_{año}-{mes}.zip`.
- API Beta de Compra Ágil para sincronización incremental cuando exista ticket.
- Órdenes de Compra / Datos Abiertos para reforzar adjudicación, comprador y validación económica.

## Principios
- Nunca afirmar que un score es “probabilidad de ganar” hasta calibrarlo contra resultados históricos.
- Montos públicos se depuran; no se agregan ciegamente.
- Primero dataset y vertical; después interfaz/comercialización.
- La búsqueda de oportunidades es gratuita; se cobra por decisión económica.

## Prueba local

```bash
python radar/phase0/etl/normalize.py radar/phase0/tests/sample_compra_agil.csv --out /tmp/result.json
```

## Gate Fase 0
No seleccionar vertical hasta disponer de una muestra real suficiente. Objetivo operativo: 10.000+ procesos normalizados y al menos 30 días recientes; idealmente combinar con histórico adicional para estacionalidad.

## Próximo paso que requiere titular
Solicitar/entregar el ticket oficial de API de Mercado Público mediante Clave Única. El sistema está diseñado para guardar el ticket como secreto y no versionarlo en GitHub.
