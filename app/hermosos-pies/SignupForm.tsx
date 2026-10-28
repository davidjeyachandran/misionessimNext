"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SITE_URL } from "../../lib/site";
import { COUNTRIES } from "../sirve-con-sim/countries";
import { DIAL_CODES, PINNED_COUNTRIES, QUIERO, ROLES } from "./signup-options";

/*
 * "Da el paso" signup, in two steps so the lead is never lost:
 *
 *   1. Nombre + Correo + consent, posted to Formspree straight away (etapa 1).
 *   2. Optional extras (Quiero…, País, WhatsApp, Rol), posted as a second
 *      submission carrying the same email so the rows can be matched in the
 *      CSV export (etapa 2). "Saltar" skips it.
 *
 * Both end on /hermosos-pies/gracias/. Plan: docs/plan-campana-cuan-hermosos.md
 * (Phase 2). Formspree's export is imported into VerticalResponse by hand when
 * the campaign ends.
 *
 * Like the Sirve con SIM form, this posts from the browser because the site is
 * a static export. `NEXT_PUBLIC_`, so it is inlined at build time: a change
 * needs a redeploy.
 */
const ENDPOINT = process.env.NEXT_PUBLIC_HERMOSOS_PIES_ENDPOINT;

const GRACIAS = "/hermosos-pies/gracias/";

const LABEL = "block font-heading text-sm font-bold uppercase tracking-[0.04em] text-ink";
const FIELD =
  "mt-2 w-full border border-ink/70 bg-white px-4 py-3 text-ink outline-none transition-colors focus:border-[var(--chsp-terracotta)] focus:ring-2 focus:ring-[var(--chsp-terracotta)]/30";
const BUTTON =
  "rounded-btn bg-[var(--chsp-terracotta)] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--chsp-red)] disabled:opacity-60";
/* Visually hidden input whose sibling label carries the checked style. */
const PEER_INPUT = "peer sr-only";
const FOCUS_RING =
  "peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--chsp-terracotta)] peer-focus-visible:ring-offset-2";

const SEND_ERROR =
  "No pudimos enviar tus datos. Revisa tu conexión e inténtalo de nuevo.";

type Data = Record<string, string>;

/** POST to Formspree's AJAX API; resolves when it accepted the submission. */
async function send(data: Data) {
  const res = await fetch(ENDPOINT!, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(data),
  });
  // Formspree answers {ok: true} or a 4xx with {errors: [...]}. Its messages
  // are developer-facing English, so they go to the console only.
  const payload = await res.json().catch(() => null);
  if (!res.ok || payload?.errors) {
    console.error("Signup rejected:", res.status, payload);
    throw new Error(`El servidor respondió ${res.status}`);
  }
}

export function SignupForm() {
  if (!ENDPOINT) return <ComingSoon />;
  return <TwoStepSignup />;
}

function TwoStepSignup() {
  const router = useRouter();
  const [lead, setLead] = useState<{ nombre: string; email: string } | null>(null);

  if (!lead) return <StepOne onSent={setLead} onBot={() => router.push(GRACIAS)} />;
  return <StepTwo lead={lead} onDone={() => router.push(GRACIAS)} />;
}

