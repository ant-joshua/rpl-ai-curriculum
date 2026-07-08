<img src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=1" alt="Final Project" style="width:100%;border-radius:12px;margin:12px 0;">

# 08. Final Project

> **Level:** 🚀 Advanced  
> **Jam:** 8 (4 minggu × 2 sesi)  
> **Prasyarat:** Semua modul sebelumnya (JS, TS, Express, DB, Frontend, AI)  
> **Output:** Full-stack AI-powered web app, live di internet, siap portfolio

## Tujuan Pembelajaran

Setelah modul ini, kamu bisa:

- Merencanakan proyek dengan GitHub Project Board & ERD
- Menyiapkan project structure full-stack (Express + React/Next.js + Mastra AI + PostgreSQL)
- Membangun fitur CRUD dengan autentikasi pengguna
- Mengintegrasikan Mastra AI agent + tools ke dalam aplikasi
- Menangani error, loading state, dan responsive design
- Mendeploy aplikasi ke Vercel (frontend) + Railway (backend)
- Menulis README, dokumentasi API, dan presentasi proyek

---

## Project Management Fundamentals

Proyek software bukan cuma ngoding — ada tahapan perencanaan yang sama pentingnya.

### 1. Requirement Gathering

Requirement gathering = proses ngumpulin kebutuhan dari user / stakeholder.

#### Teknik Requirement Gathering

| Teknik | Cara | Cocok Untuk |
|--------|------|-------------|
| **Interview** | Tanya langsung ke user/clien | Jumlah responden sedikit |
| **Survey** | Google Form ke banyak user | Validasi kebutuhan massal |
| **Observation** | Lihat langsung workflow user | Process-heavy app |
| **Document analysis** | Review dokumen existing (SOP, form) | Replace legacy system |
| **Prototyping** | Bikin mockup, minta feedback | UI-heavy app |
| **User story mapping** | Visualisasi user journey | Complex app dengan banyak fitur |

#### Output Requirement Gathering

```
### Dokumen Kebutuhan
1. **Business Requirements** — kenapa proyek ini ada?
2. **Functional Requirements** — fitur spesifik yang harus ada
3. **Non-Functional Requirements** — performance, security, scalability
4. **User Personas** — siapa aja yang pake aplikasi ini?
5. **User Stories** — kebutuhan dari sisi user
```

### 2. MVP Definition (Minimum Viable Product)

MVP = versi paling minimal dari produk yang masih bisa dipake user.

#### Kenapa MVP Penting?

1. **Validasi cepat** — cek apakah ide lo beneran dipake
2. **Time to market** — rilis cepet, iterasi cepet
3. **Fokus** — gak buang waktu di fitur yang mungkin gak dipake
4. **Feedback early** — dapet feedback real dari user

#### Cara Nentuin MVP

```
MVP Checklist:
□ Fitur ini essential? (tanpa ini, app gak berfungsi?)
□ Fitur ini solve real problem? (atau cuma nice-to-have?)
□ Bisa di-deliver dalam 2-3 sprint?
□ User bisa complete core journey tanpa fitur ini?

✅ MVP: Login, CRUD utama, 1 AI feature
❌ Bukan MVP: Dark mode, export PDF, notification, analytics
```

#### MVP vs Full Product

| Fitur | MVP | Sprint 2 | Sprint 3 | Sprint 4 |
|-------|-----|----------|----------|----------|
| Auth (login/register) | ✅ | ✅ | ✅ | ✅ |
| CRUD entity utama | ✅ | ✅ | ✅ | ✅ |
| 1 AI agent | ✅ | ✅ | ✅ | ✅ |
| Fitur export | - | - | ✅ | ✅ |
| Dark mode | - | - | - | ✅ |
| Admin dashboard | - | ✅ | ✅ | ✅ |
| Notification | - | - | - | - |

### 3. User Stories & Acceptance Criteria

#### User Stories — Format & Contoh

Format standar: **Sebagai** [user], **saya ingin** [fitur] **agar** [manfaat].

