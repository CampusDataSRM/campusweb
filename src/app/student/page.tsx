import type { Metadata } from "next";

import { Alerts } from "@/components/dashboard/alerts";
import { AttendanceOverviewCard } from "@/components/dashboard/attendance-overview-card";
import { DashboardGreeting } from "@/components/dashboard/dashboard-greeting";
import { EventsCarousel } from "@/components/dashboard/events-carousel";
import { ProfileCard } from "@/components/dashboard/profile-card";
import { Standings } from "@/components/dashboard/standings";
import { TodayClassesCard } from "@/components/dashboard/today-classes-card";

export const metadata: Metadata = { title: "Dashboard" };

/** The dashboard, in Campus App's order: profile, events, overview, standings, alerts. */
export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardGreeting />
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <ProfileCard />
        <EventsCarousel />
      </div>
      <section aria-label="Overview" className="flex flex-col gap-3">
        <h2 className="text-lg font-extrabold text-on-surface">Overview</h2>
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
          <AttendanceOverviewCard />
          <TodayClassesCard />
        </div>
      </section>
      <Standings />
      <Alerts />
    </div>
  );
}
