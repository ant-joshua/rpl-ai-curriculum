# 1.1 Git Basics — Version Control

Git = **mesin waktu** buat kode lo. Setiap perubahan tercatat, lo bisa balik kapan aja. Git dipake Google, Meta, Microsoft, GitHub — standar industri.

## Kenapa Git Penting?

| Tanpa Git | Pake Git |
|-----------|----------|
| "final_project_v3_revisi_fix_2.zip" | Satu folder, version otomatis |
| Error → gak bisa balik | `git checkout` / `git restore` → balik ke versi aman |
| Takut ngubah kode | Berani eksperimen di branch |
| "Siapa yang ngerusak ini?" | `git blame` — tau persis siapa & kapan |
| Tim pake USB / Google Drive | Tim realtime pake GitHub |
| Backup manual | Push ke cloud 1 detik |

## Cara Kerja Git — Internal Objects

Git bukan sekedar "simpan file". Git adalah **content-addressable filesystem** — setiap perubahan disimpan sebagai object unik.

### 4 Tipe Object Git

```
Object Git:
├── Blob     — isi file (binary/text)
├── Tree     — daftar file + folder (seperti direktori)
├── Commit   — snapshot: tree + author + message + parent commit
└── Tag      — alias buat commit (biasa buat rilis)
```

Setiap object punya **hash unik** (SHA-1) — 40 karakter hex:

```
$ git hash-object README.md
cbf6c2e3c5b1a7d0f4e8a9b1234567890abcdef01
```

Hash ini jadi **ID** setiap object. Git gak pake nama file — pake hash. Makanya Git tau persis kalo file berubah (hash-nya beda).

### 3 Area Git

```
  Working Directory        Staging Area              Repository (.git)
    (file lo)              (index / cache)            (commit history)
       │                        │                         │
       │── git add file ───────>│                         │
       │                        │── git commit ──────────>│
       │                        │                         │
       │<──── git checkout ─────│─────────────────────────│
       │                        │                         │
```

1. **Working Directory** — tempat lo edit file (kode lo sekarang di filesystem)
2. **Staging Area (Index)** — file yang udah siap di-commit (`git add`). Ada di `.git/index`
3. **Repository (.git/)** — snapshot permanen (`git commit`). Ada di folder `.git/objects/`

### HEAD — Pointer Aktif

**HEAD** = pointer ke commit/ branch yang sedang aktif.

```bash
# HEAD biasanya nunjuk ke branch
cat .git/HEAD
# Output: ref: refs/heads/main

# Waktu checkout branch, HEAD nunjuk ke branch baru
git checkout fitur-login
cat .git/HEAD
# Output: ref: refs/heads/fitur-login

# Detached HEAD — HEAD nunjuk langsung ke commit (bukan branch)
git checkout abc123
# Warning: You are in 'detached HEAD' state
```

**Detached HEAD** = lo lagi liat commit lama. Kalo lo commit disini, commit bakal ilang kalo checkout branch lain. Kecuali lo bikin branch baru: `git checkout -b branch-baru`.

## Setup Awal

```bash
# Cek git terinstall
git --version
# Output: git version 2.x.x

# Setting identitas (SEKALI SEUMUR HIDUP! cukup 1x)
git config --global user.name "Nama Kamu"
git config --global user.email "email@kamu.com"

# Cek setting
git config --list

# Setting default branch name (biar gak 'master' kuno)
git config --global init.defaultBranch main

# Setting editor (optional)
git config --global core.editor "code --wait"   # VSCode
git config --global core.editor "nano"          # Nano (terminal)

# Alias biar cepat ngetik
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.lg "log --oneline --graph --all"
# Abis ini: git st = git status, git lg = git log --oneline --graph --all
```

## Inisialisasi & Commit Pertama

```bash
# Bikin folder project
mkdir portfolio-saya
cd portfolio-saya

# Bikin file
echo "# Portfolio Saya" > README.md
echo "<h1>Halo Dunia</h1>" > index.html

# Init git — bikin repository
git init
# Output: Initialized empty Git repository in .../portfolio-saya/.git/

# Cek isi .git — ini jantung Git
ls -la .git/
# HEAD  config  description  hooks/  info/  objects/  refs/

# Cek status — file apa aja yang berubah
git status
# Output:
# On branch main
# No commits yet
# Untracked files:
#   README.md
#   index.html

# Stage — tandain file yang mau di-track
git add README.md
git add index.html
# Atau pake . buat semua file
# git add .

# Cek isi .git/objects — sekarang ada object baru!
find .git/objects -type f

# Commit — simpan snapshot pertama
git commit -m "chore: init project dengan README dan index.html"
# Output: 2 files changed, 2 insertions(+)

# Lihat object yang ke-commit
git log --oneline
# abc1234 chore: init project dengan README dan index.html
```

