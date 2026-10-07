import type { Metadata } from "next";

import { PlannerView } from "@/components/planner/planner-view";

export const metadata: Metadata = { title: "Planner" };

export default function PlannerPage() {
  return <PlannerView />;
}
