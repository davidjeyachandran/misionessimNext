import type { Metadata } from "next";
import { Raleway, Work_Sans } from "next/font/google";
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
