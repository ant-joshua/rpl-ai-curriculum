# Sprint 1 — Planning + Setup

> **Sesi:** 19–20 | **Durasi:** 4 jam

## Tujuan

- Brainstorm ide proyek dan tentukan fitur utama
- Buat GitHub repository + Project Board
- Gambar ERD (Entity Relationship Diagram)
- Setup project structure (monorepo / terpisah)
- Scaffold Express backend + database schema + migrasi
- Init Mastra AI agent
- Setup environment variables

## Brainstorming & Project Ideas

Pilih salah satu proyek (atau modifikasi sesuai ide sendiri):

| Project | Stack | Fitur AI |
|---------|-------|----------|
| AI Travel Planner | TS + Express + Mastra + PG | Agent recommend itinerary + weather |
| Smart Notes App | TS + Express + Mastra + PG | AI summarize notes, auto-tag |
| Quiz Master | TS + Express + Mastra + PG | AI generate soal dari topic |
| Chat with Document | TS + Mastra + RAG + PG | Upload PDF, tanya jawab isinya |

## GitHub Project Board

Buat board dengan kolom: **Backlog → To Do → In Progress → Review → Done**

Contoh card:

```
[Task] Setup Express + TypeScript
[Task] Create database schema
[Task] Init Mastra agent
[Task] Design ERD
[Task] Setup environment variables
```

## ERD

Gambar ERD sesuai pilihan proyek. Contoh untuk Travel Planner:

```
users
  id          UUID (PK)
  email       string (unique)
  password    string (hashed)
  created_at  timestamp

trips
  id          UUID (PK)
  user_id     UUID (FK → users)
  title       string
  destination string
  start_date  date
  end_date    date
  created_at  timestamp

destinations
  id          UUID (PK)
  trip_id     UUID (FK → trips)
  name        string
  day         integer
  notes       text
  created_at  timestamp
```

## Project Structure

```
my-project/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── agents/       ← Mastra agents
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── api/          ← API client
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── .env.example
├── .gitignore
└── README.md
```

## Express Scaffold

```typescript
// backend/src/index.ts
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Database Schema (Prisma)

```prisma
// backend/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
}
```

## Mastra Agent Init

```typescript
// backend/src/agents/travelAgent.ts
import { Agent } from '@mastra/core';

export const travelAgent = new Agent({
  name: 'travel-agent',
  instructions: `
    Kamu adalah asisten perjalanan yang membantu user merencanakan itinerary.
    Kamu bisa memberikan rekomendasi tempat wisata, akomodasi, dan transportasi.
    Gunakan tools yang tersedia untuk cek cuaca, cari tempat, dan simpan itinerary.
  `,
});
```

## Environment Variables

```bash
# .env.example
DATABASE_URL=postgresql://user:pass@localhost:5432/myproject
PORT=3001
JWT_SECRET=mysecretkey
MASTRA_API_KEY=
OPENAI_API_KEY=
```

## Latihan

1. **Bikin ERD** — Gambar ERD proyek kamu minimal 3 tabel (User + 2 entity lain) dengan relasi

2. **Setup GitHub** — Buat repo baru, inisialisasi project board dengan 5 task

3. **Scaffold Express** — Inisialisasi backend dengan Express + TypeScript + Prisma, pastikan `/api/health` return 200

4. **Database Migrate** — Jalankan `npx prisma migrate dev` sampai tabel `User` terbentuk di PostgreSQL

5. **Agent Test** — Init Mastra agent dengan instruksi sesuai project kamu, test panggil agent dari Node.js REPL

---

## Project Management Tools

Pilih tool manajemen proyek yang sesuai:

| Tool | Kelebihan | Harga | Cocok |
|------|-----------|-------|-------|
| **GitHub Projects** | Integrasi langsung dengan repo | Gratis | Tim kecil, developer-only |
| **Linear** | UX cepat, keyboard shortcuts, issue tracking | Gratis (10 user) | Startup, tim agile |
| **Notion** | All-in-one: docs + kanban + database | Gratis | Tim yang butuh dokumentasi |
| **Jira** | Fitur lengkap, roadmap, sprint | Gratis (10 user) | Enterprise, tim besar |
| **Trello** | Simpel, drag-drop, power-ups | Gratis | Side project, personal |

### GitHub Projects Setup

```markdown
1. Buka repo → Tab Projects → Create project
2. Pilih template "Feature planning" (kanban)
3. Tambah kolom: Backlog → Ready → In Progress → Review → Done
4. Bikin issue di repo → assign ke project
5. Set labels: `feat`, `bug`, `docs`, `chore`
6. Set milestones buat tiap sprint
```

## Requirement Gathering

Sebelum coding, kumpulin requirements dulu.

### Teknik Requirement Gathering

| Teknik | Cara | Output |
|--------|------|--------|
| **User Interview** | Tanya 3-5 calon user | Pain points, needs list |
| **Survey** | Google Form ke target user | Data kuantitatif preferensi |
| **Competitor Analysis** | Cek 3 aplikasi serupa | Fitur wajib vs nice-to-have |
| **User Story Mapping** | Post-it notes di dinding | Flow pengguna lengkap |
| **MoSCoW** | Prioritaskan: Must/Should/Could/Won't | Prioritas fitur |

### Output Requirement

```markdown
## Dokumen Requirement — AI Travel Planner

