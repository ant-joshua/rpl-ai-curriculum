# 4.2 Tailwind CSS + Dark Mode + Custom Config + Deploy

## Setup Tailwind via CDN (Cara Cepat)

Paling gampang buat latihan — tinggal tambahin tag `<script>` di HTML.

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tailwind CDN</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 p-8">
  <div class="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-6">
    <h1 class="text-2xl font-bold text-gray-800">Halo Tailwind!</h1>
    <p class="mt-2 text-gray-600">Gak perlu nulis CSS manual.</p>
    <button class="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
      Klik Aku
    </button>
  </div>
</body>
</html>
```

### Alternatif Setup: Tailwind CLI (Build Production)

Buah project beneran pake Tailwind, CDN itu cuma buat prototyping. Untuk production, pake CLI biar file CSS-nya kecil (tree-shaking hanya includes class yang dipake):

```bash
# Inisialisasi project (butuh Node.js)
npm init -y
npm install -D tailwindcss
npx tailwindcss init
```

Di `tailwind.config.js`, set path file HTML:
```js
module.exports = {
  content: ['./**/*.html'],
  theme: { extend: {} },
  plugins: [],
}
```

Bikin file `style.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Build CSS:
```bash
npx tailwindcss -i style.css -o output.css --watch
```

**Screenshot:** Bayangkan file `output.css` yang dihasilkan — di awal project mungkin cuma 10KB (karena cuma includes class yang kalian pake), beda banget sama CDN yang selalu download 300KB+ penuh.

---

## Utility Classes Wajib

### Spacing (margin/padding)

| Class | Value |
|-------|-------|
| `p-4` | padding: 16px |
| `px-6` | padding-x: 24px |
| `py-2` | padding-y: 8px |
| `m-0` | margin: 0 |
| `mx-auto` | margin-x: auto |
| `mt-8` | margin-top: 32px |
| `gap-4` | gap: 16px |

**Skala spacing Tailwind:**
```
p-0  → 0px     p-1  → 4px    p-2 → 8px
p-3  → 12px    p-4  → 16px   p-5 → 20px
p-6  → 24px    p-8  → 32px   p-10 → 40px
p-12 → 48px    p-16 → 64px   p-20 → 80px
```
Pola ini konsisten di semua utility spacing (margin, padding, gap, dll). Hafalin skala 1-4-8-16-24-32.

### Flexbox & Grid

```html
<!-- Flexbox -->
<div class="flex items-center justify-between gap-4">
  <div class="flex-1">Item 1</div>
  <div>Item 2</div>
</div>

<!-- Grid -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
  <div class="bg-white p-4 rounded shadow">Card 1</div>
  <div class="bg-white p-4 rounded shadow">Card 2</div>
  <div class="bg-white p-4 rounded shadow">Card 3</div>
</div>
```

**Variasi flex wrapper yang sering dipake:**
```html
<!-- Centering sempurna -->
<div class="flex items-center justify-center h-64 bg-gray-100">
  <p class="text-gray-600">Konten di tengah</p>
</div>

<!-- Sticky footer layout -->
<div class="flex flex-col min-h-screen">
  <header class="bg-blue-500 text-white p-4">Header</header>
  <main class="flex-1 p-8">Konten utama — ambil sisa ruang</main>
  <footer class="bg-gray-800 text-white p-4">&copy; 2026</footer>
</div>

<!-- Card row sama tinggi -->
<div class="flex gap-4">
  <div class="flex-1 bg-white p-4 rounded shadow">Card pendek</div>
  <div class="flex-1 bg-white p-4 rounded shadow">Card dengan teks lebih panjang biar liat efeknya sama tinggi</div>
  <div class="flex-1 bg-white p-4 rounded shadow">Card 3</div>
</div>
```

### Typography

```html
<h1 class="text-3xl font-bold text-gray-900">Heading</h1>
<h2 class="text-2xl font-semibold text-gray-800">Subheading</h2>
<p class="text-base text-gray-600 leading-relaxed">
  Paragraf dengan line-height nyaman dibaca.
</p>
<span class="text-sm text-gray-400">Small text / caption</span>
```

