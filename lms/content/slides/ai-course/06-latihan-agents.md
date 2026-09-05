---
title: "Latihan Modul 6: AI Agents & Tools"
exercise_type: practice
---

# 🤖 Latihan Modul 6: AI Agents & Tools Spesialis

> **Waktu estimasi:** 50-65 menit
> **Tools yang dibutuhkan:** Browser, akun GitHub (gratis), Copilot/Perplexity (gratis)
> **Tipe:** Hands-on practice dengan AI tools yang punya kemampuan khusus

---

## 📋 Petunjuk Umum

Modul ini membahas **AI Agents** — AI yang tidak hanya menjawab pertanyaan, tapi bisa **melakukan tugas nyata** seperti menulis kode, riset, dan menjalankan rencana multi-langkah.

> 🎯 **Perbedaan Utama:**
> - **AI Chat** = tanya jawab saja (ChatGPT basic mode)
> - **AI Agent** = bisa action — code, search, execute, create files

---

## 🏋️ Latihan 1: Debug Kode dengan AI

**⭐⭐ Kesulitan:** Sedang | **⏱️ Waktu:** 12 menit

### Instruksi

Gunakan **GitHub Copilot** (via VS Code) atau **ChatGPT** untuk memperbaiki 3 bug berikut. Jika belum punya Copilot, gunakan ChatGPT biasa.

### Bug #1 — Python: IndexError

```python
# Bug: IndexError saat akses list
def hitung_rata_rata(nilai):
    total = 0
    for i in range(len(nilai) + 1):  # Bug di sini!
        total += nilai[i]
    return total / len(nilai)

data = [85, 90, 78, 92, 88]
print(hitung_rata_rata(data))
```

**Instruksi ke AI:**
```
Kode Python saya menghasilkan IndexError. Tolong:
1. Identifikasi bug-nya
2. Jelaskan kenapa error
3. Berikan kode yang sudah diperbaiki
4. Jelaskan perbedaan kode lama vs baru
```

### Bug #2 — JavaScript: Undefined Variable

```javascript
// Bug: variabel tidak dideklarasikan
function sapaPengguna() {
    nama = "Budi";  // Bug di sini!
    console.log("Halo, " + nama);
    console.log("Selamat datang, " + name);  // Bug juga!
}

sapaPengguna();
```

**Instruksi ke AI:**
```
Saya punya 2 bug di kode JavaScript ini. Tolong:
1. Sebutkan SEMUA bug (ada lebih dari 1)
2. Jelaskan perbedaan 'nama' dan 'name' dalam konteks ini
3. Perbaiki seluruh kode
```

### Bug #3 — HTML: Broken Link

```html
<!-- Bug: gambar tidak muncul -->
<!DOCTYPE html>
<html>
<body>
    <h1>Profil Saya</h1>
    <img src="foto profil.jpg">  <!-- Bug di sini! -->
    <a href="http//website.com">Website</a>  <!-- Bug juga! -->
    <p>Email: <a href="mailto:budi@ gmail.com">Email Saya</a></p>
</body>
</html>
```

### Tracking Debug

| Bug | Apa yang Salah | Penyebab | Solusi AI | Benar? |
|---|---|---|---|---|
| #1 Python | | | | Ya/Tidak |
| #2 JavaScript | | | | Ya/Tidak |
| #3 HTML | | | | Ya/Tidak |

### Evaluasi AI Debugging

```
Apakah AI berhasil menemukan SEMUA bug? Ya / Tidak
Apakah penjelasan AI mudah dipahami? ⭐/⭐⭐/⭐⭐⭐
Apakah solusi AI bisa langsung dipakai? Ya / Perlu edit / Tidak
```

### 💡 Tips Debug dengan AI

- **Jangan hanya paste kode** — jelaskan juga error message yang muncul
- **Minta penjelasan** — jangan hanya terima fix tanpa paham kenapa
- **Verifikasi** — selalu jalankan kode yang sudah di-fix

---

## 🏋️ Latihan 2: Research dengan Perplexity AI

**⭐⭐ Kesulitan:** Sedang | **⏱️ Waktu:** 10 menit

### Instruksi

Gunakan **Perplexity AI** (perplexity.ai) untuk melakukan riset dengan **citation/sumber yang bisa diverifikasi**.

### Langkah-langkah

