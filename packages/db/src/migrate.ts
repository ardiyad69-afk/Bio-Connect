import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const sql = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(sql);

  // citext must exist before any migration creates a column of that type.
  // Kept out of the generated migration files so drizzle-kit's diffing
  // never tries to "manage" an extension it didn't create.
  await sql`CREATE EXTENSION IF NOT EXISTS citext`;

  await migrate(db, { migrationsFolder: "./migrations" });
  await sql.end();
  console.log("Migrations applied.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
