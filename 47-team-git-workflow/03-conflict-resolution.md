# Sesi 3: Conflict Resolution

> Tangani merge conflict dengan percaya diri — resolve di IDE, rebase workflow, cherry-pick, revert, dan reset.

**Durasi**: 4 jam | **Output**: Conflict resolved PR + rebase practice

---

## 3.1 Merge Conflict Types

Conflict terjadi ketika Git tidak bisa menggabungkan perubahan secara otomatis.

### Content Conflict (Paling Sering)

Dua branch mengubah baris yang sama di file yang sama.

```
<<<<<<< HEAD (main)
<h1>Selamat Datang</h1>
=======
<h1>Welcome</h1>
>>>>>>> feature/english
```

**Penyebab**: Dua developer edit baris yang sama.

### Structural Conflict

File direstruktur — dipindah, di-rename, atau dihapus di satu branch, tapi diedit di branch lain.

```
CONFLICT (rename/delete): style.css deleted in main and renamed to src/styles.css in feature/refactor.
```

**Penyebab**: Satu branch hapus file, branch lain rename.

### Rename Conflict

File di-rename dengan nama berbeda di dua branch.

```
CONFLICT (rename/rename): about.html renamed to about-us.html in branch A and team.html in branch B.
```

**Penyebab**: Dua branch rename file yang sama ke nama berbeda.

### Binary Conflict

File binary (gambar, PDF, zip) diubah di dua branch.

```
CONFLICT (content): Merge conflict in logo.png
```

**Penyebab**: Dua branch mengedit binary file yang sama.

### Tips Mencegah Conflict

- ✅ **PR kecil & fokus** — satu fitur per branch
- ✅ **Rebase sering** — jaga branch tetap up-to-date dengan `main`
- ✅ **Komunikasi tim** — kasih tahu kalau sedang edit file yang sama
- ✅ **Pull sebelum push** — selalu `git pull --rebase` sebelum push

---

## 3.2 Resolve Conflict di VS Code

VS Code punya **Merge Editor** bawaan — GUI terbaik untuk resolve conflict.

### Cara Pakai Merge Editor

1. Ketika conflict terjadi:
   ```
   git merge feature/login
   # Auto-merging index.html
   # CONFLICT (content): Merge conflict in index.html
   ```

2. Buka file di VS Code — lihat UI conflict markers

3. Klik tombol **"Resolve in Merge Editor"** (di kanan bawah editor)

4. Merge Editor menampilkan 3 panel:
   - **Kiri**: Isi dari branch kita (Incoming)
   - **Kanan**: Isi dari branch lain (Current)  
   - **Bawah**: Hasil merge (Result)

5. Pilih aksi per konflik:
   - **Accept Current** — pakai punya branch kita
   - **Accept Incoming** — pakai punya branch lawan
   - **Accept Both** — gabungkan keduanya
   - Manual edit di panel Result

6. Klik **"Complete Merge"** setelah selesai

7. Stage + commit:

```bash
git add index.html
git commit -m "chore: resolve merge conflict in index.html"
```

### Conflict Markers Manual

Jika tidak pakai VS Code, edit manual:

```
<<<<<<< HEAD (Current — branch yang kamu tuju)
<h1>Selamat Datang</h1>
======= (Pemisah)
<h1>Welcome</h1>
>>>>>>> feature/english (Incoming — branch yang di-merge)
```

Pilih satu versi atau gabung:

```html
<h1>Selamat Datang | Welcome</h1>
```

Hapus semua marker (`<<<<<<<`, `=======`, `>>>>>>>`) setelah edit.

### Diff Viewer di Terminal

```bash
# Lihat perbedaan antar branch
git diff main..feature/login -- index.html

# Lihat conflict dalam konteks
git diff

# Setelah resolve, verify
git diff --check
```

---

## 3.3 Rebase Workflow

Rebase menulis ulang histori branch — memindahkan base branch ke titik yang lebih baru.

### Kenapa Rebase?

```
Sebelum rebase:
      A---B---C feature/login
     /
D---E---F---G main

Sesudah rebase:
              A'---B'---C' feature/login
             /
D---E---F---G main
```

**Keuntungan**: Histori linear, tidak ada merge commit.

**Kerugian**: Force push diperlukan, hati-hati di branch bersama.

### Interactive Rebase

```bash
# Rebase 3 commit terakhir
git rebase -i HEAD~3

# Atau rebase ke main
git rebase -i main
```

Editor terbuka dengan opsi per commit:

```
pick a1b2c3 feat: add login form
pick d4e5f6 feat: add validation
pick g7h8i9 fix: validation error
```

### Rebase Commands

| Command | Fungsi |
|---------|--------|
| `pick` | Pakai commit apa adanya |
| `reword` | Ubah pesan commit |
| `edit` | Hentikan rebase untuk amend |
| `squash` | Gabung dengan commit sebelumnya |
| `fixup` | Gabung, buang pesan commit |
| `drop` | Hapus commit |
| `exec` | Jalankan perintah shell |

### Contoh: Squash 3 Commit Jadi 1

