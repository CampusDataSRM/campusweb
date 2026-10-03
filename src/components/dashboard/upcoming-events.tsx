"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { EventCard } from "@/components/events/event-card";
import { Section } from "@/components/layout/page-header";
import { STUDENT_ROUTES } from "@/constants/routes";
import { useLikeActions } from "@/hooks/use-like-actions";
import { useNow } from "@/hooks/use-now";
import { useEvents, useProfile } from "@/hooks/use-student-data";
import { visibleEvents } from "@/lib/student/events";

const DASHBOARD_EVENT_COUNT = 6;

/** The next few events: a swipeable row on phones, a grid on desktop. */
export function UpcomingEvents() {
  const now = useNow();
  const events = useEvents();
  const profile = useProfile();
  const reg = profile.data?.registrationNumber;
  const { canLike, likeEvent } = useLikeActions(reg);

  const list = useMemo(
    () => (now ? visibleEvents(events.data ?? [], now).slice(0, DASHBOARD_EVENT_COUNT) : []),
    [events.data, now],
  );

  if (!now || list.length === 0) return null;

  return (
    <Section
      title="Events"
      action={
        <Link href={STUDENT_ROUTES.events} className="inline-flex items-center gap-1 text-sm font-semibold text-primary-accent hover:underline">
          All events <ArrowRight aria-hidden className="size-4" />
        </Link>
      }
    >
      <div className="-mx-page flex snap-x snap-mandatory gap-3 overflow-x-auto px-page pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
        {list.map((event) => (
          <div key={event.id} className="w-[82%] shrink-0 snap-start sm:w-auto">
            <EventCard
              event={event}
              today={now}
              registrationNumber={reg}
              canLike={canLike}
              onLike={(id, action) => likeEvent({ id, action })}
              compact
            />
          </div>
        ))}
      </div>
    </Section>
  );
}
