---
title: "Latihan Modul 4: Teknik Prompt Dasar"
exercise_type: practice
---

# ✍️ Latihan Modul 4: Teknik Prompting Dasar

> **Waktu estimasi:** 60-75 menit
> **Tools yang dibutuhkan:** ChatGPT/Claude/Gemini (gratis), buku catatan
> **Tipe:** Hands-on practice — teknik-teknik yang bisa langsung kamu pakai

---

## 📋 Petunjuk Umum

Di modul ini, kamu akan mempraktikkan **7 teknik prompting dasar** yang menjadi fondasi penggunaan AI yang efektif. Setiap teknik ada contoh, latihan, dan tips.

> 🎯 **Tujuan:** Setelah modul ini, kamu bisa memilih teknik prompting yang tepat untuk setiap situasi!

---

## 🏋️ Latihan 1: Zero-Shot Challenge

**⭐ Kesulitan:** Mudah | **⏱️ Waktu:** 8 menit

### Apa itu Zero-Shot?

Zero-shot = memberikan instruksi ke AI **TANPA contoh sama sekali**. AI harus langsung mengerti hanya dari instruksi.

### Instruksi

Kirim 5 prompt zero-shot berikut ke AI dan catat hasilnya:

| No | Prompt Zero-Shot | Tujuan |
|---|---|---|
| 1 | "Buat daftar 5 makanan khas Jawa Tengah dengan harga" | List makanan |
| 2 | "Terjemahkan 'good morning' ke 5 bahasa daerah Indonesia" | Terjemahan kreatif |
| 3 | "Buat bandingkan WordPress vs Blogspot dalam bentuk tabel" | Perbandingan |
| 4 | "Tulis email formal untuk meminta izin magang di perusahaan teknologi" | Penulisan formal |
| 5 | "Jelaskan photosynthesis dalam 3 kalimat untuk anak SD" | Penjelasan sederhana |

### Evaluasi

Untuk setiap hasil, beri skor 1-5:

| Prompt | Skor Kualitas (1-5) | Apakah AI mengerti tujuanmu? |
|---|---|---|
| 1. Makanan Jateng | /5 | Ya / Sebagian / Tidak |
| 2. Terjemahan bahasa daerah | /5 | Ya / Sebagian / Tidak |
| 3. WordPress vs Blogspot | /5 | Ya / Sebagian / Tidak |
| 4. Email magang | /5 | Ya / Sebagian / Tidak |
| 5. Photosynthesis | /5 | Ya / Sebagian / Tidak |

### 💡 Tips

- Zero-shot cocok untuk **tugas sederhana dan jelas**
- Jika hasilnya kurang bagus, coba tambah konteks (lanjut ke few-shot)

---

## 🏋️ Latihan 2: Few-Shot Challenge

**⭐⭐ Kesulitan:** Sedang | **⏱️ Waktu:** 10 menit

### Apa itu Few-Shot?

Few-shot = memberikan **beberapa contoh** sebelum memberikan tugas. AI belajar pola dari contohmu lalu menerapkannya.

### Instruksi

**Contoh 1 — Review Film:**

Kirim prompt ini ke AI:

```
Buat review film dalam format:
Judul: [judul]
Rating: [1-5 bintang]
Review: [1 kalimat review]
Rekomendasi: [Ya/Tidak + alasan]

Contoh:
Judul: Laskar Pelangi
Rating: ★★★★★
Review: Film menyentuh tentang perjuangan anak pedalaman meraih mimpi.
Rekomendasi: Ya, wajib ditonton karena menginspirasi dan membanggakan budaya Indonesia.

Judul: Dilan 1990
Rating: ★★★☆☆
Review: Romantis tapi terlalu klise untuk penonton dewasa.
Rekomendasi: Ya, untuk remaja yang suka cerita cinta ringan.

Judul: Gundala
Rating: ★★☆☆☆
Review: Visual bagus tapi cerita kurang kuat dan kurang mudah dipahami.
Rekomendasi: Tidak, kecuali kamu penggemar berat superhero lokal.

Sekarang buat review untuk film: "Ada Apa Dengan Cinta"
```

