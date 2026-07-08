# Modul 24: Resilience Patterns — Retry & Backoff

**Tujuan Sesi:** Memahami dan menerapkan retry dengan exponential backoff + jitter, memeriksa status code sebelum retry, menggunakan library promise-retry, mengelola idempotency key, dan menghindari pitfall umum.

---

## 1.1 Kenapa Retry?

Network call bisa gagal karena alasan **transient** — koneksi drop, server sibuk, timeout. Retry logic otomatis nyoba lagi dengan jeda strategis.

**Jangan retry kalo:**
- Error 4xx (client error) — salah request, ga bakal berhasil
- Error auth (401/403) — token expired, retry ga guna
- Resource not found (404) — ga bakal muncul

**Retry kalo:**
- 429 Too Many Requests — server minta mondar-mandir
- 5xx Server Error — server lagi error, mungkin recover
- Network timeout / ECONNRESET — koneksi drop
- Database deadlock / serialization failure (PostgreSQL 40001)

---

## 1.2 Exponential Backoff

Jeda antar retry makin lama secara eksponensial:

```
Retry 1 → tunggu 100ms
Retry 2 → tunggu 200ms
Retry 3 → tunggu 400ms
Retry 4 → tunggu 800ms
Retry 5 → tunggu 1600ms
```

**Formula:** `delay = baseDelay * (2 ^ attempt)`

```typescript
async function fetchWithBackoff(url: string, maxRetries = 3): Promise<Response> {
  const baseDelay = 100; // ms

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fetch(url);
    } catch (err) {
      if (attempt === maxRetries - 1) throw err; // Terakhir, lempar error

      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Retry ${attempt + 1} in ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error('Unreachable');
}
```

### Batasi Delay Maksimal

Exponential backoff tanpa batas bisa jadi delay terlalu lama. Selalu set `maxDelay`:

```typescript
function calculateDelay(baseMs: number, attempt: number, maxMs = 10000): number {
  const delay = baseMs * Math.pow(2, attempt);
  return Math.min(delay, maxMs);
}
```

---

## 1.3 Jitter — Biar Ga Tabrakan

Kalo 100 request gagal barengan trus retry barengan, mereka tabrakan terus. **Jitter** nambahin acak ke delay biar tersebar.

```
Tanpa jitter: 100 req → delay 100ms → 100 req → delay 200ms → tabrakan terus
Dengan jitter: 100 req → delay 37-163ms → tersebar
```

```typescript
function sleepWithJitter(baseMs: number): Promise<void> {
  // Jitter: acak antara 0 sampai baseMs
  const jitter = Math.random() * baseMs;
  return new Promise(r => setTimeout(r, baseMs + jitter));
}

// Atau pake "full jitter" — delay total acak dari 0 sampai target
function sleepFullJitter(baseMs: number, attempt: number): Promise<void> {
  const maxDelay = baseMs * Math.pow(2, attempt);
  const delay = Math.random() * maxDelay;
  return new Promise(r => setTimeout(r, delay));
}
```

### Strategi Jitter Lainnya

| Strategi | Formula | Karakteristik |
|----------|---------|---------------|
| **Full Jitter** | `random(0, maxDelay)` | Paling tersebar, recommended untuk high concurrency |
| **Equal Jitter** | `maxDelay/2 + random(0, maxDelay/2)` | Kompromi antara spread dan delay minimal |
| **Decorrelated Jitter** | `min(maxDelay, baseDelay + random(0, prevDelay * 3))` | Pertumbuhan lebih alamiah |

---

## 1.4 Retry dengan Status Code Check

```typescript
async function fetchSmart(url: string, options?: RequestInit): Promise<Response> {
  const maxRetries = 3;
  const baseDelay = 200;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, options);

    if (response.ok) return response; // 200-299 → sukses

    if (response.status === 429) {
      // Rate limited — tunggu sesuai Retry-After header
      const retryAfter = parseInt(response.headers.get('Retry-After') || '5', 10);
      await sleep(retryAfter * 1000 + Math.random() * 500);
      continue;
    }

    if (response.status >= 500 && attempt < maxRetries) {
      // Server error — retry dengan backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await sleep(delay + Math.random() * delay);
      continue;
    }

    // 4xx besides 429 — jangan retry
    return response;
  }

  throw new Error(`Max retries reached`);
}
```

### Strategi Berdasarkan Status Code

| Status Code | Retry? | Strategi |
|-------------|--------|----------|
| 200-299 | ❌ Sukses | Return response |
| 429 Too Many Requests | ✅ | Tunggu `Retry-After` header + jitter |
| 5xx Server Error | ✅ | Exponential backoff + jitter |
| 401/403 Unauthorized | ❌ | Token mungkin expired, refresh dulu |
| 400 Bad Request | ❌ | Client error, ga bakal berhasil |
| 404 Not Found | ❌ | Resource ga ada, retry ga guna |
| 408 Request Timeout | ⚠️ Mungkin | Bisa retry 1-2x dengan backoff singkat |

---

## 1.5 Retry Library di Node.js

Better pake library yang udah mature daripada nulis manual:

```bash
bun add promise-retry
```

