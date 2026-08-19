import { describe, expect, it } from "vitest";
import { revistaPdfPath } from "../../lib/publishing/paths";

describe("published paths", () => {
  it("uses the Contentful URL filename for a first-party Revista PDF path", () => {
    expect(
      revistaPdfPath(
        "africa",
        "//assets.ctfassets.net/space/asset/hash/A_fricaVAMOS.pdf",
      ),
    ).toBe("/revistavamos/africa/A_fricaVAMOS.pdf");
  });
});
