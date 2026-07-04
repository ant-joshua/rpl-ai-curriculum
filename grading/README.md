# 📊 Rubrik Penilaian — RPL AI Curriculum

> Rubrik lengkap buat semua komponen penilaian di RPL AI Curriculum.
> Berlaku untuk tugas mingguan, kuis, mini project, final project, partisipasi, dan presentasi.

---

## Format Penilaian

| Komponen | Bobot | Deskripsi |
|----------|-------|-----------|
| Tugas Mingguan | 30% | Latihan tiap sesi (coding, SQL, Git, design, dll) |
| Kuis | 10% | Quiz interaktif tiap modul (pilihan ganda, isian) |
| Mini Project | 20% | Project kecil selesai 1-2 sesi |
| Final Project | 35% | Capstone project akhir (full-stack + AI) |
| Partisipasi | 5% | Kehadiran & diskusi di kelas |

> **Total = 100%**

---

## Rubrik Tugas Mingguan

Skala: **0–3** per kriteria. Nilai akhir = (total poin ÷ total maksimal) × 100.

### Rubrik Coding (JavaScript/TypeScript)

| Kriteria | 0 (Tidak) | 1 (Kurang) | 2 (Baik) | 3 (Sangat Baik) |
|----------|-----------|-------------|----------|------------------|
| Kode jalan | Error / gak jalan | Jalan sebagian (ada bug) | Semua fitur jalan | Jalan + handle edge cases |
| Struktur kode | Berantakan / gak rapi | Ada struktur minimal | Struktur jelas, naming baik | Modular, rapi, file terpisah |
| Logika & algoritma | Salah konsep | Logika dasar benar | Efisien, gak redundant | Optimal + creative solution |
| Error handling | Gak ada | Ada try-catch minimal | Handle error spesifik | Graceful error + user feedback |
| Git commit | Gak pake Git | 1 commit | Commit per fitur | Commit message rapi + branching |
| AI Ethics | Copas prompt gak paham | Prompt dicatat | Paham output AI | Improve + modifikasi kode AI |

### Rubrik SQL / Database

| Kriteria | 0 (Tidak) | 1 (Kurang) | 2 (Baik) | 3 (Sangat Baik) |
|----------|-----------|-------------|----------|------------------|
| Query jalan | Error syntax | Jalan hasil salah | Semua query benar | Optimized (index, JOIN efisien) |
| Schema design | Gak ada | Table minimal | Normalisasi 3NF | Normalisasi + relasi + constraint |
| Data manipulation | Gak bisa CRUD | Sebagian CRUD | Semua CRUD jalan | CRUD + transaction + rollback |
| Migration & seed | Gak ada | Manual insert | Migration file | Migration + seed + rollback |

### Rubrik Git & Deploy

| Kriteria | 0 (Tidak) | 1 (Kurang) | 2 (Baik) | 3 (Sangat Baik) |
|----------|-----------|-------------|----------|------------------|
| Git init & repo | Gak pake Git | Repo doang | Commit + push | Branch + PR |
| Commit messages | Gak ada / asal | Ada isi | Format konvensional (feat/fix) | Conventional commit + deskriptif |
| .gitignore | Gak ada | Ada template | Custom sesuai project | Plus env example, DS_Store, node_modules |
| Deploy | Gak deploy | Deploy manual | Deploy via CLI | CI/CD pipeline auto deploy |

### Rubrik HTML/CSS/Frontend

| Kriteria | 0 (Tidak) | 1 (Kurang) | 2 (Baik) | 3 (Sangat Baik) |
|----------|-----------|-------------|----------|------------------|
| HTML struktur | Gak ada / error | Ada elemen dasar | Semantic HTML5 | Semantic + accessibility (ARIA) |
| CSS styling | Gak ada | Inline / berantakan | External CSS + layout | Responsive + Tailwind/utility |
| Desain visual | Gak rapi | Minimal | Konsisten (warna, font) | Professional UI + micro-interactions |
| Responsiveness | Error mobile | Mobile breakpoint | Responsive all screen | Mobile-first + fluid layout |

### Rubrik API / Backend (Node.js + Express)

| Kriteria | 0 (Tidak) | 1 (Kurang) | 2 (Baik) | 3 (Sangat Baik) |
|----------|-----------|-------------|----------|------------------|
| API endpoints | Gak jalan | Sebagian jalan | RESTful semua endpoint | RESTful + pagination, filter, sorting |
| Middleware | Gak ada | 1 middleware | Error handler + logger | Auth + validation + rate limit |
| Database integration | Gak ada koneksi | Query di handler | ORM/query builder | Repository pattern + migration |
| Input validation | Gak ada | Manual if-else | Express-validator / Zod | Zod schema + sanitization |
| API documentation | Gak ada | Comment doang | README endpoint list | OpenAPI/Swagger spec |

