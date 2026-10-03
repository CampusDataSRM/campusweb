"use client";

import Link from "next/link";
import { useMemo } from "react";

import CountUp from "@/components/CountUp";
import { ShimmerBlock } from "@/components/feedback/data-states";
import { STUDENT_ROUTES } from "@/constants/routes";
import { useSession } from "@/context/session-context";
import { useStudentCopy } from "@/hooks/use-student-copy";
import { useProfile } from "@/hooks/use-student-data";
import { mergeTheoryPracticalCourses, overallAttendance } from "@/lib/student/attendance";
import { projectSgpa } from "@/lib/student/sgpa";

/** Headline numbers on plain rules - no boxes; the figures are the design. */
export function Standings() {
  const copy = useStudentCopy();
  const { session } = useSession();
  const profile = useProfile();

  const numbers = useMemo(() => {
    const data = profile.data;
    const courses = mergeTheoryPracticalCourses(data?.courses ?? [], data?.attendanceSource);
    const marks = data?.testPerformances ?? [];
    return {
      attendance: overallAttendance(courses),
      got: marks.reduce((sum, row) => sum + (row.totalMarkGot || 0), 0),
      total: marks.reduce((sum, row) => sum + (row.totalMarks || 0), 0),
      sgpa: data ? projectSgpa(data) : null,
    };
  }, [profile.data]);

  if (profile.isLoading) return <ShimmerBlock className="h-28" />;
  if (!profile.data) return null;

  const stats = [
    { href: STUDENT_ROUTES.attendance, label: copy.attendanceShort, value: <><CountUp to={Math.round(numbers.attendance * 10) / 10} duration={1} />%</> },
    { href: STUDENT_ROUTES.marks, label: `${copy.marksShort} so far`, value: <><CountUp to={Math.round(numbers.got * 10) / 10} duration={1} /><span className="text-[0.45em] text-on-surface-muted"> of {numbers.total}</span></> },
    ...(session?.kind !== "demo" && numbers.sgpa && numbers.sgpa.countedCredits > 0
      ? [{ href: STUDENT_ROUTES.marks, label: numbers.sgpa.isPartial ? "Projected SGPA, partial" : "Projected SGPA", value: <CountUp to={numbers.sgpa.sgpa} duration={1} /> }]
      : []),
  ];

  return (
    <section aria-label={copy.standingsTitle}>
      <h2 className="mb-2 font-heading text-lg font-bold text-on-surface">{copy.standingsTitle}</h2>
      <dl className="grid divide-y divide-outline-variant border-y border-outline-variant sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="group flex flex-col gap-1 py-5 sm:px-6 sm:first:pl-0">
            <dt className="text-sm font-semibold text-on-surface-muted group-hover:text-on-surface">{stat.label}</dt>
            <dd className="font-heading text-stat font-extrabold tracking-tight text-on-surface tabular">{stat.value}</dd>
          </Link>
        ))}
      </dl>
    </section>
  );
}
