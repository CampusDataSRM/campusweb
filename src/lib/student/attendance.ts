/**
 * Attendance arithmetic - ports of Campus App's attendance_summary.dart,
 * student_portal_merged_attendance.dart and attendance_prediction.dart, so a
 * prediction on the website matches the app's to the class.
 *
 * The 75% rule: with P present out of C conducted,
 * - margin   = floor(P / 0.75 - C)          classes you can still miss;
 * - required = ceil((0.75 C - P) / 0.25)     classes to attend to reach 75%.
 */

import { plannerMonths, type PlannerMonth } from "@/lib/student/planner";
import type { Planner, Timetable, UserCourse } from "@/network-calls/types";

export const ATTENDANCE_THRESHOLD = 75;

export function parseNumber(value: unknown): number {
  const parsed = Number.parseFloat(
    String(value ?? "").replace(/[%,]/g, "").trim(),
  );
  return Number.isFinite(parsed) ? parsed : 0;
}

export interface MarginStatus {
  /** Classes that can be missed while staying at or above 75%. */
  margin: number;
  /** Classes needed to get back to 75%; 0 when at or above it. */
  required: number;
}

export function marginStatus(present: number, conducted: number): MarginStatus {
  if (conducted <= 0) return { margin: 0, required: 0 };
  const slack = present / 0.75 - conducted;
  if (slack >= -1e-9) return { margin: Math.max(0, Math.floor(slack)), required: 0 };
  return {
    margin: 0,
    required: Math.max(0, Math.ceil((0.75 * conducted - present) / 0.25)),
  };
}

export interface CourseAttendance {
  course: UserCourse;
  present: number;
  absent: number;
  conducted: number;
  percent: number;
  margin: number;
  required: number;
  odMl: number;
  /** No classes held yet - nothing to judge. */
  isPending: boolean;
  isBelowThreshold: boolean;
}

export function courseAttendance(course: UserCourse): CourseAttendance {
  const conducted = parseNumber(course.hoursConducted);
  const present = parseNumber(course.hoursPresent);
  const reported = Number.parseFloat(String(course.attendancePercent ?? "").replace("%", ""));
  const percent = Number.isFinite(reported)
    ? reported
    : conducted > 0
      ? (present / conducted) * 100
      : 0;
  // Trust the backend's margin/required when present; derive otherwise.
  const derived = marginStatus(present, conducted);
  const margin = Number.isFinite(course.margin) ? course.margin : derived.margin;
  const required = Number.isFinite(course.required) ? course.required : derived.required;
  return {
    course,
    present,
    absent: parseNumber(course.hoursAbsent) || Math.max(0, conducted - present),
    conducted,
    percent,
    margin,
    required,
    odMl: course.odMlCount ?? 0,
    isPending: conducted <= 0,
    isBelowThreshold: conducted > 0 && percent < ATTENDANCE_THRESHOLD,
  };
}

/** Overall attendance, weighted by classes held (not a mean of percents). */
export function overallAttendance(courses: readonly UserCourse[]): number {
  let present = 0;
  let conducted = 0;
  for (const course of courses) {
    const held = parseNumber(course.hoursConducted);
    if (held <= 0) continue;
    conducted += held;
    present += parseNumber(course.hoursPresent);
  }
  return conducted > 0 ? (present / conducted) * 100 : 0;
}

export const countBelowThreshold = (courses: readonly UserCourse[]) =>
  courses.filter((course) => courseAttendance(course).isBelowThreshold).length;

/* ── Theory + practical merge (Student Portal attendance) ── */

const normalizeCode = (code: unknown) => String(code ?? "").trim().toUpperCase();

const hasConducted = (course: UserCourse) => parseNumber(course.hoursConducted) > 0;

/**
 * The Student Portal reports one attendance figure for a course whose theory
 * and practical share a "J" code. Show that as one row, labelled
 * "Theory & Practical", and drop the empty twin.
 */
export function mergeTheoryPracticalCourses(
  courses: readonly UserCourse[],
  attendanceSource: string | undefined,
): UserCourse[] {
  const fromPortal = attendanceSource?.trim().toLowerCase() === "student_portal";
  const persisted = courses.some((course) => course.studentPortalMergedAttendance);
  if (!fromPortal && !persisted) return [...courses];

  const groups = new Map<string, number[]>();
  courses.forEach((course, index) => {
    const code = normalizeCode(course.courseCode);
    if (!code.endsWith("J")) return;
    groups.set(code, [...(groups.get(code) ?? []), index]);
  });

  const result = courses.map((course) => ({ ...course }));
  const removed = new Set<number>();
  for (const indexes of groups.values()) {
    const useful = indexes.filter((index) => hasConducted(courses[index]));
    const flagged = indexes.filter((index) => courses[index].studentPortalMergedAttendance);
    let merged: number | undefined;
    if (useful.length === 1 && (fromPortal || flagged.length > 0)) merged = useful[0];
    else if (useful.length === 0 && flagged.length === 1) merged = flagged[0];
    else if (useful.length === 0 && fromPortal) merged = indexes[0];
    if (merged === undefined) continue;

    result[merged].studentPortalMergedAttendance = true;
    result[merged].category = "Theory & Practical";
    for (const index of indexes) {
      if (index !== merged && !hasConducted(courses[index])) removed.add(index);
    }
  }
  return result.filter((_, index) => !removed.has(index));
}

