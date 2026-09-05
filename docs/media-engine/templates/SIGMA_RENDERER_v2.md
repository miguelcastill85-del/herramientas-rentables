# SIGMA RENDERER v2

Status: ACTIVE_AFTER_SMOKE_PASS
Date: 2026-09-05
Authority: MEDIA_ENGINE_WORKLOG_v1.1_GROWTH_PATCH + SIGMA_VISUAL_TEMPLATES_v1
Implementation: `scripts/media-engine/render-sigma-svg.mjs`
Supersedes: `SIGMA_RENDERER_v1.md`

## Improvements over v1

- deterministic symbol crop from the exact canonical logo source instead of scaling the full padded lockup;
- light canvas matched to the canonical source background family (`#FEFEFC`);
- publication and Knowledge IDs moved from visible artwork into SVG metadata;
- gold numeric anchor enforcement fixed;
- dark mode blocked until an approved transparent brand derivative exists;
- canonical SHA mismatch remains a hard failure;
- special-glyph dependency removed from the first published visual copy.

## Canonical integrity

The renderer accepts only logo bytes matching:

`48929e9baf789d3d587b44412a71adcf13dd3e5eceb3218335a3a18b7c54c4ca`

A negative smoke test with modified bytes returned non-zero and was rejected.

## Operational crop

Canonical source remains untouched at 1536x1536.

Approved symbol crop geometry:

`x=430, y=300, width=690, height=690`

This crop is implemented via SVG viewBox against the original image, not by mutating the source file.

## Current gate

Renderer code: PASS_SMOKE_TEST
Day 1 T01 visual: PASS
All other Cohort 001 visuals: PENDING
Public publishing: NOT_AUTHORIZED
