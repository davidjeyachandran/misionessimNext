# Plan: upload the 9 missing Revistas to Contentful

Companion to [missing-revistas-in-contentful.md](missing-revistas-in-contentful.md).
Contentful currently has **110** `revista` entries; the newest is *Soy influencer*
(fecha 2024-03-01). The 9 editions below continue the quarterly cadence from
June 2024 through June 2026, so after the import the site's "Nueva edición"
block will show *El clamor macedonio* automatically.

## Data table (verified against the WordPress mirror)

Every edition's PDF and cover URL was extracted from
`reference/mirror/la-revista/<slug>/index.html` (og:image + first `.pdf` link)
and all 9 URLs resolve on the live site. Titles are the page `<h1>`.
Fechas follow the existing convention (1st of the edition month, midnight UTC);
they come from the PDF filenames + quarterly cadence, **not** WordPress
`datePublished` (three pages were bulk-created on 2025-04-08, so that field is
unreliable).

| slug | title | fecha | PDF | cover |
|---|---|---|---|---|
| `conferencias-misioneras` | Conferencias misioneras | 2024-06-01 | [PDF](https://misionessim.org/wp-content/uploads/2024/11/conferenciamisioneravamosjun24.pdf) | [jpg](https://misionessim.org/wp-content/uploads/2024/11/conferenciamisioneravamosjun24.jpg) |
| `la-gente-que-no-vemos` | La gente que no vemos | 2024-09-01 | [PDF](https://misionessim.org/wp-content/uploads/2025/04/GenteQueNoVemosVAMOSsept24.pdf) | [jpg](https://misionessim.org/wp-content/uploads/2025/04/GenteQueNoVemosVAMOSsept24-1.jpg) |
| `latinos-en-adaptacion` | Latinos en adaptación, sus retos y resilencia | 2024-12-01 | [PDF](https://misionessim.org/wp-content/uploads/2025/04/AdaptacionVAMOSdic24.pdf) | [jpg](https://misionessim.org/wp-content/uploads/2025/04/AdaptacionVAMOSdic24.jpg) |
| `cuidado-integral-biblico-y-solidario` | Cuidado Integral bíblico y solidario | 2025-03-01 | [PDF](https://misionessim.org/wp-content/uploads/2025/04/CuidadoIntegralMarzo25.pdf) | [jpg](https://misionessim.org/wp-content/uploads/2025/04/CuidadoIntegralMarzo25.jpg) |
| `discipulos-que-hacen-discipulos` | Discípulos que hacen discípulos | 2025-06-01 | [PDF](https://misionessim.org/wp-content/uploads/2025/05/DiscipuladoVAMOSjunio25.pdf) | [jpg](https://misionessim.org/wp-content/uploads/2025/05/DiscipuladoVAMOS25portada-Medium.jpg) |
| `caracter-misionero` | Carácter misionero | 2025-09-01 | [PDF](https://misionessim.org/wp-content/uploads/2025/08/CaracterVAMOSseptiembre25.pdf) | [jpg](https://misionessim.org/wp-content/uploads/2025/08/CaracterVAMOS25portada-Medium.jpg) |
| `envio-responsable-2` | Envío responsable | 2025-12-01 | [PDF](https://misionessim.org/wp-content/uploads/2025/11/SIMLaEnvio25.pdf) | [jpg](https://misionessim.org/wp-content/uploads/2025/11/EnvioVAMOS25portada-Medium.jpg) |
| `lucha-espiritual` | Lucha espiritual | 2026-03-01 | [PDF](https://misionessim.org/wp-content/uploads/2026/02/LuchaEspiritualVamosMarzo26-4.pdf) | [jpg](https://misionessim.org/wp-content/uploads/2026/02/LuchaEspiritualportada-Medium.jpg) |
| `el-clamor-macedonio` | El clamor macedonio | 2026-06-01 | [PDF](https://misionessim.org/wp-content/uploads/2026/05/LlamadoMacedonioJun26.pdf) | [jpg](https://misionessim.org/wp-content/uploads/2026/05/llamadoMacedonioPortada26-Medium.jpg) |

Slug-collision check (done 2026-07-12 against production): none of the 9 slugs
exist in Contentful. `envio-responsable-2` and `conferencias-misioneras` are
distinct from the existing `/envio-responsable` (2020) and
`/conferencia-misionera` (2012) entries — keep the `-2`/plural slugs so the
old editions stay reachable.

## Content model (verified via the Management API)

Content type `revista`, locale `en-US` (same as `scripts/import-cms.ts`):

| field id (CMA) | type | required | notes |
|---|---|---|---|
| `title` | Symbol | yes | display field |
| `fecha` | Date | yes | drives ordering + "Nueva edición" |
| `revistaPDF` | Asset link | yes | **capital "PDF"** in the CMA; GraphQL exposes it as `revistaPdf` |
| `slug` | Symbol | yes | store clean (no leading `/`); `normalizeRevistaSlug()` accepts either |
| `coverImage` | Asset link | no | but the index/detail pages depend on it — always set |
| `body`, `masRecursos`, `nid`, `inDesignID`, `embedded`, `blogPosts` | — | no | leave empty |

`blogPosts` stays empty: the articles from these editions were never imported
as `blogPost` entries. The detail page already renders fine without them
(cover + PDF button, no "Artículos de esta edición" section). Importing the
articles is a separate, larger job (the `import-vamos` pipeline).

## Script: `scripts/import-missing-revistas.ts`

Copy the working patterns from `scripts/import-cms.ts` — do NOT invent new
SDK usage. That script uses contentful-management's **plain client** (not the
chained `getSpace().getEnvironment()` style). All URLs verified 200 OK on
2026-07-12; PDFs are 2.9–8.5 MB (well under asset limits).

**Structure:**

1. **Hardcode the data table** from this doc as a `const EDITIONS` array:
   `{ slug, title, fecha, pdfUrl, coverUrl }`. `fecha` as full ISO string,
   e.g. `"2024-06-01T00:00:00Z"`. No external inputs — the table above IS the
   source of truth.

2. **CLI contract** (same as import-cms.ts `main()`): dry-run by default —
   print per-edition what would be created and exit **without** creating a
   client. `--live` executes. `--environment=<id>` selects the environment;
   with `--live`, require it explicitly (no default) so production writes are
   always deliberate: `--live --environment=master`.

3. **Client setup** (mirror import-cms.ts `runLive()`):
   ```ts
   const { createClient } = await import("contentful-management");
   const client = createClient({ accessToken: managementToken });
   const ctx = { spaceId, environmentId };
   ```
   Read `CONTENTFUL_SPACE_ID` / `CONTENTFUL_MANAGEMENT_TOKEN` from
   `process.env`, throw if missing (env comes from `node --env-file=.env.local`,
   see run instructions below).

4. **Idempotency check per edition** — before creating anything:
   ```ts
   const existing = await client.entry.getMany({
     ...ctx,
     query: { content_type: "revista", "fields.slug[in]": `${slug},/${slug}` },
   });
   if (existing.total > 0) { console.log(`skip ${slug}: exists`); continue; }
   ```
   (checks both clean and legacy leading-`/` slug forms; makes the script
   safely re-runnable after a partial failure).

5. **Assets — download then `createFromFiles`** (exactly like the
   inline-image loop in import-cms.ts; the SDK's `processForAllLocales`
   handles the processing wait, and publish takes the processed asset):
   ```ts
   const res = await fetch(url, { headers: { "user-agent": "misionessim-migration-bot/1.0" } });
   if (!res.ok) throw new Error(`download failed ${res.status}: ${url}`);
   const buffer = await res.arrayBuffer();
   const asset = await client.asset.createFromFiles(ctx, {
     fields: {
       title: { "en-US": `${title} — portada` },        // or "— PDF"
       description: { "en-US": "" },
       file: { "en-US": { contentType, fileName, file: buffer } },
     },
   });
   const processed = await client.asset.processForAllLocales(ctx, asset);
   await client.asset.publish({ ...ctx, assetId: processed.sys.id }, processed);
   ```
   Cover: `contentType: "image/jpeg"`; PDF: `contentType: "application/pdf"`.
   `fileName` = last URL path segment. **Publish the `processed` object, not
   the original `asset`** — versions matter.

6. **Entry — create then publish** (same shape as import-cms.ts):
   ```ts
   const fields = {
     title:      { "en-US": title },
     slug:       { "en-US": slug },              // clean, no leading "/"
     fecha:      { "en-US": fecha },
     revistaPDF: { "en-US": { sys: { type: "Link", linkType: "Asset", id: pdfAssetId } } },
     coverImage: { "en-US": { sys: { type: "Link", linkType: "Asset", id: coverAssetId } } },
   };
   const entry = await client.entry.create({ ...ctx, contentTypeId: "revista" }, { fields });
   await client.entry.publish({ ...ctx, entryId: entry.sys.id }, entry);
   ```
   Field id is `revistaPDF` (capital) — the GraphQL name `revistaPdf` will be
   rejected by the CMA. Do not set `blogPosts`, `body`, or any other field.

7. **Logging** — one line per step per edition
   (`el-clamor-macedonio: cover → <assetId>` etc.) so a partial failure shows
   exactly where to resume. Process editions oldest-first (table order).

**Run instructions** (Node 20 required — default shell is Node 16):

```sh
source ~/.nvm/nvm.sh && nvm use 20
# add to package.json scripts, matching import:cms:
#   "import:revistas": "node --env-file=.env.local node_modules/.bin/tsx scripts/import-missing-revistas.ts"
yarn import:revistas                                  # dry run — always first
yarn import:revistas --live --environment=master      # real run, after David's sign-off
```

**Guardrails for the implementing agent:**
- Never run `--live` without David's explicit go-ahead in the conversation —
  this writes to a production space shared with mi-movilicemos.
- If any asset or entry call fails mid-run, stop and report; the idempotency
  check makes a re-run safe, so do not improvise cleanup/deletes.
- Do not modify existing entries or assets under any circumstances; this
  script only creates.

## Verification

1. GraphQL: `revistaCollection { total }` returns **119**. One-liner:
   ```sh
   set -a; source .env.local; set +a
   curl -s "https://graphql.contentful.com/content/v1/spaces/$CONTENTFUL_SPACE_ID" \
     -H "Authorization: Bearer $CONTENTFUL_ACCESS_TOKEN" -H "Content-Type: application/json" \
     -d '{"query":"{ revistaCollection(limit:0) { total } }"}'
   ```
2. `source ~/.nvm/nvm.sh && nvm use 20 && npx next build` — static export
   succeeds; new routes `/revistavamos/<slug>/` appear (page count grows by
   9, from 1185 to 1194).
3. `/revistavamos/` shows *El clamor macedonio* as "Nueva edición" with its
   cover, and the grid shows the other 8 in order.
4. Each new detail page: cover links to the PDF, "Fecha" row shows the right
   month, "Leer la revista (PDF)" works.

## What we still need from David (the "what else" answer)

1. **Confirm the fechas** — the quarterly dates above are inferred from PDF
   filenames; only David can confirm e.g. whether *Envío responsable* is
   diciembre 2025 vs noviembre 2025.
2. **Shared-space sign-off** — this space is shared with mi-movilicemos.
   New published `revista` entries + assets are additive, but confirm
   mi-movilicemos lists revistas dynamically (it will start showing 9 new
   editions the moment they're published).
3. **Which environment** — plan assumes `master` (production). Say the word
   if you want a trial run in a sandbox environment first.
4. Nothing else technically: `CONTENTFUL_SPACE_ID`, `CONTENTFUL_ACCESS_TOKEN`
   and `CONTENTFUL_MANAGEMENT_TOKEN` are already in `.env.local`, the
   management token was verified working against the CMA, and
   `contentful-management` is already a dependency.
