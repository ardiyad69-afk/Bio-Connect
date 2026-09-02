import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// Single shared connection pool. Reused by both apps/api (mutations) and
// apps/web Server Components (direct reads for the public /[username] path).
// `max: 1` + `prepare: false` target a pooled connection string (PgBouncer
// in transaction mode, e.g. Neon's `-pooler` host): one connection per
// serverless instance and no prepared-statement reuse across pooled
// connections, which PgBouncer transaction mode can't support. Harmless
// against a direct (non-pooled) Postgres too — just less parallel query
// throughput per process, which doesn't matter at this scale.
const queryClient = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });

export const db = drizzle(queryClient, { schema });
export type Database = typeof db;
