"use client";

import { BookOpenCheck, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";

import { AttendanceSummary } from "@/components/attendance/attendance-summary";
import { CourseCard } from "@/components/attendance/course-card";
import { PredictionSheet } from "@/components/attendance/prediction-sheet";
import { UnlockPrompt } from "@/components/attendance/unlock-prompt";
import {
  CachedBadge,
  EmptyState,
  ErrorState,
  ShimmerBlock,
} from "@/components/feedback/data-states";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useSession } from "@/context/session-context";
import { useAttendancePrediction } from "@/hooks/use-attendance-prediction";
import { useStudentCopy } from "@/hooks/use-student-copy";
import { useProfile } from "@/hooks/use-student-data";
import {
  bunkBudget,
  courseAttendance,
  type BunkTone,
} from "@/lib/student/attendance";
import { Segmented } from "@/components/ui/segmented";

/** Most urgent first: classes to make up, then on the line, then safe (least room first), then not started. */
const TONE_ORDER: Record<BunkTone, number> = {
  risk: 0,
  edge: 1,
  safe: 2,
  pending: 3,
};

export function AttendanceView() {
  const copy = useStudentCopy();
  const { session } = useSession();
  const profile = useProfile();
  const prediction = useAttendancePrediction();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "risk">("all");
  const sorted = useMemo(
    () =>
      [...prediction.courses]
        .map((course) => ({
          course,
          budget: bunkBudget(courseAttendance(course)),
        }))
        .sort(
          (a, b) =>
            TONE_ORDER[a.budget.tone] - TONE_ORDER[b.budget.tone] ||
            (a.budget.tone === "safe"
              ? a.budget.count - b.budget.count
              : b.budget.count - a.budget.count),
        )
        .map(({ course }) => course),
    [prediction.courses],
  );
  const atRisk = sorted.filter(
    (course) => courseAttendance(course).required > 0,
  );
  const shownCourses = filter === "all" ? sorted : atRisk;
  const canPredict = session?.kind !== "demo";
  const predicted = prediction.result !== null;

  const header = (
    <PageHeader
      title={copy.attendanceTitle}
      status={
        <CachedBadge
          savedAt={profile.savedAt}
          refreshing={profile.isFetching}
        />
      }
      description={
        predicted
          ? "Showing a prediction - your real attendance is unchanged."
          : "Updated from your student account."
      }
      actions={
        canPredict && prediction.courses.length > 0 ? (
          predicted ? (
            <>
              <Button
                variant="outline"
                size="touch"
                onClick={() => setSheetOpen(true)}
              >
                Edit
              </Button>
              <Button variant="tonal" size="touch" onClick={prediction.clear}>
                <X aria-hidden /> Clear
              </Button>
            </>
          ) : (
            <Button size="touch" onClick={() => setSheetOpen(true)}>
              <Sparkles aria-hidden /> Plan attendance
            </Button>
          )
        ) : undefined
      }
    />
  );

  if (profile.isLoading) {
    return (
      <div className="campus-view attendance-page flex flex-col gap-6">
        {header}
        <ShimmerBlock className="h-28" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <ShimmerBlock key={i} className="h-44" />
          ))}
        </div>
      </div>
    );
  }

  if (!profile.data) {
    return (
      <div className="campus-view attendance-page flex flex-col gap-6">
        {header}
        <ErrorState
          error={profile.error}
          title="Couldn't load attendance"
          onRetry={() => void profile.refetch()}
          retrying={profile.isFetching}
        />
      </div>
    );
  }

  return (
    <div className="campus-view attendance-page flex flex-col gap-6">
      {header}
      {profile.data.studentPortalLoginRequired && <UnlockPrompt />}
      {prediction.courses.length === 0 ? (
        <EmptyState
          icon={BookOpenCheck}
          title="No attendance yet"
          description="Your courses appear here once attendance is published."
        />
      ) : (
        <>
          <AttendanceSummary courses={prediction.courses} />
          {predicted && prediction.result && (
            <p className="rounded-2xl border border-secondary/40 bg-secondary-container px-4 py-3 text-sm font-semibold text-on-secondary-container">
              Prediction covers {prediction.result.projectedClassCount} upcoming
              classes, {prediction.result.missedClassCount} of them missed.
            </p>
          )}
          <div className="campus-toolbar">
            <Segmented
              label="Attendance subjects"
              value={filter}
              onChange={setFilter}
              options={[
                {
                  value: "all",
                  label: (
                    <>
                      All subjects{" "}
                      <span className="campus-tab-count">{sorted.length}</span>
                    </>
                  ),
                },
                {
                  value: "risk",
                  label: (
                    <>
                      Below 75%{" "}
                      <span className="campus-tab-count">{atRisk.length}</span>
                    </>
                  ),
                },
              ]}
            />
            <p className="campus-caption">Most urgent first · Target 75%</p>
          </div>
          {shownCourses.length === 0 && (
            <EmptyState
              icon={BookOpenCheck}
              title="Nothing below 75%"
              description="Every subject with published attendance is on track."
            />
          )}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {shownCourses.map((course, index) => (
              <CourseCard
                key={`${course.courseCode}-${course.courseTitle}`}
                course={course}
                predicted={predicted}
                index={index}
              />
            ))}
          </div>
        </>
      )}
      {canPredict && sheetOpen && (
        <PredictionSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          prediction={prediction}
        />
      )}
    </div>
  );
}
