# 32.2 Lazy Loading, Code Splitting & Caching

---

## 1. Image Lazy Loading

### Native Lazy Loading (`loading=lazy`)

Cara termudah — browser handle sendiri:

```html
<img
  src="photo.webp"
  loading="lazy"
  width="800"
  height="600"
  alt="Deskripsi"
>

<!-- loading="eager" — load langsung (default buat hero images) -->
<img src="hero.webp" loading="eager" fetchpriority="high" alt="Hero">
```

| Nilai | Perilaku |
|-------|----------|
| `lazy` | Muat gambar pas mendekati viewport (default 1250px) |
| `eager` | Muat gambar segera, ga peduli posisi |
| `auto` | Default browser — biasanya eager |

### IntersectionObserver — Kontrol Manual

Native `loading=lazy` ga selalu cukup (browser support, jarak trigger). Pake `IntersectionObserver` buat kontrol lebih:

```typescript
function lazyLoadImages() {
  const images = document.querySelectorAll<HTMLImageElement>('img[data-src]');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src!;
          img.removeAttribute('data-src');
          observer.unobserve(img);

          // Fade in efek
          img.style.opacity = '1';
          img.style.transition = 'opacity 0.3s ease-in';
        }
      });
    },
    {
      rootMargin: '200px', // Mulai load 200px sebelum masuk viewport
      threshold: 0.01,
    }
  );

  images.forEach((img) => {
    img.style.opacity = '0';
    observer.observe(img);
  });
}

document.addEventListener('DOMContentLoaded', lazyLoadImages);
```

```html
<img
  data-src="real-image.webp"
  src="placeholder-lowres.webp"
  width="800"
  height="600"
  alt="Lazy loaded"
>
```

### Priority Hints

```html
<!-- High priority — hero image harus cepat -->
<img src="hero.webp" fetchpriority="high" alt="Hero">

<!-- Low priority — gambar di bawah fold -->
<img src="footer.webp" fetchpriority="low" loading="lazy" alt="Footer">
```

---

## 2. Code Splitting

### Dynamic Import — JavaScript

```typescript
// Before — semua di satu bundle
import { heavyFunction } from './heavy-module';

// After — baru load kalo dipanggil
async function loadFeature() {
  const { heavyFunction } = await import('./heavy-module');
  heavyFunction();
}

// Dynamic import dengan error handling
async function loadChart() {
  try {
    const ChartModule = await import('./ChartComponent');
    const chart = new ChartModule.default();
    chart.render();
  } catch (err) {
    console.error('Gagal load chart module:', err);
    renderFallbackChart();
  }
}
```

### React.lazy — Lazy Load Component

```typescript
import { lazy, Suspense } from 'react';
import LoadingSpinner from './LoadingSpinner';

// Lazy load — baru di-download kalo di-render
const Dashboard = lazy(() => import('./Dashboard'));
const AnalyticsChart = lazy(() => import('./AnalyticsChart'));
const UserSettings = lazy(() => import('./UserSettings'));

function App() {
  const [page, setPage] = useState<'dashboard' | 'analytics' | 'settings'>('dashboard');

  return (
    <div>
      <nav>
        <button onClick={() => setPage('dashboard')}>Dashboard</button>
        <button onClick={() => setPage('analytics')}>Analytics</button>
        <button onClick={() => setPage('settings')}>Settings</button>
      </nav>

      <Suspense fallback={<LoadingSpinner />}>
        {page === 'dashboard' && <Dashboard />}
        {page === 'analytics' && <AnalyticsChart />}
        {page === 'settings' && <UserSettings />}
      </Suspense>
    </div>
  );
}
```

### Route-based Splitting (React Router)

```typescript
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const ProductList = lazy(() => import('./pages/ProductList'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Checkout = lazy(() => import('./pages/Checkout'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/produk" element={<ProductList />} />
          <Route path="/produk/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

### Preload / Prefetch Strategis

```html
<!-- preload — butuh SEGERA buat halaman ini -->
<link rel="preload" href="/fonts/Inter-Bold.woff2" as="font" crossorigin>

<!-- prefetch — mungkin dibutuhkan di navigasi berikutnya -->
<link rel="prefetch" href="/js/product-detail.chunk.js" as="script">

<!-- preconnect — siapkan koneksi ke origin lain -->
<link rel="preconnect" href="https://api.example.com">
```

---

## 3. Browser Caching

### Cache-Control — HTTP Header Paling Penting

| Direktif | Maksud | Contoh |
|----------|--------|--------|
| `max-age=31536000` | Cache 1 tahun | File statis: CSS, JS, gambar |
| `no-cache` | Validasi tiap request | HTML, API response |
| `no-store` | Jangan simpen sama sekali | Data sensitif |
| `must-revalidate` | Wajib cek ulang kalo expired | |

```nginx
# Nginx config — cache file statis
location /assets/ {
  expires 1y;
  add_header Cache-Control "public, immutable, max-age=31536000";
}

