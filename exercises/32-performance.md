# Web Performance — Latihan

## Level 1: Dasar

### 1. Web Vitals — Core Metrics
**Pertanyaan:** Jelaskan 3 Core Web Vitals beserta:

1. Apa yang diukur?
2. Nilai target (Good / Needs Improvement / Poor)
3. Contoh apa yang bikin metrik ini jelek

| Metrik | Mengukur | Good | Needs Improvement | Poor |
|--------|----------|------|------------------|------|
| LCP | ? | ≤ ? | ? | > ? |
| FID/INP | ? | ≤ ? | ? | > ? |
| CLS | ? | ≤ ? | ? | > ? |

**Hint:** LCP = loading (above-the-fold image/text). INP = interaction responsiveness. CLS = layout shift.

---

### 2. Performance Tools — Mengukur Performa
**Pertanyaan:** Cocokkan tool dengan fungsinya:

| Tool | Fungsi |
|------|--------|
| Lighthouse | a. Analisis bundle size JavaScript |
| Chrome DevTools Performance tab | b. Monitor Web Vitals real user |
| webpack-bundle-analyzer | c. Audit performa, accessibility, SEO |
| PageSpeed Insights | d. Record & profile runtime performance |
| web-vitals library | e. Lighthouse + field data dari CrUX |

**Hint:** Lighthouse bisa jalan di Chrome, CLI, atau PageSpeed Insights. CrUX = Chrome User Experience Report.

---

### 3. Lazy Loading — Images
**Pertanyaan:** Ada 50 gambar produk di halaman. Implementasi lazy loading:

1. Pake atribut HTML native
2. Pake Intersection Observer (JavaScript)
3. Apa fallback untuk browser yang belum support?

**Hint:**
```html
<img src="product.jpg" loading="lazy" alt="Product" />
```
```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.src = entry.target.dataset.src; observer.unobserve(entry.target); }
  });
});
```

---

### 4. Render Blocking — CSS & JS
**Pertanyaan:** Sebutkan 3 cara mengurangi render-blocking resources:

1. Untuk CSS
2. Untuk JavaScript
3. Untuk font

**Hint:** `media` attribute, `defer`/`async`, `font-display: swap`.

---

### 5. Image Optimization — Format & Size
**Pertanyaan:** Tentukan format terbaik untuk tiap skenario:

| Skenario | Format Terbaik | Alasan |
|----------|---------------|--------|
| Foto profil user (foto asli) | ? | ? |
| Logo dengan warna solid & text | ? | ? |
| Banner dengan foto + transparansi | ? | ? |
| Animasi pendek (tanpa video) | ? | ? |

**Hint:** WebP/AVIF, SVG, PNG, WebP/AVIF. Pertimbangkan ukuran file dan kualitas.

---

### 6. Bundle Analysis — Identifikasi Masalah
**Pertanyaan:** Diberikan output bundle analysis:
```
dist/js/
  main.a1b2c3.js    245 kB
  vendor.d4e5f6.js  890 kB  ← besar!
  styles.xyz123.css  42 kB
```

1. Kenapa `vendor.d4e5f6.js` terlalu besar?
2. Sebutkan 3 cara untuk mengurangi ukuran vendor bundle
3. Tool apa yang bisa ngasih detail isi bundle?

**Hint:** Vendor = library eksternal. Mungkin include library yang nggak dipake (moment.js, lodash). Tree shaking, code splitting, replace dengan alternatif lebih kecil (date-fns → dayjs).

---

### 7. Lighthouse CI — Basic Audit
**Pertanyaan:** Tulis konfigurasi Lighthouse CI untuk:

1. Audit halaman `https://example.com`
2. Target skor: Performance ≥ 90, Accessibility ≥ 90, SEO ≥ 90
3. Budget: JavaScript ≤ 300 kB, images ≤ 500 kB
4. Fail CI kalau di bawah target

**Hint:** `lighthouse-ci` command line atau `lhci` config file `.lighthouserc.js`.

---

### 8. Critical CSS — Above the Fold
**Pertanyaan:** 
1. Apa itu Critical CSS dan kenapa penting?
2. Gimana cara extract Critical CSS?
3. Gimana cara implementasi di HTML?

**Hint:** Critical CSS = CSS yang dibutuhkan untuk render above-the-fold. Inline di `<head>`, load sisanya async. Tools: Penthouse, Critical.

---

## Level 2: Intermediate

### 9. Web Vitals Optimization — LCP Fix
**Skenario:** LCP skor merah (4.2 detik). LCP element adalah gambar hero.

**Pertanyaan:** Berdasarkan waterfall berikut:
```
1.0s  HTML parsing
0.8s  CSSOM build
1.5s  Hero image request (preload ❌)
0.6s  Hero image decode
0.3s  Render
——
4.2s  Total LCP
```

Tulis perbaikan:
1. Preload hero image dengan tag `<link rel="preload">`
2. Compress image ke WebP/AVIF
3. Tambahkan `fetchpriority="high"`
4. Gunakan responsive images (`srcset`)
5. Implementasi image CDN

