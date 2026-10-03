"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import { STUDENT_ROUTES } from "@/constants/routes";
import { useNow } from "@/hooks/use-now";
import { useEvents } from "@/hooks/use-student-data";
import { eventPhase, parseEventDates, visibleEvents } from "@/lib/student/events";

const DASHBOARD_EVENT_COUNT = 4;
const dayFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" });

/** The next few events as a compact list; the Events page has the full cards. */
export function UpcomingEvents() {
  const now = useNow();
  const events = useEvents();
  const list = useMemo(
    () => (now ? visibleEvents(events.data ?? [], now).slice(0, DASHBOARD_EVENT_COUNT) : []),
    [events.data, now],
  );
  if (!now || list.length === 0) return null;

  return (
    <section aria-label="Events" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-bold text-on-surface">Coming up on campus</h2>
        <Link href={STUDENT_ROUTES.events} className="text-sm font-semibold text-primary-accent hover:underline">All events</Link>
      </div>
      <ul className="flex flex-col divide-y divide-outline-variant border-y border-outline-variant">
        {list.map((event) => {
          const { start } = parseEventDates(event.dates);
          const live = eventPhase(event, now) === "ongoing";
          return (
            <li key={event.id}>
              <Link href={STUDENT_ROUTES.events} className="group flex items-center gap-3 py-3">
                <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary-container font-heading font-extrabold text-on-primary-container">
                  {event.banner_url ? <Image src={event.banner_url} alt="" fill unoptimized sizes="48px" className="object-cover" /> : event.club_name?.[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-on-surface group-hover:underline">{event.title}</p>
                  <p className="truncate text-sm text-on-surface-muted">{event.club_name}</p>
                </div>
                <span className={live ? "rounded-full bg-success-container px-2.5 py-1 text-xs font-bold text-on-success-container" : "text-sm font-semibold text-on-surface-muted tabular"}>
                  {live ? "Live" : start ? dayFormat.format(start) : ""}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
