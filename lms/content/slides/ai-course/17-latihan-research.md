---
title: "Latihan Modul 17: Research dengan AI"
exercise_type: practice
---

# 🔬 Latihan Modul 17: Research dengan AI

**Durasi Total:** 60–80 menit
**Tools yang Dibutuhkan:** ChatGPT/Claude, Google Scholar, ChatPDF, Perplexity

---

## 🎯 Tujuan Latihan

Setelah menyelesaikan latihan ini, kamu akan mampu:
- Melakukan verifikasi fakta dengan bantuan AI
- Menulis literature review sederhana
- Melakukan analisis kompetitif dan riset pasar
- Menulis research proposal yang terstruktur
- Mengidentifikasi bias dalam konten berita

---

## Exercise 1: Faktual Check ⭐⭐

**⏱️ Waktu: 15 menit**

### Instruksi

Verifikasi 10 klaim berikut. Untuk setiap klaim, cari tahu: **Benar, Salah, atau Butuh Konteks?**

### Klaim yang Harus Diverifikasi

```
1. "Indonesia adalah negara kepulauan terbesar di dunia"

2. "Google didirikan pada tahun 1998"

3. "Manusia hanya menggunakan 10% otak mereka"

4. "Vitamin C bisa menyembuhkan pilek"

5. "Bumi berputar 360 derajat dalam 24 jam"

6. "Tesla menciptakan listrik"

7. "Lebah madu bisa terbang dengan kecepatan 30 km/jam"

8. "Air mineral dalam kemasan lebih sehat dari air keran"

9. "80% informasi yang diterima otak berasal dari penglihatan"

10. "Indonesia memiliki lebih dari 17.000 pulau"
```

### Prompt untuk AI

```
Tolong verifikasi 10 klaim berikut. Untuk setiap klaim:
1. Status: Benar / Salah / Butuh Konteks / Sebagian Benar
2. Penjelasan singkat (2-3 kalimat)
3. Sumber/referensi yang bisa diakses
4. Fakta yang lebih akurat (jika klaim salah)

Klaim:
1. [klaim]
2. [klaim]
...
```

### Contoh Output yang Diharapkan

```
Klaim 1: "Indonesia adalah negara kepulauan terbesar di dunia"
Status: SEBAGIAN BENAR
Penjelasan: Indonesia memiliki jumlah pulau terbanyak (>17.000), 
tetapi istilah "negara kepulauan terbesar" bisa merujuk pada 
luas wilayah laut atau jumlah pulau. Swedia sering disebut 
sebagai negara kepulauan terbesar berdasarkan luas total.
Sumber: CIA World Factbook

Klaim 4: "Vitamin C bisa menyembuhkan pilek"
Status: SALAH
Penjelasan: Penelitian menunjukkan vitamin C tidak menyembuhkan 
pilek, tetapi DAPAT mengurangi durasi pilek sekitar 8% pada 
orang dewasa. Efeknya lebih signifikan pada orang yang stres 
fisik. Thomas Edison memopulerkan mitos ini tahun 1970-an.
Sumber: Cochrane Review (Hemilä & Chalker, 2013)
```

### 💡 Tips
- **Jangan hanya terima jawaban AI** — cari sumber sekunder untuk konfirmasi
- Perhatikan perbedaan "fakta" vs "opini populer"
- Klaim yang paling berbahaya adalah yang **hampir benar** (sebagian benar)

---

## Exercise 2: Literature Review ⭐⭐⭐

**⏱️ Waktu: 15 menit**

### Instruksi

Tulis literature review singkat tentang 3 topik berikut (masing-masing 1 paragraf).

### Topik yang Harus Dijelajahi

| No | Topik | Sumber Minimal |
|----|-------|----------------|
| 1 | Dampak AI terhadap lapangan kerja | 3 sumber |
| 2 | Efektivitas belajar online vs offline | 3 sumber |
| 3 | Perubahan iklim di Indonesia | 3 sumber |

### Prompt untuk AI