location /api/ {
  add_header Cache-Control "no-cache, private";
}
```

```typescript
// Express — setting Cache-Control di response
import express from 'express';

const app = express();

app.use('/static', express.static('public', {
  maxAge: '1y',
  immutable: true,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, immutable, max-age=31536000');
  },
}));

app.get('/api/user', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.json({ id: 1, name: 'Budi' });
});
```

### ETag — Validasi Cache

ETag adalah hash konten. Browser kirim `If-None-Match`, server balas `304 Not Modified` kalo konten sama.

```typescript
import crypto from 'node:crypto';
import express from 'express';

const app = express();

app.get('/api/products', async (req, res) => {
  const products = await getProducts();
  const hash = crypto.createHash('md5').update(JSON.stringify(products)).digest('hex');

  // Set ETag
  res.setHeader('ETag', `"${hash}"`);

  // Cek kalo browser kirim ETag yang sama
  if (req.headers['if-none-match'] === `"${hash}"`) {
    res.status(304).end(); // Not modified — ga kirim body
    return;
  }

  res.json(products);
});
```

### Ringkasan Strategi Cache

| Tipe Resource | Cache-Control | ETag | Alasan |
|---------------|---------------|------|--------|
| `*.css`, `*.js` | `max-age=31536000, immutable` | Opsional | File di-hash by bundler |
| Gambar statis | `max-age=31536000, public` | Opsional | Jarang berubah |
| API response | `no-cache` atau `max-age=60` | Wajib | Data bisa berubah |
| HTML | `no-cache` | Wajib | Konten dinamis |
| Data sensitif | `no-store` | — | Jangan di-cache |

---

## 4. Service Worker — Cache Strategies

### Register Service Worker

```typescript
// main.ts — daftarin service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.ts', {
        scope: '/',
      });
      console.log('SW registered:', registration.scope);
    } catch (err) {
      console.error('SW registration failed:', err);
    }
  });
}
```

### Stale-While-Revalidate

Kirim data dari cache dulu (cepat), update cache dari network di background.

```typescript
// sw.ts
const CACHE_NAME = 'v1-stale-while-revalidate';

self.addEventListener('fetch', (event: FetchEvent) => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(staleWhileRevalidate(event.request));
  }
});

async function staleWhileRevalidate(request: Request): Promise<Response> {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  // Fetch dari network (di background)
  const fetchPromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });

  // Balas dari cache dulu (kalo ada)
  return cachedResponse || fetchPromise;
}
```

### Cache-First

Cari di cache dulu. Kalo ga ada, ambil dari network dan simpan.

```typescript
// sw.ts
self.addEventListener('fetch', (event: FetchEvent) => {
  if (event.request.url.match(/\.(png|jpg|webp|svg|css|js)$/)) {
    event.respondWith(cacheFirst(event.request));
  }
});

async function cacheFirst(request: Request): Promise<Response> {
  const cache = await caches.open('v1-cache-first');
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  const networkResponse = await fetch(request);
  if (networkResponse.ok) {
    cache.put(request, networkResponse.clone());
  }
  return networkResponse;
}
```

### Network-First (API)

Coba network dulu. Kalo gagal (offline), ambil dari cache.

```typescript
// sw.ts
self.addEventListener('fetch', (event: FetchEvent) => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(networkFirst(event.request));
  }
});

async function networkFirst(request: Request): Promise<Response> {
  const cache = await caches.open('v1-api');

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    // Fallback — balik ke offline page
    return caches.match('/offline.html');
  }
}
```

### Cache-Only (Asset Statis)

Cuma dari cache, ga pake network. Cocok buat icon, logo, font.

```typescript
// sw.ts — install event: pre-cache file statis
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/scripts/main.js',
  '/images/logo.svg',
  '/fonts/Inter.woff2',
  '/offline.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1-static').then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
});

self.addEventListener('fetch', (event: FetchEvent) => {
  if (PRECACHE_ASSETS.includes(new URL(event.request.url).pathname)) {
    event.respondWith(caches.match(event.request));
  }
});
```

### SW Lifecycle & Update Strategy

Service Worker punya lifecycle: Install → Waiting → Activate. Penting banget buat handle update:

```typescript
// sw.ts — full lifecycle management
const CACHE_VERSION = 2; // Increment setiap deploy

