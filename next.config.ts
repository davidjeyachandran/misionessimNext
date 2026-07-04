import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.ctfassets.net", // Contentful assets
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com", // YouTube thumbnails
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      // Donations dropped entirely (GiveWP out of scope; David 2026-07-05:
      // no donation paths at all — not even redirects). Legacy /donations/*
      // URLs simply 404.
      //
      // Author archives dropped (WP data was only account names) — send the
      // 2 legacy author URLs to the blog index.
      { source: "/blog/author/:slug*", destination: "/blog", permanent: true },
      // Revista canonical inverted vs. the legacy site (David 2026-07-05):
      // the new canonical route is /revistavamos/; the old canonical
      // /la-revista/<slug>/ URLs (118 in the legacy sitemap) 301 across.
      { source: "/la-revista", destination: "/revistavamos", permanent: true },
      { source: "/la-revista/:slug", destination: "/revistavamos/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
