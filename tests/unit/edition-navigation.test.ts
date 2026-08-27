import { describe, expect, it } from "vitest";
import {
  buildEditionIndex,
  pickFurtherReading,
} from "../../lib/content/edition-navigation";

type Entry = {
  slug: string;
  publishDate: string | null;
  revista?: { sys: { id: string } } | null;
};

const post = (
  slug: string,
  publishDate: string | null,
  revistaId?: string,
): Entry => ({
  slug,
  publishDate,
  revista: revistaId ? { sys: { id: revistaId } } : null,
});

describe("buildEditionIndex", () => {
  it("orders an edition oldest first, whatever order the links arrive in", () => {
    const { sequences } = buildEditionIndex([
      post("tercero", "2024-03-07", "ed1"),
      post("primero", "2024-03-01", "ed1"),
      post("segundo", "2024-03-04", "ed1"),
    ]);

    expect(sequences.get("ed1")?.map((e) => e.slug)).toEqual([
      "primero",
      "segundo",
      "tercero",
    ]);
  });

  it("breaks a same-day tie on the slug, so the order is stable across builds", () => {
    const forwards = buildEditionIndex([
      post("beta", "2024-03-05", "ed1"),
      post("alfa", "2024-03-05", "ed1"),
    ]);
    const backwards = buildEditionIndex([
      post("alfa", "2024-03-05", "ed1"),
      post("beta", "2024-03-05", "ed1"),
    ]);

    expect(forwards.sequences.get("ed1")?.map((e) => e.slug)).toEqual(["alfa", "beta"]);
    expect(backwards.sequences.get("ed1")?.map((e) => e.slug)).toEqual(["alfa", "beta"]);
  });

  it("records each article's position in its own edition", () => {
    const { placements } = buildEditionIndex([
      post("uno", "2024-03-01", "ed1"),
      post("dos", "2024-03-02", "ed1"),
      post("otro", "2021-04-01", "ed2"),
    ]);

    expect(placements.get("dos")).toEqual({ revistaId: "ed1", index: 1 });
    expect(placements.get("otro")).toEqual({ revistaId: "ed2", index: 0 });
  });

  it("keeps editions apart when they share a stored slug", () => {
    // Two "La Oración" editions (2010 and 2014) carry the identical stored
    // slug; only the entry id tells them apart.
    const { sequences, placements } = buildEditionIndex([
      post("oracion-vieja", "2010-05-01", "oracion-2010"),
      post("oracion-nueva", "2014-05-01", "oracion-2014"),
    ]);

    expect(sequences.size).toBe(2);
    expect(placements.get("oracion-vieja")?.revistaId).toBe("oracion-2010");
    expect(placements.get("oracion-nueva")?.revistaId).toBe("oracion-2014");
  });

  it("leaves out articles with no edition and articles with no publish date", () => {
    const { sequences, placements } = buildEditionIndex([
      post("suelto", "2024-03-01"),
      post("sin-fecha", null, "ed1"),
      post("valido", "2024-03-02", "ed1"),
    ]);

    expect(sequences.get("ed1")?.map((e) => e.slug)).toEqual(["valido"]);
    expect(placements.has("suelto")).toBe(false);
    expect(placements.has("sin-fecha")).toBe(false);
  });
});

describe("pickFurtherReading", () => {
  const sequence = ["a", "b", "c", "d", "e", "f"];

  it("continues past the article and past the two offered as previous/next", () => {
    // On "c" (index 2), "b" and "d" are already the previous/next links.
    expect(pickFurtherReading(sequence, 2, 3)).toEqual(["e", "f", "a"]);
  });

  it("wraps to the top of the edition rather than running short at the end", () => {
    expect(pickFurtherReading(sequence, 5, 3)).toEqual(["a", "b", "c"]);
  });

  it("returns nothing for an edition of one", () => {
    expect(pickFurtherReading(["solo"], 0, 3)).toEqual([]);
  });

  it("never repeats an article when the edition is shorter than the ask", () => {
    const picks = pickFurtherReading(["a", "b", "c"], 1, 3);
    expect(picks).toEqual([]);
    expect(new Set(picks).size).toBe(picks.length);
  });
});
