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
const DONATE_URL = "https://www.simusa.org/es-donar/#donate-form-section";
const CONTACT_EMAIL = "sim.preguntas@sim.org";

// "Fotos de diferentes maneras en que las ofrendas son utilizadas". Photos are
// from SIM Latinoamérica's "usar dar" Drive folder; the captions are ours,
// written from the "Objetivo de Dar" copy.
// The faces in dar-bravos-prayer are blurred at source — keep it uncropped.
const USOS = [
  {
    image: "/pages/dar-bravos-prayer.webp",
    alt: "Una iglesia ora por obreros que son enviados a la misión",
    caption: "Iglesias que oran y envían a sus obreros a la misión.",
  },
  {
    image: "/pages/dar-engcamp.webp",
    alt: "Un capacitador acompaña a un participante durante un taller",
    caption: "Capacitación de obreros latinos para el servicio transcultural.",
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
          alt: "Obreros latinos de SIM conversan alrededor de una mesa",
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