**Skala ukuran font Tailwind:**
```
text-xs   → 12px    text-sm   → 14px
text-base → 16px    text-lg   → 18px
text-xl   → 20px    text-2xl  → 24px
text-3xl  → 30px    text-4xl  → 36px
text-5xl  → 48px    text-6xl  → 60px
```

### Background & Shadow

```html
<!-- Background colors umum -->
<div class="bg-white">Putih</div>
<div class="bg-gray-100">Abu-abu muda</div>
<div class="bg-blue-500">Biru</div>
<div class="bg-gradient-to-r from-blue-500 to-purple-600">Gradient</div>

<!-- Shadow -->
<div class="shadow-sm">Shadow kecil</div>
<div class="shadow-md">Shadow medium (standar card)</div>
<div class="shadow-lg">Shadow besar (modal/dropdown)</div>
<div class="shadow-xl">Shadow terbesar (popup)</div>
```

### Responsive Prefix

Prefix `sm:` `md:` `lg:` `xl:` dipake di depan utility class:

```html
<!-- Mobile: 1 kolom, Desktop: 3 kolom -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-4">

<!-- Mobile: text kecil, Desktop: text besar -->
<p class="text-sm md:text-lg lg:text-xl">Responsive text</p>

<!-- Mobile: hidden, Desktop: show -->
<div class="hidden md:block">Sidebar desktop</div>
```

**Breakpoint Tailwind:**

| Prefix | Min Width | Target |
|--------|-----------|--------|
| (none) | 0px | Mobile (default) |
| `sm:` | 640px | HP besar / landscape |
| `md:` | 768px | Tablet |
| `lg:` | 1024px | Desktop kecil |
| `xl:` | 1280px | Desktop lebar |
| `2xl:` | 1536px | Monitor besar |

### Hover, Focus & Active State

```html
<button class="bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-300 
               active:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
  Klik Saya
</button>

<!-- Link -->
<a href="#" class="text-blue-500 hover:text-blue-700 underline hover:no-underline">
  Baca selengkapnya
</a>

<!-- Card hover effect -->
<div class="bg-white p-6 rounded-lg shadow hover:shadow-lg hover:-translate-y-1 
            transition-all duration-300 cursor-pointer">
  Card dengan animasi hover
</div>
```

**Screenshot:** Bayangkan sebuah card yang waktu mouse di atasnya (hover), dia naik dikit (`-translate-y-1`) dan shadow-nya membesar (`shadow-lg`) — efek ini memberikan feedback visual ke user bahwa card itu interactive.

---

## Dark Mode

### 1. Aktifkan dark mode di config

Via CDN:

```html
<script>
  tailwind.config = {
    darkMode: 'class',  // pakai class strategy
  }
</script>
```

### 2. Toggle dark mode

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dark Mode</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = { darkMode: 'class' }
  </script>
</head>
<body class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen p-8 transition-colors">
  <div class="max-w-md mx-auto text-center">
    <h1 class="text-2xl font-bold mb-4">Dark Mode Demo</h1>
    <p class="mb-6 text-gray-600 dark:text-gray-400">Toggle untuk ganti tema.</p>

    <button id="toggleDark"
      class="bg-gray-800 dark:bg-white text-white dark:text-gray-800 px-6 py-2 rounded-lg font-medium">
      🌙 Toggle Dark Mode
    </button>

    <div class="mt-8 p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
      <p class="text-gray-700 dark:text-gray-300">Konten ini ikut tema.</p>
    </div>
  </div>

  <script>
    const btn = document.getElementById('toggleDark');
    btn.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
    });
  </script>
</body>
</html>
```

### Dark Mode Classes

```html
<!-- Background -->
<div class="bg-white dark:bg-gray-800">

<!-- Text -->
<p class="text-gray-900 dark:text-gray-100">

<!-- Border -->
<div class="border border-gray-200 dark:border-gray-700">

