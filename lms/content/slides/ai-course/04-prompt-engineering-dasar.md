---
title: "Prompt Engineering Dasar"
module: 4
course: "ai-complete-course"
---

# Module 4: Prompt Engineering Dasar

> "Prompt Engineering bukan soal bahasa pemrograman — ini tentang belajar berkomunikasi dengan AI secara efektif."

---

## 🎯 Tujuan Pembelajaran

Setelah modul ini, kamu akan bisa:
- Menguasai 10 teknik prompt engineering dasar
- Menggunakan framework CRISPE untuk prompt berkualitas
- Menerapkan template prompt siap pakai untuk belajar, coding, dan kerja
- Menulis prompt yang menghasilkan output berkualitas tinggi

---

## 🧠 Apa itu Prompt Engineering?

**Prompt Engineering** adalah seni dan ilmu untuk merancang instruksi (prompt) yang menghasilkan output AI berkualitas tinggi.

Analogi sederhana:
```
Prompt yang buruk → Seperti minta "masak yang enak" 
                     → Hasil: tidak konsisten

Prompt yang baik  → Seperti resep lengkap
                     → Hasil: konsisten dan sesuai selera
```

---

## 🔧 10 Teknik Prompt Engineering Dasar

### Teknik 1: Zero-Shot Prompting

**Apa itu:** Langsung memberi instruksi **tanpa contoh**.

**Kapan pakai:** Tugas sederhana dan sudah umum.

```
[TEMPLATE]
[Tugas langsung tanpa contoh]

[CONTOH]
Klasifikasikan review berikut sebagai positif, negatif, atau netral:

"Barangnya bagus tapi pengirimannya lama banget, sudah 5 hari belum sampai."

[OUTPUT]
Sentimen: Negatif
Alasan: Meskipun kualitas produk diakui positif, 
pengalaman pengiriman yang buruk mendominasi sentimen review.
```

### Teknik 2: Few-Shot Prompting

**Apa itu:** Memberikan **beberapa contoh** sebelum meminta AI melanjutkan.

**Kapan pakai:** Tugas yang butuh konsistensi format atau gaya.

```
[TEMPLATE]
Contoh 1: [input] → [output]
Contoh 2: [input] → [output]
Contoh 3: [input] → [output]

Sekarang: [input baru] → [output yang diharapkan]

[CONTOH]
Klasifikasi urgensi email:

Email: "Meeting jam 3 sore ini dibatalkan, tolong kabari tim" → URGENT
Email: "Reminder: laporan Q3 deadline Jumat" → MEDIUM  
Email: "Ada rekomendasi restoran enak di Bandung?" → LOW

Sekarang:
Email: "Server down! User tidak bisa akses selama 30 menit!" → [AI menjawab]
```

**Contoh dalam kode:**
```python
# Few-shot prompting dalam practice
few_shot_prompt = """
Convert informal Indonesian to formal:

Informal: "makan dulu ya, laper banget"
Formal: "Saya akan makan terlebih dahulu karena saya sangat lapar."

Informal: "gua ga bisa dateng, ada urusan"
Formal: "Mohon maaf, saya tidak dapat hadir karena ada keperluan mendadak."

Informal: "eh btw udah cek email belum?"
Formal: "Apakah Anda sudah memeriksa email yang saya kirimkan?"

Now convert:
Informal: "fix ya kita ketemu sabtu, jangan telat lagi"
Formal:
"""
```

### Teknik 3: Role-Playing (Persona Assignment)

**Apa itu:** Meminta AI berperan sebagai **profesor/ahli/karakter tertentu**.

**Kapan pakai:** Butuh perspektif spesifik atau penjelasan mendalam.

```
[TEMPLATE]
Bayangkan Anda adalah [PERAN] dengan [PENGALAMAN].
Anda dikenal karena [KEAHLIAN SPESIFIK].

[CONTOH]
Bayangkan Anda adalah dokter spesialis gizi dengan 15 tahun 
pengalaman. Anda dikenal karena pendekatan holistik dan 
mudah dipahami oleh pasien awam.

Bantu saya menyusun pola makan sehat untuk mahasiswa 
yang sering begadang dan makan tidak teratur.
Sertakan juga tips praktis yang mudah dilakukan di kos.
```

