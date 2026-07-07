<img src="https://images.pexels.com/photos/5530437/pexels-photo-5530437.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&dpr=1" alt="AI Study Assistant" style="width:100%;border-radius:12px;margin:12px 0;">

# 🧠 AI Study Assistant — Showcase Project

> **Contoh hasil jadi Capstone 1: AI Study Assistant**
> Platform belajar berbasis AI dengan tutor cerdas, quiz generator, dan RAG dari materi kuliah.

| Metadata | Detail |
|----------|--------|
| **Level** | 🚀 Advanced |
| **Tipe** | Kelompok (3-4 orang) |
| **Durasi** | 8 minggu (4 sprint × 2 minggu) |
| **Stack Utama** | Next.js, Mastra AI, OpenAI, Prisma, PostgreSQL |
| **Demo** | [🔗 Live Demo](#) *(isi dengan URL deployment)* |
| **GitHub** | [📦 Repository](#) *(isi dengan URL repo)* |

---

## 📸 Screenshot

<img src="https://via.placeholder.com/800x450/1a1a2e/e0e0e0?text=AI+Study+Assistant+-+Dashboard" alt="Dashboard" style="border-radius:8px;width:100%;max-width:800px;">
<img src="https://via.placeholder.com/800x450/16213e/e0e0e0?text=Chat+AI+Tutor+-+RAG+Q%26A" alt="Chat AI Tutor" style="border-radius:8px;width:100%;max-width:800px;margin-top:8px;">
<img src="https://via.placeholder.com/800x450/0f3460/e0e0e0?text=Quiz+Generator+Mode" alt="Quiz Generator" style="border-radius:8px;width:100%;max-width:800px;margin-top:8px;">

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT (Next.js)                              │
│  ┌──────────┐  ┌──────────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │ Dashboard│  │ Chat UI      │  │ Quiz     │  │ Progress         │   │
│  │ Page     │  │ (SSE Stream) │  │ Generator│  │ Tracker          │   │
│  └──────────┘  └──────┬───────┘  └──────────┘  └──────────────────┘   │
│                       │                                                │
│           Next.js API Routes (server-side)                             │
└───────────────────────┼────────────────────────────────────────────────┘
                        │ POST /api/chat
                        │ POST /api/quiz/generate
                        │ POST /api/rag/query
                        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      NEXT.JS API LAYER                                  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                  Mastra AI Agent Orchestrator                    │   │
│  │                                                                  │   │
│  │  ┌──────────────────┐   ┌──────────────────┐                    │   │
│  │  │  StudyAgent      │   │  QuizAgent       │                    │   │
│  │  │  - RAG Tool      │   │  - Generate Tool  │                    │   │
│  │  │  - Chat Memory   │   │  - Validate Tool  │                    │   │
│  │  └────────┬─────────┘   └────────┬─────────┘                    │   │
│  │           │                       │                              │   │
│  │           └───────┬───────────────┘                              │   │
│  │                   ▼                                               │   │
│  │  ┌──────────────────────────────────────┐                        │   │
│  │  │         OpenAI GPT-4o-mini           │                        │   │
│  │  └──────────────────────────────────────┘                        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     Prisma ORM Layer                             │   │
│  │  ┌─────────────┐  ┌────────────────┐  ┌──────────────────┐     │   │
│  │  │ Users       │  │ Courses        │  │ ChatMessages     │     │   │
│  │  │ Documents   │  │ DocumentChunks │  │ QuizResults      │     │   │
│  │  └──────┬──────┘  └───────┬────────┘  └───────┬──────────┘     │   │
│  └─────────┼──────────────────┼──────────────────┼────────────────┘   │
└────────────┼──────────────────┼──────────────────┼────────────────────┘
             │                  │                  │
             ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         PostgreSQL                                      │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  pgvector extension → Vector search on DocumentChunks.embedding │   │
│  │  Relational data: users, courses, enrollments, chat_sessions    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Alur Data — Chat dengan RAG

```
User mengirim pertanyaan
        │
        ▼
Next.js API Route → POST /api/chat
        │
        ▼
1. Embed query → text-embedding-3-small
        │
        ▼
2. Vector search → SELECT FROM document_chunks
                   ORDER BY cosine_similarity(embedding, $query_embedding)
                   LIMIT 5
        │
        ▼
3. Mastra StudyAgent — system prompt + tools + context chunks
        │
        ▼
4. OpenAI GPT-4o-mini — generate jawaban berdasarkan konteks
        │
        ▼
5. SSE Streaming → Next.js Chat UI (token by token)
        │
        ▼
6. Simpan chat_messages ke PostgreSQL
```

---

## ✨ Fitur Unggulan

### 1. 🤖 Chat AI Tutor dengan RAG

Mahasiswa bisa bertanya tentang materi kuliah dalam bahasa alami. Sistem menjawab berdasarkan dokumen referensi yang telah diunggah dosen.

**Cara kerja:**
1. Dosen upload PDF/txt materi → sistem chunk + embedding → simpan ke pgvector
2. Mahasiswa tanya → query di-embed → vector search → ambil top-5 chunk relevan
3. Chunk + query → Mastra agent → LLM generate jawaban dengan sumber
4. Jawaban di-streaming ke UI via SSE (Server-Sent Events)

### 2. 📝 Quiz Generator

Generate soal pilihan ganda, esai, dan coding challenge secara otomatis dari materi kuliah.

| Mode | Deskripsi | Jumlah Soal |
|------|-----------|-------------|
| Pilihan Ganda | 4 opsi, 1 benar, dengan pembahasan | 5-20 soal |
| Esai | Soal terbuka, ada rubrik penilaian | 3-5 soal |
| Coding Challenge | Pseudocode / language-specific | 2-3 soal |

### 3. 📚 RAG Pipeline

Pipeline lengkap: upload → ekstraksi → chunking → embedding → search → generate.

```
Document Upload
      │
      ▼
Extract Text (PyMuPDF for PDF, fs for txt/md)
      │
      ▼
Text Chunking (fixed-size 512 token, overlap 128)
      │
      ▼
Generate Embedding (OpenAI text-embedding-3-small, 1536-d)
      │
      ▼
Store in PostgreSQL + pgvector
      │
      ▼
On Query: cosine similarity search → top-k context
```

### 4. 📊 Progress Tracking

- Riwayat chat per kursus
- Skor quiz dan analisis jawaban salah
- Statistik topik yang sering ditanyakan
- Rekomendasi materi yang perlu dipelajari ulang

---

## 💻 Tech Stack

| Layer | Teknologi | Konfigurasi |
|-------|-----------|-------------|
| **Frontend** | Next.js 14 (App Router) + Tailwind CSS + shadcn/ui | TypeScript, strict mode |
| **AI Framework** | Mastra AI (`@mastra/core`) | Agent + Tools + Memory |
| **LLM** | OpenAI GPT-4o-mini | Temperature: 0.3, Max tokens: 2048 |
| **Embedding** | OpenAI text-embedding-3-small | Dimension: 1536 |
| **ORM** | Prisma | PostgreSQL provider,迁移-based |
| **Database** | PostgreSQL 15 + pgvector | Vector: cosine similarity |
| **Auth** | NextAuth.js (Auth.js) | Credentials + JWT |
| **Streaming** | Server-Sent Events (SSE) | Via ReadableStream |
| **Deploy** | Vercel (FE) + Railway (BE+DB) | Environment variables via .env |

---

## 🔑 Code Snippet Penting

### 1. Definisi Agent Utama

```typescript
// src/agents/studyAgent.ts
import { Agent } from '@mastra/core/agent';
import { openai } from '@ai-sdk/openai';
import { ragTool } from '@/tools/ragTool';
import { courseInfoTool } from '@/tools/courseInfoTool';

export const studyAgent = new Agent({
  name: 'AI Study Assistant',
  instructions: `
    Kamu adalah AI Study Assistant — asisten belajar untuk mahasiswa.

    ATURAN UTAMA:
    1. Jawab berdasarkan dokumen materi yang sudah diupload.
    2. Gunakan ragTool untuk mencari konteks dari dokumen.
    3. Jika tidak ada konteks relevan, akui dengan jujur.
    4. Selalu sebutkan sumber jawaban (nama dokumen + bab).
    5. Gunakan bahasa Indonesia yang jelas dan santun.

    FORMAT JAWABAN:
    - Jawab langsung pertanyaan terlebih dahulu.
    - Tambahkan kutipan dari sumber jika relevan.
    - Akhiri dengan saran belajar lanjutan.

    LARANGAN:
    - Jangan halusinasi fakta.
    - Jangan memberikan jawaban di luar konteks materi kuliah.
    - Jangan mengakses file atau data di luar yang disediakan tools.
  `,
  model: {
    provider: 'OPEN_AI',
    name: 'gpt-4o-mini',
    temperature: 0.3,
    maxTokens: 2048,
  },
  tools: {
    ragTool,
    courseInfoTool,
  },
  memory: {
    type: 'working',
    lastN: 10,
    maxTokens: 4000,
  },
});
```

### 2. Pipeline RAG

```typescript
// src/lib/rag/pipeline.ts
import { openai } from '@ai-sdk/openai';
import { prisma } from '@/lib/prisma';
import { embed } from 'ai';

interface RAGResult {
  chunks: Array<{
    content: string;
    docTitle: string;
    chunkIndex: number;
    score: number;
  }>;
}

export async function retrieveContext(
  query: string,
  courseId: string,
  topK: number = 5,
  minScore: number = 0.7
): Promise<RAGResult> {
  // 1. Generate embedding untuk query
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: query,
  });

  // 2. Vector search via pgvector
  const chunks = await prisma.$queryRaw<
    Array<{
      content: string;
      docTitle: string;
      chunkIndex: number;
      score: number;
    }>
  >`
    SELECT
      dc.content,
      d.title AS "docTitle",
      dc.chunk_index AS "chunkIndex",
      1 - (dc.embedding <=> ${embedding}::vector) AS score
    FROM document_chunks dc
    JOIN documents d ON d.id = dc.document_id
    WHERE d.course_id = ${courseId}::uuid
      AND 1 - (dc.embedding <=> ${embedding}::vector) >= ${minScore}
    ORDER BY score DESC
    LIMIT ${topK}
  `;

  return { chunks };
}

// Chunking utility
export function chunkText(
  text: string,
  chunkSize: number = 512,
  overlap: number = 128
): string[] {
  const chunks: string[] = [];
  const tokens = text.split(/\s+/);
  let start = 0;

  while (start < tokens.length) {
    const end = Math.min(start + chunkSize, tokens.length);
    chunks.push(tokens.slice(start, end).join(' '));
    start += chunkSize - overlap;
  }

  return chunks;
}
```

### 3. Quiz Generator

```typescript
// src/agents/quizAgent.ts
import { Agent } from '@mastra/core/agent';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// Schema output quiz
const QuizSchema = z.object({
  questions: z.array(
    z.object({
      type: z.enum(['multiple-choice', 'essay', 'coding']),
      question: z.string(),
      options: z.array(z.string()).optional(),
      correctAnswer: z.string(),
      explanation: z.string(),
      difficulty: z.enum(['easy', 'medium', 'hard']),
      topic: z.string(),
    })
  ),
});

export const quizAgent = new Agent({
  name: 'Quiz Generator',
  instructions: `
    Kamu adalah generator soal kuliah berbasis AI.

    TUGAS:
    - Buat soal berdasarkan materi yang diberikan.
    - Variasikan tipe soal: pilihan ganda, esai, coding.
    - Setiap soal harus memiliki:
      * Pertanyaan yang jelas dan spesifik
      * Jawaban benar yang akurat
      * Penjelasan yang mendidik
      * Tingkat kesulitan yang sesuai
    - Untuk pilihan ganda: 4 opsi (A-D), 1 benar.
    - Untuk esai: sertakan rubrik penilaian singkat.
    - Untuk coding: berikan test case contoh.

    FORMAT OUTPUT: JSON strict sesuai schema.
  `,
  model: {
    provider: 'OPEN_AI',
    name: 'gpt-4o-mini',
    temperature: 0.7,
  },
  output: QuizSchema,
});

// API Route untuk generate quiz
// app/api/quiz/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { quizAgent } from '@/agents/quizAgent';
import { retrieveContext } from '@/lib/rag/pipeline';

export async function POST(req: NextRequest) {
  const { courseId, topic, count = 5, type = 'mixed' } = await req.json();

  // Ambil konteks materi untuk generate soal
  const context = await retrieveContext(
    `Buatkan soal tentang ${topic || 'materi ini'}`,
    courseId,
    10
  );

  const prompt = `
    Buatkan ${count} soal ${type} tentang topik: ${topic || 'materi kuliah'}.

    KONTEKS MATERI:
    ${context.chunks.map((c) => `[${c.docTitle}] ${c.content}`).join('\n\n')}

    Variasikan tingkat kesulitan (easy/medium/hard).
    Pastikan setiap soal bisa dijawab berdasarkan konteks di atas.
  `;

  const response = await quizAgent.execute(prompt);
  const questions = QuizSchema.parse(response);

  // Simpan hasil ke database
  const quiz = await prisma.quiz.create({
    data: {
      courseId,
      topic,
      questionCount: questions.questions.length,
      questions: questions.questions,
    },
  });

  return NextResponse.json({ quizId: quiz.id, questions: questions.questions });
}
```

### 4. Middleware Auth & Rate Limit

```typescript
// src/middleware/auth.ts
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function withAuth(
  req: NextRequest,
  handler: (req: NextRequest, session: Session) => Promise<NextResponse>
) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Rate limit: 30 requests per session per hour
  const rateLimitKey = `rl:${session.user.id}:${req.nextUrl.pathname}`;
  const current = await redis.incr(rateLimitKey);
  if (current === 1) {
    await redis.expire(rateLimitKey, 3600);
  }
  if (current > 30) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Silakan coba lagi nanti.' },
      { status: 429 }
    );
  }

  return handler(req, session);
}
```

### 5. SSE Streaming untuk Chat

```typescript
// app/api/chat/route.ts
import { NextRequest } from 'next/server';
import { studyAgent } from '@/agents/studyAgent';
import { retrieveContext } from '@/lib/rag/pipeline';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { message, courseId, sessionId } = await req.json();

  // Cari konteks dari RAG
  const context = await retrieveContext(message, courseId);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Kirim sinyal start
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'start' })}\n\n`));

        // Execute agent dengan streaming
        const result = await studyAgent.execute(
          `KONTEKS MATERI:\n${context.chunks.map(c => `[${c.docTitle}] ${c.content}`).join('\n')}\n\nPERTANYAAN: ${message}`,
          {
            onToken: (token: string) => {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'token', content: token })}\n\n`)
              );
            },
          }
        );

        // Kirim sumber referensi
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'sources',
              sources: context.chunks.map((c) => ({
                title: c.docTitle,
                score: c.score,
              })),
            })}\n\n`
          )
        );

        // Kirim sinyal selesai
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
      } catch (error) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: 'error', message: 'Gagal memproses pertanyaan' })}\n\n`
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
```

