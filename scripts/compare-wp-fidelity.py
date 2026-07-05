#!/usr/bin/env python3
"""Compare 10 blog posts: live WP (REST API) vs local Next.js render."""
import json, re, sys, html, difflib, urllib.request
from html.parser import HTMLParser

SLUGS = [
    "vivir-entre-los-fulani-el-viaje-de-alegria-de-christine",
    "el-caracter-se-pone-a-prueba-en-prisma",
    "la-mision-es-en-equipo-10-razones-para-unirte-a-una-agencia-misionera",
    "la-seleccion-de-un-equipo",
    "luz-en-medio-de-la-oscuridad",
    "10-hijos-30-anos-en-mision",
    "10-cualidades-de-un-discipulador",
    "sim-en-latinoamerica",
    "requisitos-y-pasos-para-ser-misionero",
    "mundial-2026-misiones-y-evangelismo",
]

UA = {"User-Agent": "Mozilla/5.0 (content-audit script)"}

def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8"), r.geturl(), r.status

class Extractor(HTMLParser):
    """Collects text + structural inventory from an HTML fragment/page."""
    def __init__(self, root=None):
        super().__init__(convert_charrefs=True)
        self.root = root          # (tag, class-substring) to scope to, or None
        self.depth_in_root = 0
        self.texts = []
        self.struct = {"h1":0,"h2":0,"h3":0,"h4":0,"h5":0,"h6":0,"p":0,"li":0,
                       "ul":0,"ol":0,"blockquote":0,"strong":0,"b":0,"em":0,"i":0,
                       "img":0,"iframe":0,"table":0,"a":0,"figure":0,"hr":0}
        self.links = []
        self.images = []
        self.iframes = []
        self.skip = 0  # inside script/style/nav/header/footer

    def in_scope(self):
        return self.root is None or self.depth_in_root > 0

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if self.root and tag == self.root[0] and self.root[1] in (a.get("class") or ""):
            self.depth_in_root += 1
            return
        if self.root and self.depth_in_root > 0:
            self.depth_in_root += 0  # depth tracked via endtag counting below
        if tag in ("script","style","noscript"):
            self.skip += 1
        if not self.in_scope() or self.skip:
            return
        if tag in self.struct:
            self.struct[tag] += 1
        if tag == "a":
            self.links.append(a.get("href",""))
        if tag == "img":
            self.images.append(a.get("src",""))
        if tag == "iframe":
            self.iframes.append(a.get("src",""))

    def handle_endtag(self, tag):
        if tag in ("script","style","noscript") and self.skip:
            self.skip -= 1
        if self.root and tag == self.root[0] and self.depth_in_root > 0:
            # naive: decrement on matching close; fine for single-container use
            pass

    def handle_data(self, data):
        if self.in_scope() and not self.skip and data.strip():
            self.texts.append(data)

def norm_text(s):
    s = html.unescape(s)
    s = s.replace(" ", " ").replace("’","'").replace("‘","'")
    s = s.replace("“",'"').replace("”",'"').replace("–","-").replace("—","-")
    s = re.sub(r"\s+", " ", s).strip().lower()
    return s

def extract(html_src, root=None):
    ex = Extractor(root)
    ex.feed(html_src)
    return ex

def words(texts):
    return norm_text(" ".join(texts)).split()

