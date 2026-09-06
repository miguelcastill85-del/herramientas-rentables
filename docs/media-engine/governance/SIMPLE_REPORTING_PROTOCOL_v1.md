# SIMPLE REPORTING PROTOCOL v1

Status: ACTIVE_REQUIRED
Date: 2026-09-06
Project: SIGMANOUVA Media Engine
Authority: project-wide communication rule

## Purpose

This rule exists so the user can understand exactly what is happening in the project without needing technical knowledge.

The work may be technically complex behind the scenes, but the explanation to the user must be simple, casual, precise and useful.

## Main rule

Every meaningful progress report must answer these five questions in normal language:

1. **Qué hice** — what was actually done.
2. **Para qué lo hice** — why it matters for the business or the next step.
3. **Qué resultado obtuvimos** — what changed or what was learned.
4. **Qué falta** — what is still unfinished, blocked or waiting.
5. **Qué significa ahora** — where the project stands and what happens next.

If no action from the user is needed, say so clearly. If an action is needed, explain exactly what the user needs to do and why.

## Language style

Use Spanish by default.

The tone must be:

- simple;
- casual but professional;
- direct;
- calm;
- precise;
- easy to understand on a phone.

Avoid sounding like a software manual, legal document, engineering report or corporate memo unless the user explicitly asks for that style.

## Technical words

Do not use technical terms when a normal word works better.

When a technical term is necessary, explain it immediately in plain Spanish.

Examples:

Bad: `El gate CLOSED_CONTENT_QA está reopened pending production render.`

Good: `El contenido ya está revisado, pero todavía falta generar la versión final con la nueva marca. Por eso aún no lo considero listo para publicar.`

Bad: `Persistimos hashes SHA-256 de los assets.`

Good: `Guardé una huella digital única de cada logo. Eso nos permite comprobar en el futuro que estamos usando exactamente el archivo correcto y no una versión parecida.`

Bad: `El renderer pasó el smoke test.`

Good: `Probé el sistema que crea las publicaciones y funcionó correctamente con una pieza de prueba.`

## Status words

Internal files may continue using technical status names such as PASS, PENDING, BLOCKED or QA because they are useful for automation and auditing.

User-facing reports must translate them:

- `PASS` → `listo / aprobado / comprobado`;
- `PENDING` → `todavía falta`;
- `BLOCKED` → `no podemos avanzar en esta parte porque...`;
- `QA` → `revisión de calidad`;
- `HEAD` → `estado oficial actual del proyecto`;
- `render` → `generar la versión visual final`;
- `asset` → `archivo de marca / imagen / recurso`, depending on context;
- `hash / SHA-256` → `huella digital del archivo`;
- `pipeline` → `proceso automático de trabajo`;
- `gate` → `condición que debe cumplirse antes de avanzar`.

The internal term may be shown in parentheses only when it helps traceability. It must never replace the simple explanation.

## Reporting format

Default progress reports should be short enough to understand quickly but complete enough to avoid ambiguity.

Recommended structure:

### Qué hice
One or two short paragraphs.

### Para qué sirve
Explain the business reason, not only the technical reason.

### Dónde estamos
Say what is ready, what is not ready and whether the user needs to do anything.

### Siguiente paso
Explain the next action in one clear sentence or short paragraph.

Do not dump internal file names, commit hashes, gate names or implementation details unless they materially help the user or the user asks for them.

## Accuracy rule

Simple language must never mean vague language.

Never say `listo` if only part of the task is complete.

Never hide a problem because it is technical.

Never make a blocker sound worse than it is.

Never report work as completed if it was only planned.

If something failed, say what failed, what effect it has and what is being done about it in normal language.

## Business-first explanation

Whenever possible, connect work to one of these outcomes:

- make SIGMANOUVA easier to recognize;
- make content more useful;
- reduce mistakes;
- save time;
- reduce unnecessary cost;
- make publishing more reliable;
- improve growth or measurement;
- protect work already completed;
- prepare monetization without damaging audience trust.

The user should understand not only what changed, but why it helps the business.

## Continuity rule

This file is part of the durable project authority in GitHub.

Any future chat, agent or workflow that resumes SIGMANOUVA from `docs/media-engine/HEAD.json` must follow this reporting protocol.

The current chat must follow it immediately.

When the project is resumed in another chat, the project state should point to this file so the same communication style is recovered together with the work state.

## Examples

### Example: logo work

`Ya dejé definida la familia de logos. Esto sirve para que Instagram, Facebook y LinkedIn se vean como la misma marca, aunque cada red necesite un formato distinto. Todavía falta guardar las versiones finales de forma permanente y volver a generar las publicaciones con SIGMANOUVA. No necesitas hacer nada por ahora.`

### Example: publication block

`Las publicaciones están escritas y revisadas. Lo que falta es generar la versión visual final con SIGMANOUVA y comprobar que se vea bien en celular. Hasta que eso termine no voy a publicarlas, porque podríamos terminar usando una imagen vieja o mal recortada.`

### Example: external action needed

`La parte interna ya está lista. Ahora necesitamos comprobar directamente si @sigmanouva está disponible en Instagram, Facebook y LinkedIn. Esto no se puede confirmar solo con Google. Cuando lo comprobemos, podremos dejar el mismo nombre en las tres redes y evitar confusión.`

## Gate

SIMPLE_REPORTING_PROTOCOL_V1 = ACTIVE_REQUIRED
USER_FACING_TECHNICAL_JARGON_WITHOUT_EXPLANATION = NOT_ALLOWED
BUSINESS_PURPOSE_EXPLANATION = REQUIRED
CROSS_CHAT_RECOVERY_FROM_HEAD = REQUIRED
