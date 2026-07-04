# RPP: Monitoring & Error Tracking

| Info | Detail |
|------|--------|
| Kode | RPL-AI-41 |
| Durasi | 4 pertemuan × 90 menit |
| Level | Advanced |
| Prasyarat | Node.js & Express, pernah deploy aplikasi |

## Pertemuan 1: Structured Logging — Pino vs Winston, Log Levels, Request Logging, Log Rotation

### Tujuan
- Setup structured JSON logging dengan Pino & Winston
- Memahami log levels & best practices logging
- Membuat request logging middleware & konfigurasi log rotation

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review: tanya pengalaman debug production pakai console.log, kenapa structured logging | Tanya jawab | Slide |
| 20' | Materi inti: structured JSON logging, Pino vs Winston, log levels, log rotation, environment-based config | Ceramah + demo | Live code |
| 25' | Praktik terbimbing: setup Pino logger + request logging middleware + log rotation | Hands-on | Starter code |
| 20' | Latihan mandiri: konfigurasi Winston sebagai alternatif + custom log levels per environment | Problem solving | Soal |
| 15' | Diskusi & refleksi: perbandingan Pino vs Winston untuk production | Q&A | — |

### Bahan Ajar
- [Module README](../41-monitoring/)
- [Structured Logging](../41-monitoring/01-structured-logging.md)

---

## Pertemuan 2: Sentry Error Tracking — DSN, Express Middleware, Source Maps, Breadcrumbs, Performance

### Tujuan
- Integrasi Sentry untuk error tracking
- Setup source maps & breadcrumbs untuk error grouping optimal
- Menggunakan Sentry performance monitoring

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review: demo error tanpa tracking, kenapa perlu Sentry | Tanya jawab | Slide, Sentry dashboard |
| 20' | Materi inti: Sentry DSN, Express middleware, source maps upload, breadcrumbs, fingerprint, performance tracing | Ceramah + demo | Live code |
| 25' | Praktik terbimbing: setup Sentry di Express + source maps + breadcrumbs | Hands-on | Starter code |
| 20' | Latihan mandiri: konfigurasi error grouping + performance tracing | Problem solving | Soal |
| 15' | Diskusi & refleksi: cost vs benefit Sentry, alternatif open source | Q&A | — |

### Bahan Ajar
- [Module README](../41-monitoring/)
- [Sentry Error Tracking](../41-monitoring/02-sentry-error-tracking.md)

---

## Pertemuan 3: Health Check & Monitoring — /healthz, /readyz, Dependency Checks, Graceful Shutdown

### Tujuan
- Build health check endpoint (liveness + readiness)
- Implement dependency probe (PostgreSQL, Redis ping)
- Setup graceful shutdown production-ready

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review: recap structured logging + Sentry, kenapa butuh health check | Tanya jawab | Slide |
| 20' | Materi inti: liveness vs readiness probe, dependency checks, graceful shutdown, monitoring dashboard | Ceramah + demo | Live code, diagram |
| 25' | Praktik terbimbing: implement /healthz + /readyz endpoints + PostgreSQL/Redis ping | Hands-on | Starter code |
| 20' | Latihan mandiri: implement graceful shutdown + health check dashboard sederhana | Problem solving | Soal |
| 15' | Diskusi & refleksi: perbedaan liveness vs readiness di Kubernetes context | Q&A | — |

### Bahan Ajar
- [Module README](../41-monitoring/)
- [Health Check & Monitoring](../41-monitoring/03-health-check-monitoring.md)

---

## Pertemuan 4: Production Monitoring — Uptime Monitoring, Alerting, APM, Incident Response

### Tujuan
- Konfigurasi uptime monitoring & alerting (email, Slack, Discord)
- Trace performance bottleneck dengan APM tools
- Menyusun incident response checklist untuk produksi

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review: recap health check, diskusi production nightmares | Tanya jawab | Slide |
| 20' | Materi inti: uptime monitoring tools, alerting channels (Slack/Discord webhook), APM tracing, incident response runbook | Ceramah + demo | Live code, dashboard |
| 25' | Praktik terbimbing: setup uptime monitor + Slack alert webhook + APM trace | Hands-on | Starter code |
| 20' | Latihan mandiri: buat incident response checklist + analisa APM waterfall chart | Problem solving | Soal |
| 15' | Refleksi & wrap-up: observability stack end-to-end, presentasi output | Presentasi | Dashboard live |

### Bahan Ajar
- [Module README](../41-monitoring/)
- [Production Monitoring](../41-monitoring/04-production-monitoring.md)
