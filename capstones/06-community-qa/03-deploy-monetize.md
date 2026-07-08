# Sesi 3: Reputation System, Testing & Deployment

> **Durasi**: 2 minggu (Sprint 4)
> **Fokus**: Reputation system, notification history, testing, Docker deployment, CI/CD, dokumentasi API

## 🎯 Tujuan Sesi

Setelah menyelesaikan sesi ini, mahasiswa mampu:

1. Mengimplementasikan reputation system dengan trigger otomatis
2. Membangun notification history dengan fitur read/unread
3. Menulis unit test dan integration test dengan coverage ≥70%
4. Membuat E2E test dengan Playwright untuk alur kritis
5. Mengatur CI/CD pipeline dengan GitHub Actions
6. Mendeploy aplikasi dengan Docker dan docker-compose
7. Mendokumentasikan API dengan Swagger/OpenAPI

## 📋 Ringkasan Materi

### Reputation System

Reputation system memberikan insentif untuk partisipasi berkualitas di platform:

| Aksi | Perubahan Reputasi | Keterangan |
|------|-------------------|------------|
| Menerima upvote pada pertanyaan | +10 | Per upvote |
| Menerima downvote pada pertanyaan | -2 | Per downvote |
| Menerima upvote pada jawaban | +10 | Per upvote |
| Menerima downvote pada jawaban | -2 | Per downvote |
| Jawaban diterima (accepted) | +15 | Bonus, sekali per jawaban |
| Memberi downvote | -1 | Mencegah abuse voting |

Reputasi diupdate menggunakan database transaction untuk konsistensi:

```typescript
// services/reputation.service.ts
export class ReputationService {
  async updateReputation(targetType: 'question' | 'answer', targetId: string, delta: number) {
    return await db.transaction(async (tx) => {
      // Cari pemilik konten
      let authorId: string;

      if (targetType === 'question') {
        const question = await tx.query.questions.findFirst({
          where: eq(questions.id, targetId),
          columns: { authorId: true },
        });
        authorId = question.authorId;
      } else {
        const answer = await tx.query.answers.findFirst({
          where: eq(answers.id, targetId),
          columns: { authorId: true },
        });
        authorId = answer.authorId;
      }

      // Update reputasi
      await tx.update(users)
        .set({
          reputation: sql`reputation + ${delta}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, authorId));

      return authorId;
    });
  }
}
```

### Notification History

Semua notifikasi disimpan di database dan bisa diakses melalui API:

```typescript
// routes/notification.routes.ts
router.get('/notifications', authenticate, async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  const notifications = await db.query.notifications.findMany({
    where: eq(notifications.userId, req.user.id),
    orderBy: [desc(notifications.createdAt)],
    limit,
    offset: (page - 1) * limit,
  });

  const unreadCount = await db.query.notifications.findMany({
    where: and(
      eq(notifications.userId, req.user.id),
      eq(notifications.isRead, false)
    ),
    columns: { id: true },
  });

  res.json({
    status: 'success',
    data: {
      notifications,
      unreadCount: unreadCount.length,
      pagination: { page, limit },
    },
  });
});

// Tandai notifikasi terbaca
router.patch('/notifications/:id/read', authenticate, async (req, res) => {
  await db.update(notifications)
    .set({ isRead: true })
    .where(and(
      eq(notifications.id, req.params.id),
      eq(notifications.userId, req.user.id)
    ));

  res.json({ status: 'success' });
});
```

### Testing Strategy

Tiga lapisan testing:

**1. Unit Test (Vitest)** — test fungsi individual, service methods, AI tools dengan mock

```typescript
// tests/unit/reputation.test.ts
import { describe, it, expect, vi } from 'vitest';
import { ReputationService } from '../../src/services/reputation.service';

vi.mock('../../src/db', () => ({
  db: {
    transaction: vi.fn((cb) => cb({
      query: {
        questions: {
          findFirst: vi.fn().mockResolvedValue({ authorId: 'user-1' }),
        },
      },
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(undefined),
        }),
      }),
    })),
  },
}));

describe('ReputationService', () => {
  it('should update reputation by delta', async () => {
    const service = new ReputationService();
    const authorId = await service.updateReputation('question', 'q-1', 10);
    expect(authorId).toBe('user-1');
  });
});
```

**2. Integration Test (Supertest)** — test endpoint API dengan database test

```typescript
// tests/integration/question.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import supertest from 'supertest';
import { app } from '../../src/index';

