"use client";

import { ArrowLeft, BadgeCheck, ExternalLink, Mail, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import { EventCard } from "@/components/events/event-card";
import { EmptyState, ErrorState, ShimmerBlock } from "@/components/feedback/data-states";
import { Section } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { STUDENT_ROUTES } from "@/constants/routes";
import { useLikeActions } from "@/hooks/use-like-actions";
import { useNow } from "@/hooks/use-now";
import { useClubs, useEvents, useProfile } from "@/hooks/use-student-data";
import { cleanLabels, visibleEvents } from "@/lib/student/events";

/** One club: who they are, how to reach them, and their events. */
export function ClubDetailView({ clubId }: { clubId: string }) {
  const now = useNow();
  const clubs = useClubs();
  const events = useEvents();
  const profile = useProfile();
  const reg = profile.data?.registrationNumber;
  const { canLike, likeEvent } = useLikeActions(reg);

  const club = useMemo(() => clubs.data?.find((c) => c.id === clubId), [clubs.data, clubId]);
  const clubEvents = useMemo(
    () => (now ? visibleEvents(events.data ?? [], now).filter((e) => e.club_id === clubId) : []),
    [events.data, now, clubId],
  );

  const back = (
    <Button variant="ghost" size="touch" className="w-fit -ml-2 text-on-surface-muted" render={<Link href={STUDENT_ROUTES.clubs} />} nativeButton={false}>
      <ArrowLeft aria-hidden /> All clubs
    </Button>
  );

  if (clubs.isLoading) return <div className="flex flex-col gap-4">{back}<ShimmerBlock className="h-48" /></div>;
  if (!club) {
    return (
      <div className="flex flex-col gap-4">
        {back}
        {clubs.error ? (
          <ErrorState error={clubs.error} title="Couldn't load this club" onRetry={() => void clubs.refetch()} />
        ) : (
          <EmptyState icon={Sparkles} title="Club not found" description="It may have been removed." />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {back}
      <header className="flex flex-col gap-5 rounded-3xl border border-outline-variant bg-surface-container p-6 sm:flex-row sm:items-center">
        {club.logo && <Image src={club.logo} alt="" width={80} height={80} unoptimized className="size-20 rounded-3xl object-cover" />}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h1 className="flex items-center gap-2 text-h1 font-extrabold text-on-surface">
            {club.name}
            {club.verified && <BadgeCheck aria-label="Verified" className="size-6 text-primary-accent" />}
          </h1>
          <div className="flex flex-wrap gap-1.5">
            {club.isRecruiting && <Badge className="rounded-full bg-success-container text-on-success-container">Recruiting</Badge>}
            {cleanLabels(club.labels).map((label) => (
              <Badge key={label} variant="outline" className="rounded-full border-outline-variant text-on-surface-muted">#{label}</Badge>
            ))}
          </div>
          <p className="text-on-surface-muted">{club.description}</p>
        </div>
        <div className="flex gap-2 sm:flex-col">
          {club.websiteLink && (
            <Button size="touch" render={<a href={club.websiteLink} target="_blank" rel="noreferrer" />} nativeButton={false}>
              Website <ExternalLink aria-hidden />
            </Button>
          )}
          {club.email && (
            <Button variant="outline" size="touch" render={<a href={`mailto:${club.email}`} />} nativeButton={false}>
              <Mail aria-hidden /> Email
            </Button>
          )}
        </div>
      </header>
      <Section title="Events">
        {!now || clubEvents.length === 0 ? (
          <EmptyState icon={Sparkles} title="No events right now" description="This club's next events appear here." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clubEvents.map((event) => (
              <EventCard key={event.id} event={event} today={now} registrationNumber={reg} canLike={canLike} onLike={(id, action) => likeEvent({ id, action })} />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