/* ── Prediction ── */

const normalizeTitle = (value: string) =>
  value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();

function subjectMatchesCourse(subjectKey: string, courseTitle: string): boolean {
  const course = normalizeTitle(courseTitle);
  if (!subjectKey || !course) return false;
  return subjectKey === course || subjectKey.includes(course) || course.includes(subjectKey);
}

const dateKey = (date: Date) =>
  date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();

const dateOnly = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export interface PredictionInput {
  today: Date;
  /** Upcoming days the student expects to miss. */
  absentDates: readonly Date[];
  /** Days covered by OD/ML - counted present, past ones restore absences. */
  creditedDates?: readonly Date[];
  planner: Planner;
  timetable: Timetable;
  courses: readonly UserCourse[];
  /** Timetable class ids the student has hidden as optional. */
  optionalClassIds?: ReadonlySet<string>;
}

export interface PredictionResult {
  courses: UserCourse[];
  /** Classes from today to the last selected day. */
  projectedClassCount: number;
  missedClassCount: number;
  selectedClassCount: number;
}

export type PredictionError = "no-dates" | "past-dates";

/** Classes per subject over a list of planner days. */
function countSubjects(
  days: ReadonlyArray<{ date: Date; dayOrder: string }>,
  timetable: Timetable,
  optionalIds: ReadonlySet<string>,
  counts: Map<string, number>,
  datesBySubject?: Map<string, Set<number>>,
): number {
  let total = 0;
  for (const day of days) {
    if (!day.dayOrder || day.dayOrder === "-") continue;
    const schedule = timetable[`Day${day.dayOrder}`];
    if (!schedule) continue;
    for (const [timeRange, slot] of Object.entries(schedule)) {
      const subject = slot?.subject_name?.trim();
      if (!subject) continue;
      const id = [
        `day${day.dayOrder}`,
        timeRange.trim().toLowerCase().replace(/\s+/g, " "),
        subject.toLowerCase().replace(/\s+/g, " "),
        (slot.subject_type ?? "").trim().toLowerCase().replace(/\s+/g, " "),
        (slot.room_code ?? "").trim().toLowerCase().replace(/\s+/g, " "),
      ].join("|");
      if (optionalIds.has(id)) continue;
      const key = normalizeTitle(subject);
      if (!key || key === "no class" || key === "n a") continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
      if (datesBySubject) {
        const dates = datesBySubject.get(key) ?? new Set<number>();
        dates.add(dateKey(day.date));
        datesBySubject.set(key, dates);
      }
      total++;
    }
  }
  return total;
}

function occurrencesFor(counts: Map<string, number>, course: UserCourse): number {
  if (!course.studentPortalMergedAttendance) {
    return counts.get(normalizeTitle(course.courseTitle)) ?? 0;
  }
  let total = 0;
  for (const [key, value] of counts) {
    if (subjectMatchesCourse(key, course.courseTitle)) total += value;
  }
  return total;
}

function datesFor(datesBySubject: Map<string, Set<number>>, course: UserCourse): number {
  if (!course.studentPortalMergedAttendance) {
    return datesBySubject.get(normalizeTitle(course.courseTitle))?.size ?? 0;
  }
  const dates = new Set<number>();
  for (const [key, value] of datesBySubject) {
    if (subjectMatchesCourse(key, course.courseTitle)) value.forEach((d) => dates.add(d));
  }
  return dates.size;
}

