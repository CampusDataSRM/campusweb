"use client";

import { Search, UsersRound } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";

import { ClubCard } from "@/components/clubs/club-card";
import {
  CachedBadge,
  EmptyState,
  ErrorState,
  ShimmerBlock,
} from "@/components/feedback/data-states";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { Input } from "@/components/ui/input";
import { useLikeActions } from "@/hooks/use-like-actions";
import { useClubs, useProfile } from "@/hooks/use-student-data";

/** Verified clubs, most popular first, searchable by name, purpose or label. */
export function ClubsView() {
  const clubs = useClubs();
  const profile = useProfile();
  const reg = profile.data?.registrationNumber;
  const { canLike, likeClub } = useLikeActions(reg);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "recruiting">("all");
  const deferred = useDeferredValue(query).trim().toLowerCase();

  const list = useMemo(
    () =>
      (clubs.data ?? [])
        .filter(
          (club) => club.verified && (filter === "all" || club.isRecruiting),
        )
        .filter(
          (club) =>
            !deferred ||
            [club.name, club.description, ...(club.labels ?? [])].some((v) =>
              v?.toLowerCase().includes(deferred),
            ),
        )
        .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0)),
    [clubs.data, deferred, filter],
  );

  return (
    <div className="campus-view clubs-page flex flex-col gap-6">
      <PageHeader
        title="Clubs"
        status={
          <CachedBadge savedAt={clubs.savedAt} refreshing={clubs.isFetching} />
        }
        description="Find your people on campus."
      />
      <div className="campus-toolbar">
        <div className="relative w-full sm:max-w-md">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-on-surface-subtle"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clubs"
            aria-label="Search clubs"
            className="h-11 rounded-xl bg-surface-container pl-10 sm:max-w-md"
          />
        </div>
        <Segmented
          label="Club status"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All clubs" },
            { value: "recruiting", label: "Recruiting" },
          ]}
        />
      </div>
      {clubs.data && (
        <p className="campus-caption" aria-live="polite">
          {list.length} {list.length === 1 ? "club" : "clubs"} to discover
        </p>
      )}
      {clubs.isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <ShimmerBlock key={i} className="h-56" />
          ))}
        </div>
      ) : !clubs.data ? (
        <ErrorState
          error={clubs.error}
          title="Couldn't load clubs"
          onRetry={() => void clubs.refetch()}
          retrying={clubs.isFetching}
        />
      ) : list.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title={query ? "No matching clubs" : "No clubs yet"}
          description={
            query ? "Try another search." : "Clubs appear here once they join."
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
          {list.map((club) => (
            <ClubCard
              key={club.id}
              club={club}
              registrationNumber={reg}
              canLike={canLike}
              onLike={(id, action) => likeClub({ id, action })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
