# Sesi 1: Platform Design & Auth System

> **Durasi**: 2 minggu (Sprint 1)
> **Fokus**: Fondasi backend, manajemen user, role-based access control, CRUD course & lesson

## 🎯 Tujuan Sesi

Setelah menyelesaikan sesi ini, mahasiswa mampu:

1. Menginisialisasi proyek TypeScript + Express.js dengan struktur folder terstandarisasi
2. Merancang skema database relasional untuk LMS pemrograman
3. Membangun sistem autentikasi JWT dengan access dan refresh token
4. Mengimplementasikan role-based access control (admin, instruktur, mahasiswa)
5. Membangun CRUD course dan lesson dengan relasi database
6. Menggunakan Drizzle ORM untuk migrasi dan query
7. Menulis integration test untuk alur autentikasi

## 📋 Ringkasan Materi

### Arsitektur Backend

Proyek Coding Bootcamp Platform menggunakan layered architecture dengan pemisahan tanggung jawab yang jelas:

```
coding-bootcamp/
├── src/
│   ├── routes/          # Express route handlers
│   ├── middleware/      # Auth, RBAC, validation, error handler
│   ├── db/              # Schema, migration, seed
│   ├── services/        # Business logic
│   ├── agents/          # Mastra AI agent definitions
│   ├── utils/           # Helpers (JWT, hashing, etc.)
│   └── index.ts         # Entry point
├── tests/
├── Dockerfile
└── docker-compose.yml
```

Setiap layer memiliki satu tanggung jawab. Routes tidak mengandung logika bisnis — hanya memvalidasi input, memanggil service, dan mengembalikan response. Services berisi logika domain seperti perhitungan reputasi atau orchestrasi AI calls.

### Database Schema Design

Sistem LMS memiliki 6 tabel utama dengan relasi sebagai berikut:

```
users ──< courses (instructor_id)
users ──< submissions
courses ──< lessons
lessons ──< submissions
submissions ──< code_reviews
lessons <──> exercises (generated AI)
```

**users** — menyimpan semua pengguna (admin, instruktur, mahasiswa)
- `id` (UUID, PK), `email` (UNIQUE), `password_hash`, `name`, `role` (enum: admin/instructor/student), `created_at`

**courses** — kursus yang diajarkan
- `id` (UUID, PK), `title`, `description`, `instructor_id` (FK → users.id), `created_at`

**lessons** — pelajaran dalam kursus
- `id` (UUID, PK), `course_id` (FK), `title`, `content` (TEXT markdown), `type` (enum: text/code), `order_index`, `starter_code` (nullable), `language` (nullable), `created_at`

**submissions** — kode yang dikirim mahasiswa
- `id` (UUID, PK), `lesson_id` (FK), `user_id` (FK), `code` (TEXT), `language`, `execution_output` (nullable), `status` (enum: pending/reviewed), `submitted_at`

**code_reviews** — hasil review AI atau instruktur
- `id` (UUID, PK), `submission_id` (FK, UNIQUE), `reviewer` (enum: ai/instructor), `summary`, `line_comments` (JSONB), `score`, `created_at`

**exercises** — soal latihan hasil generate AI
- `id` (UUID, PK), `lesson_id` (FK), `generated_by` (FK), `title`, `description`, `difficulty` (enum: easy/medium/hard), `starter_code` (nullable), `test_cases` (JSONB), `created_at`

### Role-Based Access Control (RBAC)

Tiga role dengan hierarki akses:

| Role | Akses |
|------|-------|
| **Admin** | Manajemen user, semua CRUD, setting sistem |
| **Instruktur** | CRUD course & lesson (milik sendiri), lihat submission, generate exercise |
| **Mahasiswa** | Lihat course & lesson, submit code, lihat review, chat AI tutor |

Implementasi middleware `authorize`:

```typescript
// middleware/rbac.ts
export function authorize(...roles: string[]) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        error: { code: 'FORBIDDEN', message: 'Tidak memiliki akses' },
      });
    }
    next();
  };
}

// Penggunaan di route
router.post('/courses', authenticate, authorize('admin', 'instructor'), courseController.create);
```

### JWT Auth dengan Refresh Token

Sistem autentikasi menggunakan dua token:

1. **Access Token**: Masa berlaku 15 menit. Dikirim di header `Authorization: Bearer <token>`. Digunakan untuk mengakses protected routes.
2. **Refresh Token**: Masa berlaku 7 hari. Disimpan di database (tabel `refresh_tokens`). Digunakan untuk mendapatkan access token baru.

Alur refresh token:
1. Client kirim refresh token ke `POST /api/auth/refresh`
2. Server verifikasi refresh token dari database
3. Jika valid, generate access token baru
4. Jika tidak valid (expired/blacklisted), suruh client login ulang

### Validasi Input dengan Zod

Gunakan Zod untuk validasi request body, query params, dan path params:

