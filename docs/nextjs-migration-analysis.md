# misionessim.org → Next.js: Migration Analysis & Phased Implementation Plan

**Date:** 2026-07-03 (updated same day for: Contentful decision + existing infra, /revistavamos/ investigation, and scope-narrowing decisions — donations dropped, no donor dashboard, forms via host platform, no PDF embedder, Elementor pages static/code-first)
**Status:** Approach chosen (C) — ready to implement
**Context:** We have full admin access to the WordPress site and can make a local copy. A static HTML/CSS/JS replica of the homepage already exists in this repo (`poc/index.html`, `poc/css/styles.css`, `poc/js/main.js` — moved into `poc/` on 2026-07-03) and was verified near pixel-perfect against the live site.

---

## 1. Executive summary

misionessim.org is a WordPress + Elementor site with a small number of hand-built pages and a large body of clean, structured content (blog + magazine). The **chosen approach (C) is a full rebuild of the presentation layer in Next.js, with blog posts and revista editions migrated into Contentful** (existing infra — see below), not a headless-WordPress integration. The reasons, in short:

- Only **~8 pages** are Elementor-built and they are **truly static** — they will not change during the migration. They are rebuilt once as React components; their copy lives in code for day 1 (optionally moved to markdown/Contentful later).
- Everything with a long tail — 336 blog posts + 119 revista editions — is structured content and goes into **Contentful**, where editors already have infrastructure and a publishing workflow. The frontend stays fully static with on-demand revalidation.
- Elementor markup is unusable in a headless frontend, so keeping WP as a headless CMS would buy nothing while adding a permanent WP server to the critical path.
- The homepage POC in this repo proves the rebuild approach works and already encodes the design system (colors, fonts, header, hero, parallax).

