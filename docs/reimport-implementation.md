# Re-import implementation notes

Status: **PLANNED, not implemented.** This picks up from `reimport-plan.md`.
The 10-post audit is done; all changes below are needed before re-running the import.

---

## Key findings from the markdown corpus

Images in the export are each in **their own blank-line-separated paragraph**:
```
![](https://misionessim.org/wp-content/uploads/2025/09/WhatsApp-Image-…-1024x768.jpeg)
```
Empty alt (turndown strips alt from WP `<figure>` blocks). This means the
`hyperlink` node for each image is the **sole content of its paragraph** — so we can
safely promote it to a full `embedded-asset-block` (not inline) during import.

---

## Phase A — Pipeline fixes

### A1. `scripts/export-wp.ts`

Add turndown rules BEFORE the `main()` call (after the existing `turndown` setup):

```typescript
// 1. Tables → GFM pipe format
// Rules fire depth-first so cell → row → table order works naturally.
turndown.addRule("table-cell", {
  filter: ["th", "td"],
  replacement: (content) =>
    ` ${content.replace(/\n+/g, " ").replace(/\|/g, "\\|").trim()} |`,
});

turndown.addRule("table-row", {
  filter: "tr",
  replacement: (content, node) => {
    const row = `|${content}\n`;
    const hasHeaders = Array.from((node as Element).children).some(
      (c) => c.nodeName === "TH",
    );
    if (hasHeaders) {
      const cellCount = (content.match(/ \|/g) ?? []).length;
      return row + `|${" --- |".repeat(cellCount)}\n`;
    }
    return row;
  },
});

turndown.addRule("table-block", {
  filter: ["table", "thead", "tbody", "tfoot"],
  replacement: (content) => `\n\n${content}\n\n`,
});

// 2. iframes (YouTube/video embeds) → [video](url) link
turndown.addRule("iframe", {
  filter: "iframe",
  replacement: (_content, node) => {
    const src = (node as Element).getAttribute("src") ?? "";
    return src ? `\n\n[video](${src})\n\n` : "";
  },
});
```

### A2. `scripts/lib/markdown-to-richtext.ts`

Full rewrite of the inline parser. Replace the current `parseInline` function
(and the `pattern` regex approach) with an escape-aware recursive descent parser.
Also add GFM pipe-table block detection.

#### New `ESCAPABLE_CHARS` constant (near top of file):
```typescript
const ESCAPABLE_CHARS = new Set(['\\','`','*','_','{','}','[',']','(',')',
  '#','+','-','.','!','>','|','~']);
```

#### Replace `parseInline` with this two-function implementation:

```typescript
// Public export kept for backward compat; delegates to the recursive core.
function parseInline(text: string): RichTextNode[] {
  return parseInlineCore(text, [], true);
}

/**
 * Escape-aware recursive descent inline parser.
 *
 * marks     — marks inherited from the outer bold/italic context
 * canLink   — false when inside link text (no nested links)
 *
 * Handles: \X escapes, ![img](url), [link](url), **bold**, *italic*, _italic_
 * Nested: **[link](url)**, [**bold** _italic_](url), _**bold+italic**_
 * Safe: \* and \_ never open/close emphasis spans.
 */
