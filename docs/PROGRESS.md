# Migration project — progress log

## 2026-07-03 — Analysis session (complete)

### Done
- **Full migration analysis written and finalized:** [nextjs-migration-analysis.md](nextjs-migration-analysis.md). Contains site audit, 5 approaches compared, chosen approach, target architecture, resolved decisions, 8-phase implementation plan (Phases 0–7) with per-phase tests/exit criteria, verification strategy (Vitest + Playwright visual regression vs. live-site baselines + Lighthouse CI), risks, repo layout.
- **Approach C chosen (David, 2026-07-03):** rebuild presentation layer in Next.js; migrate blog (335) + revista (118) into **Contentful** (existing infra); ~8 Elementor pages rebuilt as code. WP → neutral JSON → Contentful import. Approach B (content in-repo) is the documented fallback.
- **Scope narrowed (David, 2026-07-03):**
  - **Donations (GiveWP) dropped entirely** — no `/donations/*`, no donor dashboard, no donor accounts.
  - **Contact form** → hosting platform native forms (Vercel Forms / Netlify Forms), no custom backend.
  - **No PDF embedder** — revista PDFs are plain download/view links.
  - **Elementor pages are truly static** (won't change during migration) — copy lives in code for day 1; markdown/Contentful-editable is an optional later enhancement.
- **Live-site reconnaissance completed** (sitemaps, REST API, plugin footprint) — all findings baked into §2 of the analysis:
  - 8 in-scope Elementor pages; 335 Gutenberg blog posts (REST-exposed, clean HTML, `/blog/YYYY-MM/slug/`); 118 revista editions in `keydesign-portfolio` CPT (**not** REST-exposed — needs mu-plugin filter or WP-CLI); CF7; Yoast; no GraphQL. (8 GiveWP forms exist but are out of scope.)
- **`/revistavamos/` investigation resolved** (user flagged pages "missing from sitemap"):
  - Editions are the 118 `/la-revista/<slug>/` items — already in the sitemap; nothing lost.
  - The Ediciones carousel is AJAX-only (`admin-ajax.php`, `action=postcs_getdata`, plugin `post-types-carousel-slider`, 16/page) → HTML scraping would miss all editions; REST/CPT export is mandatory.
  - `/revistavamos/<slug>/` 301-redirects to `/la-revista/<slug>/` → ~118 alias redirects must be reproduced (Phase 5).
  - `/revistavamos/<year>/` returning 200 is WP pagination fallback, not real pages — do not replicate.

### Phase status
| Phase | Status |
|---|---|
| Analysis & plan | ✅ Done |
| 0 — Inventory, baselines, WP export tooling | ⬜ Not started (next) |
| 1 — Scaffold, design system, layout | ⬜ |
| 2 — Homepage (port existing POC) | ⬜ (POC already built in this repo, now under `poc/`) |
| 3 — Static pages (~8, code-first) | ⬜ |
| 4 — Contentful setup + blog | ⬜ |
| 5 — La Revista | ⬜ |
| 6 — Forms & search | ⬜ |
| 7 — SEO parity, hardening & cutover | ⬜ |

### Decisions 2026-07-03 (later same day, David)
- **Deploy target: Vercel.** Vercel has **no native forms product** → **contact form = Next.js route handler + Resend** (decided).
- **Donations: all references removed** — no donate CTAs anywhere; legacy `/donations/*` 301 → homepage.
- **Archives: keep both** tag (28) and author (2) archive pages.
- **Contentful = the existing shared space used by mi-movilicemos (`~/websites/poc/mi-movilicemos`)** (see [contentful.md](contentful.md), copied from that project). It already has `BlogPost` (body = **RichText**, not markdown) and `Revista` types with VAMOS-PDF-derived content from an earlier import → reuse + **additively extend** those types; slug-keyed upsert, update-in-place, pre-import collision diff report. **Conflict policy refined 2026-07-04 with real data — see below.**
- **Next.js app lives at this repo's root**; the static homepage POC moved to `poc/` (launch config `sim-home` updated with `--directory poc`, still port 8137). Repo is now `git init`-ed (no commits yet).

### Remaining small choices (none block Phases 0–3; settle at Phase 4 start; details in analysis §5)
1. **Body format** — convert WP HTML → RichText to share one body field with mi-movilicemos (recommended) vs. parallel markdown field.
2. **Contentful environment rollout** — sandbox dry-run, then how the migration lands in mi-movilicemos's live environment + how mi-movilicemos is regression-checked.

### Sister-project reconnaissance (2026-07-03)
- **sim-blog** (`~/websites/learn/sim-blog`): Next.js 16, React 19, Tailwind v4, `output: "export"` → GitHub Pages at `historias.misionessim.org`. Same design tokens and font setup — Tailwind `@theme` with `--color-brand: #c91430` etc., `next/font` Raleway + Work Sans. No Contentful, no tests. misionessim-new will cross-link to it at launch. Token names to copy verbatim from its `globals.css`.
- **mi-movilicemos** (`~/websites/poc/mi-movilicemos`): Next.js 16.1.4, React 19, TypeScript, Vercel, **same Contentful space**. Uses `graphql-request` + GraphQL (env vars: `CONTENTFUL_SPACE_ID`, `CONTENTFUL_ACCESS_TOKEN`). Has Jest unit tests + Playwright e2e (Desktop Chrome only — no visual regression, no mobile). Has **Resend** (`^6.12.2`) already wired. Patterns to copy: GraphQL client files (`src/lib/contentful/*.ts`), Contentful types (`src/types/contentful.types.ts`), MSW mock approach (`E2E_MOCK_CONTENTFUL`), `next.config.ts` (`trailingSlash: true`, `images.ctfassets.net` remote pattern).
- Key divergence: misionessim-new adds **visual regression at 3 viewports** (mobile 375×812, tablet 768×1024, desktop 1440×900) — neither sister project has this. That's the core of the per-phase verification loop.
- `.env.example` updated with confirmed var names + Resend + revalidate secret.

Also: make the initial git commit (repo is init-ed but has no commits yet).

---

## 2026-07-04 — Phase 0 implementation + Contentful quality audit

### Done
- **Next.js scaffold committed to the repo root** (Next.js 16, React 19, TypeScript, App Router, Tailwind v4). `next.config.ts` (`trailingSlash`, `reactStrictMode`, `images.remotePatterns` for `images.ctfassets.net`/`img.youtube.com`), `app/globals.css` with the exact sim-blog `@theme` tokens, `app/layout.tsx` with Raleway/Work Sans via `next/font`. Verified rendering correctly in the preview (computed `color: rgb(10, 1, 23)` = `#0a0117`, Raleway applied). Removed create-next-app boilerplate (demo page, unused SVGs). Added `next-app` launch config (port 3000).
- **`scripts/build-url-inventory.ts`** — crawls the live Yoast sitemaps, classifies every URL by type/disposition, generates the 118 `/revistavamos/<slug>` alias entries (not in any sitemap). Output: `data/url-inventory.json` (664 URLs). Caught and fixed a real bug: 3 GiveWP utility pages (`/donation-confirmation/`, `/donation-failed/`, `/donor-dashboard/`) don't live under `/donations/` and were initially misclassified as pages-to-rebuild instead of dropped.
- **Corrected a counting error inherited from the original analysis**: sitemap `<url>` totals (336 posts, 119 revista) counted the `/blog/` and `/la-revista/` index pages as content. True counts, confirmed via WP REST `x-wp-total` header: **335 posts, 118 revista items**. Fixed throughout both docs.
- **`tests/unit/`** (Vitest) — classifier unit tests (14 tests) + a manifest-completeness test asserting the generated inventory matches expected counts.
- **`scripts/capture-baselines.ts`** + **`playwright.config.ts`** — captures live-site screenshots (above-fold + full-page) at the 3 confirmed viewports (375×812 / 768×1024 / 1440×900) for a date-spread sample: home, all 8 static pages, both section indexes, 5 blog posts, 3 revista items. Output in `reference/baselines/` (73MB, committed directly to git per explicit decision — revisit before Phase 7's full ~455-route sweep if repo size becomes a problem). Playwright config also has `visual-mobile/tablet/desktop` projects wired for Phase 1+ regression testing against these baselines, plus an `e2e` project.
- **`scripts/mirror-site.sh`** (wget) — full HTML/asset mirror to `reference/mirror/` (gitignored, reproducible on demand), excludes PDFs (handled separately by the media-manifest step), keeps donation pages (no other backup, useful for the Phase 6 CTA-removal sweep). Kicked off in background; large, expect it to take a while.
- **Contentful GraphQL quality audit** (see analysis §2.5 for full detail) — before writing any import code, queried the live shared space directly and compared against WP field-by-field on a 4-post sample. Findings: Contentful has 215/335 WP posts already (64%) but the overlap is stale (drops to 0% for 2025–26); WP text has a systemic mojibake bug that Contentful's matching entries don't have; WP images looked far higher resolution in the sample. **Decision (David): per-field policy** — WP wins on body text (mojibake-cleaned) for all 335 posts; images and Contentful's `revista` back-references handled per the full-data run below (the sample's "WP always wins on images" turned out to be incomplete — see next entry).
- **Corrected a misattribution**: earlier docs said the space's existing VAMOS content came from the `import-vamos` skill. Verified that's wrong — `import-vamos` writes to **sim-blog's filesystem** (`public/misionessim/*.{json,md}`, ~590 files), a completely separate destination. The Contentful content came from an earlier, different import pipeline. Fixed throughout both docs.
- **Committed** (`de7eb53`): Next.js scaffold + Phase 0 verification tooling above.
- **`scripts/export-wp.ts`** — full WP → neutral markdown export, built and run against the live site. All 335 posts exported to `export/posts/<slug>.md` (YAML frontmatter: wpId, slug, title, dates, legacyUrl, excerpt, categories, tags, author + authorId, featuredImage, seoTitle/seoDescription/canonical from Yoast) + markdown body via turndown. 324/335 featured images downloaded to `export/media/blog/` (11 posts genuinely have no featured image in WP) with a `manifest-blog.json` integrity/failure report. Total footprint: 24MB.
  - Caught and fixed **two real bugs** during a post-export quality check: (1) `seoDescription`/`seoTitle` weren't going through the mojibake cleanup (only body/title/excerpt were) — fixed. (2) `stripHtml` only stripped tags, not HTML entities, so WP's `&hellip;` excerpt-truncation marker leaked into ~320/335 files as literal text — added a proper entity decoder (named + numeric + hex entities). Re-ran after fixing; verified zero residual mojibake and zero undecoded entities across all 335 files.
  - Author name resolved via `yoast_head_json.author` (a public field) rather than the `/wp-json/wp/v2/users` endpoint, which returns 401 on this site (locked down) — worth remembering for any future WP metadata work.
  - 8 new unit tests added covering the mojibake map and entity decoder against real corrupted samples pulled from the live site.
- **Committed + pushed** (`c779214`): export pipeline above. Remote `origin` = `github.com/davidjeyachandran/misionessimNext.git`.
- **`scripts/diff-cms-collisions.ts`** (read-only) — Phase 4 prep. Reads all 335 `export/posts/*.md`, batch-queries Contentful for slug matches, computes a per-post `imageVerdict` (real `width×height` area comparison, not the earlier blanket assumption), flags whether a `revista` back-reference exists to preserve, and flags suspiciously large body-length mismatches for manual review. Output: `export/collision-diff.json`.
  - **Full-data run corrected the §2.5 sample's "WP always wins on images" conclusion.** Real breakdown across all 215 matches: `wp-higher-res` 187, `wp-has-cf-missing` 115, **`cf-higher-res` 22** (Contentful's image is genuinely bigger — e.g. `dios-llama-y-la-iglesia-envia`: WP 1280×774 vs. Contentful 5887×3776), `wp-missing-cf-has` 6, `neither` 5. **Policy corrected**: image selection is per-post resolution comparison, not a blanket source — `imageVerdict` drives Phase 4's actual import. Analysis §2.5/§4 updated.
  - 120 new posts (no Contentful match), 215 updates, all 215 with a `revista` link to preserve — confirms the sample audit's percentages exactly.
  - 2 suspicious body-length mismatches flagged (>5x ratio) — both inspected and confirmed benign: same title/slug, Contentful's version is just a shorter excerpt of the same article, not an unrelated slug collision.
