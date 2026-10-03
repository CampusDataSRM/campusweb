"use client";

import Link from "next/link";
import { useMemo } from "react";

import { AttendanceRing } from "@/components/charts/attendance-ring";
import { CachedBadge, ShimmerBlock } from "@/components/feedback/data-states";
import { STUDENT_ROUTES } from "@/constants/routes";
import { useIsMobile } from "@/hooks/use-mobile";
import { useStudentCopy } from "@/hooks/use-student-copy";
import { usePlanner, useProfile } from "@/hooks/use-student-data";
import { useToday, type Today } from "@/hooks/use-today";
import { countBelowThreshold, mergeTheoryPracticalCourses, overallAttendance } from "@/lib/student/attendance";
import { holidaysInMonth, plannerMonths } from "@/lib/student/planner";
import { batchLabel, firstName } from "@/lib/student/profile";
import { formatMinutes, minutesSinceMidnight } from "@/lib/student/timetable";
import type { StudentCopy } from "@/constants/copy";

const dayFormat = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "short" });
const todayFormat = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long" });

function greeting(hour: number): string {
  if (hour < 5) return "Up late";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function inMinutes(minutes: number): string {
  if (minutes <= 1) return "starting now";
  if (minutes < 60) return `in ${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `in ${h}h ${m}m` : `in ${h}h`;
}

function relativeDay(date: Date, now: Date): string {
  const diff = Math.round((new Date(date).setHours(0, 0, 0, 0) - new Date(now).setHours(0, 0, 0, 0)) / 86_400_000);
  return diff === 1 ? "Tomorrow" : dayFormat.format(date);
}

/** The one line that answers "what's happening right now?". */
function headline(today: Today, copy: StudentCopy): { kicker: string; title: string; detail: string } {
  const { now, moment, classes, upcoming } = today;
  if (!now) return { kicker: "", title: "", detail: "" };
  const minutes = minutesSinceMidnight(now);
  const after = upcoming
    ? `${relativeDay(upcoming.date, now)} is Day ${upcoming.dayOrder}. First ${copy.item} ${formatMinutes(upcoming.classes[0].startMinutes)}, ${upcoming.classes[0].subject}.`
    : "";

  if (moment.current) {
    const c = moment.current;
    return {
      kicker: `On now, until ${formatMinutes(c.endMinutes)}`,
      title: c.subject,
      detail: [c.room && `Room ${c.room}`, moment.next && `Then ${moment.next.subject} at ${formatMinutes(moment.next.startMinutes)}`].filter(Boolean).join(". "),
    };
  }
  if (moment.next) {
    const n = moment.next;
    return {
      kicker: `Up next, ${inMinutes(n.startMinutes - minutes)}`,
      title: n.subject,
      detail: `${formatMinutes(n.startMinutes)}${n.room ? ` in ${n.room}` : ""}`,
    };
  }
  if (classes.length > 0) return { kicker: `Day ${today.dayOrder}`, title: "You're done for today.", detail: after };
  return { kicker: todayFormat.format(now), title: `No ${copy.items} today.`, detail: after };
}

/**
 * The dashboard's hero: what's on now or next (or when you're back), next to
 * the overall attendance gauge - the two things every visit is for.
 */
export function TodayHero() {
  const copy = useStudentCopy();
  const profile = useProfile();
  const planner = usePlanner();
  const today = useToday();
  const isMobile = useIsMobile();

  const stats = useMemo(() => {
    const courses = mergeTheoryPracticalCourses(profile.data?.courses ?? [], profile.data?.attendanceSource);
    return { overall: overallAttendance(courses), below: countBelowThreshold(courses), total: courses.length };
  }, [profile.data]);
  const holidays = today.now ? holidaysInMonth(plannerMonths(planner.data), today.now).length : 0;

  if (profile.isLoading || !today.now) return <ShimmerBlock className="h-72 rounded-[2rem]" />;

  const name = firstName(profile.data?.name);
  const line = headline(today, copy);
  const chips = [
    today.dayOrder !== null && `Day ${today.dayOrder}`,
    profile.data?.semester && `Semester ${profile.data.semester}`,
    profile.data?.comboBatch && batchLabel(profile.data.comboBatch),
    holidays > 0 && `${holidays} ${holidays === 1 ? "holiday" : "holidays"} this month`,
  ].filter(Boolean) as string[];

  return (
    <section aria-label="Today" className="relative isolate overflow-hidden rounded-[2rem] border border-outline-variant bg-surface-container">
      <div aria-hidden className="aurora" />
      <div className="relative z-10 grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:p-10">
        <div className="flex min-w-0 flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-bold text-on-surface-muted">
              {greeting(today.now.getHours())}
              {name ? `, ${name}` : ""}
            </p>
            <CachedBadge savedAt={profile.savedAt} refreshing={profile.isFetching} />
          </div>
          <div className="flex flex-col gap-2">
            <p className="flex items-center gap-2 text-sm font-extrabold text-primary-accent">
              {today.moment.current && <span aria-hidden className="live-dot text-success-accent" />}
              {line.kicker}
            </p>
            <h1 className="text-display font-black text-on-surface">{line.title}</h1>
            {line.detail && <p className="max-w-xl text-base font-semibold text-on-surface-muted sm:text-lg">{line.detail}</p>}
          </div>
          {chips.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {chips.map((chip) => (
                <li key={chip} className="glass rounded-full border border-outline-variant px-3 py-1.5 text-xs font-bold text-on-surface">
                  {chip}
                </li>
              ))}
            </ul>
          )}
        </div>

        {stats.total > 0 && (
          <Link
            href={STUDENT_ROUTES.attendance}
            className="glass pressable flex items-center gap-5 rounded-[1.5rem] border border-outline-variant p-4 pr-6 hover:border-outline lg:flex-col lg:gap-3 lg:p-6"
          >
            <AttendanceRing percent={stats.overall} label="overall" size={isMobile ? 112 : 148} />
            <span className="flex min-w-0 flex-1 flex-col gap-1 lg:items-center lg:text-center">
              <span className="font-extrabold text-on-surface">{copy.overallRate}</span>
              <span className={stats.below > 0 ? "text-sm font-bold text-danger-accent" : "text-sm font-bold text-success-accent"}>
                {stats.below > 0 ? `${stats.below} of ${stats.total} under 75%` : "All above 75%"}
              </span>
            </span>
          </Link>
        )}
      </div>
    </section>
  );
}
