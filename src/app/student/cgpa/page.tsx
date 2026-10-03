import type { Metadata } from "next";

import { CgpaView } from "@/components/cgpa/cgpa-view";

export const metadata: Metadata = { title: "CGPA calculator" };

export default function CgpaPage() {
  return <CgpaView />;
}
