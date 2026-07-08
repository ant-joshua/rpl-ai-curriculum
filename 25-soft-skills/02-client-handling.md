# 25.2 Client Handling

## Client Meeting Prep

Setiap meeting dengan client harus prepare:

1. **Agenda** — kirim 24 jam sebelumnya
2. **Status update** — apa yang selesai, apa yang on progress
3. **Demo / screenshot** — tunjukkin, bukan cuma cerita
4. **Pertanyaan** — butuh klarifikasi apa?
5. **Next steps** — apa yang harus dikerjain setelah meeting

### Template: Agenda Meeting Client

```
Subject: Meeting Mingguan — Project Dashboard

Hi [client],

Agenda besok (30 menit):
1. Demo progress fitur report minggu ini (5 menit)
2. Feedback UI dashboard halaman utama (10 menit)
3. Klarifikasi requirement fitur export (10 menit)
4. Next steps & jadwal (5 menit)

Link Zoom: [link]
```

### Template: Meeting Notes

```
## Meeting: Progress Dashboard — 12 Apr 2025

Hadir: Budi (dev), Andi (PM), Client A

### Demo Report
- ✅ Grafik penjualan selesai
- ⏳ Filter tanggal — masih dikerjain
- ❌ Export CSV — nunggu data dari API

### Feedback
- Warna chart dicocokin sama brand Guideline
- Tombol download pindah ke kanan atas

### Action Items
- [ ] Budi: fix warna chart — EOD 13 Apr
- [ ] Client: kirim brand Guidelines — 13 Apr
- [ ] Andi: reschedule meeting next week ke Rabu
```

## Remote Work — Client Communication

Banyak client sekarang kerja remote. Butuh adaptasi cara komunikasi.

### Prinsip Async Client Communication

```
1. Over-communicate — kirim update rutin, jangan nunggu ditanya
2. Dokumen keputusan — tulis semua keputusan di shared doc
3. Screen recording — kirim Loom video untuk demo statt meeting
4. Shared dashboard — Notion / Trello / Linear biar client bisa lihat progress
5. Timezone aware — hormati beda waktu, kasih deadline realistis
```

### Template: Weekly Async Update

```
Subject: [Project] Weekly Update — Minggu 3

Hi [client],

Ringkasan minggu ini:

✅ Selesai
- Halaman dashboard — bisa lihat grafik penjualan
- Filter tanggal — on progress, 70%

⏳ Sedang dikerjakan
- Export CSV — estimasi selesai Jumat

❌ Blocker
- Integrasi payment — nunggu API key dari finance

📊 Progress: 65% (on track)

📹 Demo video: [link loom]

Best,
Budi
```

### Handling Timezone Differences

| Situasi | Solusi |
|---------|--------|
| Client di zona waktu beda 8+ jam | Tentukan "overlap window" 2-3 jam sehari |
| Butuh jawaban urgent | Tulis channel prioritas (WhatsApp untuk urgent, email untuk normal) |
| Meeting sulit dijadwalin | Rotate waktu meeting — bergantian enak/gak enak |
| Async feedback | Kirim pertanyaan 24 jam sebelum deadline biar client ada waktu |

## Scope Creep

Scope creep = client minta fitur tambahan tanpa nambah budget/deadline.

### Kenali Tanda-tandanya

- "Tambahin kecil aja, nggak sampe 1 jam kok"
- "Sambil ngerjain, ini sekalian diubah ya?"
- "Kalo bisa sekalian fitur X juga"
- "Sederhana aja, tinggal tambah tombol"
- "Ini mah cuma ubah dikit di config"

### Template: Menolak Request dengan Sopan

```
Mantap idenya, itu bisa nambah value banget buat produk.
Sayangnya fitur ini di luar scope yang udah kita sepakati.

Ada 2 opsi:
Opsi A: Kita masukin ke next phase / sprint berikutnya.
         Biayanya bakal nambah [estimasi waktu/price].
Opsi B: Kalo mau jalan bulan ini, ada [feature Y] yang bisa
         kita tunda dulu. Setuju?

Mana yang lebih cocok?
```

### Prinsip Nolak Request

1. **Validasi dulu** — "Ide bagus!" — jangan langsung nolak mentah
2. **Kaitkan ke scope** — "Ini di luar kontrak awal"
3. **Kasih opsi** — bukan cuma "nggak bisa", tapi "bisa, tapi..."
4. **Hitung biaya** — waktu = uang. Tunjukkin trade-off
5. **Dokumentasi** — tulis perubahan scope di change request formal

### Template: Change Request Form

```
## Change Request
No: CR-001
Tanggal: [tanggal]
Diminta oleh: [client]

### Deskripsi Perubahan
[fitur tambahan yang diminta]

### Alasan
[kenapa fitur ini diperlukan]

### Impact Analysis
- Tambahan waktu: [X hari]
- Tambahan biaya: [Rp Y]
- Fitur terdampak: [fitur lain yang perlu disesuaikan]
- Risiko: [keterlambatan, bug, dll]

### Approval
[ ] Disetujui — client
[ ] Disetujui — tim
```

## Expectation Management

Jangan over-promise. Better under-promise & over-deliver.

