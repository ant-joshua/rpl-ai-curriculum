# 1.1 Git Basics — Version Control

Git = **mesin waktu** buat kode lo. Setiap perubahan tercatat, lo bisa balik kapan aja.

## Kenapa Git Penting?

| Tanpa Git | Pake Git |
|-----------|----------|
| "final_project_v3_revisi_fix_2.zip" | Satu folder, version otomatis |
| Error → gak bisa balik | `git checkout` → balik ke versi aman |
| Takut ngubah kode | Berani eksperimen di branch |
| "Siapa yang ngerusak ini?" | `git blame` — tau persis siapa & kapan |

## Konsep Dasar Git

```
Working Directory        Staging Area              Repository (.git)
  │                       │                         │
  │── git add file ──────>│                         │
  │                       │── git commit ──────────>│
  │                       │                         │
  │<──── git checkout ────│─────────────────────────│
```

1. **Working Directory** — tempat lo edit file (kode lo sekarang)
2. **Staging Area** — file yang udah siap di-commit (`git add`)
3. **Repository** — snapshot permanen (`git commit`)

## Setup Awal

```bash
# Cek git terinstall
git --version
# Output: git version 2.x.x

# Setting identitas (SEKALI SEUMUR HIDUP!)
git config --global user.name "Nama Kamu"
git config --global user.email "email@kamu.com"

# Cek setting
git config --list

# Setting default branch name (biar gak 'master' kuno)
git config --global init.defaultBranch main
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

# Commit — simpan snapshot pertama
git commit -m "chore: init project dengan README dan index.html"
# Output: 2 files changed, 2 insertions(+)
```

## Git Workflow Harian

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
```

## Commit Message Convention

Pake **Conventional Commits** — format standar yang dipake tim profesional:

```
feat: tambah fitur login              # Fitur baru
fix: perbaiki bug di navbar           # Bug fix
docs: update README                   # Dokumentasi
style: format kode, beresin CSS       # Cosmetics
refactor: pisah fungsi validation     # Refaktor kode
test: tambah unit test login          # Testing
chore: update dependencies            # Maintenance
opsi: tambah tipe optional            # Konfigurasi
```

## Git Log — Lihat Riwayat

```bash
# Daftar commit
git log

# 1 line per commit
git log --oneline

# Visual graph (kalo ada branch)
git log --oneline --graph --all

# Cari commit tertentu
git log --author="Budi"
git log --grep="fix:"  # Cari commit dengan message "fix:"

# Lihat file spesifik di commit tertentu
git show abc123 --stat
```

## Git Diff — Apa yang Berubah

```bash
# Sebelum di-stage: perubahan di working directory
git diff

# Setelah di-stage: perubahan yang siap commit
git diff --staged

# Bandingin 2 commit
git diff abc123..def456

# Cuma file tertentu
git diff -- index.html
```

## Undo — Cara Aman

```bash
# Unstage file (balikin dari staging area)
git reset HEAD index.html

# Git restore (cara baru, v2.23+)
git restore --staged index.html  # Unstage aja
git restore index.html           # Balikin file ke versi terakhir commit

# Commit salah — ubah pesan commit terakhir
git commit --amend -m "pesan baru"

# Commit salah + file lupa di-stage
git add file-lupa.js
git commit --amend --no-edit   # Gabung ke commit sebelumnya

# Balik ke commit tertentu (file tetap)
git reset --soft HEAD~1   # Balik 1 commit, file & staging gak ilang
git reset --mixed HEAD~1  # Balik 1 commit, file tetap, staging ilang

# HATI-HATI: balik ke commit tertentu, file ilang!
# git reset --hard abc123
```

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

## Latihan

1. **Init Project** — buat folder `latihan-git`, init git, bikin `index.html`, `style.css`, `script.js`
2. **3 Commit** — commit satu-satu (feat: tambah html, feat: tambah css, feat: tambah js)
3. **Amend** — ubah salah satu commit message pake `--amend`
4. **Diff** — ubah index.html, cek diff sebelum & sesudah stage
5. **Reset** — hard reset ke commit pertama, cek file hilang (pake folder latihan aja)
6. **.gitignore** — tambah node_modules, .env, coverage ke .gitignore, commit
7. **Log Practice** — bikin 5 commit, cek `git log --oneline`, cari commit tertentu pake `--grep`
