---
title: "Jenis-Jenis Kecerdasan Buatan"
module: 2
course: "ai-complete-course"
---

# Module 2: Jenis-Jenis Kecerdasan Buatan

> "Untuk menggunakan AI dengan bijak, kamu perlu memahami jenis-jenisnya — mana yang cocok untuk kebutuhanmu."

---

## 🎯 Tujuan Pembelajaran

Setelah modul ini, kamu akan bisa:
- Mengklasifikasikan AI berdasarkan moditas (teks, gambar, audio, multimodal)
- Memahami level kemampuan AI (narrow, AGI, super)
- Menjelaskan metode pelatihan AI (supervised, unsupervised, RLHF)
- Membandingkan model-model populer secara praktis

---

## 📊 Klasifikasi AI Berdasarkan Moditas Input

🧠 ════════════════════════════════════════════════════════════════

### 🏗️ Hierarki AI: Dari Luas ke Spesifik

```
┌─────────────────────────────────────────────────────────────┐
│                   🤖 ARTIFICIAL INTELLIGENCE                │
│              (Kecerdasan Buatan — istilah luas)             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              🧠 MACHINE LEARNING                      │  │
│  │      (AI yang belajar dari data tanpa diprogram)      │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │          🔬 DEEP LEARNING                       │  │  │
│  │  │  (Machine Learning dengan jaringan syaraf)      │  │  │
│  │  │  ┌───────────────────────────────────────────┐  │  │  │
│  │  │  │     🕸️ NEURAL NETWORKS                    │  │  │  │
│  │  │  │  (Arsitektur: CNN, RNN, Transformer)      │  │  │  │
│  │  │  │  ┌─────────────────────────────────────┐  │  │  │  │
│  │  │  │  │  💡 LARGE LANGUAGE MODELS (LLM)     │  │  │  │  │
│  │  │  │  │  GPT, Claude, Gemini, DeepSeek      │  │  │  │  │
│  │  │  │  │  ┌───────────────────────────────┐  │  │  │  │  │
│  │  │  │  │  │  🤖 AI AGENTS                  │  │  │  │  │  │
│  │  │  │  │  │  Autonomous + Tools + Memory   │  │  │  │  │  │
│  │  │  │  │  └───────────────────────────────┘  │  │  │  │  │
│  │  │  │  └─────────────────────────────────────┘  │  │  │  │
│  │  │  └───────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

  📌 Setiap layer adalah SUBSET dari layer di atasnya
  📌 Transformer = arsitektur di balik hampir semua LLM modern
```

### 1. 📝 Text-Based AI (AI Berbasis Teks)

AI yang memproses dan menghasilkan **teks** sebagai input/output utama.

**Contoh penggunaan:**
- Menulis artikel, email, surat
- Menjawab pertanyaan
- Menerjemahkan bahasa
- Membuat ringkasan
- Coding & debugging

**Model populer:**

| Model | Developer | Fitur Unggulan | Harga |
|-------|----------|----------------|-------|
| GPT-4o | OpenAI | Kreativitas tinggi, instruksi-follower | Gratis/Premium |
| Claude 4 | Anthropic | Analisis mendalam, konteks panjang | Gratis/Pro |
| Gemini | Google | Integrasi Search, multimodal | Gratis/Advanced |
| DeepSeek V4 | DeepSeek | Open source, performa tinggi | Sangat murah |
| Llama 3 | Meta | Open source, bisa lokal | Gratis |

```python
# Contoh: Text-based AI untuk menganalisis review
prompt = """
Analisis review customer berikut dan berikan:
1. Sentimen (positif/negatif/netral)
2. Topik utama yang dibahas
3. Rekomendasi tindakan

Review: "Produknya bagus, tapi pengirimannya lambat banget.
Sudah 5 hari belum sampai. Kecewa sama ekspedisinya."
"""

# Expected output AI:
# 1. Sentimen: Campuran (positif untuk produk, negatif untuk pengiriman)
# 2. Topik: Kualitas produk (positif), Pengiriman (negatif)
# 3. Rekomendasi: Evaluasi partner ekspedisi, berikan update tracking
```

### 2. 🖼️ Image-Based AI (AI Berbasis Gambar)

AI yang memproses, menganalisis, atau menghasilkan **gambar**.

