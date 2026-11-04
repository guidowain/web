// Brief: lectura sin conexión. Red primero; la copia guardada solo se usa si falla la red.
const CACHE = 'brief-v2'
const SHELL = ['/brief.css', '/brief-icon.svg', '/brief-icon-180.png', '/brief-icon-192.png', '/brief.webmanifest']
const MAX_PAGES = 30

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()))
})
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(key => key.startsWith('brief-') && key !== CACHE).map(key => caches.delete(key))))
    .then(() => self.clients.claim()))
})

async function trim(cache) {
  const pages = (await cache.keys()).filter(request => new URL(request.url).pathname.startsWith('/brief') && !SHELL.includes(new URL(request.url).pathname))
  for (const request of pages.slice(0, Math.max(0, pages.length - MAX_PAGES))) await cache.delete(request)
}

async function networkFirst(request, isPage) {
  const cache = await caches.open(CACHE)
  try {
    const response = await fetch(request)
    if (response.ok && response.type === 'basic' && !response.redirected) {
      await cache.put(request, response.clone())
      if (isPage) trim(cache)
    }
    return response
  } catch {
    const cached = await cache.match(request) || (isPage ? await cache.match('/brief') : null)
    if (cached) return cached
    if (!isPage) return Response.error()
    return new Response('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Brief</title><link rel="stylesheet" href="/brief.css"><main class="message"><p class="brand login-brand">Brief</p><p>Sin conexión y sin una edición guardada.</p><p><a class="pill" href="/brief">Reintentar</a></p></main>',
      { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  }
}

self.addEventListener('fetch', event => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (request.mode === 'navigate' && url.pathname.startsWith('/brief') && !url.pathname.startsWith('/brief/login')) {
    event.respondWith(networkFirst(request, true))
  } else if (SHELL.includes(url.pathname) || url.pathname.startsWith('/brief-icon')) {
    event.respondWith(networkFirst(request, false))
  }
})
