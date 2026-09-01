import { randomBytes, createHash } from "node:crypto";
import { db } from "@repo/db";
import { sessions } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import { SESSION_TTL_SECONDS as SHARED_SESSION_TTL_SECONDS } from "@repo/shared";

const SESSION_TTL_MS = SHARED_SESSION_TTL_SECONDS * 1000;
const SLIDING_REFRESH_THRESHOLD_MS = SESSION_TTL_MS / 2; // refresh once past halfway

function hashToken(token: string): string {
  // Only the hash is persisted: a leaked database dump can't be replayed
  // into a valid session cookie.
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.insert(sessions).values({
    id: hashToken(token),
    userId,
    expiresAt,
  });

  return { token, expiresAt };
}

export async function validateSession(
  token: string
): Promise<{ userId: string; expiresAt: Date } | null> {
  const id = hashToken(token);
  const [session] = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1);

  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await db.delete(sessions).where(eq(sessions.id, id));
    return null;
  }

  // Sliding expiration: extend quietly once the session is past its
  // halfway point, so an active user is never logged out mid-session.
  if (session.expiresAt.getTime() - Date.now() < SLIDING_REFRESH_THRESHOLD_MS) {
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    await db.update(sessions).set({ expiresAt }).where(eq(sessions.id, id));
    return { userId: session.userId, expiresAt };
  }

  return { userId: session.userId, expiresAt: session.expiresAt };
}

export async function revokeSession(token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, hashToken(token)));
}

export const SESSION_TTL_SECONDS = SHARED_SESSION_TTL_SECONDS;
