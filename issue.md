# Deploying LinkStart free on Vercel

Plan to get the whole product running on Vercel's Hobby (free) tier. Written
against the current `master` + `feat/linkstart-rebrand-theme-motion` state.

Everything marked **[verified]** was actually run against this repo while
writing the plan. Everything marked **[assumed]** still needs a probe before
you rely on it.

---

## 1. Goal

One Vercel project, zero paid add-ons, no separate always-on server.

## 2. Why the current shape doesn't fit

Three concrete blockers, in order of severity.

**a. `apps/api` is a long-running server.** `apps/api/src/index.ts` calls
`createApp().listen(env.PORT)`. Vercel has no place to put a process that
holds a port open — its Node runtime invokes a *handler per request*. So the
API cannot be deployed as-is at all, on any tier.

**b. There is no free Postgres on Vercel.** `docker-compose.yml` is
local-only. Vercel Postgres is a paid marketplace add-on now; the free path
is an external provider.

**c. `postgres.js` opens a TCP pool per instance.** `packages/db/src/client.ts`
calls `postgres(DATABASE_URL)` with default settings. Under serverless, every
warm instance holds its own pool, and a traffic spike exhausts the connection
limit of any free-tier database almost immediately.

Two smaller ones that bite later:

- The build queries the database. `apps/web/app/[username]/page.tsx` exports
  `generateStaticParams()`, which calls `getAllUsernames()`. **[verified]** —
  `pnpm --filter @repo/web build` prerenders `/budi`, `/sari`, `/testuser`.
  So `DATABASE_URL` must be present at *build* time, not just runtime.
- `@node-rs/argon2` is a native `.node` binary. Next.js will try to bundle it
  and fail unless it is explicitly externalized.

## 3. Target architecture

Mount Elysia *inside* Next.js as a catch-all Route Handler, and deploy only
`apps/web`.

```
        ┌──────────────── Vercel project (apps/web) ───────────────┐
        │                                                          │
 GET /  │  Next.js App Router                                      │
 ─────► │    /[username]      ── direct DB read (unstable_cache)  ─┼──► Neon
        │    /dashboard       ── Server Actions                    │   (pooled)
        │    /api/[[...slugs]] ── Elysia via app.handle(request)  ─┼──►
        │                                                          │
        └──────────────────────────────────────────────────────────┘
```

`apps/api` stops being a deployable app and becomes a library package: it
still owns every route, every test, and the Swagger spec — it just no longer
binds a port.

### Why this over keeping the split

The alternative is web on Vercel + API on Railway/Render/Fly and only that
last one is genuinely free-forever-ish. Collapsing to one origin is better
here because it *deletes* work rather than relocating it:

| Deleted by collapsing | Where it lives today |
| --- | --- |
| CORS config | `apps/api/src/app.ts`, `env.CORS_ORIGIN` |
| Cross-origin cookie forwarding | `apps/web/lib/actions/auth.ts` `forwardSessionCookie()` |
| `NEXT_PUBLIC_API_URL` plumbing | `lib/eden.ts`, `lib/eden-server.ts`, `lib/actions/auth.ts` |
| Second dev process + `API_PORT` | root `dev` script, `apps/api/.env` |
| Two `.env` files drifting apart | `apps/api/.env`, `apps/web/.env` |

Cost: you lose the ability to scale or deploy the API independently. At this
scale that is not a real loss — and `createApp()` stays intact, so reversing
the decision later means re-adding `index.ts`'s `.listen()`, nothing more.

### The load-bearing assumption, checked

The whole plan rests on Elysia behaving correctly when driven as
`Request -> Response` instead of via `.listen()`. **[verified]** — probed
directly against `createApp()` with the current `@elysiajs/node` adapter:

```
HEALTH: 200 {"ok":true}
LOGIN:  200 {"id":"…","email":"kiki@example.com"}
SET-COOKIE (getSetCookie): ["bc_session=…; Max-Age=2592000; Path=/; HttpOnly; SameSite=Lax"]
ME:     200 {"id":"…","email":"kiki@example.com"}   ← cookie replayed back in
LINKS:  200 [{…}]                                    ← DB-backed route
```

So `Set-Cookie` survives onto the returned `Response`, `getSetCookie()` reads
it, and the token round-trips. That is exactly what both the Route Handler and
the rewritten `auth.ts` Server Action need. The node adapter did **not** need
to be removed for this to work.

---

## 4. Phases

### Phase 1 — Database on Neon

1. Create a Neon project (free tier). Pick the region closest to your Vercel
   function region.
2. Copy the **pooled** connection string — the host contains `-pooler`. Using
   the direct (non-pooled) string is the single most likely way to take this
   deployment down under load.
