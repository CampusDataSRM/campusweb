/**
 * AmbientBackground — Floating gradient orbs that create
 * the signature Campus Web atmospheric backdrop.
 *
 * Renders 3 fixed-position, blurred circles with slow drift
 * animations. Sits behind all content at z-index -50.
 */
export function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-50 overflow-hidden"
    >
      {/* Orb 1 — Top-left, campus-text-primary tint */}
      <div
        className="campus-glow absolute -left-24 -top-24 h-[420px] w-[420px]"
        style={{
          background: "var(--campus-text-primary)",
          animation: "campus-drift-1 18s ease-in-out infinite",
        }}
      />

      {/* Orb 2 — Top-right, campus-primary tint */}
      <div
        className="campus-glow absolute -right-20 top-12 h-[360px] w-[360px]"
        style={{
          background: "var(--campus-primary)",
          animation: "campus-drift-2 22s ease-in-out infinite",
        }}
      />

      {/* Orb 3 — Bottom-left, campus-secondary tint */}
      <div
        className="campus-glow absolute -bottom-32 -left-16 h-[500px] w-[500px]"
        style={{
          background: "var(--campus-secondary)",
          filter: "blur(100px)",
          animation: "campus-drift-3 25s ease-in-out infinite",
        }}
      />
    </div>
  );
}
