# DP-FREELANCE-001 — RELEASE RECEIPT v2.1

Date: 2026-09-10
Product: Freelancer Pricing Intelligence System
Brand: Herramientas Rentables
Status: READY_PENDING_ETSY_PAYMENTS
Primary channel: Etsy
Introductory launch price: USD 20.00
Validated post-launch price candidate: USD 27.00 only after real purchase/conversion evidence.

## Product authority

The authoritative buyer workbook is v2.1. v2.0 is superseded before public release.

v2.1 corrects an adversarially discovered Scope Guard defect in which hours-only change requests with zero external costs could suppress change-fee calculations. The formula now treats a change as empty only when both extra hours and extra external costs are zero. Negotiation Lab also now states explicitly when a fitting client budget requires no scope reduction.

## Regression gates

- Formula error scan (#REF / #DIV0 / #VALUE / #NAME / #N/A): PASS
- System Check: PASS
- Scope Guard hours-only change: PASS
- Scope Guard external-cost-only change: PASS
- Scope Guard no-change state: PASS
- Client budget below floor -> WALK AWAY: PASS
- Client budget between floor and target -> NEGOTIATE: PASS
- Client budget above target -> FIT: PASS
- 30% proposed discount crossing protected economics -> UNDERPRICED: PASS

## Marketing evidence layer

The Etsy launch package contains 8 high-resolution listing images based on real workbook renders. Demonstration screenshots are explicitly labelled as demo inputs using actual formulas.

Two silent live-formula demo videos are prepared because Etsy supports up to two listing videos:

1. Budget decision story: USD 2,500 -> WALK AWAY; USD 4,500 -> NEGOTIATE; USD 5,300 -> FIT / final GO.
2. Scope-creep story: 2h -> 8h -> 20h extra work, showing increasing effective-rate erosion and the recommended change fee.

No claim is made that the product is objectively 'the best on Etsy'. The release claim is narrower: this product provides a broader connected pricing/negotiation/scope-learning workflow than the premium comparables audited during development.

## Artifact identities

- Workbook `Freelancer_Pricing_Intelligence_System_v2_1.xlsx`
  - SHA-256 `f82b410774891e9b3e63ef3876b8133a52e0886d4c5deff925d77d6bcfa66a8f`
- Quick Start `Freelancer_Pricing_Intelligence_System_v2_1_Quick_Start.pdf`
  - SHA-256 `e498b9b7e4f17586691209032fc4f2920ef2470f370e3f70fd4ad0061b25e547`
- Buyer package `Freelancer_Pricing_Intelligence_System_v2_1_BUYER_PACKAGE.zip`
  - SHA-256 `f7a5d93fe223c1dab12b783bdacf02c95d8bff07b19d4f0816c540c7fd1a7639`
- Etsy budget demo video
  - SHA-256 `8429698cef1986f413bb9053f1267e84cfa622d535a1edca2b8dd99a75d81d69`
- Etsy scope demo video
  - SHA-256 `926ab404c676b58f82a288d7c5c7bfb9629fb08575913ff6323022654f512a8c`
- Seller launch kit `DP-FREELANCE-001_ETSY_SELLER_LAUNCH_KIT_v2_1_FINAL.zip`
  - SHA-256 `2a0ba483581034fc59f121e774e2b24ef1504873a501816b0324436dcfe4fa5f`

## Channel rules

- Etsy listing: digital download.
- Authoritative compatibility claim: Microsoft Excel .xlsx.
- No macros/VBA required.
- No paid add-ins required.
- No subscription required.
- Google Sheets compatibility remains UNVALIDATED and must not be claimed.
- No guaranteed income/profit claims.
- Product is not tax, legal, accounting, investment or financial advice.

## Current blocker

Release execution is blocked only by Etsy Payments / Payoneer approval. Product build, QA, buyer package, 8-image sales layer, two listing videos and listing copy are ready.
