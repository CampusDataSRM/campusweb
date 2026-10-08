"use client";

import { BookOpen, CalendarOff, MapPin } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";

import {
  CachedBadge,
  EmptyState,
  ErrorState,
  ShimmerBlock,
} from "@/components/feedback/data-states";
import { StudentRefreshButton } from "@/components/feedback/student-refresh-button";
import { PageHeader } from "@/components/layout/page-header";
import { TIER_STYLE } from "@/constants/attendance-tiers";
import { STUDENT_ROUTES } from "@/constants/routes";
import { usePlanner, useProfile, useTimetable } from "@/hooks/use-student-data";
import { useToday } from "@/hooks/use-today";
import {
  attendanceTier,
  courseAttendance,
  courseForSubject,
  mergeTheoryPracticalCourses,
} from "@/lib/student/attendance";
import { plannerMonths, resolveDayOrder } from "@/lib/student/planner";
import {
  classMoment,
  classesForDay,
  formatDuration,
  formatMinutes,
  freeGaps,
  mergeConsecutive,
  minutesSinceMidnight,
  type ClassBlock,
} from "@/lib/student/timetable";
import { cn } from "@/lib/utils";

const DAY_ORDERS = [1, 2, 3, 4, 5] as const;
const shortDay = new Intl.DateTimeFormat("en-IN", { weekday: "short" });
const dateFormat = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** "Today", "Tomorrow", or "Tue 6 Oct". */
function whenLabel(date: Date, now: Date): string {
  if (sameDay(date, now)) return "Today";
  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  );
  if (sameDay(date, tomorrow)) return "Tomorrow";
  return dateFormat.format(date);
}

/**
 * The weekly rotation, one day order at a time. Each tab says when that day
 * next comes round; the day reads as sittings (a three-period lab is one
 * row) with the free stretches between them, your attendance in each
 * subject beside it, and a way into its notes.
 */
