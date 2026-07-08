# 🏆 RPL AI — Weekly Coding Challenge

```
██████╗ ██████╗ ██╗      █████╗ ██╗
██╔══██╗██╔══██╗██║     ██╔══██╗██║
██████╔╝██████╔╝██║     ███████║██║
██╔══██╗██╔══██╗██║     ██╔══██║██║
██║  ██║██║  ██║███████╗██║  ██║██║
╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝
```

Selamat datang di **RPL AI Weekly Coding Challenge**! Program ini dirancang untuk mengasah kemampuan coding kamu secara bertahap — dari dasar HTML/CSS sampai membangun fullstack AI app yang lengkap dengan autentikasi, deployment, dan testing.

Setiap minggu kamu akan menghadapi satu tantangan yang levelnya semakin naik. Ikuti step-by-step, penuhi acceptance criteria, dan kumpulkan sesuai format submission.

---

## 📋 Daftar Challenge

| Minggu | Judul | Fokus | Output |
|--------|-------|-------|--------|
| 1 | Basic HTML — Landing Page | Flexbox + Grid, Figma to Code | File HTML + CSS |
| 2 | JavaScript — CLI Todo App | Array, readline, file system | File JavaScript |
| 3 | REST API — Express CRUD Buku | Express, routing, in-memory | File route Express |
| 4 | Database — SQL Queries | SELECT, JOIN, GROUP BY, subquery | File SQL |
| 5 | Fullstack — Todo App | React + Express + SQLite | Link Pull Request |
| 6 | Auth — JWT & Role Based | Login/register, JWT, middleware | File auth module |
| 7 | AI Agent — Tools dengan Mastra | Tool cuaca, kalkulator, search | File Mastra tool |
| 8 | Deploy — Docker & Cloud | Dockerize, Railway/Vercel | Dockerfile + URL |
| 9 | Testing — Unit & Integration | Vitest, supertest | File test |
| 10 | Final — Fullstack AI App | Gabungan semua materi | Full Pull Request |

---

## 🎯 Tujuan Program

- Membangun kebiasaan coding mingguan yang konsisten
- Menguasai fullstack development: frontend, backend, database, deployment
- Memahami konsep AI agent dan integrasi tools
- Belajar testing dan best practices
- Mempersiapkan portofolio project nyata

---

## 📤 Cara Submit

1. **Fork** repository RPL AI Curriculum ke GitHub kamu
2. **Buat branch** baru: `challenge/week-XX-nama-kamu`
3. **Kerjakan** challenge di folder `challenges/`
4. **Commit** dan **push** ke branch kamu
5. **Buat Pull Request** ke repository utama
6. **Tulis deskripsi PR**: apa yang kamu buat, bagaimana cara menjalankannya, screenshot (jika ada)

Format nama file submission:
```
challenges/submissions/week-XX/nama-kamu/
```

---

## ⏰ Deadline

Setiap challenge dikumpulkan **maksimal 7 hari** setelah rilis. Telat = tidak mendapat review.

---

## 💡 Tips

- Baca acceptance criteria dulu sebelum mulai coding
- Kerjakan step-by-step, jangan loncat
- Bonus hanya jika semua acceptance criteria sudah terpenuhi
- Manfaatkan Google, dokumentasi, dan AI tools — ini _open book_
- Tanya di grup diskusi kalau stuck

---

## 🏅 Sertifikat

Peserta yang menyelesaikan **minimal 8 dari 10 challenge** berhak mendapatkan sertifikat kelulusan RPL AI Coding Challenge.

---

## 🚀 Challenge Detail Lengkap

### Week 1: Basic HTML — Landing Page Portfolio

**Tujuan:** Landing page portfolio pribadi pake HTML + CSS (Tailwind/vanilla).

**Acceptance Criteria:**
- ✅ Ada navbar (logo, menu navigasi)
- ✅ Ada hero section (foto, nama, tagline, CTA button)
- ✅ Ada about me section
- ✅ Ada skills section (hard skill + soft skill)
- ✅ Ada projects section (min 3 project card)
- ✅ Ada contact section (form atau link sosmed)
- ✅ Responsive (mobile-first)
- ✅ Semantic HTML5 tags

**Time Limit:** 4 jam

| Kriteria | Bobot | Skor (0-4) |
|----------|-------|------------|
| HTML Struktur + Semantik | 25% | |
| CSS Layout + Responsive | 25% | |
| Visual Design | 25% | |
| Kode Bersih + Comments | 15% | |
| Git + Submission | 10% | |

**Bonus:**
- ⭐ Dark/light mode toggle
- ⭐ Animasi scroll (AOS atau CSS)
- ⭐ Deploy ke Vercel

**Starter:**
```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Portfolio | Nama Kamu</title>
</head>
<body>
  <!-- Kerjakan di sini -->
</body>
</html>
```

---

### Week 2: JavaScript — CLI Todo App

**Tujuan:** Aplikasi todo di terminal dengan operasi CRUD.

**Acceptance Criteria:**
- ✅ Tambah todo: `node todo.js add "Belajar TypeScript"`
- ✅ Lihat todos: `node todo.js list`
- ✅ Tandai selesai: `node todo.js done 1`
- ✅ Hapus todo: `node todo.js delete 1`
- ✅ Data tersimpan di file JSON (persist)
- ✅ Error handling (todo gak ditemukan, input kosong)

**Time Limit:** 3 jam

| Kriteria | Bobot | Skor (0-4) |
|----------|-------|------------|
| CRUD Functionality | 30% | |
| File Persistence | 20% | |
| Error Handling | 20% | |
| Code Structure | 15% | |
| CLI UX | 15% | |

**Bonus:**
- ⭐ Filter todo (done/pending)
- ⭐ Priority tag (high/medium/low)
- ⭐ Warna output (pake chalk/picocolors)

**Starter:**
```typescript
import * as fs from "fs";

interface Todo {
  id: number;
  task: string;
  done: boolean;
}

const COMMAND = process.argv[2];
const ARG = process.argv[3];

function readTodos(): Todo[] {
  // Baca dari todos.json
}

function saveTodos(todos: Todo[]): void {
  // Simpan ke todos.json
}

// Main logic
switch (COMMAND) {
  case "add":
    // Tambah todo
    break;
  case "list":
    // Tampilkan todos
    break;
  case "done":
    // Tandai selesai
    break;
  case "delete":
    // Hapus todo
    break;
  default:
    console.log("Perintah tidak dikenal. Gunakan: add, list, done, delete");
}
```

---

### Week 3: REST API — Express CRUD Buku

