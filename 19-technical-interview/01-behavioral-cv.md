# 1. Behavioral Interview & CV Preparation

> **Target:** Kuasai metode STAR, siapkan CV ATS-friendly, optimasi LinkedIn, bangun portfolio site.

---

## Metode STAR

STAR adalah struktur jawaban untuk pertanyaan behavioral. Interviewer ingin lihat **bukti konkret** — bukan teori.

| Huruf | Arti | Fungsi |
|-------|------|--------|
| **S**ituation | Konteks / latar belakang | Kasih gambaran situasi |
| **T**ask | Tanggung jawab spesifik | Apa peran kamu |
| **A**ction | Langkah konkret yang diambil | Yang kamu lakukan |
| **R**esult | Dampak / hasil | Bukti keberhasilan |

### Contoh Penerapan STAR

**Pertanyaan:** "Ceritakan saat kamu menghadapi deadline ketat."

```
S: Proyek RPL semester 5 — bikin aplikasi perpustakaan dalam 2 minggu.
   Tim cuma 3 orang, satu anggota tiba-tiba sakit.

T: Saya harus menyelesaikan backend (REST API + database)
   plus membantu frontend yang ditinggal.

A: Saya prioritaskan fitur inti dulu — login, CRUD buku, peminjaman.
   Sisanya (laporan, filter) ditunda. Saya lembur 2 hari terakhir
   bantu frontend pake Tailwind.

R: Aplikasi selesai tepat waktu. Demo jalan lancar. Nilai A.
   Saya belajar prioritisasi fitur berdasarkan dampak.
```

**Pertanyaan:** "Ceritakan kegagalan terbesar."

```
S: Projek akhir semester 4 — aplikasi kasir. Saya terlalu percaya diri
   pakai framework baru tanpa riset.

T: Saya lead developer, harus deliver fitur transaksi dalam 1 minggu.

A: Hari ke-3 saya sadar dokumentasi framework kurang.
   Saya ganti ke Express (yang saya kuasai). Rela begadang 2 minta
   ngejar fitur yang hilang.

R: Fitur transaksi jadi telat 1 hari, tapi tetap selesai.
   Saya belajar: eksperimen itu bagus, tapi pastikan ada fallback.
```

### Pertanyaan Behavioral Umum

| Pertanyaan | Yang Dinilai | STAR Siapkan |
|-----------|-------------|-------------|
| "Ceritakan tentang dirimu." | First impression, relevansi | 30 detik: nama, skill utama, proyek, tujuan |
| "Kenapa kami harus hire kamu?" | Kepercayaan diri | Link skill kamu ke kebutuhan perusahaan |
| "Apa kelemahan terbesar?" | Self-awareness | Kelemahan nyata + langkah perbaikan |
| "Konflik dalam tim?" | Soft skill | Negosiasi, komunikasi, kompromi |
| "Proyek paling bangga?" | Technical depth | Detail arsitektur, tantangan, hasil |
| "Mau kerja di mana dalam 5 tahun?" | Ambisi | Realistis, relevan dengan posisi |
| "Pernah dapat kritik pedas?" | Growth mindset | Terima, evaluasi, perbaiki |
| "Kerja tim vs mandiri, suka mana?" | Kolaborasi | Keduanya, tergantung situasi |

**Tips:** Rekam jawaban pakai HP. Putar ulang. Jika ragu-ragu, ulangi sampai natural.

---

## CV / Resume Tips

### Format CV Fresh Grad RPL

| Elemen | Wajib? | Keterangan |
|--------|--------|-----------|
| Nama & kontak | ✅ | Email profesional, LinkedIn, GitHub, no. HP |
| Pendidikan | ✅ | SMK RPL (tahun lulus), nilai jika > 85 |
| Skill teknis | ✅ | Bahasa, framework, database, tools |
| Proyek | ✅ | 2-3 proyek dengan link + deskripsi + stack |
| Sertifikasi | ⭐ | BNSP, Dicoding, Coursera (relevan IT) |
| Organisasi / Lomba | ⭐ | OSIS, LKS, hackathon — bukti soft skill |
| Foto | ❌ | Tidak wajib, hindari selfie kasual |
| Hobi | ❌ | Kecuali relevan (nulis blog teknis, kontribusi open source) |

### ATS-Friendly Tips

ATS (Applicant Tracking System) — software HR yang **filter CV otomatis**.

