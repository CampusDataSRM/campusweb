"use client";

import { CalendarX2, ChevronLeft, ChevronRight, Flag } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  CachedBadge,
  EmptyState,
  ErrorState,
  ShimmerBlock,
} from "@/components/feedback/data-states";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { STUDENT_ROUTES } from "@/constants/routes";
import { useNow } from "@/hooks/use-now";
import { usePlanner, useTimetable } from "@/hooks/use-student-data";
import {
  parseDayOrder,
  plannerEntryDate,
  plannerMonths,
  type PlannerMonth,
} from "@/lib/student/planner";
import {
  classesForDay,
  formatMinutes,
  mergeConsecutive,
} from "@/lib/student/timetable";
import type { Timetable } from "@/network-calls/types";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const longDate = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

interface DayCell {
  key: string;
  date: Date | null;
  dayOfMonth: number;
  weekday: string;
  event: string;
  dayOrder: number | null;
  holiday: boolean;
  weekend: boolean;
  today: boolean;
  past: boolean;
  /** Sittings that day, from the timetable. */
  classes: number;
  firstStart: number | null;
}

function cellsFor(
  month: PlannerMonth,
  now: Date,
  timetable: Timetable | undefined,
): DayCell[] {
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return month.days.map((day) => {
    const date = plannerEntryDate(month, day);
    const dayOfMonth = Number.parseInt(day.Date, 10);
    const dayOrder = parseDayOrder(day.Dayorder);
    const blocks = dayOrder
      ? mergeConsecutive(classesForDay(timetable, dayOrder))
      : [];
    const weekday =
      day.Day?.trim() || (date ? WEEKDAYS[(date.getDay() + 6) % 7] : "");
    return {
      key: `${month.key}-${day.Date}`,
      date,
      dayOfMonth,
      weekday,
      event: day.Event?.trim() ?? "",
      dayOrder,
      holiday: month.holidays.has(dayOfMonth),
      weekend: /^(sat|sun)/i.test(weekday),
      today: !!date && date.toDateString() === now.toDateString(),
      past: !!date && date < todayStart,
      classes: blocks.length,
      firstStart: blocks[0]?.startMinutes ?? null,
    };
  });
}

/**
 * The academic planner, a month at a time. Class days say what the day
 * holds and open that day's timetable; weekends stay quiet so hatching
 * means a real holiday; the month's events and holidays are listed below.
 */
