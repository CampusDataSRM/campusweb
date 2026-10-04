"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { ShimmerBlock } from "@/components/feedback/data-states";
import { Section } from "@/components/layout/page-header";
import { STUDENT_ROUTES } from "@/constants/routes";
import { useSession } from "@/context/session-context";
import { useProfile } from "@/hooks/use-student-data";
import { projectSgpa } from "@/lib/student/sgpa";

export function Standings() {
  const { session } = useSession();
  const profile = useProfile();
  const n = useMemo(() => {
    const marks = profile.data?.testPerformances ?? [];
    return {
      got: marks.reduce((s, r) => s + (r.totalMarkGot || 0), 0),
      total: marks.reduce((s, r) => s + (r.totalMarks || 0), 0),
      sgpa: profile.data ? projectSgpa(profile.data) : null,
    };
  }, [profile.data]);
  if (profile.isLoading) return <ShimmerBlock className="h-28" />;
  if (!profile.data) return null;
  const showSgpa =
    session?.kind !== "demo" && n.sgpa !== null && n.sgpa.countedCredits > 0;
  return (
    <Section
      title="Academics"
      className="home-academics"
      action={
        <Link href={STUDENT_ROUTES.marks} className="home-text-link">
          View marks
          <ArrowUpRight aria-hidden className="size-4" />
        </Link>
      }
    >
      <div className="home-academic-strip">
        <Link href={STUDENT_ROUTES.marks}>
          <span>Internal marks</span>
          <strong>
            {Math.round(n.got * 10) / 10}
            <small> / {n.total}</small>
          </strong>
          <small>Published so far</small>
        </Link>
        {showSgpa && n.sgpa && (
          <Link href={STUDENT_ROUTES.marks}>
            <span>Projected SGPA</span>
            <strong>{n.sgpa.sgpa.toFixed(2)}</strong>
            <small>Based on published marks</small>
          </Link>
        )}
        {profile.data.semester && (
          <Link href={STUDENT_ROUTES.timetable}>
            <span>Current semester</span>
            <strong>{profile.data.semester.toString().padStart(2, "0")}</strong>
            <small>
              Your timetable
              <ArrowUpRight aria-hidden className="size-3" />
            </small>
          </Link>
        )}
      </div>
    </Section>
  );
}
