<img src="https://images.pexels.com/photos/5530437/pexels-photo-5530437.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=1" alt="Students" style="width:100%;border-radius:12px;margin:12px 0;">

# 00. Fundamental Pemrograman & Web

> **Level:** 🌱 Beginner (sebelum mulai coding)  
> **Jam:** 4 (2 sesi)  
> **Prasyarat:** — (bisa komputer + koneksi internet)  
> **Output:** Paham gambaran besar — API, frontend, backend, database, gimana internet bekerja

---

## 🎯 Learning Objectives

Setelah selesai module ini, lo bakal bisa:

| No | Objective | Sesi |
|----|-----------|------|
| 1 | Jelaskan gimana client & server ngobrol lewat internet | 1 |
| 2 | Bedain frontend sama backend dengan contoh nyata | 1 |
| 3 | Baca & pahami URL structure (protocol, domain, path, query) | 1 |
| 4 | Sebutin HTTP methods (GET/POST/PUT/DELETE) dan kapan pakenya | 1 |
| 5 | Paham HTTP status codes (200, 404, 500, dll) | 1 |
| 6 | Jelaskan konsep API pake analogi restoran | 2 |
| 7 | Bedain SQL vs NoSQL database | 2 |
| 8 | Tulis query SQL dasar (SELECT, INSERT) | 2 |
| 9 | Paham gimana deployment kerja (Vercel, Railway, VPS) | 2 |
| 10 | Pakai terminal dasar (ls, cd, mkdir, node, npm) | 2 |
| 11 | Paham konsep Git & version control | 2 |

---

## 📋 Daftar Sesi

| # | Sesi | Durasi | Deskripsi |
|---|------|--------|-----------|
| 1 | [🌐 Gimana Internet & HTTP Bekerja](01-internet-http.md) | 2 jam | Client-server, HTTP, URL, frontend/backend, DNS & hosting |
| 2 | [🔌 API, Database & Deployment](02-api-database-deploy.md) | 2 jam | REST API, SQL/NoSQL, deployment, terminal, Git |

> Mulai dari [Sesi 1](01-internet-http.md) dulu, lalu lanjut [Sesi 2](02-api-database-deploy.md).

---

## 📋 Sesi 1: Gimana Internet & Web Bekerja

Konten lengkap di **[01-internet-http.md](01-internet-http.md)** 👈

### Ringkasan:

### 1.1 Client — Server

Internet itu kerjaan dua pihak:

```
[Browser/HP lo]  ──request──>  [Server (komputer jauh)]
[Browser/HP lo]  <──response── [Server (komputer jauh)]
```

**Client** = yang minta. Browser, HP, laptop.
**Server** = yang ngasih. Komputer di AWS/DigitalOcean/Biznet yang nyimpen data dan logic.

**Analogi: Restoran**
- Client = lo (pelanggan). Lo duduk, pesan makanan.
- Server = dapur + koki. Mereka masak dan anterin.
- Response = makanan yang dateng.

Ketika lo buka instagram.com:
1. Browser lo (client) minta ke server Instagram
2. Server kirim balik file HTML/CSS/JS + data postingan
3. Browser render jadi feed yang ke-scroll

### 1.2 Frontend vs Backend

**Frontend (FE)** = yang dilihat user.
- Warna, tombol, layout, animasi
- Teknologi: HTML, CSS, JavaScript, React, Tailwind
- Kerja di **browser**

**Backend (BE)** = yang di server, ga keliatan user.
- Logic, database, auth, API
- Teknologi: Node.js, Express, TypeScript, PostgreSQL
- Kerja di **server**

```
Frontend (browser)  <──API──>  Backend (server)  <──>  Database
```

**Contoh Instagram:**
- FE: feed, tombol like, komentar, dark mode
- BE: nyimpen foto di server, ngitung jumlah like, rekomendasi konten

### 1.3 HTTP & URL

Pas lo browsing, lo sebenernya pake protokol HTTP.

**URL breakdown:**
```
https://www.tokopedia.com/search?q=sepatu
|_____| |___________| |______| |________|
protocol    domain       path     query
```

**HTTP Methods (cara komunikasi):**

| Method | Arti | Contoh |
|--------|------|--------|
| GET | **Ambil** data | Liat feed IG |
| POST | **Buat** data baru | Upload foto |
| PUT/PATCH | **Ubah** data | Edit caption |
| DELETE | **Hapus** data | Hapus postingan |

**HTTP Status Codes (tanda dari server):**

