# Modul 24: Resilience Patterns — Timeout & Bulkhead

**Tujuan Sesi:** Memahami timeout patterns (deadline, timeout per call vs per operation), AbortController, bulkhead pattern (thread pool isolation), connection pool separation, dan implementasi semaphore.

---

## 3.1 Kenapa Timeout Penting?

Request yang ga pernah selesai bisa **ngabisin resource** — koneksi pool penuh, thread blocked, user nunggu lama.

**Tanpa timeout:**
```
Request A → fetch API → API lemot → . . . → 120 detik baru sadar timeout
Request B → fetch API → . . . → semua koneksi pool abis
```

**Dengan timeout:**
```
Request A → fetch API → 5 detik → timeout → release koneksi
Request B → fetch API → selesai normal
```

### Dampak Tanpa Timeout

- **Connection pool exhaustion** — koneksi database abis digantung
- **Memory leak** — promise yang pending nyimpen reference
- **User experience buruk** — loading spinner selamanya
- **Cascading failure** — service A nunggu service B yang juga nunggu service C

---

## 3.2 Implementasi Timeout

```typescript
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]);
}

// Pake:
try {
  const data = await withTimeout(fetch('/api/data'), 5000);
  console.log('Response:', data);
} catch (err) {
  console.error('Request gagal atau timeout:', err);
}
```

### Kelemahan `Promise.race`

`Promise.race` ga **membatalkan** promise yang lambat — cuma return lebih cepet. Promise asli tetep jalan di background sampe selesai atau error. Makanya better pake **AbortController** kalo bisa.

---

## 3.3 AbortController di Fetch API

```typescript
function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);

  return fetch(url, { signal: controller.signal })
    .finally(() => clearTimeout(timeoutId));
}

// Pake:
try {
  const res = await fetchWithTimeout('https://api.example.com', 3000);
  const data = await res.json();
} catch (err) {
  if (err instanceof DOMException && err.name === 'AbortError') {
    console.error('Request di-cancel karena timeout');
  } else {
    console.error('Network error:', err);
  }
}
```

### AbortController untuk Multiple Request

Satu controller bisa dipake buat cancel beberapa request sekaligus:

```typescript
function searchWithDeadline(query: string, deadlineMs: number) {
  const controller = new AbortController();

  // Cancel semua kalo salah satu selesai duluan
  const results = Promise.race([
    fetch(`/api/search/a?q=${query}`, { signal: controller.signal }),
    fetch(`/api/search/b?q=${query}`, { signal: controller.signal }),
    fetch(`/api/search/c?q=${query}`, { signal: controller.signal }),
  ]);

  // Atau cancel semua kalo lewat deadline
  setTimeout(() => controller.abort(), deadlineMs);

  return results;
}
```

---

## 3.4 Timeout Per Layer

| Layer | Timeout | Contoh |
|-------|---------|--------|
| HTTP Request | 5-10s | `fetch` dengan AbortController |
| Database Query | 1-5s | `statement_timeout` di PostgreSQL |
| External API | 3-10s | Tergantung SLA provider |
| File Upload | 30-120s | File besar butuh waktu lebih |
| WebSocket | > 60s | Koneksi long-lived |
| Cache (Redis) | 100-500ms | Cepet harusnya, timeout pendek |

### Timeout Berlapis

```typescript
async function layeredTimeout() {
  const DEADLINE = 8000; // Total maksimal 8 detik

  // Layer 1: Database query — 3 detik
  const dbPromise = db.query('SELECT ...', { timeout: 3000 });

  // Layer 2: External API — 5 detik
  const apiPromise = fetchWithTimeout('https://api.example.com', 5000);

  // Layer 3: Deadline keseluruhan — 8 detik
  const result = await withTimeout(
    Promise.all([dbPromise, apiPromise]),
    DEADLINE
  );

  return result;
}
```

### Deadline vs Timeout

| Konsep | Arti | Implementasi |
|--------|------|-------------|
| **Timeout** | Max waktu per **call** | `setTimeout` + reject setelah N ms |
| **Deadline** | Max waktu per **operation** (bisa multi-call) | `AbortController.timeout()` atau `Promise.race` |

