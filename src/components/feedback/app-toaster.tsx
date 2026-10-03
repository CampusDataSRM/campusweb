"use client";

import { Toaster } from "react-hot-toast";

/**
 * The toast surface, themed through palette variables so it follows every
 * theme change live. Toasts sit top-right, below the safe-area inset, and
 * never grow wider than the screen.
 */
export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      gutter={10}
      containerClassName="!top-[max(1rem,env(safe-area-inset-top))]"
      toastOptions={{
        className:
          "!rounded-xl !border !border-outline-variant !bg-surface-high !px-4 !py-3 !text-sm !font-semibold !text-on-surface !shadow-lg !shadow-black/40",
        style: { maxWidth: "min(26rem, calc(100vw - 2rem))" },
        success: {
          iconTheme: {
            primary: "var(--success-accent)",
            secondary: "var(--surface-high)",
          },
        },
        error: {
          iconTheme: {
            primary: "var(--danger-accent)",
            secondary: "var(--surface-high)",
          },
        },
        loading: {
          iconTheme: {
            primary: "var(--primary-accent)",
            secondary: "var(--surface-highest)",
          },
        },
      }}
    />
  );
}
