import Image from "next/image";
import Link from "next/link";

const MENU_LINKS = [
  { label: "Nosotros", href: "https://misionessim.org/nosotros/", external: true },
  { label: "Recursos", href: "https://misionessim.org/recursos/", external: true },
  { label: "Revista Vamos", href: "https://misionessim.org/revistavamos/", external: true },
  { label: "Blog", href: "/blog/", external: false },
  { label: "Ora", href: "https://misionessim.org/ora/", external: true },
  { label: "Servir con SIM", href: "https://misionessim.org/sirve-con-sim/", external: true },
];

const ACCESS_LINKS = [
  { label: "Movilicemos", href: "https://movilicemos.org/recursos" },
  { label: "Curso Vamos", href: "https://movilicemos.org/curso-vamos/intro" },
  { label: "Revista Vamos", href: "https://misionessim.org/revistavamos/" },
];

const SOCIAL = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/SIMLatinoamerica/",
    path: "M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.2-1.5 1.5-1.5h1.7V3.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v2.3H7.5V13h2.8v8h3.2z",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/simlatinoamerica",
    path: "M12 8.8A3.2 3.2 0 1 0 12 15.2 3.2 3.2 0 0 0 12 8.8zm0-2.1a5.3 5.3 0 1 1 0 10.6 5.3 5.3 0 0 1 0-10.6zm6.9-.2a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0zM12 4.1c-2.6 0-2.9 0-3.9.1-1 0-1.6.2-2 .4-.5.2-.9.4-1.2.8-.4.3-.6.7-.8 1.2-.2.4-.3 1-.4 2 0 1-.1 1.3-.1 3.9s0 2.9.1 3.9c0 1 .2 1.6.4 2 .2.5.4.9.8 1.2.3.4.7.6 1.2.8.4.2 1 .3 2 .4 1 0 1.3.1 3.9.1s2.9 0 3.9-.1c1 0 1.6-.2 2-.4.5-.2.9-.4 1.2-.8.4-.3.6-.7.8-1.2.2-.4.3-1 .4-2 0-1 .1-1.3.1-3.9s0-2.9-.1-3.9c0-1-.2-1.6-.4-2a3.2 3.2 0 0 0-.8-1.2 3.2 3.2 0 0 0-1.2-.8c-.4-.2-1-.3-2-.4-1 0-1.3-.1-3.9-.1z",
  },
  {
    label: "X (Twitter)",
    href: "https://x.com/",
    path: "M17.7 3h3l-6.6 7.6L22 21h-6.1l-4.8-6.3L5.6 21h-3l7.1-8.1L2 3h6.3l4.3 5.7L17.7 3zm-1.1 16.2h1.7L7.4 4.7H5.6l11 14.5z",
  },
  {
    label: "Spotify",
    href: "https://open.spotify.com/show/0vftsfjR9UP5tD2PG6jb5P",
    path: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.6 14.4c-.2.3-.6.4-.9.2-2.5-1.5-5.6-1.9-9.3-1-.3.1-.7-.1-.8-.5-.1-.3.1-.7.5-.8 4-.9 7.5-.5 10.3 1.2.3.2.4.6.2.9zm1.2-2.7c-.2.4-.7.5-1.1.3-2.8-1.7-7.2-2.2-10.5-1.2-.4.1-.9-.1-1-.5-.1-.4.1-.9.5-1 3.8-1.2 8.6-.6 11.9 1.4.3.2.5.7.2 1zm.1-2.8C14.5 8.9 9 8.7 5.8 9.7c-.5.1-1-.2-1.2-.6-.1-.5.2-1 .6-1.2 3.7-1.1 9.8-.9 13.7 1.4.4.2.6.8.3 1.2-.2.4-.7.6-1.3.4z",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/user/VamosSIM",
    path: "M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15.2V8.8L15.2 12 10 15.2z",
  },
];

function FooterLink({
  link,
}: {
  link: { label: string; href: string; external?: boolean };
}) {
  return link.external ? (
    <a href={link.href}>{link.label}</a>
  ) : (
    <Link href={link.href}>{link.label}</Link>
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
            width={150}
            height={73}
          />
          <p>
            Facilitamos la participación en ministerios transculturales de
            aquellos a quien Dios está llamando.
          </p>
          <ul className="social" aria-label="Redes sociales">
            {SOCIAL.map((s) => (
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
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>
            Copyright © {new Date().getFullYear()} SIM Latinoamérica INC. Todos
            los derechos reservados
          </p>
        </div>
      </div>
    </footer>
  );
}
