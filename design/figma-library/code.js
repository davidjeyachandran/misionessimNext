// MisionesSIM design library — Figma plugin.
//
// Builds colour variables, colour styles, text styles and a set of components
// (headings, body, blockquote, buttons, tags…) whose values are copied from the
// live site's CSS:
//   app/globals.css            — brand tokens (@theme), heading base styles
//   app/home.css               — homepage/hero/button/eyebrow styles
//   app/blog/[date]/[slug]/page.tsx — article (blog post) typography
// If those files change, update the tables below and re-run the plugin.
//
// Safe to re-run: variables and styles are updated in place by name (so every
// component and instance using them picks up the change). The "MisionesSIM
// Library" page and its components are only built on the first run, so
// instances you've placed in other files/pages never lose their main component.

const PAGE_NAME = "MisionesSIM Library";

// --- Tokens ------------------------------------------------------------------

const COLORS = {
  brand: "#c91430", // SIM red: links, buttons, blockquote rule
  "brand-hover": "#a80f27", // .btn-primary:hover
  "brand-dark": "#900201", // link hover, Revista VAMOS card
  navy: "#002f49", // homepage headings, dark sections
  ink: "#0a0117", // article headings and body text
  muted: "#696f8c", // meta text, blockquote text, nav
  teal: "#167e92", // eyebrow
  cream: "#fef1d5", // table header, cream button, cards on dark bands
  lavender: "#eaebf8", // Revista/Manual band
  linen: "#fdf7f4", // form card background
  "section-alt": "#f7f7f9", // .section-alt background
  hairline: "#e6e8f0", // borders, dividers
  white: "#ffffff",
};

const RALEWAY = "Raleway";
const WORK = "Work Sans";

// lineHeight: number = px, string ending in % = percent.
// letterSpacing: percent of font size (CSS em × 100).
const TEXT_STYLES = [
  // Blog article (app/blog/[date]/[slug]/page.tsx — Tailwind sizes)
  { name: "Article/H1", family: RALEWAY, style: "Bold", size: 36, lh: 45, ls: -2, desc: "text-4xl font-bold leading-tight · color ink" },
  { name: "Article/H2", family: RALEWAY, style: "Bold", size: 24, lh: 32, ls: -2, desc: "text-2xl font-bold · mt-8 mb-3 · color ink" },
  { name: "Article/H3", family: RALEWAY, style: "Bold", size: 20, lh: 28, ls: -2, desc: "text-xl font-bold · mt-6 mb-2 · color ink" },
  { name: "Article/H4", family: RALEWAY, style: "SemiBold", size: 18, lh: 28, ls: -2, desc: "text-lg font-semibold · mt-4 mb-2 · color ink" },
  { name: "Article/Body", family: WORK, style: "Regular", size: 16, lh: 26, desc: "p · leading-relaxed · mb-4 · color ink" },
  { name: "Article/Body Bold", family: WORK, style: "SemiBold", size: 16, lh: 26, desc: "strong · font-semibold" },
  { name: "Article/Quote", family: WORK, style: "Italic", size: 16, lh: 26, desc: "blockquote · italic · color muted" },
  { name: "Article/Link", family: WORK, style: "Regular", size: 16, lh: 26, deco: "UNDERLINE", desc: "a · color brand, hover brand-dark" },
  { name: "Article/Meta", family: WORK, style: "Regular", size: 14, lh: 20, desc: "text-sm · breadcrumbs, date, tables · color muted" },
  { name: "Article/Category", family: WORK, style: "SemiBold", size: 12, lh: 16, ls: 2.5, upper: true, desc: "text-xs font-semibold uppercase tracking-wide · color brand" },
  { name: "Article/Tag", family: WORK, style: "Regular", size: 12, lh: 16, desc: "text-xs · tag pill · color muted" },

  // Homepage & landing pages (app/home.css)
  { name: "Home/Hero H1", family: RALEWAY, style: "ExtraBold", size: 59, lh: 60, ls: -4.6, desc: ".hero h1 · white on image · 44px ≤1024 · 32px mobile" },
  { name: "Home/Page Hero H1", family: RALEWAY, style: "ExtraBold", size: 55, lh: 66, ls: -2.7, desc: ".hero-page h1 · 40px ≤1024 · 32px mobile" },
  { name: "Home/Section Title", family: RALEWAY, style: "Bold", size: 40, lh: "120%", desc: ".section-title · navy, <span> in brand" },
  { name: "Home/Card Title", family: RALEWAY, style: "Bold", size: 26, lh: "120%", desc: ".card-body h3 · brand" },
  { name: "Home/Post Card Title", family: RALEWAY, style: "Bold", size: 20, lh: 27, desc: ".post-body h3 · navy, hover brand" },
  { name: "Home/Eyebrow", family: WORK, style: "Medium", size: 16, lh: "170%", ls: 6.25, upper: true, desc: ".eyebrow · teal (cream on dark)" },
  { name: "Home/Body", family: WORK, style: "Regular", size: 16, lh: "170%", desc: ".sim-home body text · ink" },

  // UI
  { name: "UI/Button", family: WORK, style: "SemiBold", size: 15, lh: "170%", desc: ".btn" },
];

