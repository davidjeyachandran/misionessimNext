import { describe, expect, it } from "vitest";
import { markdownToRichText } from "../../scripts/lib/markdown-to-richtext";

describe("markdownToRichText", () => {
  it("converts a plain paragraph", () => {
    const doc = markdownToRichText("Hola mundo, esto es un párrafo.");
    expect(doc).toEqual({
      nodeType: "document",
      data: {},
      content: [
        {
          nodeType: "paragraph",
          data: {},
          content: [
            { nodeType: "text", data: {}, value: "Hola mundo, esto es un párrafo.", marks: [] },
          ],
        },
      ],
    });
  });

  it("converts headings h1 through h4 (the levels present in the corpus)", () => {
    for (const [level, prefix] of [
      [1, "#"],
      [2, "##"],
      [3, "###"],
      [4, "####"],
    ] as const) {
      const doc = markdownToRichText(`${prefix} Título`);
      expect(doc.content[0].nodeType).toBe(`heading-${level}`);
      expect(doc.content[0].content?.[0].value).toBe("Título");
    }
  });

  it("converts bold and italic marks", () => {
    const doc = markdownToRichText("Esto es **negrita** y esto es *cursiva*.");
    const para = doc.content[0];
    expect(para.nodeType).toBe("paragraph");
    const values = para.content!.map((n) => ({ value: n.value, marks: n.marks }));
    expect(values).toEqual([
      { value: "Esto es ", marks: [] },
      { value: "negrita", marks: [{ type: "bold" }] },
      { value: " y esto es ", marks: [] },
      { value: "cursiva", marks: [{ type: "italic" }] },
      { value: ".", marks: [] },
    ]);
  });

  it("converts links to hyperlink nodes", () => {
    const doc = markdownToRichText("Escríbenos a [este correo](mailto:x@y.com) por favor.");
    const para = doc.content[0];
    const link = para.content!.find((n) => n.nodeType === "hyperlink");
    expect(link).toBeDefined();
    expect(link!.data.uri).toBe("mailto:x@y.com");
    expect(link!.content![0].value).toBe("este correo");
  });

  it("converts inline images to hyperlink nodes (asset-embedding happens at live-import time)", () => {
    const doc = markdownToRichText("Mira esta foto: ![una foto](https://example.com/x.jpg)");
    const para = doc.content[0];
    const link = para.content!.find((n) => n.nodeType === "hyperlink");
    expect(link!.data.uri).toBe("https://example.com/x.jpg");
    expect(link!.content![0].value).toBe("una foto");
  });

  it("converts a bullet list (both - and * markers)", () => {
    const doc = markdownToRichText("- Primero\n- Segundo\n- Tercero");
    expect(doc.content[0].nodeType).toBe("unordered-list");
    expect(doc.content[0].content).toHaveLength(3);
    expect(doc.content[0].content![1].content![0].content![0].value).toBe("Segundo");
  });

  it("converts an ordered list", () => {
    const doc = markdownToRichText("1. Uno\n2. Dos\n3. Tres");
    expect(doc.content[0].nodeType).toBe("ordered-list");
    expect(doc.content[0].content).toHaveLength(3);
  });

  it("merges blank-line-separated ordered-list items into one continuous list (real bug: 12-puntos-a-tomar-en-cuenta-para-ministrar-comunidades.md rendered as 12 separate 1-item lists before this fix)", () => {
    const doc = markdownToRichText(
      "1. Primer punto largo.\n\n2. Segundo punto largo.\n\n3. Tercer punto largo.",
    );
    expect(doc.content).toHaveLength(1);
    expect(doc.content[0].nodeType).toBe("ordered-list");
    expect(doc.content[0].content).toHaveLength(3);
    expect(doc.content[0].content![2].content![0].content![0].value).toBe(
      "Tercer punto largo.",
    );
  });

  it("merges blank-line-separated unordered-list items too", () => {
    const doc = markdownToRichText("- Uno\n\n- Dos\n\n- Tres");
    expect(doc.content).toHaveLength(1);
    expect(doc.content[0].nodeType).toBe("unordered-list");
    expect(doc.content[0].content).toHaveLength(3);
  });

  it("handles turndown's backslash-escaped list markers (found 113x ordered, 7x bullet in the corpus — e.g. the final item of a numbered list often renders as '12\\. Texto')", () => {
    const ordered = markdownToRichText("1. Uno\n\n2. Dos\n\n12\\. Doce");
    expect(ordered.content).toHaveLength(1);
    expect(ordered.content[0].nodeType).toBe("ordered-list");
    expect(ordered.content[0].content).toHaveLength(3);
    expect(ordered.content[0].content![2].content![0].content![0].value).toBe(
      "Doce",
    );

    const bullet = markdownToRichText("- Uno\n\n\\- Dos");
    expect(bullet.content[0].nodeType).toBe("unordered-list");
    expect(bullet.content[0].content).toHaveLength(2);
  });

  it("does not merge a list separated by an intervening paragraph", () => {
    const doc = markdownToRichText("1. Uno\n\nUn párrafo en medio.\n\n1. Otro punto");
    expect(doc.content).toHaveLength(3);
    expect(doc.content[0].nodeType).toBe("ordered-list");
    expect(doc.content[1].nodeType).toBe("paragraph");
    expect(doc.content[2].nodeType).toBe("ordered-list");
  });

  it("converts a blockquote, joining wrapped lines", () => {
    const doc = markdownToRichText("> Primera línea\n> segunda línea");
    expect(doc.content[0].nodeType).toBe("blockquote");
    expect(doc.content[0].content![0].content![0].value).toBe(
      "Primera línea segunda línea",
    );
  });

  it("handles multiple blocks in sequence", () => {
    const doc = markdownToRichText(
      "## Encabezado\n\nUn párrafo normal.\n\n- Item uno\n- Item dos",
    );
    expect(doc.content).toHaveLength(3);
    expect(doc.content[0].nodeType).toBe("heading-2");
    expect(doc.content[1].nodeType).toBe("paragraph");
    expect(doc.content[2].nodeType).toBe("unordered-list");
  });

  it("joins wrapped paragraph lines (turndown wraps long lines) into one logical paragraph", () => {
    const doc = markdownToRichText("Esta es una línea\nque continúa aquí.");
    expect(doc.content).toHaveLength(1);
    expect(doc.content[0].content![0].value).toBe(
      "Esta es una línea que continúa aquí.",
    );
  });

  describe("underscore italic (_text_ — turndown's default emDelimiter)", () => {
    it("converts _text_ to italic", () => {
      const doc = markdownToRichText("_Sara, sirviendo en el Norte de África._");
      const para = doc.content[0];
      expect(para.nodeType).toBe("paragraph");
      const italic = para.content!.find((n) => n.marks?.some((m) => m.type === "italic"));
      expect(italic?.value).toBe("Sara, sirviendo en el Norte de África.");
    });

    it("converts _**bold inside italic**_ (nested marks)", () => {
      const doc = markdownToRichText("_**Chris, directora de VAMOS**_");
      const para = doc.content[0];
      const node = para.content!.find(
        (n) => n.marks?.some((m) => m.type === "bold") && n.marks?.some((m) => m.type === "italic"),
      );
      expect(node?.value).toBe("Chris, directora de VAMOS");
    });

    it("lone _ without closing _ is treated as literal text", () => {
      const doc = markdownToRichText("precio_fijo sin cierre");
      expect(doc.content[0].content![0].value).toBe("precio_fijo sin cierre");
    });
  });

  describe("links inside emphasis and vice versa", () => {
    it("parses a link inside bold: **[text](url)**", () => {
      const doc = markdownToRichText("Ver **[MOVIDA](https://instagram.com/movidaint)** aquí.");
      const para = doc.content[0];
      const link = para.content!.find((n) => n.nodeType === "hyperlink");
      expect(link).toBeDefined();
      expect(link!.data.uri).toBe("https://instagram.com/movidaint");
      expect(link!.content![0].marks).toEqual([{ type: "bold" }]);
    });

    it("parses bold+italic inside link text: [**_text_.**](url)", () => {
      const doc = markdownToRichText("[**_El Clamor Macedonio_.**](https://example.com/)");
      const para = doc.content[0];
      const link = para.content!.find((n) => n.nodeType === "hyperlink");
      expect(link).toBeDefined();
      const boldItalic = link!.content!.find(
        (n) =>
          n.marks?.some((m) => m.type === "bold") &&
          n.marks?.some((m) => m.type === "italic"),
      );
      expect(boldItalic?.value).toBe("El Clamor Macedonio");
    });

    it("parses bold inside link text: [**aquí.**](url)", () => {
      const doc = markdownToRichText("[**aquí.**](https://bit.ly/x)");
      const para = doc.content[0];
      const link = para.content!.find((n) => n.nodeType === "hyperlink");
      expect(link).toBeDefined();
      const bold = link!.content!.find((n) => n.marks?.some((m) => m.type === "bold"));
      expect(bold?.value).toBe("aquí.");
    });
  });

  describe("escaped asterisks as literal characters (pseudonym footnotes)", () => {
    it("treats \\* as a literal asterisk, not an italic delimiter", () => {
      const doc = markdownToRichText("Laura\\* es un pseudónimo.");
      const para = doc.content[0];
      para.content!.forEach((n) => {
        expect(n.marks?.some((m) => m.type === "italic")).toBeFalsy();
      });
      const fullText = para.content!.map((n) => n.value ?? "").join("");
      expect(fullText).toContain("Laura*");
    });

    it("treats \\_ as a literal underscore, not italic delimiter", () => {
      const doc = markdownToRichText("view\\_mode");
      expect(doc.content[0].content![0].value).toBe("view_mode");
    });
  });

  describe("GFM pipe tables", () => {
    it("converts a pipe table to a Contentful table node", () => {
      const md = "| Col A | Col B |\n| --- | --- |\n| cell 1 | cell 2 |";
      const doc = markdownToRichText(md);
      expect(doc.content[0].nodeType).toBe("table");
      const rows = doc.content[0].content!;
      expect(rows).toHaveLength(2);
      expect(rows[0].nodeType).toBe("table-row");
      expect(rows[0].content![0].nodeType).toBe("table-header-cell");
      expect(rows[0].content![0].content![0].content![0].value).toBe("Col A");
      expect(rows[1].content![0].nodeType).toBe("table-cell");
      expect(rows[1].content![0].content![0].content![0].value).toBe("cell 1");
    });

    it("handles a table with no separator (all rows become body cells)", () => {
      const md = "| A | B |\n| 1 | 2 |";
      const doc = markdownToRichText(md);
      expect(doc.content[0].nodeType).toBe("table");
      // No separator → isHeader never flips to false after first row
      expect(doc.content[0].content![0].content![0].nodeType).toBe("table-header-cell");
    });
  });

  describe("markdown backslash escapes (turndown escapes prose punctuation)", () => {
    it("strips the escape from numbered-prefix headings (found live in Contentful as '1\\. Organiza una reunión')", () => {
      const doc = markdownToRichText("#### 1\\. Organiza una reunión para ver un partido");
      expect(doc.content[0].nodeType).toBe("heading-4");
      expect(doc.content[0].content![0].value).toBe(
        "1. Organiza una reunión para ver un partido",
      );
    });

    it("strips escaped underscores and brackets in paragraph text", () => {
      const doc = markdownToRichText("Texto con view\\_mode y \\[corchetes\\] literales.");
      expect(doc.content[0].content![0].value).toBe(
        "Texto con view_mode y [corchetes] literales.",
      );
    });

    it("strips escapes inside list item text, not just the marker", () => {
      const doc = markdownToRichText("1\\. Punto uno \\(detalle\\)");
      expect(doc.content[0].nodeType).toBe("ordered-list");
      expect(doc.content[0].content![0].content![0].content![0].value).toBe(
        "Punto uno (detalle)",
      );
    });

    it("leaves a lone backslash before a non-escapable character untouched", () => {
      const doc = markdownToRichText("Ruta C:\\Windows normal.");
      expect(doc.content[0].content![0].value).toBe("Ruta C:\\Windows normal.");
    });
  });
});
