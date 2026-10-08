"use client";

import { ArrowUpRight, ChevronLeft, ChevronRight, Clock3 } from "lucide-react";
import { AttendanceTrack } from "@/components/ui/attendance-track";
import { formatMark, type SubjectMarks } from "@/lib/student/marks";
import type { SgpaSubject } from "@/lib/student/sgpa";
import { AssessmentChart } from "./marks-charts";
import { GradeOutlook } from "./grade-outlook";
import styles from "./marks-explorer.module.css";

const selectionKey = (subject: SubjectMarks) =>
  `${subject.courseCode}:${subject.courseType}`;

export function MarksExplorer({
  subjects,
  credits,
  noun = "subjects",
  selectedKey,
  onSelect,
  grades,
  onPlan,
}: {
  subjects: SubjectMarks[];
  credits?: Map<string, string>;
  noun?: string;
  selectedKey: string | null;
  onSelect: (key: string) => void;
  grades?: Map<string, SgpaSubject>;
  onPlan?: (subject: SubjectMarks) => void;
}) {
  const selected =
    subjects.find((subject) => selectionKey(subject) === selectedKey) ??
    subjects[0];
  if (!selected) return null;
  const selectedIndex = subjects.indexOf(selected);
  const credit = Number(credits?.get(selected.courseCode));
  const grade = grades?.get(selected.courseCode);
  const published = selected.assessments.filter(
    (test) => test.percent !== null,
  );
  const choose = (index: number) => onSelect(selectionKey(subjects[index]));
  return (
    <section className={styles.explorer} aria-label="Explore your marks">
      <div className={styles.rail} aria-label={`Choose from ${noun}`}>
        <div className={styles.railHeading}>
          <h2>
            {noun === "activities" ? "Pick an activity" : "Pick a subject"}
          </h2>
          <span>
            {subjects.length} available <ArrowUpRight size={12} aria-hidden />
          </span>
        </div>
        <div className={styles.subjectList}>
          {subjects.map((subject, index) => (
            <button
              key={subject.id}
              type="button"
              className={styles.subject}
              aria-pressed={subject.id === selected.id}
              aria-controls="marks-subject-focus"
              onClick={() => choose(index)}
            >
              <span className={styles.subjectTop}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>
                  {subject.percent === null
                    ? "—"
                    : `${formatMark(subject.percent)}%`}
                </strong>
              </span>
              <span className={styles.subjectName}>{subject.courseName}</span>
              <span className={styles.subjectProgress} aria-hidden>
                <i
                  style={{ width: `${Math.min(100, subject.percent ?? 0)}%` }}
                />
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className={`panel ${styles.focus}`} id="marks-subject-focus">
        <header className={styles.focusHeader}>
          <div className={styles.subjectTitle}>
            <span className={styles.eyebrow}>
              Subject {String(selectedIndex + 1).padStart(2, "0")} /{" "}
              {String(subjects.length).padStart(2, "0")}
            </span>
            <h2 aria-live="polite">{selected.courseName}</h2>
            <p className={styles.courseMeta}>
              <span>{selected.courseCode}</span>
              {selected.courseType && <span>{selected.courseType}</span>}
              {Number.isFinite(credit) && credit > 0 && (
                <span>{formatMark(credit)} credits</span>
              )}
              {grade?.status === "calculated" && (
                <span className={styles.inlineGrade}>
                  Projected {grade.grade}
                </span>
              )}
            </p>
          </div>
          <div className={styles.headerEnd}>
            <div className={styles.focusScore}>
              <span>Marks earned</span>
              <strong>
                {selected.percent === null ? (
                  "—"
                ) : (
                  <>
                    {formatMark(selected.got)}
                    <small>/{formatMark(selected.total)}</small>
                  </>
                )}
              </strong>
            </div>
            <div className={styles.navigation}>
              <button
                type="button"
                aria-label="Previous subject"
                disabled={selectedIndex === 0}
                onClick={() => choose(selectedIndex - 1)}
              >
                <ChevronLeft size={18} aria-hidden />
              </button>
              <button
                type="button"
                aria-label="Next subject"
                disabled={selectedIndex === subjects.length - 1}
                onClick={() => choose(selectedIndex + 1)}
              >
                <ChevronRight size={18} aria-hidden />
              </button>
            </div>
          </div>
        </header>
        <div
          key={selected.id}
          className={styles.subjectContent}
          data-has-grade={!!grade}
        >
          <div className={styles.chartColumn}>
            {published.length ? (
              <AssessmentChart subject={selected} />
            ) : (
              <div className={styles.emptyChart}>
                <Clock3 size={30} strokeWidth={1.3} aria-hidden />
                <h3>
                  {selected.percent === null
                    ? "The next result starts here."
                    : "Waiting for the breakdown."}
                </h3>
                <p>
                  {selected.percent === null
                    ? "Your assessments will appear as soon as marks are published."
                    : "Your total is available. Individual assessment scores haven’t been published yet."}
                </p>
              </div>
            )}
            {selected.assessments.length > 0 && (
              <section
                className={styles.breakdown}
                aria-label={`${selected.courseName} assessment breakdown`}
              >
                <div className={styles.breakdownHeading}>
                  <h3>The breakdown</h3>
                  <span>
                    {published.length} / {selected.assessments.length} published
                  </span>
                </div>
                <ul className={styles.assessmentGrid}>
                  {selected.assessments.map((test, index) => (
                    <li key={test.name} className={styles.assessment}>
                      <div className={styles.testHeading}>
                        <span>{test.name}</span>
                        <small>{String(index + 1).padStart(2, "0")}</small>
                      </div>
                      {test.percent === null ? (
                        <p className={styles.testPending}>Awaiting marks</p>
                      ) : (
                        <>
                          <div className={styles.testScore}>
                            <strong>
                              {formatMark(test.got)}
                              <span> / {formatMark(test.total)}</span>
                            </strong>
                            <span>{formatMark(test.percent)}%</span>
                          </div>
                          <span className={styles.segments}>
                            <AttendanceTrack
                              value={test.percent}
                              tone="primary"
                              threshold={100}
                              label={false}
                            />
                          </span>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
          {grade && (
            <GradeOutlook
              subject={grade}
              onPlan={onPlan ? () => onPlan(selected) : undefined}
            />
          )}
        </div>
      </div>
    </section>
  );
}
