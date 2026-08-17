import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "../_components/PageHero";
import { ResourceTabs, type ResourceTab } from "./ResourceTabs";
import { VideoThumbnail } from "./VideoThumbnail";

export const metadata: Metadata = {
  title: "Recursos",
  description:
    "Recursos para candidatos, líderes y toda la iglesia: Revista VAMOS, Manual VAMOS, podcast, videos y cursos online Movilicemos.",
  alternates: { canonical: "/recursos/" },
};

const RESOURCE_TABS: ResourceTab[] = [
  {
    title: "Revista VAMOS",
    tagline: "Revista digital gratuita con voces y testimonios de toda la iglesia latina",
    body: "Tenemos más de 110 ediciones publicadas en formato digital y gratis. Queremos reflejar la voz de los obreros que se encuentran en el campo y la realidad de la Iglesia latina.",
    image: {
      src: "/pages/recursos-revista.webp",
      alt: "Dos jóvenes sonríen sosteniendo un ejemplar de la revista VAMOS",
    },
    cta: { label: "Descarga aquí", href: "/revistavamos/" },
  },
  {
    title: "Manual VAMOS",
    tagline: "Manual para candidatos misioneros en preparación para el campo",
    body: "En este manual encontrarás diversos recursos muy útiles y prácticos para tu aprendizaje que te ayudarán de manera innovadora en este camino de crecimiento para un efectivo trabajo misionero.",
    image: {
      src: "/pages/recursos-manual.webp",
      alt: "Participantes de un taller de SIM sostienen su ejemplar del Manual VAMOS",
    },
    cta: { label: "Recursos aquí", href: "https://movilicemos.org/curso-vamos/intro" },
  },
];

export default function RecursosPage() {
  return (
    <main className="page-offset">
      <PageHero
        title="Recursos para candidatos, líderes y toda la iglesia"
        image={{ src: "/heroes/recursos.webp", alt: "Recursos de SIM Latinoamérica" }}
      />

      {/* Movilicemos — photo left, copy right (live: .elementor-element-64f3702).
          The photo is near-square, which is ~670px tall once it spans a tablet's
          full width, so it's cropped to 4:3 until the two-column layout kicks in. */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:gap-16">
        <Image
          src="/pages/recursos-movilicemos.webp"
          alt="Un obrero de SIM comparte recursos impresos con un grupo de la iglesia"
          width={885}
          height={806}
          unoptimized
          sizes="(min-width: 1024px) 485px, 92vw"
          className="aspect-[4/3] w-full rounded-lg object-cover lg:aspect-auto"
        />
        <div>
          <p className="text-lg font-medium text-teal">
            Más de 1500 recursos al alcance de la iglesia
          </p>
          <h2 className="font-heading mt-3 text-3xl font-bold text-brand sm:text-4xl lg:text-5xl">
            Recursos online Movilicemos
          </h2>
          <p className="mt-6 font-medium text-muted">
            Contamos con miles de recursos en línea para movilizar a la iglesia
            en obediencia de la misión de Dios.
          </p>
          <p className="mt-2 text-muted">
            Nuestra meta es la gloria de Dios entre las naciones y nuestro deseo
            de obedecer al Maestro nos mueve. ¡Queremos caminar con la Iglesia en
            la visión misionera!
          </p>
          <a
            href="https://movilicemos.org/recursos"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Recursos aquí
          </a>
        </div>
      </section>

      {/* Revista + Manual */}
      <section className="bg-lavender">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <ResourceTabs tabs={RESOURCE_TABS} />
        </div>
      </section>

      {/* Podcast */}
      <section className="bg-navy">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h2 className="font-heading text-3xl font-bold text-white">
            SIM Latinoamérica Podcast
          </h2>
          <p className="mt-4 text-white/80">
            Escucha en cualquier momento reflexiones sobre la misión global de
            Dios que serán de gran ánimo y bendición para ti. También puedes
            escuchar nuestras nuevas audiorevistas de las ediciones de la Revista
            Vamos.
          </p>
          <a
            href="https://open.spotify.com/show/0vftsfjR9UP5tD2PG6jb5P"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block rounded-full bg-white px-8 py-3 text-sm font-semibold text-navy transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            Escucha más en Spotify
          </a>
        </div>
      </section>

      {/* Talleres / YouTube — lavender band (live: .elementor-element-42c5d91).
          The Cursos card below overlaps up into it, so this section owns the
          colour the card's top half sits on. Live reserves 380px of empty
          bottom padding here purely to make room for that overlap; the rebuilt
          Cursos section doesn't need it, so this is plain py-16. */}
      <section className="bg-lavender">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2">
          <div>
            <Image
              src="/pages/recursos-youtube-logo.png"
              alt="YouTube"
              width={176}
              height={40}
              unoptimized
              className="h-[30px] w-auto"
            />
            <h2 className="font-heading mt-6 text-3xl font-bold text-navy sm:text-4xl lg:text-5xl">
              Talleres, series, conversaciones y mucho más
            </h2>
            <p className="mt-6 max-w-[400px] text-muted">
              En nuestro canal de YouTube, donde podrás conocer los rostros de
              personas sirviendo en la misión local y global.
            </p>
            <a
              href="https://www.youtube.com/c/SIMLatinoamérica"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-block rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              Mira más videos aquí
            </a>
          </div>
          <VideoThumbnail
            image={{
              src: "/pages/recursos-youtube.jpg",
              alt: "Participantes de un taller de SIM conversan alrededor de una mesa",
              width: 885,
              height: 630,
            }}
            videoId="tZwOQbkjf5Q"
            label="Talleres, series y conversaciones de SIM Latinoamérica"
          />
        </div>
      </section>

      {/* Cursos online Movilicemos — copy left, photo right in one dark-red card
          (live: .elementor-element-19883c7).

          Live straddles the card across the lavender/white seam by pulling it up
          with a fixed `margin-top: -280px`, which only lines up because the band
          above reserves ~400px of empty padding for it. Here the seam is painted
          behind the card instead: the band ends at the section's midpoint, so the
          straddle stays centred as the card grows or shrinks, and the section
          above needs no dead space. Live drops the overlap under 768px; so do we. */}
      <section className="relative">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 hidden h-1/2 bg-lavender md:block"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16">
          <div className="grid overflow-hidden rounded-2xl bg-brand-dark md:grid-cols-2">
            <div className="px-5 py-12 lg:py-24 lg:pl-24 lg:pr-12">
              <p className="text-lg font-medium text-cream">Recurso gratuito</p>
              <h2 className="font-heading mt-3 text-3xl font-bold text-cream sm:text-4xl lg:text-5xl">
                Cursos online Movilicemos
              </h2>
              <p className="mt-6 max-w-[380px] text-white lg:text-lg">
                Todos los cursos son 100% en línea, con clases pregrabadas a las
                que tienes acceso de manera ilimitada. ¡Puedes desarrollarlos a
                tu propio ritmo! ¡No son zoom o en vivos!
              </p>
              <a
                href="https://cursos.movilicemos.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-block rounded-full bg-cream px-8 py-3 text-sm font-semibold text-brand-dark transition-colors hover:bg-white"
              >
                Quiero saber más
              </a>
            </div>
            {/* Live paints this half as a CSS background, so the photo is
                invisible to assistive tech and never in the srcset. A filled
                <Image> keeps the same crop while staying real content. */}
            <div className="relative min-h-[300px]">
              <Image
                src="/pages/recursos-cursos.webp"
                alt="Una mujer toma apuntes frente a su laptop mientras sigue un curso online de Movilicemos"
                fill
                unoptimized
                sizes="(min-width: 768px) 50vw, 92vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
