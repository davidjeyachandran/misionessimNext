import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "../_components/PageHero";

export const metadata: Metadata = {
  title: "Dar",
  description:
    "Tu apoyo fortalece a la misión global de Dios. Da hoy para ser parte de la facilitación de más latinos participando en ministerios transculturales.",
  alternates: { canonical: "/dar/" },
};

// Gifts are taken on SIM USA's Spanish giving page; this site has no payment
// flow of its own.
const DONATE_URL = "https://www.simusa.org/es-donar?fund-code=P090588%20Project%20Gifts%20NonUS";
const projectUrl = (code: string) =>
  `https://www.simusa.org/es-donar?fund-code=${code}+Project+Gifts+NonUS`;
const CONTACT_EMAIL = "sim.preguntas@sim.org";

// "Fotos de diferentes maneras en que las ofrendas son utilizadas". Photos are
// from SIM Latinoamérica's "usar dar" Drive folder; the captions are ours,
// written from the "Objetivo de Dar" copy.
// The faces in dar-bravos-prayer are blurred at source — keep it uncropped.
const USOS = [
  {
    image: "/pages/dar-bravos-prayer.webp",
    alt: "Una iglesia ora por sus enviados a la misión",
    caption: "La iglesia envía; acompañamos y recibimos a sus enviados.",
  },
  {
    image: "/pages/dar-capacitacion.webp",
    alt: "Obreros latinos de SIM conversan alrededor de una mesa",
    caption: "Equipos movilizan; los capacitamos y equipamos con recursos.",
  },
  {
    image: "/pages/dar-stand.webp",
    alt: "Stand de SIM con un mapa del mundo y recursos misioneros",
    caption: "Movilización de iglesias: tu campo misionero empieza aquí y ahora.",
  },
  {
    image: "/pages/dar-fam-tailandia.webp",
    alt: "Una familia misionera latina sirviendo en Tailandia",
    caption: "Familias latinas sirviendo donde Cristo aún no es conocido.",
  },
];

const PROYECTOS = [
  {
    code: "P090790",
    title: "Envía más obreros",
    text: "Movilizamos, capacitamos y acompañamos a la Iglesia para enviar misioneros donde más se necesita el Evangelio.",
    image: "/pages/dar-proyecto-obreros.webp",
    alt: "Campo de trigo: enviemos más misioneros latinos a Su mies",
  },
  {
    code: "P099717",
    title: "Capacitación y recursos",
    text: "Para que la Iglesia latinoamericana siga creciendo como fuerza misionera y alcance más naciones con el Evangelio.",
    image: "/pages/dar-proyecto-capacitacion.webp",
    alt: "Un grupo conversa alrededor de una mesa en un tiempo con pastores enviadores",
  },
];

const RECURSOS = [
  {
    title: "Revista VAMOS",
    image: "/pages/dar-revistas.webp",
    alt: "Portadas de la Revista VAMOS",
    href: "/revistavamos/",
  },
  {
    title: "Podcast",
    image: "/pages/dar-creando-podcast.webp",
    alt: "Grabación de un episodio del podcast de SIM Latinoamérica",
    href: "https://open.spotify.com/show/0vftsfjR9UP5tD2PG6jb5P",
  },
  {
    title: "Cursos en línea",
    image: "/pages/recursos-cursos.webp",
    alt: "Cursos en línea Movilicemos",
    href: "https://cursos.movilicemos.org/",
  },
];

