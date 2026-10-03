import type { BunkTone } from "@/lib/student/attendance";

/** Palette roles for each bunk-budget state. */
export const BUNK_TONE_STYLE: Record<BunkTone, { badge: string; number: string }> = {
  safe: { badge: "bg-secondary-container text-on-secondary-container", number: "text-secondary-accent" },
  edge: { badge: "bg-warning-container text-on-warning-container", number: "text-warning-accent" },
  risk: { badge: "bg-danger-container text-on-danger-container", number: "text-danger-accent" },
  pending: { badge: "bg-surface-highest text-on-surface-muted", number: "text-on-surface-muted" },
};
