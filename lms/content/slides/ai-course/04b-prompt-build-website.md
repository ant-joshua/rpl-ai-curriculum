---
title: "Prompt AI untuk Build Website — Pendekatan PRD-First"
module: 4b
"ai-complete-course"
---

# Module 4b: Prompt AI untuk Build Website — Pendekatan PRD-First

## 🎯 Tujuan Pembelajaran

Setelah modul ini, kamu akan bisa:
- Menulis PRD sederhana untuk proyek website
- Mengubah PRD menjadi prompt AI yang terstruktur
- Membangun berbagai jenis website dengan pendekatan sistematis
- Menghindari kesalahan umum saat prompting AI untuk membuat website

> 🧠 **Inti Modul Ini:** Menulis PRD dulu, baru prompt AI — ini aturan emasnya!

---

## 1. Mengapa PRD Dulu, Baru Prompt 📋

### ❌ Masalah: Langsung Prompt Tanpa Persiapan

Banyak orang langsung mengetik ke AI: *"Buatkan website toko online yang bagus"*

Apa yang terjadi?

```
┌─────────────────────────────────────────────────────────────┐
│            LANGSUNG PROMPT TANPA PRD                        │
│                                                             │
│   👤 Kamu → "Buat website toko online yang bagus"           │
│              (prompt vagu, tidak ada detail)                │
│                    │                                        │
│                    ▼                                        │
│              🤖 AI Generator                                │
│              (harus menebak semua hal)                      │
│                    │                                        │
│                    ▼                                        │
│              🎨 Hasil: warna asal, layout random,           │
│                 fitur kurang, 10x revisi → frustasi 😤      │
└─────────────────────────────────────────────────────────────┘
```

### ✅ Solusi: PRD → Prompt → Hasil Bersih

```
┌──────────────────────────────────────────────────────────────┐
│              PRD-FIRST APPROACH                               │
│                                                              │
│   👤 Kamu → 📋 Tulis PRD (10-15 menit)                       │
│                    │                                         │
│                    ▼                                         │
│              ✍️ Buat Prompt dari PRD (5 menit)                │
│                    │                                         │
│                    ▼                                         │
│              🤖 AI → 🎨 Hasil: sesuai desain, fitur lengkap, │
│                   warna pas, hanya 1-2x revisi 🎉            │
└──────────────────────────────────────────────────────────────┘
```

### 📊 Perbandingan: Langsung Prompt vs PRD-First

| Aspek | ❌ Langsung Prompt | ✅ PRD-First |
|-------|-------------------|--------------|
| **Waktu persiapan** | 0 menit | 10-15 menit |
| **Jumlah revisi** | 5-10x | 1-2x |
| **Kualitas awal** | 30-40% | 70-80% |
| **Konsistensi desain** | Rendah | Tinggi |
| **Total waktu pengerjaan** | 2-3 jam | 30-60 menit |
| **Tingkat frustasi** | 😤😤😤 | 😊 |

### 🧮 Aturan 80/20

> **80% kualitas website ditentukan oleh PRD, 20% oleh prompt-nya.**

PRD yang baik = prompt yang ringkas tapi powerful. PRD yang buruk = prompt panjang tapi tetap gagal.

### 💡 Kenapa PRD Sangat Penting untuk AI?

1. **AI butuh konteks spesifik** — AI tidak bisa membaca pikiranmu
2. **AI konsisten dengan instruksi** — Kalau kamu bilang "warna #1E40AF", AI pakai itu
3. **PRD mengurangi revisi** — PRD yang baik mengurangi revisi dari 10x menjadi 1-2x
4. **PRD bisa dipakai ulang** — Sama untuk Cursor, Claude, ChatGPT, v0.dev

---

## 2. Cara Membuat PRD Sederhana 📝

### 📋 Template PRD

Cukup isi template ini (tidak perlu PRD 50 halaman):

```
═══════════════════════════════════════════════
📋 PRD — PRODUCT REQUIREMENTS DOCUMENT
═══════════════════════════════════════════════

📌 PROJECT NAME:  [Nama proyek]
📝 DESKRIPSI:     [1-2 kalimat]
🎯 AUDIENCE:      [Siapa target]
📄 PAGES:
   1. [Halaman] — [deskripsi]
   2. [Halaman] — [deskripsi]
⚙️ FITUR PER HALAMAN:
   [Halaman 1]: fitur A, fitur B...
🎨 DESAIN:        [gaya, warna, font, vibe]
🛠️ TECH STACK:    [HTML/CSS, React, dll]
📱 RESPONSIVE:    Ya / Tidak
═══════════════════════════════════════════════
```

