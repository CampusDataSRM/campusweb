import { AttendanceTrack } from "@/components/ui/attendance-track";
import { UserRound } from "lucide-react";

import { TIER_STYLE } from "@/constants/attendance-tiers";
import { attendanceTier, courseAttendance } from "@/lib/student/attendance";
import { cn } from "@/lib/utils";
import type { UserCourse } from "@/network-calls/types";

const fmt = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

/**
 * One course: margin (classes you can still miss) or required (classes you
 * must attend), the P / A / T counts, OD/ML credit and the 75% bar.
 * One combined label for screen readers.
 */
export function CourseCard({
  course,
  predicted,
}: {
  course: UserCourse;
  predicted?: boolean;
}) {
  const stats = courseAttendance(course);
  const tier = TIER_STYLE[attendanceTier(stats.percent)];
  const needsClasses = stats.required > 0;
  const credits = Number.parseFloat(course.credit);

  return (
    <article
      aria-label={`${course.courseTitle}, ${stats.percent.toFixed(1)}% attendance, ${needsClasses ? `${stats.required} classes required` : `margin ${stats.margin}`}`}
      className={cn(
        "campus-course-card panel flex flex-col gap-4",
        predicted && "border-secondary/60",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-heading font-bold text-on-surface">
            {course.courseTitle}
          </h3>
          <p className="mt-1 flex flex-wrap gap-x-3 text-xs text-on-surface-muted">
            <span className="font-semibold">{course.courseCode}</span>
            {course.category && <span>{course.category}</span>}
            {Number.isFinite(credits) && <span>{fmt(credits)} credits</span>}
          </p>
          {course.facultyName && (
            <p className="mt-1.5 flex items-center gap-1.5 truncate text-xs text-on-surface-muted">
              <UserRound aria-hidden className="size-3.5 shrink-0" />
              {course.facultyName}
            </p>
          )}
        </div>
        {!stats.isPending && (
          <div className="shrink-0 text-right">
            <p
              className={cn(
                "course-count font-heading text-4xl leading-none font-extrabold tabular",
                needsClasses ? "text-danger-accent" : "text-success-accent",
              )}
            >
              {needsClasses ? stats.required : stats.margin}
            </p>
            <p className="mt-1 text-xs font-bold text-on-surface-muted">
              {needsClasses ? "to reach 75%" : "safe to miss"}
            </p>
          </div>
        )}
      </div>

      <div className="course-attendance-counts flex flex-wrap items-center gap-3 text-xs font-bold">
        <span className="text-on-surface-muted">
          Present {fmt(stats.present)}
        </span>
        <span className="text-on-surface-muted">
          Absent {fmt(stats.absent)}
        </span>
        <span className="text-on-surface-muted">
          Total {fmt(stats.conducted)}
        </span>
        {stats.odMl > 0 && (
          <span className="text-secondary-accent">OD/ML {stats.odMl}</span>
        )}
        <span
          className={cn(
            "ml-auto font-heading text-base font-extrabold tabular",
            stats.isPending ? "text-on-surface-muted" : tier.text,
          )}
        >
          {stats.isPending ? "No classes yet" : `${stats.percent.toFixed(1)}%`}
        </span>
      </div>

      {!stats.isPending && (
        <AttendanceTrack
          value={stats.percent}
          tone={needsClasses ? "danger" : "success"}
        />
      )}
    </article>
  );
}