### Apa yang Terjadi?

AI akan:
1. ✅ Mengikuti format yang sama dengan contoh
2. ✅ Menyesuaikan gaya review dengan contoh yang kamu berikan
3. ✅ Menghasilkan review yang konsisten

### Latihan Few-Shot Sendiri

Pilih salah satu tantangan berikut dan buat **3 contoh + 1 tugas**:

**Tantangan A — Buat kode promo:**
```
Buat kode promo belanja online:
Kode: [kode unik]
Diskon: [persentase]
Syarat: [syarat penggunaan]

Contoh 1:
Kode: HEMAT50
Diskon: 50%
Syarat: Min. belanja Rp 200.000

Contoh 2:
Kode: GRATISONGKIR
Diskon: Gratis ongkir
Syarat: Khusus pulau Jawa

Contoh 3: [tulis contohmu sendiri]

Sekarang buat kode promo untuk: Diskon ulang tahun pelanggan
```

**Tantangan B — Buat caption Instagram:**
```
Buat caption Instagram untuk foto makanan:
Caption: [text] + [emoji]
Hashtag: #tag1 #tag2 #tag3

Contoh 1:
Caption: Nasi goreng spesial yang bikin nagih! 🔥🍕
Hashtag: #NasiGoreng #MakananIndonesia #Foodie

Contoh 2: [tulis contohmu]
Contoh 3: [tulis contohmu]

Sekarang buat caption untuk: foto Es Campur di hari panas
```

### Refleksi

```
Zero-shot vs Few-shot:
- Kapan zero-shot sudah cukup? ________________________________
- Kapan few-shot lebih baik? ________________________________
- Berapa contoh yang ideal? (2? 3? 5?) ______________________
```

---

## 🏋️ Latihan 3: Role-Playing Prompt

**⭐⭐ Kesulitan:** Sedang | **⏱️ Waktu:** 10 menit

### Apa itu Role-Playing?

Kamu memberi AI **peran/profesi** sehingga AI menjawab dari sudut pandang ahli di bidang tersebut.

### Instruksi

Kirim 5 prompt role-playing berikut, **topik yang sama** tapi **peran berbeda**:

**Topik: "Bagaimana cara belajar coding yang efektif?"**

| No | Role/Profesi | Prompt |
|---|---|---|
| 1 | Guru SD | "Kamu adalah guru SD yang mengajar komputer. Jelaskan cara belajar coding kepada anak-anak SD." |
| 2 | Programmer Senior | "Kamu adalah programmer senior dengan 15 tahun pengalaman. Berikan tips belajar coding untuk pemula." |
| 3 | Psikolog | "Kamu adalah psikolog yang spesialis motivasi belajar. Bagaimana cara memotivasi diri belajar coding?" |
| 4 | CEO Startup | "Kamu adalah CEO startup tech. Skill coding apa yang paling dicari di pasar kerja 2026?" |
| 5 | AI Researcher | "Kamu adalah researcher AI di Google. Bagaimana AI akan mengubah cara kita belajar coding?" |

### Tabel Perbandingan

| Peran | Gaya Bahasa | Fokus Jawaban | Kekuatan | Kelemahan |
|---|---|---|---|---|
| Guru SD | | | | |
| Programmer Senior | | | | |
| Psikolog | | | | |
| CEO Startup | | | | |
| AI Researcher | | | | |

### Tantangan Tambahan

Coba role-playing dengan **profesi yang lebih spesifik**:

```
Kamu adalah chef profesional di restoran bintang 5 di Jakarta. 
Saya adalah mahasiswa yang ingin masak makanan sederhana dengan 
budget Rp 30.000. Berikan rekomendasi menu + langkah-langkahnya.
```

### 💡 Kapan Pakai Role-Playing?

- Saat butuh **perspektif spesifik** dari suatu bidang
- Saat ingin jawaban yang **lebih terarah** dan **expert-level**
- Saat ingin **brainstorming** dari sudut pandang yang berbeda

---