```
Tolong bantu saya menulis literature review tentang 
"[topik]" dengan ketentuan:

1. Temukan 3-5 sumber relevan (jurnal, artikel, atau laporan)
2. Untuk setiap sumber: judul, penulis, tahun, poin utama
3. Buat sintesis dalam 1 paragraf (150-200 kata) yang 
   menghubungkan temuan dari semua sumber
4. Identifikasi GAP atau topik yang belum banyak diteliti
5. Gunakan format sitasi sederhana: (Penulis, Tahun)

Sumber harus dari 5 tahun terakhir (2020-2025).
```

### Contoh Format Literature Review

```
TOPIK: Dampak AI terhadap Lapangan Kerja

Sumber yang Ditemukan:
1. Frey & Osborne (2023) - "The Future of Employment Revisited" 
   - 47% pekerjaan berisiko otomatisasi dalam 20 tahun
   
2. McKinsey Global Institute (2023) - "The State of AI" 
   - AI akan创造 97 juta pekerjaan baru namun menghapus 85 juta 
   
3. World Economic Forum (2024) - "Future of Jobs Report" 
   - Skill yang paling dibutuhkan: critical thinking, creativity

SINTESIS:
Berbagai penelitian menunjukkan bahwa AI tidak sekadar 
menggantikan pekerjaan, tetapi mentransformasi sifat pekerjaan 
(Frey & Osborne, 2023). McKinsey (2023) memperkirakan adanya 
net gain 12 juta pekerjaan, sementara WEF (2024) menekankan 
pentingnya skill adaptif. Gap yang teridentifikasi: dampak AI 
di negara berkembang masih kurang diteliti.

GAP: Perlu penelitian tentang adaptasi workforce Indonesia 
dalam menghadapi otomatisasi AI.
```