3. Teach the client about connection pooling. In `packages/db/src/client.ts`:

   ```ts
   const queryClient = postgres(process.env.DATABASE_URL, {
     // PgBouncer in transaction mode cannot replay prepared statements.
     prepare: false,
     // One connection per serverless instance; the pooler does the fan-out.
     max: 1,
   });
   ```

   `prepare: false` is mandatory, not a tuning knob — without it queries fail
   intermittently once PgBouncer starts reusing server connections.

4. Point a local shell at Neon and run `pnpm db:migrate`. `packages/db/src/migrate.ts`
   issues `CREATE EXTENSION citext` first, which Neon permits.
5. Optionally `pnpm db:seed` for the three demo profiles.

> **Do not** switch to `drizzle-orm/neon-http`. `PATCH /links/reorder`
> (`apps/api/src/routes/links.ts:141`) uses `db.transaction()`, and the HTTP
> driver has no interactive transactions. postgres.js over the pooler keeps
> transactions working.

### Phase 2 — Mount Elysia in Next.js

1. **Add an `/api` prefix to the Elysia root.** Routes are currently defined
   at `/auth/login`, `/profile`, `/links`. Mounted under
   `app/api/[[...slugs]]/route.ts` the incoming path is `/api/auth/login`, and
   Elysia matches on the *full* path — so without a prefix every route 404s.
   In `apps/api/src/app.ts`:

   ```ts
   return new Elysia({ adapter: node(), prefix: "/api" })
   ```

   This breaks `apps/api/src/routes/*.test.ts`, which request `/auth/login`
   etc. The fix is mechanical (prepend `/api` to the request paths) but it
   touches every test file — expect it, don't be surprised by it.

2. **Export the app without the listener.** `apps/api/package.json`'s `main`
   is `./src/index.ts`, which calls `.listen()` at import time. Importing that
   from Next would try to bind a port during a request. Add an explicit
   export:

   ```json
   "exports": {
     ".": "./src/index.ts",
     "./app": "./src/app.ts"
   }
   ```

   Then switch `apps/web/lib/eden.ts` and `lib/eden-server.ts` to
   `import type { App } from "@repo/api/app"` so nothing anywhere reaches for
   the listening entrypoint.

3. **Create the Route Handler** at `apps/web/app/api/[[...slugs]]/route.ts`:

   ```ts
   import { createApp } from "@repo/api/app";

   // Module scope: built once per instance, reused across warm invocations.
   const app = createApp();
   const handler = (request: Request) => app.handle(request);

   export const GET = handler;
   export const POST = handler;
   export const PATCH = handler;
   export const DELETE = handler;
   export const PUT = handler;

   // argon2 and postgres.js are native/Node-only — Edge would break both.
   export const runtime = "nodejs";
   export const dynamic = "force-dynamic";
   ```

4. **Externalize the native and driver packages.** In `apps/web/next.config.ts`:

   ```ts
   serverExternalPackages: ["@node-rs/argon2", "postgres"],
   ```

   `@node-rs/argon2` ships a platform `.node` binary that webpack cannot
   bundle. Externalizing `postgres` additionally keeps it a single module
   instance in Node's require cache — worth doing because `apps/web` imports
   `@repo/db` directly *and* transitively through `@repo/api`, and two copies
   would mean two connection pools per instance.

5. Move `@repo/api` from `devDependencies` to `dependencies` in
   `apps/web/package.json`. It is a runtime dependency now, not a types-only
   one. **This invalidates the "type-only, erased at build time" note in
   CLAUDE.md** — see Phase 5.

6. Drop the `cors` plugin from `createApp()`. Same origin, so it is dead
   config; leaving it in invites someone to "fix" `CORS_ORIGIN` later for no
   reason.

### Phase 3 — Rewire the web app to same-origin

1. **`lib/actions/auth.ts`** — replace the cross-origin `fetch` + `Set-Cookie`
   scraping with an in-process call. The probe in §3 confirms this works:

   ```ts
   import { createApp } from "@repo/api/app";
   const app = createApp();

   const response = await app.handle(
     new Request("http://internal/api/auth/login", {
       method: "POST",
       headers: { "content-type": "application/json" },
       body: JSON.stringify(input),
     })
   );
   // response.headers.getSetCookie() → same shape forwardSessionCookie() already parses
   ```

   The origin in that URL is arbitrary — Elysia routes on pathname only. This
   removes the last need for an absolute self-URL, so a lambda never issues an
   HTTP request to itself (which on a constrained free tier both doubles the
   invocation count and risks self-deadlock at the concurrency ceiling).

2. **`lib/eden-server.ts`** — same motivation. Eden Treaty is documented as
   accepting an Elysia instance directly, `treaty<App>(app)`, which would keep
   Server Component/Action calls in-process. **[assumed]** — this one was *not*
   probed, specifically around whether forwarded `headers` still apply on the
   instance form. Verify before committing to it; if it misbehaves, fall back
   to `treaty<App>(\`https://${process.env.VERCEL_URL}\`)`, which works but pays
   the self-HTTP hop.

