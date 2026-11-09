import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { ContentfulClient } from "../../lib/contentful/client";
import {
  readCatalogue,
  readMeta,
  readPost,
  readRevistas,
  snapshotExists,
} from "../../lib/contentful/snapshot";
import { syncSnapshot } from "../../lib/contentful/sync";

// A stand-in for the GraphQL API that serves a mutable space and counts calls.
function fakeSpace(initial: Record<string, { publishedAt: string; body: string }>) {
  const space = { ...initial };
  const calls = { catalogue: 0, revistas: 0, post: 0 };
  const client: ContentfulClient = {
    async query<T>(query: string, variables?: Record<string, unknown>) {
      if (query.includes("blogPostCollection(order")) {
        calls.catalogue += 1;
        const items = Object.entries(space).map(([slug, p]) => ({
          sys: { publishedAt: p.publishedAt },
          slug,
          title: slug,
          publishDate: "2024-01-01",
        }));
        return { blogPostCollection: { total: items.length, items } } as T;
      }
      if (query.includes("revistaCollection")) {
        calls.revistas += 1;
        const items = [{ sys: { id: "r1" }, slug: "ed-1", title: "Ed 1", fecha: "2024-01-01" }];
        return { revistaCollection: { total: 1, items } } as T;
      }
      calls.post += 1;
      const slug = variables?.slug as string;
      const found = space[slug];
      const items = found
        ? [{ slug, title: slug, body: { json: found.body } }]
        : [];
      return { blogPostCollection: { items } } as T;
    },
  };
  return { space, calls, client };
}

describe("Contentful snapshot sync", () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), "snapshot-"));
  });
  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("downloads everything the first time and reads it back", async () => {
    const { client, calls } = fakeSpace({
      a: { publishedAt: "1", body: "alpha" },
      "con espacio/√": { publishedAt: "1", body: "odd slug" },
    });
    expect(snapshotExists(dir)).toBe(false);

    const result = await syncSnapshot({ client, dir, now: () => new Date("2026-11-01T00:00:00Z") });

    expect(result).toMatchObject({ posts: 2, fetched: 2, unchanged: 0, removed: 0, missing: [] });
    expect(calls.post).toBe(2);
    expect(snapshotExists(dir)).toBe(true);
    expect(readMeta(dir)).toEqual({ syncedAt: "2026-11-01T00:00:00.000Z", posts: 2, revistas: 1 });
    expect(readCatalogue<{ slug: string }>(dir).map((e) => e.slug)).toEqual(["a", "con espacio/√"]);
    expect(readRevistas<{ slug: string }>(dir)).toHaveLength(1);
    expect(readPost<{ body: { json: string } }>(dir, "a")?.body.json).toBe("alpha");
    expect(readPost<{ body: { json: string } }>(dir, "con espacio/√")?.body.json).toBe("odd slug");
    expect(readPost(dir, "nope")).toBeNull();
  });

  it("only re-downloads posts whose catalogue row changed", async () => {
    const { client, calls, space } = fakeSpace({
      a: { publishedAt: "1", body: "alpha" },
      b: { publishedAt: "1", body: "bravo" },
    });
    await syncSnapshot({ client, dir });
    calls.post = 0;

    space.b = { publishedAt: "2", body: "bravo v2" };
    const result = await syncSnapshot({ client, dir });

    expect(calls.post).toBe(1);
    expect(result).toMatchObject({ fetched: 1, unchanged: 1 });
    expect(readPost<{ body: { json: string } }>(dir, "b")?.body.json).toBe("bravo v2");
    expect(readPost<{ body: { json: string } }>(dir, "a")?.body.json).toBe("alpha");
  });

  it("re-downloads every post with full: true", async () => {
    const { client, calls } = fakeSpace({
      a: { publishedAt: "1", body: "alpha" },
      b: { publishedAt: "1", body: "bravo" },
    });
    await syncSnapshot({ client, dir });
    calls.post = 0;

    await syncSnapshot({ client, dir, full: true });
    expect(calls.post).toBe(2);
  });

  it("removes posts that are gone from Contentful", async () => {
    const { client, space } = fakeSpace({
      a: { publishedAt: "1", body: "alpha" },
      b: { publishedAt: "1", body: "bravo" },
    });
    await syncSnapshot({ client, dir });

    delete space.b;
    const result = await syncSnapshot({ client, dir });

    expect(result.removed).toBe(1);
    expect(readPost(dir, "b")).toBeNull();
    expect(readdirSync(path.join(dir, "posts"))).toEqual(["a.json"]);
  });

  it("stops spending calls after a failure and resumes without re-downloading", async () => {
    const { client, calls } = fakeSpace({
      a: { publishedAt: "1", body: "alpha" },
      b: { publishedAt: "1", body: "bravo" },
      c: { publishedAt: "1", body: "charlie" },
    });
    let failNext = false;
    const flaky: ContentfulClient = {
      query(query, variables) {
        if (failNext && variables?.slug === "b") {
          return Promise.reject(new Error("boom"));
        }
        return client.query(query, variables);
      },
    };

    failNext = true;
    await expect(syncSnapshot({ client: flaky, dir, concurrency: 1 })).rejects.toThrow("boom");
    expect(calls.post).toBe(1); // "a" only; "c" was never requested
    expect(snapshotExists(dir)).toBe(false); // not usable until a sync completes

    failNext = false;
    calls.post = 0;
    await syncSnapshot({ client: flaky, dir, concurrency: 1 });
    expect(calls.post).toBe(2); // "b" and "c"; "a" was already current
    expect(snapshotExists(dir)).toBe(true);
  });

  it("leaves out a post the post query cannot find", async () => {
    const { client, space } = fakeSpace({ a: { publishedAt: "1", body: "alpha" } });
    const original = client.query.bind(client);
    const ghosting: ContentfulClient = {
      query: (query, variables) =>
        variables?.slug === "ghost" ? Promise.resolve({ blogPostCollection: { items: [] } } as never) : original(query, variables),
    };
    space.ghost = { publishedAt: "1", body: "never served" };

    const result = await syncSnapshot({ client: ghosting, dir });
    expect(result.missing).toEqual(["ghost"]);
    expect(result.posts).toBe(1);
    expect(readPost(dir, "ghost")).toBeNull();
  });
});
