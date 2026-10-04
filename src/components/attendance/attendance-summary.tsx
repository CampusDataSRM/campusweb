"use client";

import CountUp from "@/components/CountUp";
import { TIER_STYLE } from "@/constants/attendance-tiers";
import { useStudentCopy } from "@/hooks/use-student-copy";
import {
  attendanceTier,
  countBelowThreshold,
  overallAttendance,
} from "@/lib/student/attendance";
import { cn } from "@/lib/utils";
import type { UserCourse } from "@/network-calls/types";

/** Overall %, subjects, and how many are below 75%. */
export function AttendanceSummary({ courses }: { courses: UserCourse[] }) {
  const copy = useStudentCopy();
  const overall = overallAttendance(courses);
  const below = countBelowThreshold(courses);
  const tiles = [
    {
      label: copy.overallRate,
      value: (
        <>
          <CountUp to={Math.round(overall * 10) / 10} duration={0.8} />%
        </>
      ),
      tone: TIER_STYLE[attendanceTier(overall)].text,
    },
    {
      label: copy.subjects,
      value: <CountUp to={courses.length} duration={0.8} />,
      tone: "text-on-surface",
    },
    {
      label: copy.belowThreshold,
      value: <CountUp to={below} duration={0.8} />,
      tone: below > 0 ? "text-danger-accent" : "text-on-surface",
    },
  ];
  return (
    <dl className="campus-stat-strip">
      {tiles.map((tile) => (
        <div key={tile.label} className="">
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
        </div>
      ))}
    </dl>
  );
}
