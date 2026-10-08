"use client";

/**
 * Unlock attendance and marks from the Student Portal when the backend says
 * its session is needed (`studentPortalLoginRequired`): sign in to the
 * portal (the browser keeps its HttpOnly cookie), pull fresh attendance,
 * then reload the profile.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useSession } from "@/context/session-context";
import { useStudentDataApi } from "@/hooks/use-student-data";
import { studentPortalRequestConfig } from "@/lib/api/request-config";
import { toSignInError } from "@/lib/auth/sign-in-error";
import { notify } from "@/lib/toast";
import { postAttendance } from "@/network-calls/getAttendance";
import { queryKeys } from "@/network-calls/query-keys";
import { postStudentPortalLogin } from "@/network-calls/studentPortalLogin";

export function useStudentPortalUnlock() {
  const { session, startSession } = useSession();
  const api = useStudentDataApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (password: string) => {
      if (!session || session.kind === "guest" || session.kind === "demo")
        return;
      const config = studentPortalRequestConfig(session);
      try {
        const response = await postStudentPortalLogin(
          { net_id: session.netId, password },
          config,
        );
        if (response.status !== "success")
          throw new Error("Student Portal login failed.");
        // Portal reauthentication can rotate its unified token. Persist it before
        // attendance/profile requests so they use the new session immediately.
        // Academia sessions retain their own provider token while linking the portal.
        const refreshed =
          session.kind === "student-portal" && response.session_token
            ? {
                ...session,
                sessionToken: response.session_token,
                ...(response.session_id
                  ? { sessionId: response.session_id }
                  : {}),
              }
            : session;
        if (refreshed !== session) await startSession(refreshed);
        await postAttendance(
          { net_id: session.netId, force_refresh: true },
          studentPortalRequestConfig(refreshed),
        );
      } catch (error) {
        throw toSignInError(error);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.student.profile(api.scope),
      });
      notify.success("Attendance updated");
    },
  });
}
