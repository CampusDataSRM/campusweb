import { queryOptions, useQuery } from "@tanstack/react-query";

import type { RequestConfig } from "@/lib/api/axios-client";
import { apiClient } from "@/lib/api/axios-client";
import { queryKeys } from "@/network-calls/query-keys";
import type { TimetableResponse } from "@/network-calls/types";

/** Valid batch identifiers for the timetable endpoint. */
export type TimetableBatch = 1 | 2;

/**
 * GET /auth/timetable/{batch}
 *
 * Authenticated endpoint: requires the Academia session cookies (the login
 * response's `Cookies` string) as the `X-CSRF-Token` header, e.g.
 *   fetchTimetable(1, { headers: { "X-CSRF-Token": cookies } })
 * Global header wiring happens at integration time.
 *
 * Typed fetcher through the shared axios client:
 * - server-side (RSC/prefetch): direct to API_BASE_URL
 * - client-side: same-origin /api, proxied by the Next.js rewrite
 */
export async function fetchTimetable(
  batch: TimetableBatch,
  config?: RequestConfig,
): Promise<TimetableResponse> {
  const { data } = await apiClient.get<TimetableResponse>(
    `/auth/timetable/${batch}`,
    config,
  );
  return data;
}

/**
 * Single source of truth for this query — used by server prefetches
 * (queryClient.prefetchQuery) and client hooks (useQuery) alike, guaranteeing
 * identical keys and fetchers on both sides. The batch is part of the key,
 * so each batch caches independently.
 */
export const timetableQueryOptions = (
  batch: TimetableBatch,
  config?: RequestConfig,
) =>
  queryOptions({
    queryKey: queryKeys.timetable.byBatch(batch),
    queryFn: () => fetchTimetable(batch, config),
  });

/** Client-side hook. Server-hydrated data is picked up automatically. */
export function useTimetable(batch: TimetableBatch) {
  return useQuery(timetableQueryOptions(batch));
}
