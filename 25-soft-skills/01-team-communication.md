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

## Public Speaking untuk Developer

Bicara di depan umum — skill yang jarang dilatih tapi krusial buat developer.

### Struktur Presentasi Teknis

```
1. **Hook** (30 detik) — Masalah / pertanyaan yang relate
2. **Problem** (1 menit) — Kenapa ini penting?
3. **Solution** (3 menit) — Demo / kode / arsitektur
4. **Key takeaway** (30 detik) — 1 hal yang harus diingat
```

### Tips Public Speaking

| ❌ Jangan | ✅ Lakukan |
|-----------|------------|
| Baca slide dari layar | Cerita, jangan baca |
| Pake jargon berat | Analogi sederhana |
| Minta maaf "maaf ya saya gugup" | Terima gugup sebagai energi |
| Slide penuh teks | Slide visual, poin aja |
| Jawab "ga tau" lalu diam | "Saya catat, nanti saya follow up" |

### Demo Code yang Efektif

1. **Prepare** — siapin environment, jangan ngoding live tanpa persiapan
2. **Zoom in** — perbesar font terminal/editor biar kelihatan
3. **Struktur** — jelasin "sebelum" dan "sesudah" dulu
4. **Fallback** — siapin screenshot/video kalo demo gagal
5. **Fokus** — demo 1 fitur, jangan semua

## Technical Writing

Dokumentasi yang baik = debug time yang lebih singkat.

### Kenapa Nulis Dokumentasi?

| Benefit | Dampak |
|---------|--------|
| Hemat waktu tanya ke senior | "Cek dokumentasi aja" |
| Onboarding lebih cepat | Anggota baru langsung paham |
| Mental clarity | Nulis = paham lebih dalam |
| Portfolio | Dokumentasi = bukti lo ngerti |

### Format README Minimal

```markdown
# Nama Proyek

Deskripsi: [1-2 kalimat apa ini dan masalah apa yang diselesaikan]

## Tech Stack
- Backend: Express + TypeScript
- Database: PostgreSQL + Prisma
- Frontend: React + Tailwind
- AI: Mastra

## Installation

\`\`\`bash
git clone https://github.com/user/project.git
cd project
npm install
cp .env.example .env  # isi environment variables
npm run dev
\`\`\`

## Environment Variables
| Variable | Default | Description |
|----------|---------|-------------|
| DATABASE_URL | - | PostgreSQL connection string |
| JWT_SECRET | - | Secret key for JWT tokens |
| PORT | 3001 | API server port |

## API Documentation

### \`GET /api/health\`
Health check endpoint.
Response: \`{ "status": "ok" }\`

### \`POST /api/auth/login\`
Login user.
Request body: \`{ "email": string, "password": string }\`
Response: \`{ "token": string, "user": { id, email } }\`

## Deployment
- Backend: Railway (\`railway up\`)
- Frontend: Vercel (\`vercel --prod\`)
```

### Teknik Nulis Dokumentasi

1. **Target reader** — tulis untuk junior yang baru pertama lihat project
2. **Copy-paste ready** — semua command bisa langsung dicopy
3. **Error section** — catat error umum dan solusinya
4. **Update regularly** — dokumentasi usang = gak ada dokumentasi
5. **Screenshot** — tambah gambar untuk flow yang kompleks

## Async Communication untuk Remote Work

Tim remote / hybrid — komunikasi nggak selalu real-time.

### Prinsip Async

