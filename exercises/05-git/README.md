# 🧠 Latihan Git & GitHub

> 10+ latihan Git dari dasar sampai kolaborasi tim.
> Semua latihan dikerjakan di terminal. Jangan pake GUI!

---

## 📋 Daftar Isi

| # | Topik | Konsep | Level |
|---|-------|--------|-------|
| 1 | Init & First Commit | `git init`, `git add`, `git commit` | 🌱 Beginner |
| 2 | Branching | `git branch`, `git checkout`, `git switch` | 🌱 Beginner |
| 3 | Merge | `git merge` | 🌱 Beginner |
| 4 | Rebase | `git rebase` | 📐 Intermediate |
| 5 | Cherry-pick | `git cherry-pick` | 📐 Intermediate |
| 6 | Revert & Reset | `git revert`, `git reset` | 🌱 Beginner |
| 7 | Stash | `git stash` | 🌱 Beginner |
| 8 | Remote & Push | `git remote`, `git push`, `git pull` | 🌱 Beginner |
| 9 | Pull Request | GitHub PR workflow | 📐 Intermediate |
| 10 | Conflict Resolution | Merge conflict | 📐 Intermediate |
| 11 | Interactive Rebase | `git rebase -i` | 🚀 Advanced |
| 12 | Bisect | `git bisect` | 🚀 Advanced |
| 13 | Submodules | `git submodule` | 🚀 Advanced |
| 14 | Git Hooks | `pre-commit`, `commit-msg` | 🚀 Advanced |

---

## 🌱 Beginner

### 1. Init & First Commit

**Tujuan:** Buat repo Git pertama, commit file pertama.

**Langkah:**

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

**Expected Output:**
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

**Tugas Tambahan:**
1. Buat file `index.html` dengan konten `<h1>Hello World</h1>`
2. Stage dan commit dengan message `feat: tambah index.html`
3. Cek log: `git log --oneline`

---

### 2. Branching

**Tujuan:** Paham konsep branch — bikin, pindah, dan lihat branch.

**Langkah:**

```bash
# Lanjut dari latihan 1

# 1. Cek branch aktif
git branch

# 2. Buat branch baru
git branch feature-navbar

# 3. Pindah ke branch baru
git checkout feature-navbar
# Alternatif: git switch feature-navbar

# 4. Buat perubahan
echo "<nav>Home | About | Contact</nav>" > navbar.html
git add navbar.html
git commit -m "feat: tambah navbar"

# 5. Balik ke main
git checkout main

# 6. Buat branch lain
git checkout -b feature-footer
echo "<footer>Copyright 2025</footer>" > footer.html
git add footer.html
git commit -m "feat: tambah footer"

# 7. Lihat semua branch
git branch -a

# 8. Cek log graph
git log --oneline --graph --all
```

**Expected Output:**
```
$ git branch
* main

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

**Tugas Tambahan:**
- Buat branch `feature-header`, bikin file `header.html`, commit
- Merge ke main, delete branch

---

### 3. Merge

**Tujuan:** Gabungin perubahan dari branch lain ke branch aktif.

**Setup:**

```bash
# Setup awal
mkdir latihan-merge && cd latihan-merge
git init
echo "A" > file.txt && git add file.txt && git commit -m "A"
echo "B" >> file.txt && git add file.txt && git commit -m "B"
echo "C" >> file.txt && git add file.txt && git commit -m "C"

# Buat branch fitur
git checkout -b fitur
echo "X" >> file.txt && git add file.txt && git commit -m "X"
echo "Y" >> file.txt && git add file.txt && git commit -m "Y"

# Balik ke main
git checkout main
```

**Tugas:**

```bash
# Merge branch fitur ke main
git merge fitur

# Cek hasil
cat file.txt   # Harusnya A, B, C, X, Y
git log --oneline --graph
```

**Expected Output:**
```
$ git merge fitur
Updating abc123..def456
Fast-forward
 file.txt | 2 ++
 1 file changed, 2 insertions(+)

$ cat file.txt
A
B
C
X
Y
```

**Fast-forward merge** terjadi karena main tidak punya commit baru.

**Tugas Tambahan:** Sekarang coba merge dengan `--no-ff`:
```bash
git checkout -b fitur2
echo "Z" >> file.txt && git commit -am "Z"
git checkout main
git merge --no-ff fitur2 -m "merge: fitur2 dengan no-ff"
git log --oneline --graph
```

---

### 4. Rebase

**Tujuan:** Rebase branch ke ujung branch lain (linear history).

**Setup:**

```bash
mkdir latihan-rebase && cd latihan-rebase
git init

