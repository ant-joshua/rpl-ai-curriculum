# RPP: Web Performance Optimization

| Info | Detail |
|------|--------|
| Kode | RPL-AI-32 |
| Durasi | 4 pertemuan × 90 menit |
| Level | Intermediate |
| Prasyarat | HTML, CSS, JavaScript, TypeScript dasar, React/Vue dasar |

## Pertemuan 1: Web Vitals

### Tujuan
- Memahami Core Web Vitals (LCP, FID, CLS, INP)
- Mengukur performa dengan PerformanceObserver
- Mengidentifikasi bottleneck performa

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review | Tanya jawab | Slide |
| 20' | Materi inti: LCP, FID, CLS, INP, PerformanceObserver | Ceramah + demo | Live code |
| 25' | Praktik terbimbing: ukur web vitals website existing & analisis | Hands-on | Lighthouse DevTools |
| 20' | Latihan mandiri: optimasi website berdasarkan hasil audit | Problem solving | Soal |
| 15' | Diskusi & refleksi | Q&A | — |

### Bahan Ajar
- [Module README](../32-performance/)
- [Web Vitals](../32-performance/01-web-vitals.md)

---

## Pertemuan 2: Lazy Loading, Code Splitting & Caching

### Tujuan
- Terapkan lazy loading gambar & komponen
- Implementasi code splitting (dynamic import)
- Manfaatkan browser caching & Service Worker

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review | Tanya jawab | Slide |
| 20' | Materi inti: lazy loading, code splitting, browser caching, Service Worker | Ceramah + demo | Live code |
| 25' | Praktik terbimbing: implement lazy loading & code splitting di React | Hands-on | Starter code |
| 20' | Latihan mandiri: setup caching strategy & Service Worker | Problem solving | Soal |
| 15' | Diskusi & refleksi | Q&A | — |

### Bahan Ajar
- [Lazy Loading & Caching](../32-performance/02-lazy-loading-caching.md)

---

## Pertemuan 3: Bundle Optimization

### Tujuan
- Analisis & optimasi bundle size (tree shaking)
- Optimasi gambar (format, ukuran, responsive)
- Font loading optimization

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review | Tanya jawab | Slide |
| 20' | Materi inti: tree shaking, image optimization, font loading | Ceramah + demo | Live code |
| 25' | Praktik terbimbing: analisis bundle dengan webpack-bundle-analyzer | Hands-on | Bundle analyzer |
| 20' | Latihan mandiri: optimasi gambar & font loading | Problem solving | Soal |
| 15' | Diskusi & refleksi | Q&A | — |

### Bahan Ajar
- [Bundle Optimization](../32-performance/03-bundle-optimization.md)

---

## Pertemuan 4: Lighthouse CI & Monitoring

### Tujuan
- Integrasi Lighthouse CI di pipeline
- Setup performance budgets
- Pantau performa web di production

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review | Tanya jawab | Slide |
| 20' | Materi inti: Lighthouse CI, performance budgets, monitoring tools | Ceramah + demo | Live code |
| 25' | Praktik terbimbing: setup Lighthouse CI di GitHub Actions | Hands-on | Starter code |
| 20' | Latihan mandiri: set performance budget & monitoring dashboard | Problem solving | Soal |
| 15' | Diskusi & refleksi | Q&A | — |

### Bahan Ajar
- [Lighthouse CI & Monitoring](../32-performance/04-lighthouse-ci.md)
