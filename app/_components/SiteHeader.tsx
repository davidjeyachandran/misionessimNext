"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

// Nav targets: Blog is internal; the other sections aren't built yet, so they
// point at the live site as placeholders until later phases replace them.
const NAV_LINKS = [
  { label: "Nosotros", href: "https://misionessim.org/nosotros/", external: true },
  { label: "Recursos", href: "https://misionessim.org/recursos/", external: true },
  { label: "Revista VAMOS", href: "https://misionessim.org/revistavamos/", external: true },
  { label: "Blog", href: "/blog/", external: false },
  { label: "Ora", href: "https://misionessim.org/ora/", external: true },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className={`site-header${open ? " nav-open" : ""}`} id="siteHeader">
      <div className="header-inner">
        <Link href="/" className="brand" aria-label="SIM Latinoamérica">
          <Image
            src="/home/SIM-Logotipo.png"
            alt="SIM Latinoamérica"
            width={195}
            height={32}
            priority
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
                  <Link href={link.href} onClick={() => setOpen(false)}>
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
            <li>
              <button className="nav-search" type="button" aria-label="Buscar">
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15zm10 2.5-4.2-4.2"
                  />
                </svg>
              </button>
            </li>
            <li>
              <a
                href="https://misionessim.org/sirve-con-sim/"
                className="nav-cta"
                onClick={() => setOpen(false)}
              >
                Servir con SIM
              </a>
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
