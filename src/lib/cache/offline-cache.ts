/**
 * Offline cache: the last good copy of each data resource, per account, in
 * persistent storage (IndexedDB through lib/storage.ts).
 *
 * Screens paint from this immediately and refresh behind it - the app's
 * cache-first behaviour - and it is what keeps a student's data on screen
 * when the network or upstream portals are down. Keys are scoped by account
 * so a shared device never shows one student another's data.
 */

import { storageDelete, storageGet, storageKeys, storageSet } from "@/lib/storage";

const PREFIX = "offline:";

export interface CacheEntry<T> {
  data: T;
  /** Epoch ms the copy was saved. */
  savedAt: number;
}

const keyFor = (scope: string, resource: string) =>
  `${PREFIX}${scope}:${resource}`;

export async function readCache<T>(
  scope: string,
  resource: string,
): Promise<CacheEntry<T> | null> {
  const entry = await storageGet<CacheEntry<T>>(keyFor(scope, resource));
  return entry && typeof entry.savedAt === "number" ? entry : null;
}

export async function writeCache<T>(
  scope: string,
  resource: string,
  data: T,
): Promise<void> {
  await storageSet<CacheEntry<T>>(keyFor(scope, resource), {
    data,
    savedAt: Date.now(),
  });
}

/** Drop every cached resource of one account (sign-out). */
export async function clearCacheScope(scope: string): Promise<void> {
  const prefix = `${PREFIX}${scope}:`;
  const keys = await storageKeys();
  await Promise.all(
    keys.filter((key) => key.startsWith(prefix)).map((key) => storageDelete(key)),
  );
}
