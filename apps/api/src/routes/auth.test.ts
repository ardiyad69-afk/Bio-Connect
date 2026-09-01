import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../app";
import { jsonRequest, extractCookie, testEmail, testUsername, cleanupTestUsers } from "../test/helpers";

const PREFIX = "auth-test";
const app = createApp();

describe("POST /auth/signup", () => {
  afterAll(() => cleanupTestUsers(PREFIX));

  it("creates a user + profile and sets the session cookie", async () => {
    const email = testEmail(PREFIX);
    const username = testUsername(PREFIX);

    const res = await app.handle(jsonRequest("/auth/signup", "POST", { email, password: "password123", username }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toMatchObject({ email, username });
    expect(extractCookie(res)).not.toBeNull();
  });

  it("rejects a reserved username", async () => {
    const res = await app.handle(
      jsonRequest("/auth/signup", "POST", { email: testEmail(PREFIX), password: "password123", username: "dashboard" })
    );
    expect(res.status).toBe(400);
  });

  it("rejects a duplicate email with 409", async () => {
    const email = testEmail(PREFIX);
    await app.handle(jsonRequest("/auth/signup", "POST", { email, password: "password123", username: testUsername(PREFIX) }));

    const res = await app.handle(
      jsonRequest("/auth/signup", "POST", { email, password: "password123", username: testUsername(PREFIX) })
    );
    expect(res.status).toBe(409);
  });

  it("rejects a duplicate username with 409", async () => {
    const username = testUsername(PREFIX);
    await app.handle(jsonRequest("/auth/signup", "POST", { email: testEmail(PREFIX), password: "password123", username }));

    const res = await app.handle(
      jsonRequest("/auth/signup", "POST", { email: testEmail(PREFIX), password: "password123", username })
    );
    expect(res.status).toBe(409);
  });
});

describe("POST /auth/login and session lifecycle", () => {
  const email = testEmail(PREFIX);
  const username = testUsername(PREFIX);
  const password = "password123";

  beforeAll(async () => {
    await app.handle(jsonRequest("/auth/signup", "POST", { email, password, username }));
  });
  afterAll(() => cleanupTestUsers(PREFIX));

  it("rejects the wrong password", async () => {
    const res = await app.handle(jsonRequest("/auth/login", "POST", { email, password: "wrong-password" }));
    expect(res.status).toBe(401);
  });

  it("logs in with the correct password and sets a cookie", async () => {
    const res = await app.handle(jsonRequest("/auth/login", "POST", { email, password }));
    expect(res.status).toBe(200);
    expect(extractCookie(res)).not.toBeNull();
  });

  it("GET /auth/me is 401 without a session cookie", async () => {
    const res = await app.handle(new Request("http://localhost/auth/me"));
    expect(res.status).toBe(401);
  });

  it("GET /auth/me returns the logged-in user with a valid cookie", async () => {
    const loginRes = await app.handle(jsonRequest("/auth/login", "POST", { email, password }));
    const cookie = extractCookie(loginRes);

    const meRes = await app.handle(new Request("http://localhost/auth/me", { headers: { cookie: cookie! } }));
    const body = await meRes.json();

    expect(meRes.status).toBe(200);
    expect(body).toMatchObject({ email });
  });

  it("logout revokes the session so /auth/me stops working with the same cookie", async () => {
    const loginRes = await app.handle(jsonRequest("/auth/login", "POST", { email, password }));
    const cookie = extractCookie(loginRes)!;

    const logoutRes = await app.handle(new Request("http://localhost/auth/logout", { method: "POST", headers: { cookie } }));
    expect(logoutRes.status).toBe(204);

    const meRes = await app.handle(new Request("http://localhost/auth/me", { headers: { cookie } }));
    expect(meRes.status).toBe(401);
  });
});
