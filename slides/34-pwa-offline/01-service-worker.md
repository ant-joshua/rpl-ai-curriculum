---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — <img src="https://images.pexels.com/photos/267350/pexels-pho"
footer: "Sesi 01: Service Worker"
---

<!-- _class: title -->
# 1. Service Worker

## Konsep Dasar

Service Worker (SW) adalah script JavaScript yang jalan di background browser, terpisah dari halaman web. SW bisa:

- **Mengintercept request** — nangkap fetch request dan decide mau ambil dari cache atau jaringan
- **Mengelola cache** — nyimpen resource (HTML, CSS, JS, gambar) biar bisa akses offline
- **Push notification** — nerima pesan dari server meskipun tab ditutup
- **Background sync** — nunda action sampe koneksi balik

### Perbedaan dengan Web Worker

| Aspek | Web Worker | Service Worker |
|-------|-----------|----------------|
| Tujuan | Compute berat di background | Proxy jaringan, cache, offline |
| Akses DOM | ❌ | ❌ |
| Akses Cache API | ❌ | ✅ |
| Lifecycle | Langsung jalan & mati | install → activate → fetch |
| Persistensi | Ikut halaman | Independent dari halaman |
| Bisa intercept fetch | ❌ | ✅ |

## Lifecycle Service Worker

```
┌──────────┐   install    ┌──────────┐   activate   ┌──────────┐
│ Parsing  │ ──────────▶  │ Installed │ ──────────▶  │ Activated │
│ & Download│             │ (waiting) │              │           │
└──────────┘             └──────────┘              └──────────┘
                                                          │
                                                          ▼
                                                     ┌──────────┐
                                                     │  Fetch    │
                                                     │  Events   │
                                                     └──────────┘
```

### Event: `install`

Dipanggil sekali pas SW pertama kali di-download. Biasanya buat **pre-cache** resource awal.

```javascript
// sw.js
const CACHE_NAME = 'notes-app-v1';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/offline.html'
];

self.addEventListener('install', event => {
  console.log('[SW] Install');

  // WaitUntil — browser nunggu promise selesai
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Pre-caching resources');
      return cache.addAll(PRECACHE_URLS);
    })
  );

  // Langsung activate, tanpa nunggu tab lain ditutup
  self.skipWaiting();
});
```

### Event: `activate`

Dipanggil setelah install, pas SW siap ngambil alih kendali. Biasanya buat **bersihin cache lama**.

```javascript
self.addEventListener('activate', event => {
  console.log('[SW] Activate');

  const cacheAllowlist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => !cacheAllowlist.includes(name))
          .map(name => caches.delete(name))
      );
    })
  );

  // Langsung kontrol halaman tanpa refresh
  self.clients.claim();
});
```

### Event: `fetch`

Dipanggil setiap kali halaman bikin request (HTML, API, gambar dll). Ini jantungnya offline support.

```javascript
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      // Fallback: coba jaringan dulu, kalo gagal pake cache
      return fetch(event.request)
        .then(response => {
          // Update cache dengan response baru
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
          });
          return response;
        })
        .catch(() => cached || caches.match('/offline.html'));
    })
  );
});
```

## Mendaftarkan Service Worker dari Halaman

```javascript
// main.js — di halaman web utama
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'  // SW hanya kontrol path dalam scope ini
      });
      console.log('[SW] Registered:', registration.scope);

      // Update otomatis pas SW baru terdeteksi
      registration.addEventListener('updatefound', () => {
        console.log('[SW] Update found — installing...');
      });
    } catch (err) {
      console.error('[SW] Registration failed:', err);
    }
  });
}
```

### Cek Status SW di Console

```javascript
// Dev tools utility
navigator.serviceWorker.getRegistrations().then(regs => {
  console.table(regs.map(r => ({
    scope: r.scope,
    state: r.active?.state ?? 'none',
    installing: r.installing?.state ?? '-',
    waiting:   r.waiting?.state ?? '-'
  })));
});
```

## Cache Strategies

### 1. Stale-While-Revalidate (default — paling aman)

Kirim **cache dulu**, update cache dari jaringan di background.

```javascript
// Cepat — cocok buat asset yang jarang berubah
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetchPromise = fetch(event.request).then(response => {
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, response));
        return response.clone();
      }).catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
```

**Contoh use case:** Avatar user, logo, CSS framework.

### 2. Cache-First

Cek cache dulu. Kalo ada → pake. Kalo gak ada → fetch dari jaringan & cache.

```javascript
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, response));
        return response.clone();
      });
    })
  );
});
```

**Contoh use case:** Gambar static, font, halaman yang jarang berubah.

### 3. Network-First

Coba jaringan dulu. Kalo gagal → ambil dari cache (fallback offline).