export function PlannerView() {
  const now = useNow();
  const planner = usePlanner();
  const timetable = useTimetable();
  const months = useMemo(() => plannerMonths(planner.data), [planner.data]);
  const currentIndex = useMemo(() => {
    if (!now) return 0;
    const found = months.findIndex(
      (m) =>
        m.month === now.getMonth() &&
        (m.year === null || m.year === now.getFullYear()),
    );
    return found >= 0 ? found : 0;
  }, [months, now]);
  const [picked, setPicked] = useState<number | null>(null);
  const index = Math.min(
    picked ?? currentIndex,
    Math.max(0, months.length - 1),
  );
  const month = months[index];
  const cells = useMemo(
    () => (month && now ? cellsFor(month, now, timetable.data?.timetable) : []),
    [month, now, timetable.data],
  );

  const classDays = cells.filter((c) => c.dayOrder !== null);
  const classDaysLeft = classDays.filter((c) => !c.past).length;
  const holidays = cells.filter((c) => c.holiday && !c.weekend);
  const events = cells.filter((c) => c.event || (c.holiday && !c.weekend));
  const nextEvent = events.find((c) => !c.past);

  const leadingBlanks =
    month?.year !== null && month
      ? (new Date(month.year!, month.month, 1).getDay() + 6) % 7
      : 0;

  return (
    <div className="campus-view planner-page flex flex-col gap-6">
      <PageHeader
        title="Planner"
        status={
          <CachedBadge
            savedAt={planner.savedAt}
            refreshing={planner.isFetching}
          />
        }
        description="Day orders, events and holidays for the semester."
      />
      {planner.isLoading || !now ? (
        <ShimmerBlock className="h-96" />
      ) : !planner.data ? (
        <ErrorState
          error={planner.error}
          title="Couldn't load the planner"
          onRetry={() => void planner.refetch()}
          retrying={planner.isFetching}
        />
      ) : !month ? (
        <EmptyState
          icon={CalendarX2}
          title="No schedule yet"
          description="The planner appears once it's published."
        />
      ) : (
        <>
          <div className="campus-toolbar planner-controls">
            <div className="planner-month-controls flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-touch"
                aria-label="Previous month"
                disabled={index === 0}
                onClick={() => setPicked(index - 1)}
              >
                <ChevronLeft />
              </Button>
              <h2
                className="min-w-44 text-center font-heading text-h3 font-bold text-on-surface"
                aria-live="polite"
              >
                {MONTH_NAMES[month.month]} {month.year ?? ""}
              </h2>
              <Button
                variant="outline"
                size="icon-touch"
                aria-label="Next month"
                disabled={index >= months.length - 1}
                onClick={() => setPicked(index + 1)}
              >
                <ChevronRight />
              </Button>
              <Button
                variant="outline"
                size="touch"
                className="ml-1"
                onClick={() => setPicked(null)}
                disabled={index === currentIndex}
              >
                Today
              </Button>
            </div>
            <dl className="planner-stats">
              <div>
                <dt>Class days</dt>
                <dd className="tabular">
                  {index === currentIndex ? (
                    <>
                      {classDaysLeft}
                      <small> left of {classDays.length}</small>
                    </>
                  ) : (
                    classDays.length
                  )}
                </dd>
              </div>
              <div>
                <dt>Holidays</dt>
                <dd className="tabular">{holidays.length}</dd>
              </div>
              {nextEvent && nextEvent.date && (
                <div className="planner-stat-next">
                  <dt>{nextEvent.today ? "Today" : "Next up"}</dt>
                  <dd>
                    {nextEvent.event || "Holiday"}
                    <small> · {longDate.format(nextEvent.date)}</small>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="planner-legend">
            <span>
              <i aria-hidden data-tone="today" />
              Today
            </span>
            <span>
              <i aria-hidden data-tone="holiday" />
              Holiday
            </span>
            <span>
              <i aria-hidden data-tone="event" />
              Event
            </span>
            <span className="planner-legend-hint">
              Tap a class day to open its timetable
            </span>
          </div>

          <div className="planner-calendar panel overflow-hidden">
            <div className="planner-weekdays">
              {WEEKDAYS.map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>
            <div className="planner-grid">
              {Array.from({ length: leadingBlanks }, (_, i) => (
                <div
                  key={`blank-${i}`}
                  className="planner-cell"
                  data-blank=""
                />
              ))}
              {cells.map((cell) => {
                const named = cell.holiday && !cell.weekend;
                const body = (
                  <>
                    <div className="planner-cell-top">
                      <span className="planner-cell-date tabular">
                        {cell.dayOfMonth}
                      </span>
                      {cell.dayOrder && (
                        <span className="planner-cell-order">
                          Day {cell.dayOrder}
                        </span>
                      )}
                    </div>
                    {cell.event ? (
                      <p className="planner-cell-event">{cell.event}</p>
                    ) : named ? (
                      <p className="planner-cell-note">Holiday</p>
                    ) : cell.classes > 0 ? (
                      <p className="planner-cell-note">
                        {cell.classes}{" "}
                        {cell.classes === 1 ? "class" : "classes"}
                        {cell.firstStart !== null && (
                          <span> · {formatMinutes(cell.firstStart)}</span>
                        )}
                      </p>
                    ) : null}
                  </>
                );
                const attrs = {
                  className: "planner-cell",
                  "aria-current": cell.today ? ("date" as const) : undefined,
                  "data-today": cell.today || undefined,
                  "data-holiday": named || undefined,
                  "data-weekend": (cell.weekend && !cell.dayOrder) || undefined,
                  "data-past": (cell.past && !cell.today) || undefined,
                  "data-event": !!cell.event || undefined,
                };
                return cell.dayOrder ? (
                  <Link
                    key={cell.key}
                    href={`${STUDENT_ROUTES.timetable}?day=${cell.dayOrder}`}
                    aria-label={`${cell.date ? longDate.format(cell.date) : cell.dayOfMonth}, Day ${cell.dayOrder}${cell.classes ? `, ${cell.classes} classes` : ""}. Open timetable`}
                    {...attrs}
                  >
                    {body}
                  </Link>
                ) : (
                  <div key={cell.key} {...attrs}>
                    {body}
                  </div>
                );
              })}
              {Array.from(
                { length: (7 - ((leadingBlanks + cells.length) % 7)) % 7 },
                (_, i) => (
                  <div
                    key={`trail-${i}`}
                    className="planner-cell"
                    data-blank=""
                  />
                ),
              )}
            </div>
          </div>

          {events.length > 0 && (
            <section
              aria-label="Events and holidays this month"
              className="planner-events"
            >
              <h3>Coming up in {MONTH_NAMES[month.month]}</h3>
              <ol>
                {events.map((cell) => (
                  <li
                    key={cell.key}
                    data-past={(cell.past && !cell.today) || undefined}
                    data-today={cell.today || undefined}
                  >
                    <span className="planner-event-date">
                      <span>{cell.weekday.slice(0, 3)}</span>
                      <strong className="tabular">{cell.dayOfMonth}</strong>
                    </span>
                    <span className="planner-event-body">
                      <span className="planner-event-title">
                        {cell.event ? (
                          <Flag aria-hidden className="size-3.5" />
                        ) : null}
                        {cell.event || "Holiday"}
                      </span>
                      <span className="planner-event-sub">
                        {cell.dayOrder
                          ? `Day ${cell.dayOrder} · classes as usual`
                          : "No classes"}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </>
      )}
    </div>
  );
}