### Rubrik AI / Mastra Agent

| Kriteria | 0 (Tidak) | 1 (Kurang) | 2 (Baik) | 3 (Sangat Baik) |
|----------|-----------|-------------|----------|------------------|
| Agent setup | Gak jalan | Basic agent | Tools + instructions | Agent dengan memory + RAG |
| Tool integration | Gak ada | 1 tool | Beberapa tools relevan | Tools + error handling + fallback |
| Prompt quality | Copas gak paham | Prompt dasar | Prompt + context | Few-shot + dynamic context |
| Memory / RAG | Gak ada | Memory dasar | Working memory | RAG pipeline + retrieval |

### Rubrik Testing (Vitest / Integration)

| Kriteria | 0 (Tidak) | 1 (Kurang) | 2 (Baik) | 3 (Sangat Baik) |
|----------|-----------|-------------|----------|------------------|
| Unit test | Gak ada | Test sebagian fungsi | Coverage fungsi utama | Coverage > 80% |
| Integration test | Gak ada | Test 1 endpoint | Test semua endpoint | Test + error scenarios |
| Test organization | Berantakan | Satu file | Per-module folder | Describe + it + data factory |
| CI integration | Gak ada | Manual run | GitHub Actions | Actions + lint + coverage report |

### Rubrik System Design / Diagram

| Kriteria | 0 (Tidak) | 1 (Kurang) | 2 (Baik) | 3 (Sangat Baik) |
|----------|-----------|-------------|----------|------------------|
| Diagram | Gak ada | Asal gambar | Struktur jelas | Tools (Mermaid/Excalidraw) + rapi |
| Alur & logic | Gak jelas | Sebagian benar | Alur lengkap | Edge cases + error flow |
| Komponen | Gak disebut | Beberapa komponen | Semua komponen | Scaling + bottleneck dibahas |

### Rubrik Docker / Deployment

| Kriteria | 0 (Tidak) | 1 (Kurang) | 2 (Baik) | 3 (Sangat Baik) |
|----------|-----------|-------------|----------|------------------|
| Dockerfile | Gak ada | Ada tapi gak jalan | Multi-stage build | Optimal (layers, caching) |
| Docker Compose | Gak ada | 1 service | App + DB service | App + DB + reverse proxy |
| Container best practice | Gak pakai .dockerignore | Image besar | Layer caching | Non-root user + healthcheck |

### Rubrik UI/UX Design (Figma)

| Kriteria | 0 (Tidak) | 1 (Kurang) | 2 (Baik) | 3 (Sangat Baik) |
|----------|-----------|-------------|----------|------------------|
| Wireframe | Gak ada | Sketsa tangan | Digital wireframe | Low-fi + hi-fi |
| Design system | Gak konsisten | Warna font asal | Style guide (warna, font, spacing) | Design system + component library |
| User flow | Gak ada | Flow acak | Flowchart user journey | User flow + error state flow |
| Prototype | Gak ada | Static screen | Clickable prototype | Prototype + micro-interactions |

### Rubrik Cybersecurity

| Kriteria | 0 (Tidak) | 1 (Kurang) | 2 (Baik) | 3 (Sangat Baik) |
|----------|-----------|-------------|----------|------------------|
| Security awareness | Gak tau | Tau OWASP Top 10 | Implementasi minimal | Implementasi + testing (XSS, SQLi) |
| Input sanitization | Gak ada | Manual | Lib/orm protection | Multiple layer defense |
| Auth & session | Gak ada password | Basic auth | JWT / session | JWT + refresh + HTTPS + httpOnly |

### Rubrik Agile & Scrum

| Kriteria | 0 (Tidak) | 1 (Kurang) | 2 (Baik) | 3 (Sangat Baik) |
|----------|-----------|-------------|----------|------------------|
| Sprint planning | Gak ada | Task list | Sprint backlog | Sprint backlog + estimation |
| Standup & retrospective | Gak ada | Catatan manual | Format standup + retro | Insight + action items |
| Scrum artifacts | Gak ada | Product backlog | Sprint backlog + burndown | Backlog + burndown + review doc |

### Rubrik Soft Skills & Professional

| Kriteria | 0 (Tidak) | 1 (Kurang) | 2 (Baik) | 3 (Sangat Baik) |
|----------|-----------|-------------|----------|------------------|
| Presentasi | Gak siap | Baca slide | Jelas, kontak mata | Engaging + demo live |
| Dokumentasi | Gak ada | Minimal | README jelas | README + API docs + setup guide |
| Kolaborasi | Gak kontribusi | Kerja sendiri | Bantu tim | Lead + mentoring anggota |

