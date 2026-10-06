# DP-FREELANCE-001 — auditoría independiente y corrección v2.2

Fecha: 2026-10-06. Estado de esta copia: AUDITORÍA Y PAQUETE FINAL PASS; PUBLICACIÓN EN PAYHIP VERIFICADA; DESCARGA PENDIENTE POR CAPTCHA.

La identidad por SHA-256 de v2.1 era correcta. Su auditoría anterior no probaba el comportamiento del archivo entregable al recalcular: valores guardados mostraban PASS/GO aunque el modelo tenía una dependencia circular y entradas perdidas por celdas combinadas. La publicación de v2.1 se detuvo antes de guardar el producto en Payhip.

La instrucción del propietario de auditar y mejorar antes de publicar autoriza esta revisión. v2.2 conserva el producto, sus 19 módulos, diseño, flujo comercial y licencia; corrige el archivo existente. La copia original v2.1 permanece intacta como evidencia histórica.

## Hallazgos y reparaciones

| Hallazgo verificado en v2.1 | Consecuencia | Reparación v2.2 |
| --- | --- | --- |
| 18 fórmulas ausentes en PROJECTS L5:Q7 | Las primeras tres filas no calculaban como las demás | Fórmulas completas y consistentes en las 100 filas |
| SYSTEM CHECK B14 → DECISION CENTER B16 → SYSTEM CHECK B19 | Cálculo circular oculto por resultados guardados | Comprobación independiente de entradas de negociación; cálculo iterativo desactivado |
| Combinaciones decorativas eliminaban SETUP B18:B22 y EXAMPLE B27 | Supuestos inexistentes y resultados distintos al refrescar | Valores, rótulos y celdas restaurados; detección de supuestos inválidos |
| Validaciones antiguas en celdas equivocadas, sin error de detención | Horas recibían listas ajenas; importes negativos y depósitos superiores a 100% se aceptaban | Validaciones en las entradas actuales y controles por fórmula que también detectan valores pegados |
| Falta de controles independientes en escenarios, ofertas, tarifa, alcance y negociación | Una entrada inválida podía parecer lista para el cliente o mostrar errores técnicos | Estados INPUT ERROR, salidas bloqueadas y decisión STOP cuando falla el modelo |
| Cambios de alcance con costos pero sin horas se omitían | Se ocultaba erosión real de la tarifa | Cálculo de costos adicionales y alerta DO NOT ABSORB |
| Promedios excluían tasas iguales a cero; confianza contaba registros incompletos | Rentabilidad y confianza histórica infladas | Criterios por métrica; cero explícito cuenta, faltantes no se inventan |
| Tabla PROJECTS terminaba en R y dejaba horas ocultas y comisiones fuera | Ordenar podía desalinear datos | Tabla completa hasta AB, con auxiliares ocultos incluidos |
| La oferta recomendada omitía el multiplicador de horas centrales | El precio no preservaba las horas calibradas | Multiplicador aplicado a horas centrales y ocultas |
| Benchmark personalizado sumaba importes negativos y aceptaba evidencia sin fecha/fuente | Promedio contextual corrupto | Evidencia positiva y con fecha/fuente; validación de confianza en columna correcta |
| Resumen del cliente sin comparativa y regiones combinadas superpuestas | Exportación incompleta o ilegible | Comparativa de opciones, moneda explícita, anticipo/saldo según precio elegido y regiones sin superposición |
| Sin instrucciones claras de exportación y edición | Riesgo de compartir datos internos o borrar fórmulas por accidente | Exportar solo CLIENT SUMMARY a PDF; protección sin contraseña y guía actualizada |

## Método reproducible

1. Conservar y verificar la identidad del ZIP y XLSX originales.
2. Abrir el XLSX original sin resultados guardados y recalcular con LibreOffice. Guardar evidencia del fallo real.
3. Aplicar `scripts/product-audit/patch_v2_2.py`, que exige el SHA original conocido. No regenerar el producto desde una plantilla distinta.
4. Analizar referencias de todas las fórmulas, detectar ciclos y vínculos externos, verificar los 19 módulos, regiones combinadas y las 100 filas.
5. Recalcular 66 escenarios con las mismas entradas y fórmulas. Las copias para cálculo omiten presentación y gráficos; el archivo completo se recalcula también por separado.
6. Probar margen neto, cobertura del costo protegido, descuento seguro y conciliación anticipo/saldo con 24 combinaciones aleatorias reproducibles, además de casos de límite deliberados.
7. Comprobar presupuestos bajo/entre/sobre los precios protegidos; cambios de alcance por horas/costos/sin cambio; ingresos cero; horas ocultas; registros incompletos; 100 proyectos; fuente de benchmark; moneda/FX; descuento que rompe el piso; horas calibradas de la oferta.
8. Construir el ZIP solo si el recibo indica PASS y su SHA coincide con el XLSX auditado. Incorporar valores recalculados manteniendo fórmulas, estilos y estructura OOXML originales.
9. Comprobar integridad del ZIP, manifiesto de SHA, nueve páginas de guía, ausencia de errores en las celdas y PASS/GO iniciales. La verificación de descarga desde Payhip es una puerta adicional de publicación.

Los procesos del motor de cálculo se ejecutan con perfiles independientes y se reinician por caso para limitar memoria. Una interrupción o un archivo sin recalcular se registra como fallo, nunca como prueba aprobada.

## Identidad histórica

- ZIP comprador v2.1: `f7a5d93fe223c1dab12b783bdacf02c95d8bff07b19d4f0816c540c7fd1a7639`.
- XLSX original v2.1: `f82b410774891e9b3e63ef3876b8133a52e0886d4c5deff925d77d6bcfa66a8f`.
- ZIP comprador v2.2: `7ab77bac5a2d3c7d7b4d4567d6693bd1f959129d1911c43a63e1d0a610f01b79`.
- XLSX comprador v2.2: `4c0d9c53b9a4c24443e866ca618e3a8225a83b849a547ab7f18b05a57f15a213`.
- Guía v2.2: `4eaeef42499f3ee8eee8853a58f4817585244dfb9e0c2a1bc6177eadc99c6b1b`.

## Límites de la evidencia

La prueba de recálculo se ejecuta en LibreOffice, con inspección de OOXML. Microsoft Excel de escritorio no se ha ejecutado en esta sesión; no se afirma una prueba de interfaz nativa. Google Sheets sigue sin validación. La protección de hojas evita modificaciones accidentales y no es una barrera de seguridad o privacidad.

Las nueve referencias de Upwork se volvieron a consultar en sus páginas oficiales el 2026-10-06. Son rangos históricos globales de contratos y contexto; no constituyen tarifas locales chilenas, una promesa de ingresos ni evidencia de superioridad comercial.

Los cambios son sustanciales en corrección, integridad de datos y uso, sin una puntuación inventada de mejora. No hay ventas, ingresos, conversión, pago real ni fondos disponibles verificados por esta auditoría. Gasto inicial: cero.

## Resultado cerrado de cálculo

- 66 escenarios recalculados y verificados; 359 comprobaciones aprobadas; 0 fallos.
- 1861 fórmulas analizadas; ninguna dependencia circular.
- 27 casos adversos de entrada: FAIL/STOP sin errores de fórmula.
- 24 combinaciones económicas reproducibles con margen, piso, descuento y anticipo/saldo consistentes.
- 100 filas del historial contrastadas individualmente con tasas esperadas.
- Fuente v2.2 con las correcciones de impresión: `71c17950174fdb3c5a1f03f86edc6ff410339dce9b4acf6baba7be86e3f7374e`.

Los resultados de escenarios se reutilizaron tras la corrección exclusivamente visual solo después de comprobar que todas las fórmulas y todas sus celdas referenciadas coinciden; tolerancia numérica de entradas 1e-12. El archivo completo con su presentación se recalcula por separado. No se cuentan procesos interrumpidos ni archivos parciales como resultados aprobados.

## Cierre del archivo completo y paquete

El archivo completo con estilos, gráficos y áreas de impresión se recalculó por separado: 8 comprobaciones adicionales PASS, todas las entradas y fórmulas preservadas, 19 módulos, sin errores, sistema PASS y decisión inicial GO. Total: 367 comprobaciones aprobadas. Las páginas START HERE y CLIENT SUMMARY se inspeccionaron visualmente después de corregir los límites de impresión.

El ZIP final pasó integridad, seis archivos exactos, nueve páginas de guía y contraste de sus identidades. El manifiesto contiene los hashes de los cinco archivos entregados. Las ocho imágenes de venta usan v2.2, CLP 19.990 y diagramas basados en resultados auditados; explican los límites de validación. Recibos: `docs/receipts/DP001_v2_2_FULL_WORKBOOK_AUDIT_2026-10-06.json` y `docs/receipts/DP001_v2_2_PACKAGE_GATE_2026-10-06.json`.

La publicación y el enlace real https://payhip.com/b/cv4oQ están verificados, con CLP 19.990. El checkout de prueba alcanzó CLP 0 mediante cupón de un uso limitado al producto; hCaptcha exige intervención del propietario antes de entregar la descarga. La descarga por un comprador aún no está verificada. No se ha gastado dinero.