**Scope decisions locked in (2026-07-03):**
- **Donations (GiveWP) are out of scope** — dropped entirely, **all references removed**: no donor dashboard, no donate CTAs; legacy `/donations/*` 301 → homepage.
- **Deploy target: Vercel** (decided 2026-07-03). Vercel has **no native forms product** (that's Netlify-only), so the contact form is a plain HTML form posting to a small serverless route handler that sends email via **Resend** (decided 2026-07-03). No WP either way.
- **PDF embedder is not replaced** — revista PDFs are plain download/view links.
- **Contentful is the CMS — specifically the existing shared space used by sim-blog**, which already has `BlogPost`/`Revista` types and some VAMOS content (see §4 and [contentful.md](contentful.md)). On conflicts, misionessim.org content wins.
- **Tag and author archives are both kept.**

The plan is structured in **8 phases** (0–7), each with explicit exit criteria, unit tests (Vitest), and Playwright visual-regression checks against baseline screenshots captured from the live site.

---

## 2. Current site audit

### 2.1 Content inventory (from Yoast sitemaps + REST API, 2026-07-03)

| Content type | Count | Built with | REST-exposed? | Disposition |
|---|---|---|---|---|
| Pages | 8 | Elementor (static) | yes (`/wp-json/wp/v2/pages`) but content is Elementor markup | **Rebuild by hand as code** (copy in components day 1) |
| Blog posts (`/blog/YYYY-MM/slug/`) | 336 | Gutenberg (clean `wp-block-*` HTML) | yes (`/wp-json/wp/v2/posts`) | **→ Contentful** (scripted export/import) |
| La Revista items (`/la-revista/slug/`) | 119 | Elementor, via `keydesign-portfolio` CPT | **no** (not registered in REST) | **→ Contentful** (needs REST-exposure snippet or WP-CLI) |
| GiveWP donation forms (`/donations/...`) | 8 | GiveWP plugin | yes (`give_forms`) | **Dropped — out of scope** |
| Categories / tags | 36 / 28 | taxonomy archives | yes | → Contentful references; generated archive pages |
| Portfolio categories | 6 | taxonomy archives | no | Generated pages once CPT is exported |
| Authors | 2 | author archives | yes | → Contentful; keep or drop (§5.2) |

The 8 in-scope pages: home, `/sirve-con-sim/`, `/nosotros/`, `/recursos/`, `/revistavamos/`, `/ora/`, `/declaracion-de-fe-de-sim/`, `/terms-and-conditions/`. The three GiveWP utility pages (`/donation-confirmation/`, `/donation-failed/`, `/donor-dashboard/`) are **dropped** with donations.

**The `/revistavamos/` URL space (investigated 2026-07-03).** The magazine editions that appear "under" `/revistavamos/` are the 119 `keydesign-portfolio` items — canonically served at `/la-revista/<slug>/` and present in `keydesign-portfolio-sitemap.xml`, so no content is missing from the inventory. Three implementation-relevant facts, though:

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

Rebuild the ~8 Elementor pages as hand-crafted Next.js components (the homepage POC is the template for this). Export all structured content (336 posts, 119 revista items, taxonomies, media) once via scripts into the repo as MDX/JSON + downloaded assets. Ship as a fully static Next.js site (`output: 'export'` or static-rendered App Router on Vercel/Netlify).

**Pros**
- **Best possible performance**: every page pre-rendered, no origin server, no DB. This directly serves the stated goal ("performant site").
- No WordPress in production — the entire plugin/security/hosting burden disappears after cutover.
- Content is version-controlled; the whole site is reproducible from the repo.
- The content pipeline (WP → MDX) is a script we write once and can re-run right before cutover to catch late edits.
- The existing homepage POC de-risks the hardest page and is directly portable.

**Cons**
- Content publishing changes: new posts are MDX files + a deploy, not a WP editor. (Mitigable: the sim-blog project and `import-vamos` workflow suggest content ops are already moving toward file/scripted workflows; also MDX-on-GitHub editors or a later CMS bolt-on are cheap.)
- Donations and contact forms need replacements (true in every approach except A).

**Verdict:** Technically right-sized for a ~470-item, 2-author site, and everything in it except the final storage target carries over to Approach C. **Superseded by the decision to give editors a CMS** — kept documented as the fallback if CMS costs or complexity become a problem.

### Approach C — Rebuild + Contentful for structured content — **CHOSEN (2026-07-03)**

Presentation-layer rebuild as in B, but the structured long tail (336 blog posts, 119 revista editions, taxonomies, authors) lands in **Contentful** — infra David already has. The ~8 Elementor pages are hand-built React components with their copy in code for day 1 (they're static and won't change during migration); moving that copy to markdown/Contentful is an optional later enhancement, not a launch requirement.

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

- **Next.js 15+ App Router, TypeScript, static rendering** for all routes (SSG + on-demand ISR from Contentful webhooks). No long-running server — the only server-side pieces are serverless route handlers (`/api/revalidate`, and the contact form if we go the route-handler path).
- **Styling:** CSS Modules with design tokens as CSS custom properties (`--color-primary: #C91430`, etc.). This ports the POC's vanilla CSS most directly and keeps the pixel-parity work honest. (Tailwind is fine too, but translating already-verified CSS into utilities adds risk without benefit.)
- **Fonts:** `next/font` with Raleway + Work Sans, `display: swap`, subset to latin — removes Google Fonts render-blocking.
- **Content layer:** **Contentful — the existing shared space** already used in production by the sim-blog learning app (documented in [contentful.md](contentful.md), copied from that project). The space already has `BlogPost` and `Revista` content types (plus `ResourceGroup`/`Resource`, which this site ignores) and **already contains VAMOS-derived content** imported via the `import-vamos` workflow — so slugs from the WP export can collide with existing entries. We **reuse and additively extend** the existing types rather than creating parallel ones:
  - `BlogPost` (existing: slug, title, publishDate, nid, body as **RichText JSON**, multipleChoice, heroImage, revista back-ref) — extend with optional fields the WP posts need: excerpt, categories/tags/author (refs), seoTitle, seoDescription. Optional additions are safe for sim-blog, whose GraphQL queries select explicit fields.
  - `Revista` (existing: slug, title, fecha, coverImage, blogPostsCollection) — extend with optional pdfUrl/pdfAsset (linked/downloaded, not embedded), editionCategory, summary. The 119 WP editions import as `Revista` entries.
  - **Body format:** the existing `BlogPost.body` is Contentful **RichText**, not the markdown originally planned. Recommended: convert WP HTML → markdown → RichText at import (sim-blog already has markdown→RichText conversion in its `scripts/create-course.mts`) so both apps share one body field; the Phase 0 neutral **markdown export remains the lossless, vendor-neutral canonical backup**. Settle at Phase 4 start (§5.1).
  - **Conflict strategy (David, 2026-07-03):** import is slug-keyed upsert and **misionessim.org (the WP export) is authoritative** — on discrepancy it overwrites the Contentful entry. Phase 4 produces a pre-import collision diff report so overwrites are reviewed, not silent; extending (never deleting/recreating) existing entries preserves sim-blog's references to them.
  - `author`, `category`, `tag` — new reference types (no conflict; sim-blog ignores them).
  - `redirect` — new type: from/to/status, so the alias map (`/revistavamos/<slug>` → `/la-revista/<slug>`, plus anything dropped at launch) is editor-maintainable.
  - The ~8 Elementor-replacement pages are **code, not Contentful entries** — their copy is static and lives in the components for day 1. A `pageSection` type can be added later if editors ever need to change hero copy, but that is explicitly out of the launch scope.
  - All routes statically generated at build; Contentful publish webhooks hit an `/api/revalidate` route for on-demand ISR — no full redeploy per post.
  - A thin typed accessor (`lib/cms.ts`, zod-validated) isolates the Contentful SDK so it's swappable and unit tests can run against recorded fixtures.
- **Images:** WP media imported as Contentful assets; `next/image` with the Contentful Images API loader (resizing/AVIF). Explicit width/height everywhere to eliminate CLS. Design/layout images (hero backgrounds, parallax) stay in the repo under `public/`.
- **Parallax:** the POC's vanilla `requestAnimationFrame`/`background-attachment` technique wrapped in a small client component; respect `prefers-reduced-motion`.
- **SEO:** Metadata API per route reproducing Yoast output (title pattern, meta description, canonical, OG/Twitter, `Article` JSON-LD on posts); `app/sitemap.ts`, `app/robots.ts`; a `redirects()` map preserving every legacy URL.
- **Search:** the header search currently hits WP search. Replace with a client-side index (Pagefind over the statically built pages) — zero backend. Caveat on Vercel: the Pagefind index is generated at **build time**, so posts published via on-demand ISR appear on the site immediately but in search only after the next deploy. Acceptable for this publishing cadence; if not, add a Contentful → Vercel deploy hook (debounced) alongside the revalidate webhook.
- **Analytics:** MonsterInsights is just GA — re-add GA4 (or PostHog, already in use for sim-blog) via a script component.
- **Hosting:** **Vercel** (decided 2026-07-03) — static output + serverless route handlers. No WP in production post-cutover.

---

## 5. Resolved decisions & remaining small choices

**Resolved (2026-07-03):**
- **Approach C** — rebuild + Contentful for blog/revista.
- **Contentful = the existing shared space** used by sim-blog ([contentful.md](contentful.md)); reuse + additively extend its `BlogPost`/`Revista` types. On slug collisions with already-imported content, **misionessim.org wins** (slug-keyed upsert overwrites, reviewed via a pre-import diff report).
- **Donations dropped entirely, all references removed** — no GiveWP, no donor dashboard, no donate CTAs anywhere on the new site; legacy `/donations/*` URLs 301 → homepage in the Phase 7 redirect map.
- **Deploy target: Vercel.**
- **Contact form → Next.js route handler + Resend** (Vercel has no native forms product).
- **Archives: keep both** tag (28) and author (2) archive pages.
- **PDF handling** → plain download/view links, no embedder.
- **Elementor pages** → rebuilt as code with static copy; no CMS-editability required for launch.
- **POC location** → the static homepage POC now lives in `poc/`; the Next.js app is scaffolded at the repo root in Phase 1.

**Small remaining choices (do not block Phases 0–3; settle at Phase 4 start):**
1. **Body format detail** — single shared RichText body converted at import (recommended, §4) vs. adding a parallel markdown field (drift risk between two bodies).
2. **Contentful environment rollout** — dry-run the model migration + import in a sandbox environment, then decide how it lands in the environment sim-blog reads (production content is live there) and how sim-blog is regression-checked afterwards.

---

## 6. Verification strategy (applies to every phase)

### 6.1 Baseline capture (Phase 0 artifact)

- Playwright script captures **reference screenshots of the live site** (logged out — no admin bar) for every migrated route at three viewports: 375×812, 768×1024, 1440×900. Full-page and above-the-fold shots.
- Simultaneously `wget --mirror` a static snapshot of the rendered site into `reference/mirror/` (git-ignored or LFS) so baselines are reproducible even after WP content changes or the site goes down.
- Store screenshots in `reference/baselines/` — these are the ground truth for "matches closely."

### 6.2 Visual regression (Playwright)

- `expect(page).toHaveScreenshot()` comparing the Next.js build against the live-site baselines.
- Comparison settings: start at `maxDiffPixelRatio: 0.02` per page, tighten as parity improves; `animations: 'disabled'`; wait for `document.fonts.ready`; freeze parallax via a test-mode query param or `prefers-reduced-motion` emulation.
- **Mask dynamic regions** (latest-posts widgets, embedded YouTube `zx8x6J7vPNI` thumbnail, any date-driven content) rather than chasing false diffs.
- Run desktop + mobile in CI on every PR (`npx playwright test --project=chromium-desktop --project=chromium-mobile`).

### 6.3 Unit / integration tests (Vitest + React Testing Library)

- **The content pipeline is the highest-value unit-test target** — both hops: WP → neutral JSON (heading/image/embed conversion, Spanish-accented slugs, URL mapping `/blog/2017-07/slug/` preserved exactly, media manifest completeness: 336 + 119 items, zero missing) and neutral JSON → CMS (idempotent upserts, asset-reference rewriting, reconciliation counts).
- `lib/cms.ts` tested against recorded CMS fixtures so the suite runs offline and deterministic.
- Component tests: header (fixed white bar, CTA present, mobile menu), hero (title/columns, hidden "Dona aquí" stays hidden), listing pagination, taxonomy filtering.
- Route tests: every URL from the legacy sitemaps resolves in the new app (generated from the Phase 0 URL inventory — this single test prevents silent content loss).

### 6.4 Functional e2e (Playwright, non-visual)

- Navigation, mobile menu, search returns known post, form submission (mocked backend), PDF links resolve, parallax elements move on scroll (assert `backgroundPositionY`/transform changes between two scroll positions).

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
- **Tests:** unit tests on converter fixtures (accents, embeds, image URLs); manifest assertions (336 posts, 119 revista, 0 missing images).
- **Exit:** re-runnable one-command export; inventory + baselines committed.

### Phase 1 — Next.js scaffold, design system, global layout

**Goal:** app shell that matches the site chrome.

- `create-next-app` (TS, App Router); CSS custom properties for the token set (§2.3); `next/font` Raleway + Work Sans.
- Header (fixed white 71px, logo, nav, search icon, "Servir con SIM" CTA), footer, mobile menu.
- CI: Vitest, Playwright (visual + e2e projects), Lighthouse CI wiring.
- **Tests:** header/footer component tests; visual diff of chrome-only page vs. baseline crops.
- **Exit:** CI pipeline running all three test types.

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

### Phase 4 — Contentful setup + blog (336 posts + archives)

**Goal:** model the content backend and migrate the long tail.

- Use the existing **shared** Contentful space (§4); model changes are **additive migrations to the existing `BlogPost`/`Revista` types** plus the new `author`/`category`/`tag`/`redirect` types, defined as code (Contentful migration CLI scripts, committed to the repo — never hand-edit the model in the web UI). Dry-run the model migration and full import in a **sandbox environment** first; the space carries live sim-blog production content, so verify sim-blog still works after the migration lands (its GraphQL queries select explicit fields, so additive optional fields should be safe — verify anyway).
- `scripts/import-cms.ts`: neutral JSON (Phase 0) → Contentful Management API. **Idempotent upserts keyed by slug**, batched under rate limits, resumable; uploads media as assets; converts bodies per the §5.1 body-format decision (WP HTML → RichText recommended) and rewrites body image URLs to asset references. Before writing anything, emit a **collision diff report** (WP export vs. entries already in the space from `import-vamos`); on conflict **misionessim.org wins**, and existing entries are updated in place — never deleted/recreated — so sim-blog's references survive.
- `lib/cms.ts` typed accessor (zod-validated), with recorded-fixture mode for tests; `/api/revalidate` webhook route for on-demand ISR.
- Post template; `/blog/` index with pagination matching current UX; category (36), tag (28), and author (2) archives — all kept (decided 2026-07-03).
- **Exact URL preservation**: `/blog/YYYY-MM/slug/`.
- `Article` JSON-LD; per-post metadata from exported Yoast fields.
- **Tests:** import-script unit tests (idempotency — running twice creates nothing new; slug/accent fidelity); post-import reconciliation script (336 entries in CMS, zero missing assets); route test asserting every inventory URL builds from CMS data; `lib/cms.ts` unit tests against fixtures; revalidation webhook test; visual diff on 5 representative posts (text-only, image-heavy, embed, oldest 2017, newest 2026) + index + one category page.
- **Exit:** all 336 posts served from the CMS; editing a post in the CMS updates the site without a redeploy; spot-check diffs pass; build time acceptable.

### Phase 5 — La Revista (119 items)

**Goal:** magazine section.

- Import the 119 editions (from the Phase 0 export) as **`Revista` entries — the existing shared type, extended per §4**. Some editions already exist in the space from `import-vamos`: same slug-keyed upsert + collision-diff + misionessim.org-wins strategy as Phase 4, updating in place so sim-blog's `blogPostsCollection` references are preserved. Model issues vs. articles (6 portfolio categories); issue template with **PDF as a plain download/view link + cover image** (no embedder); `/la-revista/` hub + `/revistavamos/` landing with its Ediciones grid/carousel rendered server-side from Contentful data (replacing the admin-ajax carousel).
- Generate the `/revistavamos/<slug>` → `/la-revista/<slug>` alias redirects for all 119 editions (§2.1).
- **Tests:** 119-route build assertion; alias-redirect e2e (sample of edition slugs return 301 to `/la-revista/...`); visual diff on hub + 3 representative issues; PDF link e2e.
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
| Shared-space migration breaks sim-blog (model change or overwritten entries) | Live learning app degrades | Additive-only model migrations (optional fields); dry-run in sandbox environment; pre-import collision diff report; update entries in place (never delete/recreate); run sim-blog's test suite / spot-checks after the migration lands |
| Spanish-accented slugs / encoding bugs in export | Broken URLs, SEO loss | Converter unit tests with accent fixtures; byte-exact URL inventory assertion |
| CMS import partial failure (rate limits, timeouts) | Missing posts/assets nobody notices | Idempotent resumable import; post-import reconciliation script asserting exact entry/asset counts vs. the neutral export |
| CMS vendor cost creep or lock-in regret | Forced re-migration | Neutral JSON export is the canonical backup and re-runnable from the CMS; only `lib/cms.ts` + import script are vendor-specific (Approach B remains the documented fallback) |
| Rich-text fidelity loss in CMS (embeds, HTML edge cases) | Posts render differently than WP | Phase 0 neutral **markdown** export is the lossless canonical backup regardless of the in-CMS body format (§5.1); converter fixtures for embeds; visual diffs on representative posts |
| Visual tests flaky (fonts, animations, YouTube) | CI noise erodes trust | `fonts.ready` waits, animation disabling, masking dynamic regions, generous-then-tightening thresholds |
| Search Console ranking dip | Traffic loss | URL preservation as hard requirement; metadata diffing in Phase 7; sitemaps submitted at cutover |

---

## 9. Suggested repo layout

The Next.js app lives at the root of **this repo** (the static homepage POC was moved to `poc/` on 2026-07-03).

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
