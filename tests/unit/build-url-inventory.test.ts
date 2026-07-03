import { describe, expect, it } from "vitest";
import { classify } from "../../scripts/build-url-inventory";

const SITE = "https://misionessim.org";

describe("classify", () => {
  it("classifies the homepage", () => {
    expect(classify(`${SITE}/`)).toEqual({
      type: "home",
      disposition: "rebuild-as-code",
    });
  });

  it("classifies blog posts, not the /blog/ index, as migratable content", () => {
    expect(classify(`${SITE}/blog/2017-07/un-ministerio-sin-igual/`)).toEqual(
      { type: "blog-post", disposition: "migrate-to-contentful-blog" },
    );
    expect(classify(`${SITE}/blog/`)).toEqual({
      type: "blog-index",
      disposition: "migrate-to-contentful-blog",
    });
  });

  it("classifies revista items, not the /la-revista/ index", () => {
    expect(classify(`${SITE}/la-revista/mi-vida-espiritual/`)).toEqual({
      type: "revista-item",
      disposition: "migrate-to-contentful-revista",
    });
    expect(classify(`${SITE}/la-revista/`)).toEqual({
      type: "revista-index",
      disposition: "migrate-to-contentful-revista",
    });
  });

  it("classifies Spanish-accented slugs correctly", () => {
    expect(
      classify(`${SITE}/blog/2020-01/la-mentoria-una-aliada-en-el-ministerio/`),
    ).toEqual({ type: "blog-post", disposition: "migrate-to-contentful-blog" });
    expect(classify(`${SITE}/declaracion-de-fe-de-sim/`)).toEqual({
      type: "page",
      disposition: "rebuild-as-code",
    });
  });

  it("classifies taxonomy archives", () => {
    expect(classify(`${SITE}/blog/category/arte-en-misiones/`)).toEqual({
      type: "category-archive",
      disposition: "generated-archive",
    });
    expect(classify(`${SITE}/blog/tag/aleman/`)).toEqual({
      type: "tag-archive",
      disposition: "generated-archive",
    });
    expect(classify(`${SITE}/blog/author/admin/`)).toEqual({
      type: "author-archive",
      disposition: "generated-archive",
    });
    expect(classify(`${SITE}/portfolio-category/healthcare/`)).toEqual({
      type: "portfolio-category-archive",
      disposition: "generated-archive",
    });
  });

  it("classifies donation pages under /donations/ as dropped", () => {
    expect(
      classify(`${SITE}/donations/donate-to-fight-hunger-and-food-insecurity/`),
    ).toEqual({ type: "donation-page", disposition: "dropped-donations" });
    expect(classify(`${SITE}/donations/`)).toEqual({
      type: "donation-page",
      disposition: "dropped-donations",
    });
  });

  it("classifies the three GiveWP utility pages (outside /donations/) as dropped", () => {
    for (const slug of [
      "donation-confirmation",
      "donation-failed",
      "donor-dashboard",
    ]) {
      expect(classify(`${SITE}/${slug}/`)).toEqual({
        type: "donation-page",
        disposition: "dropped-donations",
      });
    }
  });

  it("classifies the 8 in-scope static pages as rebuild-as-code", () => {
    for (const slug of [
      "sirve-con-sim",
      "nosotros",
      "recursos",
      "revistavamos",
      "ora",
      "declaracion-de-fe-de-sim",
      "terms-and-conditions",
    ]) {
      expect(classify(`${SITE}/${slug}/`)).toEqual({
        type: "page",
        disposition: "rebuild-as-code",
      });
    }
  });
});