**Tujuan:** REST API untuk manajemen buku dengan Express.

**Acceptance Criteria:**
- ✅ `GET /api/buku` — lihat semua buku
- ✅ `GET /api/buku/:id` — lihat detail buku
- ✅ `POST /api/buku` — tambah buku baru
- ✅ `PUT /api/buku/:id` — update buku
- ✅ `DELETE /api/buku/:id` — hapus buku
- ✅ Data disimpan di array in-memory dulu
- ✅ Input validation (judul wajib, tahun harus number)
- ✅ Error handling (404 kalau gak ketemu)

**Time Limit:** 4 jam

| Kriteria | Bobot | Skor (0-4) |
|----------|-------|------------|
| Semua Endpoint Jalan | 30% | |
| Input Validation | 20% | |
| Error Handling | 20% | |
| Struktur Kode | 15% | |
| RESTful Best Practices | 15% | |

**Bonus:**
- ⭐ Gunakan PostgreSQL (bukan in-memory)
- ⭐ Pagination (`?page=1&limit=10`)
- ⭐ Swagger/OpenAPI documentation

**Starter:**
```typescript
import express from "express";
const app = express();
app.use(express.json());

interface Buku {
  id: number;
  judul: string;
  pengarang: string;
  tahun: number;
  tersedia: boolean;
}

let bukuDB: Buku[] = [];
let currentId = 1;

// Routes
app.get("/api/buku", (req, res) => {
  // === KODE LO DISINI ===
});

app.get("/api/buku/:id", (req, res) => {
  // === KODE LO DISINI ===
});

app.post("/api/buku", (req, res) => {
  // === KODE LO DISINI ===
});

app.put("/api/buku/:id", (req, res) => {
  // === KODE LO DISINI ===
});

app.delete("/api/buku/:id", (req, res) => {
  // === KODE LO DISINI ===
});

app.listen(3000, () => console.log("Server jalan di :3000"));
```

---

### Week 4: Database — SQL Queries

**Tujuan:** Query SQL untuk database toko online.

**Schema:**
```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  price INTEGER NOT NULL,
  stock INTEGER DEFAULT 0,
  category_id INTEGER REFERENCES categories(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(200) NOT NULL,
  order_date TIMESTAMP DEFAULT NOW(),
  total INTEGER NOT NULL
);

CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price INTEGER NOT NULL
);
```

**Acceptance Criteria:**
- ✅ Insert sample data (min 5 categories, 20 products, 5 orders)
- ✅ `SELECT products with category name`
- ✅ `SELECT total revenue per category`
- ✅ `SELECT top 5 best-selling products`
- ✅ `SELECT orders with total > 500000`
- ✅ `SELECT monthly sales summary`
- ✅ Subquery: produk yang belum pernah dibeli
- ✅ `UPDATE stock setelah order`

**Time Limit:** 3 jam

| Kriteria | Bobot | Skor (0-4) |
|----------|-------|------------|
| Semua Query Berhasil | 40% | |
| Query Optimization | 20% | |
| Data Modeling | 20% | |
| Script Organization | 20% | |

**Bonus:**
- ⭐ Buat view untuk laporan bulanan
- ⭐ Index optimization
- ⭐ Stored procedure untuk restock

---

### Week 5: Fullstack — Todo App (React + Express + SQLite)

**Tujuan:** Aplikasi todo fullstack dengan frontend React dan backend Express.

**Acceptance Criteria:**
- ✅ Backend: CRUD API todos (Express + SQLite via better-sqlite3)
- ✅ Frontend: React app dengan komponen TodoList, TodoItem, AddTodo
- ✅ Fitur: tambah, lihat, edit, hapus, tandai selesai
- ✅ Frontend panggil API backend
- ✅ Styling pake Tailwind CSS

**Time Limit:** 8 jam

| Kriteria | Bobot | Skor (0-4) |
|----------|-------|------------|
| Backend API | 25% | |
| Frontend Components | 25% | |
| FE-BE Integration | 20% | |
| Styling + Responsive | 15% | |
| Code Organization | 15% | |

**Bonus:**
- ⭐ Filter (all/active/completed)
- ⭐ Drag and drop reorder
- ⭐ Deploy (FE: Vercel, BE: Railway)

**Starter Backend:**
```typescript
import express from "express";
import Database from "better-sqlite3";

const app = express();
const db = new Database("todos.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task TEXT NOT NULL,
    done BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

app.use(express.json());

// Routes
app.get("/api/todos", (req, res) => { /* ... */ });
app.post("/api/todos", (req, res) => { /* ... */ });
app.put("/api/todos/:id", (req, res) => { /* ... */ });
app.delete("/api/todos/:id", (req, res) => { /* ... */ });

app.listen(3001);
```

---

### Week 6: Auth — JWT & Role Based

**Tujuan:** Sistem autentikasi JWT dengan role-based access.

**Acceptance Criteria:**
- ✅ Register (username, email, password)
- ✅ Login (return JWT token)
- ✅ Middleware untuk verifikasi token
- ✅ Role: admin, user (bisa di middleware)
- ✅ Admin bisa akses `/api/admin/*`
- ✅ User biasa gak bisa akses admin endpoint
- ✅ Password di-hash (bcrypt)
- ✅ Error handling: invalid token, expired token, wrong password

**Time Limit:** 5 jam

| Kriteria | Bobot | Skor (0-4) |
|----------|-------|------------|
| Auth Flow (Register + Login) | 25% | |
| JWT Middleware | 20% | |
| Role-Based Access | 20% | |
| Security Best Practices | 20% | |
| Error Handling | 15% | |

**Bonus:**
- ⭐ Refresh token
- ⭐ Email verification
- ⭐ Rate limiting

**Starter:**
```typescript
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const app = express();
const SECRET = process.env.JWT_SECRET || "rahasia";

interface User {
  id: number;
  username: string;
  password: string; // hashed
  role: "admin" | "user";
}

// Middleware
function authenticate(req, res, next) { /* ... */ }
function authorize(...roles: string[]) {
  return (req, res, next) => { /* ... */ };
}

// Routes
app.post("/api/auth/register", async (req, res) => { /* ... */ });
app.post("/api/auth/login", async (req, res) => { /* ... */ });
app.get("/api/profile", authenticate, (req, res) => { /* ... */ });
app.get("/api/admin/users", authenticate, authorize("admin"), (req, res) => { /* ... */ });
```

---

### Week 7: AI Agent — Tools dengan Mastra

**Tujuan:** Agent AI dengan multiple tools.

