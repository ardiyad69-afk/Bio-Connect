"use client";

import { motion } from "motion/react";
import { ExternalLink } from "lucide-react";
import type { Link as LinkModel } from "@repo/shared";

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export function LinkCard({
  link,
  themeColor,
  onVisit,
}: {
  link: LinkModel;
  themeColor: string;
  onVisit: (linkId: string) => void;
}) {
  return (
    <motion.a
      variants={itemVariants}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => onVisit(link.id)}
      className="group relative flex items-center justify-center rounded-2xl border px-6 py-4 text-center font-medium backdrop-blur-xl"
      style={
        link.isFeatured
          ? {
              borderColor: `${themeColor}66`,
              background: `linear-gradient(135deg, ${themeColor}33, ${themeColor}0d)`,
              boxShadow: `0 0 24px -8px ${themeColor}80`,
            }
          : {
              borderColor: "rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.05)",
            }
      }
    >
      <span className="truncate">{link.title}</span>
      <ExternalLink
        size={16}
        className="absolute right-4 opacity-0 transition-opacity group-hover:opacity-60"
      />
    </motion.a>
  );
}
