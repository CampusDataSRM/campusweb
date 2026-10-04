import { AttendanceTrack } from "@/components/ui/attendance-track";
import { UserRound } from "lucide-react";
import type { CSSProperties } from "react";

import { TIER_STYLE } from "@/constants/attendance-tiers";
import { attendanceTier, courseAttendance } from "@/lib/student/attendance";
import { cn } from "@/lib/utils";
import type { UserCourse } from "@/network-calls/types";

const fmt = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

/** "Dr. T.Grace Shalini (103364)" -> name and staff id, the id set small. */
function faculty(raw: string): { name: string; id?: string } {
  const match = /^(.*?)\s*\((\d+)\)\s*$/.exec(raw.trim());
  return match ? { name: match[1], id: match[2] } : { name: raw.trim() };
}

/**
 * One course: the classes you can still miss or must attend (the big
 * number, with its unit), the P / A / T counts with OD/ML credit, the
 * percentage, and the segmented 75% bar with the gap or buffer tinted.
 * One combined label for screen readers.
 */
export function CourseCard({
  course,
  predicted,
  index = 0,
}: {
  course: UserCourse;
  predicted?: boolean;
  /** Position in the list, for the staggered entrance. */
  index?: number;
}) {
  const stats = courseAttendance(course);
  const tier = attendanceTier(stats.percent);
  const needsClasses = stats.required > 0;
  const credits = Number.parseFloat(course.credit);
  const who = course.facultyName ? faculty(course.facultyName) : null;
  const tone = stats.isPending
    ? "pending"
    : needsClasses
      ? "risk"
      : stats.margin === 0
        ? "edge"
        : "safe";

  return (
    <article
      aria-label={`${course.courseTitle}, ${stats.percent.toFixed(1)}% attendance, ${needsClasses ? `${stats.required} classes required` : `margin ${stats.margin}`}`}
      className={cn(
        "campus-course-card panel flex flex-col gap-4",
        predicted && "border-secondary/60",
      )}
      data-tone={tone}
      style={{ "--i": index } as CSSProperties}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-heading font-bold text-on-surface">
            {course.courseTitle}
          </h3>
          <p className="course-meta mt-1 flex flex-wrap gap-x-3 text-xs text-on-surface-muted">
            <span className="font-semibold">{course.courseCode}</span>
            {course.category && <span>{course.category}</span>}
            {Number.isFinite(credits) && credits > 0 && (
              <span>{fmt(credits)} credits</span>
            )}
          </p>
          {who && (
            <p className="course-faculty mt-1.5 flex items-center gap-1.5 truncate text-xs text-on-surface-muted">
              <UserRound aria-hidden className="size-3.5 shrink-0" />
              <span className="truncate">{who.name}</span>
              {who.id && <small>{who.id}</small>}
            </p>
          )}
        </div>
        {!stats.isPending && (
          <div className="course-figure shrink-0 text-right">
            <p
              className={cn(
                "course-count font-heading leading-none font-extrabold tabular",
                needsClasses ? "text-danger-accent" : "text-success-accent",
              )}
            >
              {needsClasses ? stats.required : stats.margin}
            </p>
            <p className="course-count-label">
              {needsClasses ? (
                <>
                  <b>classes</b> to reach 75%
                </>
              ) : stats.margin === 0 ? (
                <>
                  <b>to spare</b> - right at 75%
                </>
              ) : (
                <>
                  <b>classes</b> safe to miss
                </>
              )}
            </p>
          </div>
        )}
      </div>

      <div className="course-attendance-counts flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        <span>
          Present <b>{fmt(stats.present)}</b>
        </span>
        <span>
          Absent <b>{fmt(stats.absent)}</b>
        </span>
        <span>
          Total <b>{fmt(stats.conducted)}</b>
        </span>
        {stats.odMl > 0 && (
          <span className="course-odml">
            OD/ML <b>{stats.odMl}</b>
          </span>
        )}
        <span
          className={cn(
            "course-percent ml-auto font-heading font-extrabold tabular",
            stats.isPending ? "text-on-surface-muted" : TIER_STYLE[tier].text,
          )}
        >
          {stats.isPending ? "No classes yet" : `${stats.percent.toFixed(1)}%`}
        </span>
      </div>

      {!stats.isPending && (
        <AttendanceTrack
          value={stats.percent}
          tone={
            tier === "good" ? "success" : tier === "warn" ? "warning" : "danger"
          }
        />
      )}
    </article>
  );
}
