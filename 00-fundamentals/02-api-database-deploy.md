<img src="https://images.pexels.com/photos/50711/board-electronics-computer-data-processing-50711.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=1" alt="Server & API" style="width:100%;border-radius:12px;margin:12px 0;">

# 🔌 Sesi 2: API, Database, Deployment & Tools

> 🎯 **Tujuan:** Paham API, database, deployment, terminal dasar & Git — bekal sebelum coding beneran.

---

## 🧩 Apa Itu API?

**API** (**A**pplication **P**rogramming **I**nterface) = jembatan antara dua aplikasi biar bisa ngobrol.

### 🍕 Analogi: Pelayan Restoran

Bayangin lo lagi di restoran:

| Di Dunia Nyata | Di Dunia Coding |
|----------------|----------------|
| Lo (pelanggan) | **Client** (frontend / aplikasi lain) |
| Menu makanan | **API Documentation** (daftar endpoint yang tersedia) |
| Panggil pelayan, pesan | **API Request** (panggil endpoint) |
| Pelayan anter ke dapur | **Server** nerusin request ke logic |
| Koki masak, ambil bahan dari kulkas | **Backend** proses + query **database** |
| Pelayan balik bawa makanan | **API Response** (data balik dalam format JSON) |

> Lo ga perlu tau gimana dapur kerja — lo cuma butuh pelayan. Sama persis: lo ga perlu tau detail server, lo cuma butuh API endpoint yang bener.

### 🔑 Kenapa API Penting?

- **Pisahin Frontend & Backend:** Tim FE bisa kerja barengan tim BE
- **Reusable:** Satu API bisa dipake web, mobile, smart TV
- **Keamanan:** Server ga perlu ngekspos database langsung

### ✨ Contoh API Sehari-hari

| API | Cara Lo Pake |
|-----|-------------|
| **Google Maps API** | Lo search tempat — Maps ambil data dari server Google lewat API |
| **Midtrans API** | Lo bayar di e-commerce — frontend kirim data ke Midtrans |
| **OpenAI API** | Lo chat sama ChatGPT — browser lo panggil API OpenAI |
| **Weather API** | Lo buka app cuaca — HP panggil API BMKG |

```
Contoh request ke Weather API:
GET https://api.weatherapi.com/v1/current.json?q=Jakarta

Response-nya:
{
  "location": {"name": "Jakarta"},
  "current": {
    "temp_c": 32,
    "condition": {"text": "Cerah berawan"}
  }
}
```

---

## 🛣️ REST API: Cara Standar Bikin API

**REST** (Representational State Transfer) = aturan bikin API yang paling populer. Pake HTTP method standar.

### CRUD → HTTP Method Mapping

| Operasi | Method HTTP | Contoh Endpoint | Arti |
|---------|-------------|-----------------|------|
| **Create** (Buat) | `POST` | `POST /api/users` | Daftar akun baru |
| **Read** (Baca) | `GET` | `GET /api/users/1` | Liat profil user id 1 |
| **Update** (Ubah) | `PUT / PATCH` | `PUT /api/users/1` | Edit profil |
| **Delete** (Hapus) | `DELETE` | `DELETE /api/users/1` | Hapus akun |

### Anatomi Request REST API

```
POST /api/users HTTP/1.1
Host: myapp.com
Content-Type: application/json
Authorization: Bearer token_lo

Body:
{
  "name": "Budi",
  "email": "budi@email.com",
  "password": "rahasia123"
}
```

Server bakal balik:

```json
HTTP/1.1 201 Created
{
  "id": 1,
  "name": "Budi",
  "email": "budi@email.com",
  "created_at": "2026-07-08"
}
```

### 🔄 REST API Flow Lengkap

