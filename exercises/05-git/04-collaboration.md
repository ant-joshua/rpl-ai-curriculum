# Git — Exercise #4: Collaboration (Remote, Push, Pull, PR)

> **Level:** Intermediate
> **Topics:** git remote, git push, git pull, clone, pull request workflow

## Instructions

Simulasikan workflow kolaborasi: remote, push, pull, dan pull request.

## Starter Code

```bash
# Setup: buat repo lokal
mkdir latihan-remote && cd latihan-remote
git init
echo "# Remote Project" > README.md
git add README.md && git commit -m "init"

# Tambah remote (ganti dengan URL GitHub kalo punya)
git remote add origin https://github.com/username/latihan-remote.git

# Cek remote
git remote -v

# Rename branch ke main dan push
git branch -M main
git push -u origin main
# Catatan: butuh koneksi GitHub, fallback: simulasi local

# Clone (simulasi)
cd ..
git clone ./latihan-remote.git clone-test
cd clone-test
echo "update dari clone" >> README.md
git add . && git commit -m "update readme dari clone"
git push

# Pull perubahan
cd ../latihan-remote
git pull
cat README.md

# Simulasi PR: fork, branch, commit, PR
# 1. Fork repo di GitHub
# 2. Clone hasil fork
# 3. Buat branch baru: git checkout -b feature-ku
# 4. Buat perubahan, commit, push
# 5. Buka GitHub, buat Pull Request
```

## Expected Output

```
$ git remote -v
origin  https://github.com/username/latihan-remote.git (fetch)
origin  https://github.com/username/latihan-remote.git (push)

$ git push -u origin main
Enumerating objects: 3, done.
Counting objects: 100% (3/3), done.
Writing objects: 100% (3/3), done.
Total 3 (delta 0), reused 0 (delta 0)
To https://github.com/username/latihan-remote.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

## Test Cases

```bash
# Cek remote
git remote show origin

# Cek apakah branch ter-track
git branch -vv  # harus ada [origin/main]
```
