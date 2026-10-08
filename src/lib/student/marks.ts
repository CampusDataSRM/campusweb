import type { UserTestPerformance } from "@/network-calls/types";

export interface AssessmentMark {
  name: string;
  got: number;
  total: number;
  percent: number | null;
}

export interface SubjectMarks {
  id: string;
  courseCode: string;
  courseName: string;
  courseType: string;
  got: number;
  total: number;
  percent: number | null;
  assessments: AssessmentMark[];
}

function validMark(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function percentage(got: unknown, total: unknown): number | null {
  if (!validMark(got) || !validMark(total) || total === 0) return null;
  const value = (got / total) * 100;
  return Number.isFinite(value) ? value : null;
}

const isInternalTotal = (test: AssessmentMark) =>
  test.name.trim().toLowerCase() === "internal marks";

function sameScore(test: AssessmentMark, got: number, total: number): boolean {
  // Decimal component sums can differ by floating-point rounding alone.
  return (
    test.percent !== null &&
    total > 0 &&
    Math.abs(test.got - got) < 0.000001 &&
    Math.abs(test.total - total) < 0.000001
  );
}

/** Keep unpublished assessments distinct from a published score of zero. */
export function normalizeMarks(
  rows: readonly UserTestPerformance[],
): SubjectMarks[] {
  return rows.map((row, index) => {
    const entries = Object.entries(row.tests ?? {}).map(([name, test]) => ({
      name,
      got: validMark(test?.got) ? test.got : 0,
      total: validMark(test?.total) ? test.total : 0,
      percent: percentage(test?.got, test?.total),
    }));

    // The API total already includes its splits. Use them only when there is
    // no usable aggregate total, never in addition to the aggregate.
    let total = validMark(row.totalMarks) ? row.totalMarks : 0;
    let got = validMark(row.totalMarkGot) ? row.totalMarkGot : 0;
    let percent = percentage(row.totalMarkGot, row.totalMarks);

    // Older cached payloads can retain "Internal Marks" beside fresh FT
    // splits. Hide it only when its values prove it is a duplicate total.
    const namedAssessments = entries.filter((test) => !isInternalTotal(test));
    const publishedSplits = namedAssessments.filter(
      (test) => test.percent !== null,
    );
    const splitGot = publishedSplits.reduce((sum, test) => sum + test.got, 0);
    const splitTotal = publishedSplits.reduce(
      (sum, test) => sum + test.total,
      0,
    );
    const cumulative = entries.filter(
      (test) =>
        isInternalTotal(test) &&
        namedAssessments.length > 0 &&
        ((percent !== null && sameScore(test, got, total)) ||
          sameScore(test, splitGot, splitTotal)),
    );
    const assessments = entries.filter((test) => !cumulative.includes(test));

    if (total === 0) {
      const published = assessments.filter((test) => test.percent !== null);
      const verifiedTotal = cumulative[0];
      // A verified total already covers the named splits. Other unproven
      // entries must still be retained rather than silently discarded.
      const remaining = verifiedTotal
        ? published.filter(isInternalTotal)
        : published;
      const sumGot =
        (verifiedTotal?.got ?? 0) +
        remaining.reduce((sum, test) => sum + test.got, 0);
      const sumTotal =
        (verifiedTotal?.total ?? 0) +
        remaining.reduce((sum, test) => sum + test.total, 0);
      got = validMark(sumGot) ? sumGot : 0;
      total = validMark(sumTotal) ? sumTotal : 0;
      percent = percentage(sumGot, sumTotal);
    }

    return {
      id: `${row.courseCode}:${row.courseType}:${index}`,
      courseCode: row.courseCode,
      courseName: row.courseName || row.courseCode,
      courseType: row.courseType,
      got,
      total,
      percent,
      assessments,
    };
  });
}

/** Scores retain up to two decimals without unnecessary trailing zeros. */
export function formatMark(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(2).replace(/\.?0+$/, "");
}
