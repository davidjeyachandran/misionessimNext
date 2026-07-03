# SIM Latinoamérica — Homepage Replica (POC)

A static replica of the [misionessim.org](https://misionessim.org/) homepage in plain
**HTML / CSS / JS** — no framework, no build step, no WordPress.

## Purpose
The live site runs on WordPress + Elementor (Astra theme, ElementsKit, jarallax, GiveWP…).
This POC shows the homepage can be reproduced by hand with a fraction of the payload,
which de-risks a migration to a static **Next.js** app: each section here maps 1:1 to a
future React component, and every asset is already local.

## Run it

```bash
python3 -m http.server 8137
# open http://localhost:8137
```

Or open `index.html` directly (the YouTube lightbox needs a network connection).

## What's implemented
- **Parallax backgrounds** on the hero, "Conócenos" video section, and Revista VAMOS
  section — vanilla rAF-throttled `transform: translate3d`, replacing jarallax.
  Respects `prefers-reduced-motion`.
- **Fixed white header** (71px, like the live Elementor header template) with search icon
  and the "Servir con SIM" CTA.
- **Responsive hamburger nav** (slide-in drawer below 768px).
- **Scroll-reveal** fade-ups via `IntersectionObserver`, replacing Elementor's
  fadeIn/fadeInUp entrance animations.
- **YouTube lightbox** for the "Ver Video" button (video `zx8x6J7vPNI`), replacing the
  ElementsKit video popup. Iframe is created on open and destroyed on close.
- All content sections from the live homepage: hero, quiénes somos, Sirve/Da/Ora cards,
  Conócenos video, blog (3 latest posts), Revista VAMOS, YouTube promo, footer.

## Fidelity notes (taken from the live Elementor kit)
- Colors: primary `#C91430`, secondary `#002F49`, text `#0A0117` (from `elementor-kit-6`).
- Fonts: **Raleway** (headings) + **Work Sans** (body), self-hosted woff2 in `assets/fonts/`.
- Hero: `95vh`, 57px Raleway title, dark overlay — same values as the live CSS.
- All images/logos downloaded from the live site into `assets/`.

## Structure
```
index.html        one page, semantic sections
css/styles.css    design tokens in :root, one block per section
js/main.js        header, nav, parallax, reveal, lightbox (~100 lines)
assets/           images + self-hosted fonts
```