### 1. Tujuan Aplikasi
Aplikasi bantu user rencanain perjalanan dengan bantuan AI.

### 2. Target User
- Usia 18-35 tahun
- Suka traveling tapi gak punya waktu planning
- Paham teknologi (pake smartphone/web)

### 3. Fitur (MoSCoW)

**Must Have (MVP):**
- Register/login
- CRUD trips
- AI rekomendasi itinerary
- Cek cuaca destinasi

**Should Have:**
- Simpan itinerary favorit
- Share itinerary ke teman
- Export PDF

**Could Have:**
- Integrasi booking hotel
- Review tempat wisata

**Won't Have (this version):**
- Social feed
- In-app chat

### 4. User Flow
Register → Login → Dashboard → Buat Trip → AI Recommend → Save Itinerary
```

## MVP Definition

MVP (Minimum Viable Product) = versi paling minimal yang bisa dipake user.

### Cara Nentuin MVP

``` 
1. List semua fitur yang kebayang
2. Tanya: "Kalo fitur ini gak ada, apa app masih berguna?"
3. Kalo jawabannya "YA" → bukan MVP
4. Kalo "TIDAK" → masuk MVP
5. Sisanya → post-MVP / backlog
```

### MVP Checklist

- [ ] User bisa register & login
- [ ] User bisa bikin data utama (trip / notes / quiz)
- [ ] User bisa baca data yang udah dibuat
- [ ] User bisa edit data (opsional MVP kalo simpel)
- [ ] User bisa hapus data (opsional MVP)
- [ ] Fitur AI bisa diakses dan ngasih output berguna
- [ ] App bisa dijalanin (localhost / deployed)
- [ ] Error handling dasar — app gak crash mentah-mentah

### Contoh MVP Scope

| Fitur | MVP? | Alasan |
|-------|------|--------|
| Register/Login | ✅ | Butuh data per-user |
| CRUD Trip | ✅ | Fitur inti |
| AI Itinerary | ✅ | Nilai jual utama |
| Check Weather | ✅ | Tool AI butuh data cuaca |
| Share to WhatsApp | ❌ | Post-MVP, bukan inti |
| PDF Export | ❌ | Post-MVP, kompleks |
| Dark Mode | ❌ | Nice-to-have, gak urgent |
| Notification | ❌ | Post-MVP |

## User Stories & Acceptance Criteria

User story = format: "Sebagai [user], saya ingin [goal], agar [alasan]."

### Format Standar

```
As a [role]
I want to [action/feature]
So that [benefit/value]
```

### Contoh User Stories (Travel Planner)

```markdown
US-001: Register
As a new user
I want to register with email and password
So that I can save my travel plans