## 🏋️ Latihan 4: Chain of Thought (CoT)

**⭐⭐⭐ Kesulitan:** Sulit | **⏱️ Waktu:** 10 menit

### Apa itu Chain of Thought?

CoT = meminta AI **menunjukkan proses berpikir langkah demi langkah** sebelum memberikan jawaban akhir. Sangat berguna untuk masalah logika, matematika, dan analisis.

### Instruksi

Kirim 5 masalah berikut dengan instruksi CoT:

```
Pentunjuk: Selesaikan langkah demi langkah. 
Tunjukkan proses berpikirmu sebelum memberikan jawaban akhir.
```

**Masalah 1 — Logika:**
> Seorang petani punya 17 domba. Semuanya mati kecuali 9. Berapa domba yang tersisa?
> (Pikirkan langkah demi langkah sebelum menjawab)

**Masalah 2 — Matematika:**
> Sebuah toko memberikan diskon 20% untuk jaket seharga Rp 450.000. Jika kamu juga punya kupon potongan Rp 50.000, berapa yang harus dibayar?
> (Tunjukkan langkah perhitungannya)

**Masalah 3 — Logika Berpikir:**
> Jika semua A adalah B, dan semua B adalah C, apakah semua A adalah C? Jelaskan langkah demi langkah.

**Masalah 4 — Analisis:**
> Sebuah restoran buka dari jam 10 pagi sampai 10 malam. Rata-rata 40 pelanggan/jam di jam ramai (siang-malam) dan 15 pelanggan/jam di jam sepi (pagi). Berapa total pelanggan per hari?
> (Tunjukkan perhitungan langkah demi langkah)

**Masalah 5 — Real-World:**
> Kamu punya uang Rp 500.000 untuk belanja bulanan. Kamu perlu beli: beras (Rp 65.000), mi instan 10 pack (Rp 50.000), sayur (Rp 30.000), telur 1 kg (Rp 28.000), gas (Rp 20.000). Sisa uang bisa untuk apa?
> (Hitung sisa dan sarankan alokasi)

### Contoh Output CoT yang Benar

```
Masalah 1: 17 domba, semua mati kecuali 9

Langkah 1: Total domba = 17
Langkah 2: Domba yang tersisa = 9 (diberikan langsung di soal)
Langkah 3: Jadi jawabannya = 9 domba tersisa

⚠️ Perhatikan: soal ini "trick question" — banyak orang salah 
mengurangi 17 - 9 = 8, padahal jawabannya sudah disebut: 9.
```

### Evaluasi

Untuk setiap masalah, catat:
1. Apakah AI menunjukkan langkah-langkahnya? (Ya/Tidak)
2. Apakah jawaban akhirnya benar?
3. Apakah langkah-langkahnya logis?

---

## 🏋️ Latihan 5: Constraint Challenge

**⭐⭐⭐ Kesulitan:** Sulit | **⏱️ Waktu:** 10 menit

### Apa itu Constraint Challenge?

Kamu memberikan **beberapa batasan sekaligus** yang harus dipenuhi AI dalam satu prompt. Ini melatih kemampuanmu membuat prompt yang presisi.

### Instruksi

Buat artikel dengan **5 batasan ini sekaligus:**

```
Buat artikel tentang "Tips Belajar Efektif untuk Mahasiswa" dengan 
batasan berikut:
1. Panjang: tepat 3 paragraf (tidak lebih, tidak kurang)
2. Gaya bahasa: santai tapi informatif
3. Harus menyebutkan minimal 3 metode belajar yang sudah terbukti ilmiah
4. Setiap paragraf harus diakhiri dengan pertanyaan retoris
5. Tidak boleh menggunakan kata "sebenarnya", "memang", atau "tentunya"
```

### Checklist Constraint

Setelah AI memberikan jawaban, cek:

- [ ] tepat 3 paragraf?
- [ ] gaya santai tapi informatif?
- [ ] minimal 3 metode belajar disebut?
- [ ] setiap paragraf diakhiri pertanyaan retoris?
- [ ] tidak ada kata "sebenarnya/memang/tentunya"?

