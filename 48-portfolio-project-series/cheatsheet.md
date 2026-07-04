# 🧠 Cheatsheet: Portfolio Project Series

> Referensi cepet — 1 halaman.

## 5 Project Arc

| # | Project | Tech Stack | Deploy | Durasi |
|---|---------|------------|--------|--------|
| 1 | **Landing Page Portfolio** | HTML, CSS, Tailwind CSS | Vercel / Netlify | 1 minggu |
| 2 | **Bookshelf CRUD API** | Express, TypeScript, Prisma, PostgreSQL | Railway | 1 minggu |
| 3 | **Todo App with Auth** | React, Tailwind, Express, JWT, OAuth | Railway + Vercel | 1–2 minggu |
| 4 | **AI Chat Assistant** | Mastra AI, OpenAI, Next.js | Vercel | 1 minggu |
| 5 | **Production Setup** | Docker, VPS, Cloudflare, PM2, Sentry | VPS | 1 minggu |

## Key Commands

```bash
# Project 1 — Landing Page
npx create-vite@latest landing-page -- --template vanilla-ts
npx tailwindcss init -p
npm run dev                     # dev server
npm run build                   # production build
vercel --prod                   # deploy to Vercel

# Project 2 — CRUD API
npx create-express-api bookshelf-api --typescript
npx prisma init                 # setup Prisma + schema
npx prisma migrate dev --name init
npx prisma studio               # GUI database
railway login && railway up     # deploy to Railway

# Project 3 — Fullstack App
npx create-react-app todo-app --template typescript
npm install jsonwebtoken bcrypt
npm run dev                     # frontend
# backend: Express + JWT + OAuth Google

# Project 4 — AI Agent
npx create-next-app ai-chat
npx mastra init                 # init Mastra AI project
npm install @mastra/core openai
npm run dev                     # local with Mastra

# Project 5 — Production Deploy
docker build -t myapp .
docker compose up -d            # run on VPS
pm2 start dist/index.js --name app
pm2 save && pm2 startup         # persist after reboot
```

## Deploy Targets

| Platform | Cocok | Command |
|----------|-------|---------|
| Vercel | Static, Next.js | `vercel --prod` |
| Netlify | Static sites | `netlify deploy --prod` |
| Railway | Full-stack API + DB | `railway up` |
| VPS (DO/Linode) | Docker + Docker Compose | `docker compose up -d` |

## Tips & Trik
- **1 project = 1 repo** — lebih impressive di portfolio daripada 1 repo 5 folder
- **README wajib:** apa, kenapa, tech stack, cara run, live demo URL, screenshot
- **.env.example** di-commit, .env jangan
- **Live demo > code** — recruiter klik link, bukan clone repo
- **AI Agent (Project 4):** butuh OpenAI API key + Mastra tool calling + RAG memory

## Common Mistakes
- ❌ No README or empty README — 20% grade langsung hilang
- ❌ Hardcode secrets in code — always use `.env`
- ❌ Skip CI/CD (Project 5) — manual deploy tiap perubahan
- ❌ No responsive design — 15% UI/UX grade
- ❌ Wrong Prisma schema → `npx prisma migrate dev` fixes

## Link Cepat
- [Module README](.)
- [Quiz](quiz.md)
