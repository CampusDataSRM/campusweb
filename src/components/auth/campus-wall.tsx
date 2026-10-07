"use client";

import { ArrowUpRight, Sparkles } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";

import { STUDENT_ROUTES } from "@/constants/routes";
import { useBrowseAsGuest } from "@/hooks/use-auth-actions";
import { useNow } from "@/hooks/use-now";
import { useClubs, useEvents } from "@/hooks/use-student-data";
import {
  PINNED_CLUB,
  eventPhase,
  parseEventDates,
  type EventPhase,
} from "@/lib/student/events";
import type { Club, ClubEvent } from "@/network-calls/types";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const monthDay = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]}`;

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** "Today", "Until 10 Oct", "9-10 Oct", "20 Sep - 10 Oct", "14 Sep". */
function when(event: ClubEvent, phase: EventPhase, now: Date): string {
  const { start, end } = parseEventDates(event.dates);
  if (!start) return "";
  if (phase === "ongoing") {
    if (!end || sameDay(end, now) || sameDay(start, end)) return "Today";
    return `Until ${monthDay(end)}`;
  }
  if (phase === "upcoming") {
    const tomorrow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
    );
    if (sameDay(start, tomorrow)) return "Tomorrow";
  }
  if (end && !sameDay(start, end)) {
    return start.getMonth() === end.getMonth()
      ? `${start.getDate()}-${end.getDate()} ${MONTHS[start.getMonth()]}`
      : `${monthDay(start)} - ${monthDay(end)}`;
  }
  return monthDay(start);
}

interface WallData {
  live: ClubEvent[];
  recent: ClubEvent[];
  clubs: Club[];
  recruiting: number;
}

/** The three lists the wall shows, from the public catalogue. */
function useWall(now: Date | null): {
  data: WallData | null;
  loading: boolean;
} {
  const events = useEvents();
  const clubs = useClubs();
  const data = useMemo<WallData | null>(() => {
    if (!now || !events.data || !clubs.data) return null;
    const real = events.data.filter((e) => e.club_name?.trim() !== PINNED_CLUB);
    const live = real
      .filter((e) => eventPhase(e, now) !== "past")
      .sort((a, b) => {
        const pa = eventPhase(a, now) === "ongoing" ? 0 : 1;
        const pb = eventPhase(b, now) === "ongoing" ? 0 : 1;
        if (pa !== pb) return pa - pb;
        return (
          (parseEventDates(a.dates).start?.getTime() ?? 0) -
          (parseEventDates(b.dates).start?.getTime() ?? 0)
        );
      });
    const recent = real
      .filter((e) => eventPhase(e, now) === "past" && e.banner_url)
      .sort(
        (a, b) =>
          (parseEventDates(b.dates).end?.getTime() ?? 0) -
          (parseEventDates(a.dates).end?.getTime() ?? 0),
      );
    const ranked = [...clubs.data]
      .filter((c) => c.logo)
      .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
    return {
      live,
      recent,
      clubs: ranked,
      recruiting: clubs.data.filter((c) => c.isRecruiting).length,
    };
  }, [now, events.data, clubs.data]);
  return { data, loading: events.isLoading || clubs.isLoading || !now };
}

/** The eyebrow above the headline: live counts once they're known. */
export function WallEyebrow() {
  const now = useNow();
  const { data } = useWall(now);
  if (!data) {
    return (
      <div className="sign-in-eyebrow">
        <span aria-hidden /> Clubs and events, in one place
      </div>
    );
  }
  const onNow = data.live.filter(
    (e) => now && eventPhase(e, now) === "ongoing",
  ).length;
  const parts = [
    onNow > 0 && `${onNow} ${onNow === 1 ? "event" : "events"} on now`,
    data.recruiting > 0 && `${data.recruiting} clubs recruiting`,
    `${data.clubs.length} clubs on campus`,
  ].filter(Boolean) as string[];
  return (
    <div className="sign-in-eyebrow" data-live={onNow > 0 || undefined}>
      <span aria-hidden className={onNow > 0 ? "live-dot" : undefined} />
      {parts.slice(0, 2).join(" · ")}
    </div>
  );
}

/**
 * What's on, for real: the events happening now and next (padded with the
 * most recent ones when the calendar is quiet) and a slow strip of every
 * club on campus. Anything you tap opens the public events or clubs page as
 * a guest. Falls back to three plain points if the catalogue is unavailable.
 */
export function CampusWall() {
  const now = useNow();
  const { data, loading } = useWall(now);
  const browseAsGuest = useBrowseAsGuest();

  if (loading) {
    return (
      <div className="sign-in-wall" aria-busy="true">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="sign-in-wall-row" data-skeleton="" />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <ol className="sign-in-features">
        <li>
          <span aria-hidden>01</span>
          <div>
            <strong>See what&apos;s on.</strong>
            <p>
              Workshops, fests, talks and meetups across campus, in one planner.
            </p>
          </div>
        </li>
        <li>
          <span aria-hidden>02</span>
          <div>
            <strong>Find your clubs.</strong>
            <p>Browse every club, what they&apos;re up to and how to join.</p>
          </div>
        </li>
        <li>
          <span aria-hidden>03</span>
          <div>
            <strong>Never miss out.</strong>
            <p>
              Like events, follow clubs and keep up with what&apos;s coming.
            </p>
          </div>
        </li>
      </ol>
    );
  }

  const rows: { event: ClubEvent; phase: EventPhase }[] = [
    ...data.live.map((event) => ({ event, phase: eventPhase(event, now!) })),
    ...data.recent
      .slice(0, Math.max(0, 3 - data.live.length))
      .map((event) => ({ event, phase: "past" as const })),
  ].slice(0, 3);
  const strip = data.clubs.slice(0, 24);

  return (
    <div className="sign-in-wall">
      <div className="sign-in-wall-head">
        <h2>{data.live.length > 0 ? "On campus" : "Recently on campus"}</h2>
        <button
          type="button"
          onClick={() => void browseAsGuest(STUDENT_ROUTES.events)}
        >
          All events <ArrowUpRight aria-hidden className="size-3.5" />
        </button>
      </div>
      <ol className="sign-in-wall-list">
        {rows.map(({ event, phase }, i) => (
          <li key={event.id} style={{ "--i": i } as React.CSSProperties}>
            <button
              type="button"
              className="sign-in-wall-row"
              data-phase={phase}
              onClick={() => void browseAsGuest(STUDENT_ROUTES.events)}
              aria-label={`${event.title}, ${event.club_name}. Open events`}
            >
              <span className="sign-in-wall-thumb" aria-hidden>
                {event.banner_url ? (
                  <Image
                    src={event.banner_url}
                    alt=""
                    fill
                    unoptimized
                    sizes="72px"
                  />
                ) : (
                  <Sparkles className="size-4" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="sign-in-wall-title">{event.title}</span>
                <span className="sign-in-wall-sub">
                  {event.club_name?.trim()}
                </span>
              </span>
              <span className="sign-in-wall-when">
                {phase === "ongoing" && <i aria-hidden className="live-dot" />}
                {when(event, phase, now!)}
              </span>
            </button>
          </li>
        ))}
      </ol>

      <div className="sign-in-wall-head">
        <h2>Clubs</h2>
        <button
          type="button"
          onClick={() => void browseAsGuest(STUDENT_ROUTES.clubs)}
        >
          All {data.clubs.length} clubs{" "}
          <ArrowUpRight aria-hidden className="size-3.5" />
        </button>
      </div>
      <button
        type="button"
        className="sign-in-clubs"
        aria-label={`${data.clubs.length} clubs on campus, ${data.recruiting} recruiting. Open clubs`}
        onClick={() => void browseAsGuest(STUDENT_ROUTES.clubs)}
        style={{ "--count": strip.length } as React.CSSProperties}
      >
        <span className="sign-in-clubs-track" aria-hidden>
          {[0, 1].map((copy) =>
            strip.map((club) => (
              <span
                key={`${copy}-${club.id}`}
                className="sign-in-club"
                data-recruiting={club.isRecruiting || undefined}
              >
                <Image
                  src={club.logo}
                  alt=""
                  width={36}
                  height={36}
                  unoptimized
                />
                <span>{club.name.trim()}</span>
              </span>
            )),
          )}
        </span>
      </button>
    </div>
  );
}
