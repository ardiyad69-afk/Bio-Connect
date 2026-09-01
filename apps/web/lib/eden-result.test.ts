import { describe, expect, it } from "vitest";
import { unwrapEdenResult } from "./eden-result";

interface Profile {
  id: string;
  username: string;
}

describe("unwrapEdenResult", () => {
  it("returns data when there is no network error and no in-band error field", () => {
    const profile: Profile = { id: "1", username: "kiki" };
    const result = unwrapEdenResult<Profile>(profile, null);
    expect(result).toEqual({ data: profile });
  });

  it("surfaces the network-level error message from error.value", () => {
    const result = unwrapEdenResult<Profile>(undefined, { value: { error: "Unauthorized" } });
    expect(result).toEqual({ error: "Unauthorized" });
  });

  it("falls back to a generic message when error.value has no error field", () => {
    const result = unwrapEdenResult<Profile>(undefined, { value: {} });
    expect(result).toEqual({ error: "Terjadi kesalahan" });
  });

  it("treats an in-band `{ error }` body (200 status, app-level failure) as an error", () => {
    // This is the exact shape our Elysia routes return alongside a non-2xx
    // set.status — Eden can't split it out by status alone, so the app-level
    // `error` key must be detected on `data` too, not just on the eden `error`.
    const result = unwrapEdenResult<Profile>({ error: "Profil tidak ditemukan" }, null);
    expect(result).toEqual({ error: "Profil tidak ditemukan" });
  });

  it("does not misfire on a success payload that merely contains an object", () => {
    const payload = { id: "1", username: "kiki" };
    const result = unwrapEdenResult<Profile>(payload, null);
    expect(result.error).toBeUndefined();
    expect(result.data).toEqual(payload);
  });
});
