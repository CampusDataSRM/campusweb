"use client";

import { Search, Sparkles } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";

import { EventCard } from "@/components/events/event-card";
import { CachedBadge, EmptyState, ErrorState, ShimmerBlock } from "@/components/feedback/data-states";
import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useLikeActions } from "@/hooks/use-like-actions";
import { useNow } from "@/hooks/use-now";
import { useEvents, useProfile } from "@/hooks/use-student-data";
import { eventPhase, matchesEventQuery, PINNED_CLUB, visibleEvents } from "@/lib/student/events";

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
        (filter === "all" || event.club_name === PINNED_CLUB || eventPhase(event, now) === filter),
    );
  }, [events.data, now, deferredQuery, filter]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Events" status={<CachedBadge savedAt={events.savedAt} refreshing={events.isFetching} />} description="What's happening across campus clubs." />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-on-surface-subtle" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search events, clubs or tags"
            aria-label="Search events"
            className="h-11 rounded-xl bg-surface-container pl-10"
          />
        </div>
        <ToggleGroup value={[filter]} onValueChange={(v) => v[0] && setFilter(v[0] as Filter)} className="rounded-xl border border-outline-variant bg-surface-container p-1">
          {FILTERS.map((item) => (
            <ToggleGroupItem key={item.id} value={item.id} className="h-9 rounded-lg px-3 text-sm font-semibold data-[pressed]:bg-primary data-[pressed]:text-on-primary">
              {item.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {events.isLoading || !now ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => <ShimmerBlock key={i} className="h-80" />)}
        </div>
      ) : !events.data ? (
        <ErrorState error={events.error} title="Couldn't load events" onRetry={() => void events.refetch()} retrying={events.isFetching} />
      ) : list.length === 0 ? (
        <EmptyState icon={Sparkles} title={query ? "No matching events" : "No events to show"} description={query ? "Try another search." : "New events appear here as clubs post them."} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((event) => (
            <EventCard key={event.id} event={event} today={now} registrationNumber={reg} canLike={canLike} onLike={(id, action) => likeEvent({ id, action })} />
          ))}
        </div>
      )}
    </div>
  );
}
