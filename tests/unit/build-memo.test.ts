import { describe, expect, it } from "vitest";
import { buildMemo } from "../../lib/build-memo";

describe("buildMemo", () => {
  it("runs the fetcher once however many times it is called", async () => {
    let calls = 0;
    const memo = buildMemo(async () => ++calls);

    expect(await memo()).toBe(1);
    expect(await memo()).toBe(1);
    expect(calls).toBe(1);
  });

  it("collapses concurrent callers into a single request", async () => {
    let calls = 0;
    let release: (value: number) => void = () => {};
    const memo = buildMemo(() => {
      calls++;
      return new Promise<number>((resolve) => {
        release = resolve;
      });
    });

    const waiting = Promise.all([memo(), memo(), memo()]);
    release(7);

    expect(await waiting).toEqual([7, 7, 7]);
    expect(calls).toBe(1);
  });

  it("does not pin a failure: a later call retries", async () => {
    let calls = 0;
    const memo = buildMemo(async () => {
      calls++;
      if (calls === 1) throw new Error("transient");
      return "ok";
    });

    await expect(memo()).rejects.toThrow("transient");
    expect(await memo()).toBe("ok");
    expect(calls).toBe(2);
  });
});
