"use client";

import { motion, useReducedMotion } from "motion/react";
import type { PublicProfile } from "@repo/shared";
import { Avatar } from "./Avatar";
import { SocialRow } from "./SocialRow";
import { LinkCard } from "./LinkCard";
import { eden } from "@/lib/eden";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export function DefaultBioPage({ profile }: { profile: PublicProfile }) {
  const shouldReduceMotion = useReducedMotion();

  function handleVisit(linkId: string) {
    // Fire-and-forget: click tracking must never block or fail navigation.
    void eden.links({ id: linkId }).click.post().catch(() => {});
  }

  return (
    <main
      className="flex min-h-screen flex-col items-center bg-zinc-950 px-6 py-16"
      style={{
        background: `radial-gradient(circle at 50% -10%, ${profile.themeColor}26, transparent 60%), #09090b`,
      }}
    >
      <motion.div
        initial={shouldReduceMotion ? "visible" : "hidden"}
        animate="visible"
        variants={containerVariants}
        className="flex w-full max-w-md flex-col items-center gap-6"
      >
        <motion.div variants={fadeUp} className="flex flex-col items-center gap-4">
          <Avatar
            src={profile.avatarUrl}
            displayName={profile.displayName}
            isVerified={profile.isVerified}
            themeColor={profile.themeColor}
          />
          <div className="text-center">
            <h1 className="text-xl font-semibold text-white">{profile.displayName}</h1>
            {profile.bio && <p className="mt-1 max-w-sm text-sm text-white/70">{profile.bio}</p>}
          </div>
        </motion.div>

        <motion.div variants={fadeUp}>
          <SocialRow socials={profile.socials} />
        </motion.div>

        <motion.div variants={containerVariants} className="flex w-full flex-col gap-3">
          {profile.links.map((link) => (
            <LinkCard key={link.id} link={link} themeColor={profile.themeColor} onVisit={handleVisit} />
          ))}
        </motion.div>

        <motion.p variants={fadeUp} className="pt-8 text-xs text-white/30">
          Dibuat dengan LinkStart
        </motion.p>
      </motion.div>
    </main>
  );
}
