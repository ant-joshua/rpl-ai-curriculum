# 1.2 GitHub — Kolaborasi & Remote

Git = lokal di laptop. GitHub = cloud tempat nyimpen git repo biar bisa kolaborasi.

## Setup Remote — Hubungin Lokal ke GitHub

```bash
# 1. Bikin repo baru di github.com
#    JANGAN centang "Add README" (nanti conflict)

# 2. Hubungin repo lokal ke GitHub
git remote add origin https://github.com/username/nama-repo.git

# 3. Kirim kode ke GitHub
git push -u origin main
# -u = set upstream: setelah ini cukup `git push` aja

# Cek remote
git remote -v
# origin  https://github.com/username/nama-repo.git (fetch)
# origin  https://github.com/username/nama-repo.git (push)
```

**Apa itu `origin`?** Nama default buat remote. Bisa ganti kalo mau (tapi ga perlu).

## Clone — Download Repo dari GitHub

```bash
# Pertama kali: download semua kode
git clone https://github.com/username/nama-repo.git
cd nama-repo

# Kalau udah pernah clone: ambil update terbaru
git pull origin main
```

## Branch — Kerja Paralel Tanpa Tabrakan

Branch = **copy-an** kode. Lo bisa ubah-ubah di branch tanpa ngaruh ke yang lain.

```bash
# Lihat branch saat ini
git branch
# * main — asterisk = branch aktif

# Bikin branch baru
git branch fitur-login

# Pindah ke branch itu
git checkout fitur-login

# Bikin + pindah SEKALIGUS (paling sering dipake!)
git checkout -b fitur-login

# Bikin branch dari commit tertentu
git checkout -b fitur-lama abc123
```

### Contoh Workflow Branch

```bash
# Main branch — kode stabil, jangan commit langsung
git checkout main
git pull origin main       # Pastiin main up-to-date

# Bikin branch fitur
git checkout -b fitur-navbar

# Kerja... edit file...
git add .
git commit -m "feat: tambah navbar responsive"

# Kerja lagi...
git add .
git commit -m "style: styling navbar dark mode"

# Push branch ke GitHub
git push -u origin fitur-navbar
```

## Merge — Gabung Branch

```bash
# Selesai fitur, gabung ke main
git checkout main
git pull origin main       # Ambil update terbaru (mungkin ada yang nambah)
git merge fitur-navbar     # Gabung fitur-navbar ke main

# Kalo sukses:
# Updating abc123..def456
# Fast-forward (kalo linear)

# Hapus branch yang udah gak dipake
git branch -d fitur-navbar
```

### 3 Jenis Merge

```bash
# 1. Fast-forward — gak ada divergensi (biasa aja)
git merge fitur-navbar
# Output: Fast-forward — tinggal geser aja

# 2. Automatic merge — divergensi, tapi gak conflict
git merge fitur-navbar
# Output: Merge made by the 'ort' strategy

# 3. Conflict merge — sama-sama ubah file/baris yang sama
git merge fitur-navbar
# Output: CONFLICT (content) in index.html
# → Manual resolve dulu
```

## Pull Request (PR) — Kolaborasi Tim

PR = cara minta **review** sebelum kode digabung ke main.

### Langkah PR:

```bash
# 1. Pastikan branch main up-to-date
git checkout main
git pull origin main

# 2. Bikin branch fitur
git checkout -b fix-responsif

# 3. Kerja, commit, push
git add .
git commit -m "fix: perbaiki layout responsif di mobile"
git push -u origin fix-responsif
```

4. Buka GitHub → muncul banner **"fix-responsif had recent push"** → klik **Compare & pull request**
5. Isi:
   - **Title**: deskripsi singkat apa yang diubah
   - **Description**: kenapa, gimana, screenshot kalo ada
   - **Reviewer**: pilih temen yang mau ngereview
6. Klik **Create pull request**
7. Reviewer kasih komentar / approve / minta revisi
8. Kalo udah approve → klik **Merge pull request**
9. Balik ke terminal:
```bash
git checkout main
git pull origin main
git branch -d fix-responsif  # Hapus branch lokal
```

### PR Template — `.github/pull_request_template.md`