export default function DarPage() {
  return (
    <main className="page-offset">
      <PageHero
        title="Tu apoyo fortalece a la misión global de Dios."
        intro="Da hoy para ser parte de la facilitación de más latinos participando en ministerios transculturales."
        image={{
          src: "/heroes/dar.webp",
          alt: "Equipo de SIM Latinoamérica reunido en un parque",
        }}
        cta={{ label: "Quiero dar una ofrenda", href: DONATE_URL }}
      />

      {/* Objetivo de Dar */}
      <section className="mx-auto max-w-3xl px-4 pt-16 pb-10 text-center">
        <h2 className="font-heading text-3xl font-bold text-ink">Objetivo de Dar</h2>
        <p className="mt-6 text-lg text-muted">
          Tu generosidad hace posible que más discípulos sean enviados desde
          América Latina hacia lugares donde Cristo aún no es conocido. A través
          de ella, impulsas la movilización de iglesias, la capacitación de
          obreros latinos y la creación de recursos que equipan a la iglesia
          para la misión global.
        </p>
      </section>

      {/* Fotos — how gifts are used */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {USOS.map((u) => (
            <figure key={u.image} className="flex flex-col">
              <Image
                src={u.image}
                alt={u.alt}
                width={900}
                height={675}
                unoptimized
                className="aspect-[4/3] w-full rounded-lg object-cover shadow-sm"
              />
              <figcaption className="mt-3 text-sm text-muted">{u.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Proyectos */}
      <section className="mx-auto max-w-5xl px-4 pb-16">
        <h2 className="font-heading text-center text-3xl font-bold text-ink">
          Da a los obreros o apoya un proyecto
        </h2>
        <p className="mt-3 text-center text-lg text-muted">
          Elige dónde quieres que llegue tu ofrenda.
        </p>
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {PROYECTOS.map((p) => (
            <article
              key={p.code}
              className="flex flex-col overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/5"
            >
              <Image
                src={p.image}
                alt={p.alt}
                width={900}
                height={675}
                unoptimized
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="flex flex-1 flex-col p-6">
                <span className="self-start rounded bg-brand/10 px-2 py-0.5 text-xs font-semibold tracking-wide text-brand">
                  {p.code}
                </span>
                <h3 className="font-heading mt-3 text-xl font-bold text-ink">{p.title}</h3>
                <p className="mt-2 flex-1 text-muted">{p.text}</p>
                <a
                  href={projectUrl(p.code)}
                  target="_blank"
                  rel="noopener"
                  className="mt-6 inline-block self-start rounded-btn bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
                >
                  Apoyar este proyecto
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Recursos */}
      <section className="bg-cream/40">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="mx-auto max-w-3xl text-center text-lg text-ink">
            Al dar a SIM Latinoamérica también estás siendo parte de la creación
            de recursos gratuitos para seguir movilizando a la iglesia latina
            hacia la misión de Dios.{" "}
            <strong className="font-semibold">
              ¡Estamos al servicio del movimiento misionero latino!
            </strong>
          </p>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {RECURSOS.map((r) => {
              const external = r.href.startsWith("http");
              const body = (
                <>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-white shadow-sm">
                    <Image
                      src={r.image}
                      alt={r.alt}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="font-heading mt-4 text-lg font-bold text-ink transition-colors group-hover:text-brand">
                    {r.title}
                  </h3>
                </>
              );
              return external ? (
                <a key={r.title} href={r.href} target="_blank" rel="noopener noreferrer" className="group block">
                  {body}
                </a>
              ) : (
                <Link key={r.title} href={r.href} className="group block">
                  {body}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Visión */}
      <section className="bg-brand-dark">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <p className="text-lg text-cream">
            Somos impulsados por el gran amor de Dios y con el poder del Espíritu
            Santo, cruzamos barreras para proclamar a Cristo, hacemos discípulos,
            trabajamos en conjunto con las iglesias y facilitamos la
            participación en ministerios transculturales.
          </p>
          <a
            href={DONATE_URL}
            target="_blank"
            rel="noopener"
            className="mt-8 inline-block rounded-btn bg-cream px-8 py-3 text-sm font-semibold text-brand-dark transition-colors hover:bg-white"
          >
            Dar una ofrenda a SIM Latinoamérica
          </a>
          <p className="mt-8 text-sm text-cream">
            ¿Tienes más preguntas? Contáctanos en{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-white underline">
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