---

## Rubrik Kuis

| Nilai | Predikat | Keterangan |
|-------|----------|------------|
| ≥ 80 | Lulus | Paham materi modul |
| ≥ 60 | Cukup | Sebagian paham, perlu review |
| < 60 | Remedial | Wajib remedial / baca ulang modul |

> Kuis tiap modul — 10 soal pilihan ganda + 2 soal esai pendek.
> Remedial: siswa bisa ulang 1x dengan soal berbeda, nilai max 70.

---

## Rubrik Mini Project

Skala: **0–4** per kriteria. Bobot mini project = 20% dari total.

| Kriteria | Bobot | 0 (Tidak) | 1 (Kurang) | 2 (Cukup) | 3 (Baik) | 4 (Sangat Baik) |
|----------|-------|-----------|-------------|-----------|----------|------------------|
| Fungsionalitas | 30% | Gak jalan | Jalan sebagian | Semua fitur dasar jalan | Fitur lengkap + stabil | Extra features di luar spek |
| Code quality | 20% | Berantakan | Struktur minimal | Rapi + naming jelas | Modular + reusable | Production-ready code |
| Dokumentasi | 10% | Gak ada | README minimal | README + cara run | README + setup + API | README + docs + contoh |
| Git & workflow | 10% | Gak pake Git | 1 commit | Commits per fitur | Branch + PR + deskriptif | Conventional commits + CI |
| Presentasi | 10% | Gak demo | Demo error | Demo lancar | Demo + penjelasan kode | Demo + Q&A + insight |
| Deadline | 10% | > 7 hari telat | 4-7 hari telat | 1-3 hari telat | Tepat waktu | Sebelum deadline |
| AI Integration | 10%* | Gak relevan | Minimal | Digunakan | Di-improve | Agent + tools + RAG |

> *\*Hanya untuk mini project yang terkait AI (Mastra, prompt engineering, dll).*
>
> **Nilai Mini Project** = Σ (skor × bobot) × 100 ÷ (4 × total bobot)

---

## Rubrik Final Project

Skala: **0–4** per kriteria. Final project = 35% dari total nilai akhir.

| Kriteria | Bobot | 0 (Tidak) | 1 (Kurang) | 2 (Cukup) | 3 (Baik) | 4 (Sangat Baik) |
|----------|-------|-----------|-------------|-----------|----------|------------------|
| **Functionality** | 20% | Gak jalan / error | Sebagian kecil fitur jalan | Semua fitur inti jalan | Semua fitur + stabil | Fitur tambahan + edge cases |
| **Frontend** | 15% | Gak ada | HTML doang | Responsive + rapi | UI konsisten + aksesibel | Polish + micro-interactions |
| **Backend + DB** | 15% | Gak ada | API doang | API + DB integration | RESTful + validation | Plus auth + error handling |
| **AI Feature** | 20% | Gak ada | Pake AI API basic | Agent + tools | Agent + memory + RAG | Agent + RAG + workflow + eval |
| **Code Quality** | 10% | Berantakan | Ada struktur | Modular + naming jelas | Clean code + error handling | Testing + CI + type safety |
| **Deployment** | 10% | Local only | 1 platform (Vercel/Railway) | Both deployed | Custom domain + HTTPS | CI/CD auto deploy |
| **Documentation** | 5% | Gak ada | README minimal | README + setup + run | README + API + arsitektur | README + docs + demo video |
| **Presentation** | 5% | Gak demo | Demo error | Demo lancar | Demo + code walkthrough | Demo + Q&A + arsitektur |

> **Nilai Final Project** = Σ (skor × bobot) × 100 ÷ (4 × total bobot)
>
> **Passing Grade Final Project**: minimal 2 (Cukup) di setiap kriteria wajib:
> - Functionality (≥ 2)
> - AI Feature (≥ 2)
> - Deployment (≥ 1)

### Keterangan Skala Final Project

| Skala | Label | Deskripsi |
|-------|-------|-----------|
| 0 | Tidak | Tidak dikerjakan / tidak ada |
| 1 | Kurang | Dikerjakan tapi banyak kurang / error |
| 2 | Cukup | Memenuhi standar minimal / semua fitur inti |
| 3 | Baik | Di atas standar, rapi, stabil |
| 4 | Sangat Baik | Excellence — production-ready + extra |

### AI Feature Scoring Detail

