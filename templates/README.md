# 🛠️ Starter Templates

Template tinggal clone & run. Udah include setup TypeScript, linting, dll. Semua template pake **Bahasa Indonesia** di dokumentasi dan kode.

Setiap template dirancang untuk kebutuhan spesifik — dari belajar dasar TypeScript sampai bikin aplikasi AI full-stack dengan database. Template ini dipake di kurikulum **SMK RPL AI** sebagai boilerplate untuk tugas, UKK, dan portofolio siswa.

## Daftar Template

| Template | Stack | Untuk | Level |
|----------|-------|-------|-------|
| [Basic TypeScript](basic-ts/) | TypeScript 5, tsx, Node.js | Latihan TS/JS dasar, belajar type system | Pemula |
| [Express API](express-api/) | Express 4, TypeScript, CORS | Backend REST API production-ready | Menengah |
| [Mastra Agent](mastra-agent/) | Mastra AI, Express, OpenAI | AI agent development dengan tools | Mahir |
| [Web Static](web-static/) | HTML5, CSS3, JavaScript vanilla | Landing page, prototyping, deploy Vercel | Pemula |
| [AI Tutor](ai-tutor/) | Next.js 14, Mastra, Prisma, OpenAI | Aplikasi AI tutor interaktif full-stack | Mahir |

## Perbandingan Template

| Fitur | basic-ts | express-api | mastra-agent | web-static | ai-tutor |
|-------|----------|-------------|--------------|------------|----------|
| TypeScript | ✅ | ✅ | ✅ | ❌ | ✅ |
| Server | ❌ | ✅ Express | ✅ Express + AI | ❌ (static) | ✅ Next.js |
| Database | ❌ | ❌ | ❌ | ❌ | ✅ Prisma/SQLite |
| AI/Agent | ❌ | ❌ | ✅ Mastra + Tools | ❌ | ✅ Mastra + Tools |
| UI | ❌ (CLI) | ❌ (API) | ❌ (API) | ✅ HTML/CSS/JS | ✅ React + Tailwind |
| Hot Reload | ✅ tsx watch | ✅ tsx watch | ✅ tsx watch | ✅ live-server | ✅ Next.js dev |
| Deploy | Node server | Node server | Node server | Vercel/Netlify | Vercel/Railway |
| Bahasa | Indonesia | Indonesia | Indonesia | Indonesia | Indonesia |

## Kapan Pake Template Mana

### basic-ts — Belajar TypeScript dari Nol
Pake template ini kalo lu:
- Baru belajar TypeScript dan mau cobain basic type system
- Butuh playground minimalis buat eksperimen
- Mau latihan konsep kayak interface, generic, async/await
- Ga butuh server atau database — pure CLI tool

### express-api — Backend REST API
Pake template ini kalo lu:
- Mau bikin REST API pake Express + TypeScript
- Butuh template backend yang udah include CORS, dotenv, error handling
- Mau belajar routing, middleware, dan struktur project backend
- Persiapan proyek UKK atau tugas backend

### mastra-agent — AI Agent Development
Pake template ini kalo lu:
- Mau belajar AI agent framework (Mastra)
- Butuh template agent dengan tools integration
- Ingin eksperimen dengan LLM providers (OpenAI, Anthropic, Ollama)
- Mau bikin chatbot pinter yang bisa panggil fungsi

### web-static — Landing Page & Prototype
Pake template ini kalo lu:
- Butuh template static website cepat
- Mau bikin landing page atau prototipe
- Ingin deploy ke Vercel dalam 1 menit
- Ga perlu backend atau database

### ai-tutor — Full-Stack AI App
Pake template ini kalo lu:
- Mau bikin aplikasi AI lengkap dengan database
- Butuh chat UI interaktif untuk tutor AI
- Ingin integrasi Next.js + Mastra Agent + Prisma
- Persiapan proyek AI skala besar

## Cara Pake

Ada dua cara pake template ini:

### Opsi 1: degit (recommended)
```bash
# Clone template yang lo mau
npx degit path/ke/template/basic-ts my-project
cd my-project
npm install
npm run dev
```

### Opsi 2: Copy manual
```bash
cp -r templates/basic-ts/ my-project/
cd my-project
rm -rf node_modules dist
npm install
npm run dev
```

## Requirements

Semua template butuh:

- **Node.js >= 18** (recommended: 20 LTS)
- **npm** atau **yarn** atau **pnpm**
- **(khusus Mastra/AI Tutor)** API key OpenAI

Cek versi Node:
```bash
node --version   # harus v18.x atau lebih baru
```

## Struktur Template

```
templates/
├── basic-ts/          # Minimal TypeScript starter
│   ├── src/index.ts
│   ├── package.json
│   └── tsconfig.json
├── express-api/       # Express REST API
│   ├── src/index.ts
│   ├── package.json
│   └── tsconfig.json
├── mastra-agent/      # Mastra AI Agent
│   ├── src/agent.ts
│   ├── src/index.ts
│   └── package.json
├── web-static/        # Static website
│   ├── index.html
│   ├── style.css
│   └── app.js
├── ai-tutor/          # Next.js AI Tutor
│   ├── src/app/
│   ├── src/agent.ts
│   └── prisma/
└── README.md          # Dokumentasi ini
```

