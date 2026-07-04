# Sesi 3: Health Checks & Graceful Shutdown

**Durasi:** 3 JP (135 menit)

## Tujuan Pembelajaran

Setelah sesi ini, peserta mampu:
- Membuat endpoint `/healthz` (liveness) dan `/readyz` (readiness)
- Mengecek kesehatan database, Redis, dan service eksternal
- Mengimplementasikan graceful shutdown dengan SIGTERM handler
- Menggunakan timeout dan circuit breaker
- Mengelola aplikasi dengan PM2 ecosystem

---

## 3.1 Health Check Endpoints

Health check dibagi dua jenis: **liveness** dan **readiness**.

### Liveness (`/healthz`)

Apakah aplikasi masih hidup? Cek sederhana — server merespons.

```typescript
// health.controller.ts
import { Request, Response } from 'express';

export function healthz(_req: Request, res: Response) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}
```

### Readiness (`/readyz`)

Apakah aplikasi siap menerima traffic? Cek dependency — DB, Redis, dll.

```typescript
// readyz handler
interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'unhealthy';
  latency: number;
  error?: string;
}

async function checkDatabase(): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    await db.$queryRaw`SELECT 1`;  // Prisma
    return {
      service: 'database',
      status: 'healthy',
      latency: Date.now() - start,
    };
  } catch (err) {
    return {
      service: 'database',
      status: 'unhealthy',
      latency: Date.now() - start,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

async function checkRedis(): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    await redis.ping();
    return {
      service: 'redis',
      status: 'healthy',
      latency: Date.now() - start,
    };
  } catch (err) {
    return {
      service: 'redis',
      status: 'unhealthy',
      latency: Date.now() - start,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

async function checkExternalService(url: string): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // timeout 5 detik
    });
    return {
      service: url,
      status: response.ok ? 'healthy' : 'unhealthy',
      latency: Date.now() - start,
    };
  } catch (err) {
    return {
      service: url,
      status: 'unhealthy',
      latency: Date.now() - start,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
```

### Handler Readiness Terintegrasi

```typescript
// readyz handler
export async function readyz(_req: Request, res: Response) {
  const checks = await Promise.all([
    checkDatabase(),
    checkRedis(),
    checkExternalService('https://api.payment.com/health'),
  ]);

  const allHealthy = checks.every(c => c.status === 'healthy');
  const statusCode = allHealthy ? 200 : 503;

  res.status(statusCode).json({
    status: allHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    checks,
  });
}
```

**Contoh respons:**
```json
{
  "status": "ok",
  "timestamp": "2025-07-05T10:30:00.000Z",
  "checks": [
    { "service": "database", "status": "healthy", "latency": 5 },
    { "service": "redis", "status": "healthy", "latency": 2 },
    { "service": "https://api.payment.com/health", "status": "healthy", "latency": 120 }
  ]
}
```

### Routing Health Check

```typescript
import { Router } from 'express';

const healthRouter = Router();

// Liveness — cepat, tidak perlu cek dependency
healthRouter.get('/healthz', healthz);

// Readiness — cek semua dependency
healthRouter.get('/readyz', readyz);

// Gabungan
healthRouter.get('/health', async (_req, res) => {
  const [liveness, readiness] = await Promise.all([
    Promise.resolve({ status: 'ok' }),
    checkAllServices(),
  ]);

  res.status(liveness.status === 'ok' ? 200 : 503).json({
    ...liveness,
    readiness,
  });
});

export { healthRouter };
```

---

## 3.2 Graceful Shutdown

Saat aplikasi menerima sinyal berhenti (SIGTERM), kita harus:
1. Berhenti menerima request baru
2. Selesaikan request yang sedang berjalan
3. Tutup koneksi database, Redis, dll.
4. Hapus resource sementara

```typescript
// graceful-shutdown.ts
import { Server } from 'http';
import { prisma } from './db';
import { redis } from './redis';

export function setupGracefulShutdown(server: Server) {
  let isShuttingDown = false;

  function shutdown(signal: string) {
    return async () => {
      if (isShuttingDown) return;
      isShuttingDown = true;

      console.log(`[${signal}] Memulai graceful shutdown...`);

      // 1. Set health check ke tidak sehat — orchestrator tahu untuk stop routing
      // (biasanya di-set di shared state atau env variable)

      // 2. Stop menerima request baru
      server.close(async (err) => {
        if (err) {
          console.error('Error saat menutup server:', err);
          process.exit(1);
        }

        console.log('Server HTTP ditutup');

        // 3. Tutup koneksi database
        try {
          await prisma.$disconnect();
          console.log('Koneksi database ditutup');
        } catch (err) {
          console.error('Error menutup database:', err);
        }

        // 4. Tutup koneksi Redis
        try {
          await redis.quit();
          console.log('Koneksi Redis ditutup');
        } catch (err) {
          console.error('Error menutup Redis:', err);
        }

        // 5. Cleanup task lain
        // - Hapus file temporary
        // - Flush log buffer
        // - Cancel job queue

        console.log('Graceful shutdown selesai');
        process.exit(0);
      });

      // 6. Force shutdown jika melebihi batas waktu
      setTimeout(() => {
        console.error('Force shutdown — timeout 30 detik tercapai');
        process.exit(1);
      }, 30_000).unref(); // .unref() agar tidak menghalangi proses keluar
    };
  }

  // Tangani berbagai sinyal
  process.on('SIGTERM', shutdown('SIGTERM'));  // Docker/k8s mengirim ini
  process.on('SIGINT', shutdown('SIGINT'));    // Ctrl+C
  process.on('SIGQUIT', shutdown('SIGQUIT'));  // Ctrl+\

  // Tangani uncaught exception — crash, tapi tetap cleanup
  process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    shutdown('UNCAUGHT_EXCEPTION')();
  });

  // Tangani unhandled rejection — log saja
  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled rejection:', reason);
  });
}
```

