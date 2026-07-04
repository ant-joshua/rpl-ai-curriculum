# Modul 18: AI Prompt Engineering untuk Developer RPL

> **Level:** 🛠️ Intermediate  
> **Jam:** 4 (2 sesi × 2 jam)  
> **Prasyarat:** Pengalaman coding di bahasa apapun (PHP/JS/TS)  
> **Output:** Prompt library + Mastra prompt template  

> **Target:** SMK RPL — siswa yang udah pakai ChatGPT buat nyontek coding.  
> **Filosofi:** Bukan anti-AI. Tapi AI itu alat, bukan pengganti otak. Lo yang koding, AI yang bantu. Bukan sebaliknya.

---

## Tujuan Pembelajaran

Setelah modul ini, kamu bisa:
- Bedain teknik prompt zero-shot, few-shot, chain-of-thought, role prompting
- Nulis prompt efektif untuk coding, debugging, dan dokumentasi
- Pake structured output (JSON mode) buat hasil konsisten
- Improve prompt secara iteratif
- Generate kode, test, dan dokumentasi dengan AI
- Implement Mastra prompt templates di project
- Kelola versi prompt dan terapkan etika penggunaan AI

---

## Materi

| Sesi | Topik | File |
|------|-------|------|
| 1 | Prompt Techniques — zero-shot, few-shot, chain-of-thought, role prompting, structured output, iterative refinement | [01-prompt-techniques.md](01-prompt-techniques.md) |
| 2 | Prompt for Code & Production — code gen, unit test, API doc, error explain, code review, Mastra templates, prompt versioning, ethics | [02-prompt-code-production.md](02-prompt-code-production.md) |

---

## Output Akhir Modul

> **Prompt Library + Mastra Prompt Template** — kumpulan prompt reusable dan template Mastra untuk berbagai skenario coding.

---

## AI Prompt Exercises

Sepanjang modul, latihan pake AI:
- "Bandingin output zero-shot vs few-shot untuk task yang sama"
- "Refine prompt sampe hasilnya sesuai"
- "Generate test case dari deskripsi fungsi"
- "Bikin prompt template Mastra untuk code review"

---

## 1. Kenapa AI Mentah Berbahaya

Realita: lo buka ChatGPT, ketik "buatin website crud php", copy paste, lolos tugas. Sekarang lo lulus SMK — lo nggak bisa ngapa-ngapain sendiri. Selamat datang di era kompetisi ketat, lo punya 0 skill.

**Masalah besarnya:**

- **Lo nggak belajar debugging.** Pas error muncul di production, ChatGPT nggak bisa lo panggil.
- **Lo nggak paham arsitektur.** Lo tahu kode jalan — tapi kenapa jalan, berapa biaya server, gimana scaling-nya? Nol.
- **Plagiarisme itu gampang terdeteksi.** Guru/penguji udah paham pola AI. Kode lo bakal kecium dari 1 kilometer.
- **Kode AI sering ngaco.** Hallucination, security hole, dependency usang. Lo nggak bisa bedain mana yang aman dan mana yang bom waktu.

**Aturan emas:** Jangan pernah pake kode dari AI yang lo nggak paham setiap barisnya. Kalau lo masih bingung, lo suruh AI jelasin dulu sampe lo ngerti. Baru lo merge kode itu.

Ini bukan tentang "jangan pake AI". Ini tentang **jadi developer yang pake AI, bukan kontraktor yang nge-prompt doang**.

---

## 2. Prompt Patterns untuk Coding

Ada 6 pola prompt utama yang lo butuhin sebagai developer:

### a. Generate Boilerplate

Prompt yang bikin kerangka kode — CRUD, handler route, setup project.

```
Buatkan Express.js route handler untuk REST API products.
Punya method: GET / (list), GET /:id (detail), POST / (create),
PUT /:id (update), DELETE /:id (delete).
Gunakan Prisma ORM. Respons JSON standar: { success, data, message }.
Jangan kasih implementasi logic bisnis — cukup boilerplate aja.
```

Kenapa ini aman? Lo minta kerangka, bukan logika. Tugas lo ngisi implementasinya.

### b. Refactor

Buat perbaiki kode kotor jadi lebih rapi.

```
Refactor kode ini:
- Pisahkan logic dari controller ke service layer
- Ganti nested callback jadi async/await
- Tambahin error handling
- Jangan ubah behavior/output

[tempel kode lo]
```

