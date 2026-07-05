/**
 * Minimal markdown -> Contentful RichText converter, scoped to exactly the
 * constructs present in the WP export (surveyed across all 335 exported
 * bodies, 2026-07-04): paragraphs, headings h1-h4, bold/italic, links,
 * bullet/ordered lists, blockquotes, inline images, and GFM pipe tables.
 *
 * Not a general-purpose markdown parser — deliberately narrow to what this
 * corpus actually contains, so gaps are cheap to extend rather than a
 * larger unused surface to maintain.
 */

export interface RichTextMark {
  type: "bold" | "italic";
}

export interface RichTextNode {
  nodeType: string;
  data: Record<string, unknown>;
  content?: RichTextNode[];
  value?: string;
  marks?: RichTextMark[];
}

export interface RichTextDocument {
  nodeType: "document";
  data: Record<string, unknown>;
  content: RichTextNode[];
}

const HEADING_NODE_TYPE: Record<number, string> = {
  1: "heading-1",
  2: "heading-2",
  3: "heading-3",
  4: "heading-4",
  5: "heading-5",
  6: "heading-6",
};

// ---------------------------------------------------------------------------
// Inline parsing: escape-aware recursive descent parser.
//
// Handles: \X escapes, ![img](url), [link](url), **bold**, *italic*, _italic_
// Nested: **[link](url)**, [**bold** _italic_](url), _**bold+italic**_
// Safe: \* and \_ are literal characters, never open/close emphasis spans.
// ---------------------------------------------------------------------------

// Characters that markdown (and turndown) backslash-escape in prose.
const ESCAPABLE_CHARS = new Set(
  Array.from('\\`*_{}[]()#+-. !>|~'),
);

/**
 * Public entry point — parses inline markdown at the top level (links allowed).
 * Exported so callers (e.g. tests) can access it directly.
 */
export function parseInline(text: string): RichTextNode[] {
  return parseInlineCore(text, [], true);
}