**Contoh dalam kode:**
```python
# Role-playing untuk coding assistance
role_play_prompt = """
You are a senior Python developer with 10 years of experience 
at Google. You write clean, well-documented code and always 
follow PEP 8 standards.

Review this code and suggest improvements:

def calc(a,b):
    c = a+b
    return c

# Expected: AI will respond with:
# 1. PEP 8 compliant version
# 2. Type hints
# 3. Docstring
# 4. Function naming improvements
# 5. Edge case considerations
"""
```

### Teknik 4: Chain of Thought (CoT)

**Apa itu:** Meminta AI **menunjukkan proses berpikir** langkah demi langkah.

**Kapan pakai:** Soal matematika, logika, analisis kompleks, decision making.

```
[TEMPLATE]
[Jawaban/tugas].
Pikirkan langkah demi langkah sebelum memberikan jawaban akhir.

[CONTOH]
Sebuah startup punya 500 user, growth rate 20%/bulan, 
dan churn rate 5%/bulan. Berapa user di akhir bulan ke-6?

Pikirkan langkah demi langkah sebelum memberikan jawaban akhir.

[OUTPUT AI - Proses CoT]
Langkah 1: Bulan 1: 500 × 1.20 = 600, setelah churn: 600 × 0.95 = 570
Langkah 2: Bulan 2: 570 × 1.20 = 684, setelah churn: 684 × 0.95 = 649.8 ≈ 650
Langkah 3: Bulan 3: 650 × 1.20 = 780, setelah churn: 780 × 0.95 = 741
Langkah 4: Bulan 4: 741 × 1.20 = 889.2, setelah churn: 889.2 × 0.95 ≈ 845
Langkah 5: Bulan 5: 845 × 1.20 = 1014, setelah churn: 1014 × 0.95 ≈ 963
Langkah 6: Bulan 6: 963 × 1.20 = 1155.6, setelah churn: 1155.6 × 0.95 ≈ 1098
Jawaban: ±1,098 user di akhir bulan ke-6
```

**Variasi CoT:**
```
# "Let's think step by step" — versi paling umum
# "Break this down" — untuk analisis masalah
# "Walk me through your reasoning" — untuk keputusan strategis
# "Show your work" — untuk soal matematika
```

### Teknik 5: Constraint Setting

**Apa itu:** Menetapkan **batasan spesifik** agar output sesuai kebutuhan.

**Kapan pakai:** Saat butuh output yang sangat spesifik format, panjang, atau gaya.

```
[TEMPLATE]
[Buat/tulis] [apa yang dibutuhkan].

BATASAN:
- Panjang: [kata/paragraf/kalimat]
- Gaya bahasa: [formal/casual/akademis]
- Bahasa: [Indonesia/Inggris/mixed]
- Target: [audiens]
- Format: [tabel/poin/paragraf]
- Yang tidak boleh: [larangan]

[CONTOH]
Buatkan caption Instagram untuk peluncuran kopi lokal premium.

BATASAN:
- Panjang: maksimal 30 kata
- Gaya bahasa: casual tapi elegan
- Bahasa: Indonesia, dengan 2-3 kata Inggris
- Target: anak muda 18-25 tahun
- Format: satu paragraf + emoji
- Yang tidak boleh: kata "jual", "beli", promo harga
```

### Teknik 6: Iterative Refinement

**Apa itu:** Memperbaiki dan memperkaya output melalui **beberapa putaran percakapan**.

**Kapan pakai:** Saat hasil pertama belum memuaskan atau butuh penyempurnaan.

```
[RUN 1]
Buatkan title slide untuk presentasi tentang AI.
→ AI: "Kecerdasan Buatan: Masa Depan Teknologi"

[RUN 2]
Tambahkan subtitle: "Pengenalan Praktis untuk Pemula"

[RUN 3]
Ubah tone-nya lebih menarik untuk mahasiswa, 
tambahkan elemen visual yang disarankan.

[RUN 4]
Bagus! Sekarang buatkan 5 alternatif title dengan gaya berbeda:
1. Profesional
2. Playful  
3. Provokatif
4. Inspiratif
5. Minimalis
```

