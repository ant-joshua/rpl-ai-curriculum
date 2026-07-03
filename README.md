# 🗺️ RPL AI Curriculum

> **Kurikulum Rekayasa Perangkat Lunak Era AI — 3 Bulan × 2x/Minggu**
> Dari nol sampai bisa bikin AI-powered web app + deploy.

[![Docsify](https://img.shields.io/badge/docsify-site-blue?style=flat-square)](https://docsify.js.org)
[![Node](https://img.shields.io/badge/Node-18+-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org)
[![Mastra](https://img.shields.io/badge/Mastra-AI%20Framework-FF6B35?style=flat-square)](https://mastra.ai)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)

---

## Pilih Jalur Belajar

Seperti [roadmap.sh](https://roadmap.sh), kamu bisa pilih jalur sesuai minat:

| 🧭 Jalur | 🎯 Target | ⏱️ Estimasi |
|----------|-----------|-------------|
| [**🌐 Full-Stack Web**](paths/04-fullstack.md) ✅ _recommended_ | Website + API + AI Agent | 12 minggu |
| [**🎨 Frontend Web**](paths/01-frontend-web.md) | HTML/CSS/JS + React | 8 minggu |
| [**⚙️ Backend API**](paths/02-backend-api.md) | Node.js + Express + Database | 8 minggu |
| [**🤖 AI Agent**](paths/03-ai-agent.md) | Mastra + Agents + RAG | 8 minggu |

---

## Peta Belajar (Roadmap)

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': { 'primaryColor': '#1a1a2e', 'primaryTextColor': '#e0e0e0', 'primaryBorderColor': '#4a4a6a', 'lineColor': '#6c6c9a', 'secondaryColor': '#16213e', 'tertiaryColor': '#0f3460'}}}%%
flowchart LR
  subgraph Beginner["🌱 Beginner (Minggu 1-4)"]
    JS[JavaScript Dasar] --> TS[TypeScript]
    JS --> GIT[Git & GitHub]
  end

  subgraph Intermediate["📐 Intermediate (Minggu 5-8)"]
    TS --> WEB[HTML/CSS/Tailwind]
    WEB --> NODE[Node.js + Express]
    NODE --> DB[Database SQL]
    TS --> MASTRA[Mastra AI Framework]
    MASTRA --> AGENTS[Agents + Tools]
    AGENTS --> MEMORY[Memory + RAG]
  end

  subgraph Advanced["🚀 Advanced (Minggu 9-12)"]
    DB --> DEPLOY[Deploy Railway]
    WEB --> FE[DEPLOY Vercel]
    MEMORY --> WORKFLOWS[Mastra Workflows]
    AGENTS --> FULLSTACK[Full-Stack Integration]
    FULLSTACK --> FINAL[Final Project]
    DEPLOY --> FINAL
    FE --> FINAL
  end

  style Beginner fill:#1a1a2e,stroke:#4a4a6a,color:#e0e0e0
  style Intermediate fill:#16213e,stroke:#4a4a6a,color:#e0e0e0
  style Advanced fill:#0f3460,stroke:#4a4a6a,color:#e0e0e0
```

---

## Modul

> Urutan: dari kiri ke kanan di roadmap. Tiap modul butuh modul sebelumnya.

| # | Modul | Level | Jam | Prasyarat |
|---|-------|-------|-----|-----------|
| 1 | **[JavaScript Fundamentals](01-js-fundamentals/)** | 🌱 Beginner | 8 | — |
| 2 | **[Algorithms & Data Structures](02-algorithms-data-structures/)** | 🌱 Beginner | 8 | Modul 1 |
| 3 | **[TypeScript Basics](03-typescript/)** | 🌱 Beginner | 4 | Modul 1 |
| 4 | **[Web Basics (HTML/CSS/Tailwind)](04-web-basics/)** | 🌱 Beginner | 6 | — |
| 5 | **[Git & GitHub + Deploy](05-git-deploy/)** | 🌱 Beginner | 4 | Modul 1 |
| 6 | **[Node.js & Express](06-node-express/)** | 📐 Intermediate | 6 | Modul 1, 3 |
| 7 | **[Database SQL](06-node-express/03-database.md)** | 📐 Intermediate | 3 | Modul 6 |
| 8 | **[Mastra AI — Agents & Tools](07-mastra-ai/)** | 📐 Intermediate | 8 | Modul 1, 3 |
| 9 | **[Mastra AI — Memory & RAG](07-mastra-ai/04-rag.md)** | 🚀 Advanced | 4 | Modul 8 |
| 10 | **[Testing — Vitest & Integration](09-testing/)** | 🚀 Advanced (Elektif) | 4 | Modul 6 |
| 11 | **[Final Project](08-project/)** | 🚀 Advanced | 8 | Semua |

### Elektif (Tambahan)

| Modul | Level | Jam |
|-------|-------|-----|
| [React Dasar](electives/01-react-intro.md) | 📐 Intermediate | 6 |
| [Docker](electives/03-docker.md) | 🚀 Advanced | 3 |
| [Next.js](electives/02-nextjs.md) | 🚀 Advanced | 6 |

## 🏆 Capstone Projects

Project besar yang ngetes semua skill. Cocok buat final project atau portofolio.

| # | Capstone | AI Fitur |
|---|----------|----------|
| 1 | [AI Study Assistant](capstones/01-ai-study-assistant/) | AI tutor, quiz generator, RAG |
| 2 | [AI Travel Planner](capstones/02-ai-travel-planner/) | Agent itinerary, weather, budget |
| 3 | [E-Commerce + AI](capstones/03-ecommerce-ai/) | Product recs, semantic search, chatbot |
| 4 | [AI Content Hub](capstones/04-ai-content-hub/) | AI write, summarize, auto-tag |
| 5 | [Coding Bootcamp](capstones/05-coding-bootcamp/) | AI code review, exercise gen, tutor |
| 6 | [Community Q&A](capstones/06-community-qa/) | AI answer suggestions, auto-tag, moderation |

> Tiap capstone punya sprint plan 8 minggu, data model, API spec, dan rubrik penilaian.

---

## Cara Pakai Repo Ini

### 📖 Baca sebagai Website

Repo ini pake [Docsify](https://docsify.js.org) — tinggal buka `index.html`:

```bash
# Opsi 1: Buka langsung
npx docsify serve .

# Opsi 2: Buka index.html di browser
# (Docsify CDN-loaded, koneksi internet required)
```

### 📄 Export sebagai PDF

```bash
# Pakai md-to-pdf
npx md-to-pdf README.md

# Atau pakai pandoc
pandoc README.md -o kurikulum.pdf --from markdown --to pdf
```

### 🖥️ Baca langsung di GitHub

Repo ini pure markdown — render otomatis di GitHub. Mulai dari [README](README.md).

---

## Prasyarat

| Skill | Level |
|-------|-------|
| Bisa pakai komputer (browser, file manager) | Dasar |
| Logika dasar (ngerti flowchart, urutan langkah) | Dasar |
| Bahasa Inggris (baca dokumentasi — dibantu AI) | Bisa dibantu |
| **Tidak perlu** pengalaman coding sebelumnya | — |

---

## Tools yang Dipakai

| Tools | Untuk | Gratis? |
|-------|-------|---------|
| [Node.js](https://nodejs.org) | Runtime JavaScript/TypeScript | ✅ |
| [VS Code](https://code.visualstudio.com) | Code editor | ✅ |
| [Git](https://git-scm.com) | Version control | ✅ |
| [GitHub](https://github.com) | Repo hosting + portfolio | ✅ |
| [Mastra AI](https://mastra.ai) | AI framework | ✅ |
| [Ollama](https://ollama.com) | Local AI (opsional) | ✅ |
| [Tailwind CSS](https://tailwindcss.com) | CSS framework | ✅ |
| [Vercel](https://vercel.com) | Deploy frontend | ✅ (free tier) |
| [Railway](https://railway.app) | Deploy backend | ✅ (free tier) |

---

## 📦 Supplementary Resources

Selain modul, repo ini juga punya:

| Sumber | Deskripsi |
|--------|-----------|
| [📋 Exercises](exercises/) | Latihan per modul (JS + DSA + others) |
| [🎯 Mini Projects](mini-projects/) | 5 project kecil selesai 1-2 sesi |
| [🚀 Project Ideas](projects/) | 15 ide project (easy → advanced + AI) |
| [🛠️ Starter Templates](templates/) | Template TypeScript, Express, Mastra |
| [📖 Glossary](glossary/) | Istilah teknis bahasa Indonesia |
| [📦 Deployment Guides](guides/) | Vercel, Railway, VPS deployment steps |
| [👨‍🏫 Teacher Guide](teacher-guide/) | Panduan ngajar per sesi (buat guru) |
| [📊 Grading Rubric](grading/) | Rubrik penilaian tugas + final project |
| [💼 Career Guide](career/) | CV, GitHub portfolio, LinkedIn tips |
| [⚙️ CI/CD](.github/workflows/) | GitHub Actions auto-test + deploy |

> Semua file `.md` — bisa dibaca langsung di GitHub atau lewat Docsify.

---

## Kontribusi

Kurikulum ini open untuk feedback & perbaikan.  
Buka issue atau pull request kalo ada saran.

---

## Lisensi

MIT — bebas dipake, diubah, disebarin buat pembelajaran.