```
┌──────────────────────────────────────────────────────┐
│                                                        │
│  Browser (FE)      API (BE)         Database (DB)      │
│     │                │                  │              │
│     │── GET /posts──>│                  │              │
│     │                │── SELECT * ─────>│              │
│     │                │<── rows ─────────│              │
│     │<── JSON posts──│                  │              │
│     │                │                  │              │
│     │── POST /posts ─>│                 │              │
│     │  {title: "A"}   │── INSERT INTO ─>│              │
│     │                 │<── ok ──────────│              │
│     │<── 201 Created──│                 │              │
│                                                        │
└──────────────────────────────────────────────────────┘
```

---

## 🗄️ Database: Tempat Nyimpen Data

**Database** = aplikasi khusus yang tugasnya cuma satu: nyimpen dan ngambil data dengan efisien.

### SQL vs NoSQL

| | SQL (Relational) | NoSQL (Non-relational) |
|---|---|---|
| **Kayak** | Excel banyak sheet saling nyambung | Google Docs — satu dokumen JSON |
| **Struktur** | Rapi, pake tabel & kolom | Fleksibel, document-based |
| **Contoh** | PostgreSQL, MySQL, SQLite | MongoDB, Redis, Firebase |
| **Cocok** | Data yang relasinya jelas (user-order-product) | Data yang fleksibel (log, real-time, cache) |
| **Query** | SELECT * FROM users WHERE email = ? | db.users.find({email: "..."}) |

### SQL Dasar — Lo Bakal Sering Liat Ini

```sql
-- BUKA database
USE nama_database;

-- BUAT tabel baru
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- SIMPAN data baru (INSERT)
INSERT INTO users (name, email)
VALUES ('Budi', 'budi@email.com');

-- AMBIL data (SELECT) — ini yang paling sering dipake
SELECT * FROM users;
SELECT name, email FROM users WHERE name = 'Budi';
SELECT * FROM users ORDER BY created_at DESC LIMIT 10;

-- UBAH data (UPDATE)
UPDATE users SET name = 'Budi Update' WHERE id = 1;

-- HAPUS data (DELETE)
DELETE FROM users WHERE id = 1;
```

### 🧠 Bayangin Gini: Database Instagram

| Tabel | Isinya |
|-------|--------|
| `users` | id, username, email, password, avatar |
| `posts` | id, user_id, caption, image_url, created_at |
| `likes` | id, user_id, post_id |
| `comments` | id, user_id, post_id, text, created_at |

Relasinya: satu user punya banyak postingan. Satu postingan punya banyak like & komentar.

---

## 🚀 Deployment: Naro Aplikasi ke Internet

**Deployment** = mindahin kode dari laptop lo ke server supaya bisa diakses semua orang.

### Dari Local ke Production

```
Laptop lo                  Internet
┌────────────┐    push    ┌──────────────────┐
│ Kode React │  ────────> │ Vercel / Railway  │
│ Kode API   │  git push  │ Auto build &      │
│ Database   │            │ deploy            │
└────────────┘            └──────────────────┘
                                     │
                            Live URL: mycoolapp.vercel.app
                                     │
                               Share ke temen!
```

### Pilihan Hosting

| Platform | Buat Apa | Cocok Buat | Biaya |
|----------|----------|-----------|-------|
| **Vercel** | Frontend (React/Next.js) | Landing page, blog, portfolio | Gratis |
| **Railway** | Backend (Node.js/Express) | API server | Gratis start |
| **Netlify** | Frontend statis | HTML/CSS/JS murni | Gratis |
| **VPS (Biznet/DigitalOcean)** | Full control | App production + database | Bayar (~100-300rb/bln) |
| **Supabase** | Backend + database | Fullstack tanpa bikin server | Gratis start |

### Flow Deployment Modern

```bash
# 1. Koding di laptop
npm run dev

# 2. Simpen ke Git
git add .
git commit -m "fitur login selesai"
git push

# 3. Auto-deploy (Vercel/Railway detect push dari GitHub)
# Build -> Deploy -> Live dalam 2 menit
```

> **Tips:** Jangan overthinking deployment. Lo cukup `git push`, sisanya otomatis.

---

## 📦 Environment Variables & .env

