import { describe, expect, it } from "vitest";
import { draftExitPath, draftPostPath, isValidPreviewSecret } from "../../lib/draft-preview";

describe("draftPostPath", () => {
  it("uses the post's publish month", () => {
    expect(draftPostPath({ slug: "abuelas", publishDate: "2024-03-15T00:00:00.000Z" })).toBe(
      "/blog/2024-03/abuelas/",
    );
  });

  it("falls back to the current month for a post without a publishDate", () => {
    const now = new Date("2026-09-23T12:00:00Z");
    expect(draftPostPath({ slug: "nuevo", publishDate: null }, now)).toBe("/blog/2026-09/nuevo/");
  });

  it("keeps a hostile slug inside the path", () => {
    expect(draftPostPath({ slug: "//evil.com", publishDate: "2024-03-01" })).toBe(
      "/blog/2024-03/%2F%2Fevil.com/",
    );
  });
});

describe("isValidPreviewSecret", () => {
  it("accepts only the exact secret", () => {
    expect(isValidPreviewSecret("s3cret", "s3cret")).toBe(true);
    expect(isValidPreviewSecret("s3cre", "s3cret")).toBe(false);
    expect(isValidPreviewSecret("S3cret", "s3cret")).toBe(false);
  });

  it("rejects everything when no secret is configured", () => {
    expect(isValidPreviewSecret("", "")).toBe(false);
    expect(isValidPreviewSecret("anything", undefined)).toBe(false);
    expect(isValidPreviewSecret(null, "s3cret")).toBe(false);
  });
});

describe("draftExitPath", () => {
  it("returns to a published post", () => {
    expect(draftExitPath("/blog/2024-03/abuelas/", true)).toBe("/blog/2024-03/abuelas/");
  });

  it("sends a never-published post back to the blog", () => {
    expect(draftExitPath("/blog/2026-09/nuevo/", false)).toBe("/blog/");
  });

  it("refuses off-site paths", () => {
    expect(draftExitPath("//evil.com/", true)).toBe("/blog/");
    expect(draftExitPath("https://evil.com/", true)).toBe("/blog/");
    expect(draftExitPath("/\\evil.com", true)).toBe("/blog/");
  });
});
