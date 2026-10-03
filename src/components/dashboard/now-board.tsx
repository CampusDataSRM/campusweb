"use client";

import { Clock3, DoorOpen, FlaskConical, BookOpenText } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { ShimmerBlock } from "@/components/feedback/data-states";
import { BUNK_TONE_STYLE } from "@/constants/bunk-tones";
import { STUDENT_ROUTES } from "@/constants/routes";
import { useStudentCopy } from "@/hooks/use-student-copy";
import { useProfile } from "@/hooks/use-student-data";
import { useToday } from "@/hooks/use-today";
import {
  bunkBudget,
  courseAttendance,
  courseForSubject,
  mergeTheoryPracticalCourses,
} from "@/lib/student/attendance";
import { formatMinutes, minutesSinceMidnight, type TimetableClass } from "@/lib/student/timetable";
import { cn } from "@/lib/utils";

function countdown(minutes: number): { value: string; unit: string } {
  if (minutes < 60) return { value: String(minutes), unit: minutes === 1 ? "min" : "mins" };
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return { value: rest ? `${hours}h ${rest}` : String(hours), unit: rest ? "mins" : hours === 1 ? "hour" : "hours" };
}

/** The day as a line of stops: done, current, next, later. */
function RouteLine({ classes, nowMinutes, currentId, nextId }: { classes: TimetableClass[]; nowMinutes: number; currentId?: string; nextId?: string }) {
  return (
    <ol aria-label="Today's classes" className="flex items-center gap-1">
      {classes.map((item, index) => {
        const done = item.endMinutes <= nowMinutes;
        const current = item.id === currentId;
        const next = item.id === nextId;
        return (
          <li key={item.id} className="flex min-w-0 flex-1 items-center gap-1" title={`${formatMinutes(item.startMinutes)} ${item.subject}`}>
            <span
              className={cn(
                "size-3 shrink-0 rounded-full border-2 transition-colors",
                current ? "border-success-accent bg-success-accent shadow-[0_0_0_4px_var(--success-container)]" : next ? "border-primary-accent bg-surface" : done ? "border-on-surface-subtle bg-on-surface-subtle" : "border-outline bg-surface",
              )}
            />
            {index < classes.length - 1 && <span className={cn("h-0.5 flex-1 rounded-full", done || current ? "bg-on-surface-subtle" : "bg-outline-variant")} />}
            <span className="sr-only">
              {item.subject} at {formatMinutes(item.startMinutes)}
              {current ? ", happening now" : next ? ", next" : done ? ", finished" : ""}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * The dashboard's lead: what's on right now. Reads like a departure board -
 * the class you're in or heading to, a live countdown, the room, and how
 * many more of that subject you can skip.
 */
export function NowBoard() {
  const copy = useStudentCopy();
  const today = useToday();
  const profile = useProfile();
  const courses = useMemo(
    () => mergeTheoryPracticalCourses(profile.data?.courses ?? [], profile.data?.attendanceSource),
    [profile.data],
  );

  if (today.isLoading || !today.now) return <ShimmerBlock className="h-64 rounded-[1.75rem]" />;

  const nowMinutes = minutesSinceMidnight(today.now);
  const { current, next } = today.moment;
  const focus = current ?? next;
  const course = focus ? courseForSubject(courses, focus.subject, focus.kind === "practical") : undefined;
  const budget = course ? bunkBudget(courseAttendance(course)) : null;
  const finished = today.classes.length > 0 && !focus;

  const status = current ? "In class" : next ? copy.nextItem : finished ? "Done for today" : today.dayOrder ? "No classes today" : "No day order today";
  const timer = current
    ? { ...countdown(current.endMinutes - nowMinutes), caption: "left in this class" }
    : next
      ? { ...countdown(next.startMinutes - nowMinutes), caption: "until it starts" }
      : null;

  return (
    <section
      aria-label="Right now"
      className="animate-in fade-in slide-in-from-bottom-2 relative overflow-hidden rounded-[1.75rem] border border-outline-variant bg-surface-container duration-500 ease-out"
    >
      <div className="flex flex-col gap-6 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <p className={cn("inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-sm font-bold", current ? "bg-success-container text-on-success-container" : "bg-surface-highest text-on-surface-muted")}>
              <span className={cn("size-2 rounded-full", current ? "animate-pulse bg-success-accent" : "bg-on-surface-subtle")} aria-hidden />
              {status}
              {today.dayOrder && <span className="text-on-surface-subtle">Day {today.dayOrder}</span>}
            </p>
            {focus ? (
              <>
                <h2 className="font-heading text-[clamp(1.75rem,1.3rem+2vw,3rem)] leading-[1.05] font-extrabold tracking-tight text-on-surface">
                  {focus.subject}
                </h2>
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-on-surface-muted">
                  <span className="inline-flex items-center gap-1.5"><Clock3 aria-hidden className="size-4 text-primary-accent" />{formatMinutes(focus.startMinutes)} to {formatMinutes(focus.endMinutes)}</span>
                  {focus.room && <span className="inline-flex items-center gap-1.5"><DoorOpen aria-hidden className="size-4 text-primary-accent" />{focus.room}</span>}
                  <span className="inline-flex items-center gap-1.5">
                    {focus.kind === "practical" ? <FlaskConical aria-hidden className="size-4 text-secondary-accent" /> : <BookOpenText aria-hidden className="size-4 text-primary-accent" />}
                    {focus.kind === "practical" ? "Practical" : "Theory"}
                  </span>
                </div>
              </>
            ) : (
              <h2 className="font-heading text-[clamp(1.75rem,1.3rem+2vw,3rem)] leading-[1.05] font-extrabold tracking-tight text-on-surface">
                {finished ? "That's a wrap." : "No classes today. Enjoy it."}
              </h2>
            )}
          </div>

          {timer && (
            <div className="flex flex-col items-end text-right" aria-live="polite">
              <p className="font-heading text-[clamp(3rem,2.2rem+3.5vw,5rem)] leading-none font-extrabold tracking-tighter text-on-surface tabular">
                {timer.value}
                <span className="ml-1.5 text-[0.35em] font-bold tracking-normal text-on-surface-muted">{timer.unit}</span>
              </p>
              <p className="text-sm font-semibold text-on-surface-muted">{timer.caption}</p>
            </div>
          )}
        </div>

        {budget && course && (
          <Link
            href={STUDENT_ROUTES.attendance}
            className={cn("flex w-fit items-center gap-3 rounded-2xl px-4 py-2.5 transition-opacity hover:opacity-90", BUNK_TONE_STYLE[budget.tone].badge)}
          >
            <span className="font-heading text-2xl font-extrabold tabular">{budget.count}</span>
            <span className="text-sm font-semibold">{budget.label}</span>
          </Link>
        )}

        {today.classes.length > 1 && (
          <RouteLine classes={today.classes} nowMinutes={nowMinutes} currentId={current?.id} nextId={next?.id} />
        )}
      </div>
    </section>
  );
}