```
Contoh user story untuk Travel Planner:
1. Sebagai traveler, saya ingin mendaftar akun agar bisa menyimpan rencana perjalanan.
2. Sebagai traveler, saya ingin membuat trip baru agar bisa merencanakan destinasi.
3. Sebagai traveler, saya ingin AI merekomendasikan itinerary agar tidak repot riset manual.
4. Sebagai traveler, saya ingin melihat cuaca destinasi agar bisa packing sesuai.
5. Sebagai traveler, saya ingin menyimpan favorit tempat agar gampang diakses nanti.
```

#### Acceptance Criteria (AC)

AC = syarat yang harus dipenuhi biar story dianggap "selesai".

```
User Story: Sebagai traveler, saya ingin login dengan Google agar tidak repot register.

Acceptance Criteria:
✅ [ ] Tombol "Login with Google" ada di halaman login
✅ [ ] Klik tombol → redirect ke Google OAuth consent screen
✅ [ ] Setelah approve → redirect balik ke dashboard
✅ [ ] Email user tercatat di database (first login)
✅ [ ] Kalau gagal (cancelled) → balik ke login page dengan pesan error
```

#### INVEST Checklist

| Kriteria | Cek | Contoh ✅ | Contoh ❌ |
|----------|-----|-----------|-----------|
| **I**ndependent | 🟢 | "Login" | "Login & kirim email" |
| **N**egotiable | 🟢 | "Tampilkan cuaca" | "Buat card cuaca ukuran 300px" |
| **V**aluable | 🟢 | "Export itinerary ke PDF" | "Bikin fungsi exportData()" |
| **E**stimable | 🟢 | "Filter destinasi berdasarkan budget" | "Sistem rekomendasi pakai ML" |
| **S**mall | 🟢 | "Halaman profile user" | "Bikin aplikasi travel planner" |
| **T**estable | 🟢 | "Search mengembalikan hasil sesuai query" | "Aplikasi responsif" |

### 4. Sprint Planning Framework

#### Sprint Planning Checklist

```
Sebelum Planning:
□ Product Backlog sudah di-prioritaskan oleh PO
□ User story sudah jelas (INVEST)
□ Tim tau kapasitas sprint (velocity)

Saat Planning (2 jam untuk sprint 2 minggu):
□ PO jelaskan goal dan prioritas (30 menit)
□ Tim tanya jawab klarifikasi (30 menit)
□ Estimasi planning poker (30 menit)
□ Pilih & breakdown task ke Sprint Backlog (30 menit)
□ Tulis Sprint Goal ⭐

Output:
□ Sprint Backlog — daftar task yang dikerjakan
□ Sprint Goal — 1 kalimat tujuan sprint
□ Task assignment — siapa ngerjain apa
```

#### Contoh Sprint Goal

| Sprint | Sprint Goal |
|--------|-------------|
| Sprint 1 | "User bisa daftar, login, dan lihat halaman utama aplikasi" |
| Sprint 2 | "User bisa CRUD trip, lihat daftar trip, dan detail trip" |
| Sprint 3 | "User bisa chat dengan AI agent untuk rekomendasi itinerary" |
| Sprint 4 | "Aplikasi live di internet dengan deployment dan CI/CD" |

### 5. Tech Stack Decisions

#### Cara Pilih Tech Stack

```
Framework Pertimbangan:
1. Tim competence — apa yang udah dikuasai?
2. Project requirements — butuh real-time? AI? Heavy computation?
3. Community & ecosystem — banyak library? Support aktif?
4. Learning curve — bisa dikuasai dalam waktu sprint?
5. Deployment — gampang di-deploy? Ada platform gratis?
```

#### Stack Recommendation untuk Project RPL

| Lapisan | Recommended | Alternatif |
|---------|-------------|------------|
| **Frontend** | React + Vite + Tailwind | Next.js, Svelte |
| **Backend** | Express + TypeScript | Fastify, Hono |
| **Database** | PostgreSQL | MySQL, SQLite |
| **ORM** | Prisma | Drizzle, TypeORM |
| **AI** | Mastra AI | LangChain, OpenAI SDK |
| **Auth** | JWT + bcrypt | NextAuth, Lucia |
| **Deploy FE** | Vercel | Netlify, Cloudflare Pages |
| **Deploy BE** | Railway | Render, Fly.io |
| **Storage** | Local filesystem | Cloudinary, AWS S3 |

