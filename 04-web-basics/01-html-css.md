# 4.1 HTML Semantic + CSS Flexbox/Grid + Responsive Design

## HTML Semantic Tags

HTML semantic ngasih **makna** ke struktur halaman — bukan cuma `<div>` doang. Mesin pencari (SEO) dan screen reader pake ini buat ngerti konten.

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Landing Page Saya</title>
</head>
<body>
  <header>
    <nav>
      <ul>
        <li><a href="#home">Home</a></li>
        <li><a href="#about">Tentang</a></li>
        <li><a href="#contact">Kontak</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <section id="hero">
      <h1>Halo, Saya Budi</h1>
      <p>Web Developer & Designer</p>
    </section>

    <section id="about">
      <h2>Tentang Saya</h2>
      <p>Lulusan SMK jurusan RPL. Suka bikin web.</p>
    </section>

    <section id="projects">
      <h2>Project Saya</h2>
      <article>
        <h3>Project 1</h3>
        <p>Deskripsi project pertama.</p>
      </article>
      <article>
        <h3>Project 2</h3>
        <p>Deskripsi project kedua.</p>
      </article>
    </section>
  </main>

  <footer>
    <p>&copy; 2026 Budi. All rights reserved.</p>
  </footer>
</body>
</html>
```

### Tag Semantic Penting

| Tag | Fungsi |
|-----|--------|
| `<header>` | Bagian atas halaman (logo, navbar) |
| `<nav>` | Navigasi / menu |
| `<main>` | Konten utama (1x per halaman) |
| `<section>` | Kelompok konten yang related |
| `<article>` | Konten independen (blog post, card) |
| `<aside>` | Sidebar / konten samping |
| `<footer>` | Bagian bawah (copyright, link) |

### Kesalahan Umum HTML Semantic

Banyak developer pemula salah paham soal tag semantic. Berikut yang paling sering terjadi:

1. **Pakai `<div>` untuk semuanya** — Halaman penuh `<div>` tanpa `<header>`, `<main>`, `<footer>`. Ini bikin kode susah dibaca, jelek buat SEO, dan screen reader gak bisa navigasi dengan baik. Ingat: `<div>` gak punya makna — cuma wadah kosong.

2. **Salah paham `<section>` vs `<article>`** — `<section>` buat kelompok konten yang related dalam satu tema besar (misal: "Projects" section berisi beberapa project). `<article>` buat konten independen yang bisa berdiri sendiri, kayak satu blog post atau satu komentar. **Aturan cepat:** kalo kontennya bisa di-RSS feed atau di-share terpisah, itu harus `<article>`.

3. **`<main>` dipake lebih dari sekali** — Cuma boleh SATU `<main>` per halaman. Elemen ini ngasih tahu screen reader "di sinilah konten inti dimulai".

4. **`<nav>` cuma buat menu utama** — `<nav>` sah dipake buat breadcrumb, pagination di gallery, atau navigasi sekunder di footer.

Perbaiki dengan pola sederhana:

```html
<!-- ❌ Buruk: full div tanpa makna -->
<div class="wrapper">
  <div class="topbar">...</div>
  <div class="content">
    <div class="box">...</div>
  </div>
</div>

<!-- ✅ Baik: semantic tags ngasih struktur jelas -->
<header>
  <nav>...</nav>
</header>
<main>
  <section>...</section>
