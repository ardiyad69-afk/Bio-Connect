import { treaty } from "@elysiajs/eden";
import { cookies } from "next/headers";
import type { App } from "@repo/api";

// Server-side client for Server Components and Server Actions. The Next.js
// server process and the Elysia API are different origins, so the session
// cookie must be forwarded by hand — it does not ride along automatically
// the way it does for a browser-to-API fetch.
export async function edenServer() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  return treaty<App>(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001", {
    fetch: { credentials: "include" },
    headers: { cookie: cookieHeader },
  });
}
