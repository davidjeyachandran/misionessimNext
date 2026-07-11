# Gap analysis — live misionessim.org vs local Next.js site (2026-07-11)

**Goal:** make the local site look as close as possible to the live site, **valuing
simple HTML/CSS over a pixel-perfect match**. The live site is the requirement
except where a decision below says otherwise.

**How this was produced:** every main page was screenshotted at mobile (375),
tablet (768) and desktop (1440) on both sites and compared pair-by-pair:

- Live-site shots: `reference/baselines/<page>/<viewport>.{above-fold,full-page}.png`
- Local shots: `reference/local/<page>/…` (same naming) — regenerate any time
  with `yarn capture:local` (dev server must be running on :3000).

⚠️ Note on full-page captures: images below the fold lazy-load, so tall grids
show beige placeholder tiles in `full-page.png` — that is a screenshot artifact,
NOT a bug. Live-site full-page captures show large blank regions because of
scroll-reveal animations — also an artifact. Judge structure, not blankness.

---

## Decisions (David, 2026-07-11)

1. **Rebuild the red-gradient page hero** as one shared component on: blog
   index, revista index, nosotros, ora, sirve-con-sim.
2. **No blog sidebar** (no search box, no category dropdown, no featured
   articles). Add a category link row on the blog index instead.
3. **Revista index gets all three live extras**: "Nueva edición" featured
   block, "Suscríbete aquí" button, testimonial section (static, no slider).
4. **No social share buttons** anywhere.
5. (Standing decision) **Revista editions show a cover image linking to the
   PDF** — never the live site's embedded PDF flipbook.

## Accepted differences — do NOT "fix" these

| Live | Local (keep as-is) |
|---|---|
| Embedded PDF flipbook viewer on edition pages | Cover image + "Leer la revista (PDF)" button |
| Blog/revista sidebar with search + category dropdown + featured | No sidebar; centered content |
| Share buttons (FB/X/LinkedIn) on detail pages | None |
| Numbered pagination circles (1 2 3 … NEXT) | "Página X de Y · Siguiente →" |
| Revista index paginated 16-per-page via AJAX carousel | Single flat grid of all editions |
| `/terms-and-conditions/` page | Deliberately not rebuilt (404s) |
| Author byline "ADMIN" on posts | No byline (authors dropped) |
| No breadcrumbs | Breadcrumbs kept (ours is an improvement) |
| Testimonial slider (multiple quotes, dots) | One static quote |

---

## Task list (ordered; each task is independent)

Design tokens already exist — use them, never hardcode hex:
Tailwind: `text-brand` #C91430 · `text-navy`/`bg-navy` #002F49 · `text-ink` ·
`text-muted` · `bg-cream` · `font-heading` (Raleway) · `font-sans` (Work Sans).
Homepage CSS vars (`app/home.css`): `--color-primary`, `--color-secondary`, etc.

### T1 — Footer parity (global, biggest win)

Files: `app/_components/SiteFooter.tsx`, `app/home.css` (`.site-footer` block ~line 351).

Live footer (see any `reference/baselines/*/desktop.full-page.png`, bottom):
- Background is **navy #002F49**, not near-black. Change
  `.site-footer { background: var(--color-text) }` → `var(--color-secondary)`.
- **4 columns**, not 3: brand | MENÚ | ACCESOS | **¿TIENES ALGUNA PREGUNTA?**
  The missing 4th column: heading `¿Tienes alguna pregunta?`, line
  `Escríbenos aquí:`, then `sim.preguntas@sim.org` as a
  `mailto:sim.preguntas@sim.org` link. Update `.footer-grid` to
  `grid-template-columns: 1.4fr 1fr 1fr 1.2fr` (desktop; stack on mobile as now).
- Column headings are **uppercase** on live: add `text-transform: uppercase;`
  to `.footer-title`.
- Bottom bar: copyright left, **`Sirve · Ora · Da`** right. Make
  `.footer-bottom .container` a flex row with `justify-content: space-between`
  (wraps on mobile).

Acceptance: footer on any page matches live's navy 4-column footer at 1440
and stacks cleanly at 375.

### T2 — Blog date off-by-one bug

Live shows "28 octubre, 2021"; local shows "29 de octubre de 2021" for the
same post — dates are formatted in server-local time instead of UTC.

- `app/blog/[date]/[slug]/page.tsx:174` and
  `app/blog/_components/PostCard.tsx:9`: add `timeZone: "UTC"` to the
  `toLocaleDateString` options (exactly like `lib/dates.ts:7` already does).
  Better: move the formatting into a `formatPostDate()` helper in `lib/dates.ts`
  and call it from both places.

Acceptance: `/blog/2021-10/entendiendo-el-por-que-detras-de-las-preguntas/`
shows **28 de octubre de 2021**. `yarn test:unit` passes; add a unit test for
the helper with a date that crosses midnight UTC.

### T3 — Homepage heading color bug

