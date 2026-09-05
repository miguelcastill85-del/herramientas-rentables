# SIGMA RENDERER v2 — Smoke QA

Status: PASS_DAY1_T01_ONLY
Date: 2026-09-05
Authority: MEDIA_ENGINE_WORKLOG_v1.1_GROWTH_PATCH

## Scope

This QA validates the corrected deterministic renderer on the first Cohort 001 T01 asset only. It does not promote the entire cohort or all template families to PASS.

## Canonical logo integrity

Expected SHA-256:

`48929e9baf789d3d587b44412a71adcf13dd3e5eceb3218335a3a18b7c54c4ca`

Positive test: PASS. Exact user-confirmed source bytes were accepted.

Negative test: PASS. A one-byte-modified copy was rejected with non-zero exit and `canonical logo SHA mismatch`.

## Operational crop

The canonical file is not modified. The renderer uses a deterministic SVG viewBox crop against the original bytes.

Symbol crop coordinates in the 1536x1536 canonical source:

- x: 430
- y: 300
- width: 690
- height: 690

The crop exists only as rendering geometry; it does not supersede or mutate the canonical logo.

## Corrected defects from v1

1. Excessive white padding around the logo: FIXED by deterministic viewBox crop.
2. White/off-white logo rectangle against ivory artwork: FIXED for light assets by using `#FEFEFC`, sampled from the canonical source background family.
3. Visible publication/Knowledge IDs: FIXED. Traceability moved into invisible SVG `<metadata>`.
4. Gold anchor overridden by headline CSS: FIXED with explicit inline fill.
5. Unsupported approximate glyph in the first visual: AVOIDED by approved copy `33% MÁS` rather than depending on a special mathematical glyph.
6. Dark template with white-backed source logo: BLOCKED intentionally until a transparent approved derivative exists.

## Day 1 T01 evidence

Render input:
`docs/media-engine/render-input/COHORT_001/PUB-C001-D01_T01_v1.json`

Local deterministic smoke-test output:

- SVG: 1080x1350 logical canvas
- SVG SHA-256: `4c98f6eb390d1f2379d3c1a9db32fd6e32765a2c40b85ff1bf9153ac9a8fb920`
- PNG raster QA derivative: 1080x1350
- PNG SHA-256: `1a3973db269a308a2c51a0d7a0f77671a4bc006266a06b3889ba8c648205fa17`

Visual inspection:

- canonical symbol recognizable at mobile-relevant size: PASS
- brand/background seam: PASS
- headline crop/clipping: PASS
- gold anchor visible: PASS
- support text legible: PASS
- public art contains no internal IDs: PASS
- footer/tagline remains inside safe area: PASS
- factual qualifier `en este ejemplo`: PASS

## Copy integrity

Approved cover copy:

`Un 10% de descuento / puede exigir mucho más / de 10% más ventas.`

Anchor:

`33% MÁS`

Qualifier:

`unidades para conservar / la misma contribución / en este ejemplo.`

This preserves the KV-000002 caveat that the 33% result belongs to the stated cost/margin example and is not a universal result for every 10% discount.

## Remaining gates

Still required before Cohort 001 visual PASS:

- render T01 examples for KV-000017, KV-000016 and KV-000004;
- render T02 carousels for KV-000001 and KV-000003;
- resolve KV-000012 Reel/carousel final format and render it;
- render profile PIN-01/PIN-02/PIN-03 assets;
- mobile/crop/source/logo QA for every final asset;
- raster/export path confirmation for actual platform upload format.

## Gate results

SIGMA_RENDERER_V2_SMOKE_TEST = PASS
SIGMA_RENDERER_SHA_REJECTION_TEST = PASS
DAY1_T01_VISUAL_QA = PASS
VISUAL_TEMPLATE_RENDERING = PARTIAL_PASS_DAY1_T01
VISUAL_RENDER_QA = PARTIAL_PASS_DAY1_T01
CLOSED_CONTENT_QA = PARTIAL_PASS_TEXT_PLUS_DAY1_VISUAL
PUBLIC_SIGMA_REBRAND = NOT_AUTHORIZED
AUTONOMOUS_PUBLISHING = NOT_AUTHORIZED
