import { Elysia } from "elysia";
import { node } from "@elysiajs/node";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { env } from "./lib/env";
import { authRoutes } from "./routes/auth";
import { profileRoutes } from "./routes/profile";
import { linksRoutes } from "./routes/links";

// Separated from index.ts so tests can `.handle()` requests against a real
// app instance without binding a port — Elysia's app is a Fetch-API-style
// request handler independent of `.listen()`.
export function createApp() {
  return new Elysia({ adapter: node() })
    .use(
      cors({
        origin: env.CORS_ORIGIN,
        credentials: true,
      })
    )
    .use(
      swagger({
        path: "/swagger",
        documentation: {
          info: {
            title: "BioConnect API",
            version: "0.0.0",
            description:
              "Auth and mutation API for BioConnect. Public /[username] reads bypass this API entirely and hit Postgres directly from apps/web — see CLAUDE.md.",
          },
          tags: [
            { name: "Auth", description: "Signup, login, session" },
            { name: "Profile", description: "The logged-in user's own profile" },
            { name: "Links", description: "CRUD + reorder + public click tracking" },
          ],
          components: {
            securitySchemes: {
              sessionCookie: {
                type: "apiKey",
                in: "cookie",
                name: env.SESSION_COOKIE_NAME,
              },
            },
          },
        },
      })
    )
    .get("/health", () => ({ ok: true }), { detail: { hide: true } })
    .use(authRoutes)
    .use(profileRoutes)
    .use(linksRoutes);
}

export type App = ReturnType<typeof createApp>;