export function TimetableView() {
  const timetable = useTimetable();
  const planner = usePlanner();
  const profile = useProfile();
  const today = useToday();
  // `?day=3` (from the planner or a shared link) picks that day order first.
  const [picked, setPicked] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    const wanted = Number(
      new URLSearchParams(window.location.search).get("day"),
    );
    return wanted >= 1 && wanted <= 5 ? wanted : null;
  });
  const day = picked ?? today.dayOrder ?? 1;
  const isToday = day === today.dayOrder;
  const now = today.now;
  const minutesNow = now ? minutesSinceMidnight(now) : null;

  const perDay = useMemo(
    () =>
      DAY_ORDERS.map((order) => {
        const classes = classesForDay(timetable.data?.timetable, order);
        return { order, classes, blocks: mergeConsecutive(classes) };
      }),
    [timetable.data],
  );
  const { classes, blocks } = perDay[day - 1];
  const gaps = useMemo(() => freeGaps(blocks), [blocks]);
  const moment =
    isToday && minutesNow !== null
      ? classMoment(classes, minutesNow)
      : { current: null, next: null };
  const currentBlock = moment.current
    ? blocks.find((b) => b.periods.some((p) => p.id === moment.current!.id))
    : null;
  const nextBlock =
    moment.next && !currentBlock?.periods.some((p) => p.id === moment.next!.id)
      ? blocks.find((b) => b.periods.some((p) => p.id === moment.next!.id))
      : null;

  // When each day order next comes round, from today.
  const nextDate = useMemo(() => {
    const map = new Map<number, Date>();
    if (!now) return map;
    const months = plannerMonths(planner.data);
    if (months.length === 0) return map;
    for (let offset = 0; offset <= 45 && map.size < 5; offset++) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + offset,
      );
      const order = resolveDayOrder(months, date, null);
      if (order !== null && !map.has(order)) map.set(order, date);
    }
    return map;
  }, [now, planner.data]);

  // Attendance in each subject, read off the course list.
  const courses = useMemo(
    () =>
      mergeTheoryPracticalCourses(
        profile.data?.courses ?? [],
        profile.data?.attendanceSource,
      ),
    [profile.data],
  );
  const attendanceFor = (block: ClassBlock) => {
    const course = courseForSubject(
      courses,
      block.subject,
      block.kind === "practical",
    );
    if (!course) return null;
    const stats = courseAttendance(course);
    return stats.isPending ? null : stats;
  };

  const first = blocks[0];
  const last = blocks.at(-1);
  const freeTotal = gaps.reduce(
    (sum, g) => sum + (g.endMinutes - g.startMinutes),
    0,
  );
  const theory = blocks.filter((b) => b.kind === "theory").length;
  const practical = blocks.length - theory;

  const description = today.dayOrder
    ? `Today is Day ${today.dayOrder}${perDay[today.dayOrder - 1].blocks.length ? ` · ${perDay[today.dayOrder - 1].blocks.length} classes, ${formatMinutes(perDay[today.dayOrder - 1].blocks[0].startMinutes)} to ${formatMinutes(perDay[today.dayOrder - 1].blocks.at(-1)!.endMinutes)}` : ""}.`
    : today.upcoming && now
      ? `No classes today. ${whenLabel(today.upcoming.date, now)} is Day ${today.upcoming.dayOrder}.`
      : "No day order today.";

  return (
    <div className="campus-view timetable-page flex flex-col gap-6">
      <PageHeader
        title="Timetable"
        actions={<StudentRefreshButton target="timetable" />}
        status={
          <CachedBadge
            savedAt={timetable.savedAt}
            refreshing={timetable.isFetching}
          />
        }
        description={description}
      />

      <div className="tt-days" role="radiogroup" aria-label="Day order">
        {perDay.map(({ order, blocks: dayBlocks }) => {
          const date = nextDate.get(order);
          const selected = order === day;
          return (
            <button
              key={order}
              type="button"
              role="radio"
              aria-checked={selected}
              className="tt-day"
              data-today={order === today.dayOrder || undefined}
              onClick={() => setPicked(order)}
            >
              <span className="tt-day-name">
                Day {order}
                {order === today.dayOrder && <i aria-hidden />}
              </span>
              <span className="tt-day-sub">
                {date && now ? (
                  <>
                    <span className="tt-day-long">{whenLabel(date, now)}</span>
                    <span className="tt-day-short">
                      {sameDay(date, now) ? "Today" : shortDay.format(date)}
                    </span>
                  </>
                ) : (
                  "\u00a0"
                )}
                {dayBlocks.length > 0 && ` · ${dayBlocks.length}`}
              </span>
            </button>
          );
        })}
      </div>

      {timetable.isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }, (_, i) => (
            <ShimmerBlock key={i} className="h-20" />
          ))}
        </div>
      ) : !timetable.data ? (
        <ErrorState
          error={timetable.error}
          title="Couldn't load your timetable"
          onRetry={() => void timetable.refetch()}
          retrying={timetable.isFetching}
        />
      ) : blocks.length === 0 ? (
        <EmptyState
          icon={CalendarOff}
          title={`Day ${day} is clear`}
          description="No classes are scheduled for this day order."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <ol className="tt-list" aria-label={`Day ${day} classes`}>
            {blocks.map((block, index) => {
              const isNow = currentBlock?.id === block.id;
              const isNext = nextBlock?.id === block.id;
              const done =
                isToday &&
                minutesNow !== null &&
                block.endMinutes <= minutesNow;
              const stats = attendanceFor(block);
              const gap = gaps.find((g) => g.after === index);
              const progress =
                isNow && minutesNow !== null
                  ? Math.min(
                      1,
                      (minutesNow - block.startMinutes) /
                        Math.max(1, block.endMinutes - block.startMinutes),
                    )
                  : 0;
              return (
                <li key={block.id} className="contents">
                  <div
                    className="tt-row"
                    data-now={isNow || undefined}
                    data-next={isNext || undefined}
                    data-done={done || undefined}
                    style={{ "--i": index } as CSSProperties}
                  >
                    <div className="tt-time tabular">
                      <p>{formatMinutes(block.startMinutes)}</p>
                      <p>to {formatMinutes(block.endMinutes)}</p>
                      {block.periods.length > 1 && (
                        <small>{block.periods.length} periods</small>
                      )}
                    </div>
                    <span
                      className="tt-bar"
                      data-kind={block.kind}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <p className="tt-subject">{block.subject}</p>
                      <p className="tt-meta">
                        <span>
                          {block.kind === "practical" ? "Practical" : "Theory"}
                        </span>
                        {block.room && (
                          <span>
                            <MapPin aria-hidden className="size-3.5" />
                            {block.room}
                          </span>
                        )}
                        <span>
                          {formatDuration(
                            block.endMinutes - block.startMinutes,
                          )}
                        </span>
                        {stats && (
                          <span
                            className={cn(
                              "tt-attendance",
                              TIER_STYLE[attendanceTier(stats.percent)].text,
                            )}
                            title={`${stats.percent.toFixed(1)}% attendance${stats.required > 0 ? ` · attend ${stats.required} to reach 75%` : ` · ${stats.margin} safe to miss`}`}
                          >
                            {stats.percent.toFixed(0)}%
                          </span>
                        )}
                      </p>
                    </div>
                    {(isNow || isNext) && (
                      <span
                        className="tt-badge"
                        data-tone={isNow ? "now" : "next"}
                      >
                        {isNow && <span aria-hidden className="live-dot" />}
                        {isNow
                          ? `${block.endMinutes - minutesNow!} min left`
                          : `in ${formatDuration(block.startMinutes - minutesNow!)}`}
                      </span>
                    )}
                    <Link
                      href={`${STUDENT_ROUTES.notes}?subject=${encodeURIComponent(block.subject)}`}
                      className="tt-notes"
                      aria-label={`Notes for ${block.subject}`}
                      title="Notes"
                    >
                      <BookOpen aria-hidden className="size-4" />
                    </Link>
                    {isNow && (
                      <span className="tt-progress" aria-hidden>
                        <span style={{ transform: `scaleX(${progress})` }} />
                      </span>
                    )}
                  </div>
                  {gap && (
                    <div
                      className="tt-gap"
                      aria-label={`Free for ${formatDuration(gap.endMinutes - gap.startMinutes)}`}
                    >
                      <span>
                        Free ·{" "}
                        {formatDuration(gap.endMinutes - gap.startMinutes)}
                      </span>
                      <span className="tabular">
                        {formatMinutes(gap.startMinutes)} to{" "}
                        {formatMinutes(gap.endMinutes)}
                      </span>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>

          <dl className="tt-side panel">
            <div>
              <dt>Classes</dt>
              <dd className="tabular">{blocks.length}</dd>
              <dd className="tt-side-note">
                {[
                  theory && `${theory} theory`,
                  practical && `${practical} practical`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
                {classes.length !== blocks.length &&
                  ` · ${classes.length} periods`}
              </dd>
            </div>
            <div>
              <dt>Starts</dt>
              <dd className="tabular">
                {first ? formatMinutes(first.startMinutes) : "-"}
              </dd>
              <dd className="tt-side-note">{first?.subject}</dd>
            </div>
            <div>
              <dt>Finishes</dt>
              <dd className="tabular">
                {last ? formatMinutes(last.endMinutes) : "-"}
              </dd>
              <dd className="tt-side-note">{last?.subject}</dd>
            </div>
            <div>
              <dt>Free between classes</dt>
              <dd className="tabular">
                {freeTotal ? formatDuration(freeTotal) : "None"}
              </dd>
              <dd className="tt-side-note">
                {gaps.length > 0
                  ? `${gaps.length} ${gaps.length === 1 ? "gap" : "gaps"}`
                  : "Back to back"}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
