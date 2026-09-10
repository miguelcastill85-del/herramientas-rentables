# DP-FREELANCE-001 v2 — Post-Build Competitive + Transversal Audit

Date: 2026-09-10
Product: Freelancer Pricing Intelligence System v2.0
Status: PREMIUM RELEASE CANDIDATE
Launch price hypothesis: USD 20.00
Validated-price target after real paid proof: USD 27.00

## Scope

This audit tests capability, operability, model correctness and differentiation. It does NOT claim superior sales performance before the market proves it.

## Premium reference

Primary premium capability reference: DigitalWorldAB — Freelance Rate Calculator Excel Template, observed about USD 28.25.
Source: https://www.etsy.com/listing/4480728902/freelance-rate-calculator-excel-template

Strengths observed: cost-loaded rate calculation, discipline benchmark library, three saved scenarios, client report, contextual help, colour themes and structured navigation.
Constraints observed: .xlsm, VBA/macros, Excel 365 Desktop on Windows, no Excel Online; listing itself had no reviews at observation while shop showed 69 sales and 7 ratings.

Proven-seller UX reference: CreativeGeekDesign — interactive Project Quote Calculator, about USD 16.5; shop showed about 6k sales / 519 rating count and the item had 1 review at observation.
Source: https://www.etsy.com/uk/listing/4522578375/interactive-pricing-calculator-for

## Capability matrix (0–5 internal audit scale)

This scale measures observable feature/operability coverage only. It is not a market-success score.

| Dimension | Our v2 | Premium reference | Audit note |
|---|---:|---:|---|
| Sustainable rate economics | 5 | 5 | Both trace costs/capacity into rate decisions. |
| Benchmark context | 5 | 4 | v2 stores source URLs/check dates, FX conversion and buyer-added current evidence; reference has preloaded floor/mid/ceiling discipline data. |
| Scenario analysis | 5 | 5 | v2 has Lean/Base/Protected editable stress tests without VBA. |
| Client-facing output | 4 | 5 | v2 separates internal logic and compares 3 offers; reference has macro-assisted print/PDF workflow. |
| Theme/customisation | 2 | 5 | Reference wins with 8 theme options. This is cosmetic, not a release blocker. |
| Compatibility friction | 5 | 2 | v2 requires no macros/add-ins; reference requires Windows Excel 365 Desktop + macros. Google Sheets remains unclaimed in v2. |
| Hidden-time / scope protection | 5 | 2 | v2 prices meetings/admin/PM/revisions/other hidden time and has Scope Guard. |
| Fee-aware economics | 5 | 1 | v2 grosses up target/walk-away prices for user-entered variable + fixed payment/platform fees. |
| Budget + negotiation intelligence | 5 | 1 | v2 supports FIT/NEGOTIATE/WALK AWAY, budget-supported hours and scope-for-price tradeoffs. |
| Quote-to-actual learning | 5 | 1 | v2 logs actual core/hidden time, fees, net collection and effective rate. |
| Historical calibration | 5 | 1 | v2 suggests capped multipliers only after minimum sample size and labels confidence. |
| Model health / help | 5 | 4 | v2 includes SYSTEM CHECK, HELP CENTER and DECISION CENTER. |

Internal capability total: v2 = 56/60; premium reference = 36/60. This is not evidence that v2 will outsell the reference.

## Material advantages required by pre-build gate

PASS. v2 has more than three material advantages:
1. explicit hidden-time and scope-creep economics;
2. fee-aware walk-away and target pricing;
3. budget-to-scope negotiation math;
4. quote-vs-actual performance loop;
5. confidence-gated historical calibration;
6. traceable benchmark sources + custom current evidence + FX conversion;
7. built-in model health and consolidated GO / REVIEW / STOP decision layer;
8. no VBA/macros or paid dependencies.

## Known trade-offs / non-blocking weaknesses

- Google Sheets compatibility is deliberately NOT claimed because it has not been separately validated.
- Client PDF export is manual from the client-facing sheet / guide rather than macro-driven one-click export.
- v2 does not provide 8 workbook colour themes; the audit judges this as cosmetic rather than economic value.
- Built-in market reference ranges can age. v2 mitigates this by keeping URLs/check dates visible and providing a custom evidence log.
- Benchmarks are broad context and must not be marketed as guaranteed market prices.

## Transversal QA

PASS:
- baseline SYSTEM CHECK: PASS;
- baseline DECISION CENTER: GO;
- baseline Negotiation Lab: NO PRESSURE;
- FX conversion test: PASS;
- custom market evidence path: PASS;
- client budget WALK AWAY / NEGOTIATE / FIT states: PASS;
- requested discount below floor: WALK AWAY;
- three-project calibration threshold: confidence changes and advisory path calculates;
- buyer data restored clean after QA;
- final formula scan: 0 matches for #REF!, #DIV/0!, #VALUE!, #NAME?, #N/A.

## Release conclusion

DP-FREELANCE-001 v2 passes the premium capability gate and transversal QA as a RELEASE CANDIDATE. Do not claim "best on Etsy" or guaranteed superiority in sales. Permitted positioning: a premium pricing intelligence system with a broader decision workflow than common rate calculators, supported by a transparent feature comparison.

Next commercial gate: rebuild Etsy listing assets around v2 and launch at USD 20 once Etsy/Payoneer onboarding permits publication. After paid-market proof, test USD 27 rather than assuming the higher price is automatically accepted.
