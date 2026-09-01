import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// Single shared connection pool. Reused by both apps/api (mutations) and
// apps/web Server Components (direct reads for the public /[username] path).
const queryClient = postgres(process.env.DATABASE_URL);

export const db = drizzle(queryClient, { schema });
export type Database = typeof db;