# Main branch
echo "base" > file.txt && git add file.txt && git commit -m "base"

# Branch fitur dari base
git checkout -b fitur
echo "fitur1" >> file.txt && git add file.txt && git commit -m "fitur 1"
echo "fitur2" >> file.txt && git add file.txt && git commit -m "fitur 2"

# Balik ke main, tambah commit
git checkout main
echo "main1" >> file.txt && git add file.txt && git commit -m "main commit 1"
echo "main2" >> file.txt && git add file.txt && git commit -m "main commit 2"
```

**Tugas:**

```bash
# Pindah ke branch fitur
git switch fitur

# Rebase ke main
git rebase main

# Cek history — commit fitur ada DI ATAS commit main
git log --oneline
```

**Expected Output:**
```
$ git log --oneline
a1b2c3 fitur 2
d4e5f6 fitur 1
g7h8i9 main commit 2
j0k1l2 main commit 1
m3n4o5 base
```

**Perbedaan Rebase vs Merge:**
| Merge | Rebase |
|-------|--------|
| History bercabang | History linear |
| Commit merge terpisah | Semua commit rapi |
| Aman untuk public branch | Jangan untuk public branch |
| Lebih gampang dipahami | History lebih bersih |

---

### 5. Cherry-pick

**Tujuan:** Ambil commit tertentu dari branch lain.

**Setup:**

```bash
mkdir latihan-cherry && cd latihan-cherry
git init
echo "a" > file.txt && git add file.txt && git commit -m "commit A"
echo "b" >> file.txt && git add file.txt && git commit -m "commit B"

git checkout -b fitur
echo "c" >> file.txt && git add file.txt && git commit -m "commit C"
echo "d" >> file.txt && git add file.txt && git commit -m "commit D"
echo "e" >> file.txt && git add file.txt && git commit -m "commit E"
```

**Tugas:** Ambil commit D aja ke main (tanpa C dan E).

```bash
git checkout main

# Cari hash commit D
git log --oneline fitur

# Ganti HASH dengan hash commit D yang bener
git cherry-pick HASH

# Cek hasil
cat file.txt   # a, b, d
git log --oneline
```

**Expected Output:**
```
$ git cherry-pick abc1234
[main f1e2d3] commit D
 1 file changed, 1 insertion(+)

$ cat file.txt
a
b
d
```

**Tugas Tambahan:**
- Cherry-pick multiple commits: `git cherry-pick HASH_C HASH_E`
- Apa yang terjadi kalau ada conflict?

---

### 6. Revert & Reset

**Tujuan:** Batalkan perubahan — bedain revert (aman) vs reset (berbahaya).

**Setup:**

```bash
mkdir latihan-revert && cd latihan-revert
git init
echo "line 1" > file.txt && git add file.txt && git commit -m "commit 1"
echo "line 2" >> file.txt && git add file.txt && git commit -m "commit 2"
echo "line 3" >> file.txt && git add file.txt && git commit -m "commit 3"
echo "line 4" >> file.txt && git add file.txt && git commit -m "commit 4"
```

**Tugas — Revert:**

```bash
# Revert commit 3 (buat commit baru yang membatalkan)
git log --oneline
git revert HEAD~1 --no-edit   # revert commit 3, commit 4 tetap ada

cat file.txt   # line 1, line 2, line 4
git log --oneline --graph
```

**Tugas — Reset (hati-hati!):**

```bash
# Reset soft — hapus commit, file tetap di staging
git reset --soft HEAD~1

# Reset mixed — hapus commit + unstage (default)
git reset HEAD~1

# Reset hard — HAPUS PERMANEN commit + perubahan file
# !! HATI-HATI !!
git reset --hard HEAD~1
```

**Perbedaan:**
| Command | Commit | Staging | Working Dir |
|---------|--------|---------|-------------|
| `--soft` | ✅ Kembali | ✅ Tetap | ✅ Tetap |
| `--mixed` (default) | ✅ Kembali | ✅ Dihapus | ✅ Tetap |
| `--hard` | ✅ Kembali | ✅ Dihapus | ✅ DIHAPUS |

---

### 7. Stash

**Tujuan:** Simpen perubahan sementara tanpa commit.

**Setup:**

```bash
mkdir latihan-stash && cd latihan-stash
git init
echo "main content" > file.txt && git add file.txt && git commit -m "init"
```

**Skenario:** Lagi ngerjain fitur A, tiba-tiba diminta fix bug di branch main.

```bash
# 1. Mulai ngerjain fitur
echo "fitur A progress..." >> file.txt