```
pick a1b2c3 feat: add login form
squash d4e5f6 feat: add validation
squash g7h8i9 fix: validation error
```

Hasil: Satu commit dengan pesan `feat: add login form`.

### Contoh: Fixup (buang pesan)

```
pick a1b2c3 feat: add login form
fixup d4e5f6 wip: fix validation
fixup g7h8i9 oops forgot this
```

Hasil: Semua perubahan di commit `a1b2c3`, pesan `d4e5f6` dan `g7h8i9` dibuang.

### Rebase Workflow Harian

```bash
# 1. Saat mulai kerja — rebase branch fitur ke main terbaru
git checkout main
git pull origin main
git checkout feature/login
git rebase main

# 2. Kalau ada conflict — resolve satu per satu
# Git akan stop di setiap commit yang conflict
git status           # lihat file conflict
# edit + resolve
git add <file>
git rebase --continue

# 3. Kalau mau skip commit yang conflict
git rebase --skip

# 4. Kalau mau batalin rebase
git rebase --abort

# 5. Setelah rebase selesai — force push
git push origin feature/login --force-with-lease
```

### Penting: `--force-with-lease`

Selalu pakai `--force-with-lease` bukan `--force`:

```bash
# Aman — cek apakah ada perubahan remote yang tidak diketahui
git push --force-with-lease

# Berbahaya — timpa apapun di remote
git push --force  # ❌ Hindari
```

---

## 3.4 Cherry-pick, Revert, Reset

### Cherry-pick

Ambil commit spesifik dari branch lain ke branch sekarang.

```bash
# Lihat commit di branch lain
git log feature/login --oneline
# a1b2c3 feat: add login form
# d4e5f6 feat: add validation

# Cherry-pick satu commit ke branch sekarang
git checkout main
git cherry-pick a1b2c3

# Cherry-pick range commit
git cherry-pick a1b2c3..d4e5f6

# Dengan opsi
git cherry-pick -x a1b2c3         # tambah "(cherry picked from commit ...)"
git cherry-pick --no-commit a1b2c3 # stage aja, jangan auto-commit
```

**Use case**: Ambil hotfix dari branch release ke main tanpa merge seluruh branch.

### Revert

Buat commit baru yang membalikkan perubahan commit sebelumnya. **Aman untuk histori bersama.**

```bash
# Revert satu commit
git revert a1b2c3
# Membuat commit baru "Revert 'feat: add login form'"

# Revert tanpa auto-commit
git revert --no-commit a1b2c3

# Revert range
git revert HEAD~3..HEAD

# Revert merge commit (perlu -m untuk parent)
git revert -m 1 <merge-commit-hash>
```

**Use case**: Rollback fitur di produksi tanpa merusak histori.

### Reset

Pindahkan pointer branch ke commit tertentu. **Tiga mode:**

| Mode | Working Directory | Staging Area | Commit History |
|------|------------------|--------------|----------------|
| `--soft` | ✅ Tidak berubah | ✅ Tidak berubah | ❌ Pindah |
| `--mixed` (default) | ✅ Tidak berubah | ❌ Unstage | ❌ Pindah |
| `--hard` | ❌ Hapus semua | ❌ Hapus semua | ❌ Pindah |

```bash
# Soft — ubah commit terakhir, files tetap staged
git reset --soft HEAD~1

# Mixed — ubah commit terakhir, files unstaged
git reset HEAD~1

# Hard — buang semua perubahan, balik ke commit sebelumnya
git reset --hard HEAD~1

# Hati-hati! Kalau sudah push, gunakan revert, bukan reset
```

**Use case**:
- `--soft`: "Ups, lupa masukin file di commit terakhir"
- `--mixed`: "Ups, commit salah file"
- `--hard`: "Reset lokal ke kondisi bersih"

### Tabel Perbandingan

| Operasi | Histori | Aman untuk publik? | Force push? |
|---------|---------|-------------------|-------------|
| `cherry-pick` | Tambah commit baru | ✅ Ya | ❌ Tidak |
| `revert` | Tambah commit baru | ✅ Ya | ❌ Tidak |
| `reset --soft` | Tulis ulang | ❌ Hanya lokal | ✅ Perlu |
| `reset --hard` | Tulis ulang | ❌ Hanya lokal | ✅ Perlu |

> **Aturan emas**: Jangan `reset` commit yang sudah di-push ke branch bersama. Pakai `revert`.

---

## 3.5 Tips Tim

### Komunikasi

- **Sebelum rebase force push**: kasih tahu tim "Saya rebase branch X, jangan push dulu"
- **Conflict besar**: panggil author branch lain untuk diskusi langsung
- **Gunakan draft PR**: untuk branch yang masih WIP, jangan minta review dulu

### Small PRs

- Maksimal 200-300 lines per PR
- Satu PR = satu concern
- PR kecil = conflict lebih jarang, review lebih cepat

### Rebase Often

```bash
# Minimal sehari sekali
git checkout main
git pull origin main
git checkout feature/login
git rebase main
```

### Git Aliases untuk Produktivitas

