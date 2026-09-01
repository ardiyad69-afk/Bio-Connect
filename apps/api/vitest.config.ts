import { readFileSync } from "node:fs";
import { defineConfig } from "vitest/config";

// Route tests hit the real dev Postgres via @repo/db, so DATABASE_URL (and
// friends) need to come from apps/api/.env the same way `tsx --env-file=.env`
// loads them for `pnpm dev`. `test.env` (not process.env here) is what
// actually reaches the worker that runs the tests.
function loadDotEnv(path: string): Record<string, string> {
  const env: Record<string, string> = {};
  let content: string;
  try {
    content = readFileSync(path, "utf-8");
  } catch {
    return env;
  }

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    env[key] = value;
  }
  return env;
}

export default defineConfig({
  test: {
    env: loadDotEnv(new URL(".env", import.meta.url).pathname),
  },
});
