import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "../_components/PageHero";

export const metadata: Metadata = {
  title: "Recursos",
  description:
    "Recursos para candidatos, líderes y toda la iglesia: Revista VAMOS, Manual VAMOS, podcast, videos y cursos online Movilicemos.",
  alternates: { canonical: "/recursos/" },
};

export default function RecursosPage() {
  return (
    <main className="page-offset">
      <PageHero
        title="Recursos para candidatos, líderes y toda la iglesia"
        image={{ src: "/heroes/recursos.webp", alt: "Recursos de SIM Latinoamérica" }}
      />

      {/* Movilicemos */}
      <section className="bg-cream/40">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand">
            Más de 1500 recursos al alcance de la iglesia
          </p>
          <h2 className="font-heading mt-2 text-4xl font-bold text-ink">
            Recursos online Movilicemos
          </h2>
          <p className="mt-5 text-muted">
            Contamos con miles de recursos en línea para movilizar a la iglesia
            en obediencia de la misión de Dios. Nuestra meta es la gloria de Dios
            entre las naciones y nuestro deseo de obedecer al Maestro nos mueve.
            ¡Queremos caminar con la Iglesia en la visión misionera!
          </p>
          <a
            href="https://movilicemos.org/recursos"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Recursos aquí
          </a>
        </div>
      </section>

      {/* Revista + Manual */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-8 md:grid-cols-2">
          <article className="rounded-lg border border-hairline bg-white p-8 shadow-sm">
            <h3 className="font-heading text-2xl font-bold text-ink">Revista VAMOS</h3>
            <p className="mt-3 text-muted">
              Tenemos más de 110 ediciones publicadas en formato digital y
              gratis. Queremos reflejar la voz de los obreros que se encuentran
              en el campo y la realidad de la Iglesia latina.
            </p>
            <Link
              href="/revistavamos/"
              className="mt-5 inline-block rounded-full border-2 border-brand px-7 py-2.5 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
            >
              Descarga aquí
            </Link>
          </article>
          <article className="rounded-lg border border-hairline bg-white p-8 shadow-sm">
            <h3 className="font-heading text-2xl font-bold text-ink">Manual VAMOS</h3>
            <p className="mt-3 text-muted">
              En este manual encontrarás diversos recursos muy útiles y prácticos
              para tu aprendizaje que te ayudarán de manera innovadora en este
              camino de crecimiento para un efectivo trabajo misionero.
            </p>
            <a
              href="https://movilicemos.org/curso-vamos/intro"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-block rounded-full border-2 border-brand px-7 py-2.5 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
            >
              Recursos aquí
            </a>
          </article>
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
