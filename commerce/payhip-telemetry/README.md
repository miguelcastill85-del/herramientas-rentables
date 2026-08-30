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

Diseñado para Cloudflare Workers + D1 en capa gratuita. No requiere Workers AI ni servicios pagos.

El repositorio conserva un `database_id` marcador en `wrangler.jsonc`; el workflow genera una configuración temporal durante el despliegue y nunca escribe credenciales ni IDs privados en el código fuente.

## Activación única por el titular

La automatización `.github/workflows/deploy-payhip-telemetry.yml` reduce la configuración manual a una sola preparación de cuenta:

1. Crear o habilitar la base D1 `payhip-telemetry` y conservar su ID.
2. Guardar en GitHub Actions los secretos `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, `PAYHIP_WEBHOOK_KEY` y `PAYHIP_METRICS_READ_TOKEN`.
3. Ejecutar manualmente `Deploy Payhip telemetry` introduciendo únicamente el ID de D1.
4. El workflow aplica `sql/001_schema.sql`, materializa una configuración efímera, carga los secretos del Worker y despliega el servicio.
5. En Payhip > Settings > Developer, registrar `https://<worker>/webhooks/payhip` y habilitar `paid`, `refunded`, `subscription.created` y `subscription.deleted`.

Los archivos efímeros de configuración y secretos se eliminan del runner incluso cuando el despliegue falla. Después de esta activación no se requiere atención rutinaria del titular.

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