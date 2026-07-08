# Capstone 4: AI Content Hub

> Platform manajemen konten blog & sosial media berbasis AI. Dikembangkan dengan **TypeScript, Next.js, Express.js, Mastra AI, PostgreSQL**.

---

## 📚 Sesi Pembelajaran

Capstone ini dibagi menjadi 3 sesi. Mulai dari content model, frontend CMS & editor, hingga AI features dan deployment.

| Sesi | Deskripsi | Durasi |
|------|-----------|--------|
| [01 — Content Model & Arsitektur](01-content-model.md) | Headless CMS design, Prisma schema, AI tools (writeArticle, summarize, autoTag, generateSocialMedia), Mastra agent | 2 minggu |
| [02 — Frontend & CMS Dashboard](02-frontend-cms.md) | Next.js dashboard, article editor (markdown), media management, tag CRUD, article list with filter | 4 minggu |
| [03 — AI Features & Deployment](03-ai-features-deploy.md) | AI writing assistant panel, SEO metadata & JSON-LD, Docker deploy, analytics dashboard | 2 minggu |

---

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
- REST API dengan Express.js + TypeScript + Next.js frontend

---

## 🛠 Tech Stack

| Layer | Teknologi |
|---|---|
| **Runtime** | Node.js 20+ |
| **Bahasa** | TypeScript 5.x |
| **Frontend** | Next.js (App Router) + Tailwind CSS |
| **Backend** | Express.js (modular monolith) |
| **AI Framework** | Mastra AI (agent + tools) |
| **Database** | PostgreSQL 16 |
| **ORM** | Prisma |
| **Auth** | NextAuth.js (JWT + credentials) |
| **API Validation** | Zod |
| **Testing** | Vitest |
| **Container** | Docker + Docker Compose |

---

## 🎯 Learning Outcomes

Setelah menyelesaikan capstone ini, mahasiswa mampu:

1. **Merancang arsitektur headless CMS** dengan Express API terstruktur dan Prisma ORM.
2. **Mengintegrasikan AI Agent Framework (Mastra)** — definisi agent, 4 tools kustom, eksekusi task AI.
3. **Mengelola data konten di PostgreSQL** — schema design dengan relasi many-to-many (article-tags).
4. **Membangun workflow AI multi-tool** — orchestrate 4 tools dalam satu agent untuk content pipeline.
5. **Mengimplementasikan JWT auth dengan NextAuth.js** — register, login, protected routes.
6. **Menulis automated test** — unit test untuk tools, integration test untuk endpoints.
7. **Membuat frontend CMS dashboard** — editor artikel markdown, media gallery, tag management.
8. **Mengoptimalkan SEO** — metadata, Open Graph, JSON-LD structured data, sitemap.xml.
9. **Mendeploy aplikasi dengan Docker multi-stage** — ke Vercel + Railway.
10. **Menganalisis konten** — view tracking, analytics dashboard, top articles.

---

## 📅 Sprint Plan (4 × 2 minggu)

### Sprint 1: Foundation & Auth

**Goal**: API dasar berjalan + auth.

| Task | Detail |
|---|---|
| Init project TS + Express | Struktur folder, tsconfig, ESLint, Vitest setup |
| Database schema | Migration: `users`, `articles`, `tags`, `content_suggestions` |
| Prisma setup | Schema definition, seed data dummy |
| Auth endpoints | `POST /api/auth/register`, `POST /api/auth/login` |
| JWT middleware | `authenticate` guard, error handler |
| Health check | `GET /api/health` |

**Deliverable**: API server running, auth working, database migrated.

---

### Sprint 2: Content CRUD & Tag Management

**Goal**: Manajemen artikel & tag penuh.

| Task | Detail |
|---|---|
| Tag CRUD | `GET/POST/PUT/DELETE /api/tags` |
| Article CRUD | `GET/POST/PUT/DELETE /api/articles` |
| Filter & pagination | `?page=1&limit=10&tag=xyz`, sorting |
| Relasi article–tag | Many-to-many via junction table |
| Permission checks | Hanya pemilik artikel bisa edit/hapus |

**Deliverable**: Semua CRUD artikel & tag via API, terfilter & terpaginasi.

