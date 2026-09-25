import { queryOptions, useQuery } from "@tanstack/react-query";

import type { RequestConfig } from "@/lib/api/axios-client";
import { apiClient } from "@/lib/api/axios-client";
import { queryKeys } from "@/network-calls/query-keys";

/**
 * GET /auth/batch
 *
 * The signed-in student's timetable batch (1 or 2) — feed it to
 * fetchTimetable/useTimetable. The response body is a bare JSON number,
 * not an object.
 *
 * Authenticated endpoint: requires the Academia session cookies (the login
 * response's `Cookies` string) as the `X-CSRF-Token` header, e.g.
 *   fetchBatch({ headers: { "X-CSRF-Token": cookies } })
 * Global header wiring happens at integration time.
 *
 * Typed fetcher through the shared axios client:
 * - server-side (RSC/prefetch): direct to API_BASE_URL
 * - client-side: same-origin /api, proxied by the Next.js rewrite
 */
export async function fetchBatch(config?: RequestConfig): Promise<number> {
  const { data } = await apiClient.get<number>("/auth/batch", config);
  return data;
}

/**
 * Single source of truth for this query — used by server prefetches
 * (queryClient.prefetchQuery) and client hooks (useQuery) alike, guaranteeing
 * identical keys and fetchers on both sides.
 */
export const batchQueryOptions = (config?: RequestConfig) =>
  queryOptions({
    queryKey: queryKeys.batch.current,
    queryFn: () => fetchBatch(config),
  });

/** Client-side hook. Server-hydrated data is picked up automatically. */
export function useBatch() {
  return useQuery(batchQueryOptions());
}
