# Production-Ready Code — Latihan

## Level 1: Dasar

### 1. Zod Validation — Input & Error Handling
**Pertanyaan:** Buat Zod schema untuk validasi input API:

```typescript
// === LENGKAPI: Zod schema definition ===
import { z } from 'zod';

// === LENGKAPI: User registration schema ===
export const registerUserSchema = z.object({
  email: z.string(),  // === LENGKAPI: Validasi email format ===
  password: z.string(),  // === LENGKAPI: Min 8 char, 1 huruf besar, 1 angka ===
  name: z.string(),  // === LENGKAPI: Min 2 char, max 50 char ===
  age: z.number(),  // === LENGKAPI: Min 17, max 120 ===
  role: z.string(),  // === LENGKAPI: Only 'user' atau 'admin' ===
});

// === LENGKAPI: Custom error messages ===
// Tiap field harus punya error message yang jelas dalam Bahasa Indonesia

// === LENGKAPI: Type inference ===
export type RegisterUserInput = z.infer<typeof registerUserSchema>;

// === LENGKAPI: Express validation middleware ===
export function validate(schema: z.ZodSchema) {
  return (req, res, next) => {
    // === LENGKAPI: Parse req.body dengan schema ===
    // Kalau error: return 400 dengan formatted error messages
    // Kalau success: replace req.body dengan parsed data, call next()
  };
}
```

1. Lengkapi Zod schema dengan validasi lengkap
2. Buat middleware validation yang reusable
3. Format error response: `{ success: false, errors: [{ field, message }] }`

**Hint:** Zod: `.email('Format email tidak valid')`, `.min(8, 'Minimal 8 karakter').regex(/[A-Z]/, 'Harus ada huruf besar')`, `.min(17, 'Minimal umur 17 tahun')`. Enum: `z.enum(['user', 'admin'])`. Parse: `schema.parse(req.body)` throw error, `schema.safeParse(req.body)` return result object.

---

### 2. Helmet & CORS — Security Hardening
**Pertanyaan:** Setup security middleware untuk Express app:

```typescript
// === LENGKAPI: Security middleware setup ===
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const app = express();

// === LENGKAPI: Helmet configuration ===
// 1. Aktifkan semua default Helmet protections
// 2. Customize Content-Security-Policy
//    - Default-src: 'self'
//    - Script-src: 'self', trusted CDN
//    - Style-src: 'self', 'unsafe-inline'
//    - Img-src: 'self', images domain
//    - Font-src: 'self', Google Fonts
//    - Connect-src: 'self', API domain
app.use(helmet({
  // === LENGKAPI ===
}));

// === LENGKAPI: CORS configuration ===
// 1. Allow hanya specific origins
// 2. Allow methods: GET, POST, PUT, DELETE
// 3. Allow credentials: true
// 4. Max age: 86400
// 5. Expose headers: X-Request-Id
const allowedOrigins = ['https://example.com', 'https://staging.example.com'];
app.use(cors({
  // === LENGKAPI ===
}));

// === LENGKAPI: Rate limiting ===
// 1. Global limiter: 100 request per 15 menit
// 2. Auth limiter: 5 attempt per 15 menit (lebih ketat)
const globalLimiter = rateLimit({
  // === LENGKAPI ===
});

const authLimiter = rateLimit({
  // === LENGKAPI ===
});

app.use('/api/auth', authLimiter);
app.use('/api', globalLimiter);
```

1. Lengkapi semua konfigurasi keamanan
2. Test CORS dengan curl: `curl -H "Origin: https://evil.com" -I http://localhost:3000`
3. Test rate limiting: kirim request berkali-kali sampai kena limit

**Hint:** Helmet CSP: `contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'", "cdn.trusted.com"], ... } }`. CORS: `origin: (origin, cb) => allowedOrigins.includes(origin) ? cb(null, true) : cb(null, false)`. Rate limit: `windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false`. Test: `curl -I` lihat header `Access-Control-Allow-Origin` dan `Retry-After`.

