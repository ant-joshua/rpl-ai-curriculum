# Capstone 6 — Community Q&A Platform

## 1. Gambaran Umum (Overview)

Membangun forum tanya-jawab komunitas bergaya Stack Overflow. Pengguna dapat mengajukan pertanyaan, memberikan jawaban, memberi vote, dan menandai konten. Sistem terintegrasi **AI agent (Mastra)** untuk tiga fitur cerdas: **suggestAnswer** — memberikan saran jawaban otomatis saat pertanyaan baru masuk berdasarkan basis pengetahuan internal; **autoTag** — menyarankan/menambahkan tag secara otomatis berdasarkan isi pertanyaan; **moderateContent** — mendeteksi konten toxic/offensive dan memberi peringatan moderasi.

Proyek dikerjakan dalam **4 sprint × 2 minggu (total 8 minggu)** secara individu atau tim 2-3 orang.

---

## 2. Tech Stack

| Layer | Teknologi |
|---|---|
| Runtime | Node.js 20+ (TypeScript 5.x) |
| Framework Backend | Express.js + Zod validation |
| AI Agent Framework | **Mastra** (https://mastra.ai) — agent dengan tools kustom |
| Database | PostgreSQL 15+ |
| ORM | Drizzle ORM atau Prisma |
| Auth | JWT (access + refresh token) |
| File Storage | Local filesystem (produksi: S3-compatible) |
| Testing | Vitest + Supertest (API), Playwright (E2E) |
| Container | Docker + docker-compose (PostgreSQL + app) |
| CI/CD | GitHub Actions (lint, test, build) |

---

## 3. Capaian Pembelajaran (Learning Outcomes)

Setelah menyelesaikan capstone ini, mahasiswa mampu:

1. **Merancang** skema basis data relasional untuk sistem Q&A (users, questions, answers, tags, votes).
2. **Membangun** RESTful API dengan Express + TypeScript menggunakan pola layered architecture (routes, controllers, services, repositories).
3. **Mengimplementasikan** sistem autentikasi JWT lengkap dengan refresh token.
4. **Mengintegrasikan** Mastra agent dengan tools kustom (suggestAnswer, autoTag, moderateContent).
5. **Menulis** test otomatis (unit, integrasi, E2E) dengan cakupan ≥70%.
6. **Menerapkan** content moderation berbasis AI untuk menyaring konten toxic.
7. **Mengelola** state voting dan reputasi pengguna secara konsisten di database.
8. **Mendeploy** aplikasi dengan Docker dan CI pipeline.

---

## 4. Fitur per Sprint (4 × 2 Minggu)

### Sprint 1: Fondasi & Auth

- Init proyek TypeScript + Express + folder structure.
- Setup PostgreSQL + Drizzle/Prisma schema (users, tags).
- Auth: register, login, refresh token, logout (JWT).
- API user profile (GET /api/users/me, PATCH /api/users/me).
- Setup Mastra agent dasar — satu tool hello-world untuk verifikasi integrasi.
- Dockerfile + docker-compose (app + db).
- **Deliverable:** API auth berfungsi penuh, docker-compose up siap.

### Sprint 2: Q&A Inti

- Schema: questions, answers, votes.
- CRUD pertanyaan (POST/GET/PUT/DELETE /api/questions).
- CRUD jawaban (POST/GET/PUT/DELETE /api/questions/:id/answers).
- Pilih jawaban terbaik (PATCH /api/questions/:id/answers/:answerId/accept).
- Voting (POST /api/votes) — upvote/downvote untuk pertanyaan & jawaban.
- Pagination, sorting (by date, votes, active).
- Search pertanyaan by judul/tag (LIKE / tsvector).
- **Deliverable:** Semua endpoint Q&A berfungsi, voting konsisten.

### Sprint 3: AI Integration dengan Mastra

- Setup Mastra agent dengan 3 tools kustom:
  - **suggestAnswer(questionTitle, questionBody, existingAnswers[])** → menganalisis pertanyaan + jawaban teratas lalu menghasilkan saran jawaban baru via LLM call.
  - **autoTag(questionTitle, questionBody, availableTags[])** → memilih 1-3 tag paling relevan dari daftar tag yang ada.
  - **moderateContent(text)** → mengembalikan { isToxic: boolean, reasons: string[], confidence: number }.
- Endpoint: POST /api/ai/suggest-answer, POST /api/ai/auto-tag.
- Middleware moderasi: saat POST question/answer, otomatis panggil moderateContent. Jika toksik, simpan dengan flag is_moderated=true + kirim notifikasi ke user + admin.
- **Deliverable:** Agent Mastra siap, 3 tools berfungsi, moderasi otomatis aktif.

### Sprint 4: Finalisasi & Deployment

- Dashboard user: daftar pertanyaan, jawaban, reputasi.
- Reputation system: upvote (+10), downvote (−2), answer accepted (+15).
- Notifikasi (in-app): ketika pertanyaan dijawab, jawaban di-vote, konten dimoderasi.
- Error handling global + logging (morgan + custom logger).
- Rate limiting (express-rate-limit) + helmet.
- Tests: ≥70% coverage (unit + integrasi).
- E2E: 2 skenario kritis (register → tanya → jawab → vote; create pertanyaan → AI suggest answer).
- Dokumentasi API (Swagger/OpenAPI).
- CI: lint → test → build di GitHub Actions.
- **Deliverable:** Aplikasi siap deploy, coverage ≥70%, CI hijau.

---

## 5. Model Data (Data Model)

### entities

```
User
  id            UUID  PK
  username      VARCHAR(50) UNIQUE
  email         VARCHAR(255) UNIQUE
  password_hash VARCHAR(255)
  display_name  VARCHAR(100)
  reputation    INTEGER  DEFAULT 0
  created_at    TIMESTAMPTZ
  updated_at    TIMESTAMPTZ

Question
  id            UUID  PK
  title         VARCHAR(300)
  body          TEXT
  author_id     UUID  FK → User.id
  accepted_answer_id UUID? FK → Answer.id
  view_count    INTEGER DEFAULT 0
  is_moderated  BOOLEAN DEFAULT false
  created_at    TIMESTAMPTZ
  updated_at    TIMESTAMPTZ

Answer
  id            UUID  PK
  body          TEXT
  question_id   UUID  FK → Question.id
  author_id     UUID  FK → User.id
  is_accepted   BOOLEAN DEFAULT false
  is_moderated  BOOLEAN DEFAULT false
  created_at    TIMESTAMPTZ
  updated_at    TIMESTAMPTZ

Tag
  id            UUID  PK
  name          VARCHAR(50) UNIQUE
  description   TEXT
  color         VARCHAR(7)  — hex color
  created_at    TIMESTAMPTZ

QuestionTag
  question_id   UUID  FK → Question.id
  tag_id        UUID  FK → Tag.id
  PK(question_id, tag_id)

Vote
  id            UUID  PK
  user_id       UUID  FK → User.id
  target_type   ENUM('question','answer')
  target_id     UUID  — question_id atau answer_id
  value         SMALLINT  — +1 (upvote) / -1 (downvote)
  created_at    TIMESTAMPTZ
  UNIQUE(user_id, target_type, target_id)

Notification
  id            UUID  PK
  user_id       UUID  FK → User.id
  type          ENUM('new_answer','vote','accepted','moderated')
  message       TEXT
  is_read       BOOLEAN DEFAULT false
  link          VARCHAR(500) — URL ke entitas terkait
  created_at    TIMESTAMPTZ
```

### Relasi

- User 1─N Question (author)
- User 1─N Answer (author)
- User 1─N Vote
- Question 1─N Answer
- Question N─M Tag (melalui QuestionTag)
- Question 1─1 accepted_answer → Answer
- User 1─N Notification

---

## 6. Tabel API Endpoints

| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| POST | /api/auth/register | Registrasi user | ✗ |
| POST | /api/auth/login | Login → access + refresh token | ✗ |
| POST | /api/auth/refresh | Refresh access token | ✗ |
| POST | /api/auth/logout | Blacklist refresh token | ✓ |
| GET | /api/users/me | Profil user sendiri | ✓ |
| PATCH | /api/users/me | Update profil | ✓ |
| GET | /api/questions | List question (pagination, sort, search, filter tag) | ✗ |
| GET | /api/questions/:id | Detail question + answers | ✗ |
| POST | /api/questions | Buat pertanyaan baru | ✓ |
| PATCH | /api/questions/:id | Edit pertanyaan (author only) | ✓ |
| DELETE | /api/questions/:id | Hapus pertanyaan (author/admin) | ✓ |
| GET | /api/questions/:id/answers | List jawaban untuk question | ✗ |
| POST | /api/questions/:id/answers | Kirim jawaban | ✓ |
| PATCH | /api/questions/:id/answers/:answerId | Edit jawaban | ✓ |
| DELETE | /api/questions/:id/answers/:answerId | Hapus jawaban | ✓ |
| PATCH | /api/questions/:id/answers/:answerId/accept | Terima jawaban (question author only) | ✓ |
| POST | /api/votes | Vote (+1/-1) question/answer | ✓ |
| GET | /api/tags | List semua tags | ✗ |
| POST | /api/tags | Buat tag baru | ✓ (admin) |
| POST | /api/ai/suggest-answer | AI suggest answer | ✓ |
| POST | /api/ai/auto-tag | AI auto-tagging | ✓ |
| GET | /api/users/:id/questions | Questions by user | ✗ |
| GET | /api/users/:id/answers | Answers by user | ✗ |
| GET | /api/notifications | Notifikasi user | ✓ |
| PATCH | /api/notifications/:id/read | Tandai notifikasi terbaca | ✓ |

---

## 7. Detail Integrasi AI (Mastra Agent)

### Arsitektur Agent

```
┌─────────────────────────────────────┐
│         Mastra Agent                │
│  ┌───────────────────────────────┐  │
│  │  Tools                         │  │
│  │  ├─ suggestAnswer              │  │
│  │  ├─ autoTag                   │  │
│  │  └─ moderateContent            │  │
│  └───────────────────────────────┘  │
│  Backend: LLM (OpenAI / Anthropic)   │
│  Memory: Semantic (opsional)        │
└─────────────────────────────────────┘
         ▲
         │ HTTP (REST)
         │
┌─────────┴──────────────┐
│   Express REST API     │
└────────────────────────┘
```

### Tools Detail

**1. suggestAnswer**
- Input: `questionTitle: string`, `questionBody: string`, `existingAnswers: string[]`
- Proses: Agent menerima prompt → menganalisis pertanyaan + jawaban yang sudah ada → menghasilkan saran jawaban baru yang tidak redundan.
- Output: `{ answerSuggestion: string, confidence: number }`
- Dipicu dari: POST /api/ai/suggest-answer (opsional, manual oleh user).

**2. autoTag**
- Input: `questionTitle: string`, `questionBody: string`, `availableTags: { id: string, name: string }[]`
- Proses: Agent membaca isi pertanyaan → memilih 1-3 tag paling relevan dari availableTags. Bisa juga menyarankan tag baru jika tidak ada yang cocok.
- Output: `{ suggestedTags: string[], newTagSuggestions?: string[] }`
- Dipicu dari: POST /api/ai/auto-tag (manual) atau otomatis saat POST /api/questions.

**3. moderateContent**
- Input: `text: string`
- Proses: Agent menganalisis teks untuk toksisitas (kebencian, pelecehan, spam).
- Output: `{ isToxic: boolean, reasons: string[], confidence: number }`
- Dipicu dari: middleware Express — setiap POST/PUT question dan answer melewati middleware yang memanggil tool ini. Jika toxic → flag is_moderated = true, notifikasi user + admin.

### Contoh Kode Mastra Agent (pseudo)

```typescript
import { Agent, Tool } from '@mastra/core';

const suggestAnswerTool: Tool = {
  name: 'suggestAnswer',
  description: 'Generate answer suggestion for a question',
  inputSchema: {
    type: 'object',
    properties: {
      questionTitle: { type: 'string' },
      questionBody: { type: 'string' },
      existingAnswers: { type: 'array', items: { type: 'string' } },
    },
  },
  execute: async ({ input }) => {
    // LLM call via Mastra internal LLM
    const response = await agent.llm.generate(/* prompt */);
    return { answerSuggestion: response.text, confidence: 0.85 };
  },
};

const agent = new Agent({
  name: 'qa-assistant',
  instructions: 'You are a helpful Q&A assistant...',
  tools: [suggestAnswerTool, autoTagTool, moderateContentTool],
  llm: 'openai:gpt-4o', // atau 'anthropic:claude-3'
});

export { agent };
```

---

## 8. Checklist Deliverables

### Wajib (Minimum Viable Product)
- [ ] Aplikasi berjalan dengan docker-compose up.
- [ ] Register, login, refresh token berfungsi penuh.
- [ ] CRUD pertanyaan + pagination + search.
- [ ] CRUD jawaban + pilih jawaban terbaik.
- [ ] Voting (upvote/downvote) + cegah vote ganda.
- [ ] Tags: CRUD + assign ke pertanyaan.
- [ ] Mastra agent terintegrasi dengan minimal 2 tools (suggestAnswer + moderateContent).
- [ ] Moderasi konten otomatis: pertanyaan/jawaban toxic masuk moderasi.
- [ ] Test coverage ≥70% (unit + integration).
- [ ] CI pipeline (GitHub Actions) hijau: lint → test → build.
- [ ] Dokumentasi API (Swagger / OpenAPI 3.0).

### Opsional (Nilai Tambah)
- [ ] Reputation system + trigger.
- [ ] Notifikasi in-app realtime (SSE atau WebSocket).
- [ ] Auto-tagging pada POST question.
- [ ] Admin dashboard untuk review konten termoderasi.
- [ ] E2E test Playwright (2 skenario).
- [ ] Deploy ke VPS / cloud (Railway, Render, atau VPS).
- [ ] Dark mode UI (jika ada frontend).

---

## 9. Rubrik Evaluasi

| Kriteria | Bobot | 0-30 (Kurang) | 40-60 (Cukup) | 70-85 (Baik) | 86-100 (Sangat Baik) |
|---|---|---|---|---|---|
| **Fungsionalitas API** | 25% | Endpoint <50% berjalan | 50-70% endpoint OK, ada bug major | Semua endpoint berjalan, minor bug | Semua endpoint berjalan + edge case tertangani |
| **AI Integration (Mastra)** | 25% | Agent tidak terintegrasi | Terintegrasi, 1 tool berfungsi sebagian | 2 tools berfungsi penuh | 3 tools berfungsi + middleware moderasi aktif |
| **Database & Data Integrity** | 15% | Skema tidak normal | Normalisasi dasar, foreign key kurang | Normal 3NF, constraint lengkap | Plus constraint unik vote, trigger reputasi |
| **Testing** | 15% | Coverage <30% | 30-50% | 50-70% | ≥70% + E2E |
| **Code Quality & Arsitektur** | 10% | Semua di satu file | Layered separation ada, tidak konsisten | Layered architecture konsisten, error handling baik | Clean architecture + dependency injection pattern |
| **Deployment & CI/CD** | 10% | Tidak ada | Docker atau CI saja | Docker + CI berjalan | Docker + CI + deploy ke cloud |

**Nilai Akhir** = Σ(Bobot × Skor) / 100. Minimal lulus: 65.

### Kriteria Tambahan (Bonus)
- Reputation system: +5 poin.
- Realtime notification (SSE/WS): +5 poin.
- Auto-tagging otomatis di POST question: +5 poin.
- Deploy ke public URL: +5 poin.
- Maksimum bonus: 15 poin (tidak melebihi 100).

---

## 10. Referensi

- Mastra Docs: https://mastra.ai/docs
- Express.js: https://expressjs.com
- Drizzle ORM: https://orm.drizzle.team
- JWT Auth best practices: https://roadmap.sh/jwt
- OpenAI API: https://platform.openai.com
- Contoh Stack Overflow clone open-source: https://github.com/link/to/example (opsional)

---

*Dokumen ini adalah bagian dari kurikulum RPL AI — Capstone 6. Revisi: Juli 2026.*
