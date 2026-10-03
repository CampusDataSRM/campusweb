import type { Metadata } from "next";

import { EventsCarousel } from "@/components/dashboard/events-carousel";
import { SkipMeter } from "@/components/dashboard/skip-meter";
import { Standings } from "@/components/dashboard/standings";
import { TodayClassesCard } from "@/components/dashboard/today-classes-card";
import { TodayHero } from "@/components/dashboard/today-hero";

export const metadata: Metadata = { title: "Dashboard" };

/**
 * The dashboard answers, in order: what's happening now, can I skip, what's
 * the rest of my day, what's on around campus, and how am I doing overall.
 */
export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <TodayHero />
      <SkipMeter />
      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <TodayClassesCard />
        <EventsCarousel />
      </div>
      <Standings />
    </div>
  );
}
