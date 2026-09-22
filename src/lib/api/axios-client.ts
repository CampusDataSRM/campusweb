/**
 * Shared axios client for all API calls.
 *
 * URL strategy (matches the rewrite in next.config.ts):
 * - Browser: relative `/api` — requests stay same-origin and are proxied by the
 *   Next.js rewrite (`/api/:path*` -> `${API_BASE_URL}/:path*`).
 * - Server (RSC / prefetch): absolute `API_BASE_URL` — making a server-side
 *   request back to our own origin would get rewritten again and turn into a
 *   self-request, which is a known deadlock/anti-pattern. The server talks to
 *   the API origin directly instead.
 *
 * Both paths land on the exact same backend endpoints.
 */

import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";

/** Normalized error shape every consumer can rely on. */
export class ApiError extends Error {
  readonly status?: number;
  readonly data?: unknown;

  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function getBaseURL(): string {
  // Server-side: hit the API origin directly (no self-request through Next).
  if (typeof window === "undefined") {
    return process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_SERVE ?? "";
  }
  // Client-side: same-origin, proxied by the Next.js rewrite.
  return "/api";
}

function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: getBaseURL(),
    timeout: 15_000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Normalize every failure into `ApiError` so consumers (TanStack Query,
  // error boundaries, toasts) always handle a consistent error type.
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const status = error.response?.status;
      const data = error.response?.data;
      const message =
        (typeof data === "object" && data !== null && "message" in data
          ? String((data as { message: unknown }).message)
          : undefined) ??
        error.message ??
        "An unexpected error occurred";

      return Promise.reject(new ApiError(message, status, data));
    },
  );

  return client;
}

export const apiClient = createApiClient();

/** Per-call axios config override (headers, params, signal, etc.). */
export type RequestConfig = AxiosRequestConfig;

/** Extract a readable message from any thrown value. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred";
}