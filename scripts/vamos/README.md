# VAMOS PDF → Contentful import

Turns one Revista VAMOS issue PDF into `blogPost` entries linked to its
`revista` edition.

Built for Nº 118 ("El clamor macedonio", June 2026) and generalised in
August 2026 to run any issue. Run against `master` so far:

| Issue | `--issue=` | Created |
|---|---|---|
| Nº 118 · El clamor macedonio · jun 2026 | `118` | 26, published |
| Lucha espiritual · mar 2026 | `lucha-espiritual` | 29, draft |
| Envío responsable · dic 2025 | `envio-responsable` | 23, draft |
| Carácter misionero · sep 2025 | `caracter-misionero` | 24, draft |
| Discípulos que hacen discípulos · jun 2025 | `discipulos` | 29, draft |
| Cuidado Integral · mar 2025 | `cuidado-integral` | 25, draft |
| Latinos en adaptación · dic 2024 | `latinos-adaptacion` | 34, draft |

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

## Running an issue

Every step takes `--issue=<key>` and reads `issues/<key>.mjs`. Derived
artefacts go to `export/vamos-<key>/`, which is gitignored.

```bash
# once per issue: fetch the PDF and generate the two text layers
mkdir -p export/vamos-<key>/html
curl -sSL -o export/vamos-<key>/issue.pdf "<revistaPDF asset url>"
pdftotext -bbox-layout export/vamos-<key>/issue.pdf export/vamos-<key>/all.xml
cd export/vamos-<key>/html && pdftohtml -xml -q ../issue.pdf doc.xml
```

| Step | Script | Output |
|---|---|---|
| 1 | `extract.mjs` | `blocks.json` — text frames with geometry, paragraphs reflowed from line indents, two-column frames cut apart |
| 2 | `split.mjs` | `split.json` — bodies, split at the issue file's anchors |
| 3 | `images.mjs` | `with-images.json` — article regions + candidate heroes |
| 4 | `score.mjs` | hero picked per article |
| 5 | `build-plan.mjs` | `plan.json` — slugs, descriptions, RichText |
| 6 | `import.mjs` | dry run; `--live` writes to Contentful |

`import.mjs` creates **drafts**. Pass `--publish` to publish as well — the
default is the reversible one, since reviewing 25 machine-extracted
articles is cheaper before publication than after. Hero assets are always
published: Contentful refuses to publish an entry whose linked asset is
still a draft.

Prerequisites: `pdftotext`, `pdftohtml` (poppler), `magick` (ImageMagick),
Node 20+, and `CONTENTFUL_MANAGEMENT_TOKEN` in `.env.local`.

## issues/<key>.mjs is the part that needs a human

Everything else is mechanical. The issue file declares each article by its
**opening words**, because height-based headline detection bleeds wherever a
headline is vector art or a pull quote is set at headline size. `split.mjs`
reports any anchor that fails to match — never ignore that warning, since a
silent miss merges two articles with no other symptom.

It also declares:

- `revistaId`, `coverAssetId`, `date` — the edition these posts belong to
- `live` — articles already published by hand, listed under their **magazine
  headline**, which is usually not the title the editor gave the live post
- `skipPages` — cover, TOC, house ads, and pages the text layer cannot be
  trusted on (see below)
- `furniture` — masthead names and straplines, which are reset every issue
- `coverHero`, `noHeroSkip`, `heroOverride` — hero exceptions

### Pages worth skipping

Two layouts defeat a text layer and are better left out than imported
broken. Both are obvious on sight — the extracted prose reads as two texts
spliced together:

- **worksheet grids and tables**, where a row's cells become separate blocks
  and the pairing is lost
- **narrow label columns** set inside the measure, where the subheadings
  interleave with the body word by word (Carácter misionero p9 is the
  clearest case)

Plain two-column frames are *not* in this category — `extract.mjs` cuts
those apart at the gutter automatically.

### One trap worth knowing

Cuidado Integral (mar 2025) devotes pages 25–45 to teaser excerpts from
*earlier* editions. Importing them would file another edition's writing
under this one. Its own contents page flags the range; every such spread
closes with "Lee la revista completa en".

## Editorial rules encoded here

- **Minimum 150 words.** Below that an item is a pull quote or callout, not
  a post. Applied after furniture removal, not before.
- **Every post needs a hero image.** An article whose page carries no
  photograph is not created, unless it is listed in `coverHero`, which
  assigns the issue cover instead.
- **`description` is required** and is the article's own opening sentence,
  trimmed at a sentence boundary. Not an auto-excerpt — the WP-era `[…]`
  truncations are a known defect (`docs/PROGRESS.md`).
- **Titles are the magazine headlines verbatim.** The posts published by
  hand use a more descriptive style; that is not applied retroactively.

## Safety

`import.mjs` is idempotent. It reads every existing `blogPost` slug first
and skips collisions, so a partial failure is fixed by re-running. It
appends to `revista.blogPosts` with de-duplication and changes no other
field on the edition. Appending drafts is safe: `getRevistaBySlug` in
`lib/contentful.ts` drops links that do not resolve, so a draft stays
invisible on the site until someone publishes it.

Cross-issue republishes surface as slug collisions and are skipped by
design — VAMOS reruns material, both across editions (`¿Buscas dónde Dios
te puede usar?` ran in 2022 and again in Nº 118) and between neighbouring
ones (`Listos para la cancha` ran in dic 2024 and again in sep 2025). Run
issues **oldest first** so a rerun is filed under its first appearance;
`lib/contentful.ts` de-duplicates by title anyway, so a second copy would
be invisible.
