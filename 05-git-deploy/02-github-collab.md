# 1.2 GitHub Collaboration

## Setup Remote

Bikin repo dulu di github.com (jangan centang README).

```bash
# Hubungkan repo lokal ke GitHub
git remote add origin https://github.com/username/nama-repo.git

# Kirim branch utama ke GitHub
git push -u origin main
```

`-u` artinya set upstream — setelah ini cukup pake `git push` aja.

## Clone & Pull

```bash
# Download repo dari GitHub ke lokal (baru pertama)
git clone https://github.com/username/nama-repo.git

# Ambil update terbaru (udah pernah clone)
git pull origin main
```

## Branch — Bikin Cabang

```bash
# Lihat branch saat ini
git branch

# Bikin branch baru
git branch fitur-login

# Pindah ke branch itu
git checkout fitur-login

# Bikin + pindah sekaligus
git checkout -b fitur-login
```

## Merge — Gabung Branch

```bash
# Selesai ngerjain fitur, gabung ke main
git checkout main
git merge fitur-login

# Hapus branch yang udah di-merge (optional)
git branch -d fitur-login
```

## Pull Request (PR) — Kolaborasi Tim

Langkah-langkah PR di GitHub:

1. Push branch ke GitHub:
   ```bash
   git checkout -b fitur-navbar
   git add .
   git commit -m "feat: tambah navbar responsive"
   git push -u origin fitur-navbar
   ```
2. Buka GitHub → muncul tombol **Compare & pull request**
3. Klik, tulis deskripsi, klik **Create pull request**
4. Minta temen review
5. Klik **Merge pull request** setelah disetujui
6. Pull main lagi di lokal:
   ```bash
   git checkout main
   git pull origin main
   ```

## Conflict Resolution — Konflik Merge

Conflict terjadi saat 2 orang ubah baris yang sama di file yang sama.

```bash
# Contoh situasi conflict
git checkout -b ubah-warna
# ubah teks di index.html
git add .
git commit -m "style: ganti warna header"

git checkout main
# ubah baris YANG SAMA di index.html
git add .
git commit -m "fix: perbaiki typo header"

git merge ubah-warna
# Output: CONFLICT (content) in index.html
```

Di file yang conflict, Git kasih penanda:

```html
<<<<<<< HEAD
<h1 style="color: red">Selamat Datang</h1>
=======
<h1 style="color: blue">Selamat Datang</h1>
>>>>>>> ubah-warna
```

**Langkah resolve:**

1. Buka file di editor
2. Hapus `<<<<<<< HEAD`, `=======`, `>>>>>>> ubah-warna`
3. Pilih versi yang bener (atau gabungin)
4. Simpan, lalu:
   ```bash
   git add index.html
   git commit -m "merge: resolve conflict warna header"
   ```

## Git Workflow Standar Tim

```bash
# 1. Ambil update terbaru
git checkout main
git pull origin main

# 2. Bikin branch fitur
git checkout -b fitur-saya

# 3. Kerja, commit, push
git add .
git commit -m "feat: ..."
git push -u origin fitur-saya

# 4. Buka PR di GitHub → review → merge
# 5. Balik ke main, update, hapus branch lokal
git checkout main
git pull origin main
git branch -d fitur-saya
```

## Latihan

1. Bikin repo baru di GitHub, `git remote add origin`, push project dari sesi 1
2. Bikin branch `fitur-footer`, ubah footer di `index.html`, commit, push, bikin PR di GitHub, merge
3. Simulasi conflict: 2 branch ubah baris yang sama di README, resolve conflict pake editor
4. Clone repo punya temen, bikin branch, commit, push, bikin PR (minta temen review & merge)
