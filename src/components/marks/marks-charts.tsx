"use client";

import { useId, type CSSProperties } from "react";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  LabelList,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
  type TooltipValueType,
} from "recharts";
import {
  formatMark,
  type AssessmentMark,
  type SubjectMarks,
} from "@/lib/student/marks";
import styles from "./assessment-chart.module.css";

function AssessmentTooltip({
  active,
  payload,
}: TooltipContentProps<TooltipValueType, string | number>) {
  const test = payload[0]?.payload as AssessmentMark | undefined;
  if (!active || !test || test.percent === null) return null;
  return (
    <div className={styles.tooltip}>
      <p>{test.name}</p>
      <strong>
        {formatMark(test.got)} <span>/ {formatMark(test.total)}</span>
      </strong>
      <small>{formatMark(test.percent)}% scored</small>
    </div>
  );
}

function labelLines(value: string) {
  const words = value
    .split(/\s+/)
    .flatMap((word) =>
      word.length > 18
        ? Array.from({ length: Math.ceil(word.length / 18) }, (_, index) =>
            word.slice(index * 18, (index + 1) * 18),
          )
        : [word],
    );
  const lines: string[] = [];
  for (const word of words) {
    const index = lines.length - 1;
    if (index >= 0 && `${lines[index]} ${word}`.length <= 18)
      lines[index] += ` ${word}`;
    else lines.push(word);
  }
  return lines;
}

/** A score of zero is plotted; unpublished results retain their empty position. */
export function AssessmentChart({ subject }: { subject: SubjectMarks }) {
  const id = `marks-area-${useId().replace(/:/g, "")}`;
  const tests = subject.assessments;
  const chartData = tests.map((test) => ({
    ...test,
    scoreLabel:
      test.percent === null
        ? ""
        : `${formatMark(test.got)} / ${formatMark(test.total)}`,
  }));
  const published = tests.filter((test) => test.percent !== null);
  const maximum = Math.max(
    100,
    ...published.map((test) => Math.ceil(test.percent! / 25) * 25),
  );
  const ticks = [0, maximum / 4, maximum / 2, (maximum * 3) / 4, maximum];
  const single = tests.length === 1 && published.length === 1;
  const labelHeight = Math.max(
    36,
    ...tests.map((test) => labelLines(test.name).length * 15 + 15),
  );
  const canvasStyle = {
    "--label-overflow": `${labelHeight - 36}px`,
    minWidth:
      tests.length > 2 ||
      (tests.length > 1 && tests.some((test) => test.name.length > 18))
        ? Math.max(360, tests.length * 145)
        : undefined,
  } as CSSProperties;

  return (
    <div className={styles.chart}>
      <div className={styles.caption}>
        <span>{single ? tests[0].name : "Assessment scores"}</span>
        <span className={styles.key}>
          <i aria-hidden />
          Percentage
        </span>
      </div>
      <div
        className={styles.scroll}
        role="region"
        aria-label={`${subject.courseName} assessment chart. Scores are shown as percentages.`}
        tabIndex={canvasStyle.minWidth ? 0 : undefined}
      >
        <div className={styles.canvas} style={canvasStyle}>
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            initialDimension={{ width: 600, height: 220 }}
          >
            <ComposedChart
              data={chartData}
              margin={{ top: 28, right: 26, bottom: 0, left: -12 }}
              accessibilityLayer
            >
              <defs>
                <linearGradient id={`${id}-bar`} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--primary-accent)"
                    stopOpacity={0.6}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--primary-accent)"
                    stopOpacity={0.04}
                  />
                </linearGradient>
                <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--primary-accent)"
                    stopOpacity={0.13}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--primary-accent)"
                    stopOpacity={0.005}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="var(--outline-variant)"
                strokeOpacity={0.65}
                strokeDasharray="3 6"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                interval={0}
                height={labelHeight}
                padding={{ left: 36, right: 36 }}
                tick={({ x, y, payload }) => (
                  <text
                    x={x}
                    y={Number(y) + 17}
                    textAnchor="middle"
                    fill="var(--on-surface-muted)"
                    fontSize={11}
                  >
                    {labelLines(String(payload.value)).map((line, index) => (
                      <tspan key={index} x={x} dy={index ? 15 : 0}>
                        {line}
                      </tspan>
                    ))}
                  </text>
                )}
              />
              <YAxis
                domain={[0, maximum]}
                ticks={ticks}
                width={52}
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                tick={{ fill: "var(--on-surface-muted)", fontSize: 10 }}
                tickFormatter={(value: number) => `${value}%`}
              />
              <Tooltip
                content={AssessmentTooltip}
                cursor={{
                  stroke: "var(--primary-accent)",
                  strokeOpacity: 0.35,
                  strokeDasharray: "3 5",
                }}
              />
              {published.length > 1 && (
                <Area
                  type="linear"
                  dataKey="percent"
                  fill={`url(#${id})`}
                  stroke="none"
                  tooltipType="none"
                  legendType="none"
                  connectNulls={false}
                  isAnimationActive="auto"
                  animationDuration={450}
                />
              )}
              <Bar
                dataKey="percent"
                tooltipType="none"
                legendType="none"
                barSize={60}
                fill={`url(#${id}-bar)`}
                radius={[7, 7, 0, 0]}
                isAnimationActive="auto"
                animationDuration={600}
              />
              <Line
                type="linear"
                dataKey="percent"
                name="Percentage"
                stroke="var(--primary-accent)"
                strokeOpacity={published.length > 1 ? 1 : 0}
                strokeWidth={2.5}
                connectNulls={false}
                dot={{
                  r: 5,
                  stroke: "var(--primary-accent)",
                  strokeOpacity: 1,
                  strokeWidth: 2.5,
                  fill: "var(--surface-modal)",
                }}
                activeDot={{
                  r: 7,
                  strokeOpacity: 1,
                  strokeWidth: 3,
                  fill: "var(--surface-modal)",
                  stroke: "var(--primary-accent)",
                }}
                isAnimationActive="auto"
                animationDuration={450}
              >
                <LabelList
                  dataKey="scoreLabel"
                  position="top"
                  offset={13}
                  fill="var(--on-surface)"
                  fontSize={12}
                  fontWeight={600}
                />
              </Line>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
