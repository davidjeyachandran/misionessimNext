# MisionesSIM Figma design library

A small Figma plugin that builds the MisionesSIM design library inside any Figma file. All values are copied from the site's own CSS:

- **Colour variables and styles**: `color/brand`, `navy`, `ink`, `muted`, `cream`, `teal`, … (`Color/*` styles are linked to the variables)
- **Text styles**:
  - `Article/H1–H4`, `Body`, `Body Bold`, `Quote`, `Link`, `Meta`, `Category`, `Tag` (blog posts)
  - `Home/Hero H1`, `Section Title`, `Eyebrow`, … (homepage)
  - `UI/Button`
- **Components**:
  - Article headings, paragraph and blockquote (red left rule, italic, muted)
  - Link, meta, category label, tag pill, divider and eyebrow
  - `Button` with a Type variant: Primary / Primary Hover / Outline / Cream
- An **example blog post** built from instances, with the site's real spacing.

Sources: `app/globals.css`, `app/home.css`, `app/blog/[date]/[slug]/page.tsx`.

## Run it (Figma desktop app)

1. Open or create a Figma design file, for example "MisionesSIM Library".
2. Menu → **Plugins → Development → Import plugin from manifest…**, then pick `design/figma-library/manifest.json`.
3. Menu → **Plugins → Development → MisionesSIM Design Library**.

Fonts: Raleway (SemiBold/Bold/ExtraBold) and Work Sans (Regular/Medium/SemiBold/Italic). Both are Google Fonts and already available in Figma.

## Use it in other files

In the library file, open **Assets → Library → Publish**. Other files can then turn the library on and use the same text styles, colours and components. Publishing needs a paid Figma plan. On the free plan, copy and paste components between files instead.

## Updating

If the site's CSS changes, edit the `COLORS` / `TEXT_STYLES` tables at the top of `code.js` and run the plugin again in the same file. Styles and variables are updated in place, so every component and instance picks up the change. The library page is only built on the first run. Delete the page if you want it rebuilt.

Mobile heading sizes aren't separate styles. They are noted in each style's description.
