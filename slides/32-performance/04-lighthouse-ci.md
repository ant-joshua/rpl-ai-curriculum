---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — <img src="https://images.pexels.com/photos/1148820/pexels-ph"
footer: "Sesi 04: Lighthouse Ci"
---

<!-- _class: title -->
# 32.4 Lighthouse CI, Performance Budgets & Monitoring

---

## 1. Lighthouse Audit — Dasar

Lighthouse ngecek 5 kategori:

| Kategori | Bobot | Yang Dinilai |
|----------|-------|-------------|
| **Performance** | 50% | LCP, FID/INP, CLS, TBT, SI |
| **Accessibility** | 20% | Contrast, aria labels, keyboard nav |
| **Best Practices** | 15% | HTTPS, no errors, modern JS |
| **SEO** | 10% | Meta tags, crawlability, robots.txt |
| **PWA** | 5% | Service worker, manifest, offline |

### Run Lighthouse Manual

```bash

---

# CLI
npx lighthouse https://example.com --view


---

# Dengan Chrome DevTools Protocol
npx lighthouse https://example.com --output=json --output-path=./report.json


---

# Emulated mobile + throttling
npx lighthouse https://example.com \
  --preset=desktop \
  --throttling-method=devtools \
  --output=html \
  --output-path=./lighthouse-report.html
```

### Lighthouse Programmatic API

```typescript
import lighthouse from 'lighthouse';
import chromeLauncher from 'chrome-launcher';

async function runLighthouse(url: string) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });

  const options = {
    logLevel: 'info',
    output: 'json',
    port: chrome.port,
    onlyCategories: ['performance', 'accessibility', 'seo', 'best-practices'],
  };

  const config = {
    extends: 'lighthouse:default',
    settings: {
      formFactor: 'desktop',
      throttling: {
        rttMs: 40,
        throughputKbps: 10240,
        cpuSlowdownMultiplier: 1,
      },
    },
  };

  const result = await lighthouse(url, options, config);
  await chrome.kill();

  const scores = result?.lhr?.categories;
  if (!scores) return;

  console.log('Performance:', Math.round(scores.performance?.score ?? 0 * 100));
  console.log('Accessibility:', Math.round(scores.accessibility?.score ?? 0 * 100));
  console.log('SEO:', Math.round(scores.seo?.score ?? 0 * 100));
  console.log('Best Practices:', Math.round(scores['best-practices']?.score ?? 0 * 100));

  return result.lhr;
}
```

### Interpretasi Skor

| Skor | Warna | Arti |
|------|-------|------|
| 90–100 | 🟢 Hijau | Cepat & aksesibel |
| 50–89 | 🟡 Kuning | Perlu perbaikan |
| 0–49 | 🔴 Merah | Lambat, banyak masalah |

---

## 2. CI/CD dengan Lighthouse CI

### Setup Lighthouse CI (LHCI)

```bash
npm install --save-dev @lhci/cli
```

```typescript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/products',
        'http://localhost:3000/cart',
      ],
      startServerCommand: 'npm run start',
      numberOfRuns: 3,              // Rata-rata dari 3 run
      settings: {
        preset: 'desktop',
        onlyCategories: ['performance', 'accessibility', 'seo', 'best-practices'],
      },
    },
    upload: {
      target: 'filesystem',        // Simpan report lokal
      outputDir: './lhci-reports',
      reportFilenamePattern: 'lighthouse-%%URLNAME%%-%%DATETIME%%.html',
    },
    assert: {
      preset: 'lighthouse:no-pwa',  // Assertions default
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'lighthouse-disk-cache': 'off',
        'unused-javascript': ['warn', { maxLength: 0 }],
      },
    },
  },
};
```

### GitHub Actions — Lighthouse CI

```yaml

---

# .github/workflows/lighthouse.yml
name: Lighthouse CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

### GitLab CI — Lighthouse

```yaml

---

# .gitlab-ci.yml
image: node:20

stages:
  - build
  - test
  - lighthouse

lighthouse:
  stage: lighthouse
  script:
    - npm ci
    - npm run build
    - npm install -g @lhci/cli
    - lhci autorun --config=./lighthouserc.js
  artifacts:
    paths:
      - lhci-reports/
    expire_in: 30 days
  only:
    - main
