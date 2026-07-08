# Sesi 3: AI Integration & Deployment

> **Durasi**: 2 minggu (Sprint 3-4)
> **Fokus**: Integrasi Mastra AI agent, fitur AI tools, testing, dan deployment Docker

## 🎯 Tujuan Sesi

Setelah menyelesaikan sesi ini, mahasiswa mampu:

1. Mengintegrasikan Mastra AI framework ke dalam aplikasi Express.js
2. Mendefinisikan agen AI dengan multiple tools untuk content creation
3. Membangun 4 AI tools: writeArticle, summarize, autoTag, generateSocialMedia
4. Mengimplementasikan error handling untuk LLM calls (timeout, retry, fallback)
5. Menulis unit test dengan mocking LLM responses
6. Membangun Docker multi-stage build dan docker-compose
7. Mendokumentasikan API dengan Swagger/OpenAPI

## 📋 Ringkasan Materi

### Arsitektur AI Integration

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

Setiap AI tool adalah fungsi independen yang dipanggil oleh Mastra agent. Agent bertindak sebagai orkestrator: menerima task dari route handler, memilih tool yang tepat, menjalankan LLM call, dan mengembalikan hasil terstruktur.

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

Agent instructions menggunakan Bahasa Indonesia untuk memastikan output konsisten. Setiap tool memiliki skema input/output yang terdefinisi dengan jelas.

### Tool Details

**writeArticle**
- Input: `topic: string`, `outline?: string[]`
- Output: `{ title: string, content: string }`
- Prompt: Generate artikel lengkap dari topik dalam Bahasa Indonesia. Jika outline diberikan, struktur artikel mengikuti outline.
- Error handling: Jika outline terlalu panjang, truncate ke 5 item. Jika topik kosong, return error.

**summarize**
- Input: `content: string`
- Output: `{ summary: string }` (3-5 kalimat)
- Prompt: Rangkum artikel panjang jadi ringkasan eksekutif pendek. Fokus pada poin utama.
- Error handling: Jika konten < 100 karakter, return konten asli sebagai summary.

**autoTag**
- Input: `content: string`
- Output: `{ tags: string[] }` (3-5 tag)
- Prompt: Ekstrak tag relevan dari konten artikel. Tag harus kata/frasa pendek, lowercase. Prioritaskan tag yang sudah ada di database.
- Error handling: Pastikan tag unik, lowercase, tanpa duplikasi.

**generateSocialMedia**
- Input: `title: string`, `content: string`, `summary?: string`
- Output: `{ twitter: string, linkedin: string, instagram: string }`
- Prompt: Generate 3 varian postingan: Twitter (280 char, engaging), LinkedIn (professional, 200-300 words), Instagram (visual description + caption).
- Error handling: Pastikan output tidak melebihi batas karakter masing-masing platform.

### Service Layer Pattern

Pisahkan logika AI dari route handler dengan service layer:

```typescript
// src/services/ai.service.ts
export class AIService {
  async writeArticle(topic: string, outline?: string[]): Promise<Article> {
    const result = await contentAgent.execute({
      task: 'write article',
      tools: [writeArticleTool],
      data: { topic, outline },
    });
    return result;
  }

  async summarizeArticle(articleId: string): Promise<string> {
    const article = await articleService.getById(articleId);
    const result = await contentAgent.execute({
      task: 'summarize',
      tools: [summarizeTool],
      data: { content: article.content },
    });
    return result.summary;
  }

  // ... same for autoTag and generateSocialMedia
}
```

### AI Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/ai/write` | Generate artikel dari topic + optional outline |
| POST | `/api/ai/summarize` | Rangkum artikel berdasarkan ID |
| POST | `/api/ai/auto-tag` | Auto-tag artikel berdasarkan ID |
| POST | `/api/ai/social` | Generate postingan sosial media dari artikel |

### Error Handling AI

LLM calls bisa gagal karena:
- **Timeout**: LLM lambat merespons. Set timeout 30 detik per call.
- **Invalid JSON**: LLM return response tidak terstruktur. Parse dengan try/catch, fallback ke default.
- **Token limit**: Konten terlalu panjang. Truncate input sebelum dikirim.
- **Rate limit**: API key terkena rate limit. Implementasi retry with exponential backoff.

```typescript
async function safeAICall<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    const result = await Promise.race([
      fn(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI Timeout')), 30000)
      ),
    ]);
    return result as T;
  } catch (error) {
    console.error('AI call failed:', error);
    return fallback;
  }
}
```

### Response Caching

Untuk mengurangi biaya API, implementasi caching sederhana:
- Cache hasil summarize selama 1 jam per artikel
- Cache hasil autoTag selama 24 jam (tag jarang berubah)
- Invalidate cache saat artikel diupdate
- Gunakan Map in-memory atau Redis untuk production