/**
 * Escape-aware recursive descent inline parser.
 *
 * marks    — marks inherited from the enclosing bold/italic context
 * canLink  — false when already inside link text (no nested links/images)
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

    // 1. Backslash escape — highest priority, prevents \* \_ from opening spans.
    if (ch === "\\" && i + 1 < text.length && ESCAPABLE_CHARS.has(text[i + 1])) {
      plain += text[i + 1];
      i += 2;
      continue;
    }

    // 2. Image: ![alt](url) — must check before link (both use '[')
    if (canLink && ch === "!" && text[i + 1] === "[") {
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

    // 3. Link: [text](url)
    if (canLink && ch === "[") {
      const m = /^\[([^\]]*)\]\(([^)]+)\)/.exec(text.slice(i));
      if (m) {
        flush();
        const inner = parseInlineCore(m[1], marks, false);
        nodes.push({
          nodeType: "hyperlink",
          data: { uri: m[2] },
          content: inner.length
            ? inner
            : [{ nodeType: "text", data: {}, value: "", marks }],
        });
        i += m[0].length;
        continue;
      }
    }

    // 4. Bold: **text**
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
        i += 4 + end; // ** + content + **
        continue;
      }
      // No matching **, treat as literal
      plain += "**";
      i += 2;
      continue;
    }

    // 5. Italic: *text* (single asterisk, not **)
    if (ch === "*") {
      const rest = text.slice(i + 1);
      // Find closing * that is not part of **
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
        i += 2 + end; // * + content + *
        continue;
      }
      plain += "*";
      i++;
      continue;
    }

    // 6. Italic: _text_ (turndown's default emDelimiter)
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
        i += 2 + end; // _ + content + _
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

// turndown backslash-escapes markdown-significant punctuation in prose so its
// output survives a markdown round-trip. Kept as an exported utility for
// callers that need it independently; the inline parser above handles escapes
// directly in the character loop (no double-processing).
const MARKDOWN_ESCAPE_RE = /\\([\\`*_{}[\]()#+\-.!>|~])/g;

export function unescapeMarkdown(text: string): string {
  return text.replace(MARKDOWN_ESCAPE_RE, "$1");
}

function textNode(value: string, marks: RichTextMark[] = []): RichTextNode {
  return { nodeType: "text", data: {}, value, marks };
}

function paragraph(text: string): RichTextNode {
  return { nodeType: "paragraph", data: {}, content: parseInline(text) };
}

// ---------------------------------------------------------------------------
// Block parsing: split on blank lines, classify each block by its first
// line's prefix.
// ---------------------------------------------------------------------------

interface Block {
  lines: string[];
}

function splitBlocks(markdown: string): Block[] {
  const rawLines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let current: string[] = [];

  const flush = () => {
    if (current.length > 0) {
      blocks.push({ lines: current });
      current = [];
    }
  };

  for (const line of rawLines) {
    if (line.trim() === "") {
      flush();
    } else {
      current.push(line);
    }
  }
  flush();
  return blocks;
}

const HEADING_RE = /^(#{1,6})\s+(.*)$/;
// turndown backslash-escapes the marker (`\-`, `\*`, `12\.`) whenever a plain
// marker could be mis-parsed by a markdown renderer reprocessing the output
// (confirmed in the corpus: 113 ordered + 7 bullet occurrences) — tolerate
// the optional backslash rather than losing those items to the paragraph
// fallback.
const BULLET_RE = /^\\?[-*]\s+(.*)$/;
const ORDERED_RE = /^\d+\\?\.\s+(.*)$/;
const BLOCKQUOTE_RE = /^>\s?(.*)$/;

function isListBlock(lines: string[], re: RegExp): boolean {
  return lines.every((l) => re.test(l));
}

// ---------------------------------------------------------------------------
// GFM pipe-table support.
// Every line of a table block starts and ends with |.

const TABLE_LINE_RE = /^\|.+\|$/;

function isTableBlock(lines: string[]): boolean {
  return lines.length >= 2 && lines.every((l) => TABLE_LINE_RE.test(l.trim()));
}

function isSeparatorLine(line: string): boolean {
  // Separator rows contain only |, -, :, and whitespace between pipes.
  return line
    .trim()
    .slice(1, -1)
    .split("|")
    .every((c) => /^[\s\-:]+$/.test(c));
}

function parseTableBlock(lines: string[]): RichTextNode {
  let isHeader = true;
  const rows: RichTextNode[] = [];

  for (const line of lines) {
    if (isSeparatorLine(line)) {
      isHeader = false;
      continue;
    }
    const cells = line
      .trim()
      .slice(1, -1)
      .split("|")
      .map((c) => c.trim());
    rows.push({
      nodeType: "table-row",
      data: {},
      content: cells.map((cellText) => ({
        nodeType: isHeader ? "table-header-cell" : "table-cell",
        data: {},
        content: [paragraph(cellText)],
      })),
    });
  }

  return { nodeType: "table", data: {}, content: rows };
}

// ---------------------------------------------------------------------------

/**
 * Blank-line-separated blocks are usually distinct elements, but turndown
 * inserts a blank line between numbered-list items whenever an item's
 * content is long/multi-sentence (confirmed against the real corpus, e.g.
 * `12-puntos-a-tomar-en-cuenta-para-ministrar-comunidades.md`, a 12-item
 * list that would otherwise split into 12 separate 1-item lists). Merge
 * adjacent blocks of the same list type into one continuous list instead.
 */
function pushOrMergeList(
  content: RichTextNode[],
  listType: "unordered-list" | "ordered-list",
  items: RichTextNode[],
): void {
  const last = content[content.length - 1];
  if (last?.nodeType === listType) {
    last.content!.push(...items);
  } else {
    content.push({ nodeType: listType, data: {}, content: items });
  }
}

export function markdownToRichText(markdown: string): RichTextDocument {
  const blocks = splitBlocks(markdown.trim());
  const content: RichTextNode[] = [];

  for (const { lines } of blocks) {
    const first = lines[0];
    const headingMatch = first.match(HEADING_RE);

    if (isTableBlock(lines)) {
      content.push(parseTableBlock(lines));
    } else if (headingMatch && lines.length === 1) {
      const level = headingMatch[1].length;
      content.push({
        nodeType: HEADING_NODE_TYPE[level] ?? "heading-6",
        data: {},
        content: parseInline(headingMatch[2]),
      });
    } else if (isListBlock(lines, BULLET_RE)) {
      pushOrMergeList(
        content,
        "unordered-list",
        lines.map((l) => ({
          nodeType: "list-item",
          data: {},
          content: [paragraph(l.match(BULLET_RE)![1])],
        })),
      );
    } else if (isListBlock(lines, ORDERED_RE)) {
      pushOrMergeList(
        content,
        "ordered-list",
        lines.map((l) => ({
          nodeType: "list-item",
          data: {},
          content: [paragraph(l.match(ORDERED_RE)![1])],
        })),
      );
    } else if (isListBlock(lines, BLOCKQUOTE_RE)) {
      const text = lines.map((l) => l.match(BLOCKQUOTE_RE)![1]).join(" ");
      content.push({
        nodeType: "blockquote",
        data: {},
        content: [paragraph(text)],
      });
    } else {
      content.push(paragraph(lines.join(" ")));
    }
  }

  return { nodeType: "document", data: {}, content };
}
