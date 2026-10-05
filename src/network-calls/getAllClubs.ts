import type { RequestConfig } from "@/lib/api/axios-client";
import { apiClient } from "@/lib/api/axios-client";
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