export function predictAttendance(
  input: PredictionInput,
): PredictionResult | PredictionError {
  const today = dateOnly(input.today);
  const credited = (input.creditedDates ?? []).map(dateOnly);
  const creditedKeys = new Set(credited.map(dateKey));
  const absent = input.absentDates.map(dateOnly).filter((d) => !creditedKeys.has(dateKey(d)));
  const selected = [...absent, ...credited];

  if (selected.length === 0) return "no-dates";
  if (absent.some((date) => date < today)) return "past-dates";

  const firstSelected = selected.reduce((a, b) => (a < b ? a : b));
  const lastSelected = selected.reduce((a, b) => (a > b ? a : b));
  const firstProcessed = firstSelected < today ? firstSelected : today;
  const absentKeys = new Set(absent.map(dateKey));

  const months: PlannerMonth[] = plannerMonths(input.planner);
  const days: Array<{ date: Date; dayOrder: string }> = [];
  for (const month of months) {
    if (month.year === null) continue;
    for (const entry of month.days) {
      const dayOfMonth = Number.parseInt(entry.Date, 10);
      if (!Number.isFinite(dayOfMonth)) continue;
      const date = new Date(month.year, month.month, dayOfMonth);
      if (date < firstProcessed || date > lastSelected) continue;
      days.push({ date, dayOrder: entry.Dayorder?.trim() || "-" });
    }
  }

  const optional = input.optionalClassIds ?? new Set<string>();
  const future = days.filter((day) => day.date >= today);
  const presentDays = future.filter((day) => !absentKeys.has(dateKey(day.date)));
  const absentDays = future.filter((day) => absentKeys.has(dateKey(day.date)));
  const creditedDays = days.filter((day) => creditedKeys.has(dateKey(day.date)));
  const pastCreditedDays = creditedDays.filter((day) => day.date < today);

  const presentCounts = new Map<string, number>();
  const absentCounts = new Map<string, number>();
  const pastCreditCounts = new Map<string, number>();
  const creditedDatesBySubject = new Map<string, Set<number>>();

  const presentClassCount = countSubjects(presentDays, input.timetable, optional, presentCounts);
  const missedClassCount = countSubjects(absentDays, input.timetable, optional, absentCounts);
  const creditedClassCount = countSubjects(
    creditedDays, input.timetable, optional, new Map(), creditedDatesBySubject,
  );
  countSubjects(pastCreditedDays, input.timetable, optional, pastCreditCounts);

  const courses = input.courses.map((original) => {
    const course = { ...original };
    if (!course.courseTitle?.trim()) return course;
    const presentCount = occurrencesFor(presentCounts, course);
    const absentCount = occurrencesFor(absentCounts, course);
    const pastCreditCount = occurrencesFor(pastCreditCounts, course);
    const occurrences = presentCount + absentCount;
    if (occurrences === 0 && pastCreditCount === 0) return course;

    const conductedNow = parseNumber(course.hoursConducted);
    const presentNow = parseNumber(course.hoursPresent);
    const absentNow = Math.max(0, conductedNow - presentNow);
    const restored = Math.min(Math.max(0, pastCreditCount), absentNow);
    const conducted = conductedNow + occurrences;
    const present = presentNow + presentCount + restored;
    const { margin, required } = marginStatus(present, conducted);

    course.hoursConducted = conducted.toFixed(2);
    course.hoursPresent = present.toFixed(2);
    course.hoursAbsent = (conducted - present).toFixed(2);
    course.attendancePercent = (conducted === 0 ? 0 : (present * 100) / conducted).toFixed(2);
    course.margin = margin;
    course.required = required;
    course.odMlCount = datesFor(creditedDatesBySubject, course);
    return course;
  });

  return {
    courses,
    projectedClassCount: presentClassCount + missedClassCount,
    missedClassCount,
    selectedClassCount: missedClassCount + creditedClassCount,
  };
}

/* ── Timetable class -> attendance course ── */

const significantWords = (value: string) =>
  normalizeTitle(value).split(" ").filter((word) => word.length > 3);

/**
 * The course a timetable class belongs to: exact title with matching
 * theory/practical type first, then any exact title, then the course sharing
 * the most significant words (as the app's dashboard does).
 */
export function courseForSubject(
  courses: readonly UserCourse[],
  subject: string,
  practical: boolean,
): UserCourse | undefined {
  const key = normalizeTitle(subject);
  if (!key) return undefined;
  const titled = courses.filter((course) => normalizeTitle(course.courseTitle) === key);
  const typed = titled.find(
    (course) => /practical|lab/i.test(course.courseType ?? course.category ?? "") === practical,
  );
  if (typed ?? titled[0]) return typed ?? titled[0];

  const words = new Set(significantWords(subject));
  let best: UserCourse | undefined;
  let bestScore = 0;
  for (const course of courses) {
    const score = significantWords(course.courseTitle).filter((word) => words.has(word)).length;
    if (score > bestScore) {
      best = course;
      bestScore = score;
    }
  }
  return best;
}

export type AttendanceTier = "good" | "warn" | "bad";

/** Green at 75%+, amber from 60%, red below - the app's colour bands. */
export const attendanceTier = (percent: number): AttendanceTier =>
  percent >= ATTENDANCE_THRESHOLD ? "good" : percent >= 60 ? "warn" : "bad";