| Do ✅ | Don't ❌ |
|-------|----------|
| Tulis konteks & tujuan di awal pesan | Kirim "Halo" doang, tunggu balasan, baru tanya |
| Pake channel yang sesuai (#dev, #general) | Mention `@channel` atau `@everyone` untuk hal sepele |
| Kasih deadline di pertanyaan | Ekspektasi balasan instant jam 9 malam |
| Update status task di project board | Biarin orang nanya "udah selesai belum?" |
| Wrap up meeting di thread / channel | Simpan keputusan di kepala masing-masing |
| Pake thread untuk diskusi lanjutan | Balas di channel utama bikin spam |

### Template: Pesan Async yang Efektif

```
Subject: Butuh review PR #142 — Auth middleware

Halo tim, tolong review PR auth middleware yg udah aku push.
Ini blocking task payment gateway.
Deadline review: Jumat jam 15.00.

Link: [PR #142]
Context: ini middleware buat verifikasi JWT token, dipake di semua endpoint /api/*

Thanks!
```

### Tools Pendukung Async

| Tools | Fungsi | Best Practice |
|-------|--------|---------------|
| Slack / Discord | Chat | Pake thread, jangan ping @channel |
| Notion / Confluence | Dokumentasi | Tulis decision log |
| Linear / Jira | Task tracking | Update status minimal tiap hari |
| Loom | Video recording | Record demo pendek statt meeting |
| GitHub Issues | Bug tracking | Tulis langkah reproduksi |

## Meeting Facilitation

Developer benci meeting yang gak efektif. Bantu tim lo dengan meeting yang efisien.

### Sebelum Meeting

```
Checklist meeting efektif:
✅ Ada agenda jelas — kirim minimal 24 jam sebelumnya
✅ Ada tujuan — "decision" atau "brainstorm" atau "info sharing"?
✅ Durasi realistis — 30 menit maks, bukan 1 jam
✅ Peserta perlu — undang orang yang perlu doang
✅ Pre-read — kirim materi biar peserta baca dulu
```

### Selama Meeting

| ❌ Gak Efektif | ✅ Efektif |
|----------------|------------|
| "Gimana pendapat kalian?" (vague) | "Opsi A atau B? Vote 2 menit" |
| Diskusi melenceng | "Itu menarik, kita parkir dulu — lanjut ke agenda" |
| Satu orang dominan | "Menurut [nama yang diem] gimana?" |
| Gak ada notulen | Satu orang catat decision + action items |
| Meeting molor | "Kita tinggal 5 menit, simpulin yuk" |

### Setelah Meeting

Kirim **meeting notes** maksimal 2 jam setelah meeting:

```
## Meeting Notes — [Judul Meeting]
Tanggal: [tanggal]
Hadir: [nama-nama]

### Keputusan
1. [keputusan 1]
2. [keputusan 2]

### Action Items
- [ ] @siapa: apa — deadline kapan
- [ ] @siapa: apa — deadline kapan

### Next Meeting
[kalau ada]
```

### Meeting yang Bisa Diganti Async

| Meeting | Ganti Dengan |
|---------|-------------|
| Status update mingguan | Update di Notion / Linear |
| Bug triage | GitHub Issues + label |
| Feedback kecil | Loom video / chat async |
| Brainstorm kecil | Figma / Miro board async |

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

## Latihan

1. Tulis standup update untuk: "Kamu selesai ngerjain fitur search, ada bug di pagination, butuh bantuan FE buat ngecek query params"
2. Jelaskan issue "data race di goroutine" ke Project Manager non-teknis — maksimal 3 kalimat
3. Gunakan SBI framework: kasih feedback ke teman yang sering telat ngumpulin code review maksimal 1 emoji
4. Tulis pesan async: tanya ke senior engineer tentang error deployment — kasih konteks, log, dan langkah yang udah dicoba
5. **Public Speaking** — Bikin outline 5 menit presentasi tentang proyek terakhirmu. Pake struktur: Hook → Problem → Solution → Takeaway
6. **Technical Writing** — Tulis README untuk proyek dummy. Minimal: deskripsi, instalasi, environment variables, contoh API call
7. **Meeting Facilitation** — Tulis agenda meeting untuk "diskusi tech stack proyek baru". Waktu 30 menit, 5 partisipan. 
   Include: tujuan, pre-read materials, dan keputusan yang perlu diambil

