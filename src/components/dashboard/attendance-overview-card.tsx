"use client";

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
  mergeTheoryPracticalCourses,
  overallAttendance,
} from "@/lib/student/attendance";
import { minutesSinceMidnight } from "@/lib/student/timetable";
import { cn } from "@/lib/utils";

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

function startsIn(minutes: number): string {
  if (minutes < 60) return `in ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `in ${hours}h ${minutes % 60}m`;
}

/**
 * Campus App's attendance panel: a ring for the class that's on now (or
 * next), its present / absent / margin, and overall attendance when no class
 * is on.
 */
export function AttendanceOverviewCard() {
  const copy = useStudentCopy();
  const profile = useProfile();
  const today = useToday();
  const courses = useMemo(
    () => mergeTheoryPracticalCourses(profile.data?.courses ?? [], profile.data?.attendanceSource),
    [profile.data],
  );

  if (profile.isLoading) return <ShimmerBlock className="h-56 rounded-[1.25rem]" />;

  const { current, next } = today.moment;
  const focus = current ?? next;
  const course = focus ? courseForSubject(courses, focus.subject, focus.kind === "practical") : undefined;
  const stats = course ? courseAttendance(course) : null;
  const nowMinutes = today.now ? minutesSinceMidnight(today.now) : 0;
  const chip = current ? copy.currentItem : next && stats ? `${copy.nextItem} · ${startsIn(next.startMinutes - nowMinutes)}` : copy.overallRate;
  const subjectsBelow = courses.filter((c) => courseAttendance(c).isBelowThreshold).length;

  return (
    <Link href={STUDENT_ROUTES.attendance} className="flex flex-col gap-4 rounded-[1.25rem] border border-outline-variant bg-surface-container p-5 pressable hover:border-outline">
      <span className={cn("w-fit rounded-full px-3 py-1 text-xs font-bold", current ? "bg-success-container text-on-success-container" : "bg-primary-container text-on-primary-container")}>
        {chip}
      </span>
      <div className="flex items-center gap-5">
        <AttendanceRing percent={stats ? stats.percent : overallAttendance(courses)} label={stats ? "this subject" : "overall"} size={112} />
        <div className="min-w-0 flex-1">
          {stats ? (
            <>
              <p className="line-clamp-2 font-extrabold text-on-surface">{stats.course.courseTitle}</p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-xs font-bold">
                <span className="rounded-md bg-success-container px-2 py-1 text-on-success-container">P {fmt(stats.present)}</span>
                <span className="rounded-md bg-danger-container px-2 py-1 text-on-danger-container">A {fmt(stats.absent)}</span>
                <span className={cn("rounded-md px-2 py-1", stats.required > 0 ? "bg-danger-container text-on-danger-container" : "bg-primary-container text-on-primary-container")}>
                  M {stats.required > 0 ? `-${stats.required}` : `+${stats.margin}`}
                </span>
              </div>
            </>
          ) : (
            <>
              <p className="font-extrabold text-on-surface">{courses.length} subjects tracked</p>
              <p className="mt-1 text-sm text-on-surface-muted">
                {subjectsBelow === 0 ? "All above 75%" : `${subjectsBelow} below 75%`}
              </p>
            </>
          )}
          <p className="mt-3 text-sm font-bold text-primary-accent">View attendance</p>
        </div>
      </div>
    </Link>
  );
}
