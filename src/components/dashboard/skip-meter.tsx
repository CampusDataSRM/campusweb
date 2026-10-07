"use client";

import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { useMemo, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ShimmerBlock } from "@/components/feedback/data-states";
import { Section } from "@/components/layout/page-header";
import { STUDENT_ROUTES } from "@/constants/routes";
import { useSession } from "@/context/session-context";
import { useStudentCopy } from "@/hooks/use-student-copy";
import { useProfile } from "@/hooks/use-student-data";
import {
  bunkBudget,
  courseAttendance,
  mergeTheoryPracticalCourses,
  type BunkTone,
} from "@/lib/student/attendance";
import { titleCase } from "@/lib/student/profile";

const TONE_ORDER: Record<BunkTone, number> = {
  risk: 0,
  edge: 1,
  safe: 2,
  pending: 3,
};

export function SkipMeter() {
  const copy = useStudentCopy();
  const isDemo = useSession().session?.kind === "demo";
  const profile = useProfile();
  const [filter, setFilter] = useState<"all" | "attention">("all");
  const rows = useMemo(
    () =>
      mergeTheoryPracticalCourses(
        profile.data?.courses ?? [],
        profile.data?.attendanceSource,
      )
        .map((course) => {
          const stats = courseAttendance(course);
          return { stats, budget: bunkBudget(stats) };
        })
        .sort(
          (a, b) =>
            TONE_ORDER[a.budget.tone] - TONE_ORDER[b.budget.tone] ||
            b.budget.count - a.budget.count,
        ),
    [profile.data],
  );
  const needsAttention = rows.filter(
    (row) => row.budget.tone === "risk" || row.budget.tone === "edge",
  );
  const visible = filter === "all" ? rows : needsAttention;
  if (profile.isLoading) return <ShimmerBlock className="h-72" />;
  if (!rows.length) return null;

  return (
    <Section
      className="home-subjects"
      title={isDemo ? copy.skipTitle : "Your subjects"}
      action={
        <Link href={STUDENT_ROUTES.attendance} className="home-text-link">
          Plan attendance
          <ArrowUpRight aria-hidden className="size-4" />
        </Link>
      }
    >
      <div className="home-subject-toolbar">
        <p>
          {isDemo
            ? copy.skipDescription
            : "Your 75% target, subject by subject."}
        </p>
        <div className="home-filter" aria-label="Filter subjects">
          <button
            type="button"
            aria-pressed={filter === "all"}
            onClick={() => setFilter("all")}
          >
            All <span>{rows.length}</span>
          </button>
          <button
            type="button"
            aria-pressed={filter === "attention"}
            onClick={() => setFilter("attention")}
          >
            Needs attention <span>{needsAttention.length}</span>
          </button>
        </div>
      </div>
      <ul className="home-subject-list">
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map(({ stats, budget }) => (
            <motion.li
              layout="position"
              key={stats.course.courseCode + stats.course.courseTitle}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                href={STUDENT_ROUTES.attendance}
                className="home-subject-tile"
                data-tone={budget.tone}
              >
                <span className="home-subject-top">
                  <span>{stats.course.courseCode}</span>
                  <ArrowUpRight aria-hidden className="size-4" />
                </span>
                <h3>{titleCase(stats.course.courseTitle)}</h3>
                <span className="home-subject-result">
                  <span className="home-subject-score">
                    {stats.isPending ? "—" : stats.percent.toFixed(1)}
                    {!stats.isPending && <small>%</small>}
                  </span>
                  <span className="home-subject-recovery">
                    {stats.isPending ? (
                      "Not started"
                    ) : (
                      <>
                        <strong>
                          {budget.tone === "risk"
                            ? `Attend ${budget.count}`
                            : `${budget.count} to spare`}
                        </strong>
                        <small>
                          {budget.tone === "risk"
                            ? "to reach 75%"
                            : "within your 75% target"}
                        </small>
                      </>
                    )}
                  </span>
                </span>
                <span
                  className="home-subject-track"
                  aria-hidden
                  style={
                    {
                      "--subject-percent": `${Math.max(0, Math.min(100, stats.percent))}%`,
                    } as CSSProperties
                  }
                >
                  <span />
                  <i />
                </span>
                <span className="home-subject-bottom">
                  {stats.isPending
                    ? "Waiting for your first class"
                    : `${stats.present} of ${stats.conducted} classes attended`}
                  <ArrowRight aria-hidden className="size-3.5" />
                </span>
              </Link>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {visible.length === 0 && (
        <p className="home-subject-empty">
          All your subjects are on track. Keep it going.
        </p>
      )}
    </Section>
  );
}
