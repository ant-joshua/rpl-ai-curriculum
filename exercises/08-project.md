# 🏋️ Latihan Final Project — Planning & Writing

Latihan ini fokus ke **planning & dokumentasi** — bukan coding. Tiap jawaban ditulis dalam format markdown.

---

## Level 1: Dasar

### 1. ERD Design — Travel Planner App

Bikin ERD (Entity Relationship Diagram) untuk aplikasi **Travel Planner**. Tulis dalam format markdown table atau Mermaid.

**Requirements:**
- User bisa daftar & login (email + password)
- User bisa bikin trip (judul, destinasi, tanggal mulai, tanggal selesai)
- Satu trip bisa punya banyak destinasi (nama tempat, latitude, longitude, catatan)
- User bisa undang user lain ke trip (pending → accepted → rejected)
- Setiap trip punya itinerary per hari (day number, activities list)

```markdown
# ERD — Travel Planner

## Entities & Attributes

### User
<!-- === TULIS DI SINI === -->
<!-- id, email, password_hash, name, created_at -->

### Trip
<!-- === TULIS DI SINI === -->
<!-- id, user_id (FK), title, destination, start_date, end_date, created_at -->

### Destination
<!-- ... -->

### TripMember
<!-- ... -->

### ItineraryItem
<!-- ... -->

## Relationships

<!-- Gambarin relasi pake Mermaid atau teks -->
<!-- Contoh: User 1──N Trip (User punya banyak trip) -->

## ERD Diagram (Mermaid)

```mermaid
erDiagram
    <!-- === KODE MERMAID LO DISINI === -->
```

```

**Kriteria penilaian:**
- Semua entitas sesuai requirement
- Primary key & foreign key jelas
- Relasi (1:N, M:N) bener
- Cardinality & participation tepat

### 2. User Stories — Fitur Prioritas

Bikin user stories untuk 5 fitur utama aplikasi **E-Commerce Sederhana**.

**Fitur yang harus ada:**
1. Manajemen produk (CRUD)
2. Keranjang belanja
3. Checkout & pesanan
4. Autentikasi (login/register)
5. Search & filter produk

**Format user story:**
```
Sebagai [peran], saya ingin [tujuan] sehingga [benefit]
```

**Acceptance criteria** (min 2 per story).

```markdown
<!-- === TULIS LO DISINI === -->
<!-- Contoh:
## US-01: Manajemen Produk
**User Story:**
Sebagai admin, saya ingin menambah, mengedit, dan menghapus produk sehingga katalog tetap update.

**Acceptance Criteria:**
- [ ] Admin bisa nambah produk dengan form (nama, harga, stok, gambar, kategori)
- [ ] Admin bisa edit produk yang udah ada
- [ ] Admin bisa hapus produk (konfirmasi dulu)
- [ ] Produk yang udah dihapus gak muncul di toko
-->
```

### 3. API Route Planning

Design REST API endpoints untuk aplikasi **Catatan** (note-taking app).

**Entities:**
- User (id, name, email, password)
- Note (id, user_id, title, content, tags, created_at, updated_at)
- Tag (id, name)

Tulis endpoint dengan format:

| Method | Endpoint | Deskripsi | Auth | Request Body | Response |
|--------|----------|-----------|------|-------------|----------|
| POST | /api/auth/register | Daftar user baru | No | { name, email, password } | { user, token } |
| ... | ... | ... | ... | ... | ... |

**Minimal endpoints yang harus ada:**
- Auth: register, login
- Notes: CRUD, search by tag, filter by date
- Tags: list all tags

```markdown
# API Design — Catatan App

## Base URL: `/api`

## Authentication
<!-- === TULIS LO DISINI === -->

## Notes
<!-- === TULIS LO DISINI === -->

## Tags
<!-- === TULIS LO DISINI === -->
```

## Level 2: Intermediate

### 4. Sprint Planning — Sprint Backlog

Buat sprint planning untuk **Sprint 1** (minggu 1-2) dari project **Task Manager App**.

**Product Goal:** Aplikasi manajemen tugas sederhana yang bisa bikin, edit, hapus, dan filter tugas.

**Sprint 1 Goal:** Setup project + fitur CRUD tugas dasar.

**Tim:** 2 developer (kamu + 1 partner).

**Tugas:**
1. Breakdown requirements jadi task-task kecil
2. Estimasi effort tiap task (story points: 1, 2, 3, 5, 8)
3. Assign ke anggota tim
4. Tulis di format sprint backlog

