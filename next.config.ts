import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static site: `next build` emits `out/`, deployed on Vercel.
  // No server runtime, so content changes require a rebuild + redeploy —
  // acceptable here (content changes ~every 2 months).
  output: "export",
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    // The default image optimizer is a server feature and can't run in a
    // static export. Instead, a custom loader rewrites Contentful asset URLs
    // to their Images API (CDN-side resize + WebP), giving <Image> real
    // srcsets. Local /public srcs pass through unchanged.
    loader: "custom",
    loaderFile: "./lib/contentful-image-loader.ts",
    // Trimmed from the Next default [640, 750, 828, 1080, 1200, 1920, 2048,
    // 3840]. Every srcset offered a 3840px variant on 1221 of 1236 pages, but
    // only two images on the site render full-bleed (sizes="100vw") — the rest
    // top out around 768px CSS. The 3840/2048 tiers were being fetched by
    // retina desktops for no visible gain, and asset bandwidth is the meter
    // that blocked the Contentful space on 2026-08-25. 750 is dropped as
    // redundant with 640/828.
    deviceSizes: [640, 828, 1080, 1200, 1920],
  },
  // NOTE: redirects()/rewrites()/headers() are NOT supported by `output:
  // 'export'` (they need a server). All legacy redirects live in
  // `vercel.json`, which Vercel applies at the edge.
};

export default nextConfig;