</main>
<footer>...</footer>
```

### Praktik Baik Semantic HTML

1. **Struktur heading hirarkis** — `h1` → `h2` → `h3`, jangan loncat (misal `h1` langsung `h4`). Screen reader pake urutan heading buat navigasi cepat. Satu halaman cukup satu `h1`.

2. **Pake `aria-label` buat navigasi** — Kalo ada `<nav>` lebih dari satu, kasih label: `<nav aria-label="Navigasi utama">` vs `<nav aria-label="Navigasi footer">`. Screen reader bisa bedain.

3. **`<figure>` + `<figcaption>` buat gambar** — Ngasih konteks dan caption ke gambar. Bagus buat accessibility dan SEO.

4. **`<time>` buat tanggal/waktu** — Mesin paham `<time datetime="2026-07-08">8 Juli 2026</time>` sebagai data temporal, bukan teks biasa.

```html
<article>
  <h2>Cara Bikin Kopi</h2>
  <p>Pertama, rebus air sampai mendidih...</p>
  <figure>
    <img src="kopi.jpg" alt="Secangkir kopi tubruk" width="400">
    <figcaption>Gambar 1: Kopi tubruk siap saji</figcaption>
  </figure>
  <p>Terakhir, nikmati selagi hangat.</p>
  <footer>
    <p>Dipublikasi <time datetime="2026-07-08">8 Juli 2026</time></p>
  </footer>
</article>
```

### SEO & Semantic HTML

Search engine (Google, Bing) pake struktur semantic buat ngerti konten halaman. Keuntungan semantic HTML yang rapi:

- **Featured snippets** — Google bisa ambil `<section>` atau `<article>` langsung buat ditampilin di hasil pencarian sebagai cuplikan.
- **Rich results** — Struktur jelas bantu Google nge-index dan nampilin konten lebih akurat.
- **Accessibility score lebih tinggi** — Lighthouse (alat audit Google) kasih skor lebih baik buat halaman dengan semantic HTML.

**Screenshot:** Bayangkan hasil pencarian Google yang menampilkan cuplikan langsung dari halaman — itu terjadi karena struktur semantic yang rapi. Tanpa semantic, Google cuma lihat tumpukan `<div>`.

---

## CSS Flexbox

Flexbox buat **satu dimensi** — baris ATAU kolom. Cocok buat navbar, card row, centering.

```css
/* Parent: display: flex */
.container {
  display: flex;
  justify-content: center; /* horizontal: flex-start | center | space-between | space-around */
  align-items: center;     /* vertical: flex-start | center | stretch */
  gap: 16px;               /* jarak antar item */
  flex-wrap: wrap;         /* turun ke baris baru kalo penuh */
}
```

```css
/* Child: flex item */
.item {
  flex: 1;                 /* bagi rata ruang */
  flex: 0 0 250px;         /* fixed width 250px */
  align-self: flex-end;    /* override alignment individual */
}
```

### Contoh Navbar Flexbox

```html
<style>
  nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #333;
    color: white;
    padding: 16px 32px;
  }
  nav ul {
    display: flex;
    gap: 24px;
    list-style: none;
  }
  nav a { color: white; text-decoration: none; }
</style>

<nav>
  <div class="logo">MySite</div>
  <ul>
    <li><a href="#">Home</a></li>
    <li><a href="#">About</a></li>
    <li><a href="#">Contact</a></li>
  </ul>
</nav>
```

### Variasi Layout Flexbox Lainnya

Flexbox sering dipake buat pola umum ini — kuasai dan lo bisa bikin berbagai layout dengan cepat.

**Centering (vertikal + horizontal) — teknik paling sering dipake:**
```css
.center-box {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px; /* butuh tinggi tetap */
}
```

**Sticky Footer (footer selalu di bawah):**
```css
/* Biar footer tetap di dasar meski konten sedikit */
body {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  margin: 0;
}
main { flex: 1; } /* ambil sisa ruang yang ada */
```

```html
<body>
  <header>Navbar</header>
  <main>Konten utama — bagian ini yang berkembang</main>
  <footer>&copy; 2026. All rights reserved.</footer>
