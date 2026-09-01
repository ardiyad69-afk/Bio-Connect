import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../app";
import { jsonRequest, extractCookie, testEmail, testUsername, cleanupTestUsers, json } from "../test/helpers";

const PREFIX = "profile-test";
const app = createApp();

describe("/profile", () => {
  const usernameA = testUsername(PREFIX);
  const usernameB = testUsername(PREFIX);
  let cookieA: string;
  let cookieB: string;

  beforeAll(async () => {
    const signupA = await app.handle(
      jsonRequest("/auth/signup", "POST", { email: testEmail(PREFIX), password: "password123", username: usernameA })
    );
    cookieA = extractCookie(signupA)!;

    const signupB = await app.handle(
      jsonRequest("/auth/signup", "POST", { email: testEmail(PREFIX), password: "password123", username: usernameB })
    );
    cookieB = extractCookie(signupB)!;
  });
  afterAll(() => cleanupTestUsers(PREFIX));

  it("GET / is 401 without a session cookie", async () => {
    const res = await app.handle(new Request("http://localhost/profile"));
    expect(res.status).toBe(401);
  });

  it("GET / returns the caller's own profile, defaulting displayName to the username", async () => {
    const res = await app.handle(new Request("http://localhost/profile", { headers: { cookie: cookieA } }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toMatchObject({ username: usernameA, displayName: usernameA });
  });

  it("PATCH / updates the caller's own profile", async () => {
    const res = await app.handle(
      jsonRequest("/profile", "PATCH", { displayName: "Kiki Amelia", bio: "hello", themeColor: "#7c3aed" }, cookieA)
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toMatchObject({ displayName: "Kiki Amelia", bio: "hello", themeColor: "#7c3aed" });
  });

  it("PATCH / rejects an invalid themeColor", async () => {
    const res = await app.handle(jsonRequest("/profile", "PATCH", { themeColor: "not-a-color" }, cookieA));
    expect(res.status).toBe(400);
  });

  it("check-username: own username is available to the logged-in owner", async () => {
    const res = await app.handle(
      new Request(`http://localhost/profile/check-username?u=${usernameA}`, { headers: { cookie: cookieA } })
    );
    const body = await res.json();
    expect(body).toEqual({ available: true });
  });

  it("check-username: another user's username is not available", async () => {
    const res = await app.handle(
      new Request(`http://localhost/profile/check-username?u=${usernameB}`, { headers: { cookie: cookieA } })
    );
    const body = await res.json();
    expect(body).toEqual({ available: false });
  });

  it("check-username: works anonymously too", async () => {
    const res = await app.handle(new Request(`http://localhost/profile/check-username?u=${usernameA}`));
    const body = await res.json();
    expect(body).toEqual({ available: false });
  });

  it("check-username: rejects a reserved name", async () => {
    const res = await app.handle(new Request("http://localhost/profile/check-username?u=dashboard"));
    const body = await json<{ available: boolean }>(res);
    expect(body.available).toBe(false);
  });
});
