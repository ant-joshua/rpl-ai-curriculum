# 2.1 CSS Dasar

## CSS Syntax

CSS terdiri dari **selector**, **property**, dan **value**:

```css
selector {
    property: value;
}
```

Contoh:

```css
p {
    color: blue;
    font-size: 18px;
}
```

Artinya: semua tag `<p>` dikasih warna biru dan ukuran font 18px.

## Cara Pakai CSS

### 1. Inline CSS — langsung di tag HTML

```html
<p style="color: red; font-weight: bold;">Teks merah tebal</p>
```

### 2. Internal CSS — di dalam `<head>`

```html
<head>
    <style>
        p {
            color: green;
        }
    </style>
</head>
```

### 3. External CSS — file `.css` terpisah (paling recommended)

```html
<head>
    <link rel="stylesheet" href="style.css">
</head>
```

```css
/* style.css */
body {
    font-family: Arial, sans-serif;
    background: #f0f0f0;
}
```

## Selector

### Element Selector

```css
h1 { color: navy; }
p { font-size: 16px; }
```

### Class Selector (pake `.`)

```html
<p class="highlight">Ini highlight</p>
```

```css
.highlight {
    background: yellow;
    padding: 5px;
}
```

### ID Selector (pake `#`)

```html
<div id="header">Header</div>
```

```css
#header {
    background: black;
    color: white;
}
```

> **Aturan:** ID cuma boleh 1 kali per halaman. Class boleh dipake berkali-kali.

### Selector Lain

```css
/* Multiple selector */
h1, h2, h3 { font-family: sans-serif; }

/* Descendant — semua p di dalam div */
div p { margin: 10px; }

/* Child langsung */
div > p { color: red; }

/* Attribute selector */
input[type="text"] { border: 1px solid gray; }
```

## Color & Background

```css
/* Nama warna */
color: red;
background-color: blue;

/* Hex — paling umum */
color: #ff5733;
background: #f0f0f0;

/* RGB */
color: rgb(255, 87, 51);
background: rgba(0, 0, 0, 0.5); /* a = opacity */
```

```html
<div style="background: #3498db; color: white; padding: 20px;">
    Div biru dengan teks putih
</div>
```

## Font & Text

```css
p {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 18px;
    font-weight: bold; /* 400 normal, 700 bold */
    font-style: italic;
    text-align: center; /* left, center, right, justify */
    text-decoration: underline; /* underline, line-through, none */
    line-height: 1.5;
    letter-spacing: 2px;
}
```

```html
<p style="font-family: 'Courier New', monospace; font-size: 20px; text-align: justify;">
    Ini teks dengan font Courier, ukuran 20px, rata kanan-kiri.
</p>
```

## Box Model

Setiap elemen HTML itu sebuah **box**:

```
┌─────────────────────────┐
│        Margin           │
│  ┌───────────────────┐  │
│  │     Border        │  │
│  │  ┌─────────────┐  │  │
│  │  │   Padding   │  │  │
│  │  │  ┌───────┐  │  │  │
│  │  │  │ Content│  │  │  │
│  │  │  └───────┘  │  │  │
│  │  └─────────────┘  │  │
│  └───────────────────┘  │
└─────────────────────────┘
```

```css
.box {
    /* Content */
    width: 300px;
    height: 200px;

    /* Padding — jarak konten ke border */
    padding: 20px;         /* semua sisi */
    padding: 10px 20px;    /* atas-bawah | kiri-kanan */
    padding: 10px 20px 15px 25px; /* top right bottom left */

    /* Border */
    border: 2px solid black;
    border-radius: 10px;   /* bikin sudut melengkung */

    /* Margin — jarak ke elemen lain */
    margin: 20px;
    margin: 10px auto;     /* auto = tengah horizontal */
}
```

### Box-sizing

```css
/* Biar padding & border gak nambahin ukuran */
* {
    box-sizing: border-box;
}
```

Dengan `border-box`, `width: 300px` tetap 300px meskipun dikasih padding 20px.

Tanpa `border-box`, ukuran jadi 300 + 20 + 20 = 340px.

## Width & Height

```css
.fixed {
    width: 500px;          /* ukuran tetap */
}

.responsive {
    width: 80%;            /* 80% dari parent */
    max-width: 1200px;     /* maksimal 1200px */
    min-width: 300px;      /* minimal 300px */
    height: auto;          /* otomatis sesuai konten */
}

.vw-vh {
    width: 100vw;          /* 100% lebar viewport */
    height: 100vh;         /* 100% tinggi viewport */
}
```

## Display

