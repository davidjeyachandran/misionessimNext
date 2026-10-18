import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchBox } from "./SearchBox";

export const metadata: Metadata = {
  title: "Buscar",
  description: "Busca en los artículos del blog y las ediciones de la revista VAMOS.",
  alternates: { canonical: "/buscar/" },
  robots: { index: false, follow: true },
};

export default function BuscarPage() {
  return (
    <main className="page-offset mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-heading text-4xl font-bold leading-tight text-ink">Buscar</h1>
      <p className="mt-2 text-muted">Artículos del blog y ediciones de la revista VAMOS.</p>
      {/* useSearchParams in SearchBox makes it client-rendered; the boundary keeps the heading prerendered. */}
      <Suspense>
        <SearchBox />
      </Suspense>
    </main>
  );
}
