"use client";

/**
 * Session lifecycle actions: sign in, browse as guest, sign out.
 *
 * Navigation uses `replace` so Back never returns to a page the session no
 * longer allows; proxy.ts routes the next request on the new cookie.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { ROUTES } from "@/constants/auth";
import { STUDENT_ROUTES } from "@/constants/routes";
import { useSession } from "@/context/session-context";
import { studentRequestConfig } from "@/lib/api/request-config";
import type { StudentSession } from "@/lib/auth/session";
import { signIn, type Credentials } from "@/lib/auth/sign-in";
import { clearCacheScope } from "@/lib/cache/offline-cache";
import { notify } from "@/lib/toast";
import { postDemoLogout } from "@/network-calls/demo";
import { logoutUser } from "@/network-calls/logoutUser";
import { queryKeys } from "@/network-calls/query-keys";
import { clearCachedPages } from "@/lib/pwa/sw-client";

const scopeOf = (session: StudentSession) =>
  session.kind === "demo"
    ? "demo"
    : session.kind === "guest"
      ? "guest"
      : session.netId;

export function useSignIn() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { startSession } = useSession();

  return useMutation({
    mutationFn: (credentials: Credentials) => signIn(credentials),
    onSuccess: async (session) => {
      await startSession(session);
      // Fresh data for this account; a saved copy still paints meanwhile.
      await queryClient.invalidateQueries({
        queryKey: queryKeys.student.all(scopeOf(session)),
      });
      notify.success("Signed in", { id: "auth" });
      router.replace(ROUTES.student);
    },
  });
}

export function useBrowseAsGuest() {
  const router = useRouter();
  const { startSession } = useSession();
  return useCallback(async () => {
    await startSession({ kind: "guest", token: "", netId: "" });
    router.replace(STUDENT_ROUTES.events);
  }, [router, startSession]);
}

export function useSignOut() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session, endSession } = useSession();

  return useCallback(async () => {
    if (session) {
      const config = studentRequestConfig(session);
      // Best effort: the server session ends on its own if this fails.
      if (session.kind === "demo")
        void postDemoLogout(config).catch(() => undefined);
      else if (session.kind !== "guest")
        void logoutUser(config).catch(() => undefined);
      const scope = scopeOf(session);
      queryClient.removeQueries({ queryKey: queryKeys.student.all(scope) });
      await clearCacheScope(scope);
      await clearCachedPages();
    }
    await endSession();
    router.replace(ROUTES.home);
  }, [endSession, queryClient, router, session]);
}
