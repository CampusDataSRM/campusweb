/**
 * Centralized sessionStorage utility: synchronous, per-tab persistence.
 *
 * sessionStorage is a synchronous Web API, so — unlike the async IndexedDB
 * layer in storage.ts — these functions return values directly. Lifetime is
 * per-tab: data survives reloads and restores, but dies with the tab and is
 * not shared across tabs.
 *
 * Every value is stored as a JSON string under a `campusweb:`-prefixed key,
 * so keys never collide with other scripts on the origin and the on-disk
 * shape matches storage.ts's localStorage fallback exactly.
 *
 * Server behavior: no-ops. Reads resolve to null/[] and writes resolve —
 * safe to call from code that also renders on the server, but nothing
 * persists. All sessionStorage access is failure-tolerant: privacy modes,
 * quota errors, and disabled storage degrade to null/false/no-op instead of
 * throwing.
 *
 * `sessionSet` is an upsert: create and update are the same operation.
 */

/** Namespace so keys are identifiable in devtools and collision-free. */
const PREFIX = "campusweb:";

const isServer = () => typeof window === "undefined";

function prefixed(key: string): string {
  return PREFIX + key;
}

function serialize<T>(value: T): string {
  // JSON.stringify(undefined) returns undefined; normalize to null so values
  // round-trip identically with the storage.ts backends.
  return JSON.stringify(value ?? null);
}

function deserialize<T>(raw: string | null): T | null {
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    console.warn("[session-storage] dropping corrupt value");
    return null;
  }
}

/** Read a value. Returns `null` when missing, corrupt, or on the server. */
export function sessionGet<T>(key: string): T | null {
  if (isServer()) return null;
  try {
    return deserialize<T>(sessionStorage.getItem(prefixed(key)));
  } catch {
    return null;
  }
}

export function sessionHas(key: string): boolean {
  if (isServer()) return false;
  try {
    return sessionStorage.getItem(prefixed(key)) !== null;
  } catch {
    return false;
  }
}

/** Create or update a key (upsert). Quota/disabled-storage failures warn, not throw. */
export function sessionSet<T>(key: string, value: T): void {
  if (isServer()) return;
  try {
    sessionStorage.setItem(prefixed(key), serialize(value));
  } catch (error) {
    console.warn("[session-storage] write failed:", error);
  }
}

export function sessionDelete(key: string): void {
  if (isServer()) return;
  try {
    sessionStorage.removeItem(prefixed(key));
  } catch {
    /* nothing to recover — the key stays until it can be overwritten */
  }
}

/** All keys this module manages (namespace-stripped). */
export function sessionKeys(): string[] {
  if (isServer()) return [];
  try {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(PREFIX)) keys.push(key.slice(PREFIX.length));
    }
    return keys;
  } catch {
    return [];
  }
}

/** Remove every value this module manages (other sessionStorage keys survive). */
export function sessionClear(): void {
  if (isServer()) return;
  try {
    for (const key of sessionKeys()) sessionStorage.removeItem(prefixed(key));
  } catch {
    /* best effort */
  }
}