| Value | Behavior |
|-------|----------|
| `block` | Ambil satu baris penuh (div, p, h1, section) |
| `inline` | Baris yang sama, ukuran sesuai konten (span, a, strong) |
| `inline-block` | Seperti inline tapi bisa dikasih width/height/margin |
| `none` | Elemen hilang total (gak kelihatan, gak ambil space) |

```css
.block {
    display: block;
    width: 100%;
}

.inline {
    display: inline;
}

.inline-block {
    display: inline-block;
    width: 150px;
    height: 50px;
}

.hidden {
    display: none; /* elemen ilang total */
    /* visibility: hidden; — elemen ilang tapi space-nya masih ada */
}
```

```html
<div>Div ini block — turun baru</div>
<span>Span ini inline —</span>
<span>— masih di baris yang sama</span>
```

## Contoh Lengkap

```html
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSS Dasar</title>
    <style>
        * { box-sizing: border-box; }

        body {
            font-family: Arial, sans-serif;
            background: #f5f5f5;
            margin: 0;
            padding: 20px;
        }

        .card {
            background: white;
            width: 300px;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 12px;
            margin: 20px auto;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .card h2 {
            color: #2c3e50;
            margin-top: 0;
        }

        .card p {
            color: #666;
            line-height: 1.6;
        }

        .btn {
            display: inline-block;
            background: #3498db;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 6px;
        }

        .btn:hover {
            background: #2980b9;
        }
    </style>
</head>
<body>
    <div class="card">
        <h2>Card Component</h2>
        <p>Ini contoh card pake box model lengkap: margin, border, padding, content.</p>
        <a href="#" class="btn">Klik Saya</a>
    </div>
</body>
</html>
```

## Latihan

1. **Styling Profile Page** — Ambil HTML profile dari sesi 1, tambah CSS: background, font, warna, padding, margin. Bikin layout rapi.

2. **Card Component** — Bikin card component (seperti contoh di atas) untuk nampilin 3 item: foto produk, judul, harga, tombol beli. Pake class selector, box model, border-radius.

3. **Navigation Bar** — Bikin navigasi horizontal: `display: inline-block` atau `flex` untuk menu Home, About, Services, Contact. Style hover pake `:hover`.

4. **Article Layout** — Bikin layout article pake semantic HTML + CSS: judul besar, meta info (penulis, tanggal), konten paragraf, sidebar. Pake class & id selector, font styling, box model.

---

## CSS Custom Properties (Variables)

CSS Variables nyimpen nilai yang bisa dipake ulang. Mirip variable di JavaScript — ganti di satu tempat, efek ke semua.

```css
:root {
  /* Warna */
  --color-primary: #3498db;
  --color-secondary: #2ecc71;
  --color-danger: #e74c3c;
  --color-text: #333;
  --color-bg: #f5f5f5;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* Font */
  --font-main: 'Inter', Arial, sans-serif;
  --font-size-base: 16px;
  --font-size-lg: 20px;
  --font-size-xl: 32px;

  /* Layout */
  --max-width: 1200px;
  --border-radius: 8px;
  --shadow: 0 2px 8px rgba(0,0,0,0.1);
}
```

### Cara Pake

```css
.card {
  background: white;
  padding: var(--spacing-lg);        /* 24px */
  border-radius: var(--border-radius); /* 8px */
  box-shadow: var(--shadow);
  color: var(--color-text);
  max-width: var(--max-width);
}

.card h2 {
  color: var(--color-primary);
  font-size: var(--font-size-xl);
}

.btn-danger {
  background: var(--color-danger);
  padding: var(--spacing-sm) var(--spacing-md);
}
```

### Theme Switching pake CSS Variables

```css
/* Light theme (default) */
:root {
  --bg: white;
  --text: #333;
  --card-bg: #f9f9f9;
}

/* Dark theme */
[data-theme="dark"] {
  --bg: #1a1a2e;
  --text: #eee;
  --card-bg: #16213e;
}

/* Pake di elemen */
body {
  background: var(--bg);
  color: var(--text);
  transition: background 0.3s, color 0.3s;
}

.card {
  background: var(--card-bg);
}
```

```html
<button onclick="document.documentElement.setAttribute('data-theme', 'dark')">Dark Mode</button>
<button onclick="document.documentElement.setAttribute('data-theme', 'light')">Light Mode</button>
```

### Fallback Value

Kalo variable belum didefinisikan, kasih nilai cadangan:

```css
color: var(--color-undefined, blue);  /* pake blue kalo variable gak ada */
```

---

## CSS @layer — Atur Urutan Spesifisitas

`@layer` nge-group stylesheet dan ngontrol urutan prioritas — bye-bye `!important` spam!

