# Modul 19: Technical Interview — Persiapan Kerja & Magang untuk Lulusan SMK RPL

**Target:** Siswa SMK RPL yang akan melamar kerja / magang di perusahaan IT.
**Durasi:** 1–2 minggu (6–12 jam).
**Tujuan:** Lulus sesi wawancara teknis dan non-teknis dengan percaya diri.

---

## 1. LeetCode Pattern Mastery

Wawancara coding menguji kemampuan memecahkan masalah — bukan hafalan. Kuasai **pola solusi** bukan kode mentah.

### 1.1 Sliding Window

**Gunakan saat:** Input array/string, cari subarray/substring optimal (maks/min/panjang tertentu).

**Pola kunci:**
- Fixed window — geser jendela ukuran tetap, catat nilai tiap posisi.
- Variable window — perluas `right`, ciutkan `left` saat kondisi rusak.

**Contoh soal:** *"Cari substring terpanjang tanpa karakter berulang."*

```python
def panjang_substring_unik(s: str) -> int:
    seen = set()
    left = max_len = 0
    for right, ch in enumerate(s):
        while ch in seen:
            seen.remove(s[left])
            left += 1
        seen.add(ch)
        max_len = max(max_len, right - left + 1)
    return max_len
```

### 1.2 Two Pointers

**Gunakan saat:** Array **sudah terurut** atau perlu pasangan elemen.

**Pola kunci:**
- Satu pointer dari kiri, satu dari kanan, bergerak ke tengah.
- Atau slow/fast dalam satu arah (dua pointer sama-sama maju).

**Contoh soal:** *"Cari dua angka dalam array terurut yang jumlahnya = target."*

```python
def dua_jumlah(arr, target):
    kiri, kanan = 0, len(arr) - 1
    while kiri < kanan:
        total = arr[kiri] + arr[kanan]
        if total == target:
            return [arr[kiri], arr[kanan]]
        elif total < target:
            kiri += 1
        else:
            kanan -= 1
    return []
```

### 1.3 Fast & Slow Pointer (Floyd's Algorithm)

**Gunakan saat:** Linked list — deteksi siklus, cari titik tengah.

**Pola kunci:**
- `slow` maju 1 langkah, `fast` maju 2 langkah.
- Jika bertemu → ada siklus. Untuk cari awal siklus, reset `slow` ke head.

**Contoh soal:** *"Deteksi apakah linked list memiliki cycle."*

```python
def ada_siklus(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
        if slow == fast:
            return True
    return False
```

### 1.4 BFS & DFS (Graph/Tree)

**Gunakan saat:** Pencarian jalur, level-order traversal, shortest path.

**Pola kunci:**
- **BFS:** Queue → level by level. Cocok untuk shortest path di graph tak berbobot.
- **DFS:** Stack (rekursif atau eksplisit). Cocok untuk semua kemungkinan jalur.

**Contoh BFS (binary tree level order):**

```python
from collections import deque

def level_order(root):
    if not root:
        return []
    hasil, q = [], deque([root])
    while q:
        level = []
        for _ in range(len(q)):
            node = q.popleft()
            level.append(node.val)
            if node.left:
                q.append(node.left)
            if node.right:
                q.append(node.right)
        hasil.append(level)
    return hasil
```

### 1.5 DP Basics (Dynamic Programming)

**Gunakan saat:** Soal meminta "cara terbanyak", "minimum/maximum", atau punya **overlapping subproblems**.

**Pola kunci:**
1. Tentukan **state** (biasanya index + parameter).
2. Buat **base case**.
3. Rumus **recurrence**.
4. Optimasi dengan memoization (top-down) atau tabel (bottom-up).

**Contoh soal:** *"Fibonacci ke-n."* (bottom-up)

```python
def fib(n):
    if n <= 1:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    return dp[n]
```

**Tips belajar:**
- Kerjakan soal **bertema sama** (hanya sliding window) sampai pola terasa alami.
- Gunakan **NeetCode 150** atau **Grind 75** — bukan LeetCode acak.
- Batasi waktu: 20–30 menit per soal. Lewat? Lihat solusi, pahami, ulangi 2 hari kemudian.

---

## 2. Portfolio Preparation

Portfolio = bukti konkret kemampuan teknis. Tanpa portofolio, CV hanyalah klaim.

### 2.1 GitHub Cleanup

- **Hapus repositori fork yang tidak disentuh.** Repositori kosong atau hasil fork tanpa modifikasi memberi kesan buruk.
- **Buat README untuk setiap proyek.** Format minimal:
  - Nama & deskripsi singkat.
  - Stack teknologi (ikon + nama).
  - Screenshot / GIF demo.
  - Cara menjalankan (instalasi, env vars).
  - Fitur utama (bullet points).
- **Kuasai `.gitignore`.** Jangan commit `node_modules/`, `.env`, `__pycache__/`.
- **Commit message rapi.** Gunakan format: `feat:`, `fix:`, `docs:`, `refactor:`.

### 2.2 README yang Menarik

README adalah halaman depan proyek. Isi wajib:

| Bagian | Fungsi |
|--------|--------|
| Judul & Badge | Status build, lisensi, versi |
| Demo (link / GIF) | Bukti aplikasi berjalan |
| Tech Stack | Bahasa, framework, database |
| Fitur | Daftar kemampuan utama |
| Instalasi | Clone → install → run |
| Kontribusi | Panduan open-source (opsional) |

**Contoh README singkat:**

```markdown
# Task Manager API

![Build](https://img.shields.io/badge/build-passing-brightgreen)

REST API manajemen tugas dengan Node.js + Express + PostgreSQL.

## Fitur
- CRUD tugas dengan deadline
- Autentikasi JWT
- Filter berdasarkan status (selesai/belum)

## Cara Pakai
```bash
git clone https://github.com/username/task-manager
cd task-manager
npm install
cp .env.example .env   # isi DATABASE_URL
npm run migrate
npm start
```
```

### 2.3 Live Demo

Usahakan setiap proyek memiliki **tautan yang bisa diakses**:
- **Frontend:** Vercel, Netlify, GitHub Pages.
- **Backend:** Render, Railway, Fly.io.
- **Database demo:** Gunakan seed data (jangan kosong).
- **API:** Dokumentasi via Swagger / Postman collection.

**Aturan emas:** Jika recruiter butuh 3 langkah untuk melihat demo, mereka sudah pindah ke kandidat lain.

---

## 3. System Design untuk Fresh Graduate

Wawancara system design untuk fresh grad berbeda dengan senior. Fokus pada **fondasi** bukan skalabilitas ribuan server.

### 3.1 Design URL Shortener (bit.ly clone)

**Fungsional:**
- Input URL panjang → output URL pendek (misal: `https://short.ly/abc123`).
- Redirect dari URL pendek ke URL asli.
- Hitung jumlah klik (opsional).

**Kerangka Jawaban:**

1. **Klariikasi kebutuhan:** "Berapa banyak URL baru per hari? Berapa lama URL disimpan? Apakah perlu analitik klik?"
2. **Estimasi:** 1 juta URL/hari, ukuran karakter per short code = 6–7.
3. **Skema DB:**
   - `urls` table: `id (PK)`, `long_url`, `short_code (UNIQUE)`, `created_at`, `click_count`.
4. **API:**
   - `POST /shorten { "url": "..." } → { "short_url": "..." }`
   - `GET /:short_code → 302 redirect`
5. **Generate short code:**
   - Hash (MD5/SHA256) ambil 7 karakter pertama → cek duplikat.
   - Atau Base62 encode counter (sederhana, terjamin unik).
6. **Redirect:** Baca DB → 302 ke long_url.

**Kenapa ini penting untuk fresh grad?** Soal ini menguji kemampuan **berpikir terstruktur** — bukan pengalaman sistem terdistribusi.

### 3.2 Design Chat App (WhatsApp sederhana)

**Fungsional:**
- Kirim pesan teks 1-on-1.
- Status online/offline.
- Riwayat chat.

