import { describe, expect, it } from "vitest";
import { socialImage } from "../../lib/social-image";

const CTF = "https://images.ctfassets.net/abc123/def/ghi/hero.jpg";

describe("socialImage", () => {
  it("caps a Contentful original at card width and scales the reported height", () => {
    const image = socialImage({ url: CTF, width: 3000, height: 1500 });

    expect(image?.url).toBe(`${CTF}?w=1200&fm=jpg&fl=progressive&q=80`);
    expect(image).toMatchObject({ width: 1200, height: 600 });
  });

  it("reports the real size when the original is narrower than the cap", () => {
    // The Images API does not upscale, so claiming 1200 here would be a lie
    // crawlers reserve layout against.
    const image = socialImage({ url: CTF, width: 800, height: 400 });

    expect(image).toMatchObject({ width: 800, height: 400 });
  });

  it("omits dimensions entirely when the source has none", () => {
    const image = socialImage({ url: CTF });

    expect(image).toEqual({ url: `${CTF}?w=1200&fm=jpg&fl=progressive&q=80` });
  });

  it("passes local /public assets through untouched", () => {
    const image = socialImage({ url: "/home/banner.webp", width: 1200, height: 675 });

    expect(image).toEqual({ url: "/home/banner.webp", width: 1200, height: 675 });
  });

  it("returns null for a missing image", () => {
    expect(socialImage(null)).toBeNull();
    expect(socialImage(undefined)).toBeNull();
    expect(socialImage({ url: "" })).toBeNull();
  });
});
