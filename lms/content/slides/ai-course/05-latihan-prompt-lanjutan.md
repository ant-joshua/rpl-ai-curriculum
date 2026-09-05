---
title: "Latihan Modul 5: Teknik Prompt Lanjutan"
exercise_type: practice
---

# 🧩 Latihan Modul 5: Teknik Prompting Lanjutan

> **Waktu estimasi:** 60-80 menit
> **Tools yang dibutuhkan:** ChatGPT/Claude/Gemini (gratis), browser
> **Tipe:** Advanced hands-on — untuk yang sudah menguasai dasar

---

## 📋 Petunjuk Umum

Modul ini membahas **teknik prompting lanjutan** yang digunakan oleh profesional dan researcher. Setiap teknik memiliki use case spesifik.

> ⚡ **Prasyarat:** Sebaiknya sudah menyelesaikan Latihan Modul 4 (Teknik Dasar) terlebih dahulu.

---

## 🏋️ Latihan 1: Tree of Thought (ToT)

**⭐⭐⭐ Kesulitan:** Sulit | **⏱️ Waktu:** 12 menit

### Apa itu Tree of Thought?

Tree of Thought = meminta AI **mengeksplorasi beberapa jalur pemecahan masalah** secara paralel, lalu mengevaluasi setiap jalur sebelum memilih yang terbaik.

### Instruksi

Kirim prompt berikut ke ChatGPT/Claude:

```
Saya ingin membuka usaha kopi kecil-kecilan di Bandung dengan 
modal Rp 10 juta. 

Gunakan metode Tree of Thought untuk menganalisis 3 jalur 
strategi berbeda:

JALUR A: [AI akan mengisi — misal: gerobak di pinggir jalan]
- Kelebihan:
- Kekurangan:
- Modal yang dibutuhkan:
- Estimasi profit/bulan:
- Skor (1-10):

JALUR B: [AI akan mengisi — misal: jualan online via GoFood]
- [format sama]

JALUR C: [AI akan mengisi — misal: sewa tempat kecil]
- [format sama]

EVALUASI AKHIR:
Bandingkan ketiga jalur dan berikan rekomendasi dengan alasan.
```

### Yang Harus Terjadi

AI akan:
1. ✅ Menampilkan 3 jalur strategi berbeda
2. ✅ Analisis masing-masing jalur secara terpisah
3. ✅ Memberikan skor dan rekomendasi akhir

### Tantangan ToT Lanjutan

Coba topik lain dengan Tree of Thought:

```
Gunakan Tree of Thought untuk menganalisis:
"Bagusnya saya kuliah S1 dulu, langsung kerja, atau ikut 
program skill accelerator?"

Jalur A: Kuliah S1 (4 tahun)
Jalur B: Langsung kerja + belajar otodidak
Jalur C: Program skill accelerator (6 bulan) + kerja

Analisis masing-masing dari sisi: biaya, waktu, prospek kerja, 
pengalaman, dan kepuasan pribadi.
```

### Refleksi

```
Apakah Tree of Thought menghasilkan analisis yang lebih 
berkualitas dibanding prompt biasa? Ya/Tidak

Kenapa? ________________________________________________
```

---

## 🏋️ Latihan 2: ReAct Pattern

**⭐⭐⭐ Kesulitan:** Sulit | **⏱️ Waktu:** 12 menit

### Apa itu ReAct Pattern?

ReAct = **Re**asoning + **Act**ing — meminta AI **berpikir dulu** (reasoning), lalu **menyusun action plan** (tindakan nyata), berulang sampai selesai.

### Instruksi

Kirim prompt berikut:

```
Saya punya tugas: membuat video presentasi 5 menit tentang 
"Manfaat AI untuk UMKM Indonesia" untuk kelas kuliah.

Gunakan pola ReAct untuk menyusun rencana:

REASONING (Pemikiran):
- Apa yang perlu saya siapkan?
- Tools apa yang tersedia?
- Berapa lama waktu yang dibutuhkan?
- Tantangan potensial apa?

ACTION PLAN (Rencana Tindakan):
Step 1: [aksi spesifik] → Deadline: [kapan] → Tools: [apa]
Step 2: [aksi spesifik] → Deadline: [kapan] → Tools: [apa]
Step 3: [aksi spesifik] → Deadline: [kapan] → Tools: [apa]
...

REFLECTION (Refleksi):
- Apa yang mungkin salah?
- Bagaimana jika deadline mepet?
- Backup plan apa yang bisa saya siapkan?
```

