"use client";

import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
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
const dateFormat = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" });

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
  const swipeStart = useRef<number | null>(null);
  const slides = useMemo(() => (now ? visibleEvents(events.data ?? [], now).slice(0, MAX_SLIDES) : []), [events.data, now]);
  const count = slides.length;

  useEffect(() => {
    if (paused || count < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [paused, count]);

  if (count === 0) return null;
  const go = (step: number) => setIndex((i) => (i + step + count) % count);
  const active = slides[index % count];
  const dates = parseEventDates(active.dates);

  return (
    <section
      aria-label="Events"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="glass flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-outline-variant"
    >
      <div
        className="relative aspect-[16/10] w-full touch-pan-y overflow-hidden bg-surface-lowest lg:aspect-auto lg:min-h-64 lg:flex-1"
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
            aria-hidden={i !== index}
            className={cn("absolute inset-0 transition-opacity duration-(--duration-long)", i === index ? "opacity-100" : "pointer-events-none opacity-0")}
          >
            {event.banner_url ? (
              <>
                <Image src={event.banner_url} alt="" fill unoptimized sizes="40vw" className="scale-125 object-cover opacity-50 blur-2xl" />
                <Image src={event.banner_url} alt={event.title} fill unoptimized sizes="(min-width: 1024px) 40vw, 100vw" className="object-contain" priority={i === 0} />
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-cta">
                <span className="px-6 text-center text-h2 font-black text-on-primary">{event.title}</span>
              </div>
            )}
          </div>
        ))}
        {count > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Previous event" className="glass absolute top-1/2 left-3 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-outline-variant text-on-surface sm:flex">
              <ChevronLeft className="size-5" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next event" className="glass absolute top-1/2 right-3 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-outline-variant text-on-surface sm:flex">
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      <Link href={STUDENT_ROUTES.events} className="flex flex-col gap-1 p-5 pb-3" aria-live="polite">
        <span className="text-xs font-bold text-secondary-accent">{active.club_name}</span>
        <span className="line-clamp-1 text-lg font-extrabold text-on-surface">{active.title}</span>
        {dates.start && (
          <span className="flex items-center gap-1.5 text-sm font-semibold text-on-surface-muted">
            <CalendarDays aria-hidden className="size-4" />
            {dateFormat.format(dates.start)}
            {dates.end && dates.end.getTime() !== dates.start.getTime() && ` to ${dateFormat.format(dates.end)}`}
          </span>
        )}
      </Link>

      <div className="flex items-center gap-1.5 px-5 pb-5">
        {count > 1 &&
          slides.map((event, i) => (
            <button
              key={event.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show event ${i + 1} of ${count}`}
              aria-current={i === index}
              className={cn("h-1.5 rounded-full transition-all duration-(--duration-medium)", i === index ? "w-6 bg-primary-accent" : "w-1.5 bg-surface-bright hover:bg-outline")}
            />
          ))}
        <Link href={STUDENT_ROUTES.events} className="ml-auto text-sm font-bold text-primary-accent hover:underline">
          All events
        </Link>
      </div>
    </section>
  );
}