### 6. Prisma Schema (Inti)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  STUDENT
  LECTURER
}

model User {
  id           String   @id @default(uuid()) @db.Uuid
  email        String   @unique
  passwordHash String
  fullName     String
  role         Role     @default(STUDENT)
  avatarUrl    String?
  createdAt    DateTime @default(now())

  courses       Course[]
  enrollments   Enrollment[]
  chatSessions  ChatSession[]
  quizResults   QuizResult[]
}

model Course {
  id          String   @id @default(uuid()) @db.Uuid
  title       String
  description String?
  code        String   @unique
  lecturerId  String   @db.Uuid
  createdAt   DateTime @default(now())

  lecturer      User              @relation(fields: [lecturerId], references: [id])
  documents     Document[]
  enrollments   Enrollment[]
  chatSessions  ChatSession[]
  quizzes       Quiz[]
}

model Document {
  id          String   @id @default(uuid()) @db.Uuid
  courseId    String   @db.Uuid
  title       String
  fileUrl     String
  fileType    String
  uploadedBy  String   @db.Uuid
  chunkCount  Int      @default(0)
  createdAt   DateTime @default(now())

  course    Course          @relation(fields: [courseId], references: [id])
  uploader  User            @relation(fields: [uploadedBy], references: [id])
  chunks    DocumentChunk[]
}

