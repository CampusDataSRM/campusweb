"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { Section } from "@/components/layout/page-header";
import { STUDENT_ROUTES } from "@/constants/routes";
import { useNow } from "@/hooks/use-now";
import { useEvents } from "@/hooks/use-student-data";
import { visibleEvents } from "@/lib/student/events";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 4500;
const MAX_SLIDES = 6;

/**
 * Campus App's events carousel: one banner at a time, auto-advancing.
 * Pauses on hover/focus and never auto-plays under reduced motion.
 */
export function EventsCarousel() {
  const now = useNow();
  const events = useEvents();
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const slides = useMemo(() => (now ? visibleEvents(events.data ?? [], now).slice(0, MAX_SLIDES) : []), [events.data, now]);

  useEffect(() => {
    if (paused || slides.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [paused, slides.length]);

  useEffect(() => {
    const el = track.current;
    if (el) el.scrollTo({ left: el.clientWidth * index, behavior: "smooth" });
  }, [index]);

  if (slides.length === 0) return null;

  return (
    <Section title="Events" action={<Link href={STUDENT_ROUTES.events} className="text-sm font-bold text-primary-accent hover:underline">More events</Link>}>
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        className="relative"
      >
        <div
          ref={track}
          onScroll={(e) => {
            const el = e.currentTarget;
            const i = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
            if (i !== index) setIndex(i);
          }}
          className="flex snap-x snap-mandatory overflow-x-auto rounded-[1.25rem] [scrollbar-width:none]"
          aria-roledescription="carousel"
        >
          {slides.map((event, i) => (
            <Link
              key={event.id}
              href={STUDENT_ROUTES.events}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${slides.length}: ${event.title}`}
              className="relative aspect-[21/9] w-full shrink-0 snap-start overflow-hidden bg-surface-container sm:aspect-[3/1]"
            >
              {event.banner_url ? (
                <Image src={event.banner_url} alt="" fill unoptimized sizes="(min-width: 1024px) 70vw, 100vw" className="object-cover" priority={i === 0} />
              ) : (
                <div className="absolute inset-0 bg-cta opacity-60" />
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-surface-lowest/85 to-transparent p-4 pt-12">
                <p className="text-lg font-extrabold text-on-surface">{event.title}</p>
                <p className="text-sm font-semibold text-on-surface-muted">{event.club_name}</p>
              </div>
            </Link>
          ))}
        </div>
        {slides.length > 1 && (
          <div className="mt-3 flex justify-center gap-1.5">
            {slides.map((event, i) => (
              <button
                key={event.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show event ${i + 1}`}
                aria-current={i === index}
                className={cn("h-1.5 rounded-full transition-all", i === index ? "w-6 bg-primary-accent" : "w-1.5 bg-surface-bright")}
              />
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
