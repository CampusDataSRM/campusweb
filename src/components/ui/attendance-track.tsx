import type { CSSProperties } from "react";

/** A segmented percentage track with the college threshold marked separately. */
export function AttendanceTrack({
  value,
  tone = "primary",
}: {
  value: number;
  tone?: "primary" | "danger" | "success";
}) {
  return (
    <span
      className="attendance-track"
      aria-hidden
      style={
        {
          "--track-value": `${Math.max(0, Math.min(100, value))}%`,
          "--track-ink": `var(--${tone}-accent)`,
        } as CSSProperties
      }
    >
      <span className="attendance-track-fill" />
      <span className="attendance-track-target">
        <span>75%</span>
      </span>
    </span>
  );
}