### Tantangan ReAct Sendiri

Coba dengan topik ini:

```
Gunakan pola ReAct untuk merencanakan:
"Membuat website portfolio pribadi dalam 3 hari"

REASONING:
- Saya pemula, belum bisa coding
- Punya laptop Windows, koneksi internet biasa
- Budget: nol rupiah (gratis semua)

ACTION PLAN:
[biarkan AI isi langkah-langkahnya]

REFLECTION:
[biakan AI isi refleksinya]
```

### Refleksi

```
ReAct pattern membantu kamu dalam hal: ________________________
Kapan kamu akan menggunakan pola ini? __________________________
```

---

## 🏋️ Latihan 3: Anti-Hallucination Testing

**⭐⭐⭐ Kesulitan:** Sulit | **⏱️ Waktu:** 10 menit

### Apa itu Hallucination?

Hallucination = AI **mengarang informasi** dengan percaya diri seolah-olah itu fakta. Ini adalah salah satu keterbatasan terbesar AI.

### Instruksi

Kirim 5 pertanyaan berikut ke AI, lalu **verifikasi jawabannya** menggunakan Google atau sumber lain.

### Pertanyaan Verifikasi

| No | Pertanyaan | Jawaban AI | Verifikasi (Google) | Benar/Salah? |
|---|---|---|---|---|
| 1 | "Siapa presiden pertama Indonesia dan tahun lahirnya?" | | | |
| 2 | "Berapa populasi kota Jakarta pada tahun 2025?" | | | |
| 3 | "Apa nama penemu telepon?" | | | |
| 4 | "Kapan Gunung Krakatau terakhir kali meletus besar?" | | | |
| 5 | "Apa GDP Indonesia tahun 2024 dalam USD?" | | | |

### Tips Testing Anti-Hallucination

1. **Gunakan pertanyaan factual** — angka, tanggal, nama, data
2. **Variasi tingkat kesulitan** — dari mudah (fakta umum) sampai sulit (data spesifik)
3. **Perhatikan confidence level AI** — apakah AI bilang "saya tidak yakin" atau langsung jawab?
4. **Cek sumber** — cari di Google, Wikipedia, atau sumber resmi

### Analisis Hallucination

Setelah verifikasi, jawab:

1. Dari 5 pertanyaan, berapa yang jawabannya **benar**? _____/5
2. Dari 5 pertanyaan, berapa yang jawabannya **salah**? _____/5
3. Apakah AI pernah bilang "saya tidak yakin" atau "data ini mungkin tidak akurat"?
4. Mana yang lebih berbahaya: AI yang salah tapi yakin, atau AI yang bilang "saya tidak tahu"?

### Tips Anti-Hallucination

| Strategi | Cara Pakai |
|---|---|
| Minta sumber | "Sertakan sumber/referensi untuk jawabanmu" |
| Minta disclaimer | "Jika tidak yakin, bilang 'saya tidak yakin'" |
| Cross-check | Selalu verifikasi data penting dengan Google |
| Gunakan AI search | Perplexity.ai lebih akurat karena search real-time |
| Split pertanyaan | Pecah pertanyaan besar jadi beberapa pertanyaan kecil |

---

## 🏋️ Latihan 4: Buat System Prompt

**⭐⭐⭐ Kesulitan:** Sulit | **⏱️ Waktu:** 12 menit

### Apa itu System Prompt?

System prompt = instruksi tersembunyi di awal percakapan yang mendefinisikan **siapa AI**, **bagaimana ia harus bertindak**, dan **batasan perilakunya**. Di ChatGPT, kamu bisa pakai fitur "Custom Instructions".

### Instruksi

Buat system prompt untuk **3 use case berikut**:

### Use Case 1: Tutor Matematika

