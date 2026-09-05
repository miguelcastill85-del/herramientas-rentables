# SIGMA RENDERER v1

Status: IMPLEMENTED_PENDING_RUNTIME_SMOKE_TEST
Date: 2026-09-05
Authority: MEDIA_ENGINE_WORKLOG_v1.1_GROWTH_PATCH + SIGMA_VISUAL_TEMPLATES_v1
Implementation: `scripts/media-engine/render-sigma-svg.mjs`

## Purpose

Provide a deterministic, zero-paid-service rendering path for SIGMA social assets. The renderer outputs SVG from structured JSON and refuses to use a logo whose SHA-256 differs from the user-confirmed canonical SIGMA logo.

## Security / brand integrity invariant

Canonical logo SHA-256:

`48929e9baf789d3d587b44412a71adcf13dd3e5eceb3218335a3a18b7c54c4ca`

The renderer calculates the logo bytes at runtime and exits non-zero on mismatch. A visually similar generated variant is not accepted.

## Supported templates

- T01 — Reel/short-video cover
- T02 — educational carousel, emitted as ordered SVG slides
- T03 — number/data card
- T04 — LinkedIn authority card

## Cost

No external rendering API is required. The implementation uses Node.js standard-library modules only (`fs`, `path`, `crypto`).

## Render inputs

Each JSON input must declare:

- `brand: SIGMA`
- template ID
- publication ID
- knowledge ID
- franchise
- structured text fields
- dimensions
- path to the canonical logo at runtime

The input is content data, not free-form layout code. Brand geometry and palette remain locked in the renderer.

## Example

First prepared input:

`docs/media-engine/render-input/COHORT_001/PUB-C001-D01_T01_v1.json`

Before execution, `logoPath` must resolve to the exact canonical asset in the runtime. Do not alter the renderer to bypass the SHA check.

## Output integrity

Every SVG footer includes publication ID and Knowledge ID for traceability. Final publishing derivatives may remove internal IDs only after the rendered artifact is mapped to them in the publication manifest.

## Known pending work

1. runtime smoke test against the exact canonical logo bytes;
2. render Day 1 asset;
3. inspect mobile legibility/crop;
4. test dark/light variants;
5. rasterization/export path for platforms that do not accept SVG;
6. visual QA before promotion of `VISUAL_TEMPLATE_RENDERING`.

## Gate

SIGMA_RENDERER_CODE_V1 = IMPLEMENTED_PENDING_RUNTIME_SMOKE_TEST
VISUAL_TEMPLATE_RENDERING = PENDING
VISUAL_RENDER_QA = PENDING
