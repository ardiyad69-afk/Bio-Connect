import { SESSION_COOKIE_NAME } from "@repo/shared";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const env = {
  PORT: Number(process.env.API_PORT ?? 3001),
  SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME ?? SESSION_COOKIE_NAME,
  NODE_ENV: process.env.NODE_ENV ?? "development",
  get DATABASE_URL() {
    return required("DATABASE_URL");
  },
};
