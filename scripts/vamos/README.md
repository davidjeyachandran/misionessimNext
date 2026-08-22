# VAMOS PDF → Contentful import

Turns one Revista VAMOS issue PDF into `blogPost` entries linked to its
`revista` edition. Built for Nº 118 ("El clamor macedonio", June 2026) and
run against `master` on 2026-08-22: 26 posts created.

## Why this is not the sim-blog pipeline

`~/websites/learn/sim-blog` has `import-vamos-pdf.mjs`, which renders each
page to PNG and asks a vision model to read the article text. That is the
wrong tool for these issues. VAMOS is an InDesign export with a real text
layer, so `pdftotext -bbox-layout` resolves every text frame into a block
with correct internal reading order and per-word coordinates. Body text
comes out verbatim — no OCR, no model, no column scrambling.

An editorial Word export of the issue is **not** needed. It was tried for
Nº 118 and turned out near-redundant: the PDF supplied 100% of the body
text, the page-3 TOC supplied 6 of the 7 headlines that are set as outlined
vector art, and the Word document was itself missing five whole articles.

## Pipeline

Run in order. Everything reads and writes `export/vamos-118/` (gitignored).

| Step | Script | Output |
|---|---|---|
| 1 | `extract.mjs` | `blocks.json` — text frames with geometry, paragraphs reflowed from line indents |
| 2 | `split.mjs` | `split.json` — bodies, split at the manifest's anchors |
| 3 | `images.mjs` | `with-images.json` — article regions + candidate heroes |
| 4 | `score.mjs` | hero picked per article |
| 5 | `build-plan.mjs` | `plan.json` — slugs, descriptions, RichText |
| 6 | `import.mjs` | dry run; `--live` writes to Contentful |

Prerequisites: `pdftotext`, `pdftohtml` (poppler), `magick` (ImageMagick),
Node 20+, and `CONTENTFUL_MANAGEMENT_TOKEN` in `.env.local`.

Before step 1, put the issue PDF where `extract.mjs` expects it and generate
its inputs:

```bash
pdftotext -bbox-layout <issue.pdf> export/vamos-118/all.xml
cd export/vamos-118/html && pdftohtml -xml -q <issue.pdf> doc.xml
```

## manifest.mjs is the part that needs a human

Everything else is mechanical. `manifest.mjs` declares each article by its
**opening words**, because height-based headline detection bleeds wherever a
headline is vector art or a pull quote is set at headline size. `split.mjs`
reports any anchor that fails to match — never ignore that warning, since a
silent miss merges two articles with no other symptom.

It also declares:

- `LIVE` — articles already published by hand, never touched
- `SKIP_PAGES` — cover, TOC, house ads, resource directory

## Editorial rules encoded here

- **Minimum 150 words.** Below that an item is a pull quote or callout, not
  a post. Applied after furniture removal, not before.
- **Every post needs a hero image.** An article whose page carries no
  photograph is not created, unless it is listed in `COVER_HERO` in
  `build-plan.mjs`, which assigns the issue cover instead.
- **`description` is required** and is the article's own opening sentence,
  trimmed at a sentence boundary. Not an auto-excerpt — the WP-era `[…]`
  truncations are a known defect (`docs/PROGRESS.md`).
- **Titles are the magazine headlines verbatim.** The three posts published
  by hand from Nº 118 use a more descriptive style; that was not applied
  retroactively.

## Safety

`import.mjs` is idempotent. It reads every existing `blogPost` slug first
and skips collisions, so a partial failure is fixed by re-running. It
appends to `revista.blogPosts` with de-duplication and changes no other
field on the edition.

Cross-issue republishes surface as slug collisions and are skipped by
design — `¿Buscas dónde Dios te puede usar?` ran in both 2022 and Nº 118,
and `lib/contentful.ts` de-duplicates by title, so a second copy would be
invisible anyway.
