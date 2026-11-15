import Image from "next/image";
import Link from "next/link";
import { SOCIAL_LINKS } from "./social";

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

const MENU_LINKS = [
  { label: "Nosotros", href: "/nosotros/", external: false },
  { label: "Recursos", href: "/recursos/", external: false },
  { label: "Revista Vamos", href: "/revistavamos/", external: false },
  { label: "Blog", href: "/blog/", external: false },
  { label: "Historias", href: "https://historias.misionessim.org/", external: true },
  { label: "Ora", href: "/ora/", external: false },
  { label: "Servir con SIM", href: "/sirve-con-sim/", external: false },
];

const ACCESS_LINKS = [
  { label: "Movilicemos", href: "https://movilicemos.org/recursos", external: true },
  { label: "Curso Vamos", href: "https://movilicemos.org/curso-vamos/intro", external: true },
  { label: "Revista Vamos", href: "/revistavamos/", external: false },
];

function FooterLink({
  link,
}: {
  link: { label: string; href: string; external?: boolean };
}) {
  return link.external ? (
    <a href={link.href}>{link.label}</a>
  ) : (
    <Link href={link.href} prefetch={PREFETCH}>{link.label}</Link>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Image
            src="/home/SIM-Logotipo-footer.png"
            alt="SIM Latinoamérica"
            width={275}
            height={45}
            unoptimized
          />
          <p>
            Facilitamos la participación en ministerios transculturales de
            aquellos a quien Dios está llamando.
          </p>
          <ul className="social" aria-label="Redes sociales">
            {SOCIAL_LINKS.map((s) => (
              <li key={s.label}>
                <a href={s.href} aria-label={s.label}>
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path fill="currentColor" d={s.path} />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <nav className="footer-col" aria-label="Menú del pie">
          <p className="footer-title">Menú</p>
          <ul>
            {MENU_LINKS.map((link) => (
              <li key={link.label}>
                <FooterLink link={link} />
              </li>
            ))}
          </ul>
        </nav>
        <nav className="footer-col" aria-label="Accesos">
          <p className="footer-title">Accesos</p>
          <ul>
            {ACCESS_LINKS.map((link) => (
              <li key={link.label}>
                <FooterLink link={link} />
              </li>
            ))}
          </ul>
        </nav>
        <div className="footer-col">
          <p className="footer-title">¿Tienes alguna pregunta?</p>
          <p>Escríbenos aquí:</p>
          <a href="mailto:sim.preguntas@sim.org">sim.preguntas@sim.org</a>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>
            Copyright © {new Date().getFullYear()} SIM Latinoamérica INC. Todos
            los derechos reservados ·{" "}
            <Link href="/privacidad/" prefetch={PREFETCH}>Política de privacidad</Link>
          </p>
          <p>Sirve · Ora · Da</p>
        </div>
      </div>
    </footer>
  );
}