### ✅ Contoh PRD: Portfolio Website

```
📌 PROJECT: "Portfolio Ahmad — Web Developer"
📝 Portfolio personal untuk Ahmad, web dev freelance.
🎯 AUDIENCE: Calon klien, rekruter, sesama developer

📄 PAGES:
   1. Home — Hero + CTA
   2. About — Bio + skills
   3. Projects — Grid proyek dengan filter
   4. Contact — Form + info kontak

⚙️ FITUR:
   [Home]: Nama, title, tagline, CTA, animasi fade-in
   [About]: Foto profil, bio, skills progress bar
   [Projects]: Filter kategori, card+thumbnail, modal detail
   [Contact]: Form (nama, email, pesan) + sosmed links

🎨 DESAIN: Dark #0F172A, accent #3B82F6,
   Font: Inter (body) + Space Grotesk (headings)
🛠️ TECH: HTML + Tailwind CSS + Vanilla JS
📱 RESPONSIVE: Ya — Mobile-first
```

---

## 3. PRD → Prompt Pipeline 🔗

### 🔄 Pipeline 4 Langkah

```
📋 PRD ──▶ 🔪 Pecah/Halaman ──▶ ✍️ Tulis Prompt ──▶ 🤖 Generate
  │              │                    │                   │
  │         Satu prompt          Fokus, spesifik      Hasil
  │         per halaman          + context dari       website
  │                              page sebelumnya
  └── 🔄 Iterasi & Refine ◀── 👀 Review ◀─────────────┘
```

**Step 1:** Pecah PRD menjadi satu prompt per halaman

**Step 2:** Tulis prompt fokus untuk satu halaman

**Step 3:** Sertakan context dari halaman sebelumnya:
> "Lanjutkan dari home page yang sudah dibuat. Style: dark #0F172A, accent #3B82F6. Sekarang buat halaman About..."

**Step 4:** Iterasi & refine — biasanya 1-2 siklus cukup

---

## 4. 10 Contoh Prompt Build Website 💻

### A. Landing Page (SaaS)

**📋 PRD:** TaskFlow — manajemen tugas untuk tim remote. Hero, pricing, testimonials.

**❌ Buruk:** "Buatkan website taskflow yang bagus"

**✅ Baik:** "Buat landing page HTML untuk SaaS 'TaskFlow' — manajemen tugas tim remote. Sections: (1) Hero — 'Manage Your Team's Tasks in One Place' + tombol 'Start Free Trial', (2) 3 fitur (Real-time Collaboration, Smart Scheduling, Progress Analytics) dengan ikon, (3) Pricing 3 tier (Free/Pro/Enterprise), (4) Testimonials 3 perusahaan, (5) Footer. Design: white bg, accent purple #7C3AED, font Inter. Responsive mobile-first. Tailwind CSS. Animasi fade-in scroll."

**🔑 Yang beda:** Nama jelas, konten spesifik, warna+font ditentukan, tech stack ada.

---

### B. Portfolio Personal

**📋 PRD:** Portfolio web dev. Dark theme. Home, About, Projects, Contact.

**❌ Buruk:** "Tolong buatin web portfolio dong yang aesthetic"

**✅ Baik:** "Single-page portfolio untuk 'Rina Kusuma' — Full Stack Developer. Sections: (1) Hero — nama + title + 'I build fast, beautiful web apps' + 'View My Work', (2) About — bio 4 kalimat, skills: React, Node.js, Python, Tailwind, MongoDB, (3) Projects — 6 cards grid 3 kolom (thumbnail + nama + tech + link), (4) Contact — form + GitHub/LinkedIn links. Dark bg #111827, accent teal #14B8A6, font JetBrains Mono (code) + Inter (body). Smooth scroll. HTML + Tailwind CDN."

**🔑 Yang beda:** Jumlah proyek spesifik (6), hex codes, font per kegunaan, CDN spec.

---

### C. E-Commerce Product Page

**📋 PRD:** Detail produk sepatu "AirBoost X1". Galeri, harga, ukuran, reviews.

**❌ Buruk:** "Bikin halaman jual sepatu yang keren"

**✅ Baik:** "Halaman detail produk sepatu 'AirBoost X1' Rp 1.299.000 (diskon dari Rp 1.799.000). Layout: kolom kiri — galeri (1 gambar besar + 4 thumbnails, klik switch), kolom kanan — nama, rating 4.7 (234 reviews), harga + badge 'Hemat 28%', pilihan ukuran (39-44) sebagai tombol, jumlah (+/-), 'Add to Cart' oranye, 'Buy Now'. Below fold: deskripsi 3 paragraf, spesifikasi tabel, 3 reviews. Clean white, font Poppins, CTA oranye #F97316. Mobile: gambar atas, info bawah."