```

---

## 3. Performance Budgets di CI

### Lighthouse Assertions = Performance Budget

Assertions di `lighthouserc.js` otomatis ngegagalin CI kalo budget dilanggar:

```typescript
// lighthouserc.js — assertions detail
assertions: {
  // Skor kategori
  'categories:performance': ['error', { minScore: 0.9 }],
  'categories:accessibility': ['error', { minScore: 0.9 }],

  // Metrik
  'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
  'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
  'total-blocking-time': ['error', { maxNumericValue: 200 }],
  'interactive': ['error', { maxNumericValue: 5000 }],
  'speed-index': ['warn', { maxNumericValue: 4000 }],

  // Resource size
  'total-byte-weight': ['error', { maxNumericValue: 1_500_000 }], // 1.5 MB
  'unused-javascript': ['warn', { maxLength: 0 }],
  'unused-css-rules': ['warn', { maxLength: 0 }],

  // Best practices
  'uses-http2': ['error', { minScore: 1 }],
  'uses-long-cache-ttl': ['error', { maxLength: 0 }],
  'uses-responsive-images': ['error', { maxLength: 0 }],
}
```

### Danger.js — Post PR Comment

```typescript
// dangerfile.ts
import { danger, fail, warn, markdown } from 'danger';
import fs from 'node:fs';

const lhciReport = JSON.parse(
  fs.readFileSync('./lhci-reports/manifest.json', 'utf-8')
);

for (const url of Object.keys(lhciReport)) {
  const report = lhciReport[url];
  const performance = Math.round(report.summary.performance * 100);
  const accessibility = Math.round(report.summary.accessibility * 100);

  if (performance < 90) {
    fail(`🚨 Performance skor ${performance} di ${url} — target minimal 90`);
  }

  if (accessibility < 90) {
    warn(`⚠️ Accessibility skor ${accessibility} di ${url} — target minimal 90`);
  }
}

markdown(`
## 🏠 Lighthouse Report
| URL | Performance | Accessibility |
|-----|-------------|---------------|
${Object.entries(lhciReport)
  .map(([url, r]) => `| ${url} | ${Math.round(r.summary.performance * 100)} | ${Math.round(r.summary.accessibility * 100)} |`)
  .join('\n')}
`);
```

---

## 4. Core Web Vitals Monitoring (web-vitals Library)

### Setup web-vitals

```bash
npm install web-vitals
```

```typescript
// src/metrics.ts
import { onLCP, onFID, onCLS, onINP, onTTFB } from 'web-vitals';

