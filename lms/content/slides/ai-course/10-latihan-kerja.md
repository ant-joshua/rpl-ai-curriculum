---
title: "Latihan Modul 10: Prompt Challenge untuk Dunia Kerja"
exercise_type: practice
---

# 🎯 Latihan Modul 10: Prompt Challenge untuk Dunia Kerja

Latihan praktis untuk profesional yang ingin meningkatkan produktivitas kerja dengan AI. Dari email bisnis hingga negosiasi gaji!

> **Waktu total: ±90 menit** | **Total latihan: 6 aktivitas**
> **Catatan:** Latihan ini dirancang untuk pekerja pemula hingga menengah. Gunakan AI chatbot favoritmu.

---

## 📧 Latihan 1: Draft 5 Email Kerja Berbeda Situasi
**⭐ Kesulitan: Mudah** | **⏱️ Waktu: 15 menit**

### Tujuan
Belajar membuat email kerja profesional untuk berbagai situasi dengan bantuan AI.

### Email #1 — Email Perkenalan ke Klien Baru
```
Buatkan email perkenalan dari saya ke klien baru.

Data:
- Nama saya: [nama]
- Jabatan: Account Manager di PT. Solusi Digital
- Klien: PT. Maju Bersama (bidang manufaktur)
- Tujuan: Memperkenalkan layanan dan menjadwalkan meeting

Aturan:
- Bahasa Indonesia formal tapi hangat
- Maksimal 4 paragraf
- Sertakan call-to-action yang jelas
- Tidak lebih dari 200 kata
```

### Email #2 — Follow-up Setelah Meeting
```
Buatkan email follow-up setelah meeting dengan klien.

Konteks:
- Meeting kemarin membahas proyek website redesign
- Klien minta revisi proposal
- Deadline revisi: 3 hari lagi
- Saya perlu menanyakan dokumen tambahan

Aturan:
- Buka dengan terima kasih atas waktunya
- Ringkas 3 poin utama dari meeting
- Sertakan action items yang jelas
- Tutup dengan deadline yang friendly
```

### Email #3 — Minta Izin Tidak Masuk Kerja
```
Buatkan email izin tidak masuk kerja.

Data:
- Nama: [nama]
- Jabatan: Staff Marketing
- Alasan: Urusan keluarga mendadak
- Durasi: 2 hari (Senin-Selasa)
- Siapa yang cover: Rina (rekan kerja)
- Tugas mendesak: Presentasi client Rabu

Aturan:
- Formal tapi tidak kaku
- Sertakan plan untuk ketiadaan
- Sertakan kontak yang bisa dihubungi
```

### Email #4 — Melaporkan Bug/Issue ke Tim IT
```
Buatkan email laporan bug ke tim IT support.

Data:
- Aplikasi: Sistem CRM internal
- Bug: Tidak bisa export data penjualan ke Excel
- Muncul error: "Failed to generate report" pada jam 14:30
- Sudah dicoba: Refresh, clear cache, ganti browser
- Dampak: Tidak bisa bikin laporan bulanan (deadline besok)

Aturan:
- Gunakan format yang jelas (judul, deskripsi, langkah)
- Sertakan screenshot info (minta AI kasih panduan)
- Urgency level: Tinggi
```

### Email #5 — Berterima Kasih ke Atas atas Promosi
```
Buatkan email terima kasih ke atasan setelah mendapat promosi.

Data:
- Promosi: dari Junior Developer ke Senior Developer
- Atasan: Budi Santoso (Engineering Manager)
- Mulai efektif: bulan depan

Aturan:
- Sopan dan profesional
- Tunjukkan antusiasme tapi tidak berlebihan
- Sertakan komitmen untuk role baru
- Maksimal 150 kata
```