**🔑 Yang beda:** Data produk realistis, layout kolom detail, interaksi UI, responsive behavior.

---

### D. Dashboard Admin

**📋 PRD:** Dashboard admin e-commerce. Sidebar, stat cards, chart, tabel.

**❌ Buruk:** "Bikin dashboard admin yang mirip shopee"

**✅ Baik:** "Dashboard admin e-commerce. Sidebar kiri (250px): logo, menu (Dashboard, Orders, Products, Customers, Settings), logout. Main: (1) 4 stat cards — Revenue Rp 45.2 Juta (+12%), Orders 1.234, Customers 5.678, Conversion 3.2%, (2) Line chart 'Revenue Overview' 6 bulan, (3) Table 'Recent Orders' — kolom: Order ID, Customer, Amount, Status (Processing/Delivered/Pending dengan badge warna), Date. Light bg #F3F4F6, cards putih, sidebar #1F2937, accent blue #3B82F6, font Inter. HTML + Tailwind + Chart.js CDN. Sidebar jadi hamburger di mobile."

**🔑 Yang beda:** Data angka realistis, warna per status, chart library disebut, mobile behavior.

---

### E. Blog/Magazine

**📋 PRD:** Blog tech "TechPulse". Featured article, grid, sidebar.

**❌ Buruk:** "Buat blog yang bagus buat berita tech"

**✅ Baik:** "Homepage blog 'TechPulse'. Header: logo + navbar (Home, AI, Hardware, Software) + search. Main: (1) Featured — card full-width, kategori 'AI', judul 'OpenAI Rilis GPT-5', author 'Budi', date '5 Sep 2025', excerpt, (2) Grid 6 articles (3×2) — thumbnail, kategori badge, judul, author, date, (3) Sidebar: search, 5 popular posts, kategori + jumlah, tag cloud. White bg, Merriweather (heading) + Inter (body), accent red #DC2626. Card hover lift shadow. Sidebar di bawah konten di mobile."

**🔑 Yang beda:** 2 font dengan peran jelas, data contoh spesifik, hover effect, mobile layout.

---

### F. Restaurant Menu

**📋 PRD:** Menu restoran seafood "Ocean Basket". Kategori + harga Rupiah.

**❌ Buruk:** "Buat web menu restoran yang cantik"

**✅ Baik:** "Menu restoran 'Ocean Basket'. Header: logo + jam buka 'Senin-Minggu 11:00-22:00' + WA. Navigasi: Appetizer, Main Course, Dessert, Drinks (klik scroll). Menu: Appetizer — Calamari Goreng Rp 55K, Prawn Cocktail Rp 75K; Main Course — Grilled Salmon Rp 185K, Lobster Thermidor Rp 350K; Dessert — Panna Cotta Rp 45K; Drinks — Fresh Lime Soda Rp 30K. Warm tropical, bg cream #FFFBEB, Playfair Display (heading) + Lato (body), accent blue #0369A1. Footer: alamat + Maps placeholder. Responsive."

**🔑 Yang beda:** Data menu + harga lengkap, navigasi interaktif, mood desain jelas.

---

### G. Event/Festival

**📋 PRD:** Festival musik "SoundWave 2025". Line-up, jadwal, tiket.

**❌ Buruk:** "Bikin web event musik yang keren abis"

**✅ Baik:** "Landing page 'SoundWave Festival 2025' — 12-13 Des 2025, Lapangan Senayan Jakarta. Hero: gradient purple-orange, nama festival + tanggal + CTA 'Get Your Tickets'. Line-up: Headliner Raisa & Isyana; Supporting: barasuara, The Panturas, coldiac. Schedule: tabel 2 hari, 3 stages (Main, Indie Corner, DJ). Tickets: Regular Rp 350K, VIP Rp 750K (+lounge), VVIP Rp 1.5M (+backstage). Venue: Maps placeholder. Bold vibrant, gradient purple-orange, Bebas Neue (heading) + Montserrat (body). Parallax hero. Responsive."

**🔑 Yang beda:** Data event lengkap, line-up hierarki, harga tiket, efek parallax.

---

### H. Education Portal

**📋 PRD:** Dashboard e-learning SMK. Siswa lihat pelajaran, jadwal, nilai.

