# Modul 24: Resilience Patterns — Saga, Health Check & Production

**Tujuan Sesi:** Memahami saga pattern untuk distributed transactions (choreography vs orchestration), compensating transactions, health check endpoints (liveness/readiness), graceful shutdown, rate limiting strategy, dan menggabungkan semua resilience patterns di production.

---

## 4.1 Saga Pattern — Distributed Transaction

### Masalah

Di microservice, satu operasi bisa melibatkan banyak service — dan transaksi database biasa (BEGIN/COMMIT) ga bisa lintas service.

**Contoh:** Order barang
```
Order Service → Payment Service → Inventory Service → Shipping Service
```

Kalo Payment berhasil tapi Inventory gagal, Order udah terlanjur dibuat. Harus ada **kompensasi**.

### Saga: Choreography vs Orchestration

**Choreography** — setiap service publish event, service lain subscribe:
```
Order Service → publish "OrderCreated"
Payment Service → subscribe, process payment → publish "PaymentCompleted"
Inventory Service → subscribe, reduce stock → publish "StockReduced"
Shipping Service → subscribe, create shipment → publish "Shipped"

Kalo gagal → publish event "Failed" + service sebelumnya bikin kompensasi
```

**Orchestration** — satu coordinator (saga manager) ngatur semua langkah:
```
Saga Manager → Order Service (Create Order)
            → Payment Service (Process Payment)
            → Inventory Service (Reduce Stock)
            → Shipping Service (Create Shipment)

Kalo gagal → Saga Manager panggil compensating action urutan terbalik
```

### Choreography vs Orchestration

| Aspek | Choreography | Orchestration |
|-------|-------------|---------------|
| **Kompleksitas** | Tersebar di tiap service | Terpusat di saga manager |
| **Coupling** | Event-driven, loose coupling | Lebih tight — coordinator tau semua |
| **Observability** | Susah dilacak | Coordinator nyatet semua langkah |
| **Scalability** | Tinggi — event bus handle beban | Coordinator bisa jadi bottleneck |
| **Error handling** | Tiap service handle sendiri | Terpusat, lebih konsisten |
| **Use case** | Sistem sederhana, event udah ada | Proses kompleks butuh kontrol ketat |

---

## 4.2 Implementasi Saga (Orchestration)

```typescript
type Step<T> = {
  name: string;
  action: () => Promise<T>;
  compensate: () => Promise<void>;
};

class SagaOrchestrator {
  private executed: Step<any>[] = [];

  async execute(steps: Step<any>[]): Promise<void> {
    for (const step of steps) {
      try {
        console.log(`[Saga] Executing: ${step.name}`);
        await step.action();
        this.executed.push(step);
      } catch (err) {
        console.error(`[Saga] Failed at: ${step.name}`, err);
        await this.rollback();
        throw new Error(`Saga failed at ${step.name}: ${err}`);
      }
    }
    console.log('[Saga] All steps completed successfully');
  }

  private async rollback() {
    // Kompensasi urutan terbalik
    for (const step of this.executed.reverse()) {
      try {
        console.log(`[Saga] Compensating: ${step.name}`);
        await step.compensate();
      } catch (err) {
        console.error(`[Saga] Compensate failed for ${step.name}:`, err);
        // Log failure — butuh manual intervention
      }
    }
  }
}

// Pake:
const saga = new SagaOrchestrator();

await saga.execute([
  {
    name: 'Create Order',
    action: () => db.query('INSERT INTO orders ...'),
    compensate: () => db.query('DELETE FROM orders WHERE id = $1', [orderId]),
  },
  {
    name: 'Process Payment',
    action: () => paymentService.charge(userId, amount),
    compensate: () => paymentService.refund(userId, amount),
  },
  {
    name: 'Reduce Stock',
    action: () => db.query('UPDATE products SET stock = stock - 1 ...'),
    compensate: () => db.query('UPDATE products SET stock = stock + 1 ...'),
  },
]);
```

### Saga dengan Idempotency

