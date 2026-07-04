# 🧠 Cheatsheet: Background Jobs & Queue

> Referensi cepet — 1 halaman. Modul 40: Queue processing dengan BullMQ + Redis.

## Topik Utama

| Sesi | Topik | Tools |
|------|-------|-------|
| 01 | Queue Concepts — sync vs async, Redis, BullMQ setup, job lifecycle | Redis, BullMQ, ioredis |
| 02 | BullMQ Advanced — scheduling, concurrency, retry, events, sandbox processors | BullMQ |
| 03 | Real World Queue — email (Nodemailer), PDF (Puppeteer), image (Sharp), export | Nodemailer, Puppeteer, Sharp |
| 04 | Queue Production — Bull Board, dead letter queue, scaling, graceful shutdown | Bull Board, PM2 |

## Command / Sintaks Penting

```bash
# Install
npm install bullmq ioredis
npm install @bull-board/express # dashboard

# Redis
sudo apt-get install redis-server -y
sudo systemctl start redis-server
redis-cli ping  # → PONG

# Docker Redis
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

### BullMQ — Setup Queue & Worker

```javascript
// Koneksi Redis
const connection = new IORedis({
  host: 'localhost',
  port: 6379,
  maxRetriesPerRequest: null, // wajib untuk BullMQ
});

// Producer — tambah job
const emailQueue = new Queue('email', { connection });
const job = await emailQueue.add('welcome-email', {
  to: 'user@example.com',
  template: 'welcome',
});

// Worker — proses job
const worker = new Worker('email', async (job) => {
  console.log(`Processing job ${job.id}`);
  return { sent: true };
}, { connection });

// Event listeners
worker.on('completed', (job) => console.log(`✅ ${job.id} selesai`));
worker.on('failed', (job, err) => console.log(`❌ ${job.id} gagal:`, err.message));
```

### Job Lifecycle

```
add() → Waiting → Worker ambil → Active → Completed (sukses)
                                        → Failed (error) → Retry → Waiting
                                                       → Max retry → Dead Letter Queue
```

### Retry & Backoff

```javascript
await emailQueue.add('critical-email', payload, {
  attempts: 5,
  backoff: {
    type: 'exponential',  // atau 'fixed'
    delay: 2000,          // delay awal 2 detik
  },
});
```

### Cron / Repeatable Jobs

```javascript
await reportQueue.add('daily-report', { type: 'daily' }, {
  repeat: { pattern: '0 8 * * *' },  // setiap hari jam 08:00
  jobId: 'daily-report',              // ID tetap biar gak dobel
});
```

| Expression | Arti |
|------------|------|
| `0 * * * *` | Setiap jam (menit 0) |
| `0 8 * * *` | Setiap hari jam 08:00 |
| `0 9 * * 1` | Setiap Senin jam 09:00 |
| `*/5 * * * *` | Setiap 5 menit |

### Graceful Shutdown

```javascript
async function shutdown(signal) {
  console.log(`${signal} received — shutting down...`);
  await worker.close({ force: false }); // biarin job selesai
  await connection.quit();
  process.exit(0);
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
```

### Bull Board Dashboard

```javascript
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');
createBullBoard({
  queues: [new BullMQAdapter(emailQueue), new BullMQAdapter(pdfQueue)],
  serverAdapter,
});
app.use('/admin/queues', serverAdapter.getRouter());
```

## Tips & Trik

- **I/O bound workers** (email, HTTP): concurrency 10-50
- **CPU bound workers** (PDF, image): concurrency 1-4
- **Dead Letter Queue (DLQ)**: job gagal total dikirim ke queue khusus + alert admin
- **Priority**: nilai kecil didahulukan. `priority: 1` > `priority: 10`
- **PM2 cluster**: `pm2 start worker.js -i 4` — scale horizontal gampang
- **Sandbox processor**: pisah job ke child process — kalau crash gak ngerusak worker utama
- **stalledInterval**: BullMQ auto-detect job stuck di active state
- **Docker stop_grace_period**: kasih 60s biar job selesai

## Common Mistakes

- ❌ **kill -9 / Ctrl+C paksa** — job aktif jadi stalled, gak kelar
- ❌ **Lupa `maxRetriesPerRequest: null`** — BullMQ error koneksi Redis
- ❌ **Concurrency terlalu tinggi** buat CPU-bound — bikin worker overload
- ❌ **Job太重 tanpa progress reporting** — user gak tau status, kira hang
- ❌ **Gak bedain cron job vs queue** — task critical pake queue (retry + DLQ + monitoring)
- ❌ **Satu queue buat semua jenis job** — pisah per use case (email, pdf, image)
- ❌ **Gak handle error specific** — INVALID_EMAIL discard, RATE_LIMITED retry, bedain

## Link Cepat

- [Module README](.)
- [Sesi 01 — Queue Concepts & BullMQ Setup](01-queue-concepts.md)
- [Sesi 02 — BullMQ Advanced](02-bullmq-advanced.md)
- [Sesi 03 — Real World Queue](03-real-world-queue.md)
- [Sesi 04 — Queue Production](04-queue-production.md)
