"use client";

import Link from "next/link";

import { ErrorState, ShimmerBlock } from "@/components/feedback/data-states";
import { STUDENT_ROUTES } from "@/constants/routes";
import { useStudentCopy } from "@/hooks/use-student-copy";
import { useToday } from "@/hooks/use-today";
import { formatMinutes, minutesSinceMidnight, type TimetableClass } from "@/lib/student/timetable";
import { cn } from "@/lib/utils";

const dayFormat = new Intl.DateTimeFormat("en-IN", { weekday: "long" });

/**
 * The day's schedule as a timeline. With nothing left today it shows the next
 * day that has classes instead of an empty box.
 */
export function TodayClassesCard() {
  const copy = useStudentCopy();
  const today = useToday();

  if (today.isLoading) return <ShimmerBlock className="h-80 rounded-[1.5rem]" />;
  if (today.error && today.classes.length === 0) {
    return <ErrorState error={today.error} title="Couldn't load your timetable" onRetry={today.refetch} />;
  }

  const showingToday = today.classes.length > 0;
  const day = showingToday ? today.dayOrder : today.upcoming?.dayOrder;
  const classes: TimetableClass[] = showingToday ? today.classes : (today.upcoming?.classes ?? []);
  const title = showingToday ? "Today" : today.upcoming ? dayFormat.format(today.upcoming.date) : "Today";
  const nowMinutes = showingToday && today.now ? minutesSinceMidnight(today.now) : -1;

  return (
    <section aria-label={`${title}'s ${copy.items}`} className="panel spotlight flex h-full flex-col gap-4 rounded-[1.5rem] p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <h2 className="text-h3 font-extrabold text-on-surface">{title}</h2>
        {day && <span className="rounded-full bg-primary-container px-2.5 py-0.5 text-xs font-bold text-on-primary-container">Day {day}</span>}
        <Link href={STUDENT_ROUTES.timetable} className="ml-auto text-sm font-bold text-primary-accent hover:underline">
          Timetable
        </Link>
      </div>

      {classes.length === 0 ? (
        <p className="py-6 text-on-surface-muted">Nothing scheduled in the next three weeks.</p>
      ) : (
        <ol className="relative flex flex-col">
          {classes.map((item, i) => {
            const isNow = today.moment.current?.id === item.id;
            const isNext = !isNow && today.moment.next?.id === item.id;
            const isPast = showingToday && item.endMinutes <= nowMinutes;
            const last = i === classes.length - 1;
            return (
              <li key={item.id} aria-current={isNow ? "time" : undefined} className="relative flex gap-4">
                <span className="w-16 shrink-0 pt-2 text-right text-sm font-bold text-on-surface-muted tabular">{formatMinutes(item.startMinutes)}</span>
                <span aria-hidden className="relative flex w-3 shrink-0 justify-center">
                  {!last && <span className="absolute top-5 -bottom-1 w-px bg-outline-variant" />}
                  <span
                    className={cn(
                      "relative mt-3 size-3 rounded-full border-2",
                      isNow ? "border-success-accent bg-success-accent shadow-[0_0_12px_var(--success-accent)]" : isNext ? "border-primary-accent bg-primary-accent shadow-[0_0_12px_var(--primary-accent)]" : isPast ? "border-outline bg-transparent" : "border-on-surface-subtle bg-surface",
                    )}
                  />
                </span>
                <div
                  className={cn(
                    "mb-1.5 flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-2",
                    isNow ? "bg-success-container" : isNext ? "bg-primary-container" : "",
                    isPast && "opacity-45",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 font-bold leading-snug text-on-surface">{item.subject}</p>
                    <p className="text-xs font-semibold text-on-surface-muted">
                      {item.kind === "practical" ? "Practical" : "Theory"}
                      {item.room && `, ${item.room}`}
                    </p>
                  </div>
                  {(isNow || isNext) && (
                    <span className={cn("flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-extrabold", isNow ? "bg-success text-on-success" : "bg-primary text-on-primary")}>
                      {isNow && <span aria-hidden className="live-dot" />}
                      {isNow ? "Now" : "Next"}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
