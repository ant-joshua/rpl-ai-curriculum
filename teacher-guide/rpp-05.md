# RPP: Git & GitHub + Deploy

| Info | Detail |
|------|--------|
| Kode | RPL-AI-05 |
| Durasi | 2 pertemuan × 90 menit |
| Level | Beginner |
| Prasyarat | JavaScript Fundamentals (Modul 01) |

## Pertemuan 1: Git Basics — init, add, commit, log, reset

### Tujuan
- Menginisialisasi repository Git
- Melakukan staging, commit, melihat history
- Membuat .gitignore yang tepat

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | **Apersepsi**: "Pernah kehapus file project?" — analogi mesin waktu | Tanya jawab | Slide |
| 15' | **Git setup**: git config, git init, git status | Demo | Terminal |
| 20' | **Staging & commit**: git add, git commit, git log, git diff | Ceramah + demo | Live code |
| 15' | **.gitignore**: apa itu, pola, generate untuk Node/TS | Ceramah | Terminal + gitignore.io |
| 15' | **Reset & amend**: git reset, --soft vs --hard, --amend | Demo | Terminal |
| 10' | **Praktik**: Init repo landing page, commit 3x , cek log, reset 1 commit | Hands-on | Terminal |
| 5' | **Refleksi**: Tulis 3 perintah Git favorit di sticky note | Q&A | — |

### Bahan Ajar
- [Module 05 - Git Basics](../05-git-deploy/01-git-basics.md)

---

## Pertemuan 2: GitHub Collaboration + Deploy

### Tujuan
- Push/pull repository ke GitHub
- Membuat dan merge branch
- Deploy frontend ke Vercel, backend ke Railway

### Kegiatan (90 menit)

| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 5' | **Review git command** | Kuis command line | — |
| 15' | **GitHub remote**: git remote, push, pull, clone | Ceramah + demo | GitHub + Terminal |
| 15' | **Branch & merge**: git branch, checkout, merge, PR | Ceramah + demo | GitHub |
| 10' | **Conflict resolution**: sengaja bikin conflict, resolve bareng | Demo | Terminal + GitHub |
| 10' | **Vercel deploy**: connect repo, auto-deploy | Demo | Vercel |
| 10' | **Railway deploy**: env vars, custom domain | Demo | Railway |
| 20' | **Praktik**: Push project, deploy landing page, atur custom domain | Hands-on | GitHub + Vercel |
| 5' | **Refleksi**: Git workflow mana yang paling berguna buat proyek lo? | Q&A | — |

### Bahan Ajar
- [Module 05 - GitHub Collab](../05-git-deploy/02-github-collab.md)
- [Module 05 - Deploy](../05-git-deploy/03-deploy.md)
