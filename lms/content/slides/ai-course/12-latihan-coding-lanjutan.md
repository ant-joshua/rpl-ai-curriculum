---
title: "Latihan Modul 12: Prompt Challenge Coding Lanjutan"
exercise_type: practice
---

# 🎯 Latihan Modul 12: Prompt Challenge Coding Lanjutan

Latihan untuk developer yang sudah paham coding dasar dan ingin naik level: desain database, build API lengkap, testing, hingga full-stack mini project.

> **Waktu total: ±120 menit** | **Total latihan: 6 aktivitas**
> **Catatan:** Butuh pemahaman dasar HTML/CSS/JS, dan minimal 1 bahasa backend (Node.js/Python/PHP). Gunakan VS Code atau IDE favorit.

---

## 🗄️ Latihan 1: Desain Database Schema dari Requirements
**⭐⭐ Kesulitan: Sedang** | **⏱️ Waktu: 15 menit**

### Tujuan
Belajar mentranslasikan kebutuhan bisnis menjadi struktur database yang efisien.

### Prompt Desain Database
```
Saya ingin membangun sistem manajemen perpustakaan sekolah.
Berikut kebutuhannya:

FITUR:
1. Katalog buku (judul, pengarang, penerbit, tahun, isbn, stok)
2. Data anggota (nama, nis, kelas, alamat, no telp)
3. Peminjaman (siapa pinjam buku apa, kapan, kapan harus kembali)
4. Pengembalian (kapan dikembalikan, denda keterlambatan)
5. User admin (username, password, role)
6. Laporan peminjaman bulanan

Tolong desain database schema dengan:
1. ERD (Entity Relationship Diagram) dalam format text/ASCII
2. Tabel-tabel lengkap dengan kolom dan tipe data
3. Primary key dan foreign key
4. Constraint yang diperlukan (NOT NULL, UNIQUE, dll)
5. Index untuk optimasi query
6. Sample data 3-5 baris per tabel
7. Query SQL untuk membuat semua tabel (CREATE TABLE)

Gunakan MySQL/MariaDB syntax.
```

### Contoh Hasil Schema
```
ERD - Sistem Perpustakaan Sekolah
═══════════════════════════════════

┌──────────────┐     ┌──────────────────┐
│   tb_admin   │     │   tb_anggota     │
├──────────────┤     ├──────────────────┤
│ PK id        │     │ PK id            │
│    username  │     │    nis           │
│    password  │     │    nama          │
│    role      │     │    kelas         │
│    created_at│     │    alamat        │
└──────┬───────┘     │    no_telp       │
       │             │    created_at    │
       │             └────────┬─────────┘
       │                      │
       │             ┌────────┴─────────┐
       │             │ tb_peminjaman     │
       │             ├──────────────────┤
       │             │ PK id            │
       ├──           │ FK id_anggota    │
       │  ┌──────────┤ FK id_buku       │
       │  │          │    tanggal_pinjam│
       │  │          │    deadline      │
       │  │          │    status        │
       │  │          └──────────────────┘
       │  │
┌──────┴──┴───┐     ┌──────────────────┐
│ tb_buku     │     │ tb_pengembalian  │
├─────────────┤     ├──────────────────┤
│ PK id       │     │ PK id            │
│   isbn      │     │ FK id_peminjaman │
│   judul     │     │    tanggalembali │
│   pengarang │     │    denda         │
│   penerbit  │     │    admin_id      │
│   tahun     │     └──────────────────┘
│   stok      │
│   created_at│
└─────────────┘

TABEL: tb_buku
──────────────────────────────────────────
| Kolom      | Tipe         | Constraint  |
|------------|--------------|-------------|
| id         | INT          | PK, AI      |
| isbn       | VARCHAR(13)  | UNIQUE      |
| judul      | VARCHAR(255) | NOT NULL    |
| pengarang  | VARCHAR(100) | NOT NULL    |
| penerbit   | VARCHAR(100) | NOT NULL    |
| tahun      | YEAR         | NOT NULL    |
| stok       | INT          | DEFAULT 1   |
| created_at | TIMESTAMP    | DEFAULT NOW |

SQL:
CREATE TABLE tb_buku (
    id INT AUTO_INCREMENT PRIMARY KEY,
    isbn VARCHAR(13) UNIQUE NOT NULL,
    judul VARCHAR(255) NOT NULL,
    pengarang VARCHAR(100) NOT NULL,
    penerbit VARCHAR(100) NOT NULL,
    tahun YEAR NOT NULL,
    stok INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Latihan Tambahan — Query Lanjutan
```
Berdasukkan schema di atas, buatkan query SQL untuk:

1. Cari semua buku yang sedang dipinjam (status = 'dipinjam')
2. Hitung jumlah peminjaman per bulan tahun 2025
3. Cari anggota yang terlambat mengembalikan
4. Buat view laporan bulanan otomatis
5. Buat stored procedure untuk proses peminjaman baru
```

### ✅ Cek Paham
- [ ] ERD lengkap dengan minimal 4 tabel
- [ ] Setiap tabel memiliki primary key dan foreign key
- [ ] SQL CREATE TABLE bisa dieksekusi tanpa error
- [ ] Bisa menjelaskan hubungan antar tabel

---

## 🔌 Latihan 2: Build REST API Lengkap (5 Endpoints)
**⭐⭐⭐ Kesulitan: Sulit** | **⏱️ Waktu: 25 menit**

### Tujuan
Membangun REST API production-ready dengan authentication, validation, dan error handling.

### Prompt Utama — API dengan Node.js/Express
```
Bangun REST API lengkap dengan Node.js + Express untuk
sistem Todo List dengan user authentication.

FITUR:
1. Register & Login user (JWT authentication)
2. CRUD Todo (hanya bisa akses data sendiri)
3. Filter todo by status (active/completed)
4. Pagination untuk list todo
5. Input validation di setiap endpoint

STRUCTURE:
server.js
├── routes/
│   ├── auth.js        (register, login)
│   └── todos.js       (CRUD todos)
├── middleware/
│   └── auth.js        (JWT verify)
├── models/
│   └── db.js          (in-memory database)
└── utils/
    └── validator.js   (input validation)

ENDPOINTS:
POST   /api/auth/register   — Daftar akun baru
POST   /api/auth/login      — Login, dapat JWT
GET    /api/todos           — List todos (dengan filter & pagination)
POST   /api/todos           — Buat todo baru
PUT    /api/todos/:id       — Update todo
DELETE /api/todos/:id       — Hapus todo

RESPONSE FORMAT:
{
  "status": "success" | "error",
  "message": "...",
  "data": { ... }
}

SECURITY:
- Password di-hash dengan bcrypt
- JWT expiry 24 jam
- Rate limiting (100 request per 15 menit)
- Input sanitization

