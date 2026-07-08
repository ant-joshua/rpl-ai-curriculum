# Sesi 2: Real-time Features & AI Integration

> **Durasi**: 2 minggu (Sprint 3)
> **Fokus**: Mastra AI agent, AI suggest answer, auto-tag, content moderation, notifikasi real-time

## 🎯 Tujuan Sesi

Setelah menyelesaikan sesi ini, mahasiswa mampu:

1. Mengintegrasikan Mastra AI framework ke dalam aplikasi Q&A
2. Membangun tool AI suggestAnswer untuk saran jawaban otomatis
3. Membangun tool AI autoTag untuk menyarankan tag berdasarkan isi pertanyaan
4. Membangun tool AI moderateContent untuk mendeteksi konten toxic
5. Mengimplementasikan middleware moderasi otomatis saat create question/answer
6. Membangun notifikasi real-time dengan Server-Sent Events (SSE)
7. Menulis unit test AI tools dengan mocking LLM

## 📋 Ringkasan Materi

### Arsitektur AI Integration

```
┌─────────────────────────────────────┐
│         Mastra Agent                │
│  ┌───────────────────────────────┐  │
│  │  Tools                         │  │
│  │  ├─ suggestAnswer              │  │
│  │  ├─ autoTag                    │  │
│  │  └─ moderateContent            │  │
│  └───────────────────────────────┘  │
│  Backend: LLM (OpenAI / Anthropic)   │
└─────────────────────────────────────┘
         ▲
         │ HTTP (REST)
         │
┌─────────┴──────────────┐
│   Express REST API     │
└────────────────────────┘
```

Setiap tool AI adalah fungsi independen yang dipanggil oleh Mastra agent. Agent menerima task dari route handler, memilih tool yang tepat, menjalankan LLM call, dan mengembalikan hasil terstruktur.

### Mastra Agent Setup

```typescript
import { Agent, Tool } from '@mastra/core';

const qaAgent = new Agent({
  name: 'qa-assistant',
  instructions: `Kamu adalah asisten Q&A untuk forum komunitas.
Tugasmu:
1. Memberikan saran jawaban untuk pertanyaan berdasarkan konten yang ada
2. Menyarankan tag yang relevan untuk pertanyaan baru
3. Memoderasi konten untuk mendeteksi toxic language

Gunakan Bahasa Indonesia. Bersikap profesional dan membantu.`,
  model: openai('gpt-4o'),
  tools: [suggestAnswerTool, autoTagTool, moderateContentTool],
});
```

### Tool 1: suggestAnswer

Tool ini memberikan saran jawaban otomatis saat pertanyaan baru dibuat:

- **Input**: `questionTitle: string`, `questionBody: string`, `existingAnswers: string[]`
- **Proses**: Agent menganalisis pertanyaan + jawaban yang sudah ada → menghasilkan saran jawaban baru yang tidak redundan
- **Output**: `{ answerSuggestion: string, confidence: number }`
- **Dipicu dari**: `POST /api/ai/suggest-answer` (manual oleh user)

```typescript
const suggestAnswerTool: Tool = {
  name: 'suggestAnswer',
  description: 'Generate answer suggestion for a question based on existing context',
  inputSchema: {
    type: 'object',
    properties: {
      questionTitle: { type: 'string' },
      questionBody: { type: 'string' },
      existingAnswers: { type: 'array', items: { type: 'string' } },
    },
    required: ['questionTitle', 'questionBody'],
  },
  execute: async ({ input }) => {
    return {
      answerSuggestion: 'Berdasarkan pertanyaan Anda, berikut adalah langkah-langkah...',
      confidence: 0.87,
    };
  },
};
```

**Prompt template**: "Analisis pertanyaan berikut: '{questionTitle}'. Detail: '{questionBody}'. Jawaban yang sudah ada: {existingAnswers}. Berikan saran jawaban baru yang tidak redundan. Sertakan confidence score 0-1."

### Tool 2: autoTag

Tool ini menyarankan tag untuk pertanyaan baru:

- **Input**: `questionTitle: string`, `questionBody: string`, `availableTags: { id, name }[]`
- **Proses**: Agent membaca isi pertanyaan → memilih 1-3 tag paling relevan dari availableTags
- **Output**: `{ suggestedTags: string[], newTagSuggestions?: string[] }`
- **Dipicu dari**: `POST /api/ai/auto-tag` (manual) atau otomatis saat POST /api/questions