---

### 3. Health Check — /healthz & /readyz
**Pertanyaan:** Implementasi health check endpoint untuk production:

```typescript
// === LENGKAPI: Health check endpoints ===
// src/health.ts
interface HealthStatus {
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: { status: string; latency: number };
    memory: { status: string; usage: number; heapUsed: number };
    // === LENGKAPI: Tambah checks berikut ===
    // 1. Disk usage
    // 2. External API dependency
    // 3. Queue connection (if any)
  };
}

// === LENGKAPI: /healthz — Liveness probe ===
// Return 200 kalau server masih hidup (simple check)
app.get('/healthz', (req, res) => {
  // === LENGKAPI: Return minimal status ===
});

// === LENGKAPI: /readyz — Readiness probe ===
// Return 200 kalau server siap terima traffic (check dependencies)
app.get('/readyz', async (req, res) => {
  // === LENGKAPI: ===
  // 1. Check database connection with ping
  // 2. Check memory usage (warning > 80%, critical > 90%)
  // 3. Return detailed status
  // Kalau ada critical failure: return 503
});
```

```yaml
# === LENGKAPI: Docker Compose health check ===
services:
  app:
    # === LENGKAPI: Health check configuration ===
    # Interval: 30s, timeout: 10s, retries: 3, start_period: 40s
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/healthz"]
      # === LENGKAPI ===
```

1. Lengkapi /healthz dan /readyz endpoints
2. Setup Docker health check
3. Test: matikan database → /readyz harus return 503

**Hint:** Liveness vs Readiness: liveness = server alive, readiness = siap serve traffic. Database ping: `await prisma.$queryRaw`SELECT 1``. Memory: `process.memoryUsage().heapUsed / 1024 / 1024`. Docker: `interval: 30s, timeout: 10s, retries: 3, start_period: 40s`.

---

### 4. Graceful Shutdown — SIGTERM Handler
**Pertanyaan:** Implementasi graceful shutdown untuk menerima SIGTERM:

```typescript
// === LENGKAPI: Graceful shutdown ===
// src/shutdown.ts
import http from 'http';

export function setupGracefulShutdown(server: http.Server) {
  // === LENGKAPI: ===
  // 1. Handle SIGTERM signal
  // 2. Set server in draining mode (stop accepting new requests)
  // 3. Close existing connections dengan timeout 30s
  // 4. Close database connection
  // 5. Close other connections (Redis, queue, etc.)
  // 6. Exit process setelah semua cleanup
  
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Starting graceful shutdown...');
    
    // === LENGKAPI: Drain mode ===
    server.close(() => {
      console.log('Server closed. No longer accepting connections.');
    });
    
    // === LENGKAPI: Force close after timeout ===
    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
    
    // === LENGKAPI: Close database ===
    try {
      await prisma.$disconnect();
      console.log('Database connection closed.');
    } catch (err) {
      console.error('Error closing database:', err);
    }
    
    // === LENGKAPI: Exit ===
    process.exit(0);
  });
}
```

```yaml
# === LENGKAPI: PM2 ecosystem.config.js ===
module.exports = {
  apps: [{
    name: 'my-app',
    script: 'dist/index.js',
    // === LENGKAPI: ===
    // 1. Cluster mode: max instances
    // 2. Max memory restart: 500MB
    // 3. Log file configuration
    // 4. Kill timeout: 5000ms
    // 5. Watch: false
    // 6. Environment variables per NODE_ENV
  }]
};
```

1. Lengkapi graceful shutdown handler
2. Setup PM2 process manager
3. Test: `kill -SIGTERM <PID>` dan verifikasi log shutdown

**Hint:** SIGTERM vs SIGKILL: SIGTERM bisa di-handle, SIGKILL langsung kill. Drain mode: `server.close()` stop accepting new connections. Timeout: force exit setelah 30s kalau ada hanging connections. PM2: `exec_mode: 'cluster'`, `instances: 'max'`, `max_memory_restart: '500M'`, `kill_timeout: 5000`.

