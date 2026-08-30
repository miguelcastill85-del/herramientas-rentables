# Verificación post-deploy

La activación no se considera completa hasta comprobar:

1. `GET /health` responde HTTP 200 con `ok: true`.
2. `GET /metrics` sin bearer válido responde 401.
3. `GET /metrics` con `READ_TOKEN` válido responde 200.
4. Un webhook Payhip firmado válido responde 200 y se persiste una sola vez.
5. Repetir el mismo webhook devuelve 200 como duplicado sin crear una segunda fila.
6. Un webhook con firma inválida responde 401.

No generar ventas artificiales para validar. Si todavía no existe una transacción real, los puntos 4 y 5 quedan pendientes de la primera señal económica real y el estado se reporta como no observado, no como cero.