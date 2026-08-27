# Cotización Freelance Profesional — Chile

## Objetivo
Crear una experiencia comercial gratuita de calidad premium que ayude a un freelancer en Chile a construir una cotización rentable y profesional, sin convertir el sitio gratuito en un sustituto del producto pago `Sistema Freelance Rentable`.

## Propuesta de valor
**No rellenes una plantilla. Construye una cotización que proteja tu rentabilidad.**

La experiencia debe ayudar a responder cuatro preguntas antes de enviar una propuesta al cliente:

1. ¿Cuál es mi precio mínimo sostenible?
2. ¿Cuál es mi precio recomendado para este proyecto?
3. ¿Qué anticipo y condiciones me conviene exigir?
4. ¿Qué información debo presentar al cliente para reducir ambigüedad y retrabajo?

## Público principal
Freelancers e independientes en Chile que venden servicios por proyecto y necesitan cotizar sin cobrar de menos.

## Intención SEO
Keyword principal: `cotización freelance Chile`.

Long-tail relacionadas:
- plantilla cotización freelance Chile
- cómo hacer una cotización freelance
- presupuesto freelance Chile
- cotización servicios profesionales
- cuánto anticipo pedir freelance
- qué debe incluir una cotización

La página debe resolver la intención de forma más completa que una plantilla descargable genérica.

## Diferenciadores
1. Calcula precio y condiciones, no solo entrega un formato vacío.
2. Explica el piso económico y el precio recomendado por separado.
3. Incluye anticipo, revisiones, vigencia y alcance como parte de la decisión comercial.
4. Genera un resumen profesional listo para copiar.
5. Todo funciona localmente en el navegador, sin registro.
6. Contexto explícito para freelancers en Chile, sin sustituir asesoría tributaria o legal.

## Experiencia gratuita

### Entradas económicas
- Horas estimadas.
- Tarifa por hora.
- Complejidad: baja / media / alta.
- Margen de seguridad / contingencia.
- Costos externos.
- Margen de rentabilidad objetivo opcional.

### Entradas comerciales
- Nombre del proyecto.
- Nombre del cliente opcional.
- Número de revisiones incluidas.
- Anticipo: porcentaje configurable.
- Vigencia de la cotización en días.
- Plazo estimado de entrega.
- Alcance breve / entregables.

### Resultados
- Costo base.
- Precio mínimo protegido.
- Precio recomendado.
- Monto de anticipo.
- Saldo restante.
- Margen de seguridad incorporado.
- Resumen de condiciones.
- Señal visual si el precio ingresado queda por debajo del mínimo calculado.

## Lógica inicial
La lógica existente de cotización se conserva como base:

- `costoBase = horas × tarifa`
- multiplicador de complejidad: baja 1.00, media 1.20, alta 1.40
- `subtotalAjustado = costoBase × multiplicadorComplejidad`
- `contingencia = subtotalAjustado × porcentajeSeguridad`
- `precioMinimo = subtotalAjustado + contingencia + costosExternos`

Si el usuario define margen objetivo `m` entre 0 y 80%:

- `precioRecomendado = precioMinimo / (1 - m)`

Si no define margen objetivo, `precioRecomendado = precioMinimo`.

El anticipo se calcula sobre el precio recomendado.

## Resumen profesional listo para copiar
Debe generar texto estructurado como:

- Proyecto
- Cliente
- Alcance
- Inversión total
- Anticipo
- Saldo
- Revisiones incluidas
- Plazo estimado
- Vigencia de la propuesta
- Nota de exclusiones / cambios de alcance

No generar contrato, asesoría legal ni promesas tributarias.

## Límite deliberado frente al premium
La herramienta gratuita resuelve **una cotización puntual**.

El producto `Sistema Freelance Rentable` debe seguir siendo la solución para:
- gestionar precios de forma recurrente;
- ordenar múltiples proyectos/clientes;
- controlar márgenes en el tiempo;
- sistematizar decisiones comerciales;
- disponer de un flujo más completo y reutilizable.

La herramienta gratuita no debe incluir CRM, historial persistente, seguimiento de clientes, cartera de proyectos ni automatización recurrente.

## Conversión
CTA principal después del resultado:
**Ver Sistema Freelance Rentable**

Copy recomendado:
`Si cotizas proyectos con frecuencia, da el siguiente paso: organiza precios, cotizaciones y márgenes en un sistema reutilizable.`

CTA secundario:
`Ver guía: cuánto cobrar como freelance en Chile`.

Los enlaces de Payhip deben reutilizar la configuración centralizada existente.

## Arquitectura recomendada
Ruta propuesta:
`/cotizacion-freelance-chile`

La página debe funcionar como landing-producto y no como artículo largo.

Orden visual:
1. Hero corto con propuesta de valor.
2. Herramienta visible sobre el primer scroll o inmediatamente después.
3. Resultados y diagnóstico.
4. Constructor de condiciones comerciales.
5. Resumen listo para copiar.
6. Explicación breve de metodología.
7. CTA premium.
8. FAQ SEO compacta.

## Calidad
- Mobile-first.
- Accesible por teclado.
- Sin dependencias pagadas.
- Sin cuentas ni almacenamiento externo.
- Sin modificar las fórmulas de otras calculadoras.
- Sin alterar los enlaces actuales de Payhip.
- Sin testimonios inventados, urgencia artificial ni claims no verificables.

## Criterio de éxito
La página debe poder responder por sí sola:
`¿Qué cobro, qué anticipo pido y qué condiciones envío al cliente?`

y dirigir de forma natural al producto premium cuando el usuario necesite repetir ese proceso de forma sistemática.
