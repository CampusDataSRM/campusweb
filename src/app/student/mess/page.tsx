import type { Metadata } from "next";

import { MessView } from "@/components/mess/mess-view";

export const metadata: Metadata = { title: "Mess menu" };

export default function MessPage() {
  return <MessView />;
}
