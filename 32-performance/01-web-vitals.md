# 32.1 Web Vitals — LCP, FID, CLS, INP

## Apa itu Web Vitals?

Web Vitals adalah metrik resmi Google buat ngukur **pengalaman pengguna** di web. Ada 4 metrik inti:

| Metrik | Nama | Ngukur Apa | Target |
|--------|------|------------|--------|
| **LCP** | Largest Contentful Paint | Waktu render elemen konten terbesar | ≤ 2.5 detik |
| **FID** | First Input Delay | Waktu respon ke interaksi pertama | ≤ 100 ms |
| **CLS** | Cumulative Layout Shift | Stabilitas visual / layout shift | ≤ 0.1 |
| **INP** | Interaction to Next Paint | Responsivitas interaksi keseluruhan | ≤ 200 ms |

---

## 1. LCP (Largest Contentful Paint)

### Penjelasan

LCP ngukur kapan **elemen konten terbesar** di viewport selesai di-render. Elemen yang diukur: `<img>`, `<svg>`, `<video>`, element dengan `background-image`, atau text block besar.

### Cara Ukur

```typescript
// PerformanceObserver untuk LCP
new PerformanceObserver((list) => {
  const entries = list.getEntries();
  const lastEntry = entries[entries.length - 1];
  console.log('LCP:', lastEntry.startTime / 1000, 'detik');
  console.log('Elemen:', (lastEntry as any).element);
}).observe({ type: 'largest-contentful-paint', buffered: true });
```

### Cara Fix

| Masalah | Solusi |
|---------|--------|
| Gambar lambat load | Optimasi ukuran gambar, pake next-gen format (WebP/AVIF) |
| Font besar blocking render | `font-display: swap` atau preload font |
| Hero image butuh request besar | Gunakan `<img fetchpriority="high">` |
| Server slow TTFB | Cache CDN, optimasi server, gunakan SSG |

```html
<!-- Preload hero image -->
<link rel="preload" href="hero.webp" as="image" fetchpriority="high">

<!-- font-display: swap -->
<style>
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter.woff2') format('woff2');
  font-display: swap;
}
</style>
```

---

## 2. FID (First Input Delay)

### Penjelasan

FID ngukur **delay** antara user pertama kali interaksi (klik, tap, keydown) sampe browser bisa nge-handle event handler-nya. Penyebab utama: **main thread diblokir** oleh JavaScript berat yang lagi jalan.

### Cara Ukur

```typescript
// PerformanceObserver untuk FID
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    const fid = entry as PerformanceEventTiming;
    console.log('FID delay:', fid.processingStart - fid.startTime, 'ms');
    console.log('Event type:', fid.name);
  }
}).observe({ type: 'first-input', buffered: true });
```

### Cara Fix

| Masalah | Solusi |
|---------|--------|
| JavaScript besar blocking main thread | Code splitting, lazy load JS |
| Long task (>50ms) | Break jadi microtask, pake `requestIdleCallback` |
| Third-party scripts blocking | `async` / `defer`, load setelah interaksi |
| Hydration berat (framework) | Partial hydration, island architecture |

```typescript
// requestIdleCallback — jalankan task saat browser senggang
function processHeavyTask(data: number[]) {
  const chunkSize = 50;
  let index = 0;

  function processChunk() {
    const end = Math.min(index + chunkSize, data.length);
    for (let i = index; i < end; i++) {
      // Lakukan task berat
      data[i] = data[i] * 2;
    }
    index = end;

    if (index < data.length) {
      requestIdleCallback(processChunk, { timeout: 2000 });
    }
  }

  requestIdleCallback(processChunk, { timeout: 2000 });
}
```

---

## 3. CLS (Cumulative Layout Shift)

### Penjelasan

CLS ngukur **seberapa banyak elemen bergerak** saat halaman lagi dimuat. Layout shift terjadi kalo elemen udah di-render tapi ukurannya berubah pas asset lain (gambar, iklan, font) selesai dimuat.

### Cara Ukur

```typescript
// PerformanceObserver untuk CLS
let clsValue = 0;

new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (!(entry as any).hadRecentInput) {
      clsValue += (entry as any).value;
    }
  }
  console.log('CLS:', clsValue);
}).observe({ type: 'layout-shift', buffered: true });
```

### Cara Fix

| Masalah | Solusi |
|---------|--------|
| Gambar tanpa dimensi | Selalu set `width` + `height` di `<img>` |
| Iklan / embed dinamis | Reserve space dengan CSS `min-height` |
| Font loading | `font-display: optional` + `size-adjust` |
| Dynamic content injected di atas konten | Inject di bawah viewport atau pake skeleton |