Syarat: lo harus udah baca kode asli dan hasil refactor. Kalau lo nggak bisa jelasin apa yang berubah, lo belum paham.

### c. Debug

Ini yang paling sering disalahgunakan. Cara yang bener:

```
Saya dapet error ini di [file/baris/konteks]:
[error message / stack trace]
Kode terkait:
[kode yang lo curiga bermasalah]
Yang udah saya coba: [xyz]
Tolong bantu analisis penyebabnya aja — jangan kasih fix langsung.
Saya mau coba fix sendiri dulu.
```

**PENTING:** Minta AI jelasin *penyebab*, bukan *solusi*. Lo belajar debugging dengan nyari solusi sendiri. Kalau mentok, baru minta saran.

### d. Explain

Ini kunci belajar — minta AI jelasin kode yang lo nggak ngerti.

```
Jelaskan kode ini baris per baris dengan analogi dunia nyata.
Target: anak SMK RPL semester 3 yang udah paham PHP OOP dasar dan MySQL.
Fokus: kenapa pake pattern ini, bukan apa yang dilakukan.

[kode yang nggak lo paham]
```

Setelah AI jelasin, lo coba **rephrase pake bahasa lo sendiri** ke AI. Kalau AI bilang "kurang tepat", ulangi sampe lo beneran paham.

### e. Write Tests

```
Buat unit test untuk fungsi ini pake Jest.
Scope: valid input, invalid input, edge cases.
Jangan ubah kode asli.

[fungsi yang mau ditest]
```

Test yang ditulis AI harus lo **running** dan **paham alurnya**. Kalau ada test gagal — itu kesempatan belajar, bukan error.

### f. Generate Dokumentasi

```
Generate JSDoc untuk kode berikut.
Tipe: function description, param types, return values, contoh usage.
Bahasa: Indonesia.

[kode]
```

---

## 3. Code Review dengan AI

Sebelum commit/gabungin branch, minta AI review kode lo.

**Prompt review:**

```
Review kode ini sebagai senior developer RPL.
Cari:
1. Security vulnerabilities (SQL injection, XSS, CSRF, hardcoded secrets)
2. Performa buruk (N+1 query, loop dalam query)
3. Code smell (duplicate, fungsi kepanjangan, magic number)
4. Best practice violation
5. Maintainability issue

Prioritas: security > performa > readability.
Jangan kasih fix — cukup daftarin masalah dan severity-nya.

[kode lo]
```

**Aturan main:** Lo evaluasi tiap temuan AI. Kadang AI salah. Kadang AI ngerekomendasiin refactor yg nggak perlu. Skill lo sebagai developer adalah **memutuskan mana yang diterima**.

---

## 4. Context Management

AI cuma sepinter konteks yang lo kasih. Makin bagus konteks, makin bagus output.

### Project Context

Kasih AI gambaran proyek lo sebelum minta bantuan:

```
Project: Aplikasi POS untuk toko kelontong
Stack: Laravel 11, MySQL, Tailwind CSS, Alpine.js
Database: 5 tabel (users, products, categories, transactions, transaction_items)
Saya udah selesai: auth, CRUD produk
Yang lagi dikerjain: laporan transaksi mingguan pake raw SQL
```

Ini bikin AI ngerti konteks dan nggak ngasih saran irrelevant.

### RAG (Retrieval-Augmented Generation)

Kalau lo pake tools seperti Cursor atau Copilot dengan konteks codebase, lo nggak perlu explain ulang — tools ini udah baca kode lo. Tapi tetap aja: makin spesifik prompt lo, makin akurat hasilnya.

### Prompt Chains

Jangan nanya semuanya dalam 1 prompt. Breakdown:

```
PERTANYAAN 1: "Jelasin cara kerja middleware di Laravel"
→ Paham → lanjut
PERTANYAAN 2: "Gimana bikin custom middleware untuk role admin?"
→ Paham → lanjut
PERTANYAAN 3: "Sekarang bantuin implementasi di project saya"
```

Ini namanya **chain-of-thought prompting**. Lo belajar step by step, bukan loncat ke hasil akhir.

---

## 5. Cursor & GitHub Copilot Mastery

Alat utama developer 2025+. Pake bener — lo bisa 2-3x lebih cepat.

### GitHub Copilot

