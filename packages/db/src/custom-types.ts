import { customType } from "drizzle-orm/pg-core";

// Postgres citext (case-insensitive text) enforces unique-ignoring-case at
// the database level, so `/Kiki` and `/kiki` can never both exist as rows
// even if application-layer normalization is ever bypassed.
export const citext = customType<{ data: string }>({
  dataType() {
    return "citext";
  },
});
