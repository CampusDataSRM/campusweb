"use client";

import { BarChart3, ChevronDown, List, Search, Target } from "lucide-react";
import { useMemo, useState } from "react";
import { UnlockPrompt } from "@/components/attendance/unlock-prompt";
import {
  CachedBadge,
  EmptyState,
  ErrorState,
  ShimmerBlock,
} from "@/components/feedback/data-states";
import { StudentRefreshButton } from "@/components/feedback/student-refresh-button";
import { PageHeader } from "@/components/layout/page-header";
import { MarksCard } from "@/components/marks/marks-card";
import { MarksExplorer } from "@/components/marks/marks-explorer";
import { SemesterScorecard } from "./semester-scorecard";
import { GradePlanner } from "@/components/marks/grade-planner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/context/session-context";
import { useStudentCopy } from "@/hooks/use-student-copy";
import { useProfile } from "@/hooks/use-student-data";
import { normalizeMarks } from "@/lib/student/marks";
import { projectSgpa } from "@/lib/student/sgpa";
import styles from "./marks.module.css";

export function MarksView() {
  const copy = useStudentCopy();
  const { session } = useSession();
  const profile = useProfile();
  const [view, setView] = useState("charts");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [targetGrade, setTargetGrade] = useState("O");
  const [scenarios, setScenarios] = useState<Record<string, number | null>>({});
  const subjects = useMemo(
    () => normalizeMarks(profile.data?.testPerformances ?? []),
    [profile.data],
  );
  const projection = useMemo(
    () => (profile.data ? projectSgpa(profile.data) : null),
    [profile.data],
  );
  const credits = new Map(
    (profile.data?.courses ?? []).map((course) => [
      course.courseCode,
      course.credit,
    ]),
  );
  const grades = new Map(
    (projection?.subjects ?? []).map((subject) => [
      subject.courseCode,
      subject,
    ]),
  );
  const isDemo = session?.kind === "demo";
  const noun = isDemo ? "activities" : "subjects";
  const published = subjects.filter((subject) => subject.percent !== null);
  const pending = subjects.length - published.length;
  const query = search.trim().toLocaleLowerCase();
  // Keep the API's course order, with unpublished results collected at the end.
  const shown = [
    ...published,
    ...subjects.filter((subject) => subject.percent === null),
  ].filter((subject) => {
    const matches = `${subject.courseName} ${subject.courseCode}`
      .toLocaleLowerCase()
      .includes(query);
    return (
      matches &&
      (status === "all" ||
        (status === "published"
          ? subject.percent !== null
          : subject.percent === null))
    );
  });

  return (
    <div className={`campus-view ${styles.page}`}>
      <PageHeader
        title={copy.marksTitle}
        description={
          profile.error && profile.data ? (
            <span className={styles.notice} role="status">
              Sync unavailable · showing saved results
            </span>
          ) : (
            "Your marks, grades and next targets."
          )
        }
        status={
          <CachedBadge
            savedAt={profile.savedAt}
            refreshing={profile.isFetching}
          />
        }
        actions={<StudentRefreshButton target="marks" />}
      />
      {profile.isLoading ? (
        <div
          className={styles.cards}
          aria-label="Loading marks"
          aria-busy="true"
        >
          {Array.from({ length: 4 }, (_, index) => (
            <ShimmerBlock key={index} className="h-56" />
          ))}
        </div>
      ) : !profile.data ? (
        <ErrorState
          error={profile.error}
          title="Couldn't load marks"
          onRetry={() => void profile.refetch()}
          retrying={profile.isFetching}
        />
      ) : subjects.length === 0 ? (
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
          {view !== "plan" && (
            <SemesterScorecard
              subjects={subjects}
              noun={noun}
              projection={isDemo ? undefined : (projection ?? undefined)}
              semester={profile.data.semester}
              program={profile.data.program}
              onPlan={() => setView("plan")}
              onSelect={(subject) => {
                setSearch("");
                setStatus("all");
                setSelectedSubject(
                  `${subject.courseCode}:${subject.courseType}`,
                );
                setView("charts");
              }}
            />
          )}
          <Tabs
            value={view}
            onValueChange={(value) => setView(String(value))}
            className={styles.tabs}
          >
            <div className={styles.toolbar}>
              <TabsList className={styles.viewTabs} aria-label="Marks view">
                <TabsTrigger value="charts" className={styles.viewTab}>
                  <BarChart3 aria-hidden /> Charts
                </TabsTrigger>
                <TabsTrigger value="details" className={styles.viewTab}>
                  <List aria-hidden /> Details
                </TabsTrigger>
                {!isDemo && projection && (
                  <TabsTrigger value="plan" className={styles.viewTab}>
                    <Target aria-hidden /> Plan grades
                  </TabsTrigger>
                )}
              </TabsList>
              {view !== "plan" && (
                <div className={styles.filters}>
                  <label className={styles.search}>
                    <Search size={16} aria-hidden />
                    <input
                      aria-label={`Search ${noun}`}
                      placeholder={`Find ${isDemo ? "an activity" : "a subject"}`}
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      type="search"
                    />
                  </label>
                  <div className={styles.selectWrap}>
                    <select
                      aria-label="Filter results"
                      value={status}
                      onChange={(event) => setStatus(event.target.value)}
                    >
                      <option value="all">
                        All {noun} ({subjects.length})
                      </option>
                      <option value="published">
                        Published ({published.length})
                      </option>
                      <option value="pending">Awaiting ({pending})</option>
                    </select>
                    <ChevronDown size={14} aria-hidden />
                  </div>
                </div>
              )}
            </div>
            {(["charts", "details"] as const).map((mode) => (
              <TabsContent key={mode} value={mode} className={styles.content}>
                {shown.length ? (
                  mode === "charts" ? (
                    <MarksExplorer
                      subjects={shown}
                      credits={isDemo ? undefined : credits}
                      noun={noun}
                      selectedKey={selectedSubject}
                      onSelect={setSelectedSubject}
                      grades={isDemo ? undefined : grades}
                      onPlan={(subject) => {
                        setSelectedSubject(
                          `${subject.courseCode}:${subject.courseType}`,
                        );
                        setView("plan");
                      }}
                    />
                  ) : (
                    <div className={styles.cards}>
                      {shown.map((subject, index) => (
                        <MarksCard
                          key={subject.id}
                          subject={subject}
                          index={Math.min(index, 5)}
                          credits={
                            isDemo ? undefined : credits.get(subject.courseCode)
                          }
                          projection={
                            isDemo ? undefined : grades.get(subject.courseCode)
                          }
                        />
                      ))}
                    </div>
                  )
                ) : (
                  <EmptyState
                    icon={Search}
                    title="No matching results"
                    description="Try another search or show all results."
                    action={
                      <Button
                        variant="tonal"
                        size="touch"
                        onClick={() => {
                          setSearch("");
                          setStatus("all");
                        }}
                      >
                        Clear filters
                      </Button>
                    }
                  />
                )}
              </TabsContent>
            ))}
            {!isDemo && projection && (
              <TabsContent value="plan" className={styles.content}>
                <GradePlanner
                  projection={projection}
                  target={targetGrade}
                  onTargetChange={setTargetGrade}
                  scenarios={scenarios}
                  onScenariosChange={setScenarios}
                  preferredCourse={selectedSubject?.split(":")[0]}
                />
              </TabsContent>
            )}
          </Tabs>
          <p className={styles.footnote}>
            {isDemo
              ? "Scores reflect published assessments."
              : "Grade badges and SGPA are projections: published marks scaled to 60 internals, plus an assumed 40/40 external marks for theory. Internal-only courses use their own 100-mark scale."}
          </p>
        </>
      )}
    </div>
  );
}
