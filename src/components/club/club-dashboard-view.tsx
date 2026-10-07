"use client";

import { CalendarPlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import CountUp from "@/components/CountUp";
import {
  EmptyState,
  ErrorState,
  ShimmerBlock,
} from "@/components/feedback/data-states";
import { ClubEventCard, type ClubEventPhase } from "@/components/club/club-event-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ROUTES } from "@/constants/auth";
import { useClubEvents, useDeleteEvent } from "@/hooks/use-club";
import { parseEventDates } from "@/lib/student/events";
import type { ClubEmbeddedEvent } from "@/network-calls/types";

/** Phase of an embedded event - the same rule the student wall uses. */
function embeddedPhase(event: ClubEmbeddedEvent, today: Date): ClubEventPhase {
  const { start, end } = parseEventDates(event.dates);
  const day = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (end && end < day) return "past";
  if (start && start > day) return "upcoming";
  return "live";
}

interface Group {
  title: string;
  items: ClubEmbeddedEvent[];
}

/** The club's events, grouped the way the club thinks about them. */
export function ClubDashboardView() {
  const events = useClubEvents();
  const deleteEvent = useDeleteEvent();
  const [pending, setPending] = useState<ClubEmbeddedEvent | null>(null);

  const club = events.data?.club;
  const list = useMemo(() => events.data?.events ?? [], [events.data]);

  const groups = useMemo<Group[]>(() => {
    const today = new Date();
    const live: ClubEmbeddedEvent[] = [];
    const upcoming: ClubEmbeddedEvent[] = [];
    const past: ClubEmbeddedEvent[] = [];
    for (const event of list) {
      switch (embeddedPhase(event, today)) {
        case "live":
          live.push(event);
          break;
        case "upcoming":
          upcoming.push(event);
          break;
        case "past":
          past.push(event);
          break;
      }
    }
    // Coming up: soonest first. Earlier: most recent first.
    upcoming.sort(
      (a, b) =>
        (parseEventDates(a.dates).start?.getTime() ?? Infinity) -
        (parseEventDates(b.dates).start?.getTime() ?? Infinity),
    );
    past.sort(
      (a, b) =>
        (parseEventDates(b.dates).start?.getTime() ?? 0) -
        (parseEventDates(a.dates).start?.getTime() ?? 0),
    );
    return [
      { title: "Live now", items: live },
      { title: "Coming up", items: upcoming },
      { title: "Earlier", items: past },
    ].filter((group) => group.items.length > 0);
  }, [list]);

  const stats = [
    {
      label: "Live now",
      value: groups.find((g) => g.title === "Live now")?.items.length ?? 0,
    },
    {
      label: "Event Likes",
      value: list.reduce((sum, event) => sum + (event.popularity ?? 0), 0),
    },
    {
      label: "Club Followers",
      value: club?.popularity ?? 0,
    },
    { label: "Published", value: list.length },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* The club itself leads the page. */}
      <section className="relative overflow-hidden rounded-3xl panel panel-raised p-5 sm:p-7">
        <div className="aurora" aria-hidden />
        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center">
          <span className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-surface-container text-on-surface-muted sm:size-20">
            {club?.logo ? (
              <Image
                src={club.logo}
                alt=""
                width={80}
                height={80}
                unoptimized
                className="size-full object-cover"
              />
            ) : (
              <span className="font-heading text-h2 font-extrabold text-primary-accent">
                {club?.name?.trim()?.[0]?.toUpperCase() ?? "C"}
              </span>
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-h2 font-bold text-on-surface">
                {club?.name ?? "Your club"}
              </h1>
              {club &&
                (club.verified ? (
                  <span className="rounded-full bg-success-container px-2.5 py-1 text-xs font-extrabold text-on-success-container">
                    Verified
                  </span>
                ) : (
                  <span className="rounded-full bg-warning-container px-2.5 py-1 text-xs font-extrabold text-on-warning-container">
                    Awaiting verification
                  </span>
                ))}
              {club?.isRecruiting && (
                <span className="rounded-full bg-secondary-container px-2.5 py-1 text-xs font-extrabold text-on-secondary-container">
                  Recruiting
                </span>
              )}
            </div>
            {club?.description && (
              <p className="mt-1.5 line-clamp-2 max-w-prose text-sm text-on-surface-muted">
                {club.description}
              </p>
            )}
          </div>
          <Button
            size="touch"
            render={<Link href={`${ROUTES.club}/events/new`} />}
            nativeButton={false}
            className="shrink-0"
          >
            <CalendarPlus aria-hidden /> New event
          </Button>
        </div>

        <dl className="relative z-10 mt-6 grid grid-cols-2 gap-4 border-t border-outline-variant pt-5 sm:grid-cols-4">
          {stats.map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-1">
              <dt className="text-xs font-bold text-on-surface-muted">
                {label}
              </dt>
              <dd className="text-stat font-bold text-on-surface">
                <CountUp to={value} duration={1.2} className="tabular" />
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {events.isPending ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }, (_, i) => (
            <ShimmerBlock key={i} className="h-72" />
          ))}
        </div>
      ) : events.error ? (
        <ErrorState
          error={events.error}
          title="Couldn't load your events"
          onRetry={() => void events.refetch()}
        />
      ) : list.length === 0 ? (
        <EmptyState
          icon={CalendarPlus}
          title="No events yet"
          description="Post your first event - it shows up for every student on campus."
          action={
            <Button
              size="touch"
              render={<Link href={`${ROUTES.club}/events/new`} />}
              nativeButton={false}
            >
              <CalendarPlus aria-hidden /> Post an event
            </Button>
          }
        />
      ) : (
        groups.map((group) => (
          <section key={group.title} aria-label={group.title} className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <h2 className="text-h3 font-bold text-on-surface">
                {group.title}
              </h2>
              <span className="rounded-full bg-surface-highest px-2 py-0.5 text-xs font-bold text-on-surface-muted">
                {group.items.length}
              </span>
            </div>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((event) => (
                <li key={event.ID}>
                  <ClubEventCard
                    title={event.title}
                    bannerUrl={event.banner_url}
                    dates={event.dates}
                    timing={event.timing}
                    labels={event.labels}
                    odsProvided={event.ods_provided}
                    refreshmentsProvided={event.refreshments_provided}
                    popularity={event.popularity}
                    websiteLink={event.website_link}
                    phase={embeddedPhase(event, new Date())}
                    onDelete={() => setPending(event)}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}

      <Dialog
        open={pending !== null}
        onOpenChange={(open) => !open && setPending(null)}
      >
        <DialogContent className="border-outline-variant bg-surface-modal">
          <DialogHeader>
            <DialogTitle className="font-heading text-on-surface">
              Delete this event?
            </DialogTitle>
            <DialogDescription className="text-on-surface-muted">
              &quot;{pending?.title}&quot; will be removed for every student.
              This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" size="touch" />}>
              Keep it
            </DialogClose>
            <Button
              size="touch"
              className="bg-danger text-on-danger hover:bg-danger/90"
              disabled={deleteEvent.isPending}
              onClick={() =>
                pending &&
                deleteEvent.mutate(pending.ID, {
                  onSettled: () => setPending(null),
                })
              }
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
