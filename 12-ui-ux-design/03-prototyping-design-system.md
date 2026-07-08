# 3.1 Prototyping & Design System — Figma Interactive, Komponen, Handoff

Dari desain statis ke prototype interaktif. Dari komponen scattered ke design system yang terstruktur. Ini yang nentuin desain lo bisa dipake developer atau cuma jadi hiasan Figma.

---

## Interactive Prototyping di Figma

### Dasar Prototyping

1. **Pilih elemen** (tombol, card, icon)
2. **Seret node biru** (⚡) ke frame tujuan
3. **Set trigger + action** di sidebar

### Trigger Types

| Trigger | Kapan Terjadi | Contoh |
|---------|---------------|--------|
| On Click | User klik elemen | Tombol login → dashboard |
| On Hover | User hover mouse | Tooltip muncul |
| While Pressing | User tahan klik | Tombol scale efek |
| After Delay | Otomatis setelah X detik | Splash screen → home |
| Drag | User drag elemen | Swipe card, drag slider |

### Smart Animate

Smart animate ngebaca perubahan properti (posisi, ukuran, opacity, rotation) dan **menginterpolasi** antar frame.

Cara pake:
1. Buat 2 frame dengan nama layer SAMA
2. Set prototype connection
3. Pilih animation: **Smart Animate**
4. Atur durasi: **250-300ms**, easing: **Ease In-Out**

**Contoh:** Navbar collapse → nama layer sama "navbar-container", ubah height. Figma otomatis animate.

### Flow yang Bener

```
Splash → Login → Dashboard → Detail → (back) → Dashboard
```

Gak perlu connect semua screen sekaligus — cukup flow utama (happy path).

---

## Design System

Design system = bahasa visual bersama antara designer & developer. Tanpa ini, tiap halaman punya "style sendiri" dan produk keliatan amburadul.

### Komponen Minimal Design System

| Kategori | Komponen | State |
|----------|----------|-------|
| Button | Primary, Secondary, Ghost, Icon-only | Default, Hover, Active, Disabled |
| Input | Text, Password, Search, Textarea, Select | Default, Focus, Error, Disabled |
| Card | Default, Clickable, Selected | — |
| Navigation | Top Nav, Bottom Tab, Sidebar | Active, Inactive |
| Feedback | Alert (success, error, warning, info), Toast, Modal | — |

### Bikin Design System di Figma

1. **Colors** → Figma Color Styles
   ```
   primary/default  → #2563EB
   primary/hover    → #1D4ED8
   neutral/100      → #F9FAFB
   neutral/500      → #6B7280
   neutral/900      → #1A1A1A
   semantic/success → #10B981
   semantic/error   → #EF4444
   ```

2. **Typography** → Figma Text Styles
   ```
   heading/h1 → 39px Bold, line-height 120%
   heading/h2 → 31px Bold, line-height 120%
   body/large → 16px Regular, line-height 150%
   body/small → 14px Regular, line-height 150%
   caption    → 12px Regular, line-height 150%
   ```

3. **Components** → Figma Components
   - Gunakan **Auto Layout** (Shift+A) untuk semua komponen
   - Buat **Variants** untuk setiap state
   - Naming: `Button/Primary`, `Button/Secondary`, `Input/Default`, `Input/Error`

### Naming Convention

```
Kategori/Varian/State
Button/Primary/Default
Button/Primary/Hover
Button/Primary/Disabled
Input/Text/Default
Input/Text/Focus
Input/Text/Error
```

### Anti-pattern Design System

| ❌ Salah | ✅ Benar |
|----------|----------|
| Nama `Button-v2-final` | `Button/Primary/Default` |
| Komponen tanpa auto layout | Auto layout + padding + spacing |
| 3 versi button sama | 1 komponen dengan variants |
| Gak ada documentation | Tulis kapan pake A vs B |
| Style warna ditentuin manual per elemen | Pake color style global |

---

## Handoff ke Developer

Developer bakal liat desain lo di Figma tab **Inspect**. Pastikan:

1. **Spacing terbaca** — padding, margin, gap jelas (auto layout membantu)
2. **Info tersampaikan** — belum? tambahin sticky note di Figma
3. **Responsive** — kasih frame desktop + mobile
4. **Assets ready** — export icon SVG, gambar di folder assets

