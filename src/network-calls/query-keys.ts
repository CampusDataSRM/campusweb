/**
 * Central query key registry.
 *
 * Always build keys through these factories - never inline string keys - so
 * prefetches, hooks and invalidation hit the same cache entries.
 *
 * Student data is scoped by `scope` (the NetID, or "demo"/"guest"), so two
 * accounts used in one tab can never read each other's cached data, and
 * signing out is one `removeQueries(queryKeys.student.all(scope))`.
 */
export const queryKeys = {
  student: {
    all: (scope: string) => ["student", scope] as const,
    profile: (scope: string) => ["student", scope, "profile"] as const,
    timetable: (scope: string, batch: number) =>
      ["student", scope, "timetable", batch] as const,
    planner: (scope: string) => ["student", scope, "planner"] as const,
    studentPortalMarks: (scope: string) =>
      ["student", scope, "student-portal-marks"] as const,
  },
  events: {
    all: ["events"] as const,
    list: (scope: string) => ["events", "list", scope] as const,
  },
  clubs: {
    all: ["clubs"] as const,
    list: (scope: string) => ["clubs", "list", scope] as const,
  },
  batch: {
    all: ["batch"] as const,
    current: ["batch", "current"] as const,
  },
  feedback: {
    all: ["feedback"] as const,
    current: ["feedback", "current"] as const,
  },
  notes: {
    catalogue: ["notes", "catalogue"] as const,
    /** Per-account shelf: recently opened files and pinned subjects. */
    shelf: (scope: string) => ["notes", "shelf", scope] as const,
  },
  clubEvents: {
    all: ["clubEvents"] as const,
    current: ["clubEvents", "current"] as const,
  },
} as const;