**Tipe turunan:**
- **Image Recognition** — Mengenali objek dalam gambar
- **Image Generation** — Membuat gambar dari teks
- **Image Editing** — Mengubah/mengedit gambar
- **OCR** — Membaca teks dari gambar

**Model populer:**

| Model | Developer | Kemampuan | Contoh Penggunaan |
|-------|----------|-----------|-------------------|
| DALL-E 3 | OpenAI | Text-to-image | Desain grafis |
| Midjourney | Midjourney | Seni & ilustrasi | Karya seni digital |
| Stable Diffusion | Stability AI | Open source | Custom image gen |
| Gemini Vision | Google | Multimodal understanding | Analisis gambar |
| SAM | Meta | Image segmentation | Editing presisi |

```python
# Contoh: Image analysis untuk retail
image_analysis_prompt = """
Analisis gambar produk ini dan berikan:
1. Deskripsi produk
2. Kondisi produk (baru/bekas/rusak)
3. Estimasi kategori harga
4. Tag warna dan gaya
"""

# Contoh: Image generation
image_generation_prompt = """
Buat gambar poster promosi untuk kopi lokal Indonesia dengan gaya:
- Warm tones, cozy atmosphere
- Teks: "Kopi Nusantara, Rasa Tradisi"
- Ukuran: poster A3, resolusi tinggi
"""
```

### 3. 🔊 Audio-Based AI (AI Berbasis Audio)

AI yang memproses, menganalisis, atau menghasilkan **audio/suara**.

**Sub-kategori:**

| Tipe | Fungsi | Model Contoh |
|------|--------|-------------|
| Speech-to-Text (STT) | Suara → Teks | Whisper, Google STT |
| Text-to-Speech (TTS) | Teks → Suara | ElevenLabs, Azure TTS |
| Music Generation | Teks → Musik | Suno, Udio, MusicGen |
| Sound Effects | Teks → Efek suara | AudioGen |
| Voice Cloning | Meniru suara | ElevenLabs |

```python
# Contoh: Audio workflow untuk content creator
audio_workflow = {
    "step_1": "Transkrip podcast dengan Whisper STT",
    "step_2": "Ringkaskan transkrip dengan Claude/GPT",
    "step_3": "Buat thread Twitter dari ringkasan",
    "step_4": "Generate voice-over pendek dengan ElevenLabs",
    "step_5": "Buat jingle intro dengan Suno AI"
}

# Contoh prompt untuk music generation (Suno)
music_prompt = """
Genre: Lo-fi hip hop
Mood: Chill, productive
Tempo: 80 BPM
Instrumentation: Piano, soft drums, vinyl crackle
Duration: 3 minutes
Use case: Background music untuk belajar
"""
```

### 4. 🎭 Multimodal AI

AI yang bisa memproses **lebih dari satu jenis input** secara bersamaan.

🧠 ════════════════════════════════════════════════════════════════

### 📥 Tipe Input AI: Dari Tunggal ke Multimodal

```
┌─────────────────────────────────────────────────────────────┐
│                    📥 TIPE INPUT AI                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📝 TEKS          🖼️ GAMBAR        🔊 AUDIO                 │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │ ChatGPT  │    │ DALL-E   │    │ Whisper  │              │
│  │ Claude   │    │ Midjrn   │    │ Suno     │              │
│  │ Gemini   │    │ Stable   │    │ ElevenLbs│              │
│  │ DeepSeek │    │ Diffusion│    │ AudioGen │              │
│  └────┬─────┘    └────┬─────┘    └────┬─────┘              │
│       │               │               │                     │
│       └───────┬───────┴───────┬───────┘                     │
│               │               │                             │
│       ┌───────▼───────────────▼───────┐                     │
│       │     🎭 MULTIMODAL AI          │                     │
│       │  Teks + Gambar + Audio +      │                     │
│       │  Video + Kode — SEMUANYA!     │                     │
│       │                               │                     │
│       │  GPT-4o  → Teks+Gambar+Audio  │                     │
│       │  Gemini  → Semua (termasuk     │                     │
│       │            video!)              │                     │
│       │  Claude  → Teks+Gambar         │                     │
│       └───────────────────────────────┘                     │
│                                                             │
│  📌 Multimodal = AI yang bisa "melihat + mendengar +        │
│     membaca" sekaligus — seperti manusia!                   │
└─────────────────────────────────────────────────────────────┘
```