#### Kenapa Pilihan Ini?

| Pilihan | Alasan |
|---------|--------|
| **TypeScript** | Type safety + industry standard |
| **Prisma** | Auto-migration, type-safe queries |
| **PostgreSQL** | Free di Railway, mature ORM support |
| **Tailwind** | Cepet styling tanpa CSS custom |
| **Vite** | Cepat (esbuild), modern dev experience |
| **Mastra** | Simple AI agent framework buat beginner |

### 6. Project Documentation

#### Dokumentasi yang Wajib Ada

```
📋 Project Docs Checklist:
□ README.md — cara run, tech stack, link deploy
□ PROMPT-LOG.md — prompt AI yang dipakai
□ ARCHITECTURE.md — ERD, data flow, folder structure
□ API.md — endpoint documentation
□ DEPLOY.md — step-by-step deployment
□ SPRINT-NOTES.md — sprint plan, review, retro
```

#### Template: Dokumentasi API

```
### POST /api/auth/register
Register user baru.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid-123",
    "email": "user@example.com"
  }
}
```

**Errors:**
- `400` — Email already registered
- `422` — Validation error (invalid email format)
```

### 7. Milestones & Timeline

#### Milestone Schedule — 4 Sprint

| Milestone | Target | Deliverable |
|-----------|--------|-------------|
| **M1** — Foundation | Akhir Sprint 1 | Repo, ERD, Express scaffold, database, auth |
| **M2** — Core Features | Akhir Sprint 2 | CRUD API, frontend list/form, auth flow |
| **M3** — AI Integration | Akhir Sprint 3 | AI agent + tools, streaming chat, prompt templates |
| **M4** — Launch | Akhir Sprint 4 | Deployed app, CI/CD, dokumentasi, presentasi |

#### Sprint Timeline

```
Minggu 1-2 (Sprint 1):      Foundation
├── Session 19: Planning + Setup (Repo, ERD, scaffold)
└── Session 20: Database + Auth (Prisma, JWT)

Minggu 3-4 (Sprint 2):      Core Features
├── Session 21: CRUD API (Express endpoints)
└── Session 22: Frontend (React list/form + auth)

Minggu 5-6 (Sprint 3):      AI Integration
├── Session 23: Mastra Agent (tools + connect)
└── Session 24: Chat UI (streaming + error handling)

Minggu 7-8 (Sprint 4):      Polish & Deploy
├── Session 25: Error handling + responsive
└── Session 26: Deploy + CI/CD + presentasi
```

### 8. Risk Management

#### Identifikasi Risiko Proyek

| Risiko | Probability | Impact | Mitigasi |
|--------|-------------|--------|----------|
| GPT/API key expired | Medium | High | Siapkan fallback (mock AI), API key monitoring |
| Anggota tim sakit | Medium | Medium | Dokumentasi kode, pair programming |
| Merge conflict parah | Medium | Medium | Branch strategy jelas, sering merge |
| Database corrupt | Low | High | Backup otomatis, migration rollback |
| Fitur terlalu ambisius | High | High | MVP mindset, prioritaskan core features |
| Dependency vulnerability | Low | Medium | `npm audit` rutin, update dependency |

#### Risk Matrix

```
Impact →
  High    │  DB corrupt (M)  │  API expired (H)
          │  Dependency (L)  │  Fitur ambisius (H)
          │                  │
  Low     │  Merge conflict  │  Anggota sakit (M)
          │                  │
          └──────────────────┴─────────────────→ Probability
               Low                  High
```

#### Contingency Plan Template

```
## Contingency Plan

### Risiko: [Nama Risiko]
Tanda-tanda: [gejala awal]
Pencegahan: [langkah preventif]

### Jika Terjadi:
1. Langsung: [langkah pertama — 1 jam]
2. Follow up: [langkah kedua — 1 hari]
3. Recovery: [kembali normal dalam X hari]
```

### 9. Code Review & Quality Gates

#### Quality Gates per Sprint

```
🟢 Sprint 1:
  - ESLint/TS strict mode jalan
  - Secret tidak ada di kode (.env in .gitignore)
  - API health check return 200

