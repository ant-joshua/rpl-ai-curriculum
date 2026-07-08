---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — 🎓 Persiapan Sertifikasi RPL"
footer: "Sesi 02: Strategi Persiapan"
---

<!-- _class: title -->
# 📍 Sesi 02 — Strategi Persiapan Sertifikasi

> **Durasi:** 120 menit  
> **Tujuan:** Menyusun strategi belajar efektif, memahami pola soal, dan mempersiapkan mental menghadapi uji sertifikasi

---

## 1. Siklus Persiapan Sertifikasi

### 1.1 Timeline Ideal (4-6 Minggu)

```mermaid
%%{init: {'theme': 'dark'}}%%
gantt
    title Timeline Persiapan Sertifikasi
    dateFormat  YYYY-MM-DD
    
    section Assessment
    Self-Assessment & Gap Analysis       :a1, 7d
    Pemilihan Skema Sertifikasi          :a2, 3d
    
    section Belajar
    Review Materi Teori                  :b1, 14d
    Praktik Proyek                       :b2, 14d
    
    section Latihan
    Latihan Soal & Try Out               :c1, 7d
    Simulasi Uji Praktik                 :c2, 7d
    
    section Final
    Review Akhir & Dokumen               :d1, 3d
    UJI SERTIFIKASI                      :d2, 2d
```

### 1.2 Tahapan Mingguan

| Minggu | Fokus | Aktivitas |
|--------|-------|-----------|
| **M1** | Assessment | Mapping kompetensi, pilih skema, identifikasi gap |
| **M2** | Teori Dasar | Review konsep — algoritma, database, web, security |
| **M3** | Praktik Intensif | Kerjakan project-based exercises, coding challenges |
| **M4** | Simulasi | Try out soal, mock test praktik, review dokumen |
| **M5** | Final Polish | Review gap, latihan wawancara, persiapan administrasi |
| **M6** | Eksekusi | Uji sertifikasi |

---

## 2. Strategi Belajar Efektif

### 2.1 Metode Belajar

| Metode | Porsi | Kegiatan |
|--------|-------|----------|
| **Active Recall** | 40% | Menjawab soal tanpa lihat catatan, flashcard |
| **Practice by Doing** | 35% | Coding proyek, refactor code, debugging |
| **Teaching Others** | 15% | Diskusi, presentasi, nge-blog |
| **Passive Review** | 10% | Baca dokumentasi, nonton video, baca kode orang |

### 2.2 Teknik Pomodoro untuk Persiapan

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ⏱️ 25 menit FOKUS BELAJAR                              │
│  ─────────────────────                                   │
│  • No HP, no social media                               │
│  • 1 topik spesifik per sesi                            │
│  • Catat pertanyaan yang muncul                         │
│                                                         │
│  🟢 5 menit ISTIRAHAT                                   │
│  ────────────────                                       │
│  • Jalan, stretching, minum air                         │
│  • Jangan buka HP (screen break)                        │
│                                                         │
│  🔄 Ulangi 4x → istirahat panjang 15-30 menit           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 2.3 Spaced Repetition Schedule

| Hari ke- | Review Materi |
|----------|---------------|
| 1 | Materi baru hari ini |
| 2 | Review hari 1 |
| 4 | Review hari 1 + 2 |
| 7 | Review minggu lalu |
| 14 | Review 2 minggu lalu |
| 30 | Review bulan lalu |

> 💡 Gunakan Anki atau flashcards fisik untuk spaced repetition.

---

## 3. Pola Soal Uji Sertifikasi

### 3.1 Tes Tulis — Tipe Soal

| Tipe Soal | Contoh | Tips |
|-----------|--------|------|
| **Pilihan Ganda** | "Manakah yang BUKAN termasuk method HTTP?" — GET, POST, FETCH, DELETE | Hapal status code, method, keyword standar |
| **Menjodohkan** | "Pasangkan istilah dengan definisi yang tepat" | Pahami terminologi, bukan hanya hapalan |
| **Essay Singkat** | "Jelaskan perbedaan REST dan GraphQL" | Gunakan analogi, contoh konkret |
| **Studi Kasus** | "Diberikan skenario aplikasi, identifikasi kelemahan security" | Baca skenario teliti, gunakan OWASP framework |
| **Perbaikan Kode** | "Kode berikut memiliki 3 bug. Sebutkan dan perbaiki." | Praktek code review dengan AI |