## Cara Kerja Masing-Masing Template

### basic-ts — TypeScript Playground
Template ini pake **tsx** (esbuild-based) instead of ts-node. Kenapa? Karena tsx 10x lebih cepat dan ga perlu konfigurasi tambahan. Script `npm run dev` langsung jalanin TypeScript dengan hot-reload — tiap kali file berubah, server otomatis restart. Cocok buat yang baru pertama kali nyobain TypeScript.

Yang lu bisa pelajari dari template ini:
- Type annotations & interfaces
- Generic functions
- Async/await dengan Promise types
- Array methods yang type-safe
- Map & Set dengan typed keys

### express-api — REST API Backend
Template ini pake arsitektur Express standar dengan middleware CORS, JSON body parser, dan lingkungan environment variables. Error handler global udah include — jadi kalo ada error di route manapun, response tetep JSON rapi. Mode development pake `tsx watch` buat auto-restart.

Yang lu bisa pelajari:
- Routing & middleware Express
- Request/response typing dengan TypeScript
- Error handling pattern
- Environment variables management
- Production build process

### mastra-agent — AI Agent Framework
Template ini ngenalin konsep **AI agent** dengan Mastra. Agent adalah entitas AI yang bisa panggil tools/functions secara otonom. Di template ini agent punya tool `getCurrentTime` — tapi lu bisa tambah tool apapun: search, kalkulasi, database query, API external.

Konsep penting:
- Agent definition dengan system instructions
- Tool definition dengan Zod schema
- Model providers (support OpenAI, Anthropic, Ollama, Groq)
- Chat completion dengan context

### web-static — Vanilla JS Website
Template static paling ringan — HTML semantic, CSS modern dengan dark theme, dan JavaScript ES6+. Siap deploy ke Vercel tinggal `npx vercel`. Ga perlu Node.js server buat jalanin — cukup static file server apapun.

Yang lu bisa pelajari:
- Semantic HTML5 elements
- CSS custom properties (variables)
- Modern CSS (gradient, flexbox, shadow)
- Vanilla JS DOM manipulation
- Fetch API & error handling

### ai-tutor — Full-Stack AI Application
Template paling kompleks — gabungan Next.js 14 (React full-stack), Mastra (AI agent), dan Prisma (ORM database). Pake App Router Next.js dengan API route `app/api/chat`. Agent punya dua tools: getCurrentTime dan calculateGrade. Chat history disimpen di SQLite via Prisma.

Konsep penting:
- Next.js App Router & API routes
- Server components vs client components
- Prisma schema & migrations
- AI agent dengan custom tools
- Database persistence untuk chat history

## Catatan Penting

1. **Hapus node_modules** kalo copy manual — selalu `npm install` ulang di project baru.
2. **TypeScript templates** — pake `tsx` untuk development (hot-reload), `tsc` untuk build production.
3. **Environment variables** — template yang butuh API key selalu include `.env.example`. Copy ke `.env` dan isi.
4. **Bahasa Indonesia** — semua dokumentasi, komentar kode, dan response API pake Bahasa Indonesia biar konsisten dengan kurikulum.
5. **Template siap pakai** — tinggal `npm install && npm run dev`, langsung jalan tanpa config tambahan.
6. **Node.js version** — pastikan pake Node.js 18+. Cek pake `node --version`. Kalo masih 16, upgrade dulu.
7. **Package manager** — template udah include `package-lock.json`. Bisa pake npm, yarn, atau pnpm.

## Troubleshooting

### Error: module not found
```bash
rm -rf node_modules
npm install
```

### Error: port already in use
Ganti PORT di `.env` atau set environment variable:
```bash
PORT=4000 npm run dev
```

### Error: OPENAI_API_KEY not set
Pastiin udah copy `.env.example` ke `.env` dan isi API key:
```bash
cp .env.example .env
# Edit .env - isi OPENAI_API_KEY
```

### Error: tsx not found
```bash
npm install -g tsx
# atau pake npx
npx tsx src/index.ts
```

## Development

Template ini bagian dari **RPL AI Curriculum** — kurikulum AI untuk SMK jurusan RPL. Setiap template dirancang sesuai level kompetensi siswa dan bisa dipake untuk:

- **Pembelajaran mandiri** — siswa explore sendiri dengan panduan README
- **Tugas praktek** — template sebagai boilerplate tinggal develop fitur
- **Proyek UKK** — dasar pengembangan aplikasi sesuai spek
- **Portofolio** — deploy dan presentasi di GitHub Pages / Vercel
- **Latihan UKK** — develop API, integrasi database, testing endpoint

## Kontribusi

Mau nambah template baru? Buka issue atau pull request di repository RPL AI Curriculum. Template harus:

1. Pake Bahasa Indonesia untuk dokumentasi & komentar
2. TypeScript/JavaScript (sesuai kurikulum)
3. Include README.md dengan cara pake yang jelas
4. Siap jalan dengan `npm install && npm run dev`
5. Ga include node_modules di repository
