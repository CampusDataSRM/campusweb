"use client";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { STUDENT_ROUTES } from "@/constants/routes";
import { useNow } from "@/hooks/use-now";
import { useEvents } from "@/hooks/use-student-data";
import { parseEventDates, visibleEvents } from "@/lib/student/events";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 5000;
const MAX_SLIDES = 6;
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
  const swipeStart = useRef<number | null>(null);
  const slides = useMemo(
    () =>
      now ? visibleEvents(events.data ?? [], now).slice(0, MAX_SLIDES) : [],
    [events.data, now],
  );
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
      className="home-events panel"
    >
      <div className="home-events-header">
        <h2>Around campus</h2>
        <span>
          {count} {count === 1 ? "event" : "events"}
        </span>
      </div>
      <div
        className="home-events-poster"
        onPointerDown={(e) => (swipeStart.current = e.clientX)}
        onPointerUp={(e) => {
          if (swipeStart.current === null) return;
          const dx = e.clientX - swipeStart.current;
          swipeStart.current = null;
          if (Math.abs(dx) > SWIPE_PX) go(dx < 0 ? 1 : -1);
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
                <Image
                  src={event.banner_url}
                  alt=""
                  fill
                  unoptimized
                  sizes="40vw"
                  className="scale-125 object-cover opacity-50 blur-2xl"
                />
                <Image
                  src={event.banner_url}
                  alt={event.title}
                  fill
                  unoptimized
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-contain"
                  priority={i === 0}
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
        className="home-events-info"
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

      <div className="home-events-controls">
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
    </section>
  );
}