## Git Workflow Harian — Siklus Standar

```bash
# 1. Edit file → happy
# 2. Cek apa yang berubah
git status

# 3. Stage file yang mau di-commit
git add index.html
git add .

# 4. Commit dengan pesan jelas
git commit -m "feat: tambah navbar ke index.html"

# 5. Ulangi...
#    Atau pake shortcut: git commit -am "pesan" (add + commit, cuma file tracked)
git commit -am "fix: perbaiki typo di navbar"
# CATATAN: -am cuma buat file yang udah pernah di-track. File baru tetep harus git add.
```

## Commit Message Convention

Pake **Conventional Commits** — format standar yang dipake tim profesional di Open Source & enterprise:

```
feat: tambah fitur login              # Fitur baru
fix: perbaiki bug di navbar           # Bug fix
docs: update README                   # Dokumentasi
style: format kode, beresin CSS       # Cosmetics (spasi, indentasi)
refactor: pisah fungsi validation     # Refaktor kode (gak nambah fitur)
perf: optimasi query database         # Performance improvement
test: tambah unit test login          # Testing
chore: update dependencies            # Maintenance (build, CI, config)
opsi: tambah tipe optional            # Konfigurasi opsional
ci: tambah GitHub Actions             # CI/CD pipeline
```

**Format:**
```
<type>[optional scope]: <description>

[optional body — jelaskan KENAPA]

[optional footer — contoh: BREAKING CHANGE, Closes #123]
```

**Contoh lengkap:**
```
feat(auth): tambah login dengan Google OAuth

Implementasi Google OAuth 2.0 pake Passport.js.
User bisa login pake akun Google tanpa register manual.

Closes #45
BREAKING CHANGE: endpoint /api/login diubah dari POST ke GET
```

## Git Log — Lihat Riwayat & Investigasi

```bash
# Daftar commit (default)
git log

# 1 line per commit (paling sering dipake)
git log --oneline

# Visual graph (kalo ada branch) — liat struktur merges
git log --oneline --graph --all

# Batasi jumlah
git log --oneline -5    # 5 commit terakhir

# Cari commit tertentu
git log --author="Budi"
git log --grep="fix:"   # Cari commit dengan message "fix:"
git log --since="2024-01-01" --until="2024-12-31"
git log --after="2 weeks ago"

# Format kustom
git log --pretty=format:"%h - %an, %ar : %s"
# %h = hash pendek, %an = author name, %ar = relative date, %s = subject

# Lihat file spesifik di commit tertentu
git show abc123 --stat

# Siapa yang ngubah baris tertentu?
git blame index.html
# abc1234 (Budi 2024-01-15) <h1>Halo</h1>
# def5678 (Ani  2024-01-16) <p>Deskripsi</p>
```

## Git Diff — Apa yang Berubah

```bash
# Sebelum di-stage: perubahan di working directory vs index
git diff

# Setelah di-stage: perubahan di index vs commit terakhir
git diff --staged   # alias: git diff --cached

# Bandingin 2 commit
git diff abc123..def456

# Bandingin 2 branch
git diff main..fitur-login

# Cuma file tertentu
git diff -- index.html

# Statistik perubahan (berapa baris berubah)
git diff --stat

# Word diff (bukan line) — bagus buat teks panjang
git diff --word-diff
```

## Branch — Kerja Paralel

Branch = **pointer ke commit**. Gak ada "copy-an" kode — Git cuma bikin pointer baru. Makanya bikin branch super cepat & murah.

```bash
# Lihat branch
git branch
# * main — asterisk = branch aktif

# Bikin branch baru
git branch fitur-login

# Pindah
git checkout fitur-login

# Bikin + pindah SEKALIGUS (paling sering!)
git checkout -b fitur-login

# (Cara baru v2.23+) switch = checkout untuk branch
git switch fitur-login
git switch -c fitur-login  # bikin + pindah

# Rename branch
git branch -m old-name new-name

# Lihat branch yang udah di-merge
git branch --merged
git branch --no-merged
```

