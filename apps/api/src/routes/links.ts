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
  }, {
    detail: {
      tags: ["Links"],
      summary: "Track a click",
      description: "Public — called from the anonymous bio page, not the dashboard.",
    },
  })
  .use(requireAuth)
  .get("/", async ({ currentUserId, set }) => {
    const profileId = await getOwnProfileId(currentUserId!);
    if (!profileId) {
      set.status = 404;
      return { error: "Profil tidak ditemukan" };
    }
    return db.select().from(links).where(eq(links.profileId, profileId)).orderBy(links.sortOrder);
  }, {
    detail: {
      tags: ["Links"],
      summary: "List the current user's links",
      description: "Includes inactive links (the dashboard needs them; the public page filters them out itself).",
      security: [{ sessionCookie: [] }],
    },
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
  }, {
    body: t.Unknown(),
    detail: {
      tags: ["Links"],
      summary: "Create a link",
      description: "Appended to the end of the list (sortOrder = current max + 1).",
      security: [{ sessionCookie: [] }],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["title", "url"],
              properties: {
                title: { type: "string", minLength: 1, maxLength: 100 },
                url: { type: "string", format: "uri" },
                icon: { type: "string", maxLength: 50 },
                isFeatured: { type: "boolean", default: false },
              },
            },
            example: { title: "My Website", url: "https://example.com" },
          },
        },
      },
    },
  })
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
  }, {
    body: t.Unknown(),
    detail: {
      tags: ["Links"],
      summary: "Reorder links",
      description: "orderedIds must contain exactly the caller's own link ids — no more, no fewer.",
      security: [{ sessionCookie: [] }],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["orderedIds"],
              properties: {
                orderedIds: { type: "array", items: { type: "string", format: "uuid" }, minItems: 1 },
              },
            },
          },
        },
      },
    },
  })
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
  }, {
    body: t.Unknown(),
    detail: {
      tags: ["Links"],
      summary: "Update a link",
      description: "All fields optional. 404s if the link doesn't exist or isn't owned by the caller.",
      security: [{ sessionCookie: [] }],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                title: { type: "string", minLength: 1, maxLength: 100 },
                url: { type: "string", format: "uri" },
                icon: { type: "string", maxLength: 50 },
                isActive: { type: "boolean" },
                isFeatured: { type: "boolean" },
              },
            },
            example: { isActive: false },
          },
        },
      },
    },
  })
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
  }, {
    detail: {
      tags: ["Links"],
      summary: "Delete a link",
      security: [{ sessionCookie: [] }],
    },
  });
