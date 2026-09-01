import { redirect } from "next/navigation";
import type { Link as LinkModel, Profile } from "@repo/shared";
import { edenServer } from "@/lib/eden-server";
import { unwrapEdenResult } from "@/lib/eden-result";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function DashboardPage() {
  const client = await edenServer();

  const profileResponse = await client.profile.get();
  const profile = unwrapEdenResult<Profile>(profileResponse.data, profileResponse.error).data;
  if (!profile) redirect("/login");

  const linksResponse = await client.links.get();
  const links = unwrapEdenResult<LinkModel[]>(linksResponse.data, linksResponse.error).data;

  return <DashboardShell initialProfile={profile} initialLinks={links ?? []} />;
}
