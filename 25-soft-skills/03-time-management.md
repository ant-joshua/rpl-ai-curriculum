# 25.3 Time Management

## Time Estimation

Developer terkenal jelek soal estimasi. Gunakan 3 skenario:

| Skenario | Definisi | Contoh (fitur login) |
|----------|----------|----------------------|
| **Optimistic** | Semuanya berjalan mulus | 4 jam |
| **Realistic** | Ada hambatan wajar | 1 hari |
| **Pessimistic** | Ada bug, revisi, meeting | 2 hari |

### Formula Estimasi

```
Estimasi = (Optimistic + 4×Realistic + Pessimistic) / 6

Contoh: (4 jam + 4×1 hari + 2 hari) / 6
       = (0.5 + 4 + 2) / 6
       = 6.5 / 6
       = ~1.1 hari
```

### Cara Ngomong Estimasi ke PM / Client

| ❌ Jangan | ✅ Lakukan |
|-----------|------------|
| "Selesai 2 jam" | "Estimasi 4 jam — termasuk testing & debugging" |
| "Hari ini kelar" | "Target hari ini, tapi aku selesainnya besok pagi" |
| Nggak kasih buffer | "Estimasi 3 hari + 1 hari buffer" |
| "Nggak tau" | "Aku analisa dulu, nanti aku kabarin sore ini" |

## Pomodoro Technique

Fokus 25 menit, break 5 menit — cocok buat deep work.

```
🎯 Sesi Pomodoro
─────────────────
1. Pilih 1 task
2. Timer 25 menit — fokus penuh
3. Break 5 menit — jalan, minum, stretch
4. Ulang 4x
5. Break panjang 15-30 menit

⚠️ Selama pomodoro: HP silent, notifikasi mati, jangan multitask
```

### Template: Jadwal Harian dengan Pomodoro

```
09:00 - 09:25  🍅 Pomodoro 1 — Nulis API endpoint
09:25 - 09:30  ☕ Break
09:30 - 09:55  🍅 Pomodoro 2 — Testing
09:55 - 10:00  ☕ Break
10:00 - 10:25  🍅 Pomodoro 3 — Debug bug pagination
10:25 - 10:30  ☕ Break
10:30 - 10:55  🍅 Pomodoro 4 — Code review
10:55 - 11:25  🎉 Break panjang — jalan-jalan
```

## Eisenhower Matrix

Prioritasin task berdasarkan urgency & importance.

```
                    URGENT              NOT URGENT
                ┌────────────────┬─────────────────┐
   IMPORTANT    │ DO FIRST       │ SCHEDULE        │
                │ Deadline hari  │ Perencanaan,     │
                │ ini           │ belajar skill    │
                │ Server down    │ baru, olahraga   │
                │ Bug production │                  │
                ├────────────────┼─────────────────┤
   NOT          │ DELEGATE       │ ELIMINATE        │
   IMPORTANT    │ Meeting        │ Social media     │
                │ nggak penting  │ scrolling        │
                │ Reply email    │ Ngikutin drama  │
                │ rutin          │ kantor           │
                └────────────────┴─────────────────┘
```

### Template: Mapping Task Harian

```
No | Task                  | Urgent | Important | Kuadran       | Action
───|───────────────────────|────────|───────────|───────────────|────────────────
1  | Bug production        | ✅     | ✅        | DO FIRST      | Kerjain sekarang
2  | Baca dokumentasi API  | ❌     | ✅        | SCHEDULE      | Jadwalin sore
3  | Ganti wallpaper Slack | ❌     | ❌        | ELIMINATE     | Skip aja
4  | Balas email klien A   | ✅     | ❌        | DELEGATE      | Forward ke support
```

## Deadline Negotiation

Ketika deadline nggak realistis — jangan diem aja sampe gagal.

### Template: Minta Perpanjangan Deadline

```
Hi [PM/client],

Aku udah analisa task ini dan estimasi realistis adalah [X hari],
sementara deadline saat ini [Y hari].

Alasan:
1. Ada dependency ke tim lain yang belum selesai
2. Testing butuh waktu tambahan
3. Scope lebih besar dari yang didiskusikan

Usulan:
- Deadline diundur ke [tanggal baru]
- Atau kita bisa shorten scope: deliver basic version dulu
  di [deadline awal], fitur tambahan nyusul seminggu setelahnya

Gimana menurutmu?
```

### Tips Negosiasi

1. **Jangan langsung bilang "nggak bisa"** — jelasin alasannya
2. **Tawarkan alternatif** — bukan cuma masalah
3. **Tunjukkin progress** — "udah 40%, tapi butuh ..."
4. **Pisahin scope** — core vs nice-to-have
5. **Minta bantuan** — "kalo ada 1 orang lagi, bisa 2 hari lebih cepat"

## Tracking Progress

### Template: Daily Log

```
Hari: Senin, 14 Apr 2025

✅ Selesai:
  - Fitur search — PR merged
  - Fix bug pagination
  - Review PR Andi

🔄 Progress:
  - Integrasi payment gateway (70%)
  - Nunggu API key dari finance

⏳ Next:
  - Testing payment flow
  - Meeting client jam 14.00

📊 Waktu: 6 jam kerja (3 pomodoro)
```

## Latihan

1. Kamu dikasih task "bikin fitur export PDF" — estimasi:
   - Optimistic: 1 hari
   - Realistic: 3 hari (libary baru, perlu belajar)
   - Pesimistic: 5 hari (ada bug render)
   - Hitung estimasi pake formula. Tulis respon ke PM
2. Prioritaskan task berikut pake Eisenhower Matrix:
   - A. Server error 500 di produksi
   - B. Baca artikel "10 tips React"
   - C. Meeting daily standup (rutin)
   - D. Belajar AWS certification
   - E. Ngecek Instagram
3. Deadlinemu 2 hari lagi untuk fitur checkout, tapi ternyata integrasi payment gateway butuh approval dari finance yang molor. Kamu baru selesai 40%. Tulis chat ke PM
4. Bikin jadwal harian pake Pomodoro untuk task: "nulis 3 unit test + benerin 2 bug + review PR teman"
