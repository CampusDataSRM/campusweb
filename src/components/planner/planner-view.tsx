"use client";

import { CalendarX2, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { CachedBadge, EmptyState, ErrorState, ShimmerBlock } from "@/components/feedback/data-states";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useNow } from "@/hooks/use-now";
import { usePlanner } from "@/hooks/use-student-data";
import { parseDayOrder, plannerEntryDate, plannerMonths, type PlannerMonth } from "@/lib/student/planner";
import { cn } from "@/lib/utils";

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface DayCell {
  key: string;
  date: Date | null;
  dayOfMonth: number;
  weekday: string;
  event: string;
  dayOrder: number | null;
  holiday: boolean;
  today: boolean;
}

function cellsFor(month: PlannerMonth, now: Date): DayCell[] {
  return month.days.map((day) => {
    const date = plannerEntryDate(month, day);
    const dayOfMonth = Number.parseInt(day.Date, 10);
    return {
      key: `${month.key}-${day.Date}`,
      date,
      dayOfMonth,
      weekday: day.Day,
      event: day.Event?.trim() ?? "",
      dayOrder: parseDayOrder(day.Dayorder),
      holiday: month.holidays.has(dayOfMonth),
      today: !!date && date.toDateString() === now.toDateString(),
    };
  });
}

/** The academic planner, a month at a time: grid on desktop, list on phones. */
export function PlannerView() {
  const now = useNow();
  const planner = usePlanner();
  const months = useMemo(() => plannerMonths(planner.data), [planner.data]);
  const currentIndex = useMemo(() => {
    if (!now) return 0;
    const found = months.findIndex((m) => m.month === now.getMonth() && (m.year === null || m.year === now.getFullYear()));
    return found >= 0 ? found : 0;
  }, [months, now]);
  const [picked, setPicked] = useState<number | null>(null);
  const index = Math.min(picked ?? currentIndex, Math.max(0, months.length - 1));
  const month = months[index];
  const cells = useMemo(() => (month && now ? cellsFor(month, now) : []), [month, now]);

  const stats = useMemo(() => {
    const holidays = cells.filter((cell) => cell.holiday).length;
    const left = now ? cells.filter((cell) => cell.date && cell.date >= new Date(now.getFullYear(), now.getMonth(), now.getDate()) && cell.dayOrder).length : 0;
    return [
      ["Days", cells.length],
      ["Holidays", holidays],
      ["Class days left", left],
    ] as const;
  }, [cells, now]);

  const leadingBlanks = month?.year !== null && month ? (new Date(month.year!, month.month, 1).getDay() + 6) % 7 : 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Planner" status={<CachedBadge savedAt={planner.savedAt} refreshing={planner.isFetching} />} description="Day orders, events and holidays for the semester." />
      {planner.isLoading || !now ? (
        <ShimmerBlock className="h-96" />
      ) : !planner.data ? (
        <ErrorState error={planner.error} title="Couldn't load the planner" onRetry={() => void planner.refetch()} retrying={planner.isFetching} />
      ) : !month ? (
        <EmptyState icon={CalendarX2} title="No schedule yet" description="The planner appears once it's published." />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon-touch" aria-label="Previous month" disabled={index === 0} onClick={() => setPicked(index - 1)}>
                <ChevronLeft />
              </Button>
              <h2 className="min-w-44 text-center font-heading text-h3 font-bold text-on-surface" aria-live="polite">
                {MONTH_NAMES[month.month]} {month.year ?? ""}
              </h2>
              <Button variant="outline" size="icon-touch" aria-label="Next month" disabled={index >= months.length - 1} onClick={() => setPicked(index + 1)}>
                <ChevronRight />
              </Button>
            </div>
            <dl className="flex gap-2">
              {stats.map(([label, value]) => (
                <div key={label} className="rounded-xl border border-outline-variant bg-surface-container px-3 py-2 text-center">
                  <dt className="text-[0.6875rem] font-semibold text-on-surface-muted">{label}</dt>
                  <dd className="font-heading font-extrabold text-on-surface tabular">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Desktop: month grid */}
          <div className="hidden overflow-hidden rounded-3xl border border-outline-variant md:block">
            <div className="grid grid-cols-7 border-b border-outline-variant bg-surface-low">
              {WEEKDAYS.map((day) => (
                <div key={day} className="px-3 py-2 text-xs font-bold text-on-surface-muted">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-px bg-outline-variant">
              {Array.from({ length: leadingBlanks }, (_, i) => <div key={`blank-${i}`} className="bg-surface" />)}
              {cells.map((cell) => (
                <div
                  key={cell.key}
                  aria-current={cell.today ? "date" : undefined}
                  className={cn(
                    "flex min-h-24 flex-col gap-1 p-2",
                    cell.today ? "bg-primary-container" : cell.holiday ? "bg-surface-low" : "bg-surface-container",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn("text-sm font-bold tabular", cell.today ? "text-on-primary-container" : cell.holiday ? "text-on-surface-subtle" : "text-on-surface")}>
                      {cell.dayOfMonth}
                    </span>
                    {cell.dayOrder && (
                      <span className="rounded-md bg-surface-highest px-1.5 text-[0.6875rem] font-extrabold text-on-surface-brand">DO {cell.dayOrder}</span>
                    )}
                  </div>
                  {cell.event && <p className="line-clamp-2 text-xs font-semibold text-secondary-accent">{cell.event}</p>}
                  {cell.holiday && !cell.event && <p className="text-xs text-on-surface-subtle">Holiday</p>}
                </div>
              ))}
              {Array.from({ length: (7 - ((leadingBlanks + cells.length) % 7)) % 7 }, (_, i) => (
                <div key={`trail-${i}`} className="bg-surface" />
              ))}
            </div>
          </div>

          {/* Phones: day list */}
          <ol className="flex flex-col gap-1.5 md:hidden">
            {cells.map((cell) => (
              <li
                key={cell.key}
                aria-current={cell.today ? "date" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border px-3 py-2.5",
                  cell.today ? "border-primary/50 bg-primary-container" : cell.holiday ? "border-transparent bg-surface-low" : "border-outline-variant bg-surface-container",
                )}
              >
                <div className="w-11 text-center">
                  <p className="text-xs font-semibold text-on-surface-muted">{cell.weekday}</p>
                  <p className={cn("font-heading text-lg font-extrabold tabular", cell.holiday ? "text-on-surface-subtle" : "text-on-surface")}>{cell.dayOfMonth}</p>
                </div>
                <p className={cn("min-w-0 flex-1 truncate text-sm", cell.event ? "font-semibold text-secondary-accent" : "text-on-surface-muted")}>
                  {cell.event || (cell.holiday ? "Holiday" : "Regular classes")}
                </p>
                <span className="rounded-lg bg-surface-highest px-2 py-1 text-xs font-extrabold text-on-surface-brand">
                  {cell.dayOrder ? `DO ${cell.dayOrder}` : "-"}
                </span>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}
