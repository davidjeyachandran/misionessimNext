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
| La gente que no vemos · sep 2024 | `la-gente-que-no-vemos` | 35, draft |
| Conferencias misioneras · jun 2024 | `conferencias-misioneras` | 34, draft |
| Soy influencer · mar 2024 | `soy-influencer` | 20, draft |
| Regresando a casa · dic 2023 | `regresando-a-casa` | 22, draft |
| No Alcanzados · sep 2023 | `no-alcanzados` | 16, draft |
| Equipos multiculturales · jun 2023 | `equipos-multiculturales` | 21, draft |
| Termina bien · mar 2023 | `termina-bien` | 26, draft |
| Fondos misioneros · dic 2022 | `fondos-misioneros` | 44, draft |
| Idioma y cultura · sep 2022 | `idioma-y-cultura` | 37, draft |
| Tu trabajo en el Reino · jun 2022 | `tu-trabajo-en-el-reino` | 48, draft |

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
- `rowPages` — pages read row by row rather than column by column
- `dropArticles` — anchors that exist only to isolate text, then drop it
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

When only one frame on the page is affected, skipping the whole page costs
too much. Anchor a throwaway article on that frame and name it in
`dropArticles`: without an anchor its text is silently appended to whichever
article precedes it.

### Reading order: `rowPages`

Blocks are ordered whole-left-column-then-whole-right, which is right for a
page of parallel columns and wrong for the common VAMOS layout where a
two-column article sits above a second, shorter one set in a single column.
The spread's right half then lands *inside* the item underneath it — the
symptom is an article whose word count is far above what its frames hold,
ending in prose that belongs to its neighbour. Name such pages in
`rowPages` and they are ordered by y instead. The two layouts cannot be
told apart from geometry, so this is a per-page judgement like `skipPages`.

### Labelled lists lose their labels

A list whose items are set as a heading frame plus a body frame — «10 cosas
que matan el ministerio», «Motivos correctos» / «Motivos equivocados» —
loses every heading to the short-frame rule, and what is left reads as one
undifferentiated list. Numbered headings survive (`LIST_ITEM` matches «1. »)
but worded ones do not. Where the labels carry the meaning, name the item in
`dropArticles` rather than ship a list that says the opposite of what it
means; where each paragraph restates its own label, keep it.

### When the hero is clip art

`score.mjs` measures saturation in HSL, where S is `(max-min)/(1-|2L-1|)` and
blows up as lightness approaches 1. A cut-out or a piece of clip art on stark
white can therefore report a saturation of 80 or 300 and beat every real
photograph on its page. `score.mjs` prints a warning naming any pick that won
on a reading above 1 — check those, and name the photograph in
`heroOverride` when the automatic pick is clip art. `heroOverride` is looked
up against every image on the page, not just the candidates, so it can also
name a banner too wide to be a candidate, or a black-and-white photograph
that scores as greyscale.

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

Some articles linked to an edition are simply not in its PDF — «Aprendiendo
a convivir» under *Soy influencer*, «La traducción bíblica…» under *Idioma y
cultura*, three of the seven under *Tu trabajo en el Reino*. Grep the text
layer before assuming an anchor is missing; where the article exists live
under another edition, list it in `live` so the import does not make a
second copy of it.

Cross-issue republishes surface as slug collisions and are skipped by
design — VAMOS reruns material, both across editions (`¿Buscas dónde Dios
te puede usar?` ran in 2022 and again in Nº 118) and between neighbouring
ones (`Listos para la cancha` ran in dic 2024 and again in sep 2025). Run
issues **oldest first** so a rerun is filed under its first appearance;
`lib/contentful.ts` de-duplicates by title anyway, so a second copy would
be invisible.
