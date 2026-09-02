import { treaty } from "@elysiajs/eden";
import type { App } from "@repo/api/app";

// Browser-side client. The API is mounted in-process inside this same
// Next.js deployment, at /api (see app/api/[[...slugs]]/route.ts) — so this
// is always a same-origin fetch and cookies travel automatically. The `/api`
// segment lives only in this base URL, not in the App type's route paths
// (see the comment on createApp() in apps/api/src/app.ts for why), so
// `eden.auth.login.post()` etc. are unchanged from the two-origin version.
export const eden = treaty<App>(
  typeof window === "undefined" ? "/api" : `${window.location.origin}/api`,
  { fetch: { credentials: "include" } }
);