// --- Helpers -----------------------------------------------------------------

function rgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}

function lineHeight(v) {
  if (typeof v === "string") return { unit: "PERCENT", value: parseFloat(v) };
  return { unit: "PIXELS", value: v };
}

const paintStyles = {}; // colour name -> PaintStyle
const textStyles = {}; // text style name -> TextStyle

async function loadFonts() {
  const wanted = new Map();
  for (const t of TEXT_STYLES) wanted.set(`${t.family}|${t.style}`, { family: t.family, style: t.style });
  const missing = [];
  await Promise.all(
    [...wanted.values()].map((f) => figma.loadFontAsync(f).catch(() => missing.push(`${f.family} ${f.style}`))),
  );
  return missing;
}

async function upsertColors() {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  let collection = collections.find((c) => c.name === "MisionesSIM");
  if (!collection) collection = figma.variables.createVariableCollection("MisionesSIM");
  const modeId = collection.modes[0].modeId;

  const existingVars = await figma.variables.getLocalVariablesAsync("COLOR");
  const existingStyles = await figma.getLocalPaintStylesAsync();

  for (const [name, hex] of Object.entries(COLORS)) {
    const varName = `color/${name}`;
    let v = existingVars.find((x) => x.name === varName && x.variableCollectionId === collection.id);
    if (!v) v = figma.variables.createVariable(varName, collection, "COLOR");
    v.setValueForMode(modeId, rgb(hex));
    v.description = hex;

    const styleName = `Color/${name}`;
    let s = existingStyles.find((x) => x.name === styleName);
    if (!s) {
      s = figma.createPaintStyle();
      s.name = styleName;
    }
    s.description = hex;
    s.paints = [figma.variables.setBoundVariableForPaint({ type: "SOLID", color: rgb(hex) }, "color", v)];
    paintStyles[name] = s;
  }
}

async function upsertTextStyles() {
  const existing = await figma.getLocalTextStylesAsync();
  for (const t of TEXT_STYLES) {
    let s = existing.find((x) => x.name === t.name);
    if (!s) {
      s = figma.createTextStyle();
      s.name = t.name;
    }
    s.fontName = { family: t.family, style: t.style };
    s.fontSize = t.size;
    s.lineHeight = lineHeight(t.lh);
    s.letterSpacing = { unit: "PERCENT", value: t.ls || 0 };
    s.textCase = t.upper ? "UPPER" : "ORIGINAL";
    s.textDecoration = t.deco || "NONE";
    s.description = t.desc || "";
    textStyles[t.name] = s;
  }
}

async function text(chars, styleName, colorName) {
  const node = figma.createText();
  await node.setTextStyleIdAsync(textStyles[styleName].id);
  node.characters = chars;
  await node.setFillStyleIdAsync(paintStyles[colorName].id);
  return node;
}

async function fill(node, colorName) {
  await node.setFillStyleIdAsync(paintStyles[colorName].id);
}

function autoFrame(name, direction, { gap = 0, pad = 0, width } = {}) {
  const f = figma.createFrame();
  f.name = name;
  f.layoutMode = direction;
  f.itemSpacing = gap;
  f.paddingTop = f.paddingBottom = f.paddingLeft = f.paddingRight = pad;
  f.fills = [];
  if (width) {
    f.resize(width, 10);
    if (direction === "VERTICAL") {
      f.counterAxisSizingMode = "FIXED";
      f.primaryAxisSizingMode = "AUTO";
    } else {
      f.primaryAxisSizingMode = "FIXED";
      f.counterAxisSizingMode = "AUTO";
    }
  } else {
    f.primaryAxisSizingMode = "AUTO";
    f.counterAxisSizingMode = "AUTO";
  }
  return f;
}

