# Background Jobs — Latihan

## Level 1: Dasar

### 1. BullMQ — Basic Queue Setup
**Pertanyaan:** Setup BullMQ queue untuk mengirim email:

```typescript
import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioris';

const connection = new IORedis({ maxRetriesPerRequest: null });

// === LENGKAPI ===
// 1. Buat queue 'email'
// 2. Buat worker yang memproses job email
// 3. Add job ke queue

// Queue definition
const emailQueue = new Queue('email', { connection });

// === LENGKAPI: Worker ===
const emailWorker = new Worker('email', async (job: Job) => {
  // === PROSES KIRIM EMAIL ===
  // 1. Validasi data
  // 2. Kirim email
  // 3. Return result
}, { connection });

// === LENGKAPI: Event listeners ===
// Dengarkan event: completed, failed, waiting, active

// Add job
async function sendWelcomeEmail(userEmail: string, userName: string) {
  // === LENGKAPI ===
}
```

**Hint:** `new Queue('name', { connection })` untuk buat queue. `new Worker('name', processor, { connection })` untuk buat worker. `queue.add('jobName', data, options)` untuk add job. Worker processor menerima `Job` object dan harus return result. Event listeners: `worker.on('completed', (job) => {})`, `worker.on('failed', (job, err) => {})`.

---

### 2. Job Scheduling — Delayed & Recurring
**Pertanyaan:** Implementasi scheduling untuk berbagai use case:

```typescript
// === LENGKAPI ===

// 1. Kirim reminder email 24 jam sebelum event
async function scheduleEventReminder(eventId: string, eventDate: Date) {
  // Hitung delay dari sekarang sampai 24 jam sebelum event
  // Jika event sudah < 24 jam, kirim sekarang
}

// 2. Cleanup session expired setiap jam
async function scheduleSessionCleanup() {
  // Buat recurring job yang jalan setiap jam
  // Pattern: repeat: { cron: '0 * * * *' }
}

// 3. Generate laporan harian setiap hari jam 6 pagi
async function scheduleDailyReport() {
  // Cron: '0 6 * * *' (jam 6 pagi setiap hari)
  // Timezone: Asia/Jakarta
}

// 4. Batch process orders setiap 5 menit
async function scheduleOrderBatch() {
  // Repeat: { every: 5 * 60 * 1000 } // 5 menit
}
```

**Hint:** Delayed job: `queue.add('name', data, { delay: 86400000 })` (24 jam dalam ms). Recurring: `queue.add('name', data, { repeat: { cron: '0 * * * *' } })`. `repeat.jobKey` untuk mencegah duplicate recurring jobs. Gunakan `removeOnComplete: true` untuk auto-cleanup completed jobs.

---

### 3. Retry Configuration — Error Handling
**Pertanyaan:** Konfigurasi retry yang tepat untuk berbagai jenis job:

```typescript
// === LENGKAPI retry config ===

// 1. Email sending — retry 3x dengan backoff
const emailQueue = new Queue('email', {
  connection,
  defaultJobOptions: {
    // === LENGKAPI ===
    // attempts: ?
    // backoff: ?
    // removeOnComplete: ?
    // removeOnFail: ?
  }
});

// 2. Payment processing — retry 5x, exponential backoff
// 3. File upload — retry 2x, fixed delay 5 detik
// 4. Webhook delivery — retry 10x, exponential backoff max 1 menit

// === LENGKAPI: Custom backoff strategy ===
const paymentWorker = new Worker('payment', async (job: Job) => {
  try {
    // proses payment
  } catch (error) {
    // === PENENTUAN RETRY ===
    // Apakah error ini layak di-retry?
    // network error -> retry
    // insufficient funds -> JANGAN retry (permanent failure)
    // Apakah harus throw error atau return skip?
  }
}, {
  connection,
  // === LENGKAPI: settings worker ===
});
```

**Hint:** Backoff types: `{ type: 'fixed', delay: 5000 }` (5 detik), `{ type: 'exponential', delay: 1000 }` (1s, 2s, 4s, 8s...). `removeOnComplete: { age: 3600 }` (hapus setelah 1 jam). `removeOnFail: false` (simpan failed jobs untuk debugging). Untuk permanent failure, gunakan `throw new Error('Skip')` atau return tanpa throw. Gunakan `job.moveToFailed()` untuk manual fail.

---

### 4. Email Queue — Full Implementation
**Pertanyaan:** Implementasi email queue production-ready:

```typescript
// === LENGKAPI EMAIL QUEUE SYSTEM ===

interface EmailJob {
  to: string;
  subject: string;
  template: string; // 'welcome', 'reset-password', 'invoice'
  data: Record<string, any>;
  priority?: 'high' | 'normal' | 'low';
}

// 1. Queue dengan priority
const emailQueue = new Queue('email', { connection });

// 2. Worker dengan rate limiting
const emailWorker = new Worker('email', async (job: Job<EmailJob>) => {
  // === LENGKAPI ===
  // 1. Pilih template berdasarkan job.data.template
  // 2. Render template dengan data
  // 3. Kirim email via SMTP/API
  // 4. Log hasil pengiriman
  // 5. Handle error spesifik (email invalid, rate limit provider)
}, {
  connection,
  // === LENGKAPI: concurrency limit ===
  // Max 5 email concurrent untuk hindari rate limit
});

// 3. Add job dengan priority
async function sendEmail(data: EmailJob) {
  // === LENGKAPI ===
  // Map priority ke BullMQ priority:
  // high -> 1 (paling tinggi)
  // normal -> 0
  // low -> -1
}

// 4. Monitoring
emailWorker.on('completed', (job) => {
  console.log(`Email ${job.data.template} to ${job.data.to} sent`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`Email failed: ${job?.data.to}`, err.message);
});
```

**Hint:** Priority: `queue.add('email', data, { priority: priorityMap[data.priority || 'normal'] })`. Concurrency: `new Worker('email', processor, { connection, concurrency: 5 })`. Rate limiting: gunakan `BullMQ`'s `limiter: { max: 10, duration: 60000 }` di queue options untuk max 10 jobs per 60 detik. Template engine: gunakan `handlebars` atau `mjml` untuk email HTML.

---

## Level 2: Menengah

### 5. Job Flow — Chained Jobs
**Pertanyaan:** Implementasi job chain untuk order processing:

```typescript
// Flow: validate_order -> check_stock -> process_payment -> send_confirmation -> update_analytics

// === LENGKAPI: Job chain setup ===
const orderFlow = new FlowProducer({ connection });

async function processOrder(orderId: string) {
  // === LENGKAPI ===
  // Buat flow dengan 5 steps berurutan
  // Step berikutnya menggunakan result dari step sebelumnya
  // Jika salah satu step gagal, semua step yang sudah selesai di-rollback
}

// === LENGKAPI: Individual workers ===
const validateOrderWorker = new Worker('validate-order', async (job) => {
  // 1. Cek order exists
  // 2. Cek status valid
  // 3. Return validated order data
});

const checkStockWorker = new Worker('check-stock', async (job) => {
  // 1. Cek stok semua item
  // 2. Jika cukup, reserve stock (temporary)
  // 3. Return stock reservation ID
});

const processPaymentWorker = new Worker('process-payment', async (job) => {
  // 1. Create payment via Midtrans
  // 2. Return payment URL/token
});

const sendConfirmationWorker = new Worker('send-confirmation', async (job) => {
  // 1. Kirim email konfirmasi
  // 2. Kirim WhatsApp notification
});

const updateAnalyticsWorker = new Worker('update-analytics', async (job) => {
  // 1. Update order count di analytics
  // 2. Update revenue
  // 3. Update product popularity
});
```

**Hint:** `FlowProducer` untuk job chains. `flow.add({ name: 'validate', queueName: 'validate-order', data: { orderId } })`. Setiap worker bisa akses parent data via `job.data`. Untuk rollback: implementasi compensation logic di catch block (misal: release reserved stock jika payment gagal). Gunakan `opts.onFail: 'remove'` atau `'keep'` sesuai kebutuhan.

---

### 6. Rate Limiting & Throttling
**Pertanyaan:** Implementasi rate limiting untuk API calls ke external service:

```typescript
// Skenario: Call API ke payment provider max 100 requests per menit
// Gunakan BullMQ's built-in limiter

// === LENGKAPI ===
const paymentQueue = new Queue('payment-api', {
  connection,
  // === LENGKAPI: rate limiter config ===
  // max: 100 requests
  // duration: 60000 ms (1 menit)
  // Group: berdasarkan API key
});

const paymentApiWorker = new Worker('payment-api', async (job) => {
  // Panggil payment API
  // Jika rate limited (HTTP 429), throw error untuk retry
}, {
  connection,
  // === LENGKAPI: limiter config di worker ===
});

// === LENGKAPI: Queue event untuk monitoring ===
// Log jumlah jobs yang di-rate-limit
// Alert jika rate limit terus terjadi
```

