import type { StudentSession } from "@/lib/auth/session";
import type { AttendanceSubject, StudentProfile } from "@/network-calls/types";

export type RefreshTarget = "dashboard" | "attendance" | "marks" | "timetable";
export interface RefreshNotice {
  limited: boolean;
  stale: boolean;
  retryAfter: number;
}

export function refreshNotice(
  status: number,
  headers: Record<string, unknown>,
): RefreshNotice {
  const retry = Number(headers["retry-after"]);
  const state = String(headers["x-refresh-status"] ?? "")
    .trim()
    .toUpperCase();
  return {
    limited:
      status === 429 ||
      String(headers["x-force-refresh-limited"]).trim().toLowerCase() ===
        "true" ||
      state === "RECENT_CHECK",
    stale: state === "STALE_ON_ERROR",
    retryAfter: Number.isFinite(retry) && retry > 0 ? Math.ceil(retry) : 15,
  };
}

export function usesPortalRefresh(
  session: StudentSession,
  profile: StudentProfile | undefined,
  target: RefreshTarget,
) {
  return (
    (target === "marks" || target === "attendance") &&
    (session.kind === "student-portal" ||
      (profile?.attendanceSource === "student_portal" &&
        !profile.studentPortalLoginRequired))
  );
}

/** Apply the portal's attendance without discarding course/marks metadata. */
export function mergePortalAttendance(
  profile: StudentProfile,
  rows: AttendanceSubject[],
): StudentProfile {
  const code = (s: string) =>
    s
      .toUpperCase()
      .replace(/\s+/g, "")
      .replace(/REGULAR$/, "");
  const title = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  const applied = new Set<string>();
  const courses = (profile.courses ?? []).map((course) => {
    const row =
      rows.find((r) => code(r.subjectcode) === code(course.courseCode)) ??
      rows.find((r) => title(r.subjectdesc) === title(course.courseTitle));
    if (!row) return course;
    const present = Number(row.present),
      absent = Number(row.absent),
      total = Number(row.total);
    if (
      ![present, absent, total].every(Number.isFinite) ||
      present < 0 ||
      absent < 0 ||
      total <= 0 ||
      present + absent !== total
    )
      return course;
    const key = code(course.courseCode);
    // Portal J-code totals already combine theory and practical. Count them once.
    if (key.endsWith("J") && applied.has(key))
      return {
        ...course,
        hoursPresent: "0",
        hoursAbsent: "0",
        hoursConducted: "0",
        attendancePercent: "0",
        margin: 0,
        required: 0,
        studentPortalMergedAttendance: true,
      };
    applied.add(key);
    return {
      ...course,
      hoursPresent: String(present),
      hoursAbsent: String(absent),
      hoursConducted: String(total),
      attendancePercent: String((present * 100) / total),
      margin: Math.max(0, Math.floor(present / 0.75 - total)),
      required: Math.max(0, Math.ceil((0.75 * total - present) / 0.25)),
      studentPortalMergedAttendance: true,
    };
  });
  return {
    ...profile,
    courses,
    attendanceSource: "student_portal",
    studentPortalLoginRequired: false,
  };
}

/** A per-account gate shared by every refresh button; persistence survives reloads. */
export class RefreshGate {
  private active = new Set<string>();
  private until = new Map<string, number>();
  constructor(
    private read: (key: string) => Promise<number | null>,
    private write: (key: string, value: number) => Promise<void>,
    private now = Date.now,
  ) {}
  async run<T>(
    scope: string,
    work: () => Promise<{ value: T; cooldown?: number }>,
  ): Promise<{ value: T } | { blocked: "busy" | "cooldown"; seconds: number }> {
    if (this.active.has(scope)) return { blocked: "busy", seconds: 0 };
    this.active.add(scope);
    const key = `force-refresh:v1:${scope}`;
    try {
      const saved = await this.read(key).catch(() => null);
      const deadline = Math.max(
        this.until.get(scope) ?? 0,
        Number.isFinite(saved) ? saved! : 0,
      );
      if (deadline > this.now())
        return {
          blocked: "cooldown",
          seconds: Math.ceil((deadline - this.now()) / 1000),
        };
      const result = await work();
      const next = this.now() + (result.cooldown ?? 15) * 1000;
      this.until.set(scope, next);
      await this.write(key, next).catch(() => undefined);
      return { value: result.value };
    } finally {
      this.active.delete(scope);
    }
  }
}
