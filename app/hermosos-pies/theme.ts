import type { CSSProperties } from "react";
import { Covered_By_Your_Grace } from "next/font/google";

/*
 * Look shared by the campaign page and its /gracias/ page.
 *
 * The design's handwritten face is loaded here rather than in the root layout,
 * so only these routes download it. Gotham and Bebas Neue map onto the site's
 * Raleway / Work Sans.
 */
export const script = Covered_By_Your_Grace({
  variable: "--font-script",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

/* Campaign palette, sampled from the design and scoped to these pages. */
export const PALETTE = {
  "--chsp-terracotta": "#ba4931",
  "--chsp-tan": "#dcbb95",
  "--chsp-brown": "#481f00",
  "--chsp-red": "#992105",
  "--chsp-teal": "#0d5971",
} as CSSProperties;

export const SCRIPT = "font-[family-name:var(--font-script)] font-normal";
/* Bebas Neue's role in the design: condensed caps labels. */
export const LABEL_CAPS = "font-heading font-bold uppercase tracking-[0.04em]";
