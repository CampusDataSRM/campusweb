import type { Metadata } from "next";

import { ClubProfileView } from "@/components/club/club-profile-view";

export const metadata: Metadata = { title: "Club profile" };

export default function ClubProfilePage() {
  return <ClubProfileView />;
}
