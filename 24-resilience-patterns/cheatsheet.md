# 🧠 Cheatsheet: Resilience Patterns

> Referensi cepet — 1 halaman.

## Topik Utama
- **Retry + Exponential Backoff**: delay = baseDelay × 2^attempt; jitter biar ga tabrakan
- **Circuit Breaker**: CLOSED (normal) → OPEN (request ditolak) → HALF-OPEN (test 1 request)
- **Timeout & Deadline**: `AbortController` fetch, `Promise.race`, timeout per layer (DB 1-5s, API 3-10s)
- **Bulkhead**: pool terpisah per service — 1 service lemot ga ngebunuh yang lain
- **Rate Limiting**: batas request per IP / user — cegah brute force & abuse
- **Health Check**: endpoint `/health` buat monitor + load balancer
- **Graceful Shutdown**: tangkap SIGTERM, stop terima request, selesaikan koneksi aktif
- **Saga Pattern**: distributed transaction pake choreography / orchestration

## Command / Sintaks Penting

```typescript
// Exponential backoff + jitter
async function fetchWithBackoff(url: string, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try { return await fetch(url); }
    catch (err) {
      if (attempt === maxRetries - 1) throw err;
      const delay = 100 * Math.pow(2, attempt);
      await new Promise(r => setTimeout(r, delay + Math.random() * delay));
    }
  }
}

// Circuit Breaker (opossum)
import CircuitBreaker from 'opossum';
const breaker = new CircuitBreaker(fetchData, {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000,
});
breaker.fallback(() => ({ cached: true, data: [] }));
breaker.on('open', () => console.log('Circuit OPEN'));

// Timeout fetch
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 5000);
const res = await fetch(url, { signal: controller.signal });
clearTimeout(timeoutId);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  server.close(() => process.exit(0));
});
```

## Tips & Trik
- **Jangan retry 4xx** — client error, ga bakal berhasil.
- **Retry cuma 5xx, 429, network timeout, deadlock** — transient errors.
- **Jitter wajib** — 100 request retry barengan = tabrakan terus.
- **Circuit breaker threshold**: 50% error atau 5 failure berturut-turut.
- **Bulkhead pool size** — hitung based on expected concurrency per service.

## Common Mistakes
❌ Retry tanpa jitter — thundering herd problem.
❌ Circuit breaker tanpa fallback — user liat error mentah.
❌ Timeout terlalu panjang (30s+) — koneksi pool habis.
❌ Bulkhead pool terlalu kecil — request antre panjang, latency naik.
❌ Lupa handle graceful shutdown — koneksi tiba-tiba putus, data loss.

## Link Cepat
- [Module README](README.md)
- [Quiz](quiz.md)
- [Opossum (Circuit Breaker)](https://github.com/nodeshift/opossum)
- [Bottleneck (Rate Limiter)](https://github.com/SGrondin/bottleneck)