### Implementasi di Aplikasi

```typescript
// app.ts
import express from 'express';
import { createServer } from 'http';
import { healthRouter } from './health.controller';
import { setupGracefulShutdown } from './graceful-shutdown';

const app = express();
const server = createServer(app);

// Route
app.use('/api/health', healthRouter);
app.get('/api/users', (req, res) => { /* ... */ });

// Setup graceful shutdown
setupGracefulShutdown(server);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});
```

### Connection Draining

Connection draining memastikan request in-flight selesai sebelum shutdown.

```typescript
// Middleware untuk menolak request baru saat shutdown
let isShuttingDown = false;

const shutdownMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (isShuttingDown) {
    res.status(503).json({
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Server sedang dalam maintenance',
      },
    });
    return;
  }
  next();
};

app.use(shutdownMiddleware);
```

---

## 3.3 Timeout & Circuit Breaker

### Server Timeout

```typescript
import { createServer } from 'http';

const server = createServer(app);

// Timeout untuk merespons (dalam milidetik)
server.timeout = 30_000;        // 30 detik — timeout default
server.headersTimeout = 60_000; // 60 detik — timeout header
server.requestTimeout = 30_000; // 30 detik — timeout request
server.keepAliveTimeout = 5_000; // 5 detik — keep alive

// Atau di Express
app.use((req, res, next) => {
  // Set timeout per request
  req.setTimeout(30_000, () => {
    res.status(408).json({
      success: false,
      error: {
        code: 'REQUEST_TIMEOUT',
        message: 'Request timeout',
      },
    });
    req.destroy();
  });
  next();
});
```

### Retry dengan Backoff

```typescript
// retry.ts
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;       // dalam ms
  maxDelay: number;        // dalam ms
  factor: number;          // multiplier
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10_000,
    factor: 2,
  },
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      if (attempt === config.maxRetries) break;

      // Exponential backoff with jitter
      const delay = Math.min(
        config.baseDelay * Math.pow(config.factor, attempt - 1),
        config.maxDelay,
      );
      const jitter = Math.random() * 1000; // acak 0-1000ms
      
      console.warn(
        `Percobaan ${attempt}/${config.maxRetries} gagal. ` +
        `Retry dalam ${(delay + jitter) / 1000} detik...`
      );
      
      await new Promise(resolve => setTimeout(resolve, delay + jitter));
    }
  }

  throw lastError!;
}

// Penggunaan
async function fetchPaymentData(orderId: string) {
  return retryWithBackoff(() =>
    fetch(`https://payment-api.example.com/orders/${orderId}`).then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
  );
}
```

### Circuit Breaker

```typescript
// circuit-breaker.ts
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private threshold: number = 5,
    private resetTimeout: number = 30_000, // 30 detik
  ) {}

  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      // Cek apakah sudah waktunya half-open
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker open');
      }
    }

    try {
      const result = await fn();
      // Sukses — reset
      if (this.state === 'half-open') {
        this.state = 'closed';
        this.failures = 0;
      }
      return result;
    } catch (err) {
      this.failures++;
      this.lastFailureTime = Date.now();

      if (this.failures >= this.threshold) {
        this.state = 'open';
      }

      throw err;
    }
  }

  getState() {
    return this.state;
  }

  reset() {
    this.failures = 0;
    this.state = 'closed';
  }
}

// Penggunaan
const paymentBreaker = new CircuitBreaker(3, 10_000);

