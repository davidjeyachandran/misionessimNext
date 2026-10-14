# Plan: "Cuán hermosos son los pies" campaign landing page

Source design: `Campaña-CHSP-SIM-editable.ai` (Illustrator 30.8, single
4100 × 11908 pt desktop artboard, saved 2026-10-04). The companion
`Campaña-CHSP-SIM.pdf` is an earlier export of the same artboard with
flattened colour — use the `.ai` as the source of truth.

## Goal

A responsive campaign page inside the existing Misiones SIM site (normal
`SiteHeader` / `SiteFooter`, static export, same tokens and fonts). It
encourages readers through stories of Latino missionaries, gets them to
download the 30-day prayer guide, and invites them to take the next step
towards serving. Anything the design leaves blank ships as a clearly marked
placeholder that can be swapped by editing one content file.

## Decisions (answered 2026-10-14)

- **D1 slug:** `/hermosos-pies/`.
- **D2 script font:** Covered By Your Grace, self-hosted via `next/font`, loaded on this route only.
- **D3 form:** same list as the "Suscríbete aquí" VerticalResponse form on
  `/revistavamos/` (`https://oi.vresp.com?fid=669a6c7963`). Non-functional
  for now: submitting shows a "coming soon" notice with that link. The
  VerticalResponse integration is a follow-up.
- **D4 video:** probably YouTube. Simple placeholder until confirmed.
- **D5:** hidden (noindex, no nav or sitemap entry).

The table below records the original options.

