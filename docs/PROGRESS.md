# Migration project — progress log

## 2026-07-03 — Analysis session (complete)

### Done
- **Full migration analysis written and finalized:** [nextjs-migration-analysis.md](nextjs-migration-analysis.md). Contains site audit, 5 approaches compared, chosen approach, target architecture, resolved decisions, 8-phase implementation plan (Phases 0–7) with per-phase tests/exit criteria, verification strategy (Vitest + Playwright visual regression vs. live-site baselines + Lighthouse CI), risks, repo layout.
- **Approach C chosen (David, 2026-07-03):** rebuild presentation layer in Next.js; migrate blog (336) + revista (119) into **Contentful** (existing infra); ~8 Elementor pages rebuilt as code. WP → neutral JSON → Contentful import. Approach B (content in-repo) is the documented fallback.
- **Scope narrowed (David, 2026-07-03):**
  - **Donations (GiveWP) dropped entirely** — no `/donations/*`, no donor dashboard, no donor accounts.
  - **Contact form** → hosting platform native forms (Vercel Forms / Netlify Forms), no custom backend.
  - **No PDF embedder** — revista PDFs are plain download/view links.
  - **Elementor pages are truly static** (won't change during migration) — copy lives in code for day 1; markdown/Contentful-editable is an optional later enhancement.
- **Live-site reconnaissance completed** (sitemaps, REST API, plugin footprint) — all findings baked into §2 of the analysis:
  - 8 in-scope Elementor pages; 336 Gutenberg blog posts (REST-exposed, clean HTML, `/blog/YYYY-MM/slug/`); 119 revista editions in `keydesign-portfolio` CPT (**not** REST-exposed — needs mu-plugin filter or WP-CLI); CF7; Yoast; no GraphQL. (8 GiveWP forms exist but are out of scope.)
- **`/revistavamos/` investigation resolved** (user flagged pages "missing from sitemap"):
  - Editions are the 119 `/la-revista/<slug>/` items — already in the sitemap; nothing lost.
  - The Ediciones carousel is AJAX-only (`admin-ajax.php`, `action=postcs_getdata`, plugin `post-types-carousel-slider`, 16/page) → HTML scraping would miss all editions; REST/CPT export is mandatory.
  - `/revistavamos/<slug>/` 301-redirects to `/la-revista/<slug>/` → ~119 alias redirects must be reproduced (Phase 5).
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
- **Contentful = the existing shared space used by sim-blog** (see [contentful.md](contentful.md), copied from that project). It already has `BlogPost` (body = **RichText**, not markdown) and `Revista` types and some VAMOS content from `import-vamos` → reuse + **additively extend** those types; slug-keyed upsert with **misionessim.org authoritative on conflicts**, pre-import collision diff report, update-in-place so sim-blog references survive. Analysis §4 + Phases 4/5 updated accordingly.
- **Next.js app lives at this repo's root**; the static homepage POC moved to `poc/` (launch config `sim-home` updated with `--directory poc`, still port 8137). Repo is now `git init`-ed (no commits yet).

### Remaining small choices (none block Phases 0–3; settle at Phase 4 start; details in analysis §5)
1. **Body format** — convert WP HTML → RichText to share one body field with sim-blog (recommended) vs. parallel markdown field.
2. **Contentful environment rollout** — sandbox dry-run, then how the migration lands in sim-blog's live environment + how sim-blog is regression-checked.

### Next session: start Phase 0
1. Build `scripts/export-wp.ts` (WP REST → neutral JSON + markdown + media manifest). Expose `keydesign-portfolio` via mu-plugin first (David has admin).
2. Generate `data/url-inventory.json` from sitemaps **plus** the 119 `/revistavamos/<slug>` aliases (in no sitemap — derive from edition slugs).
3. Capture Playwright baselines of live site — **logged out** (admin bar adds 32–46px), 3 viewports (375×812, 768×1024, 1440×900).
4. `wget --mirror` snapshot → `reference/mirror/`.
5. Unit tests: converter fixtures (Spanish accents, embeds), manifest counts (336 + 119, zero missing media).

Also: make the initial git commit (repo is init-ed but has no commits yet).

### Key context for future sessions
- Homepage POC (verified near pixel-perfect) is in `poc/`; serve via launch.json config "sim-home" (port 8137). Design tokens: primary `#C91430`, secondary `#002F49`, text `#0A0117`, nav `#696F8C`; Raleway + Work Sans; fixed white 71px header; 95vh hero; 3 parallax sections; YouTube `zx8x6J7vPNI`.
- Memory file `misionessim-homepage-poc.md` (auto-memory) holds the same facts and points here.
