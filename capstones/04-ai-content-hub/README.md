# Capstone 4: AI Content Hub

> Platform manajemen konten blog & sosial media berbasis AI. Dikembangkan dengan **TypeScript, Express.js, Mastra AI, PostgreSQL**.

## 📋 Ringkasan Proyek

AI Content Hub adalah platform terintegrasi untuk pembuatan, pengelolaan, dan distribusi konten digital. Sistem memanfaatkan agen AI (Mastra) untuk mengotomatisasi tugas-tugas content creation: menulis artikel dari topik, merangkum konten panjang, menyarankan tag secara otomatis, dan menghasilkan postingan sosial media. Cocok untuk content creator, tim marketing, publisher — siapa pun yang perlu produksi konten berskala dengan bantuan AI.

### Masalah yang Diselesaikan

- Produksi konten manual lambat & mahal
- Ide artikel perlu riset & draf dari nol
- Tagging artikel inkonsisten antar penulis
- Butuh adaptasi konten ke format sosial media (Twitter, LinkedIn, Instagram)
- Ringkasan eksekutif untuk artikel panjang sering terlewat

### Solusi

- **AI Write Article** — tulis draf artikel dari topik + outline opsional via Mastra agent
- **AI Summarize** — rangkum artikel panjang jadi 3–5 kalimat
- **AI Auto-Tag** — ekstrak tag relevan dari konten artikel
- **AI Generate Social Media** — ubah artikel jadi postingan untuk Twitter, LinkedIn, Instagram
- Manajemen konten lengkap (CRUD artikel, tag, user)
- REST API dengan Express.js + TypeScript

---

## 🛠 Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Runtime** | Node.js 20+ |
| **Bahasa** | TypeScript 5.x |
| **Framework** | Express.js (dengan express-zod-api atau tRPC) |
| **AI Framework** | Mastra AI (agent + tools) |
| **Database** | PostgreSQL 16 |
| **ORM** | Drizzle ORM atau Prisma |
| **Auth** | JWT (jsonwebtoken + bcrypt) |
| **API Validation** | Zod |
| **Testing** | Vitest |
| **Container** | Docker + Docker Compose |

---

## 🎯 Learning Outcomes

Setelah menyelesaikan capstone ini, mahasiswa mampu:

1. **Merancang arsitektur API dengan Express + TypeScript** — route handlers, middleware, error handling, validasi Zod
2. **Mengintegrasikan AI Agent Framework (Mastra)** — definisi agent, tools, eksekusi task AI
3. **Mengelola data konten di PostgreSQL** — schema design, migration, query relasional
4. **Membangun workflow AI multi-tool** — orchestrate beberapa tool AI dalam satu agent
5. **Mengimplementasikan JWT auth** — register, login, protected routes
6. **Menulis automated test** — unit test untuk tools, integration test untuk endpoints
7. **Membuat batch & async operation** — generate postingan sosial media dalam satu request
8. **Deploy aplikasi dengan Docker** — multi-stage build, docker-compose

---

## 📅 Sprint Plan (4 × 2 minggu)

### Sprint 1: Foundation & Auth

**Goal**: API dasar berjalan + auth.

| Task | Detail |
|------|--------|
| Init project TS + Express | Struktur folder, tsconfig, ESLint, Vitest setup |
| Database schema | Migration: `users`, `articles`, `tags`, `content_suggestions` |
| Drizzle/Prisma setup | Schema definition, seed data dummy |
| Auth endpoints | `POST /api/auth/register`, `POST /api/auth/login` |
| JWT middleware | `authenticate` guard, error handler |
| Health check | `GET /api/health` |

**Deliverable**: API server running, auth working, database migrated.

---

### Sprint 2: Content CRUD & Tag Management

**Goal**: Manajemen artikel & tag penuh.

| Task | Detail |
|------|--------|
| Tag CRUD | `GET/POST/PUT/DELETE /api/tags` |
| Article CRUD | `GET/POST/PUT/DELETE /api/articles` |
| Filter & pagination | `?page=1&limit=10&tag=xyz`, sorting |
| Relasi article–tag | Many-to-many via junction table |
| Permission checks | Hanya pemilik artikel bisa edit/hapus |

**Deliverable**: Semua CRUD artikel & tag via API, terfilter & terpaginasi.

---

### Sprint 3: AI Integration with Mastra