function parseInlineCore(
  text: string,
  marks: RichTextMark[],
  canLink: boolean,
): RichTextNode[] {
  const nodes: RichTextNode[] = [];
  let i = 0;
  let plain = "";

  const flush = () => {
    if (plain) {
      nodes.push({ nodeType: "text", data: {}, value: plain, marks });
      plain = "";
    }
  };

  while (i < text.length) {
    const ch = text[i];

    // Backslash escape — highest priority, prevents \* \_ from opening spans.
    if (ch === "\\" && i + 1 < text.length && ESCAPABLE_CHARS.has(text[i + 1])) {
      plain += text[i + 1];
      i += 2;
      continue;
    }

    // Image: ![alt](url)  — must check before link (both start with '[')
    if (ch === "!" && text[i + 1] === "[") {
      const m = /^!\[([^\]]*)\]\(([^)]+)\)/.exec(text.slice(i));
      if (m) {
        flush();
        nodes.push({
          nodeType: "hyperlink",
          data: { uri: m[2] },
          content: [{ nodeType: "text", data: {}, value: m[1] || "imagen", marks: [] }],
        });
        i += m[0].length;
        continue;
      }
    }

    // Link: [text](url)
    if (canLink && ch === "[") {
      const m = /^\[([^\]]*)\]\(([^)]+)\)/.exec(text.slice(i));
      if (m) {
        flush();
        const inner = parseInlineCore(m[1], marks, false);
        nodes.push({
          nodeType: "hyperlink",
          data: { uri: m[2] },
          content: inner.length ? inner : [{ nodeType: "text", data: {}, value: "", marks }],
        });
        i += m[0].length;
        continue;
      }
    }

    // Bold: **text**
    if (ch === "*" && text[i + 1] === "*") {
      const rest = text.slice(i + 2);
      const end = rest.indexOf("**");
      if (end !== -1) {
        flush();
        const boldMark: RichTextMark = { type: "bold" };
        const newMarks = marks.some((m) => m.type === "bold")
          ? marks
          : [...marks, boldMark];
        nodes.push(...parseInlineCore(rest.slice(0, end), newMarks, canLink));
        i += 4 + end;
        continue;
      }
      plain += "**";
      i += 2;
      continue;
    }

    // Italic: *text* (single, not **)
    if (ch === "*") {
      const rest = text.slice(i + 1);
      let end = -1;
      for (let j = 0; j < rest.length; j++) {
        if (rest[j] === "*" && (j === rest.length - 1 || rest[j + 1] !== "*")) {
          end = j;
          break;
        }
      }
      if (end > 0) {
        flush();
        const italicMark: RichTextMark = { type: "italic" };
        const newMarks = marks.some((m) => m.type === "italic")
          ? marks
          : [...marks, italicMark];
        nodes.push(...parseInlineCore(rest.slice(0, end), newMarks, canLink));
        i += 2 + end;
        continue;
      }
      plain += "*";
      i++;
      continue;
    }

    // Italic: _text_
    if (ch === "_") {
      const rest = text.slice(i + 1);
      const end = rest.indexOf("_");
      if (end > 0) {
        flush();
        const italicMark: RichTextMark = { type: "italic" };
        const newMarks = marks.some((m) => m.type === "italic")
          ? marks
          : [...marks, italicMark];
        nodes.push(...parseInlineCore(rest.slice(0, end), newMarks, canLink));
        i += 2 + end;
        continue;
      }
      plain += "_";
      i++;
      continue;
    }

    plain += ch;
    i++;
  }

  flush();
  if (nodes.length === 0) {
    nodes.push({ nodeType: "text", data: {}, value: "", marks });
  }
  return nodes;
}
```

**Also remove `unescapeMarkdown()` from `textNode`** — the new parser handles
escapes in-loop. Keep `unescapeMarkdown` as an exported function (used independently)
but change `textNode` to just:
```typescript
function textNode(value: string, marks: RichTextMark[] = []): RichTextNode {
  return { nodeType: "text", data: {}, value, marks };
}
```

#### Add GFM pipe-table detection to `markdownToRichText`:

Add these helpers before `markdownToRichText`:

```typescript
const TABLE_LINE_RE = /^\|.+\|$/;

function isTableBlock(lines: string[]): boolean {
  return lines.length >= 2 && lines.every((l) => TABLE_LINE_RE.test(l.trim()));
}

function isSeparatorLine(line: string): boolean {
  return line.trim().slice(1, -1).split("|").every((c) => /^[\s\-:]+$/.test(c));
}

function parseTableBlock(lines: string[]): RichTextNode {
  let isHeader = true;
  const rows: RichTextNode[] = [];
  for (const line of lines) {
    if (isSeparatorLine(line)) { isHeader = false; continue; }
    const cells = line.trim().slice(1, -1).split("|").map((c) => c.trim());
    rows.push({
      nodeType: "table-row",
      data: {},
      content: cells.map((text) => ({
        nodeType: isHeader ? "table-header-cell" : "table-cell",
        data: {},
        content: [paragraph(text)],
      })),
    });
  }
  return { nodeType: "table", data: {}, content: rows };
}
```

In `markdownToRichText`, add the table check as the **first** branch in the
for-loop over blocks (before `headingMatch`):

```typescript
if (isTableBlock(lines)) {
  content.push(parseTableBlock(lines));
} else if (headingMatch && lines.length === 1) {
  // ... existing heading handling
}
```

#### Update tests (`tests/unit/markdown-to-richtext.test.ts`) — add:

```typescript
it("converts _underscore_ italic (turndown default emDelimiter)", () => {
  const doc = markdownToRichText("_Sara, sirviendo en el Norte de África._");
  const para = doc.content[0];
  expect(para.nodeType).toBe("paragraph");
  const italic = para.content!.find(n => n.marks?.some(m => m.type === "italic"));
  expect(italic?.value).toBe("Sara, sirviendo en el Norte de África.");
});

