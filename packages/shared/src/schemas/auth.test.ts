import { describe, expect, it } from "vitest";
import { signupSchema, loginSchema } from "./auth";

describe("signupSchema", () => {
  it("normalizes email casing and whitespace", () => {
    const result = signupSchema.safeParse({
      email: "  Kiki@Example.com  ",
      password: "password123",
      username: "kiki",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("kiki@example.com");
  });

  it("rejects an invalid email", () => {
    const result = signupSchema.safeParse({
      email: "not-an-email",
      password: "password123",
      username: "kiki",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = signupSchema.safeParse({
      email: "kiki@example.com",
      password: "short",
      username: "kiki",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a reserved username", () => {
    const result = signupSchema.safeParse({
      email: "kiki@example.com",
      password: "password123",
      username: "admin",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts an email + non-empty password", () => {
    const result = loginSchema.safeParse({ email: "kiki@example.com", password: "anything" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({ email: "kiki@example.com", password: "" });
    expect(result.success).toBe(false);
  });
});