function StepOne({
  onSent,
  onBot,
}: {
  onSent: (lead: { nombre: string; email: string }) => void;
  onBot: () => void;
}) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries()) as Data;

    // Honeypot: people never see it. Formspree would drop the submission
    // anyway; skipping the request gives the bot nothing to tune against.
    if (data._gotcha) return onBot();
    delete data._gotcha;
    // Only the native submit below uses this.
    delete data._next;

    setSending(true);
    setError(false);
    try {
      await send(data);
      onSent({ nombre: data.nombre, email: data.email });
    } catch {
      setError(true);
      setSending(false);
    }
  }

  return (
    /* `action`/`method` keep this a working HTML form when JavaScript never
       runs: Formspree then redirects to `_next`, skipping step 2. With JS,
       onSubmit's preventDefault() keeps the native post dormant. */
    <form action={ENDPOINT} method="POST" onSubmit={onSubmit} className="space-y-6">
      <input type="hidden" name="etapa" value="1" />
      <input type="hidden" name="_subject" value="Hermosos Pies — nuevo contacto" />
      {/* Absolute: Formspree redirects to it from its own domain. */}
      <input type="hidden" name="_next" value={`${SITE_URL}${GRACIAS}`} />
      <Honeypot />

      <div>
        <label htmlFor="chsp-nombre" className={LABEL}>
          Nombre:
        </label>
        <input id="chsp-nombre" name="nombre" type="text" autoComplete="name" required className={FIELD} />
      </div>
      <div>
        <label htmlFor="chsp-correo" className={LABEL}>
          Correo:
        </label>
        {/* Must stay `email`: Formspree makes it the notification's Reply-To. */}
        <input id="chsp-correo" name="email" type="email" autoComplete="email" required className={FIELD} />
      </div>
      <label className="flex items-start gap-3 text-sm text-ink">
        <input
          type="checkbox"
          name="consentimiento"
          value="sí"
          required
          className="mt-0.5 size-4 shrink-0 accent-[var(--chsp-terracotta)]"
        />
        <span>
          Acepto recibir noticias de la campaña y la{" "}
          <a className="font-semibold text-[var(--chsp-terracotta)] underline" href="/privacidad/">
            política de privacidad
          </a>
          .
        </span>
      </label>
      <button type="submit" disabled={sending} className={BUTTON}>
        {sending ? "Enviando…" : "Quiero dar el paso"}
      </button>
      {error && (
        <p role="alert" className="text-sm text-[var(--chsp-red)]">
          {SEND_ERROR}
        </p>
      )}
    </form>
  );
}