Acceptance Criteria:
- Form register: email, password, confirm password
- Email format validasi
- Password min 6 karakter
- Kalo email sudah terdaftar → error message
- Setelah register → langsung login & redirect ke dashboard
- JWT token dikirim + disimpan di localStorage

---

US-002: Create Trip
As a logged-in user
I want to create a new trip with destination and date
So that I can start planning my travel

Acceptance Criteria:
- Form: title, destination, start date, end date
- Validasi: end date >= start date
- Setelah submit → muncul di daftar trip
- Loading state saat submit
- Error handling kalo API down

---

US-003: AI Itinerary Recommendation
As a user with a trip
I want AI to suggest an itinerary for my destination
So that I don't have to research manually

Acceptance Criteria:
- Tombol "Generate Itinerary" di detail trip
- Loading state dengan skeleton
- Streaming response (token by token)
- Output: itinerary per hari
- Error handling kalo AI API error
- Bisa regenerate itinerary
```

### Prioritization Matrix

```
            High Value                Low Value
Urgent   │  DO FIRST (P0)         │  SCHEDULE (P1)
         │  - Login/Register      │  - Dark mode
         │  - CRUD Trip           │  - Animation
         │  - AI Itinerary        │
─────────┼────────────────────────┼──────────────────
Not      │  PLAN (P2)             │  BACKLOG (P3)
Urgent   │  - Share itinerary     │  - Social feed
         │  - Export PDF          │  - Gamification
         │  - Review system       │
```

## Tech Stack Decisions

Dokumentasi alasan pilih tech stack — berguna buat portfolio dan maintenance.

### Decision Framework

```markdown
## Tech Stack Decision — AI Travel Planner

### Backend: Node.js + Express + TypeScript
- ✅ Kenapa: Semua developer tim udah paham JavaScript
- ✅ Alternatif: Python/FastAPI (tapi butuh belajar baru)
- ✅ Trade-off: Performa lebih rendah dari Go, tapi velocity lebih tinggi

### Database: PostgreSQL + Prisma
- ✅ Kenapa: Relational data (user-trip-destination cocok SQL)
- ✅ Alternatif: MongoDB (dokumen) — tapi relasi user-trip lebih alami di SQL
- ✅ Prisma: Type safety, migration otomatis, DX enak

### Frontend: React + Vite + Tailwind
- ✅ Kenapa: Ekosistem React besar, Vite cepet, Tailwind produktif
- ✅ Alternatif: Next.js (butuh SSR?), Svelte (kurang mature)
- ✅ Trade-off: Client-side rendering aja cukup, gak perlu SSR

### AI: Mastra Framework
- ✅ Kenapa: Integrasi gampang dengan Express, agent + tools built-in
- ✅ Alternatif: LangChain (lebih kompleks), Vercel AI SDK (butuh Next.js)
- ✅ Trade-off: Masih baru, dokumentasi terbatas

### Deploy: Railway (Backend) + Vercel (Frontend)
- ✅ Kenapa: Free tier cukup, integrasi Git, auto SSL
- ✅ Alternatif: AWS (kompleks), DigitalOcean (perlu setup sendiri)
```

### ADR (Architecture Decision Record)

Format dokumentasi keputusan arsitektur:

```markdown
# ADR-001: Pake PostgreSQL instead of MongoDB

## Status
Accepted (2025-01-15)

## Context
Kami perlu database untuk menyimpan data user, trip, dan destinasi.
Ada relasi one-to-many antara user → trips → destinations.

## Decision
Pake PostgreSQL dengan Prisma ORM.

## Consequences
- ✅ Relasi SQL lebih natural untuk data ini
- ✅ Prisma memberikan type safety
- ❌ Perlu setup dan migrasi database (lebih berat dari MongoDB)
- ❌ Scaling horizontal lebih susah dari MongoDB