```
DEADLINE:   |------------ 10 detik ------------|
CALL 1:     |-- 3s --|                               ✓
CALL 2 (retry):       |-- 3s --|                      ✓
CALL 3 (retry):                |-- 3s --|             ✓
                              ↑ deadline → kalau lebih dari 10s total → fail
```

---

## 3.5 Bulkhead Pattern

### Konsep

Bulkhead = sekat di kapal. Kalo satu kompartemen bocor, yang lain tetep kering. Di aplikasi: **satu service yang down ga boleh ngebunuh yang lain.**

**Tanpa bulkhead:**
```
┌─────────────────────────────────────┐
│ Satu koneksi pool / thread pool     │
│ Payment API lemot → semua antre     │
│ → User API juga ikut lambat         │
└─────────────────────────────────────┘
```

**Dengan bulkhead:**
```
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Payment  │  │ User API │  │ Notif    │
│ Pool: 5  │  │ Pool: 10 │  │ Pool: 3  │
└──────────┘  └──────────┘  └──────────┘
Payment lemot  Tetap normal  Tetap normal
```

### Kapan Pake Bulkhead?

- **External API calls** — tiap API partner punya pool sendiri
- **Database connections** — pisah pool untuk read vs write
- **CPU-intensive tasks** — image processing, PDF generation
- **Microservice communication** — tiap downstream service punya batas sendiri

---

## 3.6 Implementasi Thread Pool Terpisah

```typescript
class BulkheadPool {
  private running = 0;
  private queue: (() => void)[] = [];

  constructor(private maxConcurrent: number) {}

  async run<T>(fn: () => Promise<T>): Promise<T> {
    if (this.running >= this.maxConcurrent) {
      // Antre — tunggu sampe ada slot
      await new Promise<void>((resolve) => {
        this.queue.push(resolve);
      });
    }

    this.running++;
    try {
      return await fn();
    } finally {
      this.running--;
      // Kasih slot ke antrean berikutnya
      if (this.queue.length > 0) {
        const next = this.queue.shift()!;
        next();
      }
    }
  }
}

// Pake — pool terpisah per service
const paymentPool = new BulkheadPool(5);
const userPool = new BulkheadPool(10);
const notifPool = new BulkheadPool(3);

async function pay(orderId: string) {
  return paymentPool.run(() => fetch(`/api/pay/${orderId}`));
}

async function getUsers() {
  return userPool.run(() => fetch('/api/users'));
}
```

### Bulkhead dengan Timeout

```typescript
class BulkheadWithTimeout {
  private running = 0;
  private queue: (() => void)[] = [];

  constructor(
    private maxConcurrent: number,
    private timeoutMs: number,     // Max nunggu di antrean
  ) {}

  async run<T>(fn: () => Promise<T>): Promise<T> {
    if (this.running >= this.maxConcurrent) {
      // Tunggu dengan timeout — kalo abis, throw
      const waitPromise = new Promise<void>((resolve, reject) => {
        const timer = setTimeout(
          () => reject(new Error(`Queue timeout after ${this.timeoutMs}ms`)),
          this.timeoutMs
        );
        this.queue.push(() => {
          clearTimeout(timer);
          resolve();
        });
      });

      await waitPromise;
    }

    this.running++;
    try {
      return await fn();
    } finally {
      this.running--;
      if (this.queue.length > 0) {
        const next = this.queue.shift()!;
        next();
      }
    }
  }
}
```

---

## 3.7 Connection Pool Separation

Bukan cuma thread pool — connection pool juga perlu dipisah:

```typescript
import { Pool } from 'pg';

// Pool read — banyak concurrency, query ringan
const readPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,         // Max 20 koneksi
  idleTimeoutMillis: 30000,
});

// Pool write — lebih dikit, hindari lock contention
const writePool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,          // Max 5 koneksi
  idleTimeoutMillis: 30000,
});

// Pake:
async function getUsers() {
  return readPool.query('SELECT * FROM users');
}

async function createOrder(data: any) {
  return writePool.query('INSERT INTO orders ...', [data]);
}
```

### Koneksi Pool per Service

```typescript
// Di microservice architecture, tiap downstream pake pool sendiri
const paymentDb = new Pool({ max: 5 });
const inventoryDb = new Pool({ max: 8 });
const analyticsDb = new Pool({ max: 3 });

// Payment lemot → cuma pool payment yang penuh
// Inventory dan analytics tetep jalan normal
```