---

### Sprint 3: AI Integration with Mastra

**Goal**: Agen AI terintegrasi dengan 4 tools.

| Task | Detail |
|---|---|
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

**Goal**: Testing, SEO, dokumentasi, deployment.

| Task | Detail |
|---|---|
| Unit test AI tools | Mock LLM response, test tool logic |
| Integration test endpoints | Supertest + Vitest |
| SEO optimization | Metadata, OG, JSON-LD, sitemap |
| AI Writing Panel | Komponen React untuk aksi AI di editor |
| Analytics | View tracking, dashboard chart |
| Dockerfile | Multi-stage build |
| docker-compose.yml | app + db |
| README final | Dokumentasi setup & usage |
| Demo script | Skenario end-to-end |

**Deliverable**: Test coverage ≥70%, container running, SEO optimized, dokumentasi lengkap.

---

## 📊 Data Model

### Entity Relationship

```
users 1──N articles
articles N──M tags (via article_tags)
articles 1──N content_suggestions
users 1──N media
```

### Tables

#### `users`

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, default `gen_random_uuid()` |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| name | VARCHAR(100) | NOT NULL |
| created_at | TIMESTAMPTZ | NOT NULL, default NOW() |
| updated_at | TIMESTAMPTZ | NOT NULL, default NOW() |

#### `articles`

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users.id, NOT NULL |
| title | VARCHAR(255) | NOT NULL |
| content | TEXT | NOT NULL (markdown) |
| summary | TEXT | Nullable (diisi AI summarize) |
| slug | VARCHAR(255) | UNIQUE, NOT NULL |
| status | VARCHAR(20) | DEFAULT 'draft' (draft / published / archived) |
| featured_image | TEXT | Nullable |
| view_count | INTEGER | DEFAULT 0 |
| created_at | TIMESTAMPTZ | NOT NULL |
| updated_at | TIMESTAMPTZ | NOT NULL |

#### `tags`

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| name | VARCHAR(50) | UNIQUE, NOT NULL |
| created_at | TIMESTAMPTZ | NOT NULL |

#### `article_tags` (junction)

| Column | Type | Constraints |
|---|---|---|
| article_id | UUID | FK → articles.id |
| tag_id | UUID | FK → tags.id |
| PRIMARY KEY | (article_id, tag_id) | |

#### `content_suggestions`

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| article_id | UUID | FK → articles.id |
| platform | VARCHAR(50) | NOT NULL (twitter / linkedin / instagram) |
| content | TEXT | NOT NULL |
| type | VARCHAR(20) | NOT NULL ('social_media') |
| created_at | TIMESTAMPTZ | NOT NULL |

#### `media`

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users.id |
| filename | VARCHAR(255) | NOT NULL |
| mime_type | VARCHAR(50) | NOT NULL |
| size | INTEGER | NOT NULL (bytes) |
| url | TEXT | NOT NULL |
| created_at | TIMESTAMPTZ | NOT NULL |

---

## 🔌 API Endpoints

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Register user baru |
| POST | `/api/auth/login` | ❌ | Login, return JWT |

### Articles

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/articles` | ✅ | List artikel user (pagination, filter) |
| GET | `/api/articles/:id` | ✅ | Detail artikel + tags + suggestions |
| POST | `/api/articles` | ✅ | Buat artikel baru |
| PUT | `/api/articles/:id` | ✅ | Update artikel (owner only) |
| DELETE | `/api/articles/:id` | ✅ | Hapus artikel (owner only) |

### Tags

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/tags` | ✅ | List semua tags |
| POST | `/api/tags` | ✅ | Buat tag baru |
| DELETE | `/api/tags/:id` | ✅ | Hapus tag |

### Media

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/media/upload` | ✅ | Upload file (multer) |
| GET | `/api/media` | ✅ | List media user |

### AI

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/ai/write` | ✅ | Generate artikel dari topic |
| POST | `/api/ai/summarize` | ✅ | Rangkum artikel (:id) |
| POST | `/api/ai/auto-tag` | ✅ | Auto-tag artikel |
| POST | `/api/ai/social` | ✅ | Generate postingan sosial media |

