"use server";

import { revalidateTag } from "next/cache";
import type { CreateLinkInput, Link as LinkModel, UpdateLinkInput } from "@repo/shared";
import { edenServer } from "../eden-server";
import { unwrapEdenResult } from "../eden-result";

type VoidActionResult = { data: true; error?: undefined } | { data?: undefined; error: string };

function errorFrom(error: { value?: unknown }): VoidActionResult {
  const value = error.value as { error?: string } | undefined;
  return { error: value?.error ?? "Terjadi kesalahan" };
}

export async function createLinkAction(username: string, input: CreateLinkInput) {
  const client = await edenServer();
  const { data, error } = await client.links.post(input);
  const result = unwrapEdenResult<LinkModel>(data, error);
  if (result.error) return result;

  revalidateTag(`profile:${username}`);
  return result;
}

export async function updateLinkAction(username: string, id: string, input: UpdateLinkInput) {
  const client = await edenServer();
  const { data, error } = await client.links({ id }).patch(input);
  const result = unwrapEdenResult<LinkModel>(data, error);
  if (result.error) return result;

  revalidateTag(`profile:${username}`);
  return result;
}

export async function deleteLinkAction(username: string, id: string): Promise<VoidActionResult> {
  const client = await edenServer();
  const { error } = await client.links({ id }).delete();
  if (error) return errorFrom(error);

  revalidateTag(`profile:${username}`);
  return { data: true };
}

export async function reorderLinksAction(username: string, orderedIds: string[]): Promise<VoidActionResult> {
  const client = await edenServer();
  const { error } = await client.links.reorder.patch({ orderedIds });
  if (error) return errorFrom(error);

  revalidateTag(`profile:${username}`);
  return { data: true };
}
