# Sesi 3: Deployment & Scaling — AI Travel Planner

> **Durasi:** 2 minggu (Sprint 4) | **Mode:** Individu / Kelompok (maks. 3 orang)

---

## 📋 Ringkasan

Sesi terakhir mencakup deployment production, caching strategy, rate limiting, cost optimization untuk API eksternal, dan monitoring. Mahasiswa akan mendeploy aplikasi ke Railway/Render, mengimplementasikan Redis caching untuk hasil AI, dan menyiapkan monitoring dengan logging dan metrik.

---

## 1. Deployment Strategy

### 1.1 Architecture Production

```
                         ┌──────────────┐
                         │  Vercel      │
                         │  (Frontend)  │
                         │  Next.js SSR │
                         └──────┬───────┘
                                │ HTTPS
                         ┌──────▼───────┐
                         │  Railway     │
                         │  (Backend)   │
                         │  Hono/Express│
                         └──────┬───────┘
                                │
              ┌─────────────────┼─────────────────┐
              ▼                 ▼                  ▼
     ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
     │  PostgreSQL   │  │    Redis     │  │  External    │
     │  (Neon/Railway)│  │  (Upstash)   │  │  APIs       │
     └──────────────┘  └──────────────┘  └──────────────┘
```

### 1.2 Dockerfile (Backend)

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3001
CMD ["node", "dist/index.js"]
```

### 1.3 Docker Compose (Production)

```yaml
# docker-compose.yml
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: travelplanner
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: .
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@db:5432/travelplanner
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      OPENWEATHER_API_KEY: ${OPENWEATHER_API_KEY}
      AMADEUS_CLIENT_ID: ${AMADEUS_CLIENT_ID}
      AMADEUS_CLIENT_SECRET: ${AMADEUS_CLIENT_SECRET}
      OPENAI_API_KEY: ${OPENAI_API_KEY}
    depends_on:
      - db
      - redis

volumes:
  pgdata:
```

### 1.4 GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - run: npm test
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway up --service backend
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-project-name: travel-planner
          vercel-args: '--prod'
```

---

## 2. Caching Strategy

### 2.1 Redis Caching untuk AI Results

```typescript
// src/services/cache.ts
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const DEFAULT_TTL = 3600; // 1 hour

export class CacheService {
  async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttl: number = DEFAULT_TTL): Promise<T> {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }

    const fresh = await fetcher();
    await redis.setex(key, ttl, JSON.stringify(fresh));
    return fresh;
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }

  // Cache key generators
  static weatherKey(location: string, date: string): string {
    return `weather:${location.toLowerCase()}:${date}`;
  }

  static placeKey(location: string, category: string): string {
    return `places:${location.toLowerCase()}:${category}`;
  }

  static tripKey(tripId: string): string {
    return `trip:${tripId}`;
  }
}
```

### 2.2 Caching Strategy Matrix

| Data | Cache Key | TTL | Invalidasi |
|------|-----------|-----|------------|
| Cuaca per lokasi + tanggal | `weather:{location}:{date}` | 1 jam | Time-based |
| Rekomendasi tempat | `places:{location}:{category}` | 24 jam | Time-based |
| Detail trip | `trip:{id}` | 5 menit | Update trip |
| Hasil generate itinerary | `itinerary:{tripId}` | 1 jam | Regenerate |
| Data user | `user:{id}` | 15 menit | Update profil |

### 2.3 Implementasi Cache di Generate Endpoint

```typescript
// src/routes/generate.ts
import { CacheService } from '../services/cache';

router.post('/trips/:id/generate', authMiddleware, async (c) => {
  const tripId = c.req.param('id');
  const cacheService = new CacheService();

  // Cek cache dulu
  const cached = await redis.get(`itinerary:${tripId}`);
  if (cached) {
    return c.json({ success: true, data: JSON.parse(cached), fromCache: true });
  }

  // Generate baru
  const trip = await tripService.getById(tripId);
  const result = await aiService.generateItinerary(trip);

  // Simpan ke cache
  await redis.setex(`itinerary:${tripId}`, 3600, JSON.stringify(result));

  return c.json({ success: true, data: result, fromCache: false });
});
```

---

## 3. Rate Limiting

### 3.1 Rate Limiting Strategy