**❌ Buruk:** "Buat website sekolah yang ada sistem belajarnya"

**✅ Baik:** "Dashboard e-learning SMK 'Teknologi Maju'. User: Andi, kelas X RPL. Top navbar: sekolah + avatar 'Andi Pratama' + notifikasi + profile. Sidebar: Dashboard, Pelajaran, Jadwal, Tugas, Nilai, Forum. Main: (1) Welcome card 'Selamat pagi, Andi!' + motivasi, (2) Pelajaran Hari Ini — 3 cards: Matematika 08:00, Pemrograman Web 10:00, Basis Data 13:00 + progress bar, (3) Tugas Mendatang — 3 tugas dengan deadline + status, (4) Rata-rata Nilai — mini chart. Light blue #EFF6FF, sidebar white, accent green #10B981, font Nunito. Responsive."

**🔑 Yang beda:** User persona detail, data mata pelajaran realistis, progress bar + chart.

---

### I. Chat App UI

**📋 PRD:** UI chat mirip WhatsApp. List chat kiri, area chat kanan.

**❌ Buruk:** "Bikin UI chat yang kayak WA"

**✅ Baik:** "UI chat 'ChatNow'. 2 kolom: Kiri (300px) — search + 5 chat: Ahmad 'Oke besok jam 3!', Grup 'Tim Skripsi' 'Deadline besok!', Budi, Mama, Dian — masing-masing dengan timestamp + unread count. Kanan — header 'Ahmad' + online green dot, bubble chat (kiri abu, kanan biru), 4 pesan bolak-balik, input: attach icon + text field + send. Active chat highlight. WhatsApp green #25D366 header, white bg, system font. Mobile: tampilkan list dulu, klik → pindah ke chat."

**🔑 Yang beda:** Lebar kolom, data chat contoh, warna bubble beda kiri/kanan, mobile navigation.

---

### J. Booking/Reservation

**📋 PRD:** Booking ruangan co-working "SpaceHub". Pilih tanggal, jam, ruangan.

**❌ Buruk:** "Buat web booking ruangan yang gampang dipake"

**✅ Baik:** "Booking ruangan 'SpaceHub'. Navbar: logo + Home/Ruangan/Harga/FAQ. Flow step-by-step: Step 1 — pilih tanggal (calendar), Step 2 — pilih waktu (08:00-12:00, 13:00-17:00, Full Day), Step 3 — pilih ruangan: Focus Room 4org Rp 50K/jam, Meeting Room 8org Rp 100K/jam, Event Space 20org Rp 200K/jam (foto + fasilitas), Step 4 — ringkasan + 'Bayar Sekarang'. Progress bar atas. Modern coworking, white + warm brown #92400E, font DM Sans. Step vertical di mobile."

**🔑 Yang beda:** Alur step-by-step, data ruangan lengkap, progress indicator, mobile layout.

---

## 5. Prompt Template: Website Builder 📝

Gunakan template ini sebagai starting point:

```
Buat [tipe] website bernama "[Nama]" untuk [audience].

📄 HALAMAN:
   1. [Halaman] — [deskripsi + isi konten]
   2. [Halaman] — [deskripsi + isi konten]

🎨 DESAIN:
   - Gaya: [modern/minimalis/playful/corporate]
   - Warna: utama [hex], aksen [hex], bg [hex]
   - Font: heading [font], body [font]
   - Nuansa: [kata kunci vibe]

⚙️ FITUR: [daftar fitur]

🛠️ TECH: [HTML/CSS + Tailwind + library]
📱 RESPONSIVE: Ya — mobile-first
🚀 EFEK: [animasi, transisi, hover]
```

**Contoh terisi:** "Buat landing page 'RentBike' untuk penyewa sepeda Bali. Pages: (1) Hero 'Explore Bali on Two Wheels' + search form (lokasi, tanggal), (2) Popular Bikes — 4 cards (Mountain/City/Electric/Kids), (3) How It Works — 3 steps, (4) Testimonials, (5) Download App. Tropical adventure, hijau #059669, kuning #FBBF24, Poppins+Inter. Search form + date picker. HTML+Tailwind+JS. Responsive. Hover scale cards + smooth scroll."

---

## 6. Tips Lanjutan untuk Website Prompts 🚀

### 💡 1. Spesifik Lebih Baik dari Umum
```
❌ "Buat website yang bagus"
✅ "Website portfolio wedding photographer, dark theme,
    gallery masonry, pricing, booking form. Playfair Display."
```

