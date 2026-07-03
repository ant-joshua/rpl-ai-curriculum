# Capstone 5: Coding Bootcamp Platform — Spesifikasi Proyek

## 1. Gambaran Umum

Coding Bootcamp Platform adalah aplikasi web learning management system (LMS) khusus untuk pembelajaran pemrograman. Platform ini menyediakan kursus terstruktur berbasis teks dan kode, dengan tiga fitur AI utama: **AI Code Review** yang meninjau kode mahasiswa secara otomatis, **AI Exercise Generator** yang membuat soal latihan baru berdasarkan topik, dan **AI Tutor** yang menjawab pertanyaan konseptual mahasiswa. Ketiga fitur ini didukung oleh satu agen Mastra yang dilengkapi tiga tool terpisah.

Mahasiswa dapat mengerjakan tugas coding langsung di editor browser, mengirimkan solusi, dan menerima feedback otomatis dari AI. Instruktur dapat mengelola kursus, melihat submission mahasiswa, dan memantau perkembangan kelas.

Proyek ini dikerjakan dalam **4 sprint × 2 minggu** (total 8 minggu) menggunakan **TypeScript, Express.js, Mastra AI framework, dan PostgreSQL**.

---

## 2. Tech Stack

| Lapisan | Teknologi |
|---------|-----------|
| Bahasa  | TypeScript 5.x |
| Runtime | Node.js 20 LTS |
| Web Framework | Express.js 4.x |
| ORM / DB | Drizzle ORM + PostgreSQL 16 |
| Auth | JWT (access + refresh token) + bcrypt |
| AI Framework | Mastra (TypeScript) |
| LLM | OpenAI GPT-4o / GPT-4o-mini |
| Frontend | EJS templates + Tailwind CSS (atau React opsional) |
| Code Editor | CodeMirror 6 (inline di browser) |
| Sandbox Eksekusi | Docker container (isolated per submission) |
| Testing | Vitest (unit), Playwright (e2e) |
| CI/CD | GitHub Actions |

---

## 3. Capaian Pembelajaran

Setelah menyelesaikan capstone ini, mahasiswa mampu:

1. **CP-1**: Merancang dan mengimplementasikan data model relasional untuk LMS pemrograman (users, courses, lessons, submissions, code_reviews) menggunakan Drizzle ORM dan PostgreSQL.
2. **CP-2**: Membangun REST API dengan Express.js yang mencakup autentikasi JWT, role-based access control (admin, instruktur, mahasiswa), dan validasi input menggunakan Zod.
3. **CP-3**: Mengintegrasikan Mastra AI framework ke dalam Express.js — mendefinisikan agen dengan multiple tool, menjalankan agent execution, dan menyajikan hasil AI ke klien.
4. **CP-4**: Mengimplementasikan AI Code Review: mengirim submission kode mahasiswa ke agen Mastra, memproses review yang dihasilkan, dan menyimpan hasilnya.
5. **CP-5**: Mengimplementasikan AI Exercise Generator: menghasilkan soal latihan baru berdasarkan topik atau tingkat kesulitan tertentu.
6. **CP-6**: Mengimplementasikan AI Tutor: menerima pertanyaan konseptual dari mahasiswa dan mengembalikan jawaban yang dikontekstualisasikan dengan materi kursus.
7. **CP-7**: Menulis tes terintegrasi untuk alur lengkap (submission → AI review → feedback) dan mengelola deployment dengan CI/CD.

---

## 4. Fitur per Sprint (4×2 Minggu)

### Sprint 1: Fondasi Backend & Manajemen User

| ID | Fitur | Keterangan |
|----|-------|------------|
| S1.1 | Setup proyek TypeScript + Express + Drizzle + PG | Struktur folder, konfigurasi env, koneksi database, migrasi awal |
| S1.2 | Model User & Auth | Tabel `users` (id, email, password_hash, role, name, created_at). Register, login, refresh token, logout. Middleware verifyToken + requireRole |
| S1.3 | Role-based access control | Middleware `authorize('admin','instructor','student')`. Endpoint admin untuk list users |
| S1.4 | Model Course & Lesson | Tabel `courses` (id, title, description, instructor_id, created_at) dan `lessons` (id, course_id, title, content, order, type: 'text'|'code') |
| S1.5 | CRUD Course & Lesson (admin/instructor) | API lengkap untuk manage kursus dan pelajaran |

