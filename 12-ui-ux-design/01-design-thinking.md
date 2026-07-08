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

## User Research Methods — Mendalam

### Ethnographic Research

Observasi langsung di lingkungan asli user. Bukan lab — lo dateng ke tempat mereka.

| Metode | Durasi | Output |
|--------|--------|--------|
| Field visit | 2-4 jam | Foto, catatan perilaku, artefak |
| Diary study | 3-7 hari | Catatan harian user |
| Shadowing | 1 hari | Ikutin user seharian |

### Survey & Kuesioner

Buat dapet data kuantitatif dari banyak responden.

**Aturan survey:**
1. **Max 10 pertanyaan** — lebih dari itu orang malas
2. **Skala Likert** — 1-5 atau 1-7, jangan pake "ya/tidak" doang
3. **Satu ide per pertanyaan** — jangan "Apakah kamu suka fitur A dan B?"
4. **Pilot test** — cobain ke 2-3 orang sebelum sebar

**Tools:** Google Forms, Typeform, Tally.so

### Usability Testing

Tes produk lo ke user beneran. Beda sama wawancara — lo liat mereka *pake* produk.

| Aspek | Moderated | Unmoderated |
|-------|-----------|-------------|
| Ada fasilitator | ✅ | ❌ |
| Fleksibel | Bisa tanya follow-up | Kaku sesuai skrip |
| Biaya | Mahal (waktu orang) | Murah (tool otomatis) |
| Tools | Zoom,当面 | Maze, UserTesting |

**Skrip usability test:**
```
1. Perkenalan (2 menit) — "Halo, aku mau minta tolong tes aplikasi ini..."
2. Task (10-15 menit) — "Coba daftar akun baru." Jangan kasih petunjuk!
3. Follow-up (5 menit) — "Apa yang paling bikin bingung?"
4. Thank you (1 menit)
```

### Evaluasi Heuristic — Nielsen's 10

Cek desain pake 10 prinsip Nielsen tanpa perlu user:

| # | Heuristic | Ceklist |
|---|-----------|---------|
| 1 | Visibility of system status | Apakah user tau sistem lagi ngapain? (loading, sukses, error) |
| 2 | Match system & real world | Pake bahasa user, bukan jargon teknis |
| 3 | User control & freedom | Ada tombol "back", "cancel", "undo" |
| 4 | Consistency & standards | Tombol yang sama fungsi sama di semua halaman |
| 5 | Error prevention | Konfirmasi "Yakin hapus?" sebelum aksi destruktif |
| 6 | Recognition not recall | Jangan paksa user inget info dari halaman sebelumnya |
| 7 | Flexibility & efficiency | Shortcut untuk power user |
| 8 | Aesthetic & minimalist design | Gak ada elemen yang gak perlu |
| 9 | Help users recognize errors | Pesan error jelas: "Email tidak valid" bukan "Error #42" |
| 10 | Help & documentation | FAQ, tooltip, onboarding |

### User Journey Map

Visualisasi langkah-langkah user dari awal sampai akhir.

```
├─ Tahap: Discover ─┬─ Sign Up ─┬─ Create ─┬─ Share ─┤
│ Tujuan: Cari info  │ Daftar    │ Bikin     │ Publikasi│
│ Emosi: 😊🔍       │ 😤📝     │ 🤔🎨     │ 🎉🚀    │
│ Touchpoint: Iklan  │ Form      │ Editor    │ Preview  │
│ Pain: Loading lama  │ Validasi  │ Upload    │ Format   │
│                    │ error     │ lambat    │ rusak    │
└────────────────────┴───────────┴───────────┴──────────┘
```

---

## Validasi Ide — Jangan Langsung Bangun

Sebelum coding, validasi dulu apakah ide lo layak dikerjain.

### MVP (Minimum Viable Product)

Versi paling minimal dari ide lo yang masih *bisa dipake*.

| ❌ Bukan MVP | ✅ MVP |
|-------------|--------|
| Aplikasi dengan 20 fitur | 1 fitur inti yang solve masalah |
| Login, profile, notifikasi, chat, upload | Cuma search + list hasil |
| Design sempurna | Lo-fi aja, asal bisa dipake |

### Prototype Testing

Kasih prototype Figma ke 5 orang. Aturan:

1. **Jangan jelasin cara pake** — biar mereka coba sendiri
2. **Catat dimana mereka bingung** — itu yang perlu diperbaiki
3. **Satu task per tes** — jangan cobain semua fitur sekaligus
4. **5 user cukup** — Nielsen bilang 5 user udah nemuin 85% masalah

### Validasi dengan Data

| Metrik | Cara Ukur | Target |
|--------|-----------|--------|
| Task completion rate | Berapa % user berhasil selesaiin task | >80% |
| Time on task | Berapa detik yang dibutuhin | <2 menit untuk task simpel |
| Error rate | Berapa kali user salah klik/input | <3 error per sesi |
| SUS Score | System Usability Scale (10 pertanyaan) | >68 (rata-rata) |

---

## Latihan

1. **Bikin empathy map** untuk teman sekelas. Wawancara 1 teman tentang masalah mereka belajar online. Isi 4 kuadran (Say, Do, Think, Feel). Tulis hasilnya dalam format markdown.

2. **Buat 3 problem statement** berbeda dari hasil empathy map di atas. Format: `[User] butuh [kebutuhan] karena [insight]`.

3. **Bikin user persona** untuk aplikasi catatan keuangan pribadi. Minimal 6 elemen (nama, umur, pekerjaan, tujuan, frustrasi, tech skill).

4. **Lakuin Crazy 8s** di kertas: 8 ide fitur dalam 8 menit untuk masalah "Siswa sering ketinggalan info tugas sekolah". Foto hasilnya, tulis 3 ide terbaik versi lo.

5. **Usability test plan.** Tulis skrip usability test untuk aplikasi catatan keuangan. Tentukan: 3 task yang diuji, kriteria sukses, dan 5 pertanyaan follow-up. Format markdown.

6. **Heuristic evaluation.** Ambil 1 halaman website favorit lo. Evaluasi pake 10 prinsip Nielsen. Tulis 5 temuan — 3 yang udah bagus, 2 yang perlu diperbaiki. Sertakan screenshot.

7. **Bikin user journey map.** Untuk skenario "order makanan online", buat journey map dengan 5 tahap (Discover, Order, Pay, Wait, Eat). Tulis: tujuan, emosi, touchpoint, pain point per tahap.
