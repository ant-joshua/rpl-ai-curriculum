---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — <img src="https://images.pexels.com/photos/1181467/pexels-ph"
footer: "Sesi 03: Error Pagination"
---

<!-- _class: title -->
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

## Rate Limiting — Headers

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
