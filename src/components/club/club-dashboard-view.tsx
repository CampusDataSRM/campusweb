"use client";

import {
  CalendarDays,
  CalendarPlus,
  Clock3,
  Heart,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import {
  EmptyState,
  ErrorState,
  ShimmerBlock,
} from "@/components/feedback/data-states";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
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
import { cleanLabels, parseEventDates } from "@/lib/student/events";
import type { ClubEmbeddedEvent } from "@/network-calls/types";

const dayFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function when(dates: string) {
  const { start, end } = parseEventDates(dates);
  if (!start) return dates;
  return end && end.getTime() !== start.getTime()
    ? `${dayFormat.format(start)} - ${dayFormat.format(end)}`
    : dayFormat.format(start);
}

/** The club's events, newest first, with delete behind a confirmation. */
export function ClubDashboardView() {
  const events = useClubEvents();
  const deleteEvent = useDeleteEvent();
  const [pending, setPending] = useState<ClubEmbeddedEvent | null>(null);
  const club = events.data?.club;
  const list = [...(events.data?.events ?? [])].sort((a, b) =>
    (b.CreatedAt ?? "").localeCompare(a.CreatedAt ?? ""),
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={club?.name ?? "Your events"}
        description={
          club
            ? club.verified
              ? "Verified - students can see your club and events."
              : "Awaiting verification - students will see you once verified."
            : undefined
        }
        actions={
          <Button
            size="touch"
            render={<Link href={`${ROUTES.club}/events/new`} />}
            nativeButton={false}
          >
            <CalendarPlus aria-hidden /> New event
          </Button>
        }
      />
      {events.isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <ShimmerBlock key={i} className="h-32" />
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
        />
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {list.map((event) => (
            <li
              key={event.ID}
              className="campus-organizer-event flex gap-4 rounded-3xl panel p-4"
            >
              <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-surface-highest">
                {event.banner_url && (
                  <Image
                    src={event.banner_url}
                    alt=""
                    fill
                    unoptimized
                    sizes="96px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <h3 className="line-clamp-2 font-heading font-bold text-on-surface">
                  {event.title}
                </h3>
                <p className="flex items-center gap-1.5 text-sm text-on-surface-muted">
                  <CalendarDays aria-hidden className="size-4" />
                  {when(event.dates)}
                </p>
                {event.timing && (
                  <p className="flex items-center gap-1.5 text-sm text-on-surface-muted">
                    <Clock3 aria-hidden className="size-4" />
                    {event.timing.replace(/\s+to\s+/i, " - ")}
                  </p>
                )}
                <div className="mt-auto flex flex-wrap items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className="rounded-full border-outline-variant text-on-surface-muted"
                  >
                    <Heart aria-hidden className="size-3" />{" "}
                    {event.popularity ?? 0}
                  </Badge>
                  {cleanLabels(event.labels).map((label) => (
                    <Badge
                      key={label}
                      variant="outline"
                      className="h-auto max-w-full whitespace-normal break-words rounded-md border-outline-variant text-on-surface-muted"
                    >
                      #{label}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon-touch"
                aria-label={`Delete ${event.title}`}
                onClick={() => setPending(event)}
                className="text-on-surface-muted hover:text-danger-accent"
              >
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
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
              <Trash2 aria-hidden /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
