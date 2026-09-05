# PROFILE CONVERSION v2 — SIGMA

Status: APPROVED_SPEC
Date: 2026-09-05
Authority: MEDIA_ENGINE_WORKLOG_v1.1_GROWTH_PATCH + DEC-0002 + SIGMA_BRAND_SYSTEM_v1
Supersedes: PROFILE_CONVERSION_v1 for future SIGMA-facing profiles.

## Objective

Convert non-follower discovery into recurring audience while preserving trust.

A profile visit should answer in seconds:

1. What is SIGMA?
2. Why should I follow?
3. What will I receive repeatedly?
4. Where can I get deeper/free utility?

## Core profile promise

**Lo que importa, explicado.**

Supporting proposition:

**Dinero, negocios, trabajo y tecnología práctica para decidir mejor.**

## Instagram

### Display name

**SIGMA | Ideas para decidir mejor**

### Bio v1

Dinero, negocios y tecnología, sin ruido.  
Explicamos lo que cambia una decisión.  
↓ Herramientas y recursos útiles

### Alternate compact bio

Lo que importa, explicado.  
Dinero • negocios • tecnología  
↓ Recursos útiles

### Link rule

During transition, the primary owned destination may remain the existing Herramientas Rentables site until a SIGMA-owned landing page is explicitly created and tested.

Do not route the default profile directly to a paid product during initial audience-building.

## Facebook

### Page descriptor

**SIGMA — Lo que importa, explicado.**

### About copy

SIGMA convierte información compleja o poco explicada sobre dinero, negocios, trabajo y tecnología en ideas claras que pueden ayudarte a tomar mejores decisiones. Usamos ejemplos, cálculos, evidencia y herramientas prácticas. Sin motivación vacía, sin secretos inventados y sin ruido innecesario.

## LinkedIn

### Page tagline

**SIGMA | Lo que importa, explicado.**

### About

SIGMA es una marca de conocimiento práctico. Explicamos mecanismos que suelen estar dispersos, mal entendidos o escondidos a plena vista: precios, márgenes, negociación, decisiones, comportamiento del consumidor, herramientas digitales, IA práctica y tecnología.

Nuestro objetivo no es publicar por publicar. Es convertir información en comprensión útil para decidir mejor.

El contenido aporta valor por sí mismo. Las herramientas y productos amplían ese valor; no sustituyen al contenido.

## Pinned / featured system

Where supported, orient new visitors with three assets.

### PIN-01 — Qué es SIGMA

Purpose: establish the brand promise and semantic meaning before the audience attaches other interpretations to the word `SIGMA`.

Core message:

> SIGMA existe para una cosa: explicar lo que realmente cambia una decisión. Dinero, negocios, trabajo y tecnología, sin ruido y sin secretos inventados.

CTA: follow for recurring useful explanations.

### PIN-02 — Proof of value

Use the strongest verified educational piece from Cohort 001 or a later winner.

Purpose: demonstrate value instead of merely claiming expertise.

### PIN-03 — Free utility

Show a useful free calculator/tool from the existing Herramientas Rentables property.

During transition, label it clearly as a useful SIGMA-linked resource without renaming the live property unless a separate migration is authorized.

## Handle policy

Do not freeze or publish an invented handle as available.

Candidate patterns to test for availability and collision risk:

- `somossigma`
- `sigmaexplica`
- `sigmaideas`
- `sigmaclaro`
- `sigmamedialab`

These are candidates only, not authoritative handles.

Selection criteria:

1. same or near-same handle across all three platforms;
2. easy to dictate and spell in Spanish;
3. no confusing punctuation where avoidable;
4. no implication of unrelated Sigma companies;
5. no `sigma male` / masculinity positioning;
6. preferably available domain/landing-page analogue.

## Avatar rule

Use the exact user-selected canonical SIGMA logo mark once it is ingested into the repository and verified.

Until then, no generated alternative is authoritative.

Avatar requirements after ingest:

- legible at 40px;
- strong silhouette;
- high contrast;
- no tagline inside the avatar;
- safe area prevents cropping.

## Header / cover rule

Default message:

**Lo que importa, explicado.**

Optional second line:

**Entender mejor. Decidir mejor.**

Use one clear message; do not fill the cover with topic lists.

## Profile conversion metrics

Track where available:

- non-follower reach;
- profile visits / non-follower reach;
- follows / profile visits;
- link clicks / profile visits;
- free-tool sessions from social;
- returning users from social;
- pinned-content completion/engagement where available.

## Diagnostic logic

**High reach + low profile visits**  
Content may be useful/entertaining but weakly branded or insufficiently curiosity-generating.

**High profile visits + low follows**  
Promise, proof, avatar, bio or pinned orientation may be weak/confusing.

**High follows + low returning audience**  
The recurring content promise is not being delivered consistently.

**High link clicks + low tool engagement**  
The destination does not match user intent.

**Repeated “sigma male” confusion**  
Strengthen the knowledge descriptor in display name/bio and pinned orientation; do not chase the meme.

## Commercial guardrail

Initial profile priority:

1. sell the follow;
2. demonstrate recurring utility;
3. route some users to free owned utility;
4. commercial products remain secondary.

Do not turn profile copy into a storefront.

## Gates

- `PROFILE_CONVERSION_V2_SIGMA = PASS`
- `PROFILE_MESSAGE_HIERARCHY = PASS`
- `PINNED_ORIENTATION_SPEC = PASS`
- `HANDLE_SELECTION = PENDING_AVAILABILITY_CHECK`
- `CANONICAL_AVATAR_RENDER = PENDING_LOGO_INGEST`
- `LIVE_PROFILE_CHANGE = NOT_AUTHORIZED_BY_THIS_SPEC`
