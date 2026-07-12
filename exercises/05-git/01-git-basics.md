# Git — Exercise #1: Git Basics (Init, Add, Commit)

> **Level:** Beginner
> **Topics:** git init, git add, git commit, git status, git log

## Instructions

Praktikkan Git dasar: inisialisasi repo, staging, dan commit.

Buat simulasi dengan menjalankan perintah-perintah Git di terminal. Script di bawah menunjukkan langkah-langkah yang harus dilakukan.

## Starter Code

```bash
# 1. Buat folder project
mkdir latihan-git-1
cd latihan-git-1

# 2. Inisialisasi Git
git init

# 3. Buat file README.md
echo "# Project Pertamaku" > README.md

# 4. Cek status
git status

# 5. Stage file
git add README.md

# 6. Commit
git commit -m "feat: init project dengan README"
```

## Expected Output

```
$ git status
On branch main
No commits yet
Untracked files:
  README.md

$ git commit -m "feat: init project dengan README"
[main (root-commit) abc1234] feat: init project dengan README
 1 file changed, 1 insertion(+)
```

## Test Cases

```bash
# Cek apakah repo sudah terinisialisasi
ls -a .git  # harus ada folder .git

# Cek log
git log --oneline
# Harus ada 1 commit
```
