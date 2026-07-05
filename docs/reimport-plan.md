# Blog re-import plan — fix all content-fidelity issues, then re-upload all 335 WP posts

Date: 2026-07-05. Basis: deep comparison of 10 posts (live misionessim.org WP REST API
vs local Next.js render) + corpus-wide quantification across all 335 exported markdown
bodies. Word-level text fidelity is excellent everywhere (diff ratios 0.98–1.0; titles,
dates, categories, tags, hero images all match). The issues are structural/inline.

## Findings

### Previously known (confirmed, counts refined)
1. **Inline images as "imagen" text links — 13 images / 7 posts** (adds
   `que-tragico-desperdicio-de-potencial-humano` ×1 to the earlier 12/6 audit).
   Never uploaded to Contentful; stored as `hyperlink` nodes to `wp-content` URLs.
2. **YouTube iframe silently dropped — 1 post**
   (`la-mision-es-en-equipo-10-razones-…`). Turndown deletes `<iframe>`.
3. **Table flattened — 1 post** (`la-seleccion-de-un-equipo`). Text fully preserved
   (ratio 1.0) but `<table>` structure lost — cells render as 4 plain paragraphs.
4. **WP-hosted file links** — 4 `wp-content` PDF posts + 2 Drupal-era
   `/sites/default/files/*.pdf` links that still resolve (server kept old files).
   All break when WP is decommissioned.
5. **Renderer can't show embedded assets** — `EMBEDDED_ASSET` reads the CDA shape;
   GraphQL needs `body.links` + an id→asset map. Prerequisite for №1.

### New issues (this audit)
6. **Underscore italics render literally — 23 posts.** Turndown emits `_text_` for
   `<em>` (default `emDelimiter`); `markdown-to-richtext.ts` only parses `*text*`.
   Result: literal underscores in prose, italics lost. Mostly photo captions and
   author attributions (`_— Febe Zanetti, coordinadora de PRISMA_`).
7. **Links inside bold leak as literal markdown — 3 posts.**
   `**[MOVIDA](https://instagram.com/movidaint)**` → bold pattern wins the alternation,
   link never parsed → renders as literal `[MOVIDA](https://…)` text; link dead.
