import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllTags, getBlogPostsByTag } from "../../../../lib/contentful";
import { PostGrid } from "../../_components/PostGrid";

const PER_PAGE = 12;

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((t) => ({ tag: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  const { name } = await getBlogPostsByTag(tag, 1, 0);
  if (!name) return {};
  return {
    title: `Etiqueta: ${name}`,
    description: `Artículos etiquetados con ${name}.`,
    alternates: { canonical: `/blog/tag/${tag}/` },
  };
}

export default async function TagArchivePage({
  params,
  searchParams,
}: {
  params: Promise<{ tag: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { tag } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const skip = (page - 1) * PER_PAGE;

  const { name, total, items } = await getBlogPostsByTag(tag, PER_PAGE, skip);
  if (!name) notFound();

  return (
    <main className="page-offset mx-auto max-w-6xl px-4 py-12">
      <nav className="mb-4 text-sm text-muted">
        <Link href="/blog/" className="hover:text-ink transition-colors">Blog</Link>
        {" / "}
        <span>Etiqueta</span>
      </nav>
      <header className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">Etiqueta</p>
        <h1 className="font-heading text-4xl font-bold text-ink">#{name}</h1>
        <p className="mt-2 text-muted">{total} artículos</p>
      </header>

      <PostGrid
        items={items}
        total={total}
        page={page}
        perPage={PER_PAGE}
        basePath={`/blog/tag/${tag}`}
      />
    </main>
  );
}