---

## 3.8 Semaphore Implementation

Semaphore adalah generalisasi bulkhead — kontrol akses ke resource terbatas:

```typescript
class Semaphore {
  private permits: number;
  private queue: (() => void)[] = [];

  constructor(private maxPermits: number) {
    this.permits = maxPermits;
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return;
    }

    // Tunggu sampe ada permit yang di-release
    await new Promise<void>((resolve) => {
      this.queue.push(resolve);
    });
  }

  release(): void {
    if (this.queue.length > 0) {
      // Kasih permit ke yang nunggu
      const next = this.queue.shift()!;
      next();
    } else {
      this.permits++;
    }
  }

  async run<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }
}

// Pake — resource-based isolation, bukan service-based
const dbSemaphore = new Semaphore(10);  // Max 10 concurrent DB calls
const fileSemaphore = new Semaphore(3); // Max 3 file operations

async function processFile(path: string) {
  return fileSemaphore.run(async () => {
    const data = await readFile(path);
    return transform(data);
  });
}
```

### Bulkhead vs Semaphore

| Konsep | Bulkhead Pool | Semaphore |
|--------|---------------|-----------|
| **Fokus** | Isolasi per service | Kontrol akses per resource |
| **Concurrency** | Pool terpisah | Permit bersama |
| **Use case** | Payment pool, user pool | DB connection, file I/O |
| **Antrean** | Per pool | Per semaphore |

---

## 3.9 Pake Bottleneck Library

```bash
bun add bottleneck
```

```typescript
import Bottleneck from 'bottleneck';

const paymentLimiter = new Bottleneck({
  maxConcurrent: 5,
  minTime: 200, // Minimal 200ms antar request
});

const userLimiter = new Bottleneck({
  maxConcurrent: 10,
  minTime: 50,
});

// Wrap function
const getPayment = paymentLimiter.wrap(fetchPayment);
const getUsers = userLimiter.wrap(fetchUsers);

// Jalan — ga saling ganggu
const [payment, users] = await Promise.all([
  getPayment('order-123'),
  getUsers(),
]);
```

### Opsi Bottleneck

| Opsi | Default | Fungsi |
|------|---------|--------|
| `maxConcurrent` | 0 (unlimited) | Max request berjalan bersamaan |
| `minTime` | 0 | Minimal interval antar request (ms) |
| `highWater` | null | Max ukuran antrean |
| `strategy` | Inline | Strategi kalo antrean penuh (Bottleneck.strategy.OVERFLOW, BLOCK, etc) |
| `penalty` | `minTime` | Extra delay kalo rate limit kena |

---

## Latihan

1. **Implementasi Timeout:** Buat fungsi `withDeadline(promise, deadlineMs)` yang return error `'DEADLINE_EXCEEDED'` kalo lewat deadline. Test dengan promise lambat (5 detik) dan deadline 2 detik.

2. **AbortController:** Buat fungsi `fetchWithDeadline(url, timeoutMs, deadlineMs)` — timeout untuk per-call (3 detik) + deadline total (8 detik). Kalo deadline tercapai, abort semua request yang masih jalan.

3. **Bulkhead Pool:** Implementasi `BulkheadPool` dengan max concurrent 3. Test dengan 10 promise yang masing-masing selesai dalam 1 detik. Pastikan ga pernah lebih dari 3 jalan bersamaan.

4. **Connection Pool Separation:** Di aplikasi Express, buat 2 pool PostgreSQL: readPool (max 15) dan writePool (max 5). Route GET `/users` pake readPool, route POST `/users` pake writePool.

5. **Semaphore Rate Limiter:** Gunakan Semaphore class di atas untuk batasi akses ke file system — max 2 operasi file bersamaan. Test dengan 5 operasi baca file yang jalan bersama.

6. **Studi Kasus:** Aplikasi e-commerce punya 3 external dependency: Payment (SLA 2 detik), Inventory (SLA 500ms), Shipping (SLA 5 detik). Desain timeout per-call, deadline per-operasi, dan bulkhead isolation. Berapa max concurrency masing-masing?

---

[« Kembali ke Index](README.md) | Lanjut ke [04-saga-health](04-saga-health.md)