**Kemampuan multimodal:**
- Teks + Gambar → Analisis visual
- Teks + Audio → Pemahaman percakapan
- Teks + Video → Pemahaman video
- Teks + Gambar + Audio → Pengalaman lengkap

| Model | Teks | Gambar | Audio | Video | Kode |
|-------|------|--------|-------|-------|------|
| GPT-4o | ✅ | ✅ | ✅ | ❌ | ✅ |
| Claude 4 | ✅ | ✅ | ❌ | ❌ | ✅ |
| Gemini 2.0 | ✅ | ✅ | ✅ | ✅ | ✅ |
| Grok-2 | ✅ | ✅ | ❌ | ❌ | ✅ |

```python
# Contoh: Multimodal workflow
multimodal_example = """
Kamu bisa mengirim ke Gemini 2.0:
1. Foto struk belanja → AI menghitung total belanja
2. Screenshot code error → AI membantu debug
3. Foto白board → AI mendigitalkan catatan
4. Screenshot UI → AI memberikan feedback desain

INI yang membuat multimodal AI sangat powerful!
"""
```

---

## 📊 Klasifikasi Berdasarkan Kemampuan

### Perbandingan Level Kemampuan

```
┌──────────────────────────────────────────────────────────┐
│                    LEVEL KEMAMPUAN AI                     │
├────────────────┬─────────────────┬───────────────────────┤
│   NARROW AI    │   GENERAL AI    │     SUPER AI          │
│   (Saat ini)   │   (AGI)         │     (Teoritis)        │
├────────────────┼─────────────────┼───────────────────────┤
│ Spesialis      │ Serba bisa      │ Melampaui manusia     │
│ Satu tugas     │ Seperti manusia │ Dalam semua aspek     │
│ Contoh:        │ Status:         │ Status:               │
│ ChatGPT, Siri  │ Penelitian      │ Fiksi ilmiah          │
│ AlphaGo, GPS   │                 │                       │
└────────────────┴─────────────────┴───────────────────────┘
```

### Narrow AI — Yang Sudah Ada
- **Chatbot:** ChatGPT, Claude, Gemini
- **Pengenalan wajah:** Face ID, Google Photos
- **Rekomendasi:** Netflix, Spotify, TikTok
- **Navigasi:** Google Maps, Waze
- **Game:** AlphaGo, Stockfish
- **Perawatan kesehatan:** AI diagnostik medis

### AGI — Yang Sedang Dituju
- Bisa belajar tugas baru tanpa dilatih ulang
- Memahami konteks dan nuansa seperti manusia
- Bisa berpindah antar domain dengan mudah
- **Status:** Beberapa peneliti percaya sudah mendekati, banyak yang skeptis

### Super AI — Yang Masih Teori
- Mengungguli kecerdasan manusia dalam semua aspek
- Termasuk kreativitas, kecerdasan sosial, wisdom
- **Status:** Murni teoritis, tidak ada timeframe pasti

---

## 📊 Klasifikasi Berdasarkan Metode Pelatihan

🧠 ════════════════════════════════════════════════════════════════

### 🔄 Alur Training AI: Dari Data mentah hingga AI Terpakai