**Acceptance Criteria:**
- ✅ Setup project Mastra
- ✅ Agent dengan instruction (persona)
- ✅ Tool kalkulator (operasi matematika)
- ✅ Tool cek cuaca (simulasi atau API nyata)
- ✅ Tool search informasi
- ✅ Agent pake tools sesuai konteks
- ✅ Streaming response

**Time Limit:** 6 jam

| Kriteria | Bobot | Skor (0-4) |
|----------|-------|------------|
| Agent Setup + Instructions | 20% | |
| Tool Implementation | 25% | |
| Tool Selection Logic | 20% | |
| Streaming | 15% | |
| Code Quality | 20% | |

**Bonus:**
- ⭐ Agent memory (ingat percakapan sebelumnya)
- ⭐ Structured output (JSON)
- ⭐ Deploy sebagai API endpoint

**Starter:**
```typescript
import { Agent, createTool } from "@mastra/core";
import { z } from "zod";

const weatherTool = createTool({
  name: "cekCuaca",
  description: "Cek cuaca kota",
  schema: z.object({ kota: z.string() }),
  executor: async ({ kota }) => {
    // Implementasi
  },
});

const agent = new Agent({
  name: "AsistenAI",
  instructions: "Kamu adalah asisten yang membantu dengan tool.",
  model: { provider: "OPEN_AI", name: "gpt-4o-mini" },
  tools: { cekCuaca: weatherTool },
});
```

---

### Week 8: Deploy — Docker & Cloud

**Tujuan:** Dockerize aplikasi dan deploy ke cloud.

**Acceptance Criteria:**
- ✅ Buat Dockerfile untuk backend (multi-stage)
- ✅ Buat docker-compose.yml (app + PostgreSQL)
- ✅ .dockerignore
- ✅ Healthcheck endpoint
- ✅ Deploy ke Railway / Fly.io
- ✅ Environment variables untuk konfigurasi

**Time Limit:** 5 jam

| Kriteria | Bobot | Skor (0-4) |
|----------|-------|------------|
| Dockerfile | 25% | |
| Docker Compose | 20% | |
| Deployment Success | 25% | |
| Config Mgmt (env) | 15% | |
| Best Practices | 15% | |

**Bonus:**
- ⭐ GitHub Actions CI: auto build & push Docker Hub
- ⭐ Custom domain + SSL
- ⭐ Monitoring (healthcheck + logging)

**Starter:**
```dockerfile
# Dockerfile
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
COPY package*.json ./
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

---

### Week 9: Testing — Unit & Integration

**Tujuan:** Testing aplikasi Express dengan Vitest dan Supertest.

**Acceptance Criteria:**
- ✅ Setup Vitest
- ✅ Unit test untuk fungsi helper
- ✅ Integration test untuk endpoints API
- ✅ Test CRUD: GET, POST, PUT, DELETE
- ✅ Test error cases (404, 400, 401)
- ✅ Test auth middleware
- ✅ Coverage report (min 70%)

**Time Limit:** 4 jam

| Kriteria | Bobot | Skor (0-4) |
|----------|-------|------------|
| Unit Tests | 25% | |
| Integration Tests | 30% | |
| Error Case Tests | 20% | |
| Test Organization | 15% | |
| Coverage | 10% | |

**Bonus:**
- ⭐ CI dengan GitHub Actions (auto test on push)
- ⭐ Mock external API
- ⭐ Snapshot testing

**Starter:**
```typescript
// app.test.ts
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "./app";

