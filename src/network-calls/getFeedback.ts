import { queryOptions, useMutation, useQuery } from "@tanstack/react-query";

import type { RequestConfig } from "@/lib/api/axios-client";
import { apiClient } from "@/lib/api/axios-client";
import { queryKeys } from "@/network-calls/query-keys";
import type {
  FeedbackRequest,
  FeedbackResponse,
} from "@/network-calls/types";

/**
 * GET /auth/feedback
 *
 * Probes feedback-form availability. Note the backend signals the outcome
 * in the body (`status: "fail"` with HTTP 200), not via the status code —
 * check `isFeedbackAvailable` instead of relying on error handling.
 *
 * Authenticated endpoint: requires the Academia session cookies (the login
 * response's `Cookies` string) as the `X-CSRF-Token` header, e.g.
 *   fetchFeedback({ headers: { "X-CSRF-Token": cookies } })
 * Global header wiring happens at integration time.
 *
 * Typed fetcher through the shared axios client:
 * - server-side (RSC/prefetch): direct to API_BASE_URL
 * - client-side: same-origin /api, proxied by the Next.js rewrite
 */
export async function fetchFeedback(
  config?: RequestConfig,
): Promise<FeedbackResponse> {
  const { data } = await apiClient.get<FeedbackResponse>("/auth/feedback", config);
  return data;
}

/** True when the backend reports the feedback form is available. */
export function isFeedbackAvailable(response: FeedbackResponse): boolean {
  return response.status !== "fail";
}

/**
 * Single source of truth for this query — used by server prefetches
 * (queryClient.prefetchQuery) and client hooks (useQuery) alike, guaranteeing
 * identical keys and fetchers on both sides.
 */
export const feedbackQueryOptions = (config?: RequestConfig) =>
  queryOptions({
    queryKey: queryKeys.feedback.current,
    queryFn: () => fetchFeedback(config),
  });

/** Client-side hook. Server-hydrated data is picked up automatically. */
export function useFeedback() {
  return useQuery(feedbackQueryOptions());
}

/**
 * POST /auth/feedback
 *
 * Submits a rating + comment. Same body-level status semantics as the GET:
 * "fail" with HTTP 200 when the form is not available.
 *
 * Authenticated: `X-CSRF-Token` header with the Academia session cookies
 * (see fetchFeedback).
 */
export async function postFeedback(
  body: FeedbackRequest,
  config?: RequestConfig,
): Promise<FeedbackResponse> {
  const { data } = await apiClient.post<FeedbackResponse>(
    "/auth/feedback",
    body,
    config,
  );
  return data;
}

/** Client-side feedback submission mutation. */
export function useSubmitFeedback() {
  return useMutation({
    mutationFn: (body: FeedbackRequest) => postFeedback(body),
  });
}
