import { queryOptions, useQuery } from "@tanstack/react-query";

import type { RequestConfig } from "@/lib/api/axios-client";
import { apiClient } from "@/lib/api/axios-client";
import { queryKeys } from "@/network-calls/query-keys";
import type { AllClubsResponse } from "@/network-calls/types";

/**
 * GET /users/allclub
 *
 * Public endpoint — no auth headers required. Returns every club.
 *
 * Typed fetcher through the shared axios client; direct client-to-API calls
 * against NEXT_PUBLIC_SERVE, with no Next.js proxy in between.
 */
export async function fetchAllClubs(
  config?: RequestConfig,
): Promise<AllClubsResponse> {
  const { data } = await apiClient.get<AllClubsResponse>(
    "/users/allclub",
    config,
  );
  return data;
}

/**
 * Single source of truth for this query — used by server prefetches
 * (queryClient.prefetchQuery) and client hooks (useQuery) alike, guaranteeing
 * identical keys and fetchers on both sides.
 */
export const allClubsQueryOptions = (config?: RequestConfig) =>
  queryOptions({
    queryKey: queryKeys.clubs.list,
    queryFn: () => fetchAllClubs(config),
  });

/** Client-side hook. Server-hydrated data is picked up automatically. */
export function useAllClubs() {
  return useQuery(allClubsQueryOptions());
}
