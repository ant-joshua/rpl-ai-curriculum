# Capstone 1: AI Study Assistant

> Asisten Belajar berbasis AI — platform tanya-jawab materi kuliah dengan RAG, agen AI, dan memori percakapan.

---

## 1. Overview

AI Study Assistant adalah aplikasi web yang memungkinkan mahasiswa bertanya tentang materi kuliah dalam bahasa alami. Sistem menjawab berdasarkan dokumen referensi (PDF/teks) yang diunggah dosen, menggunakan pipeline **Retrieval-Augmented Generation (RAG)** yang diorkestrasi oleh **Mastra agent**. Agen AI memiliki akses ke tools — menjalankan kode Python, mencari web, membaca file — plus memori percakapan per sesi agar konteks tidak hilang.

Target pengguna: mahasiswa S1 RPL/SI semester 3–5. Capstone ini dikerjakan **berkelompok (3–4 orang)** dalam 8 minggu (4 sprint × 2 minggu).

**Tujuan pedagogis:** mahasiswa mampu membangun sistem berbasis LLM yang terintegrasi dengan basis data relasional, memiliki alur retrieval yang terukur, serta menerapkan pattern agen + tool calling.

---

## 2. Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | React + Tailwind CSS (Vite) |
| Backend | Python — FastAPI |
| Database | PostgreSQL (via Supabase atau Neon) |
| ORM / Migrasi | SQLAlchemy 2.0 + Alembic |
| LLM / AI Framework | Mastra (Python SDK) |
| Model | OpenAI GPT-4o-mini atau Gemini 2.0 Flash |
| Vector Store | pgvector (di PostgreSQL) |
| Embedding | text-embedding-3-small |
| Auth | Supabase Auth atau JWT manual |
| File Storage | Supabase Storage atau MinIO (lokal) |
| Container | Docker + docker-compose (opsional) |
| CI/CD | GitHub Actions + Render / Railway |

---

## 3. Learning Outcomes

Setelah menyelesaikan capstone ini, mahasiswa mampu:

1. **Merancang** arsitektur RAG sederhana — chunking, embedding, retrieval.
2. **Mengintegrasikan** framework agen (Mastra) dengan tools kustom dan memory.
3. **Membangun** REST API FastAPI dengan endpoint CRUD dan streaming.
4. **Memodelkan** data relasional untuk konten kursus, dokumen, percakapan.
5. **Menerapkan** vector search (pgvector) untuk semantic retrieval.
6. **Mengelola** sesi dan memori percakapan secara terstruktur.
7. **Menguji** pipeline AI dengan eval set sederhana (faithfulness, relevansi).
8. **Mendeploy** aplikasi ke cloud (Render/Railway) atau VPS.

---

## 4. Features by Sprint

### Sprint 1 — Fondasi & Auth (Minggu 1–2)

**Goal:** Kerangka aplikasi berjalan, user bisa register/login.

- Setup monorepo (frontend + backend)
- FastAPI + SQLAlchemy models + Alembic migration pertama
- PostgreSQL running (lokal atau Supabase)
- Register, login, logout (JWT access + refresh token)
- Halaman dashboard kosong (React)
- Role: `student` dan `lecturer`
- Upload profil & ganti password

**Acceptance Criteria:**
- Register → login → dapat JWT → akses `/me` balik data user.
- Token expired → 401.
- Table `users` sudah termigrasi.

### Sprint 2 — Course & Document Upload (Minggu 3–4)

**Goal:** Dosen bisa buat kursus, upload dokumen referensi.

- CRUD course (hanya lecturer)
- Upload PDF / .txt / .md (max 10 MB per file)
- File disimpan di Supabase Storage atau MinIO
- Dokumen diproses: ekstrak teks (PyMuPDF), chunking (fixed-size 512 token with overlap 128)
- Embedding via OpenAI API → simpan ke tabel `document_chunks` + `vectors` (pgvector)
- Mahasiswa bisa melihat daftar kursus & dokumen

**Acceptance Criteria:**
- Upload file → teks ter-chunk → embedding ter-generate → bisa di-query via cosine similarity.
- Halaman kursus menampilkan daftar dokumen.
- Role-based: hanya dosen pemilik kursus yang bisa hapus/ubah dokumen.

### Sprint 3 — AI Agent & Chat (Minggu 5–6)

**Goal:** Mahasiswa bisa chat dengan agen AI per kursus.

