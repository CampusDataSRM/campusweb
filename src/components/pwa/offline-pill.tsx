"use client";

import { WifiOff } from "lucide-react";

import { useOnline } from "@/hooks/use-pwa";

/** A quiet header pill while the device is offline. */
export function OfflinePill() {
  const online = useOnline();
  if (online) return null;
  return (
    <span
      className="offline-pill"
      role="status"
      title="You're offline. Pages and data you've opened before still work."
    >
      <WifiOff aria-hidden className="size-3.5" />
      Offline
    </span>
  );
}
