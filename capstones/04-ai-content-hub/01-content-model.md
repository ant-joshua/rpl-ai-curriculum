# Sesi 1: Content Model & API Foundation

> **Durasi**: 2 minggu (Sprint 1)
> **Fokus**: Setup proyek, database schema, auth system, dan struktur API dasar

## 🎯 Tujuan Sesi

Setelah menyelesaikan sesi ini, mahasiswa mampu:

1. Menginisialisasi proyek TypeScript + Express.js dengan struktur folder yang terstandarisasi
2. Merancang dan mengimplementasikan skema database PostgreSQL untuk sistem manajemen konten
3. Membangun sistem autentikasi JWT lengkap (register, login, protected routes)
4. Menggunakan Drizzle ORM atau Prisma untuk migrasi dan query database
5. Menerapkan validasi input dengan Zod di semua endpoint
6. Menulis middleware reusable untuk error handling dan autentikasi
7. Menyiapkan environment development dengan Docker Compose

## 📋 Ringkasan Materi

### Arsitektur Proyek

Proyek AI Content Hub menggunakan layered architecture:

```
ai-content-hub/
├── src/
│   ├── agents/        # Mastra agent definitions
│   ├── routes/        # Express route handlers
│   ├── middleware/    # Auth, error handler, validation
│   ├── db/           # Schema, migration, seed
│   ├── services/     # Business logic layer
│   ├── utils/        # Helpers & utilities
│   └── index.ts      # Entry point
├── tests/
├── Dockerfile
└── docker-compose.yml
```

Setiap layer memiliki tanggung jawab terpisah. Routes hanya menangani HTTP request/response, services berisi logika bisnis, dan middleware menangani cross-cutting concerns seperti auth dan validasi.

### Database Schema Design

Sistem menggunakan PostgreSQL 16 dengan entity relationship berikut:

**users** — menyimpan data pengguna
- `id` (UUID, PK)
- `email` (VARCHAR 255, UNIQUE, NOT NULL)
- `password_hash` (VARCHAR 255, NOT NULL)
- `name` (VARCHAR 100, NOT NULL)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**articles** — konten artikel blog
- `id` (UUID, PK)
- `user_id` (UUID, FK → users.id)
- `title` (VARCHAR 255, NOT NULL)
- `content` (TEXT, NOT NULL)
- `summary` (TEXT, nullable — diisi AI)
- `status` (VARCHAR 20, default 'draft')
- `created_at`, `updated_at`

**tags** — label untuk kategorisasi konten
- `id` (UUID, PK)
- `name` (VARCHAR 50, UNIQUE, NOT NULL)

**article_tags** — relasi many-to-many
- `article_id` (FK), `tag_id` (FK)
- Primary key composite (article_id, tag_id)

**content_suggestions** — hasil generate AI untuk sosial media
- `id` (UUID, PK)
- `article_id` (UUID, FK)
- `platform` (VARCHAR 50 — twitter/linkedin/instagram)
- `content` (TEXT, NOT NULL)
- `type` (VARCHAR 20, default 'social_media')
- `created_at`

### JWT Authentication Flow

1. **Register**: User kirim `{email, password, name}` → hash password dengan bcrypt → simpan ke DB → return JWT
2. **Login**: User kirim `{email, password}` → verifikasi hash → generate JWT dengan payload `{userId, email}` → return token
3. **Protected Routes**: Middleware `authenticate` parse header `Authorization: Bearer <token>` → verifikasi → attach `req.user`
4. **Token Expiry**: Access token kadaluarsa 15 menit, client harus refresh

### Zod Validation

Zod digunakan untuk validasi input di setiap endpoint:

```typescript
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Minimal 8 karakter'),
  name: z.string().min(1, 'Nama wajib diisi'),
});
```

Middleware validasi otomatis memanggil `.parse()` pada body request dan melempar error jika validasi gagal.

### Error Handling Pattern

Semua error melewati satu error handler middleware:

```typescript
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'Terjadi kesalahan internal',
    },
  });
});
```

## 🛠️ Latihan

### Latihan 1: Inisialisasi Proyek

