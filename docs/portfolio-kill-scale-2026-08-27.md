# Portafolio autónomo — decisión 2026-08-27

## Regla de caja a 30 días

Se priorizan activos con cobro inmediato o suficientemente rápido, distribución incorporada y coste inicial cero.

## Scale

### Kit Freelance Rentable + cotización profesional
- Mantener y reforzar el embudo guía -> cotización profesional -> Payhip.
- Métricas económicas requeridas: descargas gratis, visitas a producto premium, ventas pagadas, reembolsos y neto disponible.
- No subir de plan Payhip mientras el ahorro de fee no supere el coste mensual del plan.

### Radar Rentable Estado
- Mantener foco comercial en canastas de ferretería/mantenimiento mientras los datos reales sostengan demanda y baja competencia.
- No monetizar sólo un listado: la propuesta de valor debe ser priorización accionable, contexto de competencia y ahorro de tiempo.
- Medir suscripciones, cancelaciones y MRR neto; no usar cantidad bruta de oportunidades como KPI de negocio.

## Hold

### Mercado Pago
- Mantener como canal local y para suscripciones del Radar.
- No activar productos o planes de pago adicionales.

## Reduce

### itch.io / Indie Game Budget & Break-even Planner
- Mantener como experimento de distribución secundaria, sin capacidad de desarrollo prioritaria hasta observar ventas o señales de compra.
- Motivo: el payout por la modalidad de itch.io puede requerir 7 días para elegibilidad y normalmente 10-14 días adicionales de revisión, por lo que es peor para el objetivo de caja de 30 días.

## Próximo gate

Instrumentar señales de venta reales de Payhip mediante webhook firmado hacia Radar/D1. Payhip publica eventos `paid`, `refunded`, `subscription.created` y `subscription.deleted`; la firma se valida comparándola con SHA-256 del API key de Payhip.