# 2. Cek status — modified, belum commit
git status

# 3. Stash perubahan
git stash push -m "progress fitur A"

# 4. Cek status — bersih!
git status

# 5. Cek stash list
git stash list

# 6. Fix bug di main
echo "bug fix" >> file.txt && git add file.txt && git commit -m "fix: urgent bug"

# 7. Ambil stash balik
git stash pop
# Atau: git stash apply (tanpa hapus dari stash list)
```

**Expected Output:**
```
$ git stash list
stash@{0}: On main: progress fitur A

$ git stash pop
Auto-merging file.txt
On branch main
Changes not staged for commit:
  modified:   file.txt
```

**Tugas Tambahan:**
```bash
# Stash dengan nama tertentu
git stash push -m "progress fitur B"

# Lihat isi stash
git stash show stash@{0}

# Stash untracked files
git stash push -u -m "termasuk file baru"

# Drop stash tertentu
git stash drop stash@{0}

# Clear semua stash
git stash clear
```

---

### 8. Remote & Push

**Tujuan:** Hubungkan repo lokal ke GitHub.

**Setup:**

```bash
# Buat repo di GitHub dulu (via web)
# Jangan centang "Initialize with README"

# Di terminal:
mkdir latihan-remote && cd latihan-remote
git init
echo "# Remote Project" > README.md
git add README.md && git commit -m "init"
```

**Tugas:**

```bash
# 1. Tambah remote
git remote add origin https://github.com/username/latihan-remote.git

# 2. Cek remote
git remote -v

# 3. Push ke GitHub
git branch -M main
git push -u origin main

# 4. Clone (simulasi)
cd ..
git clone https://github.com/username/latihan-remote.git clone-test

# 5. Pull perubahan
cd latihan-remote
echo "new line" >> README.md
git add . && git commit -m "update readme"
git push

# 6. Tarik perubahan di clone
cd ../clone-test
git pull
cat README.md  # Harusnya ada "new line"
```

**Branch Protection Rules (GitHub Settings):**
- Require pull request before merging
- Require approvals (1)
- Dismiss stale reviews
- Require up-to-date branches

---

### 9. Pull Request (PR)

**Tujuan:** Simulasi workflow PR — fork, branch, PR, review, merge.

**Setup di GitHub:**
1. Fork repo `rpl-ai-curriculum` ke akun sendiri
2. Clone hasil fork

**Workflow:**

```bash
# Clone hasil fork
git clone https://github.com/username/rpl-ai-curriculum.git
cd rpl-ai-curriculum

# Tambah remote upstream (repo asli)
git remote add upstream https://github.com/original/rpl-ai-curriculum.git

# Sync fork dengan upstream
git fetch upstream
git checkout main
git merge upstream/main

# Buat branch fitur
git checkout -b fix-typo-readme

# Edit README (fix typo)
echo "fixed" >> README.md
git add README.md && git commit -m "fix: typo di README"

# Push ke origin (fork)
git push -u origin fix-typo-readme

# Sekarang buka GitHub, klik "Compare & Pull Request"
# Isi judul: "fix: typo di README"
# Isi deskripsi:
#   ## Perubahan
#   - Fix typo "recieve" jadi "receive"
#   ## Screenshot
#   (kalo perlu)
#   ## Related Issue
#   Closes #12
# Klik "Create Pull Request"
```

**PR Template (simpan di `.github/PULL_REQUEST_TEMPLATE.md`):**
```markdown
## Deskripsi
<!-- Jelaskan perubahan yang kamu buat -->

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation
- [ ] Refactor

## How to Test
1. `npm install`
2. `npm run dev`
3. Buka `http://localhost:3000`

## Checklist
- [ ] Kode sudah di-test
- [ ] Tidak ada console.log kotor
- [ ] Sudah lint
```

**Tugas:** Buat PR sungguhan ke repo kalian sendiri (atau dummy repo).

---

## 📐 Intermediate

### 10. Conflict Resolution

**Tujuan:** Selesaikan merge conflict seperti di dunia nyata.

**Setup:**

```bash
mkdir latihan-conflict && cd latihan-conflict
git init
echo "line 1" > file.txt && git add file.txt && git commit -m "base"

# Branch A — ubah baris 1
git checkout -b branch-a
echo "line 1 — DIUBAH OLEH BRANCH A" > file.txt
git add file.txt && git commit -m "branch A: ubah line 1"

