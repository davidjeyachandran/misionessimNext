import type { Metadata } from "next";
import {
  ArchiveView,
  archiveTermName,
  archiveTermParams,
} from "@/app/blog/_components/ArchiveView";

export function generateStaticParams() {
  return archiveTermParams("category", "category");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const name = await archiveTermName("category", category);
  if (!name) return {};
  return {
    title: `Categoría: ${name}`,
    description: `Artículos en la categoría ${name}.`,
    alternates: { canonical: `/blog/category/${category}/` },
  };
}

export default async function CategoryArchivePage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  return <ArchiveView kind="category" slug={category} page={1} />;
}
