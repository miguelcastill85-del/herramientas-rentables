# Verificación post-deploy

La activación no se considera completa hasta comprobar:

1. `GET /health` responde HTTP 200 con `ok: true`.
2. `GET /metrics` sin bearer válido responde 401.
3. `GET /metrics` con `READ_TOKEN` válido responde 200.
4. Un webhook Payhip firmado válido responde 200 y se persiste una sola vez.
5. Repetir el mismo webhook devuelve 200 como duplicado sin crear una segunda fila.
6. Un webhook con firma inválida responde 401.

No generar ventas artificiales para validar. Si todavía no existe una transacción real, los puntos 4 y 5 quedan pendientes de la primera señal económica real y el estado se reporta como no observado, no como cero.

## Cierre actualizado 2026-10-05

1. El workflow debe aprobar `test:critical` antes de migrar y desplegar.
2. `/health` devuelve 200 sólo con base, secretos y esquema íntegros. Esto confirma preparación, no entrega real.
3. La consulta privada debe conservar `UNOBSERVED` cuando aún no existen eventos.
4. Ante una venta real, cotejar ID, moneda, importes y comisiones con el recibo. Una descarga gratuita no cierra este gate ni cuenta como pedido pagado.
5. Repetir exactamente el mismo evento en un entorno sintético separado y confirmar que el conteo no aumenta. No inyectar eventos sintéticos en producción.
6. No activar SCALE con neto `null`, cobertura `PARTIAL` ni saldo disponible sin observar.
7. Si una base antigua ya contiene duplicados, la migración única puede fallar: conservar la base y reconciliar los registros con evidencia, sin borrar ventas automáticamente.
