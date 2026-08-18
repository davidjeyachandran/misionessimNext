import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "../_components/PageHero";
import { VideoPromo } from "../_components/VideoPromo";
import { ContactForm } from "./ContactForm";
import { CONTACT_EMAIL, WHATSAPP_URL } from "./contact";

export const metadata: Metadata = {
  title: "Sirve con SIM",
  description:
    "¡Hay lugar para ti en SIM! Tus dones, profesión o talentos pueden ser usados para alcanzar con el mensaje de Jesús a los no alcanzados.",
  alternates: { canonical: "/sirve-con-sim/" },
};

/**
 * Live writes each of these titles with a trailing colon ("Relación con Dios:")
 * — punctuation baked into a heading. It's dropped here; the card layout
 * already separates the title from its text.
 */
const REQUISITOS = [
  { term: "Relación con Dios", text: "Tener una relación íntima y creciente con Dios. Estar viviendo una vida cristiana fuerte y sana." },
  { term: "Recomendación pastoral", text: "Tener una recomendación pastoral y el compromiso de tu iglesia enviadora." },
  { term: "Experiencia en el ministerio", text: "Tener varios años de experiencia en el ministerio, trabajando con una iglesia." },
  { term: "Preparación teológica", text: "Haber cumplido los estudios teológicos necesarios para el puesto ministerial." },
  { term: "Apoyo en oración y finanzas", text: "Estar dispuesto a levantar tu propio equipo de apoyo en oración y sustento económico." },
  { term: "Estado físico y mental", text: "Estar en buen estado físico y mental para trabajar en el campo misionero." },
  { term: "Habilidades y talentos", text: "Tener habilidades, dones, talentos y cualidades para servir en el campo misionero. En algunos casos, contar con una profesión y/u oficio." },
  { term: "Idiomas", text: "Dependiendo del caso, tener un nivel intermedio o superior de inglés y estar dispuesto a aprender otros idiomas." },
  { term: "Comprometido al servicio en equipo con SIM", text: "Estar dispuesto a desarrollar su carácter y colaborar con un equipo ministerial." },
  { term: "Proceso de candidato", text: "Estar dispuesto a completar los procesos y capacitaciones requeridas." },
];

