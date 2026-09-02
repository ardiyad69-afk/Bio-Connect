import { createApp } from "@repo/api/app";

// Built once per lambda instance; reused across warm invocations of the
// same instance (Elysia's own request handling is still per-call).
const app = createApp();

// Elysia's routes are registered unprefixed — e.g. "/auth/login", not
// "/api/auth/login" — deliberately, so Eden Treaty's inferred client shape
// (client.auth.login.post()) stays identical to the two-origin version. See
// the comment on createApp() in apps/api/src/app.ts. This Route Handler
// owns the "/api" mount point instead, so it has to strip that prefix off
// the incoming request's pathname before Elysia can match anything.
function toApiRequest(request: Request): Request {
  const url = new URL(request.url);
  url.pathname = url.pathname.replace(/^\/api/, "") || "/";

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  return new Request(url.toString(), {
    method: request.method,
    headers: request.headers,
    body: hasBody ? request.body : undefined,
    // Node's fetch (undici) requires this when the body is a stream.
    ...(hasBody ? { duplex: "half" } : {}),
  } as RequestInit);
}

function handle(request: Request): Promise<Response> {
  return app.handle(toApiRequest(request));
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const PUT = handle;
export const DELETE = handle;

// argon2 (@node-rs/argon2) and postgres.js are native/Node-only — Edge
// would break both.
export const runtime = "nodejs";
// Every route here is either a mutation or reads live session/DB state;
// nothing here should be static-cached by the framework.
export const dynamic = "force-dynamic";
