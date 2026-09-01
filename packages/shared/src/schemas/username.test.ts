import { describe, expect, it } from "vitest";
import { usernameSchema } from "./username";

describe("usernameSchema", () => {
  it("accepts a plain lowercase username", () => {
    const result = usernameSchema.safeParse("kiki");
    expect(result.success).toBe(true);
  });

  it("normalizes case and whitespace before validating", () => {
    const result = usernameSchema.safeParse("  KiKi123  ");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe("kiki123");
  });

  it("rejects usernames shorter than 3 characters", () => {
    expect(usernameSchema.safeParse("ab").success).toBe(false);
  });

  it("rejects usernames longer than 30 characters", () => {
    expect(usernameSchema.safeParse("a".repeat(31)).success).toBe(false);
  });

  it("allows hyphens and underscores in the middle", () => {
    expect(usernameSchema.safeParse("ki-ki_amelia").success).toBe(true);
  });

  it("rejects a leading hyphen", () => {
    expect(usernameSchema.safeParse("-kiki").success).toBe(false);
  });

  it("rejects a trailing hyphen", () => {
    expect(usernameSchema.safeParse("kiki-").success).toBe(false);
  });

  it("rejects characters outside [a-z0-9_-]", () => {
    expect(usernameSchema.safeParse("kiki!").success).toBe(false);
    expect(usernameSchema.safeParse("kiki amelia").success).toBe(false);
  });

  it("rejects route-colliding reserved names, case-insensitively", () => {
    expect(usernameSchema.safeParse("dashboard").success).toBe(false);
    expect(usernameSchema.safeParse("Dashboard").success).toBe(false);
    expect(usernameSchema.safeParse("login").success).toBe(false);
  });
});
