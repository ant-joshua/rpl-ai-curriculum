# 3. Mock Interview & Portfolio Finalization

> **Target:** Simulasi mock interview, finalisasi portfolio, strategi negosiasi & follow-up.

---

## Mock Interview Simulation

Mock interview = latihan wawancara palsu. Tujuannya: **hilangkan gugup, asah penyampaian.**

### Format Mock Interview

| Sesi | Durasi | Aktivitas |
|------|--------|-----------|
| Pembukaan | 2 menit | Perkenalan diri |
| Behavioral | 10 menit | 2-3 pertanyaan STAR |
| DSA Coding | 20 menit | 1 soal LeetCode medium |
| System Design | 15 menit | 1 pertanyaan設計 |
| Portfolio Walkthrough | 8 menit | Jelaskan proyek terbaik |
| Q&A / Penutup | 5 menit | Pertanyaan balik ke interviewer |

### Contoh Pertanyaan Mock Interview

**Behavioral:**
1. "Ceritakan tentang dirimu dalam 30 detik."
2. "Proyek apa yang paling menantang dan kenapa?"
3. "Pernah gagal deliver sesuatu? Apa yang terjadi?"
4. "Bagaimana cara kamu belajar teknologi baru?"
5. "Kenapa kamu tertarik sama posisi ini?"

