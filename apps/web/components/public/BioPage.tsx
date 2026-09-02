import type { PublicProfile } from "@repo/shared";
import { DefaultBioPage } from "./DefaultBioPage";
import { NeoBrutalismBioPage } from "./neo-brutalism/NeoBrutalismBioPage";

// Public page template dispatch — `profile.theme` picks the whole visual
// system (fonts, motion, card/border treatment), independent of the app's
// own dark/light chrome toggle and of `themeColor` (the accent color a
// template renders with).
export function BioPage({ profile }: { profile: PublicProfile }) {
  if (profile.theme === "neo-brutalism") {
    return <NeoBrutalismBioPage profile={profile} />;
  }
  return <DefaultBioPage profile={profile} />;
}
