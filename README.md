# misionessim.org → Next.js migration

Rebuild of [misionessim.org](https://misionessim.org/) (WordPress + Elementor) as a
static Next.js site, with blog + Revista VAMOS content migrated into Contentful.
Deploying to **Vercel**.

- **Plan:** [docs/nextjs-migration-analysis.md](docs/nextjs-migration-analysis.md) —
  site audit, chosen approach, architecture, 8-phase implementation plan.
- **Progress log:** [docs/PROGRESS.md](docs/PROGRESS.md)
- **Homepage POC:** [poc/](poc/) — the verified static HTML/CSS/JS replica of the live
  homepage that de-risked the rebuild (see [poc/README.md](poc/README.md)). Serve it
  with the `sim-home` launch config (port 8137).

The Next.js app will be scaffolded at the repo root (Phase 1).
