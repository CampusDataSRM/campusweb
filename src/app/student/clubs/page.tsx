import type { Metadata } from "next";

import { ClubsView } from "@/components/clubs/clubs-view";

export const metadata: Metadata = { title: "Clubs" };

export default function ClubsPage() {
  return <ClubsView />;
}
