/**
 * Shared axios client for all API calls.
 *
 * URL strategy — direct client-to-API, no proxy in between:
 * every request goes straight from the browser to the API origin
 * (NEXT_PUBLIC_SERVE, inlined into the client bundle at build time). There is
 * no Next.js rewrite / same-origin proxy, so the API origin must allow CORS
 * from the frontend's origin. Because cookies live on the frontend origin and
 * auth travels as explicit headers (e.g. Authorization), requests are
 * credentialless by default.
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

function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVE ?? "",
    timeout: 15_000,
    headers: {
      "Content-Type": "application/json",
    },
    // Never let the browser's HTTP cache answer an API call. Per-account data
    // lives at shared URLs (/auth/user, /auth/timetable/2 ...) told apart only
    // by X-Net-ID / X-CSRF-Token, which the API doesn't list in Vary, while
    // it sends `Cache-Control: private, max-age=60`. Left to the HTTP cache,
    // the next account to sign in on this device is shown the previous one's
    // profile for a minute. Freshness is React Query's job; offline copies
    // live in IndexedDB, keyed by account.
    adapter: "fetch",
    fetchOptions: { cache: "no-store" },
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