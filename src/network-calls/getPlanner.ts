import type { RequestConfig } from "@/lib/api/axios-client";
import { apiClient } from "@/lib/api/axios-client";
import type { Planner } from "@/network-calls/types";

/**
 * GET /auth/planner, or GET /auth/planner/cached
 *
 * The academic-year planner: every date's day order, events and holidays.
 * Academia sessions read it live; Student Portal sessions (first-years) have
 * no Academia session, so they read the backend's cached copy. Authenticated
 * with `X-CSRF-Token` and `X-Net-ID`.
 */
export async function fetchPlanner(
  options: { cached: boolean },
  config?: RequestConfig,
): Promise<Planner> {
  const path = options.cached ? "/auth/planner/cached" : "/auth/planner";
  const { data } = await apiClient.get<Planner>(path, config);
  return data;
}