export default function SirveConSimPage() {
  return (
    <main className="page-offset">
      <PageHero
        title="¡Hay lugar para ti en SIM!"
        intro="Tú también puedes servir entre los no alcanzados junto a SIM. ¡Tus dones, profesión o talentos pueden ser usados para alcanzar con el mensaje de Jesús!"
        image={{ src: "/heroes/sirve-con-sim.webp", alt: "Sirve con SIM" }}
      />

      {/* Sirve con nosotros — photo left, copy right on white
          (live: .elementor-element-e74dceb). Same near-square photo and the
          same two-column band as the Recursos "Movilicemos" section, so it's
          cropped to 4:3 until the columns split.

          Live marks the heading up as an <h3> directly under the hero's <h1>,
          skipping h2; it's an h2 here. Live also ships the photo with an empty
          alt even though it carries the section's meaning. */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:gap-16">
        <Image
          src="/pages/sirve-obreros.webp"
          alt="Una obrera de SIM y una mujer de la comunidad, sentadas juntas y sonriendo en la casa de ella"
          width={885}
          height={806}
          unoptimized
          sizes="(min-width: 1024px) 485px, 92vw"
          className="aspect-[4/3] w-full rounded-lg object-cover lg:aspect-auto"
        />
        <div>
          <p className="text-lg font-medium text-teal">Sirve con nosotros</p>
          <h2 className="font-heading mt-3 text-3xl font-medium text-brand sm:text-4xl">
            ¡Existen más de 800 puestos para los más de 70 países en donde
            servimos!
          </h2>
          <p className="mt-6 text-muted">
            Y aun con esto, estamos dispuestos a conversar de cómo tu llamado y
            experiencias podrían ser usadas.
          </p>
          <p className="mt-4 text-muted">
            Actualmente, somos alrededor de 4000 obreros provenientes de más de
            60 países. Nuestro enfoque es servir entre los no alcanzados, es
            decir, aquellos que nunca han tenido la oportunidad de escuchar el
            Evangelio de Jesucristo.
          </p>
          <p className="mt-4 text-muted">
            Nuestro propósito es glorificar a Dios al establecer, fortalecer, y
            cooperar con las iglesias alrededor del mundo mientras: evangelizamos
            a los no alcanzados, ministramos a las personas necesitadas,
            discipulamos a los creyentes en su iglesia local y equipamos a las
            iglesias para cumplir con la Gran Comisión.
          </p>
        </div>
      </section>

      {/* Escríbenos — heading, enquiry form, direct-contact fallbacks
          (live: .elementor-element-7f99889 + .elementor-element-21f526f).

          Live keeps the two contact rows inside the <form>, between the consent
          checkbox and the submit button — they're links, not form controls, and
          they'd disappear along with the form if it ever failed to render. They
          sit outside it here, which also means they still show when no form
          endpoint is configured (see ContactForm). */}
      <section className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="font-heading text-center text-3xl font-extrabold text-navy sm:text-4xl lg:text-5xl">
          Escríbenos para iniciar la conversación
        </h2>
        <p className="mt-4 text-center text-muted">
          Si tienes un país, grupo étnico, o un ministerio con el que buscas
          servir, escríbenos y conversemos más detalles.
        </p>

        <div className="mt-10">
          <ContactForm />
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          <li className="flex items-center gap-3">
            <Image src="/pages/ico-sobre.png" alt="" width={36} height={37} unoptimized />
            <span className="text-sm text-muted">
              También puedes escribirnos a{" "}
              <a className="font-semibold text-brand underline" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
            </span>
          </li>
          <li className="flex items-center gap-3">
            <Image src="/pages/ico-wsp.png" alt="" width={36} height={37} unoptimized />
            <span className="text-sm text-muted">
              O sumarte a nuestro chat de difusión en{" "}
              <a
                className="font-semibold text-brand underline"
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            </span>
          </li>
        </ul>
      </section>

      {/* ¡Tu iglesia te envía! — dark-red card straddling a lavender band
          (live: .elementor-element-ca0a665 → .elementor-element-7dae12e), the
          same card as Recursos' "Cursos online Movilicemos".

          Live paints the right half as a CSS background, so the photo is
          invisible to assistive tech and never in the srcset; a filled <Image>
          keeps the crop while staying real content. That asset is also a 524KB
          PNG screen capture on live — re-encoded to WebP here (136KB). */}
      <section className="bg-lavender">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid overflow-hidden rounded-2xl bg-brand-dark md:grid-cols-2">
            <div className="px-5 py-12 lg:py-24 lg:pl-24 lg:pr-12">
              <h2 className="font-heading text-3xl font-bold text-cream sm:text-4xl lg:text-5xl">
                ¡Tu iglesia te envía!
              </h2>
              <p className="mt-6 max-w-[400px] text-white lg:text-lg">
                SIM te facilita un equipo ministerial y tu iglesia te envía con
                apoyo económico, en oración y cuidado integral.
              </p>
              <p className="mt-4 max-w-[400px] text-white">
                Te recomendamos el curso DANDO PASOS que tenemos gratis en línea.
              </p>
              <a
                href="https://cursos.movilicemos.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-block rounded-full bg-cream px-8 py-3 text-sm font-semibold text-brand-dark transition-colors hover:bg-white"
              >
                Ver cursos
              </a>
            </div>
            <div className="relative min-h-[300px]">
              <Image
                src="/pages/sirve-iglesia.webp"
                alt="Una obrera de SIM rodeada de mujeres y niños de una aldea, todos sonriendo a la cámara"
                fill
                unoptimized
                sizes="(min-width: 768px) 50vw, 92vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Conócenos — same block as the homepage, different copy and backdrop
          (live: .elementor-element-2c9a67a). The banner is a wide, short crop,
          so it overrides home.css's `background-position: 0 80%`, which is
          tuned for the homepage's taller bg-sim.webp. */}
      <VideoPromo
        title="SIM Latinoamérica, al servicio del movimiento misionero latino"
        backgroundImage="/pages/sirve-video-bg.webp"
        backgroundPosition="center center"
      />

      {/* Requisitos — three across on a lavender band
          (live: .elementor-element-5f19b6a).

          Live marks the heading up as a second <h1> on the page; it's an h2
          here. The ten items are a checklist, not a sequence — the previous
          numbered badges implied an order that "Idiomas" or "Estado físico"
          don't have — so they carry a check mark instead. */}
      <section className="bg-lavender">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="font-heading text-center text-3xl font-bold text-navy sm:text-4xl lg:text-5xl">
            Requisitos para servir con SIM
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {REQUISITOS.map((r) => (
              <article
                key={r.term}
                className="flex gap-4 rounded-lg border border-hairline bg-white p-6 shadow-sm"
              >
                <svg
                  className="mt-1 h-6 w-6 shrink-0 text-brand"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <div>
                  <h3 className="font-heading text-lg font-bold text-ink">{r.term}</h3>
                  <p className="mt-1 text-sm text-muted">{r.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
