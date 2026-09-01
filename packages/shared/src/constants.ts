// Shared between apps/api (sets the cookie) and apps/web (forwards it from
// Server Actions back to the browser) so the two never drift apart.
export const SESSION_COOKIE_NAME = "bc_session";
export const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days
