"use client";

import { BarChart3 } from "lucide-react";
import { useMemo, useState } from "react";

import { UnlockPrompt } from "@/components/attendance/unlock-prompt";
import CountUp from "@/components/CountUp";
import {
  CachedBadge,
  EmptyState,
  ErrorState,
  ShimmerBlock,
} from "@/components/feedback/data-states";
import { PageHeader } from "@/components/layout/page-header";
import { MarksCard, marksTone } from "@/components/marks/marks-card";
import { SgpaSheet } from "@/components/marks/sgpa-sheet";
import { Segmented } from "@/components/ui/segmented";
import { useSession } from "@/context/session-context";
import { useStudentCopy } from "@/hooks/use-student-copy";
import { useProfile } from "@/hooks/use-student-data";
import { projectSgpa } from "@/lib/student/sgpa";
import { cn } from "@/lib/utils";
import type { UserTestPerformance } from "@/network-calls/types";

const fmt = (value: number) =>
  Number.isInteger(value)
    ? String(value)
    : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");

const TONE_TEXT = {
  good: "text-success-accent",
  warn: "text-warning-accent",
  bad: "text-danger-accent",
} as const;

/** A course's total so far, or null before any test is published. */
function percentOf(row: UserTestPerformance): number | null {
  const tests = Object.values(row.tests ?? {});
  const total = row.totalMarks || tests.reduce((s, t) => s + t.total, 0);
  const got = row.totalMarkGot || tests.reduce((s, t) => s + t.got, 0);
  return total > 0 ? (got / total) * 100 : null;
}

export function MarksView() {
  const copy = useStudentCopy();
  const { session } = useSession();
  const profile = useProfile();
  const [filter, setFilter] = useState<"all" | "low">("all");
  const performances = useMemo(
    () => profile.data?.testPerformances ?? [],
    [profile.data],
  );
  const projection = useMemo(
    () => (profile.data ? projectSgpa(profile.data) : null),
    [profile.data],
  );
  const isDemo = session?.kind === "demo";
  // The evaluator account is an events programme: activities and results, not subjects and tests.
  const noun = isDemo ? ["activity", "activities"] : ["subject", "subjects"];
  const showSgpa =
    session?.kind !== "demo" &&
    projection !== null &&
    projection.countedCredits > 0;

  // Weakest first, so the subject that needs work is the first one seen;
  // subjects with nothing published yet go last.
  const sorted = useMemo(
    () =>
      [...performances]
        .map((row) => ({ row, percent: percentOf(row) }))
        .sort((a, b) => (a.percent ?? 101) - (b.percent ?? 101)),
    [performances],
  );
  const low = sorted.filter((s) => s.percent !== null && s.percent < 75);
  const shown = filter === "all" ? sorted : low;
  const credits = useMemo(
    () =>
      new Map(
        (profile.data?.courses ?? []).map((c) => [c.courseCode, c.credit]),
      ),
    [profile.data],
  );
  const projected = useMemo(
    () => new Map((projection?.subjects ?? []).map((s) => [s.courseCode, s])),
    [projection],
  );

  // The strip: marks so far, tests published, subjects below 75%.
  const scored = sorted.filter((s) => s.percent !== null);
  const totalGot = scored.reduce(
    (sum, s) => sum + (s.row.totalMarkGot || 0),
    0,
  );
  const totalMax = scored.reduce((sum, s) => sum + (s.row.totalMarks || 0), 0);
  const overall = totalMax > 0 ? (totalGot / totalMax) * 100 : 0;
  const testCount = scored.reduce(
    (sum, s) => sum + Object.keys(s.row.tests ?? {}).length,
    0,
  );
  const pending = sorted.length - scored.length;
  const lowest = scored.length
    ? Math.min(...scored.map((s) => s.percent!))
    : null;

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
        <>
          {scored.length > 0 && (
            <dl className="campus-stat-strip">
              <div>
                <dt className="text-xs font-semibold text-on-surface-muted sm:text-sm">
                  {isDemo ? "Score so far" : "Marks so far"}
                </dt>
                <dd
                  className={cn(
                    "font-heading text-h2 font-extrabold tabular",
                    TONE_TEXT[marksTone(overall)],
                  )}
                >
                  <CountUp to={Math.round(overall * 10) / 10} duration={0.8} />%
                </dd>
                <dd className="campus-stat-note">
                  {fmt(totalGot)} of {fmt(totalMax)}{" "}
                  {isDemo ? "points" : "marks"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-on-surface-muted sm:text-sm">
                  {isDemo ? "Results published" : "Tests published"}
                </dt>
                <dd className="font-heading text-h2 font-extrabold text-on-surface tabular">
                  <CountUp to={testCount} duration={0.8} />
                </dd>
                <dd className="campus-stat-note">
                  {scored.length} of {sorted.length}{" "}
                  {sorted.length === 1 ? noun[0] : noun[1]}
                  {pending > 0 && ` · ${pending} waiting`}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-on-surface-muted sm:text-sm">
                  Below 75%
                </dt>
                <dd
                  className={cn(
                    "font-heading text-h2 font-extrabold tabular",
                    low.length > 0 ? "text-danger-accent" : "text-on-surface",
                  )}
                >
                  <CountUp to={low.length} duration={0.8} />
                </dd>
                <dd className="campus-stat-note">
                  {low.length > 0 && lowest !== null
                    ? `Lowest at ${lowest.toFixed(1)}%`
                    : "Everything at or above 75%"}
                </dd>
              </div>
            </dl>
          )}
          <div className="campus-toolbar">
            <Segmented
              label={`Filter ${noun[1]}`}
              value={filter}
              onChange={setFilter}
              options={[
                {
                  value: "all",
                  label: (
                    <>
                      {isDemo ? "All activities" : "All subjects"}{" "}
                      <span className="campus-tab-count">{sorted.length}</span>
                    </>
                  ),
                },
                {
                  value: "low",
                  label: (
                    <>
                      Below 75%{" "}
                      <span className="campus-tab-count">{low.length}</span>
                    </>
                  ),
                },
              ]}
            />
            <p className="campus-caption">Lowest first</p>
          </div>
          {shown.length === 0 && (
            <EmptyState
              icon={BarChart3}
              title="Nothing below 75%"
              description="Every subject with published marks is at 75% or better."
            />
          )}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {shown.map(({ row }, index) => (
              <MarksCard
                key={row.courseCode}
                performance={row}
                credits={credits.get(row.courseCode)}
                projection={isDemo ? undefined : projected.get(row.courseCode)}
                index={index}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
