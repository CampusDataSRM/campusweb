/**
 * Centralized persistent key-value storage: IndexedDB with localStorage fallback.
 *
 * Every value is stored as a JSON string in both backends, so data round-trips
 * identically regardless of which one is live. Prefer this module over touching
 * `indexedDB`/`localStorage` directly.
 *
 * Backend selection (lazy, per session):
 * - IndexedDB when it opens successfully (the common case).
 * - localStorage when IndexedDB is missing or fails to open — old browsers,
 *   Safari private mode, storage disabled, open blocked by another tab.
 * - No backend on the server: reads resolve to null/[] and writes resolve —
 *   safe to call from code that also renders on the server (RSC prefetches),
 *   but nothing persists.
 *
 * If IndexedDB fails mid-operation after opening (db closed by the browser,
 * quota), the module demotes itself to localStorage for the rest of the
 * session and retries the operation there. Note the trade-off: values written
 * only to IndexedDB before a demotion are not visible through the fallback.
 *
 * `storageSet` is an upsert: create and update are the same operation.
 */

const DB_NAME = "campusweb";
const DB_VERSION = 1;
const STORE_NAME = "kv";
/** localStorage namespace so fallback keys never collide with other origins' data. */
const LS_PREFIX = "campusweb:";

type Backend = "indexeddb" | "localstorage" | "none";

const isServer = () => typeof window === "undefined";

let backend: Backend | null = null;
let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDatabase(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    if (typeof indexedDB === "undefined") return resolve(null);
    let settled = false;
    const settle = (db: IDBDatabase | null) => {
      if (!settled) {
        settled = true;
        resolve(db);
      }
    };
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE_NAME)) {
          request.result.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => settle(request.result);
      request.onerror = () => settle(null);
      request.onblocked = () => settle(null);
    } catch {
      settle(null);
    }
  });
  return dbPromise;
}

async function resolveBackend(): Promise<Backend> {
  if (isServer()) return "none";
  if (backend) return backend;
  const db = await openDatabase();
  backend = db
    ? "indexeddb"
    : typeof localStorage !== "undefined"
      ? "localstorage"
      : "none";
  return backend;
}

/** After a mid-session IndexedDB failure, stop using it and drop the handle. */
function demoteToLocalStorage() {
  backend = typeof localStorage !== "undefined" ? "localstorage" : "none";
  dbPromise = null;
}

/** Run one request-producing op inside its own transaction. */
function runTx<T>(
  db: IDBDatabase,
  mode: IDBTransactionMode,
  op: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    let request: IDBRequest<T>;
    try {
      request = op(tx.objectStore(STORE_NAME));
    } catch (error) {
      reject(error);
      return;
    }
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    tx.onabort = () => reject(tx.error);
    tx.onerror = () => reject(tx.error);
  });
}

/* ── localStorage fallback primitives (all failure-tolerant) ── */

function lsKey(key: string): string {
  return LS_PREFIX + key;
}

function lsGet(key: string): string | null {
  try {
    return localStorage.getItem(lsKey(key));
  } catch {
    return null;
  }
}

function lsSet(key: string, raw: string): void {
  try {
    localStorage.setItem(lsKey(key), raw);
  } catch (error) {
    console.warn("[storage] localStorage write failed:", error);
  }
}

function lsDelete(key: string): void {
  try {
    localStorage.removeItem(lsKey(key));
  } catch {
    /* nothing to recover — the key stays until it can be overwritten */
  }
}

function lsKeys(): string[] {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(LS_PREFIX)) keys.push(key.slice(LS_PREFIX.length));
    }
    return keys;
  } catch {
    return [];
  }
}

function lsClear(): void {
  try {
    for (const key of lsKeys()) localStorage.removeItem(lsKey(key));
  } catch {
    /* best effort */
  }
}

/* ── shared JSON plumbing ── */

function serialize<T>(value: T): string {
  // JSON.stringify(undefined) returns undefined, and IDB put(undefined) throws
  // a DataError — normalize to null so the backends stay interchangeable.
  return JSON.stringify(value ?? null);
}

function deserialize<T>(raw: string | null | undefined): T | null {
  if (raw === null || raw === undefined) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    console.warn("[storage] dropping corrupt value");
    return null;
  }
}

/* ── public API ── */

/** Read a value. Resolves to `null` when missing, corrupt, or on the server. */
export async function storageGet<T>(key: string): Promise<T | null> {
  const active = await resolveBackend();
  if (active === "none") return null;

  if (active === "localstorage") return deserialize<T>(lsGet(key));

  try {
    const db = await openDatabase();
    if (!db) throw new Error("IndexedDB unavailable");
    const raw = await runTx(db, "readonly", (store) => store.get(key));
    return deserialize<T>(raw as string | undefined);
  } catch {
    demoteToLocalStorage();
    return deserialize<T>(lsGet(key));
  }
}

export async function storageHas(key: string): Promise<boolean> {
  const active = await resolveBackend();
  if (active === "none") return false;

  if (active === "localstorage") return lsGet(key) !== null;

  try {
    const db = await openDatabase();
    if (!db) throw new Error("IndexedDB unavailable");
    const count = await runTx(db, "readonly", (store) => store.count(key));
    return count > 0;
  } catch {
    demoteToLocalStorage();
    return lsGet(key) !== null;
  }
}

/** Create or update a key (upsert). */
export async function storageSet<T>(key: string, value: T): Promise<void> {
  const active = await resolveBackend();
  if (active === "none") return;

  const raw = serialize(value);
  if (active === "localstorage") {
    lsSet(key, raw);
    return;
  }

  try {
    const db = await openDatabase();
    if (!db) throw new Error("IndexedDB unavailable");
    await runTx(db, "readwrite", (store) => store.put(raw, key));
  } catch {
    demoteToLocalStorage();
    lsSet(key, raw);
  }
}

export async function storageDelete(key: string): Promise<void> {
  const active = await resolveBackend();
  if (active === "none") return;

  if (active === "localstorage") {
    lsDelete(key);
    return;
  }

  try {
    const db = await openDatabase();
    if (!db) throw new Error("IndexedDB unavailable");
    await runTx(db, "readwrite", (store) => store.delete(key));
  } catch {
    demoteToLocalStorage();
    lsDelete(key);
  }
}

/** All keys in the store (namespace-stripped). */
export async function storageKeys(): Promise<string[]> {
  const active = await resolveBackend();
  if (active === "none") return [];

  if (active === "localstorage") return lsKeys();

  try {
    const db = await openDatabase();
    if (!db) throw new Error("IndexedDB unavailable");
    // Keys are only ever written as strings (see storageSet), so narrow.
    return (await runTx(db, "readonly", (store) =>
      store.getAllKeys(),
    )) as string[];
  } catch {
    demoteToLocalStorage();
    return lsKeys();
  }
}

/** Remove every value this module manages (other localStorage keys survive). */
export async function storageClear(): Promise<void> {
  const active = await resolveBackend();
  if (active === "none") return;

  if (active === "localstorage") {
    lsClear();
    return;
  }

  try {
    const db = await openDatabase();
    if (!db) throw new Error("IndexedDB unavailable");
    await runTx(db, "readwrite", (store) => store.clear());
  } catch {
    demoteToLocalStorage();
    lsClear();
  }
}