1. Buka [perplexity.ai](https://perplexity.ai)
2. Kirim 5 pertanyaan riset berikut
3. Catat jawaban DAN sumber/citation yang diberikan

### Pertanyaan Riset

| No | Pertanyaan | Sumber yang Dikutip AI | Sumber Bisa Diverifikasi? |
|---|---|---|---|
| 1 | "Apa tren penggunaan AI di Indonesia tahun 2025-2026?" | | Ya / Tidak |
| 2 | "Berapa gaji rata-rata fresh graduate IT di Jakarta?" | | Ya / Tidak |
| 3 | "Apa framework AI yang paling populer untuk pemula?" | | Ya / Tidak |
| 4 | "Bagaimana dampak AI terhadap lapangan kerja di Asia Tenggara?" | | Ya / Tidak |
| 5 | "Apa skill AI yang paling dicari perusahaan Indonesia?" | | Ya / Tidak |

### Perbandingan: Perplexity vs ChatGPT untuk Riset

| Aspek | Perplexity | ChatGPT |
|---|---|---|
| Apakah ada citation/sumber? | | |
| Apakah info bisa diverifikasi? | | |
| Kecepatan | | |
| Kedalaman jawaban | | |
| Cocok untuk riset? | | |

### 💡 Tips Research dengan AI

- **Selalu cek citation** — klik link yang diberikan Perplexity
- **Cross-check** — bandingkan dengan Google search manual
- **Tanyakan tahun data** — "Apakah data ini dari 2024 atau 2026?"

---

## 🏋️ Latihan 3: Buat Rencana Proyek dengan AI

**⭐⭐⭐ Kesulitan:** Sulit | **⏱️ Waktu:** 12 menit

### Instruksi

Gunakan AI untuk membuat **rencana proyek lengkap** untuk tugas kuliah/sekolah.

### Skenario Proyek

```
Saya mahasiswa semester 6 Teknik Informatika.
Tugas: Buat aplikasi sederhana untuk UMKM dalam 4 minggu.
Modal: Rp 0 (gratis semua)
Tim: 3 orang
Tools: Python + Flask + SQLite

Buatkan rencana proyek lengkap dengan:
1. Breakdown tugas per minggu
2. Pembagian kerja untuk 3 orang
3. Timeline visual (gunakan format Gantt chart teks)
4. Milestone dan deadline
5. Risiko potensial + mitigation
6. Daftar tools gratis yang dibutuhkan
```

### Contoh Output yang Diharapkan

AI akan membuat:
```
📋 RENCANA PROYEK: Aplikasi UMKM (4 Minggu)

MINGGU 1: Perencanaan & Setup
├── [Person A] Analisis kebutuhan UMKM
├── [Person B] Setup environment (Python, Flask)
├── [Person C] Desain UI/UX (Figma gratis)
└── Milestone: Dokumen requirement selesai

MINGGU 2: Development Phase 1
├── [Person A] Database design + CRUD
├── [Person B] Backend API
├── [Person C] Frontend HTML/CSS
└── Milestone: Fitur login + data entry

...

⚙️ RISIKO:
1. [Risiko] → [Mitigation]
2. [Risiko] → [Mitigation]
```

### Evaluasi Rencana

Cek apakah rencana AI memenuhi:

- [ ] Ada pembagian kerja yang jelas per orang?
- [ ] Ada deadline spesifik?
- [ ] Realistis untuk 4 minggu?
- [ ] Ada milestone di akhir setiap minggu?
- [ ] Mempertimbangkan skill masing-masing?

### Lanjutan: Minta AI Jadi Project Manager

```
Sekarang, bayangkan saya di minggu ke-2 dan behind schedule. 
Tolong:
1. Evaluasi apa yang harus diprioritaskan
2. Fitur mana yang bisa di-"scope down"
3. Bagaimana recovery plan agar tetap selesai tepat waktu
```

---

## 🏋️ Latihan 4: Test AI Agent Multi-Step Task

**⭐⭐⭐ Kesulitan:** Sulit | **⏱️ Waktu:** 12 menit

### Instruksi

Berikan AI tugas **multi-step** yang membutuhkan beberapa proses bertahap. Perhatikan apakah AI bisa menangani setiap step dengan benar.

### Multi-Step Task

```
Saya punya data penjualan bulanan toko online selama 6 bulan:

Januari: Rp 15.000.000 (150 transaksi)
Februari: Rp 12.000.000 (120 transaksi)
Maret: Rp 18.000.000 (180 transaksi)
April: Rp 14.000.000 (135 transaksi)
Mei: Rp 20.000.000 (200 transaksi)
Juni: Rp 22.000.000 (220 transaksi)

Tolong lakukan langkah berikut secara berurutan:

STEP 1: Hitung rata-rata penjualan per bulan dan rata-rata transaksi

STEP 2: Identifikasi bulan dengan penjualan tertinggi dan terendah

STEP 3: Hitung persentase pertumbuhan dari bulan ke bulan

STEP 4: Buat prediksi penjualan bulan Juli (dengan asumsi tren naik)

STEP 5: Rekomendasikan 3 strategi untuk meningkatkan penjualan 
         berdasarkan data

STEP 6: Buat ringkasan eksekutif dalam 1 paragraf
```

### Evaluasi Multi-Step

| Step | Apakah AI menyelesaikan? | Hasil Benar? | Catatan |
|---|---|---|---|
| 1. Rata-rata | Ya/Tidak | Ya/Tidak | |
| 2. Tertinggi/Terendah | Ya/Tidak | Ya/Tidak | |
| 3. Persentase growth | Ya/Tidak | Ya/Tidak | |
| 4. Prediksi | Ya/Tidak | Ya/Tidak | |
| 5. Rekomendasi | Ya/Tidak | Ya/Tidak | |
| 6. Ringkasan | Ya/Tidak | Ya/Tidak | |

### 💡 Tips Multi-Step

- **Berikan step yang jelas** — jangan campur semua jadi 1 prompt
- **Verifikasi setiap step** sebelum lanjut ke step berikutnya
- **Jika AI salah di step awal**, koreksi dulu sebelum minta step berikutnya
- **Jumlah ideal step:** 3-6 step per prompt

---

## 🏋️ Latihan 5: AI Chat vs AI Agent

**⭐⭐⭐ Kesulitan:** Sulit | **⏱️ Waktu:** 10 menit

### Instruksi

Bandingkan **AI chat biasa** (ChatGPT basic mode) vs **AI agent** (Perplexity, Copilot, atau ChatGPT dengan tools) untuk **task yang sama**.

### Task yang Diuji

Pilih salah satu:

**Task A: Mencari Referensi Paper**
```
Cari 3 paper penelitian terbaru tentang "AI untuk pendidikan 
di Indonesia" yang diterbitkan tahun 2024-2026. 
Sertakan judul, penulis, dan link.
```

**Task B: Debug + Jalankan Kode**
```
Perbaiki kode Python ini, jalankan, dan pastikan hasilnya benar:
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
print(fibonacci(10))
```

**Task C: Buat Dokumen Lengkap**
```
Buat proposal proyek mini tentang "Aplikasi Manajemen Tugas 
untuk Mahasiswa" dengan format: cover, latar belakang, tujuan, 
metode, timeline, dan anggaran.
```

### Tabel Perbandingan

| Aspek | AI Chat Biasa (ChatGPT mode) | AI Agent (Perplexity/Copilot) |
|---|---|---|
| **Sumber data** | Training data (Offline) | Real-time search |
| **Citation/Sumber** | Tidak ada / sedikit | Banyak & bisa diverifikasi |
| **Eksekusi kode** | Tidak bisa (teks saja) | Bisa (tergantung platform) |
| **Kecepatan** | | |
| **Akurasi untuk data terkini** | | |
| **Kemampuan multi-step** | | |
| **Kesimpulan:** | | |

### Refleksi Penting

Jawab:
1. Kapan sebaiknya pakai **AI chat biasa**?
2. Kapan sebaiknya pakai **AI agent**?
3. Apakah kamu bisa menggunakan keduanya secara bersamaan? Bagaimana caranya?

### 💡 Prinsip Penggunaan

```
┌─────────────────────────────────────────────────────────┐
│                    KAPAN PAKAI AI?                       │
├─────────────────────────────────────────────────────────┤
│ AI Chat (ChatGPT)  │ AI Agent (Perplexity/Copilot)     │
│─────────────────────│─────────────────────────────────  │
│ Brainstorming       │ Riset dengan sumber               │
│ Menulis teks        │ Debug kode                        │
│ Belajar konsep      │ Cari data real-time               │
│ Iterasi ide         │ Multi-step execution              │
│ Latihan/pembelajaran│ Generate + eksekusi               │
│ Draft awal          │ Verify & cite                     │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Ringkasan & Lanjutan

### Yang Sudah Kamu Pelajari

- ✅ Cara debug kode dengan bantuan AI (3 bug berbeda)
- ✅ Riset dengan citation menggunakan Perplexity
- ✅ Membuat rencana proyek lengkap dengan AI
- ✅ Menguji AI agent dengan task multi-step
- ✅ Membedakan kapan pakai AI chat vs AI agent

### Tools AI yang Sudah Dikuasai

| Tool | Fungsi Utama | Status |
|---|---|---|
| ChatGPT | General purpose AI chat | ✅ Digunakan |
| Claude | High-quality writing & analysis | ✅ Digunakan |
| Gemini | Search-integrated AI | ✅ Digunakan |
| Perplexity | Research + citation | ✅ Digunakan |
| GitHub Copilot | Coding assistant | ✅ Digunakan |
| Cursor | AI-powered code editor | 🔄 Eksplorasi |

### Tantangan Lanjutan

1. **Coba Cursor** (cursor.com) — download dan gunakan untuk edit kode
2. **Buat comparison** antara 3 tools AI coding yang berbeda
3. **Automate** 1 tugas repetitifmu dengan AI (misal: format data, generate email)

### 📝 Catatan Penting

> AI Agent adalah evolusi dari AI Chat — mereka tidak hanya menjawab,
> tapi **melakukan**. Memahami kapan harus pakai agent vs chat adalah
> keterampilan yang sangat berharga di era AI!