```typescript
const autoTagTool: Tool = {
  name: 'autoTag',
  description: 'Suggest relevant tags for a question',
  inputSchema: {
    type: 'object',
    properties: {
      questionTitle: { type: 'string' },
      questionBody: { type: 'string' },
      availableTags: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
          },
        },
      },
    },
    required: ['questionTitle', 'questionBody', 'availableTags'],
  },
  execute: async ({ input }) => {
    return {
      suggestedTags: ['javascript', 'async-await'],
      newTagSuggestions: ['promise-all'],
    };
  },
};
```

### Tool 3: moderateContent

Tool ini mendeteksi konten toxic/offensive:

- **Input**: `text: string`
- **Proses**: Agent menganalisis teks untuk toksisitas (kebencian, pelecehan, spam)
- **Output**: `{ isToxic: boolean, reasons: string[], confidence: number }`
- **Dipicu dari**: Middleware Express — setiap POST/PUT question dan answer

```typescript
const moderateContentTool: Tool = {
  name: 'moderateContent',
  description: 'Detect toxic or offensive content in text',
  inputSchema: {
    type: 'object',
    properties: {
      text: { type: 'string' },
    },
    required: ['text'],
  },
  execute: async ({ input }) => {
    return {
      isToxic: false,
      reasons: [],
      confidence: 0.98,
    };
  },
};
```

### Middleware Moderasi Otomatis

Setiap pembuatan pertanyaan atau jawaban melewati middleware moderasi:

```typescript
// middleware/moderation.ts
async function moderationMiddleware(req, res, next) {
  const textToModerate = req.body.title
    ? `${req.body.title} ${req.body.body}`
    : req.body.body;

  try {
    const result = await qaAgent.execute({
      task: 'moderate content',
      tools: [moderateContentTool],
      data: { text: textToModerate },
    });

    if (result.isToxic && result.confidence > 0.7) {
      // Set flag moderasi, jangan blokir, tapi tandai dan notifikasi
      req.isModerated = true;
      req.moderationReasons = result.reasons;

      // Notifikasi user
      notificationService.create(req.user.id, 'moderated',
        'Konten Anda telah ditandai untuk moderasi', req.originalUrl);
    }

    next();
  } catch (error) {
    // Jika AI gagal, lanjutkan tanpa moderasi (fail open)
    console.error('Moderation AI failed:', error);
    next();
  }
}

// Penggunaan di route
router.post('/questions', authenticate, moderationMiddleware, questionController.create);
```

### Notifikasi Real-time dengan SSE

Server-Sent Events memungkinkan server push notifikasi ke browser:

```typescript
// routes/notification.routes.ts
import { Router } from 'express';
import { EventEmitter } from 'events';

const eventEmitter = new EventEmitter();
const router = Router();

// SSE endpoint untuk streaming notifikasi
router.get('/stream', authenticate, (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  // Kirim keepalive setiap 30 detik
  const keepAlive = setInterval(() => {
    res.write(':keepalive\n\n');
  }, 30000);

  // Listen event untuk user ini
  const onNotification = (notification) => {
    res.write(`data: ${JSON.stringify(notification)}\n\n`);
  };

  eventEmitter.on(`user:${req.user.id}`, onNotification);

  req.on('close', () => {
    clearInterval(keepAlive);
    eventEmitter.off(`user:${req.user.id}`, onNotification);
  });
});

// Trigger notifikasi dari service lain
export function sendNotification(userId, notification) {
  eventEmitter.emit(`user:${userId}`, notification);
}
```

### Frontend EventSource Listener

Di sisi frontend, gunakan EventSource untuk menerima notifikasi:

```typescript
// hooks/useNotificationStream.ts
export function useNotificationStream(token: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const eventSource = new EventSource(
      `${API_BASE}/notifications/stream?token=${token}`
    );

    eventSource.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      setNotifications(prev => [notification, ...prev]);
      // Tampilkan toast
      showToast(notification.message, 'info');
    };

    eventSource.onerror = (err) => {
      console.error('SSE error:', err);
      eventSource.close();
      // Reconnect setelah 5 detik
      setTimeout(() => {
        // reconnect logic
      }, 5000);
    };

    return () => eventSource.close();
  }, [token]);

  return notifications;
}
```

