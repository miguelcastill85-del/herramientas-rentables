# Payhip telemetry (standalone)

Instrumentación económica independiente del sitio principal y de cualquier línea de negocio cerrada.

## Qué mide

- `paid`: ventas brutas, fee Payhip y fee del procesador cuando Payhip lo incluye en el payload.
- `refunded`: reembolsos parciales o totales.
- `subscription.created` y `subscription.deleted`: altas y bajas observadas.
- `/metrics`: agregado por moneda, protegido por bearer token.

No persiste email, nombre, IP, `customer_id` ni otros datos personales del comprador.

## Seguridad y semántica

Payhip envía la firma en la propiedad JSON `signature`. Se valida comparándola con SHA-256 de la clave de desarrollador configurada como secreto `WEBHOOK_KEY`.

Payhip documenta los importes en unidades menores (centavos/pennies); se almacenan como enteros sin conversión prematura.

Los webhooks válidos siempre responden HTTP 200, incluso si son duplicados, para evitar reintentos innecesarios. Los eventos se deduplican mediante `event_key`.

## Infraestructura

Diseñado para Cloudflare Workers + D1 en el plan Free. No requiere Workers AI ni servicios pagos.

El repositorio deja un `database_id` marcador. No debe desplegarse hasta crear la base D1 gratuita y sustituirlo por el ID real.

## Configuración que requiere al titular una sola vez

1. Crear la base D1 `payhip-telemetry` en la cuenta Cloudflare y copiar su ID a `wrangler.jsonc`.
2. Aplicar `sql/001_schema.sql` a esa base.
3. Guardar dos secretos del Worker: `WEBHOOK_KEY` con la clave de desarrollador de Payhip y `READ_TOKEN` con un valor aleatorio.
4. Desplegar el Worker en el plan Free.
5. En Payhip > Settings > Developer, registrar `https://<worker>/webhooks/payhip` y habilitar `paid`, `refunded`, `subscription.created` y `subscription.deleted`.

Después de esa configuración no se requiere atención rutinaria del titular.

## Lectura de métricas

`GET /metrics` con `Authorization: Bearer <READ_TOKEN>` devuelve por moneda:

- `gross_minor`
- `payhip_fee_minor`
- `processor_fee_minor`
- `refund_minor`
- `estimated_net_minor`
- ventas y reembolsos observados
- altas y bajas de suscripción observadas

`estimated_net_minor` es una estimación basada sólo en fees que Payhip reporta en el webhook. No sustituye el saldo efectivamente disponible del procesador de pagos; ese dato debe integrarse separadamente si el procesador expone una API accesible.