```
┌─────────────────────────────────────────────────────────────────┐
│                  ⚙️ PROSES TRAINING AI                         │
│                                                                 │
│  📂 DATA     🏷️ LABEL    ⚙️ TRAIN     📊 EVALUATE  🚀 DEPLOY  │
│  ┌──────┐   ┌──────┐   ┌──────┐    ┌──────┐    ┌──────┐     │
│  │Kumpul│──→│Beri  │──→│Latih │───→│Uji & │───→│Siap  │     │
│  │Data  │   │Label │   │Model │    │Review│    │Pakai │     │
│  │Mentah│   │& Cek │   │      │    │      │    │      │     │
│  └──────┘   └──────┘   └──────┘    └──────┘    └──────┘     │
│     │           │           │            │           │         │
│     ▼           ▼           ▼            ▼           ▼         │
│  📋 Gather   ✏️ Annotate  🔄 Iterate   ✅ Pass?   🌍 Prod    │
│  🌐 Scrape   👁️ Verify   📉 Loss ↓    ❌ Fix!   📈 Monitor  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ⏱️ Timeline: Minggu → Bulan → Tahun                      │  │
│  │  💰 Biaya: $10K → $100M+ tergantung model               │  │
│  │  👥 Tim: Data Engineers + ML Engineers + Reviewers        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 1. 🏷️ Supervised Learning (Terbimbing)

AI dilatih dengan data yang sudah **diberi label** (jawaban benar).

```
Data Latih:
├── Input: "Apa ibu kota Jepang?" → Label: "Tokyo"
├── Input: "Apa ibu kota Korea?" → Label: "Seoul"
├── Input: "Apa ibu kota Thailand?" → Label: "Bangkok"
│
├── ... ribuan contoh ...
│
└── Model belajar: input pattern → output yang benar
```

**Contoh penggunaan:**
- Klasifikasi email spam/not spam
- Pengenalan wajah
- Prediksi harga rumah

### 2. 📊 Unsupervised Learning (Tanpa Bimbingan)

AI menemukan **pola sendiri** dari data tanpa label.

```
Data Tanpa Label:
├── Data pelanggan 1: usia 25, belanja Rp500rb/bulan
├── Data pelanggan 2: usia 35, belanja Rp2jt/bulan
├── Data pelanggan 3: usia 25, belanja Rp400rb/bulan
├── Data pelanggan 4: usia 40, belanja Rp1.8jt/bulan
│
├── Model menemukan pola:
│   ├── Cluster A: Usia muda, belanja rendah
│   ├── Cluster B: Usia dewasa, belanja tinggi
│   └── ...
```

**Contoh penggunaan:**
- Segmentasi pelanggan
- Deteksi anomali (fraud detection)
- Rekomendasi produk

### 3. 🎮 Reinforcement Learning (Penguatan)

AI belajar melalui **trial and error** dengan sistem reward/punishment.

```
Agent (AI) → Ambil Aksi → Dapat Reward/Punishment → Update Strategi

