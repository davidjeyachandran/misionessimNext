import { describe, expect, it } from "vitest";
import { buildRevistaCatalogue } from "../../lib/content/revista-catalogue";

describe("published Revista catalogue", () => {
  it("keeps the newest edition at the base path when stored slugs collide", () => {
    const catalogue = buildRevistaCatalogue([
      {
        id: "oracion-2010",
        slug: "/la-oracion",
        title: "La Oración",
        fecha: "2010-01-01T00:00:00Z",
      },
      {
        id: "oracion-2014",
        slug: "/la-oracion",
        title: "La Oración",
        fecha: "2014-01-01T00:00:00Z",
      },
    ]);

    expect(catalogue.map((revista) => revista.slug)).toEqual([
      "la-oracion",
      "la-oracion-2010",
    ]);
  });
});
