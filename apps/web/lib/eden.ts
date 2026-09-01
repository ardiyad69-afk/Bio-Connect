import { treaty } from "@elysiajs/eden";
import type { App } from "@repo/api";

// Browser-side client: cookies travel automatically because this is a
// same-site fetch from the user's own browser to the API origin.
export const eden = treaty<App>(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001", {
  fetch: { credentials: "include" },
});
