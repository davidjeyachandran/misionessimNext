import { getBlogPosts, getAllCategories } from "@/lib/contentful";
import { PER_PAGE } from "@/app/blog/_lib/config";
import { PostGrid } from "@/app/blog/_components/PostGrid";
import { PageHero } from "@/app/_components/PageHero";

/** Total number of paginated blog-index pages (>= 1). */
export async function blogTotalPages(): Promise<number> {
  const { total } = await getBlogPosts(1, 0);
  return Math.max(1, Math.ceil(total / PER_PAGE));
}

/** Shared body for the blog index, rendered by both `/blog/` and `/blog/page/N/`. */
export async function BlogIndexView({ page }: { page: number }) {
  const skip = (page - 1) * PER_PAGE;
  const [{ total, items }, categories] = await Promise.all([
    getBlogPosts(PER_PAGE, skip),
    getAllCategories(),
  ]);

  return (
    <main className="page-offset">
      <PageHero
        title="Reflexiones y experiencias desde el campo"
        image={{ src: "/heroes/blog.webp" }}
      />

      <div className="mx-auto max-w-6xl px-4 py-12">
        {categories.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <a
                key={cat.slug}
                href={`/blog/category/${cat.slug}/`}
                className="rounded-full border border-hairline px-4 py-1.5 text-sm text-muted hover:border-brand hover:text-brand transition-colors"
              >
                {cat.name}
              </a>
            ))}
          </div>
        )}

        <PostGrid
          items={items}
          total={total}
          page={page}
          perPage={PER_PAGE}
          basePath="/blog"
        />
      </div>
    </main>
  );
}
