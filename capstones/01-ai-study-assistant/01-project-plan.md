# Sesi 1: Perencanaan Proyek — AI Study Assistant

> **Durasi:** 2 minggu (Sprint 1) | **Mode:** Kelompok 3–4 orang

---

## 📋 Ringkasan

Sesi ini berfokus pada perencanaan proyek AI Study Assistant sebelum menulis kode. Mahasiswa akan menyusun product requirements, memilih tech stack, merancang arsitektur sistem, menulis user stories, dan membuat milestone planning untuk 8 minggu pengembangan. Output sesi ini adalah dokumen perencanaan yang menjadi acuan seluruh tim selama pengerjaan capstone.

---

## 1. Product Requirements

### 1.1 Latar Belakang

Mahasiswa sering kesulitan mendapatkan jawaban cepat dan akurat tentang materi kuliah di luar jam kelas. Dosen memiliki dokumen referensi (PDF, slide, catatan) yang berisi informasi lengkap, tetapi mahasiswa harus membaca puluhan halaman untuk menemukan jawaban spesifik. AI Study Assistant menjembatani gap ini dengan menyediakan asisten belajar berbasis RAG yang menjawab pertanyaan berdasarkan dokumen kuliah.

### 1.2 Masalah yang Diselesaikan

| Masalah | Dampak | Solusi |
|---------|--------|--------|
| Mahasiswa kesulitan cari informasi di dokumen panjang | Waktu belajar tidak efisien | RAG: tanya dalam bahasa natural, dapat jawaban langsung |
| Dosen tidak bisa melayani semua pertanyaan mahasiswa | Beban kerja dosen tinggi | AI agent menjawab pertanyaan rutin secara otomatis |
| Konteks percakapan hilang saat berganti sesi | Mahasiswa harus mengulang penjelasan | Memori percakapan per sesi |
| Jawaban tanpa sumber sulit diverifikasi | Kepercayaan terhadap jawaban rendah | Source citation di setiap jawaban |

### 1.3 Target Pengguna

- **Mahasiswa S1 RPL/SI semester 3–5**: mengajukan pertanyaan, melihat riwayat chat
- **Dosen**: upload materi, lihat log chat mahasiswa, evaluasi kualitas jawaban

### 1.4 Fitur Utama (MVP)

1. Autentikasi dua peran (student + lecturer)
2. CRUD kursus (dosen)
3. Upload dokumen referensi (PDF/TXT/MD)
4. Pipeline chunking + embedding otomatis
5. Chat dengan AI agent per kursus
6. RAG — jawaban berdasarkan dokumen relevan
7. Source citation dalam jawaban
8. Feedback thumb up/down
9. Dashboard dosen — log chat mahasiswa
10. Eval set untuk mengukur kualitas RAG

---

## 2. Tech Stack Decision

### 2.1 Opsi yang Dipertimbangkan

| Layer | Opsi 1 | Opsi 2 | Keputusan | Alasan |
|-------|--------|--------|-----------|--------|
| Frontend | React + Vite + Tailwind | Next.js | **React + Vite** | Lebih ringan, fokus SPA, tidak perlu SSR |
| Backend | Python FastAPI | Node.js Express | **FastAPI** | Ekosistem Python untuk AI/ML lebih matang |
| Database | PostgreSQL + pgvector | MongoDB + Atlas | **PostgreSQL + pgvector** | Vector search native, relasional, satu DB |
| AI Framework | Mastra (Python) | LangChain | **Mastra** | Lebih sederhana, tool calling native, memory built-in |
| LLM | GPT-4o-mini | Gemini 2.0 Flash | **GPT-4o-mini** (default) | Biaya rendah, performa baik, bisa ganti via env |
| Embedding | text-embedding-3-small | BGE-base | **text-embedding-3-small** | OpenAI ecosystem, 1536 dimensi, optimal |
| Auth | Supabase Auth | JWT manual | **JWT manual** | Pembelajaran maksimal, kontrol penuh |
| File Storage | Supabase Storage | MinIO | **MinIO** (lokal) / Supabase (prod) | Gratis, S3-compatible |

### 2.2 Alasan Pemilihan Arsitektur

**Monorepo** dipilih agar backend Python dan frontend React dalam satu repository. Struktur folder:

