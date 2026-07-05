import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArchiveView,
  archivePageParams,
  archiveTermName,
} from "@/app/blog/_components/ArchiveView";

export function generateStaticParams() {
  return archivePageParams("category", "category");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; page: string }>;
}): Promise<Metadata> {
  const { category, page } = await params;
  const name = await archiveTermName("category", category);
  if (!name) return {};
  return {
    title: `Categoría: ${name} — Página ${page}`,
    description: `Artículos en la categoría ${name}.`,
    alternates: { canonical: `/blog/category/${category}/page/${page}/` },
  };
}

export default async function CategoryArchivePaged({
  params,
}: {
  params: Promise<{ category: string; page: string }>;
}) {
  const { category, page } = await params;
  const n = Number(page);
  if (!Number.isInteger(n) || n < 2) notFound();
  return <ArchiveView kind="category" slug={category} page={n} />;
}