Environment variables (env vars) = **konfigurasi yang beda tiap environment** (lokal, staging, production).

### Kenapa Butuh?

```javascript
// ❌ HARDCODED — ganti manual kalo pindah environment
const API_URL = 'http://localhost:3000';
const DB_PASSWORD = 'password123';

// ✅ Environment variable — aman, fleksibel
const API_URL = process.env.API_URL || 'http://localhost:3000';
const DB_PASSWORD = process.env.DB_PASSWORD;
```

### .env File

```bash
# .env — JANGAN di-commit ke Git!
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
JWT_SECRET=supersecretkey123
API_KEY=sk-abc123def456

# .env.example — di-commit, template tanpa nilai rahasia
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb
JWT_SECRET=your-secret-here
```

### Aturan .env

- `.env` — **jangan di-commit** (isi: password, key, token)
- `.env.example` — **commit**, template aja
- `.gitignore` — pastiin `.env` ada di dalamnya

```bash
# Cara pake di terminal
PORT=4000 node app.js
# Atau pake dotenv library
```

---

## 🗄️ Database Indexing — Biar Query Cepat

Index = kayak **daftar isi di buku** — nyari data tanpa baca halaman satu-satu.

### Tanpa Index (Full Table Scan)

```sql
-- Tanpa index, PostgreSQL harus scan SEMUA baris
SELECT * FROM users WHERE email = 'budi@email.com';
-- Mungkin baca 1 juta baris cuma buat cari 1 email
```

### Dengan Index

```sql
-- Bikin index
CREATE INDEX idx_users_email ON users(email);

-- Query sama — sekarang pake index, langsung lompat ke baris yang cocok
SELECT * FROM users WHERE email = 'budi@email.com';
-- Baca 1 baris aja (via index) — 1000x lebih cepat
```

### Kapan Bikin Index?

```sql
-- ✅ Column yang sering di-WHERE
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- ✅ Column yang sering di-JOIN
CREATE INDEX idx_posts_author_id ON posts(author_id);

-- ✅ Column yang sering di-ORDER BY
CREATE INDEX idx_users_created_at ON users(created_at);

-- ❌ Column yang jarang dipake query — index makan disk space
-- ❌ Table kecil (< 1000 baris) — gak perlu index
-- ❌ Column yang sering di-update — index harus di-rebuild tiap update
```

### Trade-off Index

| Kelebihan | Kekurangan |
|-----------|------------|
| SELECT & JOIN lebih cepat | INSERT/UPDATE/DELETE jadi lambat (harus update index juga) |
| ORDER BY lebih efisien | Makan disk space tambahan |
| Unique constraint otomatis bikin index | Terlalu banyak index bikin bingung optimizer |

> **Tips:** Jangan bikin index dulu. Profil query lambat pake `EXPLAIN`, baru bikin index yang diperlukan.

---

## 🚀 Deployment & CI/CD

**CI/CD** = Continuous Integration / Continuous Deployment — otomatis test + deploy tiap kali lo push kode.

### CI/CD Pipeline Flow

```
Push ke GitHub → Test jalan otomatis → Build → Deploy ke production

Git push         GitHub Actions        Vercel / Railway
    │                   │                    │
    ▼                   ▼                    ▼
[Lo coding] → [Auto test + lint] → [Auto deploy ke server]
```

### GitHub Actions — CI/CD Gratis

```yaml
# .github/workflows/deploy.yml
name: CI/CD Pipeline
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Lint code
        run: npm run lint

  deploy:
    needs: test  # deploy cuma kalo test lolos
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Railway
        run: curl -X POST https://api.railway.app/deploy
```

### Deployment Checklist

- [ ] Environment variables di-set di server (bukan di .env file)
- [ ] Database migration udah jalan
- [ ] Build success (gak ada error)
- [ ] Health check endpoint balik 200
- [ ] SSL certificate aktif (https)
- [ ] Logging & monitoring aktif
- [ ] Rollback plan — kalo error, bisa balik ke versi sebelumnya

---

