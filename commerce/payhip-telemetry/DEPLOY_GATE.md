# Gate de activación Payhip telemetry

Estado esperado antes de ejecutar el workflow:

- D1 `payhip-telemetry` creada en Cloudflare Free.
- GitHub Actions secrets presentes: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, `PAYHIP_WEBHOOK_KEY`, `PAYHIP_METRICS_READ_TOKEN`.
- ID de D1 disponible para introducirlo como input manual.

El workflow debe finalizar con:

- migración D1 aplicada;
- Worker desplegado;
- secretos cargados sin persistirse en el repositorio;
- archivos efímeros eliminados.

Después del deploy, el único paso externo restante es registrar en Payhip el endpoint `/webhooks/payhip` con los cuatro eventos soportados y validar `/health` y `/metrics`.

No activar planes pagos ni añadir servicios con costo fijo.