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
  const { session } = useSession();
  const api = useStudentDataApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (password: string) => {
      if (!session || session.kind === "guest" || session.kind === "demo") return;
      const config = studentPortalRequestConfig(session);
      try {
        await postStudentPortalLogin({ net_id: session.netId, password }, config);
        await postAttendance({ net_id: session.netId, force_refresh: true }, config);
      } catch (error) {
        throw toSignInError(error);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.student.profile(api.scope) });
      notify.success("Attendance updated");
    },
  });
}