interface MetricReport {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

function reportToAnalytics(metric: MetricReport) {
  console.log(`[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`);

  // Kirim ke endpoint
  const body = JSON.stringify({
    metric: metric.name,
    value: metric.value,
    rating: metric.rating,
    url: window.location.pathname,
    timestamp: Date.now(),
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/metrics', body);
  } else {
    fetch('/api/metrics', { method: 'POST', body, keepalive: true });
  }
}

// Daftarin semua observers
export function initWebVitals() {
  onLCP(reportToAnalytics);
  onFID(reportToAnalytics);
  onCLS(reportToAnalytics);
  onINP(reportToAnalytics);
  onTTFB((metric) => {
    console.log(`TTFB: ${metric.value.toFixed(0)}ms`);
  });
}
```

```typescript
// main.ts — panggil di entry point
import { initWebVitals } from './metrics';

initWebVitals();
```

### web-vitals dengan React

```typescript
// src/hooks/useWebVitals.ts
import { useEffect } from 'react';
import { onLCP, onFID, onCLS, onINP } from 'web-vitals';

export function useWebVitals() {
  useEffect(() => {
    const report = (metric: any) => {
      console.log(`[${metric.name}] ${metric.value.toFixed(2)} — ${metric.rating}`);
    };

    onLCP(report);
    onFID(report);
    onCLS(report);
    onINP(report);
  }, []);
}
```

### Dashboard Visual — buat grafik metrik

```typescript
// Ambil data dari endpoint
async function fetchMetrics(timeRange = '24h') {
  const res = await fetch(`/api/metrics?range=${timeRange}`);
  const data = await res.json();

  // Kelompokin per metrik
  const grouped = data.reduce((acc: any, item: any) => {
    if (!acc[item.metric]) acc[item.metric] = [];
    acc[item.metric].push(item);
    return acc;
  }, {});

  console.table(grouped);

  // Hitung persentase good / needs-improvement / poor
  for (const [metric, entries] of Object.entries(grouped)) {
    const total = (entries as any[]).length;
    const good = (entries as any[]).filter((e: any) => e.rating === 'good').length;
    const poor = (entries as any[]).filter((e: any) => e.rating === 'poor').length;

    console.log(`${metric}: ${((good / total) * 100).toFixed(1)}% good, ${((poor / total) * 100).toFixed(1)}% poor`);
  }
}
```

---

## 5. Common Pitfalls & Fixes

| Masalah | Penyebab | Fix |
|---------|----------|-----|
| **Skor Performance rendah** | JS terlalu besar, gambar gede | Code splitting, image optimization |
| **LCP merah** | Hero image lambat, server slow | Preload hero, CDN, SSG |
| **CLS tinggi** | Gambar/font tanpa dimensi | `width`/`height`, `aspect-ratio` CSS |
| **TBT (Total Blocking Time)** | Long task di main thread | Web Worker, chunk task |
| **Accessibility rendah** | Kurang aria labels, contrast rendah | Gunakan semantic HTML, alat otomatis |
| **SEO rendah** | Meta tag kurang, no sitemap | Tambah meta description, canonical |
| **Unused JavaScript** | Import library gede tapi jarang dipake | Dynamic import, tree shaking |
| **Render-blocking resources** | CSS/JS di `<head>` blocking | Inline critical CSS, `defer`/`async` |
| **Image not optimized** | PNG/JPEG tanpa kompresi | Sharp pipeline ke WebP/AVIF |
| **No HTTP/2** | Server belum pake HTTP/2 | Enable di nginx/caddy |
| **Cache policy buruk** | Ga pake Cache-Control | Set `max-age` sesuai jenis resource |
| **No service worker** | Ga bisa offline & instant load | Register SW + cache strategi |

### Checklist Cepat Optimasi

```markdown
- [ ] Core Web Vitals ≥ target (LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms)
- [ ] Gambar pake WebP/AVIF + loading="lazy"
- [ ] Hero image preload + fetchpriority="high"
- [ ] Code splitting per route / per komponen berat
- [ ] Font: WOFF2 + font-display + preload
- [ ] Cache-Control: statis immutable 1 tahun, API no-cache
- [ ] Service worker dengan strategi caching
- [ ] Bundle size: JS ≤ 300 KB gzip, CSS ≤ 50 KB
- [ ] Lighthouse score ≥ 90 semua kategori
- [ ] Lighthouse CI di pipeline
- [ ] web-vitals monitoring di production
- [ ] HTTP/2 + CDN
```

---

## Latihan

1. **Lighthouse Runner** — tulis script Node.js yang:
   - Jalankan Lighthouse di 3 URL (home, produk, checkout)
   - Ekstrak skor performance + LCP + CLS
   - Output ke console.table()
   - Simpan ke JSON file

2. **LHCI Config** — bikin `lighthouserc.js` lengkap:
   - 3 URL target
   - Assertions: perf ≥ 0.9, LCP ≤ 2500, CLS ≤ 0.1, TBT ≤ 200
   - Upload target filesystem
   - Jalanin `lhci autorun` — liat hasil pass/fail

3. **web-vitals Dashboard** — bikin halaman HTML yang:
   - Pake `web-vitals` library
   - Kirim metrik ke localStorage (simulasi analytics)
   - Tampilin tabel real-time: nama metrik | value | rating
   - Tambahin warna: hijau/kuning/merah sesuai threshold

4. **CI Pipeline** — bikin GitHub Actions workflow `.github/workflows/perf.yml`:
   - Trigger: push ke main, PR ke main
   - Step: checkout → setup node → install → build → lhci autorun
   - Assertions: perf ≥ 0.9, aksesibilitas ≥ 0.9
   - Upload report sebagai artifact
   - Tambahin badge status ke README
