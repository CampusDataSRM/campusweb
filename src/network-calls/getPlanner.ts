import { queryOptions, useQuery } from "@tanstack/react-query";

import type { RequestConfig } from "@/lib/api/axios-client";
import { apiClient } from "@/lib/api/axios-client";
import { queryKeys } from "@/network-calls/query-keys";
import type { Planner } from "@/network-calls/types";

/**
 * GET /auth/planner
 *
 * Authenticated endpoint: requires the Academia session cookies (the login
 * response's `Cookies` string) as the `X-CSRF-Token` header, e.g.
 *   fetchPlanner({ headers: { "X-CSRF-Token": cookies } })
 * Global header wiring happens at integration time.
 *
 * Typed fetcher through the shared axios client:
 * - server-side (RSC/prefetch): direct to API_BASE_URL
 * - client-side: same-origin /api, proxied by the Next.js rewrite
 */
export async function fetchPlanner(config?: RequestConfig): Promise<Planner> {
  const { data } = await apiClient.get<Planner>("/auth/planner", config);
  return data;
}

/**
 * Single source of truth for this query — used by server prefetches
 * (queryClient.prefetchQuery) and client hooks (useQuery) alike, guaranteeing
 * identical keys and fetchers on both sides.
 */
export const plannerQueryOptions = (config?: RequestConfig) =>
  queryOptions({
    queryKey: queryKeys.planner.current,
    queryFn: () => fetchPlanner(config),
  });

/** Client-side hook. Server-hydrated data is picked up automatically. */
export function usePlanner() {
  return useQuery(plannerQueryOptions());
}
