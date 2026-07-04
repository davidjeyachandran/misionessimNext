import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllCategories,
  getBlogPostsByCategory,
} from "../../../../lib/contentful";
import { PostGrid } from "../../_components/PostGrid";

const PER_PAGE = 12;

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const { name } = await getBlogPostsByCategory(category, 1, 0);
  if (!name) return {};
  return {
    title: `Categoría: ${name}`,
    description: `Artículos en la categoría ${name}.`,
    alternates: { canonical: `/blog/category/${category}/` },
  };
}

export default async function CategoryArchivePage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { category } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const skip = (page - 1) * PER_PAGE;

  const { name, total, items } = await getBlogPostsByCategory(category, PER_PAGE, skip);
  if (!name) notFound();

  return (
    <main className="page-offset mx-auto max-w-6xl px-4 py-12">
      <nav className="mb-4 text-sm text-muted">
        <Link href="/blog/" className="hover:text-ink transition-colors">Blog</Link>
        {" / "}
        <span>Categoría</span>
      </nav>
      <header className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">Categoría</p>
        <h1 className="font-heading text-4xl font-bold text-ink">{name}</h1>
        <p className="mt-2 text-muted">{total} artículos</p>
      </header>

      <PostGrid
        items={items}
        total={total}
        page={page}
        perPage={PER_PAGE}
        basePath={`/blog/category/${category}`}
      />
    </main>
  );
}