## 💻 Terminal: Ngobrol Langsung Sama Komputer

**Terminal** = cara ngomong sama komputer pake teks, bukan klik-klik GUI. Wajib banget buat developer.

### Perintah Wajib Hafal

| Perintah | Fungsi | Contoh |
|----------|--------|--------|
| `pwd` | Cek posisi folder sekarang | `/home/midory/project` |
| `ls` | Liat file di folder | `ls -la` buat detail |
| `cd folder` | Pindah folder | `cd Desktop/project` |
| `cd ..` | Naik satu folder | Ke folder induk |
| `mkdir nama` | Buat folder baru | `mkdir my-app` |
| `touch file.js` | Buat file baru | `touch index.html` |
| `node file.js` | Jalanin JavaScript | `node app.js` |
| `npm init` | Mulai project Node.js | Bikin `package.json` |
| `npm install` | Download dependencies | `npm install express` |
| `clear` | Bersihin layar terminal | `clear` atau `⌘+K` |

### 📁 Analogi: Terminal = File Explorer

```
File Explorer (GUI)          Terminal (CLI)
┌─────────────────┐         ┌─────────────────┐
│ Documents        │         │ cd Documents     │
│   ├── project    │         │ mkdir project    │
│   └── index.html │         │ touch index.html │
│ Downloads        │         │ cd ~/Downloads   │
└─────────────────┘         └─────────────────┘
```

### 🧪 Coba Praktik (di terminal beneran)

```bash
# Bikin folder project baru
mkdir my-first-project
cd my-first-project

# Bikin file HTML
touch index.html

# Bikin file JavaScript
touch app.js

# Liat hasilnya
ls -la

# Jalanin JavaScript
echo 'console.log("Halo Dunia!")' > app.js
node app.js
# Output: Halo Dunia!
```

### ⚠️ Tips Terminal

- **Ga bakal rusak:** Kecuali lo sengaja `rm -rf /`, terminal itu aman
- **Panik?** Tekan `Ctrl + C` buat cancel perintah apapun
- **Auto-complete:** Tekan `Tab` buat lengkapin nama file/folder
- **History:** Tekan panah atas buat liat perintah sebelumnya
- **`.` itu folder sekarang, `..` folder induk**

---

## 🔄 Git: Mesin Waktu Buat Kode Lo

**Git** = sistem version control. Nyimpen semua perubahan kode lo kayak save point di game.

### Kenapa Git Penting

| Tanpa Git | Dengan Git |
|-----------|-----------|
| Bikin salinan folder kalo mau nyoba fitur baru | Git branch — nyoba fitur tanpa ganggu kode utama |
| Kalo error, ga bisa balik | Git checkout ke commit sebelumnya |
| Kerja tim? Kirim file zip lewat WA 😱 | Git push/pull — kolaborasi bersih |
| "Ini file final beneran final_v3.js" | Git commit dengan pesan jelas |

### Command Git Paling Dasar

```bash
# Mulai Git di folder project
git init

# Cek status perubahan
git status

# Tambah file ke staging (persiapan commit)
git add .
git add index.html            # file tertentu aja

# Simpen snapshot (commit)
git commit -m "fitur login selesai"

# Upload ke GitHub
git push origin main

# Liat history commit
git log --oneline

# Balik ke versi sebelumnya
git checkout <commit-id>
```

### 🔄 Git Flow Harian Developer

```bash
# PAGI: ambil update terbaru dari tim
git pull

# SIANG: coding, coding, coding

# SORE: simpen kerjaan
git add .
git commit -m "selesai bikin halaman profile"
git push
```

### 🌟 GitHub = Social Media buat Developer

- tempat nyimpen kode di cloud
- portfolio buat lamaran kerja
- kolaborasi open source

---

## 🏋️ Latihan

### ✏️ Latihan 1: Tebak REST API Method

Kurir ini pake method apa?

