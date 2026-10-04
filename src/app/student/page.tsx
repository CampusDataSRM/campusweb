import type { Metadata } from "next";
import "./home.css";

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
    <div className="home-dashboard">
      <TodayHero />
      <div className="home-content-grid">
        <div className="home-primary-column">
          <SkipMeter />
          <Standings />
        </div>
        <aside
          className="home-secondary-column"
          aria-label="Schedule and campus events"
        >
          <TodayClassesCard />
          <EventsCarousel />
        </aside>
      </div>
    </div>
  );
}
