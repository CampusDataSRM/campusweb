"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";

import { ShimmerBlock } from "@/components/feedback/data-states";
import { eventPhase, PINNED_CLUB } from "@/lib/student/events";
import { fetchAllClubs } from "@/network-calls/getAllClubs";
import { fetchAllEvents } from "@/network-calls/getAllEvents";
import { queryKeys } from "@/network-calls/query-keys";

/** Public catalogue numbers, fresh enough for a sign-in screen. */
const CATALOGUE_STALE_MS = 15 * 60 * 1000;

/**
 * The auth stage's live strip: what's actually on campus right now, from the
 * public endpoints. Pure decoration - any failure renders nothing.
 */
export function ClubAuthLive() {
  const events = useQuery({
    queryKey: queryKeys.events.all,
    queryFn: () => fetchAllEvents(),
    staleTime: CATALOGUE_STALE_MS,
  });
  const clubs = useQuery({
    queryKey: queryKeys.clubs.all,
    queryFn: () => fetchAllClubs(),
    staleTime: CATALOGUE_STALE_MS,
  });

  if (events.isPending) {
    return (
      <div className="relative z-10 rounded-3xl panel p-5">
        <ShimmerBlock className="h-12" />
      </div>
    );
  }
  if (events.isError || !events.data) return null;

  const allClubs = clubs.data?.data.clubs ?? [];
  const logos = [...allClubs]
    .filter((club) => club.logo)
    .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));

  return (
    <div className="relative z-10 flex flex-col gap-4 rounded-3xl panel p-5">
      <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-on-surface">
        <span aria-hidden className="live-dot text-success-accent" />
        72 clubs live on Campus Web
      </p>
      {logos.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex h-9 flex-wrap -space-x-2 overflow-hidden">
            {logos.map((club) => (
              <Image
                key={club.id}
                src={club.logo}
                alt=""
                width={36}
                height={36}
                unoptimized
                className="size-9 shrink-0 rounded-full border-2 border-surface object-cover"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
