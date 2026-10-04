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

/** Sort events: active (ongoing/upcoming) first, then past. Within groups, sort by closest end date. */
export function sortEvents(events: readonly ClubEvent[], today: Date): ClubEvent[] {
  const nowMs = today.getTime();
  return [...events].sort((a, b) => {
    // 1. Prioritize active events over past events
    const phaseA = eventPhase(a, today);
    const phaseB = eventPhase(b, today);
    const isPastA = phaseA === "past";
    const isPastB = phaseB === "past";
    
    if (isPastA !== isPastB) {
      return isPastA ? 1 : -1;
    }
    
    // 2. Sort by absolute distance to today's date for end date
    const datesA = parseEventDates(a.dates);
    const datesB = parseEventDates(b.dates);
    
    const endA = datesA.end?.getTime() ?? 0;
    const endB = datesB.end?.getTime() ?? 0;
    const diffEndA = Math.abs(endA - nowMs);
    const diffEndB = Math.abs(endB - nowMs);
    
    if (diffEndA !== diffEndB) return diffEndA - diffEndB;
    
    // 3. If end dates are equally close, sort by absolute distance for start date
    const startA = datesA.start?.getTime() ?? 0;
    const startB = datesB.start?.getTime() ?? 0;
    const diffStartA = Math.abs(startA - nowMs);
    const diffStartB = Math.abs(startB - nowMs);
    
    return diffStartA - diffStartB;
  });
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
