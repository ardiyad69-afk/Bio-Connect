import { like } from "drizzle-orm";
import { db } from "@repo/db";
import { users } from "@repo/db/schema";
import { env } from "../lib/env";

/** Builds a JSON POST/PATCH request against an in-memory Elysia app. */
export function jsonRequest(path: string, method: string, body?: unknown, cookie?: string | null): Request {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["content-type"] = "application/json";
  if (cookie) headers["cookie"] = cookie;

  return new Request(`http://localhost${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

/** Extracts `name=value` from a Set-Cookie response header, ready to send back as a `cookie` header. */
export function extractCookie(response: Response, name = env.SESSION_COOKIE_NAME): string | null {
  const setCookie = response.headers.getSetCookie().find((c) => c.startsWith(`${name}=`));
  return setCookie?.split(";")[0] ?? null;
}

/** Every test file uses its own email/username prefix so parallel test files never collide, and cleanup is a single scoped delete. */
export function testEmail(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}@test.bioconnect.invalid`;
}

export function testUsername(prefix: string): string {
  return `${prefix}${crypto.randomUUID().slice(0, 8)}`;
}

/** Deletes every user whose email starts with `prefix` — cascades to profiles/sessions/links via FK. */
export async function cleanupTestUsers(prefix: string): Promise<void> {
  await db.delete(users).where(like(users.email, `${prefix}%`));
}

/** `Response.json()` is typed `Promise<unknown>` by the Fetch API — this just names the expected shape at the call site. */
export function json<T>(response: Response): Promise<T> {
  return response.json() as Promise<T>;
}

export interface TestLink {
  id: string;
  title: string;
  url: string;
  sortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  clickCount: number;
}
