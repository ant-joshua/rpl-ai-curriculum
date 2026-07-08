# 28.3 Error Handling & Pagination

## Standard Error Format — Problem Details (RFC 7807)

Daripada setiap endpoint return format error beda-beda, pake standar **RFC 7807**:

```typescript
// Struktur RFC 7807 Problem Details
interface ProblemDetails {
  type: string;        // URI yang ngejelasin error type
  title: string;       // Judul singkat (human-readable)
  status: number;      // HTTP status code
  detail: string;      // Penjelasan detail
  instance?: string;   // URI spesifik yang error (optional)
  // Bisa tambah field custom
  errors?: Record<string, string[]>; // field-level errors
}
```

### Contoh Response

```json
// 422 Validation Error
{
  "type": "https://api.example.com/errors/validation-error",
  "title": "Validation Error",
  "status": 422,
  "detail": "Data yang dikirim gak valid",
  "instance": "/api/v1/users",
  "errors": {
    "email": ["Email udah terdaftar", "Format email salah"],
    "name": ["Nama minimal 3 karakter"]
  }
}

// 404 Not Found
{
  "type": "https://api.example.com/errors/not-found",
  "title": "Resource Not Found",
  "status": 404,
  "detail": "User dengan ID 99 gak ditemukan",
  "instance": "/api/v1/users/99"
}

// 429 Too Many Requests
{
  "type": "https://api.example.com/errors/rate-limited",
  "title": "Rate Limit Exceeded",
  "status": 429,
  "detail": "Terlalu banyak request. Coba lagi dalam 60 detik",
  "instance": "/api/v1/todos"
}
```

### Implementasi di Express

```typescript
// src/utils/errors.ts
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  errors?: Record<string, string[]>;
}

export class AppError extends Error {
  public readonly status: number;
  public readonly type: string;
  public readonly errors?: Record<string, string[]>;

  constructor(status: number, title: string, detail: string, errors?: Record<string, string[]>) {
    super(detail);
    this.status = status;
    this.type = `https://api.example.com/errors/${title.toLowerCase().replace(/\s+/g, '-')}`;
    this.title = title;
    this.errors = errors;
  }
}

export function sendError(res: any, error: AppError, instance?: string): void {
  const body: ProblemDetails = {
    type: error.type,
    title: error.title,
    status: error.status,
    detail: error.message,
    instance: instance || res.req?.originalUrl,
  };
  if (error.errors) {
    body.errors = error.errors;
  }
  res.status(error.status).json(body);
}
```

### Error Middleware Global

```typescript
// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { AppError, sendError } from '../utils/errors';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    return sendError(res, err, req.originalUrl);
  }

  // Unknown error — jangan bocorin detail
  console.error('UNEXPECTED ERROR:', err);
  const internalError = new AppError(500, 'Internal Server Error', 'Terjadi error di server');
  sendError(res, internalError, req.originalUrl);
}

