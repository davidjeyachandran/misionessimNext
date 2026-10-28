import type { Metadata } from "next";
import Image from "next/image";
import { ScrollEffects } from "../_components/ScrollEffects";
import { SpotifyEpisodes } from "../_components/SpotifyEpisodes";
import { VideoThumbnail } from "../_components/VideoThumbnail";
import { WhatsAppLink, WhatsAppShare } from "../_components/WhatsAppShare";
import { EPISODES, GUIDE_COVER, GUIDE_URL, VIDEOS, WHATSAPP_CHANNEL_URL } from "./content";
import { FootprintTrail } from "./FootprintTrail";
import { SignupForm } from "./SignupForm";
import { LABEL_CAPS, PALETTE, SCRIPT, script } from "./theme";
import "./campaign.css";

/*
 * "Cuán hermosos son los pies" campaign landing page (design:
 * Campaña-CHSP-SIM-editable.ai). Plan: docs/plan-campana-cuan-hermosos.md.
 *
 * Unlisted until the missing assets in ./content.ts arrive: noindex below,
 * absent from app/sitemap.ts, and linked from nowhere on the site (see
 * tests/e2e/unlisted-pages.spec.ts). Not disallowed in robots.txt, so crawlers
 * can still read the noindex.
 */
export const metadata: Metadata = {
  title: "Cuán hermosos son los pies",
  description:
    "Historias de misioneros latinos sirviendo entre pueblos no alcanzados. Ora 30 días por ellos, escucha sus historias y da el siguiente paso.",
  alternates: { canonical: "/hermosos-pies/" },
  robots: { index: false, follow: false },
};

const SECTION_HEADING = "font-heading text-2xl font-extrabold uppercase sm:text-3xl lg:text-4xl";