```
[Kirim ini sebagai pesan pertama di percakapan baru]

SISTEM: Kamu adalah tutor matematika yang sabar untuk siswa SMA.

ATURAN:
1. Selalu gunakan bahasa Indonesia
2. Jika siswa salah jawab, JANGAN langsung kasih jawaban benar
3. Berikan petunjuk/hint terlebih dahulu
4. Gunakan analogi sehari-hari untuk menjelaskan konsep
5. Setelah menjelaskan, buatkan 1 soal latihan serupa
6. Gunakan format: [Konsep] → [Contoh] → [Latihan]

LARANGAN:
- Jangan gunakan istilah teknis tanpa penjelasan
- Jangan langsung kasih jawaban tanpa proses berpikir

Mulai dengan menanyakan: "Halo! Mau belajar matematika tentang 
apa hari ini?"
```

### Use Case 2: Writing Assistant

```
SISTEM: Kamu adalah asisten penulis profesional.

ATURAN:
1. Bantu menulis dalam bahasa Indonesia atau Inggris (sesuai input)
2. Setiap kali diminta menulis, tawarkan 2 versi: formal dan santai
3. Berikan 3 saran perbaikan setelah menulis
4. Gunakan teknik writing: hook, elaboration, conclusion
5. Panjang tulisan: sesuai yang diminta (jika tidak disebut, default 200 kata)

PERSONALITY:
- Kreatif tapi tetap akurat
- Suka menggunakan metafora
- Feedback yang diberikan harus spesifik (bukan hanya "bagus")

Mulai dengan bertanya: "Mau menulis tentang topik apa hari ini?"
```

### Use Case 3: Productivity Coach

```
SISTEM: Kamu adalah productivity coach yang membantu mahasiswa 
mengelola waktu dan produktivitas.

ATURAN:
1. Setiap saran harus realistis untuk mahasiswa Indonesia
2. Gunakan teknik: Pomodoro, Eisenhower Matrix, Time Blocking
3. Selalu tanyakan deadline sebelum memberikan rencana
4. Buat rencana dalam format tabel yang bisa langsung dijalankan
5. Motivasi tapi jangan berlebihan — realistis > motivasi kosong

LARANGAN:
- Jangan sarankan metode yang butuh aplikasi berbayar
- Jangan buat jadwal yang terlalu padat (mak emosi!)

Mulai dengan: "Ceritakan jadwal hari ini dan apa yang ingin 
capai. Aku bantu susun rencananya!"
```

### Evaluasi System Prompt

Untuk setiap system prompt yang kamu buat:
1. Kirim ke AI di **percakapan baru**
2. Test dengan 2-3 pertanyaan/permintaan
3. Apakah AI mengikuti aturan di system prompt? (Ya/Sebagian/Tidak)

---

## 🏋️ Latihan 5: Prompt Chaining

**⭐⭐⭐ Kesulitan:** Sulit | **⏱️ Waktu:** 15 menit

### Apa itu Prompt Chaining?

Prompt Chaining = menyusun **beberapa prompt berurutan** di mana output dari prompt pertama menjadi input untuk prompt berikutnya. Ini seperti assembly line untuk ide!

### Instruksi

Buat **5 prompt berurutan** untuk menghasilkan laporan lengkap tentang "Dampak Sosial Media terhadap Kesehatan Mental Remaja Indonesia".

### Chain of Prompts

**Prompt 1 — Research:**
```
Buatkan daftar 10 fakta penting tentang dampak sosial media 
terhadap kesehatan mental remaja di Indonesia. Sertakan data 
statistik jika ada. Format: bullet points.
```

**Prompt 2 — Analisis (gunakan output Prompt 1):**
```
Berdasarkan 10 fakta berikut: [tempel output Prompt 1]

Analisis fakta-fakta ini:
1. Identifikasi 3 tren utama
2. Sebutkan 2 kelompok yang paling terdampak
3. Jelaskan hubungan sebab-akibat untuk setiap tren
```

**Prompt 3 — Solusi (gunakan output Prompt 2):**
```
Berdasarkan analisis berikut: [tempel output Prompt 2]

Buatkan 5 solusi konkret yang bisa dilakukan:
1. Oleh remaja itu sendiri
2. Oleh orang tua
3. Oleh sekolah
4. Oleh pemerintah
5. Oleh platform sosial media
```

**Prompt 4 — Susun Laporan (gunakan output 1-3):**
```
Susun laporan lengkap dari bahan berikut:

FAKTA: [tempel output Prompt 1]
ANALISIS: [tempel output Prompt 2]  
SOLUSI: [tempel output Prompt 3]

Format laporan:
- Judul
- Pendahuluan (2 paragraf)
- Fakta & Data
- Analisis
- Solusi & Rekomendasi
- Kesimpulan
```