### Tantangan Constraint Lanjutan

Coba constraint yang lebih sulit:

```
Buat deskripsi produk untuk air mineral kemasan dengan:
1. Maksimal 50 kata
2. Menggunakan metafora alam
3. Menyebutkan 2 keunggulan produk
4. Diakhiri dengan call-to-action
5. Nada: elegan dan premium
6. Tidak boleh menggunakan kata "segar" atau "murni"
```

### Refleksi

```
Berapa banyak constraint yang bisa AI handle sekaligus? _____
Constraint mana yang paling sering "lupa" oleh AI? _______________
Tips: ___________________________________________________________
```

---

## 🏋️ Latihan 6: CRISPE Framework

**⭐⭐⭐ Kesulitan:** Sulit | **⏱️ Waktu:** 10 menit

### Apa itu CRISPE Framework?

CRISPE = **C**apacity/Role, **R**equest, **I**nsight, **S**tatement, **P**ersonality, **E**xperiment — framework untuk membuat prompt yang lengkap dan terstruktur.

### Struktur CRISPE

| Komponen | Fungsi | Contoh |
|---|---|---|
| **C** — Capacity/Role | Peran AI | "Kamu adalah konsultan karir" |
| **R** — Request | Apa yang diminta | "Buatkan daftar 5 career path untuk lulusan TI" |
| **I** — Insight | Konteks tambahan | "Target: mahasiswa semester akhir di Indonesia" |
| **S** — Statement | Format output | "Dalam format tabel dengan kolom: nama, gaji, prospek" |
| **P** — Personality | Gaya/tone | "Gunakan bahasa Indonesia formal dan motivatif" |
| **E** — Experiment | Variasi/alternatif | "Buat 2 versi: untuk yang suka coding dan yang tidak" |

### Latihan: Buat 3 Prompt CRISPE

**Prompt CRISPE 1 — Topik: Kuliah**

```
[C] Kamu adalah konselor pendidikan universitas ternama di Indonesia.
[R] Berikan rekomendasi 5 jurusan kuliah yang prospek kerjanya 
    tinggi di tahun 2026.
[I] Target: siswa SMA kelas 12 yang belum tahu mau kuliah apa, 
    minat umum, berasal dari keluarga menengah.
[S] Format: tabel dengan kolom: Nama Jurusan, Deskripsi Singkat, 
    Prospek Kerja, Kisaran Gaji, Universitas Rekomendasi.
[P] Gaya: semangat, motivatif, gunakan bahasa Indonesia yang 
    mudah dipahami remaja.
[E] Buat juga versi singkat (bullet points) untuk yang males baca 
    banyak.
```

**Prompt CRISPE 2 — Topik: Resep Masakan**

```
[C] Kamu adalah chef profesional Indonesia yang spesialis masakan 
    rumahan.
[R] Buatkan resep "Ayam Goreng Lengkuas" lengkap untuk 4 porsi.
[I] Target: mahasiswa kos yang punya kompor 1 tungku, wajan, 
    dan budget belanja Rp 40.000.
[S] Format: daftar bahan (dengan harga estimasi), langkah-langkah 
    bernomor, tips agar ayam tetap renyah.
[P] Gaya: santai, pakai bahasa gaul ringan, ada emoji.
[E] Buat juga versi "express" 30 menit untuk yang buru-buru.
```

**Prompt CRISPE 3 — Topik: Belajar Bahasa Inggris**

```
[C] Kamu adalah tutor bahasa Inggris yang sabar dan kreatif.
[R] Buatkan latihan kosakata tema "Di Restoran" untuk level 
    pemula (A1).
[I] Target: pekerja Indonesia yang baru mau mulai belajar bahasa 
    Inggris, usia 20-30 tahun, belum bisa grammar sama sekali.
[S] Format: 10 kosakata dalam tabel (kata, arti, contoh kalimat), 
    lalu 5 soal latihan pilihan ganda.
[P] Gaya: supportive, jangan menakut-nakuti, rayakan setiap 
    kemajuan kecil.
[E] Tambahkan juga panduan cara melafalkan setiap kata dalam 
    bahasa Indonesia.
```

