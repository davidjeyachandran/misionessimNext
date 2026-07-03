# misionessim.org → Next.js: Migration Analysis & Phased Implementation Plan

**Date:** 2026-07-03 (updated same day for: Contentful decision + existing infra, /revistavamos/ investigation, and scope-narrowing decisions — donations dropped, no donor dashboard, forms via host platform, no PDF embedder, Elementor pages static/code-first)
**Status:** Approach chosen (C) — ready to implement
**Context:** We have full admin access to the WordPress site and can make a local copy. A static HTML/CSS/JS replica of the homepage already exists in this repo (`poc/index.html`, `poc/css/styles.css`, `poc/js/main.js` — moved into `poc/` on 2026-07-03) and was verified near pixel-perfect against the live site.

---

## 1. Executive summary

misionessim.org is a WordPress + Elementor site with a small number of hand-built pages and a large body of clean, structured content (blog + magazine). The **chosen approach (C) is a full rebuild of the presentation layer in Next.js, with blog posts and revista editions migrated into Contentful** (existing infra — see below), not a headless-WordPress integration. The reasons, in short:

- Only **~8 pages** are Elementor-built and they are **truly static** — they will not change during the migration. They are rebuilt once as React components; their copy lives in code for day 1 (optionally moved to markdown/Contentful later).
- Everything with a long tail — 335 blog posts + 118 revista editions — is structured content and goes into **Contentful**, where editors already have infrastructure and a publishing workflow. The frontend stays fully static with on-demand revalidation.
- Elementor markup is unusable in a headless frontend, so keeping WP as a headless CMS would buy nothing while adding a permanent WP server to the critical path.
- The homepage POC in this repo proves the rebuild approach works and already encodes the design system (colors, fonts, header, hero, parallax).

