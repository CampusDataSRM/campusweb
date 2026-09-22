/**
 * Central query key registry.
 *
 * Always build keys through these factories — never inline string keys — so
 * server prefetches and client hooks are guaranteed to hit the same cache
 * entries, and invalidation stays trivial (e.g. queryKeys.sem.all).
 *
 * As endpoints arrive, extend this map hierarchically, e.g.:
 *   mess: { all: ["mess"], menu: (day) => ["mess", "menu", day] }
 */
export const queryKeys = {
  sem: {
    all: ["sem"] as const,
    current: ["sem", "current"] as const,
  },
} as const;
