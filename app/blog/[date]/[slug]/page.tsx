import { documentToReactComponents, type Options } from "@contentful/rich-text-react-renderer";
import { BLOCKS, INLINES, MARKS } from "@contentful/rich-text-types";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllBlogPostSlugs,
  getBlogPostBySlug,
  normalizeRevistaSlug,
  publishDateToSegment,
  slugify,
} from "../../../../lib/contentful";
import { formatPostDate } from "../../../../lib/dates";
import { socialImage } from "../../../../lib/social-image";
import {
  articleGraph,
  breadcrumbGraph,
  jsonLdProps,
} from "../../../../lib/structured-data";

export async function generateStaticParams() {
  const slugs = await getAllBlogPostSlugs();
  return slugs.map(({ slug, publishDate }) => ({
    date: publishDateToSegment(publishDate),
    slug,
  }));
}

type Props = { params: Promise<{ date: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date, slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};
  // Canonicalise to the post's own publishDate segment, so a request that
  // reached this post under a different date segment still points search
  // engines at the one true URL.
  const canonicalDate = post.publishDate
    ? publishDateToSegment(post.publishDate)
    : date;
  // Twitter tags do NOT inherit from openGraph — Next only emits `twitter:*`
  // from the `twitter` field, so without this block every article kept the
  // root layout's homepage banner as its card image.
  const card = socialImage(post.heroImage);
  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.description ?? undefined,
    alternates: { canonical: `/blog/${canonicalDate}/${slug}/` },
    openGraph: {
      type: "article",
      title: post.seoTitle ?? post.title,
      description: post.seoDescription ?? post.description ?? undefined,
      images: card ? [card] : [],
    },
    ...(card
      ? {
          twitter: {
            card: "summary_large_image",
            title: post.seoTitle ?? post.title,
            description: post.seoDescription ?? post.description ?? undefined,
            images: [card.url],
          },
        }
      : {}),
  };
}

interface HyperlinkNode {
  data: { uri: string };
}