- Integrasi Mastra Agent:
  - System prompt: "Kamu adalah asisten belajar. Jawab berdasarkan dokumen yang diberikan. Jika tidak tahu, katakan tidak tahu."
  - Tools: `retrieve_context(query, course_id)`, `run_code(code)` (sandbox), `web_search(query)` (opsional), `get_course_info(course_id)`
- RAG pipeline:
  1. User bertanya → embed query → vector search di pgvector (top-k=5)
  2. Context chunks + query → dikirim ke LLM via Mastra
  3. LLM generate jawaban → streaming ke frontend (SSE)
- Memori percakapan per sesi: Mastra memory (in-memory atau Redis)
  - Riwayat disimpan ke tabel `chat_messages` untuk persistensi
- Tampilan chat: bubble UI, loading state, markdown rendering

**Acceptance Criteria:**
- Tanya "Apa itu JOIN SQL?" → jawaban berdasarkan dokumen course.
- Tanya lanjutan "Berikan contoh?" → konteks terbawa dari pesan sebelumnya.
- Jalankan `/run code select * from users` → hasil query dikembalikan.
- Jawaban mencantumkan sumber (nama dokumen + halaman jika ada).

### Sprint 4 — Evaluation, Refinement & Deploy (Minggu 7–8)

**Goal:** Evaluasi pipeline, perbaikan, deployment.

- Buat eval set: 10–20 Q&A per course, label reference passage.
- Metrik: faithfulness (LLM-as-judge), context recall, answer relevancy.
- Dashboard dosen: lihat log chat mahasiswa, lihat pertanyaan tanpa jawaban bagus.
- Fitur feedback: thumb up/down di setiap jawaban.
- Perbaikan chunking: ukuran chunk, overlap, hybrid search (keyword + vector).
- Deploy ke Render / Railway + PostgreSQL cloud.
- CI: GitHub Actions lint + test.
- Dokumentasi API (Swagger) dan README proyek.

**Acceptance Criteria:**
- Eval set bisa dijalankan via CLI: `python eval.py` → output skor.
- Feedback tersimpan di database.
- Aplikasi live di domain publik.
- Pipeline RAG bisa di-switch model (GPT ↔ Gemini) via env var.

---

## 5. Data Model (SQL Tables)

### Entity Relationship (inti)

```
users ──< courses ──< documents ──< document_chunks
  │                       │
  └──< enrollments >──────┘
  │
  └──< chat_sessions ──< chat_messages
```

### Tabel

**users**

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, default gen_random_uuid() |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| full_name | VARCHAR(150) | NOT NULL |
| role | VARCHAR(20) | CHECK IN ('student','lecturer') |
| avatar_url | TEXT | nullable |
| created_at | TIMESTAMPTZ | DEFAULT now() |

**courses**

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| title | VARCHAR(200) | NOT NULL |
| description | TEXT | nullable |
| lecturer_id | UUID | FK → users.id, NOT NULL |
| code | VARCHAR(20) | UNIQUE, e.g. "RPL401" |
| created_at | TIMESTAMPTZ | DEFAULT now() |

**enrollments**

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users.id, ON DELETE CASCADE |
| course_id | UUID | FK → courses.id, ON DELETE CASCADE |
| enrolled_at | TIMESTAMPTZ | DEFAULT now() |
| | | UNIQUE(user_id, course_id) |

**documents**

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| course_id | UUID | FK → courses.id |
| title | VARCHAR(255) | NOT NULL |
| file_url | TEXT | NOT NULL |
| file_type | VARCHAR(10) | e.g. "pdf", "txt" |
| uploaded_by | UUID | FK → users.id |
| chunk_count | INTEGER | DEFAULT 0 |
| created_at | TIMESTAMPTZ | DEFAULT now() |

**document_chunks**

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| document_id | UUID | FK → documents.id, ON DELETE CASCADE |
| chunk_index | INTEGER | NOT NULL |
| content | TEXT | NOT NULL |
| embedding | vector(1536) | pgvector, nullable |
| metadata | JSONB | e.g. {"page": 3} |
| created_at | TIMESTAMPTZ | DEFAULT now() |

**chat_sessions**

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users.id |
| course_id | UUID | FK → courses.id |
| title | VARCHAR(255) | nullable, auto-generated |
| is_active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | DEFAULT now() |