| Kode | Arti | Ngapain |
|------|------|---------|
| 200 OK | Berhasil | Gas terus |
| 201 Created | Berhasil dibuat | Biasanya POST |
| 400 Bad Request | Salah input | Cek data yang dikirim |
| 401 Unauthorized | Belum login | Login dulu |
| 404 Not Found | Ga ada | Cek URL |
| 500 Internal Server Error | Server error | Bukan lo salahnya |

> 📖 **Baca selengkapnya:** [Sesi 1 — Internet & HTTP](01-internet-http.md) termasuk latihan analisa website, tebak status code, flowchart, dan roleplay!

---

## 📋 Sesi 2: API, Database, Deployment

Konten lengkap di **[02-api-database-deploy.md](02-api-database-deploy.md)** 👈

### Ringkasan:

### 2.1 Apa itu API?

**API (Application Programming Interface)** = jembatan antara dua aplikasi.

**Analogi: Pelayan Restoran**
- Lo (client) punya meja, mau pesan.
- Pelayan (API) yang anterin pesanan lo ke dapur (server).
- Pelayan yang balikin makanan (response) ke meja lo.
- Lo ga perlu tau gimana dapur kerja — lo cuma ngomong sama pelayan.

**API itu kayak menu restoran:**
- Menu ngasih tau lo apa aja yang bisa dipesen
- API documentation ngasih tau lo endpoint apa aja yang bisa dipanggil
- Lo ga bisa pesen sesuatu yang gak ada di menu — sama kaya endpoint yang gak didokumentasi

**Contoh API di kehidupan nyata:**
- **Weather API:** Lo minta `GET /api/weather/jakarta` -> server balik `{suhu: 32, kondisi: "cerah"}`
- **Midtrans API:** Lo kirim data pembayaran -> Midtrans proses -> balik status sukses/gagal
- **OpenAI API:** Lo kirim prompt -> ChatGPT balik jawaban

**REST API** = cara bikin API yang paling umum. Pake HTTP method (GET/POST/PUT/DELETE) buat operasi CRUD.

### 2.2 Database

Database = tempat nyimpen data terstruktur.

**2 jenis utama:**

| Jenis | Contoh | Kayak |
|-------|--------|-------|
| SQL (Relational) | PostgreSQL, MySQL | Excel banyak sheet yang saling nyambung |
| NoSQL | MongoDB, Redis | JSON fleksibel |

**SQL singkat:**
```sql
-- Buat tabel
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR,
  email VARCHAR UNIQUE
);

-- Input data
INSERT INTO users (name, email) VALUES ('Budi', 'budi@email.com');

-- Ambil data
SELECT * FROM users WHERE name = 'Budi';
```

### 2.3 Deployment

**Deployment** = naro aplikasi lo di internet biar bisa dipake orang lain.

| Cara | Cocok | Biaya |
|------|-------|-------|
| Vercel | Frontend (HTML/React) | Gratis |
| Railway | Backend (Node.js/Express) | Gratis |
| VPS (Biznet/DO) | Full-stack production | Bayar |

**Dari koding sampe online:**
```
Koding -> Git push -> Deploy otomatis -> Live URL -> Share ke temen
```

### 2.4 Terminal / Command Line

Terminal = cara ngobrol langsung sama komputer pake teks, bukan GUI.

**Perintah dasar:**

| Perintah | Fungsi |
|----------|--------|
| `ls` | Lihat file di folder |
| `cd folder` | Pindah folder |
| `mkdir nama` | Buat folder baru |
| `node file.js` | Jalanin JavaScript |
| `npm install` | Download dependencies |

**Tips:**
- Jangan takut terminal. Lo ga bakal rusakin komputer.
- Kalo bingung, tinggal `ctrl+C` buat cancel.

### 2.5 Version Control (Git)

Git = mesin waktu buat kode lo.

```bash
git init          # Aktifkan git di project
git add .         # Stage semua perubahan
git commit -m "apa yang diubah"   # Simpen snapshot
git push          # Upload ke GitHub
```

Kenapa penting:
- Bisa balik ke versi sebelumnya kalo error
- Kerja tim tanpa tabrakan
- Portfolio GitHub

> 📖 **Baca selengkapnya:** [Sesi 2 — API, Database & Deployment](02-api-database-deploy.md) termasuk latihan REST API, design database, terminal challenge, dan Git simulation!

---

## 📋 Ringkasan Visual

```
LOKAL                        INTERNET
┌──────────────┐           ┌──────────────────┐
│  Browser lo  │  ──GET──> │  Server (API)     │
│  (Frontend)  │  <──JSON─ │  Node.js + Express │
│  HTML/CSS/JS │           │                    │
└──────────────┘           └───────┬────────────┘
                                   │ SQL query
                                   ▼
                            ┌──────────────────┐
                            │  Database         │
                            │  PostgreSQL       │
                            │  nyimpen data     │
                            └──────────────────┘
```