<!-- Card -->
<div class="bg-white dark:bg-gray-800 shadow dark:shadow-gray-900">
```

### Save Dark Mode Preference (localStorage)

Biar pilihan dark mode user gak ilang tiap reload halaman:

```html
<script>
  // Cek preferensi tersimpan
  if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (localStorage.getItem('theme') === 'light') {
    document.documentElement.classList.remove('dark');
  } else {
    // Fallback: cek preferensi sistem operasi
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  }

  // Toggle dengan simpan preferensi
  document.getElementById('toggleDark').addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });
</script>
```

**Praktik baik:** Kombinasikan localStorage + `prefers-color-scheme` untuk pengalaman mulus. User gak perlu toggle manual kalo device mereka udah di dark mode. Dan kalo mereka toggle, preferensi itu disimpen.

### Kesalahan Umum Dark Mode Tailwind

1. **Lupa `darkMode: 'class'` di config** — Tanpa ini, `dark:` prefix gak akan berfungsi. Tailwind defaultnya pake `media` strategy (ikut preferensi OS), bukan `class` strategy.

2. **Dark mode cuma di setengah halaman** — Kalo parent element gak punya class `dark`, child element dengan `dark:` prefix juga gak aktif. `dark` class harus di elemen yang merupakan ancestor dari semua elemen yang mau kena efek — biasanya di `<html>` atau `<body>`.

3. **Kontras kurang pas di dark mode** — Jangan cuma invert warna. Pilih warna yang nyaman: `gray-900` buat background, `gray-100` buat text utama, `gray-400` buat secondary text.

---

## Custom Config & Components

### Custom colors & fonts

```html
<script>
  tailwind.config = {
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          primary: '#3b82f6',
          secondary: '#8b5cf6',
          dark: {
            bg: '#0f172a',
            card: '#1e293b',
          }
        },
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
        }
      }
    }
  }
</script>
```

Setelah ini, lo bisa pake `bg-primary`, `text-secondary`, `bg-dark-bg`, dll.

### Bikin Komponen Sendiri (dengan @apply)

Buat file `style.css` kalo mau pake `@apply`:

```css
/* style.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn-primary {
    @apply bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors;
  }
  .card {
    @apply bg-white dark:bg-gray-800 rounded-xl shadow-md p-6;
  }
  .badge {
    @apply inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full;
  }
}
```

### Kenapa Pake @apply?

Manfaat utama `@apply`:

1. **Konsistensi** — Satu perubahan di `.btn-primary` otomatis ubah semua tombol. Gak perlu nyari satu-satu kelas Tailwind di semua file HTML.

2. **Kompleksitas rendah** — Daripada nulis `bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors` di 20 tempat, lo tulis `.btn-primary` aja.

3. **Transisi bertahap dari utility ke component** — Mulai prototyping pake HTML penuh dengan utility classes. Kalo udah stabil, refactor class berulang jadi component pake `@apply`.

**Tapi hati-hati:** Jangan `@apply` segala sesuatu. Kalo cuma 1-2 class, lebih baik pake inline utility aja. `@apply` berguna untuk kumpulan class yang muncul 3+ kali di project.

### Variasi Component Pattern

Pattern umum di Tailwind component library:

```css
@layer components {
  /* Button variants */
  .btn {
    @apply font-medium py-2 px-4 rounded-lg transition-colors inline-block text-center;
  }
  .btn-primary {
    @apply btn bg-blue-500 hover:bg-blue-600 text-white;
  }
  .btn-secondary {
    @apply btn bg-gray-200 hover:bg-gray-300 text-gray-800;
  }
  .btn-outline {
    @apply btn border-2 border-blue-500 text-blue-500 hover:bg-blue-50;
  }
  .btn-danger {
    @apply btn bg-red-500 hover:bg-red-600 text-white;
  }
  
  /* Card variants */
  .card {
    @apply bg-white dark:bg-gray-800 rounded-xl shadow-md p-6;
  }
  .card-hover {
    @apply card hover:shadow-lg hover:-translate-y-1 transition-all duration-300;
  }
  
  /* Badge variants */
  .badge {
    @apply inline-block text-xs font-medium px-2.5 py-0.5 rounded-full;
  }
  .badge-info    { @apply badge bg-blue-100 text-blue-800; }
  .badge-success { @apply badge bg-green-100 text-green-800; }
  .badge-warning { @apply badge bg-yellow-100 text-yellow-800; }
  .badge-danger  { @apply badge bg-red-100 text-red-800; }
  
  /* Alert variants */
  .alert {
    @apply p-4 rounded-lg border-l-4;
  }
  .alert-info    { @apply alert bg-blue-50 border-blue-500 text-blue-700; }
  .alert-success { @apply alert bg-green-50 border-green-500 text-green-700; }
  .alert-error   { @apply alert bg-red-50 border-red-500 text-red-700; }
}
```

### Form Styling Tailwind

Form dengan Tailwind gampang dan konsisten:

```html
<form class="max-w-md mx-auto space-y-4">
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
    <input type="text" 
           class="w-full px-3 py-2 border border-gray-300 rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  placeholder-gray-400"
           placeholder="Masukkan nama">
  </div>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
    <input type="email" 
           class="w-full px-3 py-2 border border-gray-300 rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  placeholder-gray-400"
           placeholder="nama@email.com">
  </div>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1">Pesan</label>
    <textarea rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                     placeholder-gray-400"
              placeholder="Tulis pesan..."></textarea>
  </div>
  <button type="submit"
          class="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition">
    Kirim Pesan
  </button>
