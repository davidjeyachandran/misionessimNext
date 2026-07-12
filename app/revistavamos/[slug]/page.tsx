import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { getAllRevistas, getRevistaBySlug } from "../../../lib/contentful";
import { fechaToEdicion } from "../../../lib/dates";
import { PostCard } from "../../blog/_components/PostCard";

export async function generateStaticParams() {
  const revistas = await getAllRevistas();
  return revistas.map((r) => ({ slug: r.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const revista = await getRevistaBySlug(slug);
  if (!revista) return {};
  return {
    title: `${revista.title} · Revista VAMOS`,
    description: `Edición ${fechaToEdicion(revista.fecha)} de la Revista VAMOS: ${revista.title}. Lectura digital gratuita.`,
    alternates: { canonical: `/revistavamos/${slug}/` },
    openGraph: {
      title: `${revista.title} · Revista VAMOS`,
      images: revista.coverImage?.url ? [{ url: revista.coverImage.url }] : [],
    },
  };
}

export default async function RevistaPage({ params }: Props) {
  const { slug } = await params;
  const revista = await getRevistaBySlug(slug);
  if (!revista) notFound();

  return (
    <main className="page-offset mx-auto max-w-6xl px-4 py-12">
      <nav className="mb-6 text-sm text-muted">
        <Link href="/" className="transition-colors hover:text-ink">Inicio</Link>
        {" / "}
        <Link href="/revistavamos/" className="transition-colors hover:text-ink">
          Revista VAMOS
        </Link>
      </nav>

      <header className="mb-12 flex flex-col gap-8 sm:flex-row">
        {revista.coverImage?.url && (
          <a
            href={revista.pdfUrl ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
            className="relative aspect-[3/4] w-full shrink-0 overflow-hidden rounded-md shadow-md sm:w-[460px]"
          >
            <Image
              src={revista.coverImage.url}
              alt={revista.coverImage.description ?? `Portada: ${revista.title}`}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 640px) 100vw, 460px"
            />
          </a>
        )}
        <div className="flex flex-col justify-center gap-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">
            Revista VAMOS
          </p>
          <h1 className="font-heading text-4xl font-bold leading-tight text-brand md:text-5xl">
            {revista.title}
          </h1>
          {revista.body && (
            <div className="text-lg leading-relaxed text-ink">
              {documentToReactComponents(revista.body)}
            </div>
          )}
          <div className="border-y border-hairline py-4 flex gap-4">
            <span className="font-semibold text-ink w-1/3">Fecha</span>
            <time dateTime={revista.fecha} className="capitalize text-muted w-2/3">
              {fechaToEdicion(revista.fecha)}
            </time>
          </div>
          {revista.pdfUrl && (
            <p className="mt-2">
              <a
                href={revista.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                Leer la revista (PDF)
              </a>
            </p>
          )}
        </div>
      </header>

      {revista.posts.length > 0 && (
        <section>
          <h2 className="font-heading mb-6 text-2xl font-bold text-ink">
            Artículos de esta edición
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {revista.posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
