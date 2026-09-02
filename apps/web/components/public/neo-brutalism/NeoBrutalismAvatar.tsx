import Image from "next/image";
import { BadgeCheck } from "lucide-react";

export function NeoBrutalismAvatar({
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
    <div className="relative h-28 w-28 -rotate-2">
      <div
        className="h-full w-full overflow-hidden border-4 border-black shadow-[6px_6px_0_0_#000]"
        style={{ backgroundColor: themeColor }}
      >
        {src ? (
          <Image src={src} alt={displayName} fill sizes="112px" className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl font-extrabold text-black">
            {initial}
          </div>
        )}
      </div>
      {isVerified && (
        <div
          className="absolute -bottom-2 -right-2 flex h-9 w-9 rotate-6 items-center justify-center border-4 border-black shadow-[3px_3px_0_0_#000]"
          style={{ backgroundColor: themeColor }}
          aria-label="Verified"
        >
          <BadgeCheck size={18} className="text-black" strokeWidth={2.5} />
        </div>
      )}
    </div>
  );
}