## Merge — Gabung Branch

```bash
# Selesai fitur, gabung ke main
git checkout main
git pull origin main       # Ambil update terbaru
git merge fitur-navbar     # Gabung fitur-navbar ke main

# Hapus branch yang udah gak dipake
git branch -d fitur-navbar
git branch -D fitur-navbar   # Force delete (kalo belum di-merge)
```

### 3 Jenis Merge

```bash
# 1. Fast-forward — gak ada divergensi (tinggal geser pointer)
git merge fitur-navbar
# Output: Fast-forward — gak ada commit baru

# 2. Automatic merge — divergensi, tapi gak conflict
git merge fitur-navbar
# Output: Merge made by the 'ort' strategy
# → Ada merge commit baru

# 3. Conflict merge — sama-sama ubah file/baris yang sama
git merge fitur-navbar
# Output: CONFLICT (content) in index.html
# → Manual resolve dulu
```

## Rebase — Alternative Merge

Rebase = mindahin base branch ke ujung branch lain. Bikin history **linear**, lebih bersih.

```bash
# Situasi: fitur dibuat dari main lama (main udah maju)
# Opsi A — merge: bikin merge commit
git checkout fitur
git merge main

# Opsi B — rebase: mindahin base fitur ke ujung main
git checkout fitur
git rebase main
# Sekarang commit fitur "ditempel" di ujung main
# History: ... A - B - C - D' - E'   (D,E jadi D',E' — hash baru!)

# Kalo conflict di rebase:
git rebase main
# CONFLICT!
git add file-conflict.js
git rebase --continue   # Lanjut rebase
# Atau:
git rebase --skip       # Lewatin commit ini
git rebase --abort      # Batalkan total
```

**ATURAN EMAS: Jangan pernah rebase branch publik / shared!**
Rebase mengubah history — hash commit berubah. Kalo orang lain udah punya branch itu, mereka bakal chaos.

## Stash — Nyimpen Sementara

```bash
# Lagi kerja di branch A, tapi harus pindah ke B
git stash                         # Simpen kerjaan
git checkout branch-B
# ... kerja ...
git checkout branch-A
git stash pop                     # Ambil balik kerjaan

# Variasi stash
git stash push -m "WIP: login 80%"  # Simpen dengan pesan
git stash list                    # Lihat semua stash
git stash list --stat             # Lihat detail file

# Ambil stash tertentu
git stash pop stash@{0}           # Ambil + hapus dari stash list
git stash apply stash@{1}         # Ambil TAPI jangan hapus

# Cabut file tertentu dari stash
git checkout stash@{0} -- index.html

# Hapus stash
git stash drop stash@{0}
git stash clear                   # Hapus SEMUA stash
```

## Tags — Rilis Versi

```bash
# Lightweight tag (cuma pointer)
git tag v1.0.0 abc123

# Annotated tag (simpan author, date, message — disarankan)
git tag -a v1.1.0 -m "Rilis dengan fitur login" abc123

# Push tag
git push origin v1.0.0
git push origin --tags            # Push semua tag

# Lihat tag
git tag
git tag -l "v1.*"
git show v1.0.0                   # Detail tag

# Checkout tag (detached HEAD!)
git checkout v1.0.0

# Delete tag
git tag -d v1.0.0                 # Lokal
git push origin --delete v1.0.0   # Remote
```

## Common Scenarios — Skenario Nyata

### "Salah commit, mau ubah message"
```bash
git commit --amend -m "feat: tambah navbar responsive"
# Hanya ubah pesan commit TERAKHIR. Jangan kalo udah di-push!
```

### "Lupa nambah file di commit terakhir"
```bash
git add file-yang-terlupakan.js
git commit --amend --no-edit
# Gabung ke commit yang sama, gak ubah pesan
```

### "Udah commit, pengen balik"
```bash
# 3 level reset:
git reset --soft HEAD~1    # Balik commit, file & staging aman
git reset --mixed HEAD~1   # Balik commit, file aman, staging ilang (default)
git reset --hard HEAD~1    # HAPUS commit & perubahan file! Hati-hati!
```

### "Udah push, baru sadar salah"
```bash
# JANGAN reset --hard kalo udah di-push!
# Pake revert — bikin commit baru yang "membatalkan" commit lama
git revert abc123          # Bikin commit baru: "Revert abc123"
git push origin main       # Aman di-push
```

