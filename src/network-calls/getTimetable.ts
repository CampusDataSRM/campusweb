import type { RequestConfig } from "@/lib/api/axios-client";
import { apiClient } from "@/lib/api/axios-client";
import type { TimetableResponse } from "@/network-calls/types";

/**
 * GET /auth/timetable/{batch}
 *
 * The weekly timetable (Day1..Day5, slots keyed by time range) for a batch,
 * taken from the last digit of the profile's `comboBatch`. Authenticated with
 * `X-CSRF-Token` and `X-Net-ID`.
 */
export async function fetchTimetable(
  batch: number,
  config?: RequestConfig,
): Promise<TimetableResponse> {
  const { data } = await apiClient.get<TimetableResponse>(
    `/auth/timetable/${batch}`,
    config,
  );
  return data;
}