**Kerangka Jawaban:**

1. **Clarify:** "Apakah ini chat 1-on-1 atau grup? Perlu enkripsi? Berapa banyak pengguna?"
2. **Skema DB:**
   - `users`: `id`, `username`, `online_status`
   - `messages`: `id`, `sender_id`, `receiver_id`, `content`, `timestamp`, `read`
3. **API:**
   - `POST /messages` — kirim pesan.
   - `GET /messages?with=<user_id>` — ambil riwayat.
4. **Real-time:** WebSocket (Socket.io) — koneksi persistent.
5. **Online status:**
   - User connect → flag online = true.
   - Disconnect / timeout 30 detik → online = false.

**Poin penting:** Bicara tentang **WebSocket vs Polling**. Sebut bahwa WebSocket lebih efisien untuk real-time.

---

## 4. Live Coding Simulation

Sesi live coding berbeda dari LeetCode di rumah. Pewawancara menilai **proses berpikir**, bukan hanya jawaban akhir.

### 4.1 Think Out Loud — Jangan Diam

Bicarakan setiap langkah keras-keras:

```
"Saya melihat ini soal sliding window karena... Saya akan coba perluas jendela
dari kiri ke kanan, simpan karakter yang sudah muncul di set.
Kalau ketemu duplikat, saya geser pointer kiri sampai duplikat hilang.
Kompleksitas O(n) — setiap karakter diproses maksimal dua kali."
```

**Yang dihindari:**
- Diam 5 menit lalu menulis kode panjang.
- Langsung nulis tanpa klarifikasi.
- Tidak menyebutkan kompleksitas waktu/ruang.

### 4.2 Ajukan Clarifying Questions

Sebelum menulis kode, tanyakan:

- "Apakah input bisa kosong?"
- "Apakah array sudah terurut?"
- "Berapa ukuran maksimal input?"
- "Apa yang harus dikembalikan jika tidak ditemukan?"

Ini menunjukkan **cara kerja profesional** — bukan sekadar programmer yang langsung coding.

### 4.3 Write Test First (TDD)

Mulai dengan contoh kasus uji:

```python
def test_panjang_substring_unik():
    assert panjang_substring_unik("abcabcbb") == 3  # "abc"
    assert panjang_substring_unik("bbbbb") == 1      # "b"
    assert panjang_substring_unik("") == 0            # edge case
    assert panjang_substring_unik("au") == 2          # "au"
    print("Semua test lulus")
```

Pewawancara akan terkesan karena kamu **memvalidasi kode sebelum minta review**.

### 4.4 Refactor & Optimasi

Setelah solusi berfungsi, tawarkan perbaikan:

- "Sekarang O(n²), bisa saya turunkan jadi O(n log n) dengan binary search."
- "Kodenya masih bisa diekstrak fungsinya biar lebih modular."
- "Tambahkan error handling untuk input tidak valid."

---

## 5. Behavioral Questions — Metode STAR

Wawancara perilaku (behavioral) sering dianggap remeh oleh fresh grad, padahal **bobotnya setara dengan coding**.

### 5.1 Struktur STAR

| Huruf | Arti | Contoh |
|-------|------|--------|
| **S**ituation | Konteks / latar belakang | "Dalam proyek kelompok akhir semester..." |
| **T**ask | Tanggung jawab spesifik | "Saya bertugas membangun REST API dan integrasi database." |
| **A**ction | Langkah konkret yang diambil | "Saya desain skema, buat endpoint dengan Express, tulis unit test." |
| **R**esult | Dampak / hasil (kuantitatif jika mungkin) | "API selesai 3 hari lebih cepat. Nilai proyek A." |

### 5.2 Contoh Penerapan STAR

**Pertanyaan:** "Ceritakan saat kamu menghadapi konflik dalam tim."

