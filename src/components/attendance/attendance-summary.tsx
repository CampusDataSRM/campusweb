"use client";

import CountUp from "@/components/CountUp";
import { AttendanceTrack } from "@/components/ui/attendance-track";
import { TIER_STYLE } from "@/constants/attendance-tiers";
import { useStudentCopy } from "@/hooks/use-student-copy";
import {
  attendanceTier,
  countBelowThreshold,
  courseAttendance,
  overallAttendance,
} from "@/lib/student/attendance";
import { cn } from "@/lib/utils";
import type { UserCourse } from "@/network-calls/types";

const fmt = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

/**
 * Overall %, subjects, and how many are below 75% - each figure with the
 * numbers behind it, and the overall on the same segmented bar the cards use.
 */
export function AttendanceSummary({ courses }: { courses: UserCourse[] }) {
  const copy = useStudentCopy();
  const overall = overallAttendance(courses);
  const below = countBelowThreshold(courses);
  const tier = attendanceTier(overall);
  const held = courses.map(courseAttendance).filter((s) => !s.isPending);
  const present = held.reduce((sum, s) => sum + s.present, 0);
  const conducted = held.reduce((sum, s) => sum + s.conducted, 0);
  const pending = courses.length - held.length;
  const lowest = held.length ? Math.min(...held.map((s) => s.percent)) : null;
  const safe = held.filter((s) => !s.isBelowThreshold).length;

  const tiles = [
    {
      label: copy.overallRate,
      value: (
        <>
          <CountUp to={Math.round(overall * 10) / 10} duration={0.8} />%
        </>
      ),
      tone: TIER_STYLE[tier].text,
      note: `${fmt(present)} of ${fmt(conducted)} ${copy.items} attended`,
      track: held.length > 0 && (
        <AttendanceTrack
          value={overall}
          tone={
            tier === "good" ? "success" : tier === "warn" ? "warning" : "danger"
          }
        />
      ),
    },
    {
      label: copy.subjects,
      value: <CountUp to={courses.length} duration={0.8} />,
      tone: "text-on-surface",
      note:
        pending > 0
          ? `${safe} on track · ${pending} not started`
          : `${safe} on track`,
    },
    {
      label: copy.belowThreshold,
      value: <CountUp to={below} duration={0.8} />,
      tone: below > 0 ? "text-danger-accent" : "text-on-surface",
      note:
        below > 0 && lowest !== null
          ? `Lowest at ${lowest.toFixed(1)}%`
          : "Everything at or above 75%",
    },
  ];
  return (
    <dl className="campus-stat-strip">
      {tiles.map((tile) => (
        <div key={tile.label}>
          <dt className="text-xs font-semibold text-on-surface-muted sm:text-sm">
            {tile.label}
          </dt>
          <dd
            className={cn(
              "font-heading text-h2 font-extrabold tabular",
              tile.tone,
            )}
          >
            {tile.value}
          </dd>
          <dd className="campus-stat-note">{tile.note}</dd>
          {tile.track && <dd className="campus-stat-track">{tile.track}</dd>}
        </div>
      ))}
    </dl>
  );
}
