# SIGMANOUVA BINARY INGEST PLAN v1

Status: ACTIVE
Date: 2026-09-05

The operational logo family has exact SHA-256 identities recorded in `SIGMANOUVA_LOGO_FAMILY_MANIFEST_v1.json`.

GitHub's text contents action cannot safely serialize binary JPEG bytes. The repository therefore uses the Git data/blob path for binary commits. Binary ingest must preserve the recorded bytes exactly; no recompression during upload is permitted.

Priority order:

1. `core.jpg` — required by the deterministic content renderer.
2. `avatar-symbol.jpg` — social profile identity.
3. `horizontal.jpg` — Facebook/LinkedIn headers.
4. `instagram-profile.jpg`.
5. `instagram-content.jpg`.
6. `hero.jpg`.

A binary is considered ingested only when:

- repository path exists;
- downloaded bytes hash to the manifest SHA-256;
- HEAD records the gate promotion.

Until then, `SIGMANOUVA_OPERATIONAL_BINARY_INGEST` remains pending or partial.
