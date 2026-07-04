import type { Metadata } from "next";
import { getBlogPosts } from "../../lib/contentful";
import { PostCard } from "./_components/PostCard";

export const metadata: Metadata = {
  title: "Blog",
  description: "Artículos sobre misiones, fe y servicio de SIM Latinoamérica.",
};

const PER_PAGE = 12;

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const skip = (page - 1) * PER_PAGE;

  const { total, items } = await getBlogPosts(PER_PAGE, skip);
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-10">
        <h1 className="font-heading text-4xl font-bold text-ink">Blog</h1>
        <p className="mt-2 text-muted">{total} artículos</p>
      </header>

      {items.length === 0 ? (
        <p className="text-muted">No hay artículos disponibles.</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Paginación">
          {page > 1 && (
            <a
              href={`/blog/?page=${page - 1}`}
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
              href={`/blog/?page=${page + 1}`}
              className="rounded border border-hairline px-4 py-2 text-sm text-ink hover:bg-cream transition-colors"
            >
              Siguiente →
            </a>
          )}
        </nav>
      )}
    </main>
  );
}
