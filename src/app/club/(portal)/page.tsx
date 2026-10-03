import type { Metadata } from "next";

import { ClubDashboardView } from "@/components/club/club-dashboard-view";

export const metadata: Metadata = { title: "Club events" };

export default function ClubDashboardPage() {
  return <ClubDashboardView />;
}