### Moderasi Content Pipeline Lengkap

Berikut alur moderasi dari awal sampai akhir:

```typescript
// middleware/moderation.pipeline.ts
export async function moderationPipeline(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const startTime = Date.now();
  const textToModerate = req.body.title
    ? `${req.body.title} ${req.body.body}`
    : req.body.body;

  try {
    const result = await safeAICall(
      () => qaAgent.execute({
        task: 'moderate content',
        tools: [moderateContentTool],
        data: { text: textToModerate },
      }),
      { isToxic: false, reasons: [], confidence: 0 }
    );

    // Log hasil moderasi
    await moderationLogService.log({
      userId: req.user.id,
      contentType: req.body.title ? 'question' : 'answer',
      contentPreview: textToModerate.substring(0, 100),
      isToxic: result.isToxic,
      confidence: result.confidence,
      reasons: result.reasons,
      durationMs: Date.now() - startTime,
    });

    if (result.isToxic && result.confidence > 0.7) {
      req.isModerated = true;
      req.moderationReasons = result.reasons;

      // Kirim notifikasi ke user
      await notificationService.create({
        userId: req.user.id,
        type: 'moderated',
        message: `Konten Anda ditandai: ${result.reasons.join(', ')}`,
        link: req.originalUrl,
      });

      // Notifikasi admin
      const admins = await userService.getAdmins();
      for (const admin of admins) {
        await notificationService.create({
          userId: admin.id,
          type: 'moderated',
          message: `Konten perlu review: ${result.reasons.join(', ')}`,
          link: `/admin/moderation`,
        });
        sendNotification(admin.id, {
          type: 'moderation_alert',
          message: `Konten perlu review: ${result.reasons.join(', ')}`,
        });
      }
    }

    next();
  } catch (error) {
    // Fail open — jangan blokir user karena AI error
    console.error('Moderation pipeline failed:', error);
    next();
  }
}
```

### Trigger Notifikasi

Notifikasi dikirim pada event berikut:

| Event | Tipe Notifikasi | Penerima |
|-------|----------------|----------|
| Pertanyaan dijawab | `new_answer` | Penulis pertanyaan |
| Jawaban di-vote | `vote` | Penulis jawaban |
| Jawaban diterima | `accepted` | Penulis jawaban |
| Konten dimoderasi | `moderated` | Penulis konten |

### AI Error Handling

Implementasi pattern fail-open untuk AI calls:

```typescript
async function safeAICall(fn, fallback) {
  try {
    const result = await Promise.race([
      fn(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI Timeout')), 15000)
      ),
    ]);
    return result;
  } catch (error) {
    console.error('AI call failed:', error);
    return fallback;
  }
}

// Penggunaan
const suggestion = await safeAICall(
  () => qaAgent.execute({ task: 'suggest answer', tools: [suggestAnswerTool], data }),
  { answerSuggestion: null, confidence: 0 }
);
```

## 🛠️ Latihan

### Latihan 1: Setup Mastra Agent

Integrasi Mastra ke proyek:

1. Install `@mastra/core` dan provider LLM (`@ai-sdk/openai`)
2. Definisi agent di `src/agents/qa.agent.ts`
3. Setup environment variable untuk API key
4. Verifikasi agent dengan panggilan test
5. Setup logging untuk setiap AI call (duration, success/fail)

**Kriteria sukses**: Agent terdefinisi, test panggilan return response.

### Latihan 2: AI Suggest Answer

Bangun tool suggestAnswer:

1. Implementasi tool dengan input {questionTitle, questionBody, existingAnswers}
2. Output {answerSuggestion, confidence}
3. Endpoint `POST /api/ai/suggest-answer`
4. Prompt engineering: cegah redundansi dengan existing answers
5. Tampilkan saran di frontend sebagai draf jawaban

**Kriteria sukses**: AI memberikan saran jawaban yang relevan dan tidak redundan.

### Latihan 3: AI Auto-Tag

Bangun tool autoTag:

1. Implementasi tool dengan input {questionTitle, questionBody, availableTags}
2. Output {suggestedTags, newTagSuggestions}
3. Endpoint `POST /api/ai/auto-tag`
4. Integrasi otomatis: panggil autoTag saat POST /api/questions
5. Tampilkan tag suggestions sebagai chip yang bisa dikonfirmasi user

