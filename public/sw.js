// Retire the old full-app worker and cached login screens.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", event => event.waitUntil((async () => {
  const keys = await caches.keys();
  await Promise.all(keys.filter(key => key.startsWith("cw-")).map(key => caches.delete(key)));
  await self.registration.unregister();
})()));
