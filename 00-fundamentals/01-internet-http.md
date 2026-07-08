<img src="https://images.pexels.com/photos/270360/pexels-photo-270360.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=1" alt="Internet" style="width:100%;border-radius:12px;margin:12px 0;">

# 🌐 Sesi 1: Gimana Internet & HTTP Bekerja

> 🎯 **Tujuan:** Paham client-server, HTTP, URL, frontend vs backend, DNS & hosting — fondasi sebelum coding.

---

## 📡 Client-Server: Otak Internet

Internet itu sebenernya cuma dua pihak yang ngobrol:

```
┌─ LO (Client) ─┐          ┌─── Server ────┐
│ Browser/HP lo │  ── minta ──>  │ Komputer jauh  │
│               │  <── balik ──  │ di AWS/Biznet  │
└───────────────┘               └────────────────┘
```

**Client** = yang minta. Bisa browser, HP, aplikasi chat, game online.  
**Server** = yang ngasih. Komputer di tempat lain yang nyimpen data & logic.

### 🍕 Analogi: Kayak Lo Makan di Restoran

| Komponen Internet | Analogi Restoran |
|------------------|------------------|
| Client (browser lo) | Lo sebagai pelanggan |
| Request (minta data) | Lo panggil pelayan, pesan pizza |
| Server (komputer jauh) | Dapur + koki yang masak |
| Response (data balik) | Pizza yang diantar ke meja lo |
| Database | Kulkas tempat nyimpen bahan makanan |

Lo ga perlu tau gimana koki masak pizza — lo cuma pesan, dapet, makan. Sama persis kaya browser: lo klik, server kerja, data balik.

### 🔍 Contoh Nyata: Buka Instagram

Coba lo buka ig di HP. Yang sebenernya terjadi:

1. HP lo (**client**) kirim **request** ke server Instagram
2. Server Instagram terima, ambil data feed dari **database**
3. Server balik **response** berisi HTML + CSS + JS + data postingan
4. Browser lo render jadi feed yang ke-scroll

```
HP lo ──GET /feed──> Server IG ──query──> Database
HP lo <──JSON feed── Server IG <──data─── Database
```

---

## 🔗 URL: Alamat di Internet

URL (**Uniform Resource Locator**) = alamat rumah di internet. Setiap halaman punya URL unik.

### Anatomi URL

```
https://www.tokopedia.com/search?q=sepatu&min=50000
│_____│ │___________│ │______│ │________________│
protocol    domain       path       query string
```

| Bagian | Fungsi | Contoh Lain |
|--------|--------|-------------|
| **Protocol** | Aturan komunikasi | `https://`, `http://`, `ftp://` |
| **Domain** | Nama situs (gampang diingat) | `google.com`, `github.com` |
| **Path** | Halaman spesifik | `/search`, `/product/123`, `/login` |
| **Query String** | Parameter tambahan (`?key=value`) | `?q=sepatu&page=2` |

### IP Address vs Domain

Komputer pake angka IP (`104.16.132.229`), manusia pake nama (`youtube.com`).  
**DNS** (Domain Name System) = buku telepon internet. Lo ketik `youtube.com`, DNS nerjemahin ke IP.

```bash
# Coba di terminal lo:
nslookup google.com
# Hasil: 216.58.210.142 (google punya IP ini)
```

---

## 🌊 HTTP: Bahasa Internet

HTTP (**HyperText Transfer Protocol**) = bahasa yang dipake client & server buat komunikasi.

### Request-Response Cycle

Setiap kali lo browsing, terjadi siklus ini dalam milidetik:

```
┌────── 1. User klik link ──────┐
│                                │
▼                                │
Browser ── HTTP Request ────> Server
Browser <── HTTP Response ──── Server
│
▼
└── 2. Browser render halaman ──┘
```

**Request** berisi: metode (GET/POST), URL, headers, kadang body data.  
**Response** berisi: status code, headers, body (HTML/JSON/gambar).

### HTTP Methods: Cara Minta Data

| Method | Arti Indonesia | Contoh Nyata |
|--------|----------------|--------------|
| **GET** | **Ambil** data | Buka feed IG, liat story, search Google |
| **POST** | **Kirim** data baru | Upload foto, bikin tweet, daftar akun |
| **PUT/PATCH** | **Ubah** data yang udah ada | Edit caption, ganti foto profil |
| **DELETE** | **Hapus** data | Hapus postingan, unfriend seseorang |

> 🔑 **Tips inget:** GET = liat-liat (read-only). POST = nambahin. PUT/PATCH = ubah. DELETE = buang.

### HTTP Status Codes: Bahasa Tubuh Server

Server selalu balik kode 3 digit. Lo pasti pernah liat beberapa:

| Kode | Arti | Artinya buat lo |
|------|------|-----------------|
| **200 OK** | ✅ Berhasil | Mantap, request lo aman |
| **201 Created** | ✅ Berhasil dibuat | Biasanya abis POST berhasil |
| **301 Moved** | 🔀 Pindah alamat | URL udah ganti, diarahin otomatis |
| **400 Bad Request** | ❌ Request lo salah | Cek input form, mungkin ada yang kurang |
| **401 Unauthorized** | 🔒 Belum login | Lo harus login dulu |
| **403 Forbidden** | 🚫 Ga punya akses | Bukan punya lo, ga bisa liat |
| **404 Not Found** | ❓ Ga ketemu | Halaman/URL salah |
| **500 Internal Server Error** | 💥 Server error | Bukan salah lo, server lagi bermasalah |
| **502 Bad Gateway** | 🌩️ Gateway error | Server penerima dapat jawaban ga valid |

### Contoh Request-Response Beneran