1. **PDF simpel** — Jangan pakai tabel, kolom, ikon, atau grafis. ATS baca teks linear.
2. **Keyword dari job description** — Baca deskripsi kerja, ambil skill yang diminta, pastikan muncul di CV.
3. **Format standar:** Nama → Kontak → Ringkasan (opsional) → Pendidikan → Skill → Proyek → Sertifikasi.
4. **Gunakan kata kunci baku:** "JavaScript", "React", "Node.js", "MySQL", "REST API" — bukan "bikin web", "otak atik kode".
5. **Simpan sebagai PDF** — Format tidak berantakan di device mana pun.

### Kesalahan Fatal CV

| Kesalahan | Dampak |
|-----------|--------|
| Typo nama perusahaan | Langsung discard |
| Email tidak profesional (`cowokkeren22@`) | Kesan tidak serius |
| Skill tidak relevan (Microsoft Word untuk lamaran backend) | Waste space |
| Klaim expert padahal baru 1x pakai | Interview akan ketahuan |
| Tidak menyertakan link portfolio/GitHub | Bukti tidak ada |

---

## LinkedIn Profile Optimization

LinkedIn sering jadi **pencarian pertama** sebelum wawancara.

### Checklist Profile

- [ ] Foto profesional (bukan selfi, pakaian rapi, latar netral)
- [ ] Headline jelas: *"SMK RPL Student | Backend Developer | React & Node.js Enthusiast"*
- [ ] About section: 3-4 kalimat — siapa kamu, skill utama, target karir
- [ ] Experience: proyek sekolah, magang, freelance (pakai bullet points)
- [ ] Skills: tambahkan 5-10 skill relevan, minta endorsement teman
- [ ] Sertifikasi: upload foto sertifikat
- [ ] Custom URL: `linkedin.com/in/namakamu`
- [ ] Posting minimal 1x minggu: proyek baru, belajar hal baru, sertifikasi

### Contoh About Section

```
Backend developer lulusan SMK RPL 2025. Pengalaman membangun REST API
dengan Node.js & Express, integrasi database MySQL, dan deploy ke
Railway/Vercel. Active contributor di 2 proyek open source. Saat ini
fokus belajar TypeScript dan PostgreSQL.

#backend #nodejs #react #mysql #smkrpl
```

---

## Portfolio Site Structure

Portfolio website = bukti konkret. Tanpa portfolio, CV cuma klaim.

### Struktur Minimal

| Halaman | Isi |
|---------|-----|
| **Home** | Hero section — nama, role, CTA ke proyek |
| **Tentang** | 2-3 paragraf: latar belakang, skill, minat |
| **Proyek** | Card grid: nama, screenshot, stack, link live + GitHub |
| **Skill** | Ikon + nama teknologi (bisa progress bar) |
| **Kontak** | Form atau link: Email, LinkedIn, GitHub |

### Tech Stack Rekomendasi

| Level | Stack |
|-------|-------|
| Beginner | HTML + CSS + JS (deploy GitHub Pages) |
| Intermediate | React + Tailwind + Vercel |
| Advanced | Next.js + Framer Motion + Sanity CMS |

### Wajib Ada di Setiap Proyek

1. **Nama & deskripsi singkat** — apa yang dibuat dan kenapa.
2. **Screenshot / GIF demo** — bukti berjalan.
3. **Tech stack** — bahasa, framework, database.
4. **Link live demo** — Vercel, Netlify, GitHub Pages.
5. **Link GitHub** — recruiter bisa lihat kode.
6. **Fitur utama** — bullet points.

> **Aturan emas:** Jika recruiter butuh lebih dari 2 klik untuk lihat proyekmu, mereka sudah pindah ke kandidat lain.

---

## Latihan

1. **STAR Practice:** Ambil 3 pertanyaan behavioral dari tabel di atas. Tulis jawaban STAR lengkap (min 4 kalimat per huruf). Baca keras-keras sampai terdengar natural.

2. **CV Audit:** Buka CV kamu sekarang. Cek: (a) apakah ada typo? (b) apakah keyword sesuai job description? (c) apakah format PDF simpel/bisa dibaca ATS? Tuliskan 3 perbaikan.

3. **LinkedIn Makeover:** Ikuti semua checklist LinkedIn di atas. Screenshot sebelum-sesudah. Minta pendapat teman.

4. **Portfolio Site Wireframe:** Gambar (kertas/Figma) layout portfolio kamu. Tentukan: warna, font, halaman apa saja, tech stack. Tulis alasan setiap pilihan.
