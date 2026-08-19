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
});
