/** Route paths - no UI imports, so proxy.ts can use them cheaply. */

export const STUDENT_ROUTES = {
  dashboard: "/student",
  attendance: "/student/attendance",
  timetable: "/student/timetable",
  marks: "/student/marks",
  planner: "/student/planner",
  events: "/student/events",
  clubs: "/student/clubs",
  mess: "/student/mess",
  cgpa: "/student/cgpa",
  notes: "/student/notes",
  settings: "/student/settings",
} as const;

export const LEGAL_ROUTES = {
  center: "/legal",
  about: "/about",
  contact: "/contact",
  terms: "/terms",
  refunds: "/refund-policy",
  shipping: "/shipping-policy",
  privacy: "/privacy-policy",
  pricing: "/pricing",
} as const;

/** Guests may open only these student pages. The first is their landing. */
export const GUEST_STUDENT_PATHS = [
  STUDENT_ROUTES.events,
  STUDENT_ROUTES.clubs,
  STUDENT_ROUTES.settings,
] as const;

/** Club pages reachable without a club session. */
export const PUBLIC_CLUB_PATHS = [
  "/club/login",
  "/club/register",
  "/club/forgot-password",
  "/club/reset-password",
] as const;
