# Agile & Scrum — Latihan

## Level 1: Dasar

### Soal 1 — User Stories
Ubah requirement berikut menjadi **user stories** yang baik (format: Sebagai [peran], saya ingin [fitur] sehingga [manfaat]):

a) "Sistem harus bisa kirim notifikasi email ke user kalau order sudah dikirim"
b) "Admin bisa melihat grafik penjualan per bulan"
c) "User bisa reset password lewat email"

Tulis juga **acceptance criteria** menggunakan skenario Given-When-Then untuk story (b).

### Soal 2 — Scrum Roles & Events
Jelaskan perbedaan peran dan tanggung jawab dari tiga peran berikut dalam Scrum:

- Product Owner
- Scrum Master
- Developer

Untuk setiap peran, berikan **satu contoh kesalahan umum** yang sering dilakukan pemula.

### Soal 3 — Product Backlog
Urutkan item backlog berikut berdasarkan prioritas (1 = paling prioritas):

| Item | Deskripsi |
|------|-----------|
| A | Registrasi & login user |
| B | Dark mode theme |
| C | Checkout & pembayaran |
| D | Halaman landing company profile |
| E | Integrasi analytics Google |
| F | Upload avatar profile |

Beri alasan untuk posisi #1 dan posisi terakhir.

## Level 2: Intermediate

### Soal 4 — Sprint Planning
Tim Anda (4 developer) akan menjalankan sprint 2 minggu (10 hari kerja). Velocity berdasarkan 3 sprint terakhir: 18, 22, 20 story points.

**Backlog yang tersedia:**

| Story | Points | Dependencies |
|-------|--------|-------------|
| User profile page | 5 | - |
| Search produk | 8 | Elasticsearch setup |
| Wishlist CRUD | 5 | User profile page |
| API rate limiting | 3 | - |
| Notification settings | 5 | User profile page |
| Product recommendation | 13 | Search produk |
| Export CSV laporan | 3 | - |
| Onboarding screen | 5 | User profile page |

Tentukan:
1. Sprint goal yang realistis
2. Sprint backlog (cerita mana yang diambil dan total points)
3. Risiko apa yang perlu dimitigasi
4. Bagaimana jika ada developer yang cuti 2 hari? Adjust rencana.

### Soal 5 — Daily Standup Anti-Patterns
Seorang developer melaporkan di daily standup:

> "Kemarin saya ngoding fitur search, hari ini lanjut debugging, tidak ada blocker."

Identifikasi **3 anti-pattern** dari laporan di atas. Tulis ulang laporan yang ideal (singkat, fokus pada value, transparan).

### Soal 6 — Sprint Review & Retrospective
**Skenario**: Sprint selesai. Tim berhasil menyelesaikan 15 dari 20 story points yang direncanakan. Satu story gagal karena dependency tim lain tidak selesai.

Buat agenda untuk:
1. **Sprint Review** (30 menit) — siapa hadir? apa yang didemokan? bagaimana format feedback?
2. **Sprint Retrospective** (45 menit) — gunakan format **Start-Stop-Continue**

Untuk retro, tulis contoh konkret masing-masing kategori (Start, Stop, Continue) berdasarkan skenario di atas.

## Level 3: Challenge

### Soal 7 — Burndown Chart Analysis
Berikut data burndown sebuah sprint (10 hari, 30 story points):

| Day | Planned Remaining | Actual Remaining |
|-----|------------------|-----------------|
| 1   | 30               | 30              |
| 2   | 27               | 28              |
| 3   | 24               | 25              |
| 4   | 21               | 22              |
| 5   | 18               | 20              |
| 6   | 15               | 15              |
| 7   | 12               | 10              |
| 8   | 9                | 7               |
| 9   | 6                | 3               |
| 10  | 3                | 0               |

Analisis:
1. Plot burndown chart-nya (gambarkan)
2. Identifikasi pola: apakah tim under-promise? scope bertambah? ada bottleneck di tengah?
3. Rekomendasi untuk sprint berikutnya
4. Hitung velocity yang diprediksi untuk sprint depan

### Soal 8 — Scaling Scrum (LeSS / SAFe)
Perusahaan Anda berkembang dari 1 tim Scrum (5 orang) menjadi 3 tim (total 20 orang) mengerjakan produk yang sama.

Jelaskan bagaimana Anda akan mengadaptasi Scrum untuk skala ini:

1. **Framework mana** yang dipilih (LeSS, SAFe, atau Nexus)? Alasan.
2. **Struktur tim** — bagaimana membagi domain? feature-based atau component-based?
3. **Sprint alignment** — apakah semua tim pakai sprint yang sama? bagaimana mengelola dependensi antar tim?
4. **Artifact scaling** — product backlog tetap satu? atau per tim?
5. **Ceremony scaling** — bagaimana daily standup, review, retrospective untuk 3 tim?
6. **Integration** — bagaimana menjaga kode tetap terintegrasi tanpa konflik besar?