# Branch B dari base — ubah baris yang SAMA
git checkout main
git checkout -b branch-b
echo "line 1 — DIUBAH OLEH BRANCH B" > file.txt
git add file.txt && git commit -m "branch B: ubah line 1"
```

**Tugas:**

```bash
# Coba merge branch B ke branch A
git checkout branch-a
git merge branch-b   # CONFLICT!
```

**Expected Conflict Output:**
```
Auto-merging file.txt
CONFLICT (content): Merge conflict in file.txt
Automatic merge failed; fix conflicts and then commit the result.
```

**Sekarang selesaikan:**

```bash
# Buka file.txt — akan terlihat:
# <<<<<< HEAD (current)
# line 1 — DIUBAH OLEH BRANCH A
# ======
# line 1 — DIUBAH OLEH BRANCH B
# >>>>>> branch-b

# Edit file.txt, pilih salah satu atau gabung:
echo "line 1 — DIUBAH OLEH BRANCH A DAN B" > file.txt

# Stage dan commit hasil conflict resolution
git add file.txt
git commit -m "resolve conflict: gabung perubahan branch A dan B"
```

**Conflict Resolution Strategies:**

| Strategy | Kapan Dipakai |
|----------|--------------|
| Accept current (theirs) | Perubahan branch lebih penting |
| Accept incoming (ours) | Perubahan dari luar lebih benar |
| Manual merge | Kedua perubahan valid, gabung |
| Abort merge (`git merge --abort`) | Kalau bingung, ulang dari awal |

---

### 11. Interactive Rebase

**Tujuan:** Squash, edit, reorder, drop commit pake rebase interactive.

**Setup:**

```bash
mkdir latihan-rebase-i && cd latihan-rebase-i
git init

echo "init" > file.txt && git add file.txt && git commit -m "init"

# Buat 5 commit kecil (messy history)
echo "fix 1" >> file.txt && git add file.txt && git commit -m "fix typo 1"
echo "fix 2" >> file.txt && git add file.txt && git commit -m "fix typo ke2"
echo "feat: login" >> file.txt && git add file.txt && git commit -m "tambah fitur login"
echo "fix: login button" >> file.txt && git add file.txt && git commit -m "perbaiki button login"
echo "tambah test" >> file.txt && git add file.txt && git commit -m "tambah test login"
```

**Tugas:** Squash 5 commit messi jadi 2 commit bersih.

```bash
# Rebase 5 commit terakhir
git rebase -i HEAD~5

# Di editor yang muncul:
# pick abc123 fix typo 1
# pick def456 fix typo ke2         -> ganti jadi "squash"
# pick ghi789 tambah fitur login
# pick jkl012 perbaiki button login -> ganti jadi "squash"
# pick mno345 tambah test login     -> ganti jadi "squash"

# Simpan dan exit (Esc + :wq di Vim)

# Di editor kedua, tulis commit message baru:
# feat: implementasi login
# fix: typo dan cleanup
```

**Expected Output:**
```
$ git log --oneline
a1b2c3 fix: typo dan cleanup
d4e5f6 feat: implementasi login
m3n4o5 init
```

**Command Interactive Rebase:**
| Command | Singkatan | Efek |
|---------|-----------|------|
| `pick` | `p` | Pakai commit apa adanya |
| `reword` | `r` | Ubah message aja |
| `edit` | `e` | Hentiin rebase, bisa edit |
| `squash` | `s` | Gabung dengan commit sebelumnya |
| `fixup` | `f` | Gabung, buang message |
| `drop` | `d` | Hapus commit |

---

### 12. Git Bisect

**Tujuan:** Cari commit yang introduce bug pake binary search.

**Setup:**

```bash
mkdir latihan-bisect && cd latihan-bisect
git init

# Buat 10 commit, commit 5 introduce bug
for i in {1..10}; do
  echo "commit $i"
  if [ "$i" -eq 5 ]; then
    echo "BUG DI SINI" > app.js
  else
    echo "console.log('version $i')" > app.js
  fi
  git add app.js && git commit -m "v$i"
done
```

**Tugas:**

```bash
# 1. Mulai bisect
git bisect start

# 2. Tandai commit terakhir sebagai BAD (ada bug)
git bisect bad HEAD

# 3. Tandai commit pertama sebagai GOOD (tidak ada bug)
git bisect good HEAD~9

# 4. Git akan checkout commit tengah-tengah (sekitar commit 5)
# Evaluasi: apakah app.js mengandung "BUG"?
cat app.js

