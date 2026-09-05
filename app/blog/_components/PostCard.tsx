import Image from "next/image";
import Link from "next/link";
import type { BlogPostCard } from "../../../lib/contentful";
import { publishDateToSegment, slugify } from "../../../lib/contentful";
import { formatPostDate } from "../../../lib/dates";
import { hintedSrc } from "../../../lib/contentful-image-loader";

// Must stay in step with the `aspect-[16/9]` class on the wrapper below —
// Tailwind only sees literal class names. Drives the CDN-side crop, so a
// portrait or letterboxed hero is cut to the card's shape by the Images API
// rather than downloaded whole and trimmed by `object-cover`.
//
// Only cards get this. The revista covers are `object-contain` by design:
// they letterbox rather than crop, and a `fit=fill` there would slice the
// cover art.
const CARD_ASPECT = [16, 9] as const;

// Card and chip links opt out of prefetching — see SiteHeader for the full
// reasoning. A grid of these prefetches one full route per card as it enters
// the viewport, which on a listing page is the whole grid, competing with the
// card images for the LCP.
const PREFETCH = false;

export function PostCard({ post }: { post: BlogPostCard }) {
  const dateSegment = publishDateToSegment(post.publishDate);
  const href = `/blog/${dateSegment}/${post.slug}/`;
  const displayDate = formatPostDate(post.publishDate);

  return (
    <article className="group flex flex-col gap-3">
      {post.heroImage?.url && (
        <Link
          href={href}
          prefetch={PREFETCH}
          className="block overflow-hidden rounded-md aspect-[16/9] relative"
        >
          <Image
            src={hintedSrc(post.heroImage.url, CARD_ASPECT, post.heroImage)}
            alt={post.heroImage.description ?? post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </Link>
      )}
      <div className="flex flex-col gap-2">
        {post.categories && post.categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.categories.map((cat) => (
              <Link
                key={cat}
                prefetch={PREFETCH}
                href={`/blog/category/${slugify(cat)}/`}
                className="text-xs font-semibold uppercase tracking-wide text-brand hover:text-brand-dark"
              >
                {cat}
              </Link>
            ))}
          </div>
        )}
        <h2 className="font-heading text-xl font-bold leading-snug text-ink">
          <Link href={href} prefetch={PREFETCH} className="hover:text-brand transition-colors">
            {post.title}
          </Link>
        </h2>
        {post.description && (
          <p className="text-sm text-muted line-clamp-3">{post.description}</p>
        )}
        <div className="flex items-center gap-2 text-xs text-muted">
          <time dateTime={post.publishDate}>{displayDate}</time>
        </div>
      </div>
    </article>
  );
}