### 💡 2. Referensikan Website Nyata
```
"Desain seperti Stripe.com — clean, modern, white, tapi
untuk produk fintech PayFlow."
```
Referensi: stripe.com (clean), notion.so (playful), hubspot.com (corporate), apple.com (minimal)

### 💡 3. Mobile-First Instructions
```
"Responsive: Mobile (<768px) — sidebar jadi bottom nav,
cards stack. Tablet — sidebar collapsed. Desktop — full."
```

### 💡 4. Specify Component Library
```
"Pakai Tailwind CSS + shadcn/ui + Lucide icons."
```

### 💡 5. Pecah Proyek Besar
```
❌ 1 prompt untuk e-commerce full → AI kehabisan konteks
✅ Pecah: Prompt 1=Layout, 2=Homepage, 3=Katalog,
   4=Detail, 5=Keranjang, 6=Checkout (~200-300 kata/prompt)
```

### 💡 6. "Lanjutkan dari Sebelumnya"
```
"Lanjutkan dari kode sebelumnya. Tambahkan halaman [X]
dengan style sama. Jangan ubah kode yang sudah ada."
```

### 💡 7. Minta AI Membuat PRD Dulu
```
"Sebelum bikin website, buatkan PRD sederhana untuk [X].
Setelah PRD disetujui, baru eksekusi."
```

---

## 7. Latihan ✏️

### 🏋️ A: Website Toko Online

Buat PRD + minimal 3 prompt untuk toko online fashion "StyleHijab" (hijab, pakaian muslimah, aksesoris).

**Halaman:** Home, Katalog, Produk Detail, Keranjang, Checkout

- **Prompt #1:** Home — hero promo, kategori (Hijab/Pakaian/Aksesoris), 4 produk populer, testimonials
- **Prompt #2:** Katalog — filter (kategori/harga/warnа), grid 12 produk (gambar, nama, harga, badge New/Sale), sort (terbaru/harga/terlaris)
- **Prompt #3:** Produk Detail — galeri 3 gambar, harga, diskon, pilihan warna/ukuran, jumlah, Add to Cart, deskripsi, reviews

**Catatan:** Gunakan hex codes, nama font spesifik, data contoh realistis.

### 🏋️ B: Dashboard Analytics

Buat PRD + prompt untuk "MetricFlow" — dashboard analytics digital marketing untuk tim 5 orang.

**Yang ditampilkan:** 4 stat cards (campaign aktif, reach, conversion, ROI), line chart 30 hari, pie chart budget per platform (Google/Meta/TikTok), tabel 10 campaign (nama, platform, status, budget, reach, CTR), sidebar navigasi.

**Tips:** Data realistis (angka campaign, budget Rupiah), warna per status (Running= hijau, Paused=kuning, Ended=abu), Chart.js CDN, hover effect.

### 🏋️ C: Landing Page Startup

Buat PRD + prompt untuk "RuangBelajar" — platform kursus online SMA. Tagline: "Belajar Jadi Mudah, Dimana Saja".

**Sections:** Hero (tagline + signup form + mockup app), Stats (50K+ siswa, 200+ kursus, 95% success), 3 fitur utama, 4 kursus populer, 3 testimonials, CTA signup, footer.

**Tips:** Copywriting persuasif, warna energi, animasi counter + fade-in, form UI-only tanpa backend.

---

## 📝 Ringkasan Modul

```
┌──────────────────────────────────────────────────┐
│         PRD-FIRST APPROACH — 5 Langkah           │
├──────────────────────────────────────────────────┤
│                                                  │
│  1️⃣  Tulis PRD dulu (10-15 menit)                │
│  2️⃣  Pecah PRD per halaman (1 prompt = 1 page)   │
│  3️⃣  Buat prompt spesifik (data, hex, font)      │
│  4️⃣  Sertakan context untuk konsistensi          │
│  5️⃣  Iterasi 1-2x, bukan 10x                     │
│                                                  │
│  🧠 PRD = 80% kualitas | Prompt = 20% eksekusi   │
│  Investasi 15 menit PRD = hemat 2 jam revisi!    │
└──────────────────────────────────────────────────┘
```

---

## 🔗 Modul Terkait

- **04a — Prompt Engineering Dasar** — Fondasi menulis prompt efektif
- **04c — AI untuk Coding Lanjutan** — Prompt untuk project coding kompleks
- **05 — Prompt Engineering Lanjutan** — Teknik prompt tingkat lanjut

---

> 💡 **Mau praktek?** Mulai dari Latihan A — buat PRD untuk toko online impianmu, lalu gunakan template prompt di Section 5!