`.about-title` ("SIM es una comunidad de seguidores de Dios") should be red
but renders **navy**: `app/home.css` has `.sim-home :is(h1, h2, h3)` →
`var(--color-secondary)`, whose specificity (0,1,1) beats `.about-title`
(0,1,0). Live shows red.

Fix in `app/home.css:214`: change the selector to `.sim-home .about-title`.
Check the same page for other headings that `:is()` clobbers (any `h2/h3`
with a single-class color rule) and apply the same fix.

Acceptance: computed color of `.about-title` is `rgb(201, 20, 48)`.

### T4 — Shared PageHero component

New file `app/_components/PageHero.tsx` + styles (Tailwind utilities are fine
and preferred here). Server component, no client JS, no animations.

```tsx
interface PageHeroProps {
  title: string;
  intro?: string;
  image: { src: string; alt?: string };   // from public/heroes/
  cta?: { label: string; href: string };  // optional button
}
```

Markup shape (keep this simple):

```tsx
<section className="relative isolate overflow-hidden bg-navy">
  <Image src={image.src} alt="" fill priority
         className="absolute inset-0 -z-10 object-cover" />
  {/* red gradient over the photo, fading to transparent on the right */}
  <div className="absolute inset-0 -z-10 bg-gradient-to-r
                  from-[#a50d26]/95 via-brand/75 to-brand/10" />
  <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
    <h1 className="max-w-xl font-heading text-4xl font-bold text-white md:text-5xl">
      {title}
    </h1>
    {intro && <p className="mt-4 max-w-md text-white/90">{intro}</p>}
    {cta && (
      <a href={cta.href} target="_blank" rel="noopener"
         className="mt-8 inline-block rounded-full bg-brand px-6 py-3
                    text-sm font-semibold text-white hover:bg-brand-dark">
        {cta.label}
      </a>
    )}
  </div>
</section>
```

The one hardcoded hex `#a50d26` is the darkened red edge of the live
gradient — acceptable as a one-off inside the component.

Because pages currently offset the fixed 71px header with `.page-offset` on
`<main>`: pages that adopt PageHero should render it INSIDE `<main
className="page-offset">` as the first child, full-bleed (drop the page's
`max-w-*` wrapper to a child div, or place the hero before the constrained
container — follow whichever the page already does for full-bleed sections).

**Hero images**: copy from the wget mirror into `public/heroes/`. Find each
page's hero image by opening the mirror HTML and looking at the first
section's `background-image`/`<img>`:
`reference/mirror/{blog,revistavamos,nosotros,ora,sirve-con-sim}/index.html`,
assets live under `reference/mirror/wp-content/uploads/…`. Pick the largest
available size; JPEG ≤ ~350 KB preferred (use the already-sized `-1024x…`
variant if the original is huge).

Per-page copy (from the live site — reuse verbatim):

| Page | title | intro | cta |
|---|---|---|---|
| `/blog/` (`app/blog/page.tsx`) | Reflexiones y experiencias desde el campo | — | — |
| `/revistavamos/` (`app/revistavamos/page.tsx`) | Revista con pasión por las misiones. | Queremos reflejar la voz de los obreros que se encuentran en el campo y la realidad de la iglesia latina. Tenemos más de 100 ediciones publicadas en formato digital y gratis. | label: "Suscríbete aquí", href: `https://oi.vresp.com?fid=669a6c7963` (VerticalResponse hosted opt-in — plain link, opens new tab) |
| `/nosotros/` | ¿Quiénes somos? | Convencidos de que nadie debe vivir y morir sin haber escuchado las buenas nuevas, creemos que Él nos llamó a hacer discípulos del Señor en comunidades donde es menos conocido. | — |
| `/ora/` | ¡Únete en oración! | La historia de SIM es una historia de oración. Súmate en clamor junto a miles de cristianos en el mundo. | — |
| `/sirve-con-sim/` | ¡Hay lugar para ti en SIM! | Tú también puedes servir entre los no alcanzados junto a SIM. ¡Tus dones, profesión o talentos pueden ser usados para alcanzar con el mensaje de Jesús! | — |