### Contoh Hasil Email #1
```
Subject: Perkenalan — PT. Solusi Digital | Partner Teknologi
         Anda

Yth. Bapak/Ibu Direktur PT. Maju Bersama,

Semoga email ini menemukan Bapak/Ibu dalam keadaan sehat.
Perkenalkan, saya [nama] dari PT. Solusi Digital sebagai
Account Manager yang ditugaskan untuk menjalin kerja sama
dengan PT. Maju Bersama.

Sebagai perusahaan yang bergerak di bidang manufaktur,
PT. Maju Bersama memiliki potensi besar untuk meningkatkan
efisiensi operasional melalui transformasi digital. Kami
telah membantu 50+ perusahaan manufaktur dalam optimalisasi
proses bisnis melalui solusi ERP dan otomasi.

Saya ingin menjadwalkan sesi perkenalan singkat (30 menit)
untuk memahami kebutuhan Bapak/Ibu. Apakah ada waktu yang
cocok minggu depan? Kami fleksibel untuk meeting offline
di lokasi Bapak/Ibu atau via video call.

Atas perhatian dan waktu yang diberikan, terima kasih.

Hormat saya,
[nama]
Account Manager — PT. Solusi Digital
```

### ✅ Cek Paham
- [ ] Semua 5 email selesai dibuat
- [ ] Setiap email memiliki subject yang jelas
- [ ] Bahasa konsisten formal dan profesional
- [ ] Setiap email memiliki CTA (Call to Action)

---

## 📋 Latihan 2: Buat Meeting Notes dari Transkrip
**⭐⭐ Kesulitan: Sedang** | **⏱️ Waktu: 15 menit**

### Tujuan
Belajar mengubah transkrip rapat yang berantakan menjadi meeting notes yang terstruktur.

### Transkrip Sample
```
[Transkrip Meeting Tim Dev — 3 September 2025]

Andi: Oke kita mulai ya. Sprint kemarin gimana?
Budi: Lumayan, tapi ada blocker di API payment gateway.
Citra: Iya, itu harus diresolv dulu sebelum release.
Andi: Oke, Budi handle ya deadline Jumat.
Budi: Siap. Oh ya,客户 minta fitur baru, notifikasi email.
Dina: Itu bisa saya handle, tapi perlu waktu 3 hari.
Andi: Oke, Dina mulai Senin. Yang lain ada update?
Eko: Database harus di-scale, mulai lambat kalau user > 1000.
Andi: Oke, ini priority tinggi. Eko buat proposal-nya.
Fani: Sprint planning besok jam 10 ya, tolong siapkan semua.
Andi: Oke, kita tutup. Terima kasih semua.
```

### Prompt Meeting Notes
```
Berikut transkrip meeting tim developer. Buatkan meeting notes
dengan format:

TRANSKRIP:
[tempel transkrip]

FORMAT YANG DIINGINKAN:
1. Header: Judul Meeting, Tanggal, Peserta, Moderator
2. Ringkasan Eksekutif (3 kalimat)
3. Topik yang Dibahas (per topik):
   - Deskripsi singkat
   - Keputusan yang diambil
   - Siapa yang bertanggung jawab
4. Action Items (format tabel):
   | No | Tugas | PIC | Deadline | Status |
5. Topik untuk Meeting Berikutnya
6. Catatan Tambahan (jika ada)

Buat dalam bahasa Indonesia yang profesional.
```

### Contoh Hasil
```
══════════════════════════════════════════════
MEETING NOTES — Tim Development
══════════════════════════════════════════════
Tanggal    : 3 September 2025
Waktu      : [waktu meeting]
Peserta    : Andi, Budi, Citra, Dina, Eko, Fani
Moderator  : Andi

RINGKASAN EKSEKUTIF
Meeting membahas progress sprint, blockers, dan rencana
sprint berikutnya. Terdapat 3 action items utama yang
perlu diselesaikan sebelum sprint planning besok.

──────────────────────────────────────────────
ACTION ITEMS
──────────────────────────────────────────────
| No | Tugas                               | PIC  | Deadline | Status  |
|----|--------------------------------------|------|----------|---------|
| 1  | Resolve blocker API payment gateway  | Budi | Jumat    | Pending |
| 2  | Implement fitur notifikasi email     | Dina | 3 hari   | Pending |
| 3  | Buat proposal scale database         | Eko  | [tbd]    | Pending |

──────────────────────────────────────────────
NEXT MEETING
──────────────────────────────────────────────
- Sprint planning besok jam 10:00
- Siapkan status update masing-masing
- Bawa proposal scale database (Eko)
```

### ✅ Cek Paham
- [ ] Meeting notes memiliki header yang lengkap
- [ ] Semua action items teridentifikasi dengan benar
- [ ] Setiap action item memiliki PIC dan deadline

---

## 📊 Latihan 3: Buat Laporan Mingguan dari Data Mentah
**⭐⭐ Kesulitan: Sedang** | **⏱️ Waktu: 15 menit**

### Tujuan
Belajar menyusun laporan kerja mingguan yang profesional dari data mentah.

### Data Mentah
```
Data kerja minggu ini (3-7 September 2025):

Senin:
- Meeting dengan tim design (1 jam)
- Review 3 pull request code
- Deploy website ke staging

Selasa:
- Fix bug login di mobile app (2 jam)
- Pair programming dengan junior dev (1 jam)
- Dokumentasi API endpoint baru

Rabu:
- Presentasi progress ke manager
- Code review lagi (4 PR)
- Optimization database query

Kamis:
- Implement fitur baru: search filter
- Meeting dengan client (1.5 jam)
- Update Jira tickets

Jumat:
- Sprint retrospective
- Bertemu mentor untuk career development
- Deploy ke production (berhasil!)
```

### Prompt Laporan Mingguan
```
Berikut data kerja mentah saya minggu ini. Buatkan laporan
mingguan profesional untuk dikirim ke atasan.

DATA MENTAH:
[tempel data di atas]

FORMAT LAPORAN:
1. Header: Nama, Jabatan, Periode Laporan
2. Ringkasan Pencapaian (3-5 bullet poin utama)
3. Detail Pekerjaan per Hari (tabel)
4. Pencapaian Kuantitatif:
   - Jumlah PR yang di-review
   - Jumlah deploy
   - Jam meeting
   - Bug yang di-fix
5. Blocking Issues (jika ada)
6. Rencana Minggu Depan (5 item)
7. Bukti/Link Pendukung

Gaya bahasa: profesional, singkat padat, gunakan angka.
```

### Contoh Hasil
```
LAPORAN KERJA MINGGUAN
═══════════════════════
Nama      : [nama]
Jabatan   : Junior Web Developer
Periode   : 3 — 7 September 2025

RINGKASAN PENCAPAIAN
━━━━━━━━━━━━━━━━━━━
✅ Website berhasil di-deploy ke production
✅ Bug login mobile app berhasil di-fix
✅ Fitur baru search filter selesai 80%
✅ 11 pull request di-review
✅ Database query dioptimasi

STATISTIK MINGGU INI
━━━━━━━━━━━━━━━━━━━
• PR di-review      : 11
• Deploy            : 2 (staging + production)
• Jam meeting       : 3.5 jam
• Bug di-fix        : 1
• Dokumentasi       : 1 API endpoint

RENCANA MINGGU DEPAN
━━━━━━━━━━━━━━━━━━━
1. Selesaikan fitur search filter (100%)
2. Review 5 PR dari junior dev
3. Persiapkan presentasi sprint review
4. Mulai eksplorasi caching mechanism
5. Update dokumentasi teknis
```

### ✅ Cek Paham
- [ ] Laporan memiliki struktur yang jelas
- [ ] Ada data kuantitatif (angka) yang relevan
- [ ] Rencana minggu depan spesifik dan terukur

---

## 🗂️ Latihan 4: Break Down Proyek Jadi WBS
**⭐⭐⭐ Kesulitan: Sulit** | **⏱️ Waktu: 15 menit**

### Tujuan
Belajar memecah proyek besar menjadi tugas-tugas kecil yang bisa dikerjakan (Work Breakdown Structure).

### Prompt WBS
```
Saya punya proyek: "Membangun Website E-Commerce Toko Online
Fashion"

Break down proyek ini menjadi Work Breakdown Structure (WBS)
dengan format:

Level 1: Fase proyek (minimal 5 fase)
Level 2: Task utama per fase (minimal 3 per fase)
Level 3: Sub-task per task (minimal 2 per sub-task)

Untuk setiap task, berikan:
- Estimasi waktu (jam/hari)
- Skill yang dibutuhkan
- Dependensi (task yang harus selesai dulu)
- Level prioritas (tinggi/sedang/rendah)

Tampilkan dalam format pohon (tree) atau tabel hierarki.
```

### Contoh WBS Hasil
```
WBS: Website E-Commerce Toko Online Fashion
═══════════════════════════════════════════

1.0 PERENCANAAN (5 hari) 🔴 Prioritas Tinggi
├── 1.1 Gathering Requirements (2 hari)
│   ├── 1.1.1 Interview stakeholder (4 jam)
│   └── 1.1.2 Dokumentasi requirement (8 jam)
├── 1.2 Wireframe & Mockup (2 hari)
│   ├── 1.2.1 Buat wireframe halaman utama (4 jam)
│   └── 1.2.2 Buat wireframe halaman produk (4 jam)
└── 1.3 Tech Stack Decision (1 hari)
    ├── 1.3.1 Evaluasi framework (4 jam)
    └── 1.3.2 Setup repository (2 jam)

2.0 DESIGN (7 hari) 🟡 Prioritas Sedang
├── 2.1 UI Design (4 hari)
├── 2.2 Database Design (2 hari)
└── 2.3 API Design (1 hari)

3.0 DEVELOPMENT (15 hari) 🔴 Prioritas Tinggi
├── 3.1 Frontend Development (8 hari)
├── 3.2 Backend Development (10 hari)
└── 3.3 Integration (3 hari)

4.0 TESTING (5 hari) 🔴 Prioritas Tinggi
├── 4.1 Unit Testing (2 hari)
├── 4.2 Integration Testing (2 hari)
└── 4.3 UAT (1 hari)

5.0 DEPLOYMENT (3 hari) 🟡 Prioritas Sedang
├── 5.1 Server Setup (1 hari)
├── 5.2 Deployment (1 hari)
└── 5.3 Monitoring Setup (1 hari)
```

### Latihan Tambahan — Estimasi Biaya
```
Berdasarkan WBS di atas, buatkan estimasi biaya proyek
menggunakan format:

| Fase | Effort (hari) | Rate/hari | Total Biaya |
|------|---------------|-----------|-------------|

Asumsi:
- Developer: Rp 500.000/hari
- Designer: Rp 400.000/hari
- QA: Rp 350.000/hari
- PM: Rp 600.000/hari
```

### ✅ Cek Paham
- [ ] WBS memiliki minimal 5 fase utama
- [ ] Setiap fase memiliki minimal 3 task
- [ ] Estimasi waktu realistis
- [ ] Dependensi antar task teridentifikasi

---

## 📝 Latihan 5: Buat SOP Sederhana
**⭐⭐ Kesulitan: Mudah** | **⏱️ Waktu: 10 menit**

### Tujuan
Belajar membuat Standard Operating Procedure (SOP) yang jelas dan bisa diikuti siapa saja.

### Prompt SOP
```
Buatkan SOP untuk: "Proses Onboarding Karyawan Baru di
Bagian IT"

Format SOP:
1. Header SOP (Nomor, Judul, Efektif Berlaku, Pembuat)
2. Tujuan
3. Ruang Lingkup
4. Definisi & Istilah
5. Tanggung Jawab (siapa yang melakukan apa)
6. Prosedur (step-by-step dengan nomor)
7. Formulir Terkait
8. Riwayat Perubahan

Setiap langkah prosedur harus:
- Nomor urut jelas
- Tindakan spesifik (bukan ambigu)
- PIC yang bertanggung jawab
- Estimasi waktu per langkah

Buat dalam bahasa Indonesia formal.
```

