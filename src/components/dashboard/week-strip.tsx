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

/** Only published planner entries get a day order or an off-day label. */
export function WeekStrip({ now }: { now: Date }) {
  const planner = usePlanner();
  const months = plannerMonths(planner.data);
  return (
    <Link
      href={STUDENT_ROUTES.planner}
      className="home-week"
      aria-label="Next seven days. Open academic planner"
    >
      <span className="home-week-heading">
        Next 7 days <ArrowUpRight aria-hidden size={14} />
      </span>
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
          return (
            <span
              key={date.toISOString()}
              className="home-week-day"
              data-today={offset === 0 || undefined}
            >
              <span>{weekday.format(date)}</span>
              <strong>{date.getDate().toString().padStart(2, "0")}</strong>
              <small>{order ? `Day ${order}` : published ? "Off" : "—"}</small>
            </span>
          );
        })}
      </span>
    </Link>
  );
}