</body>
```

**Card Row (semua card sama tinggi):**
```css
.card-row {
  display: flex;
  gap: 20px;
}
.card-row > * {
  flex: 1; /* semua card sama lebar */
}
```

### Sumbu Utama & Sumbu Silang Flexbox

Penting paham konsep **main axis** dan **cross axis**:

- Kalo `flex-direction: row` (default): main axis = horizontal (kiri ke kanan), cross axis = vertikal.
- Kalo `flex-direction: column`: main axis = vertikal (atas ke bawah), cross axis = horizontal.
- `justify-content` selalu bekerja di **main axis**.
- `align-items` selalu bekerja di **cross axis**.

```css
/* Contoh: kolom vertikal, item rata tengah horizontal */
.column-center {
  display: flex;
  flex-direction: column;
  align-items: center; /* cross axis = horizontal, jadi ini rata tengah */
}
```

### Kesalahan Umum Flexbox

1. **Lupa `display: flex` di parent** — Properti kayak `justify-content` atau `gap` gak akan bekerja kalo parent-nya bukan flex container. Ini mistake paling umum.

2. **Flex container tanpa tinggi tetap, terus pake `align-items: center`** — Centering vertikal cuma berfungsi kalo container punya tinggi tertentu. Kalo tingginya auto (ikut konten), `align-items: center` gak ada efek.

3. **Overflow tanpa `flex-wrap`** — Item bisa kepotong atau overflow di layar kecil. Selalu kasih `flex-wrap: wrap` kalo item banyak atau ukurannya dinamis.

4. **Salah paham `flex: 1` vs `flex: auto`** — `flex: 1` = `flex-grow: 1; flex-shrink: 1; flex-basis: 0` (item mulai dari ukuran 0, bagi rata ruang). `flex: auto` = `flex-grow: 1; flex-shrink: 1; flex-basis: auto` (item mulai dari ukuran kontennya). Efeknya beda: `flex: 1` bikin semua item persis sama lebar, `flex: auto` bikin item lebih lebar kalo kontennya lebih panjang.

5. **Gap gak didukung di browser sangat tua (IE11)** — Tapi di 2026 semua browser modern udah support. Aman dipake tanpa prefix.

---

## CSS Grid

Grid buat **dua dimensi** — baris DAN kolom sekaligus.

```css
.grid-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;   /* 3 kolom sama lebar */
  grid-template-columns: repeat(3, 1fr); /* sama, lebih pendek */
  grid-template-columns: 200px 1fr 1fr;  /* kolom 1 fixed, 2 & 3 fleksibel */
  gap: 16px;
}
```

### Contoh Card Grid

```html
<style>
  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 24px;
    padding: 32px;
  }
  .card {
    background: #f5f5f5;
    padding: 24px;
    border-radius: 8px;
  }
</style>

<section class="card-grid">
  <div class="card">
    <h3>HTML</h3>
    <p>HyperText Markup Language — struktur web.</p>
  </div>
  <div class="card">
    <h3>CSS</h3>
    <p>Cascading Style Sheets — styling web.</p>
  </div>
  <div class="card">
    <h3>JavaScript</h3>
    <p>Interaktivitas dan logic di browser.</p>
  </div>
  <div class="card">
    <h3>Tailwind</h3>
    <p>Utility-first CSS framework.</p>
  </div>
