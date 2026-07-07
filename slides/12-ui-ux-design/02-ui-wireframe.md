---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — <img src="https://images.pexels.com/photos/196644/pexels-pho"
footer: "Sesi 02: Ui Wireframe"
---

<!-- _class: title -->
# 2.1 UI Principles & Wireframing — Layout, Color, Typography, Grid

Wireframing = kerangka aplikasi. UI principles = aturan main biar kerangka itu gak jelek. Dua skill ini yang nentuin aplikasi lo keliatan profesional atau keliatan tugas sekolah.

---

## Layout Principles

### Alignment

Setiap elemen harus punya hubungan visual dengan elemen lain. Gak boleh asal naro.

```
❌ BURUK              ✅ BAIK
Tombol Login          Tombol Login
Email              Email
Password           Password
   Lupa Password?  Lupa Password?
```

Gunakan **grid alignment** — elemen rata kiri/kanan, bukan center semua.

### Hierarchy

Bikin user tau mana yang penting duluan. Ukuran, posisi, dan weight font nentuin hierarki.

```
❌ RATA SEMUA        ✅ HIERARKI
Judul 16px           Judul 32px bold
Isi 16px             Isi 16px regular
Tombol 16px          Tombol 18px semibold
```

### Contrast

Elemen penting harus beda secara visual dari yang lain.

```
❌ LOW CONTRAST      ✅ GOOD CONTRAST
Button abu-abu       Button biru terang
di bg putih          di bg putih
Teks #999            Teks #1A1A1A
di bg putih          di bg putih
```

### Repetition

Pake pola yang sama untuk elemen sejenis. Konsistensi = kepercayaan.

```
❌ TIDAK KONSISTEN   ✅ REPETITION
Card border 1px      Semua card border 1px
Card border 2px      Semua shadow sama
Card border 0px      Semua radius 8px
```

### Proximity

Elemen yang berelasi dideketin. Elemen gak berelasi dijauhin.

```
❌ SEMUA BERANTAKAN  ✅ PROXIMITY
Label                [Label]
Input                [Input]
Button               [Button]
---spasi besar---
Label                [Label]
Input                [Input]
Button               [Button]
```

---

## Color Theory

### HSL — Cara Praktis Ngatur Warna

HSL lebih intuitif daripada HEX untuk design. Struktur: `hsl(hue, saturation, lightness)`.

| Komponen | Rentang | Fungsi |
|----------|---------|--------|
| Hue (0-360) | 0=Merah, 120=Hijau, 240=Biru | Pilih warna dasar |
| Saturation (0-100%) | 0%=Abu-abu, 100%=Murni | Atur intensitas |
| Lightness (0-100%) | 0%=Hitam, 100%=Putih | Atur terang/gelap |

### Palet Minimal

| Kategori | Contoh | Jumlah |
|----------|--------|--------|
| Primary | Biru (#2563EB) | 1 warna |
| Secondary | Ungu (#7C3AED) | 1 warna |
| Neutral | #1A1A1A, #6B7280, #F9FAFB | 3-5 shade |
| Semantic | Hijau/Sukses, Merah/Error, Kuning/Warning | 3-4 warna |

### Aturan 60-30-10

- **60%** Neutral (background, teks, border)
- **30%** Primary + Secondary (komponen utama)
- **10%** Accent (CTA, tombol penting, highlight)

### Tools Palet

- **Coolors.co** — generate palet cepat
- **Color Hunt** — curated palet
- **Figma plugin: Contrast** — cek aksesibilitas langsung

---

## Typography

### Hierarki Font

| Level | Ukuran (base 16px × 1.25) | Weight |
|-------|---------------------------|--------|
| H1 | 39px (atau 2.5rem) | Bold |
| H2 | 31px (2rem) | Bold |
| H3 | 25px (1.5rem) | Semibold |
| H4 | 20px (1.25rem) | Semibold |
| Body | 16px (1rem) | Regular |
| Caption | 12-14px (0.75-0.875rem) | Regular |

### Font Pairing

Max 2 font per proyek.

| Kombinasi | Cocok buat |
|-----------|------------|
| Inter (heading) + Roboto (body) | UI modern, aman |
| Poppins (heading) + Nunito (body) | Aplikasi playful |
| Playfair Display (heading) + Source Sans (body) | Landing page elegan |
| JetBrains Mono | Dashboard/developer tools |

### 4-Px Rule

Spacing, padding, margin, border-radius = kelipatan 4px.

```
padding: 16px  (✓)
gap: 12px       (✓ — 12 = 4×3)
margin: 10px    (✗ — 10 bukan kelipatan 4)
border-radius: 8px (✓)
```

**Kenapa 4px?** Mayoritas layar modern (375px, 414px, 768px, 1440px) habis dibagi 8. Kelipatan 4 = stabil di scaling dan grid.

---

## Wireframing

### Low-Fidelity Wireframe

Gak usah warna, gak usah font beneran. Cuma kotak, garis, placeholder.

```
Contoh lo-fi screen login:

┌──────────────────────────┐
│         [LOGO]           │
│                          │
│   ┌──────────────────┐   │
│   │ Email             │   │
│   └──────────────────┘   │
│   ┌──────────────────┐   │
│   │ Password          │   │
│   └──────────────────┘   │
│                          │
│   ┌──────────────────┐   │
│   │    MASUK          │   │
│   └──────────────────┘   │
│                          │
│   Lupa Password?         │
└──────────────────────────┘
```

**Tools:** Kertas + spidol, Balsamiq, Figma shape dasar.

### Mid-Fidelity

Mulai pake grayscale, ukuran font beda, spacing konsisten. Grid 8/12 kolom mulai dipake.

### High-Fidelity Wireframe

Warna asli, font real, ikon, gambar. Komponen Figma udah auto layout.

### Progresi yang Benar

```
Brainstorm → Lo-fi sketsa → review user → Mid-fi → review lagi → Hi-fi → handoff
```

### Good vs Bad UI — Contoh

| Aspek | ❌ Bad UI | ✅ Good UI |
|-------|-----------|------------|
| Tombol | Tombol abu-abu di bg putih, gak ada shadow | Tombol colorful, hover state, shadow ringan |
| Form | Label di atas, input beda lebar | Label + input grouping, lebar seragam, error state |
| Navigasi | 12 menu di navbar, semua warna beda | Max 5 menu, hierarki jelas, aktif state terbaca |
| Warna | Teks #999 di bg putih | Teks #1A1A1A contrast cukup |
| Spacing | Semua rapet, gak ada napas | Padding 16px, margin antar section konsisten |

---

## Latihan

1. **Redesign UI jelek.** Cari 1 screenshot aplikasi (bisa dari Play Store review yang ngeluh). Identifikasi 3 masalah layout (alignment, hierarchy, atau proximity). Tulis perbaikannya dalam format markdown.

2. **Bikin palet warna** untuk aplikasi catatan keuangan. Gunakan Coolors.co atau Color Hunt. Tulis: primary, secondary, 3 neutral shades, 3 semantic colors. Sertakan kode HEX.

3. **Buat low-fidelity wireframe** (kertas atau Figma) untuk screen dashboard aplikasi jadwal pelajaran. Gambar di kertas dan foto, atau screenshoot dari Figma. Minimal 5 elemen (navbar, card, list, button, search).

4. **Pairing font.** Pilih 2 font dari Google Fonts untuk aplikasi todo. Tulis alasan kenapa pasangan itu cocok. Terapkan 4px rule untuk spacing minimal 3 elemen di mockup lo.