## Alternatives Considered
- MongoDB: Lebih gampang scaling, tapi gak cocok buat relasi
- SQLite: Gak cocok buat production (single writer)
```

## Sprint Planning

Setiap sprint = 1 minggu (2 sesi × 2 jam = 4 jam).

### Sprint Planning Checklist

```markdown
Sebelum Sprint:
- [ ] Product backlog diurutkan berdasarkan prioritas
- [ ] User stories punya acceptance criteria jelas
- [ ] Estimasi effort tiap task (points / hours)
- [ ] Kapasitas tim dihitung (jam tersedia)

Sprint Planning Meeting:
- [ ] Tentukan sprint goal (1-2 kalimat)
- [ ] Pilih stories dari backlog → sprint backlog
- [ ] Breakdown task → subtask teknis
- [ ] Assign task ke anggota tim
- [ ] Set deadline tiap task

Setelah Planning:
- [ ] Update GitHub Project Board
- [ ] Notifikasi ke tim (Slack/Telegram/Discord)
- [ ] Start coding 🚀
```

### Sprint Template

```markdown
# Sprint 1 — Setup & Authentication
**Goal:** User bisa register, login, dan lihat dashboard kosong
**Duration:** 7 hari (2 sesi belajar + coding mandiri)

## Sprint Backlog
| Task | Estimasi | Assignee | Status |
|------|----------|----------|--------|
| Setup Express + TypeScript | 2h | Budi | ✅ |
| Setup Prisma + PostgreSQL | 1h | Budi | ✅ |
| Bikin schema User | 30m | Budi | ✅ |
| Register API endpoint | 2h | Siti | ✅ |
| Login API endpoint | 1h | Siti | ✅ |
| JWT middleware | 1h | Siti | ✅ |
| Frontend setup (Vite + React) | 1h | Rudi | ✅ |
| Register page | 2h | Rudi | ✅ |
| Login page | 1h | Rudi | ✅ |
| Dashboard page (kosong) | 1h | Rudi | ✅ |

## Sprint Review
- ✅ Semua task selesai
- ⏱ Actual: 12.5h (estimasi 14h)
- 📝 Lessons: JWT secret management perlu dibahas lebih detail

## Retrospective
### What went well
- Setup Express + Prisma cepet karena udah familiar
- Pembagian tugas frontend-backend jelas

### What to improve
- Next sprint: daily check-in biar gak ada yang stuck
- Perlu bikin API contract dulu sebelum coding
```

## Sprint Retrospective

Format retrospektif tiap akhir sprint:

```markdown
## Sprint 1 Retro

### 😊 What went well
- Setup cepet, typingan pada lancar
- API contract dibahas di awal → gak ada miskomunikasi

### 😟 What to improve
- Testing belum ada — next sprint harus ada minimal unit test
- Documentation kurang — tiap endpoint perlu dicatat

### 🎯 Action Items
1. [Budi] Setup Vitest + contoh unit test
2. [Siti] Bikin POSTMAN collection
3. [Rudi] Dokumentasi API di README
```

## Documentation Standards

### File Structure Documentation

```markdown
project/
├── README.md              # Project overview + quick start
├── PROMPT-LOG.md          # Log of AI prompts used
├── ARCHITECTURE.md        # Arsitektur + ERD + data flow
├── API.md                 # Endpoint documentation
├── SETUP.md               # Step-by-step setup guide
├── CONTRIBUTING.md        # Panduan kontribusi (kalo tim)
└── SPRINT-REVIEWS.md      # Catatan tiap sprint review
```

### README Template

```markdown
# AI Travel Planner

Full-stack AI-powered travel planning app. User bisa rencanain
perjalanan, dapet rekomendasi itinerary dari AI, dan cek cuaca
destinasi.

## Tech Stack
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **AI:** Mastra Framework (OpenAI)
- **Deploy:** Vercel (frontend) + Railway (backend)

## Features
- ✈️ CRUD trips dengan destinasi & tanggal
- 🤖 AI itinerary recommendation (Mastra agent)
- 🌤️ Weather check per destinasi
- 🔐 JWT authentication
- 📱 Responsive mobile + desktop

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL
- OpenAI API key