```typescript
// services/cache.service.ts
export class CacheService {
  private store = new Map<string, { value: unknown; expiresAt: number }>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set(key: string, value: unknown, ttlMs: number): Promise<void> {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  async invalidate(pattern: string): Promise<void> {
    const regex = new RegExp(pattern);
    for (const key of this.store.keys()) {
      if (regex.test(key)) this.store.delete(key);
    }
  }
}

// Contoh: cache summarize
const cache = new CacheService();
async function getSummary(articleId: string) {
  const cached = await cache.get<string>(`summary:${articleId}`);
  if (cached) return cached;

  const summary = await aiService.summarizeArticle(articleId);
  await cache.set(`summary:${articleId}`, summary, 3600_000); // 1 jam
  return summary;
}
```

### Rate Limiting untuk AI Endpoints

AI endpoints mahal per panggilan. Proteksi dengan rate limiting:

```typescript
// middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';

export const aiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 menit
  max: 10, // max 10 request per menit per IP
  message: {
    status: 'error',
    error: {
      code: 'RATE_LIMIT',
      message: 'Terlalu banyak request AI. Coba lagi dalam 1 menit.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Penggunaan di route
router.post('/ai/write', authenticate, aiRateLimit, aiController.writeArticle);
```

### Logging AI Calls ke Database

Simpan history setiap AI call untuk monitoring:

```typescript
// services/ai-logger.service.ts
import { db } from '../db';
import { aiLogs } from '../db/schema';

interface AILogEntry {
  userId: string;
  toolName: string;
  inputTokens: number;
  outputTokens: number;
  durationMs: number;
  success: boolean;
  errorMessage?: string;
}

export class AILogger {
  async log(entry: AILogEntry) {
    await db.insert(aiLogs).values({
      ...entry,
      createdAt: new Date(),
    });
  }

  async getStats(userId: string) {
    const stats = await db.query.aiLogs.findMany({
      where: eq(aiLogs.userId, userId),
      orderBy: [desc(aiLogs.createdAt)],
      limit: 100,
    });

    const totalCalls = stats.length;
    const failedCalls = stats.filter(l => !l.success).length;
    const avgDuration = stats.reduce((s, l) => s + l.durationMs, 0) / totalCalls;

    return { totalCalls, failedCalls, avgDuration, calls: stats };
  }
}
```

### Testing dengan Mock LLM

Unit test AI tools dengan mocking LLM response:

```typescript
// tests/unit/ai/summarize.test.ts
import { describe, it, expect, vi } from 'vitest';

vi.mock('@mastra/core', () => ({
  Agent: vi.fn().mockImplementation(() => ({
    execute: vi.fn().mockResolvedValue({
      summary: 'Artikel ini membahas tentang Mastra AI framework.',
    }),
  })),
}));

describe('summarize tool', () => {
  it('should return summary with 3-5 sentences', async () => {
    const result = await summarizeTool.execute({
      input: { content: '...long article...' },
    });
    expect(result.summary).toBeDefined();
    expect(result.summary.split('.').length).toBeGreaterThanOrEqual(3);
  });
});
```

### Docker Deployment

Multi-stage Dockerfile untuk production:

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

Docker Compose menghubungkan app dengan PostgreSQL:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://postgres:password@db:5432/ai_content_hub
      - JWT_SECRET=your-secret-key
    depends_on:
      - db
  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=ai_content_hub
      - POSTGRES_PASSWORD=password
volumes:
  pgdata:
```

### API Documentation dengan Swagger

Gunakan `swagger-jsdoc` + `swagger-ui-express` untuk generate dokumentasi otomatis:

```typescript
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: { title: 'AI Content Hub API', version: '1.0.0' },
  },
  apis: ['./src/routes/*.ts'],
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

## 🛠️ Latihan

### Latihan 1: Setup Mastra Agent

Integrasi Mastra ke proyek Express:

1. Install `@mastra/core` dan provider LLM (`@ai-sdk/openai` atau `@mastra/anthropic`)
2. Definisi agent di `src/agents/content.agent.ts`
3. Verifikasi agent bisa menjalankan task sederhana (hello world)
4. Export agent untuk digunakan di service layer
5. Setup environment variable untuk API key LLM

**Kriteria sukses**: Agent terdefinisi, bisa dipanggil dari route handler.

### Latihan 2: Build AI Tools

Implementasi 4 tools AI:

1. **writeArticle**: Terima topic + optional outline → return title + content
2. **summarize**: Terima content → return 3-5 kalimat summary
3. **autoTag**: Terima content → return array 3-5 tag
4. **generateSocialMedia**: Terima title + content → return 3 postingan

