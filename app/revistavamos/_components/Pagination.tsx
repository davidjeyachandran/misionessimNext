import Link from "next/link";

interface PaginationProps {
  page: number;
  totalPages: number;
  /** Base path for pagination links, e.g. "/revistavamos". */
  basePath: string;
}

/** How many pages to list in full before collapsing the middle with ellipses. */
const MAX_LINKS = 7;

/** Page numbers to render, with `null` marking a collapsed gap. */
function pageWindow(page: number, totalPages: number): (number | null)[] {
  if (totalPages <= MAX_LINKS) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const middle = [page - 1, page, page + 1].filter((n) => n > 1 && n < totalPages);
  const out: (number | null)[] = [1];
  if (middle[0] !== undefined && middle[0] > 2) out.push(null);
  out.push(...middle);
  if (middle[middle.length - 1]! < totalPages - 1) out.push(null);
  out.push(totalPages);
  return out;
}

/**
 * Numbered pager. Path-based so it works under `output: 'export'` (query
 * strings can't be resolved by a static host): page 1 lives at the base path,
 * pages 2+ at `${basePath}/page/N/`.
 */
export function Pagination({ page, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null;

  const href = (n: number) => (n <= 1 ? `${basePath}/` : `${basePath}/page/${n}/`);

  return (
    <nav className="mt-12 flex flex-wrap items-center justify-center gap-2" aria-label="Paginación">
      {page > 1 && (
        <Link
          href={href(page - 1)}
          rel="prev"
          className="rounded-btn border border-hairline px-4 py-2 text-sm text-ink transition-colors hover:bg-cream"
        >
          ← Anterior
        </Link>
      )}

      {pageWindow(page, totalPages).map((n, i) =>
        n === null ? (
          <span key={`gap-${i}`} className="px-2 text-sm text-muted" aria-hidden="true">
            …
          </span>
        ) : n === page ? (
          <span
            key={n}
            aria-current="page"
            className="rounded-btn border border-brand bg-brand px-4 py-2 text-sm font-semibold text-white"
          >
            {n}
          </span>
        ) : (
          <Link
            key={n}
            href={href(n)}
            aria-label={`Página ${n}`}
            className="rounded-btn border border-hairline px-4 py-2 text-sm text-ink transition-colors hover:bg-cream"
          >
            {n}
          </Link>
        ),
      )}

      {page < totalPages && (
        <Link
          href={href(page + 1)}
          rel="next"
          className="rounded-btn border border-hairline px-4 py-2 text-sm text-ink transition-colors hover:bg-cream"
        >
          Siguiente →
        </Link>
      )}
    </nav>
  );
}