**Goal**: Agen AI terintegrasi dengan 3 tools.

| Task | Detail |
|------|--------|
| Setup Mastra agent | Inisialisasi agent dengan LLM (OpenAI / Claude) |
| Tool: `writeArticle` | Generate artikel dari topic + outline (opsional) |
| Tool: `summarize` | Rangkum artikel → 3–5 kalimat |
| Tool: `generateSocialMedia` | Generate postingan Twitter + LinkedIn + Instagram |
| Tool: `autoTag` | Ekstrak 3–5 tag dari konten artikel |
| AI endpoint: `POST /api/ai/write` | Panggil agent writeArticle, simpan hasil |
| AI endpoint: `POST /api/ai/summarize` | Panggil agent summarize, update artikel |
| AI endpoint: `POST /api/ai/auto-tag` | Panggil agent autoTag, attach tags ke artikel |
| AI endpoint: `POST /api/ai/social` | Panggil agent generateSocialMedia, simpan suggestions |
| Error handling AI | Timeout, token limit, retry logic |

**Deliverable**: 4 AI endpoints functional, agent bisa jalankan 4 tools.

---

### Sprint 4: Polish, Test & Deploy

**Goal**: Testing, dokumentasi, deployment.

| Task | Detail |
|------|--------|
| Unit test AI tools | Mock LLM response, test tool logic |
| Integration test endpoints | Supertest + Vitest |
| Error handling polish | Consistent error response format |
| API documentation | OpenAPI/Swagger spec |
| Dockerfile | Multi-stage build |
| docker-compose.yml | app + db |
| README final | Dokumentasi setup & usage |
| Demo script | Skenario end-to-end |

**Deliverable**: Test coverage ≥70%, container running, dokumentasi lengkap.

---

## 📊 Data Model

### Entity Relationship

```
users 1──N articles
articles N──M tags
articles 1──N content_suggestions
```

### Tables

#### `users`

| Column | Type | Constraints |
|--------|------|------------|
| id | UUID | PK, default `gen_random_uuid()` |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| name | VARCHAR(100) | NOT NULL |
| created_at | TIMESTAMPTZ | NOT NULL, default NOW() |
| updated_at | TIMESTAMPTZ | NOT NULL, default NOW() |

#### `articles`

| Column | Type | Constraints |
|--------|------|------------|
| id | UUID | PK |
| user_id | UUID | FK → users.id, NOT NULL |
| title | VARCHAR(255) | NOT NULL |
| content | TEXT | NOT NULL |
| summary | TEXT | Nullable (diisi AI summarize) |
| status | VARCHAR(20) | DEFAULT 'draft' (draft / published) |
| created_at | TIMESTAMPTZ | NOT NULL |
| updated_at | TIMESTAMPTZ | NOT NULL |

#### `tags`

| Column | Type | Constraints |
|--------|------|------------|
| id | UUID | PK |
| name | VARCHAR(50) | UNIQUE, NOT NULL |
| created_at | TIMESTAMPTZ | NOT NULL |

#### `article_tags` (junction)

| Column | Type | Constraints |
|--------|------|------------|
| article_id | UUID | FK → articles.id |
| tag_id | UUID | FK → tags.id |
| PRIMARY KEY | (article_id, tag_id) | |

#### `content_suggestions`

| Column | Type | Constraints |
|--------|------|------------|
| id | UUID | PK |
| article_id | UUID | FK → articles.id |
| platform | VARCHAR(50) | NOT NULL (twitter / linkedin / instagram) |
| content | TEXT | NOT NULL |
| type | VARCHAR(20) | NOT NULL ('social_media') |
| created_at | TIMESTAMPTZ | NOT NULL |

---

## 🔌 API Endpoints

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register user baru |
| POST | `/api/auth/login` | ❌ | Login, return JWT |

### Articles

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/articles` | ✅ | List artikel user (pagination) |
| GET | `/api/articles/:id` | ✅ | Detail artikel + tags + suggestions |
| POST | `/api/articles` | ✅ | Buat artikel baru |
| PUT | `/api/articles/:id` | ✅ | Update artikel (owner only) |
| DELETE | `/api/articles/:id` | ✅ | Hapus artikel (owner only) |

### Tags

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/tags` | ✅ | List semua tags |
| POST | `/api/tags` | ✅ | Buat tag baru |
| DELETE | `/api/tags/:id` | ✅ | Hapus tag |

