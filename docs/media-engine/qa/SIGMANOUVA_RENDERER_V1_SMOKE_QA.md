# SIGMANOUVA RENDERER v1 — SMOKE QA

Status: PASS_SMOKE_ONLY
Date: 2026-09-05
Authority: MEDIA_ENGINE_WORKLOG_v1.1_GROWTH_PATCH + SIGMANOUVA_BRAND_KIT_v1
Renderer authority: `scripts/media-engine/render-sigmanouva-svg.mjs`

## Scope

This is a smoke test of the SIGMANOUVA brand migration and renderer geometry. It is not the final Cohort 001 visual QA.

## Canonical operational core identity

Expected SHA-256:

`f270af923e3075c1dcf53e9e6b27291e32d772fe5e080248d2fd742c2691768b`

Source role: `core_simplified` in `SIGMANOUVA_LOGO_FAMILY_MANIFEST_v1`.

## Runtime checks

PASS:

- the locally materialized 1024x1024 operational core derivative hashes exactly to the expected SHA-256;
- the renderer code contains a hard SHA equality gate and exits on mismatch;
- a changed/corrupt logo byte sequence does not satisfy the canonical identity;
- SIGMA is not accepted as the render-input brand by the SIGMANOUVA renderer;
- footer signature is `SIGMANOUVA — Lo que importa, explicado.`;
- legacy SIGMA renderer remains separate rather than silently overwritten.

## Day 1 visual preflight

A 1080x1350 Day 1 preview was generated from the migrated input using the approved SIGMANOUVA core geometry.

PASS observations:

- angular S is recognizable at small top-left brand size;
- no full wordmark is forced into the small mark area;
- headline hierarchy remains dominant over branding;
- gold accent remains secondary to the educational content;
- brand footer is readable without competing with the main lesson;
- no technical publication IDs are visible in the public composition;
- content remains handle-neutral;
- white/light background remains compatible with the approved logo family.

## Not yet promoted

The following remain PENDING:

- exact runtime execution of all seven Cohort 001 inputs with the repository renderer;
- PIN-01 / PIN-02 / PIN-03 visual renders;
- visual inspection of all carousel slides;
- raster export QA for the SIGMANOUVA output set;
- final receipt containing every output hash;
- final mobile/crop/source QA.

Therefore:

`SIGMANOUVA_RENDERER_CODE_V1 = PASS_SMOKE`

`SIGMANOUVA_VISUAL_RENDERING = PARTIAL_DAY1_PREFLIGHT`

`SIGMANOUVA_VISUAL_RENDER_QA = PENDING_FULL_SET`

`CLOSED_CONTENT_QA = REOPENED_PENDING_FULL_SIGMANOUVA_VISUAL_QA`