it("parses a link inside bold: **[text](url)**", () => {
  const doc = markdownToRichText("Ver **[MOVIDA](https://instagram.com/movidaint)** aquí.");
  const para = doc.content[0];
  const link = para.content!.find(n => n.nodeType === "hyperlink");
  expect(link).toBeDefined();
  expect(link!.data.uri).toBe("https://instagram.com/movidaint");
  expect(link!.content![0].marks).toEqual([{ type: "bold" }]);
});

it("parses bold+italic inside link text: [**_text_.**](url)", () => {
  const doc = markdownToRichText("[**_El Clamor Macedonio_.**](https://example.com/)");
  const para = doc.content[0];
  const link = para.content!.find(n => n.nodeType === "hyperlink");
  expect(link).toBeDefined();
  const boldItalic = link!.content!.find(n =>
    n.marks?.some(m => m.type === "bold") && n.marks?.some(m => m.type === "italic")
  );
  expect(boldItalic?.value).toBe("El Clamor Macedonio");
});

it("treats \\* as a literal asterisk, not italic delimiter", () => {
  const doc = markdownToRichText("Laura\\* es un pseudónimo.");
  const para = doc.content[0];
  // All content should be plain text — no italic marks
  para.content!.forEach(n => {
    expect(n.marks?.some(m => m.type === "italic")).toBe(false);
  });
  const fullText = para.content!.map(n => n.value ?? "").join("");
  expect(fullText).toContain("Laura*");
});

it("converts a GFM pipe table to a table node", () => {
  const md = "| Col A | Col B |\n| --- | --- |\n| cell 1 | cell 2 |";
  const doc = markdownToRichText(md);
  expect(doc.content[0].nodeType).toBe("table");
  expect(doc.content[0].content![0].nodeType).toBe("table-row");
  expect(doc.content[0].content![0].content![0].nodeType).toBe("table-header-cell");
  expect(doc.content[0].content![1].content![0].nodeType).toBe("table-cell");
});
```

---

### A3. `scripts/import-cms.ts`

Three changes: (1) excerpt cleanup, (2) internal link rewriting, (3) inline image upload.

#### 1. Excerpt cleanup — strip trailing `[…]`

In `runLive`, where the `description` field is set (line ~251):
```typescript
// Before:
description: { "en-US": plan.fields.excerpt || plan.fields.title },
// After:
description: { "en-US": cleanExcerpt(plan.fields.excerpt) || plan.fields.title },
```

Add this helper near the top:
```typescript
function cleanExcerpt(excerpt: string): string {
  return excerpt.replace(/\s*\[…\]\s*$/, "").trim();
}
```

#### 2. Internal link rewriting — run on the body after `markdownToRichText`

In `buildPlan`, after `body: markdownToRichText(content)`:
```typescript
body: rewriteInternalLinks(markdownToRichText(content)),
```

Add this helper:
```typescript
function rewriteInternalLinks(doc: ReturnType<typeof markdownToRichText>) {
  function walk(nodes: typeof doc.content): typeof doc.content {
    return nodes.map((node) => {
      if (node.nodeType === "hyperlink" && typeof node.data?.uri === "string") {
        let uri = node.data.uri as string;
        if (uri.startsWith("https://misionessim.org/")) {
          uri = uri.slice("https://misionessim.org".length);
        }
        if (uri.startsWith("/la-revista/")) {
          uri = uri.replace("/la-revista/", "/revistavamos/");
        }
        return { ...node, data: { uri }, content: node.content ? walk(node.content as any) : [] };
      }
      if (node.content) return { ...node, content: walk(node.content as any) };
      return node;
    });
  }
  return { ...doc, content: walk(doc.content) };
}
```

#### 3. Inline image upload — in `runLive`

Add to the `PostPlan` interface:
```typescript
inlineImages: Array<{ url: string; alt: string }>;
```

Add inline image extraction in `buildPlan` (after body conversion):
```typescript
function extractInlineImages(doc: ReturnType<typeof markdownToRichText>): Array<{ url: string; alt: string }> {
  const IMAGE_EXT = /\.(jpe?g|png|gif|webp|svg)(\?.*)?$/i;
  const seen = new Set<string>();
  const out: Array<{ url: string; alt: string }> = [];
  function walk(nodes: typeof doc.content) {
    for (const n of nodes) {
      if (n.nodeType === "hyperlink" && IMAGE_EXT.test(n.data?.uri as string ?? "")) {
        const url = n.data.uri as string;
        if (!seen.has(url)) {
          seen.add(url);
          out.push({ url, alt: (n.content?.[0] as any)?.value ?? "" });
        }
      }
      if (n.content) walk(n.content as any);
    }
  }
  walk(doc.content);
  return out;
}
```

In `runLive`, after the hero image upload but before writing fields:

```typescript
// Upload inline images and PDFs, replace body hyperlinks with asset nodes
const ASSET_URL_RE = /\.(jpe?g|png|gif|webp|svg|pdf)(\?.*)?$/i;
const urlToAssetId = new Map<string, string>();