</form>
```

**Screenshot:** Bayangkan form di atas — semua input punya border konsisten, kalo di-focus muncul ring biru (gunakan `focus:ring-2 focus:ring-blue-500`), placeholder-nya abu-abu muda. Ini tampilan profesional tanpa nulis CSS manual.

### Kesalahan Umum Tailwind

1. **Hafalin semua utility class** — Gak perlu! Lo gak akan hafal 500+ class Tailwind. Cukup hafal skema namanya: `{property}-{direction?}-{size}`. Contoh: `p` = padding, `px` = padding kiri+kanan, `mt` = margin-top. Size pake skala 1-4-8-16-24-32. Sisanya tinggal cek di [dokumentasi Tailwind](https://tailwindcss.com/docs).

2. **Campur Tailwind dengan CSS manual buat hal sederhana** — Kalo lo udah pake Tailwind, usahakan semuanya pake Tailwind class. Jangan nulis `style="margin-top: 20px;"` — ganti dengan `mt-5`. Konsistensi itu penting.

3. **Lupa responsive prefix** — `grid-cols-1` aja berarti 1 kolom di semua ukuran layar. Kalo mau 3 kolom di desktop tambah `md:grid-cols-3`. Default Tailwind itu mobile (single column), lo perlu prefix buat layar lebih besar.

4. **Terlalu banyak `@apply`** — `@apply` itu berguna, tapi kalo lo `@apply` kan semuanya, lo kehilangan manfaat utama Tailwind: konsistensi utility class yang bisa dibaca langsung di HTML. Aturan: `@apply` kalo lo punya 5+ class yang muncul di 3+ tempat.

5. **Gak pake `transition` buat hover/focus** — Efek hover tiba-tiba (instant) kelihatan kasar. Tambah `transition` atau `transition-all` biar perubahan smooth.

6. **`w-full` di dalam flex container salah** — Kalo item di dalam flex punya `w-full`, dia bisa overflow. Pake `flex-1` atau `min-w-0` untuk prevent overflow.

---

## Deploy ke Vercel

### Manual (drag & drop)

1. Buka [vercel.com](https://vercel.com)
2. Login pake GitHub/GitLab/Email
3. Klik **Add New → Project**
4. Import repo atau seret folder project ke Vercel
5. **Build Command:** kosongin (kalo HTML statis)
6. **Output Directory:** `.` (root)
7. Klik **Deploy**

### Via CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy dari folder project
vercel --prod

# Follow prompts — tinggal enter-enter
```

Project lo bakal live di `namaproject.vercel.app`.

