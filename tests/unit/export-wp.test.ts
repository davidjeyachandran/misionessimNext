import { describe, expect, it } from "vitest";
import {
  cleanMojibake,
  decodeHtmlEntities,
  stripHtml,
} from "../../scripts/export-wp";

describe("cleanMojibake", () => {
  it("fixes broken smart quotes from the real WP mojibake bug (§2.5)", () => {
    // Actual corrupted text sampled from misionessim.org/blog/2017-07/un-ministerio-sin-igual/
    const broken =
      "\x93La muerte de Cristo en la cruz fue por toda la humanidad\x94, dijo Pablo.";
    expect(cleanMojibake(broken)).toBe(
      "“La muerte de Cristo en la cruz fue por toda la humanidad”, dijo Pablo.",
    );
  });

  it("fixes single quotes, dashes, and ellipsis", () => {
    expect(cleanMojibake("\x91test\x92")).toBe("‘test’");
    expect(cleanMojibake("2017\x962020")).toBe("2017–2020");
    expect(cleanMojibake("espera\x97y ora")).toBe("espera—y ora");
    expect(cleanMojibake("bueno\x85")).toBe("bueno…");
  });

  it("leaves properly-encoded Spanish text untouched", () => {
    const clean =
      "La oración y la evangelización son fundamentales en misiones. ¿Cómo podemos servir?";
    expect(cleanMojibake(clean)).toBe(clean);
  });

  it("leaves accented characters (ñ, á, é, í, ó, ú, ü) untouched", () => {
    const accented = "años, corazón, así, también, José, único, Perú, güey";
    expect(cleanMojibake(accented)).toBe(accented);
  });

  it("is a no-op on text with no mojibake", () => {
    const text = "Texto completamente normal sin problemas.";
    expect(cleanMojibake(text)).toBe(text);
  });
});

describe("stripHtml", () => {
  it("removes tags and trims whitespace", () => {
    expect(stripHtml("<p>Hola <strong>mundo</strong></p>\n")).toBe(
      "Hola mundo",
    );
  });

  it("handles nested and self-closing tags", () => {
    expect(stripHtml('<div><p>Texto</p><br/><img src="x.jpg"/></div>')).toBe(
      "Texto",
    );
  });

  it("returns empty string for empty input", () => {
    expect(stripHtml("")).toBe("");
  });

  it("decodes WP's excerpt truncation marker (found in ~320/335 exported files)", () => {
    expect(stripHtml("<p>Texto truncado [&hellip;]</p>")).toBe(
      "Texto truncado […]",
    );
  });
});

describe("decodeHtmlEntities", () => {
  it("decodes common named entities", () => {
    expect(decodeHtmlEntities("&amp; &lt; &gt; &quot;")).toBe('& < > "');
    expect(decodeHtmlEntities("a&nbsp;b")).toBe("a b");
  });

  it("decodes numeric and hex entities", () => {
    expect(decodeHtmlEntities("&#241; &#xf1;")).toBe("ñ ñ"); // both encode ñ
  });

  it("leaves unknown entities untouched rather than dropping them", () => {
    expect(decodeHtmlEntities("&unknownentity;")).toBe("&unknownentity;");
  });

  it("is a no-op on text with no entities", () => {
    const text = "Texto normal sin entidades.";
    expect(decodeHtmlEntities(text)).toBe(text);
  });
});
