import type { RequestConfig } from "@/lib/api/axios-client";
import { apiClient } from "@/lib/api/axios-client";
import type { LikeAction } from "@/network-calls/types";

/**
 * PUT /users/eventaction and /users/clubaction - like or unlike.
 *
 * The backend takes everything in headers: `action`, the target id, and the
 * student's `X-CSRF-Token` (merged from `config`). A 409 means the action was
 * already applied - callers treat it as success.
 */

export async function putEventAction(
  eventId: string,
  action: LikeAction,
  config?: RequestConfig,
): Promise<void> {
  await apiClient.put("/users/eventaction", undefined, {
    ...config,
    headers: { ...config?.headers, action, eventid: eventId },
  });
}

export async function putClubAction(
  clubId: string,
  action: LikeAction,
  config?: RequestConfig,
): Promise<void> {
  await apiClient.put("/users/clubaction", undefined, {
    ...config,
    headers: { ...config?.headers, action, clubid: clubId },
  });
}
