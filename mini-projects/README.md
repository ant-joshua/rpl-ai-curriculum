# 🎯 Mini Projects — RPL AI Curriculum

Projek kecil-kecil yang bisa diselesaikan dalam 1-3 sesi belajar. Setiap projek dirancang buat mengasah skill spesifik yang udah dipelajari di modul terkait. Cocok buat portofolio dan pemahaman konsep secara praktik langsung.

---

## 📋 Daftar Projek

| # | Projek | Modul Terkait | Level | Estimasi |
|---|--------|---------------|-------|----------|
| 1 | Password Generator | 01-JS | 🌱 Beginner | 1 sesi |
| 2 | Todo CLI | 01-JS | 🌱 Beginner | 1 sesi |
| 3 | Markdown Previewer | 02-TS | 🌱 Beginner | 1 sesi |
| 4 | Weather Dashboard | 03-Web | 🌱 Beginner | 2 sesi |
| 5 | API Notes | 04-Backend | 📐 Intermediate | 2 sesi |
| 6 | URL Shortener | 04-Backend | 📐 Intermediate | 2 sesi |
| 7 | Chatbot Agent (Mastra) | 07-Mastra | 📐 Intermediate | 2 sesi |
| 8 | Personal Dashboard | 06-DB | 📐 Intermediate | 3 sesi |
| 9 | Real-time Chat App | 08-WS | 🚀 Advanced | 3 sesi |
| 10 | AI Content Generator | 07-Mastra | 🚀 Advanced | 3 sesi |
| 11 | GitHub Profile Analyzer | 09-API | 🚀 Advanced | 2 sesi |
| 12 | E-Commerce API | 04-Backend | 🚀 Advanced | 3 sesi |
| 13 | Multi-Agent Research Tool | 07-Mastra | 🚀 Advanced | 3 sesi |
| 14 | Full-stack Expense Tracker | ALL | 🏆 Capstone | 4 sesi |

---

## 🌱 Beginner (1-2 Sesi)

### 01. Password Generator

**Tujuan:** Bikin random password generator yang bisa dikustomisasi lewat CLI atau browser.