---

## Level 2: Intermediate

### 5. Env Validation — 12-Factor App
**Pertanyaan:** Setup environment configuration dengan validasi:

```typescript
// === LENGKAPI: Environment configuration ===
// src/config/env.ts
import { z } from 'zod';

// === LENGKAPI: Environment schema dengan validasi ===
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET minimal 32 karakter'),
  // === LENGKAPI: Tambah field berikut ===
  // REDIS_URL — optional, string URL
  // SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS — required di production
  // LOG_LEVEL — enum: debug, info, warn, error
  // CORS_ORIGINS — string (comma-separated, di-parse ke array)
  // SENTRY_DSN — optional string
});

// === LENGKAPI: Parse dan export config ===
// 1. Parse process.env dengan envSchema
// 2. Kalau error: log detail dan exit
// 3. Export typed config object
export const config = {
  // === LENGKAPI ===
} as const;
```

```yaml
# === LENGKAPI: .env.example ===
# Template .env file dengan dokumentasi tiap variable
# Jangan commit .env asli ke Git!
# === LENGKAPI ===

# === LENGKAPI: .env.validation ===
# Script untuk validasi .env file sebelum app jalan
```

1. Lengkapi env schema dengan semua field yang diperlukan
2. Buat `.env.example` dengan dokumentasi
3. Implementasi validation script yang jalan di prestart

**Hint:** Zod env: `z.coerce.number()` untuk convert string ke number. Comma-separated: `.transform(s => s.split(',').map(o => o.trim()))`. Optional: `.optional()` atau `.default()`. Validation: `envSchema.parse(process.env)` — kalau error, console.error dan `process.exit(1)`. `.env.example`: dokumentasi tiap variable, tandai required/optional.

---

### 6. Error Handling — Global Error Middleware
**Pertanyaan:** Buat global error handler yang konsisten:

```typescript
// === LENGKAPI: Custom AppError class ===
// src/errors/AppError.ts
export class AppError extends Error {
  // === LENGKAPI: ===
  // 1. statusCode (number)
  // 2. isOperational (boolean) — true untuk error yang di-handle
  // 3. code (string) — error code untuk client
  // 4. details (any) — detail tambahan
  // 5. constructor dengan semua field di atas
}

// === LENGKAPI: Global error middleware ===
// src/middleware/errorHandler.ts
import { AppError } from '../errors/AppError';

export function errorHandler(err, req, res, next) {
  // === LENGKAPI: ===
  // 1. Log error (gunakan logger)
  // 2. Kalau AppError: extract statusCode, code, details
  // 3. Kalau unknown error: return 500
  // 4. Jangan expose error details di production
  // 5. Format response konsisten: { success, error: { code, message, details? } }
  
  if (err instanceof AppError) {
    // === LENGKAPI: Operational error response ===
  }
  
  // === LENGKAPI: Unknown/programming error ===
  // Log full error, return generic message di production
}
```

```typescript
// === LENGKAPI: Contoh penggunaan ===
// src/routes/users.ts
router.post('/users', async (req, res, next) => {
  try {
    const user = await createUser(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    // === LENGKAPI: Forward error ke global handler ===
  }
});
```

1. Lengkapi AppError class dengan properti lengkap
2. Buat global error middleware
3. Implementasi error format: `{ success: false, error: { code: 'VALIDATION_ERROR', message: '...', details: [...] } }`
4. Bedakan operational error vs programmer error

**Hint:** AppError: `statusCode` (4xx/5xx), `isOperational` (true = expected error, false = bug). Operational: validation error, not found, rate limit. Programmer error: TypeError, ReferenceError. Format: `res.status(err.statusCode || 500).json({ success: false, error: { code: err.code || 'INTERNAL_ERROR', message: isProduction ? 'Internal server error' : err.message } })`.

---

### 7. Input Sanitization — XSS & NoSQL Injection
**Pertanyaan:** Implementasi input sanitization untuk mencegah XSS dan injection:

```typescript
// === LENGKAPI: Input sanitization middleware ===
// src/middleware/sanitize.ts
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window as any);

// === LENGKAPI: Sanitize object recursively ===
function sanitizeObject(obj: any): any {
  // === LENGKAPI: ===
  // 1. Strip HTML tags dari semua string
  // 2. Remove $ and . dari keys (NoSQL injection)
  // 3. Trim whitespace
  // 4. Handle nested objects recursively
}

// === LENGKAPI: Express middleware ===
export function sanitizeInput(req, res, next) {
  // === LENGKAPI: Sanitize req.body, req.query, req.params ===
}

// === LENGKAPI: Test cases ===
// Input: { "name": "<script>alert('xss')</script>John", 
//          "$gt": "", 
//          "bio": "  Hello world!  " }
// Expected output: { "name": "John", "bio": "Hello world!" }
```

```typescript
// === LENGKAPI: Dependency security audit ===
// package.json scripts
{
  "scripts": {
    "audit": "npm audit --audit-level=high",
    // === LENGKAPI: ===
    // "outdated" — check outdated packages
    // "snyk" — run Snyk security test
    // "license-check" — check license compliance
  }
}
```

1. Lengkapi sanitization middleware
2. Test dengan payload XSS dan NoSQL injection
3. Setup npm audit dan Snyk di CI pipeline

**Hint:** DOMPurify: `DOMPurify.sanitize(dirtyString)`. NoSQL injection: hapus `$` dan `.` dari keys. Rekursif: `for (const key in obj) { if (typeof obj[key] === 'object') sanitizeObject(obj[key]) }`. npm audit: `npm audit --audit-level=high`, tambah di CI sebagai required check.

---

### 8. Logging — Level & Correlation ID
**Pertanyaan:** Setup structured logging dengan correlation ID:

```typescript
// === LENGKAPI: Logger setup ===
// src/lib/logger.ts
import pino from 'pino';
import { randomUUID } from 'crypto';

// === LENGKAPI: Init logger dengan konfigurasi ===
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  // === LENGKAPI: ===
  // 1. Redact sensitive fields (password, token, secret, authorization)
  // 2. Formatted timestamp
  // 3. Development: pino-pretty transport
  // 4. Production: JSON output
});

// === LENGKAPI: Correlation ID middleware ===
export function correlationIdMiddleware(req, res, next) {
  // === LENGKAPI: ===
  // 1. Extract X-Request-Id dari header atau buat baru
  // 2. Set header response dengan correlation ID
  // 3. Buat child logger dengan correlationId
  // 4. Attach logger ke req.log
  // 5. Log request start dengan method, url, correlationId
  
  const correlationId = req.headers['x-request-id'] || randomUUID();
  res.setHeader('X-Request-Id', correlationId);
  
  req.log = logger.child({ correlationId });
  req.log.info({ method: req.method, url: req.url }, 'Request started');
  
  // === LENGKAPI: Log request completion on response finish ===
  res.on('finish', () => {
    req.log.info({
      statusCode: res.statusCode,
      duration: Date.now() - req.startTime,
    }, 'Request completed');
  });
  
  next();
}

// === LENGKAPI: Contoh penggunaan ===
app.get('/api/users/:id', async (req, res) => {
  req.log.info({ userId: req.params.id }, 'Fetching user');
  // === LENGKAPI: Logger otomatis include correlationId ===
});
```

1. Lengkapi logger dengan redaction dan correlation ID
2. Setup request lifecycle logging (start → process → complete)
3. Test: kirim request dengan header `X-Request-Id: test-123`, cek log output

**Hint:** Pino redact: `redact: ['password', 'token', 'authorization', '*.password']`. Child logger: `logger.child({ correlationId })` — semua log dari child auto include correlationId. Request lifecycle: log start di middleware, log end di `res.on('finish')`. Format: `{ level: 30, time: ..., msg: "Request started", correlationId: "test-123", method: "GET", url: "/users" }`.