function fillWidth(node) {
  node.layoutSizingHorizontal = "FILL";
  if (node.type === "TEXT") node.textAutoResize = "HEIGHT";
}

// Text component with an editable "Text" property.
const ARTICLE_W = 736; // max-w-3xl (768) minus px-4 padding
async function textComponent(name, styleName, colorName, sample, width = ARTICLE_W) {
  const comp = figma.createComponent();
  comp.name = name;
  comp.layoutMode = "VERTICAL";
  comp.resize(width, 10);
  comp.counterAxisSizingMode = "FIXED";
  comp.primaryAxisSizingMode = "AUTO";
  comp.fills = [];
  comp.description = textStyles[styleName].description;
  const t = await text(sample, styleName, colorName);
  comp.appendChild(t);
  fillWidth(t);
  const key = comp.addComponentProperty("Text", "TEXT", sample);
  t.componentPropertyReferences = { characters: key };
  return { comp, key };
}

async function section(root, title, width = 1040) {
  const s = autoFrame(title, "VERTICAL", { gap: 32, pad: 48, width });
  s.cornerRadius = 16;
  await fill(s, "white");
  root.appendChild(s);
  const h = await text(title, "Home/Section Title", "navy");
  s.appendChild(h);
  return s;
}

// --- Page builders -----------------------------------------------------------

async function buildColors(root) {
  const s = await section(root, "Colours");
  const grid = autoFrame("Swatches", "HORIZONTAL", { gap: 24, width: 944 });
  grid.layoutWrap = "WRAP";
  grid.counterAxisSpacing = 24;
  s.appendChild(grid);
  fillWidth(grid);
  for (const [name, hex] of Object.entries(COLORS)) {
    const sw = autoFrame(`Swatch/${name}`, "VERTICAL", { gap: 8 });
    const chip = figma.createRectangle();
    chip.resize(160, 96);
    chip.cornerRadius = 10;
    await fill(chip, name);
    chip.strokes = [{ type: "SOLID", color: rgb(COLORS.hairline) }];
    chip.strokeWeight = 1;
    sw.appendChild(chip);
    sw.appendChild(await text(name, "Article/Body Bold", "ink"));
    sw.appendChild(await text(hex, "Article/Meta", "muted"));
    grid.appendChild(sw);
  }
}

async function buildType(root) {
  const s = await section(root, "Typography");
  for (const t of TEXT_STYLES) {
    const row = autoFrame(t.name, "VERTICAL", { gap: 6 });
    s.appendChild(row);
    fillWidth(row);
    const lh = typeof t.lh === "string" ? t.lh : `${t.lh}px`;
    const label = await text(
      `${t.name} — ${t.family} ${t.style} ${t.size}/${lh}${t.ls ? ` · ${t.ls}%` : ""} · ${t.desc}`,
      "Article/Meta",
      "muted",
    );
    row.appendChild(label);
    fillWidth(label);
    const onDark = t.name === "Home/Hero H1" || t.name === "Home/Page Hero H1";
    const color = onDark ? "white" : t.name.startsWith("Home/Eyebrow") ? "teal" : t.name === "Article/Link" || t.name === "Article/Category" ? "brand" : t.name === "Article/Quote" || t.name === "Article/Meta" || t.name === "Article/Tag" ? "muted" : t.name.startsWith("Home/") ? "navy" : "ink";
    const sampleText = t.size >= 30 ? "Ser parte de lo que Dios está haciendo" : "Llevamos el evangelio a lugares donde Cristo no es conocido.";
    if (onDark) {
      const band = autoFrame("Dark band", "VERTICAL", { pad: 24 });
      band.cornerRadius = 10;
      await fill(band, "navy");
      row.appendChild(band);
      fillWidth(band);
      const sample = await text(sampleText, t.name, color);
      band.appendChild(sample);
      fillWidth(sample);
    } else {
      const sample = await text(sampleText, t.name, color);
      row.appendChild(sample);
      fillWidth(sample);
    }
  }
}

