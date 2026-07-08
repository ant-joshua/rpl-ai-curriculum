# Sesi 3: AI Tutor & Review System

> **Durasi**: 2 minggu (Sprint 3)
> **Fokus**: Integrasi Mastra AI agent, AI code review, AI exercise generator, AI tutor chat

## 🎯 Tujuan Sesi

Setelah menyelesaikan sesi ini, mahasiswa mampu:

1. Mengintegrasikan Mastra AI framework ke dalam aplikasi bootcamp
2. Membangun tool AI Code Review untuk meninjau submission otomatis
3. Membangun tool AI Exercise Generator untuk membuat soal latihan
4. Membangun tool AI Tutor untuk menjawab pertanyaan konseptual
5. Mengimplementasikan hook auto-review setelah submission
6. Menyimpan dan menampilkan hasil review AI ke mahasiswa
7. Menulis unit test AI tools dengan mocking LLM

## 📋 Ringkasan Materi

### Arsitektur AI Integration

Sistem AI Coding Bootcamp menggunakan satu Mastra agent dengan tiga tools terpisah:

```
Client (Browser)
    │
    ├── POST /api/lessons/:id/submissions
    │       → Simpan submission
    │       → Jalankan sandbox
    │       → Panggil Mastra Agent → reviewCode tool
    │           Output: { summary, lineComments[], score }
    │
    ├── POST /api/ai/generate-exercise (instructor only)
    │       → Panggil Mastra Agent → generateExercise tool
    │           Output: { exercises: [{ title, description, starterCode, testCases }] }
    │
    └── POST /api/ai/explain (student only)
            → Panggil Mastra Agent → explainConcept tool
                Output: { explanation, relatedTopics[], codeExample? }
```

### Mastra Agent Definition

```typescript
import { Agent } from '@mastra/core';
import { openai } from '@mastra/providers';

const bootcampAgent = new Agent({
  name: 'coding-bootcamp-ai',
  instructions: `Kamu adalah asisten pengajar coding bootcamp.
Tugasmu:
1. Me-review kode mahasiswa dengan memberikan saran konkret dan detail
2. Membuat soal latihan coding dengan test case
3. Menjelaskan konsep pemrograman dengan contoh kode

Gunakan bahasa Indonesia. Berikan contoh kode jika relevan.
Bersikap konstruktif dan mendukung proses belajar.`,
  model: openai('gpt-4o'),
  tools: [reviewCodeTool, generateExerciseTool, explainConceptTool],
});
```

### Tool 1: reviewCode

Tool ini dipanggil otomatis setiap kali mahasiswa submit kode:

```typescript
const reviewCodeTool = {
  name: 'reviewCode',
  description: 'Review kode mahasiswa dan berikan feedback',
  inputSchema: {
    type: 'object',
    properties: {
      code: { type: 'string' },
      language: { type: 'string', enum: ['javascript', 'python', 'typescript'] },
      lessonContext: { type: 'string' },
    },
  },
  execute: async ({ input }) => {
    // LLM call menghasilkan review
    return {
      summary: 'Kode sudah baik, namun ada beberapa area yang bisa ditingkatkan...',
      lineComments: [
        { line: 5, message: 'Variabel ini bisa menggunakan const instead of let', severity: 'suggestion' },
        { line: 12, message: 'Function ini tidak pernah dipanggil', severity: 'warning' },
      ],
      score: 85,
    };
  },
};
```

**Prompt template**: "Review kode {language} berikut dalam konteks materi: {lessonContext}. Berikan skor 0-100, daftar komentar per baris (dengan line number, message, severity: error/warning/suggestion), dan ringkasan keseluruhan."

### Tool 2: generateExercise

Dipanggil manual oleh instruktur untuk membuat soal latihan:

```typescript
const generateExerciseTool = {
  name: 'generateExercise',
  description: 'Generate soal latihan coding',
  inputSchema: {
    type: 'object',
    properties: {
      topic: { type: 'string' },
      difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
      count: { type: 'number', minimum: 1, maximum: 5 },
    },
  },
  execute: async ({ input }) => {
    return {
      exercises: [
        {
          title: 'Buat Function Fibonacci',
          description: 'Buat function yang mengembalikan deret Fibonacci hingga n...',
          starterCode: 'function fibonacci(n) {\n  // Tulis kodemu di sini\n}',
          testCases: [
            { input: 'fibonacci(5)', expectedOutput: '[0, 1, 1, 2, 3]' },
            { input: 'fibonacci(8)', expectedOutput: '[0, 1, 1, 2, 3, 5, 8, 13]' },
          ],
        },
      ],
    };
  },
};
```

**Prompt template**: "Buat {count} soal coding {difficulty} tentang {topic}. Sertakan test case untuk setiap soal. Soal dalam Bahasa Indonesia."

### Tool 3: explainConcept

Dipanggil oleh mahasiswa untuk bertanya konsep pemrograman:

```typescript
const explainConceptTool = {
  name: 'explainConcept',
  description: 'Jelaskan konsep pemrograman',
  inputSchema: {
    type: 'object',
    properties: {
      question: { type: 'string' },
      courseContext: { type: 'string' },
    },
  },
  execute: async ({ input }) => {
    return {
      explanation: 'Closure adalah fungsi yang memiliki akses ke scope parent-nya...',
      relatedTopics: ['Higher-order function', 'Scope chain', 'Callback'],
      codeExample: 'function outer() {\n  const msg = "Hello";\n  return function inner() {\n    console.log(msg);\n  };\n}',
    };
  },
};
```

