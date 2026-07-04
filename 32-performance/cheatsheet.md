# 🧠 Cheatsheet: Web Performance Optimization

> Referensi cepet — 1 halaman.

## Topik Utama

**Core Web Vitals:**
| Metrik | Nama | Target |
|--------|------|--------|
| **LCP** | Largest Contentful Paint | ≤ 2.5s |
| **FID** | First Input Delay | ≤ 100ms |
| **CLS** | Cumulative Layout Shift | ≤ 0.1 |
| **INP** | Interaction to Next Paint | ≤ 200ms |

**Lazy Loading:** `<img loading="lazy">`, React `Suspense` + `lazy()`, dynamic `import()`

**Code Splitting:** Route-based splitting, component-level splitting

**Caching:** Browser cache (`Cache-Control`), Service Worker cache, CDN cache

**Bundle Optimization:** Tree shaking, minification, code splitting, analyze bundle size

**Image Optimization:** WebP/AVIF format, `srcset` responsive, `fetchpriority="high"`, lazy load non-critical

**Font Loading:** `font-display: swap`, preload font files

## Command / Sintaks Penting

```typescript
// Measure LCP, FID, CLS, INP with PerformanceObserver
new PerformanceObserver((list) => {
  const entries = list.getEntries();
  const last = entries[entries.length - 1];
  console.log('LCP:', last.startTime / 1000, 'seconds');
}).observe({ type: 'largest-contentful-paint', buffered: true });

new PerformanceObserver((list) => {
  const entries = list.getEntries();
  entries.forEach(entry => console.log('INP:', entry.duration, 'ms'));
}).observe({ type: 'event', buffered: true });
```

```html
<!-- Preload critical resources -->
<link rel="preload" href="/fonts/Inter.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/hero.webp" as="image" fetchpriority="high">
<link rel="preconnect" href="https://fonts.googleapis.com">

<!-- Lazy load non-critical images -->
<img src="photo.webp" alt="photo" loading="lazy" width="800" height="600">

<!-- Font loading -->
<style>
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter.woff2') format('woff2');
  font-display: swap;
}
</style>
```

```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun --config=lighthouserc.json

# Bundle analyzer
npx vite-bundle-visualizer
npx webpack-bundle-analyzer stats.json
```

## Tips & Trik

- **Lazy load images below fold** — `loading="lazy"` + explicit `width`/`height`
- **Preload hero content** — `<link rel="preload">` untuk above-fold resources
- **WebP/AVIF > JPEG/PNG** — 25-50% smaller
- **CSS `contain`** — isolate layout calculations, prevent CLS
- **`font-display: swap`** — text visible immediately, font swap when loaded
- **Third-party scripts** — defer/async, load after page interactive
- **Performance budget** — set max bundle size di CI pipeline

## Common Mistakes

- **No image dimensions** — causes CLS (layout shift), always set `width`/`height`
- **Blocking render font** — no `font-display`, text invisible until font loads
- **Over-preloading** — preload too many resources = bandwidth contention
- **No lazy loading** — all images load immediately, slow LCP
- **Massive JS bundle** — no code splitting, everything in one chunk
- **No Lighthouse CI** — performance regressions go unnoticed
- **Ignoring CLS** — late-loading ads/images cause layout shift

## Link Cepat

- [Module README](README.md)
- [Quiz](quiz.md)
