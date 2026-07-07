# LMS untuk RPL AI Curriculum

Pertimbangan karena konten kurikulum kita **static** (Docsify) tapi **kaya** (188 slide, 57 PDF, quiz interaktif, progress tracker, challenges).

## Pilihan LMS

### 1. Moodle — 🏛️ Full LMS (Self-Hosted)
**Cocok:** Sekolah butuh sistem formal, absen, grading, forum, bank soal.
- ✅ Fitur paling lengkap: quiz engine, assignment, gradebook, forum, certificate
- ✅ H5P integrasi (drag & drop, interactive video)
- ✅ Bisa import konten markdown/custom
- ❌ **Bloat** — berat, UI ribet, perlu server dedicated
- ❌ Perlu migrasi konten (gak bisa langsung pake markdown kita)
- ❌ Maintenance besar (update security, plugin, caching)
- 💰 Gratis (self-host), tapi butuh server ~Rp300k/bln

### 2. Cloudflare Workers AI + Custom — 🚀 **RECOMMENDED**
**Cocok:** Pingin maksimalin konten existing tanpa rebuild ulang.
- Kita udah deploy di **Cloudflare Pages** (CDN global, gratis)
- Tambahin **Workers** buat autentikasi (KV/sessions)
- **D1** (SQLite edge) buat progress, grades, submissions
- **Queue** buat assignments
- **AI** buat auto-grading & AI tutor
- **Cocok banget** karena konten kita static — tinggal lapisin auth + tracking
- ✅ Gak perlu migrasi ulang konten
- ✅ Scale otomatis, gak bayar server idle
- ❌ Butuh develop custom (2-4 minggu full-stack)
- 💰 $0 - $5/bln (free tier 100k req/hari)

### 3. LearnDash / Tutor LMS (WordPress)
**Cocok:** Pingin cepet launching, familiar WordPress.
- ✅ Buat course, quiz, assignment gampang via UI
- ✅ Banyak addon (certificate, email, gamification)
- ✅ WooCommerce integration (jual course)
- ❌ Konten perlu di-copy-paste ulang
- ❌ Mungkin kena biaya lisensi (LearnDash $199/th)
- 💰 Hosting + plugin ~Rp500k+ setahun

### 4. Open edX / Tutor LMS
**Cocok:** Universitas/lembaga besar.
- Dipake Harvard, MIT scale
- Overkill buat kita — Infra complex

### 5. Canvas (Instructure) — Free tier
**Cocok:** Bisa gratis untuk sekolah.
- ✅ LMS modern, UI lebih enak dari Moodle
- ✅ Mobile app
- ❌ Konten migrasi manual
- ❌ Free tier terbatas

## Rekomendasi: Hybrid — Cloudflare First

```
┌─────────────────────────────────────────────────┐
│  TAHAP 1 (Sekarang) — Static Site               │
│  ├ syllabus.ant-joshua.my.id ← Pages ✅         │
│  ├ PDF Export ✅                                │
│  ├ Progress Tracker (localStorage) ✅            │
│  ├ Quiz plugin ✅                                │
│  └ AI Tutor (template) ✅                        │
├─────────────────────────────────────────────────┤
│  TAHAP 2 (2-4 minggu) — LMS Lite via Workers    │
│  ├ Auth siswa/guru via Google SSO               │
│  ├ Progress sync via Cloudflare D1              │
│  ├ Submission gateway (student uploads)         │
│  ├ Auto-grading untuk quiz + challenges         │
│  ├ Certificate generator (PDF)                  │
│  └ Admin dashboard (guru lihat progress kelas)  │
├─────────────────────────────────────────────────┤
│  TAHAP 3 (Bulan depan) — Advanced               │
│  ├ AI Tutor auto-grading feedback               │
│  ├ Gamification (badges, leaderboard)           │
│  ├ Discussion forum via Durable Objects         │
│  └ Mobile app (PWA + push notifications)        │
└─────────────────────────────────────────────────┘
```

**Kenapa bukan Moodle:**
- **Zero migration** — konten kita markdown, gak perlu di-import ke LMS proprietary format
- **Cost** — free tier Cloudflare cukup buat sekolah
- **Kustomisasi** — kita kontrol penuh, gak terbatas plugin
- **AI native** — gampang integrasi Mastra agent, auto-grading, AI tutor
- **Edge** — semua di CDN, loading <100ms, gak kaya Moodle yang berat

**Kesimpulan:** **Lapisin aja Cloudflare Pages yang sekarang + Workers auth + D1 tracking.** Ganti moodle/LearnDash kalo emang butuh fitur yang cuma jalan di WP.
