/**
 * The app's one toast API. Every toast goes through here so wording, timing
 * and de-duplication stay consistent; styling lives in <AppToaster>.
 *
 * - `id` de-duplicates: a repeated failure replaces its toast instead of
 *   stacking (e.g. every query failing at once while offline).
 * - `promise` drives one toast through loading -> success/error.
 * - Error messages are taken from ApiError when present, never raw stacks.
 */

import toast, { type ToastOptions } from "react-hot-toast";

import { getErrorMessage } from "@/lib/api/axios-client";

const DURATION = {
  success: 2800,
  info: 3600,
  error: 5000,
} as const;

type Options = Pick<ToastOptions, "id" | "duration">;

export const notify = {
  success(message: string, options?: Options) {
    return toast.success(message, { duration: DURATION.success, ...options });
  },

  error(messageOrError: unknown, options?: Options) {
    const message =
      typeof messageOrError === "string"
        ? messageOrError
        : getErrorMessage(messageOrError);
    return toast.error(message, { duration: DURATION.error, ...options });
  },

  info(message: string, options?: Options) {
    return toast(message, { duration: DURATION.info, ...options });
  },

  loading(message: string, options?: Pick<ToastOptions, "id">) {
    return toast.loading(message, options);
  },

  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((value: T) => string);
      error?: string | ((error: unknown) => string);
    },
    options?: Pick<ToastOptions, "id">,
  ) {
    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error ?? ((error: unknown) => getErrorMessage(error)),
      },
      options,
    );
  },

  dismiss(id?: string) {
    toast.dismiss(id);
  },
};