**DSA Coding:**
1. "Cari pasangan angka yang jumlahnya target" (Two Pointers)
2. "Valid palindrome" (Two Pointers)
3. "Reverse linked list" (Iterative/Recursive)
4. "Binary search" (Divide & Conquer)
5. "Maximum subarray sum" (Kadane's Algorithm)

**System Design (Fresh Grad):**
1. "Design URL shortener"
2. "Design chat app sederhana"
3. "Design parking lot"
4. "Design todo API"
5. "Design rating/review system"

### Evaluasi Mock Interview

| Kriteria | Skor 1-5 | Catatan |
|----------|----------|---------|
| Clarity of speech | | |
| STAR structure | | |
| Coding correctness | | |
| Think out loud | | |
| Time management | | |
| Interaction with interviewer | | |

**Cara pakai:** Minta teman jadi interviewer. Rekam video. Evaluasi sendiri pakai tabel di atas. Ulangi sampai skor minimal 4 di semua kategori.

---

## Coding Challenge Strategy

### Flow Pengerjaan (10 Langkah)

```
1. Baca soal 2x — pahami input/output
2. Tanya clarifying questions
3. Buat contoh kasus (input → output)
4. Sebut brute force + kompleksitas
5. Brainstorm optimasi
6. Tulis pseudocode + minta feedback
7. Koding — syntax rapi, variable jelas
8. Test dengan contoh tadi
9. Test edge cases (kosong, besar, negatif)
10. Sebut kompleksitas + trade-off
```

### Common Mistakes

| Kesalahan | Solusi |
|-----------|--------|
| Langsung coding tanpa klarifikasi | Tanya dulu: "Input bisa kosong?" |
| Diam 5 menit | Paksa diri ngomong: "Saya lagi mikir..." |
| Lupa test case | Siapkan 2-3 contoh sebelum nulis | 
| Syntax error di live coding | Tulis pelan, test tiap baris |
| Tidak sebut kompleksitas | Akhiri dengan "O(n) time, O(1) space" |

### Contoh Live Coding Walkthrough

**Soal:** "Balikkan string. Input: 'hello' → Output: 'olleh'"

```
"Oke, saya baca soal. Input string, output string terbalik.
Clarify: Apakah boleh pakai built-in reverse? Boleh? Baik, saya coba dua pendekatan.

Pertama yang simpel: balik manual pakai two pointers.
Dua pointer — satu di kiri, satu di kanan, swap terus sampe ketemu.

Pseudocode:
  left = 0, right = len - 1
  while left < right:
    swap(s[left], s[right])
    left++, right--

Koding: (nulis)
  def balik_string(s):
      arr = list(s)
      kiri, kanan = 0, len(arr) - 1
      while kiri < kanan:
          arr[kiri], arr[kanan] = arr[kanan], arr[kiri]
          kiri += 1
          kanan -= 1
      return ''.join(arr)

Test: 'hello' → ['h','e','l','l','o'] → swap h/o → ... → 'olleh' ✅
Edge case: '' → return '' ✅
Edge case: 'a' → 'a' ✅

Kompleksitas: O(n) time, O(n) space (karena array baru).
Bisa O(1) space kalau inputnya mutable array (in-place).
```

---

## Portfolio Project Walkthrough

Di interview, kamu akan diminta **jelaškin salah satu proyek** secara detail.

### Struktur Walkthrough

| Bagian | Durasi | Isi |
|--------|--------|-----|
| Judul & tujuan | 30 detik | Nama proyek, kenapa dibuat |
| Tech stack | 30 detik | Bahasa, framework, database, deploy |
| Arsitektur | 2 menit | Diagram + alur data |
| Fitur utama | 1 menit | 2-3 fitur dengan detail kode |
| Tantangan | 1 menit | Bug/tantangan → solusi → hasil |
| Pelajaran | 30 detik | Yang dipelajari, yang akan diperbaiki |

### Contoh Walkthrough: Task Manager API

```
**Judul:** Task Manager API — REST API manajemen tugas.
**Kenapa:** Karena saya lihat banyak teman kesulitan tracking deadline tugas sekolah.

**Tech stack:** Node.js + Express + PostgreSQL + JWT + Railway (deploy).

**Arsitektur:** Client → REST API → Controller → Service → Repository → DB.
Alur: Login → JWT → CRUD task dengan deadline & kategori.

**Fitur utama:**
1. Autentikasi JWT — register/login, setiap request divalidasi.
2. CRUD task — create, read, update, delete dengan filter status & kategori.
3. Deadline reminder — cron job kirim notifikasi H-1 deadline.
   (point plus: ini fitur ekstra yang tidak diminta)

**Tantangan:** Waktu itu saya pakai bcrypt untuk hash password, tapi lupa
handle error saat email sudah terdaftar. Akhirnya nambah unique constraint
di DB + error handling middleware.

**Pelajaran:** Selalu validasi input sebelum simpan ke DB. Ke depannya
saya mau tambah unit test dengan Jest.
```

### Portfolio Final Checklist

- [ ] Semua README proyek lengkap (judul, stack, fitur, cara jalanin, screenshot)
- [ ] GitHub rapi — repositori fork/value dicleaned up
- [ ] Commit message pakai format: `feat:`, `fix:`, `docs:`
- [ ] `.gitignore` — tidak ada `node_modules/`, `.env`, `__pycache__/` tercommit
- [ ] Live demo bisa diakses (Vercel/Netlify/Railway)
- [ ] 3 proyek dengan stack berbeda (misal: REST API + React app + mobile)
- [ ] Project walkthrough siap diceritakan tanpa lihat catatan

---

## Negotiation Tips

Untuk fresh grad, gaji mungkin sudah fixed. Tapi kamu tetap bisa negosiasi **bukan-gaji**.

### Yang Bisa Dinegosiasi Fresh Grad

| Item | Cara Minta |
|------|-----------|
| **Gaji** | Riset gaji rata-rata (Glassdoor, LinkedIn). Minta 10-20% di atas. Alasan: "Saya percaya skill saya setara..." |
| **Tunjangan** | Transport, makan, internet — tanya apakah ada |
| **Training** | "Apakah ada budget untuk kursus/sertifikasi?" |
| **Perangkat** | Laptop, monitor — mintalah jika tidak disediakan |
| **Remote/Fleksibel** | "Berapa hari WFH per minggu?" |
| **Magang → Full-time** | "Apakah ada jalur konversi setelah magang?" |

### Cara Negosiasi yang Benar

```
"Terima kasih atas tawaran. Saya sangat antusias bergabung.
Sebelum saya tanda tangan, boleh tanya — apakah ada fleksibilitas
untuk [item]? Saya riset gaji rata-rata posisi ini di [kota]
adalah [angka]. Saya yakin skill saya [sebut 2 skill relevan]
bisa berkontribusi sesuai ekspektasi."
```

### Riset Gaji — Cara Dapetin Data

| Sumber | Cara Pakai |
|--------|-----------|
| **Glassdoor** | Cari "[posisi] [kota]" → liat salary range |
| **LinkedIn Salary** | Fitur LinkedIn Premium (trial gratis) |
| **Jobstreet / Glints** | Cek range gaji di lowongan serupa |
| **Tanya network** | Tanya senior/kenalan di industri — "Range gaji fresh grad backend?" |
| **Survey komunitas** | Grup Telegram / Discord developer Indonesia |

Contoh data gaji fresh grad RPL di Jakarta (2025 estimasi):

| Role | Junior (0-1 thn) | Mid (1-3 thn) |
|------|-----------------|---------------|
| Frontend React | 4-7 jt | 7-12 jt |
| Backend Node.js | 5-8 jt | 8-15 jt |
| Full-stack | 5-9 jt | 9-18 jt |
| Mobile (React Native) | 5-8 jt | 8-14 jt |

### Script Negosiasi Gaji Lengkap

**Situasi:** Ditawari 4.5 juta. Riset menunjukkan rata-rata 5.5 juta.

```
"Terima kasih banyak atas tawarannya, Pak/Bu. Saya sangat
antusias untuk bergabung dengan [Perusahaan].

Sebelum saya tanda tangan, saya mau tanya — apakah ada
fleksibilitas untuk range gaji? Saya sudah riset,
rata-rata posisi junior developer di Jakarta adalah
5-6 juta. Dengan skill saya di [skill 1] dan [skill 2],
saya yakin bisa berkontribusi sesuai ekspektasi tim.

Mungkin 5.5 juta bisa dipertimbangkan? Atau mungkin ada
kompensasi lain seperti training budget atau transport?
```

### Kalau Gaji Gak Bisa Naik — Alternatif

| Alternatif | Contoh Kalimat |
|-----------|---------------|
| **Signing bonus** | "Apakah ada signing bonus sekali bayar?" |
| **Review lebih awal** | "Bisa review gaji di bulan ke-6 instead of 12?" |
| **Training budget** | "Ada budget untuk kursus atau sertifikasi?" |
| **Perangkat** | "Apakah perusahaan menyediakan monitor eksternal?" |
| **WFH allowance** | "Ada budget untuk internet atau listrik?" |
| **Equity (startup)** | "Apakah ada opsi saham untuk karyawan?" |

### Jangan Lakukan Ini

| ❌ Jangan | ✅ Lakukan |
|-----------|-----------|
| "Saya dapat tawaran lebih tinggi di perusahaan lain" | "Saya riset gaji rata-rata posisi ini..." |
| Minta gaji muluk tanpa data | Bawa data konkret |
| Terima langsung tanpa baca kontrak | Minta waktu 1-2 hari |
| Negosiasi lewat telepon tanpa persiapan | Siapkan poin-poin dulu |

---

## Follow-Up Strategy

### Setelah Interview

| Waktu | Tindakan |
|-------|----------|
| **1 jam** | Kirim **thank you email** ke interviewer |
| **1 hari** | Catat pertanyaan yang diajukan — evaluasi jawaban |
| **3 hari** | Jika belum ada kabar, follow-up sopan |
| **1 minggu** | Jika tidak diterima, minta feedback |
| **2 minggu** | Lanjut apply perusahaan lain |

### Contoh Thank You Email

```
Subject: Terima kasih — [Nama Posisi] — [Namamu]

Halo [Nama Interviewer],

Terima kasih atas waktu interview hari ini. Saya makin
yakin kalau [Nama Perusahaan] adalah tempat yang tepat
buat saya berkembang.

Saya sangat tertarik dengan [sebut sesuatu dari interview
— misal: tech stack yang dipakai / budaya perusahaan].

Satu hal yang saya pikirkan setelah interview — [opsional:
tambahan jawaban / koreksi]. 

Semoga bisa bergabung!

Salam,
[Nama]
[LinkedIn]
[No. HP]
```

### Jika Diterima

1. Baca kontrak dengan teliti.
2. Tanyakan: gaji, tunjangan, jam kerja, probation period, aturan WFH.
3. Konfirmasi tanggal mulai.
4. Minta offer letter resmi (PDF).
5. Beri kabar ke perusahaan lain yang masih proses.

### Jika Tidak Diterima

1. Minta feedback spesifik: "Skill apa yang kurang?"
2. Jangan defensif — catat, evaluasi, perbaiki.
3. Tanya: "Apakah ada rekomendasi course/buku?"
4. apply ke perusahaan lain dengan perbaikan.
5. Coba lagi 6 bulan kemudian setelah improvement.

> **Penting:** Setiap penolakan adalah data. Gunakan untuk iterasi.

---

## Latihan

1. **Mock Interview Roleplay:** Cari teman (online/offline). Lakukan mock interview 30 menit pakai format di atas. Rekam. Evaluasi diri pakai tabel skor. Tulis 3 hal yang perlu diperbaiki.

2. **Project Walkthrough Script:** Pilih proyek terbaik di GitHub. Tulis script walkthrough 5 menit pakai struktur di atas. Rekam video (HP/laptop). Evaluasi: apakah terdengar jelas? Apakah terlalu cepat? Perbaiki sampai natural.

3. **Negosiasi Simulasi:** Cari 3 lowongan fresh grad di LinkedIn/Jobstreet. Catat gaji yang ditawarkan. Tulis script negosiasi untuk masing-masing (minta 10-20% lebih tinggi + alasan). Baca keras-keras.

4. **Follow-Up Email Draft:** Buat 3 template email:
   - Thank you email setelah interview
   - Follow-up email (3 hari setelah interview, belum ada kabar)
   - Feedback request email (setelah ditolak)
   
   Personalisasi untuk perusahaan fiktif bernama "TechIndo Startup".

5. **Negosiasi Roleplay:** Cari teman. Satu jadi interviewer yang nawarin gaji 4 juta, satu jadi kandidat. Lakukan negosiasi 5 menit. Rekam. Evaluasi: apa yang kurang percaya diri? Apa yang bagus? Tulis script perbaikan.

6. **Riset Gaji:** Buka Glassdoor / LinkedIn / Jobstreet. Cari 3 lowongan fresh grad developer. Catat: posisi, perusahaan, range gaji, lokasi. Hitung rata-rata. Tulis analisis: apakah gaji sesuai dengan skill yang diminta?

7. **Off-Platform Interview Prep:** Cari 1 perusahaan tech yang kamu incar. Riset: (a) produk mereka, (b) tech stack, (c) budaya perusahaan, (d) review karyawan di Glassdoor. Tulis 3 poin yang bakal kamu sebut kalo ditanya "Kenapa kamu mau kerja di sini?".

8. **Mock Interview with AI:** Pake tools AI (ChatGPT, Claude) buat simulasi mock interview. Minta AI jadi interviewer, jawab pertanyaan behavioral + coding + system design. Minta feedback skor 1-5 di akhir. Tulis hasil evaluasi.
