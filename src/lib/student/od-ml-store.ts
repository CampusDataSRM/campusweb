/**
 * OD/ML days the student has marked, per account and semester, in persistent
 * storage - re-applied whenever attendance opens (as Campus App does).
 * Dates are stored as local `YYYY-MM-DD` strings.
 */

import { storageGet, storageSet } from "@/lib/storage";

const keyFor = (scope: string, semester: string) => `od-ml:${scope}:${semester || "current"}`;

export const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export function fromDateKey(key: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
}

export async function readOdMlDates(scope: string, semester: string): Promise<Date[]> {
  const stored = await storageGet<string[]>(keyFor(scope, semester));
  return (Array.isArray(stored) ? stored : []).map(fromDateKey).filter((d): d is Date => d !== null);
}

export async function writeOdMlDates(scope: string, semester: string, dates: Date[]): Promise<void> {
  await storageSet(keyFor(scope, semester), [...new Set(dates.map(toDateKey))].sort());
}
