"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { MotionConfig } from "motion/react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      {/* reducedMotion="user": every motion.* component in the app respects
          prefers-reduced-motion automatically. Framer Motion animates via
          JS/RAF, not CSS transition/animation, so the prefers-reduced-motion
          rule in globals.css doesn't reach it on its own — this is what does. */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </NextThemesProvider>
  );
}