**Prompt template**: "Jelaskan konsep berikut dalam konteks kursus {courseContext}: {question}. Berikan contoh kode jika relevan. Gunakan Bahasa Indonesia."

### Auto-Review Hook

Setelah submission, sistem otomatis memanggil AI review:

```typescript
// services/submission.service.ts
async submitCode(lessonId: string, userId: string, code: string, language: string) {
  // 1. Simpan submission
  const submission = await db.insert(submissions).values({
    lessonId, userId, code, language, status: 'pending',
  }).returning();

  // 2. Jalankan sandbox eksekusi
  const output = await sandboxService.execute(code, language);
  await db.update(submissions).set({ executionOutput: output }).where(eq(submissions.id, submission.id));

  // 3. Panggil AI review (fire and forget — jangan blok response)
  reviewService.reviewSubmission(submission.id, lessonId, code, language).catch(console.error);

  // 4. Return submission
  return { ...submission, executionOutput: output };
}
```

### Menampilkan Review

Halaman detail submission menampilkan hasil review AI:

- **Score**: Ditampilkan sebagai progress bar dengan warna (merah < 60, kuning 60-80, hijau > 80)
- **Summary**: Ringkasan review dalam paragraf
- **Line Comments**: Setiap komentar ditampilkan dengan nomor baris, message, dan icon severity
- **Kode**: Ditampilkan dengan highlight pada baris yang dikomentari

### AI Logging & Monitoring

Setiap panggilan AI dicatat untuk debugging dan biaya:

```typescript
// db/schema.ts - ai_logs table
const aiLogs = pgTable('ai_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  agentName: varchar('agent_name', { length: 100 }).notNull(),
  toolName: varchar('tool_name', { length: 100 }).notNull(),
  input: jsonb('input'),
  output: jsonb('output'),
  durationMs: integer('duration_ms').notNull(),
  success: boolean('success').notNull().default(true),
  createdAt: timestamptz('created_at').defaultNow(),
});
```

## 🛠️ Latihan

### Latihan 1: Setup Mastra Agent

Integrasi Mastra ke Express:

1. Install `@mastra/core` dan provider LLM
2. Definisi agent di `src/agents/bootcamp.agent.ts` dengan 3 tools
3. Setup environment variable untuk API key LLM
4. Verifikasi agent dengan test panggilan sederhana
5. Setup error handling untuk AI calls (timeout 30s)

**Kriteria sukses**: Agent terdefinisi, bisa dipanggil dari service.

### Latihan 2: AI Code Review Tool

Bangun tool reviewCode:

1. Implementasi tool dengan input {code, language, lessonContext}
2. Output: {summary, lineComments[], score}
3. Prompt engineering: minta review konstruktif, Bahasa Indonesia
4. Parse response LLM jadi format terstruktur
5. Simpan hasil review ke tabel code_reviews

**Kriteria sukses**: Submission otomatis direview, hasil tersimpan di DB.

### Latihan 3: Tampilkan Review ke Mahasiswa

Buat UI untuk menampilkan review:

1. Halaman detail submission dengan score, summary, line comments
2. Highlight baris kode yang dikomentari
3. Warna severity: merah (error), kuning (warning), biru (suggestion)
4. Tombol navigasi ke submission berikutnya/sebelumnya
5. Print-friendly layout untuk review

**Kriteria sukses**: Review AI tampil dengan format jelas, baris kode ter-highlight.

### Latihan 4: AI Exercise Generator

Bangun tool generateExercise:

1. Implementasi tool dengan input {topic, difficulty, count}
2. Output array exercises dengan test cases
3. Simpan hasil generate ke tabel exercises
4. Halaman instructor untuk generate: pilih topic, difficulty, jumlah
5. Preview hasil sebelum disimpan sebagai draft lesson

**Kriteria sukses**: Instruktur bisa generate soal, soal tersimpan di database.

### Latihan 5: AI Tutor Chat

Bangun AI tutor chat:

1. Implementasi tool explainConcept dengan input {question, courseContext}
2. Endpoint `POST /api/ai/explain`
3. Halaman chat per lesson: input pertanyaan → tampilkan jawaban AI
4. Riwayat chat per user per lesson (disimpan di DB)
5. Loading state dengan typing indicator

**Kriteria sukses**: Mahasiswa bisa bertanya, AI menjawab dengan konteks kursus.

### Latihan 6: Manual Review Override

Instruktur bisa override review AI:

1. Instructor lihat submission + review AI
2. Instructor bisa edit score, tulis komentar manual
3. Simpan sebagai review baru dengan reviewer = 'instructor'
4. Tampilkan badge "AI Review" vs "Instructor Review"
5. History perubahan review

**Kriteria sukses**: Instructor bisa override review, history tercatat.

### Latihan 7: Unit Test AI Tools

Tulis unit test dengan mocking:

1. Mock Mastra Agent untuk return response konsisten
2. Test reviewCode dengan berbagai input kode (valid, error, empty)
3. Test generateExercise dengan berbagai difficulty
4. Test explainConcept dengan berbagai topik
5. Test error handling: LLM timeout, invalid response
6. Coverage ≥70% untuk AI service

**Kriteria sukses**: Semua test passing, AI tools teruji dengan mock.

## 📚 Referensi

- [Mastra AI Documentation](https://mastra.ai/docs)
- [OpenAI Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)
- [JSON Schema for Tool Definition](https://json-schema.org/learn/getting-started-step-by-step)
- [Vitest Mock Functions](https://vitest.dev/api/vi.html)

---
**Capstone 5 — Sesi 3: AI Tutor & Review System.** Lanjut ke [Sesi 4: Dashboard, Testing & Deployment](04-deploy-scale.md).
