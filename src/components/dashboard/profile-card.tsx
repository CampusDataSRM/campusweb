"use client";

import { GraduationCap, Hash, Layers3 } from "lucide-react";

import { ErrorState, ShimmerBlock } from "@/components/feedback/data-states";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useProfile } from "@/hooks/use-student-data";
import { batchLabel, initials, titleCase } from "@/lib/student/profile";

export function ProfileCard() {
  const profile = useProfile();

  if (profile.isLoading) return <ShimmerBlock className="h-36" />;
  if (!profile.data) {
    return (
      <ErrorState
        error={profile.error}
        title="Couldn't load your profile"
        onRetry={() => void profile.refetch()}
        retrying={profile.isFetching}
      />
    );
  }

  const data = profile.data;
  const name = titleCase(data.name);
  const facts = [
    { icon: Hash, label: "Registration", value: data.registrationNumber },
    { icon: GraduationCap, label: "Programme", value: [data.program, data.specialization || data.department].filter(Boolean).join(" · ") },
    { icon: Layers3, label: "Semester", value: [data.semester && `Semester ${data.semester}`, batchLabel(data.comboBatch)].filter(Boolean).join(" · ") },
  ].filter((fact) => fact.value);

  return (
    <article className="flex flex-col gap-5 rounded-3xl border border-outline-variant bg-surface-container p-5 sm:flex-row sm:items-center sm:p-6">
      <Avatar className="size-16 shrink-0 rounded-2xl">
        <AvatarFallback className="rounded-2xl bg-primary text-xl font-extrabold text-on-primary">
          {initials(name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <h2 className="truncate font-heading text-h3 font-bold text-on-surface">{name}</h2>
        <dl className="grid gap-2 sm:grid-cols-3">
          {facts.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex min-w-0 items-center gap-2 text-sm">
              <Icon aria-hidden className="size-4 shrink-0 text-primary-accent" />
              <dt className="sr-only">{label}</dt>
              <dd className="truncate text-on-surface-muted">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  );
}
