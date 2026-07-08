# Static Web Starter

Template starter untuk website static pake **HTML5**, **CSS3**, dan **JavaScript vanilla**. Udah include Tailwind CSS via CDN, dark theme, dan siap deploy ke Vercel.

## Stack

| Komponen        | Keterangan                         |
|-----------------|------------------------------------|
| HTML5           | Semantic HTML                      |
| CSS3            | Tailwind CDN + custom styles       |
| JavaScript      | Vanilla JS (ES6+)                  |
| Vercel          | Siap deploy (include vercel.json)  |

## Struktur Folder

```
web-static/
├── index.html        # Halaman utama (semantic HTML)
├── style.css         # Custom CSS + Tailwind CDN
├── app.js            # JavaScript interaktif (sekarang)
├── vercel.json       # Konfigurasi deploy Vercel
└── README.md         # Dokumentasi (ini)
```

## Cara Pake

### Local Development
Template ini bisa dijalanin pake static file server apapun:

```bash
# Pake npx serve
npx serve .

# Atau pake Python
python3 -m http.server 8080

# Atau pake VS Code Live Server
```

Buka browser ke `http://localhost:8080`.

### Fitur di Template
- **Real-time clock** — Menampilkan jam live yang update tiap detik.
- **Tombol interaktif** — Klik tombol buat fetch data dari API dummy (JSONPlaceholder).
- **Dark theme** — Tampilan gelap modern pake gradient dan shadow.

## Kustomisasi

### Ganti Warna
Edit variabel di `style.css`:

```css
:root {
  --primary: #6366f1;    /* Ganti warna primer */
  --bg: #0f0f0f;        /* Ganti background */
}
```

### Tambah Halaman
Tinggal copy `index.html` jadi `about.html`, `contact.html`, dll.

### Integrasi Framework
Bisa tambah:
- **Alpine.js** — `<script src="//unpkg.com/alpinejs" defer></script>`
- **HTMX** — `<script src="//unpkg.com/htmx.org"></script>`
- **Chart.js** — Buat grafik

## Deploy ke Vercel

```bash
npx vercel
```

Udah include `vercel.json` biar routing dan headers optimal.

## Catatan

- `script.js` udah direname jadi `app.js` — update `<script src>` di HTML.
- Error handling di fetch — kalo API ga reachable, fallback ke local time.
- Semantic HTML tags: `<header>`, `<main>`, `<footer>`, `<section>`, `<article>`.
- Accessible — pake `aria-label` dan semantic elements.
- Responsive — mobile-first dengan media queries.
