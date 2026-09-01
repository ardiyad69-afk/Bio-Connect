import { Elysia, t } from "elysia";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@repo/db";
import { links, profiles } from "@repo/db/schema";
import { createLinkSchema, updateLinkSchema, reorderLinksSchema } from "@repo/shared";
import { parseBody } from "../lib/validate";
import { requireAuth } from "../middleware/auth";

async function getOwnProfileId(userId: string): Promise<string | null> {
  const [profile] = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.userId, userId)).limit(1);
  return profile?.id ?? null;
}

export const linksRoutes = new Elysia({ prefix: "/links" })
  // Public: click tracking is called from the anonymous bio page, not the
  // dashboard, so it sits outside the requireAuth boundary.
  .post("/:id/click", async ({ params, set }) => {
    const [updated] = await db
      .update(links)
      .set({ clickCount: sql`${links.clickCount} + 1` })
      .where(eq(links.id, params.id))
      .returning({ id: links.id });

    if (!updated) {
      set.status = 404;
      return { error: "Link tidak ditemukan" };
    }
    set.status = 204;
  })
  .use(requireAuth)
  .get("/", async ({ currentUserId, set }) => {
    const profileId = await getOwnProfileId(currentUserId!);
    if (!profileId) {
      set.status = 404;
      return { error: "Profil tidak ditemukan" };
    }
    return db.select().from(links).where(eq(links.profileId, profileId)).orderBy(links.sortOrder);
  })
  .post("/", async ({ currentUserId, body, set }) => {
    const parsed = parseBody(createLinkSchema, body);
    if (!parsed.success) {
      set.status = 400;
      return { error: "Validation failed", issues: parsed.issues };
    }
    const input = parsed.data;

    const profileId = await getOwnProfileId(currentUserId!);
    if (!profileId) {
      set.status = 404;
      return { error: "Profil tidak ditemukan" };
    }

    const [{ maxOrder } = { maxOrder: -1 }] = await db
      .select({ maxOrder: sql<number>`coalesce(max(${links.sortOrder}), -1)` })
      .from(links)
      .where(eq(links.profileId, profileId));

    const [created] = await db
      .insert(links)
      .values({ ...input, profileId, sortOrder: maxOrder + 1 })
      .returning();

    set.status = 201;
    return created;
  }, { body: t.Unknown() })
  .patch("/reorder", async ({ currentUserId, body, set }) => {
    const parsed = parseBody(reorderLinksSchema, body);
    if (!parsed.success) {
      set.status = 400;
      return { error: "Validation failed", issues: parsed.issues };
    }
    const input = parsed.data;

    const profileId = await getOwnProfileId(currentUserId!);
    if (!profileId) {
      set.status = 404;
      return { error: "Profil tidak ditemukan" };
    }

    const owned = await db.select({ id: links.id }).from(links).where(eq(links.profileId, profileId));
    const ownedIds = new Set(owned.map((l) => l.id));
    if (!input.orderedIds.every((id) => ownedIds.has(id)) || input.orderedIds.length !== ownedIds.size) {
      set.status = 400;
      return { error: "orderedIds harus mencakup persis seluruh link milik profil ini" };
    }

    await db.transaction(async (tx) => {
      for (const [index, id] of input.orderedIds.entries()) {
        await tx.update(links).set({ sortOrder: index }).where(eq(links.id, id));
      }
    });

    return { ok: true };
  }, { body: t.Unknown() })
  .patch("/:id", async ({ currentUserId, params, body, set }) => {
    const parsed = parseBody(updateLinkSchema, body);
    if (!parsed.success) {
      set.status = 400;
      return { error: "Validation failed", issues: parsed.issues };
    }
    const input = parsed.data;

    const profileId = await getOwnProfileId(currentUserId!);
    if (!profileId) {
      set.status = 404;
      return { error: "Profil tidak ditemukan" };
    }

    const [updated] = await db
      .update(links)
      .set({ ...input, updatedAt: new Date() })
      .where(and(eq(links.id, params.id), eq(links.profileId, profileId)))
      .returning();

    if (!updated) {
      set.status = 404;
      return { error: "Link tidak ditemukan" };
    }
    return updated;
  }, { body: t.Unknown() })
  .delete("/:id", async ({ currentUserId, params, set }) => {
    const profileId = await getOwnProfileId(currentUserId!);
    if (!profileId) {
      set.status = 404;
      return { error: "Profil tidak ditemukan" };
    }

    const [deleted] = await db
      .delete(links)
      .where(and(eq(links.id, params.id), eq(links.profileId, profileId)))
      .returning({ id: links.id });

    if (!deleted) {
      set.status = 404;
      return { error: "Link tidak ditemukan" };
    }
    set.status = 204;
  });