Tulis KODE LENGKAP semua file. Jangan skip.
Setelah kode, berikan instruksi:
1. Cara setup (npm init, install deps)
2. Cara jalankan
3. Cara test setiap endpoint (dengan curl)
4. Contoh response setiap endpoint
```

### Contoh Response yang Diharapkan
```json
// POST /api/auth/register
{
  "status": "success",
  "message": "Registrasi berhasil",
  "data": {
    "user": { "id": 1, "email": "andi@email.com" },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}

// GET /api/todos?page=1&limit=5&status=active
{
  "status": "success",
  "data": {
    "todos": [
      { "id": 1, "title": "Belajar Express", "status": "active" },
      { "id": 2, "title": "Buat API", "status": "active" }
    ],
    "pagination": {
      "page": 1, "limit": 5,
      "total": 12, "totalPages": 3
    }
  }
}
```

### Prompt Lanjutan — Testing
```
Setelah API selesai, buatkan script testing lengkap dalam
2 format:

1. CURL COMMANDS: Satu per endpoint, termasuk error cases
2. JAVASCRIPT (fetch): Script terpisah yang bisa dijalankan
   dengan node untuk menguji semua endpoint secara otomatis

Pastikan testing mencakup:
- Happy path (semua berhasil)
- Error cases (input invalid, unauthorized, not found)
- Edge cases (empty body, special characters)
```

### ✅ Cek Paham
- [ ] API berjalan di localhost
- [ ] Register & Login berfungsi (dapat JWT)
- [ ] CRUD Todos berfungsi dengan autentikasi
- [ ] Error handling menampilkan pesan yang jelas
- [ ] Semua curl test berhasil

---

## 🔄 Latihan 3: Refactor Kode Besar Jadi Modular
**⭐⭐⭐ Kesulitan: Sulit** | **⏱️ Waktu: 20 menit**

### Tujuan
Belajar mengubah kode monolitik (satu file besar) menjadi arsitektur modular yang mudah di-maintain.

### Kode Monolitik (200+ baris dalam 1 file)
```
Berikut ini adalah kode aplikasi toko online dalam 1 file
server.js yang sudah berantakan (200+ baris). Tolong
refactor menjadi arsitektur modular.

Kode lengkap ada di bawah ini:
[simulasikan paste kode panjang yang mencakup:
- Database connection
- Route handling (todos, users, products)
- Middleware (auth, logging, error handling)
- Helper functions
- Validation logic
- Database queries
Semua dalam 1 file!]

HASIL YANG DIINGINKAN:
1. Pisahkan ke dalam folder structure yang benar:
   src/
   ├── config/
   │   └── database.js
   ├── controllers/
   │   ├── userController.js
   │   ├── productController.js
   │   └── orderController.js
   ├── middleware/
   │   ├── auth.js
   │   ├── logger.js
   │   └── errorHandler.js
   ├── models/
   │   ├── User.js
   │   ├── Product.js
   │   └── Order.js
   ├── routes/
   │   ├── userRoutes.js
   │   ├── productRoutes.js
   │   └── orderRoutes.js
   ├── utils/
   │   └── validator.js
   └── server.js

2. Untuk setiap file baru, berikan:
   - Kode lengkap
   - Penjelasan kenapa dipisahkan ke situ
   - Dependency antar module

3. Jelaskan pattern yang digunakan (MVC, Service Layer, dll)
```

### Checklist Refactoring
- [ ] Tidak ada kode yang hilang (semua fungsionalitas terjaga)
- [ ] Struktur folder sesuai best practice
- [ ] Setiap module hanya punya 1 tanggung jawab (SRP)
- [ ] Dependency antar module sudah clear
- [ ] Server.js tinggal import dan setup

### Prompt Tambahan — Tambah Fitur Modularity
```
Setelah refactor, tambahkan fitur baru dengan pendekatan
modular:

1. Buat middleware rate-limiter terpisah
2. Buat config file untuk environment variables
3. Buat logger service yang bisa ganti output
   (console/file/cloud)
4. Tambahkan Swagger/OpenAPI documentation

Tunjukkan bagaimana fitur baru ini diintegrasikan
tanpa mengubah kode yang sudah ada (Open/Closed Principle).
```

### ✅ Cek Paham
- [ ] Kode terpecah menjadi minimal 10 file
- [ ] Setiap file memiliki tanggung jawab yang jelas
- [ ] Semua fitur asli masih berfungsi
- [ ] Bisa menjelaskan keuntungan modular architecture

---

## 🧪 Latihan 4: Buat Test Cases Otomatis
**⭐⭐⭐ Kesulitan: Sulit** | **⏱️ Waktu: 20 menit**

### Tujuan
Belajar menulis automated testing untuk memastikan kode berfungsi dengan benar.

### Prompt Unit Testing dengan Jest
```
Saya punya function JavaScript berikut yang perlu diuji:

function hitungDiskon(harga, persenDiskon) {
  if (typeof harga !== 'number' || harga < 0) {
    throw new Error('Harga harus angka positif');
  }
  if (persenDiskon < 0 || persenDiskon > 100) {
    throw new Error('Diskon harus antara 0-100');
  }
  return harga - (harga * persenDiskon / 100);
}

function formatRupiah(angka) {
  if (typeof angka !== 'number') throw new Error('Input harus angka');
  return 'Rp ' + angka.toLocaleString('id-ID');
}

function validasiEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

Buatkan test suite lengkap menggunakan Jest dengan cover:

1. TEST HITUNG DISKON (minimal 6 test cases):
   - Normal case (diskon 10%, 50%, 100%)
   - Edge case (diskon 0%)
   - Error case (harga negatif, diskon > 100)
   - Type error (input string, null, undefined)

2. TEST FORMAT RUPIAH (minimal 4 test cases):
   - Angka biasa (50000)
   - Angka besar (1000000000)
   - Angka nol
   - Error case (input string)

3. TEST VALIDASI EMAIL (minimal 6 test cases):
   - Email valid
   - Email tanpa @
   - Email tanpa domain
   - Email kosong
   - Email dengan spasi
   - Email dengan special characters

Untuk setiap test case, berikan:
- describe() block yang jelas
- it() dengan deskripsi yang informatif
- expect() assertions yang lengkap

Juga berikan instruksi setup:
1. npm init, install jest
2. Script test di package.json
3. Cara menjalankan
4. Cara melihat code coverage
```

### Contoh Hasil Test
```javascript
// tests/hitungDiskon.test.js
const { hitungDiskon } = require('../src/utils/kalkulator');

describe('hitungDiskon', () => {
  describe('Normal Cases', () => {
    it('seharusnya mengurangi 10% diskon dengan benar', () => {
      expect(hitungDiskon(100000, 10)).toBe(90000);
    });

    it('seharusnya mengurangi 50% diskon dengan benar', () => {
      expect(hitungDiskon(100000, 50)).toBe(50000);
    });

    it('seharusnya return 0 jika diskon 100%', () => {
      expect(hitungDiskon(100000, 100)).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('seharusnya return harga asli jika diskon 0%', () => {
      expect(hitungDiskon(100000, 0)).toBe(100000);
    });

    it('seharusnya handle harga 0', () => {
      expect(hitungDiskon(0, 50)).toBe(0);
    });
  });

  describe('Error Cases', () => {
    it('seharusnya throw error jika harga negatif', () => {
      expect(() => hitungDiskon(-100, 10))
        .toThrow('Harga harus angka positif');
    });

    it('seharusnya throw error jika diskon > 100', () => {
      expect(() => hitungDiskon(100000, 150))
        .toThrow('Diskon harus antara 0-100');
    });

    it('seharusnya throw error jika input bukan angka', () => {
      expect(() => hitungDiskon('abc', 10))
        .toThrow('Harga harus angka positif');
    });
  });
});
```

### Prompt — Integration Testing
```
Setelah unit test selesai, buatkan integration test
untuk API Express yang sudah dibuat:

1. Test register + login flow (end-to-end)
2. Test CRUD todos (create → read → update → delete)
3. Test error cases (unauthorized, not found)
4. Gunakan supertest untuk HTTP testing
5. Setup dan teardown test data

Pastikan setiap test berjalan secara independent
(test isolation).
```

### ✅ Cek Paham
- [ ] Semua test cases berjalan (pass) di Jest
- [ ] Code coverage minimal 80%
- [ ] Bisa menjelaskan perbedaan unit, integration, dan E2E test
- [ ] Bisa menulis test case sendiri untuk kode baru

---

## 🏗️ Latihan 5: System Design — Desain Chat App
**⭐⭐⭐ Kesulitan: Sulit** | **⏱️ Waktu: 15 menit**

### Tujuan
Belajar mendesain arsitektur sistem dari perspektif high-level sebelum mulai coding.

### Prompt System Design
```
Saya diminta mendesain sistem chat application sederhana
(mirip WhatsApp versi mini) untuk tugas kuliah.

Fitur yang harus didukung:
1. User registration & login
2. 1-to-1 chat (dua orang)
3. Group chat (max 10 orang)
4. Online/offline status
5. Typing indicator
6. Read receipts (centang biru)
7. Image/file sharing
8. Message history

Desain harus mencakup:

1. HIGH-LEVEL ARCHITECTURE (ASCII diagram)
   - Client (mobile/web)
   - API Gateway
   - Chat Service
   - User Service
   - Notification Service
   - Database

2. DATABASE DESIGN
   - Schema untuk users, conversations, messages
   - Relationships antar tabel
   - Indexing strategy

3. API ENDPOINTS
   - REST API untuk non-realtime
   - WebSocket events untuk realtime

4. TECH STACK RECOMMENDATION
   - Frontend, Backend, Database, Realtime, Storage
   - Dengan alasan pemilihan

5. SCALABILITY CONSIDERATIONS
   - Bagaimana jika user naik dari 100 ke 100.000?
   - Database sharding strategy
   - Caching strategy

6. SECURITY
   - Encryption end-to-end
   - Authentication flow
   - Rate limiting

Buat dalam format yang presentable untuk presentasi.
```

### Contoh Hasil — High-Level Architecture
```
HIGH-LEVEL ARCHITECTURE — ChatApp
══════════════════════════════════

┌────────────┐     ┌────────────┐
│ Mobile App │     │  Web App   │
│ (Flutter)  │     │ (React)    │
└─────┬──────┘     └─────┬──────┘
      │                   │
      └────────┬──────────┘
               │
         ┌─────┴──────┐
         │ API Gateway │ (Nginx)
         │  + Rate     │
         │  Limiter    │
         └─────┬──────┘
               │
    ┌──────────┼──────────┐
    │          │          │
┌───┴───┐ ┌───┴───┐ ┌───┴────┐
│ User  │ │ Chat  │ │Notif   │
│Service│ │Service│ │Service │
└───┬───┘ └───┬───┘ └───┬────┘
    │         │         │
    │    ┌────┴────┐    │
    │    │WebSocket│    │
    │    │ Server  │    │
    │    └────┬────┘    │
    │         │         │
┌───┴─────────┴─────────┴───┐
│        Database Layer     │
│ ┌──────┐ ┌─────┐ ┌─────┐ │
│ │Postgr│ │Redis│ │ S3  │ │
│ │SQL   │ │Cache│ │Files│ │
│ └──────┘ └─────┘ └─────┘ │
└───────────────────────────┘
```

### ✅ Cek Paham
- [ ] Arsitektur mencakup semua komponen utama
- [ ] Database design memiliki minimal 4 tabel
- [ ] Bisa menjelaskan data flow dari user A chat ke user B
- [ ] Memahami perbedaan REST API vs WebSocket

---

## 🚀 Latihan 6: Full-Stack Mini Project — TodoList + Auth + Database
**⭐⭐⭐ Kesulitan: Sulit** | **⏱️ Waktu: 25 menit (setup & execution)**

### Tujuan
Menggabungkan semua skill yang sudah dipelajari menjadi satu project lengkap.

### Prompt Full-Stack Project
```
Bangun full-stack TodoList application dengan:

BACKEND (Node.js + Express):
- User authentication (register/login dengan JWT)
- CRUD Todo (hanya lihat milik sendiri)
- Database: SQLite (via better-sqlite3)
- Input validation
- Error handling

FRONTEND (HTML + CSS + JavaScript):
- Halaman Login
- Halaman Register
- Dashboard (lihat, tambah, edit, hapus todo)
- Toggle status (active/completed)
- Filter (all/active/completed)
- Logout button
- Responsive design

DATABASE (SQLite):
- Table users (id, email, password_hash, created_at)
- Table todos (id, user_id, title, status, created_at)

FILE STRUCTURE:
todo-app/
├── package.json
├── server.js
├── database/
│   └── schema.sql
├── routes/
│   ├── auth.js
│   └── todos.js
├── middleware/
│   └── auth.js
├── public/
│   ├── index.html      (login/register page)
│   ├── dashboard.html   (todo list page)
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── auth.js
│       └── app.js
└── README.md

Tulis KODE LENGKAP semua file. Sertakan:
1. Instruksi setup lengkap
2. SQL schema
3. Semua file backend
4. Semua file frontend
5. Cara menjalankan
6. Fitur apa saja yang sudah bekerja
```

### Checklist Full-Stack
- [ ] `package.json` dengan dependencies lengkap
- [ ] Database schema bisa dieksekusi
- [ ] Backend berjalan tanpa error
- [ ] Frontend terhubung ke backend
- [ ] Register → Login → Dashboard flow berfungsi
- [ ] CRUD Todo berfungsi dengan benar
- [ ] Data tersimpan di SQLite
- [ ] Responsive di mobile
- [ ] Ada README.md dengan instruksi

### Prompt Bonus — Deployment
```
Setelah project selesai, buatkan panduan deployment ke:
1. Railway.app (gratis untuk full-stack)
2. Vercel (untuk frontend) + Railway (untuk backend)

Sertakan:
- Konfigurasi environment variables
- Perubahan kode yang diperlukan
- Step-by-step deployment
- URL testing setelah deploy
```

### ✅ Cek Paham
- [ ] Project berjalan lengkap di localhost
- [ ] Bisa register akun baru
- [ ] Bisa login dan melihat dashboard
- [ ] Bisa CRUD todo
- [ ] Bisa logout dan login kembali (data tetap ada)
- [ ] Bisa menjelaskan arsitektur project kepada orang lain

---

## 💡 Tips Sukses Latihan Coding Lanjutan

### Principle yang Harus Diingat
1. **KISS** — Keep It Simple, Stupid (jangan over-engineer)
2. **DRY** — Don't Repeat Yourself
3. **Single Responsibility** — Satu fungsi = satu tugas
4. **Fail Fast** — Error handling di awal, jangan diakhiri
5. **YAGNI** — You Aren't Gonna Need It (jangan bikin fitur yang belum diminta)

### Cara Belajar Coding Lanjutan dengan AI
- **Bangun dulu** versi sederhana, minta AI bantu enhance
- **Pahami arsitektur** sebelum mulai coding
- **Test dulu** (TDD) — tulis test sebelum kode
- **Code review** setiap selesai fitur
- **Refactor** setelah kode berjalan, jangan sebelumnya

### Career Path untuk Developer
```
Pemula → Junior → Mid → Senior → Lead → Architect
 │         │       │       │        │       │
HTML/     CRUD   API     System   Lead    Tech
CSS/JS    Apps   Design  Design   Team    Strategy
```

---

## 🏆 Penilaian Diri

| Latihan | Selesai? | Kualitas (1-5) | Waktu (menit) |
|---------|----------|-----------------|---------------|
| 1. Database Schema | ☐ | ___ | ___ |
| 2. REST API Lengkap | ☐ | ___ | ___ |
| 3. Refactor Modular | ☐ | ___ | ___ |
| 4. Test Cases | ☐ | ___ | ___ |
| 5. System Design | ☐ | ___ | ___ |
| 6. Full-Stack Project | ☐ | ___ | ___ |

**Refleksi:**
1. Arsitektur mana yang paling menantang untuk dipahami?
2. Pekerjaan developer mana yang paling kamu minati (frontend/backend/full-stack)?
3. Apa skill coding yang ingin kamu dalami lebih lanjut?

---

> **⬅️ Kembali ke Materi Modul 12** | **Selanjutnya: Modul 13 ➡️**
