# Sesi 1: Product Design & Q&A Core

> **Durasi**: 2 minggu (Sprint 1-2)
> **Fokus**: Fondasi backend, database schema, auth, dan CRUD Q&A inti

## 🎯 Tujuan Sesi

Setelah menyelesaikan sesi ini, mahasiswa mampu:

1. Merancang skema basis data relasional untuk sistem Q&A (users, questions, answers, tags, votes)
2. Membangun RESTful API dengan Express + TypeScript menggunakan layered architecture
3. Mengimplementasikan sistem autentikasi JWT lengkap dengan refresh token
4. Membangun CRUD pertanyaan dan jawaban dengan pagination, sorting, dan search
5. Mengimplementasikan sistem voting (upvote/downvote) dengan constraint unique
6. Mengelola relasi many-to-mant antara pertanyaan dan tag
7. Menulis integration test untuk endpoint Q&A inti

## 📋 Ringkasan Materi

### Arsitektur Proyek

Proyek Community Q&A menggunakan layered architecture dengan pemisahan tanggung jawab:

```
community-qa/
├── src/
│   ├── routes/           # Express route handlers
│   │   ├── auth.routes.ts
│   │   ├── question.routes.ts
│   │   ├── answer.routes.ts
│   │   ├── tag.routes.ts
│   │   ├── vote.routes.ts
│   │   ├── ai.routes.ts
│   │   └── notification.routes.ts
│   ├── middleware/       # Auth, RBAC, validation, error handler
│   ├── db/              # Schema, migration, seed
│   ├── services/        # Business logic layer
│   ├── agents/          # Mastra AI agent definitions
│   ├── utils/           # Helpers
│   └── index.ts         # Entry point
├── tests/
│   ├── unit/
│   └── integration/
├── Dockerfile
└── docker-compose.yml
```

### Database Schema

Sistem memiliki 7 tabel utama:

**users** — menyimpan pengguna dengan reputasi
- `id` (UUID PK), `username` (UNIQUE), `email` (UNIQUE), `password_hash`, `display_name`, `reputation` (INTEGER default 0), `created_at`, `updated_at`

**questions** — pertanyaan dari pengguna
- `id` (UUID PK), `title` (VARCHAR 300), `body` (TEXT), `author_id` (FK → users.id), `accepted_answer_id` (FK → answers.id, nullable), `view_count` (INTEGER default 0), `is_moderated` (BOOLEAN default false), `created_at`, `updated_at`

**answers** — jawaban untuk pertanyaan
- `id` (UUID PK), `body` (TEXT), `question_id` (FK → questions.id), `author_id` (FK → users.id), `is_accepted` (BOOLEAN default false), `is_moderated` (BOOLEAN default false), `created_at`, `updated_at`

**tags** — label untuk kategorisasi pertanyaan
- `id` (UUID PK), `name` (VARCHAR 50 UNIQUE), `description` (TEXT), `color` (VARCHAR 7), `created_at`

**question_tags** — relasi many-to-many
- `question_id` (FK), `tag_id` (FK), PK composite

**votes** — voting untuk pertanyaan dan jawaban
- `id` (UUID PK), `user_id` (FK), `target_type` (ENUM 'question'/'answer'), `target_id` (UUID), `value` (SMALLINT +1/-1), `created_at`
- UNIQUE constraint: (user_id, target_type, target_id) — cegah vote ganda

**notifications** — notifikasi in-app
- `id` (UUID PK), `user_id` (FK), `type` (ENUM 'new_answer'/'vote'/'accepted'/'moderated'), `message` (TEXT), `is_read` (BOOLEAN default false), `link` (VARCHAR 500), `created_at`

### Relasi Antar Tabel

```
User 1─N Question (author)
User 1─N Answer (author)
User 1─N Vote
Question 1─N Answer
Question N─M Tag (via question_tags)
Question 1─1 accepted_answer → Answer
User 1─N Notification
```

Unique constraint pada vote memastikan satu user hanya bisa vote satu kali per target. Jika user vote lagi, nilai vote diupdate (toggle upvote/downvote).

### JWT Authentication

Sistem menggunakan dua token:

- **Access Token**: 15 menit, dikirim di header `Authorization: Bearer <token>`
- **Refresh Token**: 7 hari, disimpan di database

Alur:
1. Register → hash password (bcrypt) → simpan user → return access + refresh token
2. Login → verifikasi password → generate token → return
3. Refresh → validasi refresh token dari DB → generate access token baru
4. Logout → hapus refresh token dari DB

### CRUD Questions

Endpoint pertanyaan:

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/questions | ✗ | List question (pagination, sort, search, filter tag) |
| GET | /api/questions/:id | ✗ | Detail question + answers |
| POST | /api/questions | ✓ | Buat pertanyaan baru (title, body, tagIds) |
| PATCH | /api/questions/:id | ✓ | Edit pertanyaan (author only) |
| DELETE | /api/questions/:id | ✓ | Hapus pertanyaan (author/admin) |

