import type { Metadata } from "next";

import { OfflineView } from "@/components/pwa/offline-view";

export const metadata: Metadata = { title: "Offline" };

/** Precached by the service worker; served when a page can't be reached. */
export default function OfflinePage() {
  return <OfflineView />;
}
