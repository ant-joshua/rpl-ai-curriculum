# HTML & CSS Intro — Latihan

## Level 1: Dasar

### 1. Semantic HTML — Struktur Halaman
**Pertanyaan:** Buat struktur HTML untuk halaman artikel blog yang punya:
- `<header>` dengan judul situs dan navigasi
- `<main>` dengan artikel (judul, penulis, tanggal, konten)
- `<aside>` dengan daftar artikel terkait
- `<footer>` dengan copyright

Tulis kode HTML lengkap (termasuk `<!DOCTYPE html>`, `<html>`, `<head>`).

**Hint:** Semantic HTML membantu SEO dan aksesibilitas. Gunakan `<article>`, `<nav>`, `<section>`.

---

### 2. CSS Selector — Spesifisitas
```html
<div class="card">
  <p id="judul" class="title">Halo Dunia</p>
  <p class="body">Ini konten</p>
</div>
```

**Pertanyaan:** Tulis CSS selector untuk:
1. Styling elemen dengan id `judul` — warna merah
2. Styling semua elemen dengan class `title` — font-size 24px
3. Styling `<p>` di dalam `.card` — padding 16px
4. Styling class `body` yang merupakan child langsung dari `.card` — margin-top 8px

Urutkan selector di atas dari yang paling tinggi spesifisitasnya ke paling rendah.

**Hint:** Specificity: inline > id > class > element. Hitung: (0,1,0,0) > (0,0,1,0) > (0,0,0,1).

---

### 3. Box Model — Padding, Border, Margin
**Pertanyaan:** Diberikan CSS berikut:

```css
.box {
  width: 200px;
  height: 100px;
  padding: 20px;
  border: 5px solid black;
  margin: 10px;
}
```

1. Berapa total lebar elemen `.box` di layar? (termasuk border-box vs content-box)
2. Berapa jarak antar dua elemen `.box` yang bersebelahan?
3. Tambahkan `box-sizing: border-box` — berapa total lebar sekarang?

**Hint:** Default `box-sizing: content-box`. Content-box: width = 200, padding + border + 200 = total. Border-box: width 200 sudah include padding dan border.

---

### 4. Flexbox — Navigasi Horizontal
**Pertanyaan:** Buat navigasi horizontal dengan Flexbox:

```
[Home] [Tentang] [Layanan] [Kontak] [Login]
```

Requirements:
- Navbar full width
- Item navigasi rata kiri, kecuali Login rata kanan
- Jarak antar item 24px
- Background navbar warna #333, teks putih
- Responsive: di layar < 600px, item jadi vertikal

Tulis HTML dan CSS lengkap.

**Hint:** `display: flex`, `justify-content: space-between`, `gap: 24px`. Gunakan `margin-left: auto` pada item Login. Media query: `@media (max-width: 600px) { flex-direction: column; }`.

---

### 5. CSS Grid — Card Layout
**Pertanyaan:** Buat grid layout untuk menampilkan 6 card produk.

Requirements:
- Desktop (≥ 1024px): 3 kolom
- Tablet (≥ 768px): 2 kolom
- Mobile (< 768px): 1 kolom
- Gap antar card 20px
- Tiap card punya border, padding, dan shadow

Tulis HTML dan CSS lengkap.

**Hint:**
```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
@media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); }
@media (max-width: 768px) { grid-template-columns: 1fr; }
```

---

### 6. Form HTML — Input Types & Label
**Pertanyaan:** Buat form registrasi dengan field berikut:

| Field | Input Type | Keterangan |
|-------|-----------|------------|
| Nama Lengkap | text | required, placeholder "Masukkan nama" |
| Email | email | required |
| Password | password | minlength 8 |
| Tanggal Lahir | date | |
| Gender | radio | Pria / Wanita |
| Hobi | checkbox | Membaca, Olahraga, Musik |
| Kota | select | Jakarta, Bandung, Surabaya |
| Pesan | textarea | 4 baris |
| Submit | submit | Teks tombol "Daftar" |

Tulis HTML form lengkap. Semua field harus punya `<label>`.

**Hint:** Setiap input harus punya `<label for="...">`. Radio dan checkbox perlu name yang sama dalam satu grup.

---

### 7. CSS Styling — Font, Warna, Background
**Pertanyaan:** Styling halaman berikut sesuai spesifikasi:

```html
<body>
  <h1>Selamat Datang</h1>
  <p class="intro">Ini adalah halaman landing sederhana.</p>
  <button class="cta">Mulai Sekarang</button>
</body>
```

