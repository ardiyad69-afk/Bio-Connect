import { Instagram, Twitter, Github, Linkedin, Youtube, Music2 } from "lucide-react";
import type { Socials } from "@repo/shared";

const SOCIAL_CONFIG: Record<
  keyof Socials,
  { icon: typeof Instagram; href: (handle: string) => string; label: string }
> = {
  instagram: { icon: Instagram, href: (h) => `https://instagram.com/${h}`, label: "Instagram" },
  twitter: { icon: Twitter, href: (h) => `https://x.com/${h}`, label: "X / Twitter" },
  tiktok: { icon: Music2, href: (h) => `https://tiktok.com/@${h}`, label: "TikTok" },
  youtube: { icon: Youtube, href: (h) => `https://youtube.com/@${h}`, label: "YouTube" },
  github: { icon: Github, href: (h) => `https://github.com/${h}`, label: "GitHub" },
  linkedin: { icon: Linkedin, href: (h) => `https://linkedin.com/in/${h}`, label: "LinkedIn" },
};

export function NeoBrutalismSocialRow({ socials }: { socials: Socials }) {
  const entries = (Object.keys(SOCIAL_CONFIG) as (keyof Socials)[])
    .map((key) => ({ key, handle: socials[key] }))
    .filter((entry): entry is { key: keyof Socials; handle: string } => Boolean(entry.handle));

  if (entries.length === 0) return null;

  return (
    <div className="flex items-center justify-center gap-3">
      {entries.map(({ key, handle }) => {
        const { icon: Icon, href, label } = SOCIAL_CONFIG[key];
        return (
          <a
            key={key}
            href={href(handle)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="flex h-10 w-10 items-center justify-center border-4 border-black bg-white text-black shadow-[3px_3px_0_0_#000] transition-transform duration-150 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0_0_#000]"
          >
            <Icon size={18} strokeWidth={2.5} />
          </a>
        );
      })}
    </div>
  );
}
