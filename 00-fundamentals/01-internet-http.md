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

## 🌐 Browser DevTools — Toolkit Developer

Setiap browser modern punya **DevTools** — alat debugging yang wajib dikuasai developer.

### Cara Buka DevTools

| Browser | Shortcut |
|---------|----------|
| Chrome / Edge | `F12` atau `Ctrl+Shift+I` |
| Firefox | `F12` atau `Ctrl+Shift+I` |
| Safari | `Cmd+Option+I` (aktifkan di Preferences > Advanced dulu) |

### Tab Penting DevTools

| Tab | Fungsi | Kapan Dipake |
|-----|--------|-------------|
| **Elements** | Lihat & edit HTML/CSS langsung | Debug layout, ganti styling sementara |
| **Console** | Log JavaScript, error, testing | `console.log()`, liat error, coba kode |
| **Network** | Pantau request/response API | Debug fetch error, cek response API |
| **Sources** | Debug JavaScript step-by-step | Pasang breakpoint, trace alur kode |
| **Application** | Local storage, cookies, session | Cek data yang disimpan browser |

### Elements Tab

Bisa **edit HTML dan CSS langsung** di browser — perubahan cuma sementara (ga ngaruh ke file asli).

```html
<!-- Klik kanan elemen → Inspect → Double click text untuk edit -->
<div class="card">
  <h1>Judul</h1>  <!-- Klik, ketik ulang → liat perubahan langsung -->
</div>
```

Bisa juga:
- Cek CSS box model (padding, margin, border)
- Matiin/style sementara (centang mati di tab Styles)
- Copy selector buat CSS

### Console Tab

Tempat nulis dan liat output JavaScript langsung:

```javascript
console.log('Hello World');        // Output teks
console.error('Ada error!');       // Output error merah
console.warn('Peringatan!');       // Output kuning
console.table([{name: 'Budi'}]);   // Tabel rapi
console.time('label');             // Hitung durasi eksekusi

// Coba di console DevTools:
// 1. Ketik location.href → liat URL sekarang
// 2. Ketik document.title → judul halaman
// 3. Ketik 2 + 2 → langsung dihitung
```

> **Tips:** Console juga bisa akses variable JavaScript yang ada di halaman. Coba buka web manapun, ketik `document.querySelector('h1')` — liat hasilnya.

---

## 🍪 Cookie, localStorage, dan sessionStorage

Browser punya 3 tempat nyimpen data di sisi client. Masing-masing beda kegunaan.

### localStorage — Data Tahan Lama

Data **gak expired** — bertahan sampai dihapus manual atau clear browser.

```javascript
// Simpan
localStorage.setItem('theme', 'dark');
localStorage.setItem('user', JSON.stringify({ name: 'Budi', id: 1 }));

// Ambil
const theme = localStorage.getItem('theme');  // 'dark'
const user = JSON.parse(localStorage.getItem('user')); // { name: 'Budi', id: 1 }

// Hapus satu item
localStorage.removeItem('theme');

// Hapus semua
localStorage.clear();
```

**Cocok buat:** preferensi user (theme, bahasa), data yang gak sensitif.

### sessionStorage — Data Sementara

Data **ilang pas tab ditutup**. Sama persis kaya localStorage, cuma beda umur.

```javascript
sessionStorage.setItem('tempData', 'Halo');
sessionStorage.getItem('tempData'); // 'Halo' — ilang kalo tab ditutup
```

**Cocok buat:** data sementara (isi form yang belum disubmit, state halaman).

### Cookie — Data Dikirim ke Server

Cookie otomatis dikirim ke server tiap request HTTP. Kapasitas: **4KB max**.

```javascript
// Baca cookie — format string: "key=value; key2=value2"
console.log(document.cookie);
// Output: "session_id=abc123; theme=dark"

// Set cookie — pake assign
document.cookie = "theme=dark; path=/; max-age=3600";
// max-age = detik cookie bertahan (3600 = 1 jam)
// path = halaman yang bisa akses cookie ini

// Hapus cookie — set max-age = 0
document.cookie = "theme=; path=/; max-age=0";
```

### Perbandingan

