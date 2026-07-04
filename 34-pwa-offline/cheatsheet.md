# 🧠 Cheatsheet: PWA & Offline-First

> Referensi cepet — 1 halaman.

## Topik Utama

**Service Worker Lifecycle:** `install` → `activate` → `fetch` events. Independent dari halaman.

**Cache Strategies:**
- **Cache First** — cek cache dulu, fallback ke network (static assets)
- **Network First** — cek network dulu, fallback ke cache (API calls)
- **Stale While Revalidate** — serve cache immediately, update background (frequent updates)
- **Cache Only** — gak perlu network, content pre-cached

**IndexedDB:** Client-side database. Pake library `idb` biar simpler API.

**Background Sync:** Nunda action sampe koneksi balik (submit form offline).

**Web App Manifest:** `manifest.json` — name, icons, theme_color, display: standalone.

**Push Notifications:** VAPID keys, `pushManager.subscribe()`, web-push backend.

**Install Prompt:** `beforeinstallprompt` event — catch & show custom install button.

## Command / Sintaks Penting

```javascript
// sw.js — Service Worker
const CACHE_NAME = 'app-v1';
const PRECACHE_URLS = ['/', '/index.html', '/style.css', '/app.js', '/offline.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
```

```json
// manifest.json
{
  "name": "My PWA",
  "short_name": "MyPWA",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

```javascript
// Register Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('SW registered:', reg.scope));
}
```

```javascript
// Push notification setup
const registration = await navigator.serviceWorker.ready;
const subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
});
```

## Tips & Trik

- **Workbox** — Google's library untuk SW. Lebih gampang dari nulis SW manual
- **`event.waitUntil()`** — WAJIB di semua lifecycle event, browser gak boleh skip
- **Cache versioning** — `app-v1`, `app-v2` — hapus cache lama di `activate`
- **Offline fallback** — bikin `/offline.html` yang ditampilkan kalo cache miss
- **Lighthouse audit** — `lighthouse --view https://app.com` = cek PWA score
- **VAPID keys** — generate pake `npx web-push generate-vapid-keys`
- **Background Sync** — submit form → queue di IndexedDB → sync saat online

## Common Mistakes

- **No `event.waitUntil()`** — SW bisa mati sebelum cache selesai diisi
- **Stale cache** — versi cache gak di-update, user lihat versi lama
- **No offline fallback** — user lihat error page kalo offline
- **`beforeinstallprompt` gak ke-fire** — harus register SW + punya valid manifest dulu
- **Push notification tanpa izin** — user harus explicit allow
- **Cache semua request** — termasuk POST/API = bug, cache hanya GET
- **No `display: standalone`** di manifest — PWA gak bisa diinstall

## Link Cepat

- [Module README](README.md)
- [Quiz](quiz.md)
