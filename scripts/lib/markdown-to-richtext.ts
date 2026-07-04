/**
 * Minimal markdown -> Contentful RichText converter, scoped to exactly the
 * constructs present in the WP export (surveyed across all 335 exported
 * bodies, 2026-07-04): paragraphs, headings h1-h4, bold/italic, links,
 * bullet/ordered lists, blockquotes, and a handful of inline images (13
 * total). No code blocks, no tables, no nested lists were found.
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
// Inline parsing: bold (**x**), italic (*x*), links ([text](url)), and
// inline images (![alt](url) -> represented as a hyperlink to the image,
// since asset-embedding requires the image to already be uploaded as a
// Contentful asset, which happens at live-import time, not here).
// ---------------------------------------------------------------------------

function parseInline(text: string): RichTextNode[] {
  const nodes: RichTextNode[] = [];
  // Order matters: images before links (both use [..](..) but images have a
  // leading "!"), then bold before italic (bold's ** would otherwise be
  // half-consumed by the italic pattern).
  const pattern =
    /(!\[([^\]]*)\]\(([^)]+)\))|(\[([^\]]+)\]\(([^)]+)\))|(\*\*([^*]+)\*\*)|(\*([^*]+)\*)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const plain = text.slice(lastIndex, match.index);
      if (plain) nodes.push(textNode(plain));
    }

    if (match[1]) {
      // image ![alt](url)
      const alt = match[2] || "imagen";
      const url = match[3];
      nodes.push({
        nodeType: "hyperlink",
        data: { uri: url },
        content: [textNode(alt)],
      });
    } else if (match[4]) {
      // link [text](url)
      nodes.push({
        nodeType: "hyperlink",
        data: { uri: match[6] },
        content: [textNode(match[5])],
      });
    } else if (match[7]) {
      // bold **text**
      nodes.push(textNode(match[8], [{ type: "bold" }]));
    } else if (match[9]) {
      // italic *text*
      nodes.push(textNode(match[10], [{ type: "italic" }]));
    }

    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) {
    const rest = text.slice(lastIndex);
    if (rest) nodes.push(textNode(rest));
  }
  if (nodes.length === 0) nodes.push(textNode(""));
  return nodes;
}

// turndown backslash-escapes markdown-significant punctuation in prose so its
// output survives a markdown round-trip (`1\.` at line start, `view\_mode`,
// `\[texto\]`). Those escapes are markdown syntax, not content — strip them
// from every text value or they render literally in Contentful (found live:
// headings showing "1\. Organiza una reunión"). Runs in textNode so headings,
// paragraphs, list items, link text and bold/italic all get cleaned after
// inline parsing.
const MARKDOWN_ESCAPE_RE = /\\([\\`*_{}[\]()#+\-.!>|~])/g;

export function unescapeMarkdown(text: string): string {
  return text.replace(MARKDOWN_ESCAPE_RE, "$1");
}

function textNode(value: string, marks: RichTextMark[] = []): RichTextNode {
  return { nodeType: "text", data: {}, value: unescapeMarkdown(value), marks };
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

    if (headingMatch && lines.length === 1) {
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
      // Plain paragraph — join wrapped lines with a space (turndown wraps
      // long lines but they're one logical paragraph).
      content.push(paragraph(lines.join(" ")));
    }
  }

  return { nodeType: "document", data: {}, content };
}