Waktu lo buka ini:
```
https://api.github.com/users/midory
```

Lo ngirim:
```
GET /users/midory HTTP/1.1
Host: api.github.com
Accept: application/json
```

Server balik:
```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "login": "midory",
  "public_repos": 12,
  "followers": 34
}
```

---

## 🎨 Frontend vs Backend

Semua yang lo liat di browser adalah kerjaan **Frontend**. Yang ga keliatan di server adalah **Backend**.

```
┌────────  FRONTEND  ────────┐    ┌────────  BACKEND  ────────┐
│ Apa yang user lihat & sentuh│    │ Apa yang user ga liat     │
│                             │    │                            │
│  ● Warna, tombol, layout    │    │  ● Logic & perhitungan     │
│  ● Animasi & transisi       │    │  ● Database & penyimpanan  │
│  ● Form input               │    │  ● Auth & keamanan         │
│  ● Responsive design        │    │  ● API & integrasi         │
│                             │    │                            │
│  Teknologi: HTML, CSS, JS   │    │  Teknologi: Node.js,       │
│  React, Tailwind, Next.js   │    │  Express, PostgreSQL, Go   │
└─────────────────────────────┘    └────────────────────────────┘
```

### Cara Kerja Gabungan (Contoh Instagram)

| Yang lo liat (Frontend) | Yang terjadi di belakang (Backend) |
|------------------------|------------------------------------|
| Feed scrolling | Server ambil postingan dari database |
| Tombol ❤️ jadi merah | Server update kolom `likes_count` |
| Kolom komentar | Server simpen komentar di tabel `comments` |
| Dark mode | Cuma CSS berubah, ga ada request ke server |

---

## 🌍 DNS & Hosting: Biar Website Online

**DNS** = buku telepon — ubah nama domain (`tokopedia.com`) jadi IP (`103.10.xx.xx`).

**Hosting** = tempat nyewa "rumah" buat server lo.

| Layanan | Buat Apa | Biaya |
|---------|----------|-------|
| **Netlify / Vercel** | Hosting frontend (HTML statis) | Gratis |
| **Railway / Render** | Hosting backend (API + server) | Gratis - bayar |
| **VPS (Biznet / DigitalOcean)** | Full control, production | ~100-300rb/bulan |
| **AWS / Google Cloud** | Enterprise scale | Bayar pemakaian |

### Flow Website dari Awal Sampe Ke Lo

```
┌─ Lo ketik "ig.id" ──> DNS cari IP ──> Server Instagram
                                           │
┌─ Lo liat feed <── Browser render <── HTML/CSS/JS + Data
```

---

## 🏋️ Latihan

### ✏️ Latihan 1: Analisa Website Beneran

Buka **https://github.com** di browser lo. Jawab pertanyaan ini:

1. **Frontend:** Sebutin 5 elemen yang lo lihat (warna, tombol, gambar, teks, icon)
2. **Backend:** Kira-kira, data apa aja yang disimpen di database GitHub pas user daftar?
3. **HTTP Methods:** Pas lo login, method apa yang dipake? Pas lo search repo? Pas lo edit profile?
4. **URL Anatomy:** Ambil URL halaman GitHub yang lagi lo buka. Breakdown: protocol, domain, path, query string-nya apa?

### ✏️ Latihan 2: Tebak HTTP Status Code

Cocokkin situasi dengan status code yang tepat:

| Situasi | Status Code? |
|---------|-------------|
| Lo buka `instagram.com/eko` padahal akun eko ga ada | ? |
| Lo upload foto ke IG, berhasil | ? |
| Lo coba akses dashboard admin tanpa login | ? |
| Server IG tiba-tiba mati | ? |
| Lo search produk di Tokopedia dapet hasil | ? |

> **Kunci jawaban:** 1) 404, 2) 201, 3) 401, 4) 500, 5) 200

### ✏️ Latihan 3: Flowchart Client-Server

Gambar (di kertas / draw.io / mermaid) flowchart ini:

```
Lo buka tokopedia.com → cari "sepatu running" → liat hasil → klik produk → liat detail
```

Tandain:
- 🔵 Warna biru buat **Client** (browser lo)
- 🟢 Warna hijau buat **Server** (komputer Tokopedia)
- 🟡 Warna kuning buat **Database**
- 🔴 Warna merah buat **API**

### ✏️ Latihan 4: Request-Response Roleplay

Bayangin lo jadi server. Ada client minta:

1. Lo denger request: `GET /api/music?genre=pop` — apa yang lo lakuin?
   - Jawab: Ambil data lagu pop dari database, balikin JSON 200
2. Lo denger: `POST /api/login` dengan body `{password: "123"}` tapi password salah — apa yang lo balikin?
   - Jawab: 401 Unauthorized
3. Lo denger: `DELETE /api/post/999` tapi post 999 ga ada — apa yang lo balikin?
   - Jawab: 404 Not Found

---

## 📚 Ringkasan Sesi 1

| Konsep | Intinya |
|--------|---------|
| **Client-Server** | Yang minta (client) vs yang ngasih (server) |
| **URL** | Alamat website = protocol + domain + path + query |
| **DNS** | Buku telepon yang ubah domain jadi IP |
| **HTTP** | Bahasa komunikasi client-server |
| **HTTP Methods** | GET (ambil), POST (buat), PUT (ubah), DELETE (hapus) |
| **Status Code** | Kode respon server: 200 OK, 404 Not Found, 500 Error |
| **Frontend** | Yang user liat (browser) |
| **Backend** | Yang user ga liat (server) |

> **🚀 Lanjut ke Sesi 2:** [Apa itu API, Database & Deployment](02-api-database-deploy.md)

---

*Module 00 · RPL AI Curriculum*
