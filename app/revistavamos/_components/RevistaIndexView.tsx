import Image from "next/image";
import Link from "next/link";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { getAllRevistas } from "@/lib/contentful";
import { fechaToEdicion } from "@/lib/dates";
import { PageHero } from "@/app/_components/PageHero";
import { PER_PAGE } from "@/app/revistavamos/_lib/config";
import { Pagination } from "@/app/revistavamos/_components/Pagination";
import { TestimoniosSlider } from "@/app/revistavamos/_components/TestimoniosSlider";
import {
  SpotifyEpisodes,
  type SpotifyEpisode,
} from "@/app/_components/SpotifyEpisodes";

const TESTIMONIOS = [
  {
    quote:
      "¡La revista VAMOS ha bendecido tanto mi vida! Y gracias a ella fue que Dios sembró en mi corazón el ir a Turquía y trabajar con refugiados. La edición que habla sobre el retorno de los misioneros a casa, realmente llegó muy profundo a mi corazón. Hace unos meses que retorné a mi país y entiendo el sentimiento de soledad y el no ser comprendidos o el sentir que a nadie le importa oír lo que Dios estuvo haciendo estos años. Pero a pesar de que ha sido duro, Dios usó ese dolor para mostrarme que Él siempre estuvo conmigo. Que Él me ve y que a Él le importa.",
    name: "Pamela",
    location: "Bolivia",
  },
  {
    quote:
      "Agradecemos a Dios por su ministerio, aquí en Cuba disfrutamos y aprovechamos mucho de sus revistas VAMOS, los misioneros de nuestra agencia son capacitados con dichos recursos.",
    name: "Ps Karrel",
    location: "Cuba",
  },
  {
    quote:
      "En estos días estamos enseñando sobre la Familia en el Campo. Y es de mucha bendición tener los materiales de la Revista. Ha sido de mucha ayuda.",
    name: "Julio",
    location: "Colombia",
  },
  {
    quote:
      "Muchas gracias por la revista, excelente trabajo, me gusta porque presenta de manera muy clara que el trabajo es también parte de la extensión del Reino de Dios y tenemos la misma identidad como discípulos de Jesús, además creo que es una buena herramienta para educar a las iglesias y también usar el potencial y dones de los profesionales en el campo misionero, les agradezco y les felicito por todo ese esfuerzo para educar y motivar a la iglesia.",
    name: "Karuna",
    location: "Honduras",
  },
  {
    quote:
      "Queridos hermanos, nos sentimos muy honrados al recibir la revista VAMOS. Somos una familia voluntaria/misionera en Colombia. También nos gustó mucho la edición de autocuidado.",
    name: "Yohanna",
    location: "Colombia",
  },
];

/** Audiorevista episodes featured under the index, in live's order. */
const AUDIOREVISTA_EPISODES: SpotifyEpisode[] = [
  { id: "2CP1iLYpS7qyBC2MXYR3Ym", title: "Revista Soy Influencer para el Reino - Parte 1" },
  { id: "1saGQiYDIGdlZaXsGn3KCP", title: "Revista Tecnología en misiones - Parte 1" },
  { id: "3dqJqqJPcDktF9yNwDsLXW", title: "Revista Latinos en adaptación - Parte 1" },
];

/**
 * Total number of paginated revista pages (>= 1). The newest issue is shown in
 * its own featured block on page 1, so it doesn't count toward the grid.
 */
export async function revistaTotalPages(): Promise<number> {
  const revistas = await getAllRevistas();
  return Math.max(1, Math.ceil(Math.max(0, revistas.length - 1) / PER_PAGE));
}

/** Shared body for `/revistavamos/` and `/revistavamos/page/N/`. */
export async function RevistaIndexView({ page }: { page: number }) {
  const revistas = await getAllRevistas();
  const newest = revistas[0];
  const rest = revistas.slice(1);
  const totalPages = Math.max(1, Math.ceil(rest.length / PER_PAGE));
  const items = rest.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <main className="page-offset">
      <PageHero
        title="Revista con pasión por las misiones."
        intro="Queremos reflejar la voz de los obreros que se encuentran en el campo y la realidad de la iglesia latina. Tenemos más de 100 ediciones publicadas en formato digital y gratis."
        image={{ src: "/heroes/revistavamos.webp" }}
        cta={{ label: "Suscríbete aquí", href: "https://oi.vresp.com?fid=669a6c7963" }}
      />

      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Nueva edición featured block — page 1 only, so it isn't repeated. */}
        {page === 1 && newest && (
          <div className="mb-14">
            <p className="text-brand text-sm font-semibold uppercase tracking-wide mb-4">
              Nueva edición
            </p>
            <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
              {/* The cover goes to the issue's own page, not straight to the
                  PDF, so readers land on the related blog posts first. The
                  PDF stays one click away on the button below. */}
              <Link
                href={`/revistavamos/${newest.slug}/`}
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
              </Link>
              <div className="flex flex-col justify-center gap-3">
                <h2 className="font-heading text-3xl font-bold text-brand">
                  {newest.title}
                </h2>
                <p className="capitalize text-muted">
                  <time dateTime={newest.fecha}>{fechaToEdicion(newest.fecha)}</time>
                </p>
                {newest.body && (
                  <div className="leading-relaxed text-ink">
                    {documentToReactComponents(newest.body)}
                  </div>
                )}
                {newest.pdfUrl && (
                  <a
                    href={newest.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block self-start rounded-btn bg-brand px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
                  >
                    Leer la revista (PDF)
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((revista) => (
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

        <Pagination page={page} totalPages={totalPages} basePath="/revistavamos" />
      </div>

      {/* Testimonios de lectores — the tint runs the full width of the window,
          as it does on live (.elementor-element-db98677), so it reads as a band
          rather than a card sitting inside the grid's column. Live's shade is
          #eaebf8, which is already the site's `lavender` token. */}
      <section className="bg-lavender">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="font-heading mb-10 text-center text-2xl font-bold text-ink">
            Testimonios de lectores
          </h2>
          <TestimoniosSlider testimonios={TESTIMONIOS} />
        </div>
      </section>

      {/* Audiorevista — white band closing the index, on every paginated page
          just as live does (live: .elementor-element-0ab7303).

          Live wraps each player in a white card carrying a decorative
          shape-6.svg background. The card is white-on-white and sized to the
          player, so the shape is covered on desktop and set to
          `background-size: 0` below 768px — never visible at any width. Both
          are dropped and the players sit straight in the grid, the same way
          the /recursos podcast band is built.

          Live also fades the heading and each card in with an ElementsKit
          animation that starts them at `visibility: hidden`. When that script
          doesn't run the whole band stays blank, which is what live does today
          on a slow connection. Nothing here depends on JS to become visible. */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          {/* Live caps the description at 1000px and centres the block from
              768px up, left-aligning it below — same as the podcast band. */}
          <div className="mx-auto max-w-[1000px] md:text-center">
            <h2 className="font-heading text-3xl font-bold text-navy sm:text-4xl lg:text-5xl">
              Audiorevista VAMOS
            </h2>
            <p className="mt-6 text-muted">
              Ahora también puedes escuchar toda la Revista VAMOS desde
              cualquier lugar
            </p>
          </div>

          {/* Live keeps three players per row down to 768px, squeezing each to
              189px and truncating the episode title. Two-up on tablet,
              three-up from 1024px. */}
          <SpotifyEpisodes episodes={AUDIOREVISTA_EPISODES} className="mt-12" />
        </div>
      </section>
    </main>
  );
}
