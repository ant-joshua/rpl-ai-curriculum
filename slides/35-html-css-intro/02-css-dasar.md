---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — <img src="https://images.pexels.com/photos/196646/pexels-pho"
footer: "Sesi 02: Css Dasar"
---

<!-- _class: title -->
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
