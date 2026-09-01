import { describe, expect, it } from "vitest";
import { updateProfileSchema, themeColorSchema, checkUsernameSchema } from "./profile";

describe("themeColorSchema", () => {
  it("accepts a 6-digit hex color", () => {
    expect(themeColorSchema.safeParse("#7c3aed").success).toBe(true);
  });

  it("rejects a 3-digit shorthand hex color", () => {
    expect(themeColorSchema.safeParse("#7cd").success).toBe(false);
  });

  it("rejects a color without a leading #", () => {
    expect(themeColorSchema.safeParse("7c3aed").success).toBe(false);
  });

  it("rejects a named color", () => {
    expect(themeColorSchema.safeParse("violet").success).toBe(false);
  });
});

describe("updateProfileSchema", () => {
  it("accepts an empty object (every field optional)", () => {
    expect(updateProfileSchema.safeParse({}).success).toBe(true);
  });

  it("accepts an empty string for avatarUrl (used to clear it)", () => {
    expect(updateProfileSchema.safeParse({ avatarUrl: "" }).success).toBe(true);
  });

  it("accepts a valid avatarUrl", () => {
    expect(updateProfileSchema.safeParse({ avatarUrl: "https://example.com/a.png" }).success).toBe(true);
  });

  it("rejects a non-empty, non-url avatarUrl", () => {
    expect(updateProfileSchema.safeParse({ avatarUrl: "not-a-url" }).success).toBe(false);
  });

  it("rejects a bio longer than 280 characters", () => {
    expect(updateProfileSchema.safeParse({ bio: "a".repeat(281) }).success).toBe(false);
  });

  it("accepts a partial socials object", () => {
    expect(updateProfileSchema.safeParse({ socials: { instagram: "kiki.art" } }).success).toBe(true);
  });
});

describe("checkUsernameSchema", () => {
  it("reuses usernameSchema's reserved-name rejection", () => {
    expect(checkUsernameSchema.safeParse({ u: "dashboard" }).success).toBe(false);
  });

  it("accepts a valid username under key 'u'", () => {
    expect(checkUsernameSchema.safeParse({ u: "kiki" }).success).toBe(true);
  });
});
