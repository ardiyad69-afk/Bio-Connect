// Our Elysia routes return `{ error: string }` bodies alongside a non-2xx
// `set.status` instead of using Elysia's `status()` response-schema helper,
// so Eden can't statically split success from error by HTTP status — `data`
// is typed as a union that still includes the error shape. This narrows it
// by hand, and bridges the one real mismatch: Eden's inferred type reflects
// the handler's TS return shape (Date objects), while the actual wire
// format after JSON parsing matches our shared types (ISO date strings).
export function unwrapEdenResult<T>(
  data: unknown,
  error: { value?: unknown } | null
): { data: T; error?: undefined } | { data?: undefined; error: string } {
  if (error) {
    const value = error.value as { error?: string } | undefined;
    return { error: value?.error ?? "Terjadi kesalahan" };
  }

  if (data && typeof data === "object" && "error" in data) {
    return { error: String((data as { error: unknown }).error) };
  }

  return { data: data as T };
}
