# 05. 📦 Git & Deployment

## Git Config
```bash
git config --global user.name "Nama Kamu"
git config --global user.email "email@example.com"
git config --list
```

## Basic Workflow
```bash
git init                    # buat repo baru
git clone <url>             # salin repo dari remote
git status                  # cek status file
git add <file>              # staging file
git add .                   # staging semua
git commit -m "pesan"       # commit
git push origin main        # upload ke remote
git pull origin main        # ambil update dari remote
```

## Branching
```bash
git branch              # lihat branch
git branch <nama>       # buat branch baru
git checkout <nama>     # pindah branch
git checkout -b <nama>  # buat + pindah
git merge <branch>      # gabung branch ke current
git branch -d <nama>    # hapus branch
```

## Undoing
```bash
git restore <file>          # undo perubahan (unstaged)
git restore --staged <file> # unstage
git reset --soft HEAD~1     # undo commit, file tetap staged
git reset --hard HEAD~1     # undo + hapus perubahan
git revert <hash>           # undo via commit baru (aman)
```

## .gitignore
```
node_modules/
.env
*.log
dist/
```

## Deployment Flow
```
Local Dev → git add → git commit
  → git push → CI run tests
    → Build (npm run build)
      → Deploy ke server/hosting
```

## Deploy Platforms
| Platform | Type | Fitur |
|----------|------|-------|
| Vercel | Frontend | Auto-deploy dari Git |
| Netlify | Frontend | Forms, Functions |
| Railway | Fullstack | DB + App |
| Firebase | Backend | Auth, DB, Hosting |
| GitHub Pages | Static | Gratis |

## CI/CD Basics
```yaml
# .github/workflows/deploy.yml
name: Deploy
on: push
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install && npm run build
```

## Common Pitfalls
- ❌ Commit besar + pesan tidak jelas
- ❌ Push ke `main` langsung (pakai branch & PR)
- ❌ Lupa `.gitignore` → node_modules ikut terpush
- ❌ Merge conflict — baca file, hapus `<<<<<<<`, `=======`, `>>>>>>>`

## Related Links
- [27 Linux Terminal](27-linux-terminal.md)
