"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  // next-themes can't know the real theme until after hydration (it reads
  // localStorage client-side); rendering a fixed icon before that would
  // itself be a hydration mismatch, so render an inert placeholder first.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div aria-hidden className={cn("h-9 w-9", className)} />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border border-foreground/20 bg-background/40 text-foreground backdrop-blur-sm transition-colors hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400",
        className
      )}
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
