# Sesi 1: Input Validation & Error Handling

**Durasi:** 3 JP (135 menit)

## Tujuan Pembelajaran

Setelah sesi ini, peserta mampu:
- Membuat Zod schema untuk validasi data input
- Menggunakan type inference dari Zod schema
- Membuat custom error class (AppError) dengan kode error, status code, dan metadata
- Membangun Express global error handler middleware
- Mengembalikan format respons error yang konsisten

---

## 1.1 Zod Schema Dasar

### 1.1.1 String & Number

```typescript
import { z } from 'zod';

// Validasi string dasar
const usernameSchema = z.string().min(3).max(30);
const emailSchema = z.string().email();

// Validasi number
const ageSchema = z.number().int().positive().max(150);
const priceSchema = z.number().positive();
```

**Method umum:**

| Method | Deskripsi | Contoh |
|--------|-----------|--------|
| `.min(n)` | Minimum length/value | `z.string().min(3)` |
| `.max(n)` | Maximum length/value | `z.string().max(255)` |
| `.email()` | Format email valid | `z.string().email()` |
| `.url()` | Format URL valid | `z.string().url()` |
| `.int()` | Bilangan bulat | `z.number().int()` |
| `.positive()` | Nilai positif | `z.number().positive()` |
| `.optional()` | Boleh undefined | `z.string().optional()` |
| `.nullable()` | Boleh null | `z.string().nullable()` |

### 1.1.2 Object & Array

```typescript
// Object schema
const userSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3).max(30),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
  role: z.enum(['admin', 'user', 'guest']),
});

// Array schema
const tagsSchema = z.array(z.string().min(1)).min(1).max(10);
const scoresSchema = z.array(z.number().min(0).max(100));
```

### 1.1.3 Union & Discriminated Union

```typescript
// Union — salah satu dari beberapa tipe
const resultSchema = z.union([
  z.object({ status: z.literal('success'), data: z.any() }),
  z.object({ status: z.literal('error'), message: z.string() }),
]);

// Discriminated Union — lebih efisien, pakai field pembeda
const apiResponseSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('success'), data: z.any() }),
  z.object({ status: z.literal('error'), message: z.string() }),
  z.object({ status: z.literal('loading') }),
]);
```

### 1.1.4 Transform

```typescript
// Transform nilai setelah validasi
const trimmedString = z.string().transform(s => s.trim());
const lowerCaseEmail = z.string().email().transform(s => s.toLowerCase());
const dateStringToDate = z.string().pipe(z.coerce.date());
const slugSchema = z.string().transform(s => s.toLowerCase().replace(/\s+/g, '-'));
```

---

## 1.2 Type-Safe Validation

Zod bisa meng-infer tipe TypeScript langsung dari schema.

```typescript
import { z } from 'zod';

// Definisikan schema
const createUserSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(8),
});

// Infer tipe dari schema
type CreateUserInput = z.infer<typeof createUserSchema>;
// Hasil: { username: string; email: string; password: string }

// Gunakan di handler
function createUser(data: unknown) {
  const parsed = createUserSchema.parse(data);
  // parsed sekarang bertipe CreateUserInput — aman!
  return db.users.create({ data: parsed });
}
```

**Validasi di middleware Express:**

```typescript
// validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from './AppError';

export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    
    if (!result.success) {
      const details = result.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      
      throw new AppError(400, 'VALIDATION_ERROR', 'Data tidak valid', details);
    }
    
    req[source] = result.data;
    next();
  };
}
```

---

## 1.3 Custom Error: AppError Class

Buat error class kustom untuk membawa informasi tambahan.

```typescript
// AppError.ts
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;
  public readonly timestamp: Date;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: unknown,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.timestamp = new Date();

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
```

**Error code standar:**

