"use client";

import Image from "next/image";
import { useState } from "react";
import { SITE_URL } from "../../lib/site";
import { CONTACT_EMAIL, WHATSAPP_URL } from "./contact";
import { COUNTRIES } from "./countries";
import { ThankYou } from "./ThankYou";

/**
 * Where the enquiry is POSTed. The site is a static export (`output: "export"`
 * in next.config.ts), so there is no route handler to receive it — submissions
 * go straight from the browser to a hosted form endpoint (Formspree,
 * Web3Forms, or anything else that accepts a JSON POST and answers 2xx).
 *
 * Both vars are `NEXT_PUBLIC_`, so they are inlined at build time and a change
 * needs a redeploy. The access key is only a routing id, not a secret — it is
 * public by design on every one of these services — but it does mean swapping
 * providers is a config change rather than a code change.
 */
const ENDPOINT = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT;
const ACCESS_KEY = process.env.NEXT_PUBLIC_CONTACT_ACCESS_KEY;

type Status = "idle" | "sending" | "sent" | "error";

/**
 * Reserved Web3Forms keys, sent both ways: as hidden inputs for the no-JS
 * submit, and explicitly in the JSON body so the fetch path does not depend on
 * the markup. `redirect` is the exception — it is documented as no-JS-only, so
 * the fetch path strips it rather than shipping a dead field to the inbox.
 */
const SUBJECT = "Nueva consulta desde Sirve con SIM";
const FROM_NAME = "Sirve con SIM — misionessim.org";
const REDIRECT = `${SITE_URL}/sirve-con-sim/gracias/`;

const FIELD_BASE =
  "w-full rounded-2xl border border-hairline bg-white text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/30";
const FIELD = `${FIELD_BASE} mt-2 px-5 py-3`;
const TEXTAREA = `${FIELD_BASE} p-5`;
const LABEL = "block text-sm font-semibold text-ink";
/**
 * "Datos" and "Comentario o consulta" — live styles both as body-font headings
 * rather than the Raleway used for section headings, so they override the
 * `font-heading` that globals.css puts on every h1-h6.
 */
const FORM_TITLE = "font-sans text-xl font-medium tracking-tight text-ink";

/**
 * Email and WhatsApp, the two ways to reach us without the form. Live keeps
 * them inside the <form>, between the consent checkbox and the submit button;
 * they render there too, and on their own when there is no endpoint to post to.
 */
