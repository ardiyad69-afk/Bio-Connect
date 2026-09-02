import { treaty } from "@elysiajs/eden";
import { cookies } from "next/headers";
import { createApp } from "@repo/api/app";
import type { App } from "@repo/api/app";

// Built once per lambda instance; reused across warm invocations.
const app = createApp();

// Server-side client for Server Components and Server Actions. Eden Treaty
// accepts an Elysia instance directly and dispatches through app.handle()
// in-process — no HTTP round-trip to itself — so the only thing that still
// needs to be forwarded by hand is the session cookie, since it normally
// rides along on a browser's own fetch and there is no browser here.
export async function edenServer() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  return treaty<App>(app, {
    headers: { cookie: cookieHeader },
  });
}