async function buildComponents(root) {
  const s = await section(root, "Components");
  const C = {};

  const add = async (key, ...args) => {
    C[key] = await textComponent(...args);
    s.appendChild(C[key].comp);
  };
  await add("h1", "Article/H1", "Article/H1", "ink", "Título del artículo");
  await add("h2", "Article/H2", "Article/H2", "ink", "Subtítulo de sección");
  await add("h3", "Article/H3", "Article/H3", "ink", "Encabezado de tercer nivel");
  await add("h4", "Article/H4", "Article/H4", "ink", "Encabezado de cuarto nivel");
  await add("p", "Article/Paragraph", "Article/Body", "ink",
    "SIM es una misión internacional e interdenominacional que existe para que Cristo sea conocido en los lugares donde no ha sido nombrado.");
  await add("meta", "Article/Meta", "Article/Meta", "muted", "14 de noviembre de 2026 · 5 min de lectura");
  await add("category", "Article/Category", "Article/Category", "brand", "Testimonios");
  await add("link", "Article/Link", "Article/Link", "brand", "Lee más sobre nuestro trabajo");

  // Blockquote: 4px brand rule on the left + 16px padding, italic muted text.
  {
    const comp = figma.createComponent();
    comp.name = "Article/Blockquote";
    comp.description = "blockquote · my-6 border-l-4 border-brand pl-4 italic text-muted";
    comp.layoutMode = "VERTICAL";
    comp.resize(ARTICLE_W, 10);
    comp.counterAxisSizingMode = "FIXED";
    comp.primaryAxisSizingMode = "AUTO";
    comp.paddingLeft = 20; // 4px border (drawn inside) + 16px pl-4
    comp.fills = [];
    await comp.setStrokeStyleIdAsync(paintStyles.brand.id);
    comp.strokeAlign = "INSIDE";
    comp.strokeTopWeight = 0;
    comp.strokeRightWeight = 0;
    comp.strokeBottomWeight = 0;
    comp.strokeLeftWeight = 4;
    const sample = "«Id por todo el mundo y anunciad las buenas nuevas a toda criatura.» — Marcos 16:15";
    const t = await text(sample, "Article/Quote", "muted");
    comp.appendChild(t);
    fillWidth(t);
    const key = comp.addComponentProperty("Text", "TEXT", sample);
    t.componentPropertyReferences = { characters: key };
    C.quote = { comp, key };
    s.appendChild(comp);
  }

  // Divider (hr): 1px hairline.
  {
    const comp = figma.createComponent();
    comp.name = "Article/Divider";
    comp.description = "hr · my-8 border-hairline";
    comp.resize(ARTICLE_W, 1);
    await fill(comp, "hairline");
    C.hr = { comp };
    s.appendChild(comp);
  }

  // Tag pill.
  {
    const comp = figma.createComponent();
    comp.name = "Article/Tag";
    comp.description = "rounded-full border border-hairline px-3 py-1 text-xs text-muted";
    comp.layoutMode = "HORIZONTAL";
    comp.primaryAxisSizingMode = "AUTO";
    comp.counterAxisSizingMode = "AUTO";
    comp.paddingLeft = comp.paddingRight = 12;
    comp.paddingTop = comp.paddingBottom = 4;
    comp.cornerRadius = 999;
    comp.fills = [];
    await comp.setStrokeStyleIdAsync(paintStyles.hairline.id);
    comp.strokeWeight = 1;
    comp.strokeAlign = "INSIDE";
    const t = await text("misiones", "Article/Tag", "muted");
    comp.appendChild(t);
    const key = comp.addComponentProperty("Text", "TEXT", "misiones");
    t.componentPropertyReferences = { characters: key };
    s.appendChild(comp);
  }

  // Eyebrow.
  await add("eyebrow", "Home/Eyebrow", "Home/Eyebrow", "teal", "Quiénes somos", 600);

  // Buttons — one component set with a Type variant.
  {
    const variants = [
      { type: "Primary", bg: "brand", fg: "white" },
      { type: "Primary Hover", bg: "brand-hover", fg: "white" },
      { type: "Outline", bg: null, fg: "brand", border: "brand" },
      { type: "Cream", bg: "cream", fg: "brand-dark" },
    ];
    const comps = [];
    for (const v of variants) {
      const comp = figma.createComponent();
      comp.name = `Type=${v.type}`;
      comp.layoutMode = "HORIZONTAL";
      comp.primaryAxisSizingMode = "AUTO";
      comp.counterAxisSizingMode = "AUTO";
      comp.primaryAxisAlignItems = "CENTER";
      comp.counterAxisAlignItems = "CENTER";
      // .btn padding 14/32; outline is 11/28 + 2px border (drawn inside here).
      comp.paddingTop = comp.paddingBottom = v.border ? 13 : 14;
      comp.paddingLeft = comp.paddingRight = v.border ? 30 : 32;
      comp.cornerRadius = 10; // --radius-btn
      if (v.bg) await fill(comp, v.bg);
      else comp.fills = [];
      if (v.border) {
        await comp.setStrokeStyleIdAsync(paintStyles[v.border].id);
        comp.strokeWeight = 2;
        comp.strokeAlign = "INSIDE";
      }
      if (v.type === "Primary Hover") {
        comp.effects = [{ type: "DROP_SHADOW", color: { ...rgb(COLORS.brand), a: 0.35 }, offset: { x: 0, y: 8 }, radius: 20, spread: 0, visible: true, blendMode: "NORMAL" }];
      }
      comp.appendChild(await text("Conoce más", "UI/Button", v.fg));
      comps.push(comp);
    }
    const set = figma.combineAsVariants(comps, s);
    set.name = "Button";
    set.description = ".btn · Work Sans SemiBold 15 · radius 10";
    set.layoutMode = "HORIZONTAL";
    set.primaryAxisSizingMode = "AUTO";
    set.counterAxisSizingMode = "AUTO";
    set.itemSpacing = 16;
    set.paddingTop = set.paddingBottom = set.paddingLeft = set.paddingRight = 16;
    // Text property on the whole set.
    const key = set.addComponentProperty("Label", "TEXT", "Conoce más");
    for (const c of set.children) c.findOne((n) => n.type === "TEXT").componentPropertyReferences = { characters: key };
  }

  return C;
}