```typescript
// Setiap step idempotent — kalo diulang, hasilnya sama
interface SagaStep<T> {
  name: string;
  action: (correlationId: string) => Promise<T>;
  compensate: (correlationId: string) => Promise<void>;
}

class SagaWithIdempotency {
  private executed: string[] = [];

  async execute(steps: SagaStep<any>[], correlationId: string) {
    for (const step of steps) {
      // Cek kalo step ini udah pernah dijalanin
      if (this.executed.includes(step.name)) {
        console.log(`[Saga] Skipping ${step.name} — already executed`);
        continue;
      }

      try {
        await step.action(correlationId);
        this.executed.push(step.name);
      } catch (err) {
        await this.rollback(steps, correlationId);
        throw err;
      }
    }
  }

  private async rollback(steps: SagaStep<any>[], correlationId: string) {
    for (const step of [...steps].reverse()) {
      if (this.executed.includes(step.name)) {
        await step.compensate(correlationId);
      }
    }
  }
}
```

---

## 4.3 Saga vs ACID Transaction

| | ACID Transaction | Saga |
|---|---|---|
| **Scope** | Single database | Multiple services |
| **Isolation** | Full (sesuai level) | Eventual consistency |
| **Rollback** | Otomatis (ROLLBACK) | Manual (compensating actions) |
| **Performance** | Lebih lambat (lock) | Lebih cepat (no lock) |
| **Kompleksitas** | Sederhana | Butuh desain hati-hati |
| **Use case** | Transfer bank, billing | Order processing, booking |

### Compensating Transaction Patterns

| Situasi | Action | Compensate |
|---------|--------|------------|
| Create order | INSERT order | DELETE order (or flag cancelled) |
| Charge payment | Debit card | Refund (full or partial) |
| Reduce stock | UPDATE stock -1 | UPDATE stock +1 |
| Send email | Send via SMTP | No compensate (atau send cancellation email) |
| Reserve hotel | Mark room booked | Mark room available |
| Book flight | Confirm seat | Cancel booking |

**Catatan:** Beberapa operasi ga bisa dikompensasi secara teknis (misal send email). Untuk ini, perlu **eventual consistency** — terima bahwa operasi mungkin ga bisa di-rollback 100%, dan siapin mekanisme manual.

---

## 4.4 Health Check

### Kenapa Perlu?

Health check ngasih tau **apakah service siap nerima traffic**. Dipake oleh:
- **Load balancer** — buat mastiin server sehat
- **Orchestrator (Kubernetes)** — buat decide restart / kill pod
- **Monitoring** — alerting kalo ada yang mati
- **CI/CD** — pastiin deploy sukses

### API Health Check Pattern

```typescript
import express from 'express';
const app = express();

// Basic health — cuma ngecek process hidup
app.get('/healthz', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Ready check — ngecek dependencies
app.get('/readyz', async (req, res) => {
  const checks = {
    database: false,
    redis: false,
    api_external: false,
  };

  try {
    await db.query('SELECT 1');
    checks.database = true;
  } catch {}

  try {
    await redis.ping();
    checks.redis = true;
  } catch {}

  try {
    const resp = await fetch('https://api.external.com/health');
    checks.api_external = resp.ok;
  } catch {}

  const allHealthy = Object.values(checks).every(v => v);
  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'ok' : 'degraded',
    checks,
    timestamp: new Date().toISOString(),
  });
});
```

| Endpoint | Fungsi | Return Kalo Sehat |
|----------|--------|------------------|
| `/healthz` | Liveness — process hidup? | 200 OK |
| `/readyz` | Readiness — siap terima traffic? | 200 OK atau 503 |
| `/metrics` | Metrik Prometheus | Data metrik |

### Health Check Lanjutan