### AI

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/ai/write` | ✅ | Generate artikel dari topic |
| POST | `/api/ai/summarize` | ✅ | Rangkum artikel (:id) |
| POST | `/api/ai/auto-tag` | ✅ | Auto-tag artikel (:id) |
| POST | `/api/ai/social` | ✅ | Generate postingan sosial media |

### Request/Response Contoh

**POST /api/ai/write**
```json
{
  "topic": "Apa itu Mastra AI? Panduan untuk Developer",
  "outline": ["Pengertian Mastra", "Fitur utama", "Cara setup", "Contoh kode"]
}
```
```json
{
  "article": {
    "id": "uuid",
    "title": "Apa itu Mastra AI? Panduan untuk Developer",
    "content": "Mastra AI adalah framework untuk membangun agen AI...",
    "status": "draft"
  }
}
```

**POST /api/ai/social**
```json
{
  "article_id": "uuid"
}
```
```json
{
  "suggestions": [
    { "platform": "twitter", "content": "🧵 Mastra AI — framework agen AI baru... 🧵 1/5" },
    { "platform": "linkedin", "content": "Setelah bereksperimen dengan Mastra AI... 🚀" },
    { "platform": "instagram", "content": "📸 Slide 1: Mastra AI in 60 detik..." }
  ]
}
```

---

## 🤖 AI Integration Detail (Mastra)

### Arsitektur

```
Client → POST /api/ai/write → Express Route → Mastra Agent → LLM (OpenAI/Claude)
                                                          ↓
                                                    Tool: writeArticle
                                                    Tool: summarize
                                                    Tool: autoTag
                                                    Tool: generateSocialMedia
                                                          ↓
                                                    Response → client
```

### Mastra Agent Setup

```typescript
import { Agent } from '@mastra/core';
import { openai } from '@ai-sdk/openai';

