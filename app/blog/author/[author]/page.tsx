import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllAuthors, getBlogPostsByAuthor } from "../../../../lib/contentful";
import { PostGrid } from "../../_components/PostGrid";

const PER_PAGE = 12;

export async function generateStaticParams() {
  const authors = await getAllAuthors();
  return authors.map((a) => ({ author: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ author: string }>;
}): Promise<Metadata> {
  const { author } = await params;
  const { name } = await getBlogPostsByAuthor(author, 1, 0);
  if (!name) return {};
  return {
    title: `Autor: ${name}`,
    description: `Artículos escritos por ${name}.`,
  };
}

export default async function AuthorArchivePage({
  params,
  searchParams,
}: {
  params: Promise<{ author: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { author } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const skip = (page - 1) * PER_PAGE;

  const { name, total, items } = await getBlogPostsByAuthor(author, PER_PAGE, skip);
  if (!name) notFound();

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <nav className="mb-4 text-sm text-muted">
        <Link href="/blog/" className="hover:text-ink transition-colors">Blog</Link>
        {" / "}
        <span>Autor</span>
      </nav>
      <header className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">Autor</p>
        <h1 className="font-heading text-4xl font-bold text-ink">{name}</h1>
        <p className="mt-2 text-muted">{total} artículos</p>
      </header>

      <PostGrid
        items={items}
        total={total}
        page={page}
        perPage={PER_PAGE}
        basePath={`/blog/author/${author}`}
      />
    </main>
  );
}
