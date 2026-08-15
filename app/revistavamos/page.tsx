import type { Metadata } from "next";
import { RevistaIndexView } from "@/app/revistavamos/_components/RevistaIndexView";

export const metadata: Metadata = {
  title: "Revista VAMOS",
  description:
    "Una revista con pasión por las misiones. Más de 110 ediciones publicadas en formato digital y gratis.",
  alternates: { canonical: "/revistavamos/" },
};

export default function RevistaIndexPage() {
  return <RevistaIndexView page={1} />;
}
