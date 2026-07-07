# Week 01: Basic HTML — Landing Page dengan Flexbox & Grid

## Tujuan

Membangun landing page responsif menggunakan **Flexbox** dan **CSS Grid** berdasarkan Figma mockup. Challenge ini menguji kemampuan kamu dalam:
- Menerjemahkan desain visual (Figma) ke kode HTML/CSS
- Menggunakan Flexbox untuk layout satu dimensi
- Menggunakan CSS Grid untuk layout dua dimensi
- Menerapkan responsivitas dengan media queries

## Acceptance Criteria

- [ ] Landing page memiliki **header**, **hero section**, **features grid**, dan **footer**
- [ ] Navigasi header menggunakan **Flexbox** (logo, menu, CTA button)
- [ ] Features section menggunakan **CSS Grid** (min 4 card, 2 kolom di desktop)
- [ ] Hero section memiliki **heading**, **subheading**, dan **CTA button**
- [ ] Footer berisi link sosial media dan copyright
- [ ] **Responsif**: grid berubah jadi 1 kolom di mobile (< 768px)
- [ ] Semua file ada di folder `challenges/submissions/week-01/nama-kamu/`
- [ ] Kode HTML valid (tanpa error di W3C validator)
- [ ] Tidak menggunakan framework CSS (Tailwind, Bootstrap, dll)

## Step-by-Step

1. **Setup folder**: Buat folder `challenges/submissions/week-01/nama-kamu/`
2. **HTML structure**: Buat `index.html` dengan struktur:
   - `<nav>` untuk header
   - `<section id="hero">` untuk hero
   - `<section id="features">` untuk grid fitur
   - `<footer>` untuk footer
3. **CSS styling**: Buat `style.css` dengan:
   - Reset CSS dasar (box-sizing, margin, padding)
   - Flexbox di header (logo kiri, menu kanan)
   - CSS Grid di features section (2 kolom, gap 24px)
   - Styling hero: background gradient, font besar
4. **Responsivitas**: Tambahkan media query `@media (max-width: 768px)`
   - Grid features jadi 1 kolom
   - Menu navigasi jadi hamburger atau stacked
5. **Finishing touch**: Tambah hover effects, smooth scroll, dan favicon

### Figma Mockup (Referensi)

Buat desain sendiri atau tiru layout berikut:

```
┌──────────────────────────────────────────┐
│ [LOGO]      Home  About  Features  Login │
├──────────────────────────────────────────┤
│                                          │
│   🚀 Heading Utama di Sini               │
│   Subheading menjelaskan value prop      │
│   [Get Started →]                        │
│                                          │
├──────────────────────────────────────────┤
│ ┌─────────┐  ┌─────────┐                │
│ │ Feature │  │ Feature │                │
│ │    1    │  │    2    │                │
│ └─────────┘  └─────────┘                │
│ ┌─────────┐  ┌─────────┐                │
│ │ Feature │  │ Feature │                │
│ │    3    │  │    4    │                │
│ └─────────┘  └─────────┘                │
├──────────────────────────────────────────┤
│ © 2025  ·  GitHub  ·  LinkedIn  ·  Email │
└──────────────────────────────────────────┘
```

## Bonus (Optional)

- ✅ Animasi fade-in saat scroll (Intersection Observer)
- ✅ Dark mode toggle
- ✅ Deploy ke GitHub Pages atau Vercel
- ✅ Aksesibilitas: skip link, aria labels, semantic HTML

## Submission

```
challenges/submissions/week-01/nama-kamu/
├── index.html
├── style.css
└── (assets/ jika ada gambar)
```

Buat Pull Request dengan judul `[Week 01] Landing Page - Nama Kamu` dan sertakan screenshot.