**Kriteria sukses**: Auto-tag memberikan saran tag relevan, bisa diintegrasi otomatis.

### Latihan 4: AI Content Moderation

Bangun tool moderateContent:

1. Implementasi tool dengan input {text} → output {isToxic, reasons, confidence}
2. Buat middleware Express yang panggil moderateContent
3. Set flag is_moderated = true jika konten toxic (confidence > 0.7)
4. Kirim notifikasi ke user jika konten dimoderasi
5. Admin dashboard untuk review konten termoderasi

**Kriteria sukses**: Konten toxic terdeteksi, flag moderasi berfungsi, notifikasi terkirim.

### Latihan 5: Notifikasi Real-time dengan SSE

Implementasi SSE:

1. Endpoint `GET /api/notifications/stream` dengan SSE
2. Event emitter pattern untuk publish/subscribe
3. Trigger notifikasi: new_answer, vote, accepted, moderated
4. Frontend: EventSource listener → toast notification
5. Notification history: `GET /api/notifications`

**Kriteria sukses**: Notifikasi real-time muncul di browser, history tersimpan.

### Latihan 6: Admin Moderation Dashboard

Buat halaman admin untuk moderasi:

1. List konten yang dimoderasi (is_moderated = true)
2. Approve: hapus flag moderasi
3. Delete: hapus konten
4. Filter by type (question/answer) dan date
5. Tampilkan alasan moderasi dari AI

**Kriteria sukses**: Admin bisa review, approve, dan delete konten termoderasi.

### Latihan 7: Unit Test AI Tools

Tulis test untuk AI tools:

1. Mock Mastra Agent untuk return response konsisten
2. Test suggestAnswer dengan berbagai input (dengan/tanpa existing answers)
3. Test autoTag: pastikan return tag dari availableTags
4. Test moderateContent: toxic text → isToxic = true, clean text → false
5. Test error handling: LLM timeout → fallback value
6. Test middleware moderasi: request dengan toxic content

**Kriteria sukses**: Semua test passing, AI tools teruji dengan mock.

### Latihan 8: Moderation Log & Dashboard

Bangun sistem logging moderasi:

1. Buat tabel `moderation_logs` (userId, contentType, contentPreview, isToxic, confidence, reasons, durationMs, createdAt)
2. Simpan log setiap kali middleware moderasi dipanggil
3. Buat endpoint `GET /api/admin/moderation-logs` — list log moderasi
4. Filter: by date range, by isToxic, by confidence threshold
5. Statistik: total moderated, toxic %, average confidence

**Kriteria sukses**: Semua aktivitas moderasi tercatat, dashboard monitoring menampilkan statistik.

### Latihan 9: SSE Reconnection & Fallback

Perbaiki reliability SSE:

1. Implementasi reconnect dengan exponential backoff (1s, 2s, 4s, 8s, max 30s)
2. Kirim last event ID, server lanjutkan dari event terakhir
3. Fallback ke polling setiap 30 detik jika SSE gagal total
4. Notifikasi badge di navbar update real-time via SSE
5. Mark all as read dari navbar dropdown

**Kriteria sukses**: SSE reconnect otomatis, tidak ada notifikasi terlewat, fallback polling berfungsi.

### Latihan 10: AI Prompt Optimization

Optimasi prompt AI untuk hasil lebih baik:

1. A/B test prompt variants untuk suggestAnswer (formal vs casual)
2. Tambahkan few-shot examples di prompt autoTag
3. Implementasi chain-of-thought prompt untuk moderateContent
4. Evaluasi kualitas output: 3 reviewer beri rating 1-5
5. Track prompt version di ai_logs untuk audit

**Kriteria sukses**: Prompt engineering terdokumentasi, quality score meningkat dari baseline.

## 📚 Referensi

- [Mastra AI Documentation](https://mastra.ai/docs)
- [Server-Sent Events (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [OpenAI Content Moderation](https://platform.openai.com/docs/guides/moderation)
- [EventEmitter Node.js](https://nodejs.org/api/events.html)
- [Prompt Engineering Best Practices](https://platform.openai.com/docs/guides/prompt-engineering)
- [EventSource API](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)

---
**Capstone 6 — Sesi 2: Real-time Features & AI Integration.** Lanjut ke [Sesi 3: Deployment & Monetization](03-deploy-monetize.md).
