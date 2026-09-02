// Every route in this API returns `{ error: string, issues?: ZodIssue[] }`
// on failure alongside a non-2xx `set.status`, rather than Elysia's typed
// `response()` validator (see CLAUDE.md — Eden Treaty note on why). This
// documents that one standard shape once, as a named OpenAPI component
// (`Error`, registered in app.ts), and gives routes a one-liner to reference
// it for a given status instead of hand-rolling the same $ref everywhere.
export function errorResponse(description: string) {
  return {
    description,
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/Error" },
      },
    },
  };
}