| Fitur | Shortcut | Guna |
|-------|----------|------|
| Inline suggestion | `Tab` + `Alt+]` | Auto-complete kode |
| Open inline chat | `Ctrl+I` | Minta bantuan di baris tertentu |
| Open chat panel | `Ctrl+Shift+I` | Diskusi general |
| Fix from AI | `/fix` | Fix error di terminal/compiler |
| Explain | `/explain` | Jelasin selection |
| Tests | `/tests` | Generate tests untuk fungsi |

### Cursor

| Fitur | Shortcut | Guna |
|-------|----------|------|
| Chat (model bebas) | `Cmd/Ctrl+L` | Tanya apa aja |
| Inline edit | `Cmd/Ctrl+K` | Edit selection spesifik |
| Agent mode | `Cmd/Ctrl+Shift+A` | Eksekusi multi-file task |
| Terminal AI | `Cmd/Ctrl+Shift+L` | Debug command |

**Agent Mode (Cursor):** Ini yang paling kenceng tapi paling berbahaya. AI bisa:
- Baca semua file di project
- Edit multiple file sekaligus
- Jalankan command
- Install dependencies

**Protokol pake Agent Mode:**

1. Selalu commit dulu sebelum prompt Agent (biar gampang rollback).
2. Minta AI bikin rincian rencana dulu — jangan langsung eksekusi.
3. Review tiap perubahan lewat diff viewer.
4. Kalau ada yg nggak lo paham — tanya "kenapa lo ubah ini?"

### Inline Chat vs Full Chat

| Inline Chat | Full Chat |
|-------------|-----------|
| Fokus 1 fungsi/blok | Diskusi arsitektur |
| "Gimana refactor fungsi ini?" | "Apa beda REST sama GraphQL?" |
| Cepet, langsung ke kode | Butuh konteks lebih |

**Rule of thumb:** Kalau yang lo tanya spesifik ke baris kode tertentu → Inline. Kalau konsep umum atau arsitektur → Chat panel.

---

## 6. PROMPT-LOG.md Culture

Ini budaya yang harus lo terapin tiap minggu. File `PROMPT-LOG.md` ditaro di root project.

**Format:**

```markdown
# PROMPT-LOG

## 2025-01-20

### Prompt: Generate validasi form registrasi
- **Amanan:** Security (validation rules, XSS prevention)
- **Hasil:** Dapet regex validation + sanitizer
- **Yang dipelajari:** `htmlspecialchars()` dengan flags ENT_QUOTES
- **Modifikasi manual:** Tambahin validasi nomor HP Indonesia

### Prompt: Debug login error 500
- **Tujuan:** Cari penyebab error
- **Hasil:** Ternyata ada typo di nama kolom database
- **Yang dipelajari:** Debugging pakai error log Laravel
- **Takeaway:** Selalu cek migration sebelum ngoding
```

**Kenapa ini penting:**

1. **Lo bisa tracking** — prompt mana yang efektif, mana yang nggak.
2. **Guru/pembimbing lo bisa lihat** — bukti lo belajar, bukan nyontek.
3. **Bikin lo disiplin** — kalau lo tahu harus nulis log, lo mikir 2x sebelum prompt asal-asalan.
4. **Portofolio belajar** — 6 bulan kemudian lo liat PROMPT-LOG lama, lo bisa ukur progress.

**Kebijakan kelas PROMPT-LOG:**

- Tiap prompt → minimal 1 kalimat "Apa yang saya pelajari"
- No log = dianggap plagiarisme
- Kualitas prompt dinilai (spesifik vs vague)
- Wajib ada minimal 1 modifikasi manual per prompt

---

## 7. Pedoman Etis

Garis keras — ini nggak bisa ditawar.

### ❌ Yang Nggak Boleh

- **Copy paste mentah** tanpa baca → ini nyontek. Polos.
- **Prompt "kerjain tugas gue"** → lo bayar orang lain buat ngerjain. Sama aja.
- **Minta AI nulis esai/tugas teori** → lo nggak belajar apa-apa.
- **Push kode tanpa review** → lo tanggung jawab atas kode yang lo push. Kalau ada security hole gara-gara AI, nama lo yang tercoreng.
- **Pake AI di ujian tanpa izin** — ini udah jelas pelanggaran akademik.

### ✅ Yang Boleh & Dianjurkan

- **Minta AI jelasin konsep** → belajar 10x lebih cepet.
- **Generate boilerplate** → lo isi logic-nya sendiri.
- **Refactor kode lo sendiri** → terus lo pelajari bedanya.
- **Bantu debugging** — tapi lo tentuin fix-nya.
- **Generate test** → setelah lo paham logic fungsinya.
- **Brainstorming arsitektur** → lo yang putusin finalnya.

