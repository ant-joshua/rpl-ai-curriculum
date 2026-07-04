# 32.3 Bundle Optimization — Tree Shaking, Image Opt, Font Loading

---

## 1. Bundle Analysis

### Webpack Bundle Analyzer

Lihat isi bundle — siapa paling gede, mana yang bisa di-split.

```bash
npm install --save-dev webpack-bundle-analyzer
```

```typescript
// webpack.config.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',      // Hasilkan HTML report
      reportFilename: 'report.html',
      openAnalyzer: false,
      generateStatsFile: true,
      statsFilename: 'stats.json',
    }),
  ],
};
```

### Vite Bundle Visualizer

```bash
npm install --save-dev rollup-plugin-visualizer
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
});
```

Buka `dist/stats.html` — liat treemap module. Hijau = aman, Merah = masalah.

### Analisis Manual

```bash
# Lihat file size di dist
ls -lh dist/assets/
du -sh dist/

# Webpack stats JSON analyzer
npx webpack-bundle-analyzer dist/stats.json

# Lighthouse report — liat "Reduce JavaScript execution time"
```

### Common Bottlenecks

| Masalah | Tanda | Solusi |
|---------|-------|--------|
| Lodash / moment.js utuh | Bundle > 200 KB | Import spesifik: `import debounce from 'lodash/debounce'` |
| Library chart besar | Chart.js > 200 KB | Pake lightweight: uPlot, Chart.js tree-shake |
| Dua versi React | Duplikat module | `resolve.alias` / `dedupe` |
| CSS library penuh | Tailwind purged? | `purge: true` |

---

## 2. Tree Shaking

Tree shaking = **buang kode yang ga dipake**. Webpack/Vite otomatis kalo pake ES Module.

### Cara Kerja

```typescript
// utils.ts — export banyak fungsi
export function formatDate(date: Date): string { /* ... */ }
export function formatCurrency(amount: number): string { /* ... */ }
export function generateSlug(text: string): string { /* ... */ }
export function debounce<T>(fn: T, ms: number): T { /* ... */ }
export function throttle<T>(fn: T, ms: number): T { /* ... */ }

// app.ts — cuma pake 2 dari 5 fungsi
// Tree shaking: formatDate & debounce DO simpan, 3 sisanya DO buang
import { formatDate, debounce } from './utils';
```

### Aturan Biar Tree Shaking Berfungsi

| Aturan | Penjelasan |
|--------|------------|
| Pake **ES Module** (`import`/`export`) | CommonJS (`require`) GA bisa di-tree-shake |
| **Side-effect free** | `package.json` → `"sideEffects": false` |
| Jangan import semuanya | `import * as _ from 'lodash'` → semua ikut |
| **Import spesifik** | `import { debounce } from 'lodash-es'` |

### Config Tree Shaking

```typescript
// package.json — bilang ke bundler "ga ada side effects"
{
  "sideEffects": [
    "*.css",
    "*.scss"
  ]
}
```

```typescript
// webpack.config.js
module.exports = {
  mode: 'production', // Tree shaking otomatis di production
  optimization: {
    usedExports: true,
    sideEffects: true,
  },
};
```

### Lodash — Contoh Nyata

```typescript
// ❌ BURUK — semua lodash masuk bundle (300 KB)
import _ from 'lodash';
_.debounce(fn, 300);
_.throttle(fn, 1000);
_.isEqual(a, b);

// ✅ BAIK — cuma fungsi yang dipake
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import isEqual from 'lodash/isEqual';

// ✅ LEBIH BAIK — lo-dash tree-shakeable version
import { debounce, throttle, isEqual } from 'lodash-es';
```

---

## 3. Code Splitting Strategy

### Split by Routes

```typescript
// Setiap halaman jadi chunk sendiri
const Home = lazy(() => import('./pages/Home'));
const Product = lazy(() => import('./pages/Product'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
```

### Split by Vendor