- `scripts/import-cms.ts` (the actual Management API write) **not yet built** — deliberately held: it's the one script in this pipeline that writes to the shared production Contentful space, and deserves its own careful review/sandbox-dry-run pass rather than being rushed in alongside the read-only tooling.

### Next session: continue Phase 4
1. Build `scripts/import-cms.ts`, consuming `export/collision-diff.json` + `export/posts/*.md`. Idempotent upsert, per-post `imageVerdict`-driven image choice, preserve existing `revista` links. **Dry-run against a sandbox Contentful environment first** (§5 remaining choice #2) — do not point at the live/production environment without an explicit go-ahead.
2. Revista CPT (`keydesign-portfolio`) still needs the mu-plugin REST-exposure filter — requires David's WP admin action, not yet done.
3. `reference/mirror/` (wget) was still running as of this session's end — check it completed cleanly (gitignored, no commit action needed either way).

### Key context for future sessions
- Homepage POC (verified near pixel-perfect) is in `poc/`; serve via launch.json config "sim-home" (port 8137). Design tokens: primary `#C91430`, secondary `#002F49`, text `#0A0117`, nav `#696F8C`; Raleway + Work Sans; fixed white 71px header; 95vh hero; 3 parallax sections; YouTube `zx8x6J7vPNI`.
- Next.js dev server: launch config `next-app`, port 3000.
- Memory file `misionessim-homepage-poc.md` (auto-memory) holds the same facts and points here — needs a refresh after this session (Contentful per-field policy, corrected counts, corrected import-vamos attribution).
