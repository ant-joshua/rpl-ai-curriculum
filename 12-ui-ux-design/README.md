# Modul 12: UI/UX Design — Bikin Aplikasi yang Gak Cuma Jalan, Tapi Juga Enak Dilihat

**Target:** Siswa SMK RPL yang udah bisa coding tapi bikin aplikasi kelihatan seperti hasil DR5 — functional tapi painful to look at.

**Pesan utama:** Kode yang bagus + UI yang buruk = produk gagal. User gak peduli seberapa clean arsitektur MVP-mu. Mereka peduli tombolnya gampang diklik, warnanya gak nyilauin, dan aplikasinya gak bikin mereka bingung.

---

## 1. Design Thinking — Bukan Cuma Anak DKV

Design thinking itu framework **problem-solving**, bukan cuma soal estetika. 5 tahap:

### Empathize — Ngerti user dulu, jangan nebak
- Wawancara user (minimal 3 orang). Tanya: "Apa yang bikin kamu betah pake aplikasi ini?" "Apa yang paling nyebelin?"
- Jangan tanya "Fitur apa yang kamu mau?" — user gak tau apa yang mereka mau. Tanya soal **masalah** yang mereka hadapi.
- **Tip praktis:** Bikin empathy map (What they say / do / think / feel). Bedain apa yang user *bilang* vs apa yang mereka *lakuin* — sering beda.

### Define — Rangkum masalahnya
- Output: Problem statement. Format: *"[User] butuh [kebutuhan] karena [insight]"*. Contoh: "Siswa butuh liat jadwal pelajaran offline karena sinyal di sekolah jelek."
- **Tip:** Jangan define solusi di tahap ini. Cuma definisikan masalah. Kalau langsung mikir solusi, lo bakal bias.

### Ideate — Kumpulin ide, sensor diri matiin
- Pake **Crazy 8**: lipat kertas jadi 8, setiap kotak diisi 1 ide dalam 1 menit. Total 8 ide dalam 8 menit.
- **Tip:** Kuantitas > kualitas di tahap ini. Ide paling goblok pun kadang picu ide bagus lain.
- Setelah itu baru voting — tiap orang dapat 3 dot sticker untuk ide favorit.

### Prototype — Cepet, murahan, testable
- Low-fidelity dulu (kertas, Figma basic frame). Tujuannya: **bisa di-test**, bukan cantik.
- **Tip:** 30 menit maksimal untuk prototype pertama. Kalau udah 2 jam lo masih ngatur-ngatur spacing, lo salah paham.
- Pake **Wizard of Oz prototyping**: tombol palsu, screen palsu, padahal manual di-backend.

### Test — Ngaca, jangan defensif
- Minta user pake prototype. Lo **diem**, catat di mana mereka bingung.
- **Tip:** Jangan bantuin user. Kalau lo ngebantuin, lo gak dapet data valid. Tahan mulut.
- Iterate: Design thinking itu **loop**, bukan linear. Balik ke tahap sebelumnya kalo perlu.

> **Realita SMK RPL:** Tim lo mepet deadline, skip empathize, langsung nulis kode. Hasilnya: aplikasi jalan, fitur lengkap, gak ada yang pake. Selalu luangkan minimal 1 hari untuk empathize dan define. 1 hari itu ngirit 1 minggu coding ulang.

---

## 2. Figma Basics — Senjata Utama Lo

Lupakan Photoshop untuk UI design. Figma gratis, real-time collaboration, web-based. Wajib hukumnya.

### Frame (Artboard)
- Shortcut: **F** atau **A**
- Pilih frame sesuai target device: iPhone 14 (390x844), Desktop 1440x1024, iPad.
- **Tip:** Pake frame jangan pake rectangle. Frame punya properti export, overflow, dan constraints yang gak dimiliki shape biasa.

### Component — Biar gak ngulang-ulang
- **Komponen** = template yang bisa di-reuse. Ubah satu, semua berubah.
- Buat: `Create Component` (Ctrl+Alt+K). Variasi pake **Variants** (state: default, hover, active, disabled).
- **Tip:** Komponen itu setara dengan function di kode. Kalau lo ngulang element >2x, bikin komponen. Sama kaya DRY principle.
- Main component vs instance: jangan edit instance langsung — ntar bentrok pas update.

