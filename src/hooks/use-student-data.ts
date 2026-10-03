"use client";

/**
 * The student's data, cache-first, for the signed-in session.
 *
 * Every hook resolves its endpoints through StudentDataApi (live, demo or
 * public), keys its cache by the account, and paints the saved copy before
 * the network answers. Dependent data waits for what it needs: the timetable
 * needs the profile's batch.
 */

import { useMemo } from "react";

import { useSession } from "@/context/session-context";
import {
  usePersistedQuery,
  type PersistedQueryResult,
} from "@/hooks/use-persisted-query";
import { isUsableProfile } from "@/lib/student/profile";
import { batchFromCombo } from "@/lib/student/timetable";
import { queryKeys } from "@/network-calls/query-keys";
import {
  createStudentDataApi,
  type StudentDataApi,
} from "@/network-calls/student-data-api";
import type {
  Club,
  ClubEvent,
  Planner,
  StudentProfile,
  TimetableResponse,
} from "@/network-calls/types";

/** Profile and timetable change rarely; refresh at most every 5 minutes. */
const STUDENT_STALE_MS = 5 * 60 * 1000;

export function useStudentDataApi(): StudentDataApi & { ready: boolean } {
  const { session, hydrated } = useSession();
  return useMemo(
    () => Object.assign(createStudentDataApi(session), { ready: hydrated }),
    [session, hydrated],
  );
}

export function useProfile(): PersistedQueryResult<StudentProfile> {
  const api = useStudentDataApi();
  return usePersistedQuery({
    queryKey: queryKeys.student.profile(api.scope),
    queryFn: () => api.profile(),
    cache: { scope: api.scope, resource: "profile" },
    enabled: api.ready && api.hasStudentData,
    isUsable: isUsableProfile,
    staleTime: STUDENT_STALE_MS,
  });
}

export function useTimetable(): PersistedQueryResult<TimetableResponse> {
  const api = useStudentDataApi();
  const profile = useProfile();
  const batch = batchFromCombo(profile.data?.comboBatch) ?? 1;
  const hasBatch = profile.data !== undefined;
  return usePersistedQuery({
    queryKey: queryKeys.student.timetable(api.scope, batch),
    queryFn: () => api.timetable(batch),
    cache: { scope: api.scope, resource: `timetable-${batch}` },
    enabled: api.ready && api.hasStudentData && hasBatch,
    isUsable: (value) => !!value?.timetable,
    staleTime: STUDENT_STALE_MS,
  });
}

export function usePlanner(): PersistedQueryResult<Planner> {
  const api = useStudentDataApi();
  return usePersistedQuery({
    queryKey: queryKeys.student.planner(api.scope),
    queryFn: () => api.planner(),
    cache: { scope: api.scope, resource: "planner" },
    enabled: api.ready && api.hasStudentData,
    isUsable: (value) => typeof value === "object" && value !== null,
    staleTime: 30 * 60 * 1000,
  });
}

export function useEvents(): PersistedQueryResult<ClubEvent[]> {
  const api = useStudentDataApi();
  return usePersistedQuery({
    queryKey: queryKeys.events.list(api.scope),
    queryFn: () => api.events(),
    cache: { scope: api.scope, resource: "events" },
    enabled: api.ready,
  });
}

export function useClubs(): PersistedQueryResult<Club[]> {
  const api = useStudentDataApi();
  return usePersistedQuery({
    queryKey: queryKeys.clubs.list(api.scope),
    queryFn: () => api.clubs(),
    cache: { scope: api.scope, resource: "clubs" },
    enabled: api.ready,
  });
}