**Persyaratan Fungsional:**
- Generate password dengan panjang variabel (8-64 karakter)
- Opsi include: huruf besar (A-Z), huruf kecil (a-z), angka (0-9), simbol (!@#$%^&*)
- Opsi exclude karakter ambigu (il1Lo0O)
- Copy to clipboard button
- Progress bar / animasi saat generate (bonus)
- Password strength indicator (weak/medium/strong)

**Persyaratan Non-Fungsional:**
- Zero dependency untuk logic utama
- UI responsive (kalo web)
- Minimal 1 test case

**Tech Stack:**
- CLI version: Node.js native (no dependencies)
- Web version: HTML + CSS + vanilla JS
- Alternatif: React + Tailwind (kalo udah belajar)

**Rubrik Penilaian:**

| Kriteria | Belum (0) | Cukup (1) | Baik (2) | Istimewa (3) |
|----------|-----------|-----------|----------|--------------|
| Fungsi dasar | Gak bisa generate | Bisa generate random | + Opsi kustomisasi | + Strength indicator + clipboard |
| Code quality | Satu file panjang | Dipisah fungsi | Modular + error handling | Unit test |
| UX | CLI doang | Web sederhana | + Copy + strength | Animasi + aksesibilitas |
| Security | Math.random() | crypto.randomBytes | + Exclude ambiguous | Rate limiting |

**Saran Pengembangan:**
- Bikin versi CLI pake `commander` atau `yargs`
- Tambah opsi `--no-simbol` `--min-number` `--exclude`
- Save password history ke file JSON

---

### 02. Todo CLI

**Tujuan:** CLI app buat manajemen todo list — CRUD operations dari terminal.

**Persyaratan Fungsional:**
- `node todo.js add "Belajar TypeScript"` — tambah todo
- `node todo.js list` — lihat semua todo
- `node todo.js done <id>` — tandai selesai
- `node todo.js delete <id>` — hapus todo
- `node todo.js clear` — hapus semua
- Todo disimpan di file `todos.json`

**Persyaratan Non-Fungsional:**
- File persistence (JSON)
- Color output (pake `chalk` atau escape codes)
- Error handling untuk input invalid
- Exit code yang proper (0 = sukses, 1 = error)

**Tech Stack:**
- Node.js native (fs, path)
- Opsional: chalk, commander, figlet

**Rubrik Penilaian:**

| Kriteria | 0 | 1 | 2 | 3 |
|----------|---|---|---|---|
| CRUD | Kurang dari 3 operasi | 4 operasi dasar | All CRUD + clear | + Search + filter |
| Persistence | Gak pake file | Pake JSON | + Pretty print | + Backup otomatis |
| UX | Plain text | Color output | + Loading spinner | + Table format + emoji |
| Error handling | Crash kalo error | Try-catch | Validasi input | Graceful degradation |

**Saran Pengembangan:**
- Tambah prioritas (high/medium/low)
- Tambah due date
- Filter: `todo list --done` `todo list --priority high`
- Export ke CSV

---

### 03. Markdown Previewer

**Tujuan:** Live markdown editor + preview di browser. Ketik di kiri, lihat hasil render di kanan.

**Persyaratan Fungsional:**
- Textarea untuk ngetik markdown
- Preview panel yang update real-time
- Support: heading, bold, italic, link, image, code block, list, blockquote
- Syntax highlighting di code block (opsional: Prism.js atau highlight.js)
- Toggle antara edit/preview/split view
- Download hasil sebagai HTML

**Persyaratan Non-Fungsional:**
- Zero lag di preview (debounce 300ms)
- Responsive (mobile friendly)
- Minimal 3 test unit

**Tech Stack:**
- React + marked (library markdown)
- Alternatif: vanilla JS + marked CDN
- Styling: Tailwind atau CSS modules

**Learning Objectives:**
- Controlled component di React
- Event handling + debounce
- dangerouslySetInnerHTML (dan kenapa hati-hati)
- Component composition (Editor, Preview, Toolbar)

**Rubrik:**

| Kriteria | 0 | 1 | 2 | 3 |
|----------|---|---|---|---|
| Markdown support | < 5 element | 5-8 element | All basic + code highlight | + Table + task list + emoji |
| UI/UX | Textarea + div doang | Split view | + Toolbar + responsive | + Theme toggle + fullscreen |
| Code | Satu component | Dipisah rapi | Custom hook | Unit test |
| Ekstra | - | Download HTML | Syntax highlight | Drag-drop file |

---

## 📐 Intermediate (2-3 Sesi)

### 04. Weather Dashboard

**Tujuan:** Dashboard cuaca yang fetch data dari API publik dan tampilkan informasi secara visual.

**Persyaratan Fungsional:**
- Input kota / deteksi lokasi otomatis (geolocation)
- Tampilkan: suhu sekarang, icon cuaca, kelembaban, kecepatan angin
- Forecast 5 hari (atau 7 hari)
- Grafik suhu harian (pake Chart.js atau buat sendiri)
- History pencarian (localStorage)
- Unit toggle (°C / °F)
- Background berubah sesuai cuaca (cerah → kuning, hujan → biru gelap)

**Persyaratan Non-Fungsional:**
- Loading state (skeleton)
- Error handling (kota not found, network error)
- Responsive
- Accessibility (ARIA labels)

**Tech Stack:**
- API: OpenWeatherMap / WeatherAPI / BMKG
- Frontend: React + Tailwind + Chart.js
- Deploy: Vercel / Netlify
- Alternatif: vanilla JS + CSS Grid

**Rubrik:**

| Kriteria | 0 | 1 | 2 | 3 |
|----------|---|---|---|---|
| API Integration | Gak connect | Fetch + display | + Forecast + loading | + Error handling + retry |
| Visual | List doang | Cards + icon | + Chart + animation | + Dynamic background |
| Features | Cuaca sekarang | + Forecast | + History + unit toggle | + Geolocation + offline |
| Code Quality | Messy | Terstruktur | Custom hooks | Test + PropTypes |

**Saran Pengembangan:**
- Tambah peta (Leaflet.js) yang nunjukkin lokasi
- Notifikasi kalo hujan besok
- PWA (installable)
- Bandingin cuaca multiple kota

---

### 05. API Notes (Express + TypeScript)

**Tujuan:** REST API untuk notes app — lengkap dengan auth, pagination, search.

**Persyaratan Fungsional:**
- `POST /api/auth/register` — register user
- `POST /api/auth/login` — login, return JWT
- `GET /api/notes` — list notes (pagination + search)
- `POST /api/notes` — buat note baru
- `GET /api/notes/:id` — detail note
- `PUT /api/notes/:id` — update note
- `DELETE /api/notes/:id` — hapus note (soft delete)
- Note punya: title, content, tags, color, pinned

**Persyaratan Non-Fungsional:**
- TypeScript strict mode
- Validasi input (Zod)
- Error handling middleware
- Rate limiting
- CORS
- Minimal 5 integration test

**Tech Stack:**
- Express.js + TypeScript
- PostgreSQL via Prisma ORM / Drizzle
- Zod untuk validasi
- JWT (jsonwebtoken) untuk auth
- Jest + Supertest untuk testing

**Rubrik:**

| Kriteria | 0 | 1 | 2 | 3 |
|----------|---|---|---|---|
| API Design | < 5 endpoint | All CRUD | + Auth + pagination | + Search + tags + soft delete |
| Database | File JSON | SQLite | PostgreSQL + Prisma | + Migration + seed |
| Security | No auth | JWT | + Validation + rate limit | + Refresh token + helmet |
| Testing | Manual | 1-2 test | 5 integration test | + Unit test + CI |

**Saran Pengembangan:**
- Swagger/OpenAPI docs
- Dockerize
- Deploy ke Railway / Render
- WebSocket untuk real-time sync

---

### 06. URL Shortener

**Tujuan:** Bikin URL shortener kayak bit.ly — generate short code, redirect, tracking.

**Persyaratan Fungsional:**
- `POST /api/shorten` — shorten URL, return short code (6 karakter)
- `GET /:code` — redirect ke URL asli
- Hitung jumlah klik
- Optional: custom alias
- Optional: expiration date
- Dashboard: lihat semua URL + stats

**Persyaratan Non-Fungsional:**
- Short code unique dan unpredictable (pake nanoid)
- Redirect pake 301 (permanent) atau 302 (temporary)
- Rate limiting per IP
- Minimal 3 test

**Tech Stack:**
- Node.js + Express + TypeScript
- Database: PostgreSQL / SQLite (via Prisma)
- Nanoid untuk short code generation

**Rubrik:**

| Kriteria | 0 | 1 | 2 | 3 |
|----------|---|---|---|---|
| Core functionality | Gak redirect | Shorten + redirect | + Click counter | + Custom alias + expiry |
| Database | In-memory | File | SQLite/Postgres | + Index + migration |
| API | 1 endpoint | 2 endpoints | + Dashboard API | + Pagination + search |
| Production | Local | Rate limit | + Docker | + Deploy + monitoring |

---

### 07. Chatbot Agent (Mastra)

**Tujuan:** AI chatbot pake Mastra framework — agent yang bisa ngobrol, ingat konteks, dan pake tools.

**Persyaratan Fungsional:**
- Agent nyapa user
- Jawab pertanyaan programming
- Ingat nama user (memory)
- Bisa ngasih joke (tool: random joke API)
- Bisa hitung ekspresi matematika (tool: calculator)
- Multi-turn conversation (memory)

**Persyaratan Non-Fungsional:**
- TypeScript
- Streaming response
- Error handling
- Minimal 3 test case untuk evaluasi

**Tech Stack:**
- Mastra AI Framework
- OpenAI / Anthropic model
- Mastra Memory
- Zod untuk tool schema
- tsx untuk development

**Rubrik:**

| Kriteria | 0 | 1 | 2 | 3 |
|----------|---|---|---|---|
| Agent | Bisa generate | + Instructions proper | + Tools (2+) | + Memory multi-turn |
| Tools | - | Calculator tool | + Joke API tool | + Weather / search tool |
| Memory | No memory | In-memory | Mastra Memory | + Context window management |
| Evaluation | Manual | 1 test case | 3 test cases | + Pass rate metric |

---

## 🚀 Advanced (3-4 Sesi)

### 08. Personal Dashboard

**Tujuan:** Dashboard pribadi yang aggregasi info dari berbagai sumber — cuaca, berita, calendar, quotes, todo.

**Persyaratan Fungsional:**
- Widget: cuaca, berita terkini, inspirational quotes, todo list, jam digital
- Drag-and-drop widget rearrangement
- Customizable layout (save ke localStorage atau DB)
- Add/remove widget
- Theme toggle (light/dark)
- Data persist antar session

**Persyaratan Non-Fungsional:**
- Modular widget architecture
- Lazy loading untuk widget berat
- Responsive (grid system)
- Animasi transisi halus

**Tech Stack:**
- React + TypeScript
- dnd-kit (drag & drop)
- Tailwind CSS
- API: OpenWeather, NewsAPI, quotable.io
- Vite sebagai build tool

**Learning Objectives:**
- Compound component pattern
- State management (Context / Zustand)
- Custom hook untuk setiap widget
- Drag & drop dengan dnd-kit
- API orchestration (parallel fetch)

**Rubrik:**

| Kriteria | 0 | 1 | 2 | 3 |
|----------|---|---|---|---|
| Widget system | Fixed layout | Bisa add/remove | Drag & drop + persist | + Resize + config per widget |
| Data fetching | Sequential | Parallel | + Error per widget | + Retry + loading skeleton |
| UI/UX | Plain | Themed | + Dark mode + responsive | + Animation + accessibility |
| Architecture | Monolith | Component-based | + Custom hooks | + Lazy load + test |

---

### 09. Real-time Chat App

**Tujuan:** Chat application real-time pake WebSocket — multi-room, typing indicator, online status.

**Persyaratan Fungsional:**
- Login dengan username
- Multiple chat rooms
- Real-time messaging (WebSocket)
- Typing indicator (user X sedang mengetik...)
- Online/offline status
- Message history (load more)
- Emoji picker

**Persyaratan Non-Fungsional:**
- WebSocket reconnection
- Message queue kalo offline
- Rate limiting chat
- Scalable ke 100+ concurrent users

**Tech Stack:**
- Backend: Node.js + Socket.io + Express
- Frontend: React + Socket.io-client
- Database: PostgreSQL + Redis (untuk presence)
- Deploy: Docker + Railway

**Rubrik:**

| Kriteria | 0 | 1 | 2 | 3 |
|----------|---|---|---|---|
| Real-time | Polling | WebSocket | + Multiple room | + Typing + online status |
| Frontend | Text doang | + Room list | + Emoji + scroll | + Image share + notification |
| Backend | One room | Multi room | + Auth + rate limit | + Redis pub/sub + cluster |
| Production | Local | Docker | + Deploy | + Monitoring + load test |

---

### 10. AI Content Generator (Mastra)

**Tujuan:** Agent yang bisa generate konten marketing — blog post, social media caption, email newsletter.

**Persyaratan Fungsional:**
- Input: topik, tone (formal/casual/humor), panjang, platform (blog/Twitter/email)
- Output: draft konten sesuai parameter
- Multi-agent: Writer → Editor → SEO Reviewer
- Export ke markdown
- History generation (tersimpan)
- Feedback loop: user kasih rating, agent belajar

**Persyaratan Non-Fungsional:**
- Streaming output
- Structured output pake Zod
- Error handling per agent
- Minimal 5 eval test case

**Tech Stack:**
- Mastra AI Framework
- OpenAI / Anthropic
- Mastra Workflow (sequential pipeline)
- Mastra Memory
- TypeScript + tsx

**Rubrik:**

| Kriteria | 0 | 1 | 2 | 3 |
|----------|---|---|---|---|
| Content quality | Garbage out | Coherent | + Tone sesuai | + Engaging + SEO |
| Workflow | Single agent | 2 agents | 3 agents (write → edit → SEO) | + Feedback loop |
| Features | Generate doang | + Parameter | + Export + history | + Rating + learning |
| Evaluation | Manual | 1 test | 3 eval test | + Pass rate + metrics |

**Saran Pengembangan:**
- Tambah image generation (DALL-E / Stable Diffusion)
- Auto-post ke social media
- A/B testing tone

---

### 11. GitHub Profile Analyzer

**Tujuan:** Tool yang analisis profil GitHub user — repo, bahasa, kontribusi, statistik.

**Persyaratan Fungsional:**
- Input username GitHub
- Tampilkan: profile info, repositori (dengan star, fork, language)
- Grafik bahasa yang paling sering dipake
- Contribution chart (kueri GitHub GraphQL API)
- Star history chart
- Compare 2 user
- Export sebagai resume/CV

**Persyaratan Non-Fungsional:**
- GitHub API rate limit handling
- Cache response (pake localStorage atau Redis)
- Loading skeleton
- Error state

**Tech Stack:**
- React + TypeScript + Tailwind
- GitHub REST API + GraphQL API
- Chart.js / Recharts
- Vite

**Rubrik:**

| Kriteria | 0 | 1 | 2 | 3 |
|----------|---|---|---|---|
| API integration | REST doang | REST + GraphQL | + Pagination + cache | + Rate limit handling |
| Visualization | Text doang | Bar chart | + Pie chart + timeline | + Compare mode |
| Features | Profile info | + Repo list | + Language chart + contribution | + Export + compare |
| Code | Spaghetti | Modular | Custom hooks | Test + error boundary |

---

### 12. E-Commerce API

**Tujuan:** REST API untuk e-commerce — produk, keranjang, order, pembayaran.

**Persyaratan Fungsional:**
- `GET /api/products` — list produk (filter, sort, pagination, search)
- `GET /api/products/:id` — detail produk
- `POST /api/auth/register` & `/login`
- `GET /api/cart` — lihat keranjang
- `POST /api/cart` — tambah ke keranjang
- `DELETE /api/cart/:itemId` — hapus dari keranjang
- `POST /api/orders` — checkout (buat order dari cart)
- `GET /api/orders` — riwayat order
- `GET /api/orders/:id` — detail order

**Persyaratan Non-Fungsional:**
- TypeScript strict
- Validasi Zod
- PostgreSQL + Prisma
- Authentication (JWT) di semua protected route
- Pagination (cursor-based)
- Rate limiting + CORS
- Swagger docs

**Tech Stack:**
- Express.js / Hono / Fastify
- TypeScript
- PostgreSQL + Prisma
- Zod
- JWT
- Swagger (swagger-jsdoc + swagger-ui-express)

**Rubrik:**

| Kriteria | 0 | 1 | 2 | 3 |
|----------|---|---|---|---|
| Endpoints | < 5 endpoint | All CRUD produk | + Auth + cart | + Order + payment mock |
| Database | JSON file | SQLite | PostgreSQL + Prisma | + Migration + seed + index |
| Validation | None | Manual | Zod schema | + Custom error messages |
| Documentation | None | README | Swagger UI | + Postman collection + test |

---

### 13. Multi-Agent Research Tool (Mastra)

**Tujuan:** Agent yang bisa riset topik secara otomatis — cari informasi, rangkum, dan presentasi.

**Persyaratan Fungsional:**
- Input: topik riset + kedalaman (ringkas/sedang/mendalam)
- Orchestrator agent breakdown topik jadi sub-topik
- Research agent cari info per sub-topik (simulasi atau API)
- Writer agent rangkum jadi artikel terstruktur
- Reviewer agent cek akurasi
- Output: artikel markdown + daftar sumber
- Multi-language support (Indonesia, English)

**Persyaratan Non-Fungsional:**
- Workflow dengan branching (parallel research)
- Error handling per agent — satu agent gagal gak ngerusak seluruhnya
- Timeout per step
- Caching hasil riset

**Tech Stack:**
- Mastra AI + Workflow
- OpenAI / Anthropic
- TypeScript

**Rubrik:**

| Kriteria | 0 | 1 | 2 | 3 |
|----------|---|---|---|---|
| Architecture | Single agent | 2 agents | 3+ agents + orchestrator | + Parallel research |
| Workflow | Sequential | Sequential + branching | + Error handling per step | + Timeout + retry |
| Output quality | Random | Coherent | + Structure + sources | + Multi-language |
| Robustness | Gampang error | Try-catch | Graceful degradation | + Caching + logging |

---

### 14. Full-stack Expense Tracker (🏆 Capstone)

**Tujuan:** Final project yang menggabungkan semua skill — backend, frontend, database, AI, deployment.

**Persyaratan Fungsional:**
- **Auth**: Register, login (JWT), profile management
- **Transactions**: CRUD pengeluaran/pemasukan (amount, category, date, notes)
- **Categories**: Predefined + custom categories
- **Dashboard**: Total balance, monthly summary, chart pengeluaran per kategori
- **AI Feature**: Agent yang analisis pola pengeluaran, kasih saran budget, deteksi anomali
- **Export**: CSV/PDF laporan keuangan
- **Recurring**: Transaksi berulang (bulanan/mingguan)
- **Budget**: Set budget per kategori, notifikasi kalo melebihi

**Persyaratan Non-Fungsional:**
- TypeScript (frontend + backend)
- PostgreSQL + Prisma
- Minimal 10 integration test
- Docker
- CI/CD (GitHub Actions)
- Deploy ke Vercel (frontend) + Railway (backend)

**Tech Stack:**
- Frontend: React + TypeScript + Tailwind + React Query
- Backend: Express/Hono + TypeScript + Prisma + PostgreSQL
- AI: Mastra Agent untuk financial analysis
- Testing: Vitest + Supertest
- Deploy: Docker + Railway + Vercel

**Rubrik:**

| Kriteria | 0 | 1 | 2 | 3 |
|----------|---|---|---|---|
| Backend | < 5 endpoint | CRUD transaksi | + Auth + category + recurring | + Budget + AI analysis + export |
| Frontend | HTML doang | React + routing | + Dashboard + chart | + AI insight + responsive + PWA |
| Database | JSON | SQLite | PostgreSQL + migration | + Seed data + indexing + query optimization |
| AI Feature | None | Agent basic | Agent analisis pengeluaran | + Saran budget + anomaly detection |
| Testing | Manual | 3 test | 10 integration test | + Unit test + E2E + CI |
| Deployment | Local | Deployed 1 service | Full stack deployed | + Domain + HTTPS + monitoring |

---

## 📊 Progression Path

```
Beginner                    Intermediate                Advanced
─────────                   ────────────                ────────
Password Generator  ───→    Weather Dashboard  ───→     Real-time Chat App
Todo CLI             ───→   API Notes           ───→    E-Commerce API
Markdown Previewer   ───→   URL Shortener       ───→    Multi-Agent Research
                    ┌──→    Chatbot Agent                AI Content Generator
                    │                                   Full-stack Expense Tracker
                    └──→    Personal Dashboard ───→     GitHub Profile Analyzer
```

Rekomendasi: Kerjain sesuai urutan di atas. Setiap level build di atas skill dari level sebelumnya.

---

## 💡 Tips Mengerjakan Mini Project

1. **Jangan over-engineering.** Mulai dari solusi paling sederhana yang works. Refactor after it works.
2. **Commit sering.** Setiap fitur selesai = 1 commit. Latih Git workflow.
3. **Baca dokumentasi.** Before you ask ChatGPT, read the docs first.
4. **Error = guru.** Setiap error message adalah pelajaran. Baca, pahami, fix.
5. **Portofolio matters.** Setiap projek yang selesai, deploy + tulis README yang rapi. Ini buat lamaran kerja.
6. **Code review.** Minta teman atau AI review kode lo. Belajar dari feedback.
7. **Selesai > sempurna.** Lebih baik punya 5 projek selesai daripada 10 projek setengah jadi.

## 🔧 Starter Template

```bash
# Template struktur folder mini project
mini-project/
├── src/
│   ├── index.ts          # Entry point
│   ├── utils/            # Helper functions
│   └── types/            # Type definitions
├── tests/                # Test files
├── README.md             # Dokumentasi projek
├── package.json
├── tsconfig.json
└── .env.example
```

Selamat ngoding! 🚀