### Auto Layout — CSS Flexbox versi visual
- Shift+A untuk wrap container.
- Properti penting:
  - **Direction** (horizontal/vertical) → seperti `flex-direction`
  - **Spacing** → `gap`
  - **Padding** → padding dalam container
  - **Resizing** → Hug (fit content), Fill (100% width), Fixed
- **Tip:** Pake Auto Layout dari awal. Jangan kasih position absolute manual — ntar layoutnya kacau pas di-resize. Kalo lo pake Auto Layout, responsive design jadi semi-otomatis.
- **Best practice:** Button → Auto Layout + padding + spacing. Bukan rectangle dengan text di dalemnya.

### Prototyping — Koneksi antar page
- Pilih elemen, seret bolanya ke frame tujuan.
- **Interaction:** On Click, While Hovering, While Pressing, After Delay.
- **Animation:** Smart animate (animasi antar layout)—cocok buat navbar collapse, card expand, drag.
- **Flow:** Bikin flow user dari login → home → fitur utama. Jangan coba connect semua screen sekaligus.
- **Tip:** Pake t=0ms untuk instant transisi di mobile app. Pake ease in-out 250-300ms untuk micro-interactions.

> **Latihan pertama lo di Figma:** Bikin ulang halaman login OVO/Gojek. 1 frame, 1 button komponen, auto layout, prototyping ke "home" page. Buat 1 jam selesai.

---

## 3. Color Theory + Typography + Layout Grid

### Color Theory — Gak Semua Warna Cocok
**Istilah dasar:**
- **Hue:** warna murni (merah, biru, hijau)
- **Saturation:** intensitas warna
- **Brightness/Lightness:** terang-gelap
- **HSL lebih intuitif daripada HEX** buat design — lo bisa "ngejar" warna tanpa mikir kode heksadesimal.

**Palet minimal yang lo butuh:**
- **Primary color:** 1 warna utama (biasanya dari brand)
- **Secondary color:** 1 warna pendamping
- **Neutral colors:** ~3-5 warna abu (untuk teks, background, border)
- **Semantic colors:** success (hijau), error (merah), warning (kuning), info (biru)

**Aturan 60-30-10:**
- 60% neutral (background)
- 30% primary/secondary
- 10% accent (CTAs, highlights)

**Aksesibilitas — bukan opsional:**
- Contrast ratio minimal **4.5:1** untuk teks normal (WCAG AA). Smaller text need higher contrast.
- **Tool:** WebAIM Contrast Checker. Figma plugin: Contrast.
- Jangan kasih teks abu-abu tipis di atas background putih — itu self-service buta. Temen lo yang buta warna merah-hijau juga gak bisa bedain tombol merah background item.

### Typography — Font Game
- **Hierarki visual:** Heading (besar + bold), Subheading (medium), Body (regular), Caption (kecil)
- **Scale:** Pake modular scale (1.25 atau 1.333). Misal body 16px → h4 ~20px, h3 ~25px, h2 ~31px, h1 ~39px.
- **Pairing:** Max 2 font. Sans-serif + Sans-serif (Inter + Roboto) atau Serif + Sans-serif. Jangan Comic Sans.
- **Line height:** Body 1.5x font size. Heading 1.2-1.3x.
- **Tip:** Inter, Poppins, atau Plus Jakarta Sans buat UI. Source Serif Pro atau Lora buat long-form text.
- **Gimana lo tau pilihan bagus?** Font In Colophon atau fonts.google.com + search "popular app fonts".
- **⚠️** Jangan gunain ukuran genap. 16px, 20px, 24px lebih natural. Atau pake kelipatan 4 (4px rule — spacing, padding, margin semuanya kelipatan 4).