app.get('/api/payment/:id', async (req, res) => {
  try {
    const data = await paymentBreaker.call(() =>
      fetchPaymentData(req.params.id)
    );
    res.json({ success: true, data });
  } catch (err) {
    if (err instanceof Error && err.message === 'Circuit breaker open') {
      res.status(503).json({
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Layanan pembayaran sedang tidak tersedia. Coba lagi nanti.',
        },
      });
    } else {
      throw err;
    }
  }
});
```

---

## 3.4 PM2 Ecosystem

PM2 — production process manager untuk Node.js.

### Instalasi

```bash
npm install -g pm2
```

### Ecosystem File

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'my-app',
    script: 'dist/app.js',

    // Cluster mode — jalankan di semua CPU
    instances: 'max',        // Gunakan semua CPU core
    exec_mode: 'cluster',    // 'cluster' atau 'fork'

    // Watch & reload
    watch: ['dist'],         // Watch folder untuk auto restart
    ignore_watch: ['node_modules', 'logs'],
    watch_delay: 1000,

    // Memory
    max_memory_restart: '500M',  // Restart jika memori > 500MB

    // Logging
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',

    // Environment
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    env_staging: {
      NODE_ENV: 'staging',
      PORT: 3001,
    },

    // Graceful shutdown
    kill_timeout: 30_000,            // Max 30 detik untuk shutdown
    listen_timeout: 10_000,          // Tunggu 10 detik untuk ready
    shutdown_with_message: true,     // Kirim pesan shutdown ke app

    // Restart strategy
    min_uptime: '10s',               // Minimal uptime untuk dianggap stabil
    max_restarts: 10,                // Max restart dalam min_uptime
    restart_delay: 5000,             // Delay antar restart
  }],
};
```

### PM2 Commands

```bash
# Start aplikasi
pm2 start ecosystem.config.js

# Start dengan environment spesifik
pm2 start ecosystem.config.js --env staging

# Lihat status
pm2 status
pm2 list
pm2 show my-app

# Monitor real-time
pm2 monit

# Logs
pm2 logs
pm2 logs my-app --lines 100

# Restart / Reload (zero-downtime)
pm2 restart my-app
pm2 reload my-app              # Reload tanpa downtime (cluster mode)
pm2 gracefulReload my-app      # Graceful reload

# Stop / Delete
pm2 stop my-app
pm2 delete my-app

# Startup script — auto restart saat server reboot
pm2 startup
pm2 save
```

### Zero-Downtime Reload

Di cluster mode, PM2 melakukan reload dengan mengganti worker satu per satu:

```bash
pm2 reload my-app
```

Proses:
1. PM2 start worker baru
2. Worker baru listen ke port
3. Setelah worker baru siap, PM2 kirim SIGTERM ke worker lama
4. Worker lama selesaikan request in-flight lalu mati
5. Ulangi untuk setiap worker

### PM2 + Graceful Shutdown

```typescript
// Di kode aplikasi — handle PM2 shutdown message
process.on('message', (msg) => {
  if (msg === 'shutdown') {
    console.log('Menerima pesan shutdown dari PM2');
    // Mulai graceful shutdown
    shutdown('PM2_SHUTDOWN')();
  }
});
```

---

## 3.5 Praktik Lengkap

```typescript
// server.ts
import express from 'express';
import { createServer } from 'http';

const app = express();
const server = createServer(app);

// 1. Health checks
app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.get('/readyz', async (_req, res) => {
  const dbOk = await checkDatabase();
  const status = dbOk ? 200 : 503;
  res.status(status).json({
    status: dbOk ? 'ok' : 'degraded',
    checks: [{ service: 'database', status: dbOk ? 'healthy' : 'unhealthy' }],
  });
});

// 2. Shutdown middleware
let shuttingDown = false;
app.use((_req, res, next) => {
  if (shuttingDown) {
    return res.status(503).json({ success: false, error: { code: 'MAINTENANCE' } });
  }
  next();
});

// 3. Request timeout
app.use((req, res, next) => {
  req.setTimeout(30_000, () => {
    res.status(408).json({ success: false, error: { code: 'TIMEOUT' } });
  });
  next();
});

// 4. Graceful shutdown handler
function shutdownHandler() {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log('Graceful shutdown dimulai...');
  server.close(() => {
    console.log('Server ditutup');
    process.exit(0);
  });

  setTimeout(() => { process.exit(1); }, 30_000);
}

process.on('SIGTERM', shutdownHandler);
process.on('SIGINT', shutdownHandler);

server.listen(3000);
```

---

## Latihan

### Soal 1: Health Check Endpoint

Buat dua endpoint health check:

1. `GET /healthz` — liveness, return `{ status: 'ok', uptime, timestamp }`
2. `GET /readyz` — readiness, cek koneksi database (simulasi) dan return `{ status, checks[] }`

Database check simulasi: 80% chance healthy, 20% chance unhealthy.

### Soal 2: Graceful Shutdown

Implementasikan graceful shutdown yang:

1. Tangani SIGTERM dan SIGINT
2. Set flag `isShuttingDown` untuk menolak request baru (return 503)
3. Tunggu server close (timeout 10 detik)
4. Log setiap tahap
5. Force shutdown jika melebihi timeout

### Soal 3: PM2 Ecosystem

Buat `ecosystem.config.js` untuk aplikasi Express:

1. Cluster mode dengan semua CPU
2. Max memory restart 300MB
3. Watch folder `dist/`
4. Graceful shutdown dengan 20 detik timeout
5. Environment: production (PORT=3000) dan staging (PORT=3001)
6. Log error ke `logs/error.log`