describe("GET /api/todos", () => {
  it("should return empty array initially", async () => {
    const res = await request(app).get("/api/todos");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("should create a new todo", async () => {
    const res = await request(app)
      .post("/api/todos")
      .send({ task: "Belajar testing" });
    expect(res.status).toBe(201);
    expect(res.body.task).toBe("Belajar testing");
  });

  it("should return 400 for empty task", async () => {
    const res = await request(app)
      .post("/api/todos")
      .send({ task: "" });
    expect(res.status).toBe(400);
  });
});
```

---

### Week 10: Final — Fullstack AI App

**Tujuan:** Gabungan semua materi — fullstack app dengan AI.

**Acceptance Criteria:**
- ✅ Frontend (React/Next.js + Tailwind)
- ✅ Backend (Express + PostgreSQL)
- ✅ AI Feature (Mastra Agent + tools + memory/RAG)
- ✅ Auth (JWT login/register)
- ✅ CRUD utama (todos / notes / products)
- ✅ Deploy (FE: Vercel / BE: Railway)
- ✅ Testing (min 70% coverage)
- ✅ Dokumentasi (README + API docs)
- ✅ Bonus features (min 1 dari daftar bonus)

**Time Limit:** 2 minggu

| Kriteria | Bobot | Skor (0-4) |
|----------|-------|------------|
| Functionality | 20% | |
| Frontend | 15% | |
| Backend + DB | 15% | |
| AI Feature | 20% | |
| Code Quality | 10% | |
| Deployment | 10% | |
| Documentation | 5% | |
| Presentation | 5% | |

**Bonus:**
- ⭐ AI summarize / AI generate content
- ⭐ Real-time notification (WebSocket)
- ⭐ Dark mode
- ⭐ File upload
- ⭐ Pagination + search
- ⭐ Admin dashboard
- ⭐ CI/CD pipeline

---

## 🏆 Challenge Tingkat Lanjut (Post-Wave)

Untuk siswa yang sudah menyelesaikan 10 challenge utama.

### Challenge 11: TypeScript — Library Design

**Fokus:** Bikin library npm kecil dengan TypeScript.
**Output:** Package di npm
**Kriteria:** Generic types, utility types, proper typing, testing

### Challenge 12: System Design — URL Shortener

**Fokus:** Desain + implementasi URL shortener.
**Output:** Diagram + API
**Kriteria:** Scalable, hashing, analytics, caching

### Challenge 13: AI Agent — Multi-Agent Workflow

**Fokus:** Orchestrator + specialist agents.
**Output:** Multi-agent Mastra app
**Kriteria:** >3 agents, workflow, memory, eval

### Challenge 14: Full-Stack — E-Commerce Mini

**Fokus:** Toko online sederhana.
**Output:** Fullstack deployed app
**Kriteria:** Products, cart, checkout, order history, admin panel

### Challenge 15: DevOps — Monitoring Stack

**Fokus:** Setup Grafana + Prometheus + Loki.
**Output:** Docker compose + dashboard
**Kriteria:** Metrics, logs, alerts, dashboard

---

## 🧮 Algorithm Challenges

Kumpulan soal algoritma untuk melatih logika dan problem-solving.

### Level 1: Basic (🟢 Easy)

#### A1. Two Sum
**Deskripsi:** Diberi array angka dan target, cari indeks dua angka yang jumlahnya = target.
**Time Limit:** 30 menit
**Struktur:**
```typescript
function twoSum(nums: number[], target: number): number[] {
  // implementasi
}
```
**Test Cases:**
```typescript
it("twoSum([2,7,11,15], 9) → [0,1]", () => {
  expect(twoSum([2,7,11,15], 9)).toEqual([0,1]);
});
it("twoSum([3,2,4], 6) → [1,2]", () => {
  expect(twoSum([3,2,4], 6)).toEqual([1,2]);
});
it("twoSum([3,3], 6) → [0,1]", () => {
  expect(twoSum([3,3], 6)).toEqual([0,1]);
});
```

#### A2. Palindrome Check
**Deskripsi:** Cek apakah sebuah string adalah palindrome (dibaca sama dari depan dan belakang).
**Time Limit:** 20 menit
```typescript
function isPalindrome(s: string): boolean { }
```
**Scoring:**
| Aspek | Bobot |
|-------|-------|
| Compile | 10% |
| Test cases pass | 50% |
| Edge cases | 20% |
| Time complexity O(n) | 20% |

#### A3. FizzBuzz
**Deskripsi:** Cetak angka 1-n. Kelipatan 3 → "Fizz", 5 → "Buzz", 3&5 → "FizzBuzz".
**Time Limit:** 15 menit

#### A4. Anagram Check
**Deskripsi:** Cek apakah dua string adalah anagram.
**Time Limit:** 20 menit

#### A5. Missing Number
**Deskripsi:** Array berisi angka 0-n dengan satu angka hilang. Cari angka yang hilang.
**Time Limit:** 25 menit

### Level 2: Intermediate (🟡 Medium)

#### A6. Valid Parentheses
**Deskripsi:** Cek apakah string kurung `()`, `{}`, `[]` valid (setiap buka ditutup dengan urutan benar).
**Time Limit:** 30 menit
**Scoring:**
| Aspek | Bobot |
|-------|-------|
| Compile | 10% |
| All test cases pass | 50% |
| Stack implementation | 20% |
| Edge cases | 20% |

#### A7. Reverse Linked List
**Deskripsi:** Reverse singly linked list.
**Time Limit:** 35 menit

#### A8. Binary Search
**Deskripsi:** Implementasi binary search di sorted array.
**Time Limit:** 25 menit
```typescript
function binarySearch(nums: number[], target: number): number { }
```
**Test Cases:**
```typescript
it("binarySearch([1,3,5,7,9], 5) → 2", () => {
  expect(binarySearch([1,3,5,7,9], 5)).toBe(2);
});
it("binarySearch([1,3,5,7,9], 4) → -1", () => {
  expect(binarySearch([1,3,5,7,9], 4)).toBe(-1);
});
it("binarySearch([], 5) → -1", () => {
  expect(binarySearch([], 5)).toBe(-1);
});
```

#### A9. Merge Sort
**Deskripsi:** Implementasi merge sort.
**Time Limit:** 45 menit

#### A10. First Non-Repeating Character
**Deskripsi:** Cari karakter pertama yang tidak berulang di string.
**Time Limit:** 25 menit

### Level 3: Advanced (🟠 Hard)

#### A11. Longest Substring Without Repeating Characters
**Deskripsi:** Cari panjang substring terpanjang tanpa karakter berulang.
**Time Limit:** 40 menit

#### A12. Group Anagrams
**Deskripsi:** Kelompokkan array string berdasarkan anagram.
**Time Limit:** 35 menit

#### A13. Coin Change
**Deskripsi:** Cari jumlah minimum koin yang dibutuhkan untuk mencapai target amount.
**Time Limit:** 45 menit
**DP Problem — Dynamic Programming**

#### A14. LRU Cache
**Deskripsi:** Implementasi Least Recently Used (LRU) cache.
**Time Limit:** 50 menit

#### A15. Top K Frequent Elements
**Deskripsi:** Cari K elemen yang paling sering muncul di array.
**Time Limit:** 30 menit

#### A16. Maximum Subarray (Kadane's Algorithm)
**Deskripsi:** Cari subarray dengan sum terbesar.
**Time Limit:** 30 menit
```typescript
function maxSubArray(nums: number[]): number { }
```

### Level 4: Expert (🔴 Expert)

#### A17. Word Ladder
**Deskripsi:** Transformasi kata mulai dari beginWord ke endWord, setiap langkah hanya berubah 1 huruf.
**Time Limit:** 60 menit

#### A18. Serialize and Deserialize Binary Tree
**Deskripsi:** Encode/decode binary tree ke string dan sebaliknya.
**Time Limit:** 60 menit

#### A19. Median of Two Sorted Arrays
**Deskripsi:** Cari median dari dua sorted array dengan O(log(m+n)).
**Time Limit:** 60 menit

#### A20. Trapping Rain Water
**Deskripsi:** Hitung total air yang bisa ditampung di antara elevation bars.
**Time Limit:** 50 menit

---

## 🏗️ System Design Challenges

Soal system design untuk melatih pemikiran arsitektur.

### SD1: Design URL Shortener (bit.ly/tinyurl)
**Level:** 🟡 Medium
**Time Limit:** 90 menit
**Yang Harus Dicakup:**
- Functional + non-functional requirements
- API design (REST)
- Database schema
- Hashing strategy (Base62, hash collision)
- Caching (Redis)
- Analytics tracking
- Scalability estimation

**Output:**
1. Diagram arsitektur (Mermaid atau Excalidraw)
2. API spec (3 endpoints)
3. Database schema
4. Penjelasan trade-off

**Checklist:**
- [ ] Requirements jelas
- [ ] Estimasi traffic + storage
- [ ] Diagram arsitektur
- [ ] Schema database
- [ ] API endpoints
- [ ] Caching strategy
- [ ] Scalability plan

### SD2: Design Chat Application (WhatsApp/Telegram)
**Level:** 🟠 Hard
**Time Limit:** 120 menit
**Yang Harus Dicakup:**
- Real-time messaging (WebSocket)
- Message storage + history
- Online/offline status
- Group chat
- Media sharing
- End-to-end encryption overview

### SD3: Design E-Commerce Platform (Tokopedia)
**Level:** 🟠 Hard
**Time Limit:** 120 menit
**Yang Harus Dicakup:**
- Product catalog + search
- Cart + checkout flow
- Payment integration
- Inventory management
- Order tracking
- Recommendation system

### SD4: Design Video Streaming (YouTube)
**Level:** 🔴 Expert
**Time Limit:** 150 menit
**Yang Harus Dicakup:**
- Video upload pipeline (transcoding)
- CDN + content delivery
- Watch history + recommendations
- Comments + likes system
- Live streaming
- Storage estimation

### SD5: Design Social Media Feed (Twitter/Instagram)
**Level:** 🟠 Hard
**Time Limit:** 120 menit
**Yang Harus Dicakup:**
- Feed generation (push/pull)
- Timeline service
- Follow/follower relationship
- Like, comment, share
- Trending topics
- Notification service

### SD6: Design Rate Limiter
**Level:** 🟡 Medium
**Time Limit:** 60 menit
**Yang Harus Dicakup:**
- Token bucket vs sliding window
- Distributed rate limiting
- Redis + Lua scripting
- Different rate per user/IP/endpoint

**Scoring Rubric System Design:**

| Kriteria | Bobot | 0 | 1 | 2 | 3 | 4 |
|----------|-------|---|---|---|---|---|
| Requirements | 15% | Tidak ada | Sebagian | Lengkap | Prioritized | + Trade-offs |
| Diagram | 20% | Tidak ada | Asal | Jelas | Rapi + tools | + Annotation |
| Database Schema | 20% | Tidak ada | Minimal | Normalized | + Index/partition | + Sharding strategy |
| Scalability | 20% | Tidak dibahas | Vertical scale | Horizontal + cache | + Microservices | + Geo-distribution |
| API Design | 15% | Tidak ada | 1-2 endpoint | RESTful lengkap | + Pagination/version | + Error codes + docs |
| Presentation | 10% | Tidak siap | Baca slide | Jelas | + Diagram live | + Q&A bagus |

---

## 🤖 AI Agent Challenges

### AI1: Customer Support Agent
**Level:** 🟡 Medium
**Time Limit:** 4 jam
**Deskripsi:** Bangun agent AI untuk customer support toko online.
**Agent Tools:**
- `searchProduct(productName)` — cari produk di database
- `checkStock(productId)` — cek stok
- `createReturn(orderId, reason)` — buat pengembalian
- `trackShipment(orderId)` — lacak pengiriman

**Acceptance Criteria:**
- ✅ Agent bisa menjawab pertanyaan produk
- ✅ Agent bisa cek stok
- ✅ Agent bisa bikin return request
- ✅ Agent bisa lacak kiriman
- ✅ Agent tahu kapan harus transfer ke human agent

### AI2: Research Assistant with RAG
**Level:** 🟠 Hard
**Time Limit:** 6 jam
**Deskripsi:** Agent yang bisa menjawab pertanyaan berdasarkan dokumen PDF.
**Stack:** Mastra + Vector DB (pgvector/Qdrant) + PDF parser
**Fitur:**
- ✅ Upload PDF → chunking → embedding → store
- ✅ Query → retrieve relevant chunks → generate answer
- ✅ Source citation (jawaban disertai sumber)
- ✅ Follow-up questions (conversation memory)

### AI3: Multi-Agent Code Reviewer
**Level:** 🔴 Expert
**Time Limit:** 8 jam
**Deskripsi:** Multi-agent system yang me-review PR GitHub.
**Agents:**
1. **Reviewer Agent** — baca kode, cari bug, sugerensi
2. **Linter Agent** — cek style, formatting, best practices
3. **Security Agent** — cek vulnerability (SQL injection, XSS)
4. **Summary Agent** — buat ringkasan review

**Acceptance Criteria:**
- ✅ Orchestrator coordinating 3+ agents
- ✅ Each agent punya specific role + tools
- ✅ Workflow: sequential + parallel steps
- ✅ Output: structured JSON report
- ✅ Auto-comment di PR GitHub

**Scoring Rubric AI Agent:**

| Kriteria | Bobot | 0 | 1 | 2 | 3 | 4 |
|----------|-------|---|---|---|---|---|
| Agent Setup | 15% | Tidak jalan | Basic agent | Tools + instructions | + Error handling | + Memory/RAG |
| Tool Quality | 20% | Tidak ada | 1 tool | 2-3 tools | Tools bermanfaat | + Fallback |
| Instructions | 15% | Copas | Dasar | Few-shot | + Dynamic context | + Guardrails |
| Orchestration | 20% | N/A | 1 agent | Orchestrator | + Parallel steps | + Conditional logic |
| Output Quality | 15% | Error | Sebagian benar | Akurat | + Source citation | + Structured |
| Code Quality | 15% | Berantakan | Struktur minimal | Rapi | + Tests | + Documentation |

---

## 🦾 TypeScript Coding Challenges

Challenge untuk mastery TypeScript.

### TS1: Generic Repository Pattern
**Level:** 🟡 Medium
**Time Limit:** 2 jam
**Deskripsi:** Implementasi generic repository untuk CRUD database.
```typescript
interface Repository<T> {
  findById(id: number): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: number, data: Partial<T>): Promise<T>;
  delete(id: number): Promise<boolean>;
}

class UserRepository implements Repository<User> {
  // implementasi
}
```
**Test Cases:**
- ✅ Generic constraint dengan `id` field
- ✅ Partial update type safety
- ✅ Proper async/await error handling
- ✅ Return type strict

### TS2: Utility Types Builder
**Level:** 🟡 Medium
**Time Limit:** 1.5 jam
**Deskripsi:** Buat utility type sendiri.
```typescript
// Bikin utility types ini:
type DeepReadonly<T> = { ... }
type DeepPartial<T> = { ... }
type PickByType<T, V> = { ... }
type NonFunctionKeys<T> = { ... }
```
**Scoring:**
| Aspek | Bobot |
|-------|-------|
| Correctness | 40% |
| Recursive handling | 30% |
| Edge cases | 30% |

### TS3: Type-Safe Event Emitter
**Level:** 🟡 Medium
**Time Limit:** 2 jam
**Deskripsi:** Event emitter dengan type-safe event names + payload.
```typescript
type Events = {
  userLogin: { userId: number; timestamp: Date };
  pageView: { page: string; duration: number };
  error: { message: string; code: number };
};

class TypedEmitter<T extends Record<string, any>> {
  on<K extends keyof T>(event: K, cb: (data: T[K]) => void): void { }
  emit<K extends keyof T>(event: K, data: T[K]): void { }
}
```

### TS4: Discriminated Union Pattern
**Level:** 🟢 Easy
**Time Limit:** 1 jam
**Deskripsi:** Implementasi discriminated union untuk state management.
```typescript
type ApiState<T> = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };

function handleState(state: ApiState<User[]>) {
  switch (state.status) {
    case 'loading': return 'Memuat...';
    case 'success': return `${state.data.length} user ditemukan`;
    case 'error': return `Error: ${state.message}`;
    case 'idle': return 'Belum dimulai';
  }
}
```

### TS5: Mapped Type Validator
**Level:** 🟠 Hard
**Time Limit:** 2.5 jam
**Deskripsi:** Type-safe validator menggunakan mapped types.
```typescript
type ValidationRules<T> = {
  [K in keyof T]: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: T[K]) => boolean;
  };
};

function validate<T extends Record<string, any>>(
  data: T,
  rules: ValidationRules<T>
): Record<keyof T, string[]> { }
```

### TS6: Conditional Type Router
**Level:** 🟠 Hard
**Time Limit:** 2 jam
**Deskripsi:** Type-safe router dengan conditional types.
```typescript
type RouteMap = {
  '/users': { method: 'GET'; response: User[] } | { method: 'POST'; body: CreateUserDto };
  '/users/:id': { method: 'GET'; response: User };
  '/auth/login': { method: 'POST'; body: LoginDto; response: TokenResponse };
};

type ExtractResponse<R extends RouteMap, P extends keyof R, M extends string> = 
  // Extract response type based on path + method