model DocumentChunk {
  id          String   @id @default(uuid()) @db.Uuid
  documentId  String   @db.Uuid
  chunkIndex  Int
  content     String
  embedding   Unsupported("vector(1536)")?
  metadata    Json?
  createdAt   DateTime @default(now())

  document Document @relation(fields: [documentId], references: [id], onDelete: Cascade)

  @@index([documentId])
  @@index([embedding], type: Btree) // pgvector index via raw SQL
}

model ChatSession {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @db.Uuid
  courseId  String   @db.Uuid
  title     String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())

  user     User          @relation(fields: [userId], references: [id])
  course   Course        @relation(fields: [courseId], references: [id])
  messages ChatMessage[]
}

model ChatMessage {
  id        String   @id @default(uuid()) @db.Uuid
  sessionId String   @db.Uuid
  role      String
  content   String
  sources   Json?
  feedback  Int?
  createdAt DateTime @default(now())

  session ChatSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
}

model Quiz {
  id            String   @id @default(uuid()) @db.Uuid
  courseId      String   @db.Uuid
  topic         String?
  questionCount Int
  questions     Json
  createdAt     DateTime @default(now())

  course  Course       @relation(fields: [courseId], references: [id])
  results QuizResult[]
}

model QuizResult {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @db.Uuid
  quizId    String   @db.Uuid
  answers   Json
  score     Int
  total     Int
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
  quiz Quiz @relation(fields: [quizId], references: [id])
}
```

---

## 🧪 Contoh Interaksi

### Chat dengan Tutor

```
USER: Jelaskan konsep JOIN di SQL beserta contohnya?