**Hint:**
```html
<link rel="preload" href="hero.webp" as="image" fetchpriority="high">
<img src="hero.webp" srcset="hero-400.webp 400w, hero-800.webp 800w, hero-1200.webp 1200w" sizes="100vw" fetchpriority="high" alt="Hero">
```

---

### 10. Code Splitting — Dynamic Import
**Pertanyaan:** Ubah import statis jadi dynamic import untuk route-based splitting:

```javascript
// Before — semua di 1 bundle
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import AdminPanel from './pages/AdminPanel';
```

1. Tulis ulang pake React.lazy + Suspense
2. Tulis konfigurasi webpack chunk naming: `dashboard.chunk.js`, `settings.chunk.js`
3. Apa yang terjadi kalau user slow network? Gimana handle-nya?

**Hint:**
```jsx
const Dashboard = React.lazy(() => import(/* webpackChunkName: "dashboard" */ './pages/Dashboard'));
<React.Suspense fallback={<Loading />}> <Dashboard /> </React.Suspense>
```

---

### 11. Bundle Analysis — webpack-bundle-analyzer
**Pertanyaan:** Diberikan analisis bundle:

```
Bundle: vendor.bundle.js (890 kB)
├── moment.js          231 kB (mostly locale data)
├── lodash             527 kB (full library, only use .debounce)
├── chart.js           78 kB
├── axios              54 kB
└── others
```

**Pertanyaan:** Untuk tiap masalah di atas, tulis perbaikannya:

1. moment.js → ? (alternatif lebih kecil)
2. lodash → ? (tree shaking atau import partial)
3. Apa konfigurasi webpack yang perlu diubah?
4. Implementasi webpack config untuk tree shaking

**Hint:** moment.js → dayjs (2kB). lodash → lodash-es (tree-shakeable) atau `import debounce from 'lodash/debounce'`. Pastikan `mode: 'production'` dan `sideEffects: false` di package.json.

---

### 12. Caching Strategy — Service Worker Cache
**Pertanyaan:** Desain strategi cache untuk:

1. **Static assets** (CSS, JS, fonts) — Cache First, valid 30 hari
2. **Images** — Cache First, valid 7 hari
3. **API responses** — Network First, fallback ke cache (stale-while-revalidate)
4. **HTML pages** — Network Only (selalu fresh)

Tulis implementasi Workbox atau service worker manual.

**Hint:**
```javascript
// Workbox
registerRoute(/\.(?:js|css|woff2)$/, new CacheFirst({ cacheName: 'static-assets', plugins: [new ExpirationPlugin({ maxAgeSeconds: 30 * 24 * 60 * 60 })] }));
registerRoute(/\/api\//, new NetworkFirst({ cacheName: 'api-cache' }));
```

---

### 13. Font Optimization — FOIT & FOUT
**Pertanyaan:**
1. Apa beda FOIT (Flash of Invisible Text) dan FOUT (Flash of Unstyled Text)?
2. Gimana cara pakai `font-display: swap`?
3. Gimana cara preload font biar lebih cepet?
4. Gimana cara subset font (hanya karakter yang dipake)?

**Hint:**
```css
@font-face { font-family: 'Inter'; src: url('/fonts/Inter.woff2') format('woff2'); font-display: swap; }
```
```html
<link rel="preload" href="/fonts/Inter.woff2" as="font" type="font/woff2" crossorigin>
```
Subsetting: `glyphhanger` atau `google-webfonts-helper`.

---

### 14. Performance Budget — CI Integration
**Pertanyaan:** Buat performance budget untuk aplikasi e-commerce:

1. JavaScript total ≤ 350 kB (compressed)
2. CSS total ≤ 50 kB
3. Images total ≤ 1 MB (halaman pertama)
4. Time to Interactive ≤ 3.5 detik (mobile 3G)
5. Lighthouse Performance score ≥ 85

Implementasi:
1. Tulis konfigurasi `budget.json` untuk Lighthouse CI
2. Integrasi ke GitHub Actions: jalankan audit tiap PR, block kalau budget exceed

**Hint:**
```json
{
  "performance-budget": {
    "resourceSizes": [
      { "resourceType": "total", "budget": 1400 },
      { "resourceType": "script", "budget": 350 },
      { "resourceType": "stylesheet", "budget": 50 }
    ],
    "timings": [
      { "metric": "interactive", "budget": 3500 }
    ]
  }
}
```

---

## Level 3: Challenge

### 15. Full Performance Audit & Fix
**Skenario:** Halaman dashboard aplikasi Next.js lambat:
- Lighthouse Performance: 45
- LCP: 8.2s, TBT: 650ms, CLS: 0.32
- Bundle: 1.2 MB (gzipped)
- 25 request gambar, 15 di antaranya nggak di-resize

**Pertanyaan:** Buat rencana optimasi komprehensif:

1. **JavaScript:**
   - Analisis bundle (sebutkan tool dan langkah)
   - Code splitting: route-based & component-based
   - Tree shaking: library mana yang perlu diganti?
   - Dynamic import untuk komponen berat (chart, table)