// Di app.ts
app.use(errorHandler);
```

## Error Codes & Messages — Best Practice

Bikin enum/constant biar konsisten:

```typescript
// src/constants/errors.ts
export const ErrorCodes = {
  VALIDATION_ERROR: { status: 422, title: 'Validation Error' },
  NOT_FOUND: { status: 404, title: 'Resource Not Found' },
  DUPLICATE_ENTRY: { status: 409, title: 'Duplicate Entry' },
  UNAUTHORIZED: { status: 401, title: 'Unauthorized' },
  FORBIDDEN: { status: 403, title: 'Forbidden' },
  RATE_LIMITED: { status: 429, title: 'Rate Limit Exceeded' },
  INTERNAL: { status: 500, title: 'Internal Server Error' },
} as const;
```

### Standard Error Response Format — Tabel Lengkap

Agari API konsisten, definisikan format error response untuk tiap status code:

| Status | type (URI) | title | detail |
|--------|-----------|-------|--------|
| 400 | `/errors/bad-request` | Bad Request | Format input salah |
| 401 | `/errors/unauthorized` | Unauthorized | Token tidak valid / tidak ada |
| 403 | `/errors/forbidden` | Forbidden | Role tidak punya akses |
| 404 | `/errors/not-found` | Resource Not Found | Resource dengan ID {x} tidak ada |
| 409 | `/errors/conflict` | Conflict | Data duplikat / state conflict |
| 422 | `/errors/validation-error` | Validation Error | Field tidak valid (sertakan `errors`) |
| 429 | `/errors/rate-limited` | Rate Limit Exceeded | Terlalu banyak request |
| 500 | `/errors/internal` | Internal Server Error | Terjadi error di server (jangan bocor) |

### Error Handler — TypeScript Lengkap

```typescript
// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { AppError, ProblemDetails } from '../utils/errors';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    const body: ProblemDetails = {
      type: err.type,
      title: err.title,
      status: err.status,
      detail: err.message,
      instance: req.originalUrl,
    };
    if (err.errors) body.errors = err.errors;
    return res.status(err.status).json(body);
  }

  // Unknown error — log internal, jangan bocorin detail
  console.error('UNEXPECTED ERROR:', err);
  const internalError: ProblemDetails = {
    type: 'https://api.example.com/errors/internal',
    title: 'Internal Server Error',
    status: 500,
    detail: 'Terjadi error di server',
    instance: req.originalUrl,
  };
  res.status(500).json(internalError);
}
```

## Pagination

### Offset Pagination (paling umum)

```
GET /api/users?page=2&limit=10
```

- `page` = halaman ke berapa (mulai 1)
- `limit` = jumlah item per halaman
- `offset = (page - 1) * limit`

```typescript
// Express pagination handler
app.get('/api/users', (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
  const offset = (page - 1) * limit;

  const paginatedUsers = users.slice(offset, offset + limit);
  const total = users.length;
  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: paginatedUsers,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
});
```

**Response:**

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 10,
    "total": 47,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": true
  }
}
```

### Cursor Pagination (buat real-time / infinite scroll)

```
GET /api/users?cursor=eyJpZCI6MTB9&limit=10
```

- `cursor` = token base64/encoded yang nunjukin posisi terakhir
- Biasanya pake `id` atau `createdAt` sebagai cursor

```typescript
interface CursorPaginationParams {
  cursor?: string;
  limit: number;
}

function decodeCursor(cursor: string): { id: number } | null {
  try {
    const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

app.get('/api/users-cursor', (req: Request, res: Response) => {
  const limit = Math.min(100, parseInt(req.query.limit as string) || 10);
  const cursorParam = req.query.cursor as string | undefined;

  let cursorId = 0;
  if (cursorParam) {
    const decoded = decodeCursor(cursorParam);
    if (!decoded) {
      return res.status(400).json({ message: 'Cursor tidak valid' });
    }
    cursorId = decoded.id;
  }

  const filteredUsers = users.filter(u => u.id > cursorId);
  const paginatedUsers = filteredUsers.slice(0, limit);
  const nextCursor = paginatedUsers.length === limit
    ? Buffer.from(JSON.stringify({ id: paginatedUsers[paginatedUsers.length - 1].id })).toString('base64')
    : null;

  res.json({
    success: true,
    data: paginatedUsers,
    pagination: {
      limit,
      hasMore: nextCursor !== null,
      nextCursor,
    },
  });
});
```

### Offset vs Cursor — Kapan Pake

| Aspek | Offset | Cursor |
|-------|--------|--------|
| **Use case** | Table biasa, halaman manual | Infinite scroll, real-time feed |
| **Performance** | Makin besar offset makin lambat (OFFSET scan) | Stabil (WHERE id > X) |
| **Data berubah** | Item baru bikin halaman geser (duplicate/skip) | Gak terpengaruh insert baru |
| **User experience** | Bisa lompat ke halaman tertentu | Gak bisa lompat ke halaman acak |
| **Implementasi** | Sederhana | Agak kompleks |

### Cursor Pagination dengan `createdAt`

Kalo pake `id` sebagai cursor, ada risiko data di-skip kalo id baru lebih kecil dari id lama. Alternatif: pake `createdAt` timestamp:

