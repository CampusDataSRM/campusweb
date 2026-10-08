import {
  apiClient,
  ApiError,
  type RequestConfig,
} from "@/lib/api/axios-client";
import {
  refreshNotice,
  type RefreshNotice,
} from "@/lib/student/refresh-policy";
import type { ForceRefreshUserResponse } from "@/network-calls/types";

/** Mirrors CampusApp ForceUpdateService. GET and POST are both supported by the API. */
export async function requestForceRefresh<T>(
  path: string,
  config: RequestConfig,
  body?: unknown,
): Promise<{ data: T | undefined; notice: RefreshNotice }> {
  const response = await apiClient.request<T>({
    ...config,
    url: path,
    method: body === undefined ? "GET" : "POST",
    data: body,
    timeout: body === undefined ? 20_000 : 30_000,
    validateStatus: () => true,
  });
  const notice = refreshNotice(response.status, response.headers);
  if (response.status === 401 || response.status === 403)
    throw new ApiError(
      "Your session has expired. Please sign in again.",
      response.status,
    );
  if (notice.limited && response.status === 429)
    return { data: undefined, notice };
  const payload = response.data as { error?: string; status?: string } | null;
  if (
    response.status !== 200 ||
    !payload ||
    typeof payload !== "object" ||
    payload.error ||
    payload.status === "fail" ||
    payload.status === "error"
  ) {
    throw new ApiError(
      "Couldn’t refresh right now. Your saved data is still available.",
      response.status,
    );
  }
  return { data: response.data, notice };
}

export async function forceRefreshUser(
  config: RequestConfig = {},
): Promise<ForceRefreshUserResponse> {
  const result = await requestForceRefresh<ForceRefreshUserResponse>(
    "/auth/force-refresh/user",
    config,
  );
  if (!result.data)
    throw new ApiError("Just refreshed. Please try again shortly.", 429);
  return result.data;
}
