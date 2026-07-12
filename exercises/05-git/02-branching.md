# Git — Exercise #2: Branching

> **Level:** Beginner
> **Topics:** git branch, git checkout, git switch, git merge

## Instructions

Praktikkan branching: buat branch, pindah branch, dan merge.

## Starter Code

```bash
# Setup: lanjut dari latihan 1
cd latihan-git-1

# 1. Lihat branch aktif
git branch

# 2. Buat branch baru
git branch feature-navbar

# 3. Pindah ke branch baru
git checkout feature-navbar

# 4. Buat perubahan di branch baru
echo "<nav>Home | About | Contact</nav>" > navbar.html
git add navbar.html
git commit -m "feat: tambah navbar"

# 5. Kembali ke main
git checkout main

# 6. Buat branch lain dan langsung pindah
git checkout -b feature-footer
echo "<footer>Copyright 2025</footer>" > footer.html
git add footer.html
git commit -m "feat: tambah footer"

# 7. Lihat semua branch
git branch -a

# 8. Lihat log graph
git log --oneline --graph --all
```

## Expected Output

```
$ git branch -a
  feature-footer
  feature-navbar
* main

$ git log --oneline --graph --all
* abc1234 (feature-footer) feat: tambah footer
* abc1233 (HEAD -> main) feat: tambah index.html
| * abc1235 (feature-navbar) feat: tambah navbar
|/
* abc1232 feat: init project dengan README
```

## Test Cases

```bash
# Cek branch aktif
git branch --show-current

# Cek semua branch
git branch -a | wc -l  # harus 3
```