### Yang Wajib Ada Sebelum Handoff

- [ ] Color style sudah disimpen di Figma
- [ ] Text style semua terdefinisi
- [ ] Button minimal 3 state (default, hover, disabled)
- [ ] Input minimal 3 state (default, focus, error)
- [ ] Flow prototype utama sudah connect
- [ ] Ada frame mobile + desktop (kalo perlu)
- [ ] Ikon pake SVG (bukan PNG)

---

## Responsive Design

Prinsip: desain yang bisa adaptasi ke layar manapun.

### Breakpoint Dasar

| Device | Lebar | Grid |
|--------|-------|------|
| Mobile S | 320px | 4 kolom |
| Mobile L | 414px | 4 kolom |
| Tablet | 768px | 8 kolom |
| Desktop | 1280px | 12 kolom |

### Cara Bikin Responsive di Figma

1. **Constraints** → atur pin ke kiri/kanan/atas/bawah
2. **Auto Layout** → set Fill biar ngisi container
3. **Bikin frame sendiri** untuk mobile vs desktop
4. Pake **Layout Grid** (Shift+G) sesuai breakpoint

Jangan resize manual satu-satu — pake **Auto Layout** biar Figma ngatur sendiri.

---

## Advanced Figma — Component Library Management

### Component Organization

Cara nyusun komponen di Figma biar gak berantakan:

```
📁 Design System
├── 📁 Atoms
│   ├── Button/
│   ├── Input/
│   ├── Icon/
│   └── Tag/
├── 📁 Molecules
│   ├── SearchBar/
│   ├── Card/
│   ├── Modal/
│   └── Dropdown/
└── 📁 Organisms
    ├── Navbar/
    ├── Footer/
    ├── ProductGrid/
    └── CheckoutForm/
```

### Local Variables (Figma 2024+)

Figma sekarang support variabel — bukan cuma styles.

| Variabel | Contoh | Bisa Dicomponent |
|----------|--------|------------------|
| Color | `$color-primary` | ✅ |
| Number | `$spacing-md: 16` | ✅ |
| String | `$font-family: 'Inter'` | ✅ |
| Boolean | `$is-dark-mode: false` | ✅ |

**Cara pake:**
1. Buka tab Local Variables di panel kanan
2. Bikin collection: "Spacing", "Colors", "Typography"
3. Set value: mode (light/dark) atau tipe
4. Pake di properti komponen — auto-update semua instance

### Interactive Components

Bikin komponen yang punya interaksi internal:

```
Button (component)
├── Default state → Hover state (on hover)
├── Hover state → Pressed state (mousedown)
└── Pressed state → Default state (mouseup)

Caranya:
1. Buka tab Prototype di component
2. Connect variants pake trigger On Hover, On Press
3. Set interaction: "Navigate to" → variant lain
4. Pake komponen di frame — interaksi jalan automatic
```

### Variants & Component Properties — Gabungan

```typescript
// Contoh mapping Figma → React Component
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  disabled: boolean;
  icon: boolean;
  label: string;
}

// Figma properties:
// Variant 1: variant={primary | secondary | ghost}
// Variant 2: size={sm | md | lg}
// Boolean: disabled={true | false}
// Boolean: icon={true | false}
// Text: label="Tombol"
```

---

## Design System Documentation — Biar Tim Paham

Komponen aja gak cukup — harus ada dokumentasi kapan pake apa.

### Template Docs per Komponen

```
## Button

### Usage
Tombol utama untuk aksi utama user.

### Variants
| Variant | Use Case | Contoh |
|---------|----------|--------|
| Primary | Aksi utama (submit, save) | Tombol "Simpan" |
| Secondary | Aksi alternatif | Tombol "Batal" |
| Ghost | Aksi kurang penting | Tombol "Lihat detail" |
| Danger | Aksi destruktif | Tombol "Hapus" |

### States
- Default
- Hover (darken 10%)
- Active (darken 20%)
- Disabled (opacity 0.5)

### Spacing
- Padding: 12px horizontal, 8px vertical
- Gap icon-text: 8px
- Border radius: 8px

### Do & Don't
✅ Pake Primary untuk 1 CTA per halaman
✅ Pake Ghost untuk link-style actions
❌ Jangan pake 2 Primary button bersebelahan
❌ Jangan disable tombol tanpa alasan jelas

### Code
```tsx
<Button variant="primary" size="md" onClick={handleSave}>
  Simpan
