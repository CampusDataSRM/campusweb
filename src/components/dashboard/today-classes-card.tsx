"use client";

import { ArrowRight, CalendarOff, MapPin, PartyPopper } from "lucide-react";
import Link from "next/link";

import { EmptyState, ErrorState, ShimmerBlock } from "@/components/feedback/data-states";
import { Badge } from "@/components/ui/badge";
import { STUDENT_ROUTES } from "@/constants/routes";
import { useStudentCopy } from "@/hooks/use-student-copy";
import { useToday } from "@/hooks/use-today";
import { formatMinutes } from "@/lib/student/timetable";
import { cn } from "@/lib/utils";

/** Today's classes as a compact timeline, the current and next highlighted. */
export function TodayClassesCard() {
  const copy = useStudentCopy();
  const today = useToday();
  const { current, next } = today.moment;

  return (
    <article className="flex flex-col gap-4 rounded-3xl border border-outline-variant bg-surface-container p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="font-heading text-h3 font-bold text-on-surface">{copy.overviewTitle}</h2>
          {today.dayOrder && (
            <Badge className="rounded-full bg-primary-container px-2.5 text-on-primary-container">
              Day {today.dayOrder}
            </Badge>
          )}
        </div>
        <Link
          href={STUDENT_ROUTES.timetable}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary-accent hover:underline"
        >
          Week <ArrowRight aria-hidden className="size-4" />
        </Link>
      </div>

      {today.isLoading ? (
        <div className="flex flex-col gap-2">
          <ShimmerBlock className="h-14" />
          <ShimmerBlock className="h-14" />
          <ShimmerBlock className="h-14" />
        </div>
      ) : today.error && today.classes.length === 0 ? (
        <ErrorState error={today.error} title="Couldn't load today's classes" onRetry={today.refetch} />
      ) : today.dayOrder === null ? (
        <EmptyState icon={CalendarOff} title="No classes scheduled" description="It's a holiday or a day without a day order." />
      ) : today.classes.length === 0 ? (
        <EmptyState icon={PartyPopper} title="No classes today" description="Nothing on the timetable for this day order." />
      ) : (
        <ol className="flex flex-col gap-2">
          {today.classes.map((item) => {
            const isNow = current?.id === item.id;
            const isNext = !isNow && next?.id === item.id;
            const isPast = !isNow && today.now !== null && item.endMinutes <= today.now.getHours() * 60 + today.now.getMinutes();
            return (
              <li
                key={item.id}
                aria-current={isNow ? "time" : undefined}
                className={cn(
                  "relative flex items-center gap-3 overflow-hidden rounded-2xl border px-4 py-3",
                  isNow
                    ? "border-success/50 bg-success-container"
                    : isNext
                      ? "border-primary/50 bg-primary-container"
                      : "border-outline-variant bg-surface-high",
                  isPast && "opacity-55",
                )}
              >
                <div className="w-16 shrink-0 tabular text-sm font-bold text-on-surface">
                  {formatMinutes(item.startMinutes).replace(" ", " ")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-on-surface">{item.subject}</p>
                  <p className="flex items-center gap-1 truncate text-xs text-on-surface-muted">
                    {item.room && (
                      <>
                        <MapPin aria-hidden className="size-3" />
                        {item.room}
                        <span aria-hidden>·</span>
                      </>
                    )}
                    {item.kind === "practical" ? "Practical" : "Theory"}
                  </p>
                </div>
                {(isNow || isNext) && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[0.6875rem] font-extrabold tracking-wide uppercase",
                      isNow ? "bg-success text-on-success" : "bg-primary text-on-primary",
                    )}
                  >
                    {isNow ? "Now" : "Next"}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </article>
  );
}