**Hint:** BullMQ limiter: `limiter: { max: 100, duration: 60000, groupKey: 'api_key' }`. GroupKey memisahkan rate limit per group. Jika rate limit, job akan di-delay otomatis. Monitor: `worker.on('stalled')` untuk detect stuck jobs. `queue.getJobCounts()` untuk monitor queue depth. **PENTING**: rate limiting di queue berbeda dengan rate limiting di API — BullMQ handle di sisi application, API provider punya rate limit sendiri.

---

### 7. Graceful Shutdown
**Pertanyaan:** Implementasi graceful shutdown untuk workers:

```typescript
// === LENGKAPI ===
async function gracefulShutdown(signal: string) {
  console.log(`Received ${signal}. Starting graceful shutdown...`);
  
  // 1. Stop accepting new jobs
  // 2. Wait untuk current jobs selesai
  // 3. Close connections
  // 4. Exit process
}

// Setup signal handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// === LENGKAPI: Worker cleanup ===
const workers: Worker[] = [emailWorker, paymentWorker, analyticsWorker];

async function shutdownWorkers() {
  // === LENGKAPI ===
  // 1. Close semua workers (tunggu sampai current job selesai)
  // 2. Close queue connections
  // 3. Close Redis connection
}

// === LENGKAPI: Health check ===
app.get('/health', (req, res) => {
  // === LENGKAPI ===
  // Check: 
  // 1. Redis connection OK
  // 2. Workers running
  // 3. Queue depth reasonable (< 1000 jobs)
  // Return 200 jika OK, 503 jika ada masalah
});
```

**Hint:** `await worker.close()` — worker akan menunggu current job selesai sebelum close. Timeout: `worker.close(5000)` — force close setelah 5 detik. Health check: `queue.getJobCounts()` untuk cek depth. `worker.isRunning()` untuk cek status. **PENTING**: di Kubernetes/Docker, SIGTERM dikirim sebelum container di-stop — handler ini krusial untuk tidak kehilangan job yang sedang diproses.

---

## Level 3: Lanjutan

### 8. Dead Letter Queue (DLQ)
**Pertanyaan:** Implementasi Dead Letter Queue untuk job yang terus gagal:

```typescript
// Skenario: Job yang gagal 3x harus dipindah ke DLQ untuk review manual

// === LENGKAPI: DLQ Setup ===
const mainQueue = new Queue('email', { connection });
const dlqQueue = new Queue('email-dlq', { connection });

const emailWorker = new Worker('email', async (job) => {
  // === PROSES EMAIL ===
}, {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  }
});

// === LENGKAPI: Move to DLQ ===
emailWorker.on('failed', async (job, err) => {
  if (job && job.attemptsMade >= job.opts.attempts!) {
    // === LENGKAPI ===
    // 1. Pindahkan job ke DLQ
    // 2. Simpan error details
    // 3. Kirim alert ke admin
    // 4. Log untuk audit
  }
});

// === LENGKAPI: DLQ Worker (untuk retry manual) ===
const dlqWorker = new Worker('email-dlq', async (job) => {
  // === LENGKAPI ===
  // 1. Tampilkan job details dan error
  // 2. Retry: kembali ke main queue
  // 3. Skip: hapus dari DLQ
  // 4. Fix: apply custom fix lalu retry
}, { connection });

// === LENGKAPI: Admin API ===
app.get('/api/admin/dlq', async (req, res) => {
  // === LENGKAPI ===
  // 1. List semua jobs di DLQ
  // 2. Include error message, retry count, original data
  // 3. Filter by queue name, date range
});

app.post('/api/admin/dlq/:jobId/retry', async (req, res) => {
  // === LENGKAPI ===
  // Retry job dari DLQ ke main queue
});

app.delete('/api/admin/dlq/:jobId', async (req, res) => {
  // === LENGKAPI ===
  // Hapus job dari DLQ
});
```

**Hint:** DLQ pattern: job yang gagal > N attempts dipindah ke queue terpisah. Di BullMQ: `dlqQueue.add(job.name, job.data, { ...job.opts, attempts: 1 })`. Simpan metadata: `error_message`, `failed_at`, `original_queue`, `attempts_made`. Alert: kirim ke Slack/Email ketika ada job baru di DLQ. **PENTING**: DLQ harus di-monitor secara aktif, jangan biarkan menumpuk.

