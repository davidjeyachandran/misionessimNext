import Image from "next/image";
import Link from "next/link";
import type { BlogPostCard, PostNavigation } from "../../../lib/contentful";
import { publishDateToSegment } from "../../../lib/contentful";
import { fechaToEdicion } from "../../../lib/dates";
import { PostCard } from "./PostCard";

function postHref(post: BlogPostCard): string {
  return `/blog/${publishDateToSegment(post.publishDate)}/${post.slug}/`;
}

/** Beyond this many articles the ticks are too fine to read, so the bar goes solid. */
const MAX_TICKS = 40;

function ReadingProgress({ position, total }: { position: number; total: number }) {
  if (total > MAX_TICKS) {
    return (
      <div className="h-1 w-full rounded-full bg-hairline">
        <div
          className="h-1 rounded-full bg-brand"
          style={{ width: `${(position / total) * 100}%` }}
        />
      </div>
    );
  }
  return (
    <div className="flex gap-[3px]">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full ${i < position ? "bg-brand" : "bg-hairline"}`}
        />
      ))}
    </div>
  );
}

function Chevron({
  direction,
  className = "",
}: {
  direction: "left" | "right";
  className?: string;
}) {
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
      className={`mt-1 shrink-0 text-muted ${className}`}
    >
      <path d={direction === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
    </svg>
  );
}

interface StepProps {
  post: BlogPostCard;
  label: string;
  direction: "left" | "right";
}

function Step({ post, label, direction }: StepProps) {
  const alignRight = direction === "right";
  return (
    <Link
      href={postHref(post)}
      className={`group flex gap-3 py-5 ${
        alignRight
          ? "sm:justify-end sm:pl-6 sm:text-right"
          : "sm:border-r sm:border-hairline sm:pr-6"
      }`}
    >
      {/* Stacked on a phone both steps read left-to-right; only the
          two-column layout flips the next one to the right. */}
      <Chevron direction={direction} className={alignRight ? "sm:order-2" : ""} />
      <span className={`flex flex-col gap-1 ${alignRight ? "sm:items-end" : ""}`}>
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
          {label}
        </span>
        <span className="font-heading text-lg font-bold leading-snug tracking-[-0.02em] text-ink transition-colors group-hover:text-brand">
          {post.title}
        </span>
      </span>
    </Link>
  );
}

/**
 * The links out of an article. A VAMOS article is a page of an edition, so it
 * gets that edition's cover, its own place in the running order, and the
 * articles either side of it; an article that belongs to no edition steps
 * through the blog by date instead. Either way the page never dead-ends.
 */
export function PostOnwardNav({ nav }: { nav: PostNavigation }) {
  const { edition, previous, next, more } = nav;
  if (!edition && !previous && !next) return null;

  const editionHref = edition ? `/revistavamos/${edition.slug}/` : null;
  const stepLabel = edition ? "en esta edición" : "en el blog";

  return (
    <>
      {edition && editionHref && (
        <section
          aria-label="Edición a la que pertenece este artículo"
          className="mt-12 flex flex-col gap-6 rounded-btn bg-linen p-6 sm:flex-row sm:items-center"
        >
          {/* `sm:contents` dissolves this wrapper once the section is a row, so
              the cover and the text become its direct children. */}
          <div className="flex items-center gap-5 sm:contents">
            {edition.coverImage?.url && (
              <Link href={editionHref} className="shrink-0" tabIndex={-1} aria-hidden="true">
                <Image
                  src={edition.coverImage.url}
                  alt=""
                  width={96}
                  height={136}
                  className="h-34 w-24 rounded-md object-cover shadow-md"
                  sizes="96px"
                />
              </Link>
            )}
            <div className="flex min-w-0 grow flex-col gap-2.5">
              <p className="text-xs font-semibold uppercase tracking-[1px] text-teal">
                Revista VAMOS <span className="capitalize">{fechaToEdicion(edition.fecha)}</span>
              </p>
              <h2 className="font-heading text-2xl font-bold text-ink">
                <Link href={editionHref} className="transition-colors hover:text-brand">
                  {edition.title}
                </Link>
              </h2>
              <ReadingProgress position={edition.position} total={edition.total} />
              <p className="text-sm leading-snug text-muted">
                Artículo {edition.position} de {edition.total} en esta edición
              </p>
            </div>
          </div>
          <Link
            href={editionHref}
            className="shrink-0 rounded-btn border-2 border-brand px-8 py-3 text-center text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
          >
            Ver la edición
          </Link>
        </section>
      )}

      {(previous || next) && (
        <nav
          aria-label="Artículo anterior y siguiente"
          className="mt-10 grid grid-cols-1 divide-y divide-hairline border-y border-hairline sm:grid-cols-2 sm:divide-y-0"
        >
          {previous ? (
            <Step post={previous} label={`Anterior ${stepLabel}`} direction="left" />
          ) : (
            <span className="hidden sm:block sm:border-r sm:border-hairline" />
          )}
          {next && <Step post={next} label={`Siguiente ${stepLabel}`} direction="right" />}
        </nav>
      )}

      {edition && editionHref && more.length > 0 && (
        <section className="mt-14">
          <div className="mb-6 flex items-baseline justify-between gap-6">
            <h2 className="font-heading text-2xl font-bold text-ink">
              Sigue leyendo esta edición
            </h2>
            <Link
              href={editionHref}
              className="shrink-0 text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
            >
              Ver los {edition.total} artículos →
            </Link>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
