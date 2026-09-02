"use client";

import { Space_Grotesk } from "next/font/google";
import { AnimatePresence, motion } from "motion/react";
import { BadgeCheck } from "lucide-react";
import type { Link as LinkModel, Profile } from "@repo/shared";
import { SocialRow } from "@/components/public/SocialRow";
import { NeoBrutalismSocialRow } from "@/components/public/neo-brutalism/NeoBrutalismSocialRow";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"] });

export function LivePreview({ profile, links }: { profile: Profile; links: LinkModel[] }) {
  const visibleLinks = [...links].filter((l) => l.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  const initial = profile.displayName.trim().charAt(0).toUpperCase() || "?";
  const isBrutal = profile.theme === "neo-brutalism";

  return (
    <div className="mx-auto w-[300px]">
      <div className="rounded-[2.5rem] border-4 border-zinc-800 bg-zinc-800 p-2 shadow-2xl">
        <div
          className={`h-[560px] overflow-y-auto rounded-[2rem] px-5 py-8 ${isBrutal ? spaceGrotesk.className : ""}`}
          style={
            isBrutal
              ? {
                  background: "#FDF6E9",
                  backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px)",
                  backgroundSize: "16px 16px",
                }
              : {
                  background: `radial-gradient(circle at 50% -10%, ${profile.themeColor}26, transparent 60%), #09090b`,
                }
          }
        >
          <div className="flex flex-col items-center gap-4">
            {isBrutal ? (
              <div className="relative h-16 w-16 -rotate-2">
                <div
                  className="h-full w-full overflow-hidden border-2 border-black shadow-[3px_3px_0_0_#000]"
                  style={{ backgroundColor: profile.themeColor }}
                >
                  {profile.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-extrabold text-black">
                      {initial}
                    </div>
                  )}
                </div>
                {profile.isVerified && (
                  <div
                    className="absolute -bottom-1.5 -right-1.5 flex h-5 w-5 rotate-6 items-center justify-center border-2 border-black"
                    style={{ backgroundColor: profile.themeColor }}
                  >
                    <BadgeCheck size={11} className="text-black" strokeWidth={3} />
                  </div>
                )}
              </div>
            ) : (
              <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-white/20 bg-white/10">
                {profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-white/80">
                    {initial}
                  </div>
                )}
                {profile.isVerified && (
                  <BadgeCheck
                    className="absolute -bottom-1 -right-1 rounded-full bg-zinc-950"
                    size={16}
                    style={{ color: profile.themeColor }}
                  />
                )}
              </div>
            )}

            {isBrutal ? (
              <div className="border-2 border-black bg-white px-3 py-1.5 text-center shadow-[2px_2px_0_0_#000]">
                <p className="text-sm font-bold text-black">{profile.displayName || "Nama kamu"}</p>
                {profile.bio && <p className="mt-0.5 text-xs font-medium text-black/70">{profile.bio}</p>}
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm font-semibold text-white">{profile.displayName || "Nama kamu"}</p>
                {profile.bio && <p className="mt-1 text-xs text-white/60">{profile.bio}</p>}
              </div>
            )}

            <div className="scale-90">
              {isBrutal ? <NeoBrutalismSocialRow socials={profile.socials} /> : <SocialRow socials={profile.socials} />}
            </div>

            <div className="flex w-full flex-col gap-2.5">
              <AnimatePresence initial={false}>
                {visibleLinks.map((link) =>
                  isBrutal ? (
                    <motion.div
                      key={link.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className="border-2 bg-white px-4 py-2.5 text-center text-xs font-bold text-black shadow-[3px_3px_0_0_var(--nb-shadow)]"
                      style={{
                        borderColor: link.isFeatured ? profile.themeColor : "#000",
                        "--nb-shadow": link.isFeatured ? profile.themeColor : "#000",
                      } as React.CSSProperties}
                    >
                      {link.title || "Judul link"}
                    </motion.div>
                  ) : (
                    <motion.div
                      key={link.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 350, damping: 28 }}
                      className="rounded-xl border px-4 py-2.5 text-center text-xs font-medium text-white"
                      style={
                        link.isFeatured
                          ? {
                              borderColor: `${profile.themeColor}66`,
                              background: `linear-gradient(135deg, ${profile.themeColor}33, ${profile.themeColor}0d)`,
                            }
                          : { borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)" }
                      }
                    >
                      {link.title || "Judul link"}
                    </motion.div>
                  )
                )}
              </AnimatePresence>

              {visibleLinks.length === 0 && (
                <p className={`py-6 text-center text-xs ${isBrutal ? "font-medium text-black/40" : "text-white/30"}`}>
                  Link akan muncul di sini
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-foreground/30">Live preview</p>
    </div>
  );
}