```typescript
app.get('/api/users-cursor-time', (req: Request, res: Response) => {
  const limit = Math.min(100, parseInt(req.query.limit as string) || 10);
  const cursor = req.query.cursor as string | undefined;
  // cursor = ISO timestamp dari item terakhir page sebelumnya

  let query = users.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  if (cursor) {
    query = query.filter(u => u.createdAt.toISOString() < cursor);
  }

  const paginated = query.slice(0, limit);
  const nextCursor = paginated.length === limit
    ? paginated[paginated.length - 1].createdAt.toISOString()
    : null;

  res.json({
    success: true,
    data: paginated,
    pagination: { limit, hasMore: nextCursor !== null, nextCursor },
  });
});
```

## Sorting & Filtering

```typescript
// GET /api/users?sort=name&order=asc&role=admin&status=active
app.get('/api/users', (req: Request, res: Response) => {
  let result = [...users];

  // Filtering
  if (req.query.role) {
    result = result.filter(u => u.role === req.query.role);
  }
  if (req.query.status) {
    result = result.filter(u => u.status === req.query.status);
  }

  // Sorting
  const sortField = (req.query.sort as string) || 'id';
  const sortOrder = (req.query.order as string) === 'desc' ? -1 : 1;

  result.sort((a: any, b: any) => {
    if (a[sortField] < b[sortField]) return -1 * sortOrder;
    if (a[sortField] > b[sortField]) return 1 * sortOrder;
    return 0;
  });

  // Pagination
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;
  const paginated = result.slice(offset, offset + limit);

  res.json({
    success: true,
    data: paginated,
    pagination: {
      page, limit,
      total: result.length,
      totalPages: Math.ceil(result.length / limit),
    },
  });
});
```

## Rate Limiting — Sliding Window vs Fixed Window

### Fixed Window

```typescript
// Fixed window — reset tiap menit
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 menit
  max: 100,
  standardHeaders: true,
});
```

Masalah: di detik-59 user spam 100 request, di detik-61 dapet 100 lagi. Total 200 request dalam 2 detik.

### Sliding Window

Sliding window lebih adil — pake timestamp log:

```typescript
// Sliding window — rolling log
import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterMemory({
  points: 100,       // 100 request
  duration: 60,      // per 60 detik
  blockDuration: 60, // block 60 detik kalo exceed
});

app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch {
    res.status(429).json({
      type: 'https://api.example.com/errors/rate-limited',
      title: 'Rate Limit Exceeded',
      status: 429,
      detail: 'Too many requests. Try again later.',
    });
  }
});
```

### Per-Endpoint Rate Limit

```typescript
// Login — slow (prevent brute force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 5,                    // max 5 percobaan login
  message: {
    type: 'https://api.example.com/errors/rate-limited',
    title: 'Too Many Login Attempts',
    status: 429,
    detail: 'Terlalu banyak percobaan login. Coba lagi 15 menit lagi.',
  },
});

app.post('/api/v1/auth/login', loginLimiter, loginHandler);

// API umum — normal
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
});

app.use('/api/', apiLimiter);

// Public endpoints — lebih longgar
const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
});

app.get('/api/products', publicLimiter, getProducts);
```

### Rate Limiting Headers — Standar

```http
RateLimit-Limit: 60
RateLimit-Remaining: 45
RateLimit-Reset: 1712345678
Retry-After: 15
```

### Rate Limit dengan Redis (distributed)

```typescript
import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';

const redis = new Redis();

const rateLimiter = new RateLimiterRedis({
  storeClient: redis,
  points: 100,
  duration: 60,
  blockDuration: 60,
});

app.use('/api/', async (req, res, next) => {
  try {
    const result = await rateLimiter.consume(req.ip);
    res.set('RateLimit-Limit', '100');
    res.set('RateLimit-Remaining', String(result.remainingPoints));
    res.set('RateLimit-Reset', String(Math.floor(Date.now() / 1000) + result.msBeforeNext / 1000));
    next();
  } catch {
    res.status(429).json({
      type: 'https://api.example.com/errors/rate-limited',
      title: 'Rate Limit Exceeded',
      status: 429,
      detail: 'Too many requests',
    });
  }
});
```

## ETag & Cache-Control — Caching API Response

### ETag Implementation

