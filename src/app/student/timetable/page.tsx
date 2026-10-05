import type { Metadata } from "next";

import { TimetableView } from "@/components/timetable/timetable-view";

export const metadata: Metadata = { title: "Timetable" };

export default function TimetablePage() {
  return <TimetableView />;
}
