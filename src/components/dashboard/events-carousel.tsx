"use client";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Clock,
  ExternalLink,
  CheckCircle,
  Coffee,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { STUDENT_ROUTES } from "@/constants/routes";
import { useNow } from "@/hooks/use-now";
import { useEvents } from "@/hooks/use-student-data";
import {
  parseEventDates,
  sortEvents,
  eventPhase,
  PINNED_CLUB,
} from "@/lib/student/events";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 3000;
const SWIPE_PX = 40;
const dateFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
});

/**
 * Event posters, one at a time and never cropped: the poster sits whole on a
 * blurred copy of itself. Crossfades on its own; pauses on hover/focus,
 * swipes on touch, and never auto-plays under reduced motion.
 */
export function EventsCarousel() {
  const now = useNow();
  const events = useEvents();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<(typeof slides)[0] | null>(
    null,
  );
  const swipeStart = useRef<number | null>(null);
  const slides = useMemo(() => {
    if (!now) return [];
    return sortEvents(events.data ?? [], now).filter(
      (e) => e.club_name === PINNED_CLUB || eventPhase(e, now) !== "past",
    );
  }, [events.data, now]);
  const count = slides.length;

  useEffect(() => {
    if (
      paused ||
      userPaused ||
      count < 2 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % count),
      AUTOPLAY_MS,
    );
    return () => clearInterval(timer);
  }, [paused, userPaused, count]);

  if (count === 0) return null;
  const go = (step: number) => setIndex((i) => (i + step + count) % count);
  const activeIndex = index % count;
  const active = slides[activeIndex];
  const dates = parseEventDates(active.dates);

  return (
    <section
      aria-label="Events"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="home-events h-full flex flex-col"
    >
      <div className="home-events-header shrink-0">
        <h2>Around campus</h2>
        <span>
          {count} {count === 1 ? "event" : "events"}
        </span>
      </div>
      <div
        className="home-events-poster flex-1 !aspect-auto"
        onPointerDown={(e) => (swipeStart.current = e.clientX)}
        onPointerUp={(e) => {
          if (swipeStart.current === null) return;
          const dx = e.clientX - swipeStart.current;
          swipeStart.current = null;
          if (Math.abs(dx) > SWIPE_PX) {
            go(dx < 0 ? 1 : -1);
          } else {
            setSelectedEvent(slides[activeIndex]);
          }
        }}
      >
        {slides.map((event, i) => (
          <div
            key={event.id}
            aria-hidden={i !== activeIndex}
            className={cn(
              "absolute inset-0 transition-opacity duration-(--duration-long)",
              i === activeIndex
                ? "opacity-100"
                : "pointer-events-none opacity-0",
            )}
          >
            {event.banner_url ? (
              <>
                <img
                  src={event.banner_url}
                  alt=""
                  className="absolute inset-0 w-full h-full scale-125 object-cover opacity-50 blur-2xl"
                />
                <img
                  src={event.banner_url}
                  alt={event.title}
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-cta">
                <span className="px-6 text-center text-h2 font-black text-on-primary">
                  {event.title}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <Link
        href={STUDENT_ROUTES.events}
        className="home-events-info shrink-0"
        aria-live={userPaused || paused ? "polite" : "off"}
      >
        <span className="text-xs font-bold text-secondary-accent">
          {active.club_name}
        </span>
        <strong>{active.title}</strong>
        {dates.start && (
          <span className="flex items-center gap-1.5 text-sm font-semibold text-on-surface-muted">
            <CalendarDays aria-hidden className="size-4" />
            {dateFormat.format(dates.start)}
            {dates.end &&
              dates.end.getTime() !== dates.start.getTime() &&
              ` to ${dateFormat.format(dates.end)}`}
          </span>
        )}
      </Link>

      <div className="home-events-controls shrink-0 mt-auto">
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous event"
            >
              <ChevronLeft aria-hidden className="size-4" />
            </button>
            <span>
              {activeIndex + 1} / {count}
            </span>
            <button type="button" onClick={() => go(1)} aria-label="Next event">
              <ChevronRight aria-hidden className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setUserPaused(!userPaused)}
              aria-label={
                userPaused ? "Resume event slideshow" : "Pause event slideshow"
              }
            >
              {userPaused ? (
                <Play aria-hidden className="size-4" />
              ) : (
                <Pause aria-hidden className="size-4" />
              )}
            </button>
          </>
        )}
        <Link
          href={STUDENT_ROUTES.events}
          className="ml-auto text-sm font-bold text-primary-accent hover:underline"
        >
          All events
        </Link>
      </div>

      <Dialog
        open={!!selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
      >
        {selectedEvent && (
          <DialogContent className="w-[95vw] sm:max-w-2xl lg:max-w-5xl panel !bg-[#09142A] !p-0 overflow-hidden flex flex-col lg:flex-row max-h-[90vh] lg:h-[75vh] gap-0 border border-outline-variant/20 shadow-2xl sm:rounded-[24px]">
            <DialogHeader className="sr-only">
              <DialogTitle>{selectedEvent.title}</DialogTitle>
              <DialogDescription>
                Details for {selectedEvent.title}
              </DialogDescription>
            </DialogHeader>

            <div className="relative w-full aspect-video sm:aspect-[21/9] lg:aspect-auto lg:w-1/2 lg:h-full shrink-0 bg-surface-lowest border-b lg:border-b-0 lg:border-r border-outline-variant/20 flex items-center justify-center">
              {selectedEvent.banner_url ? (
                <img
                  src={selectedEvent.banner_url}
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
                    <img
                      src={selectedEvent.logo}
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
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">
                    <CheckCircle className="size-3.5" /> ODS Provided
                  </span>
                )}
                {selectedEvent.refreshments_provided && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold border border-amber-500/20">
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
