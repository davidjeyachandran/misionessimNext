import { SITE_URL } from "../../lib/site";

interface WhatsAppShareProps {
  /** Message body; the page URL is appended on its own line. */
  text: string;
  /** Site-relative path of the page being shared, e.g. "/ora/". */
  path: string;
  label?: string;
  /** "light" for white bands, "dark" for coloured ones. */
  tone?: "light" | "dark";
  className?: string;
}

/*
 * Share-to-WhatsApp link, usable on any page: the shared URL is built from
 * `path` against SITE_URL, so preview deploys share their own origin.
 *
 * A plain wa.me link rather than navigator.share: it needs no JS, opens the
 * WhatsApp app on phones and WhatsApp Web on desktop, and WhatsApp is where
 * this audience actually passes things on.
 */
export function WhatsAppShare({
  text,
  path,
  label = "Compartir en WhatsApp",
  ...rest
}: WhatsAppShareProps) {
  const url = `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const href = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
  return <WhatsAppLink href={href} label={label} {...rest} />;
}

interface WhatsAppLinkProps {
  href: string;
  label: string;
  tone?: "light" | "dark";
  className?: string;
}

/* WhatsApp-styled pill link to any WhatsApp URL, e.g. a channel invite. */
export function WhatsAppLink({ href, label, tone = "light", className = "" }: WhatsAppLinkProps) {
  const colors =
    tone === "light"
      ? "border-[#1e8f4e] text-[#1e8f4e] hover:bg-[#1e8f4e] hover:text-white"
      : "border-white/80 text-white hover:bg-white hover:text-ink";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-full border-2 px-5 py-2 text-sm font-semibold transition-colors ${colors} ${className}`.trim()}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91A9.87 9.87 0 0 0 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.23 8.23 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.2 8.2 0 0 1 5.83 2.42 8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.54.06a6.8 6.8 0 0 1-2-1.23 7.4 7.4 0 0 1-1.38-1.72c-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.42h-.48a.92.92 0 0 0-.67.31c-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.13.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29z"
        />
      </svg>
      {label}
    </a>
  );
}
