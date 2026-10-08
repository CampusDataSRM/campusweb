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
 * Typed fetcher through the shared axios client; direct client-to-API calls
 * against NEXT_PUBLIC_SERVE, with no Next.js proxy in between.
 */
export async function logoutUser(config?: RequestConfig): Promise<string> {
  const logoutConfig: RequestConfig = {
    ...config,
    // The current unified session has already been revoked intentionally.
    skipSessionRevokedRedirect: true,
  };
  const { data } = await apiClient.get<string>("/auth/logoutuser", logoutConfig);
  return data;
}
