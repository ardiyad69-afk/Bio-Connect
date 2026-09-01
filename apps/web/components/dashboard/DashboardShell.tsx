"use client";

import { useState } from "react";
import type { Link as LinkModel, Profile } from "@repo/shared";
import { DashboardHeader } from "./DashboardHeader";
import { ProfileForm } from "./ProfileForm";
import { LinkEditor } from "./LinkEditor";
import { LivePreview } from "./LivePreview";

export function DashboardShell({
  initialProfile,
  initialLinks,
}: {
  initialProfile: Profile;
  initialLinks: LinkModel[];
}) {
  const [profile, setProfile] = useState(initialProfile);
  const [links, setLinks] = useState(initialLinks);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <DashboardHeader username={profile.username} />

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <ProfileForm profile={profile} onChange={setProfile} />
            <LinkEditor username={profile.username} links={links} onChange={setLinks} />
          </div>

          <div className="lg:sticky lg:top-6 lg:h-fit">
            <LivePreview profile={profile} links={links} />
          </div>
        </div>
      </div>
    </div>
  );
}
