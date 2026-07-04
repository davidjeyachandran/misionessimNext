import Image from "next/image";
import Link from "next/link";
import type { BlogPostCard } from "../../../lib/contentful";
import { publishDateToSegment, slugify } from "../../../lib/contentful";

export function PostCard({ post }: { post: BlogPostCard }) {
  const dateSegment = publishDateToSegment(post.publishDate);
  const href = `/blog/${dateSegment}/${post.slug}/`;
  const displayDate = new Date(post.publishDate).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="group flex flex-col gap-3">
      {post.heroImage?.url && (
        <Link href={href} className="block overflow-hidden rounded-md aspect-[16/9] relative">
          <Image
            src={post.heroImage.url}
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
                href={`/blog/category/${slugify(cat)}/`}
                className="text-xs font-semibold uppercase tracking-wide text-brand hover:text-brand-dark"
              >
                {cat}
              </Link>
            ))}
          </div>
        )}
        <h2 className="font-heading text-xl font-bold leading-snug text-ink">
          <Link href={href} className="hover:text-brand transition-colors">
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