| Endpoint | Limit | Window | Alasan |
|----------|-------|--------|--------|
| `/api/auth/login` | 5 requests | 15 menit | Prevent brute force |
| `/api/auth/register` | 3 requests | 60 menit | Prevent spam register |
| `/api/trips/:id/generate` | 10 requests | 60 menit | Biaya API LLM |
| `/api/weather` | 30 requests | 60 menit | Free tier OpenWeather |
| General API | 100 requests | 15 menit | Fair usage |

### 3.2 Implementasi dengan express-rate-limit

```typescript
// src/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export const generalLimiter = rateLimit({
  store: new RedisStore({ client: redis, prefix: 'rl:general:' }),
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Terlalu banyak request, coba lagi nanti' } },
});

export const authLimiter = rateLimit({
  store: new RedisStore({ client: redis, prefix: 'rl:auth:' }),
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
});

export const aiLimiter = rateLimit({
  store: new RedisStore({ client: redis, prefix: 'rl:ai:' }),
  windowMs: 60 * 60 * 1000,
  max: 10,
});
```

### 3.3 Implementasi di Routes

```typescript
// src/index.ts
import { generalLimiter, authLimiter, aiLimiter } from './middleware/rateLimit';

app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/trips/:id/generate', aiLimiter);
```

---

## 4. Cost Optimization

### 4.1 Biaya API Eksternal

| API | Harga | Free Tier | Strategi Optimasi |
|-----|-------|-----------|-------------------|
| OpenAI GPT-4o-mini | $0.15/1M input, $0.60/1M output | $5 gratis | Cache hasil, batch request |
| OpenAI Embedding | $0.13/1M tokens | — | Cache embedding, reuse |
| OpenWeather | Free: 60 calls/min, 1M calls/month | 1M/bulan | Cache 1 jam, limit per user |
| Amadeus | Pay-per-call | 2000 calls/bulan | Cache pencarian, minimal call |
| Google Places | $0.00-0.03 per call | $200/bulan | Cache 24 jam, limit radius |

### 4.2 Implementasi Cost Tracker

```typescript
// src/services/costTracker.ts
export class CostTracker {
  private costs: Map<string, number> = new Map();

  track(service: string, cost: number): void {
    const current = this.costs.get(service) || 0;
    this.costs.set(service, current + cost);
    console.log(`[COST] ${service}: $${cost.toFixed(4)} (total: $${(current + cost).toFixed(4)})`);
  }

  async logToDatabase(userId: string, service: string, cost: number): Promise<void> {
    await prisma.costLog.create({
      data: { userId, service, cost, timestamp: new Date() },
    });
  }

  getTotalCost(): number {
    return Array.from(this.costs.values()).reduce((a, b) => a + b, 0);
  }

  getReport(): Record<string, number> {
    return Object.fromEntries(this.costs.entries());
  }
}
```

### 4.3 Tips Optimasi Biaya

1. **Cache aggressively**: 60% request AI bisa di-cache (cuaca, rekomendasi tempat)
2. **Gunakan model murah**: GPT-4o-mini untuk generate, reserve GPT-4o untuk edge cases
3. **Batch embedding**: Jangan panggil embedding API per-item — batch 20 item sekaligus
4. **Rate limit per user**: Batasi generate 10x/jam/user untuk kontrol biaya
5. **Monitor dashboard**: Pantau biaya real-time di dashboard admin

---

## 5. Monitoring

### 5.1 Logging

```typescript
// src/middleware/logger.ts
import pino from 'pino';

export const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: { colorize: true },
  },
  level: process.env.LOG_LEVEL || 'info',
});

// Request logging middleware
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on('finish', () => {
    logger.info({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${Date.now() - start}ms`,
      userId: (req as any).userId,
    });
  });
  next();
}
```

### 5.2 Health Check & Metrik

```typescript
// src/routes/health.ts
import { prisma } from '../config/database';
import { redis } from '../services/cache';

