"use client";

import Link from "next/link";
import CountUp from "@/components/CountUp";
import { WeekStrip } from "@/components/dashboard/week-strip";
import {
  ArrowUpRight,
  CalendarDays,
  ArrowRight,
  BookOpen,
  Utensils,
} from "lucide-react";
import { useMemo, type CSSProperties, type ReactNode } from "react";

import {
  CachedBadge,
  ErrorState,
  ShimmerBlock,
} from "@/components/feedback/data-states";
import { STUDENT_ROUTES } from "@/constants/routes";
import { useSession } from "@/context/session-context";
import { useStudentCopy } from "@/hooks/use-student-copy";
import { usePlanner, useProfile } from "@/hooks/use-student-data";
import { useToday, type Today } from "@/hooks/use-today";
import {
  courseAttendance,
  countBelowThreshold,
  mergeTheoryPracticalCourses,
  overallAttendance,
} from "@/lib/student/attendance";
import { holidaysInMonth, plannerMonths } from "@/lib/student/planner";
import { batchLabel, firstName } from "@/lib/student/profile";
import { formatMinutes, minutesSinceMidnight } from "@/lib/student/timetable";
import type { StudentCopy } from "@/constants/copy";

const dayFormat = new Intl.DateTimeFormat("en-IN", {
  weekday: "long",
  day: "numeric",
  month: "short",
});
const todayFormat = new Intl.DateTimeFormat("en-IN", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

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
  const diff = Math.round(
    (new Date(date).setHours(0, 0, 0, 0) - new Date(now).setHours(0, 0, 0, 0)) /
      86_400_000,
  );
  return diff === 1 ? "Tomorrow" : dayFormat.format(date);
}

/** The one line that answers "what's happening right now?". */
function headline(
  today: Today,
  copy: StudentCopy,
): { kicker: string; title: string; detail: string } {
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
      detail: [
        c.room && `Room ${c.room}`,
        moment.next &&
          `Then ${moment.next.subject} at ${formatMinutes(moment.next.startMinutes)}`,
      ]
        .filter(Boolean)
        .join(". "),
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
  if (classes.length > 0)
    return {
      kicker: `Day ${today.dayOrder}`,
      title: "You're done for today.",
      detail: after,
    };
  return {
    kicker: todayFormat.format(now),
    title: `No ${copy.items} today.`,
    detail: after,
  };
}

/** How far through the class on now - a bar that fills as the period runs. */
function ClassProgress({
  start,
  end,
  now,
}: {
  start: number;
  end: number;
  now: number;
}) {
  const total = Math.max(1, end - start);
  const done = Math.min(total, Math.max(0, now - start));
  const left = total - done;
  return (
    <div className="flex max-w-md items-center gap-3">
      <div
        role="progressbar"
        aria-label="Class progress"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        className="relative h-2 flex-1 overflow-hidden rounded-full bg-surface-highest"
      >
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-success-accent transition-[width] duration-(--duration-long)"
          style={{ width: `${(done / total) * 100}%` }}
        />
      </div>
      <span className="shrink-0 text-sm font-extrabold text-on-surface tabular">
        {left} min left
      </span>
    </div>
  );
}

/** Attendance across the student's courses, for the hero and the card. */
export function useAttendanceStats() {
  const profile = useProfile();
  return useMemo(() => {
    const courses = mergeTheoryPracticalCourses(
      profile.data?.courses ?? [],
      profile.data?.attendanceSource,
    );
    return {
      courses: courses
        .map(courseAttendance)
        .sort((a, b) => Number(a.isPending) - Number(b.isPending)),
      overall: overallAttendance(courses),
      below: countBelowThreshold(courses),
      total: courses.length,
    };
  }, [profile.data]);
}

/** Overall attendance with every subject as a bar - the hero's right tile. */
export function AttendanceCard() {
  const copy = useStudentCopy();
  const stats = useAttendanceStats();
  if (stats.total === 0) return null;
  return (
    <Link
      href={STUDENT_ROUTES.attendance}
      className="home-attendance-summary panel"
      aria-label={`${copy.overallRate}: ${stats.overall.toFixed(1)}%. ${stats.below} subjects below 75%. View attendance.`}
    >
      <span className="home-widget-heading">
        <span>{copy.overallRate}</span>
        <ArrowUpRight aria-hidden className="size-4" />
      </span>
      <span className="home-attendance-value" aria-hidden>
        <CountUp to={Math.round(stats.overall * 10) / 10} duration={0.8} />
        <small>%</small>
      </span>
      <span className="home-attendance-caption">
        Across your subjects this semester
      </span>
      <span className="home-distribution" aria-hidden>
        <span className="home-chart-target">
          <span>75% target</span>
        </span>
        <span className="home-chart-bars">
          {stats.courses.map((item, i) => {
            const initials = item.course.courseTitle
              .split(/\s+/)
              .filter(
                (word) => !["and", "for", "of"].includes(word.toLowerCase()),
              )
              .map((word) => word[0])
              .join("")
              .slice(0, 4);
            return (
              <span
                className="home-chart-column"
                key={item.course.courseCode + i}
                title={`${item.course.courseTitle}: ${item.isPending ? "Not started" : `${item.percent.toFixed(1)}%`}`}
              >
                <span
                  className="home-chart-bar"
                  data-pending={item.isPending || undefined}
                  data-safe={
                    (!item.isPending && item.percent >= 75) || undefined
                  }
                  style={
                    {
                      "--bar-height": `${item.isPending ? 3 : Math.max(0, Math.min(100, item.percent))}%`,
                      "--bar-delay": `${i * 65}ms`,
                    } as CSSProperties
                  }
                />
                <small>{initials}</small>
              </span>
            );
          })}
        </span>
      </span>
      <span className="home-attendance-footer">
        <span
          className={
            stats.below
              ? "home-status-tag text-danger-accent"
              : "home-status-tag text-success-accent"
          }
        >
          <i aria-hidden />
          {stats.below
            ? `${stats.below} subjects need attention`
            : "All subjects on track"}
        </span>
        <span className="home-attendance-action">
          {stats.below ? "See your recovery plan" : "Check your margins"}
          <ArrowRight aria-hidden className="size-4" />
        </span>
      </span>
    </Link>
  );
}

