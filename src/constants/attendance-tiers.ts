import type { AttendanceTier } from "@/lib/student/attendance";

/** Palette roles per attendance tier - for charts (CSS variables) and text. */
export const TIER_STYLE: Record<
  AttendanceTier,
  { stroke: string; text: string; container: string }
> = {
  good: { stroke: "var(--success-accent)", text: "text-success-accent", container: "bg-success-container text-on-success-container" },
  warn: { stroke: "var(--warning-accent)", text: "text-warning-accent", container: "bg-warning-container text-on-warning-container" },
  bad: { stroke: "var(--danger-accent)", text: "text-danger-accent", container: "bg-danger-container text-on-danger-container" },
};
