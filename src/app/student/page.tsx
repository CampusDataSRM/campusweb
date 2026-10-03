import type { Metadata } from "next";

import { Alerts } from "@/components/dashboard/alerts";
import { AttendanceOverviewCard } from "@/components/dashboard/attendance-overview-card";
import { DashboardGreeting } from "@/components/dashboard/dashboard-greeting";
import { NowBoard } from "@/components/dashboard/now-board";
import { Standings } from "@/components/dashboard/standings";
import { TodayClassesCard } from "@/components/dashboard/today-classes-card";
import { UpcomingEvents } from "@/components/dashboard/upcoming-events";

export const metadata: Metadata = { title: "Dashboard" };

/**
 * The dashboard, led by what's on right now. One bold element (the Now
 * board), quiet supporting pieces around it.
 */
export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <DashboardGreeting />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <NowBoard />
        <AttendanceOverviewCard />
      </div>
      <Alerts />
      <Standings />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <TodayClassesCard />
        <UpcomingEvents />
      </div>
    </div>
  );
}