Setiap tool di file terpisah di `src/agents/tools/`.

**Kriteria sukses**: Semua tools bisa dipanggil dan return output terstruktur.

### Latihan 3: AI Route Handlers

Buat 4 endpoint AI:

1. `POST /api/ai/write` — body `{topic, outline?}` → simpan artikel → return artikel
2. `POST /api/ai/summarize` — body `{articleId}` → update summary → return summary
3. `POST /api/ai/auto-tag` — body `{articleId}` → attach tags → return tags
4. `POST /api/ai/social` — body `{articleId}` → simpan suggestions → return suggestions

**Kriteria sukses**: Semua endpoint berfungsi, hasil AI tersimpan di database.

### Latihan 4: Error Handling & Retry

Implementasi error handling robust:

1. Set timeout 30 detik untuk setiap LLM call
2. Implementasi retry 3× dengan exponential backoff (1s, 2s, 4s)
3. Fallback value jika semua retry gagal
4. Logging setiap AI call ke tabel `ai_logs` (input, output, duration, success)
5. Dashboard monitoring untuk admin melihat status AI calls

**Kriteria sukses**: AI calls handle timeout dan error gracefully, retry mechanism berfungsi.

### Latihan 5: Unit Test AI Tools

Tulis unit test untuk semua AI tools:

1. Mock LLM provider untuk return response konsisten
2. Test writeArticle dengan berbagai input (dengan/ tanpa outline)
3. Test summarize dengan berbagai panjang konten
4. Test autoTag: pastikan tag unik, lowercase, 3-5 items
5. Test generateSocialMedia: pastikan format output sesuai platform

**Kriteria sukses**: Coverage ≥70%, semua test passing.

### Latihan 6: Docker Build & Deploy

Containerisasi aplikasi:

1. Buat multi-stage Dockerfile (builder + runner)
2. Buat docker-compose.yml (app + db)
3. Pastikan healthcheck endpoint berfungsi di container
4. Test: `docker compose up` → API bisa diakses di localhost:3000
5. Optimasi image size (gunakan Alpine, multi-stage, .dockerignore)

**Kriteria sukses**: Container berjalan, API accessible, database terhubung.

### Latihan 7: API Documentation & Demo Script

Buat dokumentasi dan demo:

1. Setup Swagger/OpenAPI dengan endpoint descriptions
2. Dokumentasikan semua request/response schemas
3. Buat demo script (curl commands atau Postman collection)
4. Test end-to-end: register → login → create article → AI write → AI summarize → AI auto-tag → AI social → logout
5. Dokumentasikan environment variables yang dibutuhkan

**Kriteria sukses**: Dokumentasi lengkap, demo script bisa dijalankan dari awal sampai akhir.

### Latihan 8: AI Call Logging & Monitoring

Buat sistem logging untuk AI calls:

1. Buat tabel `ai_logs` di database (userId, toolName, inputTokens, outputTokens, durationMs, success, errorMessage)
2. Implementasi AILogger service yang mencatat setiap AI call
3. Buat endpoint `GET /api/admin/ai-stats` untuk monitoring
4. Tampilkan statistik: total calls, failed %, average duration
5. Alert jika failure rate > 10% dalam 1 jam

**Kriteria sukses**: Semua AI call tercatat, dashboard monitoring menampilkan statistik.

### Latihan 9: Rate Limiting & Security

Proteksi AI endpoints:

1. Install `express-rate-limit` 
2. Set rate limit: 10 AI calls per menit per user
3. Implementasi API key untuk akses eksternal (third-party)
4. Tambahkan helmet untuk security headers
5. CORS configuration untuk frontend origin saja

**Kriteria sukses**: Rate limit blocking request berlebih, security headers aktif.

### Latihan 10: SEO & Analytics Dashboard

Optimasi SEO dan analytics:

1. Generate sitemap.xml otomatis dari artikel published
2. Tambahkan JSON-LD structured data (Article schema) di setiap artikel
3. Open Graph meta tags (og:title, og:description, og:image)
4. Analytics dashboard: total views, top articles, views per day chart
5. View tracking middleware: increment view_count setiap artikel diakses

**Kriteria sukses**: Sitemap valid, JSON-LD valid (test dengan Google Rich Results), analytics menampilkan data akurat.

## 📚 Referensi

- [Mastra AI Documentation](https://mastra.ai/docs)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Docker Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Swagger/OpenAPI Guide](https://swagger.io/docs/specification/about/)
- [Vitest Mocking](https://vitest.dev/guide/mocking.html)
- [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit)
- [Google Rich Results Test](https://search.google.com/test/rich-results)

---
**Capstone 4 — Sesi 3: AI Integration & Deployment.** Kembali ke [Index Capstone 4](README.md).