```javascript
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, response));
        return response.clone();
      })
      .catch(() => caches.match(event.request))
  );
});
```

**Contoh use case:** API response, data yang sering berubah.

### 4. Cache-Only

Cuma pake cache. Gak nyentuh jaringan sama sekali.

```javascript
self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request));
});
```

**Contoh use case:** Halaman offline, asset yang gak pernah berubah.

### Matriks Pemilihan Strategi

| Strategi | Kecepatan | Kesegaran Data | Reliability |
|----------|-----------|----------------|-------------|
| Cache-Only | ⚡ Sangat cepat | ❌ Basi | ✅ Tinggi |
| Cache-First | ⚡ Cepat | ⚠️ Agak basi | ✅ Tinggi |
| Stale-While-Revalidate | ⚡ Cepat | ✅ Segar | ✅ Tinggi |
| Network-First | 🐢 Lambat (kalo online) | ✅ Paling segar | ⚠️ Rendah kalo offline |

## Workbox

Workbox adalah library Google yang nge-simplify Service Worker. Gak perlu nulis caching logic manual.

### Setup Workbox CLI

```bash
npm install workbox-webpack-plugin --save-dev
npm install workbox-precaching workbox-routing workbox-strategies
```

### Workbox Config (webpack)

```javascript
// webpack.config.js
const { GenerateSW } = require('workbox-webpack-plugin');

module.exports = {
  plugins: [
    new GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
      runtimeCaching: [
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'images',
            expiration: { maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 }
          }
        },
        {
          urlPattern: /^https:\/\/api\./,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-responses',
            networkTimeoutSeconds: 3
          }
        }
      ]
    })
  ]
};
```

### Workbox Manual (tanpa build tool)

```javascript
// sw.js — pakai importScripts
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

if (workbox) {
  console.log('[Workbox] Loaded!');

  // Precaching — otomatis dari manifest
  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

  // Runtime caching
  workbox.routing.registerRoute(
    /\.(?:js|css)$/,
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'static-assets'
    })
  );

  workbox.routing.registerRoute(
    /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
    new workbox.strategies.CacheFirst({
      cacheName: 'images',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 hari
        })
      ]
    })
  );

  workbox.routing.registerRoute(
    /^https:\/\/api\./,
    new workbox.strategies.NetworkFirst({
      cacheName: 'api',
      networkTimeoutSeconds: 3
    })
  );
}
```

## Offline Fallback Page

Buat halaman khusus yang tampil pas user offline.

```html
<!-- offline.html -->
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: #f5f5f5;
    }
    .card {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.1);
    }
    .icon { font-size: 4rem; }
    h1 { color: #333; }
    p { color: #666; }
    button {
      margin-top: 1rem;
      padding: 0.75rem 2rem;
      background: #007aff;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">📡</div>
    <h1>Kamu Lagi Offline</h1>
    <p>Koneksi internet terputus. Coba lagi nanti.</p>
    <button onclick="window.location.reload()">Coba Lagi</button>
  </div>
</body>
</html>
```

### SW routing ke offline fallback

```javascript
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Simpan response ke cache
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
        return response;
      })
      .catch(() => {
        // Cek apakah request navigasi (halaman HTML)
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
        // Coba cari di cache, kalo gak ada ya offline fallback
        return caches.match(event.request)
          .then(cached => cached || new Response('Offline', { status: 503 }));
      })
  );
});
```

### Cache-First dengan Offline Fallback (lengkap)

```javascript
const CACHE_NAME = 'pwa-notes-v1';
const PRECACHE = ['/', '/index.html', '/offline.html', '/style.css', '/app.js'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        const fetchAndCache = fetch(event.request)
          .then(res => {
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, res.clone()));
            return res;
          })
          .catch(() => cached);

        // Kalo request navigasi → ada fallback khusus
        if (event.request.mode === 'navigate' && !cached) {
          return fetchAndCache.catch(() => caches.match('/offline.html'));
        }

        return cached || fetchAndCache;
      })
  );
});
```

## Latihan

1. **Register & verify SW** — Buat file `sw.js`, register dari halaman, log registration ke console. Verifikasi di DevTools > Application > Service Workers.

2. **Implementasi Stale-While-Revalidate** — Tulis handler fetch yang kirim cache dulu, update di background. Test dengan mematikan jaringan — konten lama masih muncul, pas online balik otomatis refresh.

3. **Offline fallback page** — Buat halaman `offline.html` keren dengan animasi, config SW untuk nampilin itu pas navigasi offline. Pastikan tombol "Coba Lagi" jalan.

4. **Workbox integration** — Instal workbox via npm, config runtime caching untuk images (CacheFirst) dan API (NetworkFirst dengan timeout 3 detik). Generate SW otomatis, verify di Lighthouse.