Pisahin library pihak ketiga biar ga ikut berubah tiap deploy:

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['lodash-es', 'date-fns'],
          charts: ['recharts', 'd3'],
        },
      },
    },
  },
});
```

### Split by Condition

```typescript
// Cuma load kalo user adalah admin
async function loadAdminPanel() {
  if (user.role === 'admin') {
    const AdminPanel = await import('./AdminPanel');
    return new AdminPanel.default();
  }
}

// Cuma load kalo browser pake WebP
async function loadImageOptimizer() {
  const supportsWebP = document.createElement('canvas')
    .toDataURL('image/webp').startsWith('data:image/webp');

  const ImageModule = supportsWebP
    ? await import('./WebPOptimizer')
    : await import('./FallbackOptimizer');

  return new ImageModule.default();
}
```

---

## 4. Image Optimization

### Format Comparison

| Format | Kompresi | Kualitas | Browser Support |
|--------|----------|----------|-----------------|
| JPEG | Lossy | Baik | Semua |
| PNG | Lossless | Sangat baik | Semua |
| **WebP** | Lossy/Lossless | Setara JPEG 30% lebih kecil | 96% |
| **AVIF** | Lossy/Lossless | Lebih kecil dari WebP 50% | 80% |
| SVG | Vector | Tak terbatas | Semua |
| **JPEG XL** | Lossy/Lossless | Terbaik | Baru 10% |

### Sharp — Optimasi di Build Time

```bash
npm install --save-dev sharp
```

```typescript
// scripts/optimize-images.ts
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { glob } from 'glob';

async function optimizeImages() {
  const images = await glob('public/images/**/*.{jpg,jpeg,png}');

  for (const file of images) {
    const ext = path.extname(file);
    const name = path.basename(file, ext);
    const dir = path.dirname(file);

    // WebP — kualitas 80
    await sharp(file)
      .webp({ quality: 80 })
      .toFile(`${dir}/${name}.webp`);

    // AVIF — kualitas 65
    await sharp(file)
      .avif({ quality: 65 })
      .toFile(`${dir}/${name}.avif`);

    // Resize buat thumbnail
    await sharp(file)
      .resize({ width: 400 })
      .webp({ quality: 60 })
      .toFile(`${dir}/${name}-thumb.webp`);

    console.log(`✓ ${name} → webp, avif, thumb`);
  }
}

optimizeImages().catch(console.error);
```

### Picture Element — Browser Pilih Format

```html
<picture>
  <source type="image/avif" srcset="photo.avif">
  <source type="image/webp" srcset="photo.webp">
  <img src="photo.jpg" width="800" height="600" alt="Photo" loading="lazy">
</picture>
```

### Responsive Images

```html
<img
  srcset="
    photo-400.webp 400w,
    photo-800.webp 800w,
    photo-1200.webp 1200w
  "
  sizes="
    (max-width: 600px) 400px,
    (max-width: 1200px) 800px,
    1200px
  "
  src="photo-800.webp"
  width="1200"
  height="800"
  loading="lazy"
  alt="Photo"
>
```

---

## 5. Font Loading Optimization

### Masalah Font

Font besar (WOFF2 pun bisa 50-200 KB) blocking render. Tiga dampak:

1. **FOUT** (Flash of Unstyled Text) — font sistem dulu, baru font kustom
2. **FOIT** (Flash of Invisible Text) — teks ga kelihatan sampe font selesai
3. **CLS** — font kustom ukuran beda, layout geser

### font-display

```css
/* @font-face dengan font-display */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-Bold.woff2') format('woff2');
  font-weight: 700;
  font-display: swap; /* Tampilkan font sistem dulu, swap kalo selesai */
}