### Teknik 7: Negative Prompting

**Apa itu:** Menjelaskan apa yang **TIDAK boleh** ada dalam output.

**Kapan pakai:** Untuk menghindari output yang tidak diinginkan.

```
[TEMPLATE]
Buatkan [apa yang dibutuhkan].

HINDARI:
- [Yang tidak boleh 1]
- [Yang tidak boleh 2]
- [Yang tidak boleh 3]

[CONTOH]
Buatkan resep masakan Indonesia untuk pemula.

HINDARI:
- Bahan yang sulit didapat (harus ada di Indomaret/Alfamart)
- Teknik masak yang butuh peralatan khusus
- Langkah yang lebih dari 6 tahap
- Bahan impor (harus bahan lokal Indonesia)
```

**Contoh negative prompting untuk konten:**
```
Buatkan email proposal kerja sama bisnis.

JANGAN:
- Gunakan jargon teknis yang berlebihan
- Terdengar seperti spam atau penjualan agresif
- Terlalu panjang (maks 200 kata)
- Kalimat sapaan generik seperti "Yang terhormat"
```

### Teknik 8: Structured Output

**Aropa itu:** Meminta AI menghasilkan output dalam **format struktur** tertentu.

**Kapan pakai:** Saat butuh output yang terorganisir dan mudah diproses.

```
[TEMPLATE]
Untuk [topik], buatkan output dalam format:

{
    "judul": "...",
    "ringkasan": "...",
    "poin_utama": ["...", "..."],
    "rekomendasi": ["...", "..."],
    "sumber": ["...", "..."]
}

[CONTOH]
Untuk topik "Tren AI di Indonesia 2025", buatkan output dalam format:

| No | Tren | Deskripsi | Dampak | Urgensi |
|----|------|-----------|--------|---------|
| 1  | ...  | ...       | ...    | Tinggi  |
| 2  | ...  | ...       | ...    | Sedang  |
```

**Contoh structured output dalam kode:**
```python
# Requesting structured JSON output
structured_prompt = """
Analyze this Python code and return a JSON response:

def process_data(data):
    result = []
    for item in data:
        if item > 0:
            result.append(item * 2)
    return result

Return your analysis as:
{
    "issues": [
        {
            "severity": "low|medium|high",
            "description": "...",
            "suggestion": "..."
        }
    ],
    "optimized_code": "...",
    "complexity": "O(n)"
}

Only return valid JSON, no additional text.
"""
```

### Teknik 9: Self-Consistency Checking

**Aropa itu:** Meminta AI **memverifikasi jawabannya sendiri**.

**Kapan pakai:** Untuk mengurangi kesalahan pada jawaban penting.

```
[TEMPLATE]
Jawab pertanyaan berikut, lalu:

Step 1: Berikan jawaban awal
Step 2: Periksa kembali jawabanmu — apakah ada yang salah?
Step 3: Jika ada perbaikan, berikan jawaban final yang sudah diperbaiki

[Jawaban]

[CONTOH]
Hitung 15% dari Rp 8.500.000.

Step 1: Berikan jawaban awal
Step 2: Periksa kembali jawabanmu — hitung ulang dengan cara berbeda
Step 3: Jika ada perbaikan, berikan jawaban final

→ AI menjawab:
Step 1: 15% × 8.500.000 = 1.275.000
Step 2: Verifikasi: 8.500.000 × 0.15 = 1.275.000 ✓ 
        Cross-check: 10% = 850.000, 5% = 425.000, Total = 1.275.000 ✓
Step 3: Jawaban final: Rp 1.275.000 (konsisten ✓)
```

### Teknik 10: Persona + Context

**Apa itu:** Menggabungkan **identitas AI** dengan **konteks situasi** yang mendalam.

**Kapan pakai:** Untuk respons yang sangat personal dan relevan.

