---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — Modul 49: Production-Ready Code"
footer: "Sesi 04: Env Config"
---

<!-- _class: title -->
# Sesi 4: Environment & Configuration

**Durasi:** 3 JP (135 menit)

## Tujuan Pembelajaran

Setelah sesi ini, peserta mampu:
- Menerapkan prinsip 12-factor app untuk konfigurasi
- Memvalidasi environment variables dengan dotenv dan Zod
- Mengelola konfigurasi per environment (dev/staging/prod)
- Mengelola secrets dengan aman
- Mengatur logging level dan feature flags berdasarkan environment

---

## 4.1 12-Factor App — Konfigurasi

12-factor app adalah metodologi untuk membangun aplikasi SaaS. Tiga faktor relevan dengan konfigurasi:

### III. Config — Simpan konfigurasi di environment

> **Pendekatan yang benar:** Simpan konfigurasi (yang bervariasi antar deployment) di **environment variables**, bukan di kode.

```typescript
// ✅ BENAR — config dari env
const dbUrl = process.env.DATABASE_URL;
const port = Number(process.env.PORT) || 3000;

// ❌ SALAH — hardcode config
const dbUrl = 'postgresql://localhost:5432/myapp';
const port = 3000;
```

### IV. Backing Services — Treat backing services as attached resources

> Database, Redis, API eksternal adalah **attached resources**. Ganti URL-nya di env, bukan di kode.

```typescript
// ✅ BENAR — ganti service lewat env
const services = {
  database: process.env.DATABASE_URL,
  redis: process.env.REDIS_URL,
  paymentApi: process.env.PAYMENT_API_URL,
};

// ❌ SALAH — hardcode URL
const services = {
  database: 'postgresql://localhost:5432/mydb',
  redis: 'redis://localhost:6379',
  paymentApi: 'https://api.payment.com',
};
```

### V. Build, Release, Run — Pisahkan tahapan

> **Build:** Compile kode → artifact  
> **Release:** Gabungkan artifact + config → release  
> **Run:** Jalankan release

```
Build  →  Release  →  Run
                ↑
          Config dari env
```

---

## 4.2 Env Validation dengan dotenv + Zod

### Instalasi

```bash
npm install dotenv zod
```

### File `.env`

```bash

---

# .env — jangan di-commit!

---

# copy ke .env.example untuk dokumentasi
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
REDIS_URL=redis://localhost:6379
JWT_SECRET=my-super-secret-key
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:5173
```

### Zod Env Schema

```typescript
// env.ts
import { z } from 'zod';
import dotenv from 'dotenv';

// Load .env file
dotenv.config();

// Schema validasi env
const envSchema = z.object({
  // App
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().max(65535).default(3000),

  // Database
  DATABASE_URL: z.string().url(),
  DB_POOL_MIN: z.coerce.number().int().min(0).default(2),
  DB_POOL_MAX: z.coerce.number().int().min(1).max(100).default(10),

  // Redis
  REDIS_URL: z.string().url().optional(),

  // Auth
  JWT_SECRET: z.string().min(32, 'JWT_SECRET minimal 32 karakter'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // Feature flags
  ENABLE_CACHE: z.coerce.boolean().default(true),
  ENABLE_RATE_LIMIT: z.coerce.boolean().default(true),
});

// Parse dan validasi
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Environment variables tidak valid:');
  for (const issue of parsedEnv.error.issues) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

// Export validated config
export const env = parsedEnv.data;

// Type dari schema
export type Env = z.infer<typeof envSchema>;
```

### Penggunaan

```typescript
// app.ts
import { env } from './env';

const app = express();

app.listen(env.PORT, () => {
  console.log(`Server berjalan di port ${env.PORT} (${env.NODE_ENV})`);
});

// Koneksi database
const db = new Pool({
  connectionString: env.DATABASE_URL,
  min: env.DB_POOL_MIN,
  max: env.DB_POOL_MAX,
});
```

### `.env.example`