### 3.2 Contoh Soal Pilihan Ganda

**Soal 1:**
```
Manakah metode HTTP yang tepat untuk memperbarui data secara parsial?

A. PUT
B. POST
C. PATCH
D. DELETE

Jawaban: C. PATCH
Penjelasan: PATCH digunakan untuk update parsial, PUT untuk replace 
seluruh resource, POST untuk create, DELETE untuk hapus.
```

**Soal 2:**
```
Apa yang dimaksud dengan SQL Injection?

A. Serangan yang memasukkan kode SQL berbahaya ke query
B. Serangan yang menginjeksi script ke browser
C. Serangan yang membanjiri server dengan request
D. Serangan yang mencuri session cookie

Jawaban: A
Penjelasan: SQL Injection terjadi ketika input pengguna tidak 
disanitasi dan langsung digabung ke query SQL.
```

**Soal 3:**
```
Function dengan kompleksitas O(n log n) adalah karakteristik dari algoritma...

A. Linear Search
B. Bubble Sort
C. Merge Sort
D. Binary Search

Jawaban: C. Merge Sort
Penjelasan: Merge Sort memiliki kompleksitas O(n log n), 
sedangkan Linear Search O(n), Bubble Sort O(n²), Binary Search O(log n).
```

### 3.3 Contoh Soal Essay

```
Soal: 
Sebuah startup ingin membangun sistem e-commerce. Pengguna bisa
mendaftar, login, browsing produk, menambahkan ke keranjang, dan
checkout. Buatlah:

1. ERD sederhana (sebutkan tabel dan relasi)
2. Arsitektur aplikasi (frontend, backend, database)
3. 3 endpoint API utama (method, path, fungsi)
4. Strategi keamanan dasar

Jawaban dievaluasi berdasarkan:
✅ Kelengkapan struktur
✅ Kesesuaian relasi database
✅ RESTful API design
✅ Security awareness
```

---

## 4. Persiapan Uji Praktik

### 4.1 Skenario Uji Praktik

Uji praktik biasanya berupa **pengembangan aplikasi** dengan spesifikasi:

| Aspek | Detail |
|-------|--------|
| **Durasi** | 3 jam (180 menit) |
| **Stack** | Bebas (React/Vue + Node.js/PHP + MySQL/PostgreSQL) |
| **Fitur** | CRUD, autentikasi, validasi, search, pagination |
| **Database** | 3-5 tabel dengan relasi |
| **Deployment** | Opsional (nilai tambah) |
| **Dokumentasi** | README, API docs, cara jalanin |

### 4.2 Tips Manajemen Waktu Praktik

```
⏱️ 180 MENIT — PEMBAGIAN WAKTU

[30 menit] —  Perencanaan
  • Baca soal sampai paham
  • Buat ERD di kertas
  • Rencanakan struktur folder & file
  • Prioritaskan fitur wajib vs bonus

[90 menit] —  Implementasi Inti
  • Setup project (5 menit)
  • Database schema & migration (15 menit)
  • Backend API — fitur wajib (40 menit)
  • Frontend — fitur wajib (30 menit)

[45 menit] —  Fitur Tambahan
  • Autentikasi & otorisasi
  • Validasi client + server
  • Error handling
  • Fitur bonus (search, pagination, dll)

[15 menit] —  Final Check
  • Tes semua fitur
  • Cek error di console
  • Update README
  • Commit terakhir
  • Backup / export
```

### 4.3 Checklist Hari-H

Sebelum uji praktik, pastikan:

- [ ] Laptop & charger siap
- [ ] IDE terinstall (VS Code recommended)
- [ ] Extension penting: ESLint, Prettier, Git Graph
- [ ] Browser: Chrome/Firefox + DevTools
- [ ] Local server: Node.js / XAMPP / Laragon
- [ ] Database: MySQL / PostgreSQL running
- [ ] Git configured (user.name, user.email)
- [ ] Template project siap (boilerplate)
- [ ] Akun GitHub / GitLab (jika perlu push)
- [ ] Dokumentasi offline: MDN, docs framework
- [ ] Internet cadangan (mobile hotspot)
- [ ] Minum & snack