AGENT: Baik, saya jelaskan berdasarkan materi Basis Data yang sudah diupload.

## JOIN di SQL

JOIN adalah operasi untuk menggabungkan baris dari dua atau lebih tabel berdasarkan kolom yang berelasi.

### INNER JOIN
Mengembalikan baris yang memiliki kecocokan di kedua tabel.

```sql
SELECT mahasiswa.nama, jurusan.nama_jurusan
FROM mahasiswa
INNER JOIN jurusan ON mahasiswa.jurusan_id = jurusan.id;
```

### LEFT JOIN
Mengembalikan semua baris dari tabel kiri, dan baris yang cocok dari tabel kanan.

```sql
SELECT mahasiswa.nama, peminjaman.buku
FROM mahasiswa
LEFT JOIN peminjaman ON mahasiswa.id = peminjaman.mahasiswa_id;
```

**Sumber:** Modul Basis Data - Bab 4: Query Lanjutan (halaman 45-52)

Ada yang ingin ditanyakan lebih lanjut? Saya bisa bantu dengan contoh kasus spesifik!
```

### Quiz Generate

```
Generated 5 soal pilihan ganda tentang "Database Normalization":

1. (Easy) Apa tujuan utama normalisasi database?
   A. Mempercepat query
   B. Mengurangi redundansi data ✓
   C. Menambah jumlah tabel
   D. Memperumit struktur