function StepTwo({
  lead,
  onDone,
}: {
  lead: { nombre: string; email: string };
  onDone: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const [whatsapp, setWhatsapp] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);

  // The form under the visitor's cursor was just replaced; move focus to the
  // new heading so keyboard and screen-reader users land in step 2.
  useEffect(() => heading.current?.focus(), []);

  function onCountry(pais: string) {
    // Fill in the dial code unless they already typed a number of their own.
    const typed = whatsapp.trim();
    const onlyPrefix = typed === "" || Object.values(DIAL_CODES).includes(typed);
    if (onlyPrefix) setWhatsapp(DIAL_CODES[pais] ? `${DIAL_CODES[pais]} ` : "");
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    if (fd.get("_gotcha")) return onDone();

    // A dial code on its own is not a number.
    const phone = whatsapp.trim();
    const digits = phone.replace(/\D/g, "");
    const isPrefix = Object.values(DIAL_CODES).includes(phone);
    const input = form.elements.namedItem("whatsapp") as HTMLInputElement;
    if (!isPrefix && digits.length > 0 && digits.length < 8) {
      input.setCustomValidity("Escribe tu número completo, con código de país.");
      input.reportValidity();
      return;
    }

    const extras: Data = {
      quiero: fd.getAll("quiero").join("; "),
      pais: String(fd.get("pais") ?? ""),
      whatsapp: isPrefix ? "" : phone,
      rol: String(fd.get("rol") ?? ""),
    };
    // Nothing filled in: same as "Saltar", no second row in the inbox.
    if (Object.values(extras).every((v) => v === "")) return onDone();

    setSending(true);
    setError(false);
    try {
      await send({
        ...lead,
        ...extras,
        etapa: "2",
        _subject: `Hermosos Pies — más datos de ${lead.nombre}`,
      });
      onDone();
    } catch {
      setError(true);
      setSending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-7">
      <div role="status">
        <h3
          ref={heading}
          tabIndex={-1}
          className="font-[family-name:var(--font-script)] text-3xl leading-tight text-[var(--chsp-brown)] outline-none"
        >
          ¡Gracias, {lead.nombre}!
        </h3>
        <p className="mt-2 text-ink">
          Ya tenemos tus datos. Si quieres, cuéntanos un poco más para
          acompañarte mejor <span className="text-ink/70">(todo es opcional)</span>.
        </p>
      </div>
      <Honeypot />

      <fieldset>
        <legend className={LABEL}>Quiero…</legend>
        <div className="mt-3 grid gap-3">
          {QUIERO.map((option, i) => (
            <div key={option}>
              <input id={`chsp-quiero-${i}`} type="checkbox" name="quiero" value={option} className={PEER_INPUT} />
              <label
                htmlFor={`chsp-quiero-${i}`}
                className={`flex cursor-pointer items-center gap-3 border-2 border-ink/20 bg-white px-4 py-3 text-ink transition-colors hover:border-[var(--chsp-terracotta)] peer-checked:border-[var(--chsp-terracotta)] peer-checked:bg-[var(--chsp-tan)]/30 peer-checked:[&>svg]:opacity-100 ${FOCUS_RING}`}
              >
                {/* The campaign's footprint, "stepped in" when ticked. */}
                <svg
                  viewBox="0 0 30 48"
                  width="16"
                  height="26"
                  aria-hidden="true"
                  className="shrink-0 fill-[var(--chsp-terracotta)] opacity-25 transition-opacity"
                >
                  <path d="M15 14.5c6.8 0 10 5 9.1 12.8-.7 5.8-2.9 9.4-2.9 13.4 0 4.3-3.1 7-6.7 6.2-3.3-.7-4.7-3.7-4.7-7 0-4.4-3.9-7.9-3.9-14.3 0-6.5 3.3-11.1 9.1-11.1z" />
                </svg>
                <span>{option}</span>
              </label>
            </div>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="chsp-pais" className={LABEL}>
            País:
          </label>
          <select
            id="chsp-pais"
            name="pais"
            defaultValue=""
            onChange={(e) => onCountry(e.target.value)}
            className={FIELD}
          >
            <option value="">Selecciona tu país</option>
            <optgroup label="Latinoamérica, España y EE. UU.">
              {PINNED_COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </optgroup>
            <optgroup label="Todos los países">
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
        <div>
          <label htmlFor="chsp-whatsapp" className={LABEL}>
            WhatsApp:
          </label>
          <input
            id="chsp-whatsapp"
            name="whatsapp"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="+52 55 1234 5678"
            value={whatsapp}
            onChange={(e) => {
              e.target.setCustomValidity("");
              setWhatsapp(e.target.value);
            }}
            aria-describedby="chsp-whatsapp-help"
            className={FIELD}
          />
        </div>
        <p id="chsp-whatsapp-help" className="-mt-4 text-xs text-ink/70 sm:col-span-2">
          Para invitarte a nuestros grupos de WhatsApp. No compartimos tu número.
        </p>
      </div>

      <fieldset>
        <legend className={LABEL}>Rol en la iglesia</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {ROLES.map((role, i) => (
            <div key={role}>
              <input id={`chsp-rol-${i}`} type="radio" name="rol" value={role} className={PEER_INPUT} />
              <label
                htmlFor={`chsp-rol-${i}`}
                className={`inline-block cursor-pointer rounded-full border-2 border-ink/20 bg-white px-4 py-2 text-sm text-ink transition-colors hover:border-[var(--chsp-terracotta)] peer-checked:border-[var(--chsp-terracotta)] peer-checked:bg-[var(--chsp-terracotta)] peer-checked:text-white ${FOCUS_RING}`}
              >
                {role}
              </label>
            </div>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-6">
        <button type="submit" disabled={sending} className={BUTTON}>
          {sending ? "Enviando…" : "Enviar"}
        </button>
        <a href={GRACIAS} className="text-sm font-semibold text-ink/70 underline hover:text-ink">
          Saltar
        </a>
      </div>
      {error && (
        <p role="alert" className="text-sm text-[var(--chsp-red)]">
          {SEND_ERROR} Tus datos de contacto ya quedaron guardados.
        </p>
      )}
    </form>
  );
}

/* Formspree's own honeypot field: off-screen, skipped by keyboard and AT. */
function Honeypot() {
  return (
    <input
      type="text"
      name="_gotcha"
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      className="absolute -left-[9999px] size-px opacity-0"
    />
  );
}

/* No endpoint configured (local dev, previews): say so rather than pretend. */
function ComingSoon() {
  const [notice, setNotice] = useState(false);
  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        setNotice(true);
      }}
    >
      <div>
        <label htmlFor="chsp-nombre" className={LABEL}>
          Nombre:
        </label>
        <input id="chsp-nombre" name="nombre" type="text" autoComplete="name" required className={FIELD} />
      </div>
      <div>
        <label htmlFor="chsp-correo" className={LABEL}>
          Correo:
        </label>
        <input id="chsp-correo" name="email" type="email" autoComplete="email" required className={FIELD} />
      </div>
      <button type="submit" className={BUTTON}>
        Quiero dar el paso
      </button>
      {notice && (
        <p role="status" className="text-sm text-ink">
          Este formulario estará disponible muy pronto.
        </p>
      )}
    </form>
  );
}