```typescript
import { z } from 'zod';

const createCourseSchema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter').max(200),
  description: z.string().min(10, 'Deskripsi minimal 10 karakter').optional(),
});

// Middleware validasi reusable
function validate(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      return res.status(400).json({
        status: 'error',
        error: { code: 'VALIDATION_ERROR', message: err.errors },
      });
    }
  };
}
```

## 🛠️ Latihan

### Latihan 1: Inisialisasi Proyek

Set up proyek dari nol:

1. Inisialisasi dengan `npm init -y`
2. Install dependencies: `express`, `typescript`, `tsx`, `@types/express`, `zod`, `bcrypt`, `jsonwebtoken`
3. Setup `tsconfig.json` dengan strict mode: `strict: true`, `noUnusedLocals: true`
4. Buat folder structure lengkap: `src/routes`, `src/middleware`, `src/db`, `src/services`, `src/agents`, `src/utils`
5. Buat entry point `src/index.ts` dengan Express server + health check endpoint
6. Setup Vitest untuk testing

**Kriteria sukses**: Server jalan di port 3000, `GET /api/health` return `{ status: 'ok' }`.

### Latihan 2: Database Schema & Migration

Implementasi schema database dengan Drizzle ORM:

1. Install `drizzle-orm`, `drizzle-kit`, `pg`, `@types/pg`
2. Definisi schema di `src/db/schema.ts`: users, courses, lessons, submissions, code_reviews, exercises
3. Generate migrasi dengan `drizzle-kit generate`
4. Buat seed data: 1 admin, 1 instruktur, 2 mahasiswa, 2 kursus, 4 lessons
5. Jalankan migrasi dan verifikasi dengan query langsung

**Kriteria sukses**: Semua tabel terbuat, foreign keys berfungsi, seed data bisa diquery.

### Latihan 3: Auth System dengan Refresh Token

Bangun autentikasi lengkap:

1. `POST /api/auth/register` — validasi input, hash password, simpan user (role default 'student')
2. `POST /api/auth/login` — verifikasi kredensial, generate access + refresh token
3. `POST /api/auth/refresh` — validasi refresh token dari DB, generate access token baru
4. `POST /api/auth/logout` — hapus refresh token dari DB (blacklist)
5. `GET /api/auth/me` — return profil user saat ini

**Kriteria sukses**: Register, login, refresh, logout berfungsi penuh. Token expired ditolak.

### Latihan 4: Role-Based Access Control

Implementasi RBAC middleware:

1. Buat middleware `authorize(...roles)` yang cek `req.user.role`
2. Terapkan di route: hanya admin bisa list semua users
3. Hanya instruktur dan admin bisa create/update/delete course
4. Hanya mahasiswa bisa submit code
5. Test semua role dengan integration test

**Kriteria sukses**: Setiap role hanya bisa mengakses endpoint sesuai wewenangnya.

### Latihan 5: CRUD Course & Lesson

Bangun API manajemen kursus dan pelajaran:

1. `GET /api/courses` — list kursus (public)
2. `POST /api/courses` — buat kursus (instructor/admin)
3. `GET /api/courses/:id` — detail kursus + lessons
4. `PUT /api/courses/:id` — update kursus (owner/admin)
5. `DELETE /api/courses/:id` — hapus kursus (admin only)
6. `POST /api/courses/:id/lessons` — buat lesson dalam kursus
7. `PUT /api/lessons/:id` — update lesson
8. `DELETE /api/lessons/:id` — hapus lesson

**Kriteria sukses**: CRUD course & lesson berfungsi, relasi terjaga, permission check berjalan.

### Latihan 6: Seeder & Data Dummy

Buat script seeder untuk development:

1. Seeder users: 2 admin, 3 instruktur, 10 mahasiswa
2. Seeder courses: 5 kursus dengan masing-masing 3-5 lessons
3. Seeder submissions: 20 submission dari berbagai mahasiswa
4. Gunakan pattern singleton untuk DB connection
5. Script bisa dijalankan dengan `npm run seed`

**Kriteria sukses**: Seeder berjalan tanpa error, data lengkap dan konsisten.

### Latihan 7: Integration Test Auth Flow

Tulis integration test untuk auth:

1. Test register dengan data valid → return 201 + token
2. Test register dengan email duplikat → return 409
3. Test login dengan password salah → return 401
4. Test akses protected route tanpa token → return 401
5. Test refresh token flow → access token baru valid
6. Test logout → refresh token tidak bisa dipakai lagi

**Kriteria sukses**: Semua test passing, coverage auth flow ≥80%.

## 📚 Referensi

- [Express.js Routing Guide](https://expressjs.com/en/guide/routing.html)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [JWT Best Practices](https://roadmap.sh/jwt)
- [Zod Validation Library](https://zod.dev)
- [Vitest Getting Started](https://vitest.dev/guide/)

---
**Capstone 5 — Sesi 1: Platform Design & Auth System.** Lanjut ke [Sesi 2: Content Delivery & Code Execution](02-content-delivery.md).
