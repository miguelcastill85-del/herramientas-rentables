# Estado operativo

- Código de telemetría: MERGED en `main` vía PR #34.
- Automatización de despliegue: MERGED en `main` vía PR #37.
- Producción: PENDIENTE de la configuración reservada al titular (D1 + credenciales/permisos + webhook Payhip).
- Señales económicas privadas: NO OBSERVADAS hasta completar activación.
- Coste fijo autorizado: USD 0.
- Atención rutinaria del titular: no requerida tras la activación.

## Revisión 2026-10-05

Código reforzado con pruebas de autenticación, importes, reintentos, devoluciones parciales, pedidos gratuitos y cobertura económica. Migraciones versionadas e idempotentes mediante Wrangler D1 migrations. Activación externa y evento real siguen pendientes; no se marca producción PASS.