function ContactFallbacks({ className }: { className?: string }) {
  return (
    <ul className={`space-y-3 ${className ?? ""}`}>
      <li className="flex items-center gap-3">
        <Image src="/pages/ico-sobre.png" alt="" width={36} height={37} unoptimized />
        <span className="text-sm text-ink">
          También puedes escribirnos a{" "}
          <a className="font-semibold text-brand underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
        </span>
      </li>
      <li className="flex items-center gap-3">
        <Image src="/pages/ico-wsp.png" alt="" width={36} height={37} unoptimized />
        <span className="text-sm text-ink">
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
  );
}

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  // Nothing to post to yet — render only the direct-contact fallbacks rather
  // than a form whose submit button silently does nothing.
  if (!ENDPOINT) return <ContactFallbacks />;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    // Honeypot: bots fill every field they find, people never see this one.
    // Answer as if it succeeded so the bot has nothing to tune against.
    if (data.website) {
      setStatus("sent");
      return;
    }
    delete data.website;
    // Only the native submit below uses this; sending it here would just add a
    // stray field to the notification email.
    delete data.redirect;

    setStatus("sending");
    setError(null);
    try {
      const res = await fetch(ENDPOINT!, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          ...(ACCESS_KEY ? { access_key: ACCESS_KEY } : {}),
          ...data,
          // Web3Forms reserves both of these: `subject` is the notification's
          // subject line, `from_name` its From name (which otherwise reads
          // "Notifications"). It also takes the `email` field as the Reply-To
          // by default, so replying in the inbox reaches the enquirer — that
          // only holds while that field stays named `email`.
          subject: SUBJECT,
          from_name: FROM_NAME,
        }),
      });

      // Web3Forms answers 200/400/429/500 and repeats the outcome in the body;
      // Formspree only does the former. Checking both covers either.
      const payload = await res.json().catch(() => null);
      if (!res.ok || payload?.success === false) {
        // The server's own message is developer-facing English, so it goes to
        // the console and the reader gets the Spanish copy below.
        console.error("Contact form rejected:", res.status, payload);
        throw new Error(`El servidor respondió ${res.status}`);
      }
      setStatus("sent");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
  }

  if (status === "sent") {
    return (
      <div role="status">
        <ThankYou headingClassName="font-heading text-2xl font-bold text-ink" />
      </div>
    );
  }

  return (
    /* `action`/`method` make this a working plain HTML form when JavaScript
       never runs — the endpoint's own documented usage. `onSubmit` calls
       preventDefault(), so the native post stays dormant whenever the fetch
       path is available and only takes over when it isn't. The two paths send
       the same fields; the no-JS one lands on /sirve-con-sim/gracias/ via the
       `redirect` field instead of swapping in the panel below. */
    <form
      action={ENDPOINT}
      method="POST"
      onSubmit={onSubmit}
      className="relative text-left"
    >
      {ACCESS_KEY && <input type="hidden" name="access_key" value={ACCESS_KEY} />}
      <input type="hidden" name="subject" value={SUBJECT} />
      <input type="hidden" name="from_name" value={FROM_NAME} />
      {/* Absolute and same-origin: Web3Forms rejects relative URLs, and
          cross-domain redirects need a paid plan. */}
      <input type="hidden" name="redirect" value={REDIRECT} />

      <h3 className={FORM_TITLE}>Datos</h3>

      {/* One field per row at every width, as live has them. Live labels each
          one with a fake placeholder that sits inside the box and vanishes on
          focus, leaving a filled field with no visible label and no
          `for`/`id` pairing for assistive tech; these are real labels. */}
      <div className="mt-4 grid gap-5">
        <div>
          <label className={LABEL} htmlFor="contact-name">
            Nombre y apellido <span aria-hidden="true">*</span>
          </label>
          <input
            className={FIELD}
            id="contact-name"
            name="nombre"
            type="text"
            autoComplete="name"
            maxLength={200}
            required
          />
        </div>
        <div>
          <label className={LABEL} htmlFor="contact-phone">
            Teléfono <span aria-hidden="true">*</span>
          </label>
          <input
            className={FIELD}
            id="contact-phone"
            name="telefono"
            type="tel"
            autoComplete="tel"
            maxLength={40}
            required
          />
        </div>
        <div>
          <label className={LABEL} htmlFor="contact-email">
            Email <span aria-hidden="true">*</span>
          </label>
          <input
            className={FIELD}
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={200}
            required
          />
        </div>
        <div>
          <label className={LABEL} htmlFor="contact-country">
            País <span aria-hidden="true">*</span>
          </label>
          <select className={FIELD} id="contact-country" name="pais" defaultValue="" required>
            <option value="" disabled>
              Selecciona tu país
            </option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <h3 className={`${FORM_TITLE} mt-8`}>Comentario o consulta</h3>

      <div className="mt-4">
        <label className="sr-only" htmlFor="contact-message">
          Comentario o consulta
        </label>
        <textarea
          className={TEXTAREA}
          id="contact-message"
          name="comentario"
          rows={5}
          maxLength={2000}
          placeholder="Escríbenos..."
        />
      </div>

      {/* Two honeypots, because they catch different attacks.

          `website` is ours and is enforced above, in the browser: a bot that
          fills the rendered form never gets a request sent at all.

          `botcheck` is Web3Forms' own, enforced on their server. It matters
          because the endpoint and access key are both public in the bundle —
          that is inherent to any static-site form service — so a bot can POST
          straight past our JavaScript. It must be a checkbox with this exact
          name, and Web3Forms strips it from the notification email.

          Both are hidden from sight and from assistive tech and kept out of the
          tab order, so only a script ever reaches them. Web3Forms' own docs
          note honeypots are getting weak; if spam does start arriving, their
          hCaptcha integration is the next step up. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="contact-website">No completar</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        <input id="contact-botcheck" name="botcheck" type="checkbox" tabIndex={-1} />
      </div>

      <div className="mt-4 flex items-start gap-3">
        <input
          className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-brand)]"
          id="contact-consent"
          name="consentimiento"
          type="checkbox"
          value="1"
          required
        />
        <label className="text-sm text-muted" htmlFor="contact-consent">
          Entiendo y estoy de acuerdo con la{" "}
          <a className="text-brand underline" href="/privacidad/">
            política de privacidad
          </a>
          .
        </label>
      </div>

      <ContactFallbacks className="mt-5" />

      {status === "error" && (
        <p role="alert" className="mt-5 rounded-lg bg-brand/10 px-4 py-3 text-sm text-brand-dark">
          No pudimos enviar tu consulta ({error}). Vuelve a intentarlo o
          escríbenos a{" "}
          <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-6 w-full rounded-btn bg-brand px-6 py-4 text-base font-medium text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "sending" ? "Enviando…" : "Enviar"}
      </button>
    </form>
  );
}
