// Lightweight CSS-only counterpart to the landing page's WebGL fluid hero —
// same violet brand palette and "living" feel, without pulling Three.js
// into a simple auth form page. `drift` (defined in globals.css) respects
// the app-wide prefers-reduced-motion override already in place there.
export function AuthGradientBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-3xl dark:opacity-50"
        style={{
          background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
          animation: "drift 16s ease-in-out infinite",
        }}
      />
      <div
        className="absolute left-1/4 top-1/3 h-80 w-80 rounded-full opacity-30 blur-3xl dark:opacity-40"
        style={{
          background: "radial-gradient(circle, #a78bfa 0%, transparent 70%)",
          animation: "drift 20s ease-in-out infinite reverse",
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full opacity-25 blur-3xl dark:opacity-35"
        style={{
          background: "radial-gradient(circle, #4c1d95 0%, transparent 70%)",
          animation: "drift 24s ease-in-out infinite",
        }}
      />
    </div>
  );
}
