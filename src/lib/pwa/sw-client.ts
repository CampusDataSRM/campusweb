/**
 * The page's side of the service worker (public/sw.js): registering it,
 * warming the app's pages into its cache, clearing them on sign-out, the
 * install prompt, and whether we're online. All no-ops on the server and in
 * browsers without service workers.
 */

/** Must match PAGES in public/sw.js. */
export const PAGES_CACHE = "cw-pages-v3";
const WARMED_KEY = "cw-warmed-v3";

export const swSupported = () =>
  typeof navigator !== "undefined" && "serviceWorker" in navigator;

/** Production only by default; `NEXT_PUBLIC_SW_IN_DEV=1` to try it under `next dev`. */
export const swEnabled = () =>
  process.env.NODE_ENV === "production" ||
  process.env.NEXT_PUBLIC_SW_IN_DEV === "1";

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!swSupported()) return null;
  if (!swEnabled()) {
    // A worker left over from a production build would serve stale chunks to `next dev`.
    const existing = await navigator.serviceWorker.getRegistrations();
    await Promise.all(existing.map((r) => r.unregister()));
    return null;
  }
  try {
    return await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
  } catch {
    return null;
  }
}

/** Ask the worker to cache these pages and their chunks, once per tab session. */
export async function warmPages(urls: string[]): Promise<void> {
  if (!swSupported() || !swEnabled() || urls.length === 0) return;
  if (!navigator.onLine) return;
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection;
  if (connection?.saveData) return;
  const key = `${WARMED_KEY}:${urls.join(",")}`;
  try {
    if (sessionStorage.getItem(WARMED_KEY) === key) return;
  } catch {
    // Storage blocked: warm anyway.
  }
  const registration = await navigator.serviceWorker.ready;
  registration.active?.postMessage({ type: "WARM", urls });
  try {
    sessionStorage.setItem(WARMED_KEY, key);
  } catch {
    // Ignore.
  }
}

/** Forget cached pages - on sign-out, so the next person starts clean. */
export async function clearCachedPages(): Promise<void> {
  try {
    sessionStorage.removeItem(WARMED_KEY);
  } catch {
    // Ignore.
  }
  if (typeof caches !== "undefined") {
    try {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith("cw-pages-"))
          .map((name) => caches.delete(name)),
      );
    } catch {
      // Cache storage may be unavailable; session navigation must still finish.
    }
  }
  if (swSupported())
    navigator.serviceWorker.controller?.postMessage({ type: "CLEAR_PAGES" });
}

/** Paths of the pages saved for offline use. */
export async function cachedPagePaths(): Promise<string[]> {
  if (typeof caches === "undefined") return [];
  try {
    const cache = await caches.open(PAGES_CACHE);
    const keys = await cache.keys();
    return [...new Set(keys.map((r) => new URL(r.url).pathname))];
  } catch {
    return [];
  }
}

/* ── install prompt ── */

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export interface InstallState {
  /** The browser offered an install prompt we can show. */
  canPrompt: boolean;
  /** Running as the installed app. */
  installed: boolean;
  /** iPhone/iPad Safari: install is manual, via Share > Add to Home Screen. */
  ios: boolean;
}

let deferred: BeforeInstallPromptEvent | null = null;
let installedFlag = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const SERVER_STATE: InstallState = {
  canPrompt: false,
  installed: false,
  ios: false,
};
let snapshot: InstallState = SERVER_STATE;

function standalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function compute(): InstallState {
  const ios =
    typeof navigator !== "undefined" &&
    /iphone|ipad|ipod/i.test(navigator.userAgent) &&
    !/crios|fxios/i.test(navigator.userAgent);
  const next = {
    canPrompt: deferred !== null,
    installed: installedFlag || standalone(),
    ios,
  };
  if (
    next.canPrompt !== snapshot.canPrompt ||
    next.installed !== snapshot.installed ||
    next.ios !== snapshot.ios
  ) {
    snapshot = next;
  }
  return snapshot;
}

// Listen as early as possible: the event can fire before React mounts.
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferred = event as BeforeInstallPromptEvent;
    emit();
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    installedFlag = true;
    emit();
  });
}

export const installStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: compute,
  getServerSnapshot: () => SERVER_STATE,
};

/** Show the browser's install prompt; true when the reader accepted. */
export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false;
  const event = deferred;
  deferred = null;
  emit();
  await event.prompt();
  const { outcome } = await event.userChoice;
  return outcome === "accepted";
}

/* ── online status ── */

export const onlineStore = {
  subscribe(listener: () => void) {
    window.addEventListener("online", listener);
    window.addEventListener("offline", listener);
    return () => {
      window.removeEventListener("online", listener);
      window.removeEventListener("offline", listener);
    };
  },
  getSnapshot: () => navigator.onLine,
  getServerSnapshot: () => true,
};