**chat_messages**

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| session_id | UUID | FK → chat_sessions.id |
| role | VARCHAR(20) | CHECK IN ('user','assistant') |
| content | TEXT | NOT NULL |
| sources | JSONB | nullable, [{doc_title, chunk_index, score}] |
| feedback | SMALLINT | nullable, -1 / 0 / 1 |
| created_at | TIMESTAMPTZ | DEFAULT now() |

**Indexes:**
- `idx_chunks_embedding` — IVFFlat or HNSW on `document_chunks.embedding`
- `idx_messages_session` — on `chat_messages.session_id`
- `idx_enrollments_user` — on `enrollments.user_id`

---

## 6. API Endpoints

| Method | Path | Auth | Deskripsi |
|---|---|---|---|
| POST | /api/auth/register | - | Register user baru |
| POST | /api/auth/login | - | Login, return JWT |
| POST | /api/auth/refresh | Refresh | Refresh access token |
| GET | /api/auth/me | JWT | Profil user saat ini |
| PATCH | /api/auth/me | JWT | Update profil |
| GET | /api/courses | JWT | Daftar kursus (tergantung role) |
| POST | /api/courses | JWT+lecturer | Buat kursus baru |
| GET | /api/courses/{id} | JWT | Detail kursus |
| PATCH | /api/courses/{id} | JWT+lecturer | Update kursus |
| DELETE | /api/courses/{id} | JWT+lecturer | Hapus kursus |
| POST | /api/courses/{id}/enroll | JWT+student | Enroll kursus |
| GET | /api/courses/{id}/documents | JWT | Daftar dokumen kursus |
| POST | /api/courses/{id}/documents | JWT+lecturer | Upload dokumen |
| DELETE | /api/documents/{id} | JWT+lecturer | Hapus dokumen |
| GET | /api/courses/{id}/sessions | JWT | Daftar sesi chat user |
| POST | /api/courses/{id}/sessions | JWT+student | Buat sesi chat baru |
| GET | /api/sessions/{id}/messages | JWT | Riwayat pesan sesi |
| POST | /api/sessions/{id}/messages | JWT+student | Kirim pesan → jawaban AI (streaming) |
| POST | /api/messages/{id}/feedback | JWT | Kirim feedback thumb |
| GET | /api/lecturer/courses/{id}/logs | JWT+lecturer | Log chat mahasiswa (Sprint 4) |
| POST | /api/eval/run | JWT+lecturer | Jalankan eval set (Sprint 4) |

**Streaming:** endpoint `POST .../messages` menggunakan Server-Sent Events (SSE). Response berupa event stream dengan tipe: `token` (partial word), `source` (referensi), `done`, `error`.

---

## 7. AI Integration Detail (Mastra)

### 7.1 Arsitektur Agent

Mastra agent bertindak sebagai **router dan orchestrator**. Alur:

```
User → FastAPI → Mastra Agent (system prompt + tools + memory)
                    ├── tool: retrieve_context → pgvector
                    ├── tool: run_code       → sandbox Python
                    ├── tool: web_search     → API eksternal (opsional)
                    └── tool: get_course_info → SQL query
                    │
                    └── LLM (GPT-4o-mini) ← context chunks + history
                         → streaming response → SSE → React UI
```

### 7.2 Tools

**retrieve_context(query, course_id, top_k=5)**
- Embed query via `text-embedding-3-small`
- Cosine similarity search di `document_chunks` filter `course_id`
- Return list of {content, doc_title, chunk_index, score}
- Score threshold: min 0.7 — jika di bawah, agent diberi tahu "tidak ada konteks relevan"

**run_code(code_str)**
- Eksekusi Python di sandbox (e.g., subprocess dengan timeout 10s, tanpa akses FS)
- Return stdout / stderr
- Aman: tidak ada modul `os`, `subprocess`, `shutil` — gunakan restricted Python

**web_search(query)**
- (Opsional) Panggil API SerpAPI / Tavily
- Return 3–5 snippet teratas

**get_course_info(course_id)**
- Query SQL ke tabel `courses` + hitung jumlah dokumen
- Return dict: title, description, code, doc_count

### 7.3 Memory

Mastra menyediakan `Memory` abstraction. Implementasi:
- **Working memory:** in-process dictionary (dev) atau Redis (prod)
- **Persistent memory:** tiap akhir putaran, simpan user message + assistant reply ke tabel `chat_messages`
- Saat agent start, muat 10 pesan terakhir dari DB sebagai konteks
- Konfigurasi: `lastN=10`, `maxTokens=4000`

