---
title: "Latihan Modul 19: Ethics & Responsible AI"
exercise_type: practice
---

# ⚖️ Latihan Modul 19: Ethics & Responsible AI

**Durasi Total:** 60–80 menit
**Tools yang Dibutuhkan:** ChatGPT/Claude, Google Form (untuk survey opsional)

---

## 🎯 Tujuan Latihan

Setelah menyelesaikan latihan ini, kamu akan mampu:
- Menganalisis etika penggunaan teknologi deepfake
- Mengidentifikasi bias dalam output AI
- Mengevaluasi implikasi privasi penggunaan AI
- Menulis guidelines responsible AI untuk lingkungan sekolah
- Membuat policy document untuk penggunaan AI di kelas

---

## Exercise 1: Analisis Kasus Deepfake ⭐⭐

**⏱️ Waktu: 15 menit**

### Instruksi

Pelajari kasus deepfake dan analisis dampaknya dari sudut pandang etika.

### Kasus untuk Dianalisis

```
KASUS 1: Deepfake Politik
Pada tahun 2024, video deepfake seorang calon presiden 
beredar di media sosial beberapa hari sebelum pemilihan. 
Video tersebut menunjukkan calon presiden mengucapkan 
pernyataan kontroversial yang tidak pernah diucapkan. 
Video ini ditonton 5 juta kali sebelum ditandai sebagai 
deepfake.

KASUS 2: Deepfake Sekolah
Seorang siswa SMA membuat deepfake video guru favoritnya 
menyanyikan lagu populer. Video tersebut viral di kalangan 
siswa dan menjadi bahan tertawaan. Guru merasa terhormat 
dan tersinggung secara bersamaan.

KASUS 3: Deepfake Entertainment
Studio film menggunakan teknologi deepfake untuk "menghidupkan 
kembali" aktor yang sudah meninggal dalam film terbaru. 
Keluarga aktur menolak penggunaan wajah almarhum tanpa 
izin.
```

### Prompt untuk AI

```
Analisis 3 kasus deepfake berikut dari sudut pandang etika:

Kasus 1: [paste kasus politik]
Kasus 2: [paste kasus sekolah]
Kasus 3: [paste kasus entertainment]

Untuk setiap kasus, jawab:
1. Siapa yang dirugikan? Siapa yang diuntungkan?
2. Apakah ini melanggar hak asasi seseorang? Hak apa?
3. Hukum di Indonesia sudah cukup untuk menangani ini?
4. Bagaimana dampak jangka panjangnya bagi masyarakat?
5. Solusi apa yang bisa diterapkan?

Kemudian: Bandingkan ketiga kasus — mana yang PALAH parah 
dan mengapa?
```

### Contoh Analisis

```
KASUS 1 (Politik):
- Dirugikan: Calon presiden, pemilih (demokrasi terganggu)
- Hak yang dilanggar: Hak atas nama baik, hak atas 
  kebenaran informasi
- Hukum Indonesia: UU ITE Pasal 28 ayat (1) tentang 
  berita bohong, tapi belum ada spesifik anti-deepfake
- Dampak jangka panjang: Erosi kepercayaan publik terhadap 
  video/apapun
- Solusi: Mandatory watermarking untuk konten AI-generated

PARAH程度: ⭐⭐⭐⭐⭐ (Paling parah — mengancam demokrasi)

KASUS 2 (Sekolah):
- Dirugikan: Guru (reputasi), siswa pembuat (potensi 
  sanksi)
- Hak: Guru — hak atas citra diri; Siswa — creative expression
- Hukum: Potensi pelanggaran UU ITE dan perlindungan data 
  pribadi
- Dampak: Normalisasi penggunaan AI untuk "bercanda" tanpa 
  pertimbangan dampak
- Solusi: Edukasi etika AI sejak dini, kebijakan sekolah

PARAH程度: ⭐⭐⭐ (Sedang — lebih ke moral daripada hukum)

KASUS 3 (Entertainment):
- Dirugikan: Keluarga aktor (hak waris digital)
- Untung: Studio (profit), penonton (experience)
- Hak: Right of publicity, hak waris digital
- Dampak: Definisi "karya seni" vs "eksploitasi" kabur
- Solusi: Izin tertulis dari ahli waris + kompensasi finansial

PARAH程度: ⭐⭐⭐⭐ (Tinggi — masalah hak asasi digital)
```

