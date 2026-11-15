import { describe, expect, it } from "vitest";
import { buildBlogCatalogue } from "../../lib/content/blog-catalogue";

describe("published Blog catalogue", () => {
  it("publishes the richer entry for title-equivalent articles", () => {
    const catalogue = buildBlogCatalogue([
      {
        slug: "abuelas-a-distancia",
        title: "Abuelas a distancia",
        publishDate: "2020-01-01T00:00:00Z",
        description: "Una versión importada desde WordPress.",
        categories: ["Familia"],
        author: "SIM Latinoamérica",
      },
      {
        slug: "abuelas-distancia",
        title: "Abuelas, a distancia",
        publishDate: "2020-01-01T00:00:00Z",
        description: "Una versión vinculada a la revista.",
        heroImage: { url: "https://images.ctfassets.net/example/abuelas.jpg" },
        revista: { slug: "/familia", title: "Familia" },
      },
    ]);

    expect(catalogue).toHaveLength(1);
    expect(catalogue[0]).toMatchObject({
      slug: "abuelas-distancia",
      title: "Abuelas, a distancia",
    });
  });

  it("drops a retired duplicate and hands its revista link to the survivor", () => {
    const catalogue = buildBlogCatalogue([
      {
        slug: "requisitos-y-pasos-para-ser-misionero",
        title: "Cómo ir al campo misionero: pasos, requisitos y preparación",
        publishDate: "2019-10-11T00:00:00Z",
      },
      {
        slug: "requisitos-y-pasos-para-ser-misionero-0",
        title: "Requisitos y pasos para ser misionero",
        publishDate: "2019-10-11T00:00:00Z",
        revista: { slug: "/la-capacitacion-misionera", title: "La capacitación misionera" },
      },
    ]);

    expect(catalogue).toHaveLength(1);
    expect(catalogue[0]).toMatchObject({
      slug: "requisitos-y-pasos-para-ser-misionero",
      revista: { slug: "/la-capacitacion-misionera" },
    });
  });
});
