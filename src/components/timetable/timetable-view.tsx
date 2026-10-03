"use client";

import { CalendarOff, MapPin } from "lucide-react";
import { useMemo, useState } from "react";

import { CachedBadge, EmptyState, ErrorState, ShimmerBlock } from "@/components/feedback/data-states";
import { PageHeader } from "@/components/layout/page-header";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useTimetable } from "@/hooks/use-student-data";
import { useToday } from "@/hooks/use-today";
import { classMoment, classesForDay, formatMinutes, minutesSinceMidnight } from "@/lib/student/timetable";
import { cn } from "@/lib/utils";

const DAY_ORDERS = [1, 2, 3, 4, 5] as const;

/** The weekly rotation, one day order at a time; today's is pre-selected. */
export function TimetableView() {
  const timetable = useTimetable();
  const today = useToday();
  const [picked, setPicked] = useState<number | null>(null);
  const day = picked ?? today.dayOrder ?? 1;
  const isToday = day === today.dayOrder;

  const classes = useMemo(() => classesForDay(timetable.data?.timetable, day), [timetable.data, day]);
  const moment = isToday && today.now ? classMoment(classes, minutesSinceMidnight(today.now)) : { current: null, next: null };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Timetable"
        status={<CachedBadge savedAt={timetable.savedAt} refreshing={timetable.isFetching} />}
        description={today.dayOrder ? `Today is Day ${today.dayOrder}.` : "No day order today."}
      />

      <ToggleGroup
        value={[String(day)]}
        onValueChange={(value) => value[0] && setPicked(Number(value[0]))}
        aria-label="Day order"
        className="grid w-full grid-cols-5 gap-1 rounded-2xl border border-outline-variant bg-surface-container p-1.5 sm:max-w-xl"
      >
        {DAY_ORDERS.map((order) => (
          <ToggleGroupItem
            key={order}
            value={String(order)}
            className="relative h-11 rounded-xl font-bold data-[pressed]:bg-primary data-[pressed]:text-on-primary"
          >
            Day {order}
            {order === today.dayOrder && (
              <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-success-accent" aria-label="today" />
            )}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {timetable.isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }, (_, i) => <ShimmerBlock key={i} className="h-20" />)}
        </div>
      ) : !timetable.data ? (
        <ErrorState error={timetable.error} title="Couldn't load your timetable" onRetry={() => void timetable.refetch()} retrying={timetable.isFetching} />
      ) : classes.length === 0 ? (
        <EmptyState icon={CalendarOff} title={`Day ${day} is clear`} description="No classes are scheduled for this day order." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <ol className="flex flex-col gap-2" aria-label={`Day ${day} classes`}>
            {classes.map((item) => {
              const isNow = moment.current?.id === item.id;
              const isNext = !isNow && moment.next?.id === item.id;
              return (
                <li
                  key={item.id}
                  className={cn(
                    "flex items-center gap-4 rounded-2xl border p-4",
                    isNow ? "border-success/50 bg-success-container" : isNext ? "border-primary/50 bg-primary-container" : "border-outline-variant bg-surface-container",
                  )}
                >
                  <div className="w-20 shrink-0 tabular">
                    <p className="font-heading font-bold text-on-surface">{formatMinutes(item.startMinutes)}</p>
                    <p className="text-xs text-on-surface-muted">to {formatMinutes(item.endMinutes)}</p>
                  </div>
                  <span className={cn("w-1 self-stretch rounded-full", item.kind === "practical" ? "bg-secondary-accent" : "bg-primary-accent")} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-on-surface">{item.subject}</p>
                    <p className="flex items-center gap-1.5 text-sm text-on-surface-muted">
                      {item.kind === "practical" ? "Practical" : "Theory"}
                      {item.room && (<><span aria-hidden>·</span><MapPin aria-hidden className="size-3.5" />{item.room}</>)}
                    </p>
                  </div>
                  {(isNow || isNext) && (
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-extrabold uppercase", isNow ? "bg-success text-on-success" : "bg-primary text-on-primary")}>
                      {isNow ? "Now" : "Next"}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
          <dl className="grid h-fit grid-cols-3 gap-2 rounded-2xl border border-outline-variant bg-surface-container p-3 lg:grid-cols-1">
            {[
              ["Classes", String(classes.length)],
              ["Starts", formatMinutes(classes[0].startMinutes)],
              ["Finishes", formatMinutes(classes[classes.length - 1].endMinutes)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-surface-high px-3 py-2.5">
                <dt className="text-xs font-semibold text-on-surface-muted">{label}</dt>
                <dd className="font-heading text-lg font-extrabold text-on-surface tabular">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}
