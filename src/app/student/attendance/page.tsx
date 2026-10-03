import type { Metadata } from "next";

import { AttendanceView } from "@/components/attendance/attendance-view";

export const metadata: Metadata = { title: "Attendance" };

export default function AttendancePage() {
  return <AttendanceView />;
}
