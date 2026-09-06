import type { Metadata } from "next";
import { Raleway, Work_Sans } from "next/font/google";
import { preconnect, prefetchDNS } from "react-dom";
import "./globals.css";
import { SiteHeader } from "./_components/SiteHeader";
import { SiteFooter } from "./_components/SiteFooter";
import { Analytics } from "./_components/Analytics";
import { SITE_URL } from "../lib/site";
import { jsonLdProps, siteGraph } from "../lib/structured-data";
import { ANALYTICS_ENABLED, GA_MEASUREMENT_ID } from "../lib/analytics";

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  display: "swap",
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SIM Latinoamérica",
    template: "%s · SIM Latinoamérica",
  },
  description:
    "SIM es una comunidad de creyentes comprometidos a servir a Dios y a las personas en Latinoamérica y el mundo.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "SIM Latinoamérica",
    locale: "es_ES",
    images: [
      {
        url: "/home/banner-sim-home-2026-1200.webp",
        width: 1200,
        height: 675,
        alt: "SIM Latinoamérica",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/home/banner-sim-home-2026-1200.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Every hero and inline image is a Contentful asset on a second origin, so
  // the LCP image pays a fresh DNS + TCP + TLS handshake (~220ms on cable)
  // before its first byte. The <link rel=preload> next/image emits can only
  // start that handshake once the parser reaches it, by which point the
  // handshake is on the critical path rather than under it.
  //
  // These are the react-dom calls rather than rendered <link> elements on
  // purpose: React flushes registered preconnects into the head *ahead* of
  // font and image preloads, whereas a rendered <link rel=preconnect> is a
  // generic hoistable and lands after them — too late to help the very
  // preload it exists to accelerate.
  //
  // No `crossOrigin`: the hero is a plain <img>, so a CORS-mode preconnect
  // would warm a connection the image cannot reuse.
  //
  // The `Link:` response header in vercel.json does the same job a round trip
  // earlier still; this is the fallback for anything served without it
  // (`next dev`, `next start`).
  preconnect("https://images.ctfassets.net");
  prefetchDNS("https://images.ctfassets.net");

  return (
    <html lang="es" className={`${raleway.variable} ${workSans.variable}`}>
      <body className="min-h-screen">
        {/* Organization + WebSite, referenced by @id from the per-page graphs. */}
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdProps(siteGraph())} />
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
      {ANALYTICS_ENABLED && <Analytics gaId={GA_MEASUREMENT_ID} />}
    </html>
  );
}
