"use client";

import { CloudOff, History, RotateCw, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/api/axios-client";
import { cn } from "@/lib/utils";

/** Something failed and nothing is cached: say what, offer a retry. */
export function ErrorState({
  error,
  title = "Couldn't load this",
  onRetry,
  retrying,
  className,
}: {
  error: unknown;
  title?: string;
  onRetry?: () => void;
  retrying?: boolean;
  className?: string;
}) {
  const offline =
    typeof navigator !== "undefined" && navigator.onLine === false;
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl border border-outline-variant bg-surface-container px-6 py-10 text-center",
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-2xl bg-danger-container text-danger-accent">
        <CloudOff aria-hidden className="size-6" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="font-bold text-on-surface">{offline ? "You're offline" : title}</p>
        <p className="max-w-sm text-sm text-on-surface-muted">
          {offline ? "Check your connection, then try again." : getErrorMessage(error)}
        </p>
      </div>
      {onRetry && (
        <Button variant="tonal" size="touch" onClick={onRetry} disabled={retrying}>
          <RotateCw aria-hidden className={cn(retrying && "animate-spin")} />
          Try again
        </Button>
      )}
    </div>
  );
}

/** Nothing to show yet - a friendly explanation, not a blank page. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl border border-dashed border-outline-variant px-6 py-12 text-center",
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-2xl bg-surface-highest text-on-surface-muted">
        <Icon aria-hidden className="size-6" />
      </span>
      <div className="flex flex-col gap-1">
        <p className="font-bold text-on-surface">{title}</p>
        {description && <p className="max-w-sm text-sm text-on-surface-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

const relativeTime = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function timeAgo(savedAt: number): string {
  const minutes = Math.round((savedAt - Date.now()) / 60_000);
  if (Math.abs(minutes) < 60) return relativeTime.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return relativeTime.format(hours, "hour");
  return relativeTime.format(Math.round(hours / 24), "day");
}

/** Shown when the screen is painting the saved copy, not fresh data. */
export function CachedBadge({ savedAt, refreshing }: { savedAt: number | null; refreshing?: boolean }) {
  if (savedAt === null) return null;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-warning/40 bg-warning-container px-2.5 py-1 text-xs font-bold text-on-warning-container"
      title={`Saved ${new Date(savedAt).toLocaleString()}`}
    >
      <History aria-hidden className={cn("size-3.5", refreshing && "animate-spin")} />
      {refreshing ? "Updating" : `Saved ${timeAgo(savedAt)}`}
    </span>
  );
}

/** Palette-coloured shimmer block. */
export function ShimmerBlock({ className }: { className?: string }) {
  return <Skeleton className={cn("skeleton-shimmer rounded-2xl", className)} />;
}
