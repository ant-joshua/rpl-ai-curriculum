# Modul 24: Resilience Patterns — Backoff, Circuit Breaker, Database Transaction

![Resilience Patterns](https://img.shields.io/badge/Level-Intermediate-blue) ![Duration](https://img.shields.io/badge/Duration-4_sesi-green) ![Prerequisites](https://img.shields.io/badge/Prerequisites-Node.js_/_TypeScript-orange)

| Metadata | |
|----------|-|
| **Level** | Intermediate |
| **Durasi** | 4 sesi (@ 60-90 menit) |
| **Prerequisites** | Node.js, TypeScript, Express, PostgreSQL dasar |
| **Output** | Aplikasi Express dengan resilience patterns lengkap |

---

## Tujuan Pembelajaran

Setelah mempelajari modul ini, siswa mampu:

1. **Menerapkan retry dengan exponential backoff + jitter** untuk menangani error transient secara efektif tanpa membebani server
2. **Mengimplementasikan circuit breaker** untuk melindungi sistem dari cascading failure dengan state transitions (CLOSED/OPEN/HALF-OPEN)
3. **Mengelola timeout dan deadline** di aplikasi dengan AbortController dan timeout per-layer
4. **Mengisolasi resource dengan bulkhead pattern** — pool terpisah per service biar satu kegagalan ga ngerembet
5. **Membangun health check dan graceful shutdown** — liveness, readiness, drain mechanism
6. **Menerapkan rate limiting** dengan token bucket dan sliding window di environment terdistribusi
7. **Memahami saga pattern** untuk distributed transaction (choreography vs orchestration) dengan compensating actions
8. **Menggabungkan semua resilience patterns** dalam satu aplikasi production-ready

---

## Sesi Pembelajaran

| # | Sesi | Topik | Durasi |
|---|------|-------|--------|
| 1 | [Retry & Backoff](01-retry-backoff.md) | Exponential backoff, jitter, status code check, promise-retry, idempotency key, retry budget | 60 menit |
| 2 | [Circuit Breaker](02-circuit-breaker.md) | CLOSED/OPEN/HALF-OPEN states, threshold, cooldown, opossum library, monitoring | 60 menit |
| 3 | [Timeout & Bulkhead](03-timeout-bulkhead.md) | Timeout vs deadline, AbortController, bulkhead pool, connection pool separation, semaphore | 60 menit |
| 4 | [Saga, Health Check & Production](04-saga-health.md) | Saga pattern, compensating transactions, health check, graceful shutdown, rate limiting, full implementation | 90 menit |

---

## Quick Reference — Cuplikan Kode

### Retry + Exponential Backoff + Jitter

```typescript
import promiseRetry from 'promise-retry';

const result = await promiseRetry(async (retry, attempt) => {
  return await fetch('https://api.example.com/data').catch(retry);
}, { retries: 3, factor: 2, minTimeout: 200, maxTimeout: 2000, randomize: true });
```
[Lihat selengkapnya →](01-retry-backoff.md#15-retry-library-di-nodejs)

### Circuit Breaker

```typescript
import CircuitBreaker from 'opossum';

const breaker = new CircuitBreaker(fetchData, {
  timeout: 3000, errorThresholdPercentage: 50, resetTimeout: 30000,
});
breaker.fallback(() => ({ cached: true, data: [] }));
const data = await breaker.fire('https://api.example.com/users');
```
[Lihat selengkapnya →](02-circuit-breaker.md#24-opossum-library)

### Timeout + AbortController

```typescript
function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timeoutId));
}
```
[Lihat selengkapnya →](03-timeout-bulkhead.md#33-abortcontroller-di-fetch-api)

### Bulkhead Pool

```typescript
const paymentPool = new BulkheadPool(5);  // Max 5 concurrent
const userPool = new BulkheadPool(10);    // Max 10 concurrent
```
[Lihat selengkapnya →](03-timeout-bulkhead.md#36-implementasi-thread-pool-terpisah)

### Rate Limiter (Token Bucket)

```typescript
const limiter = new TokenBucket(10, 10);  // Max 10 request/detik
await limiter.waitForToken();
```
[Lihat selengkapnya →](04-saga-health.md#token-bucket-algorithm)

### Sliding Window Rate Limiter (Redis)

```typescript
async function checkRateLimit(key: string, limit: number, windowMs: number) {
  // Menggunakan Redis sorted sets untuk sliding window
  const [, , count] = await multi.exec();
  return (count as number) <= limit;
}
```
[Lihat selengkapnya →](04-saga-health.md#sliding-window-dengan-redis)

### Saga Orchestrator

```typescript
const saga = new SagaOrchestrator();
await saga.execute([
  { name: 'Create Order',  action: createOrder,  compensate: cancelOrder },
  { name: 'Process Payment', action: chargePayment, compensate: refundPayment },
  { name: 'Reduce Stock',    action: reduceStock,  compensate: restoreStock },
]);
```
[Lihat selengkapnya →](04-saga-health.md#42-implementasi-saga-orchestration)

### Health Check + Graceful Shutdown

```typescript
app.get('/healthz', (req, res) => res.json({ status: 'ok' }));
app.get('/readyz', async (req, res) => { /* cek dependencies */ });

process.on('SIGTERM', () => { server.close(); pool.end(); process.exit(0); });
```
[Lihat selengkapnya →](04-saga-health.md#44-health-check)

### Full Production Implementation

```typescript
// Retry → Circuit Breaker → Bulkhead → Health Check → Graceful Shutdown
app.post('/api/orders', async (req, res) => {
  const payment = await paymentLimiter.schedule(() => paymentBreaker.fire(amount));
  const order = await executeTransaction(async (client) => { /* ... */ });
  res.status(201).json({ order, payment });
});
```
[Lihat selengkapnya →](04-saga-health.md#47-studi-kasus-aplikasi-resilient)

---

## Rangkuman Pattern

| Pattern | Masalah | Solusi |
|---------|---------|--------|
| **Retry + Backoff** | Error transient | Coba ulang dengan delay makin lama + jitter |
| **Circuit Breaker** | Cascading failure | Matiin akses kalo error terus, coba lagi nanti |
| **Timeout** | Request menggantung | Batasi waktu tunggu maksimal per layer |
| **Bulkhead** | Satu service lemot ganggu yang lain | Pool terpisah per service / resource |
| **Rate Limiter** | Abuse / overload | Batasi request per waktu (token bucket, sliding window) |
| **Health Check** | Ga tau status service | Endpoint `/healthz` + `/readyz` untuk orchestrator |
| **Graceful Shutdown** | Request terputus pas restart | Tunggu request selesai, drain, baru exit |
| **Saga** | Transaksi lintas service | Event-driven atau orchestration dengan kompensasi |

---

## Referensi

- [opossum (Circuit Breaker)](https://github.com/nodeshift/opossum)
- [promise-retry](https://github.com/IndigoUnited/node-promise-retry)
- [bottleneck (Rate Limiter)](https://github.com/SGrondin/bottleneck)
- [Microsoft — Resilience Patterns](https://learn.microsoft.com/en-us/azure/architecture/patterns/category/resiliency)
- [AWS — Exponential Backoff](https://docs.aws.amazon.com/general/latest/gr/api-retries.html)
- [PostgreSQL — Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
