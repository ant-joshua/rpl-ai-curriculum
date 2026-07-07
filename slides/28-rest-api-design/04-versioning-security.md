---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — <img src="https://images.pexels.com/photos/1181467/pexels-ph"
footer: "Sesi 04: Versioning Security"
---

<!-- _class: title -->
# 28.4 Versioning & Security

## API Versioning

Kenapa perlu versioning? Biar perubahan API gak ngerusak client lama.

### 1. URL Path Versioning (paling umum)

```
GET /api/v1/users
GET /api/v2/users
```

```typescript
// src/routes/v1/users.ts
import { Router } from 'express';
const router = Router();

router.get('/users', (_req, res) => {
  res.json({ version: 'v1', users: [] });
});

export default router;

// src/routes/v2/users.ts
const routerV2 = Router();

routerV2.get('/users', (_req, res) => {
  res.json({
    version: 'v2',
    data: { users: [] },
    meta: { page: 1, total: 0 },
  });
});

export default routerV2;

// src/app.ts
import v1UserRoutes from './routes/v1/users';
import v2UserRoutes from './routes/v2/users';

app.use('/api/v1', v1UserRoutes);
app.use('/api/v2', v2UserRoutes);
```

**Pro:** Gampang, jelas, bisa coexist.  
**Kontra:** URL berubah tiap versi.

### 2. Header Versioning

```
GET /api/users
Accept: application/vnd.myapp.v1+json
```

```typescript
app.get('/api/users', (req: Request, res: Response) => {
  const accept = req.headers['accept'] || '';
  const versionMatch = accept.match(/application\/vnd\.myapp\.v(\d+)\+json/);
  const version = versionMatch ? parseInt(versionMatch[1]) : 1;

  if (version === 1) {
    return res.json({ users: [] });
  }
  if (version === 2) {
    return res.json({ data: { users: [] }, meta: { page: 1 } });
  }
  res.status(400).json({ message: 'Versi API gak didukung' });
});
```

### 3. Query Parameter Versioning

```
GET /api/users?version=1
GET /api/users?version=2
```

```typescript
app.get('/api/users', (req: Request, res: Response) => {
  const version = parseInt(req.query.version as string) || 1;

  if (version === 1) return res.json({ users: [] });
  if (version === 2) return res.json({ data: { users: [] } });
  res.status(400).json({ message: 'Versi gak didukung' });
});
```

### Tabel Perbandingan

| Strategy | Kelebihan | Kekurangan |
|----------|-----------|------------|
| **URL Path** | Paling jelas, mudah di-cache, bisa deploy bareng | URL berubah, routing agak repetitive |
| **Header** | URL bersih, gak perlu routing terpisah | Client ribet set header, susah di-cache |
| **Query** | Gampang di-test di browser | URL jadi panjang, polusi query params |

> **Rekomendasi:** Pake URL path versioning buat public API. Pake header versioning buat internal API.

## Backward Compatibility

Aturan backward compatibility:

| ✅ Breaking | ❌ Aman |
|------------|---------|
| Rename field (`name` → `fullName`) | Nambah field baru |
| Hapus endpoint | Nambah endpoint baru |
| Ubah tipe data (`number` → `string`) | Nambah optional parameter |
| Hapus required field | Nambah optional field |
| Ubah status code | Nambah status code baru |

### Deprecation Strategy

```typescript
// src/middleware/deprecation.ts
import { Request, Response, NextFunction } from 'express';

export function deprecationMiddleware(deprecatedSince: string, sunsetDate?: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Deprecation', `true`);
    res.setHeader('Deprecated-Since', deprecatedSince);
    if (sunsetDate) {
      res.setHeader('Sunset', new Date(sunsetDate).toUTCString());
      res.setHeader('Link', `<https://docs.api.example.com/migration>; rel="migration"`);
    }
    next();
  };
}

// Pake di route lama yang mau di-deprecate
app.get('/api/v1/users', deprecationMiddleware('2024-01-01', '2024-06-30'), (req, res) => {
  res.json({ users: [] });
});
```

**Response headers:**

```
Deprecation: true
Deprecated-Since: 2024-01-01
Sunset: Sun, 30 Jun 2024 00:00:00 GMT
Link: <https://docs.api.example.com/migration>; rel="migration"
```

## Security

### 1. API Keys

```typescript
// src/middleware/apiKey.ts
import { Request, Response, NextFunction } from 'express';

const API_KEYS = new Set(['sk-abc123', 'sk-def456']);

