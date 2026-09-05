# SIGMA PRELAUNCH RUNBOOK v1

Status: APPROVED_SPEC
Date: 2026-09-05
Authority: MEDIA_ENGINE_WORKLOG_v1.1_GROWTH_PATCH

## Objective

Move SIGMA from prepared content to controlled public validation without accidental rebranding, broken assets, unmeasured publishing or irreversible dependency on a platform.

## Hard gates before first public SIGMA cohort post

All must be PASS:

1. `SIGMA_CANONICAL_LOGO_IDENTITY`
2. `SIGMA_VISUAL_TEMPLATE_SPEC`
3. `COHORT_001_SIGMA_TEXT_QA`
4. `VISUAL_TEMPLATE_RENDERING`
5. `VISUAL_RENDER_QA`
6. profile conversion copy ready
7. profile visual assets ready
8. measurement schema ready
9. publication manifest ready
10. explicit HEAD promotion from `PUBLIC_SIGMA_REBRAND=NOT_AUTHORIZED`

Trademark/legal clearance is a separate business-risk gate before costly or irreversible brand investment. It is not silently converted to PASS by publishing experiments.

## Preflight per asset

- publication ID matches manifest;
- knowledge ID matches master;
- final text equals approved copy or has rerun QA;
- all material numbers independently recalculated;
- source label is correct;
- canonical logo identity is used;
- no unverified @handle baked into artwork;
- mobile crop and safe margins pass;
- subtitle/caption synchronization passes where applicable;
- no paid-product CTA dominates discovery content;
- no sigma-male/alpha-beta/grindset framing.

## Profile preflight

Before sending meaningful discovery traffic to a profile:

- display name communicates SIGMA;
- bio communicates recurring benefit;
- canonical avatar/logo treatment is used;
- PIN-01 promise asset is visible where supported;
- PIN-02 proof-of-value asset is visible where supported;
- PIN-03 utility asset is visible where supported;
- owned link resolves correctly;
- existing Herramientas Rentables commercial UTMs are preserved when reused;
- no platform has a conflicting or misleading brand description.

## Publication sequence

1. Prepare Day 1 assets and metadata.
2. Run final preflight.
3. Publish only after explicit authorization state exists.
4. Confirm the platform returns/visibly shows the post.
5. Record final URL and timestamp.
6. Capture 24h metrics.
7. Capture 72h metrics.
8. Trigger fast-follow analysis if a primary metric materially exceeds baseline.
9. Continue cohort unless a stop condition is reached.
10. Capture 7d metrics and close cohort learning report.

## Stop conditions

Pause new scheduled releases if any occurs:

- material factual error;
- wrong or corrupted logo/brand asset;
- repeated publication duplication;
- account/security anomaly;
- platform warning related to content or automation;
- rendered text clipping that changes meaning;
- source/claim mismatch;
- automation performs an action outside the manifest.

Do not stop the entire research system for a low-severity aesthetic issue; fix the affected asset and continue after QA.

## Incident protocol

1. assign `INC-xxxx`;
2. record platform, publication ID, timestamp and evidence;
3. classify severity;
4. stop only the affected action scope unless safety requires wider pause;
5. correct source/master/render as necessary;
6. rerun affected QA;
7. record resolution and prevention rule;
8. never silently rewrite historical metrics.

## Rollback / reversibility

- keep every master and rendered version immutable once published;
- corrections create a new version rather than overwriting evidence;
- keep social profile copy in repository before changing it publicly;
- keep all scheduling metadata outside platform-only storage;
- maintain owned copies of captions and assets;
- automation credentials/configuration must remain replaceable and vendor-independent where practical.

## Automation promotion rule

Initial publishing may be manually triggered or supervised even if scheduling software is used.

`AUTONOMOUS_PUBLISHING` can move to PASS only after:

- closed QA fully passes;
- successful controlled posts prove the publishing path;
- duplicate-prevention and confirmation logging exist;
- failure/retry behavior is tested;
- no unexpected cost is activated;
- HEAD explicitly promotes the gate.

## Cohort close

A cohort is not complete when the seventh post publishes. It closes only after:

- 7-day measurement window is recorded where available;
- winners and losers are identified relative to platform baselines;
- content-tree candidates are registered;
- experiment limitations are documented;
- next cohort changes are preregistered;
- lessons are materialized in GitHub.

## Gate

SIGMA_PRELAUNCH_RUNBOOK = PASS
PUBLICATION = NOT_AUTHORIZED
AUTONOMOUS_PUBLISHING = NOT_AUTHORIZED