export default function HermososPiesPage() {
  return (
    <main className={`page-offset ${script.variable}`} style={PALETTE}>
      {/* Hero — the sky wash (brown from the left, white haze top-right) is a
          vector overlay in the design, not part of the photo. */}
      <section className="hero-page relative !min-h-[min(68svh,656px)] !py-10 text-center">
        <div className="parallax-bg" data-parallax="0.8">
          <Image
            src="/hermosos-pies/hero-pies.webp"
            alt=""
            fill
            fetchPriority="high"
            loading="eager"
            unoptimized
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div aria-hidden className="chsp-mist" />
        <div
          aria-hidden
          className="absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(92,48,28,.7)_0%,rgba(92,48,28,.25)_45%,rgba(92,48,28,0)_70%),linear-gradient(200deg,rgba(255,252,245,.9)_0%,rgba(255,252,245,0)_32%),linear-gradient(0deg,rgba(0,0,0,.15),rgba(0,0,0,.15))]"
        />
        <div className="hero-content reveal !max-w-4xl text-white">
          <p className={`${LABEL_CAPS} text-sm drop-shadow sm:text-base lg:text-lg`}>
            Historias de misioneros latinos sirviendo entre pueblos no alcanzados
          </p>
          <h1 className="mx-auto mt-8 !max-w-none !font-normal !tracking-normal leading-none drop-shadow-md">
            <span className="block font-heading text-[clamp(2rem,6vw,3.5rem)] font-semibold">
              CUÁN
            </span>{" "}
            <span className="block font-heading text-[clamp(2.75rem,9vw,5.25rem)] font-black leading-[0.95]">
              HERMOSOS
            </span>{" "}
            <span className="block font-heading text-[clamp(2rem,6vw,3.5rem)] font-semibold">
              SON LOS
            </span>{" "}
            {/* Written in by a sweeping mask, then underlined (campaign.css). */}
            <span
              className={`${SCRIPT} -mt-1 block text-[clamp(4.5rem,14vw,8.5rem)] leading-[0.9] text-[#fdecc8]`}
            >
              <span className="relative inline-block">
                <span className="chsp-write inline-block px-[0.08em]">pies</span>
                <svg
                  aria-hidden
                  viewBox="0 0 200 24"
                  preserveAspectRatio="none"
                  className="chsp-underline absolute -bottom-[0.06em] left-[2%] h-[0.16em] w-[88%]"
                >
                  <path
                    d="M4 18C46 12 104 7 196 6"
                    pathLength={1}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="7"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </span>
          </h1>
        </div>
      </section>
      <ScrollEffects />

      {/* Verse */}
      <section className="px-4 py-10 text-center sm:py-14">
        <p className={`${SCRIPT} text-2xl text-[#5b3a1e] sm:text-3xl lg:text-4xl`}>
          &ldquo;¡Cuán hermosos son los pies de los que anuncian buenas nuevas!&rdquo;
        </p>
        <p className="mt-2 font-heading text-lg font-extrabold text-[var(--chsp-teal)] sm:text-xl">
          ROMANOS 10:15
        </p>
        <FootprintTrail className="mt-6" />
      </section>

      {/* Intro */}
      <section className="bg-[var(--chsp-terracotta)] text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 lg:gap-16 lg:py-20">
          <p className="text-lg leading-relaxed lg:text-xl">
            <strong className="block font-heading text-xl font-extrabold lg:text-2xl">
              CUÁN HERMOSOS SON LOS PIES
            </strong>
            es nuestra Campaña basada en diferentes realidades de misioneros
            latinos sirviendo entre los no alcanzados. ¡Queremos animar a través
            de estas historias y también desafiar a que más latinos den pasos de
            fe para servir a largo plazo en el mundo no alcanzado!
          </p>
          <Image
            src="/hermosos-pies/pies-ninos.webp"
            alt="Pies descalzos de niños y adultos sobre una estera verde, vistos desde arriba"
            width={1200}
            height={782}
            unoptimized
            sizes="(min-width: 768px) 50vw, 92vw"
            className="w-full object-cover"
          />
        </div>
      </section>

      {/* 30 días orando */}
      <section className="bg-[var(--chsp-tan)]">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 lg:gap-16 lg:py-20">
          {GUIDE_COVER ? (
            <Image
              src={GUIDE_COVER.src}
              alt={GUIDE_COVER.alt}
              width={GUIDE_COVER.width}
              height={GUIDE_COVER.height}
              unoptimized
              sizes="(min-width: 768px) 50vw, 92vw"
              className="mx-auto w-full max-w-md md:max-w-none"
            />
          ) : (
            <div className="mx-auto grid aspect-[6/5] w-full max-w-md place-items-center bg-cream text-sm uppercase tracking-wide text-[var(--chsp-brown)]/70 md:max-w-none">
              Portada próximamente
            </div>
          )}
          <div>
            <h2 className={`${SECTION_HEADING} !text-2xl text-[var(--chsp-red)] lg:!text-3xl`}>
              30 días orando por latinos que llevan el Evangelio a las naciones
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-ink">
              Durante los próximos 30 días, conocerás diferentes necesidades de
              latinos sirviendo en el campo y tendrás la oportunidad de
              detenerte a orar por la obra que Dios está haciendo.
            </p>
            <p className="mt-2 text-lg leading-relaxed text-ink">
              Que cada día orando sea un recordatorio de que tu intercesión
              fortalece a los mensajeros y prepara corazones para recibir el
              Evangelio.
            </p>
            {GUIDE_URL ? (
              <a
                href={GUIDE_URL}
                target="_blank"
                rel="noopener"
                className="mt-8 inline-block bg-[var(--chsp-teal)] px-6 py-3 font-heading text-lg font-extrabold uppercase text-white transition-colors hover:bg-[var(--chsp-brown)]"
              >
                Descárgalo aquí
              </a>
            ) : (
              <span
                aria-disabled="true"
                className="mt-8 inline-block cursor-not-allowed bg-[var(--chsp-teal)]/60 px-6 py-3 font-heading text-lg font-extrabold uppercase text-white"
              >
                Disponible pronto
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Gio's quote */}
      <figure className="mx-auto max-w-6xl px-4 pt-14 lg:pt-20">
        <blockquote className={`${SCRIPT} text-2xl leading-snug text-[var(--chsp-brown)] sm:text-3xl lg:text-[2.6rem]`}>
          &ldquo;Unidos en oración, nuestros pies también se vuelven hermosos,
          porque juntos avanzamos hacia el cumplimiento de la Gran Comisión&rdquo;.
        </blockquote>
        <figcaption className={`${LABEL_CAPS} mt-4 text-lg text-[var(--chsp-red)] sm:text-xl`}>
          Gio, director SIM Latinoamérica
        </figcaption>
        <div className="mt-6 flex flex-wrap gap-3">
          <WhatsAppShare
            path="/hermosos-pies/"
            label="Invitar a otros a orar"
            text="Únete a 30 días orando por latinos que llevan el Evangelio a las naciones 🙏"
          />
          <WhatsAppLink href={WHATSAPP_CHANNEL_URL} label="Súmate al Canal de WhatsApp" />
        </div>
      </figure>

      {/* Podcasts */}
      <section className="mx-auto max-w-6xl px-4 py-14 text-center lg:py-20">
        <h2 className={`${SECTION_HEADING} text-[var(--chsp-brown)]`}>
          Escucha historias de latinos
        </h2>
        <p className="mt-3 text-lg text-ink">
          Escucha episodios donde latinos nos cuentan sus experiencias en el campo:
        </p>
        <SpotifyEpisodes episodes={EPISODES} className="mt-10 text-left" />
      </section>

      {/* Conversaciones */}
      <section className="bg-[var(--chsp-brown)] text-white">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center lg:py-20">
          <h2 className={`${SECTION_HEADING} text-white`}>Conversaciones con Yurani, Carolina y Gio</h2>
          <p className="mx-auto mt-6 max-w-4xl text-lg leading-relaxed lg:text-xl">
            <span className={`${SCRIPT} text-[1.35em] text-[#e0674a]`}>
              Yurani, Carolina y Gio
            </span>{" "}
            nos adentran a sus propias historias como misioneros sirviendo en{" "}
            <strong className="font-semibold">África, Asia y Europa,</strong>{" "}
            contándonos los desafíos, las bendiciones, las oportunidades y cómo
            fue su tiempo de servicio en el mundo no alcanzado.
          </p>
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {VIDEOS.map((video) => (
              <li key={video.title}>
                {video.youtubeId && video.still ? (
                  <VideoThumbnail
                    image={video.still}
                    videoId={video.youtubeId}
                    label={video.title}
                    sizes="(min-width: 768px) 33vw, 92vw"
                  />
                ) : (
                  <div className="grid aspect-video place-items-center bg-[var(--chsp-red)] text-sm uppercase tracking-wide text-white/90">
                    {video.title} · próximamente
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Da el paso */}
      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-14 md:grid-cols-[1.2fr_1fr] lg:gap-20 lg:py-20">
        <div>
          <h2 className={`${SCRIPT} text-3xl leading-tight text-[var(--chsp-brown)] sm:text-4xl`}>
            Da el paso y sé el siguiente latino sirviendo en la misión de Dios
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-ink">
            Quizá comenzaste con una oración por otro latino, pero puede que
            Dios esté inquietando tu corazón para ahora ser tú el que dé el paso
            de fe y sirvas activamente en la misión de Dios. Se necesitan más
            pies que anuncien las buenas noticias y que respondan al llamado.
          </p>
          <p className="mt-6 text-lg leading-relaxed text-ink">
            <strong className="block font-heading font-extrabold">
              ¿Quieres dar el siguiente paso?
            </strong>
            El equipo de SIM puede acompañarte en el proceso, desde el
            discernimiento hasta la llegada al campo.
          </p>
        </div>
        <SignupForm />
      </section>
    </main>
  );
}