2. **Images:**
   - Implementasi next/image dengan lazy loading
   - Konversi ke WebP/AVIF
   - Responsive images dengan srcset
   - Gambar di atas fold: preload + fetchpriority

3. **CSS:**
   - Critical CSS inline
   - Hapus unused CSS (purge)
   - CSS minification

4. **Font:**
   - Subset + preload + font-display swap

5. **Caching:**
   - Service worker dengan Workbox
   - CDN cache policy

6. **Monitoring:**
   - Real User Monitoring (RUM) dengan web-vitals library
   - Set performance budget di CI

Untuk tiap poin, tulis kode atau konfigurasi yang dibutuhkan.

**Hint:** Target: Lighthouse ≥ 90, LCP ≤ 2.5s, TBT ≤ 200ms, CLS ≤ 0.1, bundle ≤ 350kB.

---

### 16. Build Your Own Lighthouse — Custom Performance Checker
**Pertanyaan:** Buat script Node.js yang mengaudit performa website tanpa Lighthouse:

1. **Measure TTFB:** Pakai `node-fetch` atau `http`, hitung waktu sampai response header pertama
2. **Measure LCP (estimasi):** Pakai Puppeteer/Playwright, track PerformanceObserver
3. **Measure CLS:** Pakai PerformanceObserver di browser
4. **Check render-blocking resources:** Parse HTML, cari CSS/JS di `<head>` tanpa `defer`/`async`
5. **Check image optimization:** Cek format (WebP support?), cek dimension vs natural size
6. **Generate report JSON** dengan skor per kategori

Tulis script lengkapnya.

**Hint:**
```javascript
const puppeteer = require('puppeteer');
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.evaluate(() => {
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    // Track LCP, CLS
  });
  observer.observe({ type: 'largest-contentful-paint', buffered: true });
});
```

---

### 17. Real User Monitoring — Custom RUM Setup
**Skenario:** Build custom RUM (Real User Monitoring) system dari scratch.

**Pertanyaan:**

1. **Collector endpoint:**
   - `POST /api/rum` terima data: `{ metric, value, page, device, connection, timestamp }`
   - Simpan ke database (timeseries: InfluxDB, atau PostgreSQL)
   - Rate limit per session

2. **Client-side script:**
   ```javascript
   // web-vitals library
   import { onLCP, onFID, onCLS, onTTFB, onINP } from 'web-vitals';
   // Kirim ke collector tiap metrik berubah
   ```

3. **Dashboard:**
   - Query: P75 LCP per halaman (7 hari terakhir)
   - Query: % halaman dengan CLS > 0.25 (poor)
   - Query: P50 TTFB per country/region

4. **Alerting:**
   - Trigger alert kalau P75 LCP > 4.0s dalam 5 menit terakhir
   - Kirim notifikasi ke Slack

Tulis implementasi collector API (Express), client script, dan query database.

**Hint:**
```javascript
// Collector
app.post('/api/rum', async (req, res) => {
  const { metric, value, page, device, connection } = req.body;
  const sessionId = req.cookies.sessionId;
  await db.rumData.create({ data: { metric, value, page, device, connection, sessionId, timestamp: new Date() } });
  res.sendStatus(204);
});
```

```javascript
// Client
onCLS((metric) => fetch('/api/rum', { method: 'POST', body: JSON.stringify({ metric: 'CLS', value: metric.value, page: location.pathname }), headers: { 'Content-Type': 'application/json' } }));
```

---

### 18. Performance Optimization — Next.js App Router
**Skenario:** Aplikasi Next.js 14 App Router dengan performa buruk. Semua komponen adalah Client Component (`'use client'`).

**Pertanyaan:** Optimasi performa dengan:

1. **Server Components:**
   - Mana yang bisa jadi Server Component? Mana yang tetap Client?
   - Pindahkan data fetching dari `useEffect` ke server (async component atau RSC)

2. **Streaming:**
   - Implementasi `loading.js` dan `Suspense` boundaries
   - Stream konten yang lambat (data fetching lama)

3. **Image optimization:**
   - Ganti `<img>` dengan `next/image`
   - Configure `remotePatterns` di `next.config.js`

4. **Font optimization:**
   - Pake `next/font` (Google Fonts self-hosted)

5. **Dynamic imports:**
   - Heavy component (chart, markdown editor) → `next/dynamic`

6. **Caching:**
   - `unstable_cache` atau `fetch` dengan `revalidate` untuk data
   - Static rendering untuk halaman yang jarang berubah

7. **Bundle analysis:**
   - Analisis dengan `@next/bundle-analyzer`

Tulis kode untuk tiap poin.

**Hint:**
```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react';
import { MetricsChart } from './MetricsChart';
const HeavyChart = dynamic(() => import('./HeavyChart'), { loading: () => <ChartSkeleton /> });

export default async function DashboardPage() {
  const data = await fetch('https://api.example.com/dashboard', { next: { revalidate: 60 } }).then(r => r.json());
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MetricsChart data={data} />
    </Suspense>
  );
}
```
