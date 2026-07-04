# 🧠 Cheatsheet: Git & GitHub + Deploy

> Referensi cepet — 1 halaman. Print atau bookmark.

## Topik Utama
- **Git**: Version control system — snapshot kode
- **Basic Flow**: `git init` → `git add` → `git commit` → `git push`
- **Branching**: `git branch`, `git checkout -b feat/xyz`, `git merge`
- **GitHub Collaboration**: fork, clone, PR, code review
- **Deploy Frontend**: Vercel (auto-deploy dari GitHub)
- **Deploy Backend**: Railway (auto-deploy dari GitHub)
- **Environment Variables**: `.env` file, config di dashboard deploy

## Command Penting

```bash
# Git basics
git init                  # Aktifkan git di folder
git status                # Cek perubahan
git add .                 # Stage semua file
git add file.ts           # Stage file tertentu
git commit -m "Pesan"     # Simpan snapshot
git log --oneline         # Lihat history

# Branch & merge
git branch nama-branch    # Buat branch baru
git checkout nama-branch  # Pindah branch
git checkout -b feat/xyz  # Buat + pindah sekaligus
git merge nama-branch     # Gabung branch ke current

# Remote
git remote add origin <url>
git push -u origin main   # Push pertama
git pull                  # Tarik perubahan terbaru
```

## Deploy Commands
- **Vercel**: `npx vercel` atau connect GitHub → auto
- **Railway**: `npx railway login` → `railway up` atau connect GitHub

## Tips & Trik
- Tulis `.gitignore`: node_modules, .env, dist/
- Commit message: `feat:`, `fix:`, `chore:`, `docs:` prefix
- Pull sebelum push: `git pull --rebase` biar ga ada merge commit
- Branch naming: `feat/login`, `fix/typo`, `chore/deps`

## Common Mistakes
- ❌ Commit langsung ke `main` → pake branch + PR
- ❌ Push `.env` ke public — simpan API key di dashboard deploy
- ❌ `git add .` tanpa cek `.gitignore` → byk file sampah ke repo
- ❌ Merge conflict panik — baca file conflict, hapus `<<<<<<<`, `=======`, `>>>>>>>`

## Link Cepat
- [Module README](README.md)
- [Latihan](../exercises/05-git-deploy.md)
- [Quiz](quiz.md)