```

---

## 📊 Difficulty Ratings

| Level | Warna | Jam | Contoh Challenge | Target Audience |
|-------|-------|-----|-----------------|-----------------|
| 🟢 Easy | Green | 2-4 jam | HTML Landing Page, FizzBuzz, Palindrome | Week 1-3 |
| 🟡 Medium | Yellow | 4-8 jam | Express API, SQL Queries, Valid Parentheses | Week 4-7 |
| 🟠 Hard | Orange | 8-16 jam | Fullstack Todo, Multi-Agent, System Design | Week 8-10, Post-Wave |
| 🔴 Expert | Red | 16-32 jam | Multi-Agent Workflow, DevOps Stack, Trapping Rain Water | Post-Wave |

### Time Limit Policy

- **Easy:** ±30% buffer dari estimasi
- **Medium:** ±20% buffer
- **Hard:** ±10% buffer (lebih ketat)
- **Expert:** Tepat waktu, tidak ada buffer
- **Ekstensi:** Maksimal 1x ekstensi per challenge (24 jam). Ajukan minimal 1 jam sebelum deadline.

---

## 📝 Scoring Rubrics

### Standard Scoring Scale

| Skor | Label | Deskripsi |
|------|-------|-----------|
| 0 | Tidak | Tidak dikerjakan / tidak ada |
| 1 | Kurang | Dikerjakan tapi banyak error |
| 2 | Cukup | Memenuhi standar minimal |
| 3 | Baik | Semua criteria + rapi |
| 4 | Sangat Baik | Excellence + extra |

### Per-Category Weight

| Category | Bobot |
|----------|-------|
| Functionality (AC terpenuhi) | 30% |
| Code Quality | 20% |
| Error Handling | 15% |
| Documentation | 10% |
| Git Workflow | 10% |
| AI Ethics | 10% |
| Bonus Features | 5% |

### Scoring Formula

```
Nilai = (F × 0.30) + (C × 0.20) + (E × 0.15) + (D × 0.10) + (G × 0.10) + (A × 0.10) + (B × 0.05)
```

Di mana F=Functionality, C=Code Quality, E=Error Handling, D=Documentation, G=Git, A=AI Ethics, B=Bonus.

### Example Score Calculation

| Aspek | Skor (0-100) | Bobot | Hasil |
|-------|-------------|-------|-------|
| Functionality | 90 | 30% | 27.0 |
| Code Quality | 80 | 20% | 16.0 |
| Error Handling | 75 | 15% | 11.25 |
| Documentation | 85 | 10% | 8.5 |
| Git Workflow | 70 | 10% | 7.0 |
| AI Ethics | 80 | 10% | 8.0 |
| Bonus | 100 | 5% | 5.0 |
| **Total** | | **100%** | **82.75** |

---

## 🧪 Automated Test Harness

Setiap challenge memiliki test file untuk auto-grading.

```typescript
// challenge-1.test.ts
import { describe, it, expect } from "vitest";

// Auto-grade: Week 1 - HTML Landing Page
// Check file existence + content
import fs from "fs";
import path from "path";

describe("Week 1 - HTML Landing Page", () => {
  it("index.html exists", () => {
    expect(fs.existsSync("index.html")).toBe(true);
  });

  it("has semantic HTML5 tags", () => {
    const html = fs.readFileSync("index.html", "utf-8");
    expect(html).toMatch(/<header>/);
    expect(html).toMatch(/<section>/);
    expect(html).toMatch(/<nav>/);
    expect(html).toMatch(/<footer>/);
  });

  it("has viewport meta", () => {
    const html = fs.readFileSync("index.html", "utf-8");
    expect(html).toMatch(/<meta name="viewport"/);
  });

  it("has CSS file link", () => {
    const html = fs.readFileSync("index.html", "utf-8");
    expect(html).toMatch(/<link[^>]+\.css/);
  });
});
```

### Auto-Grade Script

```bash
#!/bin/bash
# auto-grade.sh — jalankan dari root curriculum
WEEK=$1
STUDENT=$2

echo "🟡 Meng-grade challenge week $WEEK untuk $STUDENT..."

STUDENT_DIR="challenges/submissions/week-$WEEK/$STUDENT"
if [ ! -d "$STUDENT_DIR" ]; then
  echo "❌ Submission tidak ditemukan"
  exit 1
fi

cd "$STUDENT_DIR"

# Auto-grade berdasarkan tipe challenge
case $WEEK in
  1|4|8)
    echo "📄 Check file existence..."
    npx vitest run --silent 2>&1
    ;;
  2|3|5|6|7|9|10)
    echo "🔍 TypeScript check..."
    npx tsc --noEmit 2>&1
    if [ $? -ne 0 ]; then echo "❌ TS error"; exit 1; fi
    echo "🧪 Running tests..."
    npx vitest run --coverage 2>&1
    ;;
esac

