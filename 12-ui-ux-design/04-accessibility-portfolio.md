# 4.1 Accessibility & Portfolio — WCAG, ARIA, Semantic HTML, Portfolio

Design yang bagus tapi gak accessible = ngecualin jutaan user. Portfolio yang bagus tapi gak terstruktur = gak dilirik HRD. Sesi ini tutupin dua sisi itu.

---

## WCAG Guidelines

WCAG (Web Content Accessibility Guidelines) adalah standar internasional aksesibilitas web. Versi sekarang: **WCAG 2.2**.

### 4 Prinsip WCAG — POUR

| Prinsip | Arti | Contoh |
|---------|------|--------|
| **P**erceivable | User bisa *melihat/mendengar* konten | Alt text, caption video |
| **O**perable | User bisa *navigasi* konten | Keyboard nav, cukup waktu |
| **U**nderstandable | User bisa *mengerti* konten | Bahasa jelas, error jelas |
| **R**obust | Konten bisa diakses *berbagai alat* | Screen reader, browser lama |

### Level Kepatuhan

| Level | Minimal | Contoh |
|-------|---------|--------|
| A | Essential | Alt text, label form |
| AA | Standard (target kita) | Contrast 4.5:1, caption video |
| AAA | Advanced | Contrast 7:1, sign language |

**Target minimal untuk proyek SMK: WCAG AA.**

---

## Semantic HTML

Semantic HTML = pake elemen HTML sesuai maknanya, bukan cuma `<div>` semua.

### Semantic vs Non-Semantic

| ❌ Non-Semantic | ✅ Semantic |
|----------------|------------|
| `<div>Navigasi</div>` | `<nav>` |
| `<div>Artikel</div>` | `<article>` |
| `<div>Footer</div>` | `<footer>` |
| `<div class="header">` | `<header>` |
| `<span onclick="...">` | `<button>` |
| `<div class="list">` | `<ul>` / `<ol>` |

### Kenapa Semantic HTML?

1. **Screen reader** bisa navigasi dengan benar
2. **SEO** lebih baik
3. **Keyboard navigation** jadi otomatis (tab, enter)
4. **Code lebih readable** — struktur langsung kebaca tanpa liat CSS

### Contoh: Form Accessible

```html
<!-- ❌ BURUK -->
<div>
  <span>Nama</span>
  <div><input type="text"></div>
</div>

<!-- ✅ BAIK -->
<label for="nama">Nama Lengkap</label>
<input type="text" id="nama" name="nama" required aria-required="true">
```

---

## ARIA (Accessible Rich Internet Applications)

ARIA = atribut tambahan untuk aksesibilitas saat HTML semantic aja gak cukup.

### Aturan ARIA

1. **Jangan pake ARIA kalo HTML semantic udah cukup.** ` <button> ` > `<div role="button">`
2. **Gak ubah visual** — ARIA cuma nambah info untuk screen reader
3. **Test dengan screen reader** — jangan cuma nambah asal

### ARIA yang Sering Dipake

| Atribut | Fungsi | Contoh |
|---------|--------|--------|
| `aria-label` | Label untuk ikon/tombol tanpa teks | `<button aria-label="Tutup">X</button>` |
| `aria-hidden="true"` | Sembunyiin dari screen reader | Ikon dekoratif |
| `aria-expanded` | Apakah menu lagi kebuka | `<button aria-expanded="false">` |
| `aria-required` | Field wajib diisi | `<input aria-required="true">` |
| `aria-live` | Konten dinamis (notifikasi, error) | `<div aria-live="polite">` |
| `role` | Makna elemen (role="alert", "dialog") | `<div role="alert">Error!</div>` |

### Contoh ARIA Praktis

```html
<!-- Tombol dengan icon aja -->
<button aria-label="Cari">
  <img src="search-icon.svg" alt="">
</button>

<!-- Modal / Dialog -->
<div role="dialog" aria-labelledby="modal-title" aria-modal="true">
  <h2 id="modal-title">Konfirmasi Hapus</h2>
  <p>Yakin mau hapus data ini?</p>
  <button>Ya</button>
  <button>Tidak</button>
</div>

<!-- Error form -->
<input type="email" aria-describedby="email-error" aria-invalid="true">
<span id="email-error" role="alert">Email tidak valid</span>
```

---

## Color Contrast & Color Blindness

### Contrast Ratio Minimal

| Tipe Teks | WCAG AA | WCAG AAA |
|-----------|---------|----------|
| Teks normal (<18px atau <14px bold) | 4.5:1 | 7:1 |
| Teks besar (≥18px bold atau ≥24px) | 3:1 | 4.5:1 |

### Tools Cek Kontras

- **WebAIM Contrast Checker** (webaim.org/resources/contrastchecker)
- **Figma plugin: Contrast** (langsung di Figma)
- **Coolors Contrast Checker**

### Color Blindness

~8% pria punya buta warna (paling sering merah-hijau).

**Yang gak boleh:**

```
❌ Tombol merah (aktif) dan hijau (nonaktif) — gak kebedain
❌ "Biru untuk link" — pake underline juga
❌ Grafik cuma pake warna merah vs hijau
```

