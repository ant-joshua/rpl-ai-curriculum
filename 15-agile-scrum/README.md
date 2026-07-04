# Modul 15: Agile & Scrum untuk Proyek Tim Kelas

> **Target:** Siswa SMK RPL — sudah tahu `git push` dasar, belum pernah kerja tim pakai workflow terstruktur.
> **Durasi:** 2–3 pertemuan (6–9 JP)
> **Tujuan:** Tim bisa jalan sendiri pakai Scrum + Git flow tanpa mikromanage dosen.

---

## Daftar Isi

1. [Agile vs Waterfall](#1-agile-vs-waterfall)
2. [Apa itu Scrum?](#2-apa-itu-scrum)
3. [Peran Scrum (Roles)](#3-peran-scrum-roles)
4. [Artifak Scrum](#4-artifak-scrum)
5. [Upacara Scrum (Ceremonies)](#5-upacara-scrum-ceremonies)
6. [Git Flow untuk Proyek Kelas](#6-git-flow-untuk-proyek-kelas)
7. [Trunk-based Development](#7-trunk-based-development)
8. [Template Pull Request](#8-template-pull-request)
9. [Budaya Code Review](#9-budaya-code-review)
10. [Template Daily Standup](#10-template-daily-standup)
11. [Checklist Sprint Planning](#11-checklist-sprint-planning)
12. [Contoh Alur Lengkap](#12-contoh-alur-lengkap)

---

## 1. Agile vs Waterfall

| Waterfall | Agile |
|---|---|
| Rencana semua di awal | Rencana bertahap, bisa berubah |
| User lihat hasil di akhir | User lihat hasil tiap 1–2 minggu |
| Error ketemu pas tahap akhir | Error ketemu cepat tiap sprint |
| Dokumen tebal | Dokumen secukupnya, kode jalan |
| Cocok untuk proyek besar & pasti | Cocok untuk proyek yang banyak berubah |

**Waterfall** = model air terjun. Langkahnya: Analisis → Desain → Implementasi → Testing → Maintenance. Kalau ada error di desain, ketemunya pas testing — sakitnya di akhir.

**Agile** = lincah. Kerja dalam **siklus pendek** (sprint). Fitur dikerjain sedikit demi sedikit, langsung demo ke user, langsung perbaiki feedback.

> **Kenapa Agile cocok untuk siswa?** Deadline tugas kuliah fleksibel. Dosen berubah pikiran. Tim belum pengalaman — mendeh semua di awal itu omong kosong.

---

## 2. Apa itu Scrum?

Scrum adalah **kerangka kerja Agile** yang paling populer. Bukan metode, bukan aturan kaku — tapi **mainan yang tinggal pakai**.

### Pilar Scrum

1. **Transparency** — Semua orang tau apa yang dikerjakan
2. **Inspection** — Sering cek hasil kerja
3. **Adaptation** — Sesuaikan rencana kalau melenceng

### Prinsip Singkat

- Sprint: 1–2 minggu
- Tiap sprint hasilkan **Increment** (produk yang bisa dipakai)
- Ada 3 peran, 4 upacara, 3 artifak

---

## 3. Peran Scrum (Roles)

### Product Owner (PO) — "Suara User"

**Tugas:**
- Tulis **User Story** (kebutuhan fitur dari sisi user)
- Urutkan prioritas di **Product Backlog**
- Jelaskan "kenapa" fitur ini penting
- Terima / tolak hasil sprint

**Di kelas:** Satu orang jadi PO. Bisa dosen atau siswa yang paling ngerti kebutuhan proyek. PO bukan manager — PO tidak suruh-suruh tim cara ngerjain.

### Scrum Master (SM) — "Pelindung Tim"

**Tugas:**
- Pastikan Scrum jalan benar
- Hapus hambatan (blocker) tim
- Fasilitasi meeting (standup, planning, review, retro)
- Bukan ketua tim — bukan bos

**Di kelas:** SM bisa bergilir tiap sprint. SM tidak perlu jago coding. Cukup peduli sama proses tim.

### Developer (Dev) — "Tukang Kode"

**Tugas:**
- Memilih task sendiri (self-assign)
- Ngerjain task → selesai di standup
- Tes kode sendiri
- Bertanggung jawab bareng

**Di kelas:** Semua anggota tim sisanya. Semua Dev setara — tidak ada "programmer senior" dan "anak gambar".

> **Aturan emas:** PO bilang "APA", SM jagain "BAGAIMANA", Dev kerjain "siapa yang ngapain".

---

## 4. Artifak Scrum

### Product Backlog

Daftar semua fitur yang **mungkin** dikerjakan. Hidup — terus berubah. Diurutkan dari paling penting ke paling tidak penting.

Format:
```
[PRIORITAS] [TIPE] [JUDUL]
P1 - FEATURE - Login Google
P2 - FEATURE - Export PDF
P3 - BUG - Tombol simpan double click error
```

**User Story** adalah unit backlog:
```
Sebagai [pengguna], saya ingin [fitur] agar [alasan].
```

Contoh:
```
Sebagai siswa, saya ingin login pakai Google agar tidak perlu daftar ulang.
```

### Sprint Backlog

Task-task dari Product Backlog yang **diambil untuk sprint ini**. Dibreakdown jadi subtask ~4–16 jam.

Contoh breakdown:
```
FEATURE: Login Google
  [] [4 jam] Setup OAuth Google Console
  [] [6 jam] Buat halaman login (tombol Google)
  [] [2 jam] Test login dengan akun dummy
```

### Increment

Hasil sprint yang **selesai dan bisa dipakai**. Tiap sprint harus ngasih increment yang berfungsi — walau cuma 1 halaman.

> **Syarat Increment:** Kode sudah di-review, sudah di-merge ke branch utama, sudah jalan di lokal.

---

## 5. Upacara Scrum (Ceremonies)

### Sprint Planning (Awal Sprint) — Maks 2 jam

1. PO paparkan prioritas Product Backlog
2. Tim estimasi effort (pakai story point / jam)
3. Tim pilih task yang masuk Sprint Backlog
4. Breakdown task jadi subtask
5. Tentukan **Sprint Goal** (kalimat: "Sprint ini kita buat fitur login dan profile")

**Output:** Sprint Backlog + Sprint Goal.

### Daily Standup (Tiap Hari) — 15 menit, berdiri

Tiap orang jawab 3 pertanyaan:

1. **Apa yang saya kerjakan kemarin?**
2. **Apa yang akan saya kerjakan hari ini?**
3. **Apa hambatan saya?**

Duduk dilarang — biar singkat. Muter-muter, bukan laporan ke SM tapi komitmen ke tim.

> **Aturan:** Jangan bahas solusi di standup. Bahas setelah standup (di scrumming session).

### Sprint Review (Akhir Sprint) — Maks 1 jam

1. Tim demo hasil kerja ke PO / dosen
2. PO terima atau tolak fitur
3. Diskusi: apa yang mau diubah?
4. Product Backlog diperbarui

**Bukan presentasi slide.** Langsung buka kode / aplikasi.

### Sprint Retrospective (Setelah Review) — Maks 45 menit

Tim evaluasi dirinya sendiri:

- **Start** — Apa yang harus mulai dilakukan?
- **Stop** — Apa yang harus dihentikan?
- **Continue** — Apa yang sudah bagus, teruskan?

**Output:** 1–2 aksi konkret untuk sprint berikutnya.

> **Golden rule retro:** Blame tidak ada. Semua bicara tentang **proses**, bukan orang.

---

## 6. Git Flow untuk Proyek Kelas

Versi sederhana Git Flow — cukup untuk proyek SMK.

### Struktur Branch

```
main ── develop ── feature/login ── feature/profile
  │                        │              │
  │                        └── merge ─────┘
  │                              │
  └───── release/v1.0 ──────────┘
              │
  hotfix/fix-typo ──┘
```

### Aturan Main

| Branch | Fungsi | Siapa |
|---|---|---|
| `main` | Kode siap rilis. Dilindungi — **tidak boleh push langsung**. | Hanya SM/lead yang merge |
| `develop` | Integrasi fitur. Semua fitur merge ke sini. | Semua dev |
| `feature/*` | Ngerjain 1 fitur. Branch dari develop, merge balik ke develop. | 1–2 dev |
| `release/v*` | Persiapan rilis. Bug fix minor, ganti versi. | SM |
| `hotfix/*` | Perbaikan urgent di main. Branch dari main, merge ke main & develop. | 1 dev |

### Alur Kerja Sehari-hari

```bash
# 1. Ambil task dari Sprint Backlog
# 2. Buat branch fitur
git checkout develop
git pull origin develop
git checkout -b feature/nama-fitur

# 3. Kerjakan... coding...
# 4. Commit sering (tiap selesai fungsi kecil)
git add .
git commit -m "feat: tambah form login"
git commit -m "feat: validasi email"

# 5. Push & buat PR
git push origin feature/nama-fitur
# Buka GitHub/GitLab → Create Pull Request ke develop

# 6. Minta review ke teman
# 7. Setelah disetujui → merge
# 8. Hapus branch fitur
git branch -d feature/nama-fitur
```

### Convention Commit

```
feat:     fitur baru
fix:      perbaikan bug
docs:     perubahan dokumentasi
style:    format, spasi, koma (tidak ubah logika)
refactor: ubah kode tanpa ubah fungsi
test:     tambah test
chore:    update dependency, config
```

Contoh:
```
feat: tambah form registrasi
fix: login error kalau email null
docs: update README setup
```

---

## 7. Trunk-based Development

Alternatif untuk Git Flow — **lebih sederhana**, cocok tim kecil (2–4 orang).

### Aturan

1. Semua orang commit ke `main` langsung — **tapi wajib branch pendek**.
2. Branch hidup maksimal 2 hari.
3. Tiap commit harus kecil & selesai.
4. Wajib feature flag untuk fitur setengah jadi.

### Kapan pakai Git Flow vs Trunk-based?

| Situasi | Pakai |
|---|---|
| Tim ≥4 orang, butuh rilis terstruktur | Git Flow |
| Tim 2–3 orang, dosen minta demo tiap minggu | Trunk-based |
| Ada rilis versi berbeda (v1, v2) | Git Flow |
| Semua fitur langsung masuk produksi | Trunk-based |

**Rekomendasi untuk SMK:** Pakai **Git Flow** dulu. Trunk-based butuh disiplin testing yang tinggi.

---

## 8. Template Pull Request

Buat file `PULL_REQUEST_TEMPLATE.md` di root repo (.github/).

```markdown
## Deskripsi

Apa yang diubah di PR ini? Kenapa?

## Related Issue

Closes #[nomor-issue]

## Tipe Perubahan

- [ ] feat: fitur baru
- [ ] fix: perbaikan bug
- [ ] docs: dokumentasi
- [ ] refactor: restruktur kode

## Screenshot (jika ada)

## Checklist

- [ ] Kode sudah di-test manual
- [ ] Tidak ada error di console
- [ ] Sudah minta review minimal 1 teman
- [ ] Branch sudah update dengan develop/main

## Catatan Reviewer

Apa yang perlu diperhatiin khusus?
```

---

## 9. Budaya Code Review

Bukan untuk menjatuhkan — untuk **belajar bareng**.

### Aturan Dasar

1. **Review kode, bukan orang.** "Fungsi ini kurang handle error" — bukan "kamu lupa".
2. **Jangan approve kalau belum paham.** Tanya dulu.
3. **Gunakan komentar konstruktif.**
   - ❌ "Ini jelek."
   - ✅ "Saran: pakai `map()` biar lebih singkat."
4. **Author wajib merespon.** Kalau setuju → perbaiki. Kalau tidak setuju → jelaskan.
5. **Jangan biarkan PR mengendap.** Review ≤ 1×24 jam.
6. **Jangan ego — kode kamu bukan anakmu.** Kalau ada saran lebih baik, terima.

### Checklist Reviewer

```
□ Kode jalan? Coba checkout & run.
□ Tidak ada typo?
□ Nama variabel jelas?
□ Ada magic number? (angka ajaib tanpa penjelasan)
□ Ada error yang tidak di-handle?
□ Sesuai convention commit?
```

---

## 10. Template Daily Standup

Bisa pakai chat grup (Discord/WhatsApp) atau langsung lisan.

### Format Chat Standup

```
**Nama:** [nama anggota]
**Kemarin:** [fitur/commit yang sudah selesai]
**Hari ini:** [yang akan dikerjakan]
**Hambatan:** [error, bingung, nunggu review]
```

**Contoh real:**
> **Nama:** Budi
> **Kemarin:** Selesai halaman login + validasi form
> **Hari ini:** Integrasi API login
> **Hambatan:** Endpoint login belum siap dari Ani — nunggu PR di-merge

### Aturan

- Kirim sebelum jam 10 pagi.
- Kalau ada hambatan, SM wajib bantu setelah standup.
- Tidak perlu chat balasan panjang. Cukup "noted" atau "siap bantu".

---

## 11. Checklist Sprint Planning

Gunakan ini tiap awal sprint.

### Persiapan

```
□ Product Backlog sudah di-update PO
□ User story sudah jelas kriterianya
□ Tim sudah tau kapasitas (berapa jam per minggu)
```

### Eksekusi

```
□ PO jelaskan 3–5 prioritas teratas
□ Tim tanya klarifikasi
□ Tim estimasi (pilih: story point / jam)
□ Tim pilih task untuk sprint ini
□ Task di-breakdown jadi subtask ≤16 jam
□ Sprint Goal ditulis & ditempel
□ Sprint Backlog siap di Trello/Project Board
```

### Cek Sprint Goal yang Baik

| Kriteria | Contoh ✅ | Contoh ❌ |
|---|---|---|
| Spesifik | "Buat halaman login & register" | "Bikin auth" |
| Terukur | "3 halaman selesai" | "Banyak fitur" |
| Realistis | "5 task untuk 4 orang, 2 minggu" | "20 task untuk 3 orang, 1 minggu" |

---

## 12. Contoh Alur Lengkap

### Minggu 1: Sprint 1

| Hari | Aktivitas |
|---|---|
| Senin | Sprint Planning — tim ambil 3 fitur: login, register, landing page |
| Selasa | Daily — Budi kerjain form login, Ani setup database |
| Rabu | Daily — semua progress, hambatan: Ani nunggu review Budi |
| Kamis | Daily — review selesai, merge feature/login ke develop |
| Jumat | Daily — fitur register selesai. Sprint Review besok. |
| Sabtu | Sprint Review + Retro. PO terima 2 fitur, 1 ditolak (landing page belum responsif). |

### Minggu 2: Sprint 2

| Hari | Aktivitas |
|---|---|
| Senin | Planning — ambil: responsive landing page, dashboard user, profile |
| ... | (lanjut siklus yang sama) |

### Workflow per Task

```
1. Ambil task dari Sprint Backlog → assign ke diri sendiri
2. Buat branch: feature/nama-fitur (dari develop)
3. Coding + commit kecil-kecil
4. Push → buat PR ke develop
5. Tag reviewer di chat "tolong review PR#5"
6. Review → perbaiki → approve
7. Merge ke develop
8. Hapus branch fitur
9. Update status task di board
```

---

## Referensi

- [Scrum Guide (2020)](https://scrumguides.org/)
- [Atlassian: Git Flow vs Trunk-based](https://www.atlassian.com/continuous-delivery/continuous-integration/trunk-based-development)
- [Conventional Commits](https://www.conventionalcommits.org/)
- Contoh template PR: `.github/PULL_REQUEST_TEMPLATE.md`

---

> **Pesan penutup:** Scrum bukan tentang meeting — tentang **transparansi, inspeksi, dan adaptasi**. Git flow bukan tentang branch — tentang **kolaborasi yang rapi**. Kalau timmu cuma 2 orang, cukup standup 5 menit dan trunk-based. Yang penting: **komunikasi jalan, kode selesai, semua belajar.**