export const contentAgent = new Agent({
  name: 'content-agent',
  instructions: `
    Kamu adalah asisten content creation AI.
    Tugasmu: menulis artikel, merangkum, menyarankan tag, dan generate postingan sosial media.
    Gunakan tools yang tersedia untuk setiap task.
  `,
  model: openai('gpt-4o'),
});
```

### Tool Definitions

#### `writeArticle`

| Property | Detail |
|----------|--------|
| **Nama** | `writeArticle` |
| **Input** | `topic: string`, `outline?: string[]` |
| **Output** | `{ title: string, content: string }` |
| **Deskripsi** | Generate artikel lengkap dari topik. Jika outline diberikan, struktur artikel mengikuti outline. Output dalam Bahasa Indonesia. |

#### `summarize`

| Property | Detail |
|----------|--------|
| **Nama** | `summarize` |
| **Input** | `content: string` (full artikel) |
| **Output** | `{ summary: string }` (3–5 kalimat) |
| **Deskripsi** | Rangkum artikel panjang jadi ringkasan eksekutif pendek. |

#### `autoTag`

| Property | Detail |
|----------|--------|
| **Nama** | `autoTag` |
| **Input** | `content: string` |
| **Output** | `{ tags: string[] }` (3–5 tag) |
| **Deskripsi** | Ekstrak tag relevan dari konten artikel. Tag harus kata/frasa pendek, lowercase. |

#### `generateSocialMedia`

| Property | Detail |
|----------|--------|
| **Nama** | `generateSocialMedia` |
| **Input** | `title: string`, `content: string`, `summary?: string` |
| **Output** | `{ twitter: string, linkedin: string, instagram: string }` |
| **Deskripsi** | Generate 3 varian postingan sosial media: Twitter (280 char), LinkedIn (professional tone), Instagram (visual + caption). |

### Alur Eksekusi Tools

```typescript
// Contoh penggunaan agent dengan tools
const result = await contentAgent.execute({
  task: 'generate social media posts',
  tools: [writeArticle, summarize, autoTag, generateSocialMedia],
  data: { /* input sesuai tool */ },
});
```

---

## ✅ Deliverables Checklist

| # | Item | Status |
|---|------|--------|
| 1 | Repository GitHub (monorepo TS) | ☐ |
| 2 | Database schema & migration | ☐ |
| 3 | Auth system (register, login, JWT) | ☐ |
| 4 | CRUD Articles (create, read, update, delete, pagination) | ☐ |
| 5 | CRUD Tags (create, read, delete) | ☐ |
| 6 | Relasi article–tags (many-to-many) | ☐ |
| 7 | AI Agent Mastra — 4 tools (writeArticle, summarize, autoTag, generateSocialMedia) | ☐ |
| 8 | 4 AI endpoints operational | ☐ |
| 9 | Content suggestions table & save social posts | ☐ |
| 10 | Error handling & validation (Zod) | ☐ |
| 11 | Unit test tools (Vitest) | ☐ |
| 12 | Integration test endpoints | ☐ |
| 13 | API docs (Swagger/OpenAPI) | ☐ |
| 14 | Dockerfile + docker-compose.yml | ☐ |
| 15 | README dokumentasi | ☐ |

---

## 📝 Evaluation Rubric

| Kriteria | Weight | 4 (Excellent) | 3 (Good) | 2 (Fair) | 1 (Poor) |
|----------|--------|---------------|----------|----------|----------|
| **Arsitektur API** | 15% | Express routes terstruktur, middleware reusable, error handling sentral | Routes rapi, minor duplikasi | Routes campur aduk, error handling spotty | Tidak terstruktur |
| **Database Design** | 10% | Normalized, migration clean, indexing tepat | Normalized, minor missing index | Denormalized, migration manual | Tidak pakai migration |
| **Auth & Security** | 10% | JWT + refresh token, bcrypt, middleware guard | JWT validasi, minor celah | Auth ada tapi bocor | Tidak ada auth |
| **AI Integration** | 25% | 4 tools berfungsi, error handling AI (timeout, retry), output berkualitas | 3 tools berfungsi, error handling basic | 2 tools berfungsi | < 2 tools |
| **Testing** | 15% | Coverage ≥70%, unit + integration, mock LLM | Coverage ≥50%, test ada | Coverage <30% | Tidak ada test |
| **Code Quality** | 10% | TypeScript strict, lint clean, no any, consistent naming | TS strict, minor lint | TS loose, banyak lint error | JS tanpa tipe |
| **Dokumentasi** | 10% | README lengkap, API docs, setup guide, demo script | README ada, missing setup detail | READMINIMAL | Tidak ada |
| **Deployment** | 5% | Docker multi-stage, compose, healthcheck | Docker compose jalan | Dockerfile doang | Tidak ada |

### Nilai Akhir

- **A**: ≥85
- **B**: 70–84
- **C**: 55–69
- **D**: 40–54
- **E**: <40

---

## 📁 Struktur Folder (Recommended)

```
ai-content-hub/
├── src/
│   ├── agents/           # Mastra agent definition
│   │   ├── content.agent.ts
│   │   └── tools/
│   │       ├── write-article.tool.ts
│   │       ├── summarize.tool.ts
│   │       ├── auto-tag.tool.ts
│   │       └── generate-social.tool.ts
│   ├── routes/           # Express route handlers
│   │   ├── auth.router.ts
│   │   ├── article.router.ts
│   │   ├── tag.router.ts
│   │   └── ai.router.ts
│   ├── middleware/       # auth, error handler, validation
│   ├── db/              # schema, migration, seed
│   ├── services/        # Business logic (article service, ai service)
│   ├── utils/           # Helpers
│   └── index.ts         # Entry point
├── tests/
│   ├── unit/
│   └── integration/
├── docker/
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── README.md
```

---

## 💡 Tips & Referensi

- **Mastra Docs**: https://mastra.ai/docs
- **Express + TS**: https://expressjs.com/en/guide/writing-middleware.html
- **Drizzle ORM**: https://orm.drizzle.team
- **JWT Auth Pattern**: Gunakan middleware `authenticate` yang parse header `Authorization: Bearer <token>`
- **AI Prompting**: Gunakan Bahasa Indonesia untuk prompt tools. Kasih contoh output format biar konsisten.
- **Error Handling AI**: LLM bisa timeout atau return invalid JSON. Selalu wrap tool call di try/catch.
- **Rate Limiting**: Tambahkan express-rate-limit untuk AI endpoints (biaya API).

---

> **Capstone 4 — AI Content Hub.** Dibangun dengan TypeScript, Express, Mastra, dan PostgreSQL. Fokus utama: integrasi agen AI multi-tool untuk otomatisasi konten digital.
