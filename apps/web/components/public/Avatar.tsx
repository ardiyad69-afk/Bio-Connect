import Image from "next/image";
import { BadgeCheck } from "lucide-react";

export function Avatar({
  src,
  displayName,
  isVerified,
  themeColor,
}: {
  src: string | null;
  displayName: string;
  isVerified: boolean;
  themeColor: string;
}) {
  const initial = displayName.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="relative h-24 w-24">
      <div
        className="absolute inset-0 rounded-full blur-md opacity-60"
        style={{ background: themeColor }}
        aria-hidden
      />
      <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-white/20 bg-white/10">
        {src ? (
          <Image src={src} alt={displayName} fill sizes="96px" className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-white/80">
            {initial}
          </div>
        )}
      </div>
      {isVerified && (
        <BadgeCheck
          className="absolute -bottom-1 -right-1 rounded-full bg-zinc-950"
          size={26}
          style={{ color: themeColor }}
          aria-label="Verified"
        />
      )}
    </div>
  );
}
