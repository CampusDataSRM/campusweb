"use client";

import { Search, Sparkles, X } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";

import { EventCard } from "@/components/events/event-card";
import {
  CachedBadge,
  EmptyState,
  ErrorState,
  ShimmerBlock,
} from "@/components/feedback/data-states";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { useLikeActions } from "@/hooks/use-like-actions";
import { useNow } from "@/hooks/use-now";
import { useEvents, useProfile } from "@/hooks/use-student-data";
import {
  eventPhase,
  matchesEventQuery,
  PINNED_CLUB,
  visibleEvents,
} from "@/lib/student/events";

type Filter = "upcoming" | "ongoing" | "all";
const FILTERS: ReadonlyArray<{ id: Filter; label: string }> = [
  { id: "all", label: "All" },
  { id: "ongoing", label: "Happening now" },
  { id: "upcoming", label: "Upcoming" },
];

export function EventsView() {
  const now = useNow();
  const events = useEvents();
  const profile = useProfile();
  const reg = profile.data?.registrationNumber;
  const { canLike, likeEvent } = useLikeActions(reg);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const deferredQuery = useDeferredValue(query);

  const list = useMemo(() => {
    if (!now) return [];
    return visibleEvents(events.data ?? [], now).filter(
      (event) =>
        matchesEventQuery(event, deferredQuery) &&
        (filter === "all" ||
          event.club_name === PINNED_CLUB ||
          eventPhase(event, now) === filter),
    );
  }, [events.data, now, deferredQuery, filter]);

  return (
    <div className="campus-view events-page flex flex-col gap-6">
      <PageHeader
        title="Events"
        status={
          <CachedBadge
            savedAt={events.savedAt}
            refreshing={events.isFetching}
          />
        }
        description="What's happening across campus clubs."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-on-surface-subtle"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search events, clubs or tags"
            aria-label="Search events"
            className="h-11 rounded-xl bg-surface-container pl-10 pr-11"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon-touch"
              aria-label="Clear event search"
              onClick={() => setQuery("")}
              className="absolute top-0 right-0"
            >
              <X />
            </Button>
          )}
        </div>
        <Segmented
          label="Show"
          value={filter}
          onChange={setFilter}
          options={FILTERS.map((item) => ({
            value: item.id,
            label: item.label,
          }))}
        />
      </div>

      {events.data && now && (
        <p className="campus-caption" aria-live="polite">
          {list.length} {list.length === 1 ? "event" : "events"} to explore
        </p>
      )}
      {events.isLoading || !now ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <ShimmerBlock key={i} className="h-80" />
          ))}
        </div>
      ) : !events.data ? (
        <ErrorState
          error={events.error}
          title="Couldn't load events"
          onRetry={() => void events.refetch()}
          retrying={events.isFetching}
        />
      ) : list.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title={query ? "No matching events" : "No events to show"}
          description={
            query
              ? "Try another search."
              : "New events appear here as clubs post them."
          }
          action={
            query || filter !== "all" ? (
              <Button
                variant="tonal"
                size="touch"
                onClick={() => {
                  setQuery("");
                  setFilter("all");
                }}
              >
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              today={now}
              registrationNumber={reg}
              canLike={canLike}
              onLike={(id, action) => likeEvent({ id, action })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