router.get('/api/health', async (c) => {
  const checks = {
    database: 'healthy',
    redis: 'healthy',
    externalApis: {
      openweather: 'unknown',
      amadeus: 'unknown',
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };

  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    checks.database = 'unhealthy';
  }

  // Check Redis
  try {
    await redis.ping();
  } catch {
    checks.redis = 'unhealthy';
  }

  const status = checks.database === 'healthy' && checks.redis === 'healthy' ? 'healthy' : 'degraded';

  return c.json({ status, checks });
});
```

### 5.3 Alerting

| Metrik | Threshold | Action |
|--------|-----------|--------|
| Response time p95 | > 2 detik | Slack notification |
| Error rate | > 5% dalam 5 menit | PagerDuty / Email |
| API cost harian | > $5 | Email ke developer |
| Uptime | < 99.9% | UptimeRobot alert |
| Redis memory | > 80% | Scale up Redis |

---

## 6. Latihan

> **Latihan 1:** Docker Compose Setup
> Buat docker-compose.yml untuk production dengan 3 service: PostgreSQL, Redis, dan backend Node.js. Pastikan semua service bisa `docker compose up -d` tanpa error. Konfigurasi healthcheck untuk setiap service.

> **Latihan 2:** Redis Caching Implementation
> Implementasi caching untuk endpoint weather dan place recommendation. Gunakan CacheService pattern. Test: panggil endpoint 2× — pertama harus slow (miss), kedua harus fast (hit). Ukur perbedaan latency.

> **Latihan 3:** Rate Limiting
> Implementasi rate limiting dengan express-rate-limit + Redis store. Set limit 10 request/jam untuk generate endpoint. Test: kirim 11 request dalam 1 jam — request ke-11 harus dapat 429 Too Many Requests.

> **Latihan 4:** Cost Tracking Dashboard
> Buat endpoint GET /api/admin/costs yang mengembalikan breakdown biaya per service (OpenAI, OpenWeather, Amadeus, Google). Simpan log biaya di tabel `cost_logs`. Tampilkan total biaya hari ini, minggu ini, bulan ini.

> **Latihan 5:** Health Check Endpoint
> Buat endpoint /api/health yang mengecek koneksi ke database, Redis, dan external APIs. Return status "healthy" atau "degraded" dengan detail komponen mana yang bermasalah.

> **Latihan 6:** CI/CD Pipeline
> Setup GitHub Actions dengan 3 jobs: (a) lint + type check, (b) test + coverage, (c) deploy ke Railway. Pastikan pipeline hanya deploy jika lint dan test hijau.

> **Latihan 7:** Monitoring & Logging
> Implementasi structured logging dengan Pino. Log setiap request dengan: method, path, status, duration, userId. Buat middleware yang menambahkan request ID unik ke setiap log. Verifikasi log output di terminal.

---

## 📊 Evaluation Rubric (Sesi 3)

| Kriteria | Bobot | 4 (Excellent) | 3 (Good) | 2 (Fair) | 1 (Poor) |
|----------|-------|---------------|----------|----------|----------|
| **Docker & Deployment** | 20% | Docker multi-stage, compose with 3 services, deployed to public URL | Docker compose jalan, deployed | Dockerfile doang, deploy manual | Tidak ada |
| **Caching** | 20% | Redis caching untuk semua AI data, invalidasi strategy, hit ratio > 50% | Cache untuk weather & places, TTL sesuai | Cache minimal, hanya 1 tipe data | Tidak ada caching |
| **Rate Limiting** | 15% | Rate limit per endpoint, Redis store, skip successful auth, custom message | Rate limit general, memory store | Rate limit basic | Tidak ada |
| **Cost Optimization** | 15% | Cost tracking, batch embedding, model tiering, monitoring dashboard | Cost tracking, model tiering | Cost tracking manual | Tidak ada cost control |
| **Monitoring** | 15% | Structured logging, health check, error tracking, metrics dashboard | Logging + health check | Logging basic | Tidak ada |
| **CI/CD** | 15% | GitHub Actions lint + test + deploy, semua hijau | CI lint + test, deploy manual | CI lint doang | Tidak ada CI |

---

## 💡 Tips

- **Deploy backend minggu 2**: Jangan menunggu sprint 4. Backend yang sudah di-deploy memudahkan frontend integration.
- **Cache adalah senjata utama**: Hasil AI generate itinerary bisa di-cache sampai user minta regenerate.
- **Monitor biaya sejak hari 1**: Jangan sampai tagihan OpenAI membengkak tanpa disadari.
- **Gunakan free tier maksimal**: Railway $5 credit, Neon free PostgreSQL, Redis Upstash 30MB free — gratis untuk development.
- **Demo backup**: Rekam video demo dengan aplikasi yang sudah di-deploy, bukan localhost.

---

| [← Sesi 2: Frontend & Backend](02-frontend-backend.md) | [Kembali ke README →](README.md) |
|---|---|
