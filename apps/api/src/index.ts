import { Elysia } from "elysia";
import { node } from "@elysiajs/node";
import { cors } from "@elysiajs/cors";
import { env } from "./lib/env";
import { authRoutes } from "./routes/auth";
import { profileRoutes } from "./routes/profile";
import { linksRoutes } from "./routes/links";

const app = new Elysia({ adapter: node() })
  .use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    })
  )
  .get("/health", () => ({ ok: true }))
  .use(authRoutes)
  .use(profileRoutes)
  .use(linksRoutes)
  .listen(env.PORT);

console.log(`API listening on http://localhost:${env.PORT}`);

export type App = typeof app;
