import type { Metadata } from "next";
import { getBlogPosts } from "../../lib/contentful";
import { PostGrid } from "./_components/PostGrid";

export const metadata: Metadata = {
  title: "Blog",
  description: "Artículos sobre misiones, fe y servicio de SIM Latinoamérica.",
  alternates: { canonical: "/blog/" },
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

  return (
    <main className="page-offset mx-auto max-w-6xl px-4 py-12">
      <header className="mb-10">
        <h1 className="font-heading text-4xl font-bold text-ink">Blog</h1>
        <p className="mt-2 text-muted">{total} artículos</p>
      </header>

      <PostGrid
        items={items}
        total={total}
        page={page}
        perPage={PER_PAGE}
        basePath="/blog"
      />
    </main>
  );
}
