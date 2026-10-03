/**
 * SGPA projection from published internal marks - a port of Campus App's
 * calculator (lib/sgpa/sgpa_calculator.dart, itself a port of the backend's),
 * so the website, the app and the API agree to the decimal.
 *
 * Per course code:
 * - marks are summed across every test with a positive total;
 * - no marks yet -> "pending", the result is marked partial;
 * - internal-only courses (code ending in "P"; titles PROJECT, MOOC, MAJOR
 *   PROJECT, INTERNSHIP): final = internal %;
 * - otherwise: final = internal % x 60 + 40 (the end-semester share assumed
 *   full, as the app does);
 * - grade from the final score; LEM courses carry 0 credits.
 * SGPA = sum(credit x grade point) / sum(credit), 2 decimals.
 */

import type { StudentProfile } from "@/network-calls/types";

export interface GradeBand {
  grade: string;
  point: number;
  minScore: number;
}

export const GRADE_BANDS: readonly GradeBand[] = [
  { grade: "O", point: 10, minScore: 91 },
  { grade: "A+", point: 9, minScore: 81 },
  { grade: "A", point: 8, minScore: 71 },
  { grade: "B+", point: 7, minScore: 61 },
  { grade: "B", point: 6, minScore: 56 },
  { grade: "C", point: 5, minScore: 50 },
];

export const FAIL_GRADE = "F";

export function gradeFromScore(score: number): { grade: string; point: number } {
  for (const band of GRADE_BANDS) {
    if (score >= band.minScore) return { grade: band.grade, point: band.point };
  }
  return { grade: FAIL_GRADE, point: 0 };
}

/** Points for a grade letter; anything outside the bands (P, Ab, I) is 0. */
export function gradePointFor(grade: string): number {
  return GRADE_BANDS.find((band) => band.grade === grade)?.point ?? 0;
}

export const isLemCourse = (code: string) => code.includes("LEM");

export function isInternalOnlyCourse(code: string, title: string): boolean {
  if (code.endsWith("P")) return true;
  const normalized = title.trim().split(/\s+/).join(" ").toUpperCase();
  return (
    normalized === "PROJECT" ||
    normalized.includes("MOOC") ||
    normalized.includes("MAJOR PROJECT") ||
    normalized.includes("INTERNSHIP")
  );
}

/** Credits that count toward SGPA: 0 for LEM and unparseable values. */
export function effectiveCredit(code: string, credit: string | number): number {
  if (isLemCourse(code)) return 0;
  const value =
    typeof credit === "number"
      ? credit
      : /^[+-]?\d+(\.\d+)?$/.test(credit.trim())
        ? Number(credit)
        : Number.NaN;
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export const roundTo2 = (value: number) => Math.round(value * 100) / 100;

export type SubjectStatus = "pending" | "calculated";
export type SubjectRule = "pending" | "internal-only" | "normal";

export interface SgpaSubject {
  courseCode: string;
  courseTitle: string;
  credit: number;
  obtained: number;
  total: number;
  /** Internal marks scaled to 60, for normal courses. */
  projectedInternal60: number | null;
  predictedFinal100: number | null;
  grade: string;
  gradePoint: number;
  countedInSgpa: boolean;
  status: SubjectStatus;
  rule: SubjectRule;
}

export interface SgpaProjection {
  sgpa: number;
  countedCredits: number;
  weightedPoints: number;
  isPartial: boolean;
  subjects: SgpaSubject[];
  notes: string[];
}

export const PARTIAL_NOTE =
  "Some subjects have no marks yet, so this is based on what's published.";

export function projectSgpa(profile: StudentProfile): SgpaProjection {
  // First occurrence of each course code wins (as in the app).
  const courses = new Map<string, { title: string; credit: string }>();
  for (const course of profile.courses ?? []) {
    if (!courses.has(course.courseCode)) {
      courses.set(course.courseCode, {
        title: course.courseTitle,
        credit: course.credit,
      });
    }
  }

  const obtained = new Map<string, number>();
  const total = new Map<string, number>();
  for (const row of profile.testPerformances ?? []) {
    if (!(row.totalMarks > 0)) continue;
    obtained.set(row.courseCode, (obtained.get(row.courseCode) ?? 0) + row.totalMarkGot);
    total.set(row.courseCode, (total.get(row.courseCode) ?? 0) + row.totalMarks);
  }

  const subjects: SgpaSubject[] = [];
  const notes: string[] = [];
  let weightedPoints = 0;
  let countedCredits = 0;
  let isPartial = false;

  for (const code of [...courses.keys()].sort()) {
    const info = courses.get(code)!;
    const credit = effectiveCredit(code, info.credit);
    const got = obtained.get(code) ?? 0;
    const out = total.get(code) ?? 0;

    if (out === 0) {
      isPartial = true;
      subjects.push({
        courseCode: code,
        courseTitle: info.title,
        credit,
        obtained: got,
        total: out,
        projectedInternal60: null,
        predictedFinal100: null,
        grade: "--",
        gradePoint: 0,
        countedInSgpa: false,
        status: "pending",
        rule: "pending",
      });
      continue;
    }

    const internalOnly = isInternalOnlyCourse(code, info.title);
    const ratio = got / out;
    const internal60 = internalOnly ? null : roundTo2(ratio * 60);
    const final100 = internalOnly ? ratio * 100 : ratio * 60 + 40;
    const { grade, point } = gradeFromScore(final100);
    const counted = credit > 0;

    if (counted) {
      weightedPoints += credit * point;
      countedCredits += credit;
    } else if (isLemCourse(code)) {
      notes.push(`${code} is a LEM course: 0 credits, not counted in SGPA.`);
    }

    subjects.push({
      courseCode: code,
      courseTitle: info.title,
      credit,
      obtained: got,
      total: out,
      projectedInternal60: internal60,
      predictedFinal100: roundTo2(final100),
      grade,
      gradePoint: point,
      countedInSgpa: counted,
      status: "calculated",
      rule: internalOnly ? "internal-only" : "normal",
    });
  }

  if (isPartial) notes.push(PARTIAL_NOTE);

  return {
    sgpa: roundTo2(countedCredits > 0 ? weightedPoints / countedCredits : 0),
    countedCredits,
    weightedPoints: roundTo2(weightedPoints),
    isPartial,
    subjects,
    notes,
  };
}
