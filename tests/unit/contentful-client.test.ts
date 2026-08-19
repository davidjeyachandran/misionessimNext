import { describe, expect, it } from "vitest";
import { createContentfulClient } from "../../lib/contentful/client";

describe("Contentful client", () => {
  it("retries a rate-limited query after the requested delay", async () => {
    const responses = [
      new Response(null, { status: 429, headers: { "retry-after": "1" } }),
      new Response(JSON.stringify({ data: { title: "Lista" } }), { status: 200 }),
    ];
    const delays: number[] = [];
    const client = createContentfulClient({
      spaceId: "space",
      accessToken: "token",
      fetch: async () => {
        const response = responses.shift();
        if (!response) throw new Error("Unexpected extra request");
        return response;
      },
      sleep: async (milliseconds) => {
        delays.push(milliseconds);
      },
      random: () => 0,
    });

    await expect(client.query<{ title: string }>("query { title }")).resolves.toEqual({
      title: "Lista",
    });
    expect(delays).toEqual([1_000]);
  });

  it("returns partial data when an archived link cannot resolve", async () => {
    const client = createContentfulClient({
      spaceId: "space",
      accessToken: "token",
      fetch: async () =>
        new Response(
          JSON.stringify({
            data: { items: [null, { slug: "visible" }] },
            errors: [{ extensions: { contentful: { code: "UNRESOLVABLE_LINK" } } }],
          }),
          { status: 200 },
        ),
    });

    await expect(
      client.query<{ items: Array<{ slug: string } | null> }>("query { items { slug } }"),
    ).resolves.toEqual({ items: [null, { slug: "visible" }] });
  });
});