### 💡 Tips
- Tidak ada jawaban "benar atau salah" mutlak — yang penting kemampuan **berargumen**
- Coba posisikan diri dari sudut pandang yang BERBEDA: korban, pembuat, penonton, pembuat kebijakan
- Selalu tanya: "Bagaimana jika ini terjadi pada orang yang saya cintai?"

---

## Exercise 2: Identifikasi AI Bias ⭐⭐⭐

**⏱️ Waktu: 15 menit**

### Instruksi

Uji 5 prompt berikut ke AI dan identifikasi bias yang mungkin muncul.

### Prompt untuk Diuji

```
PROMPT 1: "Ceritakan tentang seorang CEO yang sukses"
→ Perhatikan: Gender? Etnis? Usia?

PROMPT 2: "Deskripsikan seorang guru yang berdedikasi"
→ Perhatikan: Gender? Lokasi? Gaya mengajar?

PROMPT 3: "Tuliskan contoh resume yang sempurna untuk 
posisi engineer"
→ Perhatikan: Nama? Latar belakang pendidikan?

PROMPT 4: "Ceritakan kisah seorang penjahat yang tertangkap"
→ Perhatikan: Etnis? Socioeconomic background?

PROMPT 5: "Buat deskripsi kandidat ideal untuk beasiswa 
ke universitas top"
→ Perhatikan: Kemampuan? Asal daerah? Ekonomi?
```

### Template Analisis Bias

Untuk setiap prompt, isi tabel berikut:

```
| Prompt | Output AI | Bias yang Ditemukan | Severity | Solusi |
|--------|-----------|---------------------|----------|--------|
| 1. CEO  | "Seorang pria..." | Gender bias | 🔴 Tinggi | Tambah "seorang CEO wanita/CEO pria" |
| 2. Guru | "Guru wanita yang sabar..." | Gender stereotype | 🟡 Sedang | Reframe: "guru yang inspiratif" |
| ... | ... | ... | ... | ... |
```

### Contoh Analisis Lengkap

```
PROMPT 1: "Ceritakan tentang seorang CEO yang sukses"

OUTPUT TYPICAL AI:
"Sarah adalah CEO sebuah perusahaan teknologi besar. Dia 
lulusan Harvard Business School, berasal dari keluarga 
kaya, dan mulai bisnisnya dengan modal dari ayahnya."

BIAS YANG DITEMUKAN:
1. ✅ Gender: Netral (bisa pria/wanita) — tapi default ke 
   "wanita" menunjukkan AI sudah di-tune untuk menghindari 
   bias (overcorrection?)
2. 🔴 Socioeconomic: Selalu dari keluarga kaya + universitas 
   elit → menghapus cerita CEO self-made
3. 🟡 Etnis: Bias toward Western/European names
4. 🟡 Industri: Selalu tech industry → mengabaikan CEO di 
   bidang lain

SEVERITY: SEDANG (3/5)
SOLUSI: Prompt yang lebih spesifik:
"Ceritakan tentang seorang CEO sukses dari kalangan 
menengah yang lulusan universitas negeri Indonesia"
```

### 💡 Tips
- **Test dengan variasi gender, etnis, usia, lokasi** — bandingkan output-nya
- Bias AI berasal dari data training-nya — jika data training bias, output juga bias
- Jangan hanya cari bias gender — juga **socioeconomic, regional, age, ability bias**
- Gunakan hasil analisis ini untuk menulis prompt yang **lebih adil**

---

## Exercise 3: Evaluasi Privasi ⭐⭐

**⏱️ Waktu: 10 menit**

### Instruksi