Buat proyek TypeScript + Express dari nol:

1. Inisialisasi `package.json` dengan `npm init -y`
2. Install dependencies: `express`, `typescript`, `tsx`, `@types/express`, `zod`, `bcrypt`, `jsonwebtoken`
3. Setup `tsconfig.json` dengan strict mode
4. Buat struktur folder `src/` dengan subfolder: `routes/`, `middleware/`, `db/`, `services/`, `utils/`
5. Buat file entry `src/index.ts` dengan server Express dasar

**Kriteria sukses**: Server berjalan di port 3000, `GET /api/health` mengembalikan `{ status: 'ok' }`.

### Latihan 2: Database Schema & Migration

Implementasi skema database dengan Drizzle ORM:

1. Install `drizzle-orm`, `drizzle-kit`, `pg`, `@types/pg`
2. Definisi schema di `src/db/schema.ts` untuk semua tabel (users, articles, tags, article_tags, content_suggestions)
3. Buat migrasi pertama dengan `drizzle-kit generate`
4. Buat seed script untuk data dummy (3 user, 5 tag, 10 artikel)
5. Jalankan migrasi ke PostgreSQL lokal

**Kriteria sukses**: Tabel terbuat di database, seed data bisa di-query.

### Latihan 3: Auth System

Bangun sistem autentikasi lengkap:

1. Buat `POST /api/auth/register` — validasi input dengan Zod, hash password, simpan user, return JWT
2. Buat `POST /api/auth/login` — verifikasi kredensial, return JWT
3. Buat middleware `authenticate` di `src/middleware/auth.ts`
4. Buat utility untuk generate JWT (sign) dan verify
5. Test dengan curl/Postman: register → login → akses protected route

**Kriteria sukses**: Register dan login berfungsi. Protected route menolak request tanpa token valid.

### Latihan 4: CRUD Tags

Implementasi CRUD untuk tag:

1. `GET /api/tags` — list semua tags
2. `POST /api/tags` — buat tag baru (Zod validation: name minimal 2 karakter)
3. `DELETE /api/tags/:id` — hapus tag
4. Gunakan service pattern: `src/services/tag.service.ts`
5. Pastikan tag name unique (handle error duplicate)

**Kriteria sukses**: Semua endpoint tag berfungsi, error duplicate name tertangani.

### Latihan 5: CRUD Articles

Implementasi CRUD untuk artikel:

1. `GET /api/articles` — list artikel dengan pagination (`page`, `limit`), filter by tag
2. `GET /api/articles/:id` — detail artikel + tags + content_suggestions
3. `POST /api/articles` — buat artikel baru, attach tags via request body
4. `PUT /api/articles/:id` — update artikel, hanya owner yang bisa
5. `DELETE /api/articles/:id` — hapus artikel, hanya owner yang bisa

**Kriteria sukses**: Semua CRUD berfungsi, pagination bekerja, permission check untuk edit/hapus.

### Latihan 6: Relasi Article–Tag

Implementasi many-to-many article–tag:

1. Gunakan junction table `article_tags`
2. Saat create/update artikel, terima array `tagIds` di body
3. Hapus relasi lama, insert relasi baru saat update
4. Include tags di response detail artikel
5. Filter artikel by tag name di query parameter

**Kriteria sukses**: Artikel bisa memiliki banyak tag, filter by tag berfungsi.

### Latihan 7: Error Handling & Middleware

Implementasi error handling global:

1. Buat class `AppError` dengan properti `statusCode`, `code`, `message`
2. Buat error handler middleware di `src/middleware/error.ts`
3. Buat async wrapper untuk route handler yang menangkap error async
4. Implementasi consistent response format: `{ status, data, message }`
5. Test error scenarios: invalid input, not found, unauthorized

**Kriteria sukses**: Semua error response konsisten, async errors tidak crash server.

## 📚 Referensi

- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [JWT Introduction](https://jwt.io/introduction)
- [Zod Documentation](https://zod.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---
**Capstone 4 — Sesi 1: Content Model & API Foundation.** Lanjut ke [Sesi 2: Frontend CMS](02-frontend-cms.md).