| Situasi | Method |
|---------|--------|
| Lo liat daftar semua user | ? |
| Lo bikin postingan baru | ? |
| Lo hapus komentar orang lain | ? |
| Lo update foto profil | ? |
| Lo search lagu di Spotify | ? |

> **Kunci:** GET, POST, DELETE, PUT/PATCH, GET

### ✏️ Latihan 2: Design Database Sederhana

Lo mau bikin aplikasi **Todo List**. Coba design tabel SQL-nya:

1. **Tabel `todos`** harus nyimpen: id, task (teks), completed (true/false), user_id, created_at
2. **Tabel `users`** harus nyimpen: id, name, email, password

Tulis SQL:
```sql
-- CREATE TABLE users (...)
-- CREATE TABLE todos (...)
-- INSERT INTO users ...
-- SELECT * FROM todos WHERE user_id = 1
```

### ✏️ Latihan 3: Terminal Challenge

Tanpa buka GUI, lakukan di terminal:

1. Bikin folder `latihan-terminal`
2. Masuk ke folder itu
3. Bikin file `index.html` dan `style.css`
4. Cek isi folder pake `ls`
5. Bikin file JavaScript `script.js`
6. Cek lagi pake `ls -la`
7. Hapus `style.css` pake `rm style.css`

### ✏️ Latihan 4: Git Simulation

Bayangin lo lagi ngerjain project. Tulis urutan command Git yang bener:

1. Mulai project baru → `git init`
2. Bikin file `README.md` → `touch README.md`
3. Cek status → `_____`
4. Stage file → `_____`
5. Commit pertama → `_____`
6. Upload ke GitHub → `_____`

### ✏️ Latihan 5: Deployment Decision

Lo punya project-project ini. Pilih platform deploy yang cocok:

| Project | Platform pilihan? |
|---------|-------------------|
| Landing page portfolio pake HTML + CSS | ? |
| API server pake Node.js + Express | ? |
| Fullstack app (Next.js + database) | ? |
| Aplikasi production skala besar | ? |

> **Kunci:** Vercel/Netlify, Railway, Vercel+Supabase, VPS/AWS

### ✏️ Latihan 6: .env & Index Simulation

1. Bikin file `.env.example` untuk project Todo API. Isi: PORT, DATABASE_URL, JWT_SECRET, CORS_ORIGIN.
2. Bikin file `.gitignore` — pastiin `.env` di dalamnya.
3. Tulis SQL query yang **lambat** tanpa index, lalu tambah index yang tepat:
   ```sql
   -- Query: cari semua order user dengan email tertentu
   SELECT * FROM orders WHERE user_id = 123 ORDER BY created_at DESC;
   ```
   Index apa yang perlu ditambah?

### ✏️ Latihan 7: CI/CD Pipeline Design

Desain pipeline CI/CD untuk project React + Express + PostgreSQL:

1. Tulis langkah-langkah yang harus terjadi saat push ke branch `main`
2. Tools apa yang dipake buat tiap langkah?
3. Kapan deploy ke staging? Kapan ke production?
4. Gambar flowchart (bisa pake mermaid atau kertas)

---

## 📚 Ringkasan Sesi 2

| Konsep | Intinya |
|--------|---------|
| **API** | Jembatan antara aplikasi — kayak pelayan restoran |
| **REST API** | Standar API pake GET/POST/PUT/DELETE |
| **CRUD** | Create (POST), Read (GET), Update (PUT), Delete (DELETE) |
| **Database SQL** | Excel banyak tabel yang saling nyambung (PostgreSQL) |
| **Database NoSQL** | Dokumen fleksibel (MongoDB) |
| **Deployment** | Naro kode ke server biar bisa diakses online |
| **Terminal** | Cara ngobrol sama komputer pake teks |
| **Git** | Mesin waktu buat kode — nyimpen history perubahan |

> **🏁 Selesai Module 00!** Sekarang lo udah paham gambaran besar. Lanjut ke [Module 1: JavaScript](https://github.com/rpl-ai-curriculum) 🚀

---

*Module 00 · RPL AI Curriculum*
