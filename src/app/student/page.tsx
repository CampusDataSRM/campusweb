import type { Metadata } from "next";
import "./home.css";

import { EventSpotlight } from "@/components/dashboard/events-carousel";
import { SkipMeter } from "@/components/dashboard/skip-meter";
import { Standings } from "@/components/dashboard/standings";
import { TodayClassesCard } from "@/components/dashboard/today-classes-card";
import {
  AttendanceCard,
  DashboardShortcuts,
  TodayHero,
} from "@/components/dashboard/today-hero";

export const metadata: Metadata = { title: "Dashboard" };

/** Campus events stay in view; the rest of the dashboard is personal. */
export default function DashboardPage() {
  return (
    <div className="home-dashboard">
      <TodayHero aside={<EventSpotlight />} />
      <div className="home-content-grid">
        <TodayClassesCard />
        <div className="home-attendance-column">
          <AttendanceCard />
          <SkipMeter />
        </div>
        <Standings />
        <DashboardShortcuts />
      </div>
    </div>
  );
}
