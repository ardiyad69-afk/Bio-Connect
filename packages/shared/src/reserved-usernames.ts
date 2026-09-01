// Route segments and words that would collide with app routes or read as
// impersonation if claimable as a public /[username] profile.
export const RESERVED_USERNAMES = [
  "dashboard",
  "login",
  "signup",
  "logout",
  "api",
  "admin",
  "settings",
  "_next",
  "static",
  "public",
  "about",
  "pricing",
  "terms",
  "privacy",
  "help",
  "support",
  "explore",
  "assets",
  "images",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
] as const;

const RESERVED_SET = new Set<string>(RESERVED_USERNAMES);

export function isReservedUsername(username: string): boolean {
  return RESERVED_SET.has(username.toLowerCase());
}
