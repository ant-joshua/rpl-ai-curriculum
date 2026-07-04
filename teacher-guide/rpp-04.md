# RPP: Web Basics (HTML/CSS/Tailwind)

| Info | Detail |
|------|--------|
| Kode | RPL-AI-04 |
| Durasi | 3 pertemuan × 90 menit |
| Level | Beginner |
| Prasyarat | JavaScript Fundamentals (Modul 01) |

## Pertemuan 1: HTML Semantic + CSS Flexbox/Grid + Responsive Design

### Tujuan
- Menulis HTML semantic (header, nav, main, section, article, footer)
- Layout menggunakan CSS Flexbox & Grid
- Membuat responsive design tanpa framework

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | **Apersepsi**: Buka 3 website — identifikasi struktur layoutnya | Observasi | Browser |
| 20' | **HTML semantic**: header, nav, main, section, article, footer — struktur halaman | Ceramah + demo | Live code, slide |
| 20' | **CSS Flexbox**: display:flex, justify-content, align-items | Ceramah + demo | Live code + flexboxfroggy.com |
| 15' | **CSS Grid**: grid-template-columns, gap, area | Ceramah + demo | Live code + cssgridgarden.com |
| 20' | **Praktik**: Layout halaman profil pribadi — header, nav, content, footer | Hands-on | Starter code HTML |
| 5' | **Refleksi**: Kapan pake Flexbox vs Grid? | Q&A | — |

### Bahan Ajar
- [Module 04 - HTML & CSS](../04-web-basics/01-html-css.md)

---

## Pertemuan 2: Tailwind CSS + Dark Mode + Deploy

### Tujuan
- Menggunakan Tailwind utility classes untuk styling cepat
- Implementasi dark mode
- Deploy halaman ke Vercel

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 5' | **Review layout CSS** | Kuis | — |
| 20' | **Tailwind intro**: utility-first, install, config | Ceramah + demo | Live code |
| 15' | **Dark mode**: class strategy, toggle button | Ceramah + demo | Live code |
| 15' | **Custom config**: tailwind.config, theme extend, colors | Ceramah | Live code |
| 25' | **Praktik**: Convert halaman CSS manual → Tailwind + dark mode | Hands-on | Starter CSS project |
| 10' | **Deploy ke Vercel**: push GitHub, connect, live! | Demo + praktik | Vercel.com |
| 5' | **Refleksi**: Utility-first vs semantic CSS — suka mana? | Diskusi | — |

### Bahan Ajar
- [Module 04 - Tailwind](../04-web-basics/02-tailwind.md)

---

## Pertemuan 3: DOM Manipulation, Events, Fetch API & Dashboard

### Tujuan
- Memanipulasi DOM dengan JavaScript (querySelector, innerHTML, classList)
- Menangani event (click, submit, keyup)
- Fetch data dari API publik dan tampilkan di halaman

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | **Review Tailwind + deploy** | Show & tell — cek hasil deploy siswa | Browser |
| 20' | **DOM**: getElement, innerHTML, createElement, classList, template literal | Ceramah + demo | Live code |
| 15' | **Events**: click, submit, keyup, addEventListener, event delegation | Ceramah + demo | Live code |
| 20' | **Fetch API**: GET data, tampilkan di table/card, loading state | Ceramah + demo | Live code + public API |
| 20' | **Praktik**: Dashboard — fetch dari dummyAPI, tampilkan 10 item dalam card grid | Hands-on | Starter HTML |
| 5' | **Refleksi**: Satu fitur keren yang bakal ditambahin ke landing page | Q&A | — |

### Bahan Ajar
- [Module 04 - DOM & Fetch](../04-web-basics/03-dom-fetch.md)
