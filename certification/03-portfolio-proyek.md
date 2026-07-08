---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — 🎓 Persiapan Sertifikasi RPL"
footer: "Sesi 03: Portofolio & Proyek"
---

<!-- _class: title -->
# 📍 Sesi 03 — Portofolio & Proyek Sertifikasi

> **Durasi:** 120 menit  
> **Tujuan:** Menyusun portofolio proyek yang sesuai standar uji sertifikasi, mendokumentasikan kode, dan menyiapkan demo aplikasi

---

## 1. Standar Proyek Sertifikasi

### 1.1 Kriteria Proyek Uji Praktik

Proyek yang dinilai dalam uji sertifikasi biasanya mencakup:

| Area | Kriteria | Bobot |
|------|----------|-------|
| **Fungsionalitas** | Semua fitur berjalan sesuai spesifikasi | 35% |
| **Kualitas Kode** | Struktur bersih, naming konsisten, modular | 20% |
| **Database** | Normalisasi, relasi, query efisien | 15% |
| **Keamanan** | Validasi input, prepared statement, XSS protection | 10% |
| **UI/UX** | Responsive, navigasi jelas, error handling user-friendly | 10% |
| **Dokumentasi** | README lengkap, API docs, cara setup | 10% |

### 1.2 Contoh Spesifikasi Proyek

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  SOAL UJI PRAKTIK — SISTEM MANAJEMEN TUGAS              │
│                                                         │
│  Buatlah aplikasi web manajemen tugas dengan fitur:     │
│                                                         │
│  1. ✅ User registration & login (JWT)                  │
│  2. ✅ CRUD tugas (create, read, update, delete)        │
│  3. ✅ Kategori tugas (work, personal, study)           │
│  4. ✅ Status tugas (pending, in_progress, done)        │
│  5. ✅ Filter tugas by kategori & status                │
│  6. ✅ Search tugas by title                            │
│  7. ✅ Pagination (10 per halaman)                     │
│  8. ✅ Validasi client & server                         │
│  9. ✅ Responsive design (mobile + desktop)             │
│  10. ✅ README dengan instruksi setup                   │
│                                                         │
│  ⏱️ Waktu: 3 jam                                       │
│  🛠️ Stack: bebas (React/Laravel/Express + MySQL)       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Struktur Proyek Ideal

### 2.1 Backend Structure

```
project-name/
├── backend/
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   ├── models/             # Database models / schema
│   │   ├── routes/             # Route definitions
│   │   ├── middleware/         # Auth, validation, error handler
│   │   ├── services/          # Business logic
│   │   ├── validators/        # Input validation schemas
│   │   ├── utils/             # Helpers, constants
│   │   └── app.js             # Entry point
│   ├── database/
│   │   ├── migrations/        # Database migrations
│   │   └── seeds/             # Sample data
│   ├── tests/                 # Unit & integration tests
│   ├── package.json
│   └── .env.example
```

### 2.2 Frontend Structure

```
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page-level components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API client functions
│   │   ├── utils/             # Formatting, validation helpers
│   │   ├── styles/            # CSS / Tailwind files
│   │   └── App.jsx            # Root component
│   ├── public/
│   ├── package.json
│   └── index.html
```

### 2.3 Root Structure

```
├── README.md                  # Dokumentasi utama
├── .gitignore
├── docker-compose.yml         # Opsional — nilai tambah
└── docs/
    ├── api.md                 # Dokumentasi API
    └── arsitektur.md          # Diagram arsitektur
```

---

## 3. Dokumentasi Proyek

### 3.1 Template README

```markdown
# [Nama Aplikasi]

> Aplikasi [jenis aplikasi] untuk [tujuan].
> Dibuat sebagai proyek uji sertifikasi BNSP Web Developer.

## 🚀 Fitur

- ✅ User authentication (register, login, logout)
- ✅ CRUD [entitas utama]
- ✅ Filter & search
- ✅ Responsive design
- ✅ Validasi input

## 🛠️ Tech Stack

| Teknologi | Versi |
|-----------|-------|
| Node.js | v20.x |
| Express | v4.x |
| React | v18.x |
| MySQL | v8.x |
| Tailwind CSS | v3.x |

## 📦 Instalasi

### Prasyarat

- Node.js >= 18
- MySQL >= 8
- npm / yarn

### Langkah Instalasi

```bash
# 1. Clone repository
git clone https://github.com/username/project.git
cd project

# 2. Setup backend
cd backend
cp .env.example .env
# Edit .env — isi database credentials
npm install
npm run migrate
npm run seed
npm run dev

# 3. Setup frontend
cd ../frontend
npm install
npm run dev
```

### Environment Variables

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=task_manager
DB_USER=root
DB_PASS=password
JWT_SECRET=your-secret-key
```

## 📖 API Documentation

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |
| GET | /api/tasks | Get all tasks |
| POST | /api/tasks | Create task |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |
| GET | /api/tasks/search?q=xxx | Search tasks |

## 🧪 Testing

```bash
npm run test        # Unit tests
npm run test:e2e    # E2E tests
```

## 📸 Screenshots

![Dashboard](screenshots/dashboard.png)
![Task List](screenshots/tasks.png)

## 👨‍💻 Author

- Nama: [Nama Lengkap]
- Email: [Email]
- GitHub: [@username]
```

### 3.2 Template API Documentation

```markdown
# API Documentation

## Authentication

### POST /api/auth/register

Mendaftarkan user baru.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Response (400):**
```json
{
  "status": "error",
  "message": "Email already registered"
}
```

### POST /api/auth/login

Login user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

## Tasks

### GET /api/tasks

Get all tasks (authenticated).

