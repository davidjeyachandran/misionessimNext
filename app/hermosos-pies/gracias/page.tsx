import type { Metadata } from "next";
import Link from "next/link";
import { SOCIAL_LINKS } from "../../_components/social";
import { GUIDE_URL, WHATSAPP_CHANNEL_URL, WHATSAPP_GROUP_URL } from "../content";
import { LABEL_CAPS, PALETTE, SCRIPT, script } from "../theme";

export const metadata: Metadata = {
  title: "¡Gracias por dar el paso!",
  description: "Súmate a nuestros grupos de WhatsApp y síguenos en redes sociales.",
  alternates: { canonical: "/hermosos-pies/gracias/" },
  // Only reachable by submitting the campaign form; nothing links here.
  robots: { index: false, follow: false },
};

const WHATSAPP_ICON =
  "M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91A9.87 9.87 0 0 0 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.23 8.23 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.2 8.2 0 0 1 5.83 2.42 8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.54.06a6.8 6.8 0 0 1-2-1.23 7.4 7.4 0 0 1-1.38-1.72c-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.42h-.48a.92.92 0 0 0-.67.31c-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.13.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29z";

const WHATSAPP_INVITES = [
  {
    href: WHATSAPP_GROUP_URL,
    label: "Únete a Oportunidades SIM",
    text: "Grupo de WhatsApp con oportunidades de servicio, viajes y formación.",
  },
  {
    href: WHATSAPP_CHANNEL_URL,
    label: "Sigue el canal SIM Latinoamérica",
    text: "Historias, motivos de oración y noticias de latinos en la misión.",
  },
];

/**
 * Where the "Da el paso" signup ends: after step 2 (or "Saltar") with JS, and
 * straight after step 1 via Formspree's `_next` redirect without it. Its
 * pageview is the campaign's conversion in GA.
 */
export default function HermososPiesGraciasPage() {
  return (
    <main className={`page-offset ${script.variable}`} style={PALETTE}>
      <section className="mx-auto max-w-3xl px-4 py-16 text-center lg:py-24">
        <p className={`${LABEL_CAPS} text-sm text-[var(--chsp-terracotta)]`}>
          Cuán hermosos son los pies
        </p>
        <h1 className={`${SCRIPT} mt-3 text-4xl leading-tight text-[var(--chsp-brown)] sm:text-5xl`}>
          ¡Gracias por dar el paso!
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-ink">
          Recibimos tus datos y pronto alguien del equipo de SIM se pondrá en
          contacto contigo. Mientras tanto, camina con nosotros:
        </p>

        {GUIDE_URL && (
          <a
            href={GUIDE_URL}
            target="_blank"
            rel="noopener"
            className="mt-8 inline-block bg-[var(--chsp-teal)] px-6 py-3 font-heading text-lg font-extrabold uppercase text-white transition-colors hover:bg-[var(--chsp-brown)]"
          >
            Descarga la guía de oración
          </a>
        )}

        <ul className="mt-10 grid gap-4 text-left sm:grid-cols-2">
          {WHATSAPP_INVITES.map((invite) => (
            <li key={invite.href}>
              <a
                href={invite.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-full items-start gap-4 rounded-2xl bg-[#1e8f4e] p-5 text-white transition-colors hover:bg-[#17733e]"
              >
                <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true" className="shrink-0">
                  <path fill="currentColor" d={WHATSAPP_ICON} />
                </svg>
                <span>
                  <span className="block font-heading text-lg font-bold">{invite.label}</span>
                  <span className="mt-1 block text-sm text-white/90">{invite.text}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>

        <h2 className={`${LABEL_CAPS} mt-14 text-base text-ink`}>Síguenos en redes</h2>
        <ul className="mt-4 flex justify-center gap-3" aria-label="Redes sociales">
          {SOCIAL_LINKS.map((s) => (
            <li key={s.label}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="grid size-12 place-items-center rounded-full bg-[var(--chsp-teal)] text-white transition-colors hover:bg-[var(--chsp-brown)]"
              >
                <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                  <path fill="currentColor" d={s.path} />
                </svg>
              </a>
            </li>
          ))}
        </ul>

        <Link
          href="/hermosos-pies/"
          prefetch={false}
          className="mt-14 inline-block text-sm font-semibold text-[var(--chsp-terracotta)] underline"
        >
          Volver a Cuán hermosos son los pies
        </Link>
      </section>
    </main>
  );
}
