"use client";

import { CachedBadge } from "@/components/feedback/data-states";
import { PageHeader } from "@/components/layout/page-header";
import { useNow } from "@/hooks/use-now";
import { useProfile } from "@/hooks/use-student-data";
import { batchLabel, firstName } from "@/lib/student/profile";

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
  const now = useNow();
  const name = firstName(profile.data?.name);

  return (
    <PageHeader
      title={now ? `${greeting(now.getHours())}${name ? `, ${name}` : ""}` : "Dashboard"}
      status={<CachedBadge savedAt={profile.savedAt} refreshing={profile.isFetching} />}
      description={
        now ? (
          <span className="flex flex-wrap gap-x-4 gap-y-1">
            <span>{dateFormat.format(now)}</span>
            {profile.data?.semester && <span>Semester {profile.data.semester}</span>}
            {profile.data?.comboBatch && <span>{batchLabel(profile.data.comboBatch)}</span>}
          </span>
        ) : undefined
      }
    />
  );
}
