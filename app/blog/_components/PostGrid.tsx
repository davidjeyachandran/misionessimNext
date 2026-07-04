import type { BlogPostCard } from "../../../lib/contentful";
import { PostCard } from "./PostCard";

interface PostGridProps {
  items: BlogPostCard[];
  total: number;
  page: number;
  perPage: number;
  /** Base path for pagination links, e.g. "/blog" or "/blog/tag/misiones". */
  basePath: string;
  emptyMessage?: string;
}

export function PostGrid({
  items,
  total,
  page,
  perPage,
  basePath,
  emptyMessage = "No hay artículos disponibles.",
}: PostGridProps) {
  const totalPages = Math.ceil(total / perPage);

  return (
    <>
      {items.length === 0 ? (
        <p className="text-muted">{emptyMessage}</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-12 flex items-center justify-center gap-4" aria-label="Paginación">
          {page > 1 && (
            <a
              href={`${basePath}/?page=${page - 1}`}
              className="rounded border border-hairline px-4 py-2 text-sm text-ink hover:bg-cream transition-colors"
            >
              ← Anterior
            </a>
          )}
          <span className="text-sm text-muted">
            Página {page} de {totalPages}
          </span>
          {page < totalPages && (
            <a
              href={`${basePath}/?page=${page + 1}`}
              className="rounded border border-hairline px-4 py-2 text-sm text-ink hover:bg-cream transition-colors"
            >
              Siguiente →
            </a>
          )}
        </nav>
      )}
    </>
  );
}