```markdown
# Sprint 1 Backlog — Task Manager

**Sprint Goal:** <!-- === TULIS === -->

**Durasi:** 2 minggu (10 hari kerja)

## Backlog Items

| ID | Task | Story Points | Assignee | Status |
|----|------|-------------|----------|--------|
| SP-1 | Setup project (Express + Prisma + TypeScript) | 3 | Kamu | To Do |
| ... | ... | ... | ... | ... |

## Task Details

### SP-1: Setup Project
**Description:** Init project structure, install dependencies, configure TypeScript & Prisma
**Acceptance Criteria:**
- [ ] Bisa jalanin `npm run dev`
- [ ] Prisma connected ke database
- [ ] Struktur folder sesuai standar
**Estimate:** 3 SP
**Assigned to:** Kamu

<!-- === TULIS SISA TASK LAINNYA (min 8 task total) === -->
```

**Task yang harus ada (minimal):**
- Setup project
- Setup database (Prisma schema)
- Bikin API: GET /tasks, POST /tasks
- Bikin API: PUT /tasks/:id, DELETE /tasks/:id
- Bikin halaman daftar tugas (frontend)
- Bikin halaman tambah tugas (form)
- Error handling & validation
- Deploy ke staging

### 5. Deployment Checklist

Buat deployment checklist untuk aplikasi **Full-stack Next.js + Express + PostgreSQL** yang akan di-deploy ke **Vercel (frontend) + Railway (backend + DB)**.

```markdown
# Deployment Checklist

## Pra-deploy

### Kode & Git
<!-- === TULIS LO DISINI === -->
- [ ] ...
- [ ] ...

### Environment Variables
<!-- === TULIS LO DISINI === -->
- [ ] ...

### Database
<!-- === TULIS LO DISINI === -->
- [ ] ...

### Build
<!-- === TULIS LO DISINI === -->
- [ ] ...

## Deploy

### Backend (Railway)
<!-- === TULIS LO DISINI === -->
- [ ] ...

### Frontend (Vercel)
<!-- === TULIS LO DISINI === -->
- [ ] ...

## Pasca-deploy

### Testing
<!-- === TULIS LO DISINI === -->
- [ ] ...

### Monitoring
<!-- === TULIS LO DISINI === -->
- [ ] ...

### Rollback Plan
<!-- === TULIS LO DISINI === -->
- [ ] ...
```

**Minimal 20 checklist items** total, mencakup:
- Kode: branch strategi, .gitignore, env sample
- Build: vercel.json/railway.toml, build script OK
- Database: migrasi jalan, seeding data
- Security: CORS, rate limiting, JWT secret
- Monitoring: log, error tracking
- Rollback: gimana cara rollback kalo error

## Level 3: Challenge

### 6. Arsitektur & Dokumentasi API Lengkap

Buat dokumen teknis untuk aplikasi **AI Chatbot** yang pake:
- Frontend: Next.js (Vercel)
- Backend: Express + TypeScript (Railway)
- Database: PostgreSQL + Prisma
- AI: Mastra AI Agent dengan 3 tools (weather search, news search, calculator)
- Auth: JWT

**Yang harus ditulis:**

#### A. System Architecture Diagram (text-based)
```
<!-- === TULIS DISINI === -->
<!-- Gambarin: Client → Vercel → Next.js → Express API → Railway -->
<!--            ↓                                    ↓            -->
<!--        Mastra AI                           PostgreSQL       -->
```

#### B. Data Flow — "User nanya cuaca"
<!-- Step-by-step dari user ketik sampai dapet jawaban -->

#### C. Component Tree (Frontend)
```
<App>
  <AuthProvider>
    <ChatLayout>
      <Sidebar>     <!-- chat history -->
      <ChatWindow>
        <MessageList>
          <MessageBubble>
        <ChatInput>
      </ChatLayout>
    </AuthProvider>
</App>
```

#### D. API Documentation (min 8 endpoints)
Include: method, path, auth, request/response examples, error codes.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/login | No | Login user |
| ... | ... | ... | ... |

#### E. Mastra Agent Configuration
```typescript
// === TULIS KONFIGURASI AGENT LO DISINI ===
// Tools yang dipake
// Prompt system
// Contoh interaksi
```

#### F. Database Schema (Prisma)
```prisma
// === TULIS PRISMA SCHEMA LO DISINI ===
// model User { ... }
// model Chat { ... }
// model Message { ... }
```

**Kriteria penilaian:**
- Architecture jelas & masuk akal
- Data flow lengkap (dari request ke response)
- API doc: tiap endpoint punya contoh request & response (success + error)
- Prisma schema: relasi bener, index penting ada
- Mastra config: system prompt jelas, tools relevan