```bash

---

# .env.example — dokumentasi, di-commit ke repo

---

# Copy file ini ke .env dan isi nilainya


---

# =========== APP ===========

---

# Environment: development | staging | production
NODE_ENV=development

---

# Port aplikasi
PORT=3000


---

# =========== DATABASE ===========

---

# Contoh: postgresql://user:password@host:5432/dbname
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb

---

# Pool koneksi (opsional, default: min=2, max=10)
DB_POOL_MIN=2
DB_POOL_MAX=10


---

# =========== REDIS ===========

---

# Untuk caching dan session (opsional)

---

# REDIS_URL=redis://localhost:6379


---

# =========== AUTH ===========

---

# JWT secret key — minimal 32 karakter
JWT_SECRET=your-secret-key-change-in-production

---

# JWT expiry (contoh: 7d, 1h, 30m)
JWT_EXPIRES_IN=7d


---

# =========== CORS ===========

---

# Origin yang diizinkan
CORS_ORIGIN=http://localhost:5173


---

# =========== LOGGING ===========

---

# Level: error | warn | info | debug
LOG_LEVEL=info


---

# =========== FEATURE FLAGS ===========
ENABLE_CACHE=true
ENABLE_RATE_LIMIT=true
```

---

## 4.3 Config Per Environment

### Struktur File

```
project/
├── .env.example          # Template untuk developer
├── .env.development      # Local development
├── .env.staging          # Staging server
├── .env.production       # Production (jangan di-commit!)
├── src/
│   └── env.ts            # Validasi Zod
```

### Memilih File Berdasarkan NODE_ENV

```typescript
// env.ts — enhanced version
import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

const nodeEnv = process.env.NODE_ENV || 'development';

// Load env file berdasarkan NODE_ENV
const envFile = path.resolve(process.cwd(), `.env.${nodeEnv}`);

// Fallback: .env.development → .env
dotenv.config({ path: path.resolve(process.cwd(), `.env.${nodeEnv}`) });
dotenv.config({ path: path.resolve(process.cwd(), '.env') }); // override dengan .env jika ada

// Validasi tetap sama
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  PORT: z.coerce.number().int().positive().max(65535),
  DATABASE_URL: z.string().url(),
  // ... sisanya
});

const parsedEnv = envSchema.safeParse(process.env);
// ... error handling
export const env = parsedEnv!.data;
```

### Perbedaan Config Per Environment

| Config | Development | Staging | Production |
|--------|-------------|---------|------------|
| `PORT` | 3000 | 3000 | 80/443 |
| `DATABASE_URL` | Local Postgres | Staging DB | Production DB |
| `REDIS_URL` | Local Redis | Staging Redis | Production Redis |
| `JWT_SECRET` | Dev-only | Staging-only | Real secret |
| `LOG_LEVEL` | debug | info | warn |
| `CORS_ORIGIN` | `http://localhost:5173` | `https://staging.app.com` | `https://app.com` |
| `ENABLE_CACHE` | false | true | true |
| `ENABLE_RATE_LIMIT` | false | true | true |

---

## 4.4 Secrets Management

Jangan simpan secrets di kode atau di file `.env` yang di-commit.

### Pendekatan Secrets Management

| Metode | Keamanan | Use Case |
|--------|----------|----------|
| `.env` file (lokal) | Rendah | Development |
| Environment variable di CI/CD | Sedang | CI/CD pipeline |
| Vault (HashiCorp) | Tinggi | Enterprise |
| Doppler | Tinggi | Team production |
| AWS Secrets Manager | Tinggi | AWS ecosystem |

### 1. Env File (Development)

```bash

---

# .env — di .gitignore!
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb
JWT_SECRET=dev-secret-key-not-for-production
```

**Penting:**
- ` .env` masuk `.gitignore`
- ` .env.example` adalah template tanpa nilai rahasia
- Jangan pernah commit `.env.production`

### 2. CI/CD Secrets (GitHub Actions)

```yaml

---

# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to VPS
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
          # Semua env production dari GitHub Secrets
        run: |
          echo "DATABASE_URL=$DATABASE_URL" >> .env.production
          echo "JWT_SECRET=$JWT_SECRET" >> .env.production
          # deploy script...
```

