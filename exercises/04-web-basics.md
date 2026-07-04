# 🏋️ Latihan Web Basics (HTML/CSS/JS)

## Level 1: Dasar

### 1. HTML Semantic + Flexbox Layout

Bikin HTML layout berikut pake tag semantic (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`) dan CSS Flexbox:

```
+--------------------------------------------------+
| HEADER                                           |
| [Home] [Tentang] [Kontak]                        |
+--------------------------------------------------+
| HERO SECTION                                     |
| Judul besar + subjudul + tombol CTA              |
+--------------------------------------------------+
| FITUR SECTION (3 kolom — Flexbox)                |
| [Fitur 1]  [Fitur 2]  [Fitur 3]                 |
+--------------------------------------------------+
| FOOTER                                           |
| © 2025 — Hak Cipta Dilindungi                    |
+--------------------------------------------------+
```

**Requirements:**
- `<header>` berisi logo (text) + `<nav>` dengan 3 link
- `<main>` berisi `<section id="hero">` dan `<section id="features">`
- Fitur section pake Flexbox — 3 kolom rata tengah
- `<footer>` dengan copyright

**Kriteria:**
- HTML semantic valid
- Flexbox wrapping proper kalo layar kecil
- Gap antar kolom fitur 16px

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Landing Page</title>
  <style>
    /* === KODE CSS LO DISINI === */
    /* Reset, Flexbox layout, styling */
  </style>
</head>
<body>
  <!-- === KODE HTML LO DISINI === -->
</body>
</html>
```

**Expected output:**
- Layout rapi di layar desktop (≥768px)
- Fitur 3 kolom jadi 1 kolom di mobile (< 480px)

### 2. CSS Grid — Card Gallery

Bikin galeri kartu pake **CSS Grid** — 4 kolom di desktop, 2 di tablet, 1 di mobile.

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Card Gallery</title>
  <style>
    .gallery {
      /* === KODE CSS LO DISINI === */
      /* Grid dengan 4 kolom, gap 20px */
    }

    .card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      text-align: center;
    }

    .card img {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
    }

    /* === MEDIA QUERIES LO DISINI === */
    /* Tablet: 2 kolom */
    /* Mobile: 1 kolom */
  </style>
</head>
<body>
  <div class="gallery">
    <div class="card">
      <img src="https://picsum.photos/80?1" alt="Avatar">
      <h3>Budi</h3>
      <p>Frontend Dev</p>
    </div>
    <!-- 7 more cards... total 8 cards -->
  </div>
</body>
</html>
```

**Expected:** 8 kartu → baris 1: 4 kartu, baris 2: 4 kartu (desktop). Tablet: 2 kolom × 4 baris. Mobile: 1 kolom × 8 baris.

### 3. Tailwind Utility — Formulir Daftar

Bikin form registrasi pake **Tailwind CDN**. Tanpa CSS manual — cuma utility classes.

**Components:**
- Judul "Daftar Akun Baru" (text-2xl, font-bold, centered)
- Input: Nama lengkap (text field)
- Input: Email (email type)
- Select: Jenis kelamin (Laki-laki / Perempuan)
- Checkbox: Setuju syarat & ketentuan
- Tombol submit: biru (bg-blue-500, hover:bg-blue-600, text-white, rounded)
- Container card putih pake shadow, max-w-md, mx-auto

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daftar</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen flex items-center justify-center">
  <!-- === KODE LO DISINI === -->
  <!-- Bikin form dengan Tailwind utility classes aja -->
</body>
</html>
```

**Expected:** Form centering vertikal + horizontal, responsive, hover state di tombol.

## Level 2: Intermediate

### 4. Dark Mode Toggle (Tailwind)

Bikin halaman yang punya tombol toggle dark mode. Pake Tailwind `dark:` variant.

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dark Mode Demo</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
    }
  </script>
</head>
<body>
  <div class="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-8 transition-colors">
    <div class="max-w-2xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-2xl font-bold">Dashboard</h1>
        <!-- === KODE TOMBOL TOGGLE LO DISINI === -->
        <!-- Tombol yang toggle class 'dark' di <html> -->
      </div>

      <!-- 3 card sample -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 shadow">
          <h3 class="font-semibold">Total User</h3>
          <p class="text-3xl font-bold">1,234</p>
        </div>
        <div class="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 shadow">
          <h3 class="font-semibold">Pendapatan</h3>
          <p class="text-3xl font-bold">Rp 12,5jt</p>
        </div>
        <div class="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 shadow">
          <h3 class="font-semibold">Aktif Hari Ini</h3>
          <p class="text-3xl font-bold">567</p>
        </div>
      </div>
    </div>
  </div>

  <script>
    // === KODE JS TOGGLE LO DISINI ===
    // Ambil tombol, toggle class 'dark' di document.documentElement
    // Simpen preferensi ke localStorage
    // Cek localStorage pas load
  </script>
