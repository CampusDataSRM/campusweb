import type { Metadata } from "next";

import { ClubDetailView } from "@/components/clubs/club-detail-view";

export const metadata: Metadata = { title: "Club" };

export default async function ClubPage(props: PageProps<"/student/clubs/[id]">) {
  const { id } = await props.params;
  return <ClubDetailView clubId={decodeURIComponent(id)} />;
}
