import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS, INLINES, MARKS } from "@contentful/rich-text-types";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllBlogPostSlugs,
  getBlogPostBySlug,
  publishDateToSegment,
} from "../../../../lib/contentful";

export async function generateStaticParams() {
  const slugs = await getAllBlogPostSlugs();
  return slugs.map(({ slug, publishDate }) => ({
    date: publishDateToSegment(publishDate),
    slug,
  }));
}

type Props = { params: Promise<{ date: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.description ?? undefined,
    openGraph: {
      title: post.seoTitle ?? post.title,
      description: post.seoDescription ?? post.description ?? undefined,
      images: post.heroImage?.url ? [{ url: post.heroImage.url }] : [],
    },
  };
}

const richTextOptions = {
  renderMark: {
    [MARKS.BOLD]: (text: React.ReactNode) => <strong className="font-semibold">{text}</strong>,
    [MARKS.ITALIC]: (text: React.ReactNode) => <em>{text}</em>,
  },
  renderNode: {
    [BLOCKS.PARAGRAPH]: (_: unknown, children: React.ReactNode) => (
      <p className="mb-4 leading-relaxed">{children}</p>
    ),
    [BLOCKS.HEADING_2]: (_: unknown, children: React.ReactNode) => (
      <h2 className="font-heading mt-8 mb-3 text-2xl font-bold text-ink">{children}</h2>
    ),
    [BLOCKS.HEADING_3]: (_: unknown, children: React.ReactNode) => (
      <h3 className="font-heading mt-6 mb-2 text-xl font-bold text-ink">{children}</h3>
    ),
    [BLOCKS.HEADING_4]: (_: unknown, children: React.ReactNode) => (
      <h4 className="font-heading mt-4 mb-2 text-lg font-semibold text-ink">{children}</h4>
    ),
    [BLOCKS.UL_LIST]: (_: unknown, children: React.ReactNode) => (
      <ul className="mb-4 list-disc pl-6 space-y-1">{children}</ul>
    ),
    [BLOCKS.OL_LIST]: (_: unknown, children: React.ReactNode) => (
      <ol className="mb-4 list-decimal pl-6 space-y-1">{children}</ol>
    ),
    [BLOCKS.LIST_ITEM]: (_: unknown, children: React.ReactNode) => (
      <li className="leading-relaxed">{children}</li>
    ),
    [BLOCKS.QUOTE]: (_: unknown, children: React.ReactNode) => (
      <blockquote className="my-6 border-l-4 border-brand pl-4 italic text-muted">
        {children}
      </blockquote>
    ),
    [BLOCKS.HR]: () => <hr className="my-8 border-hairline" />,
    [BLOCKS.EMBEDDED_ASSET]: (node: { data: { target: { fields?: { file?: { url?: string }; title?: string } } } }) => {
      const url = node.data.target.fields?.file?.url;
      const title = node.data.target.fields?.title ?? "";
      if (!url) return null;
      return (
        <figure className="my-6">
          <Image
            src={url.startsWith("//") ? `https:${url}` : url}
            alt={title}
            width={800}
            height={450}
            className="rounded-md w-full object-cover"
          />
        </figure>
      );
    },
    [INLINES.HYPERLINK]: (node: { data: { uri: string } }, children: React.ReactNode) => (
      <a
        href={node.data.uri}
        className="text-brand underline hover:text-brand-dark transition-colors"
        target={node.data.uri.startsWith("http") ? "_blank" : undefined}
        rel={node.data.uri.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    ),
  },
};

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const displayDate = new Date(post.publishDate).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/" className="hover:text-ink transition-colors">Inicio</Link>
        {" / "}
        <Link href="/blog/" className="hover:text-ink transition-colors">Blog</Link>
        {post.revista && (
          <>
            {" / "}
            <Link
              href={`/la-revista/${post.revista.slug}/`}
              className="hover:text-ink transition-colors"
            >
              {post.revista.title}
            </Link>
          </>
        )}
      </nav>

      <header className="mb-8">
        {post.categories && post.categories.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {post.categories.map((cat) => (
              <Link
                key={cat}
                href={`/blog/category/${encodeURIComponent(cat)}/`}
                className="text-xs font-semibold uppercase tracking-wide text-brand hover:text-brand-dark"
              >
                {cat}
              </Link>
            ))}
          </div>
        )}
        <h1 className="font-heading text-4xl font-bold leading-tight text-ink">{post.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
          <time dateTime={post.publishDate}>{displayDate}</time>
          {post.author && (
            <>
              <span aria-hidden>·</span>
              <Link
                href={`/blog/author/${encodeURIComponent(post.author)}/`}
                className="hover:text-ink transition-colors"
              >
                {post.author}
              </Link>
            </>
          )}
        </div>
      </header>

      {post.heroImage?.url && (
        <div className="mb-8 overflow-hidden rounded-lg aspect-[16/9] relative">
          <Image
            src={post.heroImage.url}
            alt={post.heroImage.description ?? post.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      )}

      {post.description && (
        <p className="mb-8 text-lg leading-relaxed text-muted border-l-4 border-cream pl-4">
          {post.description}
        </p>
      )}

      {post.body?.json && (
        <div className="prose-custom text-ink">
          {documentToReactComponents(post.body.json, richTextOptions as Parameters<typeof documentToReactComponents>[1])}
        </div>
      )}

      {post.tags && post.tags.length > 0 && (
        <footer className="mt-10 pt-6 border-t border-hairline">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog/tag/${encodeURIComponent(tag)}/`}
                className="rounded-full border border-hairline px-3 py-1 text-xs text-muted hover:border-brand hover:text-brand transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </footer>
      )}
    </main>
  );
}
