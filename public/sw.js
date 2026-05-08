const CACHE_NAME = "nomadlink-v1";
const STATIC_ASSETS = ["/", "/index.html"];

// Install — cache shell
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — remove old caches
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — stale-while-revalidate for same-origin; network-first for API
self.addEventListener("fetch", (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin API/auth requests
  if (request.method !== "GET") return;
  if (url.pathname.startsWith("/api/")) return;

  // Images: cache-first with long TTL
  if (request.destination === "image") {
    e.respondWith(
      caches.open(CACHE_NAME + "-images").then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const res = await fetch(request).catch(() => null);
        if (res && res.ok) cache.put(request, res.clone());
        return res || new Response("", { status: 408 });
      })
    );
    return;
  }

  // JS/CSS/fonts: stale-while-revalidate
  if (["script", "style", "font"].includes(request.destination)) {
    e.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        const networkPromise = fetch(request).then((res) => {
          if (res && res.ok) cache.put(request, res.clone());
          return res;
        }).catch(() => null);
        return cached || networkPromise;
      })
    );
    return;
  }

  // HTML navigation: network-first, fallback to cached shell
  if (request.mode === "navigate") {
    e.respondWith(
      fetch(request).catch(() => caches.match("/index.html"))
    );
  }
});
