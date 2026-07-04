# RPP Modul 24: Resilience Patterns

**Durasi:** 3 sesi × 90 menit = 270 menit

## Tujuan Pembelajaran

Setelah modul ini, siswa mampu:
- Implementasi retry dengan exponential backoff + jitter
- Menerapkan circuit breaker pattern
- Mengelola timeout dengan AbortController
- Mencegah cascade failure dengan bulkhead
- Setup graceful shutdown + health check

## Tools & Bahan

- Node.js Express app
- opossum (circuit breaker) package
- bottleneck (rate limiter) package
- Redis (opsional, untuk rate limit)
- Load testing: k6 / autocannon

---

## Sesi 1: Retry + Exponential Backoff + Timeout (90 menit)

| Waktu | Aktivitas | Detail |
|-------|-----------|--------|
| 15 menit | **Teori: Retry & Timeout** | Transient vs permanent errors. Exponential backoff: `delay = base × 2^attempt`. Jitter: `+ random * delay`. Timeout: AbortController, Promise.race. |
| 45 menit | **Coding: Retry + Timeout** | Implementasi `fetchWithBackoff` dengan jitter. AbortController untuk timeout. Test: matikan server, lihat retry behavior. |
| 20 menit | **Latihan: Resilient API Client** | Siswa bikin API client: retry 3x + timeout 5s + jitter. Handle 4xx (no retry) vs 5xx (retry). |
| 10 menit | **Review** | Kenapa jitter wajib? Knapa 4xx tidak perlu retry? |

**Code demo:**

```typescript
// Retry + exponential backoff + jitter
async function fetchWithBackoff(url: string, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fetch(url);
    } catch (err) {
      if (attempt === maxRetries - 1) throw err;
      if (err instanceof Response && err.status < 500) throw err; // 4xx no retry
      const delay = 100 * Math.pow(2, attempt);
      await new Promise(r =>
        setTimeout(r, delay + Math.random() * delay) // jitter
      );
    }
  }
}

// Timeout with AbortController
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 5000);
try {
  const res = await fetch(url, { signal: controller.signal });
} catch (err) {
  if (err.name === 'AbortError') console.log('Request timed out');
}
clearTimeout(timeoutId);
```

**Checklist siswa:**
- [ ] Retry 3x dengan exponential backoff
- [ ] Jitter random
- [ ] 4xx tidak di-retry
- [ ] AbortController timeout 5s

---

## Sesi 2: Circuit Breaker + Bulkhead (90 menit)

| Waktu | Aktivitas | Detail |
|-------|-----------|--------|
| 15 menit | **Teori: Circuit Breaker & Bulkhead** | 3 states: CLOSED → OPEN → HALF-OPEN. Threshold: 50% error / 5 failures. Fallback response. Bulkhead: pool terpisah per service. |
| 45 menit | **Coding: Circuit Breaker with Opossum** | Setup opossum. Test: service down → circuit OPEN → fallback → HALF-OPEN → recover. Bulkhead pool dengan bottleneck. |
| 20 menit | **Latihan: Protect Critical Service** | Siswa implement circuit breaker untuk service payment/rekomendasi. Fallback: cached response / graceful degradation. |
| 10 menit | **Review** | Kapan circuit breaker OPEN? Kenapa HALF-OPEN penting? Bagaimana hitung pool size? |

**Code demo:**

```typescript
// Circuit Breaker (opossum)
import CircuitBreaker from 'opossum';

const breaker = new CircuitBreaker(fetchPaymentService, {
  timeout: 3000,
  errorThresholdPercentage: 50,     // OPEN at 50% error
  resetTimeout: 30000,              // try HALF-OPEN after 30s
});

breaker.fallback(() => ({
  cached: true,
  status: 'service_unavailable',
}));

breaker.on('open', () => console.log('⚡ Circuit OPEN — using fallback'));
breaker.on('halfOpen', () => console.log('🔶 Circuit HALF-OPEN — testing'));
breaker.on('close', () => console.log('✅ Circuit CLOSED — recovered'));

// Bulkhead — pool per service
import Bottleneck from 'bottleneck';

const paymentLimiter = new Bottleneck({ maxConcurrent: 5, minTime: 200 });
const notifLimiter = new Bottleneck({ maxConcurrent: 10, minTime: 100 });

async function processPayment(data) {
  return paymentLimiter.schedule(() => fetch('/pay', { method: 'POST', body: data }));
}
```

**Checklist siswa:**
- [ ] Circuit breaker dengan opossum
- [ ] Fallback response
- [ ] Event handler (open, halfOpen, close)
- [ ] Bulkhead pool terpisah
- [ ] Hitung pool size

---

## Sesi 3: Health Check + Graceful Shutdown + Rate Limiting (90 menit)

| Waktu | Aktivitas | Detail |
|-------|-----------|--------|
| 15 menit | **Teori: Production Resilience** | Health check endpoint (`/health`). Graceful shutdown: SIGTERM → stop accept → drain connections. Rate limiting: per IP, per user, sliding window. |
| 45 menit | **Coding: Health + Shutdown + Rate Limit** | Setup `/health` endpoint (DB ping, Redis ping, uptime). Graceful shutdown handler. Rate limit with sliding window. |
| 20 menit | **Latihan: Complete Resilience Package** | Siswa gabung semua pattern: retry + circuit breaker + health check + graceful shutdown + rate limit. |
| 10 menit | **Review** | Bagaimana urutan shutdown yang benar? Kenapa rate limit penting? |

**Code demo:**

```typescript
// Health check
app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    await redis.ping();
    res.json({ status: 'ok', uptime: process.uptime() });
  } catch (err) {
    res.status(503).json({ status: 'degraded', error: err.message });
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received — shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed');
    db.end();
    redis.disconnect();
    process.exit(0);
  });
  // Force exit after 30s
  setTimeout(() => process.exit(1), 30000);
});

// Rate limiting
const rateLimit = new Bottleneck({
  maxConcurrent: 1,
  minTime: 1000, // 1 request per second
});

app.post('/api/login', async (req, res) => {
  try {
    await rateLimit.schedule(() => handleLogin(req, res));
  } catch {
    res.status(429).json({ error: 'Too many requests' });
  }
});
```

**Checklist siswa:**
- [ ] `/health` endpoint
- [ ] Graceful shutdown (SIGTERM)
- [ ] Rate limit per IP
- [ ] Gabung retry + circuit breaker + health

## Assessment

| Kriteria | Bobot |
|----------|-------|
| Retry + backoff + timeout + jitter | 25% |
| Circuit breaker + bulkhead | 30% |
| Health check + graceful shutdown + rate limit | 30% |
| Partisipasi | 15% |
