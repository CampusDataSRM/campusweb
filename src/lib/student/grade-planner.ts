import {
  GRADE_BANDS,
  gradeFromScore,
  isInternalOnlyCourse,
  roundTo2,
  type SgpaSubject,
} from "./sgpa";

export interface GradePlan {
  internalBudget: 60 | 100;
  external: 0 | 40;
  earned: number | null;
  remaining: number | null;
  minimumInternal: number;
  maximumInternal: number;
  expectedInternal: number | null;
  highestGrade: string | null;
  highestFinal: number | null;
  targetInternal: number;
  needed: number | null;
  reachable: boolean | null;
  internalOnly: boolean;
}

/** Planning uses earned, weighted internal points; a pace forecast is separate. */
export function planGrade(
  subject: SgpaSubject,
  targetGrade: string,
): GradePlan {
  const internalOnly = isInternalOnlyCourse(
    subject.courseCode,
    subject.courseTitle,
  );
  const internalBudget = internalOnly ? 100 : 60;
  const external = internalOnly ? 0 : 40;
  const band =
    GRADE_BANDS.find((item) => item.grade === targetGrade) ?? GRADE_BANDS[0];
  const targetInternal = Math.max(0, band.minScore - external);
  const pending = subject.status === "pending";
  const validPublished =
    Number.isFinite(subject.obtained) &&
    Number.isFinite(subject.total) &&
    subject.total > 0 &&
    subject.obtained >= 0 &&
    subject.obtained <= subject.total;
  // Raw assessment totals above the internal budget do not tell us how many
  // weighted internal points remain. Allow a scenario, but do not invent a ceiling.
  const weighted = validPublished && subject.total <= internalBudget;
  const earned = weighted ? subject.obtained : null;
  const remaining = weighted
    ? roundTo2(internalBudget - subject.total)
    : pending
      ? internalBudget
      : null;
  const minimumInternal = earned ?? 0;
  const maximumInternal = weighted
    ? Math.min(internalBudget, roundTo2(subject.obtained + remaining!))
    : internalBudget;
  const expected = pending
    ? null
    : internalOnly
      ? subject.predictedFinal100
      : subject.projectedInternal60;
  const expectedInternal =
    expected === null || !Number.isFinite(expected)
      ? null
      : Math.max(minimumInternal, Math.min(maximumInternal, expected));
  const highestFinal =
    weighted || pending ? roundTo2(maximumInternal + external) : null;
  const needed =
    earned === null
      ? null
      : Math.ceil(Math.max(0, targetInternal - earned) * 100 - 0.000001) / 100;
  return {
    internalBudget,
    external,
    earned,
    remaining,
    minimumInternal,
    maximumInternal,
    expectedInternal,
    highestGrade:
      highestFinal === null ? null : gradeFromScore(highestFinal).grade,
    highestFinal,
    targetInternal,
    needed,
    reachable:
      highestFinal === null ? null : highestFinal + 0.000001 >= band.minScore,
    internalOnly,
  };
}

export function plannedSgpa(
  subjects: readonly SgpaSubject[],
  expected: Readonly<Record<string, number | null>>,
) {
  let weightedPoints = 0;
  let credits = 0;
  let included = 0;
  let partial = false;
  for (const subject of subjects) {
    if (subject.credit <= 0) continue;
    const plan = planGrade(subject, "O");
    const value = Object.hasOwn(expected, subject.courseCode)
      ? expected[subject.courseCode]
      : plan.expectedInternal;
    if (value === null || !Number.isFinite(value)) {
      partial = true;
      continue;
    }
    const internal = Math.max(
      plan.minimumInternal,
      Math.min(plan.maximumInternal, value),
    );
    const grade = gradeFromScore(internal + plan.external);
    weightedPoints += subject.credit * grade.point;
    credits += subject.credit;
    included += 1;
  }
  return {
    sgpa: credits ? roundTo2(weightedPoints / credits) : null,
    credits,
    included,
    partial,
  };
}
