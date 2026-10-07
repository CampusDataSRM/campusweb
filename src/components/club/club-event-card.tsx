"use client";

import {
  CalendarDays,
  Clock3,
  ExternalLink,
  Heart,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cleanLabels, parseEventDates } from "@/lib/student/events";
import { cn } from "@/lib/utils";

export type ClubEventPhase = "live" | "upcoming" | "past" | "draft";

const dayFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** "5 Oct 2026" or "5 Oct 2026 - 7 Oct 2026"; "" when dates aren't set. */
export function whenLabel(dates: string): string {
  const { start, end } = parseEventDates(dates);
  if (!start) return "";
  return end && end.getTime() !== start.getTime()
    ? `${dayFormat.format(start)} - ${dayFormat.format(end)}`
    : dayFormat.format(start);
}

const PHASE_STYLE: Record<
  ClubEventPhase,
  { label: string; className: string }
> = {
  live: {
    label: "Live",
    className: "bg-success-container text-on-success-container",
  },
  upcoming: {
    label: "Coming up",
    className: "bg-primary-container text-on-primary-container",
  },
  past: {
    label: "Ended",
    className: "bg-surface-highest text-on-surface-muted",
  },
  draft: {
    label: "Draft",
    className: "bg-secondary-container text-on-secondary-container",
  },
};

export interface ClubEventCardProps {
  title: string;
  bannerUrl?: string | null;
  /** The banner is a local object URL (composer preview), not an API asset. */
  bannerLocal?: boolean;
  /** Raw "YYYY-MM-DD to YYYY-MM-DD" as the API stores it. */
  dates: string;
  timing?: string;
  labels?: readonly string[];
  odsProvided?: boolean;
  refreshmentsProvided?: boolean;
  popularity?: number;
  websiteLink?: string | null;
  phase: ClubEventPhase;
  /** Shown above the title (the composer preview names the club). */
  clubName?: string;
  clubLogo?: string;
  /** Replaces the poster's content entirely - the composer's dropzone. */
  poster?: ReactNode;
  onDelete?: () => void;
}

/**
 * One club event, presented the way students see it: the poster whole on a
 * blurred copy of itself, phase, perks, labels. Used by the dashboard and,
 * with `phase="draft"`, as the composer's live preview.
 */
export function ClubEventCard({
  title,
  bannerUrl,
  bannerLocal,
  dates,
  timing,
  labels,
  odsProvided,
  refreshmentsProvided,
  popularity,
  websiteLink,
  phase,
  clubName,
  clubLogo,
  poster,
  onDelete,
}: ClubEventCardProps) {
  const heading = (title || "").trim() || "Untitled event";
  const untitled = !(title || "").trim();
  const when = whenLabel(dates);
  const { label: phaseLabel, className: phaseClass } = PHASE_STYLE[phase];
  const initial = (clubName ?? heading).trim()?.[0]?.toUpperCase() ?? "#";

  return (
    <article className="club-event-card group flex h-full flex-col overflow-hidden rounded-3xl panel spotlight">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-lowest">
        {poster ??
          (bannerUrl ? (
            <>
              {/* The poster whole, on a blurred copy of itself - never cropped. */}
              {bannerLocal ? (
                // eslint-disable-next-line @next/next/no-img-element -- a local object URL; nothing to optimise
                <img
                  src={bannerUrl}
                  alt=""
                  className="absolute inset-0 size-full scale-125 object-cover opacity-45 blur-2xl"
                />
              ) : (
                <Image
                  src={bannerUrl}
                  alt=""
                  fill
                  unoptimized
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="scale-125 object-cover opacity-45 blur-2xl"
                />
              )}
              {bannerLocal ? (
                // eslint-disable-next-line @next/next/no-img-element -- a local object URL; nothing to optimise
                <img
                  src={bannerUrl}
                  alt=""
                  className="absolute inset-0 size-full object-contain transition-transform duration-(--duration-long) ease-(--ease-standard) group-hover:scale-[1.03]"
                />
              ) : (
                <Image
                  src={bannerUrl}
                  alt=""
                  fill
                  unoptimized
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-contain transition-transform duration-(--duration-long) ease-(--ease-standard) group-hover:scale-[1.03]"
                />
              )}
            </>
          ) : (
            <div className="club-poster-empty flex h-full items-center justify-center">
              <span className="font-heading text-h2 font-extrabold text-on-surface-subtle/70">
                {initial}
              </span>
            </div>
          ))}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex items-center gap-2.5">
          {clubName &&
            (clubLogo ? (
              <Image
                src={clubLogo}
                alt=""
                width={28}
                height={28}
                unoptimized
                className="size-7 rounded-lg object-cover"
              />
            ) : (
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
                <Heart aria-hidden className="size-3.5" />
              </span>
            ))}
          {clubName && (
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-on-surface-muted">
              {clubName}
            </span>
          )}
          {typeof popularity === "number" && phase !== "draft" && (
            <span
              className={cn(
                "flex items-center gap-1 text-sm font-bold text-on-surface-muted",
                !clubName && "mr-auto",
              )}
            >
              <Heart aria-hidden className="size-4 text-danger-accent" />
              <span className="tabular">{popularity}</span>
              <span className="sr-only">likes</span>
            </span>
          )}
          {!clubName && <span className="flex-1" />}
          <span
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-extrabold",
              phaseClass,
            )}
          >
            {phase === "live" && (
              <span aria-hidden className="live-dot text-success-accent" />
            )}
            {phaseLabel}
          </span>
        </div>

        <h3
          className={cn(
            "line-clamp-2 font-heading text-lg font-bold",
            untitled ? "text-on-surface-subtle" : "text-on-surface",
          )}
        >
          {heading}
        </h3>

        {(when || timing) && (
          <ul className="flex flex-col gap-1.5 text-sm text-on-surface-muted">
            {when && (
              <li className="flex items-center gap-1.5">
                <CalendarDays aria-hidden className="size-4 text-primary-accent" />
                {when}
              </li>
            )}
            {timing && (
              <li className="flex items-center gap-1.5">
                <Clock3 aria-hidden className="size-4 text-primary-accent" />
                {timing.replace(/\s+to\s+/i, " - ")}
              </li>
            )}
          </ul>
        )}

        {(odsProvided || refreshmentsProvided || cleanLabels(labels).length > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {odsProvided && (
              <Badge
                variant="outline"
                className="rounded-full border-success/50 text-success-accent"
              >
                OD provided
              </Badge>
            )}
            {refreshmentsProvided && (
              <Badge
                variant="outline"
                className="rounded-full border-warning/50 text-warning-accent"
              >
                Refreshments
              </Badge>
            )}
            {cleanLabels(labels).map((label) => (
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

        {(websiteLink || onDelete) && (
          <div className="mt-auto flex items-center gap-2 pt-1">
            {websiteLink && (
              <Button
                size="touch"
                className="flex-1"
                render={
                  <a href={websiteLink} target="_blank" rel="noreferrer" />
                }
                nativeButton={false}
              >
                Register <ExternalLink aria-hidden />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon-touch"
                aria-label={`Delete ${heading}`}
                onClick={onDelete}
                className="text-on-surface-muted hover:text-danger-accent bg-red-900/50 font-bold"
              >
                <Trash2 />
              </Button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
