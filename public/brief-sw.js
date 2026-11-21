// Retirement worker: remove the old offline cache and unregister itself.
self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting())
})
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.filter(key => key.startsWith('brief-')).map(key => caches.delete(key)))
    await self.registration.unregister()
  })())
})
