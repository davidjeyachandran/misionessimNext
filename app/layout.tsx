import type { Metadata } from "next";
import { Raleway, Work_Sans } from "next/font/google";
import "./globals.css";

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
  title: {
    default: "SIM Latinoamérica",
    template: "%s · SIM Latinoamérica",
  },
  description:
    "SIM es una comunidad de creyentes comprometidos a servir a Dios y a las personas en Latinoamérica y el mundo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${raleway.variable} ${workSans.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