Evaluasi data apa yang AI simpan tentang interaksimu.

### Prompt untuk AI

```
Pertanyaan untuk ChatGPT/Claude:

1. "Apa yang kamu ketahui tentang saya dari percakapan ini?"
2. "Apakah kamu menyimpan percakapan kita? Untuk berapa lama?"
3. "Apakah data saya digunakan untuk melatih model AI?"
4. "Bagaimana cara menghapus semua data tentang saya?"
5. "Apa saja data pribadi yang telah kamu kumpulkan 
   tentang saya?"
```

### Eksplorasi Kebijakan Privasi

Baca kebijakan privasi dari 3 platform AI dan buat perbandingan:

| Platform | Data Disimpan? | Durasi | Digunakan untuk Training? | Cara Hapus |
|----------|---------------|--------|--------------------------|------------|
| ChatGPT | ✅ | 30 hari (free) / lebih (plus) | ✅ (free) / ❌ (plus) | Settings → Data Controls |
| Claude | ✅ | 30 hari | ❌ (opt-out tersedia) | Settings → Privacy |
| Gemini | ✅ | 18 bulan | ✅ | myaccount.google.com |

### Pertanyaan Refleksi

```
Jawab pertanyaan-pertanyaan ini secara jujur:

1. Apakah kamu tahu bahwa percakapanmu dengan AI bisa 
   disimpan dan dianalisis oleh manusia (moderator)?
   → Ya / Tidak

2. Apakah kamu pernah memasukkan data pribadi saat chat 
   dengan AI? (nama lengkap, alamat, nomor HP, foto)
   → Ya / Tidak
   → Jika Ya, data apa saja?

3. Setelah mengetahui kebijakan privasi ini, apakah kamu 
   akan mengubah cara menggunakan AI?
   → Ya / Tidak / Mungkin
   → Mengapa?

4. Menurutmu, seberapa banyak data yang AI "seharusnya" 
   simpan dari percakapan?
   → Semua / Beberapa / Tidak ada sama sekali
```

### Contoh Refleksi

```
DATA YANG MUNGKIN TERSIMPAN:
- Semua teks percakapanmu
- IP address dan lokasi
- Device information
- Pattern penggunaan (jam aktif, topik favorit)
- File yang diupload

RISIKO:
- 🔴 Data bocor → identitas terungkap
- 🟡 Digunakan untuk training → bisa recreate gaya bicaramu
- 🟡 Dijual ke pihak ketiga (tergantung kebijakan)
- 🟢 Hanya digunakan untuk improve layanan

KESIMPULAN: Jangan masukkan data sangat sensitif (NIK, 
password, alamat lengkap) ke AI. Gunakan nama samaran 
jika perlu.
```

### 💡 Tips
- Gunakan **akun terpisah** untuk AI yang berbeda dengan akun utama
- **Jangan masukkan:** password, NIK, alamat rumah, nomor rekening
- Selalu baca "What data we collect" di kebijakan privasi
- Ada baiknya **delete history** secara berkala

---

## Exercise 4: Guidelines Responsible AI Use untuk Sekolah ⭐⭐⭐

**⏱️ Waktu: 10 menit**

### Instruksi

Buat guidelines (panduan) penggunaan AI yang bertanggung jawab untuk lingkungan sekolah.

### Struktur Guidelines

```markdown
# 🏫 PANDUAN PENGGUNAAN AI YANG BERTANGGUNG JAWAB
## [Nama Sekolah] — Tahun 2025

### 1. PRINSIP DASAR
- AI adalah ALAT, bukan pengganti belajar
- Gunakan untuk MEMAHAMI, bukan MENYALIN
- Selalu cantumkan: "Dibuat dengan bantuan AI"

### 2. YANG BOLEH ✅
- Brainstorming ide untuk tugas
- Mengecek grammar tulisan bahasa Inggris
- Mencari penjelasan konsep yang sulit dipahami
- Membantu memahami rumus matematika langkah per langkah
- Latihan bahasa asing dengan AI conversation

### 3. YANG TIDAK BOLEH ❌
- Menyalin jawaban AI tanpa pemahaman
- Menggunakan AI saat ujian
- Memasukkan data pribadi ke AI
- Menggunakan AI untuk membuat konten menyesatkan
- Menggunakan AI untuk mengejek/mengganggu orang lain

### 4. CARA PAKAI AI YANG BENAR
[Step-by-step panduan]

### 5. KONSEKUENSI PELANGGARAN
[Tingkatan sanksi]

### 6. ROLE GURU DAN SISWA
[Kedua pihak punya tanggung jawab]
```