| Aspek | localStorage | sessionStorage | Cookie |
|-------|-------------|----------------|--------|
| Kapasitas | ~5-10MB | ~5-10MB | ~4KB |
| Expired | Manual | Tab ditutup | Bisa di-set (max-age) |
| Dikirim ke server? | ❌ | ❌ | ✅ Otomatis tiap request |
| Akses | Client JS | Client JS | Server + Client |
| Persist | ✅ | ❌ | ✅ |

> **Aturan keamanan:** Jangan simpan token JWT / password di localStorage! Pake httpOnly cookie biar ga bisa diakses JavaScript (XSS protection).

---

## 🌐 Network Tab — Debug API & Loading

Network tab di DevTools nunjukin **semua request yang dibuat browser**: HTML, CSS, JS, gambar, API.

### Cara Pake

1. Buka DevTools → Tab **Network**
2. Reload halaman (F5) — liat semua request muncul
3. Klik salah satu request → liat detail

### Kolom Penting

| Kolom | Arti |
|-------|------|
| **Name** | File/endpoint yang diminta |
| **Status** | HTTP status code (200, 404, 500, dll) |
| **Type** | Jenis file (document, script, fetch, img) |
| **Size** | Ukuran file + waktu download |
| **Time** | Total waktu request |
| **Waterfall** | Timeline visual — liat mana yang lambat |

### Filter Request

```
- Klik Fetch/XHR → liat cuma API calls
- Klik Img → liat cuma gambar
- Klik JS → liat cuma file JavaScript
- Search bar → cari URL tertentu
```

### Baca Detail Request

Klik satu request → 3 tab penting:

**Headers:**
```
General:
  Request URL: https://api.example.com/users
  Request Method: GET
  Status Code: 200 OK

Response Headers:
  content-type: application/json
  cache-control: public, max-age=3600

Request Headers:
  authorization: Bearer xxx
  accept: application/json
```

**Response:** — Isi data yang balik dari server (JSON / HTML / gambar).

**Timing:** — Breakdown waktu: DNS lookup, TCP handshake, TLS, request send, waiting (TTFB), content download.

### Latihan Network Tab

```markdown
Buka google.com di Chrome:
1. Buka DevTools → Network tab
2. Reload halaman
3. Cari request dengan type "document" — berapa status code-nya?
4. Cari 1 file gambar — berapa size-nya?
5. Klik request google.com → liat Response Headers → cari `cache-control`
6. Filter XHR/Fetch — ada ga request API?
7. Liat Waterfall — request mana yang paling lambat?
```

---

## 🖼️ Browser Rendering: Dari URL ke Pixel

Waktu lo buka web, browser ngelakuin banyak langkah sebelum pixel muncul di layar.

### Rendering Pipeline

```
HTML → DOM (Document Object Model)
                 ↓
CSS  → CSSOM (CSS Object Model)
                 ↓
          Render Tree (DOM + CSSOM)
                 ↓
            Layout (posisi & ukuran)
                 ↓
              Paint (warna, teks, gambar)
                 ↓
          Composition (layering)
```

### 1. DOM — Document Object Model

Browser parse HTML jadi **tree structure**. Setiap tag HTML jadi node di tree.

```html
<html>
  <body>
    <h1>Judul</h1>
    <p>Paragraf</p>
  </body>
</html>
```
↓ Parse
```
document
 └── html
       └── body
             ├── h1 → "Judul"
             └── p  → "Paragraf"
```

JavaScript bisa manipulasi DOM:
```javascript
document.querySelector('h1').textContent = 'Judul Baru';  // Ubah teks
document.querySelector('h1').style.color = 'red';          // Ubah style
document.body.innerHTML += '<p>Paragraf baru</p>';         // Tambah elemen
```

### 2. CSSOM — CSS Object Model

CSS juga di-parse jadi tree. Browser gabungin DOM + CSSOM jadi **Render Tree**.

### 3. Layout

Hitung posisi & ukuran tiap elemen. Browser jawab: "h1 lebarnya berapa? p-nya di mana? tombol di sebelah mana?"

### 4. Paint

Isi pixel: warna, teks, border, shadow. Browser gambar tiap layer.

### 5. Composite

Gabungin semua layer jadi satu gambar akhir di layar.

### Reflow vs Repaint

**Reflow:** Browser harus kalkulasi ulang layout. Mahal. Terjadi saat:
- Ubah lebar/tinggi elemen
- Tambah/hapus DOM
- Ubah font, resize window
- Ubah posisi (top, left, margin)

