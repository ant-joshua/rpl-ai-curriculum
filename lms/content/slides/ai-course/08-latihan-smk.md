---
title: "Latihan Modul 8: Prompt Challenge untuk Siswa SMK"
exercise_type: practice
---

# 🎯 Latihan Modul 8: Prompt Challenge untuk Siswa SMK

Selamat datang di latihan praktis Modul 8! Di sini kamu akan langsung berlatih memanfaatkan AI untuk kebutuhan sehari-hari siswa SMK. Kerjakan setiap latihan secara berurutan. Gunakan AI chatbot (ChatGPT, Claude, Gemini, atau lainnya) untuk mengerjakan.

> **Waktu total: ±90 menit** | **Total latihan: 6 aktivitas**
> **Catatan:** Salin prompt yang diberikan, lalu modifikasi sesuai kebutuhanmu!

---

## 📝 Latihan 1: Buat 5 Ringkasan dari Materi Berbeda
**⭐ Kesulitan: Mudah** | **⏱️ Waktu: 15 menit**

### Tujuan
Belajar menggunakan AI untuk meringkas materi pelajaran agar lebih mudah dipahami.

### Langkah Kerja
1. Pilih 5 materi pelajaran dari jurusanmu (misal: Pemrograman Web, Basis Data, Jaringan, dll)
2. Salin atau ketik ringkasan materi yang sudah dipelajari ke AI
3. Gunakan prompt di bawah untuk meringkas

### Prompt yang Harus Dicoba

**Prompt 1 — Ringkasan Singkat:**
```
Tolong ringkas materi berikut dalam 5 poin penting saja.
Materi: [tempel materi di sini]
```

**Prompt 2 — Ringkasan untuk Ujian:**
```
Saya punya materi tentang [topik]. Buatkan ringkasan dalam format
bullet point yang cocok untuk persiapan ujian. Fokus pada definisi,
contoh, dan rumus penting.
```

**Prompt 3 — Ringkasan dengan Analogi:**
```
Ringkas materi berikut dan jelaskan konsep sulitnya dengan analogi
sehari-hari yang mudah dipahami:
[tempel materi]
```

### Contoh Hasil yang Bagus
```
Materi: HTML Dasar
Ringkasan 5 Poin Penting:
1. HTML adalah bahasa markup untuk membuat struktur halaman web
2. Tag utama: <html>, <head>, <body> membentuk kerangka dokumen
3. Elemen teks: <h1>-<h6> (judul), <p> (paragraf), <a> (link)
4. Element container: <div> untuk blok, <span> untuk inline
5. Form input: <form>, <input>, <button> untuk interaksi user
```

### ✅ Cek Paham
- [ ] Sudah mencoba minimal 3 variasi prompt
- [ ] Bisa menjelaskan perbedaan hasil dari setiap variasi prompt
- [ ] Menyimpan ringkasan terbaikmu di catatan

---

## 🔧 Latihan 2: Debug 3 Kode Error dengan Bantuan AI
**⭐⭐ Kesulitan: Sedang** | **⏱️ Waktu: 15 menit**

### Tujuan
Belajar menggunakan AI sebagai asisten debugging untuk menemukan dan memperbaiki error kode.

### Langkah Kerja
1. Lihat kode bermasalah di bawah ini
2. Salin kode + error message ke AI chatbot
3. Minta AI menjelaskan error dan memberikan perbaikan

### Kode Bermasalah #1 — PHP

```php
<?php
$nama = "Budi";
$nim = 2023001;

if($nama == "Budi" && $nim == 2023001 {
    echo "Selamat datang, $nama!";
}
?>
```

**Prompt untuk AI:**
```
Tolong bantu debug kode PHP berikut. Saya dapat error ini:
[sebutkan error yang muncul atau minta AI menebak]

Kode saya:
<?php
$nama = "Budi";
$nim = 2023001;

if($nama == "Budi" && $nim == 2023001 {
    echo "Selamat datang, $nama!";
}
?>

Jelaskan: (1) Apa errornya, (2) Kenapa bisa error, (3) Bagaimana cara fix-nya
```

### Kode Bermasalah #2 — HTML

```html
<!DOCTYPE html>
<html>
<head>
    <title>Halaman Saya</title>
</head>
<body>
    <h1>Selamat Datang</h1>
    <p>Ini adalah paragraf pertama
    <p>Ini paragraf kedua</p>
    <div>
        <h2>Bagian Konten</h2>
        <p>Teks di dalam div
    </div>
</body>
</html>
```

**Prompt untuk AI:**
```
Cari semua error di kode HTML ini. Jelaskan setiap error dan
perbaikannya. Tampilkan kode yang sudah diperbaiki.

Kode: [tempel kode di atas]
```

### Kode Bermasalah #3 — JavaScript

```javascript
function hitungTotal(harga, jumlah) {
    diskon = 10;
    total = harga * jumlah * (1 - diskon);
    return total;
}

let hargaBuku = 50000;
let jumlahBeli = 3;
let totalBelanja = hitungTotal(hargaBuku, jumlahBeli);
console.log("Total belanja: " + totalBelanja);
```

**Prompt untuk AI:**
```
Kode JavaScript saya selalu menghasilkan nilai yang salah.
Tolong cek logikanya:

function hitungTotal(harga, jumlah) {
    diskon = 10;
    total = harga * jumlah * (1 - diskon);
    return total;
}

Hitung manual: harga 50000 x 3 = 150000, diskon 10% = harusnya 135000.
Tapi hasilnya aneh. Apa masalahnya?
```

### ✅ Cek Paham
- [ ] Berhasil menemukan semua error di kode #1 (kurung tutup hilang)
- [ ] Berhasil menemukan semua error di kode #2 (tag <p> tidak ditutup)
- [ ] Berhasil menemukan bug di kode #3 (diskon 10 bukan 10%, seharusnya 0.1)
- [ ] Bisa menjelaskan cara kerja debugger AI kepada teman

---

## 📋 Latihan 3: Buat Proposal Proyek Sederhana
**⭐⭐ Kesulitan: Sedang** | **⏱️ Waktu: 15 menit**

### Tujuan
Belajar membuat proposal proyek yang profesional dengan bantuan AI.

### Langkah Kerja
1. Pilih topik proyek yang relevan dengan jurusanmu
2. Gunakan prompt berikut untuk membuat proposal
3. Edit dan sesuaikan hasilnya

### Prompt Utama
```
Buatkan proposal proyek sederhana untuk tugas sekolah dengan format:

Judul Proyek: [pilih salah satu: Website Profil Sekolah / Aplikasi
Sistem Inventaris / Mobile App Absensi / Database Perpustakaan]

Format proposal harus mencakup:
1. Latar Belakang (3 paragraf)
2. Rumusan Masalah (3 pertanyaan)
3. Tujuan Proyek (3 poin)
4. Manfaat (untuk sekolah dan siswa)
5. Alat dan Bahan (hardware + software)
6. Timeline Pengerjaan (4 minggu)
7. Anggaran Biaya (estimasi sederhana)

Buat dalam bahasa Indonesia yang formal tapi mudah dipahami.
```

### Contoh Hasil yang Bagus
```
PROYEK: Sistem Inventaris Barang Laboratorium Komputer
SMK Negeri 1 Jakarta

1. LATAR BELAKANG
Laboratorium komputer SMK Negeri 1 Jakarta memiliki lebih dari
100 unit komputer dan perangkat pendukung lainnya. Saat ini,
pencatatan inventaris masih dilakukan secara manual menggunakan
buku catatan. Hal ini menyebabkan kesulitan dalam melacak
kondisi dan jumlah barang secara real-time...

2. RUMUSAN MASALAH
- Bagaimana cara mencatat barang masuk dan keluar secara efisien?
- Bagaimana memantau kondisi barang secara real-time?
- Bagaimana membuat laporan inventaris secara otomatis?
```

### Variasi Prompt Lanjutan
```
Sekarang buatkan bagian anggaran biaya untuk proyek di atas.
Gunakan format tabel dengan kolom: No, Uraian, Kuantitas,
Harga Satuan, Total. Sertakan minimal 8 item.
```

### ✅ Cek Paham
- [ ] Proposal memiliki minimal 5 bagian utama
- [ ] Timeline realistis untuk pengerjaan 4 minggu
- [ ] Anggaran masuk akal dan terperinci

---

## 📄 Latihan 4: Buat Surat Lamaran PKL
**⭐ Kesulitan: Mudah** | **⏱️ Waktu: 10 menit**

### Tujuan
Belajar membuat surat lamaran Praktik Kerja Lapangan yang profesional.

### Prompt Utama
```
Buatkan surat lamaran Praktik Kerja Lapangan (PKL) dengan data berikut:

Nama: [nama lengkap kamu]
Jurusan: [jurusan kamu]
Asal Sekolah: [nama sekolah]
Perusahaan tujuan: PT. Teknologi Nusantara
Posisi yang dilamar: Staff IT Support

Gunakan format surat lamaran resmi yang benar:
- Kepala surat (tanggal, kota)
- Lampiran yang disertakan (CV, transkrip, surat izin)
- Isi surat (paragraf pembuka, alamar melamar, keunggulan, penutup)
- Tanda tangan

Buat dalam bahasa Indonesia formal.
```

### Contoh Hasil yang Bagus
```
Surabaya, 15 Januari 2025

Kepada Yth.
Bapak/Ibu HR Manager
PT. Teknologi Nusantara
Jl. Raya Teknologi No. 100
Surabaya

Dengan hormat,

Yang bertanda tangan di bawah ini:
Nama        : Ahmad Rizki Pratama
NISN        : 0081234567
Jurusan     : Teknik Komputer & Jaringan
Asal Sekolah: SMK Negeri 5 Surabaya

Dengan ini mengajukan lamaran untuk mengikuti Praktik Kerja
Lapangan (PKL) di perusahaan Bapak/Ibu...
```

### Variasi Prompt
```
Sekarang buatkan versi yang lebih singkat (maksimal 1 paragraf
isi surat) tapi tetap profesional. Cocok untuk lamaran via email.
```

### ✅ Cek Paham
- [ ] Surat menggunakan format yang benar
- [ ] Ada minimal 3 lampiran yang disebutkan
- [ ] Bahasa formal dan sopan

---

## 👔 Latihan 5: Buat CV Lulusan SMK + Portofolio
**⭐⭐ Kesulitan: Sedang** | **⏱️ Waktu: 15 menit**

### Tujuan
Belajar membuat CV dan portofolio yang menarik untuk melamar kerja.

### Prompt CV
```
Buatkan CV untuk lulusan SMK dengan format ATS-friendly:

Data Saya:
Nama: [nama kamu]
Jurusan: [jurusan]
Sekolah: [nama sekolah]
Tahun Lulus: 2025
Prestasi: [sebutkan 2-3 prestasi]
Keterampilan: [sebutkan skill yang dimiliki]
Proyek Sekolah: [sebutkan 1-2 proyek]

Format CV harus mencakup:
1. Header (nama, kontak, summary singkat 2 kalimat)
2. Pendidikan
3. Keterampilan Teknis (dengan level: mahir/menengah/pemula)
4. Pengalaman Organisasi/Proyek
5. Sertifikasi (jika ada)
6. Referensi

Buat dalam bahasa Indonesia.
```

### Prompt Portofolio
```
Buatkan deskripsi portofolio online untuk lulusan SMK jurusan
[jurusan]. Sertakan:

1. Bio singkat (3 kalimat, menarik dan profesional)
2. Daftar 5 proyek yang harus ada di portofolio:
   - Judul proyek
   - Deskripsi singkat (2 kalimat)
   - Teknologi yang digunakan
3. Linkdummy untuk GitHub, LinkedIn, dan website pribadi
4. Call-to-action untuk recruiter
```

### Contoh Hasil yang Bagus
```
PROFIL
Ahmad Rizki Pratama | Junior Web Developer
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Lulusan SMK Negeri 5 Surabaya jurusan PPLG dengan semangat
belajar tinggi. Berpengalaman membangun 5+ proyek web selama
sekolah. Siap berkontribusi di tim teknologi yang dinamis.

PENDIDIKAN
🎓 SMK Negeri 5 Surabaya — PPLG (2022-2025)
   • Rata-rata UN: 87.5
   • Juara 2 Lomba Web Design Tingkat Kota (2024)

SKILL TEKNIS
• HTML/CSS ........... ⭐⭐⭐⭐⭐ (Mahir)
• JavaScript ......... ⭐⭐⭐⭐ (Menengah)
• PHP/MySQL .......... ⭐⭐⭐ (Menengah)
• React Dasar ........ ⭐⭐ (Pemula)
```

### ✅ Cek Paham
- [ ] CV memiliki format yang rapi dan terstruktur
- [ ] Ada minimal 5 skill teknis yang disebutkan
- [ ] Portofolio memiliki minimal 3 proyek contoh

---

## 🎤 Latihan 6: Mock Interview — AI Jadi Interviewer
**⭐⭐⭐ Kesulitan: Sulit** | **⏱️ Waktu: 20 menit**

### Tujuan
Berlatih interview kerja dengan AI sebagai interviewer untuk meningkatkan kepercayaan diri.

### Langkah Kerja
1. Gunakan prompt di bawah untuk memulai sesi interview
2. Jawab setiap pertanyaan AI dengan jujur dan percaya diri
3. Setelah selesai, minta AI menilai performamu

