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

Sólo los eventos válidos que ya quedaron persistidos responden HTTP 200, incluidos los reintentos de un registro existente. Un fallo de base de datos devuelve HTTP 503 y no expone detalles internos. Payhip documenta reintentos horarios durante hasta tres horas si no recibe HTTP 200.

El token privado de lectura distingue mayúsculas de minúsculas. La comparación de firma admite únicamente un digest hexadecimal válido, conforme al esquema SHA-256 publicado por Payhip; ese esquema no es un HMAC del contenido del evento.

Ventas: identidad por transacción, sin incluir la fecha. Suscripciones: identidad por suscripción y tipo de evento. Reembolsos: identidad por transacción, fecha de reembolso e importe. Dos reembolsos del mismo importe en fechas distintas se conservan. La documentación no establece si varios importes de reembolso son acumulativos o incrementales, ni distingue dos reembolsos iguales en la misma fecha; por eso varias notificaciones de reembolso de una transacción suspenden el neto automático hasta reconciliarlas con el procesador.

Los importes vacíos, negativos, decimales, no finitos o con tipos no numéricos se rechazan. Un pedido gratuito se registra como `free_orders` y no cuenta en `sales` ni dispara el gate de ventas pagadas.

## Infraestructura

Diseñado para Cloudflare Workers + D1 en capa gratuita. No requiere Workers AI ni servicios pagos.

El repositorio conserva un `database_id` marcador en `wrangler.jsonc`; el workflow genera una configuración temporal durante el despliegue y nunca escribe credenciales ni IDs privados en el código fuente.

## Activación única por el titular

La automatización `.github/workflows/deploy-payhip-telemetry.yml` reduce la configuración manual a una sola preparación de cuenta:

1. Crear o habilitar la base D1 `payhip-telemetry` y conservar su ID.
2. Guardar en GitHub Actions los secretos `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, `PAYHIP_WEBHOOK_KEY` y `PAYHIP_METRICS_READ_TOKEN`.
3. Ejecutar manualmente `Deploy Payhip telemetry` introduciendo únicamente el ID de D1.
4. El workflow aplica las migraciones versionadas de `sql/` una única vez por base, materializa una configuración efímera, carga los secretos del Worker y despliega el servicio.
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

## Cobertura y estados de medición

- `GET /health` sólo pasa con base, secretos y esquema actual disponibles; no confirma por sí solo que Payhip entregue eventos reales.
- Sin registros: `observation_state = UNOBSERVED` y lista de monedas vacía, sin inventar ventas cero.
- Falta una comisión, falta la venta asociada a un reembolso o hay varias notificaciones de reembolso para la misma transacción: `estimated_net_minor = null` y `coverage_state = PARTIAL`.
- `available_cash_state` siempre permanece `UNOBSERVED`: esta integración no consulta el dinero disponible en la cuenta bancaria ni en la pasarela.
- Las monedas se conservan por separado. No se infiere una conversión CLP desde una venta sintética; el primer evento real debe reconciliarse con su recibo.

Verificación local: `pnpm test:critical`. Sólo usa eventos sintéticos y SQLite en memoria; no crea ventas reales ni conecta cuentas.

Referencia técnica oficial, revisada el 2026-10-05: https://help.payhip.com/article/115-webhooks