**Pagination**: `?page=1&limit=20` — default 20 items per page
**Sorting**: `?sort=newest` (default), `?sort=votes`, `?sort=active` (by last activity)
**Search**: `?q=keyword` — mencari di title dan body menggunakan ILIKE atau tsvector
**Filter tag**: `?tag=javascript` — filter pertanyaan dengan tag tertentu

### Voting System

Vote memiliki aturan bisnis ketat:

- **Upvote question**: +10 reputation untuk penulis pertanyaan
- **Downvote question**: -2 reputation untuk penulis pertanyaan
- **Upvote answer**: +10 reputation untuk penulis jawaban
- **Downvote answer**: -2 reputation untuk penulis jawaban
- **Accept answer**: +15 reputation untuk penulis jawaban
- **Cegah self-voting**: user tidak bisa vote pertanyaan/jawaban sendiri

```typescript
// services/vote.service.ts
async vote(userId: string, targetType: 'question' | 'answer', targetId: string, value: 1 | -1) {
  // Cek existing vote
  const existingVote = await db.query.votes.findFirst({
    where: and(
      eq(votes.userId, userId),
      eq(votes.targetType, targetType),
      eq(votes.targetId, targetId)
    ),
  });

  return await db.transaction(async (tx) => {
    if (existingVote) {
      if (existingVote.value === value) {
        // Toggle: hapus vote (unvote)
        await tx.delete(votes).where(eq(votes.id, existingVote.id));
        await this.updateReputation(targetType, targetId, -value);
        return { action: 'removed' };
      }
      // Update vote (switch upvote ↔ downvote)
      await tx.update(votes).set({ value }).where(eq(votes.id, existingVote.id));
      await this.updateReputation(targetType, targetId, value * 2);
      return { action: 'switched' };
    }

    // Vote baru
    await tx.insert(votes).values({ userId, targetType, targetId, value });
    await this.updateReputation(targetType, targetId, value);
    return { action: 'created' };
  });
}
```

### Search dengan PostgreSQL

Implementasi pencarian menggunakan full-text search:

```typescript
// services/question.service.ts
async searchQuestions(query: string) {
  return await db.query.questions.findMany({
    where: or(
      ilike(questions.title, `%${query}%`),
      ilike(questions.body, `%${query}%`),
    ),
    orderBy: [desc(questions.viewCount)],
    limit: 20,
  });
}
```

Untuk performa lebih baik, gunakan tsvector index:

```sql
ALTER TABLE questions ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('indonesian', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('indonesian', coalesce(body, '')), 'B')
  ) STORED;

CREATE INDEX idx_questions_search ON questions USING GIN(search_vector);
```

### Question Detail dengan View Count

```typescript
// routes/question.routes.ts
router.get('/questions/:id', async (req, res) => {
  const question = await db.transaction(async (tx) => {
    // Increment view count
    await tx.update(questions)
      .set({ viewCount: sql`view_count + 1` })
      .where(eq(questions.id, req.params.id));

    // Ambil detail + answers + tags
    return await tx.query.questions.findFirst({
      where: eq(questions.id, req.params.id),
      with: {
        author: { columns: { id: true, username: true, reputation: true } },
        tags: { with: { tag: true } },
        answers: {
          orderBy: [desc(answers.votesCount)],
          with: {
            author: { columns: { id: true, username: true, reputation: true } },
          },
        },
      },
    });
  });

  if (!question) throw new AppError(404, 'NOT_FOUND', 'Pertanyaan tidak ditemukan');
  res.json({ status: 'success', data: question });
});
```

### Sort Options untuk Question List

```typescript
type SortOption = 'newest' | 'votes' | 'active' | 'unanswered';

function getOrderBy(sort: SortOption) {
  switch (sort) {
    case 'newest': return [desc(questions.createdAt)];
    case 'votes': return [desc(questions.voteCount)];
    case 'active': return [desc(questions.updatedAt)];
    case 'unanswered': return [asc(questions.updatedAt)];
    default: return [desc(questions.createdAt)];
  }
}
```

Pilihan sorting membantu user menemukan pertanyaan yang relevan. Sort `unanswered` menampilkan pertanyaan tanpa jawaban diterima — berguna untuk kolaborasi komunitas.

## 🛠️ Latihan

### Latihan 1: Inisialisasi Proyek

Set up proyek TypeScript + Express:

1. Init `package.json`, install dependencies (express, typescript, tsx, zod, bcrypt, jsonwebtoken, drizzle-orm, pg)
2. Setup `tsconfig.json` strict mode
3. Buat struktur folder `src/` dengan subfolder lengkap
4. Setup Drizzle ORM dengan koneksi PostgreSQL
5. Buat entry point dengan health check endpoint

**Kriteria sukses**: Server jalan, health check return OK, koneksi database berhasil.

### Latihan 2: Schema Database & Migrasi

Implementasi semua tabel:

1. Definisi schema di `src/db/schema.ts`: users, questions, answers, tags, question_tags, votes, notifications
2. Generate migrasi dengan drizzle-kit
3. Buat script seed: 5 user, 10 tags, 20 questions, 40 answers, 50 votes
4. Tambahkan unique constraint pada vote (user_id, target_type, target_id)
5. Setup tsvector index untuk full-text search

