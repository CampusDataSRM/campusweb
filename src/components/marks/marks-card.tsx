"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import type { UserTestPerformance } from "@/network-calls/types";

const chartConfig = {
  percentage: { label: "Score %", color: "var(--chart-1)" },
} satisfies ChartConfig;

const fmt = (value: number) => (Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, ""));

/** One course's tests: total, a trend line (2+ tests), and each test's score. */
export function MarksCard({ performance }: { performance: UserTestPerformance }) {
  const tests = Object.entries(performance.tests ?? {}).map(([name, test]) => ({
    name,
    got: test.got,
    total: test.total,
    percentage: Math.round((test.total > 0 ? (test.got / test.total) * 100 : test.percentage) * 10) / 10,
  }));
  const total = performance.totalMarks || tests.reduce((sum, t) => sum + t.total, 0);
  const got = performance.totalMarkGot || tests.reduce((sum, t) => sum + t.got, 0);

  return (
    <article className="flex flex-col gap-4 rounded-3xl border border-outline-variant bg-surface-container p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="line-clamp-2 font-heading font-bold text-on-surface">{performance.courseName || performance.courseCode}</h3>
          <p className="mt-1 text-xs text-on-surface-muted">{[performance.courseCode, performance.courseType].filter(Boolean).join(" · ")}</p>
        </div>
        <p className="shrink-0 font-heading text-2xl font-extrabold text-primary-accent tabular">
          {fmt(got)}<span className="text-base text-on-surface-muted">/{fmt(total)}</span>
        </p>
      </div>

      {tests.length >= 2 && (
        <ChartContainer config={chartConfig} className="aspect-auto h-36 w-full">
          <LineChart data={tests} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--outline-variant)" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} tick={{ fill: "var(--on-surface-muted)", fontSize: 11 }} />
            <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: "var(--on-surface-muted)", fontSize: 11 }} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line dataKey="percentage" type="monotone" stroke="var(--color-percentage)" strokeWidth={2.5} dot={{ r: 3.5, fill: "var(--color-percentage)" }} />
          </LineChart>
        </ChartContainer>
      )}

      {tests.length === 0 ? (
        <p className="text-sm text-on-surface-muted">No tests published yet.</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {tests.map((test) => (
            <li key={test.name} className="rounded-xl border border-outline-variant bg-surface-high px-3 py-2 text-sm">
              <span className="font-bold text-on-surface">{test.name}</span>{" "}
              <span className="text-on-surface-muted tabular">{fmt(test.got)}/{fmt(test.total)}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
