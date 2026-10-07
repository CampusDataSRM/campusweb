/*
 * Campus Web service worker - caches the UI layer so the app opens fast and
 * works offline. Student data is NOT cached here: the app keeps that in
 * IndexedDB itself (src/lib/storage.ts) and shows "Saved ... ago".
 *
 *   /_next/static/*        content-hashed JS/CSS/fonts   cache-first
 *   page navigations       HTML                          network-first (4s), then cache, then /offline?from=
 *   images, public files,  icons, artwork, catalogue     stale-while-revalidate
 *   /data/*, /_next/image
 *   /api, RSC payloads     data and router payloads      never touched
 *   other origins          the API, Drive, analytics     never touched
 *
 * Messages from the page (src/lib/pwa/sw-client.ts):
 *   { type: "WARM", urls }   fetch these pages and their chunks into the cache
 *   { type: "CLEAR_PAGES" }  forget cached pages (on sign-out)
 *
 * Bump VERSION when this file's caching rules change; old caches are dropped
 * on activate. Served with no-cache (next.config.ts) so updates land at once.
 */

const VERSION = "v2";
const STATIC = `cw-static-${VERSION}`;
const PAGES = `cw-pages-${VERSION}`;
const ASSETS = `cw-assets-${VERSION}`;
const CURRENT = [STATIC, PAGES, ASSETS];
const LIMITS = { [STATIC]: 600, [PAGES]: 60, [ASSETS]: 250 };

const OFFLINE_URL = "/offline";
const PRECACHE = [
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/logo.svg",
  "/logo_png.png",
  "/manifest/icon-96x96.png",
  "/manifest/icon-192x192.png",
  "/manifest/icon-512x512.png",
];
const NETWORK_TIMEOUT_MS = 4000;
const ASSET_PATH = /\.(?:png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|otf|json|webmanifest)$/i;

/* ── lifecycle ── */

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      // The offline page with its own chunks, so it can render with no network.
      await warm([OFFLINE_URL]);
      // Then the shell artwork, one by one: a missing file must not stop the install.
      await Promise.all(
        PRECACHE.filter((url) => url !== OFFLINE_URL).map((url) =>
          fetch(url, { cache: "reload" })
            .then((response) => (cacheable(response) ? putIn(ASSETS, url, response) : null))
            .catch(() => null),
        ),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.filter((name) => name.startsWith("cw-") && !CURRENT.includes(name)).map((name) => caches.delete(name)),
      );
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable().catch(() => undefined);
      }
      await self.clients.claim();
    })(),
  );
});

/* ── routing ── */

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname === "/sw.js") return;
  // Checkout handoffs and receipts must always come from the network.
  if (url.pathname === "/app" || url.pathname === "/payment") return;
  if (url.pathname.startsWith("/api/")) return;
  // React Server Component payloads: left to Next. If one fails offline, the
  // router falls back to a full navigation, which the page handler serves.
  if (request.headers.get("RSC") === "1" || url.searchParams.has("_rsc")) return;

  if (request.mode === "navigate") {
    event.respondWith(page(event));
    return;
  }
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, STATIC));
    return;
  }
  if (
    url.pathname.startsWith("/_next/image") ||
    url.pathname.startsWith("/data/") ||
    ["image", "font", "style", "manifest"].includes(request.destination) ||
    ASSET_PATH.test(url.pathname)
  ) {
    event.respondWith(staleWhileRevalidate(event, request, ASSETS));
  }
});

/* ── strategies ── */

async function page(event) {
  const { request } = event;
  const network = (async () => {
    const preloaded = await event.preloadResponse;
    const response = preloaded || (await fetch(request));
    if (cacheable(response)) event.waitUntil(putIn(PAGES, pageKey(request.url), response.clone()));
    return response;
  })();

  // A slow network shouldn't hold the page hostage if a copy is already here.
  const timeout = new Promise((resolve) =>
    setTimeout(async () => resolve(await cachedPage(request.url)), NETWORK_TIMEOUT_MS),
  );

  try {
    const first = await Promise.race([network, timeout]);
    return first || (await network);
  } catch {
    const cached = await cachedPage(request.url);
    if (cached) return cached;
    // Redirect rather than serve the offline page under this URL: Next's
    // router would otherwise hydrate one page's payload at another's address.
    const from = new URL(request.url);
    if (from.pathname !== OFFLINE_URL && (await caches.match(OFFLINE_URL))) {
      return Response.redirect(`${OFFLINE_URL}?from=${encodeURIComponent(from.pathname + from.search)}`, 302);
    }
    return (await caches.match(OFFLINE_URL)) || Response.error();
  }
}

async function cacheFirst(request, name) {
  const cached = await caches.match(request, { cacheName: name });
  if (cached) return cached;
  const response = await fetch(request);
  if (cacheable(response)) void putIn(name, request, response.clone());
  return response;
}

async function staleWhileRevalidate(event, request, name) {
  const cached = await caches.match(request, { cacheName: name });
  const network = fetch(request)
    .then((response) => {
      if (cacheable(response)) void putIn(name, request, response.clone());
      return response;
    })
    .catch(() => null);
  if (cached) {
    event.waitUntil(network);
    return cached;
  }
  return (await network) || Response.error();
}

/* ── warming: the whole app, ready offline after the first visit ── */

const STATIC_REF = /\/_next\/static\/[^"'\s)\\]+/g;

async function warm(urls) {
  const pages = await caches.open(PAGES);
  const chunks = new Set();
  for (const url of urls) {
    try {
      const response = await fetch(url, { credentials: "same-origin", cache: "no-cache" });
      if (!cacheable(response) || response.redirected) continue;
      if (!(response.headers.get("content-type") || "").includes("text/html")) continue;
      const html = await response.clone().text();
      await pages.put(pageKey(url), response);
      for (const ref of html.match(STATIC_REF) || []) chunks.add(ref);
    } catch {
      // Offline or the page failed: it simply isn't warmed this time.
    }
  }
  const statics = await caches.open(STATIC);
  for (const ref of chunks) {
    if (await statics.match(ref)) continue;
    try {
      const response = await fetch(ref);
      if (cacheable(response)) await statics.put(ref, response);
    } catch {
      // Ignore; it will be cached when first used.
    }
  }
  await trim(PAGES);
  await trim(STATIC);
}

self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "WARM" && Array.isArray(data.urls)) {
    const urls = data.urls.filter((u) => typeof u === "string" && u.startsWith("/"));
    event.waitUntil(warm(urls));
  } else if (data.type === "CLEAR_PAGES") {
    event.waitUntil(caches.delete(PAGES));
  }
});

/* ── helpers ── */

function cacheable(response) {
  return Boolean(response) && response.ok && response.type === "basic";
}

/** Pages are stored without their query, so ?subject=... still finds the page. */
function pageKey(url) {
  const u = new URL(url, self.location.origin);
  return u.origin + u.pathname;
}

async function cachedPage(url) {
  const cache = await caches.open(PAGES);
  return (await cache.match(pageKey(url))) || null;
}

async function putIn(name, key, response) {
  const cache = await caches.open(name);
  await cache.put(key, response);
  await trim(name);
}

/** Drop the oldest entries past the cache's limit. */
async function trim(name) {
  const limit = LIMITS[name];
  if (!limit) return;
  const cache = await caches.open(name);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - limit; i++) await cache.delete(keys[i]);
}