**Kriteria sukses**: Semua tabel terbuat, constraint berfungsi, seed data bisa diquery.

### Latihan 3: Auth System

Bangun autentikasi lengkap:

1. `POST /api/auth/register` — validasi input, hash password, return JWT
2. `POST /api/auth/login` — verifikasi, return access + refresh token
3. `POST /api/auth/refresh` — refresh access token
4. `POST /api/auth/logout` — blacklist refresh token
5. `GET /api/users/me` — profil user saat ini
6. `PATCH /api/users/me` — update profil

**Kriteria sukses**: Auth flow lengkap berfungsi, refresh token bisa digunakan.

### Latihan 4: CRUD Questions & Search

Implementasi manajemen pertanyaan:

1. `GET /api/questions` — list dengan pagination, sorting (newest/votes/active), search by q, filter by tag
2. `GET /api/questions/:id` — detail + answers + tags, increment view_count
3. `POST /api/questions` — buat pertanyaan dengan tags
4. `PATCH /api/questions/:id` — edit (author only)
5. `DELETE /api/questions/:id` — hapus (author/admin)
6. Integrasi search dengan ILIKE atau tsvector

**Kriteria sukses**: CRUD berfungsi, pagination dan search bekerja.

### Latihan 5: CRUD Answers & Accept Answer

Implementasi manajemen jawaban:

1. `GET /api/questions/:id/answers` — list jawaban per pertanyaan (sorted by votes)
2. `POST /api/questions/:id/answers` — kirim jawaban
3. `PATCH /api/questions/:id/answers/:answerId` — edit jawaban (author only)
4. `DELETE /api/questions/:id/answers/:answerId` — hapus (author/admin)
5. `PATCH /api/questions/:id/answers/:answerId/accept` — tandai jawaban terbaik (question author only)

**Kriteria sukses**: CRUD jawaban berfungsi, accept answer mengupdate status.

### Latihan 6: Voting System

Implementasi voting:

1. `POST /api/votes` — vote question/answer (body: {targetType, targetId, value})
2. Cegah vote ganda dengan unique constraint
3. Toggle vote (upvote → unvote, upvote → downvote)
4. Update reputasi user berdasarkan vote
5. Cegah self-voting (user tidak bisa vote konten sendiri)

**Kriteria sukses**: Voting berfungsi, reputasi terupdate, vote ganda dicegah.

### Latihan 7: Integration Test Q&A

Tulis integration test:

1. Setup test database (gunakan database terpisah)
2. Test create question → muncul di list
3. Test search question by keyword
4. Test create answer → muncul di question detail
5. Test accept answer → status is_accepted = true
6. Test vote → reputasi berubah, vote ganda ditolak
7. Test unauthorized access → 401

**Kriteria sukses**: Semua test passing, coverage ≥60%.

### Latihan 8: Sorting & Filter Options

Perkaya query parameter:

1. Sorting: `?sort=votes` (by vote count), `?sort=active` (by last activity), `?sort=unanswered`
2. Multiple tag filter: `?tags=javascript,typescript` (OR logic)
3. Date range: `?from=2025-01-01&to=2025-12-31`
4. Status filter: `?status=unanswered` (pertanyaan tanpa accepted answer)
5. Response metadata: `X-Total-Count` header

**Kriteria sukses**: Semua opsi sorting dan filter berfungsi dengan benar.

### Latihan 9: Transaction & Data Consistency

Implementasi database transaction untuk operasi multi-step:

1. Bungkus create question + attach tags dalam satu transaction
2. Bungkus create vote + update reputation dalam satu transaction
3. Bungkus accept answer + update reputation penulis dalam satu transaction
4. Rollback semua perubahan jika salah satu langkah gagal
5. Test concurrent vote dari 2 user bersamaan

**Kriteria sukses**: Semua operasi multi-step atomic, tidak ada data inconsistent saat concurrent access.

### Latihan 10: Error Class & Consistent Response

Buat error handling terstruktur:

1. Class `AppError` dengan properti `statusCode`, `code`, `message`
2. Error codes spesifik: `VALIDATION_ERROR`, `NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`, `CONFLICT`
3. Consistent response format: `{ status, data, message, errors? }`
4. Async wrapper yang catch error otomatis: `asyncHandler(fn)`
5. Map error dari library (Zod, Drizzle) ke format AppError

**Kriteria sukses**: Semua response konsisten, error mapping berfungsi, tidak ada unhandled promise rejection.

## 📚 Referensi

- [Express.js Routing Guide](https://expressjs.com/en/guide/routing.html)
- [PostgreSQL Full-Text Search](https://www.postgresql.org/docs/current/textsearch.html)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Zod Validation](https://zod.dev)
- [Stack Overflow API Pattern](https://stackapps.com/)
- [PostgreSQL Transaction](https://www.postgresql.org/docs/current/tutorial-transactions.html)

---
**Capstone 6 — Sesi 1: Product Design & Q&A Core.** Lanjut ke [Sesi 2: Real-time Features & AI Integration](02-real-time-features.md).
