"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Result = { url: string; title: string; excerpt: string };
type Pagefind = {
  search: (q: string) => Promise<{
    results: { data: () => Promise<{ url: string; excerpt: string; meta: { title?: string } }> }[];
  }>;
};

const MAX_RESULTS = 20;

// The index is emitted into out/pagefind/ by `pagefind --site out` after
// `next build`, so it does not exist under `next dev`.
async function loadPagefind(): Promise<Pagefind> {
  return import(/* webpackIgnore: true */ "/pagefind/pagefind.js" as string);
}

export function SearchBox() {
  // Seed from ?q= so a result page is shareable.
  const initial = useSearchParams().get("q") ?? "";
  const [query, setQuery] = useState(initial);
  const [found, setFound] = useState<Result[] | null>(null);
  const [error, setError] = useState(false);
  const pf = useRef<Promise<Pagefind> | null>(null);
  const tooShort = query.trim().length < 2;
  const results = tooShort ? null : found;

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    let stale = false;
    const t = setTimeout(async () => {
      try {
        pf.current ??= loadPagefind();
        const res = await (await pf.current).search(q);
        const data = await Promise.all(res.results.slice(0, MAX_RESULTS).map((r) => r.data()));
        if (stale) return;
        setError(false);
        setFound(
          data.map((d) => ({ url: d.url, title: d.meta.title ?? d.url, excerpt: d.excerpt })),
        );
        history.replaceState(null, "", `?q=${encodeURIComponent(q)}`);
      } catch {
        if (!stale) setError(true);
      }
    }, 200);
    return () => {
      stale = true;
      clearTimeout(t);
    };
  }, [query]);

  return (
    <div className="mt-8">
      <label htmlFor="site-search" className="sr-only">
        Buscar en el sitio
      </label>
      <input
        id="site-search"
        type="search"
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Escribe para buscar…"
        className="w-full rounded-lg border border-hairline bg-white px-4 py-3 text-lg text-ink focus:border-brand focus:outline-none"
      />
      <div aria-live="polite" className="mt-6">
        {error && <p className="text-muted">No se pudo cargar el buscador. Inténtalo de nuevo.</p>}
        {results && results.length === 0 && <p className="text-muted">Sin resultados para «{query.trim()}».</p>}
        {results && results.length > 0 && (
          <ul className="space-y-6">
            {results.map((r) => (
              <li key={r.url}>
                <a href={r.url} className="font-heading text-xl font-semibold text-brand hover:underline">
                  {r.title}
                </a>
                {/* Pagefind wraps matches in <mark>; the excerpt is built from our own pages. */}
                <p className="mt-1 text-muted" dangerouslySetInnerHTML={{ __html: r.excerpt }} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
