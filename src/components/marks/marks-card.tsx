import type { UserTestPerformance } from "@/network-calls/types";
import { cn } from "@/lib/utils";

const fmt = (value: number) =>
  Number.isInteger(value)
    ? String(value)
    : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");

/** Green from 75%, amber from 50%, red below - read at a glance, like attendance. */
function tone(percent: number) {
  if (percent >= 75)
    return { bar: "bg-success-accent", text: "text-success-accent" };
  if (percent >= 50)
    return { bar: "bg-warning-accent", text: "text-warning-accent" };
  return { bar: "bg-danger-accent", text: "text-danger-accent" };
}

/** One course: its total, and every test as a score bar. */
export function MarksCard({
  performance,
}: {
  performance: UserTestPerformance;
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
  const overallTone = tone(overall);

  return (
    <article className="panel spotlight flex flex-col gap-5 rounded-3xl p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg leading-snug font-extrabold text-on-surface">
            {performance.courseName || performance.courseCode}
          </h3>
          <p className="mt-1 flex gap-3 text-xs font-semibold text-on-surface-muted">
            <span>{performance.courseCode}</span>
            {performance.courseType && <span>{performance.courseType}</span>}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-h2 leading-none font-black text-on-surface tabular">
            {fmt(got)}
            <span className="text-base font-extrabold text-on-surface-muted">
              /{fmt(total)}
            </span>
          </p>
          {total > 0 && (
            <p
              className={cn(
                "mt-1 text-sm font-extrabold tabular",
                overallTone.text,
              )}
            >
              {overall.toFixed(1)}%
            </p>
          )}
        </div>
      </div>

      {tests.length === 0 ? (
        <p className="text-sm text-on-surface-muted">No tests published yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {tests.map((test, i) => {
            const t = tone(test.percent);
            return (
              <li
                key={test.name}
                className="grid grid-cols-[minmax(0,1fr)_minmax(3rem,1fr)_auto] items-center gap-3"
              >
                <span className="text-sm font-medium text-on-surface-muted">
                  {test.name}
                </span>
                <span
                  aria-hidden
                  className="relative h-2 overflow-hidden rounded-full bg-surface-highest"
                >
                  <span
                    className={cn(
                      "bar-grow absolute inset-y-0 left-0 rounded-full",
                      t.bar,
                    )}
                    style={{
                      width: `${Math.min(100, Math.max(0, test.percent))}%`,
                      animationDelay: `${i * 80}ms`,
                    }}
                  />
                </span>
                <span className="w-16 text-right text-sm font-extrabold text-on-surface tabular">
                  {fmt(test.got)}
                  <span className="text-on-surface-muted">
                    /{fmt(test.total)}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}