When adding the hero to a page, REMOVE that page's current flat `<h1>`
heading block (don't render the title twice). On `/ora/` the current navy
banner block is replaced by the hero; keep the "Motivos de oración de este
mes" `<h2>` as a section heading below. On `/nosotros/` and
`/sirve-con-sim/` the current two-column intro (heading + photo) is replaced
by the hero; the photo those intros used is freed up (unused is fine).

Acceptance: all 5 pages open with the red-gradient photo hero; text is
readable at 375 and 1440; no layout shift (image uses `priority`).

### T5 — Revista index: "Nueva edición" featured block

File: `app/revistavamos/page.tsx`. Data: `getAllRevistas()` already returns
editions sorted `fecha_DESC`; `revistas[0]` is the newest.

Between the hero (T4) and the grid, add:

- Eyebrow: `NUEVA EDICIÓN` — `text-brand text-sm font-semibold uppercase tracking-wide`
- Two-column block (stacks on mobile): left = cover image (~1/3 width,
  `aspect-[3/4]`, links to `pdfUrl` in a new tab — image → PDF, per standing
  decision); right = edition title as `<h2>` (`font-heading text-3xl
  font-bold text-brand`), the `fechaToEdicion(...)` date line, and a
  "Leer la revista (PDF)" button (copy the button style used on the
  edition detail page).
- Exclude `revistas[0]` from the grid below (`revistas.slice(1)`).
- There is no description field in our `RevistaCard` — don't add one.

Acceptance: newest edition renders large above the grid and is not
duplicated inside the grid.

### T6 — Revista index: testimonial section

Same file, below the grid. Static, no JS, no slider. Light lavender band —
use `bg-[#eef0f8]` (one-off tint, matches live) with generous vertical
padding. Centered `<blockquote>` `max-w-3xl`, then name + country.

Copy (verbatim from live):

> ¡La revista VAMOS ha bendecido tanto mi vida! Y gracias a ella fue que Dios
> sembró en mi corazón el ir a Turquía y trabajar con refugiados. La edición
> que habla sobre el retorno de los misioneros a casa, realmente llegó muy
> profundo a mi corazón. Hace unos meses que retorné a mi país y entiendo el
> sentimiento de soledad y el no ser comprendidos o el sentir que a nadie le
> importa oír lo que Dios estuvo haciendo estos años. Pero a pesar de que ha
> sido duro, Dios usó ese dolor para mostrarme que Él siempre estuvo conmigo.
> Que Él me ve y que a Él le importa.

— **Pamela**, Bolivia

Acceptance: quote band renders full-bleed below the grid, above the footer.

### T7 — Revista edition detail page parity

File: `app/revistavamos/[slug]/page.tsx`. Compare
`reference/baselines/la-revista__africa/` vs `reference/local/…` (desktop +
mobile).

- **Cover much larger**: live's viewer column is ~470px wide at 1440. Make
  the cover image column ~`md:w-[460px]` (keep `aspect-[3/4]`), full
  container width on mobile. Cover links to `pdfUrl` (new tab).
- **Title**: red, larger — `font-heading text-4xl md:text-5xl font-bold
  text-brand` (live shows the title in brand red, not ink).
- **"Fecha" row** like live: a labeled row under the title with hairline
  top/bottom borders — `border-y border-hairline py-4`, label `Fecha`
  (semibold ink) left, value (e.g. "Julio, 2013" — `fechaToEdicion`) in
  muted, ~“label 1/3, value 2/3” columns.
- Keep the existing "Leer la revista (PDF)" button and breadcrumbs.
- **Edition articles**: the section exists conditionally; editions like
  Africa (2013) simply have no linked posts — no change needed. Verify one
  edition WITH posts still renders its PostCards grid after the layout edit
  (e.g. `/revistavamos/el-islam/` or any edition that shows articles).

Acceptance: at 1440 the page reads cover-left / info-right like live; at 375
the cover spans the container width (live parity), title red.

### T8 — Blog index: category link row

File: `app/blog/page.tsx`. Replaces live's sidebar "Temas" dropdown
(decision: no sidebar). Under the hero, above the grid: a wrapped row of
category pills linking to `/blog/category/<slug>/`. Categories + slugs come
from the existing helpers in `lib/contentful.ts` that the category archive
pages already use (`getAllCategories` or equivalent — check the file). Style:
`rounded-full border border-hairline px-4 py-1.5 text-sm text-muted
hover:border-brand hover:text-brand`.

Acceptance: pills render on `/blog/` and each links to a working archive page.

### T9 — Optional polish (only if everything above lands)

- Blog post `<h2>` scale: live renders section headings noticeably larger
  (~34px). If posts use `prose`, bump with `prose-h2:text-3xl`; otherwise
  adjust the rich-text renderer's h2 class in
  `app/blog/[date]/[slug]/page.tsx`.
- Blog post category eyebrow: live shows it ABOVE the title in red uppercase
  — ours already does; confirm order title/eyebrow matches live after T4.

---

## Data tasks — NOT styling; do NOT attempt without David

1. **Missing recent editions** (recurring known TODO, now user-visible):
   "Lucha espiritual" (Nº 117, marzo 2026) and "El clamor macedonio" (Nº 118,
   junio 2026) — and ~3 older ones — are not in Contentful.
   `/revistavamos/lucha-espiritual/` currently hard-errors in dev
   (`generateStaticParams` + `output: export`). They'll appear on the index
   and get pages automatically once imported (`import-vamos` skill / the
   planned `export-revista.ts`).
2. **Cleanup script**: strip archived blogPost links from
   `Revista.blogPosts` arrays (app already tolerates them; noise removal).

## Verification (after each task)

1. Dev server on :3000 → `yarn capture:local`
2. Compare the touched page(s): `reference/local/<page>/desktop.full-page.png`
   vs `reference/baselines/<page>/desktop.full-page.png`, plus the mobile pair.
3. `yarn test:unit` and a `yarn build` (static export must succeed) before
   calling the batch done.