self.addEventListener('install', (event) => {
  console.log(`SW v${CACHE_VERSION} installing...`);
  // Force waiting SW jadi active langsung
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log(`SW v${CACHE_VERSION} activated`);
  // Hapus cache lama
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== `v${CACHE_VERSION}-static`)
          .filter((name) => name !== `v${CACHE_VERSION}-api`)
          .map((name) => caches.delete(name))
      );
    })
  );
  // Kontrol semua tab yang terbuka
  clients.claim();
});

// main.ts — detect SW update
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.ts').then((registration) => {
    // Check for updates setiap 60 detik
    setInterval(() => registration.update(), 60_000);

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Ada update tersedia — notifikasi user
            showUpdateNotification(() => {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
              window.location.reload();
            });
          }
        });
      }
    });
  });
}

// sw.ts — listen for SKIP_WAITING message
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
```

### Image Optimization Strategies

Selain format modern (WebP/AVIF), ada strategi tambahan:

```typescript
// 1. Responsive images dengan art direction
// <picture> element — pilih gambar sesuai viewport
const pictureHTML = `
<picture>
  <source media="(max-width: 600px)" srcset="hero-mobile.webp" />
  <source media="(max-width: 1200px)" srcset="hero-tablet.webp" />
  <source type="image/avif" srcset="hero.avif" />
  <img src="hero.webp" width="1920" height="1080" loading="lazy" alt="Hero" />
</picture>
`;

// 2. Low Quality Image Placeholder (LQIP)
// Generate base64 thumbnail kecil (blurred) yang di-inline di HTML
async function generateLQIP(imagePath: string): Promise<string> {
  const response = await fetch(imagePath);
  const blob = await response.blob();
  // Convert ke base64 dengan kualitas rendah
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}
// Implementasi: tampilkan LQIP dulu, swap ke gambar asli pas load

// 3. Progressive image loading
document.addEventListener('DOMContentLoaded', () => {
  const images = document.querySelectorAll<HTMLImageElement>('img[data-src]');
  const imageObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          // Load thumbnail dulu
          if (img.dataset.thumb) {
            img.src = img.dataset.thumb;
          }
          // Load full image setelah thumbnail masuk
          setTimeout(() => {
            img.src = img.dataset.src!;
            img.classList.add('loaded');
          }, 100);
          imageObserver.unobserve(img);
        }
      });
    },
    { rootMargin: '200px' }
  );
  images.forEach((img) => imageObserver.observe(img));
});
```

### Brotli Compression — Seting di Server

Brotli lebih baik dari gzip (20-30% lebih kecil). Aktifkan di server:

```nginx
# Nginx — brotli compression
brotli on;
brotli_comp_level 6;
brotli_types text/plain text/css application/json application/javascript
           application/xml image/svg+xml;

# Fallback gzip kalo client ga support brotli
gzip on;
gzip_comp_level 6;
gzip_types text/plain text/css application/json application/javascript
           application/xml image/svg+xml;
```

```typescript
// Express — express-static-gzip
import expressStaticGzip from 'express-static-gzip';

app.use('/', expressStaticGzip('dist', {
  enableBrotli: true,
  orderPreference: ['br', 'gz'],
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  },
}));
```

### Perbandingan Strategi

| Strategy | Kecepatan | Freshness | Cocok Buat |
|----------|-----------|-----------|------------|
| **Cache-First** | ⚡ Tercepat | ❌ Bisa basi | Asset statis (CSS, JS, gambar) |
| **Network-First** | 🐢 Lambat (kalo online) | ✅ Tersegar | API, HTML dinamis |
| **Stale-While-Revalidate** | ⚡ Cepat (cache) | ✅ Update background | API yang ga realtime, halaman |
| **Cache-Only** | ⚡ Tercepat | ❌ Tergantung pre-cache | Asset yang jarang berubah |
| **Network-Only** | 🐢 Normal | ✅ Tersegar | Data sensitif, realtime |

---

## Latihan

1. **Lazy Gallery** — bikin halaman dengan 20 gambar, masing-masing pake `data-src`. Implementasi IntersectionObserver buat load gambar pas masuk viewport. Tambahin loading placeholder (blur/lowres)

2. **Route Splitter** — bikin React app mini 3 halaman (Home, Products, About). Pake `React.lazy` + `Suspense` buat code splitting. Ukur beda bundle size sebelum-sesudah pake Network tab

3. **SW Cache Dashboard** — bikin service worker dengan strategi: cache-first buat CSS/JS/font, network-first buat API `/api/users`, stale-while-revalidate buat halaman HTML. Test pake offline mode DevTools

4. **ETag API** — bikin Express endpoint `/api/products` yang:
   - Generate ETag dari JSON.stringify + md5
   - Check `if-none-match` header
   - Balas 304 kalo sama
   - Test pake curl dengan `If-None-Match`
