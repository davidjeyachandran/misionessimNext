import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  RevistaIndexView,
  revistaTotalPages,
} from "@/app/revistavamos/_components/RevistaIndexView";

export async function generateStaticParams() {
  const totalPages = await revistaTotalPages();
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
    title: `Revista VAMOS — Página ${page}`,
    description:
      "Una revista con pasión por las misiones. Más de 110 ediciones publicadas en formato digital y gratis.",
    alternates: { canonical: `/revistavamos/page/${page}/` },
  };
}

export default async function RevistaIndexPaged({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  const n = Number(page);
  if (!Number.isInteger(n) || n < 2) notFound();
  return <RevistaIndexView page={n} />;
}
