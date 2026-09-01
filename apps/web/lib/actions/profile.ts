"use server";

import { revalidateTag } from "next/cache";
import type { Profile, UpdateProfileInput } from "@repo/shared";
import { edenServer } from "../eden-server";
import { unwrapEdenResult } from "../eden-result";

export async function updateProfileAction(username: string, input: UpdateProfileInput) {
  const client = await edenServer();
  const { data, error } = await client.profile.patch(input);
  const result = unwrapEdenResult<Profile>(data, error);

  if (result.error) return result;

  // Revalidates the cached public page in the same process that owns the
  // cache, so the visitor-facing /[username] reflects the edit immediately
  // without waiting for the ISR window to expire.
  revalidateTag(`profile:${username}`);
  return result;
}