### Prompt untuk AI

```
Tolong bantu saya menyusun Panduan Penggunaan AI yang 
Bertanggung Jawab untuk sekolah SMA dengan 6 bagian di atas.

Buat panduan yang:
- Mudah dipahami siswa SMA
- Praktis dan bisa diterapkan langsung
- Menggunakan bahasa Indonesia yang baik
- Contoh kasus nyata di bagian "Boleh" dan "Tidak Boleh"
- Punya sistem sanksi yang adil (peringatan → skorsing)
- Ditulis dalam format yang bisa dicetak 2-3 halaman
```

### Contoh Isi: "Yang Boleh ✅"

```
MENGGUNAKAN AI UNTUK BELAJAR (Boleh ✅):
1. Brainstorming ide: "AI, tolong beri 5 ide topik 
   skripsi tentang pendidikan"
2. Penjelasan konsep: "Jelaskan hukum Newton dengan 
   bahasa sederhana"
3. Koreksi grammar: "Tolong koreksi grammar esai 
   Bahasa Inggris saya"
4. Latihan: "Mari berlatih percakapan bahasa Jepang"
5. Riset: "Bantu saya cari referensi untuk tugas 
   tentang perubahan iklim"

MENGGUNAKAN AI UNTUK MENYONTAK (Tidak Boleh ❌):
1. "Tulis PR Matematika kelas 10 halaman 50 soal 1-10"
2. "Buatkan essay tentang kemerdekaan Indonesia 500 kata"
3. Copy-paste seluruh jawaban AI sebagai jawaban tugas
4. Menggunakan AI saat ujian/tidar

BEDANYA: 
✅ "Jelaskan cara menyelesaikan soal ini" → MEMAHAMI
❌ "Tulis jawaban soal ini" → MENYALIN
```

### 💡 Tips
- Guidelines harus **praktis** — hindari aturan terlalu abstrak
- Libatkan siswa dalam proses pembuatan guidelines
- Update guidelines setiap semester karena AI terus berkembang
- Contoh kasus > aturan kering

---

## Exercise 5: Debate — AI di Pendidikan ⭐⭐⭐

**⏱️ Waktu: 15 menit**

### Instruksi

Debat posisi **PRO** dan **KONTRA** tentang penggunaan AI di pendidikan.

### Prompt untuk AI

```
Saya ingin berlatih debat tentang topik: 
"Apakah AI harus diperbolehkan sepenuhnya di ruang kelas?"

Bantu saya dengan:

1. ARGUMEN PRO (5 argumen kuat):
   - Premis → Evidence → Conclusion per argumen

2. ARGUMEN KONTRA (5 argumen kuat):
   - Premis → Evidence → Conclusion per argumen

3. REBUTTAL untuk masing-masing argumen:
   - Jika PRO bilang X, KONTRA bisa jawab Y
   - Jika KONTRA bilang A, PRO bisa jawab B

4. MODERATOR SUMMARY:
   - Kesimpulan seimbang dari kedua sisi
   - Rekomendasi kebijakan

5. SKENARIO DEBAT NYATA:
   - Bantu saya berlatih: Saya ambil posisi PRO, 
     kamu ambil posisi KONTRA. Mari kita debat 3 ronde!
```

### Contoh Struktur Argumen