| # | Decision | Default if no answer |
|---|---|---|
| D1 | **URL slug.** It will be printed, shared and QR-coded, so it must be fixed before campaign material goes out. | `/cuan-hermosos/` |
| D2 | **Handwritten script font.** The site has no script face, and the design depends on one (the word "pies", the verse, the quotes, the "Da el paso" heading). | Load *Covered By Your Grace* (the design's own font: free on Google Fonts, one weight, ~20 KB), scoped to this page only via `next/font`. Fallback if site fonts must be strict: Raleway italic 600, which loses the hand-lettered feel. |
| D3 | **What the form is for, and who receives it.** The design shows Nombre + Correo only. | Treat it as a "quiero dar el siguiente paso" lead. Post to the existing `NEXT_PUBLIC_CONTACT_ENDPOINT` with subject "Campaña Cuán hermosos — nuevo contacto". Add a required consent checkbox linking `/privacidad/`, plus an "Enviar" button the design omits. |
| D4 | **Video host.** The existing `VideoThumbnail` + `VideoLightbox` assume YouTube. | YouTube. Vimeo or Instagram would need a different embed component. |
| D5 | **Indexing while placeholders are live.** | `noindex` until the book, PDF and videos are in. Not linked from nav or sitemap until then (same pattern as `/rebuild-vs-wordpress/`, enforced by `tests/e2e/unlisted-pages.spec.ts`). |

## Fonts: design → site mapping

| Design font | Used for | Site substitute |
|---|---|---|
| Gotham Black / Bold | Hero "HERMOSOS", section headings | Raleway 800 / 900 (`font-heading`) |
| Gotham Medium / Book | Body copy, captions, button labels | Work Sans 400 / 500 (`font-sans`) |
| Bebas Neue | Hero eyebrow, "GIO, DIRECTOR…", form labels | Raleway 700, uppercase, `tracking-[0.04em]`, slightly narrower size. The site has no condensed face; this keeps the label role without adding a font. |
| Covered By Your Grace | "pies", verse, quotes, names, "Da el paso" | See D2 |

## Palette

Sampled from the `.ai` render. Defined as page-scoped CSS custom properties
on the page wrapper (not added to the global `@theme`), so the campaign
colours don't leak into the rest of the site.

| Token | Hex | Where |
|---|---|---|
| `--chsp-terracotta` | `#BA4931` | Divider bar under the verse, intro band |
| `--chsp-tan` | `#DCBB95` | 30-day prayer band |
| `--chsp-cream` | `#FFEECD` | Book mockup backdrop (≈ site `--color-cream` `#fef1d5`, so reuse that) |
| `--chsp-brown` | `#481F00` | Videos band background, script text |
| `--chsp-red` | `#992105` | Video placeholders, 30-day heading, Gio attribution |
| `--chsp-teal` | `#0D5971` | "ROMANOS 10:15", download button (darker than site `--color-teal` `#167e92`) |

Check contrast before shipping. White on terracotta and teal-button text
should pass AA at their sizes. Body text on tan needs to be ink, not muted.

## Assets

| Asset | Status | Action |
|---|---|---|
| Hero landscape (misty hills) | ✅ in `.ai`, 1920 × 1280 | Export WebP at 1920 / 1200 / 828 → `public/campana/hero-*.webp`. The brown→white sky gradient is a **vector overlay** in the design, not baked into the photo, so recreate it as a CSS gradient. |
| Yurani photo | ✅ in `.ai`, 5237 × 3491 | Crop to the design's ~3:2 framing and export WebP at 1200 / 828 → `public/campana/yurani-*.webp` |
| Podcast cards | ⚠️ screenshot | These are a screenshot of the site's own `/recursos` podcast band. Use real `SpotifyEpisodes` embeds with the same three IDs from `app/recursos/page.tsx` as stand-ins, flagged in `content.ts` until the campaign's own episodes are confirmed. Do not ship the screenshot. |
| Book mockup | ❌ placeholder | Cream box with a "Portada próximamente" label, at the design's ~6:5 ratio |
| Prayer guide PDF / link | ❌ placeholder | Button renders disabled ("Disponible pronto") while the URL is empty |
| Videos 1–3 | ❌ placeholder | Red boxes, as in the design, with "Video próximamente". They become `VideoThumbnail`s once YouTube IDs and stills arrive. |
| Social share image | ❌ missing | Generate a 1200 × 630 crop of the hero with the title for `openGraph.images` |

## Page structure (top → bottom)

The design is desktop-only. Mobile behaviour below is ours.

1. **Hero:** full-bleed landscape, CSS gradient overlay, centred stack:
   - Eyebrow: "Historias de misioneros latinos sirviendo entre pueblos no
     alcanzados".
   - Title, as one `h1`: CUÁN / HERMOSOS / SON LOS / *pies* (script).
     Accent added: the design's "CUAN" is missing it, and the verse uses "Cuán".
   - Height `min-h-[80svh]`, with `clamp()` type sizes. Reuse the
     `.parallax-bg` + `ScrollEffects` pattern from `PageHero` so it moves
     like the other heroes.
2. **Verse bar:** white band with the script quote and "ROMANOS 10:15" in
   teal, followed by a thin terracotta rule.
3. **Intro:** terracotta band. Text left, Yurani photo right, with caption
   "Yurani, colombiana que sirvió en África". Stacks on mobile with the photo
   *after* the text.
4. **30 días orando:** tan band. Book mockup left, heading + copy + download
   button right. Stacks on mobile with the book first, and smaller.
5. **Gio quote:** white band. Large script quote and Bebas-style
   attribution, as a `<figure>` + `<blockquote>` + `<figcaption>`.
6. **Escucha historias de latinos:** white band, centred heading + intro,
   `SpotifyEpisodes` grid (already 1 / 2 / 3 columns).
7. **Conversaciones con Yurani, Carolina y Gio:** dark-brown band, centred
   heading and copy ("Yurani, Carolina y Gio" in the script face), then a
   3-up video grid (1 column on mobile, 3 from `md`).
8. **Da el paso:** white band. Script heading + copy + "¿Quieres dar el
   siguiente paso?" on the left, form on the right. Stacks on mobile.

## Implementation

```
app/cuan-hermosos/            (slug per D1)
  page.tsx            server component: metadata, sections, reads content.ts
  content.ts          ALL copy, asset paths, and the placeholder fields:
                        bookCover?: Image, guideUrl?: string,
                        videos: { youtubeId?, still?, title }[3],
                        episodes: SpotifyEpisode[] (+ isStandIn flag)
  SignupForm.tsx      client component (see below)
  campaign.css        page-scoped tokens + hero gradient (or Tailwind arbitrary values)
public/campana/       optimised WebP exports
```

- **One file to fill in later.** Each placeholder is an optional field in
  `content.ts`. The component renders the real thing when the field is set
  and the placeholder when it isn't, so no further component edits are
  needed.
- **Form.** Factor the submit logic out of `app/sirve-con-sim/ContactForm.tsx`
  (the endpoint, access key, fetch-with-no-JS-fallback, status states) into a
  small shared helper. Build a lean two-field form on top of it, with
  consent, "Enviar", and an inline success state. Don't fork the 300-line
  form. With no endpoint configured, it falls back to the email/WhatsApp
  contacts, as Sirve con SIM does.
- **Script font (if D2 = load it).** Call `next/font/google` *inside* the
  page module so the font is only requested on this route. Expose it as
  `--font-script`.
- **Metadata.** Title "Cuán hermosos son los pies", description from the
  intro paragraph, canonical, OG image, and `robots: { index: false }` while
  D5 applies.
- **No nav or sitemap entry** until launch, then add both in one commit.

## Tests

Following the existing `tests/e2e/*.spec.ts` style:
- The page renders a single `h1` and every section heading in order.
- Placeholders render when `content.ts` fields are empty, and the download
  button is not a live link without a URL.
- Form: required fields, consent required, success state (mocked endpoint).
- `noindex` is present, and the page is absent from the sitemap and nav
  (extend `unlisted-pages.spec.ts`).
- Layout check at 375 / 768 / 1280: no horizontal scroll, and the hero title
  fits.

## Follow-ups (drop-in, no code changes)

- Book cover image → `content.ts`
- Prayer guide PDF or URL → `content.ts`
- 3 × YouTube ID + still → `content.ts`
- Confirm or replace the 3 Spotify episodes → `content.ts`
- Remove `noindex`, add to nav and sitemap (one small commit)