3. **`lib/eden.ts`** (browser) — base URL becomes the page's own origin:

   ```ts
   treaty<App>(typeof window === "undefined" ? "" : window.location.origin, {
     fetch: { credentials: "include" },
   });
   ```

4. Delete `NEXT_PUBLIC_API_URL` everywhere. Nothing should reference it after
   steps 1–3.

5. Leave `middleware.ts` alone — it only checks cookie *presence* and runs on
   the Edge runtime, neither of which this change affects.

### Phase 4 — Vercel project setup

| Setting | Value | Why |
| --- | --- | --- |
| Root Directory | `apps/web` | The only deployable |
| Include files outside root | **on** | pnpm workspace deps live at repo root |
| Install Command | `pnpm install --frozen-lockfile` | Runs at repo root |
| Build Command | `next build` (default) | |
| Node version | 22 | Matches root `engines` |

Environment variables — set for **Production, Preview, and Build**:

| Var | Value | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Neon **pooled** string | Build-time too — `generateStaticParams` needs it |
| `SESSION_COOKIE_NAME` | `bc_session` | Optional; `@repo/shared` already defaults to it |
| `NEXT_PUBLIC_SITE_URL` | `https://<project>.vercel.app` | OG images, metadata |

`NODE_ENV=production` is set by Vercel automatically, which flips the session
cookie to `secure: true` in `apps/api/src/routes/auth.ts`. Same-origin plus
`sameSite: "lax"` is correct and needs no change.

### Phase 5 — Docs and cleanup

CLAUDE.md becomes actively wrong in three places once this lands. Update, do
not leave stale:

- *"Elysia and Next.js split — not a single backend"* — it **is** one
  deployable now. The public-read-bypasses-the-API distinction survives and is
  still worth documenting; the two-origin framing does not.
- *"Session cookie crosses two processes by hand"* — it no longer does.
- *"`apps/api` is imported type-only … erased at build time"* — it is a real
  runtime import now.

Also: root `dev` script no longer needs `--parallel` across two apps, and
`apps/api`'s `build`/`start` (tsup) scripts become dead unless you want to
preserve standalone deployability.

---

## 5. Free-tier limits worth knowing up front

- **Vercel Hobby is non-commercial per Vercel's ToS.** LinkStart is
  Linktree-shaped; the moment it takes money it needs a Pro plan. Worth
  knowing now rather than at the first invoice.
- **Neon free tier autosuspends** after a few minutes idle. The first request
  after a quiet period pays a wake cost (typically sub-second). Acceptable for
  a hobby deploy, noticeable on a cold demo link.
- **`generateStaticParams` prerenders every existing username at build time.**
  Build duration grows linearly with signups. New users still render on demand
  (`dynamicParams` defaults to true), so nothing breaks — but past a few
  hundred profiles, delete `generateStaticParams` and let the ISR cache do the
  work it is already tagged for.
- Function duration on Hobby is far above what argon2 (~100ms) needs. Not a
  concern.

## 6. Residual risk

**`@node-rs/argon2` on Vercel's Lambda environment is the one item that could
force a design change.** It ships prebuilt binaries per platform and Vercel
builds on linux-x64, so it should resolve — but this was not verified against
a real deployment.

If it fails, the fallback is to rewrite `apps/api/src/lib/password.ts` on
Node's built-in `crypto.scrypt` (no native dependency, no install step).
**The catch: that invalidates every existing password hash.** It is a free
change while the only accounts are seeded demo profiles, and an expensive one
after real signups — it would need a rehash-on-successful-login migration
path. So: test argon2 on a Preview deployment *before* inviting anyone.

## 7. Verification checklist

Run against a Preview deployment before promoting:

- [ ] `pnpm typecheck`, `pnpm lint` clean
- [ ] `pnpm --filter @repo/api test` green after the `/api` prefix change
- [ ] Signup → creates user + profile, lands on dashboard with a session
- [ ] Login → logout → login again (exercises `Set-Cookie` through the handler)
- [ ] Dashboard: add / edit / toggle / delete a link
- [ ] Drag-reorder a link — this is the transaction path through the pooler
- [ ] Public `/[username]` renders, both `default` and `neo-brutalism` themes
- [ ] Edit a link, confirm the public page updates (`revalidateTag` path)
- [ ] Click a public link, confirm the click counter increments (unauthenticated
      route — the `requireAuth` scope footgun in CLAUDE.md lives here)
- [ ] `/api/swagger` loads
- [ ] Cold-start a suspended Neon branch and confirm no connection errors

## 8. Rollback

Every change is additive or reversible:

- Restore `index.ts`'s `.listen()` and redeploy `apps/api` anywhere that runs
  Node — `createApp()` is untouched by this plan.
- `DATABASE_URL` moves back to the docker-compose Postgres by editing one env
  var.
- The `/api` prefix is the only change that touches the API's public contract,
  and it is a one-line revert plus the test paths.