### Layout Grid — Biar Rapi Gak Asal Naro
- **Grid columns:** 12 kolom untuk web, 4/6 untuk mobile.
- **Gutter:** 16-24px.
- **Margin:** 16px (mobile), 32-64px (desktop).
- **Baseline grid:** 8px grid untuk spacing vertikal. Kenapa 8px? Karena kelipatan 8 cocok dengan mayoritas ukuran layar modern.
- **Tip:** Di Figma → Layout Grid (Shift+G). Set Columns + Rows. Stick to it. Jangan naro elemen di luar grid tanpa alasan kuat.
- **Kapan langgar grid?** Hero section, splash image, dekoratif — itu occasional. 95% konten harus di dalem grid.

> **Real talk:** Lo bisa lolos pake 1 warna primary, 1 warna neutral untuk text/background, 1 font, dan 12-column grid buat 80% proyek yang bakal lo kerjain.

---

## 4. Wireframing — Dari Coretan ke Jadi

### Low-Fidelity Wireframe (Lo-fi)
- **Gak usah ada warna, gak usah font beneran.** Cuma kotak, garis, tulisan asal (placeholder).
- Tools: Kertas + spidol, Balsamiq, atau Figma pake shape dasar aja.
- **Fokus:** Layout, hierarchy, user flow. BUKAN estetika.
- **Kenapa?** Karena lo mau validasi struktur, bukan warna. Warna itu distraksi di tahap ini. User yang ngeliat lo-fi akan fokus di *apakah flow-nya masuk akal*, bukan di *kok background-nya biru doang?*
- **Tip:** Pake grayscale 2-3 shade aja. 60 menit maksimal buat satu screen.

**Contoh lo-fi:**
```
[LOGO]     [CARI]     [PROFIL]
┌──────────────────────────┐
│                          │
│   ┌──────┐  ┌──────┐   │
│   | Card|  | Card|    │
│   └──────┘  └──────┘   │
│   ┌──────┐  ┌──────┐   │
│   | Card|  | Card|    │
│   └──────┘  └──────┘   │
│                          │
│ [ BOTTOM NAV ]           │
└──────────────────────────┘
```

### Mid-Fidelity
- Mulai pake gray scale yang lebih jelas, masih tanpa warna.
- Detail: ukuran font beda untuk heading/body, spacing yang konsisten.
- Bisa di-prototype basic (klik ke screen lain).
- **Tip:** Di tahap ini lo mulai pake grid 8 atau 12 kolom.

### High-Fidelity Wireframe (Hi-fi)
- **Mirip final aplikasi.** Warna, icon, font asli, gambar real (atau placeholder dari Unsplash).
- Komponen Figma udah pake variants/auto layout lengkap.
- **Tip:** Screens yang paling sering diakses user (flow utama) harus hi-fi duluan. Jangan bikin hi-fi semua halaman sekaligus.
- **Kapan lo tau hi-fi selesai?** Saat developer bisa implement tanpa tanya "Ini gap-nya berapa?" "Font-nya apa?" "Warna ini kode hex-nya berapa?"

**Progresi yang benar:**
```
Brainstorm → Lo-fi sketsa → review user → Mid-fi → review lagi → Hi-fi → handoff ke developer
Skip salah satu = design gagal
```

---

## 5. Design Systems — Seperti Tailwind Tapi Buat Design

Design system bukan tren — ini **bahasa bersama** antara designer & developer.

### Kenapa?
- Konsistensi: tombol di halaman login sama dengan di dashboard.
- Efisiensi: gak perlu bikin komponen dari 0 tiap proyek.
- Skalabilitas: proyek baru tinggal pake yang udah ada.

### Komponen Design System Minimal (Tailwind-style):

| Kategori | Elemen | Contoh Tailwind Class |
|----------|--------|----------------------|
| Spacing | 4/8/12/16/20/24/32px | `p-4`, `m-2`, `gap-4` |
| Typography | h1-h6, body, caption | `text-3xl`, `text-base` |
| Colors | primary, secondary, accent, neutral, semantik | `bg-blue-500`, `text-gray-700` |
| Buttons | primary, secondary, ghost, icon-only | `btn btn-primary` |
| Inputs | text, password, search, textarea | `input input-bordered` |
| Cards | card-default, card-hover, card-selected | `card shadow-md` |
| Nav | top nav, sidebar, bottom tab |