---

## ✅ Deliverables Checklist

| # | Item | Status |
|---|---|---|
| 1 | Repository GitHub (Next.js + Express monorepo) | ☐ |
| 2 | Database schema & migration (Prisma) | ☐ |
| 3 | Auth system (register, login, NextAuth) | ☐ |
| 4 | CRUD Articles (create, read, update, delete, pagination) | ☐ |
| 5 | CRUD Tags (create, read, delete) | ☐ |
| 6 | Relasi article–tags (many-to-many) | ☐ |
| 7 | AI Agent Mastra — 4 tools (writeArticle, summarize, autoTag, generateSocialMedia) | ☐ |
| 8 | 4 AI endpoints operational | ☐ |
| 9 | Content suggestions table & save social posts | ☐ |
| 10 | Media upload & gallery | ☐ |
| 11 | SEO: metadata, OG tags, JSON-LD, sitemap | ☐ |
| 12 | Analytics: view tracking, dashboard | ☐ |
| 13 | Error handling & validation (Zod) | ☐ |
| 14 | Unit test tools (Vitest) | ☐ |
| 15 | Integration test endpoints | ☐ |
| 16 | Dockerfile + docker-compose.yml | ☐ |
| 17 | README dokumentasi | ☐ |

---

## 📝 Evaluation Rubric

| Kriteria | Weight | 4 (Excellent) | 3 (Good) | 2 (Fair) | 1 (Poor) |
|---|---|---|---|---|---|
| **Arsitektur API** | 10% | Express routes terstruktur, middleware reusable, error handling sentral | Routes rapi, minor duplikasi | Routes campur aduk, error handling spotty | Tidak terstruktur |
| **Database Design** | 10% | Normalized, migration clean, indexing tepat | Normalized, minor missing index | Denormalized, migration manual | Tidak pakai migration |
| **Frontend CMS** | 15% | Dashboard rapi, editor fungsional, media gallery, preview mode | Dashboard fungsional, editor ada | Beberapa halaman error | Frontend tidak ada |
| **AI Integration** | 25% | 4 tools berfungsi, error handling AI (timeout, retry), output berkualitas | 3 tools berfungsi, error handling basic | 2 tools berfungsi | < 2 tools |
| **SEO & Analytics** | 10% | Metadata + OG + JSON-LD + sitemap + analytics dashboard | Metadata + OG + sitemap | Metadata minimal | Tidak ada |
| **Testing** | 10% | Coverage ≥70%, unit + integration, mock LLM | Coverage ≥50%, test ada | Coverage <30% | Tidak ada test |
| **Dokumentasi** | 10% | README lengkap, API docs, setup guide, demo script | README ada, missing setup detail | README minimal | Tidak ada |
| **Deployment** | 10% | Docker multi-stage, compose, healthcheck, CI/CD | Docker compose jalan | Dockerfile doang | Tidak ada |

### Nilai Akhir

- **A**: ≥85
- **B**: 70–84
- **C**: 55–69
- **D**: 40–54
- **E**: <40

---

## 💡 Tips & Referensi

- **Mastra Docs**: https://mastra.ai/docs
- **Next.js App Router**: https://nextjs.org/docs/app
- **Prisma ORM**: https://www.prisma.io/docs
- **SEO Testing**: Gunakan Google Rich Results Test dan Lighthouse.
- **AI Prompting**: Gunakan Bahasa Indonesia untuk prompt tools. Kasih contoh output format biar konsisten.
- **Error Handling AI**: LLM bisa timeout atau return invalid JSON. Selalu wrap tool call di try/catch.
- **Rate Limiting**: Tambahkan express-rate-limit untuk AI endpoints (biaya API).

---

| [Sesi 1: Content Model](01-content-model.md) | [Sesi 2: Frontend & CMS](02-frontend-cms.md) | [Sesi 3: AI & Deploy](03-ai-features-deploy.md) |
|---|---|---|

> **Capstone 4 — AI Content Hub.** Dibangun dengan TypeScript, Next.js, Express, Mastra, dan PostgreSQL. Fokus utama: integrasi agen AI multi-tool untuk otomatisasi konten digital.