function buildRichTextOptions(
  assetMap: Map<string, { url: string; title?: string | null }>,
): Options {
  return {
    renderMark: {
      [MARKS.BOLD]: (text) => <strong className="font-semibold">{text}</strong>,
      [MARKS.ITALIC]: (text) => <em>{text}</em>,
    },
    renderNode: {
      [BLOCKS.PARAGRAPH]: (_node, children) => (
        <p className="mb-4 leading-relaxed">{children}</p>
      ),
      [BLOCKS.HEADING_1]: (_node, children) => (
        <h2 className="font-heading mt-8 mb-3 text-2xl font-bold text-ink">{children}</h2>
      ),
      [BLOCKS.HEADING_2]: (_node, children) => (
        <h2 className="font-heading mt-8 mb-3 text-2xl font-bold text-ink">{children}</h2>
      ),
      [BLOCKS.HEADING_3]: (_node, children) => (
        <h3 className="font-heading mt-6 mb-2 text-xl font-bold text-ink">{children}</h3>
      ),
      [BLOCKS.HEADING_4]: (_node, children) => (
        <h4 className="font-heading mt-4 mb-2 text-lg font-semibold text-ink">{children}</h4>
      ),
      [BLOCKS.UL_LIST]: (_node, children) => (
        <ul className="mb-4 list-disc pl-6 space-y-1">{children}</ul>
      ),
      [BLOCKS.OL_LIST]: (_node, children) => (
        <ol className="mb-4 list-decimal pl-6 space-y-1">{children}</ol>
      ),
      [BLOCKS.LIST_ITEM]: (_node, children) => (
        <li className="leading-relaxed">{children}</li>
      ),
      [BLOCKS.QUOTE]: (_node, children) => (
        <blockquote className="my-6 border-l-4 border-brand pl-4 italic text-muted">
          {children}
        </blockquote>
      ),
      [BLOCKS.HR]: () => <hr className="my-8 border-hairline" />,
      [BLOCKS.EMBEDDED_ASSET]: (node) => {
        const id = node.data?.target?.sys?.id as string | undefined;
        const asset = id ? assetMap.get(id) : undefined;
        if (!asset?.url) return null;
        return (
          <figure className="my-6">
            <Image
              src={asset.url}
              alt={asset.title ?? ""}
              width={800}
              height={450}
              className="rounded-md w-full object-cover"
            />
          </figure>
        );
      },
      [BLOCKS.TABLE]: (_node, children) => (
        <div className="my-6 overflow-x-auto">
          <table className="w-full border-collapse text-sm">{children}</table>
        </div>
      ),
      [BLOCKS.TABLE_ROW]: (_node, children) => (
        <tr className="border-b border-hairline">{children}</tr>
      ),
      [BLOCKS.TABLE_HEADER_CELL]: (_node, children) => (
        <th className="px-3 py-2 text-left font-semibold bg-cream">{children}</th>
      ),
      [BLOCKS.TABLE_CELL]: (_node, children) => (
        <td className="px-3 py-2">{children}</td>
      ),
      [INLINES.HYPERLINK]: (node, children) => {
        const { uri } = (node as unknown as HyperlinkNode).data;

        // YouTube embed (emitted by the iframe→[video](url) turndown rule)
        if (uri.includes("youtube.com/embed/")) {
          return (
            <span className="relative my-6 block aspect-video">
              <iframe
                src={uri}
                className="absolute inset-0 w-full h-full rounded-md"
                allowFullScreen
                title="Video"
              />
            </span>
          );
        }

        // Internal link (absolute misionessim.org links rewritten to relative
        // paths by import-cms.ts rewriteInternalLinks)
        if (uri.startsWith("/") || uri.startsWith("./")) {
          return (
            <Link
              href={uri}
              className="text-brand underline hover:text-brand-dark transition-colors"
            >
              {children}
            </Link>
          );
        }

        return (
          <a
            href={uri}
            className="text-brand underline hover:text-brand-dark transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        );
      },
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const assetMap = new Map<string, { url: string; title?: string | null }>();
  for (const asset of post.body?.links?.assets?.block ?? []) {
    if (asset) assetMap.set(asset.sys.id, asset);
  }
  const richTextOptions = buildRichTextOptions(assetMap);

  const displayDate = formatPostDate(post.publishDate);

  const canonicalPath = `/blog/${publishDateToSegment(post.publishDate)}/${post.slug}/`;
  const structuredData = jsonLdProps([
    articleGraph({
      path: canonicalPath,
      headline: post.title,
      description: post.seoDescription ?? post.description,
      image: post.heroImage,
      datePublished: post.publishDate,
      dateModified: post.sys?.publishedAt,
      categories: post.categories,
      tags: post.tags,
    }),
    // Mirrors the visible breadcrumb below, as Google expects.
    breadcrumbGraph(canonicalPath, [
      { name: "Inicio", path: "/" },
      { name: "Blog", path: "/blog/" },
      ...(post.revista
        ? [
            {
              name: post.revista.title,
              path: `/revistavamos/${normalizeRevistaSlug(post.revista.slug)}/`,
            },
          ]
        : []),
      { name: post.title },
    ]),
  ]);

  return (
    <main className="page-offset mx-auto max-w-3xl px-4 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={structuredData} />
      <nav className="mb-6 text-sm text-muted">
        <Link href="/" className="hover:text-ink transition-colors">Inicio</Link>
        {" / "}
        <Link href="/blog/" className="hover:text-ink transition-colors">Blog</Link>
        {post.revista && (
          <>
            {" / "}
            <Link
              href={`/revistavamos/${normalizeRevistaSlug(post.revista.slug)}/`}
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
                href={`/blog/category/${slugify(cat)}/`}
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
        </div>
      </header>

      {post.heroImage?.url && (
        <div className="mb-8 overflow-hidden rounded-lg aspect-[16/9] relative">
          <Image
            src={post.heroImage.url}
            alt={post.heroImage.description || post.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      )}

      {post.body?.json && (
        <div className="prose-custom text-ink">
          {documentToReactComponents(post.body.json, richTextOptions)}
        </div>
      )}

      {post.tags && post.tags.length > 0 && (
        <footer className="mt-10 pt-6 border-t border-hairline">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog/tag/${slugify(tag)}/`}
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
