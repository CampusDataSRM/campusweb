"use client";

import Link from "next/link";
import { useMemo } from "react";

import { AttendanceRing } from "@/components/charts/attendance-ring";
import { ShimmerBlock } from "@/components/feedback/data-states";
import { TIER_STYLE } from "@/constants/attendance-tiers";
import { STUDENT_ROUTES } from "@/constants/routes";
import { useStudentCopy } from "@/hooks/use-student-copy";
import { useProfile } from "@/hooks/use-student-data";
import {
  attendanceTier,
  courseAttendance,
  countBelowThreshold,
  mergeTheoryPracticalCourses,
  overallAttendance,
} from "@/lib/student/attendance";

/** Overall attendance, and the one subject that needs attention most. */
export function AttendanceOverviewCard() {
  const copy = useStudentCopy();
  const profile = useProfile();
  const { courses, weakest } = useMemo(() => {
    const merged = mergeTheoryPracticalCourses(profile.data?.courses ?? [], profile.data?.attendanceSource);
    const stats = merged.map(courseAttendance).filter((s) => !s.isPending);
    return { courses: merged, weakest: stats.sort((a, b) => a.percent - b.percent)[0] };
  }, [profile.data]);

  if (profile.isLoading) return <ShimmerBlock className="h-full min-h-64 rounded-[1.25rem]" />;
  const below = countBelowThreshold(courses);

  return (
    <Link
      href={STUDENT_ROUTES.attendance}
      className="group flex h-full flex-col justify-between gap-5 rounded-[1.25rem] border border-outline-variant bg-surface-container p-6 transition-colors hover:border-outline"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-bold text-on-surface">{copy.attendanceShort}</h2>
        <span className="text-sm font-semibold text-primary-accent group-hover:underline">Open</span>
      </div>
      <div className="flex items-center gap-5">
        <AttendanceRing percent={overallAttendance(courses)} label="overall" size={120} />
        <p className="text-sm text-on-surface-muted">
          {below === 0 ? (
            <span className="font-semibold text-success-accent">Every subject is above 75%.</span>
          ) : (
            <>
              <span className="font-heading text-2xl font-extrabold text-danger-accent tabular">{below}</span>{" "}
              {below === 1 ? "subject is" : "subjects are"} under 75%.
            </>
          )}
        </p>
      </div>
      {weakest && (
        <div className="border-t border-outline-variant pt-4">
          <p className="text-xs font-semibold text-on-surface-subtle">Needs you most</p>
          <p className="mt-0.5 flex items-baseline justify-between gap-3">
            <span className="truncate font-bold text-on-surface">{weakest.course.courseTitle}</span>
            <span className={`font-heading font-extrabold tabular ${TIER_STYLE[attendanceTier(weakest.percent)].text}`}>
              {weakest.percent.toFixed(1)}%
            </span>
          </p>
        </div>
      )}
    </Link>
  );
}
