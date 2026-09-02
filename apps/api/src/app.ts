import { Elysia } from "elysia";
import { node } from "@elysiajs/node";
import { swagger } from "@elysiajs/swagger";
import { env } from "./lib/env";
import { authRoutes } from "./routes/auth";
import { profileRoutes } from "./routes/profile";
import { linksRoutes } from "./routes/links";

// Separated from index.ts so tests can `.handle()` requests against a real
// app instance without binding a port — Elysia's app is a Fetch-API-style
// request handler independent of `.listen()`. Also imported directly by
// apps/web (see apps/web/app/api/[[...slugs]]/route.ts) so the API mounts
// in-process inside the Next.js deployment rather than running as its own
// server — same origin, so no CORS plugin is needed.
//
// Deliberately NOT given an `/api` prefix here: Elysia bakes its prefix
// into every route's registered path, and Eden Treaty's proxy shape
// (`client.auth.login.post()`) is derived from those paths — prefixing at
// this layer would turn every eden call site across apps/web into
// `client.api.auth.login.post()`. The `/api` segment lives only in the
// Route Handler's mount path and the browser eden client's base URL
// instead (see app/api/[[...slugs]]/route.ts and lib/eden.ts), which keeps
// this app's own route paths — and every existing eden.* call site, and
// every test in src/routes/*.test.ts — unchanged.
export function createApp() {
  return new Elysia({ adapter: node() })
    .use(
      swagger({
        path: "/swagger",
        documentation: {
          info: {
            title: "LinkStart API",
            version: "0.0.0",
            description:
              "Auth and mutation API for LinkStart. Public /[username] reads bypass this API entirely and hit Postgres directly from apps/web — see CLAUDE.md.",
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
            schemas: {
              // The one standard error shape every route in this API returns
              // on failure — see apps/api/src/lib/responses.ts.
              Error: {
                type: "object",
                required: ["error"],
                properties: {
                  error: { type: "string", description: "Human-readable error message" },
                  issues: {
                    type: "array",
                    description: "Present on 400 responses from Zod validation failures",
                    items: {
                      type: "object",
                      properties: {
                        path: { type: "array", items: { type: "string" } },
                        message: { type: "string" },
                      },
                    },
                  },
                },
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