| Level | Skor | Contoh Implementasi |
|-------|------|---------------------|
| Tidak ada AI | 0 | — |
| Panggil AI API (OpenAI/anthropic) | 1 | Prompt langsung, parsing output |
| Agent + tools | 2 | Mastra agent dengan 1-2 tools (search, calculator) |
| Agent + memory | 3 | Agent dengan working memory + context persist |
| Agent + memory + RAG | 4 | Agent + RAG pipeline + retrieval + evaluasi |
| Agent + RAG + workflow + eval | 4+ | Multi-agent workflow + CI eval + feedback loop |

---

## Rubrik Presentasi

Berlaku untuk presentasi mini project dan final project.

| Kriteria | Bobot | 0 (Tidak) | 1 (Kurang) | 2 (Baik) | 3 (Sangat Baik) |
|----------|-------|-----------|-------------|----------|------------------|
| Kesiapan | 15% | Gak siap / gak datang | Persiapan minimal | Slide + alat siap | Slide + demo + backup plan |
| Penyampaian | 20% | Gak jelas / baca slide | Terbata-bata | Jelas + percaya diri | Engaging + eye contact |
| Demo (jika ada) | 30% | Gak demo | Demo error / gak jalan | Demo lancar fitur utama | Demo fitur + edge case + error |
| Code Walkthrough | 15% | Gak dibahas | Baca kode tanpa konteks | Struktur kode + alur | Arsitektur + decision rationale |
| Q&A | 20% | Gak bisa jawab | Jawab ragu | Jawab benar | Jawab + insight tambahan |

> **Nilai Presentasi** = Σ (skor × bobot) × 100 ÷ (3 × total bobot)
>
> Untuk final project, presentasi sudah termasuk di rubrik final project (5%).
> Rubrik ini dipakai untuk presentasi tersendiri (misal: presentasi mini project).

---

## Konversi Nilai

| Nilai Angka | Huruf | Predikat | Keterangan |
|-------------|-------|----------|------------|
| ≥ 90 | A | Sangat Baik | Lulus dengan pujian |
| ≥ 80 | B | Baik | Lulus |
| ≥ 70 | C | Cukup | Lulus |
| ≥ 60 | D | Kurang | Tidak Lulus (Remedial) |
| < 60 | E | Tidak Lulus | Tidak Lulus (Ulang) |

### Syarat Lulus

1. Nilai akhir ≥ 70 (C)
2. Final project ≥ 70 (C) — tidak bisa digantikan komponen lain
3. Tidak ada nilai 0 di final project (semua kriteria ≥ 1)
4. Minimal 80% kehadiran

> **Remedial**: Mahasiswa dengan nilai akhir D (60-69) bisa remedial.
> Remedial berupa: perbaiki final project + presentasi ulang. Nilai max setelah remedial = 75 (C).

---

## Cheatsheet Bobot Per-Modul

Rincian bobot tiap modul berdasarkan tipe tugas dominan.

