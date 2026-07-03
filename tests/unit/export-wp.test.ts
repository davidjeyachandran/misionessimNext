import { describe, expect, it } from "vitest";
import {
  cleanMojibake,
  decodeHtmlEntities,
  stripDrupalMediaTokens,
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

describe("stripDrupalMediaTokens", () => {
  // Real sample, in its actual post-turndown markdown form (brackets
  // backslash-escaped, including inside the payload) — from
  // 10-devocionales-en-youversion-sobre-trabajo-y-fe.md, the one post out
  // of 335 with this leftover Drupal Media module embed token. `fid: 3200`
  // is a Drupal file ID with no recoverable target.
  const REAL_TOKEN =
    '\\[\\[{“fid”:”3200″,”view\\_mode”:”default”,”fields”:{“format”:”default”,”alignment”:”center”,”field\\_file\\_image\\_alt\\_text\\[und\\]\\[0\\]\\[value\\]”:false,”field\\_file\\_image\\_title\\_text\\[und\\]\\[0\\]\\[value\\]”:false},”type”:”media”,”field\\_deltas”:{“1”:{“format”:”default”,”alignment”:”center”,”field\\_file\\_image\\_alt\\_text\\[und\\]\\[0\\]\\[value\\]”:false,”field\\_file\\_image\\_title\\_text\\[und\\]\\[0\\]\\[value\\]”:false}},”link\\_text”:null,”attributes”:{“height”:174,”width”:1000,”class”:”media-element file-default media-wysiwyg-align-center”,”data-delta”:”1″}}\\]\\]';

  it("strips the real corrupted token sampled from the live site", () => {
    const before = `5. Fe y trabajo\n\n${REAL_TOKEN}\n\n6. Hacer negocios de manera sobrenatural`;
    const after = stripDrupalMediaTokens(before);
    expect(after).not.toContain("fid");
    expect(after).not.toContain("view_mode");
    expect(after).toContain("5. Fe y trabajo");
    expect(after).toContain("6. Hacer negocios de manera sobrenatural");
  });

  it("handles a token with unescaped brackets too (defensive — in case a future post isn't turndown-escaped the same way)", () => {
    const before = 'antes [[{"fid":"99","type":"media","x":1}]] despues';
    const after = stripDrupalMediaTokens(before);
    expect(after).not.toContain("fid");
    expect(after).toContain("antes");
    expect(after).toContain("despues");
  });

  it("is a no-op on text with no Drupal tokens", () => {
    const text = "Texto normal con [un enlace](https://example.com) y nada más.";
    expect(stripDrupalMediaTokens(text)).toBe(text);
  });

  it("does not strip unrelated bracket/brace text", () => {
    const text = "Un array [1, 2, 3] y un objeto {a: 1} normales.";
    expect(stripDrupalMediaTokens(text)).toBe(text);
  });
});
