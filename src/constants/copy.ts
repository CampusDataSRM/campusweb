/**
 * Wording that changes with the session. The evaluator (demo) account is an
 * events programme, so - as in Campus App - attendance reads as check-ins and
 * marks as event scores. Everyone else sees the academic wording.
 */

import type { SessionKind } from "@/lib/auth/session";

export interface StudentCopy {
  attendanceTitle: string;
  attendanceShort: string;
  marksTitle: string;
  marksShort: string;
  overviewTitle: string;
  standingsTitle: string;
  subjects: string;
  belowThreshold: string;
  overallRate: string;
  currentItem: string;
  nextItem: string;
  noMarksTitle: string;
  noMarksBody: string;
}

const ACADEMIC: StudentCopy = {
  attendanceTitle: "Attendance",
  attendanceShort: "Attendance",
  marksTitle: "Marks",
  marksShort: "Marks",
  overviewTitle: "Today",
  standingsTitle: "Your standings",
  subjects: "Subjects",
  belowThreshold: "Below 75%",
  overallRate: "Overall attendance",
  currentItem: "Current class",
  nextItem: "Next class",
  noMarksTitle: "No marks yet",
  noMarksBody: "Marks appear here once they are published.",
};

const EVENTS: StudentCopy = {
  attendanceTitle: "Event & Workshop Check-Ins",
  attendanceShort: "Check-ins",
  marksTitle: "Event Leaderboard",
  marksShort: "Score",
  overviewTitle: "Participation overview",
  standingsTitle: "Event performance",
  subjects: "Activities",
  belowThreshold: "Missed",
  overallRate: "Overall check-in rate",
  currentItem: "Happening now",
  nextItem: "Next activity",
  noMarksTitle: "No results yet",
  noMarksBody: "Results appear here once they are published.",
};

export const copyFor = (kind: SessionKind | undefined): StudentCopy =>
  kind === "demo" ? EVENTS : ACADEMIC;
