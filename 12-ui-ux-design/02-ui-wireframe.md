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

---

## Responsive Breakpoints — Desain untuk Semua Layar

Bikin desain yang adaptif di semua ukuran layar.

### Breakpoint Standar

| Device | Lebar | Grid Kolom | Approach |
|--------|-------|-----------|----------|
| Mobile S | 320px | 4 | Mobile-first |
| Mobile L | 375-414px | 4 | Mobile-first |
| Tablet | 768px | 8 | Expand layout |
| Desktop | 1024px | 12 | Full layout |
| Wide | 1440px+ | 12 | Max-width container |

### Mobile-First vs Desktop-First

```css
/* Mobile-first: mulai dari layar kecil */
.container {
  padding: 16px;
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .container {
    padding: 24px;
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .container {
    grid-template-columns: repeat(3, 1fr);
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

### Cara Implementasi di Figma

1. **Constraints** (Properti panel) — atur pin
   - Pin ke kiri: elemen tetap di kiri pas resize
   - Pin ke kanan: elemen tetap di kanan
   - Scale: elemen nge-stretch proporsional
   - Center: tetap di tengah

2. **Auto Layout** — set "Fill" biar ngisi container

3. **Layout Grid** (Shift+G) — pake grid sesuai breakpoint

4. **Frame terpisah** — lebih aman: bikin frame mobile dan desktop sendiri

---

## Design Tokens — Bahasa Visual yang Konsisten

Design tokens = variables visual yang dipake di seluruh produk. Kayak CSS custom properties tapi untuk design.

### Jenis Design Tokens

| Kategori | Contoh Token | Value |
|----------|-------------|-------|
| Color | `color.primary.500` | #2563EB |
| Color | `color.neutral.100` | #F9FAFB |
| Spacing | `spacing.sm` | 8px |
| Spacing | `spacing.lg` | 24px |
| Typography | `font.size.h1` | 39px |
| Typography | `font.weight.bold` | 700 |
| Border | `border.radius.md` | 8px |
| Shadow | `shadow.sm` | 0 2px 4px rgba(0,0,0,0.1) |

### Hierarki Token

```
Global Tokens (primitives)
├── color.blue.500
├── size.16
└── font.sans

Alias Tokens (semantic)
├── color.primary ← alias ke color.blue.500
├── spacing.card-padding ← alias ke size.16
└── font.body ← alias ke font.sans

Component Tokens (spesifik)
├── button.primary.bg ← alias ke color.primary
├── button.primary.padding ← alias ke spacing.card-padding
└── card.shadow ← alias ke shadow.sm
```

### Kenapa Design Tokens?

1. **Konsisten** — satu sumber kebenaran untuk warna, spacing, font
2. **Cepat** — ganti 1 token, efek ke semua komponen
3. **Kolaborasi** — designer & developer pake bahasa yang sama
4. **Theming** — ganti token buat dark mode / brand lain

### Tools Design Tokens

| Tool | Fungsi | Import/Export |
|------|--------|---------------|
| Figma Tokens (plugin) | Bikin & manage tokens di Figma | JSON, CSS variables |
| Style Dictionary | Convert tokens ke berbagai format | JSON → CSS/SCSS/Swift/Kotlin |
| Theme UI | Design system utility untuk CSS-in-JS | JavaScript object |

**Contoh ekspor tokens ke CSS:**

```css
:root {
  --color-primary: #2563EB;
  --color-secondary: #7C3AED;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --font-size-h1: 39px;
  --font-size-body: 16px;
  --border-radius-md: 8px;
}

