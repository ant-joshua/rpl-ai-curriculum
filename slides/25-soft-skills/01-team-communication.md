---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — <img src="https://images.pexels.com/photos/1181244/pexels-ph"
footer: "Sesi 01: Team Communication"
---

<!-- _class: title -->
# 25.1 Team Communication

## Daily Standup Format

Standup adalah ritual harian tim — maksimal 15 menit. Format standar:

1. **Apa yang udah dikerjakan kemarin?**
2. **Apa yang akan dikerjakan hari ini?**
3. **Ada blocker / hambatan?**

```
Contoh standup yang baik:
"Kemarin selesaiin endpoint user auth — PR udah di-review tinggal merge.
Hari ini mau lanjut integrasi payment gateway.
Blocker: belum dapet akses API key dari finance, udah chat tapi belum dibales."
```

```
Contoh standup yang kurang:
"Kemarin ngoding. Hari ini ngoding lagi. Ga ada masalah."
```

## Ngomong Teknis ke Non-Teknis

Jargon teknis bikin bingung non-developer (PM, client, stakeholder).

| ❌ Jangan | ✅ Ganti |
|-----------|----------|
| "Refactor codebase biar scalable" | "Bersihin kode biar fitur baru gampang ditambah" |
| "Migrate database" | "Pindahin data ke sistem baru — perlu waktu 2 hari" |
| "Fix technical debt" | "Perbaiki kode lama yang boros, biar aplikasi lebih cepat" |
| "Deploy ke staging" | "Uji coba dulu di server percobaan sebelum rilis" |

### Template: Jelaskan Issue Teknis ke Non-Teknis

```
Ada bug di sistem pembayaran yang bikin user gagal checkout
kalo pake kartu tertentu. Akar masalahnya ada di library lama
yang udah nggak diupdate. Solusi: kita upgrade library payment
dan fix kode yang nyambung. Estimasi: 2 hari.

Risiko kalo nggak di-fix:
- 10-15% transaksi gagal tiap bulan
- User complain dan churn
```

## Giving & Receiving Feedback

### SBI Framework (Situation — Behavior — Impact)

| Komponen | Contoh |
|----------|--------|
| **Situation** | "Di sprint review kemarin..." |
| **Behavior** | "...kamu interupsi presenter beberapa kali..." |
| **Impact** | "...jadinya presentasi jadi nggak fokus dan tim bingung." |

### Template: Ngasih Feedback Konstruktif

```
Hei [nama], aku mau kasih feedback soal [situasi].
Waktu [situasi spesifik], kamu [perilaku].
Efeknya [dampak ke tim/proyek].
Ke depannya, mungkin bisa [saran].
Gimana menurutmu?
```

### Nerima Feedback

1. **Dengerin dulu** — jangan defensif
2. **Ucapin terima kasih** — feedback itu hadiah
3. **Konfirmasi** — "Maksud kamu bagian X sama Y?"
4. **Evaluasi** — ambil yang berguna, buang yang nggak relevan
5. **Follow up** — tunjukkin improvement

## Conflict Resolution

### Template: Handle Konflik Teknis

```
1. Pisahin orang dari masalah
   - "Kita setuju endpoint-nya error. Sekarang gimana solusinya?"
2. Cari fakta, bukan opini
   - "Coba kita liat log-nya bareng"
3. Tawarkan opsi win-win
   - "Opsi A: refactor sekarang (1 hari). Opsi B: pake workaround (2 jam), refactor next sprint"
4. Minta keputusan dari tech lead / PM kalo buntu
```

## Async Communication Etiquette

Tim remote / hybrid — komunikasi nggak selalu real-time.

| Do ✅ | Don't ❌ |
|-------|----------|
| Tulis konteks & tujuan di awal pesan | Kirim "Halo" doang, tunggu balasan, baru tanya |
| Pake channel yang sesuai (#dev, #general) | Mention `@channel` atau `@everyone` untuk hal sepele |
| Kasih deadline di pertanyaan | Ekspektasi balasan instant jam 9 malam |
| Update status task di project board | Biarin orang nanya "udah selesai belum?" |
| Wrap up meeting di thread / channel | Simpan keputusan di kepala masing-masing |

### Template: Pesan Async yang Efektif

```
Subject: Butuh review PR #142 — Auth middleware

Halo tim, tolong review PR auth middleware yg udah aku push.
Ini blocking task payment gateway.
Deadline review: Jumat jam 15.00.

Link: [PR #142]

Thanks!
```

## Latihan

1. Tulis standup update untuk: "Kamu selesai ngerjain fitur search, ada bug di pagination, butuh bantuan FE buat ngecek query params"
2. Jelaskan issue "data race di goroutine" ke Project Manager non-teknis — maksimal 3 kalimat
3. Gunakan SBI framework: kasih feedback ke teman yang sering telat ngumpulin code review maksimal 1 emoji
4. Tulis pesan async: tanya ke senior engineer tentang error deployment — kasih konteks, log, dan langkah yang udah dicoba
