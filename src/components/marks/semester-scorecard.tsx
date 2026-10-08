"use client";

import { ArrowUpRight, Target } from "lucide-react";
import { formatMark, type SubjectMarks } from "@/lib/student/marks";
import type { SgpaProjection } from "@/lib/student/sgpa";
import { SgpaSheet } from "./sgpa-sheet";
import styles from "./semester-scorecard.module.css";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter((word) => !/^(and|for|of|the|in)$/i.test(word))
    .map((word) => word[0])
    .join("")
    .slice(0, 4)
    .toUpperCase();
}

export function SemesterScorecard({
  subjects,
  projection,
  semester,
  program,
  onSelect,
  onPlan,
  noun = "subjects",
}: {
  subjects: SubjectMarks[];
  projection?: SgpaProjection;
  semester?: string;
  program?: string;
  onSelect: (subject: SubjectMarks) => void;
  onPlan: () => void;
  noun?: string;
}) {
  const published = subjects.filter((subject) => subject.percent !== null);
  const got = published.reduce((sum, subject) => sum + subject.got, 0);
  const total = published.reduce((sum, subject) => sum + subject.total, 0);
  const assessments = subjects.reduce(
    (sum, subject) =>
      sum + subject.assessments.filter((test) => test.percent !== null).length,
    0,
  );
  return (
    <section className={styles.scorecard} aria-label="Semester overview">
      <div className={styles.overview}>
        <div className={styles.total}>
          <span className={styles.eyebrow}>
            <i aria-hidden /> Published performance
          </span>
          <div className={styles.score}>
            {total ? ((got / total) * 100).toFixed(1) : "—"}
            <span>{total ? "%" : ""}</span>
          </div>
          <p>
            {total ? (
              <>
                <strong>{formatMark(got)}</strong> / {formatMark(total)} marks
                earned
              </>
            ) : (
              "No marks published yet"
            )}
          </p>
          <div className={styles.meta}>
            <span>
              <b>{assessments}</b> assessments
            </span>
            <span>
              <b>{subjects.length - published.length}</b> awaiting results
            </span>
          </div>
        </div>
        <div className={styles.comparison}>
          <span className={styles.comparisonLabel}>
            Your {noun}, at a glance <ArrowUpRight size={13} aria-hidden />
          </span>
          <div className={styles.bars}>
            {subjects.map((subject, index) => (
              <button
                key={subject.id}
                type="button"
                className={styles.barButton}
                aria-label={`Explore ${subject.courseName}: ${subject.percent === null ? "awaiting results" : `${formatMark(subject.percent)} percent`}`}
                title={subject.courseName}
                onClick={() => onSelect(subject)}
              >
                <span className={styles.barValue}>
                  {subject.percent === null
                    ? "—"
                    : `${formatMark(subject.percent)}%`}
                </span>
                <span className={styles.barWell} aria-hidden>
                  {subject.percent === null ? (
                    <i className={styles.pendingBar} />
                  ) : (
                    <i
                      className={styles.barFill}
                      style={{
                        height: `${Math.min(100, Math.max(0, subject.percent))}%`,
                        animationDelay: `${index * 55}ms`,
                      }}
                    />
                  )}
                </span>
                <span className={styles.barLabel}>
                  {initials(subject.courseName) || subject.courseCode}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
      {projection && (
        <div className={styles.outlook}>
          <SgpaSheet
            projection={projection}
            program={program}
            semester={semester}
            onPlan={onPlan}
            scorecard
          />
          <button type="button" className={styles.planButton} onClick={onPlan}>
            <Target size={16} aria-hidden /> Plan my grades{" "}
            <ArrowUpRight size={17} aria-hidden />
          </button>
        </div>
      )}
    </section>
  );
}