### Evaluasi

Kirim 3 prompt CRISPE ke AI, lalu bandingkan:
1. Apakah semua komponen CRISPE dijawab oleh AI?
2. Apakah prompt CRISPE menghasilkan jawaban yang lebih baik dari prompt biasa?

---

## 🏋️ Latihan 7: Rewrite Prompt

**⭐⭐ Kesulitan:** Sedang | **⏱️ Waktu:** 10 menit

### Instruksi

Kamu diberikan **3 prompt jelek**. Tugas: **rewrite** (tulis ulang) menjadi prompt yang bagus, lalu kirim ke AI untuk membuktikan hasilnya lebih baik.

### Prompt Jelek #1

```
tulis soal
```

**Versi yang lebih baik:**
```
Buatkan 5 soal pilihan ganda tentang [topik] untuk siswa 
kelas [X]. Setiap soal harus punya 4 opsi jawaban (A-D) 
dengan 1 jawaban benar dan kunci jawaban di akhir.
```

### Prompt Jelek #2

```
fix kode ini [tempel kode tanpa penjelasan]
```

**Versi yang lebih baik:**
```
Kode Python saya menghasilkan error [nama error] di baris [X].
Ini kodenya: [tempel kode]
Tolong:
1. Identifikasi penyebab error
2. Jelaskan kenapa error terjadi
3. Berikan kode yang sudah diperbaiki
4. Tips agar error seperti ini tidak terulang
```

### Prompt Jelek #3

```
buat surat yang bagus
```

**Versi yang lebih baik:**
```
Buatkan surat lamaran kerja formal untuk posisi [nama posisi] 
di [nama perusahaan]. Gunakan format surat dinas Indonesia:
- Kepada: [nama direktur/HRD]
- Lampiran: CV dan Ijazah
- Isi: kenapa saya cocok untuk posisi ini
- Panjang: maksimal 1 halaman
Gunakan bahasa Indonesia formal dan profesional.
```

### Latihan Sendiri

Buat **3 prompt jelek** versimu sendiri, lalu rewrite:

| Prompt Jelek | Prompt yang Diperbaiki | Perubahan Utama |
|---|---|---|
| | | |
| | | |
| | | |

### Tips Rewrite Prompt

| Elemen yang Sering Hilang | Solusi |
|---|---|
| Tidak ada konteks | Tambah: "untuk siapa", "dalam konteks apa" |
| Tidak ada format | Tambah: "dalam format tabel/bullet points/paragraf" |
| Tidak ada batasan | Tambah: "maksimal X kata", "bahasa X" |
| Tidak ada tujuan | Tambah: "tujuannya untuk..." |

---

## 🎯 Ringkasan & Lanjutan

### Teknik Prompting yang Sudah Dipelajari

| Teknik | Kapan Digunakan | Contoh Kasus |
|---|---|---|
| **Zero-shot** | Tugas sederhana, jelas | "Terjemahkan kalimat ini" |
| **Few-shot** | Perlu pola/format spesifik | Review film, caption IG |
| **Role-playing** | Butuh perspektif ahli | Konsultasi karir, tips |
| **Chain of Thought** | Masalah logika/matematika | Hitung budget, analisis |
| **Constraint** | Butuh output presisi | Artikel, deskripsi produk |
| **CRISPE** | Prompt kompleks & lengkap | Rencana, strategi, rekomendasi |
| **Rewrite** | Perbaiki prompt yang jelek | Upgrade prompt lama |

### Tantangan Akhir

Buat **1 prompt lengkap** yang menggabungkan **minimal 4 teknik** dari atas, kirim ke AI, dan buktikan hasilnya luar biasa!

### 📝 Catatan Penting

> Prompting adalah **keterampilan**, bukan bakat. Semakin sering berlatih,
> semakin mahir kamu. Simpan prompt-prompt terbaikmu sebagai "template"
> yang bisa digunakan berulang kali!