```
[TEMPLATE]
KONTEKST SITUASI:
- Siapa saya: [identitas]
- Situasi: [kondisi saat ini]
- Tujuan: [yang ingin dicapai]
- Tantangan: [kendala yang dihadapi]

Anda adalah [PERAN/PERAN]. Bantu saya dengan:
[Tugas spesifik]

[CONTOH]
KONTEKST SITUASI:
- Si saya: Marketing Manager di startup fintech, usia 28 tahun
- Situasi: Startup baru dapat Series A, harus scale marketing
- Tujuan: Meningkatkan user acquisition 3x dalam 6 bulan
- Tantangan: Budget terbatas (Rp 50 juta/bulan), tim hanya 3 orang

Anda adalah Head of Growth yang pernah scale startup dari 
0 ke 1 juta user. Bantu saya buat:
1. Prioritas channel marketing
2. Alokasi budget per channel
3. KPI bulanan yang realistis
4. Quick wins untuk bulan pertama
```

---

## 🧩 Framework CRISPE

**CRISPE** = **C**apacity & Role + **R**esponse + **I**nsight + **S**tatement + **P**ersonality + **E**xperiment

| Huruf | Elemen | Penjelasan | Contoh |
|-------|--------|-----------|--------|
| **C** | Capacity & Role | Peran AI yang diinginkan | "Kamu adalah senior copywriter" |
| **R** | Response | Jenis output yang diharapkan | "Buatkan 5 judul artikel" |
| **I** | Insight | Konteks dan informasi tambahan | "Untuk blog startup edtech" |
| **S** | Statement | Instruksi spesifik dan batasan | "Maks 10 kata, SEO-friendly" |
| **P** | Personality | Gaya dan nada respons | "Casual, menggugah rasa ingin tahu" |
| **E** | Experiment | Permintaan variasi/alternatif | "Buat 3 versi: formal, casual, provocatif" |

### Contoh Lengkap dengan CRISPE

```
[C] Kamu adalah marketing strategist dengan pengalaman 
    di startup consumer goods selama 8 tahun.

[R] Buatkan 3 strategi kampanye media sosial.

[I] Produk: skincare lokal untuk kulit berminyak.
    Target: Wanita usia 20-30 tahun.
    Platform: Instagram & TikTok.
    Budget: Rp 20 juta/bulan.
    Lokasi: Indonesia.

[S] Setiap strategi harus mencakup:
    - Nama kampanye
    - Platform utama
    - Konten yang harus dibuat
    - Estimasi reach
    - Timeline pelaksanaan

[P] Gaya: Praktis dan actionable. 
    Gunakan bahasa bisnis yang jelas.

[E] Berikan juga 1 strategi "wildcard" yang tidak biasa 
    tapi berpotensi viral.
```

---

## 📋 Template Prompt Siap Pakai

### Template untuk BELAJAR

```
Saya ingin belajar [TOPIK] dari nol.

Tolong buatkan:
1. Penjelasan konsep dasar (gunakan analogi)
2. Daftar topik yang harus dipelajari (berurutan)
3. Sumber belajar gratis untuk setiap topik
4. Latihan praktis per topik
5. Milestone: "sudah paham" checklist

Target: Saya bisa [capaian] dalam [durasi].
Gaya: Seperti mentor yang sabar dan supportive.
```

### Template untuk CODING

```
[TASK KODE]

Bahasa: [Python/JavaScript/Go/dll]
Tingkat: [pemula/menengah/lanjut]
Framework: [jika ada]

Tolong buatkan:
1. Kode lengkap dengan komentar
2. Penjelasan cara kerja
3. Cara menjalankan (termasuk install dependency)
4. Test cases
5. Error handling

Kode harus:
- Mengikuti best practices
- Mudah dimodifikasi
- Well-documented
- Handle edge cases
```

**Contoh:**
```
Buatkan REST API sederhana untuk toko online.

Bahasa: Python
Framework: FastAPI
Database: SQLite

Tolong buatkan:
1. Endpoint CRUD untuk products
2. Endpoint untuk search & filter
3. Authentication sederhana
4. Error handling yang proper
5. API documentation dengan deskripsi

Kode harus:
- Mengikuti best practices
- Mudah dimodifikasi
- Well-documented
- Handle edge cases
- Siap deploy
```

