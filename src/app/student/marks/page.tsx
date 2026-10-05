import type { Metadata } from "next";

import { MarksView } from "@/components/marks/marks-view";

export const metadata: Metadata = { title: "Marks" };

export default function MarksPage() {
  return <MarksView />;
}
