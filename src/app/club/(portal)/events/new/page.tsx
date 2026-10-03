import type { Metadata } from "next";

import { NewEventForm } from "@/components/club/new-event-form";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = { title: "New event" };

export default function NewEventPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="New event" description="It appears for every student as soon as you publish." />
      <NewEventForm />
    </div>
  );
}