```bash
# Tambah ke ~/.gitconfig atau ~/.bashrc
git config --global alias.lg "log --graph --oneline --all"
git config --global alias.undo "reset --soft HEAD~1"
git config --global alias.amend "commit --amend --no-edit"
git config --global alias.please "push --force-with-lease"
```

---

## 3.6 Latihan

### Latihan 1: Create Merge Conflict

#### Setup

```bash
# 1. Clone atau masuk ke repo latihan
cd ~/Projects/latihan-git-workflow  # atau repo manapun

# 2. Buat file bersama
cat > team-list.txt << 'EOF'
Anggota Tim:
- Alice
- Bob
EOF

git add team-list.txt
git commit -m "feat: add team list with Alice and Bob"

git push origin main
```

#### Part A: Conflict Content

```bash
# 3. Dua branch edit baris yang sama
git checkout main
git checkout -b feature/tim-mark
# Edit team-list.txt — tambah Mark setelah Bob
cat > team-list.txt << 'EOF'
Anggota Tim:
- Alice
- Bob
- Mark
EOF

git add team-list.txt
git commit -m "feat(team): add Mark to team list"
git push origin feature/tim-mark

# 4. Branch lain
git checkout main
git checkout -b feature/tim-julia
# Edit team-list.txt — tambah Julia setelah Bob
cat > team-list.txt << 'EOF'
Anggota Tim:
- Alice
- Bob
- Julia
EOF

git add team-list.txt
git commit -m "feat(team): add Julia to team list"
git push origin feature/tim-julia
```

#### Part B: Resolve Conflict

```bash
# 5. Merge feature/tim-mark dulu ke main
git checkout main
git merge feature/tim-mark  # sukses
git push origin main

# 6. Coba merge feature/tim-julia → CONFLICT!
git merge feature/tim-julia
# CONFLICT (content): Merge conflict in team-list.txt
```

7. Buka VS Code → resolve conflict:
   - Accept both changes
   - Hasil: Alice, Bob, Mark, Julia
   - Simpan

```bash
# 8. Stage + commit
git add team-list.txt
git commit -m "chore: resolve merge conflict team list"
git push origin main
```

### Latihan 2: Rebase Feature Branch

```bash
# 1. Buat branch fitur baru
git checkout main
git checkout -b feature/about-page

# 2. Buat file
cat > about.html << 'EOF'
<!DOCTYPE html>
<html><body><h1>Tentang Kami</h1></body></html>
EOF

git add about.html
git commit -m "feat(about): add about page skeleton"

# 3. Sementara itu, main maju (simulasi tim lain push)
git checkout main
cat > README.md << 'EOF'
# Latihan Git Workflow
Selamat datang di repo latihan!
EOF
git add README.md
git commit -m "docs: update README with intro"
git push origin main

# 4. Rebase branch fitur ke main terbaru
git checkout feature/about-page
git rebase main
# Jika conflict, resolve + git rebase --continue

# 5. Force push
git push origin feature/about-page --force-with-lease

# 6. Buat PR, merge, selesai
```

### Latihan 3: Interactive Rebase — Squash & Fixup

```bash
# 1. Buat branch
git checkout main
git checkout -b feature/squash-practice

# 2. Buat 3 commit
echo "# Project" > project.md
git add project.md
git commit -m "feat: init project"

echo "## Installation" >> project.md
git add project.md
git commit -m "wip: add install section"

echo "## Usage" >> project.md
git add project.md
git commit -m "wip: add usage section"

# 3. Squash jadi 1 commit
git rebase -i HEAD~3
# Ubah: pick → squash untuk commit 2 dan 3
# Simpan → edit pesan jadi "docs: add project README with install and usage"

# 4. Verifikasi
git log --oneline -3

# 5. Force push
git push origin feature/squash-practice --force-with-lease
```

### Latihan 4: Cherry-pick & Revert

```bash
# Cherry-pick
git checkout main
git log feature/about-page --oneline
git cherry-pick <hash-commit-about-page>
# Commit about page masuk ke main tanpa merge seluruh branch

# Revert
git log --oneline -5
git revert HEAD  # revert commit terakhir
# Commit revert dibuat otomatis
git log --oneline -5  # lihat commit revert baru
```

### Checklist Output Sesi 3

- [ ] Berhasil membuat dan resolve merge conflict (content conflict)
- [ ] Berhasil rebase feature branch ke main terbaru
- [ ] Berhasil interactive rebase: squash 3 commit jadi 1
- [ ] Berhasil cherry-pick commit dari branch lain
- [ ] Berhasil revert commit
- [ ] Paham perbedaan reset --soft, --mixed, --hard
- [ ] Paham kapan pakai `--force-with-lease`

---

## Referensi

- [Git Branching - Basic Branching and Merging](https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging)
- [VS Code Merge Editor](https://code.visualstudio.com/docs/sourcecontrol/overview#_merge-editor)
- [Git Tools - Rewriting History](https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History)
- [Git Tools - Reset Demystified](https://git-scm.com/book/en/v2/Git-Tools-Reset-Demystified)
- [Oh shit, git!](https://ohshitgit.com/) — penyelamat darurat git
