"use client";

import Link from "next/link";
import { useMemo } from "react";

import { ShimmerBlock } from "@/components/feedback/data-states";
import { Section } from "@/components/layout/page-header";
import { BUNK_TONE_STYLE } from "@/constants/bunk-tones";
import { STUDENT_ROUTES } from "@/constants/routes";
import { useSession } from "@/context/session-context";
import { useStudentCopy } from "@/hooks/use-student-copy";
import { useProfile } from "@/hooks/use-student-data";
import {
  ATTENDANCE_THRESHOLD,
  bunkBudget,
  courseAttendance,
  mergeTheoryPracticalCourses,
  type BunkTone,
} from "@/lib/student/attendance";
import { titleCase } from "@/lib/student/profile";
import { cn } from "@/lib/utils";

const TONE_ORDER: Record<BunkTone, number> = { risk: 0, edge: 1, safe: 2, pending: 3 };
const NUMBER: Record<BunkTone, string> = {
  risk: "text-danger-accent",
  edge: "text-warning-accent",
  safe: "text-success-accent",
  pending: "text-on-surface-muted",
};
const BAR: Record<BunkTone, string> = {
  risk: "bg-danger-accent",
  edge: "bg-warning-accent",
  safe: "bg-success-accent",
  pending: "bg-surface-bright",
};

/** Every subject's room above 75%, riskiest first - the answer to "can I skip?". */
export function SkipMeter() {
  const copy = useStudentCopy();
  const isDemo = useSession().session?.kind === "demo";
  const profile = useProfile();

  const rows = useMemo(() => {
    const courses = mergeTheoryPracticalCourses(profile.data?.courses ?? [], profile.data?.attendanceSource);
    return courses
      .map((course) => {
        const stats = courseAttendance(course);
        return { stats, budget: bunkBudget(stats) };
      })
      .sort((a, b) =>
        TONE_ORDER[a.budget.tone] - TONE_ORDER[b.budget.tone] ||
        (a.budget.tone === "risk" ? b.budget.count - a.budget.count : a.budget.count - b.budget.count),
      );
  }, [profile.data]);

  if (profile.isLoading) return <ShimmerBlock className="h-48" />;
  if (rows.length === 0) return null;

  const verdict = (tone: BunkTone, count: number) => {
    if (tone === "risk") return `Attend ${count}`;
    if (tone === "edge") return "Don't skip";
    if (tone === "pending") return "Not started";
    return isDemo ? "On track" : `Skip ${count}`;
  };

  return (
    <Section
      title={copy.skipTitle}
      action={
        <Link href={STUDENT_ROUTES.attendance} className="text-sm font-bold text-primary-accent hover:underline">
          Plan leave
        </Link>
      }
    >
      <p className="-mt-2 mb-4 text-sm text-on-surface-muted">{copy.skipDescription}</p>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map(({ stats, budget }) => (
          <li key={stats.course.courseCode + stats.course.courseTitle}>
            <Link
              href={STUDENT_ROUTES.attendance}
              title={budget.label}
              className="panel spotlight pressable flex h-full flex-col gap-2.5 rounded-[1.25rem] px-4 py-3.5"
            >
              <span className="flex items-center justify-between gap-3">
                <span className="truncate font-bold text-on-surface">{titleCase(stats.course.courseTitle)}</span>
                <span className={cn("shrink-0 rounded-full px-3 py-1 text-sm font-extrabold", BUNK_TONE_STYLE[budget.tone].badge)}>
                  {verdict(budget.tone, budget.count)}
                </span>
              </span>
              <span className="flex items-center gap-3">
                <span className={cn("w-16 shrink-0 text-xl font-black tabular", NUMBER[budget.tone])}>
                  {stats.isPending ? "-" : `${stats.percent.toFixed(1)}%`}
                </span>
              <span aria-hidden className="relative h-1.5 flex-1 rounded-full bg-surface-highest">
                <span className={cn("absolute inset-y-0 left-0 rounded-full", BAR[budget.tone])} style={{ width: `${Math.min(100, stats.percent)}%` }} />
                <span className="absolute -top-1 h-3.5 w-0.5 rounded-full bg-on-surface" style={{ left: `${ATTENDANCE_THRESHOLD}%` }} />
              </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