| Kode | Status | Deskripsi |
|------|--------|-----------|
| `VALIDATION_ERROR` | 400 | Data input tidak valid |
| `UNAUTHORIZED` | 401 | Belum terautentikasi |
| `FORBIDDEN` | 403 | Tidak punya akses |
| `NOT_FOUND` | 404 | Resource tidak ditemukan |
| `CONFLICT` | 409 | Konflik data (duplikat) |
| `RATE_LIMIT` | 429 | Terlalu banyak request |
| `INTERNAL_ERROR` | 500 | Error server internal |

---

## 1.4 Error Middleware Express

Global error handler — satu tempat untuk semua error.

```typescript
// errorHandler.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from './AppError';
import { ZodError } from 'zod';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  // Log error untuk debugging
  console.error(`[${new Date().toISOString()}] Error:`, {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // 1. AppError — error yang sudah kita definisikan
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        timestamp: err.timestamp,
      },
    });
  }

  // 2. ZodError — error validasi dari Zod
  if (err instanceof ZodError) {
    const details = err.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Data input tidak valid',
        details,
        timestamp: new Date(),
      },
    });
  }

  // 3. Error tak terduga
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Terjadi kesalahan internal server',
      timestamp: new Date(),
    },
  });
}
```

---

## 1.5 Format Respons Error Konsisten

Semua endpoint harus mengembalikan format error yang sama.

**Format sukses:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Format error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Data input tidak valid",
    "details": [
      { "field": "email", "message": "Email tidak valid" },
      { "field": "age", "message": "Usia harus positif" }
    ],
    "timestamp": "2025-07-05T10:30:00.000Z"
  }
}
```

---

## 1.6 Praktik: Integrasi Express + Zod + Error Handler

```typescript
// app.ts
import express from 'express';
import { z } from 'zod';
import { AppError } from './AppError';
import { validate } from './validation.middleware';
import { errorHandler } from './errorHandler.middleware';

const app = express();
app.use(express.json());

// Schema
const registerSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

// Route
app.post(
  '/api/register',
  validate(registerSchema),
  async (req, res) => {
    // Data sudah tervalidasi dan typed
    const { username, email, password } = req.body;
    
    // Simulasi duplikat
    if (email === 'exists@test.com') {
      throw new AppError(409, 'CONFLICT', 'Email sudah terdaftar');
    }
    
    res.status(201).json({
      success: true,
      data: { username, email },
    });
  },
);

// Global error handler — HARUS setelah semua route
app.use(errorHandler);

app.listen(3000, () => console.log('Server running on port 3000'));
```

---

## Latihan

### Soal 1: Zod Schema Produk

Buat Zod schema untuk input produk dengan spesifikasi:

1. `name` — string, min 3, max 100
2. `price` — number, positive, max 10000000
3. `category` — enum: 'food', 'electronics', 'clothing'
4. `tags` — array string, min 1, max 5
5. `description` — string optional, max 500
6. `discount` — number optional, antara 0 dan 100

Infer tipe `CreateProductInput` dari schema.

### Soal 2: Error Middleware

Buat global error handler Express yang:

1. Tangani `AppError` — kembalikan format `{ success, error: { code, message, details } }`
2. Tangani error `ZodError` — map ke VALIDATION_ERROR dengan field-level details
3. Tangani error lain — kembalikan INTERNAL_ERROR, jangan bocorkan detail di production
4. Log error dengan timestamp

### Soal 3: Integrasi

Gabungkan Zod schema produk dan error handler dalam satu aplikasi Express.

- `POST /api/products` — validasi body dengan Zod, simpan (simulasi), return 201
- `POST /api/products/bulk` — validasi array produk, return 201
- Semua error pakai format konsisten

### Pengantar Express Global Error Handler

Express middleware error memiliki 4 parameter: `(err, req, res, next)`. Jika `next(err)` dipanggil atau error dilempar dalam handler async, Express akan mengeksekusi middleware error terdaftar.

```typescript
// Wajib: 4 parameter!
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // handle error
});
```

**Peringatan:** Middleware error harus didaftarkan **setelah** semua route. Jika didaftarkan sebelum route, error handler tidak akan pernah terpanggil.
