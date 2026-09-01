import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicProfile, getAllUsernames } from "@/lib/data/public-profile";
import { BioPage } from "@/components/public/BioPage";

export const revalidate = 3600;

export async function generateStaticParams() {
  const usernames = await getAllUsernames();
  return usernames.map((username) => ({ username }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const profile = await getPublicProfile(username);
  if (!profile) return { title: "Profil tidak ditemukan" };

  const title = `${profile.displayName} (@${profile.username})`;
  const description = profile.bio || `Lihat semua link ${profile.displayName} di satu tempat.`;

  return {
    title,
    description,
    openGraph: { title, description, images: [`/${profile.username}/opengraph-image`] },
  };
}

export default async function UsernamePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await getPublicProfile(username);

  if (!profile) notFound();

  return <BioPage profile={profile} />;
}
