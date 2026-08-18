import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "../_components/PageHero";
import { getBlogPostCardsBySlugs, publishDateToSegment } from "../../lib/contentful";
import { formatPostDate } from "../../lib/dates";

export const metadata: Metadata = {
  title: "Ora",
  description:
    "La historia de SIM es una historia de oración. Súmate en clamor junto a miles de cristianos en el mundo.",
  alternates: { canonical: "/ora/" },
};

// Monthly prayer motives — the legacy page is edited monthly in Elementor;
// this content ships in code for day 1 (per the migration decision) and is a
// candidate for a Contentful type later.
const MOTIVOS = [
  {
    title: "Ora por Carolina",
    text: "Carolina López ha servido con SIM desde el año 2006 en Asia y Europa, y ahora forma parte del equipo de liderazgo de SIM Latinoamérica. Súmate en oración por ella y sus nuevos desafíos.",
    image: "/pages/ora-carolina.jpeg",
  },
  {
    title: "Ora por Colombia",
    text: "A la luz del devastador terremoto que ha afectado a Colombia, nos sumamos en oración por consuelo y fortaleza para las familias afectadas, por los rescatistas, personal médico y autoridades y por la iglesia en Colombia.",
    image: "/pages/ora-colombia.jpeg",
  },
  {
    title: "Ora por la Próxima edición de Revista VAMOS",
    text: "En el mes de septiembre publicaremos una nueva edición de la revista donde veremos historias de obreros latinoamericanos sirviendo a través de las relaciones.",
    image: "/pages/ora-revista-vamos.webp",
  },
];

const SUMATE = [
  {
    title: "Ora por el actual director de envío de Gio",
    text: "Además, por el equipo de liderazgo de la oficina de SIM Latinoamérica.",
  },
  {
    title: "Por unidad entre SIM",
    text: "Principalmente con las agencias e iglesias enviadoras desde y en Latinoamérica.",
  },
  {
    title: "Por el buen cuidado integral de los obreros latinos",
    text: "Especialmente, por aquellos que sirven actualmente en el campo.",
  },
  {
    title:
      "Por sabiduría y desarrollo de buenos materiales para caminar con la Iglesia Latina.",
  },
  {
    title: "Por más obreros latinos",
    text: "Aquellos que han sido enviados, cuidados y sostenidos por sus iglesias, con la bendición de Dios.",
  },
];

const RECURSOS_ORACION = [
  {
    title: "365 Tarjetas de oración por grupos no alcanzados",
    href: "https://movilicemos.org/recursos/no-alcanzados/tarjetas-de-oracion-para-365-dias",
  },
  {
    title: "Té de oración para orar por mujeres musulmanas",
    href: "https://movilicemos.org/recursos/oracion/te-de-oracion-para-mujeres",
  },
  {
    title: "Guía de oración para niños por África occidental",
    href: "https://movilicemos.org/recursos/trabajando-con-ninos/oracion-por-africa-occidenta",
  },
];

// The three featured articles; title, date, excerpt and image all come from
// the CMS so this page can't drift from the posts themselves.
const FULANI_SLUGS = [
  "un-oasis-de-esperanza-para-los-ninos-fulani",
  "vivir-entre-los-fulani-el-viaje-de-alegria-de-christine",
  "la-buena-noticia-se-extiende-de-un-fulani-a-toda-una-aldea-fulani",
];