### 3. Doppler (Recommended untuk Team)

```bash

---

# Setup
npm install -g doppler-cli
doppler setup


---

# Jalankan dengan secrets dari Doppler
doppler run -- node dist/app.js


---

# Sync ke .env lokal
doppler secrets download --format env > .env
```

### 4. HashiCorp Vault

```typescript
import vault from 'node-vault';

const client = vault({
  apiVersion: 'v1',
  endpoint: process.env.VAULT_ADDR || 'http://localhost:8200',
  token: process.env.VAULT_TOKEN,
});

async function getDbCredentials() {
  const result = await client.read('database/creds/my-role');
  return {
    username: result.data.username,
    password: result.data.password,
  };
}
```

### Checklist Keamanan Secrets

- [ ] `.env` di `.gitignore`
- [ ] `.env.example` di-commit
- [ ] `.env.production` **tidak** di-commit
- [ ] Secrets di CI/CD menggunakan built-in secrets manager
- [ ] Rotasi secrets berkala
- [ ] Tidak ada hardcode secret di kode

---

## 4.5 Logging Level Per Environment

### Logger dengan Level

```typescript
// logger.ts
type LogLevel = 'error' | 'warn' | 'info' | 'debug';

const LOG_LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

class Logger {
  private currentLevel: number;

  constructor(level: LogLevel = 'info') {
    this.currentLevel = LOG_LEVELS[level];
  }

  private log(level: LogLevel, message: string, meta?: unknown) {
    if (LOG_LEVELS[level] > this.currentLevel) return;

    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      meta: meta || undefined,
    };

    if (level === 'error') {
      console.error(JSON.stringify(entry));
    } else if (level === 'warn') {
      console.warn(JSON.stringify(entry));
    } else {
      console.log(JSON.stringify(entry));
    }
  }

  error(message: string, meta?: unknown) { this.log('error', message, meta); }
  warn(message: string, meta?: unknown) { this.log('warn', message, meta); }
  info(message: string, meta?: unknown) { this.log('info', message, meta); }
  debug(message: string, meta?: unknown) { this.log('debug', message, meta); }
}

export const logger = new Logger(process.env.LOG_LEVEL as LogLevel || 'info');
```

### Penggunaan

```typescript
import { logger } from './logger';
import { env } from './env';

// Debug — hanya di development
logger.debug('Mencoba koneksi database...', { url: env.DATABASE_URL });

// Info — semua environment
logger.info('Server dimulai', { port: env.PORT, env: env.NODE_ENV });

// Warn — peringatan
logger.warn('Rate limit mendekati batas', { ip: req.ip });

// Error — error yang perlu ditindaklanjuti
logger.error('Koneksi database gagal', { error: err.message });
```

### Logging Level Berdasarkan Environment

| Environment | Level | Volume | Tujuan |
|-------------|-------|--------|--------|
| Development | `debug` | Tinggi | Debugging selama development |
| Staging | `info` | Sedang | Verifikasi sebelum production |
| Production | `warn` | Rendah | Hanya error dan warning |

### Struktur Log JSON

```json
{"timestamp":"2025-07-05T10:30:00.000Z","level":"info","message":"Server dimulai","meta":{"port":3000,"env":"production"}}
{"timestamp":"2025-07-05T10:30:01.000Z","level":"error","message":"Database connection timeout","meta":{"error":"Connection refused"}}
```

Format JSON memudahkan integrasi dengan log aggregation tools (ELK, Datadog, Grafana Loki).

---

## 4.6 Feature Flags

Feature flags mengaktifkan/menonaktifkan fitur tanpa deploy ulang.

### Berdasarkan Environment Variable

```typescript
import { env } from './env';

// Cache — aktif di staging & prod
if (env.ENABLE_CACHE) {
  app.use(cacheMiddleware);
}

// Rate limit — aktif di semua kecuali development
if (env.ENABLE_RATE_LIMIT) {
  app.use(rateLimiter);
}

// Fitur beta — hanya di staging
if (env.NODE_ENV === 'staging') {
  app.use('/api/beta', betaFeatureRouter);
}

// Fitur baru — roll out bertahap
const NEW_CHECKOUT_FLOW = process.env.FEATURE_NEW_CHECKOUT === 'true';
if (NEW_CHECKOUT_FLOW) {
  app.post('/api/checkout', newCheckoutHandler);
} else {
  app.post('/api/checkout', oldCheckoutHandler);
}
```