/**
 * The dashboard's hero: what's on now or next (or when you're back), next to
 * the attendance target and the next action.
 */
/**
 * The dashboard's hero: what's on now or next (or when you're back), next to
 * the attendance target and the next action - or, when `aside` is given,
 * whatever should take the attendance tile's place (the event spotlight).
 */
export function TodayHero({ aside }: { aside?: ReactNode } = {}) {
  const copy = useStudentCopy();
  const isDemo = useSession().session?.kind === "demo";
  const profile = useProfile();
  const planner = usePlanner();
  const today = useToday();

  const holidays = today.now
    ? holidaysInMonth(plannerMonths(planner.data), today.now).length
    : 0;

  if (profile.error && !profile.data)
    return (
      <ErrorState
        error={profile.error}
        title="Couldn’t load your overview"
        onRetry={profile.refetch}
      />
    );
  if (profile.isLoading || today.isLoading || !today.now)
    return <ShimmerBlock className="h-72 rounded-[2rem]" />;

  const name = firstName(profile.data?.name);
  const line =
    today.error && !today.classes.length && !today.upcoming
      ? {
          kicker: todayFormat.format(today.now),
          title: "Your day, at a glance.",
          detail:
            "Your schedule is unavailable right now. You can still check your attendance and explore campus.",
        }
      : headline(today, copy);
  const freeDay =
    !today.error &&
    !today.classes.length &&
    !today.moment.current &&
    !today.moment.next;
  const weekday = today.now.toLocaleDateString("en-IN", { weekday: "long" });
  const chips = [
    today.dayOrder !== null && `Day ${today.dayOrder}`,
    profile.data?.semester && `Semester ${profile.data.semester}`,
    profile.data?.comboBatch && batchLabel(profile.data.comboBatch),
    holidays > 0 &&
      `${holidays} ${holidays === 1 ? "holiday" : "holidays"} this month`,
  ].filter(Boolean) as string[];

  return (
    <section aria-label="Today" className="home-hero">
      <div className="home-welcome">
        <div className="home-greeting flex flex-wrap items-center gap-2">
          <p>
            {greeting(today.now.getHours())}
            {name ? `, ${name}` : ""}
          </p>
          <CachedBadge
            savedAt={profile.savedAt}
            refreshing={profile.isFetching}
          />
        </div>
        <span className="home-welcome-date">
          {todayFormat.format(today.now)}
        </span>
      </div>
      <div className="home-hero-grid">
        <div className="home-hero-copy" data-free-day={freeDay || undefined}>
          <div className="home-now-label">
            <span
              aria-hidden
              className={today.moment.current ? "live-dot" : "home-status-dot"}
            />
            {freeDay ? `No ${copy.items} today` : line.kicker}
          </div>
          <h1 className="home-headline">
            {freeDay ? (
              <>
                {weekday}.<br />
                <span>On your terms.</span>
              </>
            ) : (
              line.title
            )}
          </h1>
          {line.detail && <p className="home-hero-detail">{line.detail}</p>}
          {today.moment.current && (
            <ClassProgress
              start={today.moment.current.startMinutes}
              end={today.moment.current.endMinutes}
              now={minutesSinceMidnight(today.now)}
            />
          )}
          <div className="home-hero-bottom">
            <Link href={STUDENT_ROUTES.timetable} className="home-button">
              Open timetable <ArrowRight aria-hidden className="size-4" />
            </Link>
            <div className="home-meta">
              {chips.map((chip) => (
                <span key={chip}>{chip}</span>
              ))}
            </div>
          </div>
          <WeekStrip now={today.now} />
        </div>
        {aside ?? <AttendanceCard />}
      </div>
      {/* Notes, the planner and mess are student tools; the evaluator
          account is an events programme and never sees them. */}
      {!isDemo && (
        <nav className="home-shortcuts" aria-label="Quick access">
          <Link href={STUDENT_ROUTES.notes}>
            <BookOpen aria-hidden className="size-4" />
            <span>
              <strong>Study materials</strong>
              <small>Notes and course resources</small>
            </span>
            <ArrowUpRight aria-hidden className="size-3.5" />
          </Link>
          <Link href={STUDENT_ROUTES.planner}>
            <CalendarDays aria-hidden className="size-4" />
            <span>
              <strong>Academic planner</strong>
              <small>See what’s coming up</small>
            </span>
            <ArrowUpRight aria-hidden className="size-3.5" />
          </Link>
          <Link href={STUDENT_ROUTES.mess}>
            <Utensils aria-hidden className="size-4" />
            <span>
              <strong>What’s in mess</strong>
              <small>Check today’s menu</small>
            </span>
            <ArrowUpRight aria-hidden className="size-3.5" />
          </Link>
        </nav>
      )}
    </section>
  );
}
