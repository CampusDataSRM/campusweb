"use client";

import Link from "next/link";
import { ArrowUpRight, MapPin, RotateCw, CalendarDays } from "lucide-react";
import { ShimmerBlock } from "@/components/feedback/data-states";
import { Button } from "@/components/ui/button";
import { STUDENT_ROUTES } from "@/constants/routes";
import { useStudentCopy } from "@/hooks/use-student-copy";
import { useToday } from "@/hooks/use-today";
import {
  formatMinutes,
  minutesSinceMidnight,
  type TimetableClass,
} from "@/lib/student/timetable";

const dayFormat = new Intl.DateTimeFormat("en-IN", { weekday: "long" });

export function TodayClassesCard() {
  const copy = useStudentCopy();
  const today = useToday();
  if (today.isLoading) return <ShimmerBlock className="h-64" />;
  const showingToday = today.classes.length > 0;
  const day = showingToday ? today.dayOrder : today.upcoming?.dayOrder;
  const classes: TimetableClass[] = showingToday
    ? today.classes
    : (today.upcoming?.classes ?? []);
  const title = showingToday
    ? "Today’s agenda"
    : today.upcoming
      ? `${dayFormat.format(today.upcoming.date)}’s agenda`
      : "Your agenda";
  const nowMinutes =
    showingToday && today.now ? minutesSinceMidnight(today.now) : -1;
  return (
    <section
      aria-label={`${title}: ${copy.items}`}
      className="home-schedule panel"
    >
      <header className="home-widget-heading">
        <h2>{title}</h2>
        <Link href={STUDENT_ROUTES.timetable} aria-label="Open timetable">
          <ArrowUpRight aria-hidden className="size-4" />
        </Link>
      </header>
      <div className="home-agenda-meta">
        <CalendarDays aria-hidden className="size-3.5" />
        {day
          ? `Day order ${day} · ${classes.length} ${copy.items}`
          : "Timetable"}
      </div>
      {today.error && !classes.length ? (
        <div className="home-agenda-empty">
          <p>Your schedule isn’t available right now.</p>
          <span>Give it another try in a moment.</span>
          <Button variant="tonal" size="touch" onClick={today.refetch}>
            <RotateCw aria-hidden />
            Retry timetable
          </Button>
        </div>
      ) : !classes.length ? (
        <div className="home-agenda-empty">
          <p>Nothing scheduled yet.</p>
          <span>Your next class day will appear here.</span>
        </div>
      ) : (
        <ol className="home-agenda-list">
          {classes.map((item, i) => {
            const isNow = showingToday && today.moment.current?.id === item.id;
            const isNext =
              !isNow &&
              (showingToday ? today.moment.next?.id === item.id : i === 0);
            const isPast = showingToday && item.endMinutes <= nowMinutes;
            return (
              <li
                key={item.id}
                aria-current={isNow ? "time" : undefined}
                data-featured={isNow || isNext ? "true" : undefined}
                data-past={isPast ? "true" : undefined}
              >
                <span className="home-agenda-time">
                  {formatMinutes(item.startMinutes)}
                  <small>{formatMinutes(item.endMinutes)}</small>
                </span>
                <span className="home-agenda-subject">
                  <strong>{item.subject}</strong>
                  <span>
                    {item.kind === "practical" ? "Practical" : "Theory"}
                    {item.room && (
                      <>
                        <i aria-hidden>·</i>
                        <MapPin aria-hidden className="size-3" />
                        {item.room}
                      </>
                    )}
                  </span>
                </span>
                {(isNow || isNext) && (
                  <span className="home-agenda-status">
                    {isNow ? "Now" : showingToday ? "Up next" : "First up"}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
