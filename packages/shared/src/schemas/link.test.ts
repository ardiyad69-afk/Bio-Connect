import { describe, expect, it } from "vitest";
import { createLinkSchema, updateLinkSchema, reorderLinksSchema } from "./link";

describe("createLinkSchema", () => {
  it("accepts a minimal valid link and defaults isFeatured to false", () => {
    const result = createLinkSchema.safeParse({ title: "My Website", url: "https://example.com" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.isFeatured).toBe(false);
  });

  it("rejects a missing title", () => {
    const result = createLinkSchema.safeParse({ url: "https://example.com" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid url", () => {
    const result = createLinkSchema.safeParse({ title: "My Website", url: "not-a-url" });
    expect(result.success).toBe(false);
  });

  it("trims title and url", () => {
    const result = createLinkSchema.safeParse({ title: "  My Website  ", url: "  https://example.com  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("My Website");
      expect(result.data.url).toBe("https://example.com");
    }
  });
});

describe("updateLinkSchema", () => {
  it("accepts an empty object (every field optional)", () => {
    expect(updateLinkSchema.safeParse({}).success).toBe(true);
  });

  it("accepts a partial update", () => {
    expect(updateLinkSchema.safeParse({ isActive: false }).success).toBe(true);
  });

  it("rejects an invalid url when url is provided", () => {
    expect(updateLinkSchema.safeParse({ url: "nope" }).success).toBe(false);
  });
});

describe("reorderLinksSchema", () => {
  const validId = "3fa85f64-5717-4562-b3fc-2c963f66afa6";

  it("accepts a non-empty array of uuids", () => {
    expect(reorderLinksSchema.safeParse({ orderedIds: [validId] }).success).toBe(true);
  });

  it("rejects an empty array", () => {
    expect(reorderLinksSchema.safeParse({ orderedIds: [] }).success).toBe(false);
  });

  it("rejects non-uuid strings", () => {
    expect(reorderLinksSchema.safeParse({ orderedIds: ["not-a-uuid"] }).success).toBe(false);
  });
});
