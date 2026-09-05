# SIGMA VISUAL TEMPLATES v1

Status: APPROVED_SPEC
Date: 2026-09-05
Authority: MEDIA_ENGINE_WORKLOG_v1.1_GROWTH_PATCH + SIGMA_BRAND_SYSTEM_v1
Canonical logo identity SHA-256: `48929e9baf789d3d587b44412a71adcf13dd3e5eceb3218335a3a18b7c54c4ca`

## Objective

Create a small, reusable visual system that makes SIGMA recognizable without slowing production. This is a Minimum Viable Visual System, not a final 50-page brand manual.

## Canonical visual language

The selected logo uses:

- an angular metallic sigma-like emblem;
- graphite/black structural surfaces;
- bronze/gold highlights;
- a clean light background;
- a wide geometric SIGMA wordmark.

Templates must inherit those traits without recreating, tracing or altering the logo.

## Brand colors

Primary operational palette:

- Ink: `#111214`
- Ivory: `#F7F5F0`
- Graphite: `#42454A`
- Gold: `#B88A2A`
- Deep Gold: `#7A571A`

Rules:

- Ink/Ivory carry most text and background contrast.
- Gold is an accent, not a body-text color.
- Metallic gradients belong mainly to logo/emblem treatments; editorial content should remain flatter and easier to reproduce consistently.
- Do not introduce random bright colors per post.

## Typography

Operational text system:

- Headline / numeric emphasis: Manrope, bold or semibold.
- Body / captions / supporting labels: Inter, regular or medium.
- If a renderer cannot access these fonts, use a neutral geometric sans fallback and record the substitution.

Do not attempt to imitate the exact custom SIGMA wordmark with a normal font.

## Minimum template family

Only four templates are authorized for Cohort 001. New templates require evidence of a need.

### T01 — REEL COVER / SHORT VIDEO FRAME

Use for discovery-first video.

Required zones:

1. SIGMA micro-brand zone.
2. One hook, maximum two short lines.
3. One visual anchor: number, symbol, diagram or short phrase.
4. Franchise label, optional and subordinate.

Rules:

- hook must dominate;
- no paragraph text on cover;
- logo/emblem must never compete with the hook;
- mobile legibility is the gate;
- keep safe margins for platform overlays.

### T02 — CAROUSEL EDUCATIONAL

Use for calculations, frameworks and save-oriented content.

Slide system:

1. Cover: one claim/question.
2. Context: why it matters.
3. Mechanism/formula.
4. Worked example.
5. Practical implication.
6. Action/checklist.
7. Optional source/CTA slide.

Not every carousel must have seven slides; 5–8 is acceptable when justified.

Rules:

- one main idea per slide;
- no wall of text;
- page number visible but quiet;
- repeated SIGMA signature position;
- source shorthand on final slide when appropriate.

### T03 — SINGLE DATA / NUMBER CARD

Use for `El número que importa`.

Hierarchy:

1. large number/formula;
2. one-line meaning;
3. one practical consequence;
4. SIGMA mark.

This template must be understandable in under five seconds.

### T04 — LINKEDIN AUTHORITY CARD

Optional visual companion for LinkedIn; the post must still work without it.

Structure:

- concise title;
- one diagram, formula or statement;
- subtle SIGMA branding;
- no fake quote-card aesthetic;
- no unnecessary CTA baked into image.

## Logo usage

Canonical logo must not be:

- recolored outside approved variants;
- stretched;
- redrawn;
- cropped through the emblem;
- combined with another symbol;
- placed over noisy imagery without sufficient contrast;
- used as a giant decorative watermark behind body text.

Until a separate avatar crop is explicitly approved, use the full canonical identity or a carefully isolated emblem only when the source asset supports it without alteration.

## Background policy

Default backgrounds:

- Ivory / near-white for clarity.
- Ink for high-impact dark variant.

Dark variant uses Ivory text with restrained Gold accents.

Photography is optional, not default. If used, content must remain recognizable as SIGMA through layout and hierarchy.

## Spacing and grid

- 8-point spacing system recommended.
- Major safe margin: approximately 6–8% of canvas width.
- Keep important text out of extreme top/bottom interface zones.
- Use strong alignment; avoid decorative floating elements without informational purpose.

## Motion rules for video

- first information appears immediately;
- no long logo intro;
- logo animation, if any, maximum approximately 0.5–0.8 s and must not delay the hook;
- captions required when speech is used;
- emphasis animation should clarify numbers or causal steps, not decorate randomly.

## Recognition devices

SIGMA should build familiarity through repeated devices:

- angular divider/chevron inspired by the emblem geometry;
- restrained gold highlight for the key variable or number;
- recurring franchise label position;
- consistent headline hierarchy;
- consistent closing signature: `SIGMA — Lo que importa, explicado.` where space permits.

Do not create a new visual gimmick for every post.

## Accessibility gates

Every output must pass:

- readable at phone size;
- sufficient contrast;
- no essential meaning conveyed only through color;
- captions/subtitles for spoken video;
- numerals and operators visually unambiguous;
- source labels large enough to read when included.

## Production speed gate

A stable template should be renderable from structured content without manual redesign.

Target after stabilization:

- cover/card assembly: minutes, not hours;
- same data can feed 1:1, 4:5 and 9:16 variants;
- brand elements remain locked while content fields change.

## Cohort 001 mapping

- Day 1 KV-000002: T01 Reel + T04 LinkedIn card optional.
- Day 2 KV-000001: T02 Carousel + T03 candidate test.
- Day 3 KV-000012: T01 or T02 experiment.
- Day 4 KV-000017: T01 Reel.
- Day 5 KV-000016: T01 Reel.
- Day 6 KV-000003: T02 Carousel + T03 formula card.
- Day 7 KV-000004: T01 Reel.

## QA checklist

A rendered asset is rejected if any of the following is true:

- brand name/logo is wrong;
- canonical logo identity cannot be traced to the recorded SHA;
- text is clipped;
- spelling error exists;
- key number differs from verified Knowledge Vault material;
- logo is distorted;
- hook is unreadable on mobile;
- visual implies a stronger claim than the verified source supports;
- CTA competes with educational value;
- platform crop cuts essential information.

## Gate

SIGMA_VISUAL_TEMPLATE_SPEC = PASS
VISUAL_TEMPLATE_RENDERING = PENDING

Next: materialize first Cohort 001 assets using T01–T04 and run CLOSED_CONTENT_QA.
