import { Elysia } from "elysia";
import { validateSession } from "../lib/session";
import { env } from "../lib/env";

// Attaches `currentUserId` (nullable) to context for every route. Public
// routes can read it optionally; protected routes layer `requireAuth` on top.
export const authContext = new Elysia({ name: "auth-context" }).derive(
  { as: "global" },
  async ({ cookie }) => {
    const token = cookie[env.SESSION_COOKIE_NAME]?.value as string | undefined;
    if (!token) return { currentUserId: null as string | null };

    const session = await validateSession(token);
    return { currentUserId: session?.userId ?? null };
  }
);

export const requireAuth = new Elysia({ name: "require-auth" })
  .use(authContext)
  // "scoped", not "global": this must reach the routes defined after
  // `.use(requireAuth)` in whichever router imports it (one level up), but
  // must not leak further into the root app and start guarding unrelated
  // public routes like POST /links/:id/click.
  .onBeforeHandle({ as: "scoped" }, ({ currentUserId, set }) => {
    if (!currentUserId) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
  });