</body>
</html>
```

**Expected:**
- Klik toggle → dark mode aktif (bg dark, text putih, card bg-gray-800)
- Klik lagi → balik light
- Refresh halaman — mode tetep sesuai pilihan terakhir (pakai localStorage)

### 5. DOM Manipulation — Todo List

Bikin todo list sederhana pake DOM manipulation (no framework):

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Todo List</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 500px; margin: 40px auto; padding: 0 16px; }
    .todo-item { display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid #eee; }
    .todo-item.done .todo-text { text-decoration: line-through; color: #999; }
    input[type="text"] { flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 6px; }
    button { padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; }
    button:hover { background: #2563eb; }
    .delete-btn { background: #ef4444; padding: 4px 10px; font-size: 12px; }
    .delete-btn:hover { background: #dc2626; }
  </style>
</head>
<body>
  <h1>📋 Todo List</h1>

  <div style="display:flex; gap:8px; margin-bottom:16px;">
    <input type="text" id="todoInput" placeholder="Tambah tugas...">
    <button id="addBtn">Tambah</button>
  </div>

  <div id="todoList">
    <!-- Todo items akan muncul di sini -->
  </div>

  <script>
    // === KODE JS LO DISINI ===
    // 1. Ambil referensi: input, button, todoList container
    // 2. Fungsi addTodo():
    //    - Bikin div.todo-item
    //    - Checkbox + span.todo-text + tombol hapus
    //    - Append ke todoList
    // 3. Klik checkbox → toggle class "done"
    // 4. Klik tombol hapus → remove item
    // 5. Enter key di input → trigger add
    // 6. Kosongin input setelah add
  </script>
</body>
</html>
```

**Expected behavior:**
- Ketik "Belajar JavaScript" + klik Tambah → muncul item
- Centang checkbox → text tercoret (class done)
- Klik "Hapus" → item ilang
- Enter di input → tambah todo (sama kaya klik tombol)
- Input kosong → alert "Tugas tidak boleh kosong"

### 6. Fetch API — Tampilkan Data Pengguna

