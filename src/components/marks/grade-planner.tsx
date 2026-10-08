"use client";

import { RotateCcw, Target } from "lucide-react";
import { useState } from "react";
import { formatMark } from "@/lib/student/marks";
import { planGrade, plannedSgpa } from "@/lib/student/grade-planner";
import {
  GRADE_BANDS,
  gradeFromScore,
  type SgpaProjection,
} from "@/lib/student/sgpa";
import styles from "./grade-planner.module.css";

export function GradePlanner({
  projection,
  target,
  onTargetChange,
  scenarios,
  onScenariosChange,
  preferredCourse,
}: {
  projection: SgpaProjection;
  target: string;
  onTargetChange: (grade: string) => void;
  scenarios: Record<string, number | null>;
  onScenariosChange: (values: Record<string, number | null>) => void;
  preferredCourse?: string;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const clearDraft = (code: string) =>
    setDrafts((current) => {
      const next = { ...current };
      delete next[code];
      return next;
    });
  const result = plannedSgpa(projection.subjects, scenarios);
  return (
    <section className={styles.planner} aria-label="Grade and SGPA planner">
      <div className={`panel ${styles.planHeader}`}>
        <div className={styles.planIntro}>
          <span className={styles.eyebrow}>
            <Target size={14} aria-hidden /> Make a plan
          </span>
          <h2>Your next grade starts here.</h2>
          <p>
            Choose a target grade, see what’s still achievable, and try your
            expected final internal marks.
          </p>
          <span className={styles.assumption}>
            Theory: 60 internal + 40 external assumed
          </span>
        </div>
        <div className={styles.sgpaComparison}>
          <div>
            <span>Current projection</span>
            <strong>
              {projection.countedCredits ? projection.sgpa.toFixed(2) : "—"}
            </strong>
            <small>
              {projection.isPartial
                ? "Published subjects only"
                : "All graded subjects"}
            </small>
          </div>
          <div className={styles.plannedFigure} aria-live="polite">
            <span>Your planned SGPA</span>
            <strong>
              {result.sgpa === null ? "—" : result.sgpa.toFixed(2)}
            </strong>
            <small>
              {result.included} subjects · {formatMark(result.credits)} credits
              {result.partial ? " · partial" : ""}
            </small>
          </div>
        </div>
      </div>

      <div className={styles.planToolbar}>
        <div className={styles.targets} role="group" aria-label="Target grade">
          <span>Aim for</span>
          {GRADE_BANDS.map((band) => (
            <button
              key={band.grade}
              type="button"
              aria-pressed={target === band.grade}
              onClick={() => onTargetChange(band.grade)}
            >
              {band.grade}
            </button>
          ))}
        </div>
        <button
          className={styles.reset}
          type="button"
          onClick={() => {
            setDrafts({});
            setExpanded(null);
            onTargetChange("O");
            onScenariosChange({});
          }}
        >
          <RotateCcw size={14} aria-hidden /> Reset my plan
        </button>
      </div>

      <div className={styles.planCards}>
        {[...projection.subjects]
          .sort(
            (a, b) =>
              Number(b.courseCode === preferredCourse) -
              Number(a.courseCode === preferredCourse),
          )
          .map((subject) => {
            const plan = planGrade(subject, target);
            const candidate = Object.hasOwn(scenarios, subject.courseCode)
              ? scenarios[subject.courseCode]
              : plan.expectedInternal;
            const value =
              candidate === null
                ? null
                : Math.max(
                    plan.minimumInternal,
                    Math.min(plan.maximumInternal, candidate),
                  );
            const final =
              value === null
                ? null
                : Math.round((value + plan.external) * 100) / 100;
            const grade = final === null ? null : gradeFromScore(final).grade;
            const update = (next: number | null) =>
              onScenariosChange({
                ...scenarios,
                [subject.courseCode]:
                  next === null || !Number.isFinite(next)
                    ? null
                    : Math.max(
                        plan.minimumInternal,
                        Math.min(plan.maximumInternal, next),
                      ),
              });
            const showBands = expanded === subject.courseCode;
            return (
              <article
                key={subject.courseCode}
                className={`panel ${styles.planCard}`}
              >
                <header className={styles.courseHeader}>
                  <div>
                    <h3>{subject.courseTitle}</h3>
                    <p>
                      {subject.courseCode} · {formatMark(subject.credit)}{" "}
                      credits{!subject.credit ? " · excluded from SGPA" : ""}
                    </p>
                  </div>
                  <div className={styles.gradeStanding}>
                    <span>Projected</span>
                    <strong className={styles.gradeBadge}>
                      {subject.status === "pending" ? "—" : subject.grade}
                    </strong>
                  </div>
                </header>
                <div className={styles.currentScores}>
                  <div>
                    <span>Internals earned</span>
                    <strong>
                      {plan.earned === null ? (
                        "—"
                      ) : (
                        <>
                          {formatMark(plan.earned)}
                          <small> / {plan.internalBudget}</small>
                        </>
                      )}
                    </strong>
                    <small>
                      {subject.status === "pending"
                        ? "Not published yet"
                        : `${formatMark(subject.obtained)} / ${formatMark(subject.total)} published`}
                    </small>
                  </div>
                  <div>
                    <span>Still available</span>
                    <strong>
                      {plan.remaining === null
                        ? "—"
                        : formatMark(plan.remaining)}
                    </strong>
                    <small>Internal marks</small>
                  </div>
                  <div>
                    <span>Highest possible</span>
                    <strong className={styles.ceiling}>
                      {plan.highestGrade ?? "—"}
                    </strong>
                    <small>
                      {plan.highestFinal === null
                        ? "Weighted marks needed"
                        : `${formatMark(plan.highestFinal)} / 100 maximum`}
                    </small>
                  </div>
                </div>

                <div
                  className={styles.targetAdvice}
                  data-reachable={plan.reachable === false ? "no" : "yes"}
                >
                  <div>
                    <span className={styles.targetLetter}>{target}</span>
                    <div>
                      <strong>
                        Reach {formatMark(plan.targetInternal)} /{" "}
                        {plan.internalBudget} internally
                      </strong>
                      <p>
                        {plan.earned === null
                          ? plan.internalOnly
                            ? `This course is graded entirely on internals; no external marks are added.`
                            : `The ${target} threshold assumes 40/40 external marks.`
                          : plan.reachable === false
                            ? `This target is beyond the remaining marks. ${plan.highestGrade} is your highest possible grade.`
                            : plan.needed === 0
                              ? "You’ve already earned enough internals for this target, under the external assumption."
                              : `Score ${formatMark(plan.needed!)} of the ${formatMark(plan.remaining!)} remaining internal marks.`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={styles.scenario}>
                  <label htmlFor={`plan-${subject.courseCode}`}>
                    Expected final internals{" "}
                    <span>/ {plan.internalBudget}</span>
                  </label>
                  <div className={styles.scenarioInput}>
                    <input
                      id={`plan-${subject.courseCode}`}
                      type="number"
                      inputMode="decimal"
                      min={plan.minimumInternal}
                      max={plan.maximumInternal}
                      step="0.01"
                      disabled={plan.minimumInternal === plan.maximumInternal}
                      value={
                        drafts[subject.courseCode] ??
                        (value === null ? "" : formatMark(value))
                      }
                      placeholder="Enter marks"
                      onChange={(event) => {
                        setDrafts((current) => ({
                          ...current,
                          [subject.courseCode]: event.target.value,
                        }));
                        update(
                          event.target.value === ""
                            ? null
                            : event.target.valueAsNumber,
                        );
                      }}
                      onBlur={() => clearDraft(subject.courseCode)}
                    />
                    <div className={styles.scenarioResult} aria-live="polite">
                      {grade ? (
                        <>
                          <strong>{grade}</strong>
                          <span>{formatMark(final!)} / 100</span>
                        </>
                      ) : (
                        <span>Set a score to plan</span>
                      )}
                    </div>
                  </div>
                  <input
                    className={styles.slider}
                    type="range"
                    aria-label={`${subject.courseTitle} expected final internal marks`}
                    min={plan.minimumInternal}
                    max={plan.maximumInternal}
                    step="0.01"
                    value={value ?? plan.minimumInternal}
                    disabled={plan.minimumInternal === plan.maximumInternal}
                    onChange={(event) => {
                      clearDraft(subject.courseCode);
                      update(event.target.valueAsNumber);
                    }}
                  />
                  <p className={styles.scenarioNote}>
                    {plan.internalOnly
                      ? "Internal-only course: no external marks added."
                      : `${value === null ? "Your internal score" : `${formatMark(value)} internal`} + 40 external = ${final === null ? "your final score" : `${formatMark(final)} / 100`}.`}
                    {plan.earned !== null &&
                      " Earned marks are locked into your plan."}
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.bandsToggle}
                  aria-expanded={showBands}
                  onClick={() =>
                    setExpanded(showBands ? null : subject.courseCode)
                  }
                >
                  {showBands ? "Hide" : "See"} all grade targets{" "}
                  <span aria-hidden>{showBands ? "−" : "+"}</span>
                </button>
                {showBands && (
                  <div className={styles.gradeTable}>
                    <table>
                      <caption className="sr-only">
                        Grade targets with {plan.external} assumed external
                        marks
                      </caption>
                      <thead>
                        <tr>
                          <th>Grade</th>
                          <th>Final /100</th>
                          <th>Internal /{plan.internalBudget}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {GRADE_BANDS.map((band) => (
                          <tr key={band.grade}>
                            <td>{band.grade}</td>
                            <td>{band.minScore}+</td>
                            <td>
                              {Math.max(0, band.minScore - plan.external)}+
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </article>
            );
          })}
      </div>
      <p className={styles.plannerFootnote}>
        The current projection assumes your published percentage continues for
        the remaining internals. Your plan uses the final internal marks you
        enter, plus 40/40 externals for theory. Unpublished subjects enter
        planned SGPA only after you set a score.
      </p>
    </section>
  );
}