### Aturan 70/30

70% kode di project lo harus lo tulis manual. Maksimal 30% dari AI. Kalau lo ngirim project yang 90% AI-generated, lo:

1. Nggak lulus wawancara kerja (mereka tes coding manual)
2. Nggak bisa maintain kode lo sendiri
3. Ngecewain diri lo sendiri

### Transparansi

Kalau lo pake AI buat bantu — bilang. Di commit message, di README, di PROMPT-LOG. Transparansi itu bedain profesional dari tukang contek.

---

## 8. Workflow Harian Developer + AI

Ini workflow yang lo pake tiap hari:

```
1. BACA & PAHAMI masalah → tulis di notes sendiri
2. COBA coding manual 15-30 menit → tanpa AI dulu
3. MENTOK? → baru minta AI (explain / saran)
4. TERAPIN solusi manual → dengan pemahaman lo
5. REVIEW & REFACTOR → pake AI buat ngecek kualitas
6. PROMPT-LOG → catet apa yang dipelajari
```

Ini bukan anti-AI. Ini **pro-AI dengan kendali**. Lo supirnya, AI cuma navigator.

---

## 9. Contoh Prompt Baik vs Buruk

| ❌ Buruk | ✅ Baik |
|----------|---------|
| "Buatin CRUD user" | "Buat migration + Model User dengan field: name, email, role (enum: admin/kasir). Pake Laravel 11. Jangan generate controller." |
| "Fix error ini" | "Error: Call to undefined method. Kode saya: [kode]. Saya udah cek namespace dan use statement — masih error. Bantu analisis." |
| "Jelasin OOP" | "Jelasin konsep inheritance di PHP OOP pake analogi warung kopi. Saya udah paham class sama object." |
| "Buatin test" | "Buat unit test pake PHPUnit untuk fungsi hitungDiskon(). Logic: diskon 10% kalau total > 100k, 20% kalau > 500k. Test edge case: 0, 100k, 500k, 1jt." |

**Ciri prompt buruk:** vague, nyuruh AI kerja sendiri, nggak ada konteks.
**Ciri prompt baik:** spesifik, ada batasan jelas, lo yang kontrol.

---

## 10. Assessment

Project akhir modul ini bukan tes teori — tapi **demonstrasi**.

### Tugas: AI-Augmented Mini Project

1. Bikin fitur baru di project semester lo (contoh: laporan PDF, export Excel, search filter).
2. Wajib pake AI minimal 3 kali, DIDOKUMENTASIKAN di PROMPT-LOG.md.
3. Di PROMPT-LOG, tiap prompt harus ada:
   - Tujuan prompt
   - Hasil AI (tempel)
   - Modifikasi manual yang lo lakukan
   - Pelajaran yang didapat
4. Presentasi: lo jelasin baris per baris dari kode yang AI-generated.
5. Kalau lo nggak bisa jelasin → lo nggak lulus.

### Rubrik Penilaian

| Kriteria | Bobot |
|----------|-------|
| Kualitas PROMPT-LOG | 30% |
| Pemahaman manual tiap baris kode | 40% |
| Kode berfungsi & aman | 20% |
| Transparansi (ngaku pake AI) | 10% |

---

## Penutup

AI nggak bakal ilang. Makin canggih. Tapi developer yang cuma bisa nge-prompt — bakal diganti sama developer yang bisa pake AI **plus** paham fundamental.

Lo punya pilihan sekarang:
- **Jalan 1:** Jadi "prompt monkey" — bisa ngomong ke AI, nggak ngerti apa yang terjadi. Gajinya kecil, gampang diganti.
- **Jalan 2:** Jadi developer yang pake AI buat kebut 10x — tapi lo pegang kendali penuh. Lo yang direkrut, bukan AI.

Pilih jalan 2. Start now.

---

> **"AI doesn't replace developers who understand code. It replaces those who don't."**

---

*Modul 18 — AI Prompt Engineering untuk RPL. Ditujukan untuk pembelajaran, bukan plagiarisme.*

---

## Referensi & Tools

- [GitHub Copilot Docs](https://docs.github.com/en/copilot)
- [Cursor AI](https://cursor.sh) — AI-native editor
- [OpenAI Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)
- [Anthropic Prompt Engineering Guide](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering)
- [Mastra AI](https://mastra.ai) — AI agent framework
