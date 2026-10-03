import type { RequestConfig } from "@/lib/api/axios-client";
import { apiClient } from "@/lib/api/axios-client";
import type { AllEventsResponse } from "@/network-calls/types";

/**
 * GET /users/allevent
 *
 * Public endpoint — no auth headers required. Returns every club event
 * (currently live, recruitment and otherwise).
 *
 * Typed fetcher through the shared axios client; direct client-to-API calls
 * against NEXT_PUBLIC_SERVE, with no Next.js proxy in between.
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