# 5. Kalau mengandung BUG -> git bisect bad
#    Kalau tidak -> git bisect good
# Ulangi sampai ketemu commit pertama yang introduce bug

# 6. Selesai
git bisect reset
```

**Expected Output:**
```
$ git bisect bad HEAD
Bisecting: 4 revisions left to test after this (roughly 2 steps)
...

$ git bisect good
Bisecting: 0 revisions left to test after this (roughly 1 step)
...

$ git bisect bad
abc12345 is the first bad commit
```

**Pro Tip:** Bisa auto-bisect pake script:
```bash
git bisect start HEAD HEAD~9
git bisect run grep -q "BUG" app.js
git bisect reset
```

---

## 🚀 Advanced

### 13. Git Hooks

**Tujuan:** Otomatisasi dengan Git hooks — pre-commit linting.

**Setup:**

```bash
mkdir latihan-hooks && cd latihan-hooks
git init
```

**Tugas 1 — Pre-commit hook (cek typo):**

```bash
# Buat hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
# Cek apakah ada file dengan typo "recieve"
if grep -r "recieve" --include="*.ts" --include="*.js" .; then
  echo "❌ Found typo: 'recieve' should be 'receive'"
  exit 1
fi
echo "✅ Pre-commit passed"
EOF

chmod +x .git/hooks/pre-commit

# Test
echo 'const msg = "recieve error";' > app.js
git add app.js
git commit -m "test"  # Should fail!
```

**Tugas 2 — Commit-msg hook (conventional commit):**

```bash
cat > .git/hooks/commit-msg << 'EOF'
#!/bin/sh
commit_msg=$(cat "$1")
pattern="^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .{1,50}$"

if ! echo "$commit_msg" | grep -qE "$pattern"; then
  echo "❌ Commit message harus pakai conventional commit!"
  echo "Format: type(scope): description"
  echo "Contoh: feat(auth): tambah login"
  exit 1
fi
EOF

chmod +x .git/hooks/commit-msg

# Test
git commit -m "asdf"  # Should fail
git commit -m "fix: perbaiki typo"  # Should pass
```

**Tugas 3 — Pakai Husky (production-grade):**

```bash
# Di project Node.js
npm install -D husky lint-staged
npx husky init

# Tambah hook
echo "npx lint-staged" > .husky/pre-commit
```

---

### 14. Submodules & Worktree

**Tujuan:** Kelola multiple repo dalam satu project.

**Submodules:**

```bash
mkdir latihan-submodule && cd latihan-submodule
git init

# Tambah submodule
git submodule add https://github.com/user/shared-library.git libs/shared
git submodule add https://github.com/user/ui-components.git libs/ui

# Commit
git add . && git commit -m "feat: tambah submodule shared dan ui"

# Clone project dengan submodule
git clone --recurse-submodules https://github.com/user/project.git

# Update submodule
git submodule update --remote
```

**Worktree (bekerja di multiple branch barengan):**

```bash
# Di repo yang udah ada
git worktree add ../hotfix hotfix-branch
cd ../hotfix
# Edit di sini, main branch di folder asli gak kena
git commit -am "hotfix: critical bug"

# Cleanup
cd ../latihan-submodule  # atau folder asli
git worktree remove ../hotfix
```

---

## 📋 Cheatsheet Latihan

```bash
# Konfigurasi
git config --global user.name "Nama Kamu"
git config --global user.email "email@kamu.com"
git config --global init.defaultBranch main

# Reset latihan — hapus semua file .git
find . -name ".git" -type d -exec rm -rf {} + 2>/dev/null
```

## 💡 Tips Mengerjakan

1. Baca error message Git — sangat informatif
2. `git status` adalah teman terbaik
3. Jangan takut experiment — Git aman, commit bisa di-revert
4. `git log --oneline --graph --all` untuk visualisasi
5. Gunakan `git help <command>` atau `tldr git`

## 🔍 Troubleshooting

| Error | Penyebab | Solusi |
|-------|----------|--------|
| `Please tell me who you are` | Belum set user.name/email | `git config --global user.name "..."` |
| `Not a git repository` | Belum `git init` | `git init` |
| `Merge conflict` | Dua branch edit file sama | Manual resolve + `git add` |
| `detached HEAD` | Checkout ke commit, bukan branch | `git switch -c nama-branch` |
| `Permission denied` | SSH key belum setup | `ssh-keygen`, upload ke GitHub |
| `Your branch is ahead` | Local commit belum push | `git push` |
| `failed to push some refs` | Remote lebih baru | `git pull --rebase` dulu |

---

Selamat belajar Git! 🚀
