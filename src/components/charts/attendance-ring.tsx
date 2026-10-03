"use client";

import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";

import { TIER_STYLE } from "@/constants/attendance-tiers";
import { attendanceTier } from "@/lib/student/attendance";

/**
 * A percentage ring (recharts), coloured by attendance tier, with the value
 * in the middle. Sized by its container; the chart itself is decorative -
 * the figure is real text for screen readers.
 */
export function AttendanceRing({
  percent,
  label,
  size = 132,
}: {
  percent: number;
  label: string;
  size?: number;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  const style = TIER_STYLE[attendanceTier(clamped)];

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <RadialBarChart
        width={size}
        height={size}
        data={[{ value: clamped }]}
        innerRadius="78%"
        outerRadius="100%"
        startAngle={90}
        endAngle={-270}
        barSize={size * 0.11}
        aria-hidden
      >
        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
        <RadialBar
          dataKey="value"
          cornerRadius={size}
          fill={style.stroke}
          background={{ fill: "var(--surface-highest)" }}
          isAnimationActive
          animationDuration={700}
        />
      </RadialBarChart>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={`font-heading font-extrabold leading-none tabular ${style.text}`} style={{ fontSize: Math.round(size * 0.165) }}>
          {clamped.toFixed(1)}%
        </span>
        <span className="mt-1 text-[0.6875rem] font-semibold text-on-surface-muted">{label}</span>
      </div>
    </div>
  );
}