🟢 Sprint 2:
  - Auth middleware berfungsi (401 untuk user tanpa token)
  - Input validation minimal
  - Error handling di semua endpoint

🟢 Sprint 3:
  - Error boundary di komponen AI
  - Loading state di chat
  - AI response tidak crash kalau API down

🟢 Sprint 4:
  - Semua environment variables production terisi
  - CORS hanya allow frontend domain
  - Accessibility check (alt text, tab order)
  - Build tidak error
```

---

## Materi

| Sesi | Topik | File |
|------|-------|------|
| 19–20 | Sprint 1: Planning + Setup | [01-sprint1.md](01-sprint1.md) |
| 21–22 | Sprint 2: Core Features (CRUD + Auth) | [02-sprint2.md](02-sprint2.md) |
| 23–24 | Sprint 3: AI Integration | [03-sprint3.md](03-sprint3.md) |
| 25–26 | Sprint 4: Polish + Deploy | [04-sprint4.md](04-sprint4.md) |

## Output Akhir Modul

> **Full-stack AI-powered web app** — deployed di Vercel + Railway, pakai Mastra AI agent dengan minimal 2 tools, PostgreSQL database, autentikasi pengguna, dan siap dipresentasikan.

### Checklist Final Project

```
□ Requirement & MVP docs (ini README)
□ ERD minimal 3 tabel
□ GitHub repo + Project Board
□ Express backend + TypeScript
□ Prisma + PostgreSQL
□ CRUD API endpoints
□ Auth (JWT)
□ React frontend
□ AI agent (Mastra)
□ Minimal 2 AI tools
□ Error handling (global + boundary)
□ Responsive (mobile + desktop)
□ Deployed backend (Railway)
□ Deployed frontend (Vercel)
□ CI/CD (GitHub Actions)
□ README + dokumentasi
□ Presentasi (5 menit)
```

## AI Prompt Exercises

Sepanjang modul, latihan pake AI:

- "Generate ERD for a travel planner app with users, trips, and destinations"
- "Create a PostgreSQL migration script for my schema"
- "Write Express middleware for JWT auth with refresh token"
- "Debug this API endpoint — it returns 500 on POST"
- "Design a Mastra tool that fetches weather data for itinerary"
- "Refactor this React component to use useReducer for loading states"
- "Generate a CI/CD pipeline for Vercel + Railway deploy"
- "Write a 5-minute presentation script for my final project"

## Latihan Tambahan

### Latihan 1: Requirement Gathering
Tentukan proyek final kamu. Tulis:
1. 3 user personas
2. 5 functional requirements
3. 3 non-functional requirements
4. 1 business requirement

### Latihan 2: MVP Definition
Dari daftar fitur proyek kamu:
1. Tandai mana yang MVP (essential), Sprint 2, Sprint 3, nice-to-have
2. Jelaskan kenapa fitur tertentu masuk MVP
3. Apa risiko kalo fitur MVP ternyata gak cukup?

### Latihan 3: Tech Stack Decision
Pilih tech stack untuk proyek kamu:
1. Tulis 3 opsi stack (recommended + 2 alternatif)
2. Kasih alasan kenapa milih opsi tertentu
3. Identifikasi 1 risiko dari pilihan stack kamu

### Latihan 4: Risk Assessment
Buat risk matrix untuk proyek kamu:
1. Identifikasi minimal 4 risiko
2. Plot di matrix (probability × impact)
3. Tulis mitigation plan untuk 2 risiko tertinggi

### Latihan 5: Sprint Plan
Buat sprint plan untuk Sprint 1 proyek kamu:
1. Sprint goal (1 kalimat)
2. Sprint backlog (minimal 6 task)
3. Assignment per anggota tim
4. Estimasi total story point

### Latihan 6: Dokumentasi API
Tulis dokumentasi untuk 2 endpoint proyek kamu:
1. Satu POST (create)
2. Satu GET (read)
Include: request body, response, error codes

### Latihan 7: Milestone Planning
Buat timeline milestone untuk 4 sprint:
1. Tiap milestone punya deliverable jelas
2. Tiap sprint maksimal 3-5 task besar
3. Include risk buffer di tiap milestone