```css
/* Definisikan layer, urut dari prioritas terendah */
@layer reset, base, components, utilities;

/* Isi layer */
@layer reset {
  * { margin: 0; padding: 0; box-sizing: border-box; }
}

@layer base {
  body { font-family: Arial, sans-serif; color: #333; }
  a { color: blue; }
}

@layer components {
  .card { padding: 20px; border-radius: 8px; }
  .btn { padding: 10px 20px; border: none; border-radius: 6px; }
}

@layer utilities {
  .text-center { text-align: center; }
  .mt-4 { margin-top: 16px; }
}
```

**Aturan urutan:** layer terakhir = prioritas tertinggi. `utilities` menang atas `components`.

### Import External CSS ke Layer

```css
@import url('bootstrap.css') layer(bootstrap);
@import url('custom.css') layer(components);
```

### Keuntungan @layer

| Tanpa @layer | Pake @layer |
|-------------|-------------|
| Spesifisitas complex, pusing | Urutan jelas pertama-terakhir |
| Sering pake `!important` | Gak perlu `!important` |
| Susah debug style conflict | Conflict tinggal cek urutan layer |
| Import CSS susah diatur | Import bisa masuk layer tertentu |

---

## Modern CSS Selectors

### :has() — Parent Selector (CSS Parent)

`:has()` milih parent yang mengandung child tertentu. **Game changer!**

```css
/* Card yang punya gambar di dalamnya */
.card:has(img) {
  padding: 0;  /* card tanpa padding kalo ada gambar */
}

/* Form group yang error */
.form-group:has(input:invalid) label {
  color: red;
}

/* List item yang aktif */
li:has(a.active) {
  background: #f0f0f0;
}

/* Parent container yang punya >3 anak */
.container:has(> :nth-child(4)) {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}
```

### CSS Nesting — Kayak Sass/Less (Native!)

Sekarang CSS bisa nesting tanpa preprocessor:

```css
.card {
  background: white;
  padding: 20px;
  border-radius: 8px;

  /* Child langsung */
  & h2 {
    color: #333;
    font-size: 24px;
  }

  /* Child dalam */
  & .card-body {
    padding: 10px 0;

    & p {
      color: #666;
      line-height: 1.6;
    }
  }

  /* Pseudo-class */
  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }

  /* Media query di dalam */
  @media (max-width: 600px) {
    padding: 10px;
  }
}
```

Tanpa nesting:

```css
.card { background: white; padding: 20px; }
.card h2 { color: #333; }
.card .card-body p { color: #666; }
.card:hover { box-shadow: ...; }
```

Dengan nesting lebih rapi & mirip struktur HTML.

### accent-color

Ganti warna input checkbox, radio, range, progress — cuma 1 baris CSS.

```css
/* Ganti semua accent */
:root {
  accent-color: #3498db;
}

/* Atau per elemen */
input[type="checkbox"] {
  accent-color: #2ecc71;
}

input[type="range"] {
  accent-color: #e74c3c;
}

progress {
  accent-color: #f39c12;
}
```

Sebelumnya harus CSS custom checkbox yang ribet. Sekarang tinggal 1 property.

### CSS Scroll Behavior

```css
html {
  scroll-behavior: smooth;  /* Smooth scroll anchor links */
}
```

### text-wrap: balance

```css
h1, h2, h3 {
  text-wrap: balance;  /* rata kiri-kanan optimal, gak ada janda/duda */
}
```

---

## Pseudo-class Modern

| Selector | Fungsi | Contoh |
|----------|--------|--------|
| `:is()` | Group selector dengan forgiving | `:is(section, article) h2 {}` |
| `:where()` | Sama kayak `:is()` tapi specificity 0 | `:where(.card, .box) p {}` |
| `:not()` | Negasi | `input:not([type="submit"]) {}` |
| `:focus-visible` | Focus cuma pake keyboard | `button:focus-visible { outline: 2px solid blue; }` |
| `:focus-within` | Element atau child-nya di-focus | `form:focus-within { border-color: blue; }` |
| `:empty` | Element tanpa child | `div:empty { display: none; }` |
| `:has()` | Parent yang mengandung selector | `.card:has(img) { padding: 0; }` |

```css
/* :is — specificity dihitung dari selector terkuat */
:is(section, article, aside) h2 {
  color: navy;
}

/* :where — specificity 0, gampang di-override */
:where(.card, .box) {
  background: #f5f5f5;
}
/* Kalo mau override, tulis aja: */
.card { background: white; } /* menang */

/* :focus-visible — cuma pas keyboard tab */
button:focus-visible {
  outline: 3px solid #4a90d9;
  outline-offset: 2px;
}
/* Klik pake mouse gak nampilin outline */
```

