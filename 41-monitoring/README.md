<img src="https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg?auto=compress&cs=tinysrgb&w=1260&h=400&dpr=2" alt="Monitoring Dashboard" style="width:100%;border-radius:12px;margin:12px 0;">

# 41. Monitoring & Error Tracking

> **Level:** 🔧 Advanced
> **Jam:** 10 (5 minggu × 2 sesi)
> **Prasyarat:** Node.js & Express (Modul 6), pernah deploy aplikasi
> **Output:** Express app with Sentry + structured logging + health dashboard

## Tujuan Pembelajaran

Setelah modul ini, kamu bisa:
- Setup structured JSON logging dengan Pino & Winston
- Integrasi Sentry untuk error tracking & performance monitoring
- Optimasi error grouping dengan fingerprint & breadcrumbs
- Build health check endpoint (liveness + readiness)
- Implement graceful shutdown production-ready
- Konfigurasi uptime monitoring & alerting (email, Slack, Discord)
- Trace performance bottleneck dengan APM tools
- Menyusun incident response checklist untuk produksi

## Materi

| Sesi | Topik | File |
|------|-------|------|
| 1 | Structured Logging — Pino vs Winston, log levels, request logging middleware, log rotation | [01-structured-logging.md](01-structured-logging.md) |
| 2 | Sentry Error Tracking — DSN setup, Express middleware, source maps, breadcrumbs, performance tracing | [02-sentry-error-tracking.md](02-sentry-error-tracking.md) |
| 3 | Health Check & Monitoring — /healthz, /readyz, dependency checks, graceful shutdown, monitoring dashboard | [03-health-check-monitoring.md](03-health-check-monitoring.md) |
| 4 | Production Monitoring — uptime monitoring, alerting, APM, incident response checklist | [04-production-monitoring.md](04-production-monitoring.md) |

## Output Akhir Modul

> **Production-ready Express app with full observability stack** — structured JSON logging (Pino), Sentry error tracking & performance monitoring, health check endpoints (liveness + readiness + dependency probes), graceful shutdown, uptime monitoring config, dan incident response runbook.

## AI Prompt Exercises

Sepanjang modul, latihan pake AI:

- "Generate Pino logger config with different log levels per environment"
- "Write Express request logging middleware that captures method, url, duration, and status code"
- "How do I configure Sentry source maps upload in my CI pipeline?"
- "Generate health check endpoints for Express with PostgreSQL and Redis ping"
- "Explain the difference between liveness and readiness probes in Kubernetes context"
- "Generate Slack webhook alert payload for 5xx error threshold breach"
- "Help me analyze this APM waterfall chart — where's the bottleneck?"
- "Write an incident response checklist for a production API outage"