```typescript
// Health check dengan timeout per dependency
async function checkDependency(
  name: string,
  check: () => Promise<boolean>,
  timeoutMs = 2000
): Promise<{ status: string; latency: number }> {
  const start = Date.now();
  try {
    const result = await withTimeout(check(), timeoutMs);
    return {
      status: result ? 'healthy' : 'unhealthy',
      latency: Date.now() - start,
    };
  } catch {
    return {
      status: 'unhealthy',
      latency: Date.now() - start,
    };
  }
}

// Integrasi dengan circuit breaker status
app.get('/readyz', async (req, res) => {
  const checks = {
    database: await checkDependency('database', () => db.query('SELECT 1').then(() => true)),
    redis: await checkDependency('redis', () => redis.ping().then(() => true)),
    paymentCircuit: {
      status: paymentBreaker.opened ? 'unhealthy' : 'healthy',
      circuitState: paymentBreaker.status.stats,
    },
  };

  const allHealthy = Object.values(checks).every(c => c.status === 'healthy');
  res.status(allHealthy ? 200 : 503).json({ status: allHealthy ? 'ok' : 'degraded', checks });
});
```

---

## 4.5 Graceful Shutdown

Kalo container di-restart, jangan langsung mati — kasih waktu buat selesain request yang jalan:

```typescript
import express from 'express';
import { createServer } from 'http';

const app = express();
const server = createServer(app);

// Handle shutdown signal
async function shutdown(signal: string) {
  console.log(`Received ${signal}, shutting down gracefully...`);

  // Stop nerima request baru
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });

  // Kalo ada request yang lama, force close setelah 10 detik
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000).unref();

  // Tutup koneksi database
  await pool.end();
  console.log('Database pool closed');
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

server.listen(3000, () => console.log('Server running on port 3000'));
```

### Graceful Shutdown Checklist

| Step | Keterangan |
|------|-----------|
| 1. Stop health check | Return 503 di `/healthz` biar load balancer ga kirim traffic baru |
| 2. Stop accepting requests | `server.close()` biar ga ada koneksi baru |
| 3. Wait for active requests | Kasih waktu (configurable drain timeout) |
| 4. Close connections | Database pool, Redis, message queue |
| 5. Flush pending data | Kirim pending metrics, logs |
| 6. Exit | `process.exit(0)` kalo sukses, `process.exit(1)` kalo force |

### Express Graceful Shutdown dengan Drain

```typescript
import express from 'express';
import http from 'http';
import { Pool } from 'pg';

let isShuttingDown = false;

const app = express();

// Health check — langsung return 503 kalo lagi shutdown
app.get('/healthz', (req, res) => {
  if (isShuttingDown) {
    return res.status(503).json({ status: 'shutting_down' });
  }
  res.json({ status: 'ok' });
});

// Middleware — tolak request baru pas shutdown
app.use((req, res, next) => {
  if (isShuttingDown) {
    return res.status(503).json({ error: 'Server shutting down' });
  }
  next();
});

const server = http.createServer(app);
const pool = new Pool();

async function shutdown(signal: string) {
  console.log(`[shutdown] Received ${signal}`);
  isShuttingDown = true;

  // Drain: kasih waktu 30 detik buat request selesai
  server.close(() => {
    console.log('[shutdown] HTTP server closed');
    pool.end().then(() => {
      console.log('[shutdown] DB pool closed');
      process.exit(0);
    });
  });

  // Force shutdown kalo melebihi drain timeout
  setTimeout(() => {
    console.error('[shutdown] Drain timeout — force exit');
    process.exit(1);
  }, 30000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

server.listen(3000);
```

---

## 4.6 Rate Limiting Strategy

### Rate Limiter vs Bulkhead vs Circuit Breaker

| Pattern | Fungsi |
|---------|--------|
| **Bulkhead** | Batasi koneksi **bersamaan** (concurrent) |
| **Rate Limiter** | Batasi request per **waktu** (per detik/menit) |
| **Circuit Breaker** | Matiin akses kalo error terus |

### Token Bucket Algorithm