```typescript
import crypto from 'crypto';

function generateETag(data: any): string {
  return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
}

app.get('/api/products', (req, res) => {
  const data = getProducts();
  const etag = generateETag(data);

  // Check If-None-Match dari request
  if (req.headers['if-none-match'] === etag) {
    return res.status(304).end(); // Not Modified — no body
  }

  res.set({
    'ETag': etag,
    'Cache-Control': 'public, max-age=60',
    'Vary': 'Accept-Encoding',
  });
  res.json({ success: true, data });
});
```

### Express Built-in ETag

```typescript
const app = express();
app.set('etag', 'strong'); // default: weak

// Strong — beda byte dikit = ETag beda (akurat, mahal)
// Weak — beda byte dikit = ETag bisa sama (kurang akurat, murah)

// Nonaktifin kalo perlu
app.set('etag', false);
```

### Cache-Control Strategies

| Strategy | Directive | Use Case |
|----------|-----------|----------|
| Public cache | `public, max-age=3600` | Product list, public data |
| Private cache | `private, max-age=60` | User profile (per-user) |
| No cache | `no-cache` | Data selalu revalidate ke server |
| No store | `no-store` | Sensitive data (auth, payment) |
| Stale while revalidate | `public, max-age=60, stale-while-revalidate=86400` | Serve stale, refresh bg |
| Immutable | `public, max-age=31536000, immutable` | Versioned static assets |

### Cache-Control + ETag — Full Pattern

```typescript
function cacheControl(duration: number, scope: 'public' | 'private' = 'public') {
  return (req: Request, res: Response, next: NextFunction) => {
    // Generate ETag dari response body
    const originalJson = res.json.bind(res);
    res.json = function (body: any) {
      const etag = crypto.createHash('md5').update(JSON.stringify(body)).digest('hex');
      
      res.set({
        'ETag': etag,
        'Cache-Control': `${scope}, max-age=${duration}`,
        'Vary': 'Accept-Encoding, Authorization',
      });

      if (req.headers['if-none-match'] === etag) {
        return res.status(304).end();
      }

      return originalJson.call(this, body);
    };
    next();
  };
}

// Pake
app.get('/api/products', cacheControl(60), getProducts);
app.get('/api/profile', authMiddleware, cacheControl(0, 'private'), getProfile);
```

`express-rate-limit` otomatis nambahin headers:

```
RateLimit-Limit: 100
RateLimit-Remaining: 87
RateLimit-Reset: 1712345678
Retry-After: 45
```

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 menit
  max: 100,            // max 100 request per menit
  standardHeaders: true,  // Return RateLimit-* headers
  legacyHeaders: false,   // Gak pake X-RateLimit-* (old)
  message: {
    type: 'https://api.example.com/errors/rate-limited',
    title: 'Rate Limit Exceeded',
    status: 429,
    detail: 'Terlalu banyak request. Coba lagi.',
  },
});

app.use('/api/', limiter);
```

## Latihan

1. Implement `AppError` class dan global error handler middleware di Express TypeScript. Include `sendError` helper. Test dengan throw `AppError(404, 'Not Found', 'User tidak ditemukan')`.

2. Bikin endpoint `GET /api/products` dengan offset pagination (page, limit) + sorting (sort, order) + filtering (minPrice, maxPrice, category). Return pagination metadata.

3. Ubah pagination di endpoint `/api/products` jadi cursor-based. Pake field `id` sebagai cursor. Return `nextCursor` kalo masih ada data.

4. Tambahin `express-rate-limit` middleware dengan custom message RFC 7807. Konfigurasi: 50 request per 15 menit per IP. Return ProblemDetails kalo kena limit.

5. **Standard Error Response** — Implementasikan tabel standard error format  di atas ke dalam Express app. Buat middleware error handler yang handle AppError dan unknown error. Test dengan 3 skenario: validation error (422), not found (404), internal error (500). Catat response untuk tiap skenario.

6. **Cursor Pagination dengan Timestamp** — Ubah endpoint `GET /api/products` jadi cursor-based pagination pake `createdAt` sebagai cursor. Sort descending (terbaru dulu). Return `nextCursor` kalo masih ada data. Implementasi di Express TypeScript.
