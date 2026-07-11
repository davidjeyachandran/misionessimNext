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
