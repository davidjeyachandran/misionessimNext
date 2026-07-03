# From POC to Plan: Mapping the Full Migration

> **Status:** Draft — unpublished
> **Series:** Migrating misionessim.org to Next.js

---

With the PM convinced by the homepage POC, the next step was turning "we could do this" into "here's exactly how." We went back to Claude — this time to produce a deep analysis of migration approaches and a phased implementation plan that could be handed directly to an engineering session and executed.

## The prompt

```
Create a deep analysis of different approaches we can use to convert site
https://misionessim.org to NextJS site and save as an md file. I have full access
to https://misionessim.org and can make a local copy of this Wordpress Elementor
site if necessary. Create a plan that Claude code can later implement in phases,
verifying each phase using unit tests, Playwright visual regression tests. In the
end we need a performant site that matches closely the existing site.
```

Before writing a single line of the plan, Claude did something we hadn't explicitly asked for: it went and audited the live site. It crawled the Yoast sitemaps, called the WordPress REST API, inspected the plugin footprint on the homepage, and paged through the AJAX-loaded magazine carousel to understand exactly what content existed and how it was structured. Only then did it write the plan.

That reconnaissance surfaced details that would have caused real problems later if missed.

## What the audit found

**Content inventory (from sitemaps + REST API):**

| Content type | Count | Notes |
|---|---|---|
| Elementor pages | 8 | Static — won't change during migration |
| Blog posts | 336 | Clean Gutenberg HTML, fully REST-exposed |
| Revista VAMOS editions | 119 | In a custom post type *not* exposed via REST |
| Donation forms | 8 | GiveWP plugin |
| Categories / tags | 36 / 28 | Taxonomy archives |

The revista editions finding was the most important. The "Ediciones" carousel on `/revistavamos/` isn't in the page HTML at all — it's fetched client-side via `admin-ajax.php`. An HTML scrape of the site would have silently missed all 119 editions. The correct export path is the WordPress REST API with a small code snippet to expose the custom post type.

There was also a URL alias pattern nobody had flagged: `/revistavamos/el-clamor-macedonio/` redirects 301 to `/la-revista/el-clamor-macedonio/`. With ~119 editions, that's 119 aliases that need to be reproduced in the new site's redirect map to avoid breaking external links.

## Five approaches, one recommendation

Claude laid out five migration strategies, compared them honestly, and recommended one:

- **Approach A — Headless WordPress:** Keep WP running as the API. Rejected: Elementor markup is unusable outside WP, so every page needs rebuilding anyway. WP stays in production forever for no benefit.
- **Approach B — Full static rebuild (content in-repo as MDX):** All content exported once into the git repo. Clean, fast, but publishing new posts requires a developer.
- **Approach C — Rebuild + Contentful ✓ Chosen:** Same presentation-layer rebuild, but blog and revista content lives in Contentful. Editors can publish without a deploy; Contentful webhooks trigger on-demand revalidation so the site stays effectively static.
- **Approach D — Automated scrape/conversion:** Mirror the rendered Elementor HTML. Rejected immediately — produces unmaintainable div-soup and fails the performance goal by construction.
- **Approach E — Incremental strangler proxy:** Next.js in front, WP behind, migrate route by route. Overkill for a site this size.

## Decisions made in the session

The planning conversation settled several scope questions:

- **Donations (GiveWP) dropped entirely.** The 8 forms include what appeared to be unconfigured demo forms. With no live recurring donor accounts, the whole plugin surface was cut. The old `/donations/*` URLs will 301 to an external giving platform.
- **Contact form → hosting platform native forms** (Vercel Forms or Netlify Forms). No custom backend, no email service to operate.
- **No PDF embedder.** Revista editions previously embedded PDFs via a WP plugin. In the new site they're plain download links — simpler, faster, and one less dependency.
- **Elementor pages are code, not CMS entries.** The 8 static pages are rebuilt as React components with their copy in the code for day 1. Moving that copy into Contentful is an optional later enhancement, not a launch requirement.
- **Contentful infra already exists.** No product selection or space provisioning needed — the migration lands in existing infrastructure.

## The plan: 8 phases

The full plan is in [`docs/nextjs-migration-analysis.md`](../docs/nextjs-migration-analysis.md). In brief:

| Phase | Goal |
|---|---|
| **0** | URL inventory, Playwright baselines of live site (logged out), `wget` mirror, WP export script (REST → neutral JSON) |
| **1** | Next.js scaffold, design tokens, global layout (header, footer, mobile menu) |
| **2** | Homepage — port the verified POC into React components with parallax |
| **3** | The ~8 static Elementor pages, rebuilt as code |
| **4** | Contentful content model + import script (336 blog posts + archives) |
| **5** | La Revista (119 editions + redirect aliases) |
| **6** | Contact form + Pagefind search |
| **7** | SEO parity, redirect map, Lighthouse gates, content freeze, cutover |

Every phase has explicit exit criteria, unit tests (Vitest), and Playwright visual-regression checks comparing the Next.js build against screenshots of the live site. Performance gates (Lighthouse ≥ 95, LCP < 2s, CLS < 0.05) are enforced from Phase 2 onward — the current Elementor site scores far below these, so the delta is the migration's headline win.

## What struck us about the process

The plan Claude produced wasn't a generic "migrate WordPress to Next.js" template. It was specific to this site: it knew the exact URL pattern for blog posts (`/blog/YYYY-MM/slug/`), knew that the revista carousel was AJAX-loaded and would be missed by scraping, knew that the admin bar adds 32–46px to logged-in screenshots and that baselines needed to be captured logged out, knew that Spanish-accented slugs were an encoding risk worth writing converter unit tests for.

That specificity came from doing the audit first. The prompt asked for a plan; the model decided it needed to understand the site before it could write one.

---

*Next: Phase 0 — building the export pipeline and capturing the live-site baselines.*