```markdown
## Deskripsi
Apa yang diubah dan kenapa

## Related Issue
Closes #123

## Screenshots (kalo ada)
[screenshot]

## Checklist
- [ ] Kode udah di-test lokal
- [ ] Gak ada error/warning baru
- [ ] Udah di-review temen
```

## Conflict Resolution

Conflict = 2 orang ubah **baris yang sama** di **file yang sama**.

```bash
# Situasi:
# Budi: branch ubah-warna → ubah h1 color
# Ani:  branch ubah-font  → ubah h1 font-size (baris SAMA)
# Keduanya merge ke main → CONFLICT!
```

Di file conflict, Git pasang penanda:

```html
<<<<<<< HEAD (main)
<h1 style="color: red; font-size: 2rem;">Selamat Datang</h1>
=======
<h1 style="color: blue; font-size: 2.5rem;">Selamat Datang</h1>
>>>>>>> ubah-font
```

**Langkah resolve:**

```bash
# 1. Buka file di editor
# 2. Hapus: <<<<<<< HEAD, =======, >>>>>>> ubah-font
# 3. Pilih versi bener (atau gabungin):

<h1 style="color: red; font-size: 2.5rem;">Selamat Datang</h1>

# 4. Simpan, stage, commit
git add index.html
git commit -m "merge: resolve conflict di header styling"
```

**Tools resolve conflict:**

```bash
# Visual merge tool
git mergetool  # Buka VSCode/kdiff3

# Abort merge kalo bingung
git merge --abort  # Balik ke sebelum merge
```

## Git Rebase — Alternatif Merge (Hati-hati!)

Rebase = **mindahin** base branch. Bikin history lebih rapi tapi **JANGAN** dipake kalo branch udah dipush bersama.

```bash
# Daripada merge yang bikin merge commit:
git checkout fitur
git merge main  # Bikin extra merge commit

# Mending rebase — history linear:
git checkout fitur
git rebase main  # Mindahin base ke ujung main
# Kalo conflict → resolve, git rebase --continue

# JANGAN pernah rebase branch publik / shared!
```

## Pull — Fetch + Merge

```bash
# Git fetch: download update tapi gak merge
git fetch origin
git log --oneline origin/main  # Liat apa aja yang baru

# Git pull: fetch + merge otomatis
git pull origin main
# Sama dengan:
# git fetch origin
# git merge origin/main

# Pull with rebase (lebih rapi)
git pull --rebase origin main
```

## Git Stash — Nyimpen Sementara

```bash
# Lagi kerja di branch A, tapi harus pindah ke B
# Simpen dulu kerjaan lo:

git stash                      # Simpen
git checkout branch-B          # Pindah
# ... kerja di branch B ...
git checkout branch-A
git stash pop                  # Ambil balik kerjaan

# Lihat isi stash
git stash list

# Simpen dengan pesan
git stash push -m "WIP: fitur login 80%"

# Ambil stash tertentu
git stash pop stash@{0}
git stash apply stash@{1}  # Ambil tapi jangan hapus dari stash

# Hapus stash
git stash drop stash@{0}
git stash clear  # Hapus SEMUA stash
```

## Git Tags — Rilis Versi

```bash
# Tandain versi tertentu
git tag v1.0.0 abc123
git tag -a v1.1.0 -m "Rilis dengan fitur login" abc123  # Annotated tag

# Push tag
git push origin v1.0.0
git push origin --tags  # Push semua tag

# Lihat tag
git tag
git tag -l "v1.*"

# Checkout tag
git checkout v1.0.0
```

## Latihan

1. **Push** — push project latihan sebelumnya ke GitHub
2. **Branch** — bikin branch `fitur-tambah-footer`, tambah footer HTML, commit, push
3. **PR** — bikin Pull Request di GitHub, merge
4. **Conflict Simulasi** — 2 branch ubah README baris yang sama, merge, resolve conflict
5. **Clone & Push** — clone repo dari partner, bikin branch, commit, PR
6. **Stash** — kerja di branch A, stash, pindah ke branch B, balik, stash pop
7. **Git Log Grafis** — bikin beberapa branch & merge, cek `git log --oneline --graph --all`
