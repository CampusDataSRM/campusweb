import { queryOptions } from "@tanstack/react-query";

import type { RequestConfig } from "@/lib/api/axios-client";
import { apiClient } from "@/lib/api/axios-client";
import { queryKeys } from "@/network-calls/query-keys";
import type { ClubEventsResponse } from "@/network-calls/types";

/**
 * GET /users/club-events
 *
 * Authenticated endpoint: requires the club token as the `Authorization` header
 *   fetchClubEvents({ headers: { Authorization: `Bearer ${token}` } })
 *
 * Typed fetcher through the shared axios client; direct client-to-API calls
 * against NEXT_PUBLIC_SERVE, with no Next.js proxy in between.
 */
export async function fetchClubEvents(
  config?: RequestConfig,
): Promise<ClubEventsResponse> {
  const { data } = await apiClient.get<ClubEventsResponse>(
    "/users/club-events",
    config,
  );
  return data;
}

/**
 * Single source of truth for this query — used by server prefetches
 * (queryClient.prefetchQuery) and client hooks (useQuery) alike, guaranteeing
 * identical keys and fetchers on both sides.
 */
export const clubEventsQueryOptions = (config?: RequestConfig) =>
  queryOptions({
    queryKey: queryKeys.clubEvents.current,
    queryFn: () => fetchClubEvents(config),
  });
