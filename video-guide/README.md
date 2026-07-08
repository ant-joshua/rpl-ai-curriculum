# Video Pembelajaran — RPL AI Curriculum

Panduan lengkap buat guru, creator, atau siapa pun yang mau bikin video pembelajaran dari modul RPL AI Curriculum. Dari persiapan, produksi, sampai distribusi — semua ada di sini.

---

## 📋 Daftar Isi

- [Format & Standar Video](#-format--standar-video)
- [Struktur Tiap Video](#-struktur-tiap-video)
- [Script Template Lengkap](#-script-template-lengkap)
- [Tools & Setup](#-tools--setup)
- [Alur Produksi](#-alur-produksi)
- [Struktur Video per Modul](#-struktur-video-per-modul)
- [YouTube Playlist Strategy](#-youtube-playlist-strategy)
- [Recommended Creators & Referensi](#-recommended-creators--referensi)
- [Companion Notes untuk Tiap Video](#-companion-notes-untuk-tiap-video)
- [Troubleshooting Produksi Video](#-troubleshooting-produksi-video)
- [Distribusi & Engagement](#-distribusi--engagement)

---

## 🎬 Format & Standar Video

| Aspek | Standar | Keterangan |
|-------|---------|------------|
| **Durasi** | 5-15 menit per sesi | Maks 20 menit. >20 menit = split jadi 2 video. Sesuai research, attention span pemula rata-rata 8-12 menit. |
| **Resolusi** | 1080p 30fps | Minimal 720p untuk mobile. 4K tidak diperlukan — bikin file besar tanpa manfaat signifikan untuk coding tutorial. |
| **Bitrate** | Video: 8-12 Mbps, Audio: 128-192 kbps | Cukup untuk kode terbaca. Bitrate lebih tinggi buang bandwidth. |
| **Audio** | Mikrofon eksternal | Dilarang pakai laptop/headset mic built-in. Minimal: Samson Q2U / Blue Yeti / Fifine K669. Rekomendasi: Rode NT-USB atau Shure MV7. |
| **Format File** | MP4 H.264 | Paling kompatibel. H.265 lebih efisien tapi belum universal. |
| **Frame Rate** | 30fps | 60fps untuk demo coding yang banyak gerakan (tidak wajib). |
| **Aspect Ratio** | 16:9 landscape | Jangan vertikal. Horizontal lebih natural untuk screen recording. |
| **Platform** | YouTube (unlisted) + embed di Docsify | Upload unlisted dulu, publish setelah direview. Embed di Docsify lewat iframe. Backup ke Google Drive. |

### Recommended Recording Settings (OBS Studio)

```
Output Mode: Advanced
Encoder: NVIDIA NVENC H.264 (kalo punya GPU) / x264 (software)
Rate Control: CBR, 12.000 Kbps
Preset: Quality / Medium
Audio Bitrate: 192 kbps
Sample Rate: 48 kHz
Recording Format: MP4 (atau MKV kalo sering crash — remux after)
Canvas Resolution: 1920x1080
FPS: 30
```

---

## 📝 Struktur Tiap Video

Setiap video ngikutin format standar yang sama. Konsistensi format bikin siswa nyaman dan tau apa yang diharapkan.

```
⏱️ INTRO (1-2 menit) — 15% dari total
  ├ Hook (30 detik)
  │   Masalah nyata yang relatable. Jangan "Hari ini kita belajar..."
  │   Contoh: "Lo pernah gak ngerasa susah ngatur state di React?"
  │
  ├ Tujuan Sesi (30 detik)
  │   "Setelah nonton video ini, lo bakal bisa..."
  │   Maks 3 poin. Spesifik, terukur.
  │
  └ Prasyarat (15 detik)
      Modul sebelumnya yang wajib. Link ke video tersebut.
      Contoh: "Sebelum nonton ini, pastiin lo udah nonton video 04 tentang useState."

⏱️ ISI (5-8 menit) — 60% dari total
  ├ Konsep (2-3 menit)
  │   Slide + diagram dari slide deck. Jangan baca slide — jelasin.
  │   Analogi dunia nyata lebih diingat daripada definisi formal.
  │
  ├ Demo Langsung (3-4 menit)
  │   Coding di VS Code + terminal. Jangan copy-paste kode.
  │   Tunjukkin error yang mungkin muncul + cara fix.
  │
  ├ Code Review (1 menit)
  │   Jelasin baris per baris. Kenapa ditulis gitu? Alternatifnya apa?
  │
  └ Common Mistakes (30 detik)
      "Yang sering salah tuh...", "Hati-hati sama..."
      Tunjukkin error message yang muncul.

⏱️ PRAKTIK (2-3 menit) — 20% dari total
  ├ Challenge (1 menit)
  │   Kasih soal exercise. Spesifik: "Buka file exercise-XX, kerjain nomor 3"
  │
  ├ Expected Output (30 detik)
  │   Tunjukkin screenshot / terminal output yang benar
  │
  └ Hint (30 detik)
      Kalo mentok, cek... Jangan kasih jawaban langsung.

⏱️ OUTRO (1 menit) — 5% dari total
  ├ Recap (30 detik)
  │   3 poin penting. "Hari ini lo belajar..."
  │
  ├ Link ke Exercise + Cheatsheet
  │   Tunjuk di layar: docsify URL, file path
  │
  ├ Next Module Spoiler (15 detik)
  │   "Next, kita bakal bahas... yang lebih seru."
  │
  └ Call to Action (15 detik)
      "Coba kerjain challenge week-XX, share hasil lo di Discord."
      "Jangan lupa like, subscribe, comment."
```

### Time Budget Reference

| Durasi Video | Intro | Isi | Praktik | Outro |
|-------------|-------|-----|---------|-------|
| 5 menit | 0:45 | 3:00 | 1:00 | 0:15 |
| 8 menit | 1:15 | 4:45 | 1:30 | 0:30 |
| 10 menit | 1:30 | 6:00 | 2:00 | 0:30 |
| 15 menit | 2:00 | 9:00 | 3:00 | 1:00 |

---

## 📄 Script Template Lengkap

### Template Script

```markdown
# Video: [Nama Modul] — [Judul Sesi]
Creator: [Nama]
Tanggal: [YYYY-MM-DD]
Durasi Target: [X menit]
Modul: [Nomor Modul]
Sesi: [1/2/3/4]

---

## 🎬 HOOK (30 detik)
"[Masalah relatable]... pernah gak sih lo ngalamin ini?"
→ Visual: Tunjukkin masalah di layar (error, bug, UI broken)

## 🎯 TUJUAN (30 detik)
Setelah nonton video ini, lo bakal bisa:
✅ [Kompetensi 1]
✅ [Kompetensi 2]
✅ [Kompetensi 3]

## 📋 PRASYARAT
- Modul [X] — [Judul Modul] → link
- Udah install [tools]

---

## 🧠 KONSEP (2-3 menit)
Slide 1-3 dari slide deck
→ Poin penting:
  • [Poin 1]
  • [Poin 2]
  • [Poin 3]
→ Analogi: [Analogi dunia nyata]

## 💻 DEMO (4 menit)
1. Buka VS Code — tunjukkin struktur folder
2. [Step 1] — ketik kode sambil jelasin
   ```bash
   # command yang dijalanin
   ```
3. [Step 2] — tunjukkin output
4. [Step 3] — tunjukkin error yang mungkin muncul
5. Fix error + jelasin kenapa

[CATATAN PRODUKSI]
- Zoom in ke font kode (150%)
- Highlight baris yang penting
- Jeda 2 detik setelah command selesai biar ngeliat output
- Jangan tutup terminal sebelum siswa liat output

## ❌ COMMON MISTAKES (30 detik)
| Mistake | Fix |
|---------|-----|
| [Mistake 1] | [Cara fix] |
| [Mistake 2] | [Cara fix] |

---

## ✍️ CHALLENGE (1 menit)
"Buka file exercise-XX, kerjain soal nomor [N]"
→ Tunjukkin expected output:
  ```
  [Expected output]
  ```
→ Hint: [Hint kalo mentok]

## 🏁 OUTRO (1 menit)
3 poin penting hari ini:
🔹 [Poin 1]
🔹 [Poin 2]
🔹 [Poin 3]

Next: [Judul modul / sesi berikutnya] — lebih seru!

📎 Link:
- Exercise: [link]
- Cheatsheet: [link]
- Slide deck: [link]
- Discord: [link]

"Happy coding!"
```

### Contoh Script Terisi (Modul 07 — Mastra AI, Sesi 1)

```markdown
# Video: Mastra AI — Bikin Agent Pertama
Creator: [Nama]
Durasi Target: 10 menit
Modul: 07 (Mastra AI Framework)
Sesi: 1 dari 4

## HOOK
"Lo tau ChatGPT kan? Nah hari ini lo bakal bikin CHATGPT LO SENDIRI.
Bukan pake API doang, tapi bikin agent yang bisa pake tools, punya memory,
dan bisa lo deploy."

## TUJUAN
✅ Bikin agent Mastra pertama
✅ Agent bisa generate text + streaming
✅ Paham konsep agent, tool, memory

## PRASYARAT
- Modul 02: TypeScript dasar
- Udah install Node.js 18+
- Punya API key OpenAI/Anthropic

## DEMO
1. npx create-mastra@latest my-first-agent
2. Buka struktur project di VS Code
3. Edit agent di src/agents/
4. Jalankan: npx mastra dev
5. Test dengan prompt: "Siapa presiden Indonesia?"

## CHALLENGE
Buka exercise 07-mastra, kerjain soal 1-3.
Output: Agent yang bisa jawab 3 pertanyaan tentang programming.
```

---

## 🛠 Tools & Setup

### Wajib

| Tool | Fungsi | Setup | Alternatif Gratis |
|------|--------|-------|-------------------|
| **OBS Studio** | Screen recording + webcam capture | [obsproject.com](https://obsproject.com) | — |
| **VS Code** | Code demo | [code.visualstudio.com](https://code.visualstudio.com) | Cursor, Windsurf |
| **Marp** | Slide presentasi dari markdown | `npm install -g @marp-team/marp-cli` | PowerPoint, Google Slides |
| **Kap / Peek** | GIF recording (error demo) | Linux: `sudo apt install peek`, macOS: Kap | Gifski |

### Opsional (Rekomendasi)

| Tool | Fungsi | Harga |
|------|--------|-------|
| Screen Studio | Screen recording + auto-zoom + cursor effect | $79 one-time |
| DaVinci Resolve | Video editing profesional | Gratis |
| Adobe Premiere Pro | Video editing | Berlangganan |
| CapCut | Video editing ringan | Gratis |
| Descript | AI-powered editing (transcript-based) | Berbayar |
| LosslessCut | Potong video tanpa re-encode | Gratis |
| Audacity | Audio cleanup (noise reduction) | Gratis |
| OBS.Markl | Auto-captions & chapters | Gratis |

### VS Code Extensions untuk Demo

- **vscode-pets** — biar ada kucing peliharaan di status bar (buat seru-seru)
- **CodeSnap** — screenshot kode yang rapi
- **Better Comments** — kode lebih visual
- **GitLens** — tunjukkin blame / git history
- **Error Lens** — error muncul inline

### OBS Scene Setup

```
Scene: "Main"
├── Display Capture (layar utama)
│   └── Crop ke area coding
├── Webcam (kecil, pojok kanan bawah)
│   └── Ukuran: 320x240 atau 480x270
├── Mic/Aux (audio)
└── Browser Source (optional: timer, chat)
```

Tips OBS:
- **Record in MKV** — kalo OBS crash, file gak rusak. Remux to MP4 setelah selesai.
- **Use Source Record** — record aplikasi tertentu aja, bukan full screen (lebih aman privacy).
- **Push-to-talk** buat mic — hindari suara napas, coffee slurp, keyboard click.
- **Test recording 30 detik** sebelum mulai — cek audio sync, crop, bitrate.

---

## 🔄 Alur Produksi

### PRE-PRODUCTION (1-2 jam)

```
┌─ 1. Pilih Modul + Sesi
│   Berdasarkan prioritas wave. Mulai dari Wave 1.
│
├─ 2. Baca Slide Deck
│   slides/<modul>/<sesi>.md — pahami materi
│
├─ 3. Bikin Script
│   Pake template script di atas. Isi hook, demo steps, challenge.
│
├─ 4. Siapin Demo Code
│   Clone repo, buka di VS Code, install dependencies.
│   Pastiin code bisa di-run dari awal.
│
├─ 5. Test Run Semua Command
│   Jangan sampe di tengah recording command error.
│
├─ 6. Siapin Aset
│   Slide (Marp), screenshots, diagram, GIF.
│
└─ 7. Cek Audio + Lighting
    Test mic. Kalo pake webcam, cek lighting.
```

**Checklist Pre-Production:**
- [ ] Script udah selesai
- [ ] Semua command udah di-test
- [ ] Slide deck udah dibuka
- [ ] VS Code udah dibuka di file yang tepat
- [ ] Font size kode ≥ 16px
- [ ] Terminal font size ≥ 14px
- [ ] Tab gak ada informasi pribadi
- [ ] Notifikasi dimatiin (Slack, Discord, email)
- [ ] OBS recording setting udah bener

### PRODUCTION (1-3 jam per video)

```
┌─ 1. Record OBS
│   Record MKV. Jeda 3 detik sebelum mulai bicara.
│
├─ 2. Baca Script Natural
│   Jangan kaku. Improvisasi wajar. Kalo salah, pause 2 detik, ulang kalimat.
│
├─ 3. Selingi Pertanyaan Retoris
│   "Nah lo pasti bingung, kenapa pake ini?"
│   "Coba lo tebak, error apa yang bakal muncul?"
│
├─ 4. Tunjukkin Error
│   Jangan edit error out. Error adalah momen belajar.
│   Tunjukkin error message, baca, jelasin, fix.
│
├─ 5. Jeda Antar Step
│   2-3 detik jeda setelah command selesai. Biar siswa catch up.
│
└─ 6. Marker
    Catet timestamp kalo ada yang perlu di-edit nanti.
    "0:45 — salah ngomong, potong"
    "3:20 — load lama, speed up"
```

**Tips Produksi:**
- **Bicara lebih lambat dari biasanya.** Grogi bikin cepet. Sadar.
- **Air minum.** Siapin air. Suara kering itu noticeable.
- **Jangan edit di kepala.** Kalo salah, pause, ulang kalimat. Edit nanti.
- **Keyboard typing** — mechanical keyboard mic pick up. Kalo noisy, ganti keyboard atau dynamic mic.
- **Screen cleanup** — tutup tab gak penting. Matiin Slack/Discord notifications.

### POST-PRODUCTION (2-4 jam per video)

```
┌─ 1. Cut Dead Air
│   Hapus pause panjang > 3 detik.
│
├─ 2. Cut Kesalahan
│   Hapus kalimat yang diulang atau salah.
│
├─ 3. Tambah Lower Thirds
│   Nama creator + judul modul. Bikin pake OBS atau editor video.
│   Template di assets/lower-thirds/
│
├─ 4. Tambah Overlay
│   - Keyboard shortcuts (Ctrl+C, Ctrl+V)
│   - Code highlight
│   - Zoom in ke area penting (Screen Studio auto-zoom, atau manual cut)
│
├─ 5. Audio Cleanup
│   - Noise reduction (Audacity / built-in editor)
│   - Compressor (biar volume konsisten)
│   - Normalize (peak -1dB)
│
├─ 6. Export
│   1080p H.264, 30fps
│
├─ 7. Upload YouTube (unlisted)
│   - Judul: "[RPL AI] Modul X - Judul Sesi"
│   - Deskripsi: link ke curriculum, exercise, cheatsheet, Discord
│   - Thumbnail: consistent template
│   - Chapters: dari marker
│   - Playlist: masukin ke playlist modul yang sesuai
│
└─ 8. Embed di Docsify
    docs/<modul>/video.md — iframe embed
```

---

## 📺 Struktur Video per Modul

Setiap modul punya 4 sesi. Berikut breakdown video untuk tiap modul.

### Wave 1 — Fundamental (Modul 00-07) — PRIORITAS TERTINGGI

#### Modul 00 — Pengenalan

| Sesi | Judul | Durasi | Konsep | Demo |
|------|-------|--------|--------|------|
| 1 | Apa itu RPL AI? | 8 min | Kurikulum, tujuan, learning path | Tour curriculum, install tools |
| 2 | Setup Environment | 10 min | Terminal, VS Code, Node.js, Git | Install semua tools dari 0 |
| 3 | Cara Belajar Efektif | 6 min | Active recall, project-based, pomodoro | Bikin study plan |
| 4 | Tools Overview | 8 min | VS Code extensions, terminal, ChatGPT | Bikin workspace + productivity setup |

**YouTube Playlist:** [RPL AI] 00 — Pengenalan & Setup

#### Modul 01 — JavaScript Dasar

| Sesi | Judul | Durasi | Konsep | Demo |
|------|-------|--------|--------|------|
| 1 | Variable & Tipe Data | 10 min | let/const, string, number, boolean, null/undefined | Console log berbagai tipe |
| 2 | Function & Scope | 12 min | Function declaration, arrow function, closure | Bikin kalkulator sederhana |
| 3 | Array & Object | 12 min | Array methods (map, filter, reduce), object spread | Manipulasi data array mahasiswa |
| 4 | Async JavaScript | 14 min | Callback, Promise, async/await, try/catch | Fetch data dari API publik |

**YouTube Playlist:** [RPL AI] 01 — JavaScript Dasar

#### Modul 02 — TypeScript

| Sesi | Judul | Durasi | Konsep | Demo |
|------|-------|--------|--------|------|
| 1 | Type System | 10 min | Type annotation, interface, type alias | Migrasi JS → TS |
| 2 | Generics & Utility Types | 12 min | Generic function, Partial, Pick, Omit | Bikin API response type |
| 3 | Advanced Types | 10 min | Union, intersection, discriminated union, type guard | Bikin state machine |
| 4 | TypeScript with Node | 10 min | tsconfig, tsx, build process | Setup TS project dari 0 |

#### Modul 03 — Web Development (HTML/CSS)

| Sesi | Judul | Durasi | Konsep | Demo |
|------|-------|--------|--------|------|
| 1 | HTML Semantic & Accessibility | 10 min | Semantic tags, ARIA, form validation | Bikin halaman profil |
| 2 | CSS Layout | 12 min | Flexbox, Grid, responsive design | Bikin card layout responsive |
| 3 | CSS Framework (Tailwind) | 10 min | Utility-first, config, responsive utility | Rebuild card pake Tailwind |
| 4 | Deploy Website | 8 min | Vercel, Netlify, custom domain | Deploy portfolio |

#### Modul 04 — Backend Development

| Sesi | Judul | Durasi | Konsep | Demo |
|------|-------|--------|--------|------|
| 1 | Express.js Dasar | 12 min | Routes, middleware, request/response | Bikin server hello world |
| 2 | REST API Design | 12 min | REST principles, CRUD, status codes | Bikin API notes |
| 3 | Database & ORM | 14 min | PostgreSQL, Prisma ORM, migration | Connect API ke database |
| 4 | Middleware & Security | 10 min | Auth JWT, CORS, rate limiting, helmet | Proteksi API |

#### Modul 05 — Git & GitHub

| Sesi | Judul | Durasi | Konsep | Demo |
|------|-------|--------|--------|------|
| 1 | Git Dasar | 12 min | init, add, commit, status, log | Buat repo + commit pertama |
| 2 | Branching & Merge | 12 min | branch, checkout, merge, conflict | Kerja pake git flow |
| 3 | Remote & Collaboration | 12 min | remote, push, pull, PR, fork | Contribusi ke open source |
| 4 | Git Advanced | 10 min | rebase, stash, bisect, hooks | Clean up messy history |

#### Modul 06 — Database

| Sesi | Judul | Durasi | Konsep | Demo |
|------|-------|--------|--------|------|
| 1 | Relational Database | 12 min | Table, relation, SQL query (SELECT, JOIN) | Query dummy data |
| 2 | Prisma ORM | 12 min | Schema, migration, CRUD | Bikin schema e-commerce |
| 3 | Query Optimization | 10 min | Index, EXPLAIN, N+1 problem | Optimasi query lambat |
| 4 | NoSQL & Redis | 10 min | Document DB, Redis caching | Implement cache |

#### Modul 07 — Mastra AI Framework

| Sesi | Judul | Durasi | Konsep | Demo |
|------|-------|--------|--------|------|
| 1 | Agent Dasar | 10 min | Agent, prompt, model provider | Bikin agent pertama |
| 2 | Tools & Memory | 12 min | Tool definition, memory, context | Agent kalkulator + memory |
| 3 | Workflow & RAG | 12 min | Workflow pipeline, RAG pattern | Bikin writer → editor pipeline |
| 4 | Multi-Agent & Evaluation | 14 min | Orchestrator, eval metrics, guardrails | Bikin research team |

### Wave 2 — Intermediate (Modul 08-19)

#### Modul 08 — React Dasar

| Sesi | Judul | Durasi | Konsep | Demo |
|------|-------|--------|--------|------|
| 1 | Component & JSX | 12 min | Functional component, props, children | Bikin component Button, Card |
| 2 | State & Event | 14 min | useState, onChange, onClick, form | Bikin counter + form input |
| 3 | Effect & Lifecycle | 12 min | useEffect, cleanup, dependency array | Bikin data fetching |
| 4 | React Router | 10 min | BrowserRouter, Route, Link, params | Bikin multi-page app |

#### Modul 09 — React Advanced

| Sesi | Judul | Durasi | Konsep | Demo |
|------|-------|--------|--------|------|
| 1 | Custom Hooks | 12 min | Hook pattern, custom hook, hook composition | Bikin useLocalStorage, useFetch |
| 2 | Context & State Management | 14 min | Context API, useReducer, Zustand | Migrasi prop drilling → state management |
| 3 | Performance | 10 min | useMemo, useCallback, React.memo, lazy loading | Optimasi render |
| 4 | Testing React | 12 min | Vitest, React Testing Library, user-event | Unit test + integration test |

#### Modul 10 — Full-stack Integration

| Sesi | Judul | Durasi | Konsep | Demo |
|------|-------|--------|--------|------|
| 1 | Connecting Frontend & Backend | 14 min | fetch, axios, React Query, CORS | Frontend panggil API |
| 2 | Authentication Flow | 12 min | JWT, refresh token, protected route, auth context | Bikin login flow lengkap |
| 3 | File Upload | 10 min | multer, cloud storage, image optimization | Upload + display gambar |
| 4 | Error Handling & Validation | 10 min | Form validation, error boundary, toast notification | UX error handling |

#### Modul 11 — DevOps & Deployment

| Sesi | Judul | Durasi | Konsep | Demo |
|------|-------|--------|--------|------|
| 1 | Docker Dasar | 14 min | Dockerfile, docker-compose, container vs image | Dockerize Express API |
| 2 | CI/CD Pipeline | 12 min | GitHub Actions, test, build, deploy | Auto-deploy ke Railway |
| 3 | Monitoring & Logging | 10 min | Logging, error tracking, uptime monitoring | Setup Sentry |
| 4 | Cloud Deployment | 12 min | Vercel, Railway, AWS basics | Deploy full-stack app |

### Wave 3 — Advanced (Modul 20-34)

#### Key Modules

| Modul | Topik | Sesi 1 | Sesi 2 | Sesi 3 | Sesi 4 |
|-------|-------|--------|--------|--------|--------|
| 20 | WebSocket | Introduction (10m) | Room & Presence (12m) | Scalable WS (10m) | Project: Chat App (14m) |
| 21 | Next.js | Pages & Routing (12m) | SSR/SSG (12m) | API Routes (10m) | Deploy (8m) |
| 22 | Testing | Unit Test (12m) | Integration Test (12m) | E2E w/ Playwright (14m) | TDD Workflow (10m) |
| 23 | Design Patterns | Singleton/Factory (12m) | Observer/Strategy (12m) | Dependency Injection (10m) | Pattern in React (12m) |
| 24 | Microservices | Architecture (12m) | Message Queue (14m) | API Gateway (10m) | Migration Strategy (10m) |
| 25 | GraphQL | Query & Mutation (12m) | Apollo Server (12m) | Subscriptions (10m) | Federation (12m) |

### Wave 4 — AI & Career (Modul 35-56)

#### AI Focus Modules

| Modul | Topik | Sesi 1 | Sesi 2 | Sesi 3 | Sesi 4 |
|-------|-------|--------|--------|--------|--------|
| 35 | Prompt Engineering | Role prompting (10m) | Chain-of-thought (12m) | Few-shot (10m) | Production prompt (10m) |
| 36 | LLM APIs | OpenAI API (10m) | Streaming (10m) | Function calling (12m) | Cost optimization (10m) |
| 37 | Vector DB & Embeddings | Embeddings (12m) | Pinecone (10m) | Similarity search (10m) | Hybrid search (12m) |
| 38 | AI Agents | ReAct pattern (12m) | Tool use (12m) | Memory (10m) | Multi-agent (14m) |
| 39 | Fine-tuning | LoRA (14m) | Dataset prep (12m) | Training (14m) | Evaluation (10m) |
| 40 | RAG Systems | Chunking (10m) | Retrieval (12m) | Generation (12m) | Production RAG (12m) |

#### Career Modules

| Modul | Topik | Sesi 1 | Sesi 2 | Sesi 3 | Sesi 4 |
|-------|-------|--------|--------|--------|--------|
| 50 | Portfolio Building | Project selection (10m) | README & docs (8m) | Deployment (8m) | Presentation (8m) |
| 51 | CV & LinkedIn | CV structure (10m) | LinkedIn optimization (8m) | Portfolio site (12m) | Networking (8m) |
| 52 | Interview Prep | Technical (14m) | System design (14m) | Behavioral (10m) | Mock interview (14m) |
| 53 | Freelancing | Platform setup (10m) | Client acquisition (10m) | Pricing (8m) | Project management (8m) |

---

## 🎵 YouTube Playlist Strategy

### Playlist Structure

```
[Curriculum Name]
├── 🟢 Beginner Path (00-07)
│   ├── [RPL AI] 00 — Pengenalan & Setup
│   ├── [RPL AI] 01 — JavaScript Dasar
│   ├── [RPL AI] 02 — TypeScript
│   ├── [RPL AI] 03 — Web Development
│   ├── [RPL AI] 04 — Backend Development
│   ├── [RPL AI] 05 — Git & GitHub
│   ├── [RPL AI] 06 — Database
│   └── [RPL AI] 07 — Mastra AI Framework
│
├── 🔵 Intermediate Path (08-19)
│   ├── [RPL AI] 08 — React Dasar
│   ├── [RPL AI] 09 — React Advanced
│   ├── [RPL AI] 10 — Full-stack Integration
│   └── ...
│
├── 🔴 Advanced Path (20-34)
│   └── ...
│
└── ⚫ AI & Career (35-56)
    └── ...
```

### Playlist SEO

**Judul Playlist:**
- "Belajar [Topik] dari Nol — Lengkap untuk Pemula"
- "Tutorial [Topik] Bahasa Indonesia 2025"
- "RPL AI Curriculum: [Nama Modul]"

**Deskripsi Playlist:**
```
📚 Tentang Playlist Ini
Playlist ini adalah bagian dari RPL AI Curriculum — kurikulum belajar AI
Engineering dari nol sampai siap kerja. Semua konten gratis.

🔗 Link kurikulum lengkap: [URL]
💬 Join Discord: [URL]
📧 Kontak: [Email]

🗂️ Urutan Nonton:
1. Tonton sesuai urutan video
2. Kerjain exercise di setiap video
3. Kalo bingung, tanya di Discord

📌 Modul Lainnya:
[Link ke playlist lain]
```

### Thumbnail Template

```
┌─────────────────────────┐
│                         │
│   [Judul Pendek]        │
│   [Icon / Kode]         │
│                         │
│   [Logo RPL AI]         │
│   Modul 07 - Sesi 1     │
└─────────────────────────┘
```

Guidelines:
- Consistent template per modul (warna beda tiap modul)
- Text besar, readable di mobile
- Warna kontras
- Wajah creator (kalo pake webcam) di thumbnail boosting CTR
- Tools: Canva, Photopea, Figma

---

## 👨‍🏫 Recommended Creators & Referensi

### YouTube Channels — Programming (English)

| Creator | Channel | Spesialisasi | Cocok untuk |
|---------|---------|-------------|-------------|
| **Web Dev Simplified** | @WebDevSimplified | React, JS, CSS | Modul 01-04, 08 |
| **Fireship** | @Fireship | Semua topik, cepat | Overview & motivation |
| **Theo - t3.gg** | @t3dotgg | TypeScript, React, Web | Modul 02, 08-10 |
| **Ben Awad** | @benawad | React, GraphQL, Full-stack | Modul 10, 24-25 |
| **Jack Herrington** | @jackherrington | TS patterns, React | Modul 09, 23 |
| **Matt Pocock** | @mattpocockuk | TypeScript advanced | Modul 02 Advanced |
| **Lee Robinson** | @leeerob | Next.js, Full-stack | Modul 21 |
| **Hussein Nasser** | @hnasr | Backend, DB, Architecture | Modul 04, 06, 24 |

### YouTube Channels — AI & Machine Learning (English)

| Creator | Channel | Spesialisasi | Cocok untuk |
|---------|---------|-------------|-------------|
| **Andrej Karpathy** | @andrejkarpathy | Neural Networks, LLMs | Modul 35-40 |
| **Sentdex** | @sentdex | Practical ML, Python AI | Inspirasi project |
| **Nicholas Renotte** | @nicholasrenotte | AI apps, computer vision | Modul 38-40 |
| **AI Jason** | @ai-jason | LLM apps, RAG, Agents | Modul 07, 38 |

### YouTube Channels — Bahasa Indonesia

| Creator | Channel | Spesialisasi | Cocok untuk |
|---------|---------|-------------|-------------|
| **Dea Afrizal** | @deaafrizal | Web development, karir | Semua modul |
| **Idstack** | @idstack | Programming dasar | Modul 00-04 |
| **Kelas Terbuka** | @kelasterbuka | Programming dasar, algoritma | Fundamental |
| **NgodingPython** | @ngodingpython | Python, data | Modul AI |
| **Prawito Hudoro** | @prawitohudoro | Web development | Modul 03-04 |
| **Sekolah Koding** | @sekolahkoding | Web development lengkap | Beginner path |
| **BuildWithAngga** | @buildwithangga | Full-stack, freelancing | Karir path |
| **Eko Kurniawan** | @ekokurniawan | Programming & Linux | DevOps modules |
| **Agung Setiawan** | @agungsetiawan | React, JavaScript | Modul 08-09 |

### Learning Platforms (Non-Video)

| Platform | Konten | Cocok untuk |
|----------|--------|-------------|
| **roadmap.sh** | Learning paths visual | Perencanaan belajar |
| **exercism.org** | Code exercises & mentoring | Latihan tiap modul |
| **frontendmentor.io** | Web design challenges | Modul 03 |
| **leetcode.com** | Algorithm challenges | Interview prep|
| **codewars.com** | Code kata by level | Latihan harian |
| **dev.to** | Artikel programming | Bacaan tambahan |

### Referensi Dokumentasi

| Dokumentasi | URL | Untuk |
|-------------|-----|-------|
| MDN Web Docs | developer.mozilla.org | JavaScript, HTML, CSS |
| TypeScript Handbook | typescriptlang.org/docs | TypeScript |
| React Docs | react.dev | React |
| Next.js Docs | nextjs.org/docs | Next.js |
| Prisma Docs | prisma.io/docs | Database ORM |
| Mastra Docs | mastra.ai/docs | AI Agents |
| Express.js | expressjs.com | Backend |
| Tailwind CSS | tailwindcss.com/docs | CSS Framework |
| Git SCM | git-scm.com/doc | Version control |
| OpenAI Docs | platform.openai.com/docs | AI APIs |

---

## 📓 Companion Notes untuk Tiap Video

Companion notes adalah file markdown yang menyertai setiap video. Isinya: rangkuman, command yang dijalanin, link, dan exercise. Siswa bisa buka di Docsify sambil nonton.

### Template Companion Notes

```markdown
# [Modul X] — [Judul Sesi]

## 📝 Rangkuman
- [Poin 1]
- [Poin 2]
- [Poin 3]

## 💻 Command yang Digunakan

```bash
# Command 1 — keterangan
command yang dijalanin

# Command 2
command lainnya
```

## 🔗 Link Penting
- Dokumentasi: [URL]
- Slide deck: [URL]
- Kode demo: [URL]
- Exercise: [URL]

## ✍️ Challenge
### Soal
[Bunyi soal]

### Expected Output
```
output yang benar
```

### Hint
[Petunjuk kalo mentok]

## 📚 Bacaan Lanjutan
- [Link artikel 1]
- [Link artikel 2]
```

### Companion Notes per Modul — Modul 07 Contoh

```markdown
# [07] Mastra AI — Sesi 1: Agent Dasar

## Rangkuman
- Agent di Mastra = AI yang bisa generate text, pake tools, dan punya memory
- Setiap agent punya: name, instructions, model, tools, memory, output schema
- Model provider: OpenAI, Anthropic, atau local LLM
- Agent dipanggil dengan: agent.generate() atau agent.stream()

## Command
```bash
npm create mastra@latest my-first-agent
cd my-first-agent
npm run dev
```

## Link
- Mastra docs: https://mastra.ai/docs
- Slide: slides/07-mastra/sesi1.md
- Exercise: exercises/07-mastra/README.md

## Challenge
Bikin agent yang bisa jawab 3 pertanyaan tentang programming.
```

---

## 🔍 Troubleshooting Produksi Video

### Audio Issues

| Masalah | Penyebab | Solusi |
|---------|----------|--------|
| Suara menggema | Room reflection | Pake dynamic mic, tambah foam, atau record di room lebih kecil |
| Suara terlalu pelan | Mic gain rendah | Naikin gain di OBS (target -12dB to -6dB) |
| Noise background | Kipas AC, traffic | Noise gate filter di OBS, atau noise reduction di Audacity |
| Plosive (P pop) | Hembusan napas ke mic | Gunakan pop filter, atau mic dari samping (off-axis) |
| Sibilance (S hiss) | Frekuensi S terlalu tajam | De-esser plugin (OBS filter atau post-prod) |

### Video Issues

| Masalah | Penyebab | Solusi |
|---------|----------|--------|
| Kode buram | Bitrate terlalu rendah | Naikin bitrate ke 12-15 Mbps, atau record di 1440p |
| Lag / stutter | OBS overload | Turunin FPS ke 30, matiin preview, atau record pake hardware encoder |
| Audio out of sync | Sample rate mismatch | Pastiin semua audio source 48kHz. Record pake MKV, remux ke MP4 |
| Font kode terlalu kecil | Zoom kurang | Zoom VS Code ke 150-200%. Record area coding aja, bukan full screen |
| Screen flicker | Refresh rate mismatch | Set OBS canvas ke 60fps, display capture → Properties → Deinterlacing |

### Checklist Sebelum Record

- [ ] Notifikasi OS mati (Do Not Disturb mode)
- [ ] Browser tabs: cuma yang relevan terbuka
- [ ] VS Code: font size 16+, terminal font 14+
- [ ] Git: semua perubahan udah di-commit
- [ ] Dependencies udah di-install
- [ ] API keys ada di .env
- [ ] Test record 30 detik — cek audio levels, crop
- [ ] Air minum di samping
- [ ] Mode pesawat / DND di HP

---

## 📤 Distribusi & Engagement

### Upload Schedule

| Wave | Frekuensi | Target |
|------|-----------|--------|
| Wave 1 (Fundamental) | 4 video/minggu | Selesai 8 minggu |
| Wave 2 (Intermediate) | 3 video/minggu | Selesai 12 minggu |
| Wave 3 (Advanced) | 2 video/minggu | Selesai 14 minggu |
| Wave 4 (AI & Career) | 2 video/minggu | Selesai 16 minggu |

### YouTube Description Template

```markdown
📚 [RPL AI] [Modul X] - [Judul Sesi]

Selamat datang di RPL AI Curriculum! Video ini adalah bagian dari
kurikulum belajar AI Engineering gratis dalam Bahasa Indonesia.

🗂️ Materi dalam Video Ini:
00:00 - Intro
00:45 - [Chapter 1]
[X:XX] - [Chapter 2]
[XX:XX] - Outro

📖 Link Penting:
- Kurikulum lengkap: [URL]
- Slide: [URL]
- Exercise: [URL]
- Cheatsheet: [URL]

💬 Join komunitas Discord kita: [URL]
🐦 Twitter: [URL]
📧 Kontak: [URL]

🔗 Playlist lengkap: [URL]

#RPLAI #BelajarAI #Programming #Coding #BahasaIndonesia

---

📌 Jangan lupa subscribe dan nyalain lonceng biar gak ketinggalan video baru!
```

### Engagement Strategy

1. **Setiap video diakhiri dengan CTA (Call to Action):** "Share hasil lo di Discord"
2. **Weekly live Q&A** — jawab pertanyaan dari comment dan Discord
3. **Community showcase** — tiap bulan pilih project terbaik, display di GitHub README
4. **Polling** — "Topik selanjutnya lo mau apa?" pake YouTube Community tab
5. **Progress tracker** — "Udah nonton 10/57 modul. Selamat!"

---

## 📊 Production Tracking

Biar produksi gak molor, pake spreadsheet tracker:

| Field | Contoh |
|-------|--------|
| Modul | 07-Mastra |
| Sesi | 1 |
| Judul | Agent Dasar |
| Status Script | ✅ Done |
| Status Recording | ⏳ In Progress |
| Status Editing | ❌ Not Started |
| Status Upload | ❌ Not Started |
| Durasi Final | 10:23 |
| Notes | Audio noise di menit 3, perlu cut |

Template spreadsheet: [link]

---

Selamat memproduksi video! 🎬

> "The best time to start creating content was yesterday. The second best time is now." — Someone on Twitter
