# RPP: Portfolio Project Series

| Info | Detail |
|------|--------|
| Kode | RPL-AI-48 |
| Durasi | 5 pertemuan × 90 menit |
| Level | Advanced |
| Prasyarat | Modul 6 (Backend), Modul 11 (Frontend) |

## Pertemuan 1: Landing Page Portfolio

### Tujuan
- Membangun landing page personal portfolio dengan HTML/CSS/Tailwind
- Menerapkan responsive design dan aksesibilitas
- Mendeploy ke Vercel/Netlify

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi: demo portfolio bagus vs jelek, diskusi "apa yang recruiter lihat?" | Tanya jawab | Browser |
| 15' | Materi inti: Tailwind CSS utility-first, responsive breakpoints, dark mode toggle, aksesibilitas (semantic HTML, aria labels, contrast) | Ceramah + demo | Live code |
| 30' | Praktik terbimbing: setup project Tailwind, build hero section + about + projects grid + contact form, responsive mobile-first | Hands-on | Starter template |
| 20' | Materi deploy: Vercel/Netlify setup, custom domain, form handler (Formspree), analytics | Ceramah + demo | Vercel dashboard |
| 10' | Latihan mandiri: tambah project cards, testimonial section, deploy | Problem solving | Soal |
| 5' | Refleksi: portfolio sebagai living document — kapan perlu update? | Q&A | — |

### Bahan Ajar
- [Module README](../48-portfolio-project-series/README.md)
- [Landing Page](../48-portfolio-project-series/01-landing-page.md)

---

## Pertemuan 2: CRUD API — Bookshelf API

### Tujuan
- Membangun REST API dengan Express + TypeScript + Prisma
- Mengimplementasikan CRUD dengan validasi input
- Dokumentasi API dengan Swagger/OpenAPI
- Deploy ke Railway

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Review: landing page done, transisi ke backend project | Q&A | — |
| 20' | Materi inti: setup Express + TypeScript, Prisma schema + migration, CRUD routes, Zod validation, error handling | Ceramah + demo | Live code |
| 30' | Praktik terbimbing: setup Prisma with PostgreSQL, generate migration, buat routes (GET, POST, PUT, DELETE), test dengan Thunder Client | Hands-on | Starter code |
| 15' | Materi deploy: Railway setup, environment variables, auto-deploy from GitHub | Ceramah + demo | Railway dashboard |
| 10' | Latihan mandiri: tambah search/filter endpoint, Swagger docs | Problem solving | Soal |
| 5' | Refleksi: RESTful best practices — naming convention, status codes | Q&A | — |

### Bahan Ajar
- [Module README](../48-portfolio-project-series/README.md)
- [CRUD API](../48-portfolio-project-series/02-crud-api.md)

---

## Pertemuan 3: Fullstack Todo App with Auth

### Tujuan
- Membangun fullstack app React + Express + JWT/OAuth
- Mengimplementasikan autentikasi JWT dan OAuth Google
- Integrasi frontend-backend dengan environment variables

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Review: CRUD API, sekarang ditambah frontend + auth | Q&A | Slide |
| 20' | Materi inti: JWT access/refresh token, OAuth Google (Passport.js/OAuth2), protected routes middleware, React auth context | Ceramah + demo | Live code |
| 30' | Praktik terbimbing: setup Express auth routes (register, login, refresh, logout), React AuthContext + ProtectedRoute, integrate login/register form | Hands-on | Starter code |
| 20' | Materi lanjutan: environment variables frontend/backend, CORS production, refresh token rotation, deploy FE + BE terpisah | Ceramah + demo | Railway, Vercel |
| 10' | Latihan mandiri: tambah OAuth Google login, profile page | Problem solving | Soal |
| 5' | Refleksi: JWT vs session — mana untuk use case apa? | Q&A | — |

### Bahan Ajar
- [Module README](../48-portfolio-project-series/README.md)
- [Fullstack App](../48-portfolio-project-series/03-fullstack-app.md)

---

## Pertemuan 4: AI Agent App — Chat Assistant

### Tujuan
- Membangun AI Chat Assistant dengan Mastra AI + Next.js
- Mengimplementasikan tool calling dan RAG memory
- Mendeploy ke Vercel

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Review: fullstack auth app, transisi ke AI-powered app | Q&A | — |
| 20' | Materi inti: Mastra AI framework, agent setup, OpenAI integration, tool calling, RAG memory (vector store), streaming response | Ceramah + demo | Live code |
| 30' | Praktik terbimbing: setup Next.js + Mastra AI agent, buat chat endpoint, tool calling (current time, calculator), streaming UI | Hands-on | Starter code |
| 15' | Materi lanjutan: system prompt design, memory management, rate limiting, error handling, deploy ke Vercel | Ceramah + demo | Vercel dashboard |
| 10' | Latihan mandiri: tambah custom tool (search web/docs), improve prompt | Problem solving | Soal |
| 5' | Refleksi: AI agent as portfolio piece — apa yang recruiter cari? | Q&A | — |

### Bahan Ajar
- [Module README](../48-portfolio-project-series/README.md)
- [AI Agent App](../48-portfolio-project-series/04-ai-agent-app.md)

---

## Pertemuan 5: Production Deploy — Docker, VPS, CI/CD, Monitoring

### Tujuan
- Setup production-grade deployment dengan Docker
- Deploy ke VPS dengan Nginx reverse proxy + SSL
- Setup CI/CD pipeline dengan PM2 auto-restart
- Integrasi monitoring (Sentry, uptime monitoring)

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 5' | Review: 4 project sebelumnya, semua perlu production deploy | Q&A | — |
| 20' | Materi inti: Dockerfile production, multi-stage build, Docker Compose, VPS setup (Ubuntu, Nginx, SSL Certbot), firewall UFW | Ceramah + demo | Live code |
| 25' | Praktik terbimbing: Dockerize Express + React app, deploy ke VPS, setup Nginx reverse proxy, SSL with Certbot, PM2 process manager | Hands-on | VPS, terminal |
| 20' | Materi lanjutan: CI/CD with GitHub Actions (deploy on push), environment secrets, Sentry error tracking, uptime monitoring (UptimeRobot) | Ceramah + demo | GitHub Actions |
| 15' | Latihan mandiri: setup monitoring dashboard, health check endpoint, alert notification | Problem solving | Soal |
| 5' | Refleksi: portfolio showcase — 5 project live, 1 repositori per project | Q&A | — |

### Bahan Ajar
- [Module README](../48-portfolio-project-series/README.md)
- [Production Deploy](../48-portfolio-project-series/05-production-deploy.md)