| ❌ Jangan | ✅ Lakukan |
|-----------|------------|
| "Selesai 1 hari aja." (tapi butuh 3 hari) | "Estimasi 3 hari, semoga bisa 2." |
| "Nggak ada masalah." (padahal ada blocker) | "Ada kendala kecil, lagi dicari solusinya." |
| "Fitur X ready minggu depan." (belum mulai) | "Minggu depan mulai fitur X, target rilis 2 minggu." |
| Nggak update sampe deadline | Update progress tiap 2-3 hari |
| "Selesai 100%" (padahal belum di-test) | "Selesai coding, lagi testing" |

### Progress Communication Matrix

| Situasi | Pesan | Channel | Frekuensi |
|---------|-------|---------|-----------|
| On track | "Progress sesuai rencana" | Email | Mingguan |
| Ahead | "Lebih cepat dari target" | Chat | Boleh share |
| Behind | "Ada delay X hari karena Y" | Email/Voice | Segera |
| Blocker | "Butuh bantuan client untuk Z" | Chat urgent | Segera |
| Selesai | "Fitur X ready di staging" | Email + link | Segera |

## Email Etiquette

### Template: Progress Email ke Client

```
Subject: Update Progress — Project Dashboard (13 Apr)

Hi [client],

Summary progress minggu ini:
✅ Grafik penjualan — selesai, tinggal nunggu approval
✅ Filter tanggal — on progress, 70%
⏳ Export CSV — estimasi selesai Jumat
❌ Integrasi payment gateway — blocked, nunggu API key dari finance

Blocker: API key payment dari finance belum terbit.
Estimasi setelah key terbit: 2 hari untuk integrasi + testing

Next: demo lanjutan hari Rabu jam 14.00.

Best,
Budi
```

### Template: Follow Up Setelah Meeting

```
Subject: Follow Up — Meeting Dashboard 12 Apr

Hi [client],

Terima kasih buat meeting tadi. Berikut ringkasan & action items:

Yang udah disepakati:
1. Warna chart disesuaikan dengan brand guideline
2. Tombol export pindah ke kanan atas
3. Next meeting: Rabu, 19 Apr jam 14.00

Action dari client:
- Kirim brand guideline PDF ke email ini

Action dari kami:
- Fix warna chart — selesai besok
- Siapin demo filter tanggal

Kalo ada tambahan, kabarin aja.

Best,
Budi
```

### Email Do's and Don'ts

| ❌ Jangan | ✅ Lakukan |
|-----------|------------|
| Reply all untuk hal internal | BCC untuk mailing list besar |
| Subject kosong atau "Update" | Subject jelas: "[Project] Update — 13 Apr" |
| Kirim attachment besar 20MB | Link Google Drive / cloud |
| Balas "Ok" — gak ada konteks | Balas pake informasi yang dibutuhkan |
| Forward thread panjang tanpa komentar | Tulis ringkasan + apa yang perlu dibaca |

## Proposal Freelance

### Template: Proposal Singkat ke Client

```
## Proposal — Aplikasi POS untuk Toko ABC

### Latar Belakang
Toko ABC butuh sistem kasir digital buat ganti catatan manual.

### Fitur Utama
- Input barang & harga
- Cetak struk otomatis
- Laporan penjualan harian

### Timeline
| Tahap | Estimasi |
|-------|----------|
| Riset & desain | 3 hari |
| Development | 10 hari |
| Testing & deploy | 3 hari |
| Total | 16 hari |

### Biaya
Rp 5.000.000 (termasuk hosting 1 tahun)

### Kenapa Pilih Saya?
- Udah bikin 3 sistem POS sebelumnya
- Siap maintenance 1 bulan gratis

---

Tertarik? Balas email ini buat diskusi lebih lanjut.
```

### Struktur Proposal Profesional

```
1. **Ringkasan Eksekutif** (2-3 kalimat)
2. **Latar Belakang** — masalah client
3. **Solusi** — fitur & teknologi
4. **Timeline** — tahapan + estimasi
5. **Biaya** — breakdown harga
6. **Mengapa Kami** — portofolio relevan
7. **Testimonial / Referensi** (kalo ada)
8. **Syarat & Ketentuan** — scope, revisi, pembayaran
```

## Latihan

1. Client tiba-tiba minta fitur chat real-time di proyek toko online yang udah 80% jalan. Tulis respon sopan yang nolak request ini — kasih opsi
2. Tulis progress email: kamu telat 2 hari karena bug tak terduga, tapi mingdep selesai. Kasih update jujur ke client
3. Client bilang "kenapa kok lama? kan cuma tambah tombol?" — tulis balasan yang jelasin effort sebenarnya (backend + testing + QA)
4. Bikin proposal mini untuk project: landing page UMKM dengan portfolio online 3 halaman — deadline 1 minggu, budget Rp 2jt
5. **Remote Async** — Client di US (beda 12 jam) minta update tiap hari. Tulis template async update yang bisa dikirim tiap sore tanpa meeting
6. **Scope Creep** — Client minta fitur "tambahin export PDF" setelah deal cuma export CSV. Tulis change request resmi dengan estimasi 2 hari tambahan
7. **Meeting Facilitation** — Bikin agenda meeting kickoff untuk proyek baru dengan client. Include: tujuan, durasi, list pertanyaan yang harus dijawab
