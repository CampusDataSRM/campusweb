"use client";

import { BarChart3, Percent, Sigma } from "lucide-react";
import Link from "next/link";
import { useMemo, type ReactNode } from "react";

import CountUp from "@/components/CountUp";
import { Section } from "@/components/layout/page-header";
import { ShimmerBlock } from "@/components/feedback/data-states";
import { STUDENT_ROUTES } from "@/constants/routes";
import { useSession } from "@/context/session-context";
import { useStudentCopy } from "@/hooks/use-student-copy";
import { useProfile } from "@/hooks/use-student-data";
import { mergeTheoryPracticalCourses, overallAttendance } from "@/lib/student/attendance";
import { projectSgpa } from "@/lib/student/sgpa";

function Tile({
  href,
  icon,
  label,
  children,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-28 flex-col justify-between gap-3 rounded-2xl border border-outline-variant bg-surface-container p-4 transition-colors hover:border-outline hover:bg-surface-high"
    >
      <span className="flex items-center gap-2 text-sm font-semibold text-on-surface-muted">
        <span className="flex size-8 items-center justify-center rounded-xl bg-primary-container text-on-primary-container">
          {icon}
        </span>
        {label}
      </span>
      <span className="font-heading text-stat font-extrabold text-on-surface tabular">{children}</span>
    </Link>
  );
}

/** Headline numbers, counting up once on first view. */
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

  if (profile.isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-3">
        <ShimmerBlock className="h-28" />
        <ShimmerBlock className="h-28" />
        <ShimmerBlock className="h-28" />
      </div>
    );
  }
  if (!profile.data) return null;

  const showSgpa = session?.kind !== "demo" && (numbers.sgpa?.countedCredits ?? 0) > 0;

  return (
    <Section title={copy.standingsTitle}>
      <div className="grid gap-3 sm:grid-cols-3">
        <Tile href={STUDENT_ROUTES.attendance} icon={<Percent className="size-4" />} label={copy.attendanceShort}>
          <CountUp to={Math.round(numbers.attendance * 10) / 10} duration={1} />%
        </Tile>
        <Tile href={STUDENT_ROUTES.marks} icon={<BarChart3 className="size-4" />} label={copy.marksShort}>
          <CountUp to={Math.round(numbers.got * 10) / 10} duration={1} />
          <span className="text-h3 text-on-surface-muted"> / {numbers.total}</span>
        </Tile>
        {showSgpa && numbers.sgpa && (
          <Tile href={STUDENT_ROUTES.marks} icon={<Sigma className="size-4" />} label={numbers.sgpa.isPartial ? "Projected SGPA (partial)" : "Projected SGPA"}>
            <CountUp to={numbers.sgpa.sgpa} duration={1} />
          </Tile>
        )}
      </div>
    </Section>
  );
}