### Contoh Hasil — SOP Fragment
```
SOP-IT-001: PROSES ONBOARDING KARYAWAN BARU
═══════════════════════════════════════════
Berlaku Efektif : 1 September 2025
Dibuat Oleh      : HR & IT Manager
Revisi           : 1.0

TUJUAN
Memastikan setiap karyawan baru di bagian IT mendapatkan
akses dan perangkat yang diperlukan untuk bekerja secara
produktif dalam waktu maksimal 3 hari kerja.

PROSEDUR
━━━━━━━━

LANGKAH 1: Persiapan (H-1 masuk kerja)
  1.1 HR mengirim data karyawan baru ke IT Admin
  1.2 IT Admin membuat akun email perusahaan
  1.3 IT Admin menyiapkan laptop/perangkat
  PIC: IT Admin
  Estimasi: 2 jam

LANGKAH 2: Hari Pertama Masuk
  2.1 IT Admin serahkan perangkat + credential
  2.2 IT Admin brief tentang sistem internal
  2.3 Karyawan login dan verifikasi semua akses
  PIC: IT Admin, Karyawan Baru
  Estimasi: 3 jam

LANGKAH 3: Hari Kedua — Verifikasi
  3.1 Karyawan konfirmasi semua akses berfungsi
  3.2 IT Admin daftarkan ke tools tim (Jira, Slack, dll)
  3.3 Karyawan mulai akses project documentation
  PIC: IT Admin, Team Lead
  Estimasi: 2 jam
```

### ✅ Cek Paham
- [ ] SOP memiliki header yang lengkap
- [ ] Setiap langkah spesifik dan bisa diikuti
- [ ] Ada PIC untuk setiap langkah
- [ ] Estimasi waktu realistis

---

## 💰 Latihan 6: Salary Negotiation Prep — AI Jadi HR
**⭐⭐⭐ Kesulitan: Sulit** | **⏱️ Waktu: 20 menit**

### Tujuan
Berlatih negosiasi gaji dengan AI berperan sebagai HR untuk mempersiapkan strategi negosiasi.

### Prompt Memulai
```
Kamu adalah HR Manager di PT. Tech Innovator Indonesia.
Saya adalah kandidat yang sudah lolos semua tahap interview
untuk posisi: Junior Full-Stack Developer.

Skenario:
- Gaji yang ditawarkan perusahaan: [atau biarkan AI menentukan]
- Gaji yang saya harapkan: [harga pasar untuk posisi ini]
- Pengalaman: Lulusan SMK/S1, 0-1 tahun pengalaman
- Keunggulan: Portfolio project, sertifikasi [sebutkan]

Mulai simulasi negosiasi gaji. Mulai dari tawaran awal
perusahaan, lalu biarkan saya melakukan counter-offer.

Setelah negosiasi selesai, berikan:
1. Penilaian performa negosiasi saya (1-10)
2. Strategi yang sudah saya gunakan
3. Strategi yang bisa lebih baik
4. Red flags yang harus diwaspadai
5. Tips negosiasi untuk pemula
```

### Prompt Persiapan Sebelum Negosiasi
```
Sebelum simulasi negosiasi, tolong bantu saya siapkan:

1. Riset gaji: Berapa range gaji Junior Full-Stack Developer
   di Indonesia tahun 2025? (Jakarta, Surabaya, Remote)

2. Daftar 5 leverage point yang bisa saya gunakan:
   - Skill yang langka
   - Portfolio yang menunjukkan value
   - Sertifikasi yang relevan
   - Kompetisi dari perusahaan lain
   - Preferensi flexibility

3. Daftar 5 pertanyaan yang TIDAK BOLEH saya tanyakan
   di awal negosiasi

4. Daftar 5 hal yang HARUS saya tanyakan sebelum
   menerima tawaran

5. Script opening negosiasi yang professional
```

### Prompt Follow-up — Skenario Sulit
```
Sekarang tambahkan skenario sulit:

SKENARIO 1: HR berkata "Ini sudah final, tidak bisa naik"
→ Bantu saya cara respond

SKENARIO 2: HR tawarkan kompensasi non-tunai
→ Bantu saya evaluasi apakah worth it

SKENARIO 3: HR minta saya sign kontrak di hari yang sama
→ Bantu saya cara minta waktu tanpa kehilangan offer

SKENARIO 4: Saya dapat offer dari perusahaan lain
→ Bantu saya cara leverage ini tanpa bluff

Untuk setiap skenario, berikan:
- Contoh respons yang bisa saya ucapkan
- Bahasa tubuh yang disarankan
- Yang harus dihindari
```

