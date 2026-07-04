# RPP: Production-Ready Code

| Info | Detail |
|------|--------|
| Kode | RPL-AI-49 |
| Durasi | 4 pertemuan × 90 menit |
| Level | Advanced |
| Prasyarat | Modul 6 (Express.js Dasar) |

## Pertemuan 1: Input Validation & Error Handling

### Tujuan
- Setup Zod schema untuk validasi input type-safe
- Membuat AppError class dan error handler middleware
- Mengembalikan format respons error yang konsisten

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi: demo app tanpa validasi — input rusak database, diskusi "kenapa validasi penting?" | Demonstrasi | Browser, terminal |
| 20' | Materi inti: Zod schema (string, number, enum, object, refine), infer type, validation middleware, parse vs safeParse, error formatting | Ceramah + demo | Live code |
| 25' | Praktik terbimbing: setup Zod schema untuk CRUD endpoint, buat validation middleware reusable, test valid/invalid request | Hands-on | Starter code |
| 20' | Materi lanjutan: AppError class (statusCode, message, code), global error handler middleware, format error JSON konsisten (success, message, errors, stack), async error wrapper | Ceramah + demo | Live code |
| 10' | Latihan mandiri: tambah custom error types (NotFoundError, UnauthorizedError), implement asyncHandler | Problem solving | Soal |
| 5' | Refleksi: throw Error vs AppError — kenapa custom error class? | Q&A | — |

### Bahan Ajar
- [Module README](../49-production-ready-code/README.md)
- [Input Validation](../49-production-ready-code/01-input-validation.md)

---

## Pertemuan 2: Security Hardening

### Tujuan
- Setup Helmet.js untuk security headers
- Konfigurasi CORS dengan whitelist
- Setup rate limiting dengan express-rate-limit
- Sanitasi input dan dependency audit

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 5' | Review: validasi input, lanjut ke security layer | Q&A | — |
| 20' | Materi inti: OWASP Top 10 untuk API, Helmet (security headers), CORS (origin whitelist, methods, credentials), rate limiting (per IP, per endpoint) | Ceramah + demo | Slide, live code |
| 25' | Praktik terbimbing: integrasi Helmet, setup CORS whitelist, rate limiter per endpoint, test dengan curl/Postman (rate limit terpicu) | Hands-on | Starter code |
| 20' | Materi lanjutan: input sanitization (XSS prevention, SQL injection, NoSQL injection), npm audit, Snyk/dependency check, .env for secrets, no secrets in code | Ceramah + demo | Terminal, Snyk dashboard |
| 15' | Latihan mandiri: setup rate limit berbeda per role (public: 100/jam, auth: 1000/jam), audit dependencies, fix vulnerabilities | Problem solving | Soal |
| 5' | Refleksi: security vs developer experience — trade-off | Q&A | — |

### Bahan Ajar
- [Module README](../49-production-ready-code/README.md)
- [Security Hardening](../49-production-ready-code/02-security-hardening.md)

---

## Pertemuan 3: Health Checks & Graceful Shutdown

### Tujuan
- Setup /healthz dan /readyz endpoint
- Implementasi graceful shutdown (SIGTERM handler, connection draining)
- Setup timeout & circuit breaker pattern
- Mengelola process dengan PM2

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 5' | Review: security hardening, transisi ke monitoring & reliability | Q&A | Slide |
| 20' | Materi inti: health check patterns (liveness /healthz, readiness /readyz), dependency checks (DB, Redis, external API), graceful shutdown (SIGTERM, SIGINT), connection draining | Ceramah + demo | Live code |
| 25' | Praktik terbimbing: buat /healthz (return OK), /readyz (check DB connection), graceful shutdown handler (close server, DB, Redis), test with SIGTERM | Hands-on | Starter code |
| 20' | Materi lanjutan: timeout middleware (request timeout), circuit breaker pattern (OP). PM2 ecosystem.config.js, cluster mode, zero-downtime reload, log management | Ceramah + demo | Terminal, PM2 |
| 15' | Latihan mandiri: implement circuit breaker untuk downstream API, setup PM2 cluster mode, test reload without downtime | Problem solving | Soal |
| 5' | Refleksi: health checks sebagai contract dengan orchestrator (Kubernetes, Docker) | Q&A | — |

### Bahan Ajar
- [Module README](../49-production-ready-code/README.md)
- [Health Checks](../49-production-ready-code/03-health-checks.md)

---

## Pertemuan 4: Environment & Configuration

### Tujuan
- Menerapkan 12-factor app principles
- Validasi environment variables dengan Zod
- Konfigurasi per environment (dev, staging, production)
- Manajemen secrets and logging level

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 5' | Review: health checks, transisi ke konfigurasi dan environment | Q&A | — |
| 20' | Materi inti: 12-factor app (codebase, dependencies, config, backing services, build/release/run, processes, port binding, concurrency, disposability, dev/prod parity, logs, admin processes) | Ceramah + demo | Slide 12factor.net |
| 25' | Praktik terbimbing: setup env validation (Zod schema untuk .env), config object per environment (development, test, staging, production), env-specific logging level | Hands-on | Starter code |
| 20' | Materi lanjutan: secrets management (no .env in git, .env.example, vault/secrets manager), AWS Secrets Manager / Doppler, logging level (fatal, error, warn, info, debug, trace), structured log format, log aggregation | Ceramah + demo | Live code, Doppler dashboard |
| 15' | Latihan mandiri: setup config for 3 environments, implement secrets manager integration, configure log level via env | Problem solving | Soal |
| 5' | Refleksi: 12-factor app — mana yang paling sering dilanggar tim pemula? | Q&A | — |

### Bahan Ajar
- [Module README](../49-production-ready-code/README.md)
- [Environment & Configuration](../49-production-ready-code/04-env-config.md)
