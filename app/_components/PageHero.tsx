import Image from "next/image";
import { ScrollEffects } from "./ScrollEffects";

interface PageHeroProps {
  title: string;
  intro?: string;
  image: { src: string; alt?: string };
  cta?: { label: string; href: string };
}

/**
 * Full-screen hero for the inner pages, matching the live site: the image
 * fills the viewport below the header, with the title left-aligned on the same
 * content box as the logo. Same structure as the homepage hero in app/page.tsx
 * — a .parallax-bg layer behind a centred .hero-content — so both are driven by
 * the one hero block in home.css and the one ScrollEffects script.
 *
 * The hero images carry their own baked-in gradient, so no scrim is layered on
 * top (see tests/e2e/page-hero.spec.ts).
 */
export function PageHero({ title, intro, image, cta }: PageHeroProps) {
  return (
    <>
      <section className="hero-page">
        <div className="parallax-bg" data-parallax="0.8">
          <Image
            src={image.src}
            alt={image.alt ?? ""}
            fill
            preload
            unoptimized
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="hero-content reveal">
          <h1>{title}</h1>
          {intro && <p className="hero-intro">{intro}</p>}
          {cta && (
            <a
              href={cta.href}
              target="_blank"
              rel="noopener"
              className="btn btn-primary hero-cta"
            >
              {cta.label}
            </a>
          )}
        </div>
      </section>
      <ScrollEffects />
    </>
  );
}
