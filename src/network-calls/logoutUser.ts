import { useMutation } from "@tanstack/react-query";

import type { RequestConfig } from "@/lib/api/axios-client";
import { apiClient } from "@/lib/api/axios-client";

/**
 * GET /auth/logoutuser
 *
 * Ends the Academia session server-side and clears the private cache.
 * Responds with a plain-text confirmation, not JSON.
 *
 * Authenticated endpoint: requires the Academia session cookies (the login
 * response's `Cookies` string) as the `X-CSRF-Token` header, e.g.
 *   logoutUser({ headers: { "X-CSRF-Token": cookies } })
 * Global header wiring happens at integration time.
 *
 * Typed fetcher through the shared axios client:
 * - server-side (RSC/prefetch): direct to API_BASE_URL
 * - client-side: same-origin /api, proxied by the Next.js rewrite
 */
export async function logoutUser(config?: RequestConfig): Promise<string> {
  const { data } = await apiClient.get<string>("/auth/logoutuser", config);
  return data;
}

/**
 * Client-side logout mutation.
 *
 * Success here only means the server session ended — client-side state
 * (cookies, storage, query cache) is cleared at integration time, e.g. in
 * the hook's onSuccess.
 */
export function useLogoutUser() {
  return useMutation({
    mutationFn: () => logoutUser(),
  });
}
