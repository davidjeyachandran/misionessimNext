import { getBlogPosts } from "@/lib/contentful";
import { PER_PAGE } from "@/app/blog/_lib/config";
import { PostGrid } from "@/app/blog/_components/PostGrid";

/** Total number of paginated blog-index pages (>= 1). */
export async function blogTotalPages(): Promise<number> {
  const { total } = await getBlogPosts(1, 0);
  return Math.max(1, Math.ceil(total / PER_PAGE));
}

/** Shared body for the blog index, rendered by both `/blog/` and `/blog/page/N/`. */
export async function BlogIndexView({ page }: { page: number }) {
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