### "reset --hard tapi nyesel"
```bash
# Git punya reflog — catatan semua pergerakan HEAD
git reflog
# abc123 HEAD@{0}: reset: moving to HEAD~1
# def456 HEAD@{1}: commit: feat: tambah login
# Ambil commit yang ilang:
git reset --hard def456
```

### "Kerja di main padahal harusnya di branch"
```bash
# Lagi di main, udah edit beberapa file, belum commit
git stash
git checkout -b fitur-saya
git stash pop
# Atau langsung bikin branch dari sini:
git checkout -b fitur-saya   # Branch baru di posisi ini
git add .
git commit -m "feat: ..."
```

### "Pull conflict"
```bash
git pull origin main
# CONFLICT!
# 1. Fix conflict di editor
# 2. git add .
# 3. git commit       # Commit merge
# Atau dibatalin:
git merge --abort
```

## Git Reflog — Safety Net

```bash
git reflog
# e5a6b7c HEAD@{0}: commit: feat: tambah footer
# f1b2c3d HEAD@{1}: commit: fix: perbaiki navbar
# a0b1c2d HEAD@{2}: reset: moving to HEAD~1
# abc1234 HEAD@{3}: commit: feat: tambah login
# 1234abc HEAD@{4}: checkout: moving from main to fitur

# Mau balik ke kondisi sebelum reset --hard?
git reset --hard HEAD@{1}
# Atau
git checkout abc1234
```

**Reflog lokal doang — gak di-push ke remote.** Tools investigasi paling powerful.

## .gitignore — File yang Diabaikan

Bikin file `.gitignore` di root project — isi file/folder yang **gak perlu di-track**:

```gitignore
# Dependencies
node_modules/
vendor/
.pnp

# Environment
.env
.env.local
.env.*.local

# Build output
dist/
build/
.next/
out/
.cache/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Log
*.log
npm-debug.log*

# Test coverage
coverage/

# Uploads
uploads/*
!uploads/.gitkeep
```

```bash
# Jangan lupa commit .gitignore
git add .gitignore
git commit -m "chore: tambah .gitignore"
```

## Troubleshooting — Masalah Umum & Solusi

| Masalah | Gejala | Solusi |
|---------|--------|--------|
| "Please tell me who you are" | Commit gagal | Set `git config user.name` & `user.email` |
| "Pathspec did not match" | `git add file` error | Cek nama file (case sensitive di Linux) |
| "Not a git repository" | `git status` error | Jalanin dari dalem folder project yang ada `.git` |
| "Merge conflict in..." | Merge gagal | Fix file + `git add` + `git commit` |
| "You have unstaged changes" | Checkout ditolak | `git stash`, baru checkout |
| "Your branch is ahead of 'origin/main'" | Belum di-push | `git push origin main` |
| "Permission denied (publickey)" | SSH gagal | `ssh-keygen`, upload ke GitHub |
| "Failed to push some refs" | Remote lebih baru | `git pull origin main` dulu |
| "Repository not found" | Clone gagal | Cek URL & kalo private: pake token |
| Detached HEAD | Checkout tag/hash | Bikin branch: `git checkout -b nama-branch` |

## Latihan

1. **Init & Config** — setup global git config, init project, bikin `index.html`, `style.css`, `script.js`
2. **3 Commit** — commit satu-satu (feat: tambah html, feat: tambah css, feat: tambah js) pake conventional commit
3. **Log** — bikin 5 commit, cek `git log --oneline`, `git log --graph`, `git log --author`, `git log --grep`
4. **Diff Practice** — ubah 2 file, cek `git diff`, stage 1 file, cek `git diff --staged`
5. **Amend** — ubah pesan commit terakhir pake `--amend`
6. **Reset vs Revert** — bikin commit baru, reset soft ke sebelumnya, cek file masih ada. Trus revert pake `git revert`
7. **Branch & Merge** — bikin branch `fitur-tambah-footer`, commit disana, merge ke main, hapus branch
8. **Rebase** — dari main yang udah maju, coba rebase branch fitur ke main
9. **Stash** — kerja di branch A, stash, pindah ke B, balik, stash pop
10. **Reflog** — coba `git reset --hard`, panic, selametin pake `git reflog`
11. **Conflict** — 2 branch ubah baris SAMA di README, merge, resolve conflict
12. **.gitignore** — tambah node_modules, .env, coverage ke .gitignore, commit