```javascript
// ❌ Trigger reflow — mahal
element.style.width = '200px';      // reflow
element.style.height = '200px';     // reflow lagi
element.style.marginLeft = '10px';  // reflow lagi

// ✅ Lebih efisien — satu reflow
element.style.cssText = 'width: 200px; height: 200px; margin-left: 10px';
// Atau pake class:
element.classList.add('card--expanded');
```

**Repaint:** Isi ulang pixel tanpa ubah layout. Lebih murah. Terjadi saat:
- Ubah warna background
- Ubah visibility (bukan display)
- Ubah outline

```javascript
// Trigger repaint (lebih murah dari reflow)
element.style.backgroundColor = 'blue';
element.style.visibility = 'hidden';
```

### Tips Performa Rendering

1. **Batch DOM changes** — jangan satu-satu
2. **Gunakan `requestAnimationFrame`** buat animasi — bukan `setTimeout`
3. **Hindari layout thrashing** — jangan baca lalu tulis DOM bergantian
4. **`will-change: transform`** — kasih tau browser elemen mana yang bakal berubah
5. **Virtual scrolling** buat list > 1000 item — jangan render semua

---

## 📥 Async Loading: defer vs async

File JavaScript blocking render. Browser harus download, parse, dan execute JavaScript dulu sebelum lanjut render. Solusinya: `defer` dan `async`.

### Normal (Blocking)

```html
<script src="app.js"></script>
```

Browser STOP render pas ketemu `<script>` → download & execute dulu → lanjut render. **Halaman keliatan kosong lebih lama.**

### defer — Download paralel, Execute setelah HTML selesai

```html
<script src="app.js" defer></script>
```

| Tahap | Kejadian |
|-------|----------|
| HTML parsing | ✅ Jalan (script di-download di background) |
| Script download | ✅ Paralel dengan parsing |
| Script execute | ❌ Nunggu HTML selesai di-parse |
| DOMContentLoaded | ✅ Fire setelah defer scripts jalan |

**Cocok buat:** script yang butuh DOM penuh (manipulasi elemen, event handler). **Paling recommended.**

### async — Download paralel, Execute langsung setelah siap

```html
<script src="analytics.js" async></script>
```

| Tahap | Kejadian |
|-------|----------|
| HTML parsing | ✅ Jalan (script di-download background) |
| Script download | ✅ Paralel |
| Script execute | ✅ Langsung setelah download selesai — **PAUSE parsing** |
| DOMContentLoaded | ❌ Gak nunggu async |

**Cocok buat:** script independen (analytics, ads, tracking) — gak perlu DOM, urutan execute gak penting.

### defer vs async Diagram

```
Normal:       |--- HTML ---| waiting |-- script exec --|--- HTML lagi ---|
defer:        |--- HTML ---|         |--- script exec --|
                    |-- download --|
async:        |--- HTML ---|--- script exec ---|---- HTML lagi ---|
                    |-- download --|
```

### Pilih yang Mana?

| Skenario | Pilih | Alasan |
|----------|-------|--------|
| Script utama app | **defer** | Butuh DOM penuh, urutan penting |
| Analytics Google | **async** | Independen, ga perlu nunggu |
| Library (React, Vue) | **defer** | Butuh DOM, harus jalan sebelum app script |
| Iklan / tracking pixel | **async** | Gak boleh ngeblok halaman |
| CSS / font | `rel="preload"` | Bukan async, tp preload lebih cocok |

---

## 🌍 CDN — Content Delivery Network

**CDN** (Content Delivery Network) = jaringan server global yang nyimpen salinan file statis (gambar, CSS, JS, video) di **banyak lokasi**.

### Cara Kerja CDN

```
                    ┌── Server CDN Asia (Tokyo)
User di Jakarta ────┼── Server CDN Asia (Singapore)  ← Yang terdekat
                    └── Server CDN Asia (Mumbai)

Tanpa CDN:
User ────request────> Server utama di Amerika → loading lambat

Dengan CDN:
User ────request────> Server CDN Jakarta → loading cepat
```

### Kenapa CDN Penting?

| Tanpa CDN | Dengan CDN |
|-----------|-----------|
| Server tunggal kewalahan | Beban tersebar ke banyak server |
| User di luar negeri loading lama | Selalu dapet server terdekat |
| Server down → website mati | Server lain ambil alih |
| Bandwidth server kena semua | CDN handle traffic statis |

