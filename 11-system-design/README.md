# Modul 11: System Design — Arsitektur Aplikasi untuk Pemula

> **Target:** Siswa SMK RPL yang sudah bisa bikin REST API pakai Express.js  
> **Tujuan:** Paham konsep system design yang bakal dipake pas ngerjain proyek capstone  
> **Level:** Praktis, bukan akademik

---

## Daftar Isi

1. [Apa Itu System Design?](#1-apa-itu-system-design)
2. [Monolitik vs Microservices](#2-monolitik-vs-microservices)
3. [Database Design: Normalisasi, Indexing, N+1 Problem](#3-database-design)
4. [Caching: In-Memory & Redis](#4-caching)
5. [Load Balancing](#5-load-balancing)
6. [Rate Limiting](#6-rate-limiting)
7. [CAP Theorem](#7-cap-theorem)

---

## 1. Apa Itu System Design?

**System design** = cara kita **merancang arsitektur** aplikasi sebelum dan saat nge-build. Bukan cuma soal coding — tapi gimana komponen-komponen aplikasi ngobrol satu sama lain, data ngalir, dan sistem tetep jalan walau digebuk ribuan user.

### Kenapa Penting?

- Aplikasi lo bakal dipake banyak orang
- Satu bug bisa bikin server jebol
- Lo harus bisa jelasin arsitektur ke tim

### Analogi: Desain Mall

```
  [Restoran]    [Toko Buku]    [Game Center]
       |              |              |
  [Toilet 1]    [Toilet 2]    [Toilet 3]
       |              |              |
  [Escalator]---[Lift Utama]---[Tangga Darurat]
       |              |              |
  [Parkir A]    [Parkir B]    [Drop-off]
```

Bayangin lo disuruh bikin mall. Kalau desainnya jelek:
- Parkir cuma 1 pintu → antrean panjang
- Toilet cuma 1 untuk 100 toko → ribut
- Lift cuma 1 → orang pada nunggu 30 menit

**System design = desain mall.** Lo mikirin: berapa pintu masuk, berapa toilet, berapa lift, gimana alur orang dari parkir ke toko.

Pas lo bikin API, lo mikirin hal yang sama: berapa request per detik, gimana nyimpen data biar cepet, gimana skalanya kalau user naik 10x lipat.

---

## 2. Monolitik vs Microservices

### Monolitik

Satu kode buat semuanya — frontend, backend, database query, semuanya dalam satu repo, satu server.

```
  +==========================================+
  |          MONOLITHIC APP                  |
  |  +------------------------------------+  |
  |  |           Express Server            |  |
  |  |  /auth · /products · /orders · /api |  |
  |  |  [Middleware] [Routes] [Models]     |  |
  |  +------------------------------------+  |
  |  |         Database Connector           |  |
  |  +------------------------------------+  |
  |  |         PostgreSQL                  |  |
  |  +------------------------------------+  |
  +==========================================+
```

**Ciri-ciri:**
- Satu kode base, satu deployment
- Semua fitur dalam satu proses
- Scaling: tinggal clone servernya

**Kelebihan:**
- Gampang di-start — cocok buat proyek sekolah
- Testing lebih sederhana
- Deployment tinggal jalanin 1 service

**Kekurangan:**
- Kalau error di 1 fitur, seluruh app mati
- Susah dipisah tim — kalo 2 orang edit file sama, conflict
- Semakin besar makin lambat build & deploy

**Analogi:** Mall dengan 1 tenant raksasa. Semua toko dalam satu ruangan. Ada toko baju, makanan, elektronik — tapi pintu masuknya satu, kasir satu. Kalau toko makanan error, toko baju ikut tutup.

### Microservices

Fitur dipisah jadi service-service kecil, masing-masing jalan sendiri.

```
  +----------+   +----------+   +-----------+
  | Auth     |   | Product  |   | Order     |
  | Service  |   | Service  |   | Service   |
  | Port 3001|   | Port 3002|   | Port 3003 |
  +----+-----+   +-----+----+   +-----+-----+
       |               |              |
  +----+-----+   +-----+----+   +-----+-----+
  | DB Auth  |   | DB Prod  |   | DB Order  |
  +----------+   +----------+   +-----------+
       |               |              |
  +----+---------------+-+-----------++
  |         API Gateway (Port 3000)  |
  +----+---------------+-+-----------++
       |               |              |
  [+ Browser / Mobile App +]
```

**Ciri-ciri:**
- Tiap service punya database sendiri
- Komunikasi via HTTP/REST atau message broker
- Bisa pakai tech stack beda tiap service

**Kelebihan:**
- Satu service error, yang lain tetep jalan
- Tim bisa kerja independen
- Scaling per service (yang sibuk doang di-scale)
- Build & deploy cepet karena kecil-kecil

**Kekurangan:**
- Kompleksitas naik drastis — perlu API Gateway, service discovery, monitoring
- Debugging lebih susah (tracing antar service)
- Data consistency lebih rumit

**Analogi:** Mall dengan tenant terpisah. Toko baju punya pintu sendiri, kasir sendiri, toilet sendiri. Kalau toko makanan lagi renovasi, lo tetap bisa belanja baju.

### Untuk Capstone?

**Mulai dari monolitik dulu.** Microservices itu overkill kalau user cuma 50 orang. Baru migrasi ke microservices kalau:
- Tim udah >5 orang
- Fitur udah >10
- Ada 1 fitur yang trafficnya 10x lipat dari fitur lain
- Lo males deploy ulang seluruh aplikasi cuma buat ganti typo di halaman About

---

## 3. Database Design

### 3A. Normalisasi Database

Normalisasi = proses **ngilangin data duplikat** dari database.

#### Kenapa harus dinormalisasi?

Tanpa normalisasi (contoh tabel jelek):

```
Tabel: pesanan
+----+---------+-------------------+-------------------+
| id | produk  | nama_pelanggan    | alamat_pelanggan  |
+----+---------+-------------------+-------------------+
| 1  | Buku A  | Budi Santoso      | Jl. Merdeka No.1  |
| 2  | Pensil  | Budi Santoso      | Jl. Merdeka No.1  |
| 3  | Buku B  | Budi Santoso      | Jl. Merdeka No.1  |
| 4  | Buku A  | Siti Rahma        | Jl. Sudirman No.2 |
+----+---------+-------------------+-------------------+
```

**Masalah:** Nama Budi Santoso + alamatnya ditulis 3 kali. Kalau Budi pindah rumah, lo harus ganti di 3 baris. Kalau lupa 1, data jadi inkonsisten.

**Solusi (Normalisasi):**

Dipisah jadi 2 tabel:

```
Tabel: pelanggan
+----+--------------+-------------------+
| id | nama         | alamat            |
+----+--------------+-------------------+
| 1  | Budi Santoso | Jl. Merdeka No.1  |
| 2  | Siti Rahma   | Jl. Sudirman No.2 |
+----+--------------+-------------------+

Tabel: pesanan
+----+---------+--------------+
| id | produk  | pelanggan_id |
+----+---------+--------------+
| 1  | Buku A  | 1            |
| 2  | Pensil  | 1            |
| 3  | Buku B  | 1            |
| 4  | Buku A  | 2            |
+----+---------+--------------+
```

Sekarang data pelanggan cukup disimpan 1x. Kalau Budi pindah, update 1 baris aja.

#### 3 Bentuk Normalisasi (Yang Paling Sering Dipake)

| Bentuk | Aturan | Analogi |
|--------|--------|---------|
| **1NF** | Setiap kolom isinya 1 nilai aja (bukan array/list) | STNK: 1 kolom merk, bukan "Honda;Yamaha" |
| **2NF** | Gak ada kolom yang tergantung sama sebagian primary key | Pisah data siswa & data kelas biar ga terulang |
| **3NF** | Kolom non-key gak boleh tergantung sama kolom non-key lain | Alamat pelanggan di tabel pesanan? Pisah! |

**Rules of thumb (gak usah hafal 1NF-3NF):**
1. Kalau ada kata yang diulang-ulang, pisahin ke tabel baru
2. Kalau 1 kolom berisi banyak nilai, pisahin ke tabel baru
3. Foreign key > copy-paste data

### 3B. Indexing

**Index** = fitur database buat nyari data **lebih cepet**, kayak indeks di buku.

#### Tanpa Index

Database baca **semua baris** dari awal sampe akhir — ini namanya *full table scan*.

```
Cari user dengan email "budi@email.com"

| Baris 1: ... bukan |
| Baris 2: ... bukan |
| Baris 3: ... bukan |
| Baris 4: ... bukan |  ← 500ms - 5 detik kalau 1 juta baris
| ...                 |
| Baris 873.402: ... BUKAN |
| Baris 873.403: ... "budi@email.com" → KETEMU!
```

#### Dengan Index

Database pake struktur data B-Tree buat langsung lompat ke baris yang dicari.

```
Index on email (sorted):
  "agus@mail.com"    → Baris 1
  "budi@email.com"   → Baris 873.403  ← langsung lompat
  "citra@mail.com"   → Baris 12.001
```

**Kapan pake index?**
- Kolom yang dipake buat WHERE, JOIN, ORDER BY, atau kolom UNIQUE
- Email, username, foreign key, tanggal

**Kapan JANGAN pake index?**
- Kolom yang cuma punya 2-3 nilai unik misal boolean (gender, status aktif/nonaktif)
- Tabel kecil (<1000 baris) — index malah bikin lambat
- Kolom yang sering di-update — index ikut di-update, jadi berat

**Syntax:**
```sql
CREATE INDEX idx_users_email ON users (email);
-- atau buat pencarian cepat berdasarkan email
```

**Analogi:** Index di buku. Mau cari kata "Polimorfisme"? Lo buka indeks di halaman belakang, liat "Polimorfisme → hal 87", langsung buka halaman 87. Tanpa indeks, lo baca buku dari halaman 1 sampe 87.

### 3C. N+1 Problem

**N+1 Problem** = bug performa query di ORM (Sequelize, Prisma, TypeORM, Mongoose) — bukan di SQL mentah.

#### Kejadiannya

Lo punya 10 penulis, masing-masing punya banyak artikel. Lo query:

```javascript
// PSEUDOCODE — ini yang SALAH
const authors = await Author.findAll(); // 1 query → dapet 10 author

for (const author of authors) {
  const articles = await Article.findAll({
    where: { authorId: author.id }
  });
  // 10 query lagi (1 per author)
  console.log(author.name, articles.length);
}
```

**Total query:** 1 (ambil author) + 10 (ambil artikel per author) = **11 query**

Ini N+1. N = jumlah author (10), 1 = query pertama.

```
Query Timeline:
Query 1: SELECT * FROM authors
  └─ Query 2: SELECT * FROM articles WHERE author_id = 1
  └─ Query 3: SELECT * FROM articles WHERE author_id = 2
  └─ Query 4: SELECT * FROM articles WHERE author_id = 3
  └─ ...
  └─ Query 11: SELECT * FROM articles WHERE author_id = 10
```

Kalau author-nya 1000, total query = 1001. Server lo lemess.

#### Solusi: Eager Loading

```javascript
// PAKAI INI — JOIN dalam 1 query
const authors = await Author.findAll({
  include: [{ model: Article }]
});
// 1 query pake JOIN → selesai
```

```
Query: SELECT a.*, b.* FROM authors a
       LEFT JOIN articles b ON a.id = b.author_id
```

**Total query: 1 aja.** JOIN ngurus semuanya.

#### Deteksi N+1

- Lo liat query log muncul query yang sama berulang-ulang
- API yang tadinya 50ms tiba-tiba jadi 2 detik pas data banyak
- ORM lo nge-log query (aktifin `logging: true` di Sequelize)

**Analogi:** Lo mau fotokopi 10 halaman buku. Cara N+1: lo buka halaman 1 → ke mesin fotokopi → balik → buka halaman 2 → ke mesin fotokopi → balik ... 10x bolak-balik. Cara JOIN: lo bawa bukunya ke mesin fotokopi, fotokopi 10 halaman sekaligus.

---

## 4. Caching

**Cache** = tempat nyimpen data **sementara** biar akses berikutnya lebih cepet.

### Kenapa Perlu Cache?

Database itu keras — baca dari disk, proses query, kirim data. Butuh waktu 10-200ms per query. Cache itu nyimpen hasilnya di **RAM** — akses <1ms.

```
[Request] → [Cache] → [Database]
               |
       Ada datanya?   Gak ada → ambil dari DB,
       Ya → balikin    simpan ke cache, balikin
       langsung
```

### 4A. In-Memory Caching

Simpen data di variabel JavaScript di RAM server.

```javascript
// Simple in-memory cache di Express
const cache = new Map();

app.get('/products', async (req, res) => {
  const cacheKey = 'products:all';

  // Cek cache dulu
  if (cache.has(cacheKey)) {
    console.log('CACHE HIT — ambil dari cache');
    return res.json(cache.get(cacheKey));
  }

  // Miss — ambil dari database
  const products = await Product.findAll();

  // Simpan ke cache (expire 60 detik)
  cache.set(cacheKey, products);
  setTimeout(() => cache.delete(cacheKey), 60000);

  console.log('CACHE MISS — ambil dari DB');
  res.json(products);
});
```

**+** Gampang, gak perlu install apa-apa  
**-** Data ilang kalau server restart  
**-** Cuma bisa dipake server itu aja (gak shared ke server lain)

### 4B. Redis

Redis = database in-memory khusus buat caching. Jalan di port sendiri, bisa diakses banyak server.

```
+-----------+
| App       |──HTTP──[Redis Server]
| Server 1  |         │
+-----------+         │
+-----------+         │
| App       |──HTTP──┘
| Server 2  |
+-----------+
```

**Kenapa Redis?**
- Data persist walau app restart (Redis bisa dump ke disk)
- Bisa dipake banyak server — **shared cache**
- Support TTL (time-to-live) — data otomatis expired
- Lebih dari cache: bisa buat queue, session store, pub/sub

**Coba pake ioredis:**
```javascript
const Redis = require('ioredis');
const redis = new Redis(); // default: localhost:6379

app.get('/products', async (req, res) => {
  const cacheKey = 'products:all';

  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.json(JSON.parse(cached));
  }

  const products = await Product.findAll();
  await redis.setex(cacheKey, 60, JSON.stringify(products));
  // setex = set + expire in 60 detik

  res.json(products);
});
```

**Analogi:** 
- **Database** = gudang besar. Lo bisa nyimpen apa aja, tapi jalan ke gudang jauh (50m).
- **In-memory cache** = saku lo. Cepet diambil (<1s), tapi cuma muat sedikit, ilang kalau ganti baju (server restart).
- **Redis** = loker umum (shared). Lebih gede dari saku, bisa diakses sama temen-temen, gak ilang tiap hari.

### Cache Strategy: Cache Aside

Paling umum: aplikasi tanggung jawab ngelola cache.

```
1. Cek cache → ADA → balikin data (CACHE HIT)
2. Cek cache → GAK ADA → ambil dari DB
3. Simpan hasil ke cache
4. Balikin data ke client
5. Kalau data di-update → hapus cache biar di-refresh
```

---

## 5. Load Balancing

**Load Balancer (LB)** = alat yang ngedistribusikan traffic ke beberapa server.

```
        Internet
           │
      [Load Balancer]   ← satu "pintu" buat semua user
       /     |     \
  [Web1]  [Web2]  [Web3]  ← 3 server identik
       \     |     /
      [Database]    ← 1 database (shared)
```

### Kenapa Perlu?

- **1 server** bisa handle ~500-2000 request/detik (tergantung app)
- Kalau user 10.000, 1 server jebol
- Dengan LB: traffic dibagi ke 3 server → masing-masing handle 3.333 request

### Algoritma Load Balancing

| Metode | Cara Kerja | Analogi |
|--------|-----------|---------|
| **Round Robin** | Giliran: server 1 → 2 → 3 → 1 → 2 → 3 | Kasir bank: nomor antrian dibagi rata |
| **Least Connections** | Kirim ke server yang paling sedikit koneksinya | Pilih kasir yang antriannya paling pendek |
| **IP Hash** | Client yang sama selalu ke server yang sama | Siswa disuruh ke ruang kelas yang sama tiap hari |

### Untuk Capstone

Lo gak butuh load balancer beneran buat proyek sekolah. Tapi pahamin konsepnya:

- Kalau deploy pake PM2, lo bisa `pm2 start app.js -i max` → **cluster mode** — Node.js jalan pake semua CPU core
- Nanti waktu kerja beneran, bakal pake **NGINX** atau **AWS ALB** sebagai load balancer

```
  Tanpa LB: [Server: 1 core CPU] → kewalahan
  Dengan PM2: [Server: 4 core CPU] → 4 proses bagi-bagi request
```

---

## 6. Rate Limiting

**Rate Limiting** = batasin jumlah request dari 1 user/alamat IP dalam waktu tertentu.

### Kenapa?

- Mencegah **brute force attack** (coba login berkali-kali)
- Mencegah **spamming API** (request gila-gilaan)
- Mencegah **satu user serakah** boros resource server

### Implementasi di Express

```javascript
const rateLimit = require('express-rate-limit');

// Maks 100 request per 15 menit per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 menit
  max: 100,                    // 100 request
  message: {
    error: 'Too many requests. Coba lagi nanti.',
    retryAfter: '15 menit'
  }
});

app.use('/api', limiter); // Terapkan ke semua route /api
```

**Kalau user melebihi batas:**

```
HTTP 429 Too Many Requests
{
  "error": "Too many requests. Coba lagi nanti.",
  "retryAfter": "15 menit"
}
```

### Rate Limiting Levels

```
Global: 1000 req/menit per IP          → buat semua endpoint
Auth:   5 percobaan login per 15 menit → endpoint /login
API:    60 req/menit per token         → endpoint /api/*
Upload: 10 file per jam                → endpoint /upload
```

### Analogi

**Wahana bermain:**
- Tiket masuk = 1 request
- 1 orang cuma bisa naik 3x dalam 1 jam (rate limit)
- Kalau udah 3x, suruh antre lagi nanti
- Kalau ada yang coba manjat pagar (brute force), diusir

---

## 7. CAP Theorem

**CAP Theorem** = teorema yang bilang: **sistem terdistribusi gak bisa punya ketiganya sekaligus.**

### 3 Sifat

| Sifat | Maksud | Gampangnya |
|-------|--------|------------|
| **C**onsistency | Semua node liat data yang **sama** | Semua server jawab "Budi punya saldo 10rb" |
| **A**vailability | Semua request **tetap dilayani**, walau ada node mati | Ada server yang mati? Server lain tetap jawab |
| **P**artition Tolerance | Sistem tetep jalan walau koneksi antara node **putus** | Server A & B putus komunikasi, tapi tetap layani user |

### Pilih 2 dari 3

```
         C
        / \
       /   \
      /     \
     P-------A
     
Pilih salah satu: CP atau AP
```

**Yang paling penting:** Network partition (P) pasti terjadi — jaringan gak 100% reliable. Jadi pilihan lo cuma **CP** atau **AP**.

### CP (Consistency + Partition Tolerance)

Sistem milih **data akurat** daripada **selalu tersedia**.

```
[User] ─→ [Node A] ─┐  (koneksi putus)
                     │
[User] ─→ [Node B] ─┘
```

Kalau koneksi antara Node A dan Node B putus:
- Node A: "Saya gak yakin data terbaru ada di B. Saya gak jawab dulu" → **reject request**
- Hasil: data akurat (consistent) tapi user mungkin gak dapet response

**Contoh CP:** Sistem perbankan. Kalau koneksi ATM ke server pusat putus, ATM gak kasih uang daripada saldo gak akurat.

### AP (Availability + Partition Tolerance)

Sistem milih **tetap jawab** daripada **data pasti akurat**.

```
[User] ─→ [Node A] ─┐
                     │
[User] ─→ [Node B] ─┘
```

Kalau koneksi antara A dan B putus:
- Node A: "Saya jawab pake data yang saya punya sekarang" → **tetap kasih response**
- Data mungkin beda dengan Node B (beda versi), nanti disinkronin belakangan (eventual consistency)

**Contoh AP:** Sosial media. Lo bisa liat postingan temen walau server lain belum update. Ntar juga sinkron.

### Diagram Ringkasan

```
            CONTOH NYATA:
            
              [CP]
          Bank / SQL Database
         Data HARUS akurat
         Kalau ragu, tolak aja
         
              [AP]
          Sosial Media / DNS
         Lebih penting serve user
         Sinkron nanti aja (eventual consistency)
         
              [CA]
          🚫 TIDAK MUNGKIN DI REAL DUNIA 🚫
         Kalau jaringan putus, lo gak bisa
         punya konsistensi + availability
```

### Kenapa Ini Penting Buat Lo?

Pas lo bikin API capstone:
- **Layanan transaksi** (top-up, beli): prioritize **CP** — jangan sampe saldo double
- **Layanan konten** (feed, komentar): prioritize **AP** — user gak peduli data real-time banget
- **Login session**: **AP** — lebih baik user bisa login walau data sesi belum sync

### Analogi Terakhir

**CP = Restoran prasmanan.** Makanan di meja harus sama dengan isi dapur. Kalau koki ragu ada bahan yang kurang, meja ditutup dulu. Aman, tapi kadang tutup.

**AP = Warung kopi pinggir jalan.** Kopi tetap dijual walau stok gula belum di-check. Mungkin gulanya abis, mungkin enggak. Yang penting ngopi dulu. Nanti di-check ulang.

---

## Ringkasan Cepat Buat Capstone

| Konsep | Yang Harus Dilakuin |
|--------|---------------------|
| **Monolitik** | Mulai pake monolitik dulu |
| **Normalisasi** | Jangan simpen data berulang — pake foreign key |
| **Indexing** | Index kolom email, username, foreign key |
| **N+1 Problem** | Pake `include` / `JOIN`, jangan loop query |
| **Caching** | Pake Redis (gratis pake Redis Cloud atau Docker) |
| **Rate Limiting** | Wajib di endpoint auth — cegah brute force |
| **CAP** | Transaksi prioritaskan akurasi, Feed prioritaskan ketersediaan |

---

> **Catatan:** Modul ini gak nge-cover semuanya. System design itu laut yang dalem. Tapi 7 konsep di atas udah cukup buat lo ngerjain capstone tanpa arsitekturnya jebol pas demo.

---
*Ditulis untuk siswa SMK RPL — fokus ke praktik, minimal teori akademik yang gak penting.*