```html
<!-- Set dimensi gambar untuk cegah CLS -->
<img
  src="photo.webp"
  width="800"
  height="600"
  alt="Deskripsi"
  loading="lazy"
  style="aspect-ratio: 800 / 600"
>

<!-- Reserve space untuk iklan -->
<div style="min-height: 250px; width: 100%;">
  <!-- Iklan dimuat di sini -->
</div>
```

---

## 4. INP (Interaction to Next Paint)

### Penjelasan

INP adalah metrik baru (2024) yang ngukur **responsivitas keseluruhan** interaksi user — bukan cuma yang pertama (FID). Ngukur delay dari interaksi sampe frame berikutnya tampil.

### Cara Ukur

```typescript
// PerformanceObserver untuk INP
new PerformanceObserver((list) => {
  const entries = list.getEntries();
  const interactions = entries.filter(
    (e): e is PerformanceEventTiming => e.entryType === 'event'
  );

  for (const entry of interactions) {
    const delay = entry.processingStart - entry.startTime;
    const duration = entry.duration;
    console.log(`INP — ${entry.name}: delay=${delay}ms, duration=${duration}ms`);
  }
}).observe({ type: 'event', buffered: true, durationThreshold: 16 });
```

### Cara Fix

| Masalah | Solusi |
|---------|--------|
| Event handler terlalu berat | Pindahin ke Web Worker atau `setTimeout` |
| Re-render besar setelah interaksi | Virtual list, memoization, `content-visibility` |
| Third-party scripts blocking | Defer atau load async |
| Rendering lambat | `will-change` CSS, GPU acceleration |

```css
/* content-visibility — skip render elemen di luar viewport */
.lazy-section {
  content-visibility: auto;
  contain-intrinsic-size: 0 500px;
}
```

```typescript
// Debounce input handler biar ga render tiap keystroke
function debounce<T extends (...args: unknown[]) => void>(
  fn: T, ms: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

const handleSearch = debounce(async (query: string) => {
  const results = await fetch(`/api/search?q=${query}`);
  // update UI
}, 300);
```

---

## Report ke Analytics

Kirim metrik ke backend buat monitoring:

```typescript
function sendToAnalytics(metrics: {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}) {
  const body = JSON.stringify({
    metric: metrics.name,
    value: metrics.value,
    rating: metrics.rating,
    url: window.location.pathname,
    userAgent: navigator.userAgent,
  });

  // Kirim pake sendBeacon — ga blocking, reliable walau page unload
  navigator.sendBeacon('/api/metrics', body);
}

// Observer semua metrik
function observeWebVitals() {
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lcp = entries[entries.length - 1];
    sendToAnalytics({
      name: 'LCP',
      value: lcp.startTime,
      rating: lcp.startTime <= 2500 ? 'good' : lcp.startTime <= 4000 ? 'needs-improvement' : 'poor',
    });
  });
  lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

  // Observer untuk CLS
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!(entry as any).hadRecentInput) {
        clsValue += (entry as any).value;
      }
    }
  });
  clsObserver.observe({ type: 'layout-shift', buffered: true });

  // Kirim CLS saat page unload
  window.addEventListener('beforeunload', () => {
    sendToAnalytics({
      name: 'CLS',
      value: clsValue,
      rating: clsValue <= 0.1 ? 'good' : clsValue <= 0.25 ? 'needs-improvement' : 'poor',
    });
  });
}

observeWebVitals();
```

## Core Web Vitals — Deep Dive Optimization

### LCP Optimization Pipeline

```typescript
// 1. Ukur TTFB dulu — TTFB > 800ms biasanya bikin LCP gagal
// Gunakan PerformanceObserver atau Navigation Timing API
new PerformanceObserver((list) => {
  const [entry] = list.getEntries();
  const ttfb = entry.responseStart - entry.requestStart;
  console.log(`TTFB: ${ttfb}ms`);
}).observe({ type: 'navigation', buffered: true });

// 2. Preload hero image secara spesifik
// Di HTML head:
// <link rel="preload" href="/images/hero.webp" as="image" fetchpriority="high">

// 3. Gunakan responsive images dengan srcset
// Biar device kecil ga download gambar gede
function generateSrcSet(baseUrl: string, widths: number[]): string {
  return widths.map(w => `${baseUrl}?w=${w} ${w}w`).join(', ');
}
// Contoh: "photo.jpg?w=400 400w, photo.jpg?w=800 800w"

// 4. Optimasi server response — cache API yang dibutuhin LCP
const lcpCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 60_000; // 1 menit

async function getLCPData(key: string, fetcher: () => Promise<unknown>) {
  const cached = lcpCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  const data = await fetcher();
  lcpCache.set(key, { data, timestamp: Date.now() });
  return data;
}
```

