# DIGITAL PRODUCT BUSINESS OS v1

Status: ACTIVE
Date: 2026-09-09
Scope: digital products with zero inventory and zero mandatory paid infrastructure.

## Core doctrine

The business does not optimize for novelty. It optimizes for validated demand, original execution, useful differentiation, professional brand quality, profitable distribution and rapid learning from real transactions.

Canonical loop:

`PROVEN WINNER -> MARKET EVIDENCE -> WINNER BENCHMARK -> PRE-BUILD COMPETITIVE VALUE GATE -> ORIGINAL PRODUCT SPEC -> VALUE ADD -> BUILD -> TECHNICAL QA -> POST-BUILD COMPETITIVE + TRANSVERSAL AUDIT -> BRAND/PACKAGING -> CHANNEL ADAPT -> RELEASE -> TRANSACTION DATA -> ITERATE / SCALE / SUNSET`

A crowded category is not rejected merely because it is crowded. Competition plus repeated purchases is evidence that money is already moving. The decision question is whether we can capture a profitable fraction of that demand with an original, legitimate and professionally differentiated implementation.

## Non-negotiable rules

1. Demand demonstrated by real marketplace behavior is preferred over idea novelty.
2. Never copy another seller's files, formulas, branding, images, text, proprietary data or protected creative expression. We may enter the same category and solve the same customer problem with our own implementation.
3. Every premium product must pass `docs/DIGITAL_PRODUCT_COMPETITIVE_VALUE_GATE_v1.md` both before PRODUCT SPEC and after BUILD/technical QA.
4. A product must provide at least one clear buyer-outcome advantage and at least two coherent non-cosmetic system advantages beyond table stakes. More tabs alone do not count.
5. One premium release per week is a target, not permission to release a weak product. Failed gates cause replacement by another validated candidate, not lower standards.
6. WIP limit: maximum 1 product in BUILD and 1 product in RESEARCH.
7. Every product receives an immutable Product ID `DP-<FAMILY>-NNN` and preserves research, spec, QA, competitive audit, release and performance history.
8. Publish only to channels where the format fits. Do not force identical packaging across every marketplace.
9. Real paid-order evidence outranks reviews, favorites, listings counts, search estimates, impressions and opinions.
10. Never invent private sales or conversion telemetry. Unknown values remain UNOBSERVED.
11. A product cannot be FINAL with any RED transversal-audit finding. AMBER release findings must be fixed or explicitly accepted with written rationale before release.
12. Portfolio scaling and kill decisions remain governed by `docs/DIGITAL_PORTFOLIO_KILL_SCALE.md`.

## Operating modules

### M01 RADAR
Find products/categories already showing buyer demand.
Output: candidate archetypes.

### M02 MARKET EVIDENCE
Collect current category size, observable reviews, price bands, successful seller examples, recurring feature patterns, complaints/weaknesses when available and channel fit.
Output: evidence dossier.

### M03 WINNER BENCHMARK
Rank candidates with `DIGITAL_PRODUCT_WINNER_BENCHMARK_v3`.
Output: BUILD / WATCH / REJECT.

### M04 VALUE-ADD LAB
Separate TABLE STAKES from real VALUE ADD. The product need not be novel; it must have a credible reason to be chosen.
Output: differentiation brief.

### GATE CV-A — PRE-BUILD COMPETITIVE VALUE
Benchmark a current cohort before freezing the Product Spec. Include feature leaders, low-cost substitutes, premium competitors, validated sellers when observable, and adjacent substitutes.
Output: table-stakes matrix, competitor value matrix, price/value headroom, buyer-friction hypotheses and frozen Product Value Thesis.
Hard rule: no Product Spec without a credible non-cosmetic buyer reason.

### M05 PRODUCT SPEC
Freeze audience, job-to-be-done, inputs, outputs, features, exclusions, files, supported platforms, claims and acceptance criteria before build.
Output: frozen spec.

### M06 BUILD
Create original product assets and logic.
Output: release candidate.

### M07 QA
Test formulas, edge cases, compatibility, links, instructions, file integrity and visual presentation. No critical defect may ship.
Output: QA PASS / FAIL.

### GATE CV-B — POST-BUILD COMPETITIVE + TRANSVERSAL AUDIT
Re-run the competitive benchmark against the built product and audit market fit, parity, differentiation, correctness, edge cases, workflow, UX, visual quality, compatibility, buyer-facing deliverables, claims, packaging, support burden and measurement readiness.
Output: PREMIUM RELEASE PASS / REWORK / BLOCK.
Required: ZERO RED findings.

### M08 BRAND & PACKAGING
Professional visual system, product naming, screenshots, start-here guide, examples, license, versioning and coherent family identity.
Output: branded release package.

### M09 CHANNEL ADAPT
Prepare channel-native offer, title, pricing, file bundle, description, images and compliance for Etsy, Payhip and other validated channels.
Output: channel packages.

### M10 RELEASE
Publish and verify live URLs, price, download package and buyer experience.
Output: LIVE receipt.

### M11 DISTRIBUTION
Organic SEO/social/content/cross-sell only unless a future decision explicitly authorizes paid acquisition.
Output: traffic assets.

### M12 MARKET PERFORMANCE
Measure paid orders, net cash, attributable checkout behavior, conversion and refunds when observable.
Output: performance record.

### M13 LEARNING LOOP
Change one commercial variable at a time when diagnosing weak performance.
Output: vNext hypothesis and test.

### M14 PORTFOLIO
Scale winners, bundle adjacent products, localize proven products, verticalize by profession and sunset persistent non-performers.

## Product family strategy

Prefer reusable product families over 52 unrelated builds.

Typical ladder:

`CORE -> ADJACENT MODULE -> ADJACENT MODULE -> PREMIUM BUNDLE -> NICHE VERTICALS -> LOCALIZED VERSIONS`

Each release must be independently useful. Bundles must create integration value rather than merely concatenate files.

## Weekly cadence

- Monday: RADAR + MARKET EVIDENCE + benchmark decision.
- Tuesday: value-add + pre-build competitive gate + frozen product spec.
- Wednesday: build.
- Thursday: build + technical QA + post-build competitive/transversal audit.
- Friday: fixes + brand + packaging + channel adaptation.
- Saturday: release only where all gates pass.
- Sunday: distribution + portfolio learning.

Cadence may compress when an existing validated internal asset can be reused, but gates do not change.

## Improvement principle

We compete on `VALUE / FRICTION`, not simply number of features.

Value can increase through better financial outcome, time saved, error prevention, decision clarity, professional presentation, confidence, localization, workflow integration and reusable guidance. Friction includes setup time, confusing inputs, compatibility failures, documentation gaps, manual duplication and hidden assumptions.

Every premium family must also preserve a recognizable functional signature. For DP-FREELANCE the current signature is `PRICE -> PROTECT -> NEGOTIATE -> LEARN`.

## Governance

Any future benchmark revision must be versioned. Historical product decisions retain the benchmark version used at the time. No retrospective rewriting of scores to make a decision look correct. New competitors discovered later create a new audit version rather than silently changing the historical record.