**Deliverable Sprint 1**: Server running, auth flow bekerja (register/login/protected routes), CRUD course & lesson via Postman.

### Sprint 2: Submission & Code Execution

| ID | Fitur | Keterangan |
|----|-------|------------|
| S2.1 | Model Submission | Tabel `submissions` (id, lesson_id, user_id, code, language, status: 'pending'|'reviewed', created_at) |
| S2.2 | CodeMirror editor | Halaman lesson dengan editor code inline. Submit code → POST /api/submissions |
| S2.3 | Submission API | Create submission, list submissions per lesson/user |
| S2.4 | Code execution sandbox | Docker container untuk menjalankan kode (Python/JS). Output ditangkap dan dikembalikan |
| S2.5 | Test submission flow | Vitest: submission → execution → response lengkap |

**Deliverable Sprint 2**: Mahasiswa bisa menulis kode di browser, submit, dan melihat output eksekusi.

### Sprint 3: Integrasi AI dengan Mastra

| ID | Fitur | Keterangan |
|----|-------|------------|
| S3.1 | Setup Mastra agent | Install mastra, definisi agent dengan tools: reviewCode, generateExercise, explainConcept |
| S3.2 | Tool: reviewCode | Menerima `code` + `language` + `lessonContext`. Output: saran, error detection, best practices |
| S3.3 | Tool: generateExercise | Menerima `topic` + `difficulty`(easy/medium/hard) + `count`. Output: array soal dengan test case |
| S3.4 | Tool: explainConcept | Menerima `question` + `contextCourse`. Output: penjelasan konseptual |
| S3.5 | Model CodeReview | Tabel `code_reviews` (id, submission_id, reviewer: 'ai'|'instructor', summary, line_comments JSONB, score, created_at) |
| S3.6 | Auto-review on submission | Hook setelah submission → panggil agent reviewCode → simpan hasil ke `code_reviews` |
| S3.7 | Tampilkan review ke mahasiswa | Halaman detail submission dengan hasil review AI |
| S3.8 | AI Exercise Generator page | Halaman instructor untuk generate soal → simpan sebagai draft lesson |
| S3.9 | AI Tutor chat | Halaman chat per lesson, mahasiswa tanya → agent explainConcept → tampilkan jawaban |

**Deliverable Sprint 3**: Submission otomatis direview AI. Instructor bisa generate soal. Mahasiswa bisa chat AI tutor.

### Sprint 4: Dashboard, Grading, & Deployment

| ID | Fitur | Keterangan |
|----|-------|------------|
| S4.1 | Dashboard mahasiswa | Progress kursus, submission terbaru, score rata-rata |
| S4.2 | Dashboard instruktur | List submission per lesson, statistik kelas |
| S4.3 | Manual grading override | Instructor bisa mereview ulang submission dan mengganti score AI |
| S4.4 | Notification system | Email atau in-app notif ketika review selesai |
| S4.5 | Unit test & integration test | Vitest coverage > 70% |
| S4.6 | E2E test dengan Playwright | Alur kritis: login → buka lesson → submit code → lihat review |
| S4.7 | CI/CD dengan GitHub Actions | Lint → test → build → deploy |
| S4.8 | Dokumentasi API (Swagger/OpenAPI) | Endpoint documentation auto-generated |

**Deliverable Sprint 4**: Aplikasi lengkap, terdeploy, dengan dokumentasi API dan CI/CD pipeline.

---

## 5. Data Model

### Entity Relationship Diagram (textual)

```
users ──< courses (instructor_id)
users ──< submissions
courses ──< lessons
lessons ──< submissions
submissions ──< code_reviews
lessons <──> exercises (generated AI, nullable instructor_id)
```

### Tabel Detail

**users**
| Column | Type | Constraint |
|--------|------|------------|
| id | uuid | PK, default gen_random_uuid() |
| email | varchar(255) | UNIQUE, NOT NULL |
| password_hash | varchar(255) | NOT NULL |
| name | varchar(100) | NOT NULL |
| role | enum('admin','instructor','student') | NOT NULL, default 'student' |
| created_at | timestamptz | NOT NULL, default now() |

