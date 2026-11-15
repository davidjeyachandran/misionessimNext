import Image from "next/image";
import Link from "next/link";
import type { RevistaCard, RevistaNeighbours } from "../../../lib/contentful";
import { fechaToEdicion } from "../../../lib/dates";

function Chevron({ direction, className = "" }: { direction: "left" | "right"; className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 self-center text-muted ${className}`}
    >
      <path d={direction === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
    </svg>
  );
}

function Step({
  edition,
  label,
  direction,
}: {
  edition: RevistaCard;
  label: string;
  direction: "left" | "right";
}) {
  const alignRight = direction === "right";
  return (
    <Link
      href={`/revistavamos/${edition.slug}/`}
      className={`group flex items-start gap-4 py-5 ${
        alignRight
          ? "sm:flex-row-reverse sm:pl-6 sm:text-right"
          : "sm:border-r sm:border-hairline sm:pr-6"
      }`}
    >
      <Chevron direction={direction} />
      {edition.coverImage?.url && (
        <Image
          src={edition.coverImage.url}
          alt=""
          width={64}
          height={90}
          className="h-[90px] w-16 shrink-0 rounded-md object-cover shadow-md"
          sizes="64px"
        />
      )}
      <span className={`flex min-w-0 flex-col gap-1 ${alignRight ? "sm:items-end" : ""}`}>
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
          {label}
        </span>
        <span className="font-heading text-lg font-bold leading-snug tracking-[-0.02em] text-ink transition-colors group-hover:text-brand">
          {edition.title}
        </span>
        <span className="text-sm capitalize text-muted">{fechaToEdicion(edition.fecha)}</span>
      </span>
    </Link>
  );
}

/**
 * Steps from one Revista VAMOS edition to the editions either side of it, in
 * the same order as the /revistavamos/ listing. Mirrors the article-level
 * "Anterior / Siguiente" steps so both levels read the same way.
 */
export function EditionNav({ previous, next }: RevistaNeighbours) {
  if (!previous && !next) return null;
  return (
    <nav
      aria-label="Edición anterior y siguiente"
      className="mt-14 grid grid-cols-1 divide-y divide-hairline border-y border-hairline sm:grid-cols-2 sm:divide-y-0"
    >
      {previous ? (
        <Step edition={previous} label="Edición anterior" direction="left" />
      ) : (
        <span className="hidden sm:block sm:border-r sm:border-hairline" />
      )}
      {next && <Step edition={next} label="Edición siguiente" direction="right" />}
    </nav>
  );
}