describe('Question API', () => {
  let token: string;

  beforeAll(async () => {
    const res = await supertest(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'test123' });
    token = res.body.data.accessToken;
  });

  it('should create a question', async () => {
    const res = await supertest(app)
      .post('/api/questions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Apa itu TypeScript?',
        body: 'Saya ingin belajar TypeScript, apa perbedaannya dengan JavaScript?',
        tagIds: ['tag-1', 'tag-2'],
      });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Apa itu TypeScript?');
  });

  it('should list questions with pagination', async () => {
    const res = await supertest(app)
      .get('/api/questions?page=1&limit=10');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
```

**3. E2E Test (Playwright)** — test browser lengkap

```typescript
// tests/e2e/qa-flow.spec.ts
import { test, expect } from '@playwright/test';

test('complete Q&A flow', async ({ page }) => {
  // Register
  await page.goto('/register');
  await page.fill('input[name="email"]', 'user@test.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  // Ask a question
  await page.goto('/questions/ask');
  await page.fill('input[name="title"]', 'Apa itu closure?');
  await page.fill('textarea[name="body"]', 'Jelaskan konsep closure...');
  await page.click('button:has-text("Submit")');

  // Should see the question
  await expect(page.locator('h1')).toContainText('Apa itu closure?');
});
```

### Docker Deployment

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://postgres:password@db:5432/community_qa
      - JWT_SECRET=${JWT_SECRET}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      db:
        condition: service_healthy
  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=community_qa
      - POSTGRES_PASSWORD=password
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
volumes:
  pgdata:
```

### CI/CD Pipeline

```yaml
name: CI/CD
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run test -- --coverage
      - uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/
      - run: npm run build
```

### API Documentation dengan Swagger

```typescript
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Community Q&A API',
      version: '1.0.0',
      description: 'API untuk platform tanya-jawab komunitas',
    },
    servers: [
      { url: 'http://localhost:3000/api', description: 'Development' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

Anotasi route dengan JSDoc comments:

```typescript
/**
 * @openapi
 * /api/questions:
 *   get:
 *     tags: [Questions]
 *     summary: List pertanyaan dengan pagination
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Nomor halaman
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter by tag name
 *     responses:
 *       200:
 *         description: Daftar pertanyaan
 */
router.get('/questions', questionController.list);
```

## 🛠️ Latihan

### Latihan 1: Reputation System

Implementasi reputation dengan trigger:

1. Tambah/ kurangi reputasi saat vote (upvote +10, downvote -2)
2. Bonus +15 saat jawaban diterima
7 3. Tampilkan reputasi di profil user
4. Cegah reputasi negatif (minimum 1)
5. Leaderboard page: top 10 users by reputation

**Kriteria sukses**: Reputasi berubah sesuai aksi, leaderboard akurat.

### Latihan 2: Notification History & Management

Bangun fitur notifikasi:

1. `GET /api/notifications` — list notifikasi dengan pagination
2. `PATCH /api/notifications/:id/read` — tandai terbaca
3. `PATCH /api/notifications/read-all` — tandai semua terbaca
4. Badge unread count di navbar
5. Trigger notifikasi untuk: new_answer, vote, accepted, moderated

**Kriteria sukses**: Notifikasi tersimpan, unread count akurat, read status berfungsi.

### Latihan 3: Integration Test

Tulis integration test komprehensif:

1. Setup test database dan migration
2. Test auth: register, login, refresh, logout
3. Test questions: CRUD, search, pagination, filter tag
4. Test answers: CRUD, accept answer
5. Test votes: upvote, downvote, toggle, prevent double vote
6. Test notifications: create, list, mark read

**Kriteria sukses**: Coverage ≥70%, semua endpoint teruji.

### Latihan 4: E2E Test dengan Playwright

Tulis E2E test untuk alur kritis:

1. Setup Playwright dengan `npx playwright init`
2. Test: Register → Login → Ask question → See question in list
3. Test: Answer a question → Accept answer
4. Test: Vote on question/answer
5. Test: AI suggest answer → See suggestion
6. Test: Notification appears when question answered

**Kriteria sukses**: Semua skenario berjalan di headless browser.

### Latihan 5: Docker & Docker Compose

Containerisasi aplikasi:

1. Multi-stage Dockerfile (builder + runner)
2. docker-compose.yml dengan healthcheck untuk database
3. Environment variables untuk konfigurasi
4. Volume untuk persistensi data PostgreSQL
5. Test: `docker compose up` → API bisa diakses

**Kriteria sukses**: Container berjalan, API accessible, data persisten.

### Latihan 6: CI/CD Pipeline

Setup GitHub Actions:

1. Workflow: lint → test → build
2. Services: PostgreSQL container untuk integration test
3. Cache node_modules untuk faster CI
4. Upload coverage report sebagai artifact
5. (Opsional) Deploy ke Railway/Render

**Kriteria sukses**: CI pipeline hijau, test jalan di CI environment.

### Latihan 7: API Documentation

Dokumentasi API dengan Swagger:

1. Setup swagger-jsdoc + swagger-ui-express
2. Anotasi semua endpoint dengan OpenAPI 3.0
3. Definisikan semua request/response schemas
4. Contoh request body untuk setiap POST endpoint
5. Dokumentasi error responses

**Kriteria sukses**: Swagger UI accessible di /api-docs, semua endpoint terdocumentasi.

## 📚 Referensi

- [OpenAPI Specification](https://swagger.io/specification/)
- [GitHub Actions Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Playwright Test Runner](https://playwright.dev/docs/test-intro)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Supertest API Testing](https://github.com/ladjs/supertest)

---
**Capstone 6 — Sesi 3: Reputation System, Testing & Deployment.** Kembali ke [Index Capstone 6](README.md).