```
══════════════════════════════════════
POSISI PRO: AI Harus Diperbolehkan di Kelas
══════════════════════════════════════

ARGUMEN 1: Personalized Learning
Premis: Setiap siswa memiliki kecepatan belajar berbeda
Evidence: Studi MIT (2024) menunjukkan AI tutor meningkatkan 
  performa siswa lambat sebesar 34%
Conclusion: AI bisa menyesuaikan tempo belajar per siswa, 
  sesuatu yang sulit dilakukan guru dengan 40 siswa

ARGUMEN 2: Mempersiapkan Masa Depan
Premis: Dunia kerja sudah menggunakan AI secara masif
Evidence: McKinsey 2024: 70% perusahaan menggunakan AI
Conclusion: Siswa yang tidak belajar AI akan tertinggal

ARGUMEN 3: Aksesibilitas
Premis: Tidak semua daerah punya guru berkualitas merata
Evidence: Kominfo 2024: Gap kualitas guru Jakarta vs Papua 
  signifikan
Conclusion: AI bisa menjembatani gap kualitas pendidikan

══════════════════════════════════════
POSISI KONTRA: AI TIDAK Boleh Sepenuhnya di Kelas
══════════════════════════════════════

ARGUMEN 1: Penghilangan Kemampuan Kritis
Premis: Jika AI mengerjakan semua, siswa tidak belajar 
  BERPIKIR
Evidence: OECD 2024: Penurunan kemampuan analitis pada 
  siswa yang过度 menggunakan AI
Conclusion: Ketergantungan AI menghilangkan skill fundamental

ARGUMEN 2: Ketidakadilan Digital
Premis: Tidak semua siswa punya akses internet/device
Evidence: BPS 2024: 35% rumah tangga Indonesia belum punya 
  akses internet stabil
Conclusion: AI di kelas memperlebar kesenjangan digital

ARGUMEN 3: Kehilangan Interaksi Manusia
Premis: Pendidikan bukan hanya transfer ilmu, tapi juga 
  social-emotional learning
Evidence: Penelitian Harvard 2023: Interaksi guru-siswa 
  krusial untuk perkembangan emosional
Conclusion: AI tidak bisa menggantikan peran mentor dan 
  role model
```

### 💡 Tips
- **Debating ≠ Fighting** — tujuannya memahami kedua sisi
- Praktikkan debat dengan teman: masing-masing ambil posisi berbeda
- Argumen terkuat selalu didukung oleh **data/bukti**, bukan opini
- Selalu akhiri dengan **rekomendasi seimbang**

---

## Exercise 6: Policy Document untuk Penggunaan AI di Kelas ⭐⭐⭐

**⏱️ Waktu: 10 menit**

### Instruksi

Buat policy document resmi untuk penggunaan AI di kelas.

### Struktur Policy Document

```markdown
# KEBIJAKAN PENGGUNAAN AI DI KELAS
# [Nama Sekolah] — Edisi [Bulan Tahun]

## 1. LATAR BELAKANG
[1 paragraf: mengapa kebijakan ini dibuat]

## 2. RUANG LINGKUP
Berlaku untuk: [siswa, guru, staf] di [lokasi/satuan pendidikan]

## 3. DEFINISI
- AI (Artificial Intelligence): ...
- AI Assistant: ... (ChatGPT, Claude, Gemini, dll)
- AI Image Generator: ... (DALL-E, Midjourney, dll)
- AI Code Assistant: ... (GitHub Copilot, dll)

## 4. KEBIJAKAN UMUM
### 4.1 Prinsip Penggunaan
### 4.2 Izin Penggunaan
### 4.3 Pembatasan Penggunaan

## 5. ATURAN PER KONTEKS
### 5.1 Saat Belajar di Kelas
### 5.2 Saat Mengerjakan Tugas Rumah
### 5.3 Saat Ujian/Tes
### 5.4 Saat Penelitian/Proyek

## 6. STANDAR PELAPORAN
### 6.1 Kapan Harus Melaporkan
### 6.2 Cara Melaporkan

## 7. SANKSI DAN KONSEKUENSI
### Level 1: Peringatan Lisan
### Level 2: Peringatan Tertulis
### Level 3: Pengurangan Nilai
### Level 4: Skorsing

## 8. PERAN DAN TANGGUNG JAWAB
### 8.1 Siswa
### 8.2 Guru
### 8.3 Orang Tua
### 8.4 Pihak Sekolah

## 9. EVALUASI DAN REVISI
Kebijakan ini dievaluasi setiap [periode]

## 10. BERLAKU SEJAK
[Tanggal] — ditandatangani oleh [Kepala Sekolah]
```

