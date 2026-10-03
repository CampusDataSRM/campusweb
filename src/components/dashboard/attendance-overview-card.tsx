"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { AttendanceRing } from "@/components/charts/attendance-ring";
import { ShimmerBlock } from "@/components/feedback/data-states";
import { STUDENT_ROUTES } from "@/constants/routes";
import { useStudentCopy } from "@/hooks/use-student-copy";
import { useProfile } from "@/hooks/use-student-data";
import { useToday } from "@/hooks/use-today";
import {
  courseAttendance,
  courseForSubject,
  countBelowThreshold,
  mergeTheoryPracticalCourses,
  overallAttendance,
} from "@/lib/student/attendance";

/**
 * Attendance at a glance: the overall ring, and - when a class is on now or
 * next - that subject's own present / absent / margin.
 */
export function AttendanceOverviewCard() {
  const copy = useStudentCopy();
  const profile = useProfile();
  const { moment } = useToday();

  const courses = useMemo(
    () => mergeTheoryPracticalCourses(profile.data?.courses ?? [], profile.data?.attendanceSource),
    [profile.data],
  );
  const focus = moment.current ?? moment.next;
  const focusCourse = focus ? courseForSubject(courses, focus.subject, focus.kind === "practical") : undefined;
  const focusStats = focusCourse ? courseAttendance(focusCourse) : null;

  if (profile.isLoading) return <ShimmerBlock className="h-64" />;

  return (
    <article className="flex flex-col gap-5 rounded-3xl border border-outline-variant bg-surface-container p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-h3 font-bold text-on-surface">{copy.attendanceShort}</h2>
        <Link
          href={STUDENT_ROUTES.attendance}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary-accent hover:underline"
        >
          Details <ArrowRight aria-hidden className="size-4" />
        </Link>
      </div>

      <div className="flex items-center gap-5">
        <AttendanceRing percent={overallAttendance(courses)} label="overall" />
        <dl className="grid flex-1 gap-3">
          <div>
            <dt className="text-xs font-semibold text-on-surface-muted">{copy.subjects}</dt>
            <dd className="font-heading text-2xl font-extrabold text-on-surface tabular">{courses.length}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-on-surface-muted">{copy.belowThreshold}</dt>
            <dd className="font-heading text-2xl font-extrabold text-danger-accent tabular">
              {countBelowThreshold(courses)}
            </dd>
          </div>
        </dl>
      </div>

      {focus && focusStats && (
        <div className="rounded-2xl border border-outline-variant bg-surface-high p-4">
          <p className="text-xs font-extrabold tracking-wide text-on-surface-brand uppercase">
            {moment.current ? copy.currentItem : copy.nextItem}
          </p>
          <p className="mt-1 truncate font-bold text-on-surface">{focusStats.course.courseTitle}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-full bg-success-container px-2.5 py-1 text-on-success-container">P {focusStats.present}</span>
            <span className="rounded-full bg-danger-container px-2.5 py-1 text-on-danger-container">A {focusStats.absent}</span>
            <span className={`rounded-full px-2.5 py-1 ${focusStats.required > 0 ? "bg-danger-container text-on-danger-container" : "bg-primary-container text-on-primary-container"}`}>
              {focusStats.required > 0 ? `Need ${focusStats.required}` : `Margin +${focusStats.margin}`}
            </span>
          </div>
        </div>
      )}
    </article>
  );
}