```
(S) Dalam proyek RPL semester 5, tim saya butuh fitur login dalam 1 minggu.
(T) Saya sebagai backend developer, sementara teman saya mau pakai library auth
yang belum pernah dipakai siapa pun.
(A) Saya usulkan vote tim dengan argumen: library baru butuh waktu belajar 2 hari,
sementara kita cuma punya 7 hari. Akhirnya tim sepakat pakai JWT yang sudah familiar.
(R) Fitur login selesai tepat waktu, semua anggota paham kode, dan aplikasi
lulus uji coba tanpa bug autentikasi.
```

### 5.3 Pertanyaan Behavioral Umum

| Pertanyaan | STAR Siapkan |
|-----------|-------------|
| "Ceritakan kegagalan terbesar." | Proyek gagal deadline → apa sebabnya → apa yang dipelajari |
| "Pernah bekerja di tim tidak aktif?" | Cara komunikasi ulang, ambil alih tugas, reschedule |
| "Kenapa kami harus hire kamu?" | Link ke portofolio + kemampuan teknis + semangat belajar |
| "Apa kelemahan terbesar?" | Pilih kelemahan nyata + langkah perbaikan (bukan "saya perfeksionis") |

**Latihan:** Rekam jawabanmu pakai HP. Putar ulang. Jika terdengar ragu, ulangi sampai natural.

---

## 6. Resume Tailoring

Satu CV tidak cocok untuk semua lamaran. **Sesuaikan setiap apply.**

### 6.1 Cara Tailor

1. Baca deskripsi pekerjaan (job description).
2. Ambil **kata kunci** — misal: "React", "Node.js", "REST API", "MySQL".
3. Pastikan kata kunci itu muncul di CV, portofolio, atau GitHub.
4. Jika proyekmu tidak relevan, **ubah deskripsi proyek** untuk menonjolkan skill yang diminta.

**Contoh:**
> Job minta "pengalaman PostgreSQL". Proyekmu pakai MySQL.
> Di CV tulis: "*Membangun sistem inventaris dengan database relasional (MySQL) — mencakup JOIN, indexing, normalisasi tabel.*"
> Ini bukti kamu paham RDBMS, tinggal beda flavor.

### 6.2 Hal yang Wajib di CV Fresh Grad RPL

| Elemen | Keterangan |
|--------|-----------|
| Nama & kontak | Email profesional, LinkedIn, GitHub |
| Pendidikan | SMK RPL (sebutkan tahun lulus) |
| Skill teknis | Bahasa, framework, tools (jangan klaim expert kalau baru 1x pakai) |
| Proyek | 2–3 proyek dengan link, deskripsi, stack |
| Sertifikasi | BNSP, Dicoding, Coursera — relevan dengan IT |
| Organisasi / Lomba | OSIS, paskibra, LKS — tunjukkan soft skill |

### 6.3 Kesalahan Fatal

- **Typo nama perusahaan.** Cek 3× sebelum kirim.
- **Email tidak profesional** (`cowokkeren22@...`). Buat baru: `nama.depan@...`
- **PDF vs DOCX.** Selalu kirim PDF — format tidak berantakan di device mana pun.
- **Menyebutkan skill tidak relevan** — misal: Microsoft Word untuk lamaran backend developer.

---

## Ringkasan Eksekutif

| Area | Target |
|------|--------|
| LeetCode | 50–80 soal merata di 5 pola di atas |
| Portfolio | 3 proyek dengan README + live demo |
| System Design | 2 skenario dikuasai (URL shortener + chat app) |
| Live Coding | Hafalkan kerangka TDD + clarifying questions |
| Behavioral | 5 jawaban STAR siap diceritakan |
| Resume | 1 CV master + turunan per lamaran |

> **"Kesempatan tidak datang dari keberuntungan — datang dari persiapan."**  
> Latihan rutin, evaluasi, perbaiki. Dalam 4–8 minggu, kamu siap bersaing dengan lulusan mana pun.

---

**Referensi:**

- NeetCode Roadmap (neetcode.io/roadmap)
- Cracking the Coding Interview — Gayle Laakmann McDowell
- System Design Interview — Alex Xu
- STAR Method Guide — themuse.com
- Canva / Overleaf untuk template CV