```
ai-study-assistant/
├── backend/
│   ├── app/
│   │   ├── api/         # FastAPI routes
│   │   ├── core/        # Config, security
│   │   ├── models/      # SQLAlchemy models
│   │   ├── schemas/     # Pydantic schemas
│   │   ├── services/    # Business logic
│   │   └── agents/      # Mastra agent + tools
│   ├── migrations/      # Alembic
│   ├── tests/
│   └── eval/            # Eval set + scripts
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── services/    # API client
│   └── ...
└── docker-compose.yml
```

---

## 3. Arsitektur Sistem

### 3.1 High-Level Architecture

```
┌──────────────┐     ┌──────────────────────────────────────┐
│   Browser    │────▶│         FastAPI (Backend)             │
│  (React SPA) │     ├──────────────────────────────────────┤
└──────────────┘     │  Auth → CRUD → RAG Pipeline → Agent  │
                     └──────────┬───────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
            ┌──────────────┐       ┌──────────────┐
            │  PostgreSQL   │       │    MinIO     │
            │  + pgvector   │       │ File Storage │
            └──────────────┘       └──────────────┘
                    │
                    ▼
            ┌──────────────┐
            │  OpenAI API   │
            │  (embed + LLM)│
            └──────────────┘
```

### 3.2 Alur Data RAG Pipeline

```
1. Upload Dokumen
   PDF/TXT → PyMuPDF extract → Chunking (512 token, overlap 128)
   → Embedding (text-embedding-3-small) → Simpan di pgvector

2. Chat Request
   User question → Embed query → Vector search (cosine sim, top-k=5)
   → Context chunks + history → Mastra Agent → LLM generate
   → Streaming response (SSE) → React UI

3. Memory
   Load last 10 messages from DB → Agent context
   → Save user + assistant message after each turn
```

---

## 4. User Stories

### Sprint 1 — Fondasi & Auth

| ID | Sebagai | Ingin | Agar | Poin |
|----|---------|-------|------|------|
| US-01 | Pengunjung | Mendaftar akun | Bisa login dan mengakses aplikasi | 3 |
| US-02 | Mahasiswa | Login dengan email & password | Mendapat akses sesuai peran | 2 |
| US-03 | Mahasiswa | Melihat dashboard setelah login | Mengetahui ringkasan aktivitas | 2 |
| US-04 | Dosen | Mengupdate profil | Informasi saya tetap akurat | 1 |

### Sprint 2 — Course & Document

| ID | Sebagai | Ingin | Agar | Poin |
|----|---------|-------|------|------|
| US-05 | Dosen | Membuat kursus baru | Mahasiswa bisa belajar materi tertentu | 3 |
| US-06 | Dosen | Upload dokumen PDF ke kursus | Mahasiswa punya referensi belajar | 5 |
| US-07 | Mahasiswa | Enroll ke kursus | Bisa mengakses materi dan bertanya | 2 |
| US-08 | Mahasiswa | Melihat daftar dokumen kursus | Tahu referensi apa saja yang tersedia | 1 |

### Sprint 3 — AI Agent & Chat

| ID | Sebagai | Ingin | Agar | Poin |
|----|---------|-------|------|------|
| US-09 | Mahasiswa | Chat dengan AI per kursus | Mendapat jawaban dari materi kuliah | 8 |
| US-10 | Mahasiswa | Melihat sumber jawaban | Bisa verifikasi dan baca lebih lanjut | 3 |
| US-11 | Mahasiswa | Menjalankan kode Python lewat chat | Langsung praktik contoh kode | 5 |
| US-12 | Mahasiswa | Konteks percakapan terbawa | Tidak perlu mengulang pertanyaan | 3 |

### Sprint 4 — Evaluation & Deploy

| ID | Sebagai | Ingin | Agar | Poin |
|----|---------|-------|------|------|
| US-13 | Mahasiswa | Memberi feedback jawaban | Membantu meningkatkan kualitas AI | 2 |
| US-14 | Dosen | Melihat log chat mahasiswa | Memantau kesulitan yang sering ditanyakan | 5 |
| US-15 | Dosen | Menjalankan eval set | Mengukur akurasi RAG pipeline | 5 |

