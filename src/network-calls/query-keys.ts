/**
 * Central query key registry.
 *
 * Always build keys through these factories — never inline string keys — so
 * server prefetches and client hooks are guaranteed to hit the same cache
 * entries, and invalidation stays trivial (e.g. queryKeys.planner.all).
 *
 * As endpoints arrive, extend this map hierarchically, e.g.:
 *   mess: { all: ["mess"], menu: (day) => ["mess", "menu", day] }
 */
export const queryKeys = {
  planner: {
    all: ["planner"] as const,
    current: ["planner", "current"] as const,
  },
  timetable: {
    all: ["timetable"] as const,
    byBatch: (batch: number) => ["timetable", "batch", batch] as const,
  },
  batch: {
    all: ["batch"] as const,
    current: ["batch", "current"] as const,
  },
  feedback: {
    all: ["feedback"] as const,
    current: ["feedback", "current"] as const,
  },
  events: {
    all: ["events"] as const,
    list: ["events", "list"] as const,
  },
} as const;