### 7.4 System Prompt (ringkasan)

```
Kamu adalah AI Study Assistant, asisten belajar untuk mahasiswa.
Gunakan tools yang tersedia untuk menjawab pertanyaan.
Prioritas: retrieve_context → jika tidak cukup, baru web_search.
Jika pengguna meminta kode, gunakan run_code untuk mengeksekusi.
Selalu sebutkan sumber jawaban (nama dokumen).
Jika tidak tahu, akui. Jangan halusinasi.
```

### 7.5 Fallback & Safety

- Jika semua retrieval score < 0.7 → agent jawab: "Saya tidak menemukan informasi relevan di dokumen kursus ini."
- Rate limit: maks 30 pesan per sesi per jam (dari sisi FastAPI, sebelum masuk agent).
- Input sanitasi: HTML-escape sebelum log, jangan tampilkan raw di UI.

---

## 8. Deliverables Checklist

| # | Deliverable | Sprint |
|---|---|---|
| ☐ | Repository GitHub — monorepo (frontend + backend) | S1 |
| ☐ | Database schema migration (Alembic) | S1 |
| ☐ | Auth flow (register, login, JWT, role guard) | S1 |
| ☐ | Course CRUD (lecturer only) | S2 |
| ☐ | Document upload + chunking + embedding pipeline | S2 |
| ☐ | Vector search endpoint (pgvector) | S2 |
| ☐ | Mastra agent integration — tools + memory | S3 |
| ☐ | Chat UI + SSE streaming | S3 |
| ☐ | Source citation in answers | S3 |
| ☐ | Feedback (thumb up/down) | S4 |
| ☐ | Eval set + eval script | S4 |
| ☐ | Dashboard dosen — chat logs | S4 |
| ☐ | Deployment (public URL) | S4 |
| ☐ | Swagger docs + README | S4 |
| ☐ | Presentasi final & demo | S4 |

---

## 9. Evaluation Rubric

| Kategori | Bobot | 4 (Sangat Baik) | 3 (Baik) | 2 (Cukup) | 1 (Kurang) |
|---|---|---|---|---|---|
| **Fungsionalitas** | 30% | Semua fitur sprint 1–4 berjalan tanpa error. | Fitur utama berjalan, 1–2 minor bug. | 2+ fitur tidak berfungsi, error di flow kritis. | Sebagian besar fitur tidak jalan. |
| **AI Integration** | 25% | RAG akurat, memory berfungsi, tools dipanggil tepat, source jelas. | RAG berjalan, memory kadang hilang, tool kadang tidak terpanggil. | RAG tidak pakai konteks, memory tidak bekerja. | Tidak ada RAG, jawaban selalu halusinasi. |
| **Code Quality** | 20% | Clean code, type hints, docstrings, error handling, lint pass. | Struktur rapi, sedikit type hint hilang, lint warning. | Banyak type hint hilang, error handling minimal. | Tidak terstruktur, tidak ada error handling. |
| **Database & API** | 15% | Semua endpoint RESTful, migrasi aman, index optimal, response cepat. | Endpoint lengkap, beberapa response tidak konsisten. | Endpoint kurang, migrasi manual, tidak ada index. | Tidak ada API yang bisa diakses, DB inconsistent. |
| **Deployment & Docs** | 10% | Live URL, CI hijau, README lengkap, Swagger aktif, video demo. | Deployed, README minimal, Swagger aktif. | Deployed tapi error, README kurang. | Tidak di-deploy, tidak ada dokumentasi. |

**Nilai akhir = Σ(bobot × skor) / 4.** Minimal lulus: 2.5.

---

## 10. Referensi & Catatan

- **Mastra Python SDK:** https://github.com/mastra-ai/mastra-python
- **pgvector:** https://github.com/pgvector/pgvector
- **FastAPI StreamingResponse:** https://fastapi.tiangolo.com/advanced/custom-response/#streamingresponse
- Dokumen contoh untuk testing: gunakan materi basis data (JOIN, normalisasi, indexing) atau materi pemrograman web.
- Disarankan setiap anggota kelompok fokus 1 layer: satu backend, satu frontend, satu AI pipeline, satu infra/eval.

---

> **Estimasi word count:** ~1.600 kata. Dokumen ini adalah spesifikasi acuan untuk seluruh capstone. Jika ada perubahan requirement, update README dan beri tahu tim.
