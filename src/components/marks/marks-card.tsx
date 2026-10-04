import type { CSSProperties } from "react";

import { AttendanceTrack } from "@/components/ui/attendance-track";

import type { SgpaSubject } from "@/lib/student/sgpa";
import { cn } from "@/lib/utils";
import type { UserTestPerformance } from "@/network-calls/types";

const fmt = (value: number) =>
  Number.isInteger(value)
    ? String(value)
    : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");

/** Green from 75%, amber from 50%, red below - read at a glance, like attendance. */
export function marksTone(percent: number): "good" | "warn" | "bad" {
  return percent >= 75 ? "good" : percent >= 50 ? "warn" : "bad";
}

const TONE_TEXT = {
  good: "text-success-accent",
  warn: "text-warning-accent",
  bad: "text-danger-accent",
} as const;

/**
 * One course: its total and percentage, the projected grade when there is
 * one, and every published test as a score bar.
 */
export function MarksCard({
  performance,
  credits,
  projection,
  index = 0,
}: {
  performance: UserTestPerformance;
  /** From the course list; "3", "2.5" ... */
  credits?: string;
  /** This course's line in the SGPA projection, when marks exist. */
  projection?: SgpaSubject;
  /** Position in the list, for the staggered entrance. */
  index?: number;
}) {
  const tests = Object.entries(performance.tests ?? {}).map(([name, test]) => ({
    name,
    got: test.got,
    total: test.total,
    percent: test.total > 0 ? (test.got / test.total) * 100 : test.percentage,
  }));
  const total =
    performance.totalMarks || tests.reduce((sum, t) => sum + t.total, 0);
  const got =
    performance.totalMarkGot || tests.reduce((sum, t) => sum + t.got, 0);
  const overall = total > 0 ? (got / total) * 100 : 0;
  const pending = total <= 0;
  const tone = pending ? "pending" : marksTone(overall);
  const credit = Number.parseFloat(credits ?? "");
  const graded =
    projection &&
    projection.status === "calculated" &&
    projection.grade !== "--"
      ? projection
      : null;

  return (
    <article
      className="marks-card panel spotlight flex flex-col gap-5 rounded-3xl p-5 sm:p-6"
      data-tone={tone}
      style={{ "--i": index } as CSSProperties}
      aria-label={`${performance.courseName || performance.courseCode}, ${pending ? "no tests published" : `${fmt(got)} of ${fmt(total)}, ${overall.toFixed(1)}%`}${graded ? `, projected grade ${graded.grade}` : ""}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg leading-snug font-extrabold text-on-surface">
            {performance.courseName || performance.courseCode}
          </h3>
          <p className="marks-card-meta mt-1 flex flex-wrap gap-x-3 text-xs font-semibold text-on-surface-muted">
            <span>{performance.courseCode}</span>
            {performance.courseType && <span>{performance.courseType}</span>}
            {Number.isFinite(credit) && credit > 0 && (
              <span>{fmt(credit)} credits</span>
            )}
          </p>
        </div>
        <div className="marks-card-figure shrink-0 text-right">
          <p className="text-h2 leading-none font-black text-on-surface tabular">
            {fmt(got)}
            <span className="text-base font-extrabold text-on-surface-muted">
              /{fmt(total)}
            </span>
          </p>
          {!pending && (
            <p className="marks-card-standing">
              <span
                className={cn(
                  "font-extrabold tabular",
                  TONE_TEXT[tone as keyof typeof TONE_TEXT],
                )}
              >
                {overall.toFixed(1)}%
              </span>
              {graded && (
                <span
                  className="marks-card-grade"
                  title={`Projected ${graded.predictedFinal100} out of 100`}
                >
                  {graded.grade}
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      {tests.length === 0 ? (
        <p className="marks-card-empty text-sm text-on-surface-muted">
          No tests published yet.
        </p>
      ) : (
        <ul className="marks-card-tests flex flex-col gap-3">
          {tests.map((test, i) => {
            const t = marksTone(test.percent);
            return (
              <li
                key={test.name}
                className="grid grid-cols-[minmax(0,1fr)_minmax(3rem,1fr)_auto] items-center gap-3"
              >
                <span className="truncate text-sm font-medium text-on-surface-muted">
                  {test.name}
                </span>
                <span className="marks-bar">
                  <AttendanceTrack
                    value={test.percent}
                    tone={
                      t === "good"
                        ? "success"
                        : t === "warn"
                          ? "warning"
                          : "danger"
                    }
                    label={false}
                  />
                </span>
                <span className="marks-card-score text-right text-sm font-extrabold text-on-surface tabular">
                  <span>
                    {fmt(test.got)}
                    <span className="text-on-surface-muted">
                      /{fmt(test.total)}
                    </span>
                  </span>
                  <small>{test.percent.toFixed(0)}%</small>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}
