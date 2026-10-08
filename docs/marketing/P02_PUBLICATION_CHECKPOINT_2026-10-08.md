# Herramientas Rentables — P02 R1: demostración del cotizador

Actualizado el 2026-10-08. Estado: **FROZEN_ASSETS_LOCAL_QA_PASS_UNSCHEDULED**.

## Estado verificable

P02 tiene video vertical, portada, textos para Instagram y LinkedIn y transcripción. Está preparada en GitHub; **no está programada ni publicada en Metricool**. No hay ID, UUID ni URL pública social de P02.

P01 R2 conserva el ID 390841744 y UUID -7309929264440589713. La última lectura nativa sigue mostrando PENDING, publicación automática y 2026-10-08 10:00 America/Santiago. Su URL real todavía no está observada. La cola contiene únicamente P01.

## Fuentes y archivos congelados

Commit de los archivos P02: `e372ed596994058387e3bb3ea84067c40cdc762e`.

- Video: `docs/marketing/p02/deliverables/P02_demo_cotizador_R1.mp4`.
- SHA-256 del video: `a8f387da135ad71873579a942e4ece43b0733c853bd3fcc8a2d83731a502521e`.
- Fuente inmutable para Metricool: https://raw.githubusercontent.com/miguelcastill85-del/herramientas-rentables/e372ed596994058387e3bb3ea84067c40cdc762e/docs/marketing/p02/deliverables/P02_demo_cotizador_R1.mp4
- Portada: `docs/marketing/p02/deliverables/P02_portada.png`.
- Texto Instagram: `docs/marketing/p02/deliverables/P02_Texto_Instagram.txt`.
- Texto LinkedIn: `docs/marketing/p02/deliverables/P02_Texto_LinkedIn.txt`.
- Transcripción: `docs/marketing/p02/deliverables/P02_transcripcion.txt`.
- Manifest y comprobaciones: `docs/receipts/HR_P02_ASSETS_READY_2026-10-08.json` y `docs/marketing/p02/P02_QA_RESULT.json`.

El commit confirma la identidad de los blobs. La entrega HTTP al servidor de Metricool y la aceptación final de su contenido multimedia siguen pendientes; no declarar que el video ya está cargado en el planificador.

## Demostración real

Se completó el cotizador existente con un ejemplo de landing page: 48 h a CLP 10.000/h; complejidad baja ×1; contingencia 10%; costos externos CLP 30.000; margen objetivo 20%; anticipo 50%; dos revisiones; vigencia siete días; plazo diez días hábiles.

Se observaron y guardaron el formulario, el resultado y el resumen del sitio. El botón Copiar resumen devolvió “Resumen copiado.” y su portapapeles coincidió con el texto real. La aritmética independiente con Decimal confirma mínimo CLP 558.000, recomendado CLP 697.500, anticipo CLP 348.750 y saldo CLP 348.750. Son datos ilustrativos en CLP; el ejemplo no calcula impuestos ni acredita ingresos de clientes.

El video es un montaje de capturas reales con texto en pantalla, no una grabación continua de clics. Tiene silencio intencional, sin narración ni música. El texto comunica cada paso sin depender de audio.

## Validación

Siete escenas revisadas visualmente; escena de resultado inspeccionada también desde el MP4 codificado. Video H.264 progresivo, yuv420p, 1080 × 1920, 30 fps, 960 frames, 32 segundos de imagen; contenedor de 32,066667 segundos por el desfase de codificación. Pista AAC estéreo 48 kHz, objetivo de codificador 128 kbps; al ser silencio, bitrate real 2.272 bps. MP4 con moov antes de mdat y sin edit lists. Decodificación completa sin errores. 1.482.827 bytes.

Esto valida el archivo local; la publicación real y el procesamiento de Instagram todavía no han sido probados para P02. Usar el conector conectado, sin API pagada ni cambio de plan.

## Resultado del intento externo

Una única solicitud de creación de borrador P02, con draft=true y publicación automática desactivada, fue **rechazada por la revisión automática** antes de confirmar la URL real de P01. No hubo respuesta de creación, ID ni UUID. Una lectura posterior de la cola confirmó P01 sin cambios y ningún P02.

Receipt: `docs/receipts/HR_P02_METRICOOL_DEFERRED_2026-10-08.json`. No repetir ese intento ni usar otra vía para eludir el rechazo antes de cumplir el gate.

## Siguiente acción autorizada

1. Después del horario de P01, obtener evidencia positiva de publicación: URL IGPO06, texto IGPO03 coincidente y fecha de publicación real de la cuenta correcta.
2. Registrar primero la URL y fecha reales de P01. La desaparición de la cola, un estado Sent o cero filas no satisfacen este gate.
3. Una vez cumplido el gate, confirmar identidad @herramientas_rentables_chile, marca 7292000, America/Santiago.
4. Deduplicar P02 en cola y analítica de Reels usando el primer renglón exacto “Cuatro pasos antes de enviar tu próxima cotización.”, el archivo y los IDs existentes.
5. Programar una sola P02 para el día 3: fecha civil real de P01 + 2 días a las 10:00. Si P01 se publica efectivamente el 8 de octubre, el horario propuesto será el 10 de octubre a las 10:00. Todavía no es una programación.
6. Si ese horario ya pasó al confirmar P01, elegir el siguiente horario futuro de las 10:00, con al menos dos días de calendario desde P01, y registrar el retraso.
7. Guardar ID/UUID devueltos, verificar texto, video, fecha, zona y autoPublish mediante GET y actualizar HEAD. Para publicación efectiva de P02 usar URL IGRE06 y texto IGRE03; no inferirla por desaparecer de la cola.

La revisión existente “Crecimiento Herramientas Rentables”, ID 6a8b4712398481919c6d25cff889fc0b, quedó actualizada con esta continuidad y el gate. ID, título, horario, zona y estado activo se conservaron; no se creó otra tarea. Receipt: `docs/receipts/HR_GROWTH_REVIEW_CONTINUATION_2026-10-08.json`.

LinkedIn permanece preparado con destino sin identificar. El siguiente tema creativo después de P02 es P03, cambios de alcance, según la campaña. Mantener CLP 0, plan Free y los productos y sitio v17 cerrados.