</Button>
```
```

### Tools Dokumentasi

| Tool | Cocok untuk |
|------|-------------|
| Figma + cover page | Tim kecil, internal |
| Zeroheight | Design system terpusat |
| Storybook | Component-driven documentation |
| Docusaurus | Docs site kustom |

---

## Design System Anti-Pattern

### ❌ Too Rigid

Design system jangan terlalu kaku sampe UX Designer gak bisa inovasi.

| ❌ Terlalu Kaku | ✅ Flexible |
|----------------|------------|
| "Semua card harus pake shadow" | "Card pake shadow default, ghost variant kalo perlu" |
| "Cuma pake 1 warna biru" | "Primary scale dari 100-900, pilih sesuai konteks" |
| "Gak boleh ada komponen baru" | "Boleh bikin baru, tapi audit tiap bulan" |

### ❌ No Governance

Siapa yang boleh nambah komponen? Siapa yang review?

| ❌ No Rules | ✅ Governance |
|------------|--------------|
| Siapa aja bisa nambah komponen | Harus melalui design review |
| Gak ada changelog | Tiap update dicatat |
| Komponen usang gak pernah dihapus | Audit & deprecate tiap kuartal |
| Developer bikin komponen sendiri tanpa bilang designer | Designer & developer kolaborasi |

### ❌ Skipping Maintenance

Design system bukan "bikin sekali jadi". Butuh maintenance:

- **Bulanan:** Hapus komponen yang gak dipake
- **Kuartalan:** Audit konsistensi, update doc
- **Tahunan:** Evaluasi scale & improvement

---

## Versioning Design System

Design system juga perlu versioning kayak software.

| Version | Arti | Contoh |
|---------|------|--------|
| Major | Breaking changes | Button API berubah total |
| Minor | Fitur baru, backward compatible | Nambah variant "outline" |
| Patch | Bug fix, minor tweak | Fix spacing, warna |

**Cara versioning:**
- Figma: Simpan file lama, duplikat untuk versi baru
- Storybook: Pake npm versioning
- Changelog: Catat tiap perubahan di `CHANGELOG.md`

```markdown
# Changelog

## [2.1.0] - 2026-06-15
### Added
- Variant outline untuk Button
- Komponen baru: Tooltip
- Dark mode tokens

### Fixed
- Spacing Input error state
- Contrast ratio warning badge

## [2.0.0] - 2026-03-01
### Changed
- Button API: `type` → `variant`
- Color scale dari 500-base ke 700-base
```

---

## Latihan

1. **Bikin prototype flow.** Di Figma, buat 3 frame (Login, Home, Detail). Sambung dengan prototyping: On Click tombol Login → Home, klik card → Detail. Pake Smart Animate untuk transisi. Screenshoot hasil prototype panel.

2. **Bangun design system mini.** Di Figma, bikin:
   - 1 komponen Button dengan 3 variants (Primary/Secondary/Ghost)
   - Masing-masing variants punya state Default + Hover
   - Pake Auto Layout, padding 12px horizontal, 8px vertical
   Screenshoot komponen panel.

3. **Color + Text style.** Buat 5 Color Styles (primary, secondary, 3 neutral) dan 3 Text Styles (h1, body, caption) di Figma. Sertakan screenshoot panel Styles.

4. **Bikin responsive mockup.** Ambil 1 screen dari tugas sebelumnya. Duplikasi, ubah layout untuk mobile (4 kolom grid). Screenshoot kedua versi (desktop + mobile). Catat perbedaan spacing dan posisi elemen.

5. **Interactive component.** Bikin komponen Button interaktif di Figma: Default → Hover → Pressed, connect pake prototype. Screenshoot prototype panel yang menunjukin koneksi.

6. **Docs for design system.** Pilih 1 komponen dari design system mini lo. Tulis dokumentasi lengkap: usage, variants, states, spacing, do & don't, dan code snippet (JSX).

7. **Changelog simulation.** Bayangin design system lo update dari v1.0 ke v2.0. Tulis changelog mencakup: 2 breaking changes, 3 fitur baru, dan 2 bug fix. Format markdown.
