import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "../_components/PageHero";
import { VideoPromo } from "../_components/VideoPromo";
import { ContactForm } from "./ContactForm";
import { REQUISITOS } from "./requisitos";

export const metadata: Metadata = {
  title: "Sirve con SIM",
  description:
    "¡Hay lugar para ti en SIM! Tus dones, profesión o talentos pueden ser usados para alcanzar con el mensaje de Jesús a los no alcanzados.",
  alternates: { canonical: "/sirve-con-sim/" },
};

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

      {/* Escríbenos — heading, then a rounded band split down the middle:
          cream form card on the left, photo on the right
          (live: .elementor-element-7f99889 + .elementor-element-21f526f).

          Live paints the right half as a CSS background on an empty container,
          so the photo is invisible to assistive tech and never in the srcset;
          a filled <Image> keeps the crop while staying real content. The band
          stacks below md, photo underneath, exactly as live does.

          The direct-contact rows sit inside the card, above the submit button,
          where live puts them — see ContactForm, which also keeps them on the
          page when no form endpoint is configured. */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-heading text-center text-3xl font-extrabold text-navy sm:text-4xl lg:text-5xl">
          Escríbenos para iniciar la conversación
        </h2>
        <p className="mt-4 text-center text-muted">
          Si tienes un{" "}
          <strong className="font-semibold">
            país, grupo étnico, o un ministerio
          </strong>{" "}
          con el que buscas servir, escríbenos y conversemos más detalles.
        </p>

        <div className="mt-10 grid overflow-hidden rounded-2xl md:grid-cols-2">
          <div className="bg-linen px-5 py-12 lg:px-12 lg:pb-24">
            <ContactForm />
          </div>
          <div className="relative min-h-[374px]">
            <Image
              src="/pages/sirve-formulario.webp"
              alt="Un hombre y una mujer masái, envueltos en mantas tradicionales, sentados en el umbral de su casa junto a un niño pequeño"
              fill
              unoptimized
              sizes="(min-width: 768px) 50vw, 92vw"
              className="object-cover"
            />
          </div>
        </div>
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
                className="mt-8 inline-block rounded-btn bg-cream px-8 py-3 text-sm font-semibold text-brand-dark transition-colors hover:bg-white"
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
          here. Each item is a flat block on the band — live gives them a
          border-radius and 40px of padding but leaves them transparent, so
          the padding reads purely as gutter and is folded into the grid gap
          here. Live also pads the grid out to 12 cells with two empty
          containers so the last row keeps its shape; a real grid doesn't
          need them.

          The icons are live's own, one per requisito (see ./requisitos).
          They're decorative — the term beside each one already names it —
          so they're hidden from assistive tech. */}
      <section className="bg-lavender">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="font-heading text-center text-3xl font-bold text-navy sm:text-4xl lg:text-5xl">
            Requisitos para servir con SIM
          </h2>
          <ul className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {REQUISITOS.map((r) => (
              <li key={r.term} className="flex items-start gap-4">
                <span className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                  <svg
                    viewBox={r.icon.viewBox}
                    className="h-[26px] w-[26px]"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    {r.icon.paths.map((path) => (
                      <path
                        key={path.d}
                        d={path.d}
                        fillRule={path.evenOdd ? "evenodd" : undefined}
                        clipRule={path.evenOdd ? "evenodd" : undefined}
                      />
                    ))}
                  </svg>
                </span>
                <div>
                  <h3 className="font-heading text-xl leading-[1.25] font-medium text-ink">
                    {r.term}
                  </h3>
                  <p className="mt-1.5 text-ink">{r.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