### 💡 Tips
- Gunakan [Google Scholar](https://scholar.google.com) untuk cari sumber asli
- Jangan hanya deskripsi satu per satu — **sintesis** artinya menghubungkan ide-ide
- Perhatikan tahun publikasi — prioritaskan yang terbaru

---

## Exercise 3: Competitive Analysis ⭐⭐

**⏱️ Waktu: 10 menit**

### Instruksi

Bandingkan 2 produk/aplikasi sejenis dengan framework analisis sederhana.

### Pilihan Topik

| No | Pasangan Produk | Aspek Analisis |
|----|----------------|----------------|
| 1 | Gojek vs Grab | Fitur, harga, UX |
| 2 | ChatGPT vs Claude | Kemampuan, pricing, fitur |
| 3 | Canva vs Figma | Target user, fitur, pricing |
| 4 | Spotify vs Apple Music | Konten, harga, fitur |

### Prompt untuk AI

```
Buat competitive analysis antara [Produk A] vs [Produk B] 
dengan framework berikut:

1. OVERVIEW: Deskripsi singkat masing-masing produk
2. TARGET USER: Siapa pengguna utamanya?
3. KEY FEATURES: 5 fitur utama masing-masing (tabel perbandingan)
4. PRICING: Model pricing dan perbandingan
5. STRENGTHS: Keunggulan masing-masing (3 poin)
6. WEAKNESSES: Kelemahan masing-masing (3 poin)
7. SWOT: Mini SWOT untuk masing-masing
8. RECOMMENDATION: Rekomendasi untuk user tertentu

Format sebagai tabel perbandingan yang mudah dibaca.
```

### Contoh Output (Tabel Perbandingan)

```
| Aspek | ChatGPT | Claude |
|-------|---------|--------|
| Developer | OpenAI | Anthropic |
| Model terbaru | GPT-4o | Claude 4 |
| Context window | 128K token | 200K token |
| Creative writing | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Coding | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Analysis | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Bahasa Indonesia | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Free tier | ✅ Terbatas | ✅ Terbatas |
| Pro pricing | $20/bulan | $20/bulan |
```

### 💡 Tips
- Pilih produk yang kamu gunakan sehari-hari agar analisisnya bermakna
- Jangan hanya rating — beri **alasan** untuk setiap rating
- Buat rekomendasi spesifik: "Pilih X jika kamu butuh Y"

---

## Exercise 4: Market Research ⭐⭐⭐

**⏱️ Waktu: 10 menit**

### Instruksi

Lakukan riset target pasar untuk produk/aplikasi buatan sendiri (bisa ide sederhana).

### Prompt untuk AI

```
Saya ingin membuat [deskripsi produk/aplikasi sederhana]. 
Tolong bantu saya melakukan market research:

1. TARGET MARKET: Siapa target user-nya? (demografi, 
   psikografi, perilaku)
2. MARKET SIZE: Estimasi pasar (seberapa besar demand-nya?)
3. COMPETITOR: Siapa yang sudah menyediakan layanan serupa?
4. USP: Apa yang bisa membuat produk saya BERBEDA?
5. PAIN POINT: Masalah apa yang saya selesaikan?
6. SWOT ANALYSIS: Analisis singkat
7. RECOMMENDASI: 3 langkah awal yang harus saya ambil

Contoh produk: Aplikasi belajar Bahasa Jepang untuk 
pelajar SMA Indonesia dengan metode gamifikasi.
```

### Contoh Output yang Diharapkan

```
TARGET MARKET:
- Usia: 15-18 tahun (SMA)
- Lokasi: Indonesia (kota besar & menengah)
- Motivasi: Persiapan kuliah di Jepang, anime culture, 
  pekerjaan di perusahaan Jepang
- Perilaku: Aktif di media sosial, suka game, belajar 
  melalui aplikasi mobile

MARKET SIZE:
- +5 juta pelajar SMA di Indonesia
- ~200.000 tertarik belajar Bahasa Jepang
- Market potensial: Rp 50-100 miliar/tahun

COMPETITOR:
1. Duolingo (general, bahasa Jepang dasar)
2. WaniKani (Kanji fokus)
3. LingoDeer (lebih ke grammar)

USP POTENSIAL:
- Konten tersusun sesuai kurikulum SMA Indonesia
- Gamifikasi dengan anime references
- Komunitas sesama pelajar Indonesia
```

### 💡 Tips
- Mulai dari masalah yang kamu sendiri alami
- Riset bukan hanya data angka — juga **validasi** langsung ke calon user
- Jangan sempurna: yang penting ada **starting point** yang jelas

---

## Exercise 5: Buat Research Proposal ⭐⭐⭐

**⏱️ Waktu: 10 menit**

### Instruksi

Buat research proposal sederhana (1-2 halaman) dengan bantuan AI.

### Struktur Research Proposal

```markdown
# Research Proposal

## 1. Judul
[Judul yang spesifik dan deskriptif]

## 2. Latar Belakang (2-3 paragraf)
- Apa masalah yang ingin diteliti?
- Mengapa topik ini penting?

## 3. Rumusan Masalah
- Apa pertanyaan penelitian utama?

## 4. Tujuan Penelitian
- Apa yang ingin dicapai?

## 5. Tinjauan Pustaka Singkat
- 3 sumber utama yang relevan

## 6. Metodologi
- Metode apa yang digunakan?
- Siapa subjek penelitian?

## 7. Jadwal Penelitian
- Timeline sederhana

## 8. Daftar Pustaka
- Minimal 3 referensi
```

### Prompt untuk AI

```
Bantu saya membuat research proposal sederhana dengan judul:
"[Judul pilihan]"

Isi proposal harus:
- 1-2 halaman saja (tidak panjang)
- Menggunakan bahasa Indonesia yang baik
- Memiliki metodologi yang REALISTIS untuk pelajar SMA
- Termasuk timeline 4-8 minggu

Tolong isi semua bagian dan beri saran perbaikan.
```

### 💡 Tips
- Topik harus spesifik: "Dampak screen time terhadap kualitas tidur siswa SMA di Jakarta" (bukan "Dampak gadget terhadap anak")
- Metodologi harus **bisa dilakukan** — jangan minta data dari 10.000 responden
- Proposal yang baik menjawab: APA, MENGAPA, BAGAIMANA

---

## Exercise 6: Analisis Berita ⭐⭐

**⏱️ Waktu: 10 menit**

### Instruksi

Pilih 1 artikel berita dan identifikasi potensi bias di dalamnya.

### Prompt untuk AI

```
Berikut adalah artikel berita berjudul "[judul artikel]". 
Tolong analisis menggunakan framework berikut:

1. HEADLINE ANALYSIS: Apakah headline netral atau loaded?
2. SOURCE: Siapa penulisnya? Apakah ada conflict of interest?
3. WORD CHOICE: Kata-kata yang mengandung emosi/bias
4. FRAMING: Apa yang DITAMPILKAN vs yang DITINGGALKAN?
5. QUOTES: Siapa yang diwawancarai? Apakah seimbang?
6. DATA: Apakah data yang digunakan lengkap dan konteksnya?
7. OVERALL BIAS RATING: Netral / Sedikit Bias / Sangat Bias
8. ALTERNATIVE PERSPECTIVE: Bagaimana versi lain ceritanya?

Artikel:
[paste artikel di sini]
```

### Contoh Analisis

```
ARTIKEL: "Ponsel Pintar Membuat Anak Semakin Bodoh, Kata Pakar"

HEADLINE ANALYSIS: 
🔴 SANGAT BIASED — menggunakan kata "bodoh" yang emosional
   Headline yang lebih netral: "Penggunaan Ponsel Berlebihan 
   Dikaitkan dengan Penurunan Fokus Anak"

WORD CHOICE:
- "membuat... bodoh" → framing negatif absolut
- "kata pakar" → siapa pakarnya? tidak disebutkan nama
- Seharusnya: "berpotensi mempengaruhi"

FRAMING:
- Yang ditampilkan: dampak negatif
- Yang ditinggalkan: manfaat pendidikan dari ponsel

OVERALL: Sangat Bias (2/5 Netral)
```

### 💡 Tips
- Pilih artikel dari sumber yang **berbeda-beda** — bandingkan cara mereka menulis topik sama
- Bias bukan selalu "salah" — tapi penting untuk **mengenalinya**
- Praktikkan: baca 3 berita tentang topik yang sama dari 3 media berbeda

---

## 📋 Checklist Penyelesaian

- [ ] Exercise 1: 10 klaim diverifikasi + sumber disertakan
- [ ] Exercise 2: 3 literature review ditulis (masing-masing 1 paragraf)
- [ ] Exercise 3: Competitive analysis 2 produk selesai
- [ ] Exercise 4: Market research untuk produk/ide sudah dibuat
- [ ] Exercise 5: Research proposal lengkap 1-2 halaman
- [ ] Exercise 6: Analisis bias 1 artikel berita

## 🏆 Penilaian

| Aspek | Bobot | Kriteria |
|-------|-------|----------|
| Kelengkapan | 30% | Semua exercise selesai |
| Kualitas Sumber | 25% | Sumber kredibel dan relevan |
| Kritis Analisis | 20% | Tidak sekadar terima mentah dari AI |
| Kedalaman | 15% | Analisis lebih dari sekadar permukaan |
| Kreativitas | 10% | Topik pilihan yang menarik |

## ⚠️ Common Pitfalls

1. **AI hallucinasi** — Selalu verifikasi fakta dari AI ke sumber asli
2. **Plagiarisme** — Tulis ulang ide dengan kata-kata sendiri, sertakan sitasi
3. **Sumber tidak kredibel** — Hindari blog pribadi; prioritaskan jurnal, media nasional
4. **Literature review = daftar sumber** — Harus ada **sintesis** (penghubung ide)
5. **Bias tidak disadari** — Bahkan AI pun punya bias — cross-check dengan multiple AI

---

> **🚀 Next Level:** Buat research report lengkap 5 halaman tentang topik yang kamu minati dan presentasikan di depan teman!