### Template untuk KERJA

```
Saya perlu [OUTPUT YANG DIBUTUHKAN] untuk [KONTEKS KERJA].

KONTEKST:
- Industri: [bidang]
- Peran saya: [jabatan]
- Audiens: [siapa yang akan membaca/menggunakan]
- Deadline: [kapan harus selesai]
- Standar: [format perusahaan/industri]

TOLONG BUATKAN:
1. [Output utama]
2. [Tambahan 1]
3. [Tambahan 2]

GAYA: [formal/professional/casual]
PANJANG: [spesifik]
BAHASA: [Indonesia/Inggris]
```

**Contoh:**
```
Saya perlu presentasi PowerPoint 15 slide untuk quarterly review.

KONTEKST:
- Industri: E-commerce
- Peran saya: Product Manager
- Audiens: C-level executives
- Deadline: Besok pagi
- Standar: Corporate, minimalis, data-driven

TOLONG BUATKAN:
1. Outline setiap slide dengan title dan bullet points
2. Narasi pembicara per slide (2-3 kalimat)
3. Rekomendasi visual/grafik per slide
4. Executive summary (1 slide)
5. Key takeaways & next steps (1 slide)

GAYA: Profesional, data-driven, confident
PANJANG: 15 slide, max 5 bullet per slide
BAHASA: Indonesia dengan istilah bisnis Inggris
```

---

## 📝 Ringkasan Modul 4

```
✅ 10 Teknik: Zero-shot, Few-shot, Role-playing, CoT, Constraint, 
   Iterative, Negative, Structured, Self-consistency, Persona+Context
✅ Framework CRISPE: Capacity, Response, Insight, Statement, Personality, Experiment
✅ Template siap pakai untuk: Belajar, Coding, Kerja
✅ Prompt yang baik = konteks + instruksi + format + batasan
✅ Selalu gunakan teknik yang tepat sesuai kompleksitas tugas
```

---

## 🔑 Key Takeaways

1. **10 teknik dasar = fondasi prompt engineering** — kuasai ini dulu sebelum lanjut ke teknik advanced
2. **Few-shot > Zero-shot untuk konsistensi** — contoh konkret menghasilkan output yang lebih sesuai harapan
3. **Chain of Thought meningkatkan akurasi** — minta AI "berpikir langkah demi langkah" untuk tugas logis
4. **Framework CRISPE = prompt komprehensif** — gunakan untuk prompt penting yang butuh kualitas tinggi
5. **Template menghemat waktu** — buat template untuk tugas berulang dan gunakan berulang kali

---

## 🏋️ Practice Exercises

### Exercise 1: Teknik Zero-Shot vs Few-Shot
Buat prompt zero-shot dan few-shot untuk tugas yang sama (misal: meringkas artikel). Bandingkan kualitas outputnya.

### Exercise 2: Chain of Thought Challenge
Kirim 3 soal logika/matematika ke AI dengan CoT. Bandingkan akurasi saat kamu minta CoT vs tidak.

### Exercise 3: Framework CRISPE
Gunakan framework CRISPE untuk membuat prompt yang menghasilkan strategi marketing. Isi setiap elemen dengan lengkap.

### Exercise 4: Iterative Refinement
Mulai dengan prompt sederhana: "Buatkan strategi konten Instagram." Lakukan 5 iterasi sampai hasilnya benar-benar sesuai kebutuhanmu. Dokumentasikan setiap perubahan.

### Exercise 5: Negative Prompting
Buat prompt dengan 5+ batasan negatif untuk menghasilkan konten yang sangat spesifik. Misal: email yang pendek, tanpa jargon, tanpa basa-basi.

---

## 🚀 Next Module: Prompt Engineering Lanjutan

> Di **Module 5**, kita akan naik level! Kamu akan mempelajari Tree of Thought, ReAct pattern, meta-prompting, parameter tuning (temperature), dan teknik anti-hallucination. Ini adalah toolkit untuk menjadi prompt engineer profesional.
