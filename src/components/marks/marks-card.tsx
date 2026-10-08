import type { CSSProperties, ReactNode } from "react";

import { AttendanceTrack } from "@/components/ui/attendance-track";
import { formatMark, type SubjectMarks } from "@/lib/student/marks";
import type { SgpaSubject } from "@/lib/student/sgpa";
import { cn } from "@/lib/utils";

import styles from "./marks-card.module.css";

/** A visual score range, independent of a course's passing requirements. */
export function marksTone(percent: number): "good" | "warn" | "bad" {
  return percent >= 75 ? "good" : percent >= 50 ? "warn" : "bad";
}

const TONE_TEXT = {
  good: "text-success-accent",
  warn: "text-warning-accent",
  bad: "text-danger-accent",
} as const;

const TRACK_TONE = {
  good: "success",
  warn: "warning",
  bad: "danger",
} as const;

/** One compact course card with every published assessment kept visible. */
export function MarksCard({
  subject,
  credits,
  projection,
  index = 0,
  children,
}: {
  subject: SubjectMarks;
  credits?: string;
  projection?: SgpaSubject;
  index?: number;
  children?: ReactNode;
}) {
  const credit = Number(credits);
  const tone =
    subject.percent === null ? "pending" : marksTone(subject.percent);
  const graded =
    projection?.status === "calculated" && projection.grade !== "--"
      ? projection
      : null;

  return (
    <article
      className={cn(
        "marks-card panel spotlight flex flex-col gap-5 rounded-3xl p-5 sm:p-6",
        styles.card,
      )}
      data-tone={tone}
      style={{ "--i": index } as CSSProperties}
      aria-label={`${subject.courseName || subject.courseCode} marks`}
    >
      <header className={styles.header}>
        <div className="min-w-0">
          <h3 className={styles.title}>
            {subject.courseName || subject.courseCode}
          </h3>
          <p className="marks-card-meta mt-1 flex flex-wrap gap-x-3 text-xs font-semibold text-on-surface-muted">
            <span>{subject.courseCode}</span>
            {subject.courseType && <span>{subject.courseType}</span>}
            {Number.isFinite(credit) && credit > 0 && (
              <span>
                {formatMark(credit)} {credit === 1 ? "credit" : "credits"}
              </span>
            )}
          </p>
        </div>

        <div className="marks-card-figure shrink-0 text-right">
          {subject.percent !== null ? (
            <>
              <p
                className={styles.total}
                aria-label={`${formatMark(subject.got)} out of ${formatMark(subject.total)} marks`}
              >
                {formatMark(subject.got)}
                <span>/{formatMark(subject.total)}</span>
              </p>
              <p className="marks-card-standing">
                <span
                  className={cn(
                    "font-extrabold tabular",
                    TONE_TEXT[marksTone(subject.percent)],
                  )}
                >
                  {formatMark(subject.percent)}%
                </span>
                {graded && (
                  <span
                    className="marks-card-grade"
                    title={`Projected grade ${graded.grade}; ${graded.predictedFinal100} out of 100`}
                  >
                    {graded.grade}
                  </span>
                )}
              </p>
            </>
          ) : (
            <span className={styles.awaiting}>Awaiting marks</span>
          )}
        </div>
      </header>

      {children}

      {subject.assessments.length > 0 ? (
        <ul
          className="marks-card-tests flex flex-col gap-4"
          aria-label="Assessment breakdown"
        >
          {subject.assessments.map((assessment) => (
            <li className={styles.assessment} key={assessment.name}>
              <span className={styles.assessmentName}>{assessment.name}</span>
              {assessment.percent !== null ? (
                <>
                  <span className={cn("marks-bar", styles.track)}>
                    <AttendanceTrack
                      value={assessment.percent}
                      tone={TRACK_TONE[marksTone(assessment.percent)]}
                      threshold={100}
                      label={false}
                    />
                  </span>
                  <span
                    className="marks-card-score text-right text-sm font-extrabold text-on-surface tabular"
                    aria-label={`${formatMark(assessment.got)} out of ${formatMark(assessment.total)} marks, ${formatMark(assessment.percent)} percent`}
                  >
                    <span>
                      {formatMark(assessment.got)}
                      <span className="text-on-surface-muted">
                        /{formatMark(assessment.total)}
                      </span>
                    </span>
                    <small>{formatMark(assessment.percent)}%</small>
                  </span>
                </>
              ) : (
                <span className={styles.assessmentPending}>Awaiting marks</span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="marks-card-empty text-sm text-on-surface-muted">
          {subject.percent === null
            ? "No assessments published yet."
            : "Assessment breakdown is not available yet."}
        </p>
      )}
    </article>
  );
}
