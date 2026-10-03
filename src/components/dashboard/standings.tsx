"use client";

import { BarChart3, Percent, Sigma } from "lucide-react";
import Link from "next/link";
import { useMemo, type ReactNode } from "react";

import CountUp from "@/components/CountUp";
import { ShimmerBlock } from "@/components/feedback/data-states";
import { Section } from "@/components/layout/page-header";
import { STUDENT_ROUTES } from "@/constants/routes";
import { useSession } from "@/context/session-context";
import { useStudentCopy } from "@/hooks/use-student-copy";
import { useProfile } from "@/hooks/use-student-data";
import { mergeTheoryPracticalCourses, overallAttendance } from "@/lib/student/attendance";
import { projectSgpa } from "@/lib/student/sgpa";
import { cn } from "@/lib/utils";

function Tile({ href, icon, label, children, className }: { href: string; icon: ReactNode; label: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={cn("flex min-h-28 flex-col justify-between gap-3 rounded-[1.25rem] border border-outline-variant bg-surface-container p-4 transition-colors hover:border-outline", className)}>
      <span className="flex items-center gap-2 text-sm font-bold text-on-surface-muted">
        <span className="flex size-8 items-center justify-center rounded-xl bg-primary-container text-on-primary-container">{icon}</span>
        {label}
      </span>
      <span className="text-stat font-extrabold text-on-surface tabular">{children}</span>
    </Link>
  );
}

/** Campus App's "Your Standings" tiles. */
export function Standings() {
  const copy = useStudentCopy();
  const { session } = useSession();
  const profile = useProfile();
  const n = useMemo(() => {
    const data = profile.data;
    const courses = mergeTheoryPracticalCourses(data?.courses ?? [], data?.attendanceSource);
    const marks = data?.testPerformances ?? [];
    return {
      attendance: overallAttendance(courses),
      got: marks.reduce((s, r) => s + (r.totalMarkGot || 0), 0),
      total: marks.reduce((s, r) => s + (r.totalMarks || 0), 0),
      sgpa: data ? projectSgpa(data) : null,
    };
  }, [profile.data]);

  if (profile.isLoading) return <ShimmerBlock className="h-28" />;
  if (!profile.data) return null;
  const showSgpa = session?.kind !== "demo" && n.sgpa !== null && n.sgpa.countedCredits > 0;

  return (
    <Section title={copy.standingsTitle}>
      <div className={showSgpa ? "grid grid-cols-2 gap-3 lg:grid-cols-3" : "grid grid-cols-2 gap-3"}>
        <Tile href={STUDENT_ROUTES.attendance} icon={<Percent className="size-4" />} label={copy.attendanceShort}>
          <CountUp to={Math.round(n.attendance * 10) / 10} duration={1} />%
        </Tile>
        <Tile href={STUDENT_ROUTES.marks} icon={<BarChart3 className="size-4" />} label={copy.marksShort}>
          <CountUp to={Math.round(n.got * 10) / 10} duration={1} />
          <span className="text-lg text-on-surface-muted"> / {n.total}</span>
        </Tile>
        {showSgpa && n.sgpa && (
          <Tile href={STUDENT_ROUTES.marks} icon={<Sigma className="size-4" />} label="Projected SGPA" className="col-span-2 lg:col-span-1">
            <CountUp to={n.sgpa.sgpa} duration={1} />
          </Tile>
        )}
      </div>
    </Section>
  );
}