### Lebih Terstruktur

```typescript
// features.ts
import { env } from './env';

interface Features {
  cache: boolean;
  rateLimit: boolean;
  newCheckout: boolean;
  betaDashboard: boolean;
  exportCsv: boolean;
}

export const features: Features = {
  cache: env.ENABLE_CACHE,
  rateLimit: env.ENABLE_RATE_LIMIT,
  newCheckout: process.env.FEATURE_NEW_CHECKOUT === 'true',
  betaDashboard: env.NODE_ENV === 'staging',
  exportCsv: env.NODE_ENV !== 'development', // nonaktif di dev
};

// Penggunaan
if (features.cache) { /* ... */ }
```

---

## 4.7 Praktik Lengkap

```typescript
// env.ts
import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

const nodeEnv = process.env.NODE_ENV || 'development';
dotenv.config({ path: path.resolve(process.cwd(), `.env.${nodeEnv}`) });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  ENABLE_CACHE: z.coerce.boolean().default(true),
  ENABLE_RATE_LIMIT: z.coerce.boolean().default(true),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  parsed.error.issues.forEach(i => console.error(`  ${i.path.join('.')}: ${i.message}`));
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
```

```bash

---

# .env.development
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://dev:dev@localhost:5432/mydb_dev
JWT_SECRET=dev-only-secret-key-1234567890123456
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:5173
ENABLE_CACHE=false
ENABLE_RATE_LIMIT=false
```

```bash

---

# .env.production (JANGAN DI-COMMIT!)
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@production-host:5432/mydb
JWT_SECRET=real-production-secret-that-is-very-long
LOG_LEVEL=warn
CORS_ORIGIN=https://app.example.com
ENABLE_CACHE=true
ENABLE_RATE_LIMIT=true
```

```bash

---

# .env.example
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb
JWT_SECRET=change-this-to-a-secure-key
LOG_LEVEL=info
CORS_ORIGIN=http://localhost:3000
ENABLE_CACHE=true
ENABLE_RATE_LIMIT=true
```

---

## Latihan

### Soal 1: Env Validation

Buat file `env.ts` dengan Zod validation untuk environment variables:

1. `NODE_ENV` — enum 'development' | 'staging' | 'production', default 'development'
2. `PORT` — number, 1-65535, default 3000
3. `DATABASE_URL` — string valid URL
4. `JWT_SECRET` — string minimal 32 karakter
5. `SMTP_HOST` — string (opsional)
6. `SMTP_PORT` — number (opsional), 1-65535
7. `LOG_LEVEL` — enum 'error' | 'warn' | 'info' | 'debug', default 'info'
8. `ENABLE_NOTIFICATIONS` — boolean, default false

Jika validasi gagal, tampilkan error dan exit process dengan kode 1.

### Soal 2: Multi-Env Config

Buat konfigurasi untuk tiga environment:

1. **Development** (.env.development):
   - Local database, debug logging, cache nonaktif
   - CORS origin: localhost:5173

2. **Staging** (.env.staging):
   - Staging database, info logging, cache aktif
   - CORS origin: https://staging.example.com

3. **Production** (.env.production):
   - Production database, warn logging, cache aktif, rate limit aktif
   - CORS origin: https://example.com
   - JWT secret: hanya dari environment variable (jangan hardcode!)

### Soal 3: Logger + Feature Flags

Buat sistem logging dan feature flags:

1. Logger dengan level: error, warn, info, debug
2. Set level berdasarkan `LOG_LEVEL` dari env
3. Output JSON: `{ timestamp, level, message, meta? }`
4. Fitur feature flags: cache, rate limit, notifikasi
5. Semua flag dikontrol lewat environment variables
6. Contoh penggunaan: middleware cache hanya jalan jika `ENABLE_CACHE=true`