---

## 5. Persiapan Administrasi

### 5.1 Dokumen yang Diperlukan

| Dokumen | Keterangan |
|---------|-----------|
| **Fotokopi KTP** | 2 lembar |
| **Pas Foto** | 3x4 atau 4x6 (background merah/blue) |
| **Ijazah Terakhir** | Fotokopi legalisir |
| **Transkrip Nilai** | Untuk fresh graduate |
| **Portofolio** | Screenshot / link project |
| **CV Terbaru** | Format ATS-friendly |
| **Surat Pengalaman Kerja** | Jika ada |
| **Bukti Pembayaran** | Sesuai skema sertifikasi |

### 5.2 Biaya Sertifikasi (Estimasi)

| Skema | Biaya (Perkiraan) |
|-------|-------------------|
| Junior Programmer | Rp 500.000 - 1.000.000 |
| Web Developer | Rp 1.000.000 - 2.000.000 |
| Senior Programmer | Rp 1.500.000 - 2.500.000 |
| Programmer (BNSP) | Rp 1.000.000 - 1.500.000 |

> 💡 Beberapa kampus/lembaga memberikan subsidi atau gratis untuk mahasiswa.

---

## 6. Latihan: Try Out Mini

### Petunjuk

Kerjakan soal berikut dalam **60 menit**. Catat waktu pengerjaan dan nilai akhir.

### Bagian A: Pilihan Ganda (10 soal, 30 menit)

1. HTTP status code 401 berarti...
   - A. OK
   - B. Not Found
   - C. Unauthorized
   - D. Internal Server Error

2. Perintah Git untuk melihat riwayat commit adalah...
   - A. `git status`
   - B. `git log`
   - C. `git show`
   - D. `git diff`

3. CSS Flexbox property `justify-content: center` digunakan untuk...
   - A. Meratakan item secara vertikal
   - B. Meratakan item secara horizontal
   - C. Mengatur jarak antar item
   - D. Membungkus item ke baris baru

4. SQL klausa yang digunakan untuk mengelompokkan data adalah...
   - A. ORDER BY
   - B. GROUP BY
   - C. HAVING
   - D. WHERE

5. Apa fungsi utama JSON Web Token (JWT)?
   - A. Enkripsi data
   - B. Autentikasi & otorisasi
   - C. Kompresi data
   - D. Caching request

### Bagian B: Essay (2 soal, 30 menit)

6. Jelaskan perbedaan antara **autentikasi** dan **otorisasi** dalam konteks aplikasi web. Berikan contoh implementasi masing-masing.

7. Diberikan kode berikut, identifikasi **3 masalah keamanan** dan berikan perbaikannya:

```javascript
app.get('/user', (req, res) => {
  const id = req.query.id;
  const query = `SELECT * FROM users WHERE id = ${id}`;
  db.query(query, (err, result) => {
    res.send(`<h1>${result.name}</h1>`);
  });
});
```

### Kunci Jawaban & Rubrik

| Soal | Jawaban | Poin |
|------|---------|------|
| 1 | C. Unauthorized | 10 |
| 2 | B. `git log` | 10 |
| 3 | B. Meratakan horizontal | 10 |
| 4 | B. GROUP BY | 10 |
| 5 | B. Autentikasi & otorisasi | 10 |
| 6 | Essay — lihat rubrik | 25 |
| 7 | Essay — lihat rubrik | 25 |
| **Total** | | **100** |

**Rubrik Essay:**
- Kelengkapan jawaban (0-10)
- Contoh konkret (0-8)
- Kejelasan penjelasan (0-7)

---

## Referensi

- [Contoh Soal Uji Kompetensi BNSP — LSP TI](https://lspti.or.id/contoh-soal)
- [HTTP Status Codes — MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Anki — Spaced Repetition](https://apps.ankiweb.net)
- [Pomodoro Technique](https://todoist.com/productivity-methods/pomodoro-technique)
