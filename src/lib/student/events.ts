/**
 * Event listing rules, as in Campus App: ended events drop off (except the
 * pinned "The Campus Web" announcements), most popular first.
 */

import type { ClubEvent } from "@/network-calls/types";

/** Pinned club whose posts never expire. */
export const PINNED_CLUB = "The Campus Web";

export interface EventDates {
  start: Date | null;
  end: Date | null;
}

/** "2025-11-05 to 2025-11-07", "2025-11-05 - 2025-11-07", or one date. */
export function parseEventDates(dates: string | undefined): EventDates {
  const [startRaw, endRaw] = (dates ?? "")
    .split(/\s+(?:to|-|–)\s+/i)
    .map((part) => part.trim());
  const parse = (value: string | undefined) => {
    if (!value) return null;
    const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(value);
    const date = iso
      ? new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]))
      : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };
  const start = parse(startRaw);
  return { start, end: parse(endRaw) ?? start };
}

export type EventPhase = "upcoming" | "ongoing" | "past";

export function eventPhase(event: ClubEvent, today: Date): EventPhase {
  const { start, end } = parseEventDates(event.dates);
  const day = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (end && end < day) return "past";
  if (start && start > day) return "upcoming";
  return "ongoing";
}

/** Current and upcoming events, pinned club always, most popular first. */
export function visibleEvents(events: readonly ClubEvent[], today: Date): ClubEvent[] {
  return events
    .filter(
      (event) => event.club_name === PINNED_CLUB || eventPhase(event, today) !== "past",
    )
    .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
}

export function matchesEventQuery(event: ClubEvent, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return [event.title, event.club_name, ...(event.labels ?? [])].some((value) =>
    value?.toLowerCase().includes(needle),
  );
}

export const isLikedBy = (likedBy: readonly string[] | undefined, reg: string | undefined) =>
  !!reg && (likedBy ?? []).includes(reg);

export const cleanLabels = (labels: readonly string[] | undefined) =>
  (labels ?? []).map((label) => label.trim()).filter(Boolean);
