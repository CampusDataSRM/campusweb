import { useMutation } from "@tanstack/react-query";

import type { RequestConfig } from "@/lib/api/axios-client";
import { apiClient } from "@/lib/api/axios-client";
import type { ForceRefreshUserResponse } from "@/network-calls/types";

/**
 * POST /auth/force-refresh/user
 *
 * Scrapes the student's full live profile fresh from Academia (bypassing the
 * server-side cache) and returns it — profile, courses with attendance hours,
 * test performances, advisors. Unlike GET /auth/user, no request body.
 *
 * Authenticated endpoint — both headers required:
 * - `X-CSRF-Token`: the Academia session cookies (login response's `Cookies` string)
 * - `X-Net-ID`: the student's net id, e.g. "ac2741"
 * e.g.
 *   forceRefreshUser({
 *     headers: { "X-CSRF-Token": cookies, "X-Net-ID": netId },
 *   })
 * Global header wiring happens at integration time.
 *
 * Typed fetcher through the shared axios client:
 * - server-side (RSC/prefetch): direct to API_BASE_URL
 * - client-side: same-origin /api, proxied by the Next.js rewrite
 */
export async function forceRefreshUser(
  config?: RequestConfig,
): Promise<ForceRefreshUserResponse> {
  const { data } = await apiClient.post<ForceRefreshUserResponse>(
    "/auth/force-refresh/user",
    undefined,
    config,
  );
  return data;
}

/** Client-side mutation. Use after stale-period or on explicit user request. */
export function useForceRefreshUser() {
  return useMutation({
    mutationFn: () => forceRefreshUser(),
  });
}