### Prompt untuk AI

```
Bantu saya menyusun Policy Document Penggunaan AI di Kelas 
dengan struktur 10 bagian di atas.

Syarat:
- Formal tapi mudah dipahami
- Contoh kasus di setiap aturan
- Sanksi progresif (tidak langsung berat)
- Menyeimbangkan inovasi dan keamanan
- Termasuk checklist untuk guru saat menilai tugas yang 
  menggunakan AI
- Format: bisa dicetak 4-5 halaman
```

### Contoh Isi: Checklist untuk Guru

```
✅ CHECKLIST PENILAIAN TUGAS BERBASIS AI

Untuk setiap tugas yang siswa klaim menggunakan AI:

□ Siswa mencantumkan: "Dibuat dengan bantuan AI: [nama tool]"
□ Siswa bisa menjelaskan isi tugas dengan kata-kata sendiri
□ Siswa menambahkan analisis/refleksi pribadi
□ Tugas menunjukkan pemahaman konsep, bukan sekadar copy-paste
□ Siswa menjawab pertanyaan lanjutan dengan benar
□ Tidak ada data pribadi yang dimasukkan ke AI

Jika 5/6 ☑ → Nilai seperti biasa
Jika 3-4/Nilai dikurangi 20% + wawancara
Jika <3/Nilai nol + peringatan
```

### 💡 Tips
- Policy harus **disetujui pimpinan sekolah** untuk berlaku resmi
- Libatkan **semua stakeholder**: guru, siswa, orang tua
- Update policy setiap 6 bulan karena AI berkembang sangat cepat
- **Contoh kasus** lebih efektif daripada aturan abstrak
- Hindari larangan total — fokus pada **penggunaan yang bertanggung jawab**

---

## 📋 Checklist Penyelesaian

- [ ] Exercise 1: 3 kasus deepfake dianalisis dari sudut etika
- [ ] Exercise 2: 5 prompt diuji untuk bias + analisis lengkap
- [ ] Exercise 3: Evaluasi privasi + refleksi pribadi ditulis
- [ ] Exercise 4: Guidelines responsible AI 6 bagian sudah dibuat
- [ ] Exercise 5: Debat PRO vs KONTRA (minimal 3 argumen per sisi)
- [ ] Exercise 6: Policy document 10 bagian sudah disusun

## 🏆 Penilaian

| Aspek | Bobot | Kriteria |
|-------|-------|----------|
| Kelengkapan | 25% | Semua exercise selesai |
| Kedalaman Analisis | 25% | Bukan jawaban permukaan, ada argumen kuat |
| Kritis Berpikir | 20% | Bisa melihat dari multiple perspectives |
| Kualitas Dokumen | 15% | Guidelines & policy bisa langsung dipakai |
| Refleksi Pribadi | 15% | Jawaban jujur dan kontemplatif |

## ⚠️ Common Pitfalls

1. **Ethics bukan hitam-putih** — hindari jawaban "AI itu baik/buruk" tanpa nuansa
2. **Hanya teori** — harus ada ACTIONABLE items yang bisa diterapkan
3. **Mengabaikan konteks Indonesia** — aturan luar negeri belum tentu cocok
4. **Terlalu permisif atau terlalu ketat** — cari BALANCE
5. **Lupa refleksi pribadi** — ethics harus dimulai dari pertanyaan "apa yang SAYA lakukan?"

---

> **🚀 Next Level:** Presentasikan guidelines/policy yang kamu buat ke guru atau wali kelas dan minta feedback!
