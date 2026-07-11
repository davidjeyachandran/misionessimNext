import { describe, expect, it } from "vitest";
import { fechaToEdicion, formatPostDate } from "../../lib/dates";

describe("formatPostDate", () => {
  it("formats a date string in UTC, not local time", () => {
    // 2021-10-28T00:00:00.000Z — would show 27 oct in UTC-X timezones
    expect(formatPostDate("2021-10-28T00:00:00.000Z")).toBe("28 de octubre de 2021");
  });

  it("handles midnight UTC boundary correctly", () => {
    // 2024-01-01T00:00:00.000Z must stay Jan 1, not Dec 31
    expect(formatPostDate("2024-01-01T00:00:00.000Z")).toBe("1 de enero de 2024");
  });
});

describe("fechaToEdicion", () => {
  it("formats to month + year in Spanish", () => {
    expect(fechaToEdicion("2024-03-01T00:00:00.000Z")).toBe("marzo 2024");
  });
});