.button {
  background: var(--color-primary);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-body);
}
```

---

## Figma Components & Auto Layout — Praktik

### Auto Layout Shortcut

| Aksi | Windows/Linux | Mac |
|------|--------------|-----|
| Auto Layout on/off | Shift + A | Shift + A |
| Tambah frame | F | F |
| Constraints | Panel Properties | Panel Properties |
| Nudge 1px | Arrow keys | Arrow keys |
| Nudge 10px | Shift + Arrow | Shift + Arrow |

### Component Properties

Figma modern punya 3 jenis component properties:

| Property | Fungsi | Contoh |
|----------|--------|--------|
| **Text** | Teks yang bisa diganti | Label tombol, judul card |
| **Boolean** | Toggle on/off | Icon visibility, state aktif |
| **Instance swap** | Ganti instance | Icon set, avatar pilihan |

**Contoh setup tombol proper:**

```
Button/
├── Properties:
│   ├── Text: "Tombol" (text property)
│   ├── Icon: true/false (boolean — show/hide icon)
│   ├── State: Default/Hover/Disabled (variant)
│   └── Type: Primary/Secondary/Ghost (variant swap)
```

### Variants — Multi-state Components

Bikin 1 komponen dengan banyak state:

1. Pilih 2+ komponen
2. Klik "Combine as variants" di panel
3. Set property seperti "State = Default / Hover / Pressed / Disabled"
4. Pake di design — tinggal ganti variant dari panel kanan

### Nested Components

Komponen di dalam komponen. Contoh: Button → di dalam Card → di dalam ProductCard.

```
ProductCard (component)
├── Image (instance)
├── Title (text property)
├── Price (text property)
└── Button (instance — bisa ganti variant)
```

---

## Design Handoff — Jembatan Designer → Developer

### Yang Developer Butuh

| Item | Format | Contoh |
|------|--------|--------|
| Spacing & sizing | Auto Layout, constraints | padding 16px, gap 12px |
| Color styles | Figma color styles (bukan hex manual) | `primary/default` |
| Font styles | Figma text styles | `heading/h1` |
| Assets | SVG untuk icon, PNG/WebP untuk gambar | `icons/search.svg` |
| Specs | Figma Inspect panel | Otomatis dari design |
| Copy | Paste teks final | Jangan "lorem ipsum" |

### Handoff Checklist

```
□ Semua color styles tersimpan di Figma
□ Semua text styles terdefinisi
□ Auto layout dipake di semua komponen (bukan manual spacing)
□ Icon dalam format SVG (bukan PNG)
□ Frame mobile + desktop (kalo perlu)
□ Flow prototype minimal happy path terhubung
□ Nama layer jelas — bukan "Frame 123", "Rectangle 4"
□ Sticky note untuk hal yang perlu diklarifikasi
□ Font sudah di-export atau link Google Fonts disertakan
□ Assets sudah di-group di page "Assets" atau "Handoff"
```

### Export Assets

```typescript
// Developer bisa generate komponen dari Figma API
// Contoh: export icons via Figma REST API
const figmaToken = process.env.FIGMA_ACCESS_TOKEN;
const fileId = 'abc123';
const response = await fetch(
  `https://api.figma.com/v1/files/${fileId}/images`,
  { headers: { 'X-Figma-Token': figmaToken } }
);
const data = await response.json();
// response berisi URL download SVG tiap komponen
```

### Tools Handoff

| Tool | Kelebihan |
|------|-----------|
| Figma Inspect | Bawaan, gratis, support code generation |
| Zeplin | Spek otomatis, asset export, kolaborasi |
| Avocode (now Supernova) | Design-to-code pipeline |
| Specify | Design tokens + asset management |

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

5. **Design tokens setup.** Bikin file JSON design tokens untuk aplikasi e-commerce. Minimal: 3 warna, 4 spacing, 4 font size, 3 border radius. Tulis juga output CSS variables-nya.

6. **Component variants di Figma.** Bikin 1 komponen Button dengan 4 variants (Primary/Secondary/Ghost/Danger). Masing-masing punya state Default + Hover + Disabled. Screenshoot komponen panel. Catat perbedaan antar variants.

7. **Handoff simulation.** Ambil 1 screen dari proyek lo. Tulis handoff document: daftar color styles, text styles, spacing grid, dan assets yang perlu di-export. Kasih juga catatan untuk developer tentang behavior (hover, loading, error state).
