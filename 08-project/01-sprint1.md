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
