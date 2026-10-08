"use client";

import {
  useIsMutating,
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { useSession } from "@/context/session-context";
import { useProfile, useStudentDataApi } from "@/hooks/use-student-data";
import {
  studentRequestConfig,
  studentPortalRequestConfig,
} from "@/lib/api/request-config";
import { readSession } from "@/lib/auth/session";
import { writeCache } from "@/lib/cache/offline-cache";
import { storageGet, storageSet } from "@/lib/storage";
import { isUsableProfile } from "@/lib/student/profile";
import {
  mergePortalAttendance,
  RefreshGate,
  usesPortalRefresh,
  type RefreshNotice,
  type RefreshTarget,
} from "@/lib/student/refresh-policy";
import { batchFromCombo } from "@/lib/student/timetable";
import { notify } from "@/lib/toast";
import { requestForceRefresh } from "@/network-calls/forceRefreshUser";
import { queryKeys } from "@/network-calls/query-keys";
import type {
  AttendanceResponse,
  StudentPortalMarksResponse,
  StudentProfile,
  TimetableResponse,
} from "@/network-calls/types";

const gate = new RefreshGate((key) => storageGet<number>(key), storageSet);

export function useStudentRefresh(target: RefreshTarget) {
  const { session, hydrated } = useSession();
  const api = useStudentDataApi();
  const profile = useProfile();
  const client = useQueryClient();
  const mutationKey = ["student-force-refresh", api.scope];
  const running = useIsMutating({ mutationKey }) > 0;
  const enabled = hydrated && !!session && session.kind !== "guest";

  const mutation = useMutation({
    mutationKey,
    retry: false,
    mutationFn: async () => {
      if (!session || session.kind === "guest")
        throw new Error("Sign in to refresh your student data.");
      const assertCurrent = async () => {
        const current = await readSession();
        if (
          !current ||
          current.kind !== session.kind ||
          current.netId !== session.netId ||
          current.token !== session.token ||
          current.sessionToken !== session.sessionToken ||
          current.sessionId !== session.sessionId
        )
          throw new Error(
            "Your account changed while refreshing. Please try again.",
          );
      };
      return gate.run(api.scope, async () => {
        await assertCurrent();
        const notices: RefreshNotice[] = [];
        const config = studentRequestConfig(session);
        let currentProfile =
          client.getQueryData<StudentProfile>(
            queryKeys.student.profile(api.scope),
          ) ?? profile.data;
        const commit = async <T>(key: QueryKey, resource: string, data: T) => {
          await client.cancelQueries({ queryKey: key, exact: true });
          await assertCurrent();
          client.setQueryData(key, data);
          const savedAt = Date.now();
          client.setQueryData([...key, "offline-copy"], { data, savedAt });
          await writeCache(api.scope, resource, data);
        };
        const commitProfile = async (value: StudentProfile) => {
          if (!isUsableProfile(value))
            throw new Error(
              "The server returned incomplete data. Keeping your saved profile.",
            );
          currentProfile = value;
          await commit(queryKeys.student.profile(api.scope), "profile", value);
        };
        const forceProfile = async () => {
          const result = await requestForceRefresh<StudentProfile>(
            "/auth/force-refresh/user",
            config,
          );
          notices.push(result.notice);
          if (result.data) await commitProfile(result.data);
        };

        if (session.kind === "demo") {
          if (target !== "timetable") await commitProfile(await api.profile());
          if (target === "dashboard" || target === "timetable") {
            const batch = batchFromCombo(currentProfile?.comboBatch) ?? 1;
            await commit(
              queryKeys.student.timetable(api.scope, batch),
              `timetable-${batch}`,
              await api.timetable(batch),
            );
          }
        } else if (usesPortalRefresh(session, currentProfile, target)) {
          // Use the existing API-origin HttpOnly cookie, including linked Academia accounts.
          if (!isUsableProfile(currentProfile))
            currentProfile = await api.profile();
          if (!isUsableProfile(currentProfile))
            throw new Error("Load your profile before refreshing.");
          const result = await requestForceRefresh<
            AttendanceResponse | StudentPortalMarksResponse
          >(`/student-portal/${target}`, studentPortalRequestConfig(session), {
            net_id: session.netId,
            force_refresh: true,
          });
          notices.push(result.notice);
          if (result.data) {
            if (result.data.status !== "success")
              throw new Error(
                "The Student Portal could not refresh your data. Please reconnect it and try again.",
              );
            if (
              target === "marks" &&
              "testPerformances" in result.data &&
              Array.isArray(result.data.testPerformances)
            ) {
              // Match the app: an empty portal response must not erase saved marks.
              if (result.data.testPerformances.length)
                await commitProfile({
                  ...currentProfile!,
                  testPerformances: result.data.testPerformances,
                });
            } else if (
              target === "attendance" &&
              "attendance" in result.data &&
              Array.isArray(result.data.attendance)
            ) {
              if (result.data.attendance.length)
                await commitProfile(
                  mergePortalAttendance(
                    currentProfile!,
                    result.data.attendance,
                  ),
                );
            } else
              throw new Error(
                "The Student Portal returned incomplete data. Keeping your saved results.",
              );
          }
        } else {
          if (
            target !== "timetable" ||
            !batchFromCombo(currentProfile?.comboBatch)
          )
            await forceProfile();
          if (target === "dashboard" || target === "timetable") {
            const batch = batchFromCombo(currentProfile?.comboBatch);
            if (!batch)
              throw new Error(
                "Could not determine your timetable batch. Please refresh your profile first.",
              );
            const result = await requestForceRefresh<TimetableResponse>(
              `/auth/force-refresh/timetable/${batch}`,
              config,
            );
            notices.push(result.notice);
            if (result.data) {
              if (!result.data.timetable)
                throw new Error(
                  "The server returned an incomplete timetable. Keeping your saved timetable.",
                );
              await commit(
                queryKeys.student.timetable(api.scope, batch),
                `timetable-${batch}`,
                result.data,
              );
            }
          }
        }
        if (target === "dashboard") {
          await assertCurrent();
          await Promise.all([
            client.invalidateQueries({
              queryKey: queryKeys.events.list(api.scope),
              exact: true,
            }),
            client.invalidateQueries({
              queryKey: queryKeys.student.planner(api.scope),
              exact: true,
            }),
          ]);
        }
        await assertCurrent();
        return {
          value: notices,
          cooldown: Math.max(
            15,
            ...notices.filter((n) => n.limited).map((n) => n.retryAfter),
          ),
        };
      });
    },
    onSuccess: (result) => {
      if ("blocked" in result) {
        notify.info(
          result.blocked === "busy"
            ? "Refresh already in progress."
            : `Just refreshed. Try again in ${result.seconds}s.`,
          { id: "student-refresh" },
        );
      } else if (result.value.some((n) => n.stale)) {
        notify.info(
          "The student portal couldn’t refresh. Showing the saved results.",
          { id: "student-refresh" },
        );
      } else if (result.value.some((n) => n.limited)) {
        const seconds = Math.max(
          ...result.value.filter((n) => n.limited).map((n) => n.retryAfter),
        );
        notify.info(
          `Recently checked. Showing saved data. Try again in ${seconds}s.`,
          { id: "student-refresh" },
        );
      } else {
        notify.success("Refresh complete", { id: "student-refresh" });
      }
    },
    onError: (error) => notify.error(error, { id: "student-refresh" }),
  });

  return { refresh: () => mutation.mutate(), isRefreshing: running, enabled };
}