echo "✅ Grade selesai"
```

---

## 🔍 Solutions Approach

1. **Understand the problem first** — baca acceptance criteria sampai paham
2. **Break it down** — bagi jadi sub-task kecil
3. **Build incrementally** — satu fitur selesai dulu, baru lanjut
4. **Test as you go** — jangan nunggu selesai semua baru test
5. **Refactor** — setelah semua jalan, baru rapikan kode
6. **Document** — tulis README, comment kalo perlu

**Checklist Submission:**
- [ ] Semua acceptance criteria terpenuhi
- [ ] Kode bisa dijalankan (error-free)
- [ ] Bonus feature (jika ada)
- [ ] README + screenshot
- [ ] Branch name sesuai format
- [ ] PR description jelas

---

---

## 📝 Test Case Templates for Auto-Grading

### Week 2 — CLI Todo App Test
```typescript
// todo.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";

const TODO_FILE = path.join(__dirname, "todos.json");

describe("Todo App", () => {
  beforeEach(() => {
    // Clean slate before each test
    if (fs.existsSync(TODO_FILE)) fs.unlinkSync(TODO_FILE);
  });

  afterEach(() => {
    if (fs.existsSync(TODO_FILE)) fs.unlinkSync(TODO_FILE);
  });

  it("should add a todo", () => {
    // Simulate: node todo.js add "Belajar TS"
    const { addTodo } = require("./todo");
    const todo = addTodo("Belajar TS");
    expect(todo.task).toBe("Belajar TS");
    expect(todo.done).toBe(false);
    expect(todo.id).toBe(1);
  });

  it("should list todos", () => {
    const { addTodo, listTodos } = require("./todo");
    addTodo("Task 1");
    addTodo("Task 2");
    const todos = listTodos();
    expect(todos).toHaveLength(2);
  });

  it("should mark todo as done", () => {
    const { addTodo, markDone } = require("./todo");
    addTodo("Test");
    const done = markDone(1);
    expect(done).toBe(true);
  });

  it("should return error for non-existent todo", () => {
    const { markDone } = require("./todo");
    expect(() => markDone(999)).toThrow("Todo not found");
  });
});
```

### Week 5 — Fullstack Todo API Test
```typescript
// api.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "./app";

