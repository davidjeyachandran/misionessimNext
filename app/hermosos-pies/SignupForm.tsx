"use client";

import { useState } from "react";

/*
 * "Da el paso" signup (design: Nombre + Correo). It feeds the same
 * VerticalResponse list as the "Suscríbete aquí" button on /revistavamos/
 * (https://oi.vresp.com?fid=669a6c7963), but that integration isn't built yet,
 * so submitting is a deliberate no-op that says the form is coming soon.
 * TODO(VerticalResponse): post name + email to the list behind fid=669a6c7963.
 */
const LABEL = "block font-heading text-sm font-bold uppercase tracking-[0.04em] text-ink";
const FIELD =
  "mt-2 w-full border border-ink/70 bg-white px-4 py-3 text-ink outline-none transition-colors focus:border-[var(--chsp-terracotta)] focus:ring-2 focus:ring-[var(--chsp-terracotta)]/30";

export function SignupForm() {
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
        <input id="chsp-correo" name="correo" type="email" autoComplete="email" required className={FIELD} />
      </div>
      <button
        type="submit"
        className="rounded-btn bg-[var(--chsp-terracotta)] px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--chsp-red)]"
      >
        Quiero dar el paso
      </button>
      {notice && (
        <p role="status" className="text-sm text-ink">
          Este formulario estará disponible muy pronto. Mientras tanto, puedes
          suscribirte en{" "}
          <a
            className="font-semibold text-[var(--chsp-terracotta)] underline"
            href="https://oi.vresp.com?fid=669a6c7963"
            target="_blank"
            rel="noopener noreferrer"
          >
            este enlace
          </a>
          .
        </p>
      )}
    </form>
  );
}