| # | Modul | Level | Tugas Dominan | Bobot Tugas | Bobot Kuis | Catatan |
|---|-------|-------|---------------|-------------|------------|---------|
| 00 | Fundamental Pemrograman & Web | 🌱 Beginner | Written / refleksi | 30% | 10% | Partisipasi 60% |
| 01 | JavaScript Fundamentals | 🌱 Beginner | Coding | 30% | 10% | |
| 02 | Algorithms & Data Structures | 🌱 Beginner | Coding | 30% | 10% | |
| 03 | TypeScript Basics | 🌱 Beginner | Coding | 30% | 10% | |
| 04 | Web Basics (HTML/CSS/Tailwind) | 🌱 Beginner | Frontend | 30% | 10% | |
| 05 | Git & GitHub + Deploy | 🌱 Beginner | Git + Deploy | 30% | 10% | |
| 06 | Node.js & Express + Database SQL | 📐 Intermediate | Backend + SQL | 30% | 10% | |
| 07 | Mastra AI — Agents, Tools, Memory & RAG | 📐 Intermediate | AI Agent | 30% | 10% | |
| 08 | Final Project | 🚀 Advanced | Full-stack + AI | — | — | Bobot terpisah 35% |
| 09 | Testing — Vitest & Integration | 🚀 Advanced | Testing | 30% | 10% | Elektif |
| 10 | Design Patterns | 📐 Intermediate | Coding | 30% | 10% | |
| 11 | System Design | 📐 Intermediate | Diagram + Written | 30% | 10% | |
| 12 | UI/UX Design | 📐 Intermediate | Design (Figma) | 30% | 10% | |
| 13 | Flutter Mobile | 📐 Intermediate | Mobile Dev | 30% | 10% | |
| 14 | Cybersecurity for Dev | 📐 Intermediate | Security | 30% | 10% | |
| 15 | Agile & Scrum | 📐 Intermediate | Written | 30% | 10% | |
| 16 | Realtime Apps (WebSocket) | 🚀 Advanced | Backend | 30% | 10% | |
| 17 | Advanced Database | 🚀 Advanced | SQL + Backend | 30% | 10% | |
| 18 | AI Prompt Engineering | 🚀 Advanced | Prompt + AI | 30% | 10% | |
| 19 | Technical Interview | 🚀 Advanced | Coding + Written | 30% | 10% | |
| 20 | Frontend Frameworks | 📐 Intermediate | Frontend | 30% | 10% | |
| 21 | Docker | 🚀 Advanced | DevOps | 30% | 10% | |
| 22 | Monorepo | 🚀 Advanced | DevOps | 30% | 10% | |
| 23 | System Runtime & Async | 📐 Intermediate | Coding | 30% | 10% | |
| 24 | Resilience Patterns | 🚀 Advanced | Coding + Design | 30% | 10% | |
| 25 | Soft Skills & Professional | 🌱 Beginner | Written + Roleplay | 30% | 10% | Partisipasi 60% |
| 26 | Pragmatic Programming & Clean Code | 🌱 Beginner | Written + Refactor | 30% | 10% | |
| 27 | Linux Terminal Mastery | 🌱 Beginner | Terminal | 30% | 10% | |
| 28 | REST API Design & Documentation | 📐 Intermediate | API Design | 30% | 10% | |
| 29 | Cloud Computing & Serverless | 📐 Intermediate | DevOps | 30% | 10% | |
| 30 | GraphQL & tRPC | 🚀 Advanced | API | 30% | 10% | |
| 31 | Auth & Identity Deep Dive | 🚀 Advanced | Backend + Security | 30% | 10% | |
| 32 | Performance Optimization | 🚀 Advanced | Frontend + Backend | 30% | 10% | |
| 33 | Data Visualization | 📐 Intermediate | Frontend | 30% | 10% | |
| 34 | PWA & Offline-First | 🚀 Advanced | Frontend | 30% | 10% | |
| 35 | HTML & CSS Dasar | 🌱 Beginner | Frontend | 30% | 10% | |
| 36 | Frontend & Backend Architecture | 🌱 Beginner | Diagram + Written | 30% | 10% | |
| 37 | Database Introduction | 🌱 Beginner | SQL + Design | 30% | 10% | |

> **Catatan**: Sisa bobot per modul diisi partisipasi (60% untuk modul beginner tanpa coding berat, atau menyesuaikan).
> Untuk modul dengan mini project, mini project menggantikan sebagian bobot tugas mingguan (mini project = 20%, tugas mingguan = 10% di modul tersebut).

### Modul dengan Mini Project

| # | Modul | Mini Project |
|---|-------|-------------|
| 04 | Web Basics | Landing page portfolio |
| 06 | Node.js & Express | Simple CRUD API |
| 07 | Mastra AI | AI chatbot with tool |
| 13 | Flutter Mobile | Simple mobile app |
| 20 | Frontend Frameworks | React component library |
| 34 | PWA & Offline-First | PWA app |

---

## Cara Hitung Nilai Akhir

```
Nilai Akhir = (Nilai Tugas × 30%) + (Nilai Kuis × 10%) + (Nilai Mini Project × 20%) + (Nilai Final Project × 35%) + (Nilai Partisipasi × 5%)
```

### Contoh Perhitungan

| Komponen | Nilai | Bobot | Hasil |
|----------|-------|-------|-------|
| Tugas Mingguan | 85 | 30% | 25.5 |
| Kuis | 80 | 10% | 8.0 |
| Mini Project | 78 | 20% | 15.6 |
| Final Project | 88 | 35% | 30.8 |
| Partisipasi | 90 | 5% | 4.5 |
| **Total Akhir** | | **100%** | **84.4 → B** |

---

## Template Penilaian Spreadsheet

Kolom recommended buat Google Sheets / Excel:

```
Nama | T1 | T2 | T3 | ... | Rata Tugas | Kuis | Mini Project | Final Project | Partisipasi | Nilai Akhir | Grade
```

> Template spreadsheet tersedia di [grading/template.csv](template.csv) — import ke Google Sheets / Excel.

---

## Referensi

- [RPP & Teacher Guide](../teacher-guide/) — panduan ngajar per sesi
- [Final Project Module](../08-project/) — spesifikasi final project
- [Capstone Projects](../capstones/) — contoh final project
- [Modul Master List](../README.md#modul) — daftar semua modul