**courses**
| Column | Type | Constraint |
|--------|------|------------|
| id | uuid | PK |
| title | varchar(200) | NOT NULL |
| description | text | |
| instructor_id | uuid | FK → users.id, NOT NULL |
| created_at | timestamptz | default now() |

**lessons**
| Column | Type | Constraint |
|--------|------|------------|
| id | uuid | PK |
| course_id | uuid | FK → courses.id ON DELETE CASCADE |
| title | varchar(200) | NOT NULL |
| content | text | NOT NULL (markdown) |
| type | enum('text','code') | NOT NULL, default 'text' |
| order_index | integer | NOT NULL |
| starter_code | text | Nullable, untuk lesson type 'code' |
| language | varchar(20) | Nullable, misal 'python','javascript' |
| created_at | timestamptz | default now() |

**submissions**
| Column | Type | Constraint |
|--------|------|------------|
| id | uuid | PK |
| lesson_id | uuid | FK → lessons.id ON DELETE CASCADE |
| user_id | uuid | FK → users.id ON DELETE CASCADE |
| code | text | NOT NULL |
| language | varchar(20) | NOT NULL |
| execution_output | text | Nullable, hasil dari sandbox |
| status | enum('pending','reviewed') | NOT NULL, default 'pending' |
| submitted_at | timestamptz | default now() |

**code_reviews**
| Column | Type | Constraint |
|--------|------|------------|
| id | uuid | PK |
| submission_id | uuid | FK → submissions.id ON DELETE CASCADE, UNIQUE |
| reviewer | enum('ai','instructor') | NOT NULL, default 'ai' |
| instructor_id | uuid | FK → users.id, nullable (jika manual review) |
| summary | text | NOT NULL (rangkuman review) |
| line_comments | jsonb | Nullable, array [{line, message, severity}] |
| score | integer | Nullable, 0–100 |
| created_at | timestamptz | default now() |

**exercises** (hasil generate AI)
| Column | Type | Constraint |
|--------|------|------------|
| id | uuid | PK |
| lesson_id | uuid | FK → lessons.id ON DELETE CASCADE |
| generated_by | uuid | FK → users.id (instructor yg generate) |
| title | varchar(200) | NOT NULL |
| description | text | NOT NULL |
| difficulty | enum('easy','medium','hard') | NOT NULL |
| starter_code | text | Nullable |
| test_cases | jsonb | Nullable, array [{input, expected_output}] |
| created_at | timestamptz | default now() |

### Relasi Kunci
- Satu kursus memiliki banyak lessons (1:N).
- Satu lesson memiliki banyak submissions (1:N).
- Satu submission memiliki satu code_review (1:1).
- Satu instructor dapat mengelola banyak courses (1:N).
- Satu mahasiswa dapat mengirim banyak submissions (1:N).

---

## 6. API Endpoints

| Method | Endpoint | Role | Deskripsi |
|--------|----------|------|-----------|
| POST | /api/auth/register | public | Register user baru |
| POST | /api/auth/login | public | Login, return JWT |
| POST | /api/auth/refresh | public | Refresh access token |
| GET | /api/auth/me | all | Profile user saat ini |
| GET | /api/users | admin | List semua users |
| GET | /api/courses | all | List kursus |
| POST | /api/courses | instructor/admin | Buat kursus baru |
| GET | /api/courses/:id | all | Detail kursus + lessons |
| PUT | /api/courses/:id | instructor/admin | Update kursus |
| DELETE | /api/courses/:id | admin | Hapus kursus |
| GET | /api/courses/:id/lessons | all | List pelajaran per kursus |
| POST | /api/courses/:id/lessons | instructor/admin | Buat pelajaran baru |
| GET | /api/lessons/:id | all | Detail pelajaran |
| PUT | /api/lessons/:id | instructor/admin | Update pelajaran |
| DELETE | /api/lessons/:id | admin | Hapus pelajaran |
| POST | /api/lessons/:id/submissions | student | Submit kode |
| GET | /api/lessons/:id/submissions | instructor/admin | List submission per lesson |
| GET | /api/submissions/:id | all | Detail submission + execution output |
| GET | /api/submissions/:id/review | all | Detail code review |
| POST | /api/submissions/:id/review | instructor | Manual override review |
| POST | /api/ai/generate-exercise | instructor | Generate exercise via AI |
| POST | /api/ai/explain | student | Tanya AI tutor |
| GET | /api/dashboard/student | student | Progress dashboard |
| GET | /api/dashboard/instructor | instructor | Statistik kelas |
| GET | /api-docs | all | Swagger UI |

