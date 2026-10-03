"use client";

import { CalendarHeart } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { Section } from "@/components/layout/page-header";
import { STUDENT_ROUTES } from "@/constants/routes";
import { useSession } from "@/context/session-context";
import { useNow } from "@/hooks/use-now";
import { usePlanner, useProfile } from "@/hooks/use-student-data";
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

  if (session?.kind === "demo" || !profile.data) return null;

  return (
    <Section title="This month">
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href={STUDENT_ROUTES.planner}
          className="flex items-center gap-3 rounded-2xl border border-primary/40 bg-primary-container p-4 text-on-primary-container transition-colors hover:border-primary"
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