// A sample article assembled from instances, to show the components in use.
async function buildExample(root, C) {
  const s = await section(root, "Example — blog post");
  const article = autoFrame("Article", "VERTICAL", { width: ARTICLE_W });
  s.appendChild(article);

  const place = (c, value, spaceBefore = 0) => {
    const i = c.comp.createInstance();
    if (value !== undefined && c.key) i.setProperties({ [c.key]: value });
    if (spaceBefore) {
      const gap = figma.createFrame();
      gap.name = "space";
      gap.fills = [];
      gap.resize(ARTICLE_W, spaceBefore);
      article.appendChild(gap);
    }
    article.appendChild(i);
    i.layoutSizingHorizontal = "FILL";
    return i;
  };

  // Gaps are the collapsed Tailwind margins between siblings (e.g. p mb-4 + h2 mt-8 = 32).
  place(C.category, "Testimonios");
  place(C.h1, "Cómo una conversación cambió el rumbo de mi vida", 12);
  place(C.meta, "14 de noviembre de 2026 · 5 min de lectura", 12);
  place(C.p, undefined, 32);
  place(C.h2, "Un llamado inesperado", 32);
  place(C.p, undefined, 12);
  place(C.quote, undefined, 24);
  place(C.h3, "Lo que aprendimos en el camino", 24);
  place(C.p, undefined, 8);
  place(C.hr, undefined, 32);
}

// --- Main --------------------------------------------------------------------

async function main() {
  const missing = await loadFonts();
  if (missing.length) {
    figma.closePlugin(`Missing fonts: ${missing.join(", ")}. Install them (Google Fonts) and run again.`);
    return;
  }

  await upsertColors();
  await upsertTextStyles();

  await figma.loadAllPagesAsync();
  const existingPage = figma.root.children.find((p) => p.name === PAGE_NAME);
  if (existingPage) {
    figma.closePlugin(`Updated ${Object.keys(COLORS).length} colours and ${TEXT_STYLES.length} text styles. Components on "${PAGE_NAME}" left in place.`);
    return;
  }

  const page = figma.createPage();
  page.name = PAGE_NAME;
  await figma.setCurrentPageAsync(page);

  const root = autoFrame("MisionesSIM Library", "VERTICAL", { gap: 48, pad: 64 });
  await fill(root, "section-alt");
  page.appendChild(root);

  await buildColors(root);
  await buildType(root);
  const C = await buildComponents(root);
  await buildExample(root, C);

  figma.viewport.scrollAndZoomIntoView([root]);
  figma.closePlugin(`MisionesSIM library built: ${Object.keys(COLORS).length} colours, ${TEXT_STYLES.length} text styles, components on "${PAGE_NAME}".`);
}

main().catch((err) => {
  console.error(err);
  figma.closePlugin(`Error: ${err && err.message ? err.message : err}`);
});
