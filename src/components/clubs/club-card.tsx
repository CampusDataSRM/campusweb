"use client";

import { BadgeCheck, Heart, UsersRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { STUDENT_ROUTES } from "@/constants/routes";
import { cleanLabels, isLikedBy } from "@/lib/student/events";
import { cn } from "@/lib/utils";
import type { Club } from "@/network-calls/types";

/** A club: logo, name, what it does, labels, and like / explore. */
export function ClubCard({
  club,
  registrationNumber,
  canLike,
  onLike,
}: {
  club: Club;
  registrationNumber?: string;
  canLike: boolean;
  onLike?: (id: string, action: "like" | "unlike") => void;
}) {
  const liked = isLikedBy(club.likedby, registrationNumber);
  return (
    <article className="campus-club-card panel flex h-full min-w-0 flex-col gap-4 overflow-hidden rounded-3xl p-5">
      <div className="flex items-start gap-3">
        {club.logo ? (
          <Image
            src={club.logo}
            alt=""
            width={48}
            height={48}
            unoptimized
            className="size-12 shrink-0 rounded-2xl object-cover"
          />
        ) : (
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-container text-on-primary-container">
            <UsersRound aria-hidden className="size-6" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="flex items-center gap-1.5 font-heading font-bold text-on-surface">
            <span className="min-w-0 break-words">{club.name}</span>
            {club.verified && (
              <BadgeCheck
                aria-label="Verified"
                className="size-4 shrink-0 text-primary-accent"
              />
            )}
          </h3>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {club.isRecruiting && (
              <Badge className="rounded-full bg-success-container text-on-success-container">
                Recruiting
              </Badge>
            )}
            {cleanLabels(club.labels)
              .filter((label) => label.length <= 42)
              .slice(0, 3)
              .map((label) => (
                <Badge
                  key={label}
                  variant="outline"
                  className="h-auto max-w-full whitespace-normal rounded-md border-outline-variant text-on-surface-muted"
                >
                  #{label}
                </Badge>
              ))}
          </div>
        </div>
      </div>
      <p className="line-clamp-3 flex-1 text-sm text-on-surface-muted">
        {club.description}
      </p>
      <div className="mt-auto">
        <div className="flex items-center gap-2">
          <Button
            variant="tonal"
            size="touch"
            className="flex-1"
            render={
              <Link
                href={`${STUDENT_ROUTES.clubs}/${encodeURIComponent(club.id)}`}
              />
            }
            nativeButton={false}
          >
            Explore
          </Button>
          <Button
            variant={liked ? "tonal" : "outline"}
            size="touch"
            disabled={!canLike}
            onClick={() => onLike?.(club.id, liked ? "unlike" : "like")}
            aria-pressed={liked}
            aria-label={`${liked ? "Unlike" : "Like"} ${club.name}, ${club.popularity ?? 0} likes`}
            title={canLike ? undefined : "Sign in to like clubs"}
          >
            <Heart aria-hidden className={cn(liked && "fill-current")} />
            <span className="tabular">{club.popularity ?? 0}</span>
          </Button>
        </div>
      </div>
    </article>
  );
}
