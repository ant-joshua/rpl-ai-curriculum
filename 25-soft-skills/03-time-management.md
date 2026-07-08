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

## OKR & KPI — Goal Setting Framework

OKR (Objectives & Key Results) dan KPI (Key Performance Indicators) adalah framework populer untuk goal setting di perusahaan tech.

### OKR — Objectives & Key Results

**Objective:** Tujuan kualitatif, inspiratif, menantang.
**Key Results:** Ukuran kuantitatif untuk mencapai Objective.

```
Objective: Membuat aplikasi RPL jadi portofolio standar industri
├── KR 1: Merilis 3 fitur utama (auth, CRUD, AI) dalam 4 sprint
├── KR 2: Mendapat skor review teknis ≥ 80% dari mentor
├── KR 3: Deploy ke production dengan uptime 99%
└── KR 4: Dokumentasi README + API doc lengkap

Objective: Meningkatkan produktivitas tim
├── KR 1: Menyelesaikan 90% sprint backlog tiap sprint
├── KR 2: Cycle time ≤ 3 hari per task
├── KR 3: Code review selesai dalam ≤ 24 jam
└── KR 4: 0 bug production yang lolos ke staging
```

### Cara Bikin OKR yang Baik

| ❌ Buruk | ✅ Baik |
|----------|---------|
| "Bikin fitur login" (task, bukan objective) | "User bisa login dengan mudah & aman" |
| "Meningkatkan kualitas kode" (gak terukur) | "Coverage test ≥ 80%, sonar quality gate passed" |
| "Belajar React" (gak ada batas waktu) | "Bisa deploy React app dengan 3 halaman dalam 2 minggu" |
| "Ngerjain 10 task" (gak inspiratif) | "Tim deliver 10 task berkualitas tanpa bug major" |

### KPI — Key Performance Indicators

KPI adalah metrik berkelanjutan — bukan target sprint.

| Area | KPI | Target |
|------|-----|--------|
| **Productivity** | Story point selesai per sprint | ≥ 20 SP |
| **Quality** | Bug per sprint | ≤ 3 |
| **Timeliness** | On-time delivery | ≥ 90% task |
| **Code quality** | Code coverage | ≥ 70% |
| **Collaboration** | PR review time | ≤ 1 hari |
| **Velocity** | Cycle time | ≤ 3 hari |

### Contoh OKR untuk Developer

```
Objective: Menjadi full-stack developer yang capable
├── KR 1: Membangun 1 full-stack app (React + Express + DB) dalam 1 bulan
├── KR 2: Menulis 10+ unit test dengan coverage ≥ 60%
├── KR 3: Deploy app ke production & dapatkan 10+ user nyata
└── KR 4: Dokumentasi tech stack & arsitektur di blog pribadi

Objective: Berkontribusi ke tim & project
├── KR 1: Code review 20+ PR teman dengan feedback bermakna
├── KR 2: Menulis dokumentasi untuk 3 modul yang belum di-doc
├── KR 3: Mentor 1 junior developer selama 1 bulan
└── KR 4: Present 1 tech talk internal tentang stack yang dipelajari
```

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

### Weekly Review Template

```
## Weekly Review — Minggu 2 Apr 2025

### ✅ Selesai
- [fitur/progress]

### ⏳ Belum selesai
- [alasan]

### 🎯 Next week priority
1. [priority 1]
2. [priority 2]
3. [priority 3]

### 📊 OKR Check
- KR 1: [progress %]
- KR 2: [progress %]

### 🚧 Blocker
- [apa yang menghambat?]

### 💡 Lessons learned
- [apa yang bisa lebih baik?]
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
5. **Weekly review** — Tulis template daily log untuk 1 minggu kerja. Setiap hari: 3 task selesai, progress, blocker. Akhir minggu: refleksi — apa yang berjalan baik, apa yang perlu diperbaiki
6. **Personal OKR** — Buat OKR pribadi untuk 1 bulan ke depan. 1 Objective (misal: "Jadi lebih produktif dalam ngoding"), 3 Key Results (misal: KR1: Selesaikan 4 modul tutorial, KR2: Kurangi waktu scrolling HP dari 3 jam ke 1 jam/hari, KR3: Push code minimal 5 hari dalam seminggu)
7. **Deadline negotiation roleplay** — Kamu dikasih deadline 3 hari untuk fitur yang estimasi realistisnya 5 hari. Tulis chat ke PM yang: (1) jelasin kenapa 3 hari ga realistis, (2) tawarkan 2 opsi: perpanjang deadline atau pangkas scope

---

## Personal OKR/KPI — Goal Setting buat Developer

OKR (Objectives and Key Results) framework populer di Google, Spotify, Gojek. Bisa dipake untuk goal pribadi.

### Struktur OKR

```
Objective: Tujuan inspiratif, agak ambisius
├── Key Result 1: Ukuran keberhasilan (harus terukur)
├── Key Result 2: Ukuran keberhasilan
└── Key Result 3: Ukuran keberhasilan
```

### Contoh OKR Pribadi

```
O: Jadi full-stack developer yang bisa deploy end-to-end
├── KR1: Selesaikan 3 full-stack project (CRUD + auth + deploy)
├── KR2: Dapet 5 kontribusi ke open source
└── KR3: Bisa deploy app pake Docker + VPS tanpa google

