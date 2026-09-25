import { queryOptions, useQuery } from "@tanstack/react-query";

import type { RequestConfig } from "@/lib/api/axios-client";
import { apiClient } from "@/lib/api/axios-client";
import { queryKeys } from "@/network-calls/query-keys";
import type { AllEventsResponse } from "@/network-calls/types";

/**
 * GET /users/allevent
 *
 * Public endpoint — no auth headers required. Returns every club event
 * (currently live, recruitment and otherwise).
 *
 * Typed fetcher through the shared axios client:
 * - server-side (RSC/prefetch): direct to API_BASE_URL
 * - client-side: same-origin /api, proxied by the Next.js rewrite
 */
export async function fetchAllEvents(
  config?: RequestConfig,
): Promise<AllEventsResponse> {
  const { data } = await apiClient.get<AllEventsResponse>(
    "/users/allevent",
    config,
  );
  return data;
}

/**
 * Single source of truth for this query — used by server prefetches
 * (queryClient.prefetchQuery) and client hooks (useQuery) alike, guaranteeing
 * identical keys and fetchers on both sides.
 */
export const allEventsQueryOptions = (config?: RequestConfig) =>
  queryOptions({
    queryKey: queryKeys.events.list,
    queryFn: () => fetchAllEvents(config),
  });

/** Client-side hook. Server-hydrated data is picked up automatically. */
export function useAllEvents() {
  return useQuery(allEventsQueryOptions());
}