### Contoh Hasil — Opening Negotiation
```
STRATEGI NEGOSIASI GAJI
═══════════════════════

LANGKAH 1: OPENING (Anda)
"Saya sangat antusias dengan kesempatan ini. Berdasarkan
riset yang saya lakukan dan pengalaman yang saya miliki,
range gaji untuk posisi ini di pasar adalah Rp 7-9 juta.
Apakah ada fleksibilitas dalam kompensasi yang ditawarkan?"

LANGKAH 2: RESPON HR
"Menghargai riset Anda. Untuk posisi junior, budget kami
adalah Rp 6-7.5 juta. Tapi kita bisa lihat dari sisi
total compensation..."

LANGKAH 3: COUNTER-OFFER ANDA
"Saya menghargai budget tersebut. Mempertimbangkan
[portfolio project X], [sertifikasi Y], dan fakta bahwa
saya bisa langsung produktif tanpa training panjang,
apakah ada kemungkinan di range Rp 7.5-8 juta?
Atau bisa kita lihat dari sisi benefit lain seperti
[flexible work, training budget, performance bonus]?"

YANG HARUS DIHINDARI:
❌ "Kalau tidak Rp 8 juta, saya tidak mau"
❌ "Teman saya gajinya lebih tinggi"
❌ Membandingkan langsung dengan kandidat lain

YANG HARUS DILAKUKAN:
✅ Tunjukkan value yang kamu bawa
✅ Bersikap fleksibel tapi punya angka target
✅ Negosiasi total compensation, bukan hanya base salary
```

### ✅ Cek Paham
- [ ] Mengetahui range gaji untuk posisi yang dilamar
- [ ] Memiliki minimal 3 leverage point
- [ ] Bisa merespons setidaknya 2 skenario sulit
- [ ] Merasa lebih percaya diri untuk negosiasi nyata

---

## 💡 Tips Sukses Latihan Dunia Kerja

### Komunikasi Profesional via Email
- **Subject harus spesifik** — hindari "Tolong bantu"
- **Paragraf pertama** langsung ke inti
- **Tutup dengan CTA** yang jelas (action yang diharapkan)
- **Proofread** sebelum kirim — AI bisa bantu cek tata bahasa

### Meeting Notes yang Efektif
- Fokus pada **keputusan dan action items**, bukan transkrip
- Gunakan **format konsisten** setiap meeting
- Kirim notes **dalam 1 jam** setelah meeting selesai
- **Follow up** action items secara berkala

### Negosiasi Gaji
- **Riset dulu** sebelum masuk ruangan negosiasi
- **Jangan menerima tawaran pertama** tanpa diskusi
- **Negosiasi total package** (gaji + benefit + bonus)
- **Dokumentasikan** semua yang disepakati secara tertulis

---

## 🏆 Penilaian Diri

| Latihan | Selesai? | Kualitas (1-5) | Paling Berguna? |
|---------|----------|-----------------|------------------|
| 1. Email Kerja | ☐ | ___ | ☐ |
| 2. Meeting Notes | ☐ | ___ | ☐ |
| 3. Laporan Mingguan | ☐ | ___ | ☐ |
| 4. WBS Proyek | ☐ | ___ | ☐ |
| 5. SOP | ☐ | ___ | ☐ |
| 6. Negosiasi Gaji | ☐ | ___ | ☐ |

**Refleksi:**
1. Skill mana yang paling langsung bisa kamu gunakan di kerja?
2. Situasi kerja apa yang menurutmu paling challenging untuk AI?
3. Apa yang membuat email/pesan kerja terlihat profesional vs amatir?

---

> **⬅️ Kembali ke Materi Modul 10** | **Selanjutnya: Modul 11 ➡️**
