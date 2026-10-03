"use client";

import { CalendarHeart, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { Section } from "@/components/layout/page-header";
import { STUDENT_ROUTES } from "@/constants/routes";
import { useSession } from "@/context/session-context";
import { useNow } from "@/hooks/use-now";
import { usePlanner, useProfile } from "@/hooks/use-student-data";
import { countBelowThreshold, mergeTheoryPracticalCourses } from "@/lib/student/attendance";
import { holidaysInMonth, plannerMonths } from "@/lib/student/planner";

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

/** Things worth acting on: subjects under 75%, and this month's holidays. */
export function Alerts() {
  const { session } = useSession();
  const now = useNow();
  const profile = useProfile();
  const planner = usePlanner();

  const holidays = useMemo(
    () => (now ? holidaysInMonth(plannerMonths(planner.data), now).length : 0),
    [planner.data, now],
  );
  const below = useMemo(
    () => countBelowThreshold(mergeTheoryPracticalCourses(profile.data?.courses ?? [], profile.data?.attendanceSource)),
    [profile.data],
  );

  if (session?.kind === "demo" || !profile.data) return null;

  return (
    <Section title="Alerts">
      <div className="grid gap-3 sm:grid-cols-2">
        {below > 0 && (
          <Link
            href={STUDENT_ROUTES.attendance}
            className="flex items-center gap-3 rounded-[1.25rem] border border-danger/40 bg-danger-container p-4 text-on-danger-container transition-colors hover:border-danger"
          >
            <TriangleAlert aria-hidden className="size-5 shrink-0 text-danger-accent" />
            <span className="text-sm font-bold">{plural(below, "subject")} {below === 1 ? "is" : "are"} below 75% attendance</span>
          </Link>
        )}
        <Link
          href={STUDENT_ROUTES.planner}
          className="flex items-center gap-3 rounded-[1.25rem] border border-primary/40 bg-primary-container p-4 text-on-primary-container transition-colors hover:border-primary"
        >
          <CalendarHeart aria-hidden className="size-5 shrink-0 text-primary-accent" />
          <span className="text-sm font-bold">
            {holidays === 0 ? "No holidays this month" : `${plural(holidays, "holiday")} this month`}
          </span>
        </Link>
      </div>
    </Section>
  );
}
