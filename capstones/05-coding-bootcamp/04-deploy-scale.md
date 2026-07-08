# Sesi 4: Dashboard, Testing & Deployment

> **Durasi**: 2 minggu (Sprint 4)
> **Fokus**: Dashboard mahasiswa & instruktur, grading system, testing, CI/CD, deployment

## 🎯 Tujuan Sesi

Setelah menyelesaikan sesi ini, mahasiswa mampu:

1. Membangun dashboard mahasiswa dengan progress tracking dan statistik
2. Membangun dashboard instruktur dengan overview kelas dan submission analytics
3. Mengimplementasikan grading system dengan override manual
4. Mengintegrasikan notification system untuk review selesai
5. Menulis unit test dan integration test dengan coverage ≥70%
6. Membuat E2E test dengan Playwright untuk alur kritis
7. Mengatur CI/CD pipeline dengan GitHub Actions
8. Mendokumentasikan API dengan Swagger/OpenAPI

## 📋 Ringkasan Materi

### Dashboard Mahasiswa

Dashboard mahasiswa menampilkan informasi progress belajar:

```
Dashboard Mahasiswa
├── Progress Card
│   ├── Total kursus terdaftar: N
│   ├── Lesson selesai: X/Y
│   ├── Submission: Z total
│   └── Rata-rata score: 85/100
├── Recent Activity (5 card terakhir)
│   ├── [icon] Menyelesaikan "Variable & Tipe Data"
│   ├── [icon] Mendapat score 90 di "Looping"
│   └── [icon] Bertanya: "Apa itu closure?"
├── Course Progress (progress bar per kursus)
│   ├── JavaScript Dasar: ████████░░ 80%
│   └── Python Fundamentals: █████░░░░░ 50%
└── Quick Actions
    ├── Lanjutkan belajar (lesson terakhir)
    ├── Lihat submission terbaru
    └── Tanya AI Tutor
```

**Endpoint**: `GET /api/dashboard/student`

Response dashboard di-aggregate dari beberapa tabel:
- Count courses dari enrollment (jika ada fitur enrollment)
- Count lessons selesai dari submissions
- Rata-rata score dari code_reviews
- 5 aktivitas terakhir dari submissions + ai_logs

### Dashboard Instruktur

Dashboard instruktur memberikan overview kelas:

```typescript
// services/dashboard.service.ts
async getInstructorDashboard(instructorId: string) {
  const courses = await db.query.courses.findMany({
    where: eq(courses.instructorId, instructorId),
  });

  const totalStudents = await db.query.submissions.findMany({
    columns: { userId: true },
    distinct: ['userId'],
  });

  const pendingReviews = await db.query.submissions.findMany({
    where: and(
      eq(submissions.status, 'pending'),
      inArray(submissions.lessonId, 
        db.select({ id: lessons.id }).from(lessons)
          .where(inArray(lessons.courseId, courses.map(c => c.id)))
      )
    ),
  });

  return {
    totalCourses: courses.length,
    totalStudents: totalStudents.length,
    pendingReviews: pendingReviews.length,
    courses: courses.map(c => ({
      ...c,
      lessonCount: /* count lessons */,
      submissionCount: /* count submissions */,
    })),
  };
}
```

### Grading System

Sistem penilaian menggabungkan AI review dan instructor override:

1. **AI Auto-grade**: Setiap submission langsung direview AI → score 0-100
2. **Instructor Override**: Instruktur bisa mereview ulang dan mengganti score
3. **Final Score**: Score terakhir (instructor override jika ada)

```typescript
// services/grading.service.ts
async getFinalScore(submissionId: string) {
  const reviews = await db.query.codeReviews.findMany({
    where: eq(codeReviews.submissionId, submissionId),
    orderBy: [desc(codeReviews.createdAt)],
  });

  if (reviews.length === 0) return null;

  // Instructor review overrides AI review
  const instructorReview = reviews.find(r => r.reviewer === 'instructor');
  return instructorReview || reviews[0];
}
```

### Notification System

Notifikasi memberitahu mahasiswa ketika review selesai:

**In-app notification** via SSE (Server-Sent Events):

```typescript
// routes/notification.routes.ts
router.get('/notifications/stream', authenticate, (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  // Subscribe ke event untuk user ini
  const listener = (event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  eventEmitter.on(`user:${req.user.id}`, listener);

  req.on('close', () => {
    eventEmitter.off(`user:${req.user.id}`, listener);
  });
});
```

**Trigger notifikasi**: Saat AI review selesai, server emit event → SSE push ke browser → tampilkan toast notification.

### Testing Strategy

Tiga level testing:

1. **Unit Test (Vitest)**: Test fungsi individual, service methods, AI tools dengan mock
2. **Integration Test (Supertest)**: Test endpoint API dengan database test
3. **E2E Test (Playwright)**: Test alur browser lengkap

```typescript
// tests/integration/submission.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import supertest from 'supertest';
import { app } from '../src/index';

describe('Submission Flow', () => {
  let token: string;

  beforeAll(async () => {
    const res = await supertest(app)
      .post('/api/auth/login')
      .send({ email: 'student@test.com', password: 'test123' });
    token = res.body.data.accessToken;
  });

  it('should submit code successfully', async () => {
    const res = await supertest(app)
      .post('/api/lessons/1/submissions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        code: 'console.log("Hello World");',
        language: 'javascript',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('pending');
  });
});
```

### CI/CD dengan GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm ci
      - run: npm run lint
      - run: npm run test -- --coverage
      - run: npm run build

      - name: Upload coverage
        uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/
```

Pipeline terdiri dari 4 tahap: lint → test → build → (deploy opsional).

### API Documentation dengan Swagger

```typescript
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Coding Bootcamp API',
      version: '1.0.0',
      description: 'API untuk platform Coding Bootcamp',
    },
    servers: [{ url: '/api' }],
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
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJsdoc(options)));
```

## 🛠️ Latihan

### Latihan 1: Dashboard Mahasiswa

Bangun dashboard mahasiswa:

1. Query aggregate: total kursus, lesson selesai, submission count, rata-rata score
2. Tampilkan 5 aktivitas terakhir (submission + AI chat)
3. Progress bar per kursus
4. Komponen UI: card statistik, activity feed, progress bar
5. Auto-refresh setiap 30 detik

**Kriteria sukses**: Dashboard menampilkan data akurat dari database.

### Latihan 2: Dashboard Instruktur

Bangun dashboard instruktur:

1. Statistik kelas: total mahasiswa, submission, pending reviews
2. List kursus dengan jumlah lesson dan submission
3. Pending reviews alert (submission yang belum direview > 24 jam)
4. Grafik submission per minggu
5. Export data ke CSV

**Kriteria sukses**: Instruktur bisa melihat overview kelas, pending reviews terlihat.

### Latihan 3: Manual Grading Override

Implementasi override grading:

1. Halaman detail submission untuk instruktur
2. Form override: input score, tulis komentar
3. Simpan sebagai review baru dengan reviewer 'instructor'
4. Tampilkan badge "AI Review" vs "Manual Review"
5. Notifikasi ke mahasiswa saat score diupdate

**Kriteria sukses**: Instructor bisa override score, mahasiswa dapat notifikasi.

### Latihan 4: Notification System

Implementasi notifikasi in-app:

1. Setup SSE endpoint: `GET /api/notifications/stream`
2. Event emitter pattern untuk publish/subscribe
3. Trigger notifikasi saat: review selesai, score diupdate, AI tutor menjawab
4. Toast notification di frontend
5. Notification history di halaman terpisah

**Kriteria sukses**: Notifikasi muncul real-time saat event terjadi.

### Latihan 5: Unit & Integration Test

Tulis test komprehensif:

1. Unit test: all service methods, AI tools (mock), utility functions
2. Integration test: auth flow, CRUD course/lesson, submission flow, review flow
3. Setup test database dengan Docker
4. Test coverage ≥70%
5. Test error scenarios: 401, 403, 404, 422

**Kriteria sukses**: Coverage ≥70%, semua test passing.

### Latihan 6: E2E Test dengan Playwright

Tulis E2E test untuk alur kritis:

1. Setup Playwright dengan `npx playwright init`
2. Test: Register → Login → Browse courses → Open lesson
3. Test: Open code lesson → Write code → Submit → See review
4. Test: Instructor login → View submissions → Override score
5. Test: Student → Ask AI Tutor → See response
6. Test error states: invalid login, empty submission

**Kriteria sukses**: Semua skenario berjalan di headless browser.

### Latihan 7: CI/CD Pipeline & API Docs

Setup deployment pipeline:

1. Buat GitHub Actions workflow: lint → test → build
2. Setup Docker build dan push ke registry (opsional)
3. Generate Swagger docs dari route annotations
4. Deploy ke Railway/Render (opsional)
5. Dokumentasikan seluruh setup di README

**Kriteria sukses**: CI pipeline hijau, dokumentasi API accessible.

## 📚 Referensi

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Playwright Test Runner](https://playwright.dev/docs/test-intro)
- [Supertest HTTP Assertions](https://github.com/ladjs/supertest)
- [Swagger/OpenAPI Specification](https://swagger.io/specification/)
- [Server-Sent Events (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)

---
**Capstone 5 — Sesi 4: Dashboard, Testing & Deployment.** Kembali ke [Index Capstone 5](README.md).