results = []
for slug in SLUGS:
    row = {"slug": slug}
    # --- WP REST ---
    try:
        raw, _, _ = fetch(f"https://misionessim.org/wp-json/wp/v2/posts?slug={slug}&_embed")
        data = json.loads(raw)
        if not data:
            row["error"] = "not found in WP"; results.append(row); continue
        wp = data[0]
    except Exception as e:
        row["error"] = f"WP fetch: {e}"; results.append(row); continue
    wp_title = html.unescape(re.sub(r"<[^>]+>","", wp["title"]["rendered"])).strip()
    wp_date = wp["date_gmt"][:10]
    wp_excerpt = norm_text(re.sub(r"<[^>]+>"," ", wp["excerpt"]["rendered"]))
    content = wp["content"]["rendered"]
    wpex = extract(content)
    emb = wp.get("_embedded", {})
    feat = ""
    try:
        feat = emb["wp:featuredmedia"][0]["source_url"]
    except Exception:
        pass
    cats, tags = [], []
    for group in emb.get("wp:term", []):
        for t in group:
            (cats if t.get("taxonomy")=="category" else tags).append(t.get("name"))
    row["wp"] = {
        "title": wp_title, "date": wp_date, "featured": feat,
        "cats": sorted(cats), "tags": sorted(tags),
        "struct": {k:v for k,v in wpex.struct.items() if v},
        "links": wpex.links, "images": wpex.images, "iframes": wpex.iframes,
        "words": len(words(wpex.texts)), "excerpt": wp_excerpt[:200],
    }
    wp_words = words(wpex.texts)

    # --- local ---
    seg = wp_date[:7]
    local_url = f"http://localhost:3000/blog/{seg}/{slug}/"
    try:
        lraw, final_url, status = fetch(local_url)
    except Exception as e:
        row["local_error"] = f"{local_url} -> {e}"; results.append(row); continue
    # scope to prose-custom body div
    m = re.search(r'<div class="prose-custom[^"]*">(.*?)</div>\s*(<footer|</main)', lraw, re.S)
    body_html = m.group(1) if m else ""
    lex = extract(body_html)
    lt = re.search(r"<h1[^>]*>(.*?)</h1>", lraw, re.S)
    local_title = html.unescape(re.sub(r"<[^>]+>","", lt.group(1))).strip() if lt else ""
    ld = re.search(r'<time dateTime="([^"]+)"', lraw) or re.search(r'<time datetime="([^"]+)"', lraw)
    hero = re.search(r'aspect-\[16/9\].*?<img[^>]*src="([^"]+)"', lraw, re.S)
    desc = re.search(r'border-l-4 border-cream pl-4">(.*?)</p>', lraw, re.S)
    lcats = re.findall(r'/blog/category/([^/"]+)/', lraw)
    ltags = re.findall(r'/blog/tag/([^/"]+)/', lraw)
    row["local"] = {
        "url": local_url, "status": status,
        "title": local_title, "date": (ld.group(1)[:10] if ld else ""),
        "hero": bool(hero),
        "cats": sorted(set(lcats)), "tags": sorted(set(ltags)),
        "struct": {k:v for k,v in lex.struct.items() if v},
        "links": lex.links, "images": lex.images, "iframes": lex.iframes,
        "words": len(words(lex.texts)),
        "desc": norm_text(re.sub(r"<[^>]+>"," ", desc.group(1)))[:200] if desc else "",
    }
    local_words = words(lex.texts)

    # --- text diff (word level) ---
    sm = difflib.SequenceMatcher(None, wp_words, local_words, autojunk=False)
    ops = []
    for tag_, i1, i2, j1, j2 in sm.get_opcodes():
        if tag_ == "equal":
            continue
        ops.append({
            "op": tag_,
            "wp": " ".join(wp_words[i1:i2])[:300],
            "local": " ".join(local_words[j1:j2])[:300],
        })
    row["ratio"] = round(sm.ratio(), 4)
    row["diff_ops"] = ops[:25]
    results.append(row)
    print(f"done {slug}: ratio={row.get('ratio')} wp_words={row['wp']['words']} local_words={row['local']['words']}", file=sys.stderr)

out = "/private/tmp/claude-501/-Users-david-websites-misionessim-new/a2a4d208-ff34-456f-8f74-1178be611157/scratchpad/compare_results.json"
with open(out, "w") as f:
    json.dump(results, f, ensure_ascii=False, indent=1)
print(f"wrote {out}", file=sys.stderr)
