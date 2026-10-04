"use client";

import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle,
  Clock,
  Coffee,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { STUDENT_ROUTES } from "@/constants/routes";
import { useNow } from "@/hooks/use-now";
import { AttendanceCard } from "@/components/dashboard/today-hero";
import { useEvents } from "@/hooks/use-student-data";
import {
  PINNED_CLUB,
  eventPhase,
  parseEventDates,
  type EventPhase,
} from "@/lib/student/events";
import type { ClubEvent } from "@/network-calls/types";

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

/** "Today", "Until 10 Oct", "Tomorrow", "9-10 Oct", "20 Sep - 10 Oct". */
function when(event: ClubEvent, phase: EventPhase, now: Date): string {
  const { start, end } = parseEventDates(event.dates);
  if (!start) return "";
  if (phase === "ongoing") {
    if (!end || sameDay(end, now) || sameDay(start, end)) return "Today";
    return `Until ${monthDay(end)}`;
  }
  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  );
  if (sameDay(start, tomorrow)) return "Tomorrow";
  if (end && !sameDay(start, end)) {
    return start.getMonth() === end.getMonth()
      ? `${start.getDate()}-${end.getDate()} ${MONTHS[start.getMonth()]}`
      : `${monthDay(start)} - ${monthDay(end)}`;
  }
  return monthDay(start);
}

const ROTATE_MS = 6500;

interface Spot {
  event: ClubEvent;
  phase: EventPhase;
}