### CLS Prevention Checklist (Detail)

| Skenario | Risk CLS | Fix |
|----------|----------|-----|
| Gambar tanpa dimensi | Tinggi | Set `width` + `height` explicit + `aspect-ratio` CSS |
| Custom font | Medium | `font-display: optional` + `size-adjust` |
| Iklan / embed | Tinggi | Reserve space: `min-height` sesuai ukuran iklan |
| Infinite scroll | Sedang | Beri skeleton dengan dimensi pasti |
| Web font swap | Rendah | Gunakan `font-display: optional` + preload critical font |
| Third-party widget | Tinggi | Load di iframe atau defer setelah layout stabil |

```css
/* Aspect ratio container — cegah CLS dari gambar */
.img-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9; /* Modern — CSS native */
  background: #f0f0f0; /* Placeholder color */
  overflow: hidden;
}

/* Fallback untuk browser lama */
@supports not (aspect-ratio: 16/9) {
  .img-container::before {
    content: '';
    display: block;
    padding-top: 56.25%; /* 9/16 * 100 */
  }
}

/* Skeleton screen — alternatif dari blank space */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Long Task Optimization — Detail Strategy

```typescript
// 1. Identify long tasks via PerformanceObserver
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.duration > 50) {
      console.warn(`Long task detected: ${entry.duration}ms`, entry);
      // Kirim ke analytics buat tracking
      navigator.sendBeacon('/api/long-task', JSON.stringify({
        duration: entry.duration,
        startTime: entry.startTime,
        url: location.href,
      }));
    }
  }
}).observe({ type: 'longtask', buffered: true });

// 2. Yield to main thread — biar browser bisa render
async function yieldToMainThread(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

async function processInChunks<T>(
  items: T[],
  processor: (item: T) => void,
  chunkSize = 50
) {
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    chunk.forEach(processor);
    // Yield setelah tiap chunk — biar UI tetep responsif
    if (i + chunkSize < items.length) {
      await yieldToMainThread();
    }
  }
}

// 3. Gunakan scheduler.postTask() kalo available (Chrome 118+)
if ('scheduler' in window && 'postTask' in (window as any).scheduler) {
  // Prioritaskan task penting
  (window as any).scheduler.postTask(
    () => processUrgentData(),
    { priority: 'user-blocking' }
  );
  // Task background
  (window as any).scheduler.postTask(
    () => processAnalytics(),
    { priority: 'background' }
  );
}

// 4. isInputPending — cek apakah user lagi interaksi
function processDataWithResponsiveness(data: number[]) {
  for (const item of data) {
    // Process item...
    if ((navigator as any).scheduling?.isInputPending()) {
      // Ada input pending — yield dulu!
      break;
    }
  }
}
```

## Tabel Ringkasan Metrik

| Metrik | Target Baik | Tool Ukur | Cara Fix Utama |
|--------|-------------|-----------|----------------|
| LCP | ≤ 2500ms | PerformanceObserver, Lighthouse | Optimasi gambar, preload hero, CDN |
| FID | ≤ 100ms | PerformanceObserver, web-vitals | Code splitting, kurangi JS blocking |
| CLS | ≤ 0.1 | PerformanceObserver, Lighthouse | Set dimensi gambar, reserve space |
| INP | ≤ 200ms | PerformanceObserver, web-vitals | Debounce, delegasi event, worker |

---

## Latihan

1. **LCP Reporter** — tulis fungsi `reportLCP()` yang ngukur LCP dan kirim ke console. Pakai `PerformanceObserver`. Tambahin threshold warn (kuning >2500ms, merah >4000ms)

2. **CLS Debugger** — bikin halaman HTML dengan 3 gambar tanpa `width`/`height`. Ukur CLS pake `PerformanceObserver`. Terus tambahin dimensi — bandingin nilai CLS sebelum-sesudah

3. **INP Simulator** — bikin fungsi berat yang blocking main thread selama 500ms (loop besar). Ukur INP pake `PerformanceObserver`. Terus refactor pake `requestIdleCallback`:

4. **Analytics Logger** — gabungin LCP + CLS + INP observer jadi satu fungsi `observeAndReport()`. Kirim data ke console.table(). Format: name | value | rating | timestamp
