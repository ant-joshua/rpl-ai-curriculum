# Capstone 2: AI Travel Planner — Perencana Perjalanan dengan Kecerdasan Buatan

**Mata Kuliah:** RPL — Rekayasa Perangkat Lunak  
**Durasi:** 8 Minggu (4 Sprint × 2 Minggu)  
**Tipe:** Proyek Individu / Kelompok (maks. 3 orang)  
**Bobot:** 25% dari nilai akhir

---

## 1. Overview

AI Travel Planner adalah aplikasi web full-stack yang membantu pengguna merencanakan perjalanan wisata secara cerdas. Pengguna memasukkan destinasi, durasi, dan anggaran — sistem secara otomatis menghasilkan itinerary harian yang dioptimalkan menggunakan agen AI.

Agen AI (Mastra agent) memiliki tiga tools:
- **weatherCheck** — cek prakiraan cuaca per hari di destinasi.
- **budgetOptimizer** — alokasi anggaran per kategori (akomodasi, transportasi, makan, aktivitas).
- **placeRecommender** — rekomendasi tempat wisata, restoran, dan hotel berdasarkan preferensi.

Proyek ini mensimulasikan siklus pengembangan perangkat lunak profesional: analisis kebutuhan, desain database, implementasi REST API, integrasi AI, testing, dan deployment.

### Tujuan Pembelajaran
- Menerapkan REST API design principles (resource naming, status codes, pagination).
- Mengintegrasikan AI agent ke dalam alur bisnis aplikasi.
- Menulis test coverage untuk controller, service, dan integrasi AI.
- Mengelola proyek dengan Scrum (sprint planning, retrospective, product backlog).
- Membangun sistem berbasis SQL dengan relasi kompleks (trips → trip_days → activities).

---

## 2. Tech Stack

| Layer         | Teknologi                                                                 |
|---------------|---------------------------------------------------------------------------|
| **Frontend**  | React + Vite + Tailwind CSS                                               |
| **Backend**   | Node.js + Hono / Fastify / Express (pilih satu, konsisten)                |
| **Database**  | PostgreSQL / SQLite (dev) — wajib SQL relations                           |
| **AI Agent**  | Mastra framework (tools: weatherCheck, budgetOptimizer, placeRecommender) |
| **Auth**      | JWT (jsonwebtoken) atau session-based                                     |
| **Testing**   | Vitest / Jest (unit + integration), Playwright / Supertest (E2E)          |
| **Deploy**    | Docker + Docker Compose, deploy ke Railway / Render / VPS                 |
| **ORM**       | Drizzle ORM / Prisma / Knex (pilih satu, wajib migration-based)          |

---

## 3. Learning Outcomes

Setelah menyelesaikan capstone ini, mahasiswa mampu:

1. **LO-1:** Merancang REST API dengan resource modeling, validasi, dan error handling yang tepat.
2. **LO-2:** Mengimplementasikan CRUD + relasi SQL menggunakan ORM dengan migration.
3. **LO-3:** Mengintegrasikan agen AI (Mastra) ke endpoint API sebagai decision engine.
4. **LO-4:** Menulis automated test untuk unit, integration, dan mock external API.
5. **LO-5:** Menerapkan Scrum dalam pengembangan: user stories, sprint backlog, daily standup, sprint review.
6. **LO-6:** Mendokumentasikan API dengan OpenAPI/Swagger dan menyusun README proyek.
7. **LO-7:** Mendeploy aplikasi ke production dengan Docker.

---

## 4. Features by Sprint

### Sprint 1 — Foundation & Auth (Minggu 1–2)

**Goal:** Setup proyek, database, autentikasi, CRUD trips.

