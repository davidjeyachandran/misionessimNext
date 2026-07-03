#!/usr/bin/env bash
# Phase 0 — wget mirror of the live site into reference/mirror/.
# Gitignored (reference/mirror/) — this is a reproducible artifact, not
# source of truth. Independent of Playwright: pins the raw HTML/assets so
# baselines stay verifiable even if the live site changes or goes down.
#
# Re-runnable: `yarn mirror:site`. Rerun before Phase 7 content freeze for a
# final snapshot.
set -euo pipefail

SITE="https://misionessim.org"
OUT_DIR="reference/mirror"

mkdir -p "$OUT_DIR"

wget \
  --mirror \
  --page-requisites \
  --adjust-extension \
  --convert-links \
  --no-parent \
  --directory-prefix="$OUT_DIR" \
  --no-host-directories \
  --wait=0.5 \
  --random-wait \
  --user-agent="misionessim-migration-bot/1.0" \
  --reject "*.pdf" \
  "$SITE" || true
  # PDFs excluded: 118 magazine issues at several MB each would balloon this
  # mirror by hundreds of MB-GB for no visual-regression value. Revista PDF
  # assets are fetched separately by the media-manifest step in export-wp.ts
  # (Phase 0/5), which tracks them with integrity checks for the CMS import.
  # Donation pages are NOT excluded — they have no other backup and may be
  # useful reference for the Phase 6 donation-CTA removal sweep.
  # `|| true`: wget exits non-zero on any individual 404/redirect even when
  # the overall mirror succeeds (e.g. plugin-asset 404s); Phase 0 review is
  # manual, so we don't fail the script on that.

echo "Mirror written to $OUT_DIR"
