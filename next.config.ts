import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mostly static (docs/adr/0001): every published page is prerendered at
  // build and never revalidated, so content changes still need a rebuild.
  // The server runtime exists only for Draft preview. Every dynamic route
  // sets `dynamicParams = false`, so unknown URLs 404 without calling
  // Contentful, while Draft Mode can still render never-published posts.
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    // Not the default image optimizer: that would bill Vercel per image. A
    // custom loader rewrites Contentful asset URLs to their Images API (CDN-side resize + WebP), giving <Image> real
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
  // All legacy redirects and Revista PDF rewrites live in `vercel.json`, which
  // Vercel applies at the edge — scripts generate and check that file, so
  // they stay there rather than moving to redirects()/rewrites() here.
};

export default nextConfig;
