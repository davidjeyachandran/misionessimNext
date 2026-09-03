"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

// Site chrome opts out of prefetching. Next's default (`prefetch="auto"`)
// prefetches the *full* route for static routes, and on a static export that
// is every link here — the whole nav, on every page. Lighthouse caught it
// pulling 11 routes at load: 45 requests and 101KB competing with the LCP
// image.
//
// This is the App Router's `false`, which disables hover prefetching too (the
// Pages Router's "still prefetches on hover" behaviour does not apply here).
// A nav click therefore costs one round trip for a few KB of RSC payload —
// the deliberate trade for not spending 101KB on every page load. Navigation
// stays client-side; only the fetch moves from load time to click time.
const PREFETCH = false;

const NAV_LINKS = [
  { label: "Nosotros", href: "/nosotros/", external: false },
  { label: "Recursos", href: "/recursos/", external: false },
  { label: "Revista VAMOS", href: "/revistavamos/", external: false },
  { label: "Blog", href: "/blog/", external: false },
  { label: "Ora", href: "/ora/", external: false },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className={`site-header${open ? " nav-open" : ""}`} id="siteHeader">
      <div className="header-inner">
        <Link href="/" className="brand" aria-label="SIM Latinoamérica" prefetch={PREFETCH}>
          <Image
            src="/home/SIM-Logotipo.png"
            alt="SIM Latinoamérica"
            width={195}
            height={32}
            priority
            unoptimized
          />
        </Link>
        <nav className="main-nav" id="mainNav" aria-label="Menú principal">
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                {link.external ? (
                  <a href={link.href} onClick={() => setOpen(false)}>
                    {link.label}
                  </a>
                ) : (
                  <Link href={link.href} onClick={() => setOpen(false)} prefetch={PREFETCH}>
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
            <li>
              <Link
                href="/sirve-con-sim/"
                className="nav-cta"
                onClick={() => setOpen(false)}
                prefetch={PREFETCH}
              >
                Servir con SIM
              </Link>
            </li>
          </ul>
        </nav>
        <button
          className="nav-toggle"
          id="navToggle"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          aria-controls="mainNav"
          onClick={() => setOpen((v) => !v)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
}