```typescript
import promiseRetry from 'promise-retry';

const result = await promiseRetry(async (retry, attempt) => {
  console.log(`Attempt ${attempt}...`);

  try {
    return await fetch('https://api.example.com/data');
  } catch (err) {
    retry(err); // Akan retry dengan backoff otomatis
  }
}, {
  retries: 3,
  factor: 2,       // exponential factor
  minTimeout: 200, // base delay
  maxTimeout: 2000, // max delay
  randomize: true,  // add jitter
});
```

| Opsi | Default | Fungsi |
|------|---------|--------|
| `retries` | 10 | Max percobaan |
| `factor` | 2 | Pengali exponensial |
| `minTimeout` | 1000 | Delay awal (ms) |
| `maxTimeout` | Infinity | Batas delay maksimal |
| `randomize` | false | Tambah jitter 0.5x-1.5x |

---

## 1.6 Idempotency Key

Retry bisa menyebabkan duplikasi operasi kalo request berhasil di server tapi response gagal sampe client. **Idempotency key** mastiin operasi cuma diproses sekali.

```typescript
import { v4 as uuidv4 } from 'uuid';

async function createPaymentWithIdempotency(
  amount: number,
  idempotencyKey?: string
): Promise<PaymentResponse> {
  const key = idempotencyKey || uuidv4();

  return promiseRetry(async (retry) => {
    const res = await fetch('https://api.payment.com/charge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': key, // Key unik dikirim tiap retry
      },
      body: JSON.stringify({ amount }),
    });

    if (!res.ok) {
      // 409 Conflict = request udah diproses pake key ini
      if (res.status === 409) return res.json();
      throw new Error(`Payment failed: ${res.status}`);
    }

    return res.json();
  }, { retries: 2, minTimeout: 500, randomize: true });
}

// Pake:
const payment = await createPaymentWithIdempotency(50000, 'order-123-retry-1');
```

### Best Practice Idempotency Key

- **Generate sekali** di awal request, kirim ulang key yang sama pas retry
- **Gunakan UUID** atau kombinasi unik (orderId + timestamp)
- **Simpan key** di database server untuk deteksi duplikasi
- **TTL** — set expiry biar key ga numpuk (biasanya 24 jam)

---

## 1.7 Retry Budget

Jangan retry tanpa batas — bisa bikin sistem makin collapse. **Retry budget** ngebatasin total retry dalam periode tertentu.

```typescript
class RetryBudget {
  private tokens: number;

  constructor(
    private maxTokens: number,      // Max retry yang diizinkan
    private refillInterval: number,  // Refill per detik
    private refillAmount: number,    // Token baru per interval
  ) {
    this.tokens = maxTokens;
    setInterval(() => {
      this.tokens = Math.min(this.maxTokens, this.tokens + this.refillAmount);
    }, refillInterval);
  }

  allowRetry(): boolean {
    if (this.tokens <= 0) return false;
    this.tokens--;
    return true;
  }

  getStatus() {
    return { remaining: this.tokens, max: this.maxTokens };
  }
}

// Pake:
const budget = new RetryBudget(10, 1000, 5); // Max 10 retry, refill 5/detik

async function fetchWithBudget(url: string): Promise<Response> {
  // ... logic fetch
  if (needRetry && !budget.allowRetry()) {
    console.warn('Retry budget habis — skip retry');
    throw new Error('Retry budget exceeded');
  }
}
```

---

## 1.8 Common Pitfalls

| Pitfall | Masalah | Solusi |
|---------|---------|--------|
| **Retry tanpa jitter** | 100 request retry bareng → banjir lagi | Tambah jitter (full jitter recommended) |
| **Retry 4xx error** | Client error ga bakal sukses diulang | Cek status code, skip retry |
| **Max retry terlalu besar** | Service makin down karena banjir retry | Batasi max 3-5 retry + retry budget |
| **Retry terlalu cepat** | Ga kasih waktu server recover | Exponential backoff wajib |
| **Lupa idempotency key** | Duplikasi transaksi (payment double) | Selalu pake idempotency key |
| **Retry infinite loop** | Kalo error terus, retry selamanya | Always set max retries + timeout per attempt |
| **Same retry interval** | Retry bareng terus tabrakan | Exponential backoff + jitter |

---

## Latihan

1. **Implementasi Retry Dasar:** Buat fungsi `fetchWithExponentialBackoff` yang nerima URL dan options, dengan max 3 retry, baseDelay 200ms, dan full jitter. Gunakan untuk fetch endpoint yang sengaja slow.

2. **Status Code Handler:** Modifikasi fungsi di atas untuk handle 429 (baca Retry-After header) dan bedain 4xx vs 5xx. 4xx langsung throw, 5xx retry.

3. **Idempotency Key:** Buat fungsi `createOrderWithIdempotency(data, idempotencyKey)` yang pake promise-retry. Generated key pake UUID. Test dengan simulate duplicate request.

4. **Retry Budget:** Integrasi `RetryBudget` ke middleware Express. Kalo budget habis dalam 1 menit, return 429. Reset tiap menit.

5. **Studi Kasus:** Kamu punya payment service yang sering timeout (error rate 15%). Desain strategi retry: berapa max retry, base delay, jenis jitter, dan idempotency key strategy. Jelaskan alasannya.

---

[« Kembali ke Index](README.md) | Lanjut ke [02-circuit-breaker](02-circuit-breaker.md)
