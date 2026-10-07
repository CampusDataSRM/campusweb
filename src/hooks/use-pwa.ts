"use client";

import { useSyncExternalStore } from "react";

import {
  installStore,
  onlineStore,
  type InstallState,
} from "@/lib/pwa/sw-client";

/** Whether the app can be installed, is installed, or needs the iOS steps. */
export function useInstallState(): InstallState {
  return useSyncExternalStore(
    installStore.subscribe,
    installStore.getSnapshot,
    installStore.getServerSnapshot,
  );
}

/** False while the device is offline. */
export function useOnline(): boolean {
  return useSyncExternalStore(
    onlineStore.subscribe,
    onlineStore.getSnapshot,
    onlineStore.getServerSnapshot,
  );
}