**Solusi:**
- Pake ikon + warna, bukan warna aja
- Tambah text label di grafik
- Pake pola/pattern sebagai pembeda kedua

---

## Keyboard Navigation

User harus bisa navigasi SEMUA fitur pake keyboard doang.

### Yang Wajib

| Tombol | Fungsi |
|--------|--------|
| Tab | Pindah ke elemen berikutnya |
| Shift + Tab | Mundur ke elemen sebelumnya |
| Enter / Space | Aktifkan tombol/link |
| Escape | Tutup modal/dropdown |
| Arrow keys | Navigasi dalam list/radio |

### Focus Indicator

Jangan hapus `outline` tanpa ganti!

```css
/* ❌ BURUK */
*:focus { outline: none; }

/* ✅ BAIK — custom focus style */
*:focus-visible {
  outline: 2px solid #2563EB;
  outline-offset: 2px;
}
```

---

## Screen Reader

Screen reader (JAWS, NVDA, VoiceOver) bacain konten dari kiri ke kanan, atas ke bawah. Urutan elemen di HTML = urutan yang dibaca.

### Tips

1. **Urutan HTML = urutan visual.** Jangan andelin CSS position absolute buat ngatur urutan baca
2. **Gambar > alt text.** `alt=""` kalo gambar dekoratif
3. **Heading level jangan lompat.** Jangan h1 → h3 → h2. Urut: h1 → h2 → h3
4. **Link > teks deskriptif.** Jangan "Klik di sini". Pake "Lihat detail pesanan"

### Testing

```
1. Matiin mouse
2. Navigasi pake Tab doang
3. Bisa akses SEMUA fitur?
4. Kalo engga — fix HTML/ARIA
```

---

## Portfolio UI/UX

Portfolio itu bukti, bukan klaim. Jangan cuma bilang "bisa Figma" — tunjukin.

### Struktur Portfolio Minimal

| Halaman | Isi |
|---------|-----|
| Tentang | Nama, role, 2-3 kalimat value proposition |
| Karya (case study) | 2-3 proyek terbaik |
| Skill | Figma, research, prototyping, design system |
| Kontak | Email, LinkedIn, Dribbble/Behance (kalo ada) |

### Case Study Format

1. **Judul & Role** — aplikasi apa, peran lo apa
2. **Masalah** — problem statement + riset yang lo lakuin
3. **Proses** — lo-fi → hi-fi → prototype. Screenshoot tiap tahap
4. **Solusi** — final design, prototype link
5. **Dampak** — kuantitatif kalo bisa (user test, feedback)

### Tips Portfolio

- **Kualitas > kuantitas.** 2 proyek solid > 10 proyek setengah jadi
- **Screenshot lo-fi penting.** HRD mau liat proses, bukan cuma hasil akhir
- **Link Figma prototype** — embed atau link view-only
- **Deskripsi singkat** — gak butuh paragraf 500 kata. 3-4 bullet point cukup
- **Platform:** Dribbble, Behance, atau website sendiri (Next.js + Tailwind = portfolio itu sendiri proof of skill)

### Contoh Outline Case Study

```
# Aplikasi Catatan Keuangan — Rina

**Role:** UI/UX Designer (solo proyek, 2 minggu)
**Tools:** Figma, Google Forms, Whimsical

## Masalah
Ibu rumah tangga susah tracking pengeluaran harian, gak ada catatan terpusat.

## Riset
Wawancara 3 orang. Empathy map → Problem statement: "Ibu butuh catat pengeluaran cepat karena sibuk."

## Proses Desain
[Lo-fi wireframe screenshot]
[Mid-fi di Figma]
[Hi-fi final]

## Desain System
5 komponen: Button, Input, Card, Navbar, Modal

## Prototype
[Link Figma prototype]

## Yang Aku Pelajari
- User lebih milih tapping daripada ngetik
- Contrast merah-hijau gak accessible — diganti ikon + warna
```

---

## Latihan

1. **Audit aksesibilitas.** Ambil 1 halaman website (bisa punya sendiri atau contoh). Cek: apakah ada alt text? Apakah contrast ratio ≥ 4.5:1? Bisakah navigasi pake Tab doang? Tulis 3 temuan dan perbaikannya.

2. **Refactor HTML jadi semantic.** Ambil kode HTML berikut dan ubah jadi semantic + ARIA:
   ```html
   <div class="header">
     <div class="nav">
       <span onclick="goHome()">Beranda</span>
       <span onclick="goProfile()">Profil</span>
     </div>
   </div>
   <div class="main">
     <div class="title">Selamat Datang</div>
     <div class="card">...</div>
     <div class="btn" onclick="submit()">Kirim</div>
   </div>
   ```

3. **Bikin outline portfolio.** Tulis struktur portfolio lo sendiri: nama, role, 2 proyek (judul + masalah + tools yang dipake), skill, kontak. Format markdown.

4. **Cek kontras warna.** Ambil 3 pasang warna dari proyek lo sebelumnya. Cek di WebAIM Contrast Checker. Tulis: pasangan warna, ratio, lulus/tidak AA. Kalo gak lulus, kasih usulan warna baru.