/** On now first, then coming up; the pinned bulletin last; nothing ended. */
function useSpotlight(): {
  spots: Spot[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  now: Date | null;
} {
  const now = useNow();
  const events = useEvents();
  const spots = useMemo<Spot[]>(() => {
    if (!now || !events.data) return [];
    const rank = (e: ClubEvent) =>
      e.club_name === PINNED_CLUB
        ? 2
        : eventPhase(e, now) === "ongoing"
          ? 0
          : 1;
    return events.data
      .filter(
        (e) => e.club_name === PINNED_CLUB || eventPhase(e, now) !== "past",
      )
      .sort(
        (a, b) =>
          rank(a) - rank(b) ||
          (parseEventDates(a.dates).start?.getTime() ?? 0) -
            (parseEventDates(b.dates).start?.getTime() ?? 0),
      )
      .map((event) => ({ event, phase: eventPhase(event, now) }));
  }, [events.data, now]);
  return {
    spots,
    loading: events.isLoading || !now,
    error: events.error,
    refetch: () => void events.refetch(),
    now,
  };
}

/** The attendance card, only when the spotlight has taken its place in the hero. */
export function AttendanceCardWhenEvents() {
  const { spots, loading } = useSpotlight();
  if (loading || spots.length === 0) return null;
  return <AttendanceCard />;
}

/**
 * The hero's right tile when clubs have posted something: one event at a
 * time, poster edge to edge, title and date at the foot, quietly turning
 * through what's on. Tap for the details. With nothing on, the attendance
 * card keeps its place.
 */
export function EventSpotlight() {
  const { spots, loading, now } = useSpotlight();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ClubEvent | null>(null);
  const count = spots.length;
  const active = count ? spots[index % count] : null;

  useEffect(() => {
    if (count < 2 || paused || selectedEvent) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(
      () => setIndex((i) => (i + 1) % count),
      ROTATE_MS,
    );
    return () => window.clearInterval(timer);
  }, [count, paused, selectedEvent]);

  if (loading)
    return (
      <div className="home-spotlight panel" data-skeleton="" aria-busy="true" />
    );
  if (!active || !now) return <AttendanceCard />;

  const pinned = active.event.club_name === PINNED_CLUB;
  const onNow = spots.filter(
    (s) => s.phase === "ongoing" && s.event.club_name !== PINNED_CLUB,
  ).length;

  return (
    <section
      className="home-spotlight panel"
      aria-label="Campus events"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="home-spotlight-top">
        <span className="home-widget-heading">
          <span>
            On campus
            {onNow > 0 && (
              <>
                {" · "}
                <i aria-hidden className="live-dot" /> {onNow} on now
              </>
            )}
          </span>
        </span>
        <Link href={STUDENT_ROUTES.events} aria-label="Explore all events">
          <ArrowUpRight aria-hidden className="size-4" />
        </Link>
      </div>

      <button
        type="button"
        className="home-spotlight-body"
        onClick={() => setSelectedEvent(active.event)}
        aria-label={`${active.event.title}. View details`}
      >
        {/* The banner window is the 2:1 template clubs are given; any shape
            fits inside it whole, on a blurred copy of itself. */}
        <span
          key={`art-${active.event.id}`}
          className="home-spotlight-art"
          aria-hidden
        >
          {active.event.banner_url ? (
            <>
              <Image
                src={active.event.banner_url}
                alt=""
                fill
                unoptimized
                sizes="40vw"
                className="home-spotlight-backdrop"
              />
              <Image
                src={active.event.banner_url}
                alt=""
                fill
                unoptimized
                sizes="40vw"
                className="home-spotlight-poster"
              />
            </>
          ) : (
            <CalendarDays className="size-8" />
          )}
        </span>
        <span className="home-spotlight-kicker">
          {pinned
            ? "Campus bulletin"
            : active.phase === "ongoing"
              ? "Happening now"
              : "Coming up"}
        </span>
        <strong key={`title-${active.event.id}`}>{active.event.title}</strong>
        <span className="home-spotlight-when">
          {pinned
            ? "From The Campus Web"
            : when(active.event, active.phase, now)}
          {active.event.timing &&
            !pinned &&
            ` · ${active.event.timing.replace(/\s+to\s+/i, " - ")}`}
        </span>
      </button>

      {count > 1 && (
        <div className="home-spotlight-dots" role="tablist" aria-label="Events">
          {spots.map((spot, i) => (
            <button
              key={spot.event.id}
              type="button"
              role="tab"
              aria-selected={i === index % count}
              aria-label={spot.event.title}
              onClick={() => setIndex(i)}
            >
              <i style={{ animationDuration: `${ROTATE_MS}ms` }} />
            </button>
          ))}
        </div>
      )}
      <Dialog
        open={!!selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
      >
        {selectedEvent && (
          <DialogContent className="discovery-event-dialog w-[95vw] sm:max-w-2xl lg:max-w-5xl panel bg-surface-low !p-0 overflow-hidden flex flex-col lg:flex-row max-h-[90vh] lg:h-[min(600px,85dvh)] gap-0 border border-outline-variant/20 shadow-2xl sm:rounded-[24px]">
            <DialogHeader className="sr-only">
              <DialogTitle>{selectedEvent.title}</DialogTitle>
              <DialogDescription>
                Details for {selectedEvent.title}
              </DialogDescription>
            </DialogHeader>

            <div className="relative w-full aspect-video sm:aspect-[21/9] lg:aspect-auto lg:w-1/2 lg:h-full shrink-0 bg-surface-lowest border-b lg:border-b-0 lg:border-r border-outline-variant/20 flex items-center justify-center">
              {selectedEvent.banner_url ? (
                <Image
                  src={selectedEvent.banner_url}
                  unoptimized
                  width={1000}
                  height={1000}
                  alt={selectedEvent.title}
                  className="absolute inset-0 w-full h-full object-contain"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-cta">
                  <span className="px-6 text-center text-h2 font-black text-on-primary">
                    {selectedEvent.title}
                  </span>
                </div>
              )}
            </div>

            <div className="p-5 sm:p-8 overflow-y-auto flex flex-col gap-6 lg:w-1/2 lg:h-full">
              <div className="flex items-start gap-4">
                {selectedEvent.logo && (
                  <div className="shrink-0 size-12 sm:size-16 rounded-full bg-surface-lowest flex items-center justify-center p-2 shadow-inner border border-outline-variant/30 mt-1">
                    <Image
                      src={selectedEvent.logo}
                      unoptimized
                      alt={selectedEvent.club_name}
                      width={48}
                      height={48}
                      className="object-contain max-h-full rounded-full"
                    />
                  </div>
                )}
                <div className="flex flex-col">
                  <h3 className="text-xl sm:text-2xl font-black text-on-surface leading-tight mb-1.5">
                    {selectedEvent.title}
                  </h3>
                  <p className="text-sm font-bold text-primary-accent">
                    {selectedEvent.club_name}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface/50 border border-outline-variant/10 shadow-sm">
                  <div className="p-2.5 rounded-full bg-surface-highest/50">
                    <CalendarDays className="size-5 text-secondary-accent" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-on-surface-muted font-bold uppercase tracking-widest mb-0.5">
                      Dates
                    </span>
                    <span className="text-sm font-bold text-on-surface">
                      {selectedEvent.dates || "TBA"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface/50 border border-outline-variant/10 shadow-sm">
                  <div className="p-2.5 rounded-full bg-surface-highest/50">
                    <Clock className="size-5 text-secondary-accent" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-on-surface-muted font-bold uppercase tracking-widest mb-0.5">
                      Timing
                    </span>
                    <span className="text-sm font-bold text-on-surface">
                      {selectedEvent.timing || "TBA"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedEvent.ods_provided && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-success-accent text-xs font-bold border border-emerald-500/20">
                    <CheckCircle className="size-3.5" /> OD provided
                  </span>
                )}
                {selectedEvent.refreshments_provided && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-warning-accent text-xs font-bold border border-amber-500/20">
                    <Coffee className="size-3.5" /> Refreshments
                  </span>
                )}
                {selectedEvent.labels?.filter(Boolean).map((label, i) => (
                  <span
                    key={i}
                    className="inline-flex px-3 py-1.5 rounded-full bg-surface-highest/50 text-on-surface-muted text-xs font-bold border border-outline-variant/20"
                  >
                    {label}
                  </span>
                ))}
              </div>

              {selectedEvent.website_link && (
                <div className="mt-2">
                  <a
                    href={selectedEvent.website_link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-full items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-primary text-on-primary font-black shadow-lg hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                  >
                    Register / More Info <ExternalLink className="size-4" />
                  </a>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </section>
  );
}
