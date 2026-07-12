# Web Development — Exercise #1: HTML Semantic

> **Level:** Beginner
> **Topics:** semantic HTML5, header, nav, main, section, article, footer

## Instructions

Buat struktur halaman landing page menggunakan elemen semantic HTML5. Lengkapi elemen-elemen berikut:

1. `<header>` dengan `<nav>` berisi link: Home, Tentang, Layanan, Kontak.
2. `<main>` dengan:
   - `<section id="hero">` — judul + deskripsi singkat.
   - `<section id="features">` — 3 `<article>` card (gunakan class "card").
3. `<footer>` dengan copyright.

## Starter Code

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Landing Page Saya</title>
  <style>
    /* Reset dan styling dasar */
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    header { background: #6366f1; color: white; padding: 1rem 0; }
    nav ul { display: flex; gap: 20px; list-style: none; }
    nav a { color: white; text-decoration: none; }
    #hero { padding: 4rem 0; text-align: center; background: #f5f5f5; }
    #features { padding: 4rem 0; }
    .card { background: white; border-radius: 8px; padding: 2rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 1rem; }
    footer { background: #1a1a2e; color: white; text-align: center; padding: 2rem 0; margin-top: 2rem; }
  </style>
</head>
<body>
  <!-- TODO: Header dengan navigasi -->
  <header>
    <div class="container">
      <nav>
        <ul>
          <!-- TODO: tambah link navigasi -->
        </ul>
      </nav>
    </div>
  </header>

  <!-- TODO: Main content -->
  <main>
    <section id="hero">
      <div class="container">
        <h1>Selamat Datang di Website Saya</h1>
        <p>Platform belajar coding interaktif untuk pemula sampai mahir.</p>
      </div>
    </section>

    <section id="features">
      <div class="container">
        <h2>Fitur Unggulan</h2>
        <!-- TODO: 3 article card -->
      </div>
    </section>
  </main>

  <!-- TODO: Footer -->
  <footer>
    <div class="container">
      <!-- TODO: copyright -->
    </div>
  </footer>
</body>
</html>
```

## Expected Output

Halaman HTML valid dengan struktur semantic. Semua elemen semantic terisi dengan konten yang sesuai. Tidak ada error validasi W3C.

## Test Cases

```javascript
// Test: cek struktur dasar
console.log("Halaman semantic HTML siap di-render di browser.");
// Verifikasi manual: buka di browser, lihat struktur elemen
```