export default async function OraPage() {
  const fulani = await getBlogPostCardsBySlugs(FULANI_SLUGS);

  return (
    <main className="page-offset">
      <PageHero
        title="¡Únete en oración!"
        intro="La historia de SIM es una historia de oración. Súmate en clamor junto a miles de cristianos en el mundo."
        image={{ src: "/heroes/ora.webp" }}
      />

      {/* Motivos del mes */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-heading mb-10 text-3xl font-bold text-ink">
          Motivos de oración de este mes
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {MOTIVOS.map((m) => (
            <article key={m.title} className="flex flex-col overflow-hidden rounded-lg border border-hairline bg-white shadow-sm">
              <Image
                src={m.image}
                alt={m.title}
                width={512}
                height={340}
                unoptimized
                className="h-52 w-full object-cover"
              />
              <div className="flex flex-1 flex-col p-6">
                <h2 className="font-heading text-xl font-bold text-ink">{m.title}</h2>
                <p className="mt-3 text-sm text-muted">{m.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SIM a través de la Oración */}
      <section className="bg-cream/40">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2">
          <div>
            <h2 className="font-heading text-3xl font-bold text-ink">
              SIM a través de la Oración
            </h2>
            <p className="mt-4 text-muted">
              La historia de SIM es una historia de oración. Mientras una madre
              de Sudán oraba, Dios llamó al hijo de esta mujer y a sus dos amigos
              a formar SIM.
            </p>
            <a
              href="https://www.youtube.com/watch?v=fHHGEC23OTk"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              Mira el video aquí
            </a>
          </div>
          <Image
            src="/pages/ora-video.png"
            alt="SIM a través de la oración — video"
            width={1024}
            height={573}
            unoptimized
            className="w-full rounded-lg object-cover shadow-md"
          />
        </div>
      </section>

      {/* Ora 1002 */}
      <section className="bg-navy">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-cream">
              Guía de oración
            </p>
            <h2 className="font-heading mt-2 text-4xl font-bold text-white">Ora 1002</h2>
            <p className="mt-4 text-white/80">
              Esta campaña de oración ORA 1002 está basada en{" "}
              <strong className="font-semibold text-white">Lucas 10:02</strong>{" "}
              <em>
                &ldquo;Les dijo: «Ciertamente, es mucha la mies, pero son pocos
                los segadores. Por tanto, pidan al Señor de la mies que envíe
                segadores a cosechar la mies&rdquo;.
              </em>
            </p>
            <p className="mt-4 text-white/80">
              Pon en práctica esta campaña de manera personal, en tu grupo
              pequeño o como iglesia.
            </p>
            <p className="mt-4 font-semibold text-white">
              ¡Haz una pausa para orar a las 10:02 de la mañana y/o de la noche,
              pidiendo por más obreros para el campo misionero!
              <br />
              ¿Te unes a este clamor?
            </p>
            <a
              href="/ora/ora-1002.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-block rounded-full bg-cream px-8 py-3 text-sm font-semibold text-brand-dark transition-colors hover:bg-white"
            >
              Descargar PDF
            </a>
          </div>
          <Image
            src="/pages/ora-1002.png"
            alt="Campaña de oración ORA 1002"
            width={640}
            height={640}
            unoptimized
            className="w-full rounded-lg object-contain"
          />
        </div>
      </section>

      {/* Sumarte a orar */}
      <section className="bg-cream/40">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2">
          <Image
            src="/pages/ora-sumate.jpg"
            alt="Personas orando"
            width={768}
            height={699}
            unoptimized
            className="w-full rounded-lg object-cover shadow-md"
          />
          <div>
            <h2 className="font-heading text-3xl font-bold text-ink">
              ¿Quieres sumarte a orar por SIM Latinoamérica?
            </h2>
            <ul className="mt-6 space-y-5">
              {SUMATE.map((item) => (
                <li key={item.title} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand" />
                  <div>
                    <p className="font-semibold text-ink">{item.title}</p>
                    {item.text && <p className="mt-1 text-muted">{item.text}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Recursos sobre la oración */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-heading text-3xl font-bold text-ink">
          Recursos sobre la oración
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {RECURSOS_ORACION.map((r) => (
            <a
              key={r.title}
              href={r.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-lg border border-hairline bg-white p-6 shadow-sm transition hover:border-brand hover:shadow-md"
            >
              <h3 className="font-heading text-lg font-bold text-ink transition-colors group-hover:text-brand">
                {r.title}
              </h3>
              <span className="mt-3 inline-block text-sm font-semibold text-brand">
                Conoce más →
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* Fulani */}
      <section className="bg-cream/40">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-brand">
                ¿Te sumas a orar por el grupo nómada más grande del mundo?
              </p>
              <h2 className="font-heading mt-2 text-4xl font-bold text-ink">
                Oremos por los Fulani
              </h2>
            </div>
            <Link
              href="/blog/"
              className="text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
            >
              Mira más artículos aquí →
            </Link>
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {fulani.map((post) => {
              const href = `/blog/${publishDateToSegment(post.publishDate)}/${post.slug}/`;
              return (
                <article key={post.slug} className="group flex flex-col gap-3">
                  {post.heroImage?.url && (
                    <Link href={href} className="relative block aspect-[3/2] overflow-hidden rounded-md">
                      <Image
                        src={post.heroImage.url}
                        alt={post.heroImage.description ?? post.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </Link>
                  )}
                  <time dateTime={post.publishDate} className="text-xs text-muted">
                    {formatPostDate(post.publishDate)}
                  </time>
                  <h3 className="font-heading text-lg font-bold leading-snug text-ink">
                    <Link href={href} className="transition-colors hover:text-brand">
                      {post.title}
                    </Link>
                  </h3>
                  {post.description && (
                    <p className="line-clamp-4 text-sm text-muted">{post.description}</p>
                  )}
                  <Link
                    href={href}
                    className="mt-auto pt-1 text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
                  >
                    Leer más →
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