```typescript
class TokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private maxTokens: number,
    private refillRate: number, // token per detik
  ) {
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
  }

  async waitForToken(): Promise<void> {
    this.refill();

    if (this.tokens > 0) {
      this.tokens--;
      return;
    }

    // Kalo abis, tunggu sampe ada token baru
    const waitMs = 1000 / this.refillRate;
    await new Promise(r => setTimeout(r, waitMs));
    return this.waitForToken(); // Coba lagi
  }

  private refill() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    const newTokens = Math.floor(elapsed * this.refillRate);
    if (newTokens > 0) {
      this.tokens = Math.min(this.maxTokens, this.tokens + newTokens);
      this.lastRefill = now;
    }
  }
}

// Pake: max 10 request/detik
const limiter = new TokenBucket(10, 10);

async function handleRequest(req: Request) {
  await limiter.waitForToken();
  return processRequest(req);
}
```

### Sliding Window dengan Redis

Kalo pake banyak server (horizontal scaling), rate limiter harus pake store terpusat:

```typescript
import { createClient } from 'redis';

const redis = await createClient().connect();

async function checkRateLimit(
  key: string,        // "user:123:api"
  limit: number,      // max request
  windowMs: number    // jendela waktu
): Promise<boolean> {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Hapus entry lama & tambah entry baru (atomic)
  const multi = redis.multi();
  multi.zRemRangeByScore(key, 0, windowStart);
  multi.zAdd(key, { score: now, value: `${now}-${Math.random()}` });
  multi.zCard(key);
  multi.expire(key, Math.ceil(windowMs / 1000));

  const [, , count] = await multi.exec();
  return (count as number) <= limit;
}

// Pake di middleware:
async function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const allowed = await checkRateLimit(
    `ratelimit:${req.ip}:${req.path}`,
    100, // 100 request
    60000 // per menit
  );

  if (!allowed) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  next();
}
```

### Rate Limiting Strategy

| Strategi | Algoritma | Use Case |
|----------|-----------|----------|
| **Per-user** | Token bucket / Sliding window | API per user — 100 req/min |
| **Per-IP** | Fixed window | DDoS protection — 1000 req/min per IP |
| **Global** | Token bucket | Total traffic — 10000 req/min |
| **Per-endpoint** | Sliding window | Endpoint berat — 10 req/min |
| **Adaptive** | Custom | Turunin limit kalo server sibuk |

---

## 4.7 Studi Kasus: Aplikasi Resilient

### Arsitektur

```
┌─────────────────────────────────────────────────┐
│                  API Gateway                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Rate     │  │ Auth     │  │ Circuit  │      │
│  │ Limiter  │  │ Middleware│  │ Breaker  │      │
│  └──────────┘  └──────────┘  └──────────┘      │
└─────────────────────────────────────────────────┘
         │           │              │
    ┌────▼───┐  ┌────▼───┐   ┌─────▼────┐
    │ Order  │  │Payment │   │Inventory │
    │ Service│  │Service │   │ Service  │
    │  BULKHEAD(10) BULKHEAD(5) BULKHEAD(8)   │
    └────────┘  └────────┘   └──────────┘
         │           │              │
    ┌────▼───────────▼──────────────▼────┐
    │          Message Queue             │
    │      (Saga Orchestration)          │
    └────────────────────────────────────┘
```

### Full Implementation Pattern

