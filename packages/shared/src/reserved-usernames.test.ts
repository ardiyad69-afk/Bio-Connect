import { describe, expect, it } from "vitest";
import { isReservedUsername, RESERVED_USERNAMES } from "./reserved-usernames";

describe("isReservedUsername", () => {
  it("flags every entry in the blocklist", () => {
    for (const name of RESERVED_USERNAMES) {
      expect(isReservedUsername(name)).toBe(true);
    }
  });

  it("is case-insensitive", () => {
    expect(isReservedUsername("Dashboard")).toBe(true);
    expect(isReservedUsername("DASHBOARD")).toBe(true);
  });

  it("allows usernames that aren't reserved", () => {
    expect(isReservedUsername("kiki")).toBe(false);
    expect(isReservedUsername("budisantoso")).toBe(false);
  });
});
