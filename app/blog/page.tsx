import type { Metadata } from "next";
import { BlogIndexView } from "./_components/BlogIndexView";

export const metadata: Metadata = {
  title: "Blog",
  description: "Artículos sobre misiones, fe y servicio de SIM Latinoamérica.",
  alternates: { canonical: "/blog/" },
};

export default function BlogIndexPage() {
  return <BlogIndexView page={1} />;
}