Ambil data dari JSONPlaceholder dan tampilin di halaman:

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>User Dashboard</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 16px; }
    .user-card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-bottom: 12px; }
    .user-card h3 { margin: 0 0 4px 0; }
    .user-card p { margin: 2px 0; color: #6b7280; font-size: 14px; }
    #loading, #error { text-align: center; padding: 20px; font-size: 18px; }
    #error { color: #ef4444; display: none; }
    .hidden { display: none; }
  </style>
</head>
<body>
  <h1>👥 Daftar Pengguna</h1>

  <div id="loading">Memuat data...</div>
  <div id="error">Gagal memuat data. Coba lagi.</div>
  <div id="userContainer"></div>

  <button id="refreshBtn" style="margin-top:16px; padding:8px 16px; background:#3b82f6; color:white; border:none; border-radius:6px; cursor:pointer;">
    🔄 Refresh
  </button>

  <script>
    const API_URL = "https://jsonplaceholder.typicode.com/users";

    // === KODE JS LO DISINI ===
    // 1. Fungsi fetchUsers():
    //    - Tampilin #loading, sembunyiin #error dan #userContainer
    //    - Fetch dari API_URL
    //    - Kalo sukses: render tiap user pake .user-card (name, email, phone, company.name)
    //    - Kalo gagal: tampilin #error
    //    - Sembunyiin #loading setelah selesai
    // 2. Panggil fetchUsers() pas halaman load
    // 3. Klik #refreshBtn → panggil fetchUsers() lagi
  </script>
</body>
</html>
```

**Expected:**
- Pas load: muncul "Memuat data..." → hilang, ganti daftar 10 user
- Each user card: Nama besar, email, telepon, nama perusahaan
- Klik Refresh → loading muncul lagi, data refresh
- Kalo fetch gagal (matiin internet) → error muncul

## Level 3: Challenge

### 7. Fetch + DOM — Aplikasi Cuaca Sederhana

Bikin app cuaca yang fetch dari OpenWeatherMap API (atau mock data) — tampilkan kota, suhu, deskripsi, icon:

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aplikasi Cuaca</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-blue-400 to-purple-500 min-h-screen flex items-center justify-center p-4">
  <div class="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8 w-full max-w-md">
    <h1 class="text-2xl font-bold text-center mb-6">🌤️ Cek Cuaca</h1>

    <div class="flex gap-2 mb-6">
      <input type="text" id="cityInput" placeholder="Nama kota..."
        class="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400">
      <button id="searchBtn" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition">
        Cari
      </button>
    </div>

    <div id="weatherResult" class="hidden text-center">
      <h2 id="cityName" class="text-xl font-semibold"></h2>
      <div class="text-6xl my-4" id="weatherIcon">☀️</div>
      <p id="temperature" class="text-4xl font-bold"></p>
      <p id="description" class="text-gray-600 capitalize"></p>
      <div class="flex justify-around mt-4 text-sm text-gray-500">
        <div>💧 <span id="humidity"></span></div>
        <div>💨 <span id="windSpeed"></span></div>
      </div>
    </div>

    <div id="loading" class="hidden text-center py-8">
      <div class="animate-spin text-4xl">⏳</div>
      <p class="mt-2 text-gray-500">Mencari cuaca...</p>
    </div>

    <div id="error" class="hidden text-center py-8 text-red-500">
      ❌ Kota tidak ditemukan. Coba lagi.
    </div>
  </div>

  <script>
    // === KODE JS LO DISINI ===
    // Pake mock data aja kalo gak punya API key:
    // const mockWeather = {
    //   name: "Jakarta",
    //   main: { temp: 32, humidity: 78 },
    //   weather: [{ description: "cerah berawan", icon: "04d" }],
    //   wind: { speed: 5.2 }
    // };

    // 1. Simulasi async fetch (setTimeout 1 detik)
    // 2. Render data ke element yang sesuai
    // 3. Loading state
    // 4. Error handling (kota valid: Jakarta, Surabaya, Bandung. Selain itu error)
    // 5. Event listener: tombol cari + enter key
  </script>
</body>
</html>
```

**Expected:**
- Ketik "Jakarta" + Enter/Cari → loading → tampil suhu 32°C, cerah berawan
- Ketik kota yang gak ada → error "Kota tidak ditemukan"
- Loading spinner selama 1 detik (simulasi)
- Responsive di mobile

### 8. Mini Project: Gallery Image Search

Gabungin Fetch API + DOM manipulation + Tailwind. Bikin search gambar dari Unsplash API (atau mock):

**Fitur:**
- Input search + tombol
- Fetch dari Unsplash API (atau mock data 20 gambar dari picsum.photos)
- Tampilin hasil dalam grid (Tailwind grid-cols-1 md:grid-cols-3 lg:grid-cols-4)
- Masing-masing gambar: img thumbnail + nama fotografer
- Loading skeleton (bukan cuma "Loading...") — tampilin placeholder abu-abu animate-pulse
- Kalo hasil kosong: "Tidak ada hasil untuk '[search]'"
- Debounce search: request dikirim 500ms setelah user selesai ngetik (bukan tiap huruf)

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gallery Search</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen p-6">
  <div class="max-w-6xl mx-auto">
    <h1 class="text-3xl font-bold mb-2">🔍 Gallery Search</h1>
    <p class="text-gray-500 mb-6">Cari gambar favoritmu</p>

    <input type="text" id="searchInput" placeholder="Cari gambar..."
      class="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-8">

    <div id="resultContainer" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <!-- Hasil akan dirender di sini -->
    </div>

    <div id="emptyState" class="hidden text-center py-16 text-gray-400">
      <div class="text-6xl mb-4">🖼️</div>
      <p class="text-xl">Cari sesuatu...</p>
    </div>
  </div>

  <script>
    // === KODE JS LO DISINI ===
    // 1. Mock data: array 20 gambar dari picsum.photos
    // 2. Fungsi renderGallery(items)
    //    - items kosong → show emptyState
    //    - ada → render grid dengan tailwind classes
    // 3. Loading skeleton:
    //    - grid placeholder abu-abu (bg-gray-200 animate-pulse) 8 item
    // 4. Debounce search:
    //    - setTimeout 500ms setelah user stop ngetik
    //    - clearTimeout kalo user ngetik lagi
    // 5. Filter mock data berdasarkan search query (cocokin nama file atau tag)
    // 6. Click gambar → modal besar (opsional challenge)
  </script>
</body>
</html>
```

**Expected:**
- Input search → loading skeleton 8 placeholder → hasil gambar muncul
- Ketik "nature" → filter gambar yang cocok
- Kalo gak cocok → empty state "Tidak ada hasil"
- Loading skeleton pake `animate-pulse bg-gray-200` (bukan text biasa)
