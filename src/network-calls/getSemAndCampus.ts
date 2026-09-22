import { queryOptions, useQuery } from "@tanstack/react-query";

import type { RequestConfig } from "@/lib/api/axios-client";
import { apiClient } from "@/lib/api/axios-client";
import { queryKeys } from "@/network-calls/query-keys";
import type { SemAndCampus } from "@/network-calls/types";

/**
 * GET /sem
 *
 * Typed fetcher through the shared axios client:
 * - server-side (RSC/prefetch): direct to API_BASE_URL
 * - client-side: same-origin /api, proxied by the Next.js rewrite
 */
export async function fetchSemAndCampus(
  config?: RequestConfig,
): Promise<SemAndCampus> {
  const { data } = await apiClient.get<SemAndCampus>("/sem", config);
  return data;
}

/**
 * Single source of truth for this query — used by server prefetches
 * (queryClient.prefetchQuery) and client hooks (useQuery) alike, guaranteeing
 * identical keys and fetchers on both sides.
 */
export const semAndCampusQueryOptions = (config?: RequestConfig) =>
  queryOptions({
    queryKey: queryKeys.sem.current,
    queryFn: () => fetchSemAndCampus(config),
  });

/** Client-side hook. Server-hydrated data is picked up automatically. */
export function useSemAndCampus() {
  return useQuery(semAndCampusQueryOptions());
}
