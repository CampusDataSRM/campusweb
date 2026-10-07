import type { CSSProperties } from "react";

/**
 * A segmented percentage track with the college threshold marked separately.
 * The stretch between the value and 75% is tinted: the distance still to
 * cover when below, the buffer in hand when above.
 */
export function AttendanceTrack({
  value,
  tone = "primary",
  threshold = 75,
  label = true,
}: {
  value: number;
  tone?: "primary" | "danger" | "warning" | "success";
  threshold?: number;
  /** Print the threshold under its marker; off for tight rows. */
  label?: boolean;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <span
      className="attendance-track"
      aria-hidden
      style={
        {
          "--track-value": `${clamped}%`,
          "--track-lo": `${Math.min(clamped, threshold)}%`,
          "--track-hi": `${Math.max(clamped, threshold)}%`,
          "--track-ink": `var(--${tone}-accent)`,
        } as CSSProperties
      }
    >
      <span className="attendance-track-gap" />
      <span className="attendance-track-fill" />
      <span
        className="attendance-track-target"
        style={{ left: `${threshold}%` }}
      >
        {label && <span>{threshold}%</span>}
      </span>
    </span>
  );
}