---

## 5. Milestone Planning

### Timeline 8 Minggu (4 Sprint × 2 Minggu)

```
M1 ── S1: Foundation & Auth ────────────────── (Minggu 1-2)
     Setup monorepo, database, auth, dashboard

M2 ── S2: Course & Document ────────────────── (Minggu 3-4)
     CRUD course, upload, chunking, embedding

M3 ── S3: AI Agent & Chat ──────────────────── (Minggu 5-6)
     Mastra agent, RAG pipeline, chat UI, streaming

M4 ── S4: Evaluation, Refinement & Deploy ──── (Minggu 7-8)
     Eval set, feedback, deploy, presentasi
```

### Pembagian Tugas Tim (3 orang)

| Peran | Tanggung Jawab | Sprint |
|-------|---------------|--------|
| **Backend Developer** | FastAPI routes, database, auth, deployment | S1–S4 |
| **Frontend Developer** | React UI, chat component, integration | S1–S4 |
| **AI/ML Engineer** | Mastra agent, RAG pipeline, eval, tools | S2–S4 |

> Setiap anggota juga bertanggung jawab menulis test untuk kode masing-masing.

---

## 6. Risk & Mitigation

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| API key LLM habis kuota | Fitur AI tidak jalan | Gunakan model murah (GPT-4o-mini), caching, fallback |
| Vector search lambat di data besar | Response lambat | Index IVFFlat/HNSW, batasi top-k |
| Anggota tim tidak sinkron | Integrasi gagal | Daily standup, branch strategy jelas, code review |
| Deployment error | Tidak bisa demo | CI pipeline, staging environment |

---

## 7. Latihan

> **Latihan 1:** Product Requirements Document
> Buat PRD satu halaman untuk AI Study Assistant. Tentukan 3 masalah utama pengguna, target pengguna, dan 5 fitur prioritas. Gunakan format: **Masalah → Solusi → Fitur**.

> **Latihan 2:** Tech Stack Comparison Matrix
> Buat tabel perbandingan 3 framework AI (Mastra, LangChain, Vertex AI Agent Builder). Bandingkan dari sisi: kemudahan setup, dokumentasi, tool calling, memory management, dan biaya. Tentukan pilihan dan beri alasan.

> **Latihan 3:** Arsitektur Diagram
> Gambar arsitektur sistem menggunakan diagram ASCII atau Excalidraw. Sertakan: browser, backend, database, vector store, file storage, LLM API. Label tiap koneksi dengan protokol (HTTP, WebSocket, SQL).

> **Latihan 4:** User Story Mapping
> Buat user story map untuk fitur Chat dengan AI. Sisi kiri: aktivitas utama (pilih kursus → tanya → baca jawaban → beri feedback). Sisi kanan: breakdown teknis per aktivitas. Estimasi story points dengan Fibonacci.

> **Latihan 5:** Sprint Backlog
> Ambil Sprint 1 (Foundation & Auth). Breakdown menjadi 5–8 task teknis. Setiap task punya: estimasi jam, assignee, acceptance criteria. Gunakan format task list dengan deskripsi.

> **Latihan 6:** Mockup Wireframe
> Gambar wireframe low-fidelity untuk 3 halaman: dashboard mahasiswa, halaman chat, halaman upload dokumen dosen. Tentukan layout, komponen utama, dan alur navigasi antar halaman.

> **Latihan 7:** Timeline & Risk Register
> Buat timeline Gantt chart berbasis teks untuk 8 minggu. Identifikasi 3 risiko teknis tertinggi dan buat rencana mitigasi untuk masing-masing. Tentukan siapa yang bertanggung jawab.

---

## 💡 Tips

- Jangan langsung coding! Luangkan 2 hari pertama untuk perencanaan bersama tim.
- Gunakan Notion atau GitHub Projects untuk melacak sprint backlog.
- Setiap keputusan teknis harus punya alasan — dokumentasikan di ADR (Architecture Decision Record).
- Jika ragu antara dua teknologi, pilih yang paling dikuasai tim — lebih penting deliver dari pada sempurna.

---

| [← Kembali ke README](README.md) | [Lanjut ke Sesi 2: Implementasi →](02-implementation.md) |
|---|---|