### Tips Bikin Design System Sendiri:
1. **Mulai dari komponen yang paling sering dipake.** Lo gak perlu 100 komponen di hari pertama. Cukup: Button, Input, Card, Typography, Spacing.
2. **Doc itu WAJIB.** Tulis properti, state, kapan pake A vs B. Kalo gak di-doc, orang bakal pake asal-asalan.
3. **Tools Figma:**
   - **Styles:** menyimpan warna, teks, efek jadi satu paket, reusable di semua frame.
   - **Components:** pisah di page khusus "Design System" atau pake Libraries (Team Library).
4. **Inspect:** developer bisa ngintip CSS langsung di Figma (klik element → tab Inspect). Pastiin gap, padding, font size terbaca jelas.
5. **Versioning:** Simpan legacy component di page "Archived". Jangan hapus — bisa aja dipake lagi.

### Anti-pattern yang Sering Terjadi:
- **Library penuh components tapi gak dipake.**
- **Komponen sama tapi 3 versi** (si A bikin button sendiri, si B pake dari library, si C custom all over).
- **Nama komponen ambigu** (`button`, `button2`, `button-final-sky`, `button-final-sky-v2`). Jangan. Pake semantic naming: `btn-primary`, `btn-secondary`, `btn-ghost`.

### Inspirasi Design System:
- **Material Design 3** (Google) — paling mature, banyak dokumentasi.
- **Radix UI** — headless, cocok buat React.
- **shadcn/ui** — Tailwind-based, lo bisa liat bagaimana komponen didesain dari sisi kode.
- **Ant Design** — populer di enterprise apps, komponen lengkap banget.

> **Cara SMK RPL pake design system:** Fork shadcn/ui, ambil komponen yang lo butuh aja, custom warna sesuai brand. Gausah bikin dari 0.

---

## Praktikum Akhir — Kerjain Ini

**Tugas:** Dalam 1 minggu, kerjain design aplikasi sederhana (pilih 1: todo app, catatan keuangan, atau jadwal pelajaran).

**Step-by-step:**
1. **[Day 1] Empathize:** Wawancara 3 teman. Cari masalah mereka. Bikin empathy map.
2. **[Day 2] Define:** Tulis problem statement. Pake PDCA (Plan-Do-Check-Act).
3. **[Day 3] Ideate:** Crazy 8, lalu voting ide.
4. **[Day 4] Lo-fi + testing:** Bikin wireframe analog. Test dengan teman. Iterasi. Jangan sampai ke tahap hi-fi kalo lo-fi belum bener.
5. **[Day 5] Design System:** Bikin minimal 5 komponen (button, input, card, navbar, icon) di Figma. Style typography + colors.
6. **[Day 6] Hi-fi:** Pake komponen yang udah lo buat. Bikin 3 screen: Login, Dashboard, Detail (sesuai case lo).
7. **[Day 7] Prototyping + Handoff:** Sambung screen dengan prototyping. Export spec → developer.

---

## TL;DR Buat Yang Males

| Udah Bisa | Tapi Lo Perlu | Karena |
|-----------|--------------|--------|
| Coding React | Design thinking + Figma | Biar gak bikin 10x refactor |
| Pakai Tailwind | Baca design system | Biar warna lo konsisten |
| Bikin fitur | Bikin wireframe dulu | Biar user gak bingung |
| Pake useState | Pake Figma component | Biar gak ngulang tombol 30x |
| Mikirin clean code | Mikirin contrast ratio | Biar aplikasi lo accessible |

**Pertanyaan buat lo setiap mulai proyek baru:**
- Apakah aku udah ngerti masalah user (atau aku cuma nebak)?
- Apakah structure layout-ku masuk akal di wireframe (atau aku langsung hi-fi biar cantik)?
- Apakah design system-ku cukup (atau aku masih nulis `style={{}}` manual)?

Jawab jujur. Kalo belum — balik ke langkah awal. Kode lo gak peduli betapa rapi kode itu kalo user gak betah ngeliatnya.
