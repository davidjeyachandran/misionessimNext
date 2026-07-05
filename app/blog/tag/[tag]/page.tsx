import type { Metadata } from "next";
import {
  ArchiveView,
  archiveTermName,
  archiveTermParams,
} from "@/app/blog/_components/ArchiveView";

export function generateStaticParams() {
  return archiveTermParams("tag", "tag");
}

// No tag currently exceeds PER_PAGE posts, so tag archives are a single page
// and there is no `page/[page]/` route here (an empty generateStaticParams is
// rejected under `output: 'export'`). If a tag ever grows past PER_PAGE, add a
// `tag/[tag]/page/[page]/page.tsx` mirroring the category one.

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  const name = await archiveTermName("tag", tag);
  if (!name) return {};
  return {
    title: `Etiqueta: ${name}`,
    description: `Artículos etiquetados con ${name}.`,
    alternates: { canonical: `/blog/tag/${tag}/` },
  };
}

export default async function TagArchivePage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  return <ArchiveView kind="tag" slug={tag} page={1} />;
}