### Struktur Response

Semua response mengikuti format:

```json
{
  "status": "success",
  "data": { ... },
  "message": "optional message"
}
```

Error response:

```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email already exists"
  }
}
```

---

## 7. Detail Integrasi AI (Mastra Agent)

### Arsitektur

```
Client (Browser)
    │ POST /api/lessons/:id/submissions
    ▼
Express.js Route Handler
    │
    ├── Simpan submission ke DB
    ├── Panggil sandbox (Docker) untuk execute kode
    ├── Panggil Mastra Agent → reviewCode tool
    │       │
    │       ▼
    │   Mastra Agent (mastra/core)
    │       │
    │       ├── Tool: reviewCode
    │       │     Input: { code, language, lessonContext }
    │       │     Output: { summary, lineComments[], score }
    │       │
    │       ├── Tool: generateExercise (dipanggil dari /api/ai/generate-exercise)
    │       │     Input: { topic, difficulty, count }
    │       │     Output: { exercises: [{ title, description, starterCode, testCases }] }
    │       │
    │       └── Tool: explainConcept (dipanggil dari /api/ai/explain)
    │             Input: { question, courseContext }
    │             Output: { explanation, relatedTopics[], codeExample? }
    │
    ├── Simpan hasil review ke table code_reviews
    └── Return response ke client
```

### Definisi Mastra Agent (TypeScript)

```typescript
import { Agent } from '@mastra/core';
import { openai } from '@mastra/providers';

const bootcampAgent = new Agent({
  name: 'coding-bootcamp-ai',
  instructions: `Kamu adalah asisten pengajar coding bootcamp.
Tugasmu: (1) Me-review kode mahasiswa dengan memberikan saran konkret,
(2) Membuat soal latihan coding, (3) Menjelaskan konsep pemrograman.
Gunakan bahasa Indonesia. Berikan contoh kode jika relevan.`,
  model: openai('gpt-4o'),
  tools: [reviewCodeTool, generateExerciseTool, explainConceptTool],
});
```

### Tool Specifications

**reviewCodeTool**
- **Trigger**: Otomatis setelah submission.
- **Schema input**: `{ code: string, language: 'javascript' | 'python' | 'typescript', lessonContext: string }`
- **Schema output**: `{ summary: string, lineComments: Array<{line: number, message: string, severity: 'error'|'warning'|'suggestion'}>, score: number }`
- **Prompt template**: "Review kode {language} berikut dalam konteks materi: {lessonContext}. Berikan skor 0-100, daftar komentar per baris, dan ringkasan."

**generateExerciseTool**
- **Trigger**: Manual oleh instruktur via endpoint POST /api/ai/generate-exercise.
- **Schema input**: `{ topic: string, difficulty: 'easy'|'medium'|'hard', count: number }`
- **Schema output**: `{ exercises: Array<{title: string, description: string, starterCode: string, testCases: Array<{input: string, expectedOutput: string}>}> }`
- **Prompt template**: "Buat {count} soal coding {difficulty} tentang {topic}. Sertakan test case untuk setiap soal."

**explainConceptTool**
- **Trigger**: Manual oleh mahasiswa via endpoint POST /api/ai/explain.
- **Schema input**: `{ question: string, courseContext: string }`
- **Schema output**: `{ explanation: string, relatedTopics: string[], codeExample?: string }`
- **Prompt template**: "Jelaskan konsep berikut dalam konteks kursus {courseContext}: {question}. Berikan contoh kode jika relevan."

### Error Handling AI

- Jika agent gagal merespons (timeout/error), submission tetap tersimpan dengan status `pending`. Cron job retry 3× dengan exponential backoff.
- Setiap panggilan AI dicatat di tabel `ai_logs` (id, agent_name, tool_name, input, output, duration_ms, success boolean) untuk debugging dan monitoring biaya.

---