export function apiKeyMiddleware(req: Request, res: Response, next: NextFunction): void {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    res.status(401).json({
      type: 'https://api.example.com/errors/unauthorized',
      title: 'Unauthorized',
      status: 401,
      detail: 'API key gak ditemukan. Kirim di header X-API-Key',
    });
    return;
  }

  if (!API_KEYS.has(apiKey)) {
    res.status(403).json({
      type: 'https://api.example.com/errors/forbidden',
      title: 'Forbidden',
      status: 403,
      detail: 'API key gak valid',
    });
    return;
  }

  next();
}
```

### 2. JWT (JSON Web Token)

```bash
npm install jsonwebtoken bcrypt
npm install -D @types/jsonwebtoken @types/bcrypt
```

```typescript
// src/utils/auth.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'rahasia-super-aman';

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: number, role: string): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: number; role: string } {
  return jwt.verify(token, JWT_SECRET) as { userId: number; role: string };
}
```

```typescript
// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';

// Extend Request type
declare global {
  namespace Express {
    interface Request {
      user?: { userId: number; role: string };
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    res.status(401).json({ message: 'Token gak ditemukan' });
    return;
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: 'Token gak valid atau expired' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Gak punya akses' });
      return;
    }
    next();
  };
}
```

```typescript
// Pake di route
app.post('/api/v1/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  // ... verify user dari database
  const token = generateToken(1, 'admin');
  res.json({ token });
});

app.get('/api/v1/profile', authMiddleware, (req: Request, res: Response) => {
  res.json({ user: req.user });
});

app.delete('/api/v1/users/:id',
  authMiddleware,
  requireRole('admin'),
  (req: Request, res: Response) => {
    // Hanya admin bisa hapus user
    res.json({ message: 'User dihapus' });
  }
);
```

### 3. CORS

```bash
npm install cors
npm install -D @types/cors
```

```typescript
import cors from 'cors';

// Allow semua origin (development)
app.use(cors());

// Production — strict
app.use(cors({
  origin: ['https://frontend-saya.com', 'https://admin-saya.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining'],
  credentials: true,
  maxAge: 86400, // Preflight cache 24 jam
}));
```

### 4. Helmet (Security Headers)

```bash
npm install helmet
```

```typescript
import helmet from 'helmet';

app.use(helmet());
// Otomatis nambahin headers:
// - X-Content-Type-Options: nosniff
// - X-Frame-Options: SAMEORIGIN
// - X-XSS-Protection: 0
// - Strict-Transport-Security: max-age=15552000; includeSubDomains
// - Content-Security-Policy: ...
```

### 5. Logging (Morgan + Winston)

```bash
npm install morgan winston
npm install -D @types/morgan
```

```typescript
// src/utils/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, stack }) => {
          return `${timestamp} [${level}]: ${message}${stack ? '\n' + stack : ''}`;
        }),
      ),
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});
```

```typescript
// src/app.ts
import morgan from 'morgan';
import { logger } from './utils/logger';

// Morgan stream ke Winston
const morganStream = {
  write: (message: string) => logger.info(message.trim()),
};

app.use(morgan('combined', { stream: morganStream }));

// Contoh output log:
// 2024-07-04 14:30:00 [info]: ::1 - - "GET /api/v1/users HTTP/1.1" 200 45
```

### Full App Setup — Semua Jadi Satu

```typescript
// src/app.ts — full production-ready setup
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { authMiddleware } from './middleware/auth';
import { logger } from './utils/logger';

const app = express();

// 1. Security headers
app.use(helmet());

// 2. CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));

// 3. Rate limiting
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100,
}));

// 4. Body parser
app.use(express.json({ limit: '10kb' }));

// 5. Logging
app.use(morgan('combined', { stream: { write: (msg: string) => logger.info(msg.trim()) } }));

// 6. Routes (v1 & v2)
import v1UserRoutes from './routes/v1/users';
import v2UserRoutes from './routes/v2/users';
app.use('/api/v1', v1UserRoutes);
app.use('/api/v2', authMiddleware, v2UserRoutes);

// 7. Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error(err.message, { stack: err.stack });
  res.status(500).json({
    type: 'https://api.example.com/errors/internal',
    title: 'Internal Server Error',
    status: 500,
    detail: 'Terjadi error di server',
  });
});

export default app;
```

## Latihan

1. Implement URL path versioning (`/api/v1/products` dan `/api/v2/products`) dimana v1 return `{ products: [] }` dan v2 return `{ data: { products: [] }, meta: { page, total } }`. Pake Express Router terpisah.

2. Bikin auth middleware (JWT) dengan 3 role: admin, user, guest. Endpoint `DELETE /api/v1/users/:id` cuma bisa diakses admin. Kalo user role lain — return 403.

3. Setup helmet, cors, dan rate limiter di Express app. Cors cuma allow `http://localhost:5173`. Rate limit 50 request per 15 menit. Tulis kode setup lengkap.

4. Integrasi morgan (logging request) + winston (logging error ke file). Error log disimpen di `logs/error.log`. Request log pake format `combined`. Tulis kode lengkap + middleware.
