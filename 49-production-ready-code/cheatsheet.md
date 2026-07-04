# 🧠 Cheatsheet: Production-Ready Code

> Referensi cepet — 1 halaman.

## Topik Utama

| Sesi | Topik | Tools |
|------|-------|-------|
| 1 | Input Validation & Error Handling | Zod, AppError, error middleware |
| 2 | Security Hardening | Helmet, CORS, rate limiting, sanitization |
| 3 | Health Checks & Graceful Shutdown | /healthz, /readyz, SIGTERM, PM2 |
| 4 | Environment & Configuration | 12-factor app, Zod env, secrets management |

## Command / Sintaks Penting

**Zod schemas (input validation):**
```typescript
import { z } from 'zod';
const userSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3).max(30),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
  role: z.enum(['admin', 'user', 'guest']),
});
type User = z.infer<typeof userSchema>;
```

**AppError + error middleware:**
```typescript
class AppError extends Error {
  constructor(public statusCode: number, public code: string, message: string, public meta?: any) {
    super(message);
  }
}
// Global handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: { code: err.code, message: err.message, meta: err.meta } });
  }
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
});
```

**Helmet config:**
```typescript
import helmet from 'helmet';
app.use(helmet({
  contentSecurityPolicy: {
    directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'"], imgSrc: ["'self'", 'data:'] }
  },
  frameguard: { action: 'deny' },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  xPoweredBy: false,
}));
```

**CORS config (production):**
```typescript
import cors from 'cors';
app.use(cors({
  origin: ['https://app.example.com', /\\.example\\.com$/],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));
```

**Health check endpoints:**
```typescript
// /healthz — liveness
app.get('/healthz', (_req, res) => res.status(200).json({ status: 'ok', uptime: process.uptime() }));
// /readyz — readiness (cek DB, Redis)
app.get('/readyz', async (_req, res) => {
  const checks = { database: await checkDatabase(), redis: await checkRedis() };
  const allHealthy = Object.values(checks).every(c => c.status === 'healthy');
  res.status(allHealthy ? 200 : 503).json({ status: allHealthy ? 'ok' : 'degraded', checks });
});
```

**Graceful shutdown:**
```typescript
process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  server.close(() => { console.log('HTTP server closed'); process.exit(0); });
  await db.$disconnect(); await redis.disconnect();
  setTimeout(() => { console.error('Forced shutdown'); process.exit(1); }, 10000);
});
```

**Environment validation (Zod + dotenv):**
```typescript
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().max(65535).default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) { console.error('Invalid env:', parsed.error.issues); process.exit(1); }
export const env = parsed.data;
```

**.env.example:**
```bash
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb
JWT_SECRET=change-me-32-chars-minimum
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=debug
```

## Tips & Trik
- **Zod .safeParse()** — never use `.parse()` in prod, always handle validation errors gracefully
- **Rate limiting:** `npm i express-rate-limit`, 100 req/min per IP default
- **PM2:** `pm2 start dist/index.js --name app`, `pm2 save && pm2 startup`
- **12-factor:** config in env, never hardcode. One `.env` per environment.

## Common Mistakes
- ❌ `<input value={userInput}>` without sanitization — XSS vector
- ❌ CORS set to `*` with credentials — browser rejects it
- ❌ No `SIGTERM` handler → connections drop abruptly on deploy
- ❌ Hardcode DB credentials in docker-compose — use `.env` + env_file

## Link Cepat
- [Module README](.)
- [Quiz](quiz.md)
