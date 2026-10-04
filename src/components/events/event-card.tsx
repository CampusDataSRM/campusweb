"use client";

import {
  CalendarDays,
  Clock3,
  ExternalLink,
  Heart,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  cleanLabels,
  eventPhase,
  isLikedBy,
  parseEventDates,
} from "@/lib/student/events";
import { cn } from "@/lib/utils";
import type { ClubEvent } from "@/network-calls/types";

const dayFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
});

function dateRange(dates: string): string {
  const { start, end } = parseEventDates(dates);
  if (!start) return dates;
  if (!end || end.getTime() === start.getTime()) return dayFormat.format(start);
  return `${dayFormat.format(start)} - ${dayFormat.format(end)}`;
}

export interface EventCardProps {
  event: ClubEvent;
  today: Date;
  registrationNumber?: string;
  canLike: boolean;
  onLike?: (id: string, action: "like" | "unlike") => void;
  compact?: boolean;
}

/** One event: banner, club, when, perks, and register / like actions. */
export function EventCard({
  event,
  today,
  registrationNumber,
  canLike,
  onLike,
  compact,
}: EventCardProps) {
  const liked = isLikedBy(event.likedby, registrationNumber);
  const phase = eventPhase(event, today);
  const labels = cleanLabels(event.labels);

  return (
    <article className="campus-event-card group flex h-full flex-col overflow-hidden rounded-3xl panel spotlight">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-lowest">
        {event.banner_url ? (
          <>
            {/* The poster whole, on a blurred copy of itself - never cropped. */}
            <Image
              src={event.banner_url}
              alt=""
              fill
              unoptimized
              sizes="20vw"
              className="scale-125 object-cover opacity-45 blur-2xl"
            />
            <Image
              src={event.banner_url}
              alt=""
              fill
              unoptimized
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-contain transition-transform duration-(--duration-long) ease-(--ease-standard) group-hover:scale-[1.03]"
            />
          </>
        ) : (
          <div className="flex h-full items-center justify-center bg-primary-container">
            <span className="font-heading text-h2 font-extrabold text-on-primary-container/70">
              {event.club_name?.trim()?.[0]?.toUpperCase() ?? "#"}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex items-center gap-2.5">
          {event.logo ? (
            <Image
              src={event.logo}
              alt=""
              width={28}
              height={28}
              unoptimized
              className="size-7 rounded-lg object-cover"
            />
          ) : (
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
              <Sparkles aria-hidden className="size-4" />
            </span>
          )}
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-on-surface-muted">
            {event.club_name}
          </span>
          {phase === "ongoing" && (
            <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-success-container px-2.5 py-1 text-xs font-extrabold text-on-success-container">
              <span aria-hidden className="live-dot text-success-accent" /> Live
            </span>
          )}
        </div>

        <h3 className="line-clamp-2 font-heading text-lg font-bold text-on-surface">
          {event.title}
        </h3>

        <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-on-surface-muted">
          <li className="flex items-center gap-1.5">
            <CalendarDays aria-hidden className="size-4 text-primary-accent" />
            {dateRange(event.dates)}
          </li>
          {event.timing && (
            <li className="flex items-center gap-1.5">
              <Clock3 aria-hidden className="size-4 text-primary-accent" />
              {event.timing.replace(/\s+to\s+/i, " - ")}
            </li>
          )}
        </ul>

        {!compact &&
          (event.ods_provided ||
            event.refreshments_provided ||
            labels.length > 0) && (
            <div className="flex flex-wrap gap-1.5">
              {event.ods_provided && (
                <Badge
                  variant="outline"
                  className="rounded-full border-success/50 text-success-accent"
                >
                  OD provided
                </Badge>
              )}
              {event.refreshments_provided && (
                <Badge
                  variant="outline"
                  className="rounded-full border-warning/50 text-warning-accent"
                >
                  <UtensilsCrossed aria-hidden className="size-3" />{" "}
                  Refreshments
                </Badge>
              )}
              {labels.map((label) => (
                <Badge
                  key={label}
                  variant="outline"
                  className="rounded-full border-outline-variant text-on-surface-muted"
                >
                  #{label}
                </Badge>
              ))}
            </div>
          )}

        <div className="mt-auto">
          <div className="mt-auto flex items-center gap-2 pt-1">
            {event.website_link && (
              <Button
                size="touch"
                className="flex-1"
                render={
                  <a
                    href={event.website_link}
                    target="_blank"
                    rel="noreferrer"
                  />
                }
                nativeButton={false}
              >
                Register <ExternalLink aria-hidden />
              </Button>
            )}
            <Button
              variant={liked ? "tonal" : "outline"}
              size="touch"
              disabled={!canLike}
              onClick={() => onLike?.(event.id, liked ? "unlike" : "like")}
              aria-pressed={liked}
              aria-label={`${liked ? "Unlike" : "Like"} ${event.title}, ${event.popularity ?? 0} likes`}
              title={canLike ? undefined : "Sign in to like events"}
              className={cn(!event.website_link && "flex-1")}
            >
              <Heart aria-hidden className={cn(liked && "fill-current")} />
              <span className="tabular">{event.popularity ?? 0}</span>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