### Alternatif Hosting Gratis Lainnya

Vercel bukan satu-satunya pilihan. Berikut alternatif dengan kelebihan masing-masing:

| Platform | Kelebihan | Cocok Untuk |
|----------|-----------|-------------|
| **Vercel** | Deploy termudah, auto HTTPS, CDN global | Landing page, SPA, Next.js |
| **Netlify** | Drag-drop, form handler built-in, redirects | Situs statis, portfolio |
| **GitHub Pages** | Gratis, langsung dari repo GitHub, no CLI | Dokumentasi, blog pake Jekyll |
| **Cloudflare Pages** | Cepat, 500GB bandwidth gratis, Edge Functions | Situs yang butuh performa tinggi |

Cara cepat deploy ke GitHub Pages:
```bash
# 1. Buat repo di GitHub dengan nama: username.github.io
# 2. Push file HTML lo ke branch main
# 3. Settings → Pages → Deploy from main branch /docs
# 4. Tunggu 1-2 menit, situs live di https://username.github.io
```

### Checklist Sebelum Deploy

Sebelum project lo live, periksa ini dulu:

1. **Semua link berfungsi** — Klik semua link internal. Gak ada yang broken.
2. **Responsive** — Tes di 3 ukuran layar: HP (320px), tablet (768px), desktop (1024px+). Chrome DevTools (F12 → toggle device toolbar).
3. **Loading time** — Cek ukuran gambar. Kompres kalo perlu. Pake format WebP.
4. **CSS/JS files** — Kalo pake file eksternal, pastiin path-nya bener (relatif, bukan absolute).
5. **Meta tags** — `title`, `description`, `viewport` udah ada semua.
6. **404 page** — Kalo ada halaman yang gak ditemukan, tampilin custom 404 (bisa diatur di Vercel/Netlify).
7. **Dark mode berfungsi** — Kalo ada toggle, pastiin berfungsi setelah deploy.

---

## Latihan

1. **Bikin landing page pribadi pake Tailwind** — Hero section (nama, tagline, CTA button), About section, Skills section (grid icons/badges). Responsive: 1 kolom mobile, 2 kolom tablet, 3 kolom desktop. Dark mode toggle.

2. **Bikin component library mini** — Pake `@apply` atau inline classes: Button (primary, secondary, outline), Card (dengan image placeholder, title, desc), Badge (info, success, warning, danger), Alert (success, error, info). Kumpulin semua dalam 1 halaman.

3. **Bikin pricing table** — 3 tier (Basic, Pro, Enterprise). Masing-masing ada harga, fitur list (dengan centang/cross), CTA button. Highlight tier "Popular" dengan warna beda. Responsive.

4. **Deploy ke Vercel** — Landing page dari latihan 1 di-deploy. Kirim URL hasilnya.

5. **Bikin halaman form registrasi** — Form dengan input: nama, email, password, confirm password, dropdown jurusan (RPL, TKJ, MM, AKL), checkbox persetujuan. Pake Tailwind styling. Validasi visual: input merah kalo error, hijau kalo valid. Dark mode support.

6. **Bikin halaman dashboard dengan sidebar** — Sidebar navigasi kiri (dashboard, profil, settings, logout). Konten utama berisi statistik cards (total user, pendapatan, orders, growth). Header dengan search bar dan avatar user. Responsive: sidebar jadi hamburger menu di mobile. Dark mode.

7. **Bikin testimonial carousel (CSS-only)** — 3-4 testimonial cards. Pake Flexbox. Navigasi dots di bawah. Card tampil 1 di mobile, 2 di tablet, 3 di desktop. Masing-masing card: foto profil bulat, nama, jabatan, testimonial teks. Dark mode.

8. **Bikin halaman blog dengan filter kategori** — Grid artikel (minimal 6). Tiap artikel: thumbnail, judul, excerpt, tanggal, kategori badge. Filter: klik kategori, artikel yang cocok tampil, yang lain fade/gone (pake CSS target selector atau JS sederhana). Responsive grid.
