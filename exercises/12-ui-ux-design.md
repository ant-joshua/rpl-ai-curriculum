# UI/UX Design — Latihan

## Level 1: Dasar

### Soal 1 — Wireframe Critique
Berikut adalah wireframe kasar halaman checkout sebuah e-commerce:

```
+------------------------------------------+
|  KERANJANG BELANJA            [x] close  |
+------------------------------------------+
|  Item A                       Rp 50.000   |
|  Item B                       Rp 30.000   |
|  Item C                       Rp 20.000   |
+------------------------------------------+
|  [ ] Saya setuju dengan syarat & ketentuan|
+------------------------------------------+
|  Total: Rp 100.000                        |
|  [Pilih Pembayaran] [Beli Sekarang]      |
+------------------------------------------+
```

Identifikasi minimal 3 masalah usability dari wireframe di atas. Berikan saran perbaikan untuk masing-masing.

### Soal 2 — Persona Creation
Buat **user persona** untuk aplikasi **mobile banking** yang menyasar segmen mahasiswa (18-25 tahun). Minimal mencakup:

- Nama (fiktif), umur, pekerjaan
- Goals finansial
- Pain points dengan mobile banking saat ini
- Daily digital habits
- Skenario penggunaan (user story singkat: "Sebagai ..., saya ingin ... sehingga ...")

### Soal 3 — Visual Hierarchy
Anda mendesain halaman **dashboard monitoring** untuk admin yang menampilkan:

1. Jumlah user aktif hari ini (angka besar, prioritas tinggi)
2. Grafik revenue 7 hari terakhir
3. Daftar notifikasi (5 item terbaru)
4. Tombol "Export Report"
5. Menu navigasi sidebar

Urutkan elemen di atas berdasarkan visual hierarchy. Jelaskan penggunaan tipografi, warna, whitespace, dan positioning untuk memperkuat hierarchy tersebut.

## Level 2: Intermediate

### Soal 4 — Accessibility Audit
Audit halaman login berikut berdasarkan prinsip WCAG 2.1:

```html
<form>
  <p>Silakan login</p>
  <input id="email" placeholder="Email" />
  <input id="pass" type="password" placeholder="Password" />
  <button style="color: #ccc; background: #eee;">Login</button>
</form>
```

Temukan minimal **5 pelanggaran aksesibilitas**. Untuk setiap pelanggaran, sebutkan:
- Prinsip WCAG yang dilanggar (Perceivable, Operable, Understandable, Robust)
- Tingkat keparahan (A, AA, AAA)
- Cara memperbaiki

### Soal 5 — Mobile-First vs Desktop-First
Anda mendesain ulang portal berita yang 70% trafiknya dari mobile.

- Buat **mobile-first** layout strategy untuk halaman artikel
- Tentukan breakpoints (min-width)
- Komponen mana yang dihide/diubah di desktop vs mobile
- Gambarkan wireframe untuk mobile (320px), tablet (768px), dan desktop (1280px)

Gunakan grid system (bisa Tailwind, Bootstrap, atau custom flexbox).

### Soal 6 — UX Writing
Halaman error aplikasi saat ini menampilkan:

> **Error 500**
> Terjadi kesalahan internal

Tulis ulang pesan error di atas untuk 3 konteks berbeda:

1. **Pengguna umum** — friendly, reassuring, ada action
2. **Teknisi/internal admin** — informatif, technical detail
3. **404 (halaman tidak ditemukan)** — creative, tetap informatif

Sertakan microcopy untuk tombol/link yang mendampingi pesan tersebut.

## Level 3: Challenge

### Soal 7 — Desain Sistem Design System
Buat proposal **Design System** untuk startup yang akan membangun 3 produk:
1. Dashboard admin (web)
2. Aplikasi customer (mobile)
3. Portal partner (web)

Minimal mencakup:
- **Design tokens**: warna primer, sekunder, semantic colors, spacing scale (4px basis), type scale
- **Komponen atom**: Button (size, variant, state), Input, Badge
- **Guidelines**: kapan pakai modal vs drawer, kapan pakai table vs card
- **Handoff strategy**: Figma → Storybook → code (bagaimana maintain konsistensi)

### Soal 8 — A/B Testing Proposal
Anda ingin meningkatkan **konversi halaman pendaftaran** yang saat ini 3,2%. Proposal A/B test:

1. **Hipotesis**: apa yang diubah? mengapa?
2. **Variant A** (kontrol): halaman saat ini
3. **Variant B** (treatment): gambarkan wireframe perubahannya
4. **Metrik**: primary metric, secondary metric, guardrail metric
5. **Sample size**: estimasi jumlah user per variant (dengan power 80%, alpha 5%)
6. **Durasi**: berapa hari berjalan
7. **Risiko**: apa yang bisa salah? novelty effect? segmentasi?
