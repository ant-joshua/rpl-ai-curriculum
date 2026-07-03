# 00. Fundamental Pemrograman & Web

> **Level:** 🌱 Beginner (sebelum mulai coding)  
> **Jam:** 4 (2 sesi)  
> **Prasyarat:** — (bisa komputer)  
> **Output:** Paham gambaran besar — API, frontend, backend, database, gimana internet bekerja

---

## 📋 Sesi 1: Gimana Internet & Web Bekerja

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

---

## 📋 Sesi 2: API, Database, Deployment

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
Module 2: DSA            (Bikin algoritma efisien)
Module 3: TypeScript     (Bikin kode lebih aman)
Module 4: Web Basics     (Bikin Frontend — yang dilihat user)
Module 5: Git & Deploy   (Bikin kode aman + online)
Module 6: Node/Express   (Bikin Backend — API + server logic)
Module 7: Mastra AI      (Bikin AI Agent)
Module 8-9: Project     (Gabungin semua)
```

---

## 📝 Latihan

1. **Analisa Website:**
   Buka https://github.com. Coba tebak:
   - Mana yang Frontend? (yang lo lihat: warna, tombol, layout)
   - Kira-kira API endpoint apa aja yang dipake pas lo login?
   - Data apa aja yang disimpen di database?

2. **HTTP Method Quiz:**
   - Upload foto IG pake method apa? → POST
   - Liat story temen pake method apa? → GET
   - Edit bio pake method apa? → PUT/PATCH

3. **Client-Server:**
   Gambar flowchart sederhana: lo buka tokopedia → cari "sepatu" → liat hasil. Tandain mana client, server, database, API.
