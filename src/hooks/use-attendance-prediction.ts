"use client";

/**
 * Attendance prediction state for the Attendance page.
 *
 * - `missed`: upcoming days the student plans to skip (session only);
 * - `credited`: OD/ML days, persisted per account + semester and applied on
 *   load, so recorded absences on those days count as present.
 * The predicted courses replace the real ones on screen until cleared.
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

import { useNow } from "@/hooks/use-now";
import {
  usePlanner,
  useProfile,
  useStudentDataApi,
  useTimetable,
} from "@/hooks/use-student-data";
import {
  mergeTheoryPracticalCourses,
  predictAttendance,
  type PredictionResult,
} from "@/lib/student/attendance";
import { readOdMlDates, writeOdMlDates } from "@/lib/student/od-ml-store";
import type { UserCourse } from "@/network-calls/types";

export interface AttendancePredictionState {
  /** Recorded attendance, before any local prediction. */
  baseCourses: UserCourse[];
  courses: UserCourse[];
  /** The prediction applied on screen, if any. */
  result: PredictionResult | null;
  missed: Date[];
  credited: Date[];
  /** Planner + timetable are loaded, so a prediction can be computed. */
  ready: boolean;
  /** Compute a draft without saving it or changing the attendance page. */
  preview(
    missed: Date[],
    credited: Date[],
  ): PredictionResult | "no-dates" | "past-dates" | null;
  apply(
    missed: Date[],
    credited: Date[],
  ): "ok" | "no-classes" | "no-dates" | "past-dates";
  clear(): void;
}

export function useAttendancePrediction(): AttendancePredictionState {
  const now = useNow();
  const api = useStudentDataApi();
  const profile = useProfile();
  const planner = usePlanner();
  const timetable = useTimetable();
  const queryClient = useQueryClient();
  const semester = profile.data?.semester ?? "";
  const odMlKey = useMemo(
    () => ["od-ml", api.scope, semester] as const,
    [api.scope, semester],
  );

  const [missed, setMissed] = useState<Date[]>([]);
  const savedCredited = useQuery({
    queryKey: odMlKey,
    queryFn: () => readOdMlDates(api.scope, semester),
    enabled: api.ready && api.hasStudentData && profile.data !== undefined,
    staleTime: Infinity,
  });
  const credited = useMemo(
    () => savedCredited.data ?? [],
    [savedCredited.data],
  );

  const baseCourses = useMemo(
    () =>
      mergeTheoryPracticalCourses(
        profile.data?.courses ?? [],
        profile.data?.attendanceSource,
      ),
    [profile.data],
  );
  const ready =
    !!now &&
    !!planner.data &&
    !!timetable.data?.timetable &&
    baseCourses.length > 0;

  const compute = useCallback(
    (absent: Date[], odMl: Date[]) =>
      ready
        ? predictAttendance({
            today: now!,
            absentDates: absent,
            creditedDates: odMl,
            planner: planner.data!,
            timetable: timetable.data!.timetable,
            courses: baseCourses,
          })
        : null,
    [ready, now, planner.data, timetable.data, baseCourses],
  );

  const result = useMemo(() => {
    if (missed.length === 0 && credited.length === 0) return null;
    const outcome = compute(missed, credited);
    return outcome && typeof outcome === "object" ? outcome : null;
  }, [compute, missed, credited]);

  const apply = useCallback<AttendancePredictionState["apply"]>(
    (nextMissed, nextCredited) => {
      const outcome = compute(nextMissed, nextCredited);
      if (outcome === null) return "no-classes";
      if (typeof outcome === "string") return outcome;
      if (outcome.selectedClassCount === 0) return "no-classes";
      setMissed(nextMissed);
      queryClient.setQueryData(odMlKey, nextCredited);
      void writeOdMlDates(api.scope, semester, nextCredited);
      return "ok";
    },
    [compute, queryClient, odMlKey, api.scope, semester],
  );

  const clear = useCallback(() => {
    setMissed([]);
    queryClient.setQueryData(odMlKey, []);
    void writeOdMlDates(api.scope, semester, []);
  }, [queryClient, odMlKey, api.scope, semester]);

  return {
    baseCourses,
    courses: result?.courses ?? baseCourses,
    result,
    missed,
    credited,
    ready,
    preview: compute,
    apply,
    clear,
  };
}
