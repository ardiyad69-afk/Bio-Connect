import { unstable_cache } from "next/cache";
import { eq, and } from "drizzle-orm";
import { db } from "@repo/db";
import { profiles, links } from "@repo/db/schema";
import type { PublicProfile } from "@repo/shared";

// Direct DB read from the Server Component, bypassing the API entirely —
// this is the hot path for every visit to a bio page, so it must not pay
// for an extra HTTP hop to Elysia. Tagged so a dashboard edit can invalidate
// exactly this profile via revalidateTag without flushing the whole cache.
async function fetchPublicProfile(username: string): Promise<PublicProfile | null> {
  const [profile] = await db.select().from(profiles).where(eq(profiles.username, username)).limit(1);
  if (!profile) return null;

  const profileLinks = await db
    .select()
    .from(links)
    .where(and(eq(links.profileId, profile.id), eq(links.isActive, true)))
    .orderBy(links.sortOrder);

  return {
    ...profile,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
    links: profileLinks.map((link) => ({
      ...link,
      createdAt: link.createdAt.toISOString(),
      updatedAt: link.updatedAt.toISOString(),
    })),
  };
}

export function getPublicProfile(username: string): Promise<PublicProfile | null> {
  return unstable_cache(() => fetchPublicProfile(username), [`public-profile-${username}`], {
    tags: [`profile:${username}`],
    revalidate: 3600,
  })();
}

export async function getAllUsernames(): Promise<string[]> {
  const rows = await db.select({ username: profiles.username }).from(profiles);
  return rows.map((r) => r.username);
}
