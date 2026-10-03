/**
 * CGPA calculator model - a port of Campus App's: subjects seeded from the
 * courses that have marks, grade O by default, credits from the course list
 * (LEM courses 0). SGPA counts only subjects with credits.
 */

import { effectiveCredit, gradePointFor, roundTo2 } from "@/lib/student/sgpa";
import type { StudentProfile } from "@/network-calls/types";

export const CGPA_GRADES = ["O", "A+", "A", "B+", "B", "C", "P", "F", "Ab", "I"] as const;
export type CgpaGrade = (typeof CGPA_GRADES)[number];
export const MAX_CREDITS = 19;

export interface CgpaSubject {
  id: string;
  name: string;
  credits: number;
  grade: CgpaGrade;
}

export function seedSubjects(profile: StudentProfile | undefined): CgpaSubject[] {
  if (!profile) return [];
  const credits = new Map<string, number>();
  for (const course of profile.courses ?? []) {
    credits.set(course.courseCode, (credits.get(course.courseCode) ?? 0) + effectiveCredit(course.courseCode, course.credit));
  }
  const seen = new Set<string>();
  const subjects: CgpaSubject[] = [];
  for (const course of profile.courses ?? []) {
    if (seen.has(course.courseCode)) continue;
    seen.add(course.courseCode);
    subjects.push({ id: course.courseCode, name: course.courseTitle, credits: credits.get(course.courseCode) ?? 0, grade: "O" });
  }
  return subjects;
}

export function cgpaSummary(subjects: readonly CgpaSubject[]): { credits: number; sgpa: number } {
  let credits = 0;
  let points = 0;
  for (const subject of subjects) {
    if (subject.credits <= 0) continue;
    credits += subject.credits;
    points += subject.credits * gradePointFor(subject.grade);
  }
  return { credits, sgpa: credits > 0 ? roundTo2(points / credits) : 0 };
}