for (const { url, alt } of plan.inlineImages) {
  try {
    const res = await fetch(url, { headers: { "user-agent": "misionessim-migration-bot/1.0" } });
    if (!res.ok) { console.warn(`  WARN: could not download ${url}: ${res.status}`); continue; }
    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") ?? "application/octet-stream";
    const fileName = url.split("/").pop()?.split("?")[0] ?? "image.jpg";
    const asset = await client.asset.createFromFiles(ctx, {
      fields: {
        title: { "en-US": alt || fileName },
        description: { "en-US": alt },
        file: { "en-US": { contentType, fileName, file: buffer } },
      },
    });
    const processed = await client.asset.processForAllLocales(ctx, asset);
    await client.asset.publish({ ...ctx, assetId: processed.sys.id }, processed);
    urlToAssetId.set(url, processed.sys.id);
    console.log(`  uploaded asset: ${fileName} → ${processed.sys.id}`);
  } catch (e) {
    console.warn(`  WARN: failed to upload ${url}: ${(e as Error).message}`);
  }
}

// Promote image hyperlink paragraphs to embedded-asset-block nodes
let body = plan.fields.body as any;
if (urlToAssetId.size > 0) {
  body = {
    ...body,
    content: body.content.map((node: any) => {
      if (
        node.nodeType === "paragraph" &&
        node.content?.length === 1 &&
        node.content[0].nodeType === "hyperlink" &&
        urlToAssetId.has(node.content[0].data?.uri)
      ) {
        return {
          nodeType: "embedded-asset-block",
          data: { target: { sys: { type: "Link", linkType: "Asset", id: urlToAssetId.get(node.content[0].data.uri) } } },
          content: [],
        };
      }
      return node;
    }),
  };
}
fields.body = { "en-US": body };  // overwrite the plain body with the patched one
```

---

## Phase B — App fixes

### B1. `lib/contentful.ts`

In `getBlogPostBySlug`, update the body selection (line ~320):
```graphql
# Before:
body { json }
# After:
body {
  json
  links {
    assets {
      block { sys { id } url title description width height }
    }
  }
}
```

Update the `BlogPost` interface:
```typescript
export interface BlogPost extends BlogPostCard {
  body?: {
    json: RichTextDocument;
    links?: {
      assets?: {
        block?: Array<{
          sys: { id: string };
          url: string;
          title?: string | null;
          description?: string | null;
          width?: number | null;
          height?: number | null;
        } | null>;
      };
    };
  } | null;
  // ...rest unchanged
}
```

### B2. `app/blog/[date]/[slug]/page.tsx`

**1. Remove the description lead paragraph** (the biggest visible fix):

Delete lines 185-189:
```tsx
{post.description && (
  <p className="mb-8 text-lg leading-relaxed text-muted border-l-4 border-cream pl-4">
    {post.description}
  </p>
)}
```

**2. Build asset map + update EMBEDDED_ASSET renderer**:

Replace the `EmbeddedAssetNode` interface + `BLOCKS.EMBEDDED_ASSET` renderer:
```typescript
// Build id→asset map from body.links
const assetMap = new Map<string, { url: string; title?: string | null }>();
for (const asset of post.body?.links?.assets?.block ?? []) {
  if (asset) assetMap.set(asset.sys.id, asset);
}