Requirements:
- Font: Google Fonts Inter, fallback sans-serif
- Warna background: gradient linear dari #667eea ke #764ba2
- Heading: putih, font-weight 700, size 48px, text-shadow
- Paragraph: putih 80% opacity, size 18px, line-height 1.6
- Button: background putih, teks #667eea, padding 16px 32px, border-radius 8px, hover jadi background #667eea + teks putih
- Semua konten di tengah (center) horizontal dan vertikal, full viewport height

Tulis CSS lengkap.

**Hint:** `height: 100vh`, `display: flex`, `justify-content: center`, `align-items: center`, `flex-direction: column`, `background: linear-gradient(...)`, `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap')`.

---

### 8. Tabel HTML — Styling dengan CSS
**Pertanyaan:** Buat tabel data harga paket:

| Paket | Harga | Fitur | Diskon |
|-------|-------|-------|--------|
| Basic | Rp100rb | 10 GB Storage | - |
| Pro | Rp250rb | 50 GB Storage | 10% |
| Enterprise | Rp500rb | Unlimited | 20% |

Styling dengan CSS:
- Header tabel: background #333, teks putih
- Baris genap: background #f5f5f5
- Hover: background #e0e0e0
- Border collapse, padding 12px
- Kolom Harga rata kanan

Tulis HTML dan CSS lengkap.

**Hint:** `border-collapse: collapse`, `tr:nth-child(even)`, `tr:hover`, `text-align: right` untuk kolom harga.

---

## Level 2: Intermediate

### 9. Layout Landing Page — Flexbox + Grid
**Skenario:** Desain landing page dengan section:

1. **Hero** — full viewport, background image, headline, subtext, CTA button (flexbox center)
2. **Features** — 3 kolom icon + judul + deskripsi (grid 3 kolom)
3. **Testimonials** — 2 kolom card testimoni (grid 2 kolom)
4. **Footer** — 4 kolom link (grid 4 kolom)

**Pertanyaan:** Tulis HTML dan CSS lengkap untuk semua section ini. Setiap section punya padding 80px atas-bawah. Gunakan warna, font, dan spacing yang konsisten. Responsive: semua grid jadi 1 kolom di mobile.

**Hint:** Struktur: `.hero` (flex), `.features` (grid), `.testimonials` (grid), `.footer` (grid). Breakpoint 768px.

---

### 10. Form dengan Validasi — CSS Pseudo-class
**Pertanyaan:** Buat form login dengan validasi visual:

```html
<form class="login-form">
  <div class="form-group">
    <label for="email">Email</label>
    <input type="email" id="email" required>
    <span class="error-message">Email tidak valid</span>
  </div>
  <div class="form-group">
    <label for="password">Password</label>
    <input type="password" id="password" minlength="8" required>
    <span class="error-message">Minimal 8 karakter</span>
  </div>
  <button type="submit">Login</button>
</form>
```