**Query Parameters:**
| Parameter | Type | Deskripsi |
|-----------|------|-----------|
| page | number | Halaman (default: 1) |
| limit | number | Per halaman (default: 10) |
| category | string | Filter kategori |
| status | string | Filter status |
| q | string | Search query |

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "tasks": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "totalPages": 5
    }
  }
}
```
```

---

## 4. Kualitas Kode yang Dinilai

### 4.1 Checklist Code Quality

| Aspek | Standar | Contoh Baik | Contoh Buruk |
|-------|---------|-------------|--------------|
| **Naming** | Deskriptif, konsisten | `getUserById` | `getData`, `func1` |
| **Modular** | Fungsi >1 baris, single responsibility | 1 fungsi = 1 tanggung jawab | 1 fungsi = semua logic |
| **Error Handling** | try-catch, error middleware | `asyncHandler(fn)` | `.catch(console.log)` |
| **Security** | Prepared statement, input validation | `SELECT * FROM users WHERE id = ?` | ``SELECT * FROM users WHERE id = ${id}`` |
| **Consistency** | Satu style guide | ESLint + Prettier | Campur-campur style |
| **DRY** | No duplication | Utility functions | Copy-paste code |

### 4.2 Contoh Kode Bernilai Tinggi

```javascript
// ✅ GOOD — Dipuji asesor
// - Async error handler middleware
// - Input validation dengan Joi/Zod
// - Prepared statement
// - Response format konsisten

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const taskSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  category: z.enum(['work', 'personal', 'study']),
  status: z.enum(['pending', 'in_progress', 'done']).default('pending'),
});

exports.createTask = asyncHandler(async (req, res) => {
  const validated = taskSchema.parse(req.body);

  const [result] = await db.query(
    'INSERT INTO tasks (title, description, category, status, user_id) VALUES (?, ?, ?, ?, ?)',
    [validated.title, validated.description, validated.category, validated.status, req.user.id]
  );

  res.status(201).json({
    status: 'success',
    message: 'Task created successfully',
    data: { id: result.insertId, ...validated },
  });
});
```

### 4.3 Contoh Kode Bernilai Rendah

```javascript
// ❌ BAD — Bikin asesor ngurangin nilai
// - No error handling
// - SQL injection risk
// - Inconsistent response format
// - Magic strings everywhere

app.post('/addtask', (req, res) => {
  const title = req.body.title;
  // SQL INJECTION! Langsung dikasih nilai 0 oleh asesor
  db.query(`INSERT INTO tasks (title) VALUES ('${title}')`, (err, result) => {
    res.send('OK');
  });
});
```

---

## 5. Demo & Presentasi

### 5.1 Persiapan Demo

Saat sesi wawancara / demo, asesor akan meminta kamu mendemonstrasikan aplikasi:

| Tahap | Durasi | Yang Dinilai |
|-------|--------|-------------|
| **Perkenalan** | 2 menit | Nama, proyek, tech stack |
| **Demo Fitur** | 10 menit | Semua fitur berjalan |
| **Live Coding** | 5 menit | Menambah fitur minor |
| **Tanya Jawab** | 8 menit | Pemahaman konsep |
| **Klarifikasi** | 5 menit | Penjelasan keputusan teknis |

### 5.2 Skenario Demo

```
"Selamat pagi, asesor. Perkenalkan saya [Nama], peserta uji sertifikasi
Web Developer. Hari ini saya akan mendemonstrasikan aplikasi
[Project Name]."

"Project ini adalah [deskripsi singkat]. Tech stack yang saya gunakan
adalah React untuk frontend, Express untuk backend, dan MySQL untuk
database."

"Langkah pertama, saya akan menunjukkan halaman registrasi dan login..."

"Sekarang kita masuk ke halaman utama. Fitur CRUD task berjalan dengan
baik — saya akan create, read, update, dan delete satu task..."

"Fitur search dan filter juga berfungsi..."

"KESIMPULAN: Project ini memenuhi semua kriteria yang diminta. Saya
siap menjawab pertanyaan asesor."
```

### 5.3 Pertanyaan Umum Asesor

| Pertanyaan | Jawaban yang Dicari |
|-----------|-------------------|
| "Kenapa pilih teknologi ini?" | Alasan teknis, bukan "soalnya gampang" |
| "Bagaimana cara handle error?" | Error middleware, try-catch, user-friendly message |
| "Bagaimana keamanan aplikasi ini?" | Prepared statement, JWT, validasi, CORS, rate limit |
| "Apa yang bakal kamu tingkatkan?" | Realistis — testing, deployment, monitoring |
| "Ada bug di aplikasi kamu?" | Jujur — sebutkan & rencana perbaikan |

---

## 6. Latihan: Dokumentasi Proyek

### Tugas (45 menit)

Buat dokumentasi lengkap untuk proyek yang pernah kamu buat:

1. **README.md** — Ikuti template di atas
2. **API Docs** — Dokumentasikan minimal 3 endpoint
3. **Screenshot** — Ambil screenshot aplikasi (dashboard + form)
4. **Self-review** — Evaluasi kode dengan checklist kualitas

### Kriteria Sukses

- [ ] README mencakup semua bagian: deskripsi, fitur, tech stack, instalasi, API, testing
- [ ] API docs jelas dengan request/response contoh
- [ ] Screenshot menunjukkan fitur utama
- [ ] Self-review jujur — sebutkan yang kurang
- [ ] Siap didemo ke asesor dalam 5 menit

---

## Referensi

- [Make a README — Template](https://www.makeareadme.com)
- [Readme.so — README Generator](https://readme.so)
- [Markdown Guide](https://www.markdownguide.org)
- [Conventional Commits](https://www.conventionalcommits.org)
- [Awesome README](https://github.com/matiassingers/awesome-readme)