```typescript
import express from 'express';
import { Pool } from 'pg';
import CircuitBreaker from 'opossum';
import Bottleneck from 'bottleneck';
import promiseRetry from 'promise-retry';

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 1. BULKHEAD — pool terpisah per service
const orderLimiter = new Bottleneck({ maxConcurrent: 10, minTime: 100 });
const paymentLimiter = new Bottleneck({ maxConcurrent: 5, minTime: 200 });

// 2. CIRCUIT BREAKER — untuk external API
const paymentBreaker = new CircuitBreaker(
  async (amount: number) => {
    const res = await fetch('https://payment.example.com/charge', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) throw new Error(`Payment failed: ${res.status}`);
    return res.json();
  },
  { timeout: 5000, errorThresholdPercentage: 50, resetTimeout: 30000 }
);

// 3. RETRY + BACKOFF — untuk database transaksi
async function executeTransaction<T>(
  fn: (client: any) => Promise<T>
): Promise<T> {
  return promiseRetry(async (retry, attempt) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (err: any) {
      await client.query('ROLLBACK');
      if (err.code === '40001' && attempt < 3) {
        retry(err);
        return undefined as T;
      }
      throw err;
    } finally {
      client.release();
    }
  }, { retries: 3, minTimeout: 100, factor: 2, randomize: true });
}

// 4. API Endpoint — semua pattern dipake
app.post('/api/orders', async (req, res) => {
  const { userId, items, amount } = req.body;

  try {
    // Pake bulkhead + circuit breaker
    const payment = await paymentLimiter.schedule(() =>
      paymentBreaker.fire(amount)
    );

    // Pake retry transaction
    const order = await executeTransaction(async (client) => {
      const { rows } = await client.query(
        `INSERT INTO orders (user_id, items, amount, payment_id)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [userId, JSON.stringify(items), amount, payment.id]
      );
      return rows[0];
    });

    res.status(201).json({ order, payment });
  } catch (err) {
    console.error('Order failed:', err);
    res.status(503).json({ error: 'Service unavailable, coba lagi nanti' });
  }
});

// 5. Health Check
app.get('/healthz', (req, res) => res.json({ status: 'ok' }));
app.get('/readyz', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch {
    res.status(503).json({ status: 'degraded' });
  }
});

// 6. Graceful Shutdown
const server = app.listen(3000);
process.on('SIGTERM', async () => {
  server.close();
  await pool.end();
  process.exit(0);
});
```

### Ngombinasi Semua Pattern

| Pattern | Dimana | Konfigurasi |
|---------|--------|-------------|
| **Rate Limiter** | API Gateway | 1000 req/min global, 100 req/min per user |
| **Circuit Breaker** | Payment API | Threshold 50%, cooldown 30s |
| **Bulkhead** | Tiap service | Payment: 5, Order: 10, Inventory: 8 |
| **Timeout** | Tiap request | 5s global, 10s untuk file upload |
| **Retry + Backoff** | Database | 3x retry, base 100ms, factor 2, jitter |
| **Saga** | Multi-step | Orchestration via message queue |
| **Health Check** | Tiap service | `/healthz` + `/readyz` |
| **Graceful Shutdown** | Tiap service | Drain timeout 30s |

---

## Latihan

1. **Saga Orchestrator:** Implementasi saga manager untuk proses booking hotel: (1) Reserve room, (2) Charge payment, (3) Send confirmation. Kompensasi: cancel room, refund payment. Test dengan simulate failure di step 2.

2. **Choreography Saga:** Desain sistem event-driven dengan RabbitMQ/Redis pub/sub untuk proses order: OrderService publish `order.created`, PaymentService consume & publish `payment.completed`, InventoryService consume & publish `inventory.updated`. Tulis pseudo-code.

3. **Health Check Dashboard:** Buat 3 endpoint: `/healthz` (liveness), `/readyz` (readiness with dependency checks), `/health/detailed` (lengkap dengan latency per dependency + circuit breaker status).

4. **Graceful Shutdown:** Implementasi graceful shutdown di Express app yang handle SIGTERM. Pastikan ada health endpoint yang return 503 pas shutdown, middleware tolak request baru, dan drain timeout 15 detik.

5. **Rate Limiter:** Implementasi sliding window rate limiter pake Redis cluster. Middleware Express yang batasi 100 request/menit per IP. Kalo exceeded, return 429 dengan `Retry-After` header.

6. **Full Stack Resilient:** Gabungin semua pattern yang udah dipelajari di 4 sesi ini. Buat endpoint `POST /api/checkout` yang:
   - Rate limited (100 req/min per user)
   - Pake circuit breaker untuk payment gateway
   - Pake bulkhead (max 5 concurrent)
   - Pake retry + backoff untuk database transaction
   - Pake saga untuk multi-step (order → payment → inventory → shipping)
   - Health checks
   - Graceful shutdown

---

[« Kembali ke Index](README.md)
