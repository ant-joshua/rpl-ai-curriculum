# Capstone 5: Coding Bootcamp Platform — Spesifikasi Proyek

> Platform LMS coding bootcamp dengan AI Code Review, AI Exercise Generator, dan AI Tutor. Dibangun dengan TypeScript, Express.js, Mastra AI, PostgreSQL.

## 📋 Ringkasan Proyek

Coding Bootcamp Platform adalah aplikasi web learning management system (LMS) khusus untuk pembelajaran pemrograman. Platform ini menyediakan kursus terstruktur berbasis teks dan kode, dengan tiga fitur AI utama: **AI Code Review** yang meninjau kode mahasiswa secara otomatis, **AI Exercise Generator** yang membuat soal latihan baru berdasarkan topik, dan **AI Tutor** yang menjawab pertanyaan konseptual mahasiswa. Ketiga fitur ini didukung oleh satu agen Mastra yang dilengkapi tiga tool terpisah.

Mahasiswa dapat mengerjakan tugas coding langsung di editor browser, mengirimkan solusi, dan menerima feedback otomatis dari AI. Instruktur dapat mengelola kursus, melihat submission mahasiswa, dan memantau perkembangan kelas.

Proyek ini dikerjakan dalam **4 sprint × 2 minggu** (total 8 minggu).

---

## 📅 Sesi Pembelajaran

Capstone ini dibagi menjadi 4 sesi pertemuan:

| Sesi | Topik | Durasi | Link |
|------|-------|--------|------|
| 1 | Platform Design & Auth System | 2 minggu | [view](01-platform-design.md) |
| 2 | Content Delivery & Code Execution | 2 minggu | [view](02-content-delivery.md) |
| 3 | AI Tutor & Review System | 2 minggu | [view](03-ai-tutor.md) |
| 4 | Dashboard, Testing & Deployment | 2 minggu | [view](04-deploy-scale.md) |

**Total durasi**: 8 minggu (4 sprint × 2 minggu)

---

## 1. Gambaran Umum

Coding Bootcamp Platform adalah aplikasi web learning management system (LMS) khusus untuk pembelajaran pemrograman. Platform ini menyediakan kursus terstruktur berbasis teks dan kode, dengan tiga fitur AI utama: **AI Code Review** yang meninjau kode mahasiswa secara otomatis, **AI Exercise Generator** yang membuat soal latihan baru berdasarkan topik, dan **AI Tutor** yang menjawab pertanyaan konseptual mahasiswa. Ketiga fitur ini didukung oleh satu agen Mastra yang dilengkapi tiga tool terpisah.

Mahasiswa dapat mengerjakan tugas coding langsung di editor browser, mengirimkan solusi, dan menerima feedback otomatis dari AI. Instruktur dapat mengelola kursus, melihat submission mahasiswa, dan memantau perkembangan kelas.

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

## 4. Data Model

### Entity Relationship Diagram

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

---

## 5. API Endpoints

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

## 6. Detail Integrasi AI (Mastra Agent)

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

### Definisi Mastra Agent

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

---

## 7. Deliverables Checklist

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

## 8. Rubrik Evaluasi

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

*Dokumen ini adalah spesifikasi proyek Capstone 5 — Coding Bootcamp Platform.*
