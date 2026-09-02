// Shared entrance-motion tokens — reused everywhere instead of one-off
// values per component, so the whole product moves with one consistent
// feel. EASE_OUT is the exact curve the landing hero's headline reveal
// uses; kept as the single "brand" easing rather than approximated per file.
export const EASE_OUT = [0.2, 0.65, 0.3, 0.9] as const;

// For functional pages (forms, dashboard) — short and fast so entrance
// motion never delays interaction. The hero's longer, showier reveal is
// appropriate for a one-time marketing moment, not for a page someone
// needs to start typing into immediately.
export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } },
};

export const fadeUpFast = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE_OUT } },
};

// Wrap a parent in this (initial="hidden" animate="visible") and give each
// direct child `variants={fadeUp}` — Framer Motion propagates the
// hidden/visible states down automatically, staggering each child's start.
export const staggerContainer = (staggerChildren = 0.08, delayChildren = 0) => ({
  hidden: {},
  visible: { transition: { staggerChildren, delayChildren } },
});