2. (Medium) Sebuah tabel memenuhi 2NF jika...
   A. Memenuhi 1NF dan semua atribut non-key bergantung penuh pada primary key ✓
   B. Tidak ada transitive dependency
   C. Semua kolom bernilai atomic
   D. Memiliki composite key

3. (Hard) Dalam dekomposisi 3NF, jika terdapat dependency:
    A → B, B → C, maka...
   A. Tabel sudah dalam 3NF
   B. Terdapat transitive dependency, perlu dipecah ✓
   C. Langsung 4NF
   D. Tidak bisa dinormalisasi
```

---

## 📦 Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/study_assistant"

# OpenAI
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4o-mini"

# NextAuth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# Mastra
MASTRA_API_KEY="..."
MASTRA_AGENT_ID="study-assistant-v1"
```

---

## 🚀 Cara Menjalankan

```bash
# 1. Clone repo
git clone <repo-url>
cd ai-study-assistant

# 2. Install dependencies
npm install

# 3. Setup database
cp .env.example .env
npx prisma migrate dev

# 4. Seed data dummy
npx tsx prisma/seed.ts

# 5. Jalankan development
npm run dev

# 6. Buka browser
open http://localhost:3000
```

---

## ✅ Deliverables Checklist

| # | Deliverable | Status |
|---|-------------|--------|
| 1 | Repository GitHub dengan README | ✅ |
| 2 | Database schema + migration (Prisma) | ✅ |
| 3 | Auth flow (NextAuth + JWT) | ✅ |
| 4 | Course CRUD (lecturer) | ✅ |
| 5 | Document upload + chunking + embedding | ✅ |
| 6 | RAG pipeline (pgvector) | ✅ |
| 7 | Mastra agent integration (tools + memory) | ✅ |
| 8 | Chat UI + SSE streaming | ✅ |
| 9 | Source citation | ✅ |
| 10 | Quiz generator | ✅ |
| 11 | Feedback (thumb up/down) | ✅ |
| 12 | Progress tracking dashboard | ✅ |
| 13 | Deployment (Vercel + Railway) | ✅ |
| 14 | Video demo (3-5 menit) | ✅ |

