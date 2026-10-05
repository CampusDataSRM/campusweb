/**
 * Timetable shaping: slots for a day order, clock times, and the class that
 * is on now or next.
 *
 * Times come without AM/PM ("08:00-08:50", "01:25 - 02:15"); as in Campus
 * App, hours 1-7 are afternoon. Break, lunch and "no class" slots are not
 * classes.
 */

import type { Timetable, TimetableSlot } from "@/network-calls/types";

export type ClassKind = "theory" | "practical";

export interface TimetableClass {
  /** Stable id: day + time + subject + type + room. */
  id: string;
  dayOrder: number;
  timeRange: string;
  startMinutes: number;
  endMinutes: number;
  subject: string;
  type: string;
  room: string;
  kind: ClassKind;
}

/** "08:00" / "1:25" / "13:25" -> minutes since midnight (24*60 if unreadable). */
export function timeToMinutes(raw: string): number {
  const match = /(\d{1,2})(?::(\d{1,2}))?/.exec(raw.trim());
  if (!match) return 24 * 60;
  let hour = Number(match[1]);
  const minute = Number(match[2] ?? 0);
  if (hour >= 1 && hour < 8) hour += 12;
  return hour * 60 + minute;
}

export function formatMinutes(minutes: number): string {
  const hour24 = Math.floor(minutes / 60) % 24;
  const minute = minutes % 60;
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${hour24 < 12 ? "AM" : "PM"}`;
}

export function isActualClass(slot: TimetableSlot | undefined): boolean {
  const subject = (slot?.subject_name ?? "").trim().toLowerCase();
  return (
    subject !== "" &&
    subject !== "-" &&
    subject !== "n/a" &&
    !subject.includes("no class") &&
    !subject.includes("noclass") &&
    !subject.includes("break") &&
    !subject.includes("lunch")
  );
}

const normalize = (value: string | undefined) =>
  (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");

export function classesForDay(
  timetable: Timetable | null | undefined,
  dayOrder: number | null,
): TimetableClass[] {
  if (!timetable || dayOrder === null) return [];
  const schedule = timetable[`Day${dayOrder}`];
  if (!schedule) return [];

  return Object.entries(schedule)
    .filter(([, slot]) => isActualClass(slot))
    .map(([timeRange, slot]) => {
      const [start = "", end = ""] = timeRange
        .split(/\s*[-–]\s*/)
        .map((part) => part.trim());
      const searchable =
        `${slot.subject_name} ${slot.subject_type}`.toLowerCase();
      return {
        id: [
          `day${dayOrder}`,
          normalize(timeRange),
          normalize(slot.subject_name),
          normalize(slot.subject_type),
          normalize(slot.room_code),
        ].join("|"),
        dayOrder,
        timeRange,
        startMinutes: timeToMinutes(start),
        endMinutes: timeToMinutes(end),
        subject: slot.subject_name.trim(),
        type: slot.subject_type?.trim() ?? "",
        room: cleanRoom(slot.room_code),
        kind:
          searchable.includes("lab") || searchable.includes("practical")
            ? ("practical" as const)
            : ("theory" as const),
      };
    })
    .sort((a, b) => a.startMinutes - b.startMinutes);
}

function cleanRoom(room: string | undefined): string {
  const value = (room ?? "").trim();
  return /^(n\/?a|-|to be all?otted)$/i.test(value) ? "" : value;
}

export interface ClassMoment {
  current: TimetableClass | null;
  next: TimetableClass | null;
}

/** The class in progress and the next one to start, at `minutesNow`. */
export function classMoment(
  classes: TimetableClass[],
  minutesNow: number,
): ClassMoment {
  let current: TimetableClass | null = null;
  let next: TimetableClass | null = null;
  for (const item of classes) {
    if (item.startMinutes <= minutesNow && minutesNow < item.endMinutes)
      current = item;
    else if (item.startMinutes > minutesNow && next === null) next = item;
  }
  return { current, next };
}

export const minutesSinceMidnight = (date: Date) =>
  date.getHours() * 60 + date.getMinutes();

/** The batch number the timetable endpoint wants: the last digit of comboBatch. */
export function batchFromCombo(comboBatch: string | undefined): number | null {
  const digit = /(\d)\s*$/.exec(comboBatch ?? "")?.[1];
  return digit ? Number(digit) : null;
}

/* ── Blocks and gaps: the day as a student reads it ── */

export interface ClassBlock {
  id: string;
  subject: string;
  type: string;
  room: string;
  kind: ClassKind;
  startMinutes: number;
  endMinutes: number;
  /** The consecutive periods this block covers, in order. */
  periods: TimetableClass[];
}

/**
 * Back-to-back periods of the same subject, type and room read as one class
 * ("8:00 to 10:35, 3 periods") - a lab is three slots in the data but one
 * sitting in the day. A short break between periods still counts as consecutive.
 */
export function mergeConsecutive(
  classes: TimetableClass[],
  maxBreak = 10,
): ClassBlock[] {
  const blocks: ClassBlock[] = [];
  for (const item of classes) {
    const last = blocks.at(-1);
    if (
      last &&
      last.subject === item.subject &&
      last.kind === item.kind &&
      last.room === item.room &&
      item.startMinutes - last.endMinutes <= maxBreak
    ) {
      last.endMinutes = Math.max(last.endMinutes, item.endMinutes);
      last.periods.push(item);
      continue;
    }
    blocks.push({
      id: item.id,
      subject: item.subject,
      type: item.type,
      room: item.room,
      kind: item.kind,
      startMinutes: item.startMinutes,
      endMinutes: item.endMinutes,
      periods: [item],
    });
  }
  return blocks;
}

export interface FreeGap {
  startMinutes: number;
  endMinutes: number;
  /** Index of the block the gap follows. */
  after: number;
}

/** Free stretches between blocks of at least `min` minutes. */
export function freeGaps(blocks: ClassBlock[], min = 20): FreeGap[] {
  const gaps: FreeGap[] = [];
  for (let i = 1; i < blocks.length; i++) {
    const start = blocks[i - 1].endMinutes;
    const end = blocks[i].startMinutes;
    if (end - start >= min)
      gaps.push({ startMinutes: start, endMinutes: end, after: i - 1 });
  }
  return gaps;
}

/** "1 h 55 min", "45 min", "2 h". */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m ? `${h} h ${m} min` : `${h} h`;
}