| ID  | User Story                                                              | Acceptance Criteria                                                  |
|-----|-------------------------------------------------------------------------|----------------------------------------------------------------------|
| S1-1| Pengguna dapat register & login (JWT)                                   | Endpoint POST /auth/register, POST /auth/login return token          |
| S1-2| Pengguna dapat membuat trip baru (destinasi, durasi, budget)            | POST /trips, validasi input, return trip object                      |
| S1-3| Pengguna dapat melihat daftar trip miliknya                             | GET /trips, pagination, filter by status                             |
| S1-4| Pengguna dapat mengupdate & menghapus trip                              | PUT /trips/:id, DELETE /trips/:id, authorization check               |
| S1-5| Database migration & seeding data dummy                                 | Migration create trips + trip_days + activities tables               |

**Deliverables Sprint 1:**
- [x] Repository GitHub dengan branch strategy (main, develop, feat/*).
- [x] Database schema & migration pertama.
- [x] Auth flow (register, login, JWT middleware).
- [x] CRUD trips endpoints lengkap dengan testing.
- [x] README awal berisi setup instructions.

---

### Sprint 2 — Itinerary Engine (Minggu 3–4)

**Goal:** CRUD trip_days & activities, logika generate itinerary otomatis.

| ID  | User Story                                                              | Acceptance Criteria                                                  |
|-----|-------------------------------------------------------------------------|----------------------------------------------------------------------|
| S2-1| Pengguna dapat menambah hari perjalanan ke trip                         | POST /trips/:id/days, auto-urut day_number                          |
| S2-2| Pengguna dapat menambah aktivitas ke hari tertentu                      | POST /trips/:id/days/:dayId/activities, include time, place, cost    |
| S2-3| Pengguna dapat reorder aktivitas dalam sehari (drag-drop API)           | PATCH /activities/:id/reorder, update urutan                         |
| S2-4| Sistem generate itinerary otomatis via AI agent                         | POST /trips/:id/generate, panggil Mastra, return itinerary json      |
| S2-5| Validasi budget — total biaya aktivitas tidak melebihi budget trip      | Middleware cek total cost sebelum insert activity                    |

**Deliverables Sprint 2:**
- [x] Endpoints trip_days & activities CRUD.
- [x] Itinerary generation endpoint terhubung ke Mastra agent.
- [x] Budget validation middleware.
- [x] Unit test untuk service logic + mock Mastra agent.
- [x] Postman collection / OpenAPI spec update.

---

### Sprint 3 — AI Integration Deep Dive (Minggu 5–6)

**Goal:** Tiga tools Mastra agent berfungsi penuh, response caching, error handling.

| ID  | User Story                                                              | Acceptance Criteria                                                  |
|-----|-------------------------------------------------------------------------|----------------------------------------------------------------------|
| S3-1| Mastra agent tool `weatherCheck` — cek cuaca per lokasi & tanggal        | Agent return suhu, kondisi, rekomendasi pakaian                      |
| S3-2| Mastra agent tool `budgetOptimizer` — alokasi budget harian              | Agent split total budget menjadi alokasi per hari & kategori         |
| S3-3| Mastra agent tool `placeRecommender` — rekomendasi tempat & rating       | Agent return list tempat dengan nama, kategori, estimasi biaya       |
| S3-4| Full AI generate: sistem kirim prompt → agent olah data → simpan hasil | Pipeline: fetch data → call agent → parse JSON → insert ke database |
| S3-5| Caching hasil AI (Redis / in-memory) agar tidak panggil ulang           | Cache key: `${location}_${date}`, TTL 1 jam                         |
| S3-6| Graceful error handling saat agent timeout atau rate-limit              | Fallback: return warning + partial result, jangan crash             |

**Deliverables Sprint 3:**
- [x] Implementasi ketiga tools Mastra agent.
- [x] Pipeline generate penuh (generate → save → return).
- [x] Caching layer untuk hasil AI.
- [x] Integration test dengan mock external API (weather API, dll).
- [x] Dokumentasi AI agent flow (diagram + penjelasan).

---

### Sprint 4 — UI, Testing, & Deployment (Minggu 7–8)

**Goal:** Frontend lengkap, E2E test, Dockerize, deploy.

| ID  | User Story                                                              | Acceptance Criteria                                                  |
|-----|-------------------------------------------------------------------------|----------------------------------------------------------------------|
| S4-1| Halaman dashboard — daftar trip + status                                | React component, fetch GET /trips, loading & error state             |
| S4-2| Halaman detail trip — itinerary per hari, drag-drop aktivitas           | Tampilkan day cards, reorder via drag-drop, update via API           |
| S4-3| Halaman generate — tombol "Generate Itinerary" + loading + result       | Panggil POST /trips/:id/generate, tampilkan hasil, simpan            |
| S4-4| Halaman auth — login & register form                                    | Validasi client-side, error message dari server                      |
| S4-5| E2E test — register → buat trip → generate → lihat itinerary            | Playwright / Supertest, test critical path                           |
| S4-6| Docker Compose — backend + frontend + database                          | `docker compose up` jalan, semua service connected                  |
| S4-7| Deploy ke production (Railway / Render / VPS)                          | Public URL, environment variables, database connection string        |

**Deliverables Sprint 4:**
- [x] Frontend React dengan semua halaman fungsional.
- [x] E2E test coverage untuk critical user journey.
- [x] Dockerfile + docker-compose.yml.
- [x] Deployment ke production.
- [x] README final — lengkap dengan screenshot, arsitektur, cara pakai.

---

## 5. Data Model (SQL)

### Entity Relationship Diagram (teks)

```
trips 1 ──── * trip_days 1 ──── * activities
```

### Table: `trips`

| Column         | Type         | Constraints                     |
|----------------|--------------|----------------------------------|
| id             | UUID         | PK, default uuid_generate_v4()  |
| user_id        | UUID         | FK → users.id, NOT NULL         |
| destination    | VARCHAR(255) | NOT NULL                        |
| duration_days  | INTEGER      | NOT NULL, >= 1                  |
| total_budget   | DECIMAL(12,2)| NOT NULL, >= 0                  |
| currency       | VARCHAR(3)   | DEFAULT 'IDR'                   |
| status         | ENUM         | 'draft','active','completed'    |
| weather_data   | JSONB        | NULLABLE, hasil cache cuaca     |
| created_at     | TIMESTAMPTZ  | DEFAULT NOW()                   |
| updated_at     | TIMESTAMPTZ  | AUTO-UPDATE                     |

### Table: `trip_days`

| Column         | Type         | Constraints                     |
|----------------|--------------|----------------------------------|
| id             | UUID         | PK                              |
| trip_id        | UUID         | FK → trips.id, ON DELETE CASCADE|
| day_number     | INTEGER      | NOT NULL, UNIQUE(trip_id, day_number) |
| date           | DATE         | NULLABLE                        |
| daily_budget   | DECIMAL(12,2)| NULLABLE                        |
| notes          | TEXT         | NULLABLE                        |
| created_at     | TIMESTAMPTZ  | DEFAULT NOW()                   |

### Table: `activities`

| Column         | Type         | Constraints                     |
|----------------|--------------|----------------------------------|
| id             | UUID         | PK                              |
| trip_day_id    | UUID         | FK → trip_days.id, ON DELETE CASCADE |
| name           | VARCHAR(255) | NOT NULL                        |
| description    | TEXT         | NULLABLE                        |
| category       | ENUM         | 'attraction','food','transport','hotel','shopping','other' |
| start_time     | TIME         | NULLABLE                        |
| end_time       | TIME         | NULLABLE                        |
| place_name     | VARCHAR(255) | NULLABLE                        |
| latitude       | DECIMAL(10,7)| NULLABLE                        |
| longitude      | DECIMAL(10,7)| NULLABLE                        |
| estimated_cost | DECIMAL(12,2)| DEFAULT 0                       |
| currency       | VARCHAR(3)   | DEFAULT 'IDR'                   |
| sort_order     | INTEGER      | DEFAULT 0                       |
| is_ai_generated| BOOLEAN      | DEFAULT FALSE                   |
| created_at     | TIMESTAMPTZ  | DEFAULT NOW()                   |

### Indexes

```sql
CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_trip_days_trip_id ON trip_days(trip_id);
CREATE INDEX idx_activities_trip_day_id ON activities(trip_day_id);
CREATE INDEX idx_activities_sort ON activities(trip_day_id, sort_order);
CREATE INDEX idx_trips_status ON trips(status);
```

---

## 6. API Endpoints

| Method | Endpoint                              | Auth | Description                              | Status Codes            |
|--------|---------------------------------------|------|------------------------------------------|-------------------------|
| POST   | /api/auth/register                    | No   | Register user baru                       | 201, 400, 409           |
| POST   | /api/auth/login                       | No   | Login, return JWT                        | 200, 401                |
| GET    | /api/auth/me                          | Yes  | Profile user saat ini                    | 200, 401                |
| GET    | /api/trips                            | Yes  | List trips milik user (paginated)        | 200, 401                |
| POST   | /api/trips                            | Yes  | Buat trip baru                           | 201, 400                |
| GET    | /api/trips/:id                        | Yes  | Detail trip + days + activities          | 200, 404                |
| PUT    | /api/trips/:id                        | Yes  | Update trip                              | 200, 400, 404           |
| DELETE | /api/trips/:id                        | Yes  | Hapus trip (cascade)                     | 204, 404                |
| GET    | /api/trips/:id/days                   | Yes  | List semua hari dalam trip               | 200, 404                |
| POST   | /api/trips/:id/days                   | Yes  | Tambah hari baru                         | 201, 400                |
| PATCH  | /api/trips/:id/days/:dayId            | Yes  | Update daily budget / notes              | 200, 400, 404           |
| DELETE | /api/trips/:id/days/:dayId            | Yes  | Hapus hari + aktivitas di dalamnya       | 204, 404                |
| GET    | /api/days/:dayId/activities           | Yes  | List aktivitas per hari (urut sort_order)| 200, 404                |
| POST   | /api/days/:dayId/activities           | Yes  | Tambah aktivitas                         | 201, 400, 422 (budget)  |
| PUT    | /api/activities/:id                   | Yes  | Update aktivitas                         | 200, 400, 404           |
| DELETE | /api/activities/:id                   | Yes  | Hapus aktivitas                          | 204, 404                |
| PATCH  | /api/activities/:id/reorder           | Yes  | Ubah sort_order aktivitas                | 200, 400, 404           |
| POST   | /api/trips/:id/generate               | Yes  | Generate itinerary via AI agent          | 200, 400, 503 (AI down) |
| GET    | /api/trips/:id/weather                | Yes  | Get cached weather data                  | 200, 404                |

### Response Format (standar)

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 42
  },
  "error": null
}
```

Error response:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "BUDGET_EXCEEDED",
    "message": "Total aktivitas melebihi budget trip"
  }
}
```

---

## 7. AI Integration Detail — Mastra Agent

### Arsitektur Agent

```
┌─────────────┐     ┌─────────────────────────────────────┐
│  Client App │────▶│  POST /api/trips/:id/generate       │
└─────────────┘     └──────────┬──────────────────────────┘
                               │
                      ┌────────▼────────┐
                      │  Mastra Agent   │
                      │  (Type: LLM)    │
                      └────────┬────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
     ┌─────────────┐  ┌──────────────┐  ┌──────────────┐
     │ weatherCheck │  │budgetOptimiz│  │placeRecommndr│
     │    tool      │  │  er tool    │  │    tool      │
     └──────┬──────┘  └──────┬───────┘  └──────┬───────┘
            │                │                  │
            ▼                ▼                  ▼
     External API      Budget calc       Database /
     (OpenWeather)     (in-memory)       Google Places / dummy
```

### Agent Definition (contoh kode Mastra)

```typescript
// src/agents/travelAgent.ts
import { Agent } from '@mastra/core/agent';
import { weatherCheck } from '../tools/weatherCheck';
import { budgetOptimizer } from '../tools/budgetOptimizer';
import { placeRecommender } from '../tools/placeRecommender';

export const travelAgent = new Agent({
  name: 'Travel Planner Agent',
  instructions: `
    Kamu adalah asisten perencana perjalanan.
    Berdasarkan input destinasi, durasi, dan budget pengguna:
    1. Gunakan weatherCheck untuk cek cuaca setiap hari.
    2. Gunakan budgetOptimizer untuk alokasi budget harian.
    3. Gunakan placeRecommender untuk rekomendasi tempat.
    4. Kembalikan itinerary dalam format JSON strict.
  `,
  tools: {
    weatherCheck,
    budgetOptimizer,
    placeRecommender,
  },
  model: {
    provider: 'OPEN_AI',
    name: 'gpt-4o-mini',
    apiKey: process.env.OPENAI_API_KEY,
  },
});
```

### Tool Specifications

#### 1. `weatherCheck`

| Parameter | Type   | Description                            |
|-----------|--------|----------------------------------------|
| location  | string | Nama kota/destinasi                    |
| date      | string | Format YYYY-MM-DD                      |

**Output:**

```json
{
  "temperature": 28.5,
  "condition": "Cerah Berawan",
  "humidity": 65,
  "recommendation": "Bawa topi dan sunscreen"
}
```

#### 2. `budgetOptimizer`

| Parameter   | Type   | Description                        |
|-------------|--------|------------------------------------|
| totalBudget | number | Total budget perjalanan            |
| durationDays| number | Durasi trip dalam hari             |
| preferences | object | Prioritas: accommodation, food, etc|

**Output:**

```json
{
  "dailyAllocations": [
    { "day": 1, "accommodation": 500000, "food": 200000, "transport": 150000, "activities": 150000 },
    { "day": 2, "accommodation": 500000, "food": 200000, "transport": 100000, "activities": 200000 }
  ],
  "total": 2000000
}
```

#### 3. `placeRecommender`

| Parameter  | Type   | Description                       |
|------------|--------|-----------------------------------|
| location   | string | Destinasi                         |
| category   | string | attraction / food / hotel         |
| maxResults | number | Maksimal rekomendasi (default: 5) |

**Output:**

```json
{
  "places": [
    {
      "name": "Malioboro",
      "category": "attraction",
      "rating": 4.5,
      "estimatedCost": 0,
      "latitude": -7.7925,
      "longitude": 110.3658,
      "description": "Kawasan wisata ikonik Yogyakarta"
    }
  ]
}
```

### AI Pipeline Flow

1. **Trigger:** Client panggil `POST /api/trips/:id/generate`.
2. **Fetch Context:** Backend ambil data trip (destinasi, durasi, budget) dari DB.
3. **Build Prompt:** Buat prompt terstruktur → kirim ke Mastra agent.
4. **Agent Execution:**
   - Agent panggil `weatherCheck(location, date)` untuk setiap hari.
   - Agent panggil `budgetOptimizer(budget, days, preferences)`.
   - Agent panggil `placeRecommender(location, 'attraction')` + `placeRecommender(location, 'food')`.
5. **Parse Output:** Parse JSON dari agent.
6. **Save:** Simpan `trip_days` dan `activities` hasil AI ke database (tandai `is_ai_generated = true`).
7. **Cache:** Simpan hasil weather ke kolom `weather_data` di trips.
8. **Return:** Response detail trip dengan itinerary lengkap.

### Error Handling Strategy

| Skenario                   | Response                                  |
|----------------------------|-------------------------------------------|
| Agent timeout (>15 detik)  | 503 Service Unavailable + retry button    |
| Tool external API down     | Partial result + warning message          |
| Budget tidak mencukupi     | 422 Unprocessable + detail alokasi        |
| Invalid JSON dari agent    | Retry 1x, gagal → fallback manual input   |

---

## 8. Deliverables Checklist

### Wajib (100% nilai)
- [ ] **A1:** REST API lengkap (min. 15 endpoints) dengan middleware auth.
- [ ] **A2:** Database migration & seeding (min. 3 tabel: trips, trip_days, activities).
- [ ] **A3:** Integrasi Mastra agent dengan min. 2 tools aktif.
- [ ] **A4:** Endpoint generate itinerary yang memanggil agent dan menyimpan hasil.
- [ ] **A5:** Unit test (min. 10 test cases) + integration test (min. 5 test cases).
- [ ] **A6:** Frontend React dengan halaman: login, dashboard, detail trip, generate.
- [ ] **A7:** Docker Compose (backend + frontend + database) siap develop.
- [ ] **A8:** README final berisi: deskripsi, tech stack, cara install, konfigurasi, endpoint table, screenshot.

### Bonus (nilai tambah)
- [ ] **B1:** E2E test dengan Playwright (critical path).
- [ ] **B2:** Redis caching untuk hasil AI.
- [ ] **B3:** Deploy ke production (URL publik).
- [ ] **B4:** OpenAPI/Swagger documentation endpoint.
- [ ] **B5:** Drag-drop reorder aktivitas di frontend.
- [ ] **B6:** Dark mode UI.

---

## 9. Evaluation Rubric

| Kriteria                    | Bobot | 4 (Sangat Baik)                                      | 3 (Baik)                                      | 2 (Cukup)                                    | 1 (Kurang)                                   |
|-----------------------------|-------|------------------------------------------------------|-----------------------------------------------|-----------------------------------------------|----------------------------------------------|
| **REST API Design**         | 15%   | Semua endpoint RESTful, status codes tepat, validasi input lengkap, error handling konsisten | Sebagian besar endpoint sesuai REST, error handling ada tapi tidak konsisten | Endpoint ada tapi kurang RESTful (method salah, status code asal) | Endpoint tidak lengkap atau tidak berfungsi |
| **Database & ORM**          | 10%   | Migration clean, relasi terjaga, index optimal, seeding data dummy lengkap | Migration ada, relasi benar, seeding minimal | Migration ada tapi manual, relasi kurang tepat | Tidak pakai migration, relasi salah         |
| **AI Integration**          | 25%   | 3 tools Mastra berfungsi penuh, pipeline generate smooth, caching, error handling AI | 2 tools berfungsi, pipeline generate ada, error handling minimal | 1 tool berfungsi, generate manual tanpa agent | Tidak ada integrasi AI                      |
| **Testing**                 | 15%   | Unit test >10, integration >5, mock external API, coverage >70%. Bonus: E2E | Unit test >5, integration >3, coverage report ada | Test ada tapi minimal (<5), coverage <30%    | Tidak ada test                              |
| **Frontend**                | 15%   | Semua halaman fungsional, loading state, error state, responsive, drag-drop | Halaman utama fungsional, responsive, minor bug | Beberapa halaman tidak jalan, tidak responsive | Frontend tidak ada atau tidak fungsional    |
| **Deployment & DevOps**     | 10%   | Docker Compose jalan, deploy production URL publik, environment variable rapi | Docker Compose jalan, belum di-deploy | Dockerfile ada tapi tidak jalan             | Tidak ada Docker / deployment               |
| **Dokumentasi & Scrum**     | 10%   | README lengkap, OpenAPI spec, sprint backlog rapi, retrospective ada | README cukup, beberapa endpoint didokumentasi | README minimal, tidak ada backlog            | Tidak ada dokumentasi                       |

### Konversi Nilai Akhir

| Rentang Skor | Nilai Huruf |
|--------------|-------------|
| 85–100       | A           |
| 75–84        | B           |
| 65–74        | C           |
| 50–64        | D           |
| < 50         | E           |

---

## 10. Referensi

- [Mastra Framework Docs](https://mastra.ai/docs)
- [Hono — Lightweight Web Framework](https://hono.dev/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Playwright — E2E Testing](https://playwright.dev/)
- [REST API Best Practices — Microsoft](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design)

---

*Dokumen ini adalah bagian dari kurikulum RPL — Rekayasa Perangkat Lunak. Dapat diperbarui setiap semester.*
