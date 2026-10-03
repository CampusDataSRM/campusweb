/**
 * The academic planner: which day order (1-5) every date runs, plus holidays
 * and events.
 *
 * Today's day order comes from here, never from the timetable response - the
 * timetable's own `day_order` is the day it was fetched, so a saved copy
 * would show a stale day after a gap (the bug Campus App 1.0.43 fixed).
 */

import type { Planner, PlannerDay } from "@/network-calls/types";

const MONTHS = [
  "jan", "feb", "mar", "apr", "may", "jun",
  "jul", "aug", "sep", "oct", "nov", "dec",
] as const;

export interface PlannerMonth {
  key: string;
  /** 0-11. */
  month: number;
  /** Full year, or null when the key carries none. */
  year: number | null;
  days: PlannerDay[];
  holidays: Set<number>;
}

/** "Jan '26" / "January 2026" -> month and year. */
function parseMonthKey(key: string): { month: number; year: number | null } | null {
  const match = /([a-z]{3})[a-z]*\.?\s*'?\s*(\d{2,4})?/i.exec(key.trim());
  if (!match) return null;
  const month = MONTHS.indexOf(match[1].toLowerCase() as (typeof MONTHS)[number]);
  if (month < 0) return null;
  const rawYear = match[2] ? Number(match[2]) : null;
  const year = rawYear === null ? null : rawYear < 100 ? 2000 + rawYear : rawYear;
  return { month, year };
}

/** Normalise the API's month-keyed object into ordered months. */
export function plannerMonths(planner: Planner | null | undefined): PlannerMonth[] {
  if (!planner) return [];
  return Object.entries(planner).map(([key, value], index) => {
    const parsed = parseMonthKey(key);
    return {
      key,
      month: parsed?.month ?? index % 12,
      year: parsed?.year ?? null,
      days: Array.isArray(value?.Data) ? value.Data : [],
      holidays: new Set(Array.isArray(value?.Holiday) ? value.Holiday : []),
    };
  });
}

function monthFor(months: PlannerMonth[], date: Date): PlannerMonth | undefined {
  return (
    months.find((m) => m.month === date.getMonth() && m.year === date.getFullYear()) ??
    months.find((m) => m.month === date.getMonth() && m.year === null)
  );
}

export function plannerDayFor(months: PlannerMonth[], date: Date): PlannerDay | undefined {
  return monthFor(months, date)?.days.find(
    (day) => Number.parseInt(day.Date, 10) === date.getDate(),
  );
}

export function parseDayOrder(raw: string | null | undefined): number | null {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (!digits) return null;
  const value = Number(digits);
  return value >= 1 && value <= 5 ? value : null;
}

export function isPlannerHoliday(months: PlannerMonth[], date: Date): boolean {
  return monthFor(months, date)?.holidays.has(date.getDate()) ?? false;
}

/**
 * The day order on `date`: the planner's when it covers the date (null for a
 * holiday or a day without classes), otherwise the timetable's own value.
 */
export function resolveDayOrder(
  months: PlannerMonth[],
  date: Date,
  timetableDayOrder?: string | null,
): number | null {
  const month = monthFor(months, date);
  if (month) {
    if (month.holidays.has(date.getDate())) return null;
    const day = month.days.find((d) => Number.parseInt(d.Date, 10) === date.getDate());
    if (day) return parseDayOrder(day.Dayorder);
  }
  return parseDayOrder(timetableDayOrder);
}

/** Holidays in the month containing `date`, as day-of-month numbers. */
export function holidaysInMonth(months: PlannerMonth[], date: Date): number[] {
  const month = monthFor(months, date);
  return month ? [...month.holidays].sort((a, b) => a - b) : [];
}

/** Calendar date for a planner entry, or null if its month has no year. */
export function plannerEntryDate(month: PlannerMonth, day: PlannerDay): Date | null {
  const dayOfMonth = Number.parseInt(day.Date, 10);
  if (!Number.isFinite(dayOfMonth) || month.year === null) return null;
  return new Date(month.year, month.month, dayOfMonth);
}

/** First and last dated planner entries - the semester's span. */
export function plannerRange(months: PlannerMonth[]): { start: Date; end: Date } | null {
  let start: Date | null = null;
  let end: Date | null = null;
  for (const month of months) {
    for (const day of month.days) {
      const date = plannerEntryDate(month, day);
      if (!date) continue;
      if (!start || date < start) start = date;
      if (!end || date > end) end = date;
    }
  }
  return start && end ? { start, end } : null;
}
