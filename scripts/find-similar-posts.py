#!/usr/bin/env python3
"""
Find near-duplicate blog posts (SEO duplicate-content audit). Read-only.

Reads the rendered post pages in out/blog/YYYY-MM/<slug>/index.html, so it
costs zero Contentful quota and measures exactly what Google crawls.
Run `yarn build` first if out/ is stale.

Two signals per pair:
  cosine      TF-IDF cosine (word uni+bigrams)  - same story, reworded
  containment share of the SHORTER post's 5-word shingles found in the other
              - verbatim copying, incl. a short post fully inside a long one

Usage: python3 scripts/find-similar-posts.py [--out DIR] [--min-words 80]
Writes similar-posts.json / similar-posts.md into --out (default: cwd).
"""
import argparse, html, json, math, re, sys, unicodedata
from collections import Counter, defaultdict
from pathlib import Path
from itertools import combinations

ROOT = Path(__file__).resolve().parent.parent
POST_RE = re.compile(r"^\d{4}-\d{2}$")


def strip_tags(s):
    s = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", s, flags=re.S)
    s = re.sub(r"<[^>]+>", " ", s)
    return html.unescape(re.sub(r"\s+", " ", s)).strip()


def extract_div(h, marker):
    """Inner HTML of the first <div> whose class contains `marker` (depth-aware)."""
    m = re.search(r'<div class="[^"]*%s[^"]*">' % marker, h)
    if not m:
        return ""
    i, depth = m.end(), 1
    for t in re.finditer(r"<(/?)div\b", h[i:]):
        depth += -1 if t.group(1) else 1
        if depth == 0:
            return h[i : i + t.start()]
    return h[i:]


def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.findall(r"[a-z0-9]+", s)


def load_posts(blog_dir):
    posts = []
    for f in sorted(blog_dir.glob("*/*/index.html")):
        month, slug = f.parent.parent.name, f.parent.name
        if not POST_RE.match(month):
            continue
        h = f.read_text(encoding="utf8")
        t = re.search(r"<h1[^>]*>(.*?)</h1>", h, re.S)
        body = strip_tags(extract_div(h, "prose-custom"))
        robots = re.search(r'<meta name="robots" content="([^"]*)"', h)
        posts.append(
            dict(
                url=f"/blog/{month}/{slug}/",
                title=strip_tags(t.group(1)) if t else slug,
                date=month,
                body=body,
                noindex=bool(robots and "noindex" in robots.group(1)),
            )
        )
    return posts


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=".")
    ap.add_argument("--min-words", type=int, default=80)
    ap.add_argument("--min-score", type=float, default=0.35)
    a = ap.parse_args()

    posts = load_posts(ROOT / "out" / "blog")
    for p in posts:
        p["tokens"] = norm(p["body"])
        p["words"] = len(p["tokens"])
    thin = [p for p in posts if p["words"] < a.min_words]
    posts = [p for p in posts if p["words"] >= a.min_words]
    print(f"{len(posts)} posts compared, {len(thin)} skipped (<{a.min_words} words)", file=sys.stderr)

    # TF-IDF vectors over uni+bigrams
    docs = []
    for p in posts:
        tk = p["tokens"]
        docs.append(Counter(tk + [f"{x} {y}" for x, y in zip(tk, tk[1:])]))
    df = Counter(t for d in docs for t in d)
    n = len(docs)
    vecs = []
    for d in docs:
        v = {t: (1 + math.log(c)) * math.log(n / df[t]) for t, c in d.items() if df[t] < n * 0.5}
        norm_ = math.sqrt(sum(x * x for x in v.values())) or 1
        vecs.append({t: x / norm_ for t, x in v.items()})

    # candidate pairs via inverted index on terms (skip very common ones)
    inv = defaultdict(list)
    for i, v in enumerate(vecs):
        for t in v:
            if df[t] <= 40:
                inv[t].append(i)
    cand = set()
    for ids in inv.values():
        for x, y in combinations(ids, 2):
            cand.add((x, y))

    shingles = [{tuple(p["tokens"][k : k + 5]) for k in range(len(p["tokens"]) - 4)} for p in posts]

    pairs = []
    for i, j in cand:
        a_, b_ = vecs[i], vecs[j]
        if len(a_) > len(b_):
            a_, b_ = b_, a_
        cos = sum(x * b_.get(t, 0) for t, x in a_.items())
        si, sj = shingles[i], shingles[j]
        shared = len(si & sj)
        cont = shared / (min(len(si), len(sj)) or 1)  # of the shorter post
        big = shared / (max(len(si), len(sj)) or 1)  # of the longer post
        if cos >= a.min_score or cont >= 0.3:
            pairs.append((i, j, cos, cont, big))

    def tier(cos, cont, big):
        # E = excerpt: the shorter post sits inside a longer article that has
        #     plenty of other text (e.g. a VAMOS sidebar). Not a mirror.
        if cont >= 0.7 and big < 0.5 and cos < 0.85:
            return "E"
        if cos >= 0.85 or big >= 0.7:
            return "A"  # near-identical text
        if cos >= 0.6 or big >= 0.5:
            return "B"  # mostly the same
        return "C"

    # union-find clusters over A+B pairs
    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    out_pairs = []
    for i, j, cos, cont, big in sorted(pairs, key=lambda p: -max(p[2], p[4])):
        t = tier(cos, cont, big)
        if t in "AB":
            parent[find(i)] = find(j)
        out_pairs.append(
            dict(tier=t, cosine=round(cos, 3), containment=round(cont, 3), of_longer=round(big, 3),
                 a=posts[i]["url"], a_title=posts[i]["title"], a_words=posts[i]["words"],
                 b=posts[j]["url"], b_title=posts[j]["title"], b_words=posts[j]["words"])
        )
    clusters = defaultdict(list)
    for i in range(n):
        clusters[find(i)].append(i)
    clusters = [sorted(c, key=lambda i: -posts[i]["words"]) for c in clusters.values() if len(c) > 1]
    clusters.sort(key=lambda c: -len(c))

    outdir = Path(a.out)
    (outdir / "similar-posts.json").write_text(json.dumps(out_pairs, ensure_ascii=False, indent=1))
    counts = Counter(p["tier"] for p in out_pairs)
    lines = [f"# Similar blog posts\n", f"{len(posts)} posts compared; pairs: " + ", ".join(f"{k}={counts[k]}" for k in "ABCE"),
             f"\n{len(clusters)} clusters (tier A+B pairs joined; excerpts E excluded). Longest post listed first.\n"]
    for c in clusters:
        lines.append(f"## Cluster of {len(c)}")
        for i in c:
            lines.append(f"- `{posts[i]['url']}` — {posts[i]['title']} ({posts[i]['words']} words)")
        lines.append("")
    lines.append("## All pairs\n\n| tier | cos | of shorter | of longer | A | B |\n|---|---|---|---|---|---|")
    for p in out_pairs:
        lines.append(f"| {p['tier']} | {p['cosine']} | {p['containment']} | {p['of_longer']} | {p['a']} | {p['b']} |")
    (outdir / "similar-posts.md").write_text("\n".join(lines))
    print(f"pairs A={counts['A']} B={counts['B']} C={counts['C']} E={counts['E']}; clusters={len(clusters)}", file=sys.stderr)


main()
