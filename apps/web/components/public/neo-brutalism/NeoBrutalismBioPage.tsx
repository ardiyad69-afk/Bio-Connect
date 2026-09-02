"use client";

import { Space_Grotesk } from "next/font/google";
import { motion, useReducedMotion } from "motion/react";
import type { PublicProfile } from "@repo/shared";
import { NeoBrutalismAvatar } from "./NeoBrutalismAvatar";
import { NeoBrutalismSocialRow } from "./NeoBrutalismSocialRow";
import { NeoBrutalismLinkCard } from "./NeoBrutalismLinkCard";
import { eden } from "@/lib/eden";

// Scoped to this theme only — the rest of the app (and the "default" bio
// page theme) stays on Inter. Bold/geometric, the standard neo-brutalism
// typeface pick.
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"] });

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export function NeoBrutalismBioPage({ profile }: { profile: PublicProfile }) {
  const shouldReduceMotion = useReducedMotion();

  function handleVisit(linkId: string) {
    void eden.links({ id: linkId }).click.post().catch(() => {});
  }

  return (
    <main
      className={`${spaceGrotesk.className} flex min-h-screen flex-col items-center bg-[#FDF6E9] px-6 py-16`}
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      <motion.div
        initial={shouldReduceMotion ? "visible" : "hidden"}
        animate="visible"
        variants={containerVariants}
        className="flex w-full max-w-md flex-col items-center gap-6"
      >
        <motion.div variants={fadeUp} className="flex flex-col items-center gap-4">
          <NeoBrutalismAvatar
            src={profile.avatarUrl}
            displayName={profile.displayName}
            isVerified={profile.isVerified}
            themeColor={profile.themeColor}
          />
          <div className="border-4 border-black bg-white px-4 py-2 text-center shadow-[4px_4px_0_0_#000]">
            <h1 className="text-xl font-bold text-black">{profile.displayName}</h1>
            {profile.bio && <p className="mt-1 max-w-sm text-sm font-medium text-black/70">{profile.bio}</p>}
          </div>
        </motion.div>

        <motion.div variants={fadeUp}>
          <NeoBrutalismSocialRow socials={profile.socials} />
        </motion.div>

        <motion.div variants={containerVariants} className="flex w-full flex-col gap-4">
          {profile.links.map((link) => (
            <NeoBrutalismLinkCard key={link.id} link={link} themeColor={profile.themeColor} onVisit={handleVisit} />
          ))}
        </motion.div>

        <motion.p variants={fadeUp} className="pt-8 text-xs font-bold uppercase tracking-wide text-black/40">
          Dibuat dengan LinkStart
        </motion.p>
      </motion.div>
    </main>
  );
}
