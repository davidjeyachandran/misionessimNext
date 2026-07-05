import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogIndexView, blogTotalPages } from "@/app/blog/_components/BlogIndexView";

export async function generateStaticParams() {
  const totalPages = await blogTotalPages();
  const params: { page: string }[] = [];
  for (let n = 2; n <= totalPages; n++) params.push({ page: String(n) });
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const { page } = await params;
  return {
    title: `Blog — Página ${page}`,
    description: "Artículos sobre misiones, fe y servicio de SIM Latinoamérica.",
    alternates: { canonical: `/blog/page/${page}/` },
  };
}

export default async function BlogIndexPaged({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  const n = Number(page);
  if (!Number.isInteger(n) || n < 2) notFound();
  return <BlogIndexView page={n} />;
}
