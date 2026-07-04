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

---

## Latihan

1. **Bikin layout halaman pribadi** — Struktur HTML semantic: header (nav), main (hero + about + projects), footer. Pakai CSS Flexbox buat navbar, Grid buat project cards.
2. **Bikin card grid responsive** — Grid dengan `auto-fit` dan `minmax`. Minimal 4 card. Masing-masing card ada gambar placeholder, judul, deskripsi.
3. **Bikin navbar mobile-friendly** — Navbar horizontal di desktop, berubah jadi vertikal/stack di HP (media query). Tambah hamburger menu (CSS-only, no JS).
4. **Bikin layout dashboard** — Sidebar kiri (nav), main area kanan (konten), header di atas. Pakai CSS Grid Areas. Responsive: sidebar sembunyi di mobile.
