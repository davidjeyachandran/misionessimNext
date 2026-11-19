import { describe, expect, it } from "vitest";
import { contentfulEntryUrl, resolveEditPreference } from "../../lib/edit-link";

describe("resolveEditPreference", () => {
  it("turns the link on and remembers it", () => {
    expect(resolveEditPreference("?edit", null)).toEqual({ show: true, store: "on" });
    expect(resolveEditPreference("?edit=1", "off")).toEqual({ show: true, store: "on" });
  });

  it("turns the link off and remembers it", () => {
    expect(resolveEditPreference("?edit=off", "on")).toEqual({ show: false, store: "off" });
  });

  it("uses the remembered choice without the parameter", () => {
    expect(resolveEditPreference("", "on")).toEqual({ show: true });
    expect(resolveEditPreference("?page=2", "off")).toEqual({ show: false });
    expect(resolveEditPreference("", null)).toEqual({ show: false });
  });
});

describe("contentfulEntryUrl", () => {
  it("links to the entry in the Contentful web app", () => {
    expect(contentfulEntryUrl("i46buyptg48q", "abc123")).toBe(
      "https://app.contentful.com/spaces/i46buyptg48q/entries/abc123",
    );
  });
});
