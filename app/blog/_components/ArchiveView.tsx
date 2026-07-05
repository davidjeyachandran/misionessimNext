import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllCategories,
  getAllTags,
  getBlogPostsByCategory,
  getBlogPostsByTag,
} from "@/lib/contentful";
import { PER_PAGE } from "@/app/blog/_lib/config";
import { PostGrid } from "@/app/blog/_components/PostGrid";

export type ArchiveKind = "tag" | "category";

const CONFIG = {
  tag: {
    label: "Etiqueta",
    fetch: getBlogPostsByTag,
    terms: getAllTags,
    heading: (name: string) => `#${name}`,
    basePath: (slug: string) => `/blog/tag/${slug}`,
  },
  category: {
    label: "Categoría",
    fetch: getBlogPostsByCategory,
    terms: getAllCategories,
    heading: (name: string) => name,
    basePath: (slug: string) => `/blog/category/${slug}`,
  },
} as const;

/** `{ [param]: slug }[]` for every term — the page-1 archive routes. */
export async function archiveTermParams(kind: ArchiveKind, param: string) {
  const terms = await CONFIG[kind].terms();
  return terms.map((t) => ({ [param]: t.slug }));
}

/** `{ [param]: slug, page }[]` for every term's pages 2..N — the paged routes. */
export async function archivePageParams(kind: ArchiveKind, param: string) {
  const terms = await CONFIG[kind].terms();
  const params: Record<string, string>[] = [];
  for (const t of terms) {
    const totalPages = Math.ceil(t.count / PER_PAGE);
    for (let n = 2; n <= totalPages; n++) {
      params.push({ [param]: t.slug, page: String(n) });
    }
  }
  return params;
}

/** Display name for a term (for metadata), or "" if the term doesn't exist. */
export async function archiveTermName(kind: ArchiveKind, slug: string) {
  const { name } = await CONFIG[kind].fetch(slug, 1, 0);
  return name;
}

/** Shared body for a taxonomy archive, rendered by both page-1 and paged routes. */
export async function ArchiveView({
  kind,
  slug,
  page,
}: {
  kind: ArchiveKind;
  slug: string;
  page: number;
}) {
  const cfg = CONFIG[kind];
  const skip = (page - 1) * PER_PAGE;
  const { name, total, items } = await cfg.fetch(slug, PER_PAGE, skip);
  if (!name) notFound();

  return (
    <main className="page-offset mx-auto max-w-6xl px-4 py-12">
      <nav className="mb-4 text-sm text-muted">
        <Link href="/blog/" className="hover:text-ink transition-colors">Blog</Link>
        {" / "}
        <span>{cfg.label}</span>
      </nav>
      <header className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">{cfg.label}</p>
        <h1 className="font-heading text-4xl font-bold text-ink">{cfg.heading(name)}</h1>
        <p className="mt-2 text-muted">{total} artículos</p>
      </header>

      <PostGrid
        items={items}
        total={total}
        page={page}
        perPage={PER_PAGE}
        basePath={cfg.basePath(slug)}
      />
    </main>
  );
}