**Apa yang dipelajari di kurikulum ini:**

```
Module 1: JavaScript     (Bikin logic)
Module 2: DSA           (Bikin algoritma efisien)
Module 3: TypeScript    (Bikin kode lebih aman)
Module 4: Web Basics    (Bikin Frontend — yang dilihat user)
Module 5: Git & Deploy  (Bikin kode aman + online)
Module 6: Node/Express  (Bikin Backend — API + server logic)
Module 7: Mastra AI     (Bikin AI Agent)
Module 8-9: Project     (Gabungin semua)
```

---

## 🧠 Peta Belajar: Modul Ini vs Sisanya

```
┌─────────────────────────────────────────────────────────┐
│                   00. FUNDAMENTAL (INI)                  │
│     Paham cara internet kerja + API + database + Git    │
└──────────┬──────────┬──────────┬──────────┬─────────────┘
           │          │          │          │
           ▼          ▼          ▼          ▼
    ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
    │ 01. JS  │ │ 02. DSA │ │ 03. TS  │ │ 04. Web │
    │ Logic   │ │ Efisien │ │ Type    │ │ Frontend│
    └─────────┘ └─────────┘ └─────────┘ └─────────┘
                                        │
                                        ▼
                               ┌─────────────────┐
                               │ 05. Git + Deploy │
                               │ 06. Backend      │
                               │ 07. AI Agent     │
                               │ 08-09. Project   │
                               └─────────────────┘
```

---

## 📝 Latihan Module (Ringkasan)

### 🔥 Latihan Wajib

1. **Analisa Website:**
   Buka https://github.com. Coba tebak:
   - Mana yang Frontend? (yang lo lihat: warna, tombol, layout)
   - Kira-kira API endpoint apa aja yang dipake pas lo login?
   - Data apa aja yang disimpen di database?

2. **HTTP Method Quiz:**
   - Upload foto IG pake method apa? → POST
   - Liat story temen pake method apa? → GET
   - Edit bio pake method apa? → PUT/PATCH

3. **Client-Server Flowchart:**
   Gambar flowchart sederhana: lo buka tokopedia → cari "sepatu" → liat hasil. Tandain mana client, server, database, API.

### 🤔 Refleksi Diri

Setelah selesai module 00, jawab pertanyaan ini buat diri sendiri:

1. **Sebelum vs Sesudah:** Apa yang paling berubah dari pemahaman lo tentang internet?
2. **Analogi Sendiri:** Coba bikin analogi lo sendiri tentang API (selain restoran). Misal: API itu kayak __ karena __.
3. **Gambaran Karir:** Dari Frontend, Backend, atau Fullstack — yang mana yang paling menarik buat lo? Kenapa?
4. **Koneksi Kehidupan Nyata:** Pilih 3 aplikasi yang lo pake tiap hari (IG, Gojek, TikTok). Coba breakdown mana frontend, backend, API, dan database-nya.
5. **Ketakutan Terbesar:** Apa yang paling lo khawatirin sebelum mulai coding? Tulis, taruh di sini. Pas udah 3 bulan, balik lagi liat — pasti udah ketawa.

### 📖 Latihan Per-Sesi (Lengkap)

Latihan detail + studi kasus ada di file sesi masing-masing:

| Sesi | File | Yang Dipelajari |
|------|------|-----------------|
| 1 | [01-internet-http.md](01-internet-http.md) | Analisa website beneran, tebak status code, flowchart client-server, roleplay request-response |
| 2 | [02-api-database-deploy.md](02-api-database-deploy.md) | Tebak REST method, design database Todo List, terminal challenge, Git simulation, deployment decision |

---

## ✅ Checklist: Lo Siap Lanjut Kalo...

- [ ] Bisa jelasin client-server ke adik/temen pake analogi sendiri
- [ ] Paham bedanya GET, POST, PUT, DELETE
- [ ] Tau kapan nemu 404 vs 500 vs 401
- [ ] Bisa breakdown URL jadi protocol, domain, path, query
- [ ] Bisa jelasin API pake analogi restoran
- [ ] Tau bedanya SQL sama NoSQL
- [ ] Pernah buka terminal dan jalanin `ls`, `cd`, `mkdir`
- [ ] Paham konsep Git secara garis besar
- [ ] Udah explore file [01-internet-http.md](01-internet-http.md) dan [02-api-database-deploy.md](02-api-database-deploy.md)

> **Udah siap?** Lanjut ke **Module 1: JavaScript** 🚀