**Prompt 5 — Polish (gunakan output Prompt 4):**
```
Ini draft laporan saya: [tempel output Prompt 4]

Tolong:
1. Perbaiki tata bahasa dan ejaan
2. Buat lebih engaging (tambah hook di pendahuluan)
3. Pastikan flow/logika tulisan konsisten
4. Berikan 3 saran tambahan untuk perbaikan
```

### Tracking Proses

| Prompt | Input | Output (ringkas) | Waktu |
|---|---|---|---|
| 1. Research | Topik | 10 fakta | |
| 2. Analisis | 10 fakta | 3 tren + analisis | |
| 3. Solusi | Analisis | 5 solusi | |
| 4. Susun | Semua | Draft laporan | |
| 5. Polish | Draft | Final version | |

### 💡 Tips Prompt Chaining

- **Simpan output setiap prompt** — kamu akan membutuhkannya di prompt berikutnya
- **Jangan terlalu banyak step** — 3-5 step sudah cukup
- **Review output di setiap step** sebelum lanjut ke step berikutnya

---

## 🏋️ Latihan 6: Meta-Prompting

**⭐⭐⭐ Kesulitan:** Sulit | **⏱️ Waktu:** 10 menit

### Apa itu Meta-Prompting?

Meta-prompting = meminta AI **mengimprove prompt kamu sendiri**. Kamu kasih prompt, AI perbaiki dan kasih versi yang lebih baik!

### Instruksi

**Step 1 — Kirim prompt kamu yang biasa:**

```
Ini prompt yang sering saya pakai:
"Buatkan jadwal belajar untuk ujian"

Tolong improve prompt ini agar hasilnya lebih bagus. 
Buatkan 3 versi improvement:
- Versi ringkas (basic improvement)
- Versi menengah (tambah detail)
- Versi expert (paling lengkap dan terstruktur)

Jelaskan perubahan di setiap versi.
```

**Step 2 — Kirim hasil ke AI:**

```
Bandingkan hasil dari:
1. Prompt asli: "Buatkan jadwal belajar untuk ujian"
2. Prompt improved versi ringkas
3. Prompt improved versi menengah  
4. Prompt improved versi expert

Kirim semua 4 prompt ini (bergantian) dan bandingkan kualitas hasilnya.
```

### Tantangan Meta-Prompting

Coba improve prompt ini:

```
Prompt lama: "Tulis essay tentang pentingnya pendidikan"

Buatkan versi yang lebih baik dengan:
1. Tambah konteks siapa yang menulis
2. Tambah format spesifik
3. Tambah batasan yang jelas
4. Tambah instruksi untuk AI

Jelaskan kenapa versi baru lebih baik.
```

### Refleksi Meta-Prompting

```
Berapa kali improvement yang dibutuhkan sampai prompt benar-benar bagus?
Apa pola perbaikan yang paling sering muncul?
Kapan sebaiknya menggunakan meta-prompting?
```

---

## 🎯 Ringkasan & Lanjutan

### Teknik Lanjutan yang Sudah Dipelajari

| Teknik | Fungsi | Kapan Digunakan |
|---|---|---|
| **Tree of Thought** | Eksplorasi multi-jalur | Keputusan kompleks, strategi |
| **ReAct Pattern** | Reasoning + Action planning | Rencana proyek, problem solving |
| **Anti-Hallucination** | Validasi kebenaran fakta | Riset, data penting |
| **System Prompt** | Definisikan perilaku AI | Use case repetitif, personalisasi |
| **Prompt Chaining** | Output → Input berurutan | Laporan, research mendalam |
| **Meta-Prompting** | Improve prompt itu sendiri | Optimasi workflow |

### Tantangan Akhir

Buat **1 workflow lengkap** yang menggabungkan **Tree of Thought + Prompt Chaining + Meta-Prompting** untuk menyelesaikan tugas nyata di kuliah/sekolahmu.

### 📝 Catatan Penting

> Teknik lanjutan membutuhkan **latihan berulang**. Mulai dengan 1 teknik
> yang paling relevan dengan kebutuhanmu, kuasai, lalu tambah teknik lain.
> Goal-nya bukan menguasai semua, tapi **tahu kapan harus pakai yang mana!**
