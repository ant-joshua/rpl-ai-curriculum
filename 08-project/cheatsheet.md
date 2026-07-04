# 🧠 Cheatsheet: Final Project

> Referensi cepet — 1 halaman. Print atau bookmark.

## Topik Utama
- **Full-stack AI App**: Express + React/Next.js + Mastra AI + PostgreSQL
- **Project Planning**: GitHub Project Board, ERD, user stories
- **Sprint 1**: Setup project structure, planning
- **Sprint 2**: CRUD features + authentication (JWT)
- **Sprint 3**: Integrate Mastra AI agent + tools
- **Sprint 4**: Polish UI, error handling, deploy (Vercel + Railway)
- **Output**: Deployed app, README, API docs, presentation

## Stack

```
Frontend → Vercel (Next.js / React + Tailwind)
Backend  → Railway (Express + TypeScript)
Database → PostgreSQL (Railway / Neon)
AI       → Mastra AI (OpenAI / Claude)
Auth     → JWT (jsonwebtoken)
```

## Command Penting

```bash
git init
git add . && git commit -m "init"
git push -u origin main

# Deploy
npx vercel --prod          # Frontend
npx railway up             # Backend
```

## Tips & Trik
- Pisah FE & BE jadi 2 repo atau mono-repo pake workspaces
- JWT: pake `accessToken` (15m) + `refreshToken` (7d)
- Environment variables: `.env` di root, jangan commit
- AI integration: minimal 2 Mastra tools (e.g. search + summarize)
- README wajib: deskripsi, tech stack, cara run, fitur

## Common Mistakes
- ❌ Scope terlalu besar — mulai dari MVP (1 fitur utama)
- ❌ Lupa handle loading & error state di frontend
- ❌ API key hardcoded → pake `.env`
- ❌ Ga testing sebelum deploy — cek console error dulu

## Link Cepat
- [Module README](README.md)
- [Latihan](../exercises/08-project.md)
- [Quiz](quiz.md)