---

## Animation Performance — Biar Gak Lemot

Animasi CSS bisa bikin website lemot kalo salah properti.

### Properti yang Aman (pakai GPU)

```css
/* ✅ Aman — GPU accelerated */
transform: translateX(100px);
transform: scale(1.2);
transform: rotate(45deg);
opacity: 0.5;

/* ❌ Gak aman — trigger layout/reflow */
left: 100px;
width: 50%;
height: 200px;
margin: 20px;
padding: 10px;
```

### Best Practice Animasi

```css
/* ✅ Pake transform + opacity */
.card {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.card:hover {
  transform: translateY(-5px) scale(1.02);
  opacity: 0.9;
}

/* ❌ Jangan pake left/top/width/height */
/* ❌ Pake animate margin/padding */

/* ✅ will-change — kasih tau browser properti mana yang bakal berubah */
.card {
  will-change: transform, opacity;
}
/* TAPI: jangan pake will-change di banyak elemen — boros memory */
```

### Keyframe Optimization

```css
/* ✅ Optimal */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ❌ Gak optimal — trigger layout tiap frame */
@keyframes badAnim {
  from { left: 0; width: 100px; }
  to   { left: 100px; width: 200px; }
}
```

### CSS vs JavaScript Animation

| Aspek | CSS Animation | JS Animation (requestAnimationFrame) |
|-------|--------------|--------------------------------------|
| Performance | ✅ GPU accelerated | ❌ Main thread |
| Complex path | ❌ Susah | ✅ Bebas |
| Easing | ✅ Built-in | ❌ Butuh library |
| Control | ❌ Susah di-pause | ✅ Full control |
| Cocok | Hover, fade, slide-in | Game, scroll-based, physics |

### Debug Animasi Chrome DevTools

```
1. Buka DevTools → Performance tab
2. Klik record
3. Lakuin animasi
4. Stop record
5. Cek "Rendering" — kalo ada jalur hijau (Layout), ada masalah
6. Cek "GPU" — kalo idle, animasi gak pake GPU
```

---

## Container Queries — Responsive Berdasarkan Parent

Beda sama media query (responsive berdasarkan viewport). Container query responsive berdasarkan ukuran parent container.

```css
/* Definisi container */
.card-grid {
  container-type: inline-size;
  container-name: card-container;
}

/* Container query */
@container card-container (min-width: 400px) {
  .card {
    display: flex;
    flex-direction: row;
  }
  .card img {
    width: 150px;
  }
}

@container card-container (max-width: 399px) {
  .card {
    display: flex;
    flex-direction: column;
  }
  .card img {
    width: 100%;
  }
}
```

### Container Query vs Media Query

```html
<style>
  /* Media query — berdasarkan viewport */
  @media (max-width: 600px) {
    .card { flex-direction: column; }
  }

  /* Container query — berdasarkan parent width */
  .sidebar {
    container-type: inline-size;
  }
  @container (max-width: 300px) {
    .card { flex-direction: column; }
  }
</style>

<div class="sidebar" style="width: 250px;">
  <!-- Card di sidebar sempit → column -->
  <div class="card">...</div>
</div>
<div class="main" style="width: 800px;">
  <!-- Card di main lebar → row -->
  <div class="card">...</div>
</div>
```

### Kegunaan Container Queries

- **Component library** — komponen yang sama bisa dipake di sidebar (sempit) dan main (lebar)
- **Dashboard** — widget yang dipindah-pindah layout
- **CMS** — konten yang dimasukin ke berbagai template

## Latihan Tambahan

5. **CSS variables theme.** Bikin halaman dengan CSS variables untuk light/dark theme. Minimal 5 variable: bg, text, primary, card-bg, border. Tambah 2 tombol toggle theme. Screenshoot kedua tema.

6. **CSS @layer demo.** Bikin 3 file CSS: reset.css, base.css, components.css. Import semua pake @layer. Buktikan bahwa layer utilities menang atas components meskipun specificity sama.

7. **:has() practical.** Bikin form dengan 3 field. Style label jadi merah kalo inputnya invalid. Pake `:has()`. Gak boleh pake JavaScript.

8. **Nesting conversion.** Ambil file CSS dari latihan sebelumnya. Convert ke CSS nesting. Tulis sebelum & sesudah. Hitung berapa baris yang bisa dihemat.

9. **Animation performance test.** Bikin 2 animasi identik: satu pake `left` (buruk), satu pake `transform` (baik). Ukur fps pake Chrome DevTools Performance tab. Catat perbedaan fps.
