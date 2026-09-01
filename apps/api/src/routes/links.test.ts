import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../app";
import { jsonRequest, extractCookie, testEmail, testUsername, cleanupTestUsers, json, type TestLink } from "../test/helpers";

const PREFIX = "links-test";
const app = createApp();

async function signup(): Promise<string> {
  const res = await app.handle(
    jsonRequest("/auth/signup", "POST", {
      email: testEmail(PREFIX),
      password: "password123",
      username: testUsername(PREFIX),
    })
  );
  return extractCookie(res)!;
}

describe("/links", () => {
  let cookieA: string;
  let cookieB: string;

  beforeAll(async () => {
    cookieA = await signup();
    cookieB = await signup();
  });
  afterAll(() => cleanupTestUsers(PREFIX));

  it("GET / is 401 without a session cookie", async () => {
    const res = await app.handle(new Request("http://localhost/links"));
    expect(res.status).toBe(401);
  });

  it("POST / creates a link at sortOrder 0, then the next one at sortOrder 1", async () => {
    const first = await app.handle(jsonRequest("/links", "POST", { title: "First", url: "https://example.com/1" }, cookieA));
    const firstBody = await json<TestLink>(first);
    expect(first.status).toBe(201);
    expect(firstBody).toMatchObject({ title: "First", sortOrder: 0, isActive: true, isFeatured: false, clickCount: 0 });

    const second = await app.handle(jsonRequest("/links", "POST", { title: "Second", url: "https://example.com/2" }, cookieA));
    const secondBody = await json<TestLink>(second);
    expect(secondBody.sortOrder).toBe(1);
  });

  it("rejects an invalid url on create", async () => {
    const res = await app.handle(jsonRequest("/links", "POST", { title: "Bad", url: "not-a-url" }, cookieA));
    expect(res.status).toBe(400);
  });

  it("GET / lists only the caller's own links, in sortOrder", async () => {
    const res = await app.handle(new Request("http://localhost/links", { headers: { cookie: cookieA } }));
    const body = await json<TestLink[]>(res);
    expect(body.map((l) => l.title)).toEqual(["First", "Second"]);
  });

  it("PATCH /:id toggles isActive", async () => {
    const list = await app.handle(new Request("http://localhost/links", { headers: { cookie: cookieA } }));
    const [link] = await json<TestLink[]>(list);

    const res = await app.handle(jsonRequest(`/links/${link!.id}`, "PATCH", { isActive: false }, cookieA));
    const body = await json<TestLink>(res);
    expect(body.isActive).toBe(false);
  });

  it("PATCH /reorder rewrites sortOrder to match the given order", async () => {
    const list = await app.handle(new Request("http://localhost/links", { headers: { cookie: cookieA } }));
    const links = await json<TestLink[]>(list);
    const reversedIds = links.map((l) => l.id).reverse();

    const reorderRes = await app.handle(jsonRequest("/links/reorder", "PATCH", { orderedIds: reversedIds }, cookieA));
    expect(reorderRes.status).toBe(200);

    const after = await app.handle(new Request("http://localhost/links", { headers: { cookie: cookieA } }));
    const afterBody = await json<TestLink[]>(after);
    expect(afterBody.map((l) => l.id)).toEqual(reversedIds);
  });

  it("PATCH /reorder rejects a set of ids that doesn't match the caller's own links exactly", async () => {
    const res = await app.handle(
      jsonRequest("/links/reorder", "PATCH", { orderedIds: ["00000000-0000-0000-0000-000000000000"] }, cookieA)
    );
    expect(res.status).toBe(400);
  });

  it("ownership isolation: user B can't PATCH user A's link (404, not leaked as 200)", async () => {
    const listA = await app.handle(new Request("http://localhost/links", { headers: { cookie: cookieA } }));
    const [linkA] = await json<TestLink[]>(listA);

    const res = await app.handle(jsonRequest(`/links/${linkA!.id}`, "PATCH", { title: "Hijacked" }, cookieB));
    expect(res.status).toBe(404);
  });

  it("ownership isolation: user B can't DELETE user A's link", async () => {
    const listA = await app.handle(new Request("http://localhost/links", { headers: { cookie: cookieA } }));
    const [linkA] = await json<TestLink[]>(listA);

    const res = await app.handle(new Request(`http://localhost/links/${linkA!.id}`, { method: "DELETE", headers: { cookie: cookieB } }));
    expect(res.status).toBe(404);
  });

  it("DELETE /:id removes the link", async () => {
    const before = await app.handle(new Request("http://localhost/links", { headers: { cookie: cookieA } }));
    const [link] = await json<TestLink[]>(before);

    const del = await app.handle(new Request(`http://localhost/links/${link!.id}`, { method: "DELETE", headers: { cookie: cookieA } }));
    expect(del.status).toBe(204);

    const after = await app.handle(new Request("http://localhost/links", { headers: { cookie: cookieA } }));
    const afterBody = await json<TestLink[]>(after);
    expect(afterBody.find((l) => l.id === link!.id)).toBeUndefined();
  });

  describe("POST /:id/click", () => {
    // Regression test: `requireAuth`'s onBeforeHandle guard once used
    // `{ as: "global" }`, which leaked past its own plugin instance and
    // guarded every route in the merged app — including this public one,
    // defined *before* `.use(requireAuth)` in the same file. Caught only by
    // manually curling the endpoint after deploying; this pins it down.
    it("is public — works with no session cookie at all", async () => {
      const create = await app.handle(jsonRequest("/links", "POST", { title: "Clickable", url: "https://example.com" }, cookieA));
      const link = await json<TestLink>(create);

      const clickRes = await app.handle(new Request(`http://localhost/links/${link.id}/click`, { method: "POST" }));
      expect(clickRes.status).toBe(204);

      const list = await app.handle(new Request("http://localhost/links", { headers: { cookie: cookieA } }));
      const links = await json<TestLink[]>(list);
      const updated = links.find((l) => l.id === link.id);
      expect(updated!.clickCount).toBe(1);
    });

    it("returns 404 for a link id that doesn't exist", async () => {
      const res = await app.handle(
        new Request("http://localhost/links/00000000-0000-0000-0000-000000000000/click", { method: "POST" })
      );
      expect(res.status).toBe(404);
    });
  });
});
