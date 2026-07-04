# 1.1 Design Thinking — Empathize, Define, Ideate

Design thinking adalah framework **problem-solving** berpusat pada manusia. Bukan cuma soal estetika — ini cara lo memahami masalah user sebelum nulis kode.

---

## Empathize — Ngerti User Dulu, Jangan Nebak

Empathize = riset. Tujuan: ngumpulin data tentang kebutuhan, frustrasi, dan perilaku user.

### User Research Methods

| Metode | Waktu | Cocok buat |
|--------|-------|------------|
| Wawancara (1-on-1) | 15-30 menit/orang | Dapet insight mendalam |
| Observasi (lihat user pake produk) | 1-2 jam | Lihat langsung pain point |
| Survey | 5-10 menit | Data kuantitatif, banyak responden |
| Contextual inquiry | 1 jam | Riset di lingkungan asli user |

### Empathy Map

Empathy map bantu lo bedain apa yang user bilang vs apa yang mereka lakuin.

```
┌──────────────────────────────┐
│        EMPATHY MAP           │
├──────────────┬───────────────┤
│   SAYS       │   DOES        │
│ "Saya males  │ Buka HP 50x   │
│  catat manual"│ sehari,      │
│              │ screenshoot   │
├──────────────┼───────────────┤
│   THINKS     │   FEELS       │
│ "Pasti ada   │ Frustrasi     │
│  cara lebih  │ kalau lupa    │
│  gampang"    │ catatan       │
└──────────────┴───────────────┘
```

**Tips wawancara:**
- Jangan tanya "Fitur apa yang kamu mau?" — user gak tau
- Tanya soal **masalah**: "Apa yang paling nyebelin dari cara lo sekarang?"
- Minta cerita spesifik: "Ceritain kapan terakhir lo lupa jadwal?"
- Record (izin dulu) biar gak perlu catat semua

---

## Define — Rangkum Masalahnya

Output define: **Problem statement** dan **User persona**.

### Problem Statement

Format: `[User] butuh [kebutuhan] karena [insight]`

Contoh:
- "Siswa butuh liat jadwal pelajaran offline karena sinyal di sekolah jelek."
- "Ibu rumah tangga butuh catat pengeluaran harian dengan cepat karena sibuk dan gampang lupa."
- "Anak kos butuh tracking tanggal bayar tagihan biar gak kena denda."

**⚠️ Jangan define solusi di tahap ini.** Cuma definisikan masalah. Kalau langsung mikir solusi, lo bakal bias.

### User Persona

Persona = profil fiktif yang mewakili user target. Element:

| Elemen | Contoh |
|--------|--------|
| Nama & Umur | Rina, 17 tahun |
| Pekerjaan | Siswa SMK RPL |
| Tujuan | Lulus dengan nilai bagus |
| Frustrasi | Sering ketinggalan info tugas karena notifikasi chat ketimbun |
| Tech skill | Medium (bisa pake HP, gak ngerti kode) |
| Quote | "Pengen ada aplikasi yang ngumpulin semua info tugas" |

Template persona minimal 5 elemen. Bikin 1-3 persona per proyek.

---

## Ideate — Kumpulin Ide, Sensor Diri Matiin

Tujuannya: dapet **sebanyak mungkin ide** tanpa nilai dulu.

### Brainstorming Rules

1. **Kuantitas > kualitas** — 50 ide jelek > 3 ide bagus
2. **No judgment** — gak ada ide bodoh di tahap ini
3. **Build on others** — "Yes, and..." bukan "Tapi..."
4. **Stay on topic** — fokus ke problem statement

### Crazy 8s

Lipat kertas A4 jadi 8 kotak. Setiap kotak diisi 1 ide dalam 1 menit. Total 8 ide dalam 8 menit.

```
┌──────────┬──────────┬──────────┬──────────┐
│ Ide 1    │ Ide 2    │ Ide 3    │ Ide 4    │
│ (1 menit)│ (1 menit)│ (1 menit)│ (1 menit)│
├──────────┼──────────┼──────────┼──────────┤
│ Ide 5    │ Ide 6    │ Ide 7    │ Ide 8    │
│ (1 menit)│ (1 menit)│ (1 menit)│ (1 menit)│
└──────────┴──────────┴──────────┴──────────┘
```

### Affinity Diagram

Setelah dapet banyak ide, kelompokkan berdasarkan tema:

| Tema Ide | Contoh Ide |
|----------|------------|
| Notifikasi | Push notif jadwal, reminder tagihan, alert tugas deadline |
| Pencatatan | Scan receipt, input manual, voice note |
| Visualisasi | Pie chart, bar chart, calendar view |

Abis itu voting: tiap orang dapet 3 dot sticker, tempel di ide favorit.

---

## Latihan

1. **Bikin empathy map** untuk teman sekelas. Wawancara 1 teman tentang masalah mereka belajar online. Isi 4 kuadran (Say, Do, Think, Feel). Tulis hasilnya dalam format markdown.

2. **Buat 3 problem statement** berbeda dari hasil empathy map di atas. Format: `[User] butuh [kebutuhan] karena [insight]`.

3. **Bikin user persona** untuk aplikasi catatan keuangan pribadi. Minimal 6 elemen (nama, umur, pekerjaan, tujuan, frustrasi, tech skill).

4. **Lakuin Crazy 8s** di kertas: 8 ide fitur dalam 8 menit untuk masalah "Siswa sering ketinggalan info tugas sekolah". Foto hasilnya, tulis 3 ide terbaik versi lo.
