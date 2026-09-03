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
- **Credential exposure incident:** while checking for Contentful write access, ran `contentful login --token-only`, which printed a live Contentful Management token directly into the session transcript. **David should rotate that token as a precaution.** Turned out irrelevant anyway — it's scoped to an unrelated space ("MissionsInterlink", `ra0r88kvhzmj`), not mi-movilicemos's space (`i46buyptg48q`). Confirmed we have no Management API write access to the right space yet.
- **`scripts/lib/markdown-to-richtext.ts`** — hand-rolled markdown → Contentful RichText converter, deliberately scoped to exactly what's in the corpus (surveyed all 335 bodies first): paragraphs, headings h1–h4, bold/italic, links, bullet/ordered lists, blockquotes, inline images (13, converted to hyperlinks — asset-embedding needs the image already uploaded, which happens at live-import time). 41 unit tests.
  - Caught and fixed **two more real bugs** via corpus validation before trusting it: (1) turndown inserts blank lines between list items with long/multi-sentence content, which the naive blank-line block-splitter treated as separate 1-item lists — fixed by merging adjacent same-type list blocks. (2) turndown backslash-escapes list markers (`12\.`, `\-`) in some cases (113 + 7 occurrences in the corpus) to avoid markdown re-parsing ambiguity — the regexes didn't tolerate the escape, silently dropping those items to the paragraph fallback. Both fixed and verified against all 335 real bodies (0 errors).