// In richTextOptions — update EMBEDDED_ASSET:
[BLOCKS.EMBEDDED_ASSET]: (node) => {
  const id = (node.data?.target as any)?.sys?.id as string | undefined;
  const asset = id ? assetMap.get(id) : undefined;
  if (!asset?.url) return null;
  return (
    <figure className="my-6">
      <Image
        src={asset.url}
        alt={asset.title ?? ""}
        width={800}
        height={450}
        className="rounded-md w-full object-cover"
      />
    </figure>
  );
},
```

But since `richTextOptions` is currently a `const`, you'll need to convert
`richTextOptions` to a factory function that closes over `assetMap`:
```typescript
function buildRichTextOptions(assetMap: Map<string, { url: string; title?: string | null }>): Options {
  return { renderMark: { ... }, renderNode: { ... /* all the same plus EMBEDDED_ASSET fix */ } };
}
// In the component:
const options = buildRichTextOptions(assetMap);
// Then: documentToReactComponents(post.body.json, options)
```

**3. HYPERLINK renderer — internal links + YouTube embeds**:

Replace the existing HYPERLINK renderer:
```typescript
[INLINES.HYPERLINK]: (node, children) => {
  const { uri } = (node as unknown as HyperlinkNode).data;
  
  // YouTube embed (emitted by the [video](url) turndown rule)
  if (uri.includes("youtube.com/embed/") && String(children) === "video") {
    return (
      <div className="relative my-6 aspect-video">
        <iframe
          src={uri}
          className="absolute inset-0 w-full h-full rounded-md"
          allowFullScreen
          title="Video"
        />
      </div>
    );
  }
  
  // Internal link (relative path or same-origin absolute)
  const isInternal = uri.startsWith("/") || uri.startsWith("./");
  if (isInternal) {
    return (
      <Link href={uri} className="text-brand underline hover:text-brand-dark transition-colors">
        {children}
      </Link>
    );
  }
  
  return (
    <a href={uri} className="text-brand underline hover:text-brand-dark transition-colors"
      target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
},
```

**4. TABLE renderers** — add to `renderNode`:
```typescript
[BLOCKS.TABLE]: (_node, children) => (
  <div className="my-6 overflow-x-auto">
    <table className="w-full border-collapse text-sm">{children}</table>
  </div>
),
[BLOCKS.TABLE_ROW]: (_node, children) => <tr className="border-b border-hairline">{children}</tr>,
[BLOCKS.TABLE_HEADER_CELL]: (_node, children) => (
  <th className="px-3 py-2 text-left font-semibold bg-cream">{children}</th>
),
[BLOCKS.TABLE_CELL]: (_node, children) => (
  <td className="px-3 py-2">{children}</td>
),
```

---

## Phase C — Run + verify

```bash
# 1. Fresh export (picks up iframe/table rules)
yarn export:wp

# 2. Diff against main
yarn diff:cms -- --environment=main

# 3. Dry-run import (check plan)
yarn import:cms -- --environment=main

# 4. Spot-check the 7 inline-image posts in the plan JSON
# look for "inlineImages" entries + "embedded-asset-block" in body

# 5. PRODUCTION IMPORT — only with David's explicit go:
yarn import:cms -- --live --environment=main --force
```

Post-import verification:
```bash
# Re-run comparison script on the 7 image posts:
python3 scripts/compare-wp-fidelity.py
# Expect: img counts match WP, ratio ≥ 0.99, no literal `_..._` or `[…]`
```

---

## Manual implementation order

If implementing by hand, do it in this order (each step is independently verifiable):

1. `markdown-to-richtext.ts` — inline parser rewrite (run `yarn test:unit` after)
2. `export-wp.ts` — iframe + table rules (then `yarn export:wp`)
3. `import-cms.ts` — excerpt cleanup + link rewrite + image upload
4. `lib/contentful.ts` — body links query
5. `page.tsx` — remove description, fix renderers
6. Phase C — run the import pipeline