@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: optional; /* Kalo font ga selesai dalam 100ms, pake font sistem */
}
```

| `font-display` | Perilaku | Cocok |
|----------------|----------|-------|
| `auto` | Browser decide (biasanya FOIT) | — |
| `block` | Invisible teks 3 detik | Brand font untuk logo |
| `swap` | Font sistem dulu, ganti kalo selesai | Body text |
| `fallback` | Swap cuma dalam 3 detik, abis itu stuck font sistem | Body text |
| `optional` | Kalo ga selesai 100ms, pake font sistem | Performance-critical |

### Preload Font

```html
<link rel="preload" href="/fonts/Inter-Regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/Inter-Bold.woff2" as="font" type="font/woff2" crossorigin>
```

### Subset Font — Kurangi Ukuran 90%

Hanya include karakter latin + angka + tanda baca (buang Cyrillic, Chinese, dll).

```bash
# Glyphhanger — generate subset font
npx glyphhanger ./index.html --subset=*.ttf --formats=woff2,woff --css

# Atau manual
npx glyphhanger https://example.com --subset=Inter-Regular.ttf --formats=woff2
```

### Font Loading API

```typescript
// Detect kalo font udah selesai load
document.fonts.ready.then(() => {
  console.log('Semua font selesai di-load');
  document.documentElement.classList.add('fonts-loaded');
});
```

```css
/* CSS — sembunyikan FOUT sampe font siap */
html:not(.fonts-loaded) body {
  font-family: system-ui, sans-serif;
}

html.fonts-loaded body {
  font-family: 'Inter', system-ui, sans-serif;
}
```

---

## 6. Bundle Budget

Bundle budget = **batas maksimal ukuran file**. CI gagal kalo budget dilanggar.

```typescript
// webpack.config.js — bundle budget checker
module.exports = {
  performance: {
    hints: 'error',     // Gagal build kalo budget dilanggar
    maxEntrypointSize: 250_000,    // 250 KB per entry
    maxAssetSize: 100_000,         // 100 KB per file
    assetFilter: (filename: string) =>
      !filename.endsWith('.map') && // Ga include sourcemap
      !filename.endsWith('.txt'),
  },
};
```

```typescript
// vite.config.ts — pake plugin manual
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  build: {
    rollupOptions: {
      plugins: [
        visualizer({
          filename: 'dist/report.html',
          gzipSize: true,
        }),
      ],
    },
    chunkSizeWarningLimit: 100, // KB — warning kalo > 100 KB
  },
});
```

### Target Budget

| Resource | Max Size (gzipped) | Catatan |
|----------|-------------------|---------|
| Total JS | ≤ 300 KB | 500 KB kalo pake framework |
| Total CSS | ≤ 50 KB | — |
| Gambar (hero) | ≤ 100 KB | WebP |
| Font | ≤ 50 KB | WOFF2, subset |
| HTML | ≤ 30 KB | — |

---

## Latihan

1. **Bundle Analyzer** — bikin React app baru (Vite). Tambahin `rollup-plugin-visualizer`. Build, buka report. Identifikasi 3 module terbesar. Terus refactor: ganti import besar dengan import spesifik. Bandingin size sebelum-sesudah

2. **Image Pipeline** — tulis script Node.js pake `sharp` yang:
   - Scan folder `public/images/`
   - Convert JPEG/PNG ke WebP (quality 75) + AVIF (quality 60)
   - Generate thumbnail 200px width buat tiap gambar
   - Output report: file asal → file baru + size reduction %

3. **Font Optimizer** — ambil font Google (Inter atau Poppins). Implementasi:
   - `font-display: swap` + `optional`
   - Preload WOFF2
   - Subset font (cuma latin)
   - Font loading API buat class `.fonts-loaded`
   - Ukur CLS sebelum-sesudah pake Lighthouse

4. **Bundle Budget CI** — setup bundle budget di project:
   - webpack: `performance: { hints: 'error', maxEntrypointSize: 250_000 }`
   - Vite: `chunkSizeWarningLimit: 100`
   - Test: tambahin library gede (moment.js / chart.js) — liat gagal build
   - Refactor pake alternatif ringan (date-fns / uPlot)
