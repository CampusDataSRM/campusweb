"use client";

import { BarChart3 } from "lucide-react";
import { useMemo } from "react";

import { UnlockPrompt } from "@/components/attendance/unlock-prompt";
import {
  CachedBadge,
  EmptyState,
  ErrorState,
  ShimmerBlock,
} from "@/components/feedback/data-states";
import { PageHeader } from "@/components/layout/page-header";
import { MarksCard } from "@/components/marks/marks-card";
import { SgpaSheet } from "@/components/marks/sgpa-sheet";
import { useSession } from "@/context/session-context";
import { useStudentCopy } from "@/hooks/use-student-copy";
import { useProfile } from "@/hooks/use-student-data";
import { projectSgpa } from "@/lib/student/sgpa";

export function MarksView() {
  const copy = useStudentCopy();
  const { session } = useSession();
  const profile = useProfile();
  const performances = useMemo(
    () => profile.data?.testPerformances ?? [],
    [profile.data],
  );
  const projection = useMemo(
    () => (profile.data ? projectSgpa(profile.data) : null),
    [profile.data],
  );
  const showSgpa =
    session?.kind !== "demo" &&
    projection !== null &&
    projection.countedCredits > 0;

  return (
    <div className="campus-view marks-page flex flex-col gap-6">
      <PageHeader
        title={copy.marksTitle}
        description="Your scores, subject by subject. Keep an eye on what’s next."
        status={
          <CachedBadge
            savedAt={profile.savedAt}
            refreshing={profile.isFetching}
          />
        }
        actions={
          showSgpa ? (
            <SgpaSheet
              projection={projection}
              program={profile.data?.program}
              semester={profile.data?.semester}
            />
          ) : undefined
        }
      />
      {profile.isLoading ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <ShimmerBlock key={i} className="h-56" />
          ))}
        </div>
      ) : !profile.data ? (
        <ErrorState
          error={profile.error}
          title="Couldn't load marks"
          onRetry={() => void profile.refetch()}
          retrying={profile.isFetching}
        />
      ) : performances.length === 0 ? (
        profile.data.studentPortalLoginRequired ? (
          <UnlockPrompt subject="marks" />
        ) : (
          <EmptyState
            icon={BarChart3}
            title={copy.noMarksTitle}
            description={copy.noMarksBody}
          />
        )
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {performances.map((performance) => (
            <MarksCard key={performance.courseCode} performance={performance} />
          ))}
        </div>
      )}
    </div>
  );
}