Styling requirements:
- Input: border #ccc default, border-width 2px
- `:valid` → border-color hijau (#4caf50)
- `:invalid` → border-color merah (#f44336)
- `:focus` → box-shadow biru (#2196f3), outline none
- Error message: hidden default, muncul (display block) saat input `:invalid` dan sudah di-focus/blur
- Gunakan `:focus:invalid` atau `:not(:placeholder-shown):invalid`

Tulis CSS lengkap.

**Hint:** Pseudo-class form: `:valid`, `:invalid`, `:focus`, `:required`. Untuk error message: `.error-message { display: none; } input:focus:invalid ~ .error-message, input:not(:placeholder-shown):invalid ~ .error-message { display: block; }`.

---

### 11. Responsive Navigation — Hamburger Menu
**Pertanyaan:** Buat navigasi yang di desktop menampilkan menu horizontal, di mobile berubah jadi hamburger menu yang toggle.

```html
<nav class="navbar">
  <div class="logo">MyApp</div>
  <button class="hamburger" aria-label="Menu">☰</button>
  <ul class="nav-menu">
    <li><a href="#">Home</a></li>
    <li><a href="#">Tentang</a></li>
    <li><a href="#">Layanan</a></li>
    <li><a href="#">Kontak</a></li>
  </ul>
</nav>
```

Requirements:
- Desktop (> 768px): menu horizontal, hamburger hidden
- Mobile (≤ 768px): menu vertikal, hidden default, muncul saat hamburger di-click
- Transisi smooth (slide down atau fade in)
- Hamburger button: only visible on mobile

Tulis CSS lengkap (tanpa JavaScript — cukup CSS untuk state default dan class `.active`). Untuk fungsionalitas toggle, cukup tulis CSS untuk state ketika menu punya class `active`.

**Hint:**
```css
.hamburger { display: none; }
@media (max-width: 768px) {
  .hamburger { display: block; }
  .nav-menu { display: none; }
  .nav-menu.active { display: flex; flex-direction: column; }
}
```

---

### 12. CSS Grid — Magazine Layout
**Pertanyaan:** Buat layout majalah/magazine dengan grid:

```
+-------------------+-----------+-----------+
|                   |  Article  |  Sidebar  |
|   Featured        |   2       |           |
|   Article         +-----------+           |
|   (2 rows)        |  Article  |           |
|                   |   3       |           |
+-------------------+-----------+-----------+
|   Article 4       |   Article 5           |
+-------------------+-----------------------+
```

Tiap area artikel punya: gambar (placeholder), judul, excerpt. Sidebar berisi: daftar artikel populer, iklan placeholder.

Tulis HTML dan CSS Grid lengkap. Responsive: jadi single column di mobile.

**Hint:** `grid-template-areas` untuk layout 2 kolom + featured. Contoh:
```css
.grid-layout {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  grid-template-rows: auto auto;
  grid-template-areas:
    "featured article2 sidebar"
    "featured article3 sidebar"
    "article4 article5 article5";
}
```

---

### 13. CSS Position — Overlay & Tooltip
**Pertanyaan:** Buat komponen berikut:

1. **Card dengan overlay:** Hover card → muncul overlay gelap dengan tombol "Lihat Detail" di tengah
2. **Tooltip:** Hover teks "Info" → muncul tooltip di atas teks

```html
<div class="card-container">
  <div class="card">
    <img src="https://via.placeholder.com/300x200" alt="Produk">
    <div class="overlay">
      <button>Lihat Detail</button>
    </div>
  </div>
</div>

<p>Klik <span class="tooltip-trigger">Info<span class="tooltip-text">Ini adalah informasi tambahan</span></span> untuk detail.</p>
```

Tulis CSS lengkap. Overlay harus smooth transition (opacity). Tooltip muncul dengan animasi fade.

**Hint:** Card: `position: relative`. Overlay: `position: absolute; inset: 0; opacity: 0`. Card hover → overlay `opacity: 1`. Tooltip trigger: `position: relative`. Tooltip text: `position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%)`.

---

### 14. CSS Custom Properties — Theme Toggle
**Pertanyaan:** Buat sistem theming dengan CSS custom properties (variables) untuk light mode dan dark mode.

```css
:root {
  /* Light theme */
  --bg: #ffffff;
  --text: #1a1a1a;
  --primary: #3b82f6;
  --card-bg: #f5f5f5;
}

[data-theme="dark"] {
  /* Dark theme */
  --bg: #1a1a1a;
  --text: #f5f5f5;
  --primary: #60a5fa;
  --card-bg: #2d2d2d;
}
```

**Pertanyaan:** Tulis CSS untuk halaman yang menggunakan variable di atas:
- Background body pake `--bg`
- Teks pake `--text`
- Card (padding 24px, border-radius 12px) pake `--card-bg`
- Tombol primary pake `--primary` sebagai background

Tambahkan: hover efek yang menggunakan `filter: brightness()` atau `opacity` agar tidak perlu define warna terpisah.

**Hint:** Penggunaan: `background: var(--bg)`, `color: var(--text)`. Tombol hover: `filter: brightness(0.9)`. Dark mode: cukup tambah `data-theme="dark"` di `<html>`.

---

## Level 3: Challenge

### 15. Full Landing Page — Company Profile
**Skenario:** Buat company profile landing page lengkap untuk startup fiksi "TechNova".

**Pertanyaan:** Tulis satu file HTML + CSS (inline `<style>` atau file terpisah) untuk halaman dengan section:

1. **Navbar** — fixed top, transparan berubah jadi solid saat scroll (pake CSS position sticky/class, jelaskan cara JS complement-nya)
2. **Hero** — background video/pattern, headline besar "Masa Depan Ada di Sini", subtext, dua CTA button (primary + outline)
3. **About** — 2 kolom: kiri teks, kanan ilustrasi/placeholder image
4. **Services** — 3 card dengan icon (emoji), judul, deskripsi, link "Pelajari"
5. **Stats** — 4 angka (Client, Project, Award, Team) dengan counter style
6. **Testimonials** — carousel 3 testimoni (cukup 3 card horizontal, active card lebih besar)
7. **Contact** — form nama, email, subjek, pesan + submit
8. **Footer** — 3 kolom: logo+deskripsi, link cepat, sosial media + copyright

Requirements:
- 100% HTML + CSS (NO JavaScript, NO Tailwind)
- Responsive semua breakpoint
- Konsisten: font, warna, spacing
- Animasi: fade-in saat scroll (pake CSS animation + scroll hint)
- Semantic HTML

**Hint:** Gunakan CSS animation dengan `@keyframes fadeInUp`. Untuk efek muncul saat scroll bisa pake `animation-delay` atau `animation-timeline` (future CSS). Section: `padding: 100px 0`. Warna: #2563eb (primary), #1e293b (dark).

---

### 16. Dashboard Layout — Admin Panel
**Skenario:** Bangun layout admin dashboard dengan HTML + CSS Grid.

**Pertanyaan:** Buat layout dengan struktur:

```
+-------+-----------------------------------------+
|       |  Header: Logo + Search + User Avatar    |
|       +-----------------------------------------+
| Side  |  Stats Cards (4 card grid)              |
| bar   +-----------------------------------------+
| Nav   |  Recent Activity Table                   |
|       +-----------------------------------------+
|       |  Chart Placeholder + Todo List           |
+-------+-----------------------------------------+
```

Sidebar navigasi:
- Links: Dashboard, Produk, Orders, Users, Settings, Logout
- Ikon pake emoji atau karakter unicode
- Active link punya highlight
- Collapsible di mobile

Content area:
- Header: search input + notifikasi bell + avatar user
- Stats: 4 card (Total Users, Revenue, Orders, Growth) — masing-masing punya icon, angka, perubahan %
- Table: kolom No, Name, Status, Action. 5 baris data dummy
- Chart: div placeholder dengan gradient sebagai chart simulasi
- Todo: checklist 4 item

Requirements:
- Sidebar fixed width 250px, full height
- Responsive: sidebar jadi hamburger overlay di mobile
- Grid dan Flexbox untuk layout internal
- Gunakan CSS custom properties untuk warna

**Hint:**
```css
.dashboard {
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-rows: 70px 1fr;
  grid-template-areas:
    "sidebar header"
    "sidebar main";
}
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
```

---

### 17. E-commerce Product Page
**Skenario:** Buat halaman detail produk e-commerce.

**Pertanyaan:** Tulis HTML + CSS untuk halaman dengan komponen:

1. **Breadcrumb** — Home > Kategori > Nama Produk
2. **Gallery** — Gambar utama besar (600px) + 4 thumbnail di bawah. Thumbnail active punya border. Hover thumbnail → ganti gambar utama (pake CSS `:hover` pada parent, tunjuk gambar utama lewat sibling selector)
3. **Product Info** — Nama, rating (bintang emoji), harga (coret untuk original, tebal untuk diskon), deskripsi, warna (swatch bulat), ukuran (button group)
4. **Quantity Selector** — Tombol minus/qty/plus
5. **Actions** — Tambah ke Keranjang (primary), Beli Langsung (outline)
6. **Tabs** — Deskripsi | Informasi Tambahan | Review (3 tab, gunakan radio button CSS hack untuk switching konten tanpa JS)
7. **Related Products** — 4 card produk terkait (horizontal scroll)

Requirements:
- NO JavaScript, NO Tailwind
- Gunakan `:target` pseudo-class atau hidden radio button untuk tab switching
- Hover efek di semua interactive element
- Responsive: gallery full width di mobile, info di bawah

**Hint:** Radio button CSS hack untuk tab:
```html
<input type="radio" name="tab" id="tab1" checked>
<input type="radio" name="tab" id="tab2">
<input type="radio" name="tab" id="tab3">
<div class="tab-content" id="content1">...</div>
<div class="tab-content" id="content2">...</div>
```
```css
.tab-content { display: none; }
#tab1:checked ~ #content1 { display: block; }
#tab2:checked ~ #content2 { display: block; }
#tab3:checked ~ #content3 { display: block; }
```

---

### 18. CSS Art — Komponen UI Realistis
**Skenario:** Buat komponen UI yang realistis hanya dengan CSS (tanpa gambar).

**Pertanyaan:** Pilih SALAH SATU dan buat dengan HTML + CSS murni:

**Opsi A: Pricing Card**
- Header gradient dengan ikon
- Nama paket, harga per bulan
- Fitur list dengan centang
- Tombol CTA
- Badge "POPULER" di pojok
- Hover: card naik sedikit (translateY), shadow membesar

**Opsi B: Profile Card**
- Avatar bulat dengan border gradient
- Cover image (linear gradient)
- Nama, bio, location
- Stats: 3 angka (Followers, Following, Posts)
- Tombol Follow / Unfollow
- Hover: avatar rotate, stats count

**Opsi C: Notification Toast**
- Success, Error, Warning variants
- Icon (emoji) + pesan + close button
- Muncul dari kanan dengan slide animation
- Auto dismiss simulation (pake CSS animation)

Tulis HTML dan CSS lengkap untuk komponen yang dipilih. Detail dan visually appealing.

**Hint:** Gunakan `::before`, `::after` untuk decorative elements. `border-image` atau `box-shadow` untuk border gradient. `@keyframes` untuk animasi. `backdrop-filter: blur()` untuk efek modern.
