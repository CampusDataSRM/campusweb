import type { Metadata } from "next";
import "./home.css";

import { EventsCarousel } from "@/components/dashboard/events-carousel";
import { SkipMeter } from "@/components/dashboard/skip-meter";
import { Standings } from "@/components/dashboard/standings";
import { ClubShowcase } from "@/components/dashboard/club-showcase";
import { TodayClassesCard } from "@/components/dashboard/today-classes-card";
import { TodayHero } from "@/components/dashboard/today-hero";

export const metadata: Metadata = { title: "Dashboard" };

/**
 * The dashboard answers, in order: what's happening now, can I skip, what's
 * the rest of my day, what's on around campus, and how am I doing overall.
 */
export default function DashboardPage() {
  return (
    <div className="home-dashboard">
      <TodayHero secondarySlide={<EventsCarousel />} />
      <div className="home-content-grid">
        <div className="home-primary-column">
          <SkipMeter />
          <Standings />
        </div>
        <aside
          className="home-secondary-column flex flex-col gap-8"
          aria-label="Schedule and campus events"
        >
          <TodayClassesCard />
          <ClubShowcase />
        </aside>
      </div>
    </div>
  );
}
