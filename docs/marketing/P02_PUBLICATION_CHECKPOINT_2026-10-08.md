# Herramientas Rentables — P02 R1: demostración del cotizador

Actualizado el 2026-10-09. Estado: **SCHEDULED_AUTOPUBLISH_PENDING_PUBLICATION**.

## Estado verificable

P02 tiene video vertical, portada, textos para Instagram y LinkedIn y transcripción. Está **programada en Metricool para 2026-10-10 a las 10:00 America/Santiago**, con publicación automática. ID: **392475835**. UUID: **-112021319106933967**. Una lectura nativa posterior confirmó una única P02, texto exacto, un video, tipo REEL, draft=false y autoPublish=true tanto general como Instagram. Estado PENDING; todavía no publicada y sin URL social real.

Planificador: https://app.metricool.com/planner/calendar?blogId=7292000&openWithPostUuid=-112021319106933967

Receipt vigente: `docs/receipts/HR_P02_P03_METRICOOL_SCHEDULE_2026-10-09.json`. Este estado reemplaza los bloqueos históricos descritos más abajo.

P01 R2 está PUBLICADA según la respuesta nativa positiva de Metricool, ID 390841744, UUID -7309929264440589713, provider PUBLISHED y URL real https://www.instagram.com/p/DeO_-4OCNl4/. Texto, cinco imágenes y cinco ALT coinciden con el receipt original. Evidencia: docs/receipts/HR_P01_PUBLICATION_VERIFIED_2026-10-08.json. Fecha civil 2026-10-08 inferida del intervalo observado dentro del mismo día de Santiago; hora exacta no observada. Analítica sin filas: resultados no observados, no cero. El gate de URL real está satisfecho y fue guardado antes de los intentos actuales.

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

El commit confirma la identidad de los blobs. Metricool devolvió una URL de caché de video y la misma URL apareció en la lectura posterior de la programación. No se recalculó el SHA-256 del archivo de caché de Metricool; se conserva el SHA-256 comprobado del video fuente.

## Demostración real

Se completó el cotizador existente con un ejemplo de landing page: 48 h a CLP 10.000/h; complejidad baja ×1; contingencia 10%; costos externos CLP 30.000; margen objetivo 20%; anticipo 50%; dos revisiones; vigencia siete días; plazo diez días hábiles.

Se observaron y guardaron el formulario, el resultado y el resumen del sitio. El botón Copiar resumen devolvió “Resumen copiado.” y su portapapeles coincidió con el texto real. La aritmética independiente con Decimal confirma mínimo CLP 558.000, recomendado CLP 697.500, anticipo CLP 348.750 y saldo CLP 348.750. Son datos ilustrativos en CLP; el ejemplo no calcula impuestos ni acredita ingresos de clientes.

El video es un montaje de capturas reales con texto en pantalla, no una grabación continua de clics. Tiene silencio intencional, sin narración ni música. El texto comunica cada paso sin depender de audio.

## Validación

Siete escenas revisadas visualmente; escena de resultado inspeccionada también desde el MP4 codificado. Video H.264 progresivo, yuv420p, 1080 × 1920, 30 fps, 960 frames, 32 segundos de imagen; contenedor de 32,066667 segundos por el desfase de codificación. Pista AAC estéreo 48 kHz, objetivo de codificador 128 kbps; al ser silencio, bitrate real 2.272 bps. MP4 con moov antes de mdat y sin edit lists. Decodificación completa sin errores. 1.482.827 bytes.

Esto valida el archivo local; la publicación real y el procesamiento de Instagram todavía no han sido probados para P02. Usar el conector conectado, sin API pagada ni cambio de plan.

## Historial — intento antes de verificar la URL P01

Una única solicitud de creación de borrador P02, con draft=true y publicación automática desactivada, fue **rechazada por la revisión automática** antes de confirmar la URL real de P01. No hubo respuesta de creación, ID ni UUID. Una lectura posterior de la cola confirmó P01 sin cambios y ningún P02.

Receipt: `docs/receipts/HR_P02_METRICOOL_DEFERRED_2026-10-08.json`. No repetir ese intento ni usar otra vía para eludir el rechazo antes de cumplir el gate.

## Historial técnico — 2026-10-08 (superado por la programación vigente)

