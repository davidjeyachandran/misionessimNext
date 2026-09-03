# Revista publication queue

The VAMOS PDF import (`scripts/vamos/`) creates every extracted article as a
**draft** in Contentful, on purpose: reviewing 25 machine-extracted posts is
cheaper before publication than after. Sixteen editions were imported that way
in August 2026 and are complete but invisible. This is the worklist for taking
them live one edition at a time.

The list below is a snapshot (2026-09-03, after *Tu trabajo en el Reino*). **The live list is the script** —
the counts move as editions are published:

```bash
yarn drafts:list
```

## Queue — 419 unpublished posts across 15 editions

Newest first. `live` is how many of that edition's posts are already public
(hand-published over the years, or by the Nº 118 import).

| Edición | `--revista=` | Unpublished | Live |
|---|---|---:|---:|
| Lucha espiritual · mar 2026 | `lucha-espiritual` | 29 | 1 |
| Envío responsable · dic 2025 | `envio-responsable-2` | 23 | 1 |
| Carácter misionero · sep 2025 | `caracter-misionero` | 24 | 2 |
| Discípulos que hacen discípulos · jun 2025 | `discipulos-que-hacen-discipulos` | 29 | 3 |
| Cuidado Integral bíblico y solidario · mar 2025 | `cuidado-integral-biblico-y-solidario` | 25 | 2 |
| Latinos en adaptación · dic 2024 | `latinos-en-adaptacion` | 34 | 0 |
| La gente que no vemos · sep 2024 | `la-gente-que-no-vemos` | 35 | 0 |
| Conferencias misioneras · jun 2024 | `conferencias-misioneras` | 34 | 5 |
| Soy influencer · mar 2024 | `soy-influencer` | 20 | 24 |
| Regresando a casa · dic 2023 ⚠️ | `regresando-a-casa` | 22 | 21 |
| No Alcanzados · sep 2023 | `no-alcanzados` | 15 | 25 |
| Equipos multiculturales · jun 2023 | `equipos-multiculturales-2024` | 21 | 26 |
| Termina Bien · mar 2023 ⚠️ | `termina-bien` | 26 | 9 |
| Fondos Misioneros · dic 2022 | `/fondos-misioneros-2022` | 44 | 7 |
| Idioma y cultura · sep 2022 | `/idioma-y-cultura-2022` | 37 | 7 |

Two editions carry legacy slugs with a leading `/`. Both scripts accept the
slug with or without it.

Nº 118 · *El clamor macedonio* · jun 2026 is absent because its 26 posts were
imported published. *Tu trabajo en el Reino* · jun 2022 left the queue on
2026-09-03: all 48 published, 55 live on the edition.

## Publishing an edition

```bash
yarn drafts:list --revista=<slug>              # read the 20-48 titles first
yarn drafts:publish --revista=<slug>           # dry run — names every post
yarn drafts:publish --revista=<slug> --live    # publish
```

`--limit=N` publishes only the first N (oldest `publishDate` first), for
easing into a large edition.

Both scripts are idempotent. Published posts drop out of the draft query, so a
run that fails halfway is re-run with the same command.

## What publishing actually changes

Only `sys.publishedAt` on the blogPost entries. Nothing else needs doing:

- **The edition page already lists them.** The importer appended every draft to
  `revista.blogPosts`, and `getRevistaBySlug` drops links that do not resolve —
  a draft is simply invisible until published (verified 2026-09-03: 0 of 466
  drafts were missing from their edition's array).
- **Hero assets are already published.** Contentful refuses to publish an entry
  linked to a draft asset; the importer publishes each hero as it uploads it
  (verified: 0 of 461 hero assets unpublished). The publish script still
  publishes a stray draft asset if it meets one.
- **Deploy is automatic.** The Contentful webhook fires the Vercel deploy hook
  on `Entry.publish`.

## Cautions

- ⚠️ **`regresando-a-casa` and `termina-bien` back a live mi-movilicemos
  course.** The "Regresando a casa" learning route is built on those two
  revistas, and their arrays grew 17→39 and 4→30 in the August import. If that
  route renders the whole array, publishing these two editions adds 48 stops to
  a live course. Check the course before publishing them, not after.
- **Deploy-hook rate limit.** Vercel caps deploy hooks at 60 triggers/hour and
  drops the rest. One edition of 44 publishes fits; two editions in the same
  hour do not. One edition per session, then confirm the build landed — which
  is what the day-at-a-time cadence is for.
- **`check-revista-rewrites.ts` runs on prebuild** and fails the build if the
  generated PDF rewrites are stale. Publishing posts does not touch revista
  PDFs, so this should stay quiet; if it fires, run `yarn
  build:revista-rewrites` and commit.

## Not in the queue

One draft blogPost has no revista link: `la-feminidad-raiz-de-la-biblia-y-la-historia`
(created 2022-08-20, `publishDate` 2020-01-16). It has a title and a hero but
**no body** — an empty stub predating the migration, not an unpublished
article. Archive it rather than publish it.

Thirty-eight further unpublished entries are **archived** duplicates from
`scripts/archive-duplicate-posts.ts`. Every query here filters
`sys.archivedAt` out so they can never be revived by a publish run.
