import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "../_components/PageHero";
import { ResourceTabs, type ResourceTab } from "./ResourceTabs";

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

      {/* YouTube */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2">
        <div>
          <h2 className="font-heading text-3xl font-bold text-ink">
            Talleres, series, conversaciones y mucho más
          </h2>
          <p className="mt-4 text-muted">
            En nuestro canal de YouTube, donde podrás conocer los rostros de
            personas sirviendo en la misión local y global.
          </p>
          <a
            href="https://www.youtube.com/c/SIMLatinoamérica"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Mira más videos aquí
          </a>
        </div>
        <Image
          src="/pages/recursos-youtube.jpg"
          alt="Canal de YouTube de SIM Latinoamérica"
          width={768}
          height={547}
          unoptimized
          className="w-full rounded-lg object-cover shadow-md"
        />
      </section>

      {/* Cursos */}
      <section className="bg-cream/40">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand">
            Recurso gratuito
          </p>
          <h2 className="font-heading mt-2 text-4xl font-bold text-ink">
            Cursos online Movilicemos
          </h2>
          <p className="mt-5 text-muted">
            Todos los cursos son 100% en línea, con clases pregrabadas a las que
            tienes acceso de manera ilimitada. ¡Puedes desarrollarlos a tu propio
            ritmo! ¡No son zoom o en vivos!
          </p>
          <a
            href="https://cursos.movilicemos.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Quiero saber más
          </a>
        </div>
      </section>
    </main>
  );
}
