import { UserRound } from "lucide-react";

import { TIER_STYLE } from "@/constants/attendance-tiers";
import { attendanceTier, courseAttendance } from "@/lib/student/attendance";
import { cn } from "@/lib/utils";
import type { UserCourse } from "@/network-calls/types";

const fmt = (value: number) => (Number.isInteger(value) ? String(value) : value.toFixed(1));

/**
 * One course: margin (classes you can still miss) or required (classes you
 * must attend), the P / A / T counts, OD/ML credit and the 75% bar.
 * One combined label for screen readers.
 */
export function CourseCard({ course, predicted }: { course: UserCourse; predicted?: boolean }) {
  const stats = courseAttendance(course);
  const tier = TIER_STYLE[attendanceTier(stats.percent)];
  const needsClasses = stats.required > 0;
  const credits = Number.parseFloat(course.credit);

  return (
    <article
      aria-label={`${course.courseTitle}, ${stats.percent.toFixed(1)}% attendance, ${needsClasses ? `${stats.required} classes required` : `margin ${stats.margin}`}`}
      className={cn(
        "panel spotlight flex flex-col gap-4 rounded-3xl p-5",
        predicted && "border-secondary/60",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="line-clamp-2 font-heading font-bold text-on-surface">{course.courseTitle}</h3>
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
            <p className={cn("font-heading text-4xl leading-none font-extrabold tabular", needsClasses ? "text-danger-accent" : "text-success-accent")}>
              {needsClasses ? stats.required : stats.margin}
            </p>
            <p className="mt-1 text-xs font-bold text-on-surface-muted">{needsClasses ? "Required" : "Margin"}</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
        <span className="rounded-full bg-success-container px-2.5 py-1 text-on-success-container">P {fmt(stats.present)}</span>
        <span className="rounded-full bg-danger-container px-2.5 py-1 text-on-danger-container">A {fmt(stats.absent)}</span>
        <span className="rounded-full bg-surface-highest px-2.5 py-1 text-on-surface-muted">T {fmt(stats.conducted)}</span>
        {stats.odMl > 0 && (
          <span className="rounded-full bg-secondary-container px-2.5 py-1 text-on-secondary-container">OD/ML {stats.odMl}</span>
        )}
        <span className={cn("ml-auto font-heading text-base font-extrabold tabular", tier.text)}>
          {stats.isPending ? "No classes yet" : `${stats.percent.toFixed(1)}%`}
        </span>
      </div>

      <div className="relative h-1.5 overflow-hidden rounded-full bg-surface-highest" aria-hidden>
        <div
          className="h-full rounded-full transition-[width] duration-(--duration-long) ease-(--ease-decelerate)"
          style={{ width: `${Math.min(100, stats.percent)}%`, background: tier.stroke }}
        />
        <div className="absolute inset-y-0 left-3/4 w-0.5 bg-on-surface/60" />
      </div>
    </article>
  );
}
