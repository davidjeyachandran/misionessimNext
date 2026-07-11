import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAllRevistas } from "../../lib/contentful";
import { fechaToEdicion } from "../../lib/dates";
import { PageHero } from "../_components/PageHero";

export const metadata: Metadata = {
  title: "Revista VAMOS",
  description:
    "Una revista con pasión por las misiones. Más de 110 ediciones publicadas en formato digital y gratis.",
  alternates: { canonical: "/revistavamos/" },
};

export default async function RevistaIndexPage() {
  const revistas = await getAllRevistas();
  const newest = revistas[0];
  const rest = revistas.slice(1);

  return (
    <main className="page-offset">
      <PageHero
        title="Revista con pasión por las misiones."
        intro="Queremos reflejar la voz de los obreros que se encuentran en el campo y la realidad de la iglesia latina. Tenemos más de 100 ediciones publicadas en formato digital y gratis."
        image={{ src: "/heroes/revistavamos.png" }}
        cta={{ label: "Suscríbete aquí", href: "https://oi.vresp.com?fid=669a6c7963" }}
      />

      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Nueva edición featured block */}
        {newest && (
          <div className="mb-14">
            <p className="text-brand text-sm font-semibold uppercase tracking-wide mb-4">
              Nueva edición
            </p>
            <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
              <a
                href={newest.pdfUrl ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-[543/768] w-full shrink-0 overflow-hidden rounded-md shadow-md sm:w-1/3"
              >
                {newest.coverImage?.url && (
                  <Image
                    src={newest.coverImage.url}
                    alt={newest.coverImage.description ?? `Portada: ${newest.title}`}
                    fill
                    className="object-contain"
                    priority
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                )}
              </a>
              <div className="flex flex-col justify-center gap-3">
                <h2 className="font-heading text-3xl font-bold text-brand">
                  {newest.title}
                </h2>
                <p className="capitalize text-muted">
                  <time dateTime={newest.fecha}>{fechaToEdicion(newest.fecha)}</time>
                </p>
                {newest.pdfUrl && (
                  <a
                    href={newest.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block self-start rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
                  >
                    Leer la revista (PDF)
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {rest.map((revista) => (
            <article key={revista.slug} className="group flex flex-col gap-2">
              <Link
                href={`/revistavamos/${revista.slug}/`}
                className="relative block aspect-[543/768] overflow-hidden rounded-md bg-cream shadow-sm"
              >
                {revista.coverImage?.url && (
                  <Image
                    src={revista.coverImage.url}
                    alt={revista.coverImage.description ?? `Portada: ${revista.title}`}
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                )}
              </Link>
              <h2 className="font-heading text-base font-bold leading-snug text-ink">
                <Link
                  href={`/revistavamos/${revista.slug}/`}
                  className="transition-colors hover:text-brand"
                >
                  {revista.title}
                </Link>
              </h2>
              <p className="text-xs capitalize text-muted">
                <time dateTime={revista.fecha}>{fechaToEdicion(revista.fecha)}</time>
              </p>
            </article>
          ))}
        </div>

        {/* Testimonial */}
        <section className="mt-16 -mx-4 bg-[#eef0f8] px-4 py-16">
          <blockquote className="mx-auto max-w-3xl text-center">
            <p className="text-lg leading-relaxed text-ink">
              &ldquo;¡La revista VAMOS ha bendecido tanto mi vida! Y gracias a ella fue que Dios
              sembró en mi corazón el ir a Turquía y trabajar con refugiados. La edición
              que habla sobre el retorno de los misioneros a casa, realmente llegó muy
              profundo a mi corazón. Hace unos meses que retorné a mi país y entiendo el
              sentimiento de soledad y el no ser comprendidos o el sentir que a nadie le
              importa oír lo que Dios estuvo haciendo estos años. Pero a pesar de que ha
              sido duro, Dios usó ese dolor para mostrarme que Él siempre estuvo conmigo.
              Que Él me ve y que a Él le importa.&rdquo;
            </p>
            <footer className="mt-6 font-semibold text-ink">
              — Pamela, Bolivia
            </footer>
          </blockquote>
        </section>
      </div>
    </main>
  );
}