### Prompt Memulai Interview
```
Kamu adalah HR Manager di PT. TechCorp Indonesia yang sedang
mencari karyawan untuk posisi Junior Web Developer.

Saya adalah lulusan SMK jurusan PPLG yang baru tamat.
Mulai interview sekarang! Berikan pertanyaan satu per satu,
tunggu jawaban saya sebelum lanjut ke pertanyaan berikutnya.

Mulai dari pertanyaan pembuka, lalu masuk ke pertanyaan teknis,
dan akhiri dengan pertanyaan tentang motivasi kerja.

Setelah 10 pertanyaan selesai, berikan penilaian lengkap:
1. Skor 1-10 untuk setiap pertanyaan
2. Kelebihan jawaban saya
3. Yang perlu diperbaiki
4. Tips untuk interview sesungguhnya
```

### 10 Pertanyaan yang Harus Dijawab
Berikut preview pertanyaan yang mungkin ditanyakan AI:

| No | Kategori | Pertanyaan |
|----|----------|------------|
| 1 | Pembuka | Ceritakan tentang diri Anda singkat |
| 2 | Pembuka | Mengapa tertarik dengan posisi ini? |
| 3 | Teknis | Apa itu HTML, CSS, dan JavaScript? |
| 4 | Teknis | Pernah buat proyek web apa saja? |
| 5 | Teknis | Apa yang dilakukan jika kode tidak bisa jalan? |
| 6 | Teknis | Apa perbedaan array dan object di JS? |
| 7 | Softskill | Ceritakan pengalaman kerja tim |
| 8 | Softskill | Bagaimana kamu menghadapi deadline ketat? |
| 9 | Motivasi | Di mana kamu melihat diri 5 tahun lagi? |
| 10 | Penutup | Apa ada pertanyaan dari Anda? |

### Prompt Setelah Interview
```
Terima kasih untuk interview-nya. Sekarang tolong:

1. Berikan skor untuk setiap pertanyaan (1-10)
2. Jelaskan 3 kelebihan jawaban saya
3. Jelaskan 3 hal yang perlu diperbaiki
4. Berikan contoh jawaban yang lebih baik untuk pertanyaan
   nomor [pilih pertanyaan terlemahmu]
5. Tips praktis untuk interview di dunia nyata
```

### ✅ Cek Paham
- [ ] Berhasil menjawab semua 10 pertanyaan
- [ ] Menerima dan memahami penilaian dari AI
- [ ] Menulis ulang minimal 2 jawaban berdasarkan feedback AI
- [ ] Merasa lebih percaya diri untuk interview sesungguhnya

---

## 💡 Tips Sukses Latihan SMK

### Prompting yang Efektif
- **Spesifik:** Jangan hanya "buatkan CV" → tapi "buatkan CV lulusan SMK PPLG yang melamar posisi web developer"
- **Berikan data diri:** Semakin banyak konteks, semakin bagus hasilnya
- **Minta format:** "Gunakan tabel", "Buat dalam poin", "Format ATS-friendly"

### Kesalahan yang Harus Dihindari
- ❌ Copy-paste hasil AI tanpa diedit
- ❌ Tidak memverifikasi fakta dari hasil AI
- ❌ Mengandalkan AI 100% tanpa pemahaman sendiri
- ❌ Menggunakan prompt yang terlalu pendek/vague

### Tahapan Pengerjaan
1. **Baca** instruksi dengan seksama
2. **Salin** prompt yang diberikan
3. **Tempel** ke AI chatbot
4. **Modifikasi** sesuai data dirimu
5. **Evaluasi** hasil yang diberikan AI
6. **Edit** agar sesuai kebutuhanmu

---

## 🏆 Penilaian Diri

Setelah menyelesaikan semua latihan, berikan penilaian pada diri sendiri:

| Latihan | Selesai? | Kualitas (1-5) | Yang Dipelajari |
|---------|----------|-----------------|-----------------|
| 1. Ringkasan | ☐ | ___ | |
| 2. Debug Kode | ☐ | ___ | |
| 3. Proposal | ☐ | ___ | |
| 4. Surat Lamaran | ☐ | ___ | |
| 5. CV + Portofolio | ☐ | ___ | |
| 6. Mock Interview | ☐ | ___ | |

**Pertanyaan Refleksi:**
1. Latihan mana yang paling berguna untukmu? Kenapa?
2. Apa prompt paling efektif yang kamu temukan?
3. Skill apa yang ingin kamu kembangkan lebih lanjut?

---

> **⬅️ Kembali ke Materi Modul 8** | **Selanjutnya: Modul 9 ➡️**
