---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — <img src="https://images.pexels.com/photos/1181671/pexels-ph"
footer: "Sesi 01: Git Basics"
---

<!-- _class: title -->
# 1.1 Git Basics

## Inisialisasi Repository

```bash

---

# Bikin folder project dan masukin git
mkdir project-saya
cd project-saya
git init

---

# Output: Initialized empty Git repository in .../.git/
```

Setelah `git init`, folder `.git` muncul — isinya semua riwayat versi. Jangan dihapus.

## Cek Status

```bash

---

# Cek file mana aja yang berubah
git status

---

# Output: untracked files, modified files, staged files
```

## Staging & Commit

```bash

---

# Bikin file
echo "<h1>Halo Dunia</h1>" > index.html


---

# Stage — tandain file yang mau di-commit
git add index.html


---

# Atau stage semua file
git add .


---

# Commit — simpan snapshot
git commit -m "feat: tambah index.html"
```

## Melihat Riwayat (Log)

```bash

---

# Lihat semua commit
git log


---

# Format pendek (1 line per commit)
git log --oneline


---

# Lihat grafis branch
git log --oneline --graph --all
```

## Melihat Perubahan (Diff)

```bash

---

# Apa aja yang berubah sebelum di-stage
git diff


---

# Apa aja yang udah di-stage (siap di-commit)
git diff --staged


---

# Bandingin dua commit tertentu
git diff abc123 def456
```

## Undo — Reset

```bash

---

# Unstage file (balikin dari staging area)
git reset HEAD index.html


---

# Balikin ke commit sebelumnya, file tetap ada (soft reset)
git reset --soft HEAD~1


---

# Balikin ke commit sebelumnya, file hilang (hard reset — HATI-HATI!)
git reset --hard HEAD~1


---

# Balikin file ke versi commit tertentu
git restore index.html
```

## .gitignore — File yang Diabaikan

Bikin file `.gitignore` di root project:

```gitignore

---

# Folder dependencies
node_modules/
vendor/


---

# File environment
.env
.env.local


---

# File build
dist/
build/
.next/


---

# File OS
.DS_Store
Thumbs.db


---

# Log
*.log
npm-debug.log*
```

```bash

---

# Pastiin .gitignore ke-track juga
git add .gitignore
git commit -m "chore: tambah .gitignore"
```

## Latihan

1. Bikin folder `latihan-git`, `git init`, bikin `index.html`, `git add` & `git commit`
2. Ubah `index.html`, cek `git diff`, `git add` lagi, `git commit`
3. Bikin `.gitignore`, isi `node_modules/` dan `.env`, commit
4. Bikin 3 commit, cek `git log --oneline`, undo commit kedua pake `git reset --soft HEAD~1`