### Installation
```bash
git clone https://github.com/username/travel-planner
cd travel-planner
cp .env.example .env  # isi API keys
npm install
npx prisma migrate dev
npm run dev
```

### Environment Variables
| Variable | Description |
|----------|-------------|
| DATABASE_URL | PostgreSQL connection string |
| JWT_SECRET | Secret key untuk JWT |
| OPENAI_API_KEY | API key dari OpenAI |
| OPENWEATHER_API_KEY | API key untuk weather |

### API Docs
See [API.md](API.md) for full endpoint documentation.

## Live Demo
- Frontend: https://travel-planner.vercel.app
- Backend: https://travel-planner-backend.up.railway.app

## Screenshots
![Dashboard](screenshots/dashboard.png)
![Trip Detail](screenshots/trip-detail.png)

## Team
- Budi — Backend Developer
- Siti — Frontend Developer
- Rudi — Full-stack Developer

## License
MIT
```

### API Documentation Template

```markdown
# API Documentation

Base URL: `https://travel-planner-backend.up.railway.app/api`

## Authentication

### POST /auth/register
Register user baru.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepass123"
}
```

**Response (201):**
```json
{
  "token": "eyJhbGci...",
  "user": { "id": "uuid", "email": "user@example.com" }
}
```

**Errors:**
- 400: Email already registered
- 400: Invalid email format

### POST /auth/login
Login user existing.

---

## Trips

### GET /trips
Get all trips for current user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "id": "uuid",
    "title": "Liburan Bali",
    "destination": "Bali",
    "startDate": "2025-06-01",
    "endDate": "2025-06-07",
    "createdAt": "2025-05-01T12:00:00Z"
  }
]
```

### POST /trips
Create new trip.

### GET /trips/:id
Get trip detail.

### PUT /trips/:id
Update trip.

### DELETE /trips/:id
Delete trip.

---

## AI

### POST /ai/chat
Chat dengan AI travel agent.

**Request:**
```json
{
  "message": "Rencanain itinerary 3 hari di Yogyakarta"
}
```

**Response:** Text stream (SSE)
```text
Hari 1: Pagi - Candi Borobudur...
Hari 2: ...
```
```

## PROMPT-LOG.md — Dokumentasi Prompt AI

```markdown
# PROMPT-LOG.md

Semua prompt yang dipake selama pengembangan dicatat di sini.

## Setup & Scaffolding

### Generate ERD
> "Generate ERD for a travel planner app with users, trips, and destinations. Include fields and relationships."

### Generate Migration
> "Create a PostgreSQL migration script for: users table (id UUID PK, email unique, password hash, created_at), trips table (id UUID PK, user_id FK, title, destination, start_date, end_date)"

## Feature Development

### Auth Middleware
> "Write Express middleware for JWT auth. It should extract Bearer token from Authorization header, verify with jsonwebtoken, and attach decoded user to req.user."

### AI Agent
> "Create a Mastra travel agent with 3 tools: get-weather (fetch from OpenWeatherMap), search-places (search nearby attractions), save-itinerary (save to database). The agent should ask user for destination and dates, then create a day-by-day itinerary."

## Debugging

### Error 500 on POST
> "This Express endpoint returns 500 on POST. Here's the code: [...]. What's wrong?"
```

## AI Prompt Exercises (Tambahan)

Sepanjang modul, tambahan latihan pake AI:

- "Generate user stories for a smart notes app with 5 features"
- "Help me define MVP scope for a quiz app — what's essential vs nice-to-have?"
- "Write acceptance criteria for this user story: As a user, I want to filter trips by date"
- "Create a sprint plan for 1 week with these 8 tasks: ..."
- "Compare tech stacks for a real-time chat app: Socket.io vs WebSocket vs tRPC subscriptions"
- "Review my README and tell me what's missing"
- "Generate ADR for choosing Tailwind CSS over styled-components"
- "Help me prioritize these 10 features using the MoSCoW method"
