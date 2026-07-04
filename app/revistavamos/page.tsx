import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAllRevistas } from "../../lib/contentful";
import { fechaToEdicion } from "../../lib/dates";

export const metadata: Metadata = {
  title: "Revista VAMOS",
  description:
    "Una revista con pasión por las misiones. Más de 110 ediciones publicadas en formato digital y gratis.",
  alternates: { canonical: "/revistavamos/" },
};

export default async function RevistaIndexPage() {
  const revistas = await getAllRevistas();

  return (
    <main className="page-offset mx-auto max-w-6xl px-4 py-12">
      <header className="mb-10">
        <h1 className="font-heading text-4xl font-bold text-ink">Revista VAMOS</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Una revista con pasión por las misiones. Queremos reflejar la voz de
          los obreros que se encuentran en el campo y la realidad de la Iglesia
          latina. {revistas.length} ediciones publicadas en formato digital y
          gratis.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {revistas.map((revista) => (
          <article key={revista.slug} className="group flex flex-col gap-2">
            <Link
              href={`/revistavamos/${revista.slug}/`}
              className="relative block aspect-[3/4] overflow-hidden rounded-md bg-cream shadow-sm"
            >
              {revista.coverImage?.url && (
                <Image
                  src={revista.coverImage.url}
                  alt={revista.coverImage.description ?? `Portada: ${revista.title}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
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
    </main>
  );
}
