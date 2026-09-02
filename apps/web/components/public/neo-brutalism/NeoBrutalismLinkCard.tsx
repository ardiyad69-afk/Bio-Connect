"use client";

import { motion } from "motion/react";
import { ExternalLink } from "lucide-react";
import type { Link as LinkModel } from "@repo/shared";

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export function NeoBrutalismLinkCard({
  link,
  themeColor,
  onVisit,
}: {
  link: LinkModel;
  themeColor: string;
  onVisit: (linkId: string) => void;
}) {
  // Text always stays black on a white card — themeColor is arbitrary per
  // creator, so it drives the border/shadow accent instead of a fill,
  // which would risk unreadable text against a light theme color.
  const shadowColor = link.isFeatured ? themeColor : "#000000";

  return (
    <motion.a
      variants={itemVariants}
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => onVisit(link.id)}
      style={{ "--nb-shadow": shadowColor, borderColor: link.isFeatured ? themeColor : "#000" } as React.CSSProperties}
      className="group relative flex items-center justify-center border-4 bg-white px-6 py-4 text-center font-bold text-black shadow-[6px_6px_0_0_var(--nb-shadow)] transition-transform duration-150 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_0_var(--nb-shadow)] active:translate-x-1 active:translate-y-1 active:shadow-[0px_0px_0_0_var(--nb-shadow)]"
    >
      <span className="truncate">{link.title}</span>
      <ExternalLink
        size={16}
        strokeWidth={3}
        className="absolute right-4 opacity-0 transition-opacity group-hover:opacity-70"
      />
    </motion.a>
  );
}
