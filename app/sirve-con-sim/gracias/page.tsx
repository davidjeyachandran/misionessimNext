import type { Metadata } from "next";
import Link from "next/link";
import { ThankYou } from "../ThankYou";

export const metadata: Metadata = {
  title: "¡Gracias por escribirnos!",
  description: "Recibimos tu consulta y te responderemos a la brevedad.",
  alternates: { canonical: "/sirve-con-sim/gracias/" },
  // Only reachable by submitting the form; nothing links here.
  robots: { index: false, follow: true },
};

/**
 * Where Web3Forms sends the visitor after a plain HTML submit — the path taken
 * only when JavaScript never ran, since the fetch path shows the same message
 * inline without leaving the page. Without the form's `redirect` field this
 * would be Web3Forms' own success page on their domain.
 */
export default function GraciasPage() {
  return (
    <main className="page-offset mx-auto max-w-2xl px-4 py-24 text-center">
      <ThankYou as="h1" headingClassName="font-heading text-4xl font-bold text-navy md:text-5xl" />
      <Link
        href="/sirve-con-sim/"
        className="mt-10 inline-block rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
      >
        Volver a Sirve con SIM
      </Link>
    </main>
  );
}