### Contoh CDN Populer

| CDN | Buat Apa | Gratis? |
|-----|----------|---------|
| **Cloudflare** | Proxy DNS, CDN global, security | ✅ (free tier) |
| **cdnjs** | Library JS/CSS (jQuery, React) | ✅ Gratis |
| **jsDelivr** | npm packages via CDN | ✅ Gratis |
| **unpkg** | Semua package npm via CDN | ✅ Gratis |
| **Vercel Edge** | Next.js static assets | ✅ (free tier) |

### CDN untuk Library Frontend

Daripada download library, bisa pake CDN langsung:

```html
<!-- Pake CDN biar gak perlu download & lebih cepat -->
<script src="https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js"></script>

<!-- Bootstrap CSS via CDN -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3/dist/css/bootstrap.min.css" rel="stylesheet">

<!-- jQuery via CDN -->
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
```

### Integrasi CDN di Proyek Modern

Kalo pake build tool (Vite, Next.js), file statis di-deploy ke CDN otomatis:

```javascript
// next.config.js — pake CDN custom
module.exports = {
  assetPrefix: 'https://cdn.mydomain.com',
};
```

Klien-klien populer (Vercel, Netlify, Cloudflare Pages) otomatis pake CDN bawaan — developer gak perlu mikir.

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
   - Answer: 401 Unauthorized
3. Lo denger: `DELETE /api/post/999` tapi post 999 ga ada — apa yang lo balikin?
   - Answer: 404 Not Found

### ✏️ Latihan 5: localStorage & Cookie Explorer

Buka website favorit lo (Tokopedia, Instagram, atau GitHub). Buka DevTools → Application tab:

1. Cek **Local Storage** — data apa yang disimpan? Coba tebak fungsinya.
2. Cek **Session Storage** — apa bedanya dengan Local Storage?
3. Cek **Cookies** — berapa banyak cookie yang disimpan? Apa aja key-value-nya?
4. Coba set cookie baru dari Console: `document.cookie = "test=hello; path=/"`
5. Refresh halaman — apakah cookie masih ada?

### ✏️ Latihan 6: Network Tab Detective

1. Buka **google.com** dengan DevTools → Network tab terbuka
2. Reload halaman
3. Temukan:
   - Request HTML utama → Status code?
   - Paling tidak 3 file JavaScript → berapa ukuran masing-masing?
   - 1 file CSS → berapa waktu loading-nya?
4. Filter cuma XHR/Fetch requests — ada kah?
5. Klik request paling lambat di Waterfall — apa penyebabnya?

### ✏️ Latihan 7: Browser Rendering — Analisis Reflow

Buka halaman web sederhana (bisa file HTML lokal). Di Console DevTools, coba:

```javascript
// 1. Ukur waktu render
console.time('render');

// 2. Trigger reflow
for (let i = 0; i < 100; i++) {
  const div = document.createElement('div');
  div.style.width = Math.random() * 100 + 'px';
  div.style.height = '20px';
  div.style.backgroundColor = 'blue';
  document.body.appendChild(div);
}

console.timeEnd('render');

// 3. Bandingkan dengan batch update — pake DocumentFragment
console.time('batch');
const fragment = document.createDocumentFragment();
for (let i = 0; i < 100; i++) {
  const div = document.createElement('div');
  div.style.cssText = `width: ${Math.random() * 100}px; height: 20px; background: blue;`;
  fragment.appendChild(div);
}
document.body.appendChild(fragment);
console.timeEnd('batch');
```

Catat perbedaan waktu. Mana yang lebih cepat?

### ✏️ Latihan 8: defer vs async Simulation

Buat 3 file HTML:

1. `normal.html` — `<script src="heavy.js"></script>` (tanpa defer/async)
2. `defer.html` — `<script src="heavy.js" defer></script>`
3. `async.html` — `<script src="heavy.js" async></script>`

Buat `heavy.js` yang butuh waktu 3 detik (simulasi pake loop berat). Catat:
- Mana yang paling cepat nampilin teks di halaman?
- Buka DevTools → Network → liat Waterfall — beda timing-nya gimana?
- Tulis kesimpulan: kapan pake defer, kapan pake async?

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