8. **Emphasis inside link text leaks — 2 posts.**
   `[**_El Clamor Macedonio_.**](…)` → link works but text displays literal `**_…_.**`
   (parseInline doesn't recurse into link text).
9. **Residual backslash escapes still live in Contentful.** The `unescapeMarkdown` fix
   only re-imported the 66 heading-affected posts; body escapes elsewhere still render
   (confirmed live: `Naima\*`, `Christine\*` on the fulani post). 50 markdown files
   still carry escapes; a full re-import clears all of them automatically.
   ⚠️ 6 posts use `\*` as *literal* pseudonym footnote markers (`Laura\*`, `Obed\*`) —
   the inline parser must not pair escaped asterisks as italic delimiters.
10. **Description = auto-truncated excerpt ending in `[…]` — 320/335 posts.** The post
    template renders `description` as a lead paragraph → duplicates the body's opening
    ~55 words and cuts mid-sentence with a dangling `[…]`. Also feeds meta description.
    (WP never displayed the excerpt on the post page.)
11. **Internal absolute links — 12 posts** link `https://misionessim.org/...`; the
    renderer treats every `http` link as external → `target="_blank"` + full reload
    even for same-site pages. All 27 distinct internal body links health-checked:
    - 5 cross-post `/blog/…` links → all 200 locally at the same date segment ✓
    - `/recursos/`, `/sirve-con-sim/` → 200 ✓
    - 4 `/la-revista/…` links → redirect exists, but **2 land on 404**
      (`caracter-misionero`, `el-clamor-macedonio`) — those editions are among the
      ~5 missing revistas (import them and these links heal).
    - 1 link **broken at source**: `…/magazinefiles/nuevo_obrero_v8_.pd`
      (404 with and without `.pdf`; broken on the live site too —
      David to locate the file or accept as-is).

### Verified clean (no action)
- Titles, publish dates, categories, tags, hero images: exact match on all 10.
- Mojibake (Win-1252 smart quotes in WP source) already normalized at export — the
  new site is *better* than WP here.
- Paragraph-count deltas are benign (RichText wraps `li` content in `p`).
- No h5/h6, raw HTML, nested lists, code blocks anywhere in the corpus.

## Fix plan (all fixes land BEFORE the re-import; production write only with David's go)

### Phase A — pipeline fixes (`scripts/`)
1. **`export-wp.ts`**
   - Add a turndown rule for `<iframe>`/`wp-block-embed` → emit the video URL as a
     plain markdown link in its own paragraph (converter/renderer handle the rest).
   - Add table support (turndown-plugin-gfm tables) → GFM pipe tables.
   - Re-run a **fresh export** before importing (live WP may have changed since the
     last export; cheap insurance).
2. **`markdown-to-richtext.ts`** — rewrite `parseInline` as an escape-aware tokenizer:
   - `_italic_` support (turndown's em delimiter).
   - Recursive inline parsing: links inside bold/italic (mark propagates onto the
     hyperlink's text nodes) and bold/italic inside link text.
   - Negative-lookbehind so `\*` / `\_` never open/close emphasis (fixes the
     pseudonym-footnote posts); `unescapeMarkdown` in `textNode` stays as-is.
   - GFM pipe-table blocks → RichText `table`/`table-row`/`table-cell` nodes
     (natively supported by Contentful RichText).
   - Inline images `![alt](url)` → keep emitting hyperlink placeholder; import
     replaces (next step). Unit tests for every case above.
3. **`import-cms.ts`**
   - **Inline images → real assets**: for each `wp-content` image hyperlink, download
     → `createAssetFromFiles` → process → publish (reuse the hero-image upload path;
     dedupe by URL) → replace the hyperlink node with `embedded-asset-block`.
   - **PDFs → Contentful assets** (6 links incl. the 2 Drupal-era ones — download
     them now while they still resolve); rewrite hyperlink URIs to the asset URL.
   - **Internal link rewrite**: `https://misionessim.org/blog/…` → `/blog/…`;
     `/la-revista/X` → `/revistavamos/X`; other misionessim.org pages → relative path.
   - **Description cleanup**: strip trailing `[…]` (and trailing whitespace) from the
     excerpt before writing `description`.

### Phase B — app fixes
4. **`lib/contentful.ts`**: fetch `body { json links { assets { block
   { sys { id } url title description width height } } } }`.
5. **`app/blog/[date]/[slug]/page.tsx`**:
   - `EMBEDDED_ASSET` renderer: id→asset map from `body.links` (GraphQL shape).
   - `HYPERLINK`: relative URIs → internal `<Link>`, no `target="_blank"`;
     a YouTube link alone in a paragraph → responsive `<iframe>` embed.
   - Add `BLOCKS.TABLE` / `TABLE_ROW` / `TABLE_CELL` / `TABLE_HEADER_CELL` renderers.
   - Lead paragraph: don't render `description` when it's an auto-excerpt
     (ends with `[…]` pre-cleanup, or is a strict prefix of the body text);
     keep the cleaned version for meta description.

### Phase C — run + verify
6. Fresh export → `diff-cms-collisions --environment=main` → dry-run import; expect
   ~304 updates + ~31 skip-archived. Spot-check plans for the 7 image posts.
7. Full re-import to `main` (**needs David's explicit go — production write**).
8. Verification: re-run the 10-post comparison script
   (`scripts/compare-wp-fidelity.py`) — expect structure parity
   (img/iframe/table/em counts match WP) and ratio ≥ 0.99 everywhere; CDA corpus scan
   for `\` escapes, literal `_…_`, literal `[…](…)` → all 0; 13 embedded assets +
   6 PDF assets on `images.ctfassets.net`/`assets.ctfassets.net`.

### Follow-ups surfaced (not blockers for the re-import)
- **VAMOS-pipeline bodies unaudited**: ~31 WP slugs are archived dedup-losers whose
  *canonical* twin came from the separate VAMOS import — this re-import won't touch
  those bodies, and they have no WP ground truth. Run the same CDA lint (escapes,
  literal markdown) across all 875 canonical posts to catch VAMOS-side defects.
- Import the ~5 missing revista editions (heals the 2 `/la-revista/` 404 body links).
- `nuevo_obrero_v8_.pd` dead link — ask David.
- Existing pending: strip archived blogPost links from Revista.blogPosts arrays.
