<img src="https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=1" alt="Git & Deploy" style="width:100%;border-radius:12px;margin:12px 0;">

# 05. Git & GitHub + Deploy

> **Level:** 🌱 Beginner  
> **Jam:** 4 (2 minggu × 2 sesi)  
> **Prasyarat:** JavaScript Fundamentals  
> **Output:** Semua project di GitHub + landing page live

## Tujuan Pembelajaran

Setelah modul ini, kamu bisa:
- Pake Git buat version control project sendiri
- Commit, branch, merge, rebase kayak dev profesional
- Paham git internal (objects, HEAD, index, reflog)
- Kolaborasi lewat GitHub (push, pull, pull request, fork, code review)
- Deploy frontend ke Vercel / Cloudflare Pages
- Deploy backend ke Railway / Docker
- Atur environment variable & custom domain
- Setup CI/CD pipeline otomatis
- Rollback aplikasi kalo error

## Materi

| Sesi | Topik | Durasi | File |
|------|-------|--------|------|
| 1 | **Git Basics** — init, add, commit, log, diff, branch, merge, rebase, reset, revert, stash, .gitignore, git internal (blob/tree/commit, HEAD, index), reflog, troubleshooting | 90 menit | [📖 01-git-basics.md](01-git-basics.md) |
| 2 | **GitHub Collaboration** — remote, clone, push, pull, fetch, branch strategy, PR, code review, issues, project boards, fork workflow, git flow vs trunk-based, conflict resolution, GitHub CLI, GitHub Actions | 90 menit | [📖 02-github-collab.md](02-github-collab.md) |
| 3 | **Deploy** — Vercel (HTML, React/Next.js), Cloudflare Pages, Railway (Node/Express, Python/Flask), Docker deploy, env variable management, CI/CD pipeline (GitHub Actions), rollback strategies (blue-green, git revert), health check monitoring, custom domain | 90 menit | [📖 03-deploy.md](03-deploy.md) |

## Output Akhir Modul

> **GitHub Repo + Landing Page Live** — repo berisi project landing page + API backend, terdeploy di Vercel + Railway, bisa diakses publik, dengan CI/CD otomatis.

## Ringkasan Perintah Git Penting

| Perintah | Fungsi |
|----------|--------|
| `git init` | Inisialisasi repo baru |
| `git add` | Stage file ke staging area |
| `git commit` | Simpan snapshot permanen |
| `git status` | Cek status file |
| `git log` | Lihat riwayat commit |
| `git diff` | Lihat perubahan file |
| `git branch` | Kelola branch |
| `git checkout` / `git switch` | Pindah branch |
| `git merge` | Gabung branch |
| `git rebase` | Mindahin base branch |
| `git stash` | Simpen kerjaan sementara |
| `git reset` | Balik ke commit tertentu |
| `git revert` | Batalin commit aman |
| `git push` | Kirim ke remote |
| `git pull` | Ambil dari remote |
| `git fetch` | Download info remote |
| `git remote` | Kelola remote URL |
| `git tag` | Tandai versi rilis |
| `git reflog` | Catatan semua gerakan HEAD |

## AI Prompt Exercises

Sepanjang modul, latihan pake AI:
- "Explain this git command and what it does in detail"
- "I got a merge conflict in this file — help me resolve it"
- "Generate a .gitignore file for a Node.js project"
- "Review my commit history and tell me if the messages are good"
- "What's the difference between git reset --soft, --mixed, and --hard?"
- "I accidentally committed to main instead of a branch — how to fix?"
- "Set up a GitHub Actions workflow to deploy my Next.js app to Vercel"
- "Explain the fork workflow for contributing to open source"
- "I need to roll back my production deploy — what's the safest way?"
