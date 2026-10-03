"use client";

import { CachedBadge } from "@/components/feedback/data-states";
import { PageHeader } from "@/components/layout/page-header";
import { useProfile } from "@/hooks/use-student-data";
import { useToday } from "@/hooks/use-today";
import { firstName } from "@/lib/student/profile";

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

function greeting(hour: number): string {
  if (hour < 5) return "Up late";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function DashboardGreeting() {
  const profile = useProfile();
  const { now, dayOrder } = useToday();
  const name = firstName(profile.data?.name);

  return (
    <PageHeader
      title={now ? `${greeting(now.getHours())}${name ? `, ${name}` : ""}` : "Dashboard"}
      status={<CachedBadge savedAt={profile.savedAt} refreshing={profile.isFetching} />}
      description={
        now ? (
          <>
            {dateFormat.format(now)}
            {" · "}
            <span className="font-semibold text-on-surface-brand">
              {dayOrder ? `Day ${dayOrder}` : "No day order today"}
            </span>
          </>
        ) : undefined
      }
    />
  );
}