O: Bangun personal branding sebagai developer
├── KR1: Tulis 4 artikel teknis di Dev.to
├── KR2: Update GitHub profile + pin 3 repo terbaik
└── KR3: Dapet 100 followers di LinkedIn

O: Tingkatin kualitas kode
├── KR1: Kurangi bug production dari 5/bulan ke 1/bulan
├── KR2: Coverage test minimal 60%
└── KR3: Ikut code review minimal 10 PR teman
```

### Weekly Check-in Template

```text
## Week [X] Check-in

Objective: [tulis objective lo minggu ini]

Progress:
✅ [KR] — apa yang udah selesai
🔄 [KR] — progress X%
❌ [KR] — belum mulai / blocker

Key learning minggu ini:
- [apa yang lo pelajari]

Blockers:
- [apa yang bikin lo stuck]

Plan next week:
- [task prioritas]
```

### KPI vs OKR

| Aspek | KPI | OKR |
|-------|-----|-----|
| Fokus | Monitoring performance | Mendorong improvement |
| Target | Realistis, harus tercapai | Ambisius, 70% tercapai udah bagus |
| Frekuensi | Bulanan / kuartalan | Kuartalan |
| Contoh | "100% task selesai tepat waktu" | "Kurangi cycle time dari 5 hari ke 2 hari" |
| Sanksi | Kalo gak capai kena evaluasi | Kalo gak capai, evaluasi proses |

---

## Mentorship — Cari & Jadi Mentor

### Kenapa Butuh Mentor?

| Benefit | Dampak |
|---------|--------|
| Hemat waktu belajar | Mentor udah pernah ngalamin error yang sama |
| Feedback real-time | Kode lo di-review sama yang lebih pengalaman |
| Networking | Koneksi ke industri |
| Accountability | Mentor ngepush lo buat konsisten |
| Career advice | Tau jalur karir yang cocok |

### Cara Cari Mentor

```text
1. LinkedIn — cari senior engineer, kirim pesan sopan
2. Komunitas — Telegram grup dev, Discord, meetup
3. Tempat kerja / magang — senior di kantor
4. Online — Twitter/X: follow & engage dengan dev terkenal
5. Open source — review PR, tanya di issue/forum
```

### Template: First Message ke Mentor

```text
Halo Kak [nama],

Saya [nama], siswa SMK jurusan RPL. Saya lihat profile Kakak
di LinkedIn dan kagum sama perjalanan karirnya.

Saya lagi belajar [topik, misal: React + TypeScript] untuk proyek
akhir. Boleh minta saran? Kalo berkenan, saya mau tanya:
[A] [pertanyaan spesifik]
[B] [pertanyaan spesifik]

Makasih banyak sebelumnya 🙏
```

### Jadi Mentor buat Junior

Mentor bukan cuma senior — lo juga bisa mentoring adik kelas / temen yang baru belajar.

| Sebagai Mentor | Tips |
|----------------|------|
| Jangan kasih jawaban | Ajari cara cari jawaban |
| Review kode, bukan orang | "Bagian ini bisa pakai map() instead of for loop" |
| Sabar | Mereka belum tau yang lo tau |
| Share failure | Ceritain error lo dulu — bikin mereka nyaman |
| Follow up | Tanya progress seminggu sekali |

### Mentor-Mentee Contract (Informal)

```text
## Mentor-Mentee Agreement

Mentor: [nama]
Mentee: [nama]
Durasi: 1 bulan (bisa diperpanjang)

Commitment mentee:
- Siapin pertanyaan sebelum session
- Kerjain task yang udah disepakati
- Catat & implementasi feedback

Commitment mentor:
- 1 session (30 menit) per minggu
- Review kode maks 24 jam
- Jujur & supportive

Goal: [apa yang mau dicapai dalam 1 bulan]
```
5. **OKR** — Bikin 1 Objective dengan 4 Key Results untuk goal: "Menyelesaikan proyek akhir RPL dengan nilai A"
6. **KPI** — Bikin dashboard KPI untuk tim 4 orang yang ngerjain proyek selama 4 sprint. Minimal 4 metrik
7. **Weekly Review** — Isi template weekly review untuk minggu ini (real atau simulasi). Refleksi apa yang berjalan baik dan apa yang perlu diperbaiki
