import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false, follow: true },
};

/**
 * Static export emits this as out/404.html, which Vercel serves with a real
 * 404 status for any unmatched path. Many hits are old WordPress URLs, so the
 * page points people back into the content rather than just apologising.
 * Search is a plain GET form to /buscar/?q=, so it needs no client JS here.
 */
const PATHS = [
  { label: "Blog", href: "/blog/", note: "Artículos y reflexiones sobre la misión" },
  { label: "Revista VAMOS", href: "/revistavamos/", note: "Todas las ediciones" },
  { label: "Historias", href: "https://historias.misionessim.org/", note: "Vidas transformadas", external: true },
  { label: "Sirve con SIM", href: "/sirve-con-sim/", note: "Da el siguiente paso" },
];

export default function NotFound() {
  return (
    <main className="page-offset mx-auto max-w-3xl px-4 py-16 text-center">
      <p className="font-heading text-sm font-bold uppercase tracking-widest text-brand">Error 404</p>
      <h1 className="mt-3 font-heading text-4xl font-bold leading-tight text-ink sm:text-5xl">
        Esta página no está en el camino
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-muted">
        Puede que el enlace sea antiguo o que la dirección tenga un error. Pero no te preocupes: aquí tienes por
        dónde seguir.
      </p>

      <blockquote className="mx-auto mt-10 max-w-xl border-y border-hairline py-6">
        <p className="font-heading text-2xl font-semibold italic text-navy">«Este es el camino, andad por él».</p>
        <cite className="mt-2 block text-sm not-italic text-muted">Isaías 30:21</cite>
      </blockquote>

      <form action="/buscar/" method="get" role="search" className="mx-auto mt-10 flex max-w-md gap-2">
        <label htmlFor="q404" className="sr-only">
          Buscar en el sitio
        </label>
        <input
          id="q404"
          name="q"
          type="search"
          placeholder="¿Qué estabas buscando?"
          className="min-w-0 flex-1 rounded-full border border-hairline px-5 py-3 text-ink focus:border-brand focus:outline-none"
        />
        <button type="submit" className="rounded-full bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark">
          Buscar
        </button>
      </form>

      <ul className="mt-12 grid gap-4 text-left sm:grid-cols-2">
        {PATHS.map((p) => {
          const inner = (
            <>
              <span className="block font-heading text-lg font-bold text-ink group-hover:text-brand">
                {p.label} →
              </span>
              <span className="block text-sm text-muted">{p.note}</span>
            </>
          );
          const cls = "group block rounded-xl border border-hairline p-5 transition hover:border-brand";
          return (
            <li key={p.href}>
              {p.external ? (
                <a href={p.href} className={cls}>
                  {inner}
                </a>
              ) : (
                <Link href={p.href} className={cls}>
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ul>

      <Link href="/" className="mt-12 inline-block font-semibold text-brand hover:underline">
        Volver al inicio
      </Link>
    </main>
  );
}
