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

## Scope Creep

Scope creep = client minta fitur tambahan tanpa nambah budget/deadline.

### Kenali Tanda-tandanya

- "Tambahin kecil aja, nggak sampe 1 jam kok"
- "Sambil ngerjain, ini sekalian diubah ya?"
- "Kalo bisa sekalian fitur X juga"
- "Sederhana aja, tinggal tambah tombol"

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

## Expectation Management

Jangan over-promise. Better under-promise & over-deliver.

| ❌ Jangan | ✅ Lakukan |
|-----------|------------|
| "Selesai 1 hari aja." (tapi butuh 3 hari) | "Estimasi 3 hari, semoga bisa 2." |
| "Nggak ada masalah." (padahal ada blocker) | "Ada kendala kecil, lagi dicari solusinya." |
| "Fitur X ready minggu depan." (belum mulai) | "Minggu depan mulai fitur X, target rilis 2 minggu." |
| Nggak update sampe deadline | Update progress tiap 2-3 hari |

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

## Latihan

1. Client tiba-tiba minta fitur chat real-time di proyek toko online yang udah 80% jalan. Tulis respon sopan yang nolak request ini — kasih opsi
2. Tulis progress email: kamu telat 2 hari karena bug tak terduga, tapi mingdep selesai. Kasih update jujur ke client
3. Client bilang "kenapa kok lama? kan cuma tambah tombol?" — tulis balasan yang jelasin effort sebenarnya (backend + testing + QA)
4. Bikin proposal mini untuk project: landing page UMKM dengan portfolio online 3 halaman — deadline 1 minggu, budget Rp 2jt