- **`scripts/import-cms.ts`** — built with two modes: dry-run (default, runs now, computes the full plan and writes `export/import-plan.json`, zero API calls) and `--live --environment=<id>` (writes via the Contentful Management SDK's plain client — correct method signatures verified against the SDK's type definitions and a full `tsc --noEmit` pass, but **UNTESTED against real Contentful**, since we don't have Management API credentials for the right space). Safety rails on the live path: requires `CONTENTFUL_MANAGEMENT_TOKEN`, requires explicit `--environment` (no default), refuses to target `master` without `--force`.
  - Dry-run executed successfully: 120 create, 215 update, 302 images to upload from WP, 28 kept from Contentful, 5 with none, 215 revista links preserved (all numbers cross-check against `diff-cms-collisions.ts`'s output).
  - Spot-checked the plan for `un-ministerio-sin-igual`: correctly targets its known Contentful entry ID, keeps Contentful's existing image (WP has none for this post), preserves the `/trabajo-en-la-selva` revista link, and the body starts with the correctly mojibake-cleaned quote.

- **Committed** (`268f3cf`): markdown-to-RichText converter + dry-run import-cms.ts above.
- **Got `CONTENTFUL_MANAGEMENT_TOKEN`** (David) and exercised the live write path for real for the first time.
- **Second credential incident**: `contentful login --token-only` (checking pre-existing CLI auth) printed a Management token for an unrelated space directly into the transcript. Irrelevant token, but flagging again — same class of mistake as the first incident, worth remembering not to use `--token-only` or similar secret-printing flags at all.
- **Environment discovery**: the space has 3 environments — `main` (real), `master` (an **alias pointing at `main`** — same production data, not a separate environment), and `development` (created 2024-06-11). Confirmed `development` is **not a clean mirror** of production: 792 vs. 791 blogPosts, at least one known entry (`un-ministerio-sin-igual`) missing entirely. Our CDA token is scoped only to `master` (GraphQL 400s with `UNKNOWN_ENVIRONMENT` on any other environment) — so `development`'s content had to be read via the Management API instead.
  - **Fixed a real safety gap**: `import-cms.ts`'s original guard only blocked the literal string `"master"`. Since `master` is an alias for `main`, someone could accidentally target `main` and hit production anyway. Now blocks both.
  - Extended `scripts/diff-cms-collisions.ts` with `--environment=<id>`: switches from GraphQL/master to the Management API for that environment, resolving `heroImage` (Asset link) and `revista` (Entry link) references manually since Management API returns unresolved links, not GraphQL's auto-resolved shape. Output: `export/collision-diff.<id>.json`.
  - Extended `import-cms.ts` to read the environment-specific collision-diff file when `--environment` is passed — critical, since environments have genuinely different content and entry IDs don't line up between them.
  - Against `development`: only **22/335** slug matches (vs. master's 215) — confirms it's a materially different dataset, not a recent branch.
- **First live write attempt failed correctly** (single-post test, no partial writes): `422 UnknownField — "excerpt"`. The real `blogPost` schema (checked via Management API, not assumed) has `title`/`slug`/`publishDate` required, plus **`heroImage` required** and **`revista` required** — neither is optional as the plan assumed. No `excerpt`/`categories`/`author`/`seoTitle`/`seoDescription` fields exist; there's a required `description` field instead (excerpt-equivalent).
  - **Decision (David): make `revista` and `heroImage` optional** via schema migration (not a placeholder Revista entry, not a separate content type for standalone posts). Non-breaking — relaxes a constraint, doesn't touch existing data or mi-movilicemos's queries.
  - Added `cms/migrations/` (`contentful-migration` package, used via its JS API directly — not the `contentful` CLI binary, to avoid a repeat of the credential-exposure incident). Two migrations written and **run successfully against `development`**: `001-relax-blogpost-required-fields.js` (revista/heroImage → optional) and `002-add-blogpost-seo-and-taxonomy-fields.js` (adds categories/author/seoTitle/seoDescription as new optional fields). `scripts/run-migration.ts` — same master/main safety rail as import-cms.ts.
  - Note: migration files must be plain CommonJS (`module.exports = function`), not TypeScript `export default` — contentful-migration's loader `require()`s the file directly and doesn't unwrap ESM's default-export interop. Cost one failed run to discover.
  - Fixed `import-cms.ts`'s field mapping: WP's `excerpt` → Contentful's `description` (not a same-named field).
- **Live write path now fully validated** — every code path tested individually against `development` and verified field-by-field via direct Management API reads (not just "no error thrown"): create+image, update+image+revista-preserved (validated the list-merge and escaped-marker fixes from earlier in this session against real Contentful data — the imported entry has exactly the expected 12 list items), create+no-image, update+kept-Contentful-image (confirmed the existing higher-res Contentful image, 2368×4208, was correctly left untouched, not overwritten by WP's smaller one). ~20 posts written and verified this way.
- Regenerated the `development` collision-diff after test-writing (792→808 blogPost entries) so a subsequent full-batch run won't try to duplicate-create the already-written test posts — confirmed clean (297 create + 38 update = 335).
- **Full 335-post batch NOT yet run** — explicitly held pending confirmation. Everything is ready (`yarn import:cms --live --environment=development`, no flags) whenever it's greenlit.
- **Confirmed `development` is safe to leave as-is post-testing** (David: "no one uses it") — the ~20 test posts stay there, no cleanup needed.
- **Found and fixed a real data-quality bug** (David, reviewing a `development` entry directly in the Contentful web UI): a leftover Drupal Media module embed token (`[[{"fid":"3200","view_mode":"default",...,"type":"media",...}]]`) sitting as literal visible garbage text in one post's body — misionessim.org was migrated off Drupal at some point and this token never got cleaned up. The referenced Drupal file (`fid: 3200`) is unrecoverable (no access to that site's file table). Scoped it properly before fixing: scanned all 335 exported bodies for this and related patterns (`[caption]`, `/node/NNN`, etc.) — only **1 post** affected (`10-devocionales-en-youversion-sobre-trabajo-y-fe`).
  - Root-caused the quote encoding: **not** the `\x93`/`\x94` mojibake pattern from earlier — this one uses HTML numeric entities (`&#8220;`/`&#8221;`), a different Google-Docs-paste artifact (same `white-space: pre-wrap` signature as other posts). Entities only decode to real characters during turndown's HTML→Markdown conversion, so the stripper (`stripDrupalMediaTokens` in `export-wp.ts`) has to run **after** turndown, not before — and has to tolerate turndown's backslash-escaping of `[`/`]`, including inside the payload itself (`field_file_image_alt_text\[und\]`). Took two iterations to get the regex right, verified against the actual live-site raw HTML both times, not guessed.
  - **Also fixed a latent bug found while testing this**: `export-wp.ts` and `build-url-inventory.ts` ran their full `main()` unconditionally at module load — meaning importing either for their exported utility functions (as the test files do) risked triggering a live network run as a side effect. Added an entry-point guard (`process.argv[1] === fileURLToPath(import.meta.url)`) to both.
  - Re-ran the export (335/335 clean, 0 residual matches for the pattern), regenerated both `collision-diff.json` and `collision-diff.development.json`, and live-patched the one already-written `development` entry — verified directly via the Management API that the corrected body no longer contains `fid`/`view_mode`.
  - 4 new unit tests added, including one using the exact real corrupted sample (in its actual post-turndown escaped form).

### Full development batch — completed 2026-07-04
- **Full 335-post batch ran cleanly against `development`** (297 creates + 38 updates + 321 image uploads, 0 errors). ~10 min total.
- **Discovered and fixed a new blocker mid-run** (post 25/335): the `blogPost.tags` field had an allowed-values validation (`["general","javascript","static-sites"]`) left over from the mi-movilicemos schema setup. All 28 misionessim.org tag values fail it. Added migration `003-relax-tags-validation.js` to remove the constraint, ran it against `development`, then re-ran the full batch — clean.
- **Drupal-token fix confirmed landed**: `10-devocionales-en-youversion-sobre-trabajo-y-fe.md` has no `fid`/`view_mode` in the exported markdown; the post was written to Contentful `development` with the corrected body during the full batch (one of the 38 updates). Verified by grep on the markdown file.
- All 3 migrations have been run against `development`; **none have been run against `master`/`main` yet**.

### Production import — completed 2026-07-04
- Ran all 3 migrations against `master` (001: relax required fields, 002: add SEO/taxonomy fields, 003: relax tags validation). All successful.
- Regenerated `collision-diff.main.json` via Management API (CDA GraphQL doesn't support non-master environments). Numbers matched exactly: 120 new, 215 update, 215 revista links preserved, same image verdicts.
- **Full 335-post production batch ran cleanly** (`--live --environment=main --force`, 0 errors):
  - 120 new posts created
  - 215 existing posts updated (WP wins on body/metadata; per-post image resolution comparison applied)
  - 302 featured images uploaded from WP; 28 existing Contentful images kept (higher-res)
  - All 215 revista back-references preserved
- **Phase 4 (CMS import) complete.** All 335 misionessim.org blog posts are in Contentful production.

### Phase 5 started — blog frontend + dedup (2026-07-04)
- Built `lib/contentful.ts` (fetch-based GraphQL client) + `/blog/` index and `/blog/[date]/[slug]/` post pages (rich-text via `@contentful/rich-text-react-renderer`). Verified in preview.
- **Duplicate content decision (David): show all posts, de-duplicated.** The shared space has 911 blogPost entries = 335 WP-import + 576 VAMOS-PDF-pipeline. 34 articles were duplicated (36 surplus rows) because the two pipelines made different slugs for the same article (e.g. `abuelas-a-distancia` vs `abuelas-distancia`). Our import created ZERO new dupes — all were pre-existing pairs we updated on the WP-slug side.
  - Display-layer dedup in `lib/contentful.ts`: group by normalized title, keep richest entry (heroImage > revista > body length > WP tiebreak). Site shows 874 unique articles.
  - **CMS cleanup via `scripts/archive-duplicate-posts.ts`**: archived (not deleted — reversible) all 36 loser rows in two passes. First pass: 33 safe (31 no revista link, 2 same-issue). Second pass (`--include-cross-issue`): the 3 cross-issue dupes (`el-alivio-de-moises-un-equipo`, `mariposas-fuertes`, `superando-los-desafios`) — David confirmed OK since **mi-movilicemos is paused/not-live and MisionesSIM is the priority**. CDA blogPost total: 911 → 875 (= distinct-title count). Zero duplicates remain in the CMS.
  - **Follow-up (later, per David)**: a script to strip archived blogPosts from Revista collections. Note: the reverse-link check (`links_to_entry`) found 0 Revista entries referencing any archived loser, so `Revista.blogPostsCollection` is a reverse lookup and archived posts likely drop out automatically — may be a no-op.
  - The display-layer dedup in `lib/contentful.ts` is now redundant with the CMS clean but kept as a safety net against future re-imports reintroducing dupes.
- **Known content bug** (background task): numbered headings render `1\. Title` — turndown backslash-escape leaked into the stored RichText; needs `markdown-to-richtext.ts` fix + targeted re-import.

### Blog archives — done (2026-07-04)
- **Category + tag archive pages** built (`/blog/category/[category]/`, `/blog/tag/[tag]/`) with `generateStaticParams`, `generateMetadata`, pagination, slug-based URLs (`slugify` in `lib/contentful.ts` maps display name ↔ clean slug). Shared `PostGrid` component; index refactored onto it. Verified in preview (Contextualización: 17; #misiones: 7).
- **Author archives DROPPED** (David's call): WP import only has account names (admin ×324, SIM Latinoamérica ×11), not real bylines. Removed the route, bylines, and author queries. NOTE: `author` was also never written to Contentful during import (read into the plan but omitted from the written fields in `import-cms.ts`) — moot now, but relevant if author bylines are ever wanted. Legacy `/blog/author/` URLs → 301 in Phase 7.

### Homepage port — done (2026-07-04)
- Ported `poc/index.html`+css+js into the Next app. `app/home.css` holds the adapted POC styles (fonts via next/font, Tailwind preflight as reset, homepage base typography scoped under `.sim-home`). Global `SiteHeader`/`SiteFooter` in `layout.tsx`; blog mains get `.page-offset` (71px) for the fixed header. `ScrollEffects` (parallax + reveal) and `VideoPromo` (YouTube lightbox) as client components. Homepage blog strip pulls latest 3 posts live from Contentful.
- Nav: Blog internal; unbuilt pages (Nosotros/Recursos/Revista/Ora/Servir) point at the live site as placeholders until later phases.
- Verified desktop + mobile (nav toggle) via computed-style inspection; hero screenshot pixel-matches POC. NOTE: the preview screenshot tool goes blank after programmatic scroll on this page — use `preview_inspect`/`elementFromPoint` to verify lower sections, not screenshots.

### Content-fidelity audit — inline images & embeds missing (2026-07-04)
Triggered by a real report: inline images missing on `vivir-entre-los-fulani-el-viaje-de-alegria-de-christine` (hero renders, body images don't). Root-caused and audited the **whole 335-post corpus against the live WP REST API** (`/wp-json/wp/v2/posts`, authoritative source — the export markdown can't reveal turndown-dropped content). **No code changed** — findings recorded for a future re-import (David: migrate to Contentful, re-import required, audit first, then stop).

**What the import lost (turndown + `markdown-to-richtext.ts` are lossy):**
1. **Inline images — 12 `<img>` across 6 posts.** Stored in RichText as `hyperlink` nodes (link text "imagen") pointing at `misionessim.org/wp-content/...`, so they render as text links, not images. There are **zero `embedded-asset` nodes** in any WP-imported post; `body.links.assets.block` is empty everywhere. Affected posts:
   - `alemania-una-puerta-abierta-para-profesionales-estudiantes-y-jovenes-con-llamado-misionero` (×1)
   - `olas-del-llamado-de-dios` (×1)
   - `un-oasis-de-esperanza-para-los-ninos-fulani` (×2)
   - `vivir-entre-los-fulani-el-viaje-de-alegria-de-christine` (×2)
   - `la-buena-noticia-se-extiende-de-un-fulani-a-toda-una-aldea-fulani` (×1)
   - `el-caracter-se-pone-a-prueba-en-prisma` (×5 — a `wp-block-gallery`)
2. **YouTube video embed — SILENTLY DROPPED (1 post).** `la-mision-es-en-equipo-10-razones-para-unirte-a-una-agencia-misionera` has a `wp-block-embed`/`<iframe>` YouTube video. Turndown's default rules drop `<iframe>` entirely (no text content) → no trace in the export markdown or Contentful. The only fully-invisible loss.
3. **Table — flattened (1 post).** `la-seleccion-de-un-equipo` has a `<table>`; turndown has no table rule, so structure is lost (cells concatenated as text).
4. **PDF links — 4 posts** (`luz-en-medio-de-la-oscuridad`, `4-verdades-alentadoras-para-aquellos-con-enfermedades-mentales`, `por-que-debemos-conocer-la-cultura-y-su-cosmovision`, `como-aprender-una-nueva-cultura`) link to `.pdf` files on `wp-content`. Survive as hyperlinks (functionally OK) but are WP-hosted → break if WP is decommissioned.

*Clean:* no audio/video `<video>` tags, no `[gallery]`/`[caption]` shortcodes, no code blocks, no h5/h6, no nested lists in the corpus (consistent with `markdown-to-richtext.ts`'s survey header).

**Root causes (three layers):**
- `scripts/lib/markdown-to-richtext.ts:42-44` — inline images intentionally emitted as hyperlinks; the promised "embed as Contentful asset at live-import time" was never implemented.
- `scripts/export-wp.ts:28-32,232` — turndown runs with **default rules only** (no `addRule`/plugin for `<iframe>`/embed/`<table>`), so embeds are dropped and tables flattened.
- `app/blog/[date]/[slug]/page.tsx:79-95` — the `BLOCKS.EMBEDDED_ASSET` renderer reads the **CDA/SDK shape** (`node.data.target.fields.file.url`), which never matches the **GraphQL** shape; and `lib/contentful.ts:306` fetches `body { json }` without `links`. So even if assets were embedded, they wouldn't render. Both need fixing as part of the migration.

**Migration TODO (deferred — do NOT run without David):**
- `import-cms.ts`: for each inline-image URL in the body, download → `asset.createFromFiles` → `processForAllLocales` → `publish` → replace the `hyperlink` node with an `embedded-asset-block` node referencing the new asset. Reuse the hero-image upload path already at `import-cms.ts:215-230`. Include the 5-image gallery post.
- `export-wp.ts`: add turndown handling for `<iframe>`/`wp-block-embed` (YouTube) and `<table>` so they're preserved, not dropped/flattened. Decide target representation.
- Decide PDF hosting: re-host the 4 PDFs to Contentful assets or keep WP links.
- `page.tsx` + `lib/contentful.ts`: query `body { json links { assets { block { sys { id } url title description width height } } } }` and rewrite `EMBEDDED_ASSET` to resolve an id→asset map from `links.assets.block`. Assets land on `images.ctfassets.net` (already in `next.config.ts` `remotePatterns`).
- Re-run the import for the affected posts (targeted, like the heading-backslash fix).

### SEO hardening — done (2026-07-04)
- `lib/site.ts` SITE_URL; `metadataBase` + canonical/OG defaults in `layout.tsx`.
- `app/sitemap.ts` (940 URLs: home, /blog/, all 874 posts, category + tag archives — revista deferred); `app/robots.ts`.
- Canonical tags on blog index / post (canonicalised to the post's own publishDate segment) / category / tag; `og:type article` on posts.
- `next.config.ts` redirects: 11 donation URLs → `/`, 2 dropped author archives → `/blog/`. The 118 `/revistavamos/<slug>/` → `/la-revista/<slug>/` aliases are HELD until revista routes exist (avoid 301-into-404). Verified all in preview.

### Deferred by David (2026-07-04)
- **Contact form** — out of scope for now.
- ~5 missing revista editions — import at the very end (`export-revista.ts` still unbuilt; needs the WP mu-plugin).

### 2026-07-05 — backslash fix, donations removed, Revista VAMOS routes
- **Heading backslash defect FIXED end-to-end**: `unescapeMarkdown()` in `markdown-to-richtext.ts` (turndown escapes prose punctuation; strip in `textNode`). Re-imported the 66 affected posts to `main`; CDA-verified 0 posts still contain escapes. Two collateral hardenings: image-resolution *tie* now keeps the CF asset (was `>=` → would duplicate every asset on re-run), and the diff/import now mark+skip WP slugs whose Contentful entry is **archived** (31 of 335 — the dedup losers; updating 400s, recreating resurrects dupes).
- **Donations (David): no donation paths at all** — the 11 redirect rules removed; legacy `/donations/*` plain-404s.
- **Revista VAMOS built at `/revistavamos/`** (David: canonical route, inverted vs. legacy `/la-revista/`): index of all 110 editions + detail pages (cover, edition date, PDF plain link, edition's articles as PostCards). 118 legacy `/la-revista/*` URLs 301 across. Sitemap now 1051 URLs. Header/footer/homepage links internal.
  - **Data quirks handled app-side (Contentful untouched — shared with mi-movilicemos)**: ~104/110 stored revista slugs have a leading `/`; two distinct "La Oración" editions (2010/2014) share the identical stored slug. URLs normalized; collisions get a year suffix (`la-oracion` = 2014, `la-oracion-2010`); lookups go by entry id.

### Static pages — done (2026-07-05)
- Built `/nosotros/` (pillars, 10 service areas, partner logos, history timeline, FAQ via native `<details>`, fe teaser), `/declaracion-de-fe-de-sim/`, `/ora/` (monthly motives shipped in code — Contentful candidate later), `/recursos/`, `/sirve-con-sim/` (contact = mailto + WhatsApp; form deferred). Copy + 29 images extracted from the wget mirror. All nav/footer/homepage links now internal — zero placeholder links to the legacy site remain. Sitemap: 1056 URLs.
- **`/terms-and-conditions/` deliberately NOT rebuilt** — the legacy page is KeyDesign theme demo boilerplate (English, "WordPress themes and related services"), not SIM content. It 404s; David can add a real terms page later if wanted.
- **Fixed a 500 on 2 revista pages** (predicted by David's "clean archived posts from Revista collections" note): editions whose `blogPosts` arrays still link the archived duplicate rows. `gql()` now tolerates `UNRESOLVABLE_LINK` (nulls filtered by callers); all 110 edition pages crawl-verified 200. **Data-side cleanup script for those stale links still worth doing** (removes the noise, not just tolerates it).

### Deep 10-post fidelity audit → full re-import plan (2026-07-05)
Follow-up to the 2026-07-04 content-fidelity audit (missing inline images). Compared 10 posts word-by-word (live WP REST vs local render) and quantified every defect class across all 335 markdown bodies. Text fidelity excellent (ratios 0.98–1.0); found 6 NEW issues beyond the known ones: underscore italics render literally (23 posts — converter never parsed turndown's `_em_`), links inside bold leak as literal markdown (3), emphasis inside link text leaks (2), residual `\*` escapes still live in Contentful (only the 66 heading posts were re-imported), descriptions are auto-excerpts ending in `[…]` rendered as a duplicative lead paragraph (320/335), and internal absolute links open in new tabs (12 posts; 2 `/la-revista/` body links 404 pending the missing revista editions; 1 link broken at source). **Full plan in [reimport-plan.md](reimport-plan.md)** — fix export (iframe/table rules), converter (escape-aware recursive inline parser, tables), import (inline images + PDFs → real assets, internal-link rewrite, excerpt cleanup), renderer (GraphQL asset links, tables, YouTube embed, internal links), then fresh export + full re-import to main (needs David's go).

### 2026-07-11 — Full visual gap analysis vs live site → implementation plan
- Screenshotted every main page on both sites at 3 viewports: live already in `reference/baselines/`, local now in `reference/local/` (same naming; `yarn capture:local`, new `scripts/capture-local.ts`). Added a live baseline for `la-revista__lucha-espiritual`.
- **Findings + Haiku-implementable plan in [gap-analysis.md](gap-analysis.md)**. Headlines: footer wrong color/missing 4th column + "Sirve · Ora · Da"; blog dates off-by-one (no `timeZone: "UTC"` in 2 call sites); homepage `.about-title` renders navy because `.sim-home :is(h1,h2,h3)` out-specifies it; inner pages lack the live red-gradient photo hero; revista index lacks "Nueva edición"/Suscríbete/testimonial; revista detail cover too small + title should be brand red.
- **Decisions (David)**: shared PageHero on 5 pages; NO blog sidebar (category pill row instead); revista index gets all three live extras (Suscríbete → VerticalResponse `https://oi.vresp.com?fid=669a6c7963` as plain link; testimonial static, no slider); NO share buttons; revista = cover image → PDF (never the flipbook).
- **Now user-visible data gap**: editions Nº 117 "Lucha espiritual" + Nº 118 "El clamor macedonio" missing from Contentful — `/revistavamos/lucha-espiritual/` hard-errors under `output: export` (part of the known "~5 missing editions" TODO).
- Note: full-page screenshots mislead — local lazy-load placeholders + live scroll-reveal blanks are capture artifacts, not bugs.

### Next: Phase 6/7 remaining
- Search (Phase 6).
- Visual regression pass vs. `reference/baselines/`; Lighthouse; `next build` production check.
- Contentful revalidation webhook (`CONTENTFUL_REVALIDATE_SECRET` env var reserved).
- Import the ~5 missing revista editions (end of project).
- Cleanup script: strip archived blogPost links from Revista.blogPosts arrays.
- Cutover: DNS, Vercel deploy, redirect verification against `data/url-inventory.json`.

### Key context for future sessions
- Homepage POC (verified near pixel-perfect) is in `poc/`; serve via launch.json config "sim-home" (port 8137). Design tokens: primary `#C91430`, secondary `#002F49`, text `#0A0117`, nav `#696F8C`; Raleway + Work Sans; fixed white 71px header; 95vh hero; 3 parallax sections; YouTube `zx8x6J7vPNI`.
- Next.js dev server: launch config `next-app`, port 3000.
- Memory file `misionessim-homepage-poc.md` (auto-memory) holds the same facts and points here — needs a refresh after this session (Contentful per-field policy, corrected counts, corrected import-vamos attribution).

## 2026-07-12 — Legacy blog URL redirects (Vercel)

- **WP↔Contentful blog gap audit**: all 335 live WP posts exist in Contentful
  (875 published blogPosts). 31 WP URLs have no published entry under the exact
  WP slug: 27 are dedup losers (article published under the Drupal/VAMOS-era
  slug, WP-slug duplicate archived), 4 are slug variants (truncated
  `a-dios-le-importa-…-de-mi`, `puedo-tener-novio-a-…`, and the corrupt
  `" 2020-01/Siempre-será-un-desafío "` slug with spaces/accents/embedded date).
- **Deployment target corrected: Vercel, not Cloudflare Pages.** Created
  `vercel.json` (35 redirect rules, `trailingSlash: true`): the author-archive
  and `/la-revista/*` rules migrated from `public/_redirects` (file deleted),
  plus 301s for all 31 legacy WP blog URLs → their canonical `/blog/<YYYY-MM>/<slug>/`
  route (mapping computed by replicating `getCanonicalEntries()` dedup; all 29
  article targets verified present in `out/`). `next.config.ts` comments updated.
- **Fallbacks**: `/blog/2020-01/siempre-sera-un-desafio/` and `…-2/` redirect to
  `/blog/` — their only Contentful entry is the corrupt-slug one, whose generated
  page (`out/blog/2020-01/ 2020-01%2FSiempre-será-un-desafío /`) is unreachable.
  **TODO (needs David's go — production shared space): repair that entry's slug
  via CMA to `siempre-sera-un-desafio`, then point both redirects at it.**
- Comments on WP (32 approved): David decided 2026-07-12 they are dropped — no
  schema field, no migration.

## 2026-08-10 — Homepage hero updated to match live redesign

- Live site (`misionessim.org`) redesigned its hero since the pixel-match noted
  above (line 138): new photo (`2026/08/DisenosWeb-SIM-9-2.png`, classroom
  scene) and new headline (`¡Se parte de lo que Dios está haciendo en el
  mundo!`, Raleway 800 59px/60px, tracking -2.7px, was 700/57px). Ported both
  into `public/home/banner-sim-home-2026.webp` (1600×900, recompressed to
  WebP q82, 124KB — 31KB lighter than the asset it replaces) and
  `app/page.tsx`/`app/home.css`.
- The hero no longer pixel-matches `poc/` — the POC is a frozen snapshot of
  the pre-redesign live site and was intentionally left untouched.
- Two deliberate divergences from current live, both David's call:
  1. **Left-aligned**, not centered — live centers the headline; we kept the
     existing left-aligned 546px column.
  2. **Mobile wrapping fixed.** Live hides the heading's `<br>`s and keeps the
     box 742px wide via `margin-right:-100%`, so text runs off-screen on
     phones. We let it wrap naturally instead — and the existing 546px
     `max-width` reproduces live's desktop line breaks as a side effect, so no
     hard `<br>` was needed at any breakpoint.

### Parallax load-jump fixed (`ScrollEffects.tsx` + `home.css`)

- **Bug (David spotted it, also present on the live site):** the hero image
  visibly jerked/zoomed on every reload. `sizeParallax()` wrote inline
  `height`/`marginTop` onto `.parallax-bg` and an already-nonzero `transform`
  on mount, so the layer jumped from what the static HTML painted to the JS
  geometry. Measured at 1280×720: **126px vertical shift + 20% rescale.**
- **Fix:** the layer's slack now lives in CSS (`--parallax-slack: 24px`, applied
  as negative `top`/`bottom` on `.parallax-bg[data-parallax]`), and JS writes
  *only* `transform`, anchored so it is exactly `0` at `scrollY 0`. The first
  frame the script paints is byte-identical to the server-rendered one.
- Drift rate is unchanged — algebraically the old jarallax expression reduces
  to `(1 - speed) * (vh + h) * Δprogress`, so the motion still matches
  ElementsKit at speed 0.8; only the anchor moved. Verified: transform is 0 at
  load, 150px of drift retained, and the layer still fully covers the hero at
  every scroll position (worst case 10px of slack to spare).
- 24px of slack is the rounded-up bound: the largest upward excursion while any
  part of the hero is on screen is `0.2 × --header-h` ≈ 14.2px, independent of
  viewport height and hero height, so the constant holds at all breakpoints.

## 2026-08-10 — nosotros/recursos hero images synced to live redesign

- Same live-site redesign as the homepage hero (above) also replaced the
  `/nosotros/` and `/recursos/` hero photos. Pulled the new sources straight
  from production (`2026/08/DisenosWeb-SIM-10.png` and `…-SIM-12.png`),
  center-cropped to the existing 1600×918 `PageHero` convention, and
  re-encoded WebP q82 (matching the homepage banner's recipe):
  `public/heroes/nosotros.webp` (65.7KB → 128.8KB) and
  `public/heroes/recursos.webp` (58.6KB → 56.1KB).
- `/ora/` was also checked — live's hero (`2025/03/banner-ora.jpg`) is
  unchanged from what `public/heroes/ora.webp` already has, so no update was
  needed there.
- Image-only swap: `PageHero.tsx` and all three route files were left
  untouched (existing `title`/`intro`/`alt` copy still matches the new
  photos).

## 2026-08-16 — /nosotros/ feedback round (Cruzamos barreras, logos, icon color)

David reviewed the Vercel preview against live and flagged three items on
`/nosotros/`. All three land in `app/nosotros/page.tsx` (plus one line in
`app/globals.css`).

- **"Cruzamos barreras" rebuilt to match live.** The rebuild had rendered the
  four pillars as full-width alternating text/image rows; live has a single
  two-column section — the "Nadie debe vivir y morir…" quote plus the
  "Impulsados por el gran amor de Dios…" paragraph on the left, and a 2×2
  **staggered** grid of image tiles on the right (left tile column sits ~50px
  lower). Each tile shows its title over a gradient scrim with the description
  revealed on hover, per live's ElementsKit `image-hover-effect` widget.
  The quote moved out of "Lo que nos mueve" into this section, as on live.
  Image mapping is unchanged: `foto-cruzamos`/`foto-nosotros3`/`foto-discipulos`/
  `card1` on live = our `nosotros-cruzamos`/`-equipo`/`-discipulos`/`-facilitamos`.
- **Organization logo strip removed.** Not a rebuild bug in the usual sense —
  the container exists in live's HTML (`elementor-element-d3d82ac`, with the
  strapline "Trabajamos a través de alianzas estratégicas…") but carries
  `elementor-hidden-desktop elementor-hidden-tablet elementor-hidden-mobile`,
  so it renders at *no* breakpoint. It was picked up from the markup during the
  Phase 3 rebuild. Section and `PARTNERS` const deleted. **The five JPGs
  (`public/pages/logo-{fedemec,provision,mies,comibam,famgua}.jpg`, ~134KB) were
  deliberately kept** on David's call, in case the logos come back — they are
  now unreferenced.
- **Áreas de servicio icons recolored to brand red.** `ico-cora/flor/msg.png`
  are *cream* artwork drawn for live's dark-red testimonial cards; our version
  keeps a white card on the navy band, where they were all but invisible. A CSS
  `filter` can't reach `#c91430` from cream, so the `<Image>` became a
  `bg-brand` `<span>` with the PNG as a `mask-image`. Layout/grid untouched —
  David explicitly wanted our grid kept over live's 3-up slider.

### Touch fallback + the responsive bug it exposed
- Live's hover-only description is unreachable on phones (no pointer). Added
  `@custom-variant touch (@media (hover: none))` to `globals.css` — the inverse
  of Tailwind's `hover:`, which is itself already gated behind
  `@media (hover: hover)` — and the tiles use `touch:max-h-40 touch:opacity-100`
  to show the description outright where hover doesn't exist.
- **Gotcha:** a new `@custom-variant` is not picked up by a already-running
  `next dev`; the utility is silently absent from the generated CSS until the
  server restarts. Touching the file is not enough. Verified the syntax
  independently with `npx @tailwindcss/cli@4.3.2 -i app/globals.css` before
  concluding it was a staleness problem rather than a code one.
- Enabling the fallback surfaced a **real layout bug**: at 375px the tiles were
  160×140 and the caption block overflowed the tile completely (title bottom
  measured 48px *above* the tile's top edge, clipped away by `overflow-hidden`).
  Two fixes: the caption is now `absolute inset-0 flex flex-col justify-end`
  rather than `bottom-0`, so it can never grow past the top; and the tile grid
  is 1-up below `sm` with the text/tiles split moved from `md` to **`lg`** —
  at 768 a two-up tile inside a half-width column is ~160px, far too narrow.
- Verified no clipping at 375 / 768 / 1024 / 1440 by measuring, per tile,
  `p.scrollHeight` (transition-independent) against the space left after
  padding and title. Tightest case is 1024 (needs 96px, has 99px).

## 2026-08-16 — /nosotros/ "Conoce nuestra historia" as live's horizontal timeline

Feedback: the historia section looked "muy diferente al actual" — our rebuild was
a vertical rail list, but live renders an **ElementsKit horizontal timeline**
(widget `be53595` in `reference/mirror/nosotros/index.html`). Rebuilt to match,
with one requested behavior change: live reveals cards on *hover* (jQuery toggles
a `.hover` class); ours is **click-driven** per the feedback.

- New client component `app/nosotros/HistoryTimeline.tsx` (`useState` active
  index). Desktop (lg+): 4 columns — year, continuous hairline (per-column
  segments joined via `-mx-3` against the column's `px-3`), 14px pin (solid
  brand; active = white fill + 2px brand ring), title below the bar (hidden
  with `opacity-0` on the active column, as live does — the card repeats it),
  and the active column's cream card below with an up-caret at the pin.
  Inactive panels stay in the DOM at `h-0 invisible` so the reveal can
  transition; buttons carry `aria-expanded`/`aria-controls`, so the switch is
  keyboard-accessible for free.
- Below lg: every entry renders expanded (year, bar+pin, caret, card),
  `sm:grid-cols-2`, matching live's tablet/mobile fallback exactly — live only
  has the per-column reveal at desktop widths.
- Card styling taken from `reference/baselines/nosotros/tablet.full-page.png`:
  the **desktop full-page baseline is truncated** right after the áreas slider
  (4933px capture ends there), so the tablet capture is the ground truth for
  this section. Card `#FEF1D5` (cream token), brand-red rounded-square icon
  with a cream flag glyph (inline SVG standing in for ElementsKit `icon-flag1`),
  navy title, muted body.
- Deliberate deviation: default active item is **1893** (chronological start).
  Live's server-rendered default is 1902 — an arbitrary editor leftover.
- `page.tsx` historia section: heading centered (live is `text_center`),
  container widened `max-w-4xl` → `max-w-6xl` for the 4-across row; `HISTORY`
  data unchanged, `<ol>` rail removed.
- Verified: eslint/tsc clean (only pre-existing `tests/e2e` errors);
  aria-expanded flips and exactly one panel has height on click (measured in
  the browser); Playwright screenshots at 1440 (default + after clicking
  "2000"), 768, and 375 — no horizontal overflow at any width. NB the Browser
  pane renders blank screenshots when scrolled below the fold (same symptom
  that blocked browsing live last round — it's the pane, not the site);
  DOM queries still work, and Playwright covers the visual proof.

## 2026-08-16 — /nosotros/ "Áreas de servicios" aligned to live

Our rebuild had this as a navy band with a 3-column grid of 10 white cards.
Live (widget `4a8a4ef` in `reference/mirror/nosotros/index.html`) is an
**ElementsKit testimonial slider** — `ekit_testimonial_style_5` /
`block-style-two` — on the same cream band the pillars sit on, with dark-red
cards. Rebuilt to match; ground truth is the mirror's element CSS plus
`reference/baselines/nosotros/tablet.full-page.png` (the desktop baseline is
truncated right at this slider).

- New client component `app/nosotros/AreasSlider.tsx`: a scroll-snap track
  (no Swiper) whose scroll position drives the dots. Slides per view and
  spacing copied from live's swiper config — 3 @ 1024+ / 2 @ 768 / 1 below,
  gap 15px / 10px / 10px — via `basis-[calc((100%-30px)/3)]` etc., with the
  DOM measured (`slide[1].offsetLeft - slide[0].offsetLeft`) so those classes
  stay the single source of truth for scroll steps and dot count.
  `clientWidth/step` is one gap short of the visible count, hence `Math.round`.
- Card = live's element CSS verbatim: `#900201` (brand-dark), 24px padding,
  15px `#FFF` body, 17px `#FEF1D5` (cream) title, 60px icon. `block-style-two`
  is `column-reverse`, so icon + title sit **above** the body copy. Cards are
  `h-full` in a flex row instead of live's 220px min-height on the body — same
  uniform-height result without a magic number.
- Icons are now per-area (live's order is cora, flor, msg, flor, cora, msg,
  flor, cora, msg, flor — not a clean 3-cycle, which is what our `i % 3` was
  doing). They're used as plain images again: the PNGs are cream artwork drawn
  for exactly these dark-red cards, so the brand-red mask hack the white cards
  needed is gone.
- Section: `bg-navy` → `bg-cream` (live's `#FFEFD2`; continuous with the
  pillars band above), heading centered, title navy — all as live.
- Deliberate deviations: (1) live floats 15px arrow circles at `left:-6%` /
  `right:-6%`; ours sit beside the dots, which can't overlap a card or
  overflow at any width. (2) live's eyebrow here is teal `#167E92` — as are
  *all* four eyebrows on live's /nosotros/ — while our whole page uses brand
  red. Left red for internal consistency; switching the page to teal is a
  separate call.
- Verified with Playwright at 1440 / 768 / 375: per-view 3/2/1, gaps 15/10/10,
  dots 8/9/10 (= slides − perView + 1), arrows disable at both ends, the last
  dot lands exactly on `scrollWidth - clientWidth`, card heights equal within
  a view, `docOverflow` 0 everywhere, no page errors. NB the Browser pane
  produces no animation frames, so `behavior:"smooth"` never advances and
  `scroll` events never fire there — measure this component in Playwright, not
  the pane. `goTo` also sets the page state directly so the dots answer a
  click immediately rather than waiting on the scroll to settle.

## 2026-08-18 — Legacy URL coverage: /wp-content/uploads/ + revista slug drift

- **Verified `docs/routes.txt`** (187 URLs with real traffic on the WordPress
  site) against `out/` + `vercel.json`. Before this session: 108 resolved
  directly, 36 via an existing rule, **43 hard 404s**. Now **185/187**.
- **`scripts/build-legacy-redirects.ts`** (`yarn build:legacy-redirects`) turns
  the Phase 7b inventory (`data/media-redirect-map.json`) into 321 rules. Every
  destination is a first-party URL — a raw `assets.ctfassets.net` link is never
  what the visitor sees:
  - magazine PDFs → `/revistavamos/<slug>/`, the edition page (cover, intro,
    working PDF link, link equity stays on the domain);
  - the other 132 migrated documents → `/recursos/<filename>`, proxied to the
    Contentful asset by a companion rewrite (same trick as the revista PDFs).
    All 132 targets HEAD-checked 200.
- **`data/legacy-revista-aliases.json`** — frozen snapshot of the WordPress
  `/la-revista/` URL space, captured 2026-08-18 by crawling the live site
  before it is decommissioned. 15 legacy slugs drifted in the CMS and were
  301ing into a 404 through the `/la-revista/:path*` wildcard.
- **Three legacy slugs pointed at the WRONG edition**, silently: WP's
  `la-oracion` is the 2010 issue (the new site's bare slug is 2014),
  `plantacion-de-iglesias` is 2011 (new site: 2018), and `fondos-y-misiones`
  is 2010-10 (new site: 2010-09 "Misión Integral", whose WP slug was
  `mision-integral`). Aliased under `/la-revista/` only — mirroring them under
  `/revistavamos/` would hijack a live canonical URL. Note this contradicts the
  comment in `lib/contentful.ts` (`normalizeRevistaSlug`) claiming the legacy
  site only exposed the newer of two same-slug editions; it exposed both, the
  older under the bare slug.
- `/portfolio-category/*` and `/portfolio/*` (the WP "serving opportunities"
  post type) → `/sirve-con-sim/`.
- **`build-revista-pdf-rewrites.ts` no longer clobbers foreign rewrites** — it
  reassigned `config.rewrites` wholesale, so a re-run would have deleted the
  132 `/recursos/**` rules. Now it replaces only `/revistavamos/**`. Its
  docstring also claimed marker keys it never implemented; corrected.
- Budget: 358 redirects (Vercel limit 2,048) + 251 rewrites. No duplicate
  sources, no redirect chains, every destination resolves.
- **Still 404 (2 with traffic, 15 total)** — the files exist on WordPress but
  were never migrated, so there is nothing to point at:
  `fortalezas_y_debilidades_de_las_misiones_iberoamericanas.pdf` and
  `trabajando_tu_llamado_a_las_naciones_-_completo.pdf` (both trafficked), plus
  `persecucionvamosmayo14.pdf` (the 2014-05 VAMOS edition is absent from
  Contentful), `13leccionessobremisiones.pdf`, `engnewsmar14.pdf` and six more
  `/2025/04/` study documents. **Fix = upload them to Contentful, then re-run
  `yarn build:media-map && yarn build:legacy-redirects`.**
- The two ORA campaign PDFs (`GuiadeOracion-ORA1002-SIM_compressed-1.pdf`,
  `CampanaORA1002-SIMLatinoamerica-2026.pdf`) are also unresolved. `/ora/` now
  ships `public/ora/ora-1002.pdf` locally — needs David to say which legacy
  PDF that is before either can be pointed at it.

## 2026-08-19 — Content seam hardening, slice 1

- Added a single-context domain glossary and engineering-skill configuration:
  `CONTEXT.md`, `docs/adr/`, and `docs/agents/`. Project work state remains in
  this progress log.
- Extracted the pure **published Blog catalogue** policy from `lib/contentful.ts`
  into `lib/content/blog-catalogue.ts`. It now has an isolated fixture test for
  title-equivalent articles: listings keep the richer public record rather than
  rendering duplicate cards.
- Extracted the pure **published Revista catalogue** slug policy into
  `lib/content/revista-catalogue.ts`. Its test verifies that a stored-slug
  collision is sorted by edition date before paths are assigned, so the newest
  edition keeps the canonical base path independent of GraphQL ordering.
- Moved Contentful GraphQL transport, retry/backoff, configuration validation,
  and partial `UNRESOLVABLE_LINK` handling to `lib/contentful/client.ts`.
  `lib/contentful.ts` remains the route-facing compatibility module; no public
  path or query was intentionally changed.
- Added `lib/publishing/paths.ts` as the shared first-party Revista PDF-path
  policy. Both the runtime module and `build-revista-pdf-rewrites.ts` now use
  it, alongside the shared Revista collision policy, eliminating the two
  derivations that previously had to remain manually synchronized.
- Verification: `yarn test:unit` passes (**67 tests**) and `yarn lint` has no
  errors (11 pre-existing warnings outside this work). `npx tsc --noEmit`
  remains blocked only by existing Playwright image-locator typings in three
  e2e specs; the new modules add no TypeScript errors.

## 2026-08-20 — Legacy magazine PDF URLs open the PDF, not the edition page

- **Bug:** `/wp-content/uploads/2024/11/evangelismovamosago16.pdf` 301'd to
  `/revistavamos/evangelismo-eficaz/` — a PDF URL landing on an HTML page.
  Anyone who shared or bookmarked the file (or clicked a "download the issue"
  link) got the page and had to hunt for the download.
- **Fix** in `scripts/build-legacy-redirects.ts`: magazine PDFs now redirect to
  the edition's first-party PDF path, e.g.
  `/revistavamos/evangelismo-eficaz/2016-08-EvangelismoVAMOS.pdf`, which the
  existing `/revistavamos/**.pdf` rewrite proxies to Contentful. The slug stays
  in the path, so link equity still lands on the edition.
- The asset filename is only known to `build-revista-pdf-rewrites.ts`, so the
  script reads it back from the `/revistavamos/**.pdf` rewrites already in
  `vercel.json` — **run `yarn build:revista-rewrites` before
  `yarn build:legacy-redirects`** when an edition is added. An edition with no
  PDF rewrite falls back to the edition page and is listed in the run output.
- Applies to all **156** magazine redirects (118 distinct PDFs), including the
  15 `pdfToSlug` aliases. None needed the fallback.
- Verified: every PDF destination has a matching rewrite, no duplicate sources
  and no redirect chains in `vercel.json`; all 118 destinations HEAD-check
  `200 application/pdf` on the deployed site. Budget unchanged at 358
  redirects + 251 rewrites.

## 2026-08-22 — Audiorevista VAMOS band on the Revista index

- Ported live's **Audiorevista VAMOS** band (live:
  `.elementor-element-0ab7303`) to the bottom of `/revistavamos/`. It closes
  every paginated page, as it does on live: centred navy heading, the line
  "Ahora también puedes escuchar toda la Revista VAMOS desde cualquier lugar",
  and three Spotify episode players (Soy Influencer p.1, Tecnología en
  misiones p.1, Latinos en adaptación p.1) in live's order.
- The player markup is now one component, `app/_components/SpotifyEpisodes.tsx`,
  shared with the `/recursos` podcast band, which previously hand-rolled the
  same iframe. Both bands lay out one/two/three across at 375/768/1024.
- Live bugs deliberately **not** copied:
  - Its heading and each card fade in via an ElementsKit animation that starts
    them at `visibility: hidden`, so the whole band renders blank when that
    script doesn't run — reproducible today by loading the live page with JS
    disabled. Nothing here needs JS to be visible (covered by a test).
  - The embeds carry no `title`, so a screen reader announces three unlabelled
    frames. Each player is now named after its episode.
  - Dropped the `?utm_source=generator` on every embed, the deprecated
    `frameBorder`, and the white-on-white card with its `shape-6.svg`
    background, which is covered on desktop and `background-size: 0` below
    768px — never visible at any width.
- Performance: the players stay `loading="lazy"`, so the three third-party
  iframes are not fetched until the reader nears the bottom of the index; the
  band adds no JavaScript and no render-blocking work of its own.
- Verified: `tests/e2e/revista-audiorevista.spec.ts` (4 tests) and the existing
  `recursos-podcast.spec.ts` (3) pass; `yarn lint` clean; `npx tsc --noEmit`
  adds no new errors (the 6 remaining are the pre-existing Playwright image
  typings in `revista-cards.spec.ts`). Screenshotted at 375/768/1440.

- **Testimonios de lectores** now runs full-bleed. It was a tinted card inside
  the index's `max-w-6xl` column (`-mx-4` only cancelled the gutter), where live
  paints the band across the whole window. Moved out of the column into its own
  `<section>` with the content re-centred inside, and switched the one-off
  `#eef0f8` to the site's `lavender` token — `#eaebf8`, live's exact shade.

## 2026-08-22 — VAMOS Nº 118 imported: 26 posts from the issue PDF

- **26 `blogPost` entries created and published on `master`** from the Nº 118
  PDF ("El clamor macedonio", June 2026), all linked to the existing
  `el-clamor-macedonio` edition (`209B68PvjZddgXDI5KNbG3`), whose
  `blogPosts` list went 3 → 29. Every post has a hero image and every hero
  asset is published — verified after the run.
- **New pipeline in `scripts/vamos/`** (README there). Deliberately *not*
  sim-blog's vision-based `import-vamos-pdf.mjs`: VAMOS PDFs are InDesign
  exports with a real text layer, so `pdftotext -bbox-layout` yields every
  text frame with correct reading order and per-word geometry. Body text is
  verbatim, no model involved. Hero images are the original embedded
  JPEG/PNG assets pulled via `pdftohtml`, not page-render crops, so there is
  no text bleed or re-compression.
- **An editorial Word export is not needed for future issues.** One was
  supplied for Nº 118 and proved near-redundant: the PDF gave 100% of the
  body text, the page-3 TOC gave 6 of the 7 headlines that are set as
  outlined vector art, and the Word file was itself missing five articles
  (Sudán del Sur, Mozambique, Chad, Guía de estaciones de oración, Ruta de
  formación misionera).
- **Duplicate edition found and left alone.** Two `revista` entries exist for
  this magazine: `el-clamor-macedonio` (published 2026-07-11, the canonical
  one — cover, intro, PDF, now 29 posts) and `llamado-macedonico`
  (`4RYziknCCJzMJw3DaZ5mlh`, draft, uploaded 2026-08-22, no cover/intro/posts,
  byte-identical PDF re-uploaded). David: keep `el-clamor-macedonio`
  unchanged. **The draft is an orphan and should be deleted.** Note
  `yarn import:revistas` skips only on slug `el-clamor-macedonio`, so running
  it now would create a *third* entry — don't.
- **Not imported, deliberately:** 3 articles already published by hand from
  this issue; `¿Buscas dónde Dios te puede usar?` (cross-issue republish —
  same slug ran in 2022 under a different edition, and `lib/contentful.ts`
  de-duplicates by title so a copy would be invisible); 3 articles whose
  pages carry no photograph at all (p27–28 are pure typography) given the
  every-post-needs-a-hero rule; and 11 items under the 150-word floor.
  `Ocho países, nueve idiomas, un solo llamado` was rescued by assigning it
  the issue cover (`COVER_HERO` in `build-plan.mjs`).
- **Two defects caught in review before writing**, both worth knowing if this
  is reused: (1) page furniture — masthead, footer strap, social handles —
  was being appended to whichever article shared its page, and the first fix
  was too broad, dropping three whole articles that merely cited a URL;
  (2) centred text defeated the paragraph-indent heuristic, turning every
  line into its own paragraph. Both are fixed in `extract.mjs`/`images.mjs`.
- **Titles are the magazine headlines verbatim.** The three hand-published
  posts use a more descriptive, SEO-leaning style; that was not applied
  retroactively. Retitling is an in-place edit, no re-import needed.
- `export/vamos-118/` (20MB working set) is gitignored — regenerable from the
  issue PDF, and Contentful is the system of record now.

## 2026-08-22 — Six more VAMOS editions imported as drafts

Extends the Nº 118 import (previous entry) to the six most recent editions
that still lacked articles. **Everything created is unpublished** — David
asked for drafts so the extraction can be reviewed before it goes live.
Hero assets *are* published, because Contentful refuses to publish an entry
whose linked asset is still a draft, so leaving them would only move the
work to whoever presses publish.

| Edition | `--issue=` | Drafts created |
|---|---|---|
| Lucha espiritual · mar 2026 | `lucha-espiritual` | 29 |
| Envío responsable · dic 2025 | `envio-responsable` | 23 |
| Carácter misionero · sep 2025 | `caracter-misionero` | 24 |
| Discípulos que hacen discípulos · jun 2025 | `discipulos` | 29 |
| Cuidado Integral · mar 2025 | `cuidado-integral` | 25 |
| Latinos en adaptación · dic 2024 | `latinos-adaptacion` | 34 |

### The pipeline is now per-issue, and Nº 118 is the regression test

`scripts/vamos/` was hardcoded to Nº 118. Every step now takes
`--issue=<key>` and loads `issues/<key>.mjs`; `manifest.mjs` moved to
`issues/118.mjs` unchanged. Nº 118's whole chain was re-run after every
edit and still plans the same 27 posts with the same 26 heroes — that check
is worth repeating before any future change to the extractor.

### Three extractor defects, all found by reading output rather than counts

- **Two-column frames.** `pdftotext` emits some frames spanning both
  typeset columns, and it shreds the prose two ways at once: alternating
  lines, and single `<line>`s carrying both columns' words run together.
  `extract.mjs` now finds the gutter as a band no word crosses and deals the
  words into one frame per column. The gutters in these issues run as tight
  as **7pt**, so width alone cannot carry the decision — a column also has
  to hold ≥20% of the frame's words and ≥4 lines. Lucha espiritual p7 was
  the case that surfaced it.
- **Beheaded articles.** The short-frame furniture rule was dropping opening
  fragments (`"Como creyentes muy pocas veces"` / `"somos conscientes del
  mundo espiritual…"`), leaving articles that begin mid-sentence. Two
  exemptions in `images.mjs`: a frame that anchors an article is never
  furniture, and neither is one whose successor starts lowercase — a
  sentence carrying on cannot be a caption.
- **Pages the text layer cannot carry.** Worksheet grids and narrow label
  columns set inside the measure (Carácter misionero p9 is the clearest)
  interleave word by word and cannot be fixed generically. Named per issue
  in `skipPages` with the reason.

### Traps worth knowing

- **Cuidado Integral pages 25–45 are not that issue.** They are teaser
  excerpts from *earlier* editions — its own contents page says so and every
  such spread closes with "Lee la revista completa en". Importing them would
  file another edition's writing under this one. Skipped.
- **Envío responsable is a recruiting brochure**, not a magazine: course
  adverts, institutional panels and one-paragraph testimonies. The 150-word
  floor drops a large share of it, which is the rule working.
- **`live` must list the magazine headline, not the published title.** The
  editor retitles: «Vestida con la armadura cada día» ran as
  `luz-en-medio-de-la-oscuridad`, «La dependencia del Señor me moldea» as
  `moldeada-por-el-senor-lecciones-de-caracter-en-asia`. Matching on slug
  alone would have duplicated both.
- **«Consejos si NO quieres ser misionero»** (the one post already live from
  Envío responsable) does not appear in that PDF at all — the editor wrote
  it separately. Verified by grep before concluding it.
- **Run issues oldest first.** VAMOS reruns material between neighbouring
  editions — `listos-para-la-cancha` and
  `toda-la-vida-misionera-pone-a-prueba-nuestro-caracter` both ran in dic
  2024 and again in sep 2025. Oldest-first files a rerun under its first
  appearance; the importer skips the second by slug collision.

### For review before publishing

- **34 of 168 heroes are under 200px on a side**, including the editorial
  hero that recurs across four issues at 255×114. These are the embedded
  images at source resolution — the pipeline picks the best photo on the
  page, and on an editorial page the best photo is a small portrait. Worth
  replacing by hand before those posts go live.
- **Titles are the magazine headlines verbatim**, per the Nº 118 convention,
  not the more descriptive style of the hand-published posts.
- Two slugs collided with posts already live and were skipped:
  `senor-hazme-un-multiplicador`, `guiando-a-los-interesados`.

### Safety notes

- Drafts are appended to each `revista.blogPosts` and the edition is
  republished. That is safe: `getRevistaBySlug` in `lib/contentful.ts` drops
  links that do not resolve, so a draft stays invisible on the site until
  someone publishes it — and publishing a post then needs no second edit to
  the edition. No other field on any `revista` was touched.
- `.gitignore` now ignores `export/vamos-*/` rather than just
  `export/vamos-118/`. The judgement — the issue files — is committed.

## 2026-08-23 — Four more VAMOS editions imported as drafts

Extends the previous entry back four more editions. Everything created is
**unpublished**, as before.

| Edition | `--issue=` | Drafts created | Already live |
|---|---|---|---|
| La gente que no vemos · sep 2024 | `la-gente-que-no-vemos` | 35 | 0 |
| Conferencias misioneras · jun 2024 | `conferencias-misioneras` | 34 | 5 |
| Soy influencer · mar 2024 | `soy-influencer` | 20 | 24 |
| Regresando a casa · dic 2023 | `regresando-a-casa` | 22 | 17 |

Run oldest first, so the 5 cross-edition slug collisions were filed under
their first appearance and skipped here — 4 in Regresando a casa
(`ayuda-a-tu-misionero`, `ayudando-al-misionero-a-reintegrarse`,
`cual-es-el-problema-solo-esta-volviendo-a-casa`,
`planeando-el-regreso-a-casa`) and 1 in Soy influencer
(`circulos-de-influencia-de-las-familias-misionales`).

### Regresando a casa needed sign-off, and got it

Its `revista.blogPosts` array feeds the "Regresando a casa" learning route
in mi-movilicemos, and was deliberately left alone in July 2026 for that
reason. David approved extending it on 2026-08-23 before the import ran;
the array went 17 → 39.

### Two new per-issue knobs, both reading-order problems

- **`rowPages`.** Blocks were ordered whole-left-column-then-whole-right.
  That is right for parallel columns and wrong for the layout VAMOS uses
  constantly — a two-column article above a second, shorter one set in one
  column — where the spread's right half lands *inside* the item underneath.
  It cost «Los marginados e ignorados» (sep 2024 p5) 127 of its words, which
  turned up inside the testimony below it and dropped the article under the
  150-word floor. Nine pages across the four editions needed it. The symptom
  to look for is a word count far above what the page's frames hold.
- **`dropArticles`.** The per-frame counterpart of `skipPages`, for a page
  where only one frame is defeated by a narrow label column. Without an
  anchor that text is silently appended to the preceding article; with one
  it can be isolated and dropped.

### Three extractor fixes, all found by reading output

- **The bullet in these PDFs is U+0086**, a C1 control character from a
  symbol font — invisible everywhere downstream, so bulleted lists imported
  as run-together prose and an anchor written on a list's first item never
  matched. `extract.mjs` now maps it to `•` and strips the other C1s.
- **Numbered and bulleted list items were being eaten as furniture.** The
  short-frame rule is right about captions and wrong about list items, which
  are set one frame each. «Guía de oración» (sep 2024) lost all ten of its
  points that way. Nº 118 gains three interview questions from the fix.
- **A justified opening line can strand one or two words**, which the indent
  reflow then reads as its own paragraph («¡Qué» / «emocionantes son las
  conferencias misioneras!»), and `describe()` skipped past it, so the post
  opened mid-sentence. `build-plan.mjs` now rejoins them.

Nº 118 remains the regression test: its whole chain was re-run after every
edit and still plans the same 27 posts with the same 26 heroes — the only
diff is the three questions above.

### Traps worth knowing

- **`live` must list the magazine headline.** Soy influencer had 24 posts
  already live and Regresando a casa 17, so this edition pair is mostly a
  matching exercise. The reliable method is to read the live bodies out of
  Contentful and match their opening sentence against the text layer — the
  contents-page title is often not the published title, and sometimes not
  the page headline either («Retorno del misionero» ran as
  `sindrome-general-de-adaptacion-y-retorno-del-misionero`, «Commúnicate
  bien» as `como-te-fue`).
- **«Aprendiendo a convivir» is linked to Soy influencer but is not in that
  PDF** — verified by grep for Astrid Duarte and Chortí, its subjects. Same
  case as «Consejos si NO quieres ser misionero» in Envío responsable.
- **Black-and-white photographs score as greyscale furniture** and lose to
  whatever colour image is nearest, or to nothing. Two pages needed
  `heroOverride` for this: sep 2024 p29 (a duotone portrait) and mar 2024
  p21, an archive spread where *every* photo is black and white and the
  automatic pick fell through to a blank white panel.
- **Vector-art headlines still need a human eye.** Four titles in Soy
  influencer were not in the contents page and not in the text layer; they
  were read off page renders (`pdftoppm -png -r 55 -f N -l N`).

### For review before publishing

- Five posts take the issue cover as their hero (`coverHero`): they are
  sidebars set beside an article that owns the page's only photograph.
- Titles are the magazine headlines verbatim, per the Nº 118 convention.

## 2026-08-23 — Six more VAMOS editions imported as drafts

The six editions before *Regresando a casa* (dic 2023) are now in
Contentful, all unpublished, run oldest first through
`scripts/vamos/*.mjs`:

| Edition | Created | Already live | Revista total |
|---|---|---|---|
| Tu trabajo en el Reino · jun 2022 | 48 | 7 | 7 → 55 |
| Idioma y cultura · sep 2022 | 37 | 7 | 7 → 44 |
| Fondos misioneros · dic 2022 | 44 | 7 | 7 → 51 |
| Termina bien · mar 2023 | 26 | 4 | 4 → 30 |
| Equipos multiculturales · jun 2023 | 21 | 26 | 26 → 47 |
| No Alcanzados · sep 2023 | 16 | 24 | 24 → 40 |

192 drafts. Three slug collisions were skipped by design, all in Termina
bien: `la-palabra-de-dios-nos-ayuda-en-la-transicion`,
`nuestra-identidad-no-esta-en-nuestro-ministerio` and
`no-fuera-de-circulacion-sino-bajar-las-revoluciones-un-poco` already
exist under *Regresando a casa*.

**Termina bien's `blogPosts` array was extended (4 → 30).** It is one of
the two editions mi-movilicemos's «Regresando a casa» learning route reads;
David signed off on extending the other one (dic 2023) in the previous
batch and the same decision is applied here. Worth checking the course
before any of these drafts is published.

### Pipeline changes

- **`heroOverride` now resolves against every image on the page**, not just
  the ones that pass the candidate filters. An override is a human decision
  and the filters were second-guessing it: two sep 2023 heroes are
  full-measure banner photographs, wider than a candidate is allowed to be,
  and looking them up in the filtered list found nothing.
- **`score.mjs` warns when a pick won on a saturation above 1.** HSL
  saturation is `(max-min)/(1-|2L-1|)`, which blows up as lightness
  approaches 1, so clip art on stark white can report 80 or 300 and beat
  every real photograph on the page. Dic 2022 illustrates half its pages
  that way — piggy banks, coin stacks, a globe on banknotes — and six of
  its heroes needed naming outright. The warning is advisory; it changes no
  picks, so Nº 118 still plans the same 27 posts with the same 26 heroes.
- **A frame-split opening clause is rejoined.** `paragraphs()` merged a
  lowercase continuation only into a preceding paragraph of three words or
  fewer; the same break happens a whole frame at a time («La Ventana 10/40
  comprende una vasta» / «región de países en donde…»), which
  `images.mjs` already exempts from the short-frame rule for the same
  reason. Raised to eight words.
- **A middle initial no longer ends a sentence** in `describe()`, which was
  cutting descriptions to «Al misionero antropólogo Charles H.» and «Hace
  algunos años R. C.».

### Traps worth knowing

- **Labelled lists lose their labels.** A list set as one heading frame plus
  one body frame per item — «10 cosas que matan el ministerio», «Motivos
  correctos» / «Motivos equivocados», the price table in dic 2022 — loses
  every heading to the short-frame rule and reads as one undifferentiated
  list. Numbered headings survive; worded ones do not. Six items across
  these editions went to `dropArticles` for this rather than ship a list
  that says the opposite of what it means.
- **Articles linked to an edition that are not in its PDF.** «La traducción
  bíblica y la multiculturalidad del cuerpo de Cristo» is not in *Idioma y
  cultura*, and three of *Tu trabajo en el Reino*'s seven live posts are not
  in that PDF. One of the three, «10 razones por las que necesitas saber
  inglés», ran in print three months later in *Idioma y cultura*, so that
  page is listed as `live` there to avoid a second copy. The earlier
  «Aprendiendo a convivir» mystery is solved the same way: it is *No
  Alcanzados* p31, filed in Contentful under *Soy influencer*.
- **Two columns inside one frame** still defeat the extractor and are worse
  than a missing article: dic 2022 p39, mar 2023 p28, jun 2022 p24 and p34
  all read as one line alternating between the columns. Skip the page, or
  anchor the frame and drop it.

### For review before publishing

- Nine posts take the issue cover as their hero: sidebars beside an article
  that owns the page's only photograph, plus two pages (sep 2022 p7 and
  p19) that carry no photograph at all.
- *Idioma y cultura* sets much of its photography in black and white, which
  scores as greyscale; five of its heroes are named in `heroOverride`.
- Titles are the magazine headlines verbatim, per the Nº 118 convention.
  Twelve were read off page renders because they are set as vector art and
  are absent from both the text layer and the contents page.

## 2026-08-24 — SEO/a11y parity fixes and the two unreachable blog routes

Four items from the pre-cutover open list, plus the CMA slug repair this log
has carried as a TODO since 2026-07-12 (line 229).

- **`Article` JSON-LD** (`lib/structured-data.ts`, new). Yoast emitted a
  `@graph` on every WP post; we emitted none. Now `Organization` + `WebSite`
  site-wide from the layout, `Article` + `BreadcrumbList` per post, joined by
  `@id`. All 899 post pages carry it; validator.schema.org reports no errors.
  Two deliberate departures from Yoast, documented in the file: `author`
  resolves to the Organization, because **no blogPost in the space has an
  `author` value** (`author_exists: true` → 0 of 901), and no
  `WebSite.potentialAction`, because advertising a SearchAction we do not
  serve would point Google at a 404. `dateModified` comes from `sys.publishedAt`,
  now queried in `getBlogPostBySlug`.
- **`twitter:image` was the homepage banner on every article and every
  edition.** Next derives `twitter:*` only from the `twitter` metadata field —
  never from `openGraph` — so both routes inherited the root layout's default.
  Each now declares its own; `og:image` was always correct.
- **Magazine cover link had no accessible name.** `coverImage.description ?? …`
  let an empty string through as `alt=""`, and **50 of the 119 editions have
  an empty cover description**, so this was 42% of edition pages, not an edge
  case. The anchor now carries its own `aria-label` (the alt text describes
  the artwork, not the action). Same `??` trap fixed on the blog hero image.
  Covered by `tests/e2e/revista-accessibility.spec.ts`, pinned to an edition
  that actually has the blank description.
- **`vercel.json` gained a `headers` block** — immutable for `/_next/static`,
  1h + 24h SWR for `/home|heroes|pages`, 24h + 7d SWR for PDFs and documents,
  plus `nosniff`, `Referrer-Policy` and HSTS. Verified rather than assumed:
  re-running `yarn build:revista-rewrites && yarn build:legacy-redirects`
  leaves the file byte-identical, so the generators do not clobber it.

### The two blog routes that exported as 404 shells

`generateStaticParams` emitted them, `getBlogPostBySlug` could not resolve
them. Cause: revista slugs pass through `normalizeRevistaSlug`, blogPost slugs
are used verbatim, and two rows still held their source system's path.

- `4spRb3TGlc28zVnrzu260S` `ent/requisitos-y-pasos-para-ser-misionero`
  → `requisitos-y-pasos-para-ser-misionero-0`. The unsuffixed slug is held by
  a **published** row (`1zx2zjWer9BL1kwMx2uahk`, "Cómo ir al campo misionero",
  the SEO rewrite of the same topic imported from WP). The two are near
  duplicates, but archiving this one would be the `REVIEW` tier in
  `archive-duplicate-posts.ts` — it is the row with the revista link, so
  archiving removes the article from *La capacitación misionera* in
  mi-movilicemos. Renamed, not archived. **Open for David: archive instead?**
- `2kK1o4Gv19sZNNmWYyznCL` ` 2020-01/Siempre-será-un-desafío `
  → `siempre-sera-un-desafio`, the exact path the live WordPress site serves,
  so the legacy URL keeps resolving after cutover. Free because the earlier
  duplicate cleanup archived the two WP rows and kept this one — whose slug
  was the broken one. Title trailing space trimmed at the same time.
  The `/blog/2020-01/siempre-sera-un-desafio` → `/blog/` fallback redirect was
  **removed** (Vercel evaluates redirects before static files, so it would
  have shadowed the page it was standing in for), and `…-2` now points at the
  article instead of at `/blog/`. Closes the TODO at line 229.

`scripts/fix-malformed-blog-slugs.ts` does the repair generically — detect,
drop the source-system path prefix, `slugify`, suffix on collision — dry run
unless `--live`, and it ignores archived rows so they neither get repaired nor
reserve a slug.

### Caution: `.next/cache` served stale CMS data to the sitemap

The first build after the CMA change generated the **new** post routes but a
sitemap still listing the **old** slugs — different build workers, different
fetch-cache state. `rm -rf .next out` before trusting any count taken from a
build that follows a CMS write. It also revealed that the sitemap totals
quoted in the rebuild scorecard were low: the current build emits **1,212**
URLs (899 posts, 119 editions, 119 PDFs, 66 taxonomy, 9 index/pages), not
1,185.

## 2026-08-24 — Everything that dies with WordPress: 187/187

Two gaps closed while the old site is still answering. Both depend on it being
up, so neither could have waited for cutover.

### The Drupal file space nobody had inventoried

`build-media-redirect-map.ts` crawls the WordPress media API, which knows only
`/wp-content/uploads/`. But WordPress also answers for the **Drupal** tree that
preceded it, with per-file 301s
(`/sites/default/files/magazinepdf/<file>` → `/wp-content/uploads/2024/11/<file>`),
and **8 published blog bodies link into that space**. Those rules live in the
WordPress install; at shutdown our own articles would have carried broken links
to their own magazine PDFs.

- The space has no index and a nonexistent name 404s rather than listing
  siblings, so it cannot be enumerated — `scripts/probe-drupal-files.ts`
  probes it instead, using the filenames already known from the media map
  (every Drupal file that survived into WordPress kept its name).
- 606 probes → **47 live paths**, all under `magazinepdf/`; `magazinefiles/`
  is empty, which is why `nuevo_obrero_v8_.pd` (truncated extension, linked
  from *El nuevo obrero iberoamericano*) is dead on the live site today.
- `data/drupal-file-map.json` is a **frozen crawl** — same status as
  `legacy-revista-aliases.json`. Re-running after shutdown yields an empty
  map. Don't.
- `build-legacy-redirects.ts` emits these as **direct** rules to the
  first-party PDF, not as chains through `/wp-content/`: a chain survives the
  shutdown only as far as its first hop.

### The 15 orphaned documents

`scripts/upload-orphan-documents.ts` — downloads from the live site, uploads
under the original filename (all the filename join needs), dry run by default.
Two were deliberately not uploaded, both detected by content hash rather than
by name:

- `cuando_simplemente_dicen_no-1.pdf` is byte-identical to
  `cuando_simplemente_dicen_no.pdf`. One asset answers both URLs, since
  `normalizeFileName` strips the suffix. The **unsuffixed** name wins, because
  the asset filename becomes the public `/recursos/<file>` URL.
- `CampanaORA1002-SIMLatinoamerica-2026.pdf` is byte-identical to
  `public/ora/ora-1002.pdf`, which this repo already serves. Copying it into
  Contentful would put the same 3.2 MB on two URLs. New
  `data/media-manual-destinations.json` records the mapping to our own copy;
  the generator consults it before the bucket rules.

Asset titles were read off each document's own first page rather than
generated from the filename — `engnewsmar14.pdf` is "English in Lima — marzo
2014", not "Engnewsmar14". `persecucionvamosmayo14.pdf` has no text layer
(scanned) and is titled from the edition it is.

**`persecucionvamosmayo14.pdf` is still only a document, not an edition.** The
2014-05 VAMOS issue remains absent from Contentful. Uploading the PDF
discharges the deadline — the file no longer depends on WordPress — but
importing it as a proper edition (cover, articles, `import:revistas`) is
separate work and was not bundled in silently.

### Result

- `unresolved-doc` 26 → 12, and **every one of the 303 known documents now has
  a redirect**; the generator's "no destination" list is empty for the first
  time.
- **`docs/routes.txt`: 187/187** trafficked URLs resolve, up from 185/187
  (108 static, 47 exact redirect, 32 wildcard). The two that were 404ing were
  both trafficked.
- Budget: 419 redirects (limit 2,048) + 265 rewrites. No duplicate sources,
  no chains, `headers` block intact across regeneration.
- All 13 new Contentful assets HEAD-check 200 through their `/recursos/`
  rewrites. Unit 67/67, e2e 63/63.

### Also settled

- **The 23 `resource` entries hardcoding `misionessim.org/wp-content/...` are
  not a shutdown risk.** After cutover that hostname *is* this site, so those
  links land on our own redirect map; all 7 distinct paths they reference are
  already covered. No action needed.
- **The 528 (now 531) images are lower priority than they looked**: zero of
  the 901 published blog bodies reference a `wp-content` image, so this
  affects inbound links only, never anything we render.

## 2026-08-24 — VAMOS mayo 2014 imported: the archive is whole for its era

The last item from the pre-cutover list that was ours to fix. The May 2014
edition existed only as a PDF, so the archive showed 119 editions where it
should have shown 120.

- **`scripts/import-revista-from-pdf.ts`** (new). `import-missing-revistas.ts`
  pulls a PDF *and* a cover JPEG from recorded WordPress URLs; that could not
  work here, because WordPress never had an edition page for this issue and
  therefore has no cover image anywhere (`persecucionvamosmayo14.jpg` 404s in
  every form). The PDF is also a **scan with no text layer**, so nothing
  downstream could derive one either. The first page *is* the cover, so the
  script renders it with poppler at 768px — matching the larger of the two
  cover-width conventions in the space (543px on 51 editions, 763–768px on 33).
- **Title and date came off the cover itself**, not the filename: «Persecución»,
  Mayo 2014, strapline "Donde la Fe Cuesta al Máximo". Slug `persecucion`,
  which was free.
- The rendered cover was given a **real `description`**. An empty one is
  precisely what left 50 edition pages with a nameless PDF link earlier today;
  the script hard-codes a description rather than leaving it to the operator,
  and rejects a non-URL-safe slug for the same reason.
- **Zero linked articles, and that is correct** — no blogPost in the space
  carries a 2014-05 publish date, and the scan has no text for the extractor.
  47 of the other 119 editions also have none, so this is an established shape,
  not a broken one.

After `build:revista-rewrites && build:media-map && build:legacy-redirects` the
PDF re-buckets from `contentful-asset` to `vamos-pdf`, so the legacy WordPress
URL now lands on `/revistavamos/persecucion/persecucionvamosmayo14.pdf` — the
edition's own first-party path — instead of the generic `/recursos/` proxy,
and that stale `/recursos/` rewrite is gone.

Verified: 120 editions, sitemap 1,212 → **1,214**, the edition sorts between
*La Oración* (2014-06) and *Movilizando a la Juventud* (2014-04) on archive
page 5, the cover link announces "Descargar PDF: Persecución", the PDF serves
200 through the rewrite, index pagination grew to 8 pages. Unit 67/67,
e2e 63/63.

**October 2014 is also absent**, and unlike May it is not fixable here: no
`oct14` VAMOS PDF exists anywhere in the media map, so there is nothing to
import. 2013 is complete; 2015 onward is bimonthly by design, not by gap.

## 2026-08-24 — Legacy image URLs: one pattern rule

The last unenumerable piece of the WordPress URL space. WordPress generates
size variants (`-300x200.jpg`, `-scaled.jpg`) that are live URLs but appear in
no API, so the image space cannot be listed and 1:1 rules were never possible —
`docs/media-redirect-review.md` has said "pattern rule (cannot enumerate)"
since Phase 7b.

**Scope check first:** grepped every entry of all six content types, including
drafts and archived rows, for a `/wp-content/uploads/` image reference. **Zero.**
Nothing this site renders depends on a legacy image URL, so the rule exists
purely for inbound links and third-party embeds.

The rule:

```
/wp-content/uploads/:file(.*\.(?:jpe?g|png|gif|webp|svg|avif|bmp|tiff?|JPE?G|PNG|GIF|WEBP))
  -> /home/banner-sim-home-2026-1200.webp   (302)
```

Three decisions worth keeping:

- **It points at an image, not at a page.** A hotlinked `<img>` on someone
  else's site keeps rendering a real SIM image instead of a broken icon, and
  we avoid the soft-404 pattern of dumping every asset URL on the homepage.
  The destination is the banner already used as the default `og:image`.
- **302, not 301.** A permanent redirect would be cached by browsers forever
  and would invite crawlers to consolidate 531 image URLs onto one banner.
  Neither is wanted for a mapping that means "unknown image → generic image".
- **Extension-scoped, and last in the array.** Vercel takes the first match,
  so a catch-all placed anywhere but last would swallow all 303 document
  rules above it. `ownsRedirect()` in the generator now claims only exact
  media paths (`return !source.includes(":")`, mirroring what the
  `/la-revista/` block already did), so this hand-written rule survives a
  re-run — verified byte-identical after
  `build:revista-rewrites && build:legacy-redirects`.

**Verified by simulating the whole redirect table in order** against the real
media map, using the same path-to-regexp build Vercel routes with: 531/531
known images hit the catch-all, 303/303 documents still hit their own rule,
and WP size variants — which appear in no map at all — are caught.

`tests/unit/vercel-redirects.test.ts` (new, 9 tests) locks the ordering, the
302, the image destination and the "never claims a document" property, plus
no-duplicates / no-chains / under-budget for the table as a whole. Unit 76/76.
Budget: 420 redirects + 265 rewrites.

## 2026-08-24 — Unlisted review page: /rebuild-vs-wordpress/

The rebuild-vs-live comparison, previously only an external artifact, now lives
on the site itself at `/rebuild-vs-wordpress/` — reachable by direct link,
absent from search and from navigation. The "Closed since the first draft"
section was left out at David's request; the page carries only the current
state.

**Rewritten in Spanish for a non-technical reader** (second pass, same day).
The route kept its English slug so the link already circulated stays valid —
rename it if that ever matters. What changed beyond translation:

- Metrics are named for what a visitor experiences, not by their metric names:
  "cuánto tarda en verse la imagen principal" rather than largest contentful
  paint, "cuánto tiempo la página no responde al tacto" rather than total
  blocking time. Blocking times moved from milliseconds to seconds and page
  weight from KiB to MB, because those are the units a reader already owns.
- Terms that could not be dropped are explained in place: what the Lighthouse
  score is, what "accesibilidad" means, what a sitemap is and why layout shift
  is measured 0–1.
- `admin-ajax.php`, CDN, PHP, canonical tags and Open Graph are gone as terms;
  what they *do* is still there in plain language.
- `<main lang="en">` removed — the page now inherits the document's `es`.

**Two overstated figures caught while checking the arithmetic**, both mine and
both introduced in the rewrite: the headline said "5 veces más rápido" when
15,2 / 3,5 is 4,3, and "120 ediciones que hoy Google no puede ver" conflated
the new site's 120 editions with the 118 that exist on the live site today.
Corrected to 4 and 118. Every headline ratio is now rounded **down**: 7,3 → 7,
2,18 → 2.

Three independent things keep it unlisted, and each is asserted in
`tests/e2e/unlisted-pages.spec.ts` because each can be undone by accident:

1. `robots: { index: false, follow: false }` in the route's metadata.
2. Absence from `app/sitemap.ts`, whose static list is hand-written — a new
   route is excluded by default, which is the safe direction.
3. Nothing on the site links to it (asserted from five public routes).

**Deliberately NOT disallowed in robots.txt.** Blocking the crawl would stop
crawlers reading the noindex tag, which is the opposite of the goal.

Built with the site's own tokens rather than the artifact's CSS, so it looks
like the site — and the two designs already share Raleway/Work Sans and the
brand palette. Bars are computed from the measured values (`value / max`)
instead of hard-coded widths, so the chart cannot drift from the numbers beside
it. Content is English inside an `es` document, so `<main>` carries `lang="en"`.

Note for whoever finds this page later: the figures are a snapshot dated in the
page itself, not a live readout. Re-measure before quoting them.

**JSX whitespace bug caught in the built HTML**, worth remembering: one
`</strong> while` in the source rendered as `</strong>while`, while three
identical constructs in the same file rendered correctly. Fixed with an
explicit `{" "}`. The output is now checked for `</strong>`/`</code>`/`</em>`
boundaries glued to adjacent words — 0 in either direction.

Unit 76/76, e2e 71/71 (8 new).

---

## 2026-08-24 — Google Search Console 404 triage

Full write-up: [legacy-404-triage.md](legacy-404-triage.md).

Search Console's "Not found (404)" export (320 rows → 300 unique paths) turned
out to be almost entirely **Drupal-era** URLs — `/content/`, `/recurso/`,
`/curso-vamos/`, `/images/<tema>_adjuntos/`, `/phocadownload/`,
`/sites/default/files/`. WordPress never redirected that space either, so these
have 404ed for years; the rebuild only made the report worth reading. `Last
crawled` is when Google last *tried*, not when the URL last worked.

Measured against production rather than reasoned about: 24 of the 300 already
resolve (the export is stale).

### Done
- **`data/legacy-404s.json`** — the export, frozen. Search Console prunes URLs
  once it stops asking; this cannot be regenerated later.
- **`data/legacy-page-map.json`** — hand-decided destinations for the Drupal page
  space, plus seven edition slugs that drifted *before* WordPress and so are
  absent from `legacy-revista-aliases.json` (a frozen crawl that must stay
  verbatim).
- **`scripts/build-legacy-redirects.ts` section 4** — resolves documents by an
  accent- and case-insensitive filename key against the `/recursos/` assets, the
  `/revistavamos/**.pdf` rewrites, and `pdfToSlug`; resolves pages through the
  page map. Emits a percent-encoded twin for any source containing a space, and
  orders the `:path*` wildcards after every exact rule correcting them.
- **107 paths now redirect** (61 documents, 26 magazine URLs, the rest pages).
  Every destination was probed: all 79 return 200. Redirects 539 total, well
  inside Vercel's 2,048.
- **5 new unit tests** covering wildcard ordering, rewrite backing for every
  document destination, and space/percent-encoding pairs. Unit 84/84.

### Left to 404 on purpose
99 documents whose file did not survive Drupal, 46 blog posts absent from the
WordPress export itself, 9 junk paths. A 301 onto an unrelated index reads to
Google as a soft 404 — same signal, minus the honesty, plus a permanent rule.

### Open
- **99 orphaned course documents** — recoverable only from a backup or the
  Wayback Machine. Decide: recover, or let them go.
- **46 missing blog posts** (2024-08 → 2025-02, plus two 2024-05 slugs) — never
  in `export/posts/`. Same decision.
- **`mail.misionessim.org`** returns 525 over HTTPS, which Google retries
  forever. Needs a Cloudflare redirect rule or the DNS record removed — not
  fixable in `vercel.json`.
- One uppercase Contentful slug: `Discipulando-con-el-manual-vamos`.

### Rollback runbook
[rollback-to-wordpress.md](rollback-to-wordpress.md) — how to put WordPress back
on the apex if the rebuild has to be abandoned. Two things in it are worth
knowing before an incident rather than during one:

- **Most incidents want Vercel's "Promote to Production" on a known-good
  deployment, not a DNS change.** Two minutes, no propagation.
- **The origin's TLS cert for `misionessim.org` is probably expiring unnoticed.**
  AutoSSL validates over HTTP at the domain it issues for, and the apex has
  pointed at Vercel since cutover, so that check fails at Banahosting. Rolling
  back onto a lapsed cert means a browser interstitial for every visitor.
  Monthly check, or use Cloudflare proxy + SSL mode **Full** (not strict) as the
  emergency workaround.

Also flagged there: MX is `0 misionessim.org.`, which resolves to Vercel
(`216.198.79.1`). Port 443 answers, port 25 does not. Inbound mail to
`@misionessim.org` may have had nowhere to land since cutover — needs a live test
to confirm, since consumer ISPs commonly block outbound 25.

### 2026-08-24 — WordPress `.htaccess` recovered

The Drupal-era redirect table from the live install, captured verbatim in
`data/drupal-htaccess-redirects.json` and consumed by
`scripts/build-legacy-redirects.ts`. It supersedes `data/drupal-file-map.json`
where both describe a path: that file was built by probing, which could only
guess Drupal filenames from their WordPress twins and so missed all five rules
where the names differ (three lowercase-vs-CamelCase, two `_0` suffixes). Those
five now resolve in one hop to the Contentful PDF, verified 200.

Its three `/la-revista/` slug rules matched `slugAliases` exactly — independent
confirmation of guesses that had been inferred. The generator now reports drift
between the two rather than silently preferring one.

Both this and `drupal-file-map.json` are **frozen captures**: unreproducible once
the install is gone.

### 2026-08-24 — WordPress `/feed/` URLs redirected, two lost posts recovered

Search Console's 15 indexed `/feed/` URLs. The `/la-revista/*` half was 308ing
into a 404 — the `/la-revista/:path*` wildcard passed `feed` through as if it
were a slug. Section 6 of `scripts/build-legacy-redirects.ts` now strips the
segment: 96 rules, exact twins derived from the redirect table so drifted slugs
resolve in **one** hop, plus ordered passthrough wildcards. 25 tests in
`tests/unit/vercel-redirects.test.ts`, including the 15 indexed URLs verbatim.
Detail in `docs/legacy-404-triage.md`.

Two of the 15 had no article behind them. Neither is rebuild fallout: all 335
posts on `wordpress.misionessim.org` resolve on the live site (30 via slug-drift
redirects), so the Contentful migration lost nothing — these two were gone
before it ran. Text recovered from the Wayback Machine into
`data/recovered-posts/`; `camino-de-generosidad` has a single snapshot, so that
capture is the last copy.

Both re-imported and published to Contentful via `yarn import:recovered --live`
(entries `31imquHttWUaWBuLXG1tNA`, `1T7a1NZpNjDkoPbDt6inAd`). The script creates
only and skips any slug already present, so a re-run is a no-op — the shared
space already carries 34 duplicate articles and does not need more. A clean
`yarn build` prerenders both at their legacy URLs and the sitemap grew to 902
posts, matching the prerendered page count exactly. **They reach the public site
on the next deploy.**

## 2026-09-03 — Progressive publication of the imported VAMOS editions

The August PDF import left 16 editions in Contentful as drafts, by design. They
are now publishable one edition at a time, on whatever cadence suits:

```bash
yarn drafts:list                                # the worklist
yarn drafts:list --revista=<slug>               # the titles of one edition
yarn drafts:publish --revista=<slug> [--live]   # dry run by default
```

The standing queue and its cautions live in
[revista-publication-queue.md](revista-publication-queue.md). Scripts:
[list-revista-drafts.mjs](../scripts/list-revista-drafts.mjs),
[publish-revista-posts.mjs](../scripts/publish-revista-posts.mjs), sharing
[lib/revista-drafts.mjs](../scripts/lib/revista-drafts.mjs).

### The state the audit found

466 draft posts across 16 editions, and publishing them is a pure state flip —
nothing else is missing:

- **0 of 466** drafts are absent from their edition's `revista.blogPosts` array.
  The importer appended them all; `getRevistaBySlug` drops unresolvable links,
  which is exactly what keeps a draft invisible.
- **0 of 461** hero assets are unpublished. Contentful would refuse the entry
  otherwise, so the importer publishes each hero as it uploads it.

Two entries are deliberately outside the queue: the 38 archived duplicates from
`archive-duplicate-posts.ts` (archived entries have no `publishedAt` either, so
every query filters `sys.archivedAt`), and one bodyless 2022 stub,
`la-feminidad-raiz-de-la-biblia-y-la-historia`, which has no revista link and
should be archived rather than published.

### Two things to check before pressing publish

- `regresando-a-casa` and `termina-bien` back the live "Regresando a casa"
  learning route in mi-movilicemos. Their arrays grew 17→39 and 4→30 in the
  August import; if that route renders the whole array, publishing those two
  editions adds 48 stops to a live course.
- Vercel deploy hooks are capped at 60 triggers/hour. One 44-post edition fits;
  two editions in one hour do not.