## 8. Deliverables Checklist

### Wajib
- [ ] Repository GitHub dengan README, LICENSE, .gitignore
- [ ] Aplikasi Express.js berjalan dengan TypeScript
- [ ] Database PostgreSQL dengan migrasi Drizzle
- [ ] Autentikasi JWT dengan refresh token
- [ ] Role-based access control (admin, instructor, student)
- [ ] CRUD course & lesson
- [ ] Code editor (CodeMirror 6) untuk submission
- [ ] Submission API dengan status tracking
- [ ] Integrasi Mastra agent dengan minimal 2 tool berfungsi (reviewCode + 1 lainnya)
- [ ] AI Code Review otomatis setelah submission
- [ ] AI Exercise Generator (endpoint untuk instruktur)
- [ ] AI Tutor (endpoint chat konseptual)
- [ ] Tampilkan hasil review AI ke mahasiswa
- [ ] Dashboard mahasiswa & instruktur
- [ ] Swagger/OpenAPI documentation
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Unit test coverage > 70%

### Opsional (Nilai Tambah)
- [ ] Execution sandbox dengan Docker
- [ ] Pagination di semua list endpoint
- [ ] Real-time review notification (SSE atau WebSocket)
- [ ] Deployment ke production (Railway / Render / VPS)
- [ ] Integration test dengan Playwright

---

## 9. Rubrik Evaluasi

| Kriteria | Bobot | 4 (Sangat Baik) | 3 (Baik) | 2 (Cukup) | 1 (Kurang) |
|----------|-------|------------------|----------|------------|------------|
| **Fungsionalitas** | 30% | Semua fitur wajib berjalan + minimal 2 fitur opsional | Semua fitur wajib berjalan | 80% fitur wajib berjalan | < 80% fitur wajib |
| **Kualitas Kode** | 20% | TypeScript strict, arsitektur clean architecture, error handling menyeluruh | TypeScript strict, sebagian besar good practices | TypeScript longgar, beberapa best practice terlewat | Hampir tidak ada error handling |
| **AI Integration** | 20% | 3 tools Mastra berfungsi penuh, prompt engineering optimal, ada logging | 2 tools berfungsi, prompt cukup baik | 1 tool berfungsi, prompt minimal | AI integration tidak berfungsi |
| **Data Model & API** | 15% | Normalisasi 3NF, indexing, migrasi versioned, API RESTful konsisten | Normalisasi baik, migrasi ada | Normalisasi minimal, migrasi manual | Tidak ada migrasi, denormalisasi |
| **Testing** | 10% | Coverage > 80%, integration test untuk alur AI | Coverage > 70%, unit test | Coverage > 50%, hanya unit test | Tidak ada testing |
| **Dokumentasi** | 5% | README lengkap, Swagger interaktif, example request/response | README lengkap, Swagger ada | READMA minimal | Tidak ada dokumentasi |

### Kriteria Penilaian Tambahan

- **Originalitas & Problem Solving**: Apakah mahasiswa menambahkan fitur di luar spesifikasi yang relevan? (+5% bonus)
- **Konsistensi Git**: Riwayat commit yang terstruktur, branch strategy, PR description (+5% bonus)
- **Presentasi**: Demo berjalan lancar, mampu menjelaskan arsitektur dan keputusan teknis (penilaian terpisah oleh penguji)

---

## 10. Timeline & Milestone

| Minggu | Sprint | Fokus | Milestone |
|--------|--------|-------|-----------|
| 1–2 | Sprint 1 | Auth, CRUD Course & Lesson | API foundation siap |
| 3–4 | Sprint 2 | Submission & Code Execution | Mahasiswa bisa submit & execute |
| 5–6 | Sprint 3 | Integrasi AI Mastra | AI review, generate, tutor live |
| 7–8 | Sprint 4 | Dashboard, Testing, Deployment | Aplikasi siap deploy |

---

*Dokumen ini adalah spesifikasi proyek Capstone 5 — Coding Bootcamp Platform. Mahasiswa wajib membaca seluruh spesifikasi sebelum memulai pengerjaan. Perubahan terhadap spesifikasi harus disetujui oleh penguji. Estimasi total: ~1500+ baris kode (backend) + konfigurasi infrastructure.*