</section>
```

### Grid Areas (Layout Halaman Penuh)

```css
.page-layout {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  grid-template-columns: 250px 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}
header { grid-area: header; }
aside  { grid-area: sidebar; }
main   { grid-area: main; }
footer { grid-area: footer; }
```

### Variasi Grid Lainnya

**Auto-fill vs Auto-fit — bedanya penting buat responsive grid:**

```css
/* auto-fill: bikin kolom kosong (track) kalo ruang cukup */
.grid-fill {
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

/* auto-fit: kolom kosong di-collapse jadi 0, item melebar */
.grid-fit {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}
```
Visual: `auto-fill` bakal nyisain kolom kosong di ujung (track kosong). `auto-fit` mencollapse kolom kosong jadi 0 dan item sisanya melebar penuh. Buat gallery foto, `auto-fit` biasanya lebih cocok.

**Grid dengan named lines (lebih ekspresif):**
```css
.layout {
  display: grid;
  grid-template-columns: [sidebar] 250px [content] 1fr;
  grid-template-rows: [header] auto [main] 1fr [footer] auto;
  gap: 16px;
}
```

**Grid item span (item melebar lebih dari 1 kolom):**
```css
.featured-card {
  grid-column: 1 / -1; /* regang dari kolom 1 sampai akhir */
}
.wide-card {
  grid-column: span 2; /* lebar 2 kolom */
}
```

### Kapan Pakai Flexbox vs Grid?

Aturan praktis: **Kalo 1 dimensi (baris ATAU kolom), pake Flexbox. Kalo 2 dimensi (baris DAN kolom), pake Grid.**

| Situasi | Pakai |
|---------|-------|
| Navbar menu (item dalam satu baris) | Flexbox |
| Centering konten di tengah halaman | Flexbox |
| Tombol dalam toolbar / action bar | Flexbox |
| Card row (satu baris, tinggi sama) | Flexbox |
| Card grid (banyak baris + kolom) | Grid |
| Layout halaman penuh (header, sidebar, main, footer) | Grid |
| Gallery foto yang rapi | Grid |
| Dashboard dengan widget ukuran variable | Grid |
| Item dengan ukuran dinamis, wrap ke baris baru | Flexbox + flex-wrap |
| Form layout (label + input dalam baris) | Flexbox |

### Kesalahan Umum CSS Grid

1. **Lupa tentuin `grid-template-columns`** — Tanpa ini, grid cuma punya 1 kolom (semua item numpuk vertikal). Grid tanpa kolom jelas sama kaya `<div>` biasa.

2. **Minmax tanpa `auto-fit`/`auto-fill`** — `minmax(200px, 1fr)` tanpa `repeat(auto-fit,...)` cuma bikin 1 baris dengan lebar minimal 200px, bukan grid responsive yang turun ke baris baru.

3. **Item overlap tanpa `z-index`** — Kalo pake `grid-column: 1 / -1` di beberapa item yang posisinya tindih, atur `z-index` biar yang mana tampil di depan.

4. **Lupa `gap` untuk spacing** — Grid items by default nempel satu sama lain tanpa celah. Selalu kasih `gap` kalo mau ada jarak.

5. **Terlalu kompleks di awal** — Mulai dari grid sederhana dulu (2-3 kolom), tambah kompleksitas bertahap. Grid Areas bagus tapi bisa confusing kalo layout halaman belum stabil.

---

## Responsive Design & Media Queries

Breakpoint umum:

```css
/* HP kecil: default (mobile-first) */
body { font-size: 16px; }

/* Tablet (≥ 768px) */
@media (min-width: 768px) {
  .container { max-width: 720px; margin: 0 auto; }
}

/* Desktop (≥ 1024px) */
@media (min-width: 1024px) {
  .container { max-width: 960px; }
  .nav-menu { display: flex; }
}
```

### Contoh: Grid Mobile → Desktop

```css
/* Mobile: 1 kolom */
.project-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

/* Tablet: 2 kolom */
@media (min-width: 768px) {
  .project-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop: 3 kolom */
@media (min-width: 1024px) {
  .project-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Pola Responsive Lainnya

**Mobile-first (standar industri sekarang) — default styling buat HP, tambahin untuk layar lebih besar:**
```css
/* Default: mobile (320px - 767px) */
.sidebar { display: none; }
body { font-size: 14px; }

/* Tablet ke atas (768px+) */
@media (min-width: 768px) {
  .sidebar { display: block; }
  body { font-size: 16px; }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .container { max-width: 960px; }
}
```

**Desktop-first (dulu populer, sekarang jarang dipake):**
```css
/* Default: desktop */
.sidebar { display: block; }

/* Tablet ke bawah */
@media (max-width: 767px) {
  .sidebar { display: none; }
}
```

**Mana yang dipilih?** Google dan framework modern (Tailwind, Bootstrap 5) pake mobile-first. Lebih mudah dipelihara: default styling untuk HP, tambahin `min-width` breakpoint untuk layar lebih besar.

### Best Practices Responsive Design

1. **Relative units, jangan pixel fix** — Pake `rem` buat font, `%` atau `90%` buat lebar container, `ch` buat lebar paragraf (60-80ch ideal untuk readability).
   ```css
   body { font-size: 16px; }         /* base */
   h1 { font-size: 2.5rem; }         /* 40px relative */
   p { max-width: 65ch; }            /* ideal line length */
   .container { max-width: 1200px; width: 90%; }
   img { max-width: 100%; height: auto; }
   ```

2. **Test di ukuran layar nyata** — Chrome DevTools punya device toolbar (CTRL+SHIFT+M). Tes di 320px (iPhone SE), 375px (iPhone), 768px (iPad), 1024px+ (desktop). Jangan cuma resize sembarangan.

3. **Jangan sembunyiin konten penting di mobile** — Kalo konten penting buat user mobile, jangan di-`display: none`. Pertimbangkan ulang prioritas layout.

4. **Pake `max-width` jangan `width`** — Biar container fleksibel di layar kecil tanpa overflow horizontal.
   ```css
   /* ❌ Buruk: overflow di layar kecil */
   .container { width: 1200px; }
   
   /* ✅ Baik: fleksibel */
   .container { max-width: 1200px; width: 90%; }
   ```

5. **Gunakan `rem` untuk spacing** — Pake `rem` di padding/margin bikin spacing konsisten dengan ukuran font. Saat user ganti ukuran font browser, spacing ikut menyesuaikan.

### Screenshot: Kapan Pakai Pendekatan Apa?

Bayangkan tiga skenario ini:

1. **Halaman profil pribadi** — Header dengan foto + nama, about section (teks), projects (card grid), footer. → **Grid buat layout utama halaman, Flexbox buat navbar & centering foto profil.**

2. **Halaman dashboard admin** — Sidebar navigasi kiri, header atas dengan user menu, konten utama (tabel data, chart), footer. → **Grid Areas buat kerangka halaman, Flexbox buat toolbar & card dalam konten.**

3. **Landing page marketing** — Hero fullscreen dengan CTA, features (3 kolom), testimonials (slider), CTA akhir, footer. → **Flexbox buat hero & features row, Grid buat testimonial cards dengan auto-fit.**

---

## Latihan

1. **Bikin layout halaman pribadi** — Struktur HTML semantic: header (nav), main (hero + about + projects), footer. Pakai CSS Flexbox buat navbar, Grid buat project cards.

2. **Bikin card grid responsive** — Grid dengan `auto-fit` dan `minmax`. Minimal 4 card. Masing-masing card ada gambar placeholder, judul, deskripsi.

3. **Bikin navbar mobile-friendly** — Navbar horizontal di desktop, berubah jadi vertikal/stack di HP (media query). Tambah hamburger menu (CSS-only, no JS).

4. **Bikin layout dashboard** — Sidebar kiri (nav), main area kanan (konten), header di atas. Pakai CSS Grid Areas. Responsive: sidebar sembunyi di mobile.

5. **Bikin halaman artikel blog** — Artikel dengan `<article>`, sidebar `<aside>` berisi daftar artikel terkait. Pake Flexbox buat layout artikel + sidebar. Responsive: sidebar turun ke bawah di mobile. Tambah `<time>` buat tanggal publikasi, `<figure>` + `<figcaption>` buat gambar artikel.

6. **Bikin gallery foto responsive** — Pake CSS Grid `auto-fill` + `minmax`. Foto pake `object-fit: cover` biar rapi. Minimal 6 foto placeholder dari `https://picsum.photos/200/300?random=N` (ganti N dengan angka 1-6). Kalo diklik, foto tampil lebih besar (modal sederhana pake CSS atau JS).

7. **Bikin halaman pricing table** — Pakai Flexbox. 3 kolom (Basic, Pro, Enterprise). Masing-masing kolom ada: nama paket, harga, daftar fitur (pakai `<ul>`), tombol "Pilih". Kolom tengah (Pro) lebih menonjol (highlight). Responsive: 1 kolom di mobile, 3 kolom di desktop.