Después de guardar la URL real P01 en main, se intentó programar P02 para el 10 de octubre a las 10:00 America/Santiago. La URL pública en mediaFiles falló porque ese helper intenta leer un archivo local. Se quitó ese helper y se conservó la URL dentro de info.media. El contrato mínimo devolvió INVALID_ARGUMENT. Una única corrección material, con los valores del constructor primario inspeccionado, volvió a devolver INVALID_ARGUMENT. Son errores técnicos del conector; el rechazo histórico de revisión automática permanece documentado por separado.

Conciliación posterior 2026-10-08T23:26:44.205Z: la ventana 8–22 de octubre contiene sólo P01 PUBLISHED con su ID/UUID originales y URL real; ningún P02 ni P03. P02 no tiene ID/UUID, borrador, programación o publicación confirmados. La aceptación del video remoto por Metricool sigue sin verificarse. Se cierran los intentos: no repetir solicitudes idénticas, adivinar campos ni esperar en un bucle. Receipt: docs/receipts/HR_P02_P03_NATIVE_SCHEDULING_BLOCK_2026-10-08.json.

1. Reanudar sólo con nueva evidencia concreta que corrija el contrato nativo.
2. Confirmar identidad de Instagram y deduplicar en cola y Reels por texto exacto “Cuatro pasos antes de enviar tu próxima cotización.” y el medio congelado.
3. Crear una sola P02 automática. Día 3 propuesto: 2026-10-10 10:00 Santiago, todavía sin programación. Si pasó, usar las siguientes 10:00 futuras y documentar el retraso.
4. Guardar ID/UUID y validar mediante GET texto, video, fecha, zona, draft=false y autoPublish=true general e Instagram. Un error o resultado incierto exige conciliación antes de otra escritura.
5. Para publicación efectiva, conservar URL pública nativa coincidente o IGRE06 con texto IGRE03; desaparecer de la cola no prueba publicación.
6. Tras conciliar P02, programar P03 con los archivos existentes. Propuesta día 5: 2026-10-12 10:00 Santiago; si hay retraso, conservar dos días civiles entre P02 y P03 y registrar el calendario.

La revisión existente “Crecimiento Herramientas Rentables”, ID 6a8b4712398481919c6d25cff889fc0b, se actualizó y se leyó nuevamente. Se preservaron ID, título, horario, zona, estado activo y timing_mode; no se creó otra. Receipt vigente: docs/receipts/HR_GROWTH_REVIEW_P01_P03_CONTINUATION_2026-10-08.json. El prompt reconoce la URL real P01, los activos P03 y el límite de reintentos.

LinkedIn sigue preparado con destino sin identificar. P03 está terminada, auditada y guardada en 19d251a31f12213de3c16712a54bb694fc00812f. Próximo creativo independiente: P04/V02, después de verificar el archivo español real. Mantener CLP 0, plan Free, productos cerrados y sitio v17.

## Historial de acceso web — 2026-10-09T04:44:36.792Z

El usuario autorizó la vía web para programar P02/P03. La selección segura de Google avanzó sólo al método de acceso; el paso posterior de credenciales se interrumpió y no entregó un resultado de autenticación. Una verificación nueva de Metricool mostró su página de inicio de sesión. No se abrió el compositor, no se subieron archivos ni se solicitó programación desde la web.

La cola nativa comprobada en 2026-10-09T04:41:28.369Z contiene únicamente P01 390841744, UUID -7309929264440589713, PUBLISHED, URL real https://www.instagram.com/p/DeO_-4OCNl4/. P02/P03 siguen sin ID/UUID ni programación confirmados; las fechas 10/12 de octubre a las 10:00 Santiago permanecen propuestas. El bloqueo nativo INVALID_ARGUMENT previo no se ha resuelto.

Se cierra esta comprobación sin nuevas peticiones de acceso ni bucle de espera. Reanudar con una sesión Metricool positivamente autenticada o una corrección concreta y nueva del contrato nativo; confirmar identidad, deduplicar y verificar mediante GET cada creación. La autorización de usar el navegador permanece vigente, pero no demuestra una sesión abierta. La revisión diaria existente recibió este estado, conservando ID, título, horario, zona, timing_mode y estado activo; no se creó otra.

Receipt de acceso: docs/receipts/HR_METRICOOL_BROWSER_ACCESS_BLOCK_2026-10-09.json. Receipt de revisión: docs/receipts/HR_GROWTH_REVIEW_BROWSER_CONTINUATION_2026-10-09.json. Conservar archivos congelados, P01 publicada, productos, precios y sitio v17. Gasto CLP 0, plan Free. No se registraron credenciales, cookies, tokens ni URLs de OAuth.
