import { Elysia, t } from "elysia";
import { eq, and, ne } from "drizzle-orm";
import { db } from "@repo/db";
import { profiles } from "@repo/db/schema";
import { updateProfileSchema, checkUsernameSchema } from "@repo/shared";
import { parseBody } from "../lib/validate";
import { authContext, requireAuth } from "../middleware/auth";
import { errorResponse } from "../lib/responses";

async function getOwnProfile(userId: string) {
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  return profile ?? null;
}

export const profileRoutes = new Elysia({ prefix: "/profile" })
  .use(authContext)
  .get("/check-username", async ({ query, currentUserId, set }) => {
    const result = checkUsernameSchema.safeParse(query);
    if (!result.success) {
      set.status = 400;
      return { error: "Username tidak valid" };
    }

    const conditions = currentUserId
      ? and(eq(profiles.username, result.data.u), ne(profiles.userId, currentUserId))
      : eq(profiles.username, result.data.u);

    const [existing] = await db.select({ id: profiles.id }).from(profiles).where(conditions).limit(1);
    return { available: !existing };
  }, {
    detail: {
      tags: ["Profile"],
      summary: "Check username availability",
      description: "Public. If called while logged in, the caller's own username doesn't count as taken.",
      responses: {
        200: { description: "`{ available: boolean }`" },
        400: errorResponse("`u` query param missing or malformed"),
      },
    },
  })
  .use(requireAuth)
  .get("/", async ({ currentUserId, set }) => {
    const profile = await getOwnProfile(currentUserId!);
    if (!profile) {
      set.status = 404;
      return { error: "Profil tidak ditemukan" };
    }
    return profile;
  }, {
    detail: {
      tags: ["Profile"],
      summary: "Get the current user's profile",
      security: [{ sessionCookie: [] }],
      responses: {
        200: { description: "The caller's `Profile`" },
        401: errorResponse("No active session"),
        404: errorResponse("Session valid but no profile row exists for this user"),
      },
    },
  })
  .patch("/", async ({ currentUserId, body, set }) => {
    const parsed = parseBody(updateProfileSchema, body);
    if (!parsed.success) {
      set.status = 400;
      return { error: "Validation failed", issues: parsed.issues };
    }
    const input = parsed.data;

    const existing = await getOwnProfile(currentUserId!);
    if (!existing) {
      set.status = 404;
      return { error: "Profil tidak ditemukan" };
    }

    const [updated] = await db
      .update(profiles)
      .set({
        ...input,
        avatarUrl: input.avatarUrl === "" ? null : input.avatarUrl,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, existing.id))
      .returning();

    return updated;
  }, {
    body: t.Unknown(),
    detail: {
      tags: ["Profile"],
      summary: "Update the current user's profile",
      description: "All fields optional — only send what changed. `avatarUrl: \"\"` clears the avatar.",
      security: [{ sessionCookie: [] }],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                displayName: { type: "string", minLength: 1, maxLength: 60 },
                bio: { type: "string", maxLength: 280 },
                avatarUrl: { type: "string" },
                themeColor: { type: "string", pattern: "^#[0-9a-fA-F]{6}$" },
                socials: {
                  type: "object",
                  properties: {
                    instagram: { type: "string" },
                    twitter: { type: "string" },
                    tiktok: { type: "string" },
                    youtube: { type: "string" },
                    github: { type: "string" },
                    linkedin: { type: "string" },
                  },
                },
              },
            },
            example: { displayName: "Kiki Amelia", bio: "Content creator", themeColor: "#7c3aed" },
          },
        },
      },
      responses: {
        200: { description: "The updated `Profile`" },
        400: errorResponse("Validation failed"),
        401: errorResponse("No active session"),
        404: errorResponse("Session valid but no profile row exists for this user"),
      },
    },
  });