---

## 📈 Metrik Keberhasilan

| Metrik | Target | Hasil |
|--------|--------|-------|
| Response time chat | < 3 detik | ⏳ |
| RAG accuracy (context recall) | > 85% | ⏳ |
| Quiz question relevance | > 80% | ⏳ |
| User satisfaction (feedback) | > 4.0/5.0 | ⏳ |
| Uptime | > 99% | ⏳ |

---

## 📚 Yang Dipelajari dari Project Ini

1. **Full-stack Next.js** — App Router, server actions, API routes, middleware
2. **AI Agent Orchestration** — Mastra framework, tool calling, memory management
3. **RAG Pipeline** — Text chunking, embedding, vector search, context retrieval
4. **LLM Integration** — Prompt engineering, streaming, structured output (Zod)
5. **Database Design** — PostgreSQL + pgvector, relational + vector search hybrid
6. **Real-time Streaming** — SSE implementation, token-by-token delivery
7. **Testing AI Pipeline** — Eval set, faithfulness metrics, LLM-as-judge

---

## 🔗 Link Terkait

- [🔗 Live Demo](#) — *Ganti dengan URL deployment*
- [📦 GitHub Repository](#) — *Ganti dengan URL repo*
- [📹 Video Demo](#) — *Ganti dengan link YouTube*
- [📋 Slide Presentasi](#) — *Ganti dengan link Google Slides*
- [📊 Laporan Akhir](#) — *Ganti dengan link PDF*

---

> **Dibuat oleh:** [Nama Kelompok] — RPL AI Curriculum Capstone 1  
> **Dosen Pembimbing:** [Nama Dosen]  
> **Semester:** Ganjil 2025/2026  

---

*Project showcase ini adalah contoh referensi. Hasil implementasi sesungguhnya dapat bervariasi.*