---

### 9. Worker Scaling — Multiple Instances
**Pertanyaan:** Setup worker scaling untuk high throughput:

```typescript
// Skenario: Butuh 5 worker instances untuk handle 10K jobs/hari

// === LENGKAPI: Worker cluster setup ===
import cluster from 'cluster';
import os from 'os';

if (cluster.isPrimary) {
  // === LENGKAPI: Primary process ===
  const numWorkers = Math.min(os.cpus().length, 5);
  console.log(`Starting ${numWorkers} workers...`);
  
  for (let i = 0; i < numWorkers; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker) => {
    // === LENGKAPI ===
    // Restart worker yang mati
    // Log untuk monitoring
  });
} else {
  // === LENGKAPI: Worker process ===
  // Setup BullMQ workers di sini
  // Setiap worker instance punya connection sendiri
}

// === LENGKAPI: Queue monitoring ===
async function getQueueStats() {
  // === LENGKAPI ===
  // Return:
  // - waiting: jumlah jobs menunggu
  // - active: jumlah jobs sedang diproses
  // - completed: jumlah jobs selesai (24 jam terakhir)
  // - failed: jumlah jobs gagal (24 jam terakhir)
  // - delayed: jumlah jobs delayed
  // - workers: jumlah active workers
}

// === LENGKAPI: Auto-scaling logic ===
async function checkAndScale() {
  const stats = await getQueueStats();
  
  // === LENGKAPI ===
  // Jika waiting > 100 dan active < max_workers -> scale up
  // Jika waiting < 10 dan active > min_workers -> scale down
  // Max 10 workers, min 2 workers
  // Cooldown: jangan scale lebih dari sekali per 5 menit
}
```

**Hint:** BullMQ otomatis handle multiple workers — setiap worker compete untuk mengambil job dari queue. `concurrency` option: jumlah concurrent jobs per worker. Cluster mode: primary process manage workers, setiap worker punya自己的 BullMQ connection. Monitoring: `queue.getJobCounts('waiting', 'active', 'completed', 'failed')`. Auto-scaling: scale berdasarkan queue depth.

---

### 10. Priority Queue — Advanced
**Pertanyaan:** Implementasi priority queue untuk customer tiers:

```typescript
// Skenario:
// - Platinum customer: priority 1 (paling tinggi)
// - Gold customer: priority 2
// - Silver customer: priority 3
// - Free tier: priority 4 (paling rendah)

// === LENGKAPI ===
interface NotificationJob {
  userId: string;
  userTier: 'platinum' | 'gold' | 'silver' | 'free';
  type: 'email' | 'push' | 'sms';
  template: string;
  data: Record<string, any>;
}

const TIER_PRIORITY = {
  platinum: 1,
  gold: 2,
  silver: 3,
  free: 4,
};

const notificationQueue = new Queue('notifications', { connection });

// === LENGKAPI: Priority worker dengan tier-based processing ===
const notificationWorker = new Worker('notifications', async (job: Job<NotificationJob>) => {
  // === LENGKAPI ===
  // 1. Set timeout berdasarkan tier:
  //    platinum: max 5 detik
  //    gold: max 10 detik
  //    silver: max 30 detik
  //    free: max 60 detik
  // 2. Log processing time
  // 3. Alert jika timeout (platinum/gold)
}, {
  connection,
  // === LENGKAPI: settings ===
});

// === LENGKAPI: Batch send dengan priority awareness ===
async function sendBulkNotifications(
  notifications: NotificationJob[]
): Promise<{ sent: number; queued: number; errors: number }> {
  // === LENGKAPI ===
  // 1. Group by tier
  // 2. Add ke queue dengan priority yang sesuai
  // 3. Track counts
  // 4. Handle errors gracefully
}
```

**Hint:** Priority: `queue.add('notification', data, { priority: TIER_PRIORITY[data.userTier] })`. BullMQ mengambil job dengan priority paling rendah (angka paling kecil) terlebih dahulu. Timeout: `job.opts.timeout` atau di worker level. Monitoring: `queue.getWaiting()` untuk melihat urutan processing. **PENTING**: jangan sampai free tier jobs meng-starve platinum jobs — gunakan priority dengan bijak.