describe("Todo API", () => {
  it("GET /api/todos returns empty array initially", async () => {
    const res = await request(app).get("/api/todos");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("POST /api/todos creates todo", async () => {
    const res = await request(app)
      .post("/api/todos")
      .send({ task: "Belajar testing" });
    expect(res.status).toBe(201);
    expect(res.body.task).toBe("Belajar testing");
    expect(res.body.id).toBeDefined();
  });

  it("POST /api/todos with empty task returns 400", async () => {
    const res = await request(app).post("/api/todos").send({ task: "" });
    expect(res.status).toBe(400);
  });

  it("PUT /api/todos/:id updates todo", async () => {
    const created = await request(app)
      .post("/api/todos")
      .send({ task: "Old task" });
    const res = await request(app)
      .put(`/api/todos/${created.body.id}`)
      .send({ done: true });
    expect(res.status).toBe(200);
    expect(res.body.done).toBe(true);
  });

  it("DELETE /api/todos/:id deletes todo", async () => {
    const created = await request(app)
      .post("/api/todos")
      .send({ task: "Delete me" });
    const res = await request(app).delete(`/api/todos/${created.body.id}`);
    expect(res.status).toBe(200);
  });

  it("DELETE /api/todos/:id with wrong id returns 404", async () => {
    const res = await request(app).delete("/api/todos/999");
    expect(res.status).toBe(404);
  });
});
```

### Week 6 — Auth JWT Test
```typescript
// auth.test.ts
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "./app";

describe("Auth API", () => {
  it("POST /api/auth/register creates user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ username: "budi", email: "budi@test.com", password: "rahasia123" });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
  });

  it("POST /api/auth/login returns token", async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ username: "budi", email: "budi@test.com", password: "rahasia123" });
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "budi@test.com", password: "rahasia123" });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("GET /api/admin/users returns 403 for non-admin", async () => {
    const reg = await request(app)
      .post("/api/auth/register")
      .send({ username: "user", email: "user@test.com", password: "pass123", role: "user" });
    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${reg.body.token}`);
    expect(res.status).toBe(403);
  });
});
```

### Week 7 — Mastra AI Agent Test
```typescript
// agent.test.ts
import { describe, it, expect } from "vitest";
import { agent } from "./agent";

describe("Mastra AI Agent", () => {
  it("agent should respond to messages", async () => {
    const response = await agent.generate("Halo, siapa kamu?");
    expect(response.text).toBeDefined();
    expect(response.text.length).toBeGreaterThan(0);
  });

  it("agent should use calculator tool for math", async () => {
    const response = await agent.generate("Berapa 25 + 37?");
    expect(response.text).toContain("62");
  });

  it("agent should use weather tool", async () => {
    const response = await agent.generate("Cuaca di Jakarta hari ini?");
    expect(response.text).toBeDefined();
  });

  it("agent should handle streaming", async () => {
    const stream = agent.stream("Ceritakan tentang AI");
    const chunks: string[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    expect(chunks.length).toBeGreaterThan(0);
  });
});
```

---

## 📈 Challenge Progress Tracker

Template untuk tracking progress siswa per challenge:

```markdown
# Challenge Progress — [Nama Siswa]

| Week | Challenge | Status | Nilai | Waktu | Catatan |
|------|-----------|--------|-------|-------|---------|
| 1 | HTML Landing Page | ✅ Selesai | 85 | 3.5 jam | Responsive bagus |
| 2 | CLI Todo App | ✅ Selesai | 78 | 2.5 jam | Bonus warna |
| 3 | Express CRUD Buku | 🔄 Review | - | - | Error handling kurang |
| 4 | SQL Queries | ⏳ Belum | - | - | - |
| 5 | Fullstack Todo | ⏳ Belum | - | - | - |
| 6 | Auth JWT | ⏳ Belum | - | - | - |
| 7 | AI Agent Mastra | ⏳ Belum | - | - | - |
| 8 | Docker & Cloud | ⏳ Belum | - | - | - |
| 9 | Testing | ⏳ Belum | - | - | - |
| 10 | Final Project | ⏳ Belum | - | - | - |

**Total Selesai:** 2/10
**Rata-rata Nilai:** 81.5
**Target Sertifikat:** ✅ On track (butuh min 8/10)
```

---

## 🧠 Challenge Difficulty Matrix

| Challenge | Difficulty | Time | Skills Tested | Prerequisites |
|-----------|-----------|------|---------------|---------------|
| W1: HTML Landing Page | 🟢 Easy | 4h | HTML5, CSS3, Flex/Grid, Git | None |
| W2: CLI Todo App | 🟢 Easy | 3h | JS arrays, fs, CLI | W1 |
| W3: Express CRUD | 🟡 Medium | 4h | Express, routing, validation | W2 |
| W4: SQL Queries | 🟡 Medium | 3h | SELECT, JOIN, GROUP BY, subquery | None |
| W5: Fullstack Todo | 🟠 Hard | 8h | React, Express, SQLite, Tailwind | W2, W3 |
| W6: Auth JWT | 🟡 Medium | 5h | JWT, bcrypt, middleware | W3 |
| W7: AI Agent | 🟠 Hard | 6h | Mastra AI, tools, agents | W3, W6 |
| W8: Docker Deploy | 🟡 Medium | 5h | Docker, compose, cloud | W3, W4 |
| W9: Testing | 🟡 Medium | 4h | Vitest, supertest, TDD | W3, W6 |
| W10: Final Project | 🔴 Expert | 2w | All skills | W1-W9 |

### System Design Challenges

| Challenge | Focus | Time | Skills Tested |
|-----------|-------|------|---------------|
| SD1: URL Shortener | read-heavy, hash | 4h | Caching, DB sharding, REST |
| SD2: Chat System | real-time, scale | 5h | WebSocket, pub/sub, state |
| SD3: E-commerce | consistency vs perf | 5h | Product catalog, cart, payment |
| SD4: Social Feed | write-heavy, timeline | 6h | News feed, fan-out, ranking |
| SD5: Rate Limiter | distributed, token bucket | 3h | Redis, sliding window |

### Tips Menyelesaikan Challenge

1. **Baca dulu** — pahami problem sepenuhnya sebelum nulis kode
2. **Buat test dulu** — define expected behavior, lalu implement
3. **Commit per step** — jangan nulis 100 baris baru commit
4. **Cari feedback** — PR ke pair/teman, minta code review
5. **Jangan overthink** — simple solution > perfect architecture
6. **Timebox** — kalau mentok 30 menit, minta hint

### Scoring Rubric

| Kriteria | Poin | Deskripsi |
|----------|------|-----------|
| Functional | 40 | Semua fitur jalan sesuai spec |
| Code Quality | 25 | Bersih, DRY, consistent naming |
| Error Handling | 10 | Validasi, edge cases, try-catch |
| Testing | 15 | Unit test + coverage > 80% |
| Documentation | 10 | README, JSDoc, komentar 'why' |

---

### Challenge Completion Badges

| Badge | Requirement |
|-------|-------------|
| 🥉 Bronze | Selesaikan 3 challenge pertama |
| 🥈 Silver | Selesaikan 6 challenge |
| 🥇 Gold | Selesaikan semua 10 challenge |
| 💎 Diamond | Selesaikan semua + bonus di setiap challenge |
| 🤖 AI Master | Selesaikan W7 + W10 dengan AI fitur maksimal |
| 🐳 DevOps | Selesaikan W8 + docker-compose production-ready |

---

Selamat coding! 🚀

## 🎯 Challenge Solutions Approach

### W1: HTML Landing Page
- Gunakan semantic HTML (header, main, section, footer)
- Flexbox untuk nav, Grid untuk card grid
- CSS custom properties untuk warna tema
- Responsive: mobile-first, 3 breakpoint (mobile, tablet, desktop)
- Commit per section, deploy ke CF Pages

### W3: Express CRUD
- Struktur: routes/ → controllers/ → services/
- Validasi input pake Zod + middleware
- Error handler centralized (app.use(errorHandler))
- Pagination: ?page=1&limit=10
- Test: supertest + vitest

### W7: AI Agent (Mastra)
1. Definisikan tool dulu (search, calculate, summarize)
2. Buat agent dengan tools + instructions
3. Test agent dengan berbagai input edge case
4. Evaluasi output dengan metrics (relevansi, accuracy)
5. Tambah memory (working + archival) untuk context
6. Deploy agent ke cloud (Railway / CF Workers)

### W10: Final Project
- Sprint 1 (3 hari): setup + fitur core (CRUD)
- Sprint 2 (3 hari): auth + validasi + error handling
- Sprint 3 (3 hari): testing + deployment + docs
- Sprint 4 (hari bebas): polish + prezentasi

### Submission Format
```markdown
## Challenge: [Nama]
## Tech Stack: [tools]
## Deployment: [URL]
## Repo: [GitHub URL]
## Screenshots: [link]
## Time Spent: [jam]
## Reflection: [apa yg dipelajari, kesulitan]
```


## 📚 Resources per Challenge

| Challenge | Docs | Tools |
|-----------|------|-------|
| W1: Landing Page | MDN HTML/CSS, web.dev/learn | CodePen, Figma, Chrome DevTools |
| W2: Todo CLI | Node.js fs docs, commander.js | Node.js, npx, npm scripts |
| W3: Express CRUD | Express.js guide, Prisma docs | Thunder Client, Prisma Studio |
| W4: SQL | PostgreSQL docs, pg exercises | pgAdmin, DBeaver, SQLite |
| W5: Fullstack | Next.js docs, Tailwind docs | Vercel, Railway, PlanetScale |
| W6: JWT Auth | JWT.io, bcrypt docs | Postman, jose library |
| W7: AI Agent | Mastra docs, Open AI API | Mastra CLI, LangSmith |
| W8: Docker Deploy | Docker docs, Railway guides | Docker Desktop, Docker Hub |
| W9: Testing | Vitest docs, Testing Library | Vitest UI, c8 coverage |

## 🏆 Completion Badges

| Challenge | Bronze | Silver | Gold |
|-----------|--------|--------|------|
| W1 | 3 sections, responsive | +CSS animations | +Dark mode, a11y score 95+ |
| W2 | CRUD + persist to file | +sort/filter/search | +test suite, error handling |
| W3 | Basic CRUD | +validation, pagination | +auth, rate limiting, docs |
| W4 | 3 tables SELECT | +JOIN, subquery | +index optimization, EXPLAIN |
| W5 | CRUD FE+BE | +auth, pagination | +deploy, CI/CD, test |
| W6 | Register + login | +refresh token, roles | +OAuth2, 2FA |
| W7 | Simple agent | +tools, RAG | +memory, multi-agent, deploy |
| W8 | Dockerfile + compose | +multi-stage, .env | +CI/CD, Docker Hub auto |
| W9 | 5 unit tests | +integration, mock | +E2E, coverage 90%+ |
| W10 | MVP deployed | +full test, CI/CD | +monitoring, analytics |

### Leaderboard Points
- Bronze = 10 pts, Silver = 25 pts, Gold = 50 pts
- Submit video demo (max 3 menit) = bonus 5 pts
- Code review 3 peer PR = bonus 10 pts
- 500+ pts = RPL Certification + LinkedIn recommendation