Contoh:
├── AI bermain chess
│   ├── Pindah bidak ke posisi baik → +1 reward
│   ├── Kehilangan ratu → -10 reward
│   └── AI belajar strategi terbaik dari jutaan game
```

### 4. 🔄 RLHF (Reinforcement Learning from Human Feedback)

Metode khusus untuk **LLM modern** — AI dilatih berdasarkan **preferensi manusia**.

```
Proses RLHF:
│
├── Step 1: Pre-training (belajar dari internet)
├── Step 2: SFT (Supervised Fine-Tuning dengan instruksi)
├── Step 3: RLHF
│   ├── AI menghasilkan beberapa jawaban
│   ├── Manusia memberi ranking (ini terbaik, ini jelek)
│   ├── AI belajar dari preferensi manusia
│   └── Berulang sampai kualitas meningkat
│
└── Hasil: AI yang lebih helpful, harmless, honest
```

**Model yang menggunakan RLHF:**
- ChatGPT / GPT-4o
- Claude (dengan Constitute AI + RLHF)
- Llama (dengan RLHF pipeline)
- DeepSeek (dengan GRPO — Group Relative Policy Optimization)

---

## 📊 Tabel Perbandingan Model Lengkap

| Aspek | GPT-4o | Claude 4 | Gemini 2.0 | DeepSeek V4 | Llama 3 |
|-------|--------|----------|------------|-------------|---------|
| **Developer** | OpenAI | Anthropic | Google | DeepSeek | Meta |
| **Tipe** | Proprietary | Proprietary | Proprietary | Semi-open | Open source |
| **Context Window** | 128K | 200K | 1M | 128K | 128K |
| **Multimodal** | Teks+Gambar+Audio | Teks+Gambar | Teks+Gambar+Audio+Video | Teks | Teks |
| **Coding** | ★★★★☆ | ★★★★★ | ★★★★☆ | ★★★★★ | ★★★★☆ |
| **Kreativitas** | ★★★★★ | ★★★★☆ | ★★★☆☆ | ★★★★☆ | ★★★☆☆ |
| **Analisis** | ★★★★☆ | ★★★★★ | ★★★★☆ | ★★★★★ | ★★★☆☆ |
| **Harga** | Sedang | Sedang | Gratis/Sedang | Murah | Gratis |
| **API Access** | Ya | Ya | Ya | Ya | Ya (lokal) |
| **Bahasa Indonesia** | ★★★★☆ | ★★★★☆ | ★★★★☆ | ★★★★☆ | ★★★☆☆ |

---

## 🧩 Memilih AI yang Tepat untuk Kebutuhanmu

### Decision Tree Sederhana

```
Kebutuhan kamu apa?
│
├── Menulis/kreativitas → GPT-4o atau Claude
├── Coding/debugging → Claude atau DeepSeek
├── Analisis data → Claude atau GPT-4o
├── Membuat gambar → DALL-E/Midjourney/Stable Diffusion
├── Membuat musik → Suno atau Udio
├── Budget terbatas → DeepSeek atau Gemini gratis
├── Privasi tinggi → Llama (lokal)
├── Butuh real-time info → Gemini atau Grok
└── Multimodal (gambar+teks) → Gemini 2.0 atau GPT-4o
```

### Tips Memilih Platform

1. **Mulai gratis** — Semua platform utama punya tier gratis
2. **Coba 2-3 platform** — Bandingkan untuk tugas yang sama
3. **Sesuaikan dengan workflow** — Kalau pakai Google, Gemini paling natural
4. **Evaluasi berkala** — Model terus berkembang, cek update tiap 3 bulan

---

## 📝 Ringkasan Modul 2

```
✅ AI diklasifikasikan berdasarkan: moditas, kemampuan, dan metode pelatihan
✅ 4 jenis moditas: Teks, Gambar, Audio, Multimodal
✅ 3 level kemampuan: Narrow (sekarang), AGI (penelitian), Super (teoritis)
✅ 4 metode pelatihan utama: Supervised, Unsupervised, RL, RLHF
✅ Setiap model punya keunggulan masing-masing — pilih sesuai kebutuhan
✅ Multimodal AI adalah tren masa depan yang sudah mulai nyata
```

---

## 🔑 Key Takeaways

1. **Kenali jenis AI berdasarkan input/output** — Teks, gambar, audio, atau kombinasi (multimodal) untuk memilih tool yang tepat
2. **Semua AI saat ini masih Narrow AI** — spesialis untuk tugas tertentu, belum bisa melakukan semuanya
3. **RLHF adalah kunci kecerdasan AI modern** — feedback manusia membuat AI lebih helpful dan aman
4. **Tidak ada AI yang "terbaik untuk segalanya"** — GPT untuk kreativitas, Claude untuk analisis, DeepSeek untuk harga, Gemini untuk integrasi Google
5. **Multimodal AI berkembang pesat** — kemampuan memproses teks+gambar+audio bersamaan membuka peluang baru

---

## 🏋️ Practice Exercises

### Exercise 1: Analisis Kebutuhan AI
Untuk 3 skenario berikut, tentukan jenis AI dan model apa yang paling cocok:
1. Kamu perlu membuat poster promosi untuk acara kampus
2. Kamu perlu menganalisis 100 review customer dari marketplace
3. Kamu perlu membuat background music untuk video YouTube

### Exercise 2: Bandingkan Model
Kirim prompt yang sama ke 3 model berbeda: "Jelaskan machine learning seperti saya adalah anak SD." Bandingkan kemampuan mereka dalam membuat penjelasan sederhana.

### Exercise 3: Eksplorasi Multimodal
Kirim foto objek apapun ke Gemini/GPT-4o dan minta: "Analisis gambar ini: apa isinya, warna dominan, suasana, dan saran untuk menggunakan gambar ini dalam presentasi bisnis."

### Exercise 4: Peta Metode Pelatihan
Untuk setiap AI yang kamu gunakan sehari-hari (asisten virtual, rekomendasi video, dll), identifikasi metode pelatihan mana yang paling mungkin digunakan.

### Exercise 5: Rencana Penggunaan AI
Buat rencana 1 minggu menggunakan AI untuk produktivitas harian. Tentukan: task apa, model apa, dan kenapa model itu dipilih.

---

## 🚀 Next Module: Cara Memulai Menggunakan AI

> Di **Module 3**, kita akan praktek langsung! Kamu akan belajar step-by-step cara membuat akun di berbagai platform, memulai percakapan pertama dengan AI, dan menghindari kesalahan umum pemula. Hands-on time!
