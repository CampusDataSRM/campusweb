import type { Metadata } from "next";

import { Alerts } from "@/components/dashboard/alerts";
import { AttendanceOverviewCard } from "@/components/dashboard/attendance-overview-card";
import { DashboardGreeting } from "@/components/dashboard/dashboard-greeting";
import { ProfileCard } from "@/components/dashboard/profile-card";
import { Standings } from "@/components/dashboard/standings";
import { TodayClassesCard } from "@/components/dashboard/today-classes-card";
import { UpcomingEvents } from "@/components/dashboard/upcoming-events";

export const metadata: Metadata = { title: "Dashboard" };

/** The dashboard: who you are, what's on today, how you're doing, what's coming up. */
export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-7">
      <DashboardGreeting />
      <ProfileCard />
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="flex flex-col gap-4">
          <AttendanceOverviewCard />
          <Alerts />
        </div>
        <TodayClassesCard />
      </div>
      <Standings />
      <UpcomingEvents />
    </div>
  );
}
