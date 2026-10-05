"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { STUDENT_ROUTES } from "@/constants/routes";
import { usePlanner } from "@/hooks/use-student-data";
import {
  isPlannerHoliday,
  plannerDayFor,
  plannerMonths,
  resolveDayOrder,
} from "@/lib/student/planner";

const weekday = new Intl.DateTimeFormat("en-IN", { weekday: "short" });
const longDate = new Intl.DateTimeFormat("en-IN", {
  weekday: "long",
  day: "numeric",
  month: "short",
});

/**
 * The next seven days. Each class day opens its day order in the timetable;
 * off days and the heading open the planner. Only published planner entries
 * get a day order or an off-day label.
 */
export function WeekStrip({ now }: { now: Date }) {
  const planner = usePlanner();
  const months = plannerMonths(planner.data);
  return (
    <div className="home-week">
      <Link
        href={STUDENT_ROUTES.planner}
        className="home-week-heading"
        aria-label="Next seven days. Open academic planner"
      >
        Next 7 days <ArrowUpRight aria-hidden size={14} />
      </Link>
      <span className="home-week-days">
        {Array.from({ length: 7 }, (_, offset) => {
          const date = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + offset,
          );
          const order = resolveDayOrder(months, date);
          const published =
            isPlannerHoliday(months, date) ||
            Boolean(plannerDayFor(months, date));
          const label = order ? `Day ${order}` : published ? "Off" : "—";
          return (
            <Link
              key={date.toISOString()}
              href={
                order
                  ? `${STUDENT_ROUTES.timetable}?day=${order}`
                  : STUDENT_ROUTES.planner
              }
              className="home-week-day"
              data-today={offset === 0 || undefined}
              aria-label={`${longDate.format(date)}, ${label}. ${order ? "Open timetable" : "Open planner"}`}
            >
              <span>{weekday.format(date)}</span>
              <strong>{date.getDate().toString().padStart(2, "0")}</strong>
              <small>{label}</small>
            </Link>
          );
        })}
      </span>
    </div>
  );
}
