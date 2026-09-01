import { Elysia, t } from "elysia";
import { eq, and, ne } from "drizzle-orm";
import { db } from "@repo/db";
import { profiles } from "@repo/db/schema";
import { updateProfileSchema, checkUsernameSchema } from "@repo/shared";
import { parseBody } from "../lib/validate";
import { authContext, requireAuth } from "../middleware/auth";

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
      return { available: false, error: "Username tidak valid" };
    }

    const conditions = currentUserId
      ? and(eq(profiles.username, result.data.u), ne(profiles.userId, currentUserId))
      : eq(profiles.username, result.data.u);

    const [existing] = await db.select({ id: profiles.id }).from(profiles).where(conditions).limit(1);
    return { available: !existing };
  })
  .use(requireAuth)
  .get("/", async ({ currentUserId, set }) => {
    const profile = await getOwnProfile(currentUserId!);
    if (!profile) {
      set.status = 404;
      return { error: "Profil tidak ditemukan" };
    }
    return profile;
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
  }, { body: t.Unknown() });
