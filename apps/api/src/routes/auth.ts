import { Elysia, t } from "elysia";
import { eq } from "drizzle-orm";
import { db } from "@repo/db";
import { users, profiles } from "@repo/db/schema";
import { signupSchema, loginSchema } from "@repo/shared";
import { hashPassword, verifyPassword } from "../lib/password";
import { createSession, revokeSession, SESSION_TTL_SECONDS } from "../lib/session";
import { parseBody } from "../lib/validate";
import { env } from "../lib/env";
import { authContext } from "../middleware/auth";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .use(authContext)
  .post("/signup", async ({ body, cookie, set }) => {
    const parsed = parseBody(signupSchema, body);
    if (!parsed.success) {
      set.status = 400;
      return { error: "Validation failed", issues: parsed.issues };
    }
    const input = parsed.data;

    const [existingEmail] = await db.select({ id: users.id }).from(users).where(eq(users.email, input.email)).limit(1);
    if (existingEmail) {
      set.status = 409;
      return { error: "Email sudah terdaftar" };
    }

    const [existingUsername] = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.username, input.username)).limit(1);
    if (existingUsername) {
      set.status = 409;
      return { error: "Username sudah dipakai" };
    }

    const passwordHash = await hashPassword(input.password);
    const [user] = await db.insert(users).values({ email: input.email, passwordHash }).returning();
    if (!user) {
      set.status = 500;
      return { error: "Gagal membuat user" };
    }

    await db.insert(profiles).values({
      userId: user.id,
      username: input.username,
      displayName: input.username,
    });

    const { token, expiresAt } = await createSession(user.id);
    cookie[env.SESSION_COOKIE_NAME]?.set({
      value: token,
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
      expires: expiresAt,
    });

    return { id: user.id, email: user.email, username: input.username };
  }, {
    body: t.Unknown(),
    detail: {
      tags: ["Auth"],
      summary: "Create an account",
      description: "Creates a user + a 1:1 profile in one call, then logs the new user in (sets the session cookie).",
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "password", "username"],
              properties: {
                email: { type: "string", format: "email" },
                password: { type: "string", minLength: 8 },
                username: { type: "string", minLength: 3, maxLength: 30, pattern: "^[a-z0-9][a-z0-9_-]*[a-z0-9]$" },
              },
            },
            example: { email: "kiki@example.com", password: "password123", username: "kiki" },
          },
        },
      },
    },
  })
  .post("/login", async ({ body, cookie, set }) => {
    const parsed = parseBody(loginSchema, body);
    if (!parsed.success) {
      set.status = 400;
      return { error: "Validation failed", issues: parsed.issues };
    }
    const input = parsed.data;

    const [user] = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
    if (!user || !(await verifyPassword(user.passwordHash, input.password))) {
      set.status = 401;
      return { error: "Email atau password salah" };
    }

    const { token, expiresAt } = await createSession(user.id);
    cookie[env.SESSION_COOKIE_NAME]?.set({
      value: token,
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
      expires: expiresAt,
    });

    return { id: user.id, email: user.email };
  }, {
    body: t.Unknown(),
    detail: {
      tags: ["Auth"],
      summary: "Log in",
      description: "Verifies email + password and sets the session cookie.",
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "password"],
              properties: {
                email: { type: "string", format: "email" },
                password: { type: "string" },
              },
            },
            example: { email: "kiki@example.com", password: "password123" },
          },
        },
      },
    },
  })
  .post("/logout", async ({ cookie, set }) => {
    const token = cookie[env.SESSION_COOKIE_NAME]?.value as string | undefined;
    if (token) {
      await revokeSession(token);
      cookie[env.SESSION_COOKIE_NAME]?.remove();
    }
    set.status = 204;
  }, {
    detail: {
      tags: ["Auth"],
      summary: "Log out",
      description: "Revokes the current session and clears the cookie.",
      security: [{ sessionCookie: [] }],
    },
  })
  .get("/me", async ({ currentUserId, set }) => {
    if (!currentUserId) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const [user] = await db.select({ id: users.id, email: users.email }).from(users).where(eq(users.id, currentUserId)).limit(1);
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    return user;
  }, {
    detail: {
      tags: ["Auth"],
      summary: "Get the current user",
      security: [{ sessionCookie: [] }],
    },
  });
