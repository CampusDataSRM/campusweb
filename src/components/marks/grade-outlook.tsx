import { ArrowUpRight, Target } from "lucide-react";
import type { SgpaSubject } from "@/lib/student/sgpa";
import { planGrade } from "@/lib/student/grade-planner";
import { formatMark } from "@/lib/student/marks";
import styles from "./grade-outlook.module.css";

export function GradeOutlook({
  subject,
  onPlan,
}: {
  subject: SgpaSubject;
  onPlan?: () => void;
}) {
  const plan = planGrade(subject, "O");
  const next = planGrade(subject, plan.highestGrade ?? "O");
  const pending = subject.status === "pending";
  const internal = plan.internalOnly
    ? subject.predictedFinal100
    : subject.projectedInternal60;
  return (
    <aside
      className={styles.outlook}
      aria-label={`${subject.courseTitle} grade outlook`}
    >
      <div className={styles.gradeHeading}>
        <span>Grade outlook</span>
        <span className={styles.projected}>Projected</span>
      </div>
      <div className={styles.stamp}>
        <strong>{pending ? "—" : subject.grade}</strong>
        <span>
          {pending ? "Awaiting results" : `${subject.gradePoint} grade points`}
        </span>
      </div>
      <div className={styles.forecast}>
        <div>
          <span>At your current pace</span>
          <strong>
            {pending ? "—" : `${formatMark(subject.predictedFinal100!)} / 100`}
          </strong>
        </div>
        <div className={styles.scoreTrack} aria-hidden>
          {!pending && (
            <>
              <i style={{ width: `${internal ?? 0}%` }} />
              {plan.external > 0 && (
                <b style={{ width: `${plan.external}%` }} />
              )}
            </>
          )}
        </div>
        <p>
          {pending ? (
            "Your forecast starts with your first result."
          ) : plan.internalOnly ? (
            "Internal-only course · no external component"
          ) : (
            <>
              <i aria-hidden /> {formatMark(internal!)} internal{" "}
              <span>+ 40 external</span>
            </>
          )}
        </p>
      </div>
      <div className={styles.nextGrade}>
        <div>
          <Target size={14} aria-hidden />
          <span>Highest possible</span>
          <strong>{plan.highestGrade ?? "—"}</strong>
        </div>
        <p>
          {pending ? (
            "Try a score in the planner to see what’s possible."
          ) : plan.remaining === 0 ? (
            "All internal marks are published."
          ) : next.reachable && next.needed !== null ? (
            next.needed > 0 ? (
              <>
                Score{" "}
                <b>
                  {formatMark(next.needed)} / {formatMark(next.remaining!)}
                </b>{" "}
                remaining internals for {plan.highestGrade}.
              </>
            ) : (
              "You’ve earned enough internals for this grade under the external assumption."
            )
          ) : (
            "Open the planner to explore your target grades."
          )}
        </p>
      </div>
      {onPlan && (
        <button type="button" onClick={onPlan}>
          Plan this subject <ArrowUpRight size={17} aria-hidden />
        </button>
      )}
      <small>
        {plan.internalOnly
          ? "Based on the internal-only grading rule."
          : "Forecast assumes 40/40 external marks."}
      </small>
    </aside>
  );
}
