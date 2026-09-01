import type { z } from "zod";

export type ParseResult<T> = { success: true; data: T } | { success: false; issues: z.ZodIssue[] };

// Elysia's native validation runs on TypeBox; our schemas live in
// @repo/shared as Zod so the same definitions can be reused for client-side
// form validation. This bridges the two without duplicating shapes, and
// returns a discriminated union so callers get a properly narrowed type
// instead of relying on try/catch control flow.
export function parseBody<T extends z.ZodTypeAny>(schema: T, body: unknown): ParseResult<z.infer<T>> {
  const result = schema.safeParse(body);
  if (!result.success) {
    return { success: false, issues: result.error.issues };
  }
  return { success: true, data: result.data };
}
