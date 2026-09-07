import { describe, expect, it } from "vitest";
import loader, { hintedSrc } from "../../lib/contentful-image-loader";

const CTF =
  "https://images.ctfassets.net/i46buyptg48q/4IECx2If8hYjlYAwyNizM4/05db3535/hero.jpg";
const SIXTEEN_NINE = [16, 9] as const;
// The loader's output is first-party; vercel.json rewrites it back to
// images.ctfassets.net. See PROXY_PREFIX in the loader.
const PROXIED = "/cdn/img/i46buyptg48q/4IECx2If8hYjlYAwyNizM4/05db3535/hero.jpg";

const params = (url: string) => new URLSearchParams(url.split("?")[1]);

describe("hintedSrc", () => {
  it("caps at the original width when the original is taller than the crop", () => {
    // 768x1087 portrait: every column is usable, only rows get discarded.
    expect(params(hintedSrc(CTF, SIXTEEN_NINE, { width: 768, height: 1087 })).get("mw")).toBe(
      "768",
    );
  });

  it("caps at the height-limited width when the original is wider than the crop", () => {
    // 1280x500 letterbox: a 16:9 crop runs out of rows at 888px wide, and
    // asking for more would make `fit=fill` upscale.
    expect(params(hintedSrc(CTF, SIXTEEN_NINE, { width: 1280, height: 500 })).get("mw")).toBe(
      "888",
    );
  });

  it("passes through non-Contentful sources and assets of unknown size", () => {
    expect(hintedSrc("/home/SIM-Logotipo.png", SIXTEEN_NINE, { width: 195, height: 32 })).toBe(
      "/home/SIM-Logotipo.png",
    );
    expect(hintedSrc(CTF, SIXTEEN_NINE, { width: null, height: null })).toBe(CTF);
  });
});

describe("contentfulImageLoader", () => {
  it("resizes and re-encodes an unhinted source", () => {
    const out = params(loader({ src: CTF, width: 828 }));
    expect([out.get("w"), out.get("fm"), out.get("q")]).toEqual(["828", "webp", "70"]);
    expect(out.get("fit")).toBeNull();
  });

  it("crops to the hinted aspect ratio", () => {
    const src = hintedSrc(CTF, SIXTEEN_NINE, { width: 1280, height: 853 });
    const out = params(loader({ src, width: 640 }));
    expect([out.get("w"), out.get("h"), out.get("fit")]).toEqual(["640", "360", "fill"]);
  });

  it("clamps a request above the cap instead of upscaling", () => {
    // The 1920 device tier against a 1280x853 original. Unclamped, Contentful
    // returns a real 1920x1080 file heavier than the uncropped source.
    const src = hintedSrc(CTF, SIXTEEN_NINE, { width: 1280, height: 853 });
    const out = params(loader({ src, width: 1920 }));
    expect([out.get("w"), out.get("h")]).toEqual(["1280", "720"]);
  });

  it("never leaks hint params to Contentful", () => {
    const src = hintedSrc(CTF, SIXTEEN_NINE, { width: 1280, height: 853 });
    const out = loader({ src, width: 1080 });
    expect(out).not.toMatch(/[?&](mw|ar)=/);
    expect(out.startsWith(`${PROXIED}?`)).toBe(true);
  });

  it("routes through the first-party proxy, preserving the Contentful path", () => {
    // The path after the prefix has to survive verbatim: vercel.json splices
    // it straight onto images.ctfassets.net, so a dropped or re-encoded
    // segment is a 404 at the origin.
    const out = loader({ src: CTF, width: 828 });
    expect(out.startsWith(PROXIED)).toBe(true);
    expect(out).not.toContain("images.ctfassets.net");
  });

  it("leaves non-Contentful sources on their own path", () => {
    // Local /public assets have no proxy and no resizing service.
    expect(loader({ src: "/home/SIM-Logotipo.png", width: 195 })).toBe(
      "/home/SIM-Logotipo.png",
    );
  });

  it("honours an explicit quality", () => {
    expect(params(loader({ src: CTF, width: 640, quality: 55 })).get("q")).toBe("55");
  });
});