**Scope decisions locked in (2026-07-03):**
- **Donations (GiveWP) are out of scope** — dropped entirely, **all references removed**: no donor dashboard, no donate CTAs; legacy `/donations/*` 301 → homepage.
- **Deploy target: Vercel** (decided 2026-07-03). Vercel has **no native forms product** (that's Netlify-only), so the contact form is a plain HTML form posting to a small serverless route handler that sends email via **Resend** (decided 2026-07-03). No WP either way.
- **PDF embedder is not replaced** — revista PDFs are plain download/view links.
- **Contentful is the CMS — specifically the existing shared space used by mi-movilicemos** (`~/websites/poc/mi-movilicemos`), which already has `BlogPost`/`Revista` types and VAMOS-magazine-derived content from an earlier import (see §2.5, §4 and [contentful.md](contentful.md)). A live quality audit (§2.5), confirmed against the full 335-post collision diff, found WP text is more complete (Contentful's overlap is stale) — so the import is a **per-field policy**: WP wins on body text; images are picked **per post by resolution** (whichever source has the larger image, 187/215 WP, 22/215 Contentful); Contentful's revista↔blogPost links are always kept. Not a blanket winner on any one field.
- **Tag and author archives are both kept.**

The plan is structured in **8 phases** (0–7), each with explicit exit criteria, unit tests (Vitest), and Playwright visual-regression checks against baseline screenshots captured from the live site.

---

## 2. Current site audit

### 2.1 Content inventory (from Yoast sitemaps + REST API, 2026-07-03; counts corrected during Phase 0, 2026-07-03)

**Correction:** the counts below were originally recorded as 336 posts / 119 revista items — an off-by-one from counting raw sitemap `<url>` entries, which include the `/blog/` and `/la-revista/` **index pages themselves** alongside the actual content items. `scripts/build-url-inventory.ts` classifies index pages separately, and the WP REST API confirms the true post count directly (`x-wp-total: 335` header on `/wp-json/wp/v2/posts`). Corrected: **335 posts, 118 revista items.**

| Content type | Count | Built with | REST-exposed? | Disposition |
|---|---|---|---|---|
| Pages | 8 | Elementor (static) | yes (`/wp-json/wp/v2/pages`) but content is Elementor markup | **Rebuild by hand as code** (copy in components day 1) |
| Blog posts (`/blog/YYYY-MM/slug/`) | 335 | Gutenberg (clean `wp-block-*` HTML) | yes (`/wp-json/wp/v2/posts`) | **→ Contentful** (scripted export/import) |
| La Revista items (`/la-revista/slug/`) | 118 | Elementor, via `keydesign-portfolio` CPT | **no** (not registered in REST) | **→ Contentful** (needs REST-exposure snippet or WP-CLI) |
| GiveWP donation forms (`/donations/...`) | 8 | GiveWP plugin | yes (`give_forms`) | **Dropped — out of scope** |
| Categories / tags | 36 / 28 | taxonomy archives | yes | → Contentful references; generated archive pages |
| Portfolio categories | 6 | taxonomy archives | no | Generated pages once CPT is exported |
| Authors | 2 | author archives | yes | → Contentful; keep or drop (§5.2) |

The 8 in-scope pages: home, `/sirve-con-sim/`, `/nosotros/`, `/recursos/`, `/revistavamos/`, `/ora/`, `/declaracion-de-fe-de-sim/`, `/terms-and-conditions/`. The three GiveWP utility pages (`/donation-confirmation/`, `/donation-failed/`, `/donor-dashboard/`) are **dropped** with donations.

**The `/revistavamos/` URL space (investigated 2026-07-03).** The magazine editions that appear "under" `/revistavamos/` are the 118 `keydesign-portfolio` items — canonically served at `/la-revista/<slug>/` and present in `keydesign-portfolio-sitemap.xml`, so no content is missing from the inventory. Three implementation-relevant facts, though:

1. The "Ediciones Revista VAMOS" carousel on `/revistavamos/` is **not in the page HTML** — it's fetched client-side from `admin-ajax.php` (`action=postcs_getdata`, plugin `post-types-carousel-slider`, paginated 16 per page). Any HTML-scrape-based export would silently miss all editions; the CPT/REST export path is mandatory.
2. `/revistavamos/<slug>/` works as an **alias that 301-redirects** to `/la-revista/<slug>/` (e.g. `/revistavamos/el-clamor-macedonio/` → `/la-revista/el-clamor-macedonio/`). These aliases may be linked externally or in print; the Next.js `redirects()` map must reproduce them for every edition slug.
3. Numeric subpaths (`/revistavamos/2015/` … `/revistavamos/2027/`) all return 200 with the parent page's content — a WordPress pagination fallback, not real pages. Do **not** replicate these; let them 404 or redirect to `/revistavamos/`.

### 2.2 Plugin footprint (homepage)

`elementor`, `elementskit` (+lite), `give` (GiveWP), `keydesign-framework`, `pdf-embedder`, `post-types-carousel-slider`, `contact-form-7`, `google-analytics-for-wordpress` (MonsterInsights), `wordpress-seo` (Yoast).

What each implies for the rebuild:

- **elementor / elementskit / keydesign-framework** — presentation only; replaced entirely by React components.
- **pdf-embedder** — La Revista pages embed magazine PDFs; **not replaced** — render plain download/view links (+ cover image). Decision confirmed 2026-07-03.
- **post-types-carousel-slider** — carousels on landing pages; replace with a small React carousel (or CSS scroll-snap).
- **contact-form-7** — replaced by a plain form + serverless route handler or third-party form service on Vercel (§5.1); no WP.
- **give** — donations; **out of scope**, dropped entirely.
- **wordpress-seo** — Yoast emits titles/meta/OG/canonical/schema; must be reproduced with the Next.js Metadata API for SEO parity.

### 2.3 Design system (verified against live DOM in the POC session)

- Colors: primary `#C91430`, secondary `#002F49`, text `#0A0117`, nav links `#696F8C`.
- Fonts: **Raleway** (headings) + **Work Sans** (body).
- Header: fixed, always-white, 71px, search icon + "Servir con SIM" CTA (10px radius).
- Hero: 95vh desktop with 57px Raleway title in a 546px left column, flat 0.4 overlay; collapses to a ~330px banner on mobile.
- Three parallax background sections on the homepage (hero, Conócenos, Revista VAMOS). Parallax is the animation that matters most to stakeholders.
- Note for baseline screenshots: capture the live site **logged out** — the WP admin bar adds 32–46px when logged in as admin.

### 2.4 APIs available

- WP REST API is **publicly open**: posts, pages, media, categories, tags, `give_forms`, `elementskit-content` all respond.
- Blog post `content.rendered` is clean Gutenberg HTML (`wp-block-paragraph`, `wp-block-heading`) — directly convertible to MDX/HTML.
- **No GraphQL endpoint** (WPGraphQL not installed).
- `keydesign-portfolio` CPT is not in REST. Since we have admin access, either (a) add a 5-line `register_post_type_args` filter to expose it, or (b) export from a local copy with WP-CLI (`wp export` / `wp post list --post_type=keydesign-portfolio --format=json`). Option (a) is less work and doesn't require standing up a local WP.

### 2.5 WP vs. existing Contentful content — quality audit (2026-07-04)

Before committing to an import strategy, we queried the live Contentful space directly (GraphQL) and compared it field-by-field against the WP REST API for the same posts. This is the evidence behind §4's per-field conflict policy.

**Coverage:** the space holds 791 `BlogPost` entries total (spanning multiple SIM sources, not just misionessim.org) and 110 `Revista` entries. Matching by slug, **215 of misionessim.org's 335 WP posts (64%) already exist**, but the overlap is concentrated in the 2019–2022 VAMOS-magazine era and collapses after that:

| Year | Found in Contentful / WP total |
|---|---|
| 2020 | 131/158 (83%) |
| 2021 | 42/44 (95%) |
| 2022 | 24/26 (92%) |
| 2023 | 5/15 (33%) |
| 2024 | 6/68 (9%) |
| 2025–2026 | 0/14 (0%) |

Contentful's copy is **stale** — it's missing nearly everything from the last ~2.5 years, which rules out "treat Contentful as authoritative, only import what's missing" as an option: that would silently drop most of the site's recent content.

**Text quality — Contentful is cleaner for overlapping posts.** WP's raw `content.rendered` has a systemic mojibake bug: smart quotes stored as broken `\x93`/`\x94` bytes (a Windows-1252/UTF-8 mismatch), present in 5 of 6 sampled 2020 posts (2–11 occurrences each). The matching Contentful entries — evidently extracted from the original VAMOS PDF issues via a separate historical import, not synced from this WP field — have proper `“ ”` quotes. Recent WP-only posts (2023+, no Contentful match) have a *different* defect instead: Google-Docs-paste artifacts (`<span id="docs-internal-guid-...">` wrappers with inline `font-family: Arial` styling) that need stripping regardless of source.

**Images — WP wins on most, but not all.** Initial 4-post sample suggested a blanket "WP wins":

| Post | WP featured image | Contentful heroImage |
|---|---|---|
| `10-consejos-...-individualismo` | 1280×853 (Pexels) | 345×230 (`mi23.png`) |
| `13-signos-...-equipo` | 1280×853 (Pexels) | 403×293 (`mi7_2.png`) |
| `7-formas-para-mejorar-tu-equipo` | 1280×853 (Pexels) | 425×422 (`mi17.png`) |
| `abuelas-a-distancia` | 1280×853 (Pexels) | *(none)* |

**Correction from the full 335-post collision-diff run (`yarn diff:cms`, 2026-07-04):** the blanket rule doesn't hold across all 215 matches. Real per-post image-area comparison (`scripts/diff-cms-collisions.ts`) found:

| Verdict | Count | Meaning |
|---|---|---|
| `wp-higher-res` | 187 | WP's image is bigger — import it |
| `wp-has-cf-missing` | 115 | Contentful has no image at all — import WP's |
| `cf-higher-res` | 22 | **Contentful's image is bigger** (e.g. `dios-llama-y-la-iglesia-envia`: WP 1280×774 vs. Contentful 5887×3776) — keep Contentful's |
| `wp-missing-cf-has` | 6 | WP has no featured image — keep Contentful's rather than blank it |
| `neither` | 5 | No image on either side |

**Policy correction:** image selection is **per-post area comparison** (`width × height`, whichever is larger wins), not a blanket "always WP." The collision-diff script computes this per post as `imageVerdict`; Phase 4's import script consumes that field directly rather than hard-coding a source.

Contentful's images are low-resolution PDF-page-render crops (filenames like `mi23.png` are sequential magazine-page exports, not original photography), sometimes missing entirely. WP's are full-resolution stock photos. For **Revista cover images** specifically (not blog featured images) the two sources are roughly equivalent — both trace back to the same modest-resolution magazine-cover scan (verified on `/la-revista/trabajo-en-la-selva/`, WP's own `og:image` is only 270×382).

**Structural bonus:** where a match exists, Contentful's `BlogPost.nid` field equals the exact WP post ID (e.g. `nid: "1544"` = WP post 1544, `un-ministerio-sin-igual`), and many overlapping posts already carry a `revista` back-reference matching what WP's `/la-revista/<slug>/` pages describe. That relationship isn't otherwise derivable from the WP REST API (the CPT gap noted above) and is worth preserving on import.

**Decision:** see §4's conflict-strategy bullet — WP wins on body text (after mojibake cleanup), re-imported for all 335 posts; images are picked per post by resolution (§4 image-verdict table); existing Contentful revista links are preserved where present.

---

## 3. Approaches considered

### Approach A — Headless WordPress (WP stays as CMS; Next.js fetches via REST/WPGraphQL)

Keep WordPress running as the content backend; Next.js renders everything, revalidating via ISR or on-demand webhooks.

**Pros**
- Editors keep the WP admin they know; publishing workflow unchanged.
- Blog content stays live-editable with no redeploy.
- Well-trodden path (ISR + revalidation webhooks).

**Cons**
- **Solves the wrong problem here.** The hard 20% of this site is the Elementor pages, and Elementor content does not survive headless rendering — its `content.rendered` is a soup of `elementor-element` divs that depends on plugin CSS/JS. Every Elementor page must be rebuilt as components regardless, so headless only "saves" the blog migration, which is the easy part.
- WordPress stays in production forever: hosting cost, security patching, plugin updates, an extra point of failure, and slower builds/requests than reading local content.
- The portfolio CPT needs custom REST exposure work anyway.

**Verdict:** Justifiable only if non-technical editors must keep publishing through WP admin indefinitely. Even then, Approach C (headless CMS) is usually a better long-term home than maintaining WP just as an API.

### Approach B — Full static rebuild + one-time content migration into the repo

Rebuild the ~8 Elementor pages as hand-crafted Next.js components (the homepage POC is the template for this). Export all structured content (335 posts, 118 revista items, taxonomies, media) once via scripts into the repo as MDX/JSON + downloaded assets. Ship as a fully static Next.js site (`output: 'export'` or static-rendered App Router on Vercel/Netlify).

**Pros**
- **Best possible performance**: every page pre-rendered, no origin server, no DB. This directly serves the stated goal ("performant site").
- No WordPress in production — the entire plugin/security/hosting burden disappears after cutover.
- Content is version-controlled; the whole site is reproducible from the repo.
- The content pipeline (WP → MDX) is a script we write once and can re-run right before cutover to catch late edits.
- The existing homepage POC de-risks the hardest page and is directly portable.

**Cons**
- Content publishing changes: new posts are MDX files + a deploy, not a WP editor. (Mitigable: the `import-vamos` workflow suggests content ops are already moving toward scripted workflows; also MDX-on-GitHub editors or a later CMS bolt-on are cheap.)
- Donations and contact forms need replacements (true in every approach except A).

**Verdict:** Technically right-sized for a ~470-item, 2-author site, and everything in it except the final storage target carries over to Approach C. **Superseded by the decision to give editors a CMS** — kept documented as the fallback if CMS costs or complexity become a problem.

### Approach C — Rebuild + Contentful for structured content — **CHOSEN (2026-07-03)**

Presentation-layer rebuild as in B, but the structured long tail (335 blog posts, 118 revista editions, taxonomies, authors) lands in **Contentful** — infra David already has. The ~8 Elementor pages are hand-built React components with their copy in code for day 1 (they're static and won't change during migration); moving that copy to markdown/Contentful is an optional later enhancement, not a launch requirement.

**Pros**
- Proper editorial UI, drafts, preview, roles — editors publish blog/revista content without touching git or waiting on a developer, using infrastructure they already have.
- Publishing doesn't require a redeploy: Contentful webhooks trigger on-demand ISR revalidation, so the site stays effectively static (same performance as B) while content goes live in seconds.
- Asset pipeline included (Contentful Images API resizing/AVIF, integrates with `next/image` via a custom loader).
- The WP → neutral-JSON export we need anyway (Phase 0) feeds the Contentful import script directly; the extra hop is one idempotent script against the Management API.

**Cons / costs to manage**
- Content modeling must be settled before bulk import (kept deliberately small — see §4).
- Management API rate limits make the ~455-entry + media import a batched, resumable script rather than a naive loop.
- Two sources of truth during migration (WP live vs. Contentful) — handled by the Phase 7 content freeze + delta re-sync.

**Verdict:** Chosen. Contentful confirmed with existing infra; the plan keeps a thin `lib/cms.ts` accessor so the SDK is isolated (swappable, testable), but no CMS product-selection work is needed.

### Approach D — Automated conversion / static mirror (wget/HTTrack scrape, or Elementor-HTML-to-JSX tooling)

Mirror the rendered site or mechanically convert Elementor output into components.

**Pros:** fastest path to "pixel-identical."
**Cons:** the output is unmaintainable Elementor div-soup with megabytes of Elementor CSS/JS — this *fails the performance goal by construction* and produces a codebase nobody can evolve. Search, forms, donations all break.

**Verdict:** Rejected as a migration strategy. However, a **wget mirror is extremely useful as a testing artifact** — we'll use a snapshot of the live site as the stable baseline for visual-regression tests (see §6).

### Approach E — Incremental strangler (Next.js proxies WP; migrate route-by-route)

Put Next.js in front, `rewrites()` unmigrated paths to WordPress, migrate section by section in production.

**Pros:** de-risks big-bang cutover; each section ships when ready.
**Cons:** requires running both stacks with careful cookie/asset/canonical handling; cross-origin quirks with WP-generated absolute URLs; overkill for a site this size.

**Verdict:** Not needed. With donations dropped and only ~8 static pages + Contentful content to migrate, a big-bang cutover is low-risk; no proxy layer required.

### Recommendation

**Approach C** — rebuild the presentation layer in Next.js; migrate blog + revista into Contentful; ~8 static Elementor pages rebuilt as code. Approach B (content in-repo) remains the documented fallback should Contentful ever need to be dropped, since the Phase 0 neutral export is the shared foundation of both.

---

## 4. Target architecture

- **Next.js 16, React 19, TypeScript, App Router, static rendering** for all routes (SSG + on-demand ISR from Contentful webhooks). No long-running server — the only server-side pieces are serverless route handlers (`/api/revalidate`, `/api/contact`). Aligns with the versions in both sister projects: **sim-blog** (`~/websites/learn/sim-blog`, Next.js 16, `output: "export"`, GitHub Pages at `historias.misionessim.org`) and **mi-movilicemos** (`~/websites/poc/mi-movilicemos`, Next.js 16, Vercel). misionessim-new uses Vercel like mi-movilicemos (needs route handlers; cannot use `output: "export"` like sim-blog).
- **Styling:** **Tailwind v4** (same as sim-blog) with design tokens via `@theme` CSS custom properties — same token names as sim-blog's `app/globals.css` (`--color-brand: #c91430`, `--color-navy: #002f49`, `--color-ink: #0a0117`, `--color-muted: #696f8c`, `--color-cream: #fef1d5`, `--color-hairline: #e6e8f0`; fonts `--font-heading: var(--font-raleway)`, `--font-sans: var(--font-work-sans)`). Tailwind instead of the originally-planned CSS Modules — chosen for consistency with the sister projects and easier future component sharing.
- **Fonts:** `next/font` with Raleway + Work Sans, `display: swap`, subset to latin — removes Google Fonts render-blocking.
- **Content layer:** **Contentful — the existing shared space** already used in production by the mi-movilicemos learning app (documented in [contentful.md](contentful.md), copied from that project (`~/websites/poc/mi-movilicemos`)). The space already has `BlogPost` and `Revista` content types (plus `ResourceGroup`/`Resource`, which this site ignores) and **already contains content sourced from VAMOS PDF magazine issues** — imported via an earlier, separate pipeline into this app directly (**not** the `import-vamos` skill, which targets sim-blog's local filesystem, `public/misionessim/*.{json,md}` — a different destination entirely; corrected 2026-07-04 after verifying against the live space). So slugs from the WP export can collide with existing entries. We **reuse and additively extend** the existing types rather than creating parallel ones:
  - `BlogPost` (real schema, confirmed via Management API 2026-07-04 — corrects the assumption below the original plan was built on): `title`/`slug`/`publishDate`/`description` **required**; `heroImage`/`revista` were **also required** until the 2026-07-04 migration relaxed both to optional (see Phase 4); `body` (RichText), `tags`, `nid`, `multipleChoice` already optional. No `excerpt` field — WP's excerpt maps to the existing required `description` field. Added via migration: `categories` (Array), `author`, `seoTitle`, `seoDescription`, all optional. Additive/optional fields are safe for mi-movilicemos, whose GraphQL queries select explicit fields.
  - `Revista` (existing: slug, title, fecha, coverImage, blogPostsCollection) — extend with optional pdfUrl/pdfAsset (linked/downloaded, not embedded), editionCategory, summary. The 118 WP editions import as `Revista` entries.
  - **Body format:** the existing `BlogPost.body` is Contentful **RichText**, not the markdown originally planned. Recommended: convert WP HTML → markdown → RichText at import (mi-movilicemos already has markdown→RichText conversion in its `scripts/create-course.mts`) so both apps share one body field; the Phase 0 neutral **markdown export remains the lossless, vendor-neutral canonical backup**. Settle at Phase 4 start (§5.1).
  - **Conflict strategy — refined with data, 2026-07-04, confirmed against the full 335-post collision-diff run (`yarn diff:cms`, see `scripts/diff-cms-collisions.ts`).** Per-field policy, not a blanket winner:
    - **Body text: WP wins**, re-imported for **all 335 posts** regardless of whether a Contentful match exists (215/335 matched by slug; Contentful's overlap is stale and 36% incomplete — see §2.5). The HTML→RichText conversion step must **clean up WP's mojibake** (broken smart-quote bytes) as part of the pipeline — the export already does this (`scripts/export-wp.ts`), verified zero residual mojibake across all 335 exported files.
    - **Images: per-post resolution comparison**, not a blanket source. `scripts/diff-cms-collisions.ts` computes an `imageVerdict` per matched post (`width × height` on each side, larger wins): of the 215 matches, WP wins 187 (`wp-higher-res`) + 115 have no Contentful image to begin with (`wp-has-cf-missing`, some overlap with the 187), Contentful wins **22** (`cf-higher-res` — e.g. `dios-llama-y-la-iglesia-envia`: WP 1280×774 vs. Contentful 5887×3776), 6 keep Contentful's because WP has none (`wp-missing-cf-has`), 5 have neither. Phase 4's import consumes `imageVerdict` directly rather than hard-coding WP.
    - **Revista↔BlogPost links: Contentful wins** — where an existing `BlogPost` matches a WP slug and already has a `revista` back-reference, that link is **preserved** on upsert (re-attached to the re-imported entry) rather than dropped, since it's a real structural relationship the WP REST API doesn't expose directly (§2.1's `keydesign-portfolio` CPT gap). All 215 matches in the live run had one.
    - Mechanically still a **slug-keyed upsert, existing entries updated in place** (never deleted/recreated) — same infrastructure as before, just field-scoped instead of whole-entry.
    - `scripts/diff-cms-collisions.ts` also flags **suspicious body-length mismatches** (>5x ratio either direction) between a WP post and its Contentful match, for manual review before import — 2 flagged in the live run, both confirmed benign (same title/slug, Contentful's PDF-sourced version was just a shorter excerpt of the same article).
    - Output: `export/collision-diff.json` (335 entries + summary) is the pre-import collision diff report — every overwrite is reviewed, not silent, before Phase 4's actual Management API writes run.
  - `author`, `category`, `tag` — new reference types (no conflict; mi-movilicemos ignores them).
  - `redirect` — new type: from/to/status, so the alias map (`/revistavamos/<slug>` → `/la-revista/<slug>`, plus anything dropped at launch) is editor-maintainable.
  - The ~8 Elementor-replacement pages are **code, not Contentful entries** — their copy is static and lives in the components for day 1. A `pageSection` type can be added later if editors ever need to change hero copy, but that is explicitly out of the launch scope.
  - All routes statically generated at build; Contentful publish webhooks hit an `/api/revalidate` route for on-demand ISR — no full redeploy per post.
  - Contentful is queried via **GraphQL** (`graphql-request`, same library and endpoint pattern as mi-movilicemos). Env vars: `CONTENTFUL_SPACE_ID`, `CONTENTFUL_ACCESS_TOKEN` (same names as mi-movilicemos). `images.ctfassets.net` in `next.config.ts` `remotePatterns` for `next/image`.
  - A thin typed accessor (`lib/cms.ts`, zod-validated) isolates the GraphQL client so it's swappable and unit tests can run against recorded fixtures (same MSW approach as mi-movilicemos's `E2E_MOCK_CONTENTFUL`).
- **Images:** WP media imported as Contentful assets; `next/image` with the Contentful Images API loader (resizing/AVIF). Explicit width/height everywhere to eliminate CLS. Design/layout images (hero backgrounds, parallax) stay in the repo under `public/`.
- **Parallax:** the POC's vanilla `requestAnimationFrame`/`background-attachment` technique wrapped in a small client component; respect `prefers-reduced-motion`.
- **SEO:** Metadata API per route reproducing Yoast output (title pattern, meta description, canonical, OG/Twitter, `Article` JSON-LD on posts); `app/sitemap.ts`, `app/robots.ts`; a `redirects()` map preserving every legacy URL.
- **Search:** the header search currently hits WP search. Replace with a client-side index (Pagefind over the statically built pages) — zero backend. Caveat on Vercel: the Pagefind index is generated at **build time**, so posts published via on-demand ISR appear on the site immediately but in search only after the next deploy. Acceptable for this publishing cadence; if not, add a Contentful → Vercel deploy hook (debounced) alongside the revalidate webhook.
- **Analytics:** MonsterInsights is just GA — re-add GA4 (or PostHog, already in use for mi-movilicemos) via a script component.
- **Hosting:** **Vercel** (decided 2026-07-03) — static output + serverless route handlers. No WP in production post-cutover.

---

## 5. Resolved decisions & remaining small choices

**Resolved (2026-07-03):**
- **Approach C** — rebuild + Contentful for blog/revista.
- **Contentful = the existing shared space** used by mi-movilicemos ([contentful.md](contentful.md)); reuse + additively extend its `BlogPost`/`Revista` types. **Per-field conflict policy** (data-driven, §2.5): WP wins on body text (mojibake-cleaned) and images — re-imported for all 335 posts regardless of overlap; existing Contentful `revista` back-references are preserved on upsert. Reviewed via a pre-import collision diff report.
- **Donations dropped entirely, all references removed** — no GiveWP, no donor dashboard, no donate CTAs anywhere on the new site; legacy `/donations/*` URLs 301 → homepage in the Phase 7 redirect map.
- **Deploy target: Vercel.**
- **Contact form → Next.js route handler + Resend** (Vercel has no native forms product).
- **Archives: keep both** tag (28) and author (2) archive pages.
- **PDF handling** → plain download/view links, no embedder.
- **Elementor pages** → rebuilt as code with static copy; no CMS-editability required for launch.
- **POC location** → the static homepage POC now lives in `poc/`; the Next.js app is scaffolded at the repo root in Phase 1.

**Small remaining choices (do not block Phases 0–3; settle at Phase 4 start):**
1. **Body format detail** — single shared RichText body converted at import (recommended, §4) vs. adding a parallel markdown field (drift risk between two bodies).
2. **Contentful environment rollout** — dry-run the model migration + import in a sandbox environment, then decide how it lands in the environment mi-movilicemos reads (production content is live there) and how mi-movilicemos is regression-checked afterwards.

---

## 6. Verification strategy (applies to every phase)

The core loop at each phase: **capture live-site screenshots → build the Next.js equivalent → diff with Playwright → fix until within threshold → advance**. This runs at three viewports every time, so mobile regressions surface at the same phase as desktop ones.

### 6.1 Baseline capture (Phase 0 artifact)

- **Playwright `baseline` project** targets `https://misionessim.org` directly. It runs **logged out** (the WP admin bar adds 32–46px when logged in) and captures two shot types per route:
  - Above-the-fold (viewport clip) — sensitive to header/hero layout.
  - Full-page — catches footer and scroll-position-dependent sections.
- Three Playwright viewport projects (all using Chromium; add Firefox/WebKit in Phase 7 if needed):

  | Project | Viewport | Device analogue |
  |---|---|---|
  | `baseline-mobile` | 375 × 812 | iPhone SE |
  | `baseline-tablet` | 768 × 1024 | iPad |
  | `baseline-desktop` | 1440 × 900 | standard laptop |

- Output: `reference/baselines/<route>/<viewport>.(above-fold|full-page).png`. Routes covered: every URL in `data/url-inventory.json` — homepage, all 8 static pages, a representative sample of blog posts + revista issues (not all 455; full sweep in Phase 7).
- Simultaneously `wget --mirror` → `reference/mirror/` (git-LFS or gitignored) for an HTML/asset snapshot independent of the live site.

### 6.2 Visual regression (Playwright)

- **`visual` Playwright project** runs the same viewport trio against the **Next.js dev/build server** (or the Vercel preview URL in CI).
- `expect(page).toHaveScreenshot({ name: '<route>/<shot>.png' })` with the Phase 0 files as the golden reference (`snapshotDir: 'reference/baselines'`).
- Common settings applied to every visual test:
  ```ts
  animations: 'disabled',
  // Wait for fonts before snapping
  page.waitForFunction(() => document.fonts.ready),
  // Freeze parallax (prefers-reduced-motion emulation or ?noParallax=1 query param)
  ```
- **Mask dynamic regions** (latest-posts widget, YouTube `zx8x6J7vPNI` thumbnail, any date-relative text) with `page.locator('.dynamic').toHaveScreenshot({ mask: [...] })` — avoids false diffs.
- Start at `maxDiffPixelRatio: 0.02` per page; tighten per-route as parity improves. Known intentional diffs (donation-page removal, redesigned 404) are documented and excluded.
- **Runs in CI on every PR** across all three viewport projects. Fails the PR until the diff is within threshold or documented as intentional.

### 6.3 Unit / integration tests (Vitest + React Testing Library)

- **The content pipeline is the highest-value unit-test target** — both hops: WP → neutral JSON (heading/image/embed conversion, Spanish-accented slugs, URL mapping `/blog/2017-07/slug/` preserved exactly, media manifest completeness: 335 + 118 items, zero missing) and neutral JSON → CMS (idempotent upserts, asset-reference rewriting, reconciliation counts).
- `lib/cms.ts` tested against recorded GraphQL fixtures (same MSW approach as mi-movilicemos's `E2E_MOCK_CONTENTFUL`) so the suite runs offline and deterministic.
- Component tests: header (fixed white bar, CTA present, mobile menu), hero (title/columns), listing pagination, taxonomy filtering.
- Route tests: every URL from the legacy sitemaps resolves in the new app (generated from the Phase 0 URL inventory — this single test prevents silent content loss).

### 6.4 Functional e2e (Playwright, non-visual)

- Navigation, mobile menu, search returns known post, form submission (mocked Resend handler), PDF links resolve, parallax elements move on scroll (assert `backgroundPositionY`/transform changes between two scroll positions), no page contains donation links.

### 6.5 Performance gates (Lighthouse CI)

- Budgets enforced in CI from Phase 2 onward: Performance ≥ 95, LCP < 2.0s, CLS < 0.05, TBT < 150ms on homepage + one post + one revista page (mobile emulation). The current Elementor site will score far below this; the delta is the migration's headline win.

---

## 7. Phased implementation plan

Each phase ends with: all tests green in CI, visual diffs within threshold for the routes it owns, and a short written phase report. Phases are sized for Claude Code sessions.

### Phase 0 — Inventory, baselines, and content export tooling

**Goal:** freeze ground truth; build the export pipeline.

- Crawl sitemaps → `data/url-inventory.json` (every legacy URL + type). Include the `/revistavamos/<slug>` alias URLs (§2.1) — generate them from the edition slug list, since they appear in no sitemap.
- Capture Playwright baselines of live site (logged out, 3 viewports) → `reference/baselines/`.
- `wget` mirror snapshot → `reference/mirror/`.
- Write `scripts/export-wp.ts`: pulls posts/pages/media/taxonomies via REST; expose `keydesign-portfolio` in REST via a one-line mu-plugin (we have admin) or fall back to WP-CLI on a local copy. Do **not** scrape rendered HTML for the revista editions — they only surface client-side via admin-ajax (§2.1).
- Normalize into a **neutral intermediate**: `export/*.json` + markdown bodies with typed metadata (`title, slug, date, categories, tags, author, featuredImage, yoastTitle, yoastDescription`); download all referenced media with an integrity manifest. This neutral layer is deliberate: it feeds the Contentful import (Phase 4), serves as the vendor-independent backup, and is what we diff against at the Phase 7 content freeze.
- **Tests:** unit tests on converter fixtures (accents, embeds, image URLs); manifest assertions (335 posts, 118 revista, 0 missing images).
- **Exit:** re-runnable one-command export; inventory + baselines committed.

### Phase 1 — Next.js scaffold, design system, global layout

**Goal:** app shell that matches the site chrome.

- `create-next-app` — Next.js 16, React 19, TypeScript, App Router, Tailwind v4.
- `next.config.ts` mirrors mi-movilicemos's config: `trailingSlash: true`, `reactStrictMode: true`, `images.remotePatterns` for `images.ctfassets.net` + `img.youtube.com`; **no** `output: "export"` (needs route handlers).
- Tailwind v4 `@theme` tokens matching sim-blog's `globals.css` exactly — same token names, same values (§4).
- `next/font` with Raleway + Work Sans, `display: swap`, latin subset — same weight selections as sim-blog's `layout.tsx`.
- Header (fixed white 71px, logo, nav, search icon, "Servir con SIM" CTA), footer, mobile menu.
- **Playwright config:** four projects from day 1 —
  - `baseline-mobile`, `baseline-tablet`, `baseline-desktop` — target `https://misionessim.org` (Phase 0 baseline capture, not in CI).
  - `visual-mobile`, `visual-tablet`, `visual-desktop` — target local dev server, compare against `reference/baselines/`.
  - `e2e` — functional tests (Desktop Chrome, same pattern as mi-movilicemos).
- **Vitest + React Testing Library** for component/unit tests (Vitest preferred over Jest for ESM/Tailwind ecosystem; mi-movilicemos uses Jest but is pre-existing).
- Lighthouse CI config (`lighthouserc.json`) wired to fail below budget thresholds.
- **Tests:** header/footer component tests; visual diff of chrome-only page vs. baseline crops at all 3 viewports.
- **Exit:** CI pipeline running all three test types; all viewport diffs within threshold for the chrome-only page.

### Phase 2 — Homepage

**Goal:** port the verified POC into Next.js components.

- Decompose `index.html` into sections: Hero (95vh, parallax), red "SIM es una comunidad…" H3, Conócenos (parallax `bg-sim.jpg`), video section (lazy YouTube facade for `zx8x6J7vPNI`), Revista VAMOS (parallax), etc.
- Parallax as a reusable client component with `prefers-reduced-motion` support.
- **Tests:** section component tests; full-page visual diff desktop + mobile vs. live baseline; parallax e2e; first Lighthouse gate.
- **Exit:** homepage within diff threshold at all 3 viewports; Lighthouse ≥ 95.

### Phase 3 — Static pages

**Goal:** the remaining Elementor pages, hand-rebuilt.

- `/nosotros/`, `/sirve-con-sim/`, `/ora/`, `/recursos/`, `/declaracion-de-fe-de-sim/`, `/terms-and-conditions/`, `/revistavamos/` (landing only; issue pages are Phase 5).
- Extract shared section components (CTA bands, icon lists, carousels → scroll-snap).
- **Tests:** visual diff per page/viewport; carousel interaction e2e.
- **Exit:** all 7 pages within threshold.

### Phase 4 — Contentful setup + blog (335 posts + archives)

**Goal:** model the content backend and migrate the long tail.

- Use the existing **shared** Contentful space (§4); model changes are **additive migrations to the existing `BlogPost`/`Revista` types** plus the new `author`/`category`/`tag`/`redirect` types, defined as code (Contentful migration CLI scripts, committed to the repo — never hand-edit the model in the web UI). Dry-run the model migration and full import in a **sandbox environment** first; the space carries live mi-movilicemos production content, so verify mi-movilicemos still works after the migration lands (its GraphQL queries select explicit fields, so additive optional fields should be safe — verify anyway).
- **Environments (discovered 2026-07-04, checked via Management API — not assumed):** the space has `main` (real), `master` (a Contentful environment **alias** pointing at `main` — same data, not a separate environment; our CDA token is scoped only to `master`, GraphQL 400s on any other environment), and `development` (a sandbox, but **not a clean mirror** of production — 792 vs. 791 blogPosts, at least one entry present in one and missing from the other). `import-cms.ts` and `run-migration.ts` both treat `master` and `main` as equally production and refuse to target either without `--force`.
- `scripts/export-wp.ts` (built and run 2026-07-04): WP REST → `export/posts/<slug>.md` (YAML frontmatter + markdown body, mojibake/entity-cleaned) + `export/media/blog/` (featured images) + `export/manifest-blog.json` (integrity report). All 335 posts exported; 324/335 have a featured image (11 genuinely have none on WP).
- `scripts/diff-cms-collisions.ts` (built 2026-07-04, extended to support `--environment=<id>`): compares every exported post against a Contentful environment, computes the per-post `imageVerdict` and revista-link/suspicious-mismatch flags. Default (no flag) reads `master` via GraphQL; `--environment=<id>` reads any environment via the Management API instead (resolving `heroImage`/`revista` links manually, since Management API returns unresolved link objects, not GraphQL's auto-resolved shape) — necessary because environments are not clean mirrors of each other, so a plan computed against one environment's IDs would silently misfire against another. Output: `export/collision-diff.json` (master) or `export/collision-diff.<id>.json`. Rerun before every real import to catch drift.
- **Content-type migrations (`cms/migrations/`, run via `scripts/run-migration.ts` / `yarn migrate:cms`)** — the real `blogPost` schema, checked via the Management API rather than assumed, turned out stricter than planned: `heroImage` and `revista` were both **required** (not optional as originally modeled), and none of `excerpt`/`categories`/`author`/`seoTitle`/`seoDescription` existed (there's a required `description` field instead, serving the excerpt role). Two migrations, run successfully against `development`:
  - `001-relax-blogpost-required-fields.js` — `revista` and `heroImage` → optional. Non-breaking (relaxes a constraint; doesn't touch existing data or mi-movilicemos's queries). Necessary because most WP posts (297/335 against `development`, 120/335 against production) aren't part of any magazine issue, and ~15 posts have no image on either side.
  - `002-add-blogpost-seo-and-taxonomy-fields.js` — adds `categories` (Array of Symbol), `author` (Symbol), `seoTitle` (Symbol), `seoDescription` (Text), all optional.
  - Written as plain CommonJS (`module.exports = function`), not TypeScript — `contentful-migration`'s loader `require()`s the file directly and doesn't unwrap a TS `export default`. Uses the `contentful-migration` package's JS API directly (not the `contentful` CLI binary) to avoid the credential-exposure risk of a separate CLI login flow.
  - Same production safety rail as `import-cms.ts`: requires explicit `--environment`, refuses `master`/`main` without `--force`.
- `scripts/import-cms.ts` (built 2026-07-04, `yarn import:cms`): consumes `export/collision-diff[.<env>].json` + `export/posts/*.md` → Contentful Management API writes, via `scripts/lib/markdown-to-richtext.ts` for the body conversion (a hand-rolled converter scoped to exactly the corpus's markdown constructs — paragraphs, h1–h4, bold/italic, links, lists, blockquotes, inline images; 41 unit tests, validated error-free against all 335 real bodies). WP's `excerpt` maps to Contentful's `description` field (not a same-named field). **Idempotent upserts keyed by slug**; uploads media as assets (whichever side `imageVerdict` picked); on a matching slug WP's title/body overwrite the entry, the winning image per `imageVerdict` is set, and an existing `revista` back-reference is preserved untouched. Existing entries are updated in place — never deleted/recreated.
  - **Two modes.** Default (no flags) is a **dry-run**: computes the full plan and writes `export/import-plan[.<env>].json`, zero Contentful API calls. `--live --environment=<id>` executes it — requires `CONTENTFUL_MANAGEMENT_TOKEN`, requires an explicit environment (no default), refuses `master`/`main` without `--force`. Also supports `--limit=N` and `--slugs=a,b,c` to scope a live run to a subset, for staged testing before a full batch.
  - **Live write path validated 2026-07-04** — every code path exercised individually against `development` and verified field-by-field via direct Management API reads afterward (not just "no error thrown"): create+image, update+image+revista-preserved (confirmed the list-merge/escaped-marker markdown fixes hold against real Contentful data — the imported entry has exactly the expected 12 list items), create+no-image, update+kept-Contentful-image (confirmed the existing higher-res image, 2368×4208, was correctly left untouched rather than overwritten by WP's smaller one). ~20 posts written this way. First attempt failed correctly (422 `UnknownField`, no partial write) before the schema migrations above were built — a useful signal that the plan's assumed schema needed verifying, not assuming.
  - **Full 335-post batch against `development` not yet run** — held pending explicit go-ahead. Plan is ready and regenerated post-testing (297 create + 38 update, confirmed clean — won't attempt to duplicate-create the ~20 already-written test posts).
  - **Production (`master`/`main`) run**: not started. Plan: re-run both migrations there (same low-risk additive changes), regenerate `collision-diff.json` fresh, review once more, then `--live --environment=main --force`.
- `lib/cms.ts` typed accessor (zod-validated), with recorded-fixture mode for tests; `/api/revalidate` webhook route for on-demand ISR.
- Post template; `/blog/` index with pagination matching current UX; category (36), tag (28), and author (2) archives — all kept (decided 2026-07-03).
- **Exact URL preservation**: `/blog/YYYY-MM/slug/`.
- `Article` JSON-LD; per-post metadata from exported Yoast fields.
- **Tests:** import-script unit tests (idempotency — running twice creates nothing new; slug/accent fidelity); post-import reconciliation script (335 entries in CMS, zero missing assets); route test asserting every inventory URL builds from CMS data; `lib/cms.ts` unit tests against fixtures; revalidation webhook test; visual diff on 5 representative posts (text-only, image-heavy, embed, oldest 2017, newest 2026) + index + one category page.
- **Exit:** all 335 posts served from the CMS; editing a post in the CMS updates the site without a redeploy; spot-check diffs pass; build time acceptable.

### Phase 5 — La Revista (118 items)

**Goal:** magazine section.

- Import the 118 editions (from the Phase 0 export) as **`Revista` entries — the existing shared type, extended per §4**. Some editions already exist in the space (110 `Revista` entries found in the §2.5 audit, from the earlier VAMOS-PDF import): same slug-keyed upsert + collision-diff + per-field policy as Phase 4 (WP wins on cover image/summary if better; existing `blogPostsCollection` links are preserved), updating in place. Model issues vs. articles (6 portfolio categories); issue template with **PDF as a plain download/view link + cover image** (no embedder); `/la-revista/` hub + `/revistavamos/` landing with its Ediciones grid/carousel rendered server-side from Contentful data (replacing the admin-ajax carousel).
- Generate the `/revistavamos/<slug>` → `/la-revista/<slug>` alias redirects for all 118 editions (§2.1).
- **Tests:** 118-route build assertion; alias-redirect e2e (sample of edition slugs return 301 to `/la-revista/...`); visual diff on hub + 3 representative issues; PDF link e2e.
- **Exit:** section complete within thresholds; editions maintainable in the CMS.

### Phase 6 — Forms & search

**Goal:** the last interactive pieces (donations are out of scope).

- Contact form → plain HTML form + honeypot posting to a Next.js route handler that sends email via **Resend** (decided 2026-07-03); submissions arrive by notification email. No WP.
- Search → Pagefind over the statically built pages, wired to the header search icon.
- Donations → sweep the rebuilt pages for any remaining donation references (CTAs, footer links, copy) and remove them; `/donations/*` 301s land in the Phase 7 redirect map.
- **Tests:** form component/render test (correct action + honeypot + required fields); form e2e submits to a mocked Resend handler; search e2e ("VAMOS" returns revista results); assert no rendered page contains donation links.
- **Exit:** contact form delivers on the deploy platform; search works; no user-facing feature depends on WordPress.

### Phase 7 — SEO parity, hardening & cutover

**Goal:** don't lose rankings; lock in speed; launch.

- **SEO parity:** diff old vs. new `<head>` for every route type (script comparing live Yoast output to Next Metadata output); `sitemap.ts` + `robots.ts`; 301 map for anything intentionally changed/dropped (donation pages, tag/author archives if cut, `/revistavamos/<slug>` aliases); 404 + `not-found` design.
- **Perf hardening:** image audit (dimensions, priority hints, formats), font subsetting check, JS bundle budget.
- **Final content sync:** content freeze on WP; re-run the Phase 0 export, diff against the neutral snapshot, and import the delta into Contentful (idempotent upserts make this safe). From this point Contentful is the single source of truth.
- **Cutover:** full visual-regression sweep + report of intentional diffs for PM sign-off; DNS cutover (low-TTL prep); keep WP alive read-only ~30 days as rollback; post-launch monitoring (404 logs, Search Console, analytics continuity).
- **Tests:** metadata snapshot tests per route type; redirect-map e2e (every legacy URL → 200 or intended 301, including donation-page 301s and revista aliases); Lighthouse gates on all page types; final full visual sweep.
- **Exit:** production serves Next.js; full legacy URL inventory returns 200/301; Lighthouse budgets met site-wide; rollback documented; WP decommission scheduled.

---

## 8. Risks & mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Content drifts while we migrate (editors keep publishing to WP) | Baselines go stale, content missed | wget mirror pins baselines; content freeze + delta re-export in Phase 7; route test auto-detects new posts |
| Pixel-parity rabbit holes on low-traffic pages | Schedule blowout | Per-page diff thresholds; PM signs off a documented list of intentional diffs instead of chasing 0% |
| Donation traffic/links lost after dropping GiveWP | Confused donors, lost giving | 301 the old `/donations/*` URLs to the homepage; announce the change; monitor 404s post-launch |
| Shared-space migration breaks mi-movilicemos (model change or overwritten entries) | Live learning app degrades | Additive-only model migrations (optional fields); dry-run in sandbox environment; pre-import collision diff report; update entries in place (never delete/recreate); run mi-movilicemos's test suite / spot-checks after the migration lands |
| Spanish-accented slugs / encoding bugs in export | Broken URLs, SEO loss | Converter unit tests with accent fixtures; byte-exact URL inventory assertion |
| CMS import partial failure (rate limits, timeouts) | Missing posts/assets nobody notices | Idempotent resumable import; post-import reconciliation script asserting exact entry/asset counts vs. the neutral export |
| CMS vendor cost creep or lock-in regret | Forced re-migration | Neutral JSON export is the canonical backup and re-runnable from the CMS; only `lib/cms.ts` + import script are vendor-specific (Approach B remains the documented fallback) |
| Rich-text fidelity loss in CMS (embeds, HTML edge cases) | Posts render differently than WP | Phase 0 neutral **markdown** export is the lossless canonical backup regardless of the in-CMS body format (§5.1); converter fixtures for embeds; visual diffs on representative posts |
| Visual tests flaky (fonts, animations, YouTube) | CI noise erodes trust | `fonts.ready` waits, animation disabling, masking dynamic regions, generous-then-tightening thresholds |
| Search Console ranking dip | Traffic loss | URL preservation as hard requirement; metadata diffing in Phase 7; sitemaps submitted at cutover |

---

## 9. Suggested repo layout

The Next.js app lives at the root of **this repo** (the static homepage POC was moved to `poc/` on 2026-07-03).

### Sister projects

| Project | Path | Stack | Host | Relation |
|---|---|---|---|---|
| **sim-blog** | `~/websites/learn/sim-blog` | Next.js 16, Tailwind v4, `output: "export"` | GitHub Pages → `historias.misionessim.org` | Same design tokens + fonts; no Contentful. misionessim-new will cross-link to it. |
| **mi-movilicemos** | `~/websites/poc/mi-movilicemos` | Next.js 16, Jest, Playwright, Vercel | — | Shares the Contentful space; has the GraphQL client pattern, Resend, and MSW mock approach to copy from. |

misionessim-new aligns with these rather than reinventing patterns. Code (GraphQL clients, Contentful types, RichText renderer) can be copied from mi-movilicemos; Tailwind token names copied from sim-blog.

```
misionessim-new/
├── poc/                    # static homepage POC (reference; serve via "sim-home" launch config)
├── app/                    # App Router routes (+ api/revalidate webhook)
├── components/             # Header, Hero, Parallax, sections…
├── lib/cms.ts              # typed CMS accessor (zod), vendor-isolated
├── cms/                    # content model as code (migration scripts)
├── export/                 # neutral WP export: JSON + markdown + media manifest
├── data/                   # url-inventory.json, redirects.json
├── public/                 # design/layout assets (hero, parallax bgs)
├── scripts/
│   ├── export-wp.ts        # Phase 0: WP REST → neutral JSON
│   ├── import-cms.ts       # Phase 4: neutral JSON → CMS (idempotent)
│   └── reconcile.ts        # counts/assets parity check
├── reference/              # baselines/ + mirror/ (git-lfs or ignored)
├── tests/
│   ├── unit/               # Vitest (+ recorded CMS fixtures)
│   ├── e2e/                # Playwright functional
│   └── visual/             # Playwright screenshot specs
└── lighthouserc.json
```

---

*Prepared by Claude Code. Sources: live sitemap/REST inspection on 2026-07-03; design tokens and layout facts verified against the live DOM during the homepage POC build (this repo).*
