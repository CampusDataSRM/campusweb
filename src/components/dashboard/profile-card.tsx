"use client";

import { LogOut } from "lucide-react";

import { ErrorState, ShimmerBlock } from "@/components/feedback/data-states";
import { Button } from "@/components/ui/button";
import { useSignOut } from "@/hooks/use-auth-actions";
import { useProfile } from "@/hooks/use-student-data";
import { batchLabel, initials, titleCase } from "@/lib/student/profile";

/** Campus App's profile card: avatar, name, registration number, batch. */
export function ProfileCard() {
  const profile = useProfile();
  const signOut = useSignOut();

  if (profile.isLoading) return <ShimmerBlock className="h-36 rounded-[1.25rem]" />;
  if (!profile.data) {
    return <ErrorState error={profile.error} title="Couldn't load your profile" onRetry={() => void profile.refetch()} retrying={profile.isFetching} />;
  }
  const data = profile.data;
  const name = titleCase(data.name);

  return (
    <article className="flex flex-col gap-4 rounded-[1.25rem] border border-outline-variant bg-surface-container p-5">
      <div className="flex items-center gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-cta text-lg font-extrabold text-on-primary">
          {initials(name)}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="line-clamp-2 text-lg font-extrabold text-on-surface">{name}</h2>
          <p className="truncate text-sm font-semibold text-on-surface-muted tabular">{data.registrationNumber}</p>
          {data.comboBatch && <p className="text-sm text-on-surface-subtle">{batchLabel(data.comboBatch)}</p>}
        </div>
      </div>
      <div className="flex gap-2 border-t border-outline-variant pt-3">
        <Button variant="ghost" size="sm" className="rounded-full text-on-surface-muted hover:text-danger-accent" onClick={() => void signOut()}>
          <LogOut aria-hidden /> Logout
        </Button>
      </div>
    </article>
  );
}
