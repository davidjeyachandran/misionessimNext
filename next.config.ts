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
      // Donations dropped entirely (GiveWP out of scope) — all 11 legacy
      // URLs 301 → homepage.
      { source: "/donations", destination: "/", permanent: true },
      { source: "/donations/:path*", destination: "/", permanent: true },
      { source: "/donation-confirmation", destination: "/", permanent: true },
      { source: "/donation-failed", destination: "/", permanent: true },
      { source: "/donor-dashboard", destination: "/", permanent: true },
      // Author archives dropped (WP data was only account names) — send the
      // 2 legacy author URLs to the blog index.
      { source: "/blog/author/:slug*", destination: "/blog", permanent: true },
      // NOTE: the 118 /revistavamos/<slug>/ → /la-revista/<slug>/ aliases are
      // intentionally deferred until the revista routes exist, so they don't
      // 301 into a 404 in the interim.
    ];
  },
};

export default nextConfig;
