# 🏋️ Latihan Git & Deploy

## Level 1: Dasar

### 1. Inisialisasi & Commit Pertama

Bikin repo git lokal dari folder kosong, bikin file `index.html`, commit.

```bash
# 1. Bikin folder "my-project"
mkdir my-project
cd my-project

# === KODE GIT LO DISINI ===
# 2. Init repo git
# 3. Bikin index.html dengan konten "<h1>Hello World</h1>"
# 4. Stage file index.html
# 5. Commit dengan pesan "feat: initial commit with index.html"
# 6. Cek log commit
```

**Perintah yang harus dipake:**
- `git init`
- `echo ... > index.html`
- `git add`
- `git commit`
- `git log --oneline`

**Expected output:**
```
commit abc123 (HEAD -> main)
Author: ... 
Date:   ...

    feat: initial commit with index.html
```

### 2. Branching Sederhana

Clone repo berikut (atau simulate di lokal) dan bikin branch fitur:

```bash
# Mulai dari repo yang udah ada 2 commit:
# - feat: add README
# - feat: add index.html

# === KODE GIT LO DISINI ===
# 1. Bikin branch baru "fitur-navbar"
# 2. Pindah ke branch itu
# 3. Tambah file "navbar.html" dengan konten <nav>...</nav>
# 4. Commit dengan pesan "feat: add navbar component"
# 5. Balik ke branch main
# 6. Cek daftar branch (harus ada 2)
# 7. Cek isi folder — navbar.html harusnya gak ada di main
```

**Expected:** Branch `fitur-navbar` punya file navbar.html. Branch `main` — gak punya.

### 3. Merge & Log Graph

```bash
# Situasi:
# main:     A---B---D
#                 /
# feature:  A---C
#
# A: initial commit
# B: add index.html (main)
# C: add style.css (feature)
# D: merge result

# Tugas: simulate scenario di atas
# === KODE GIT LO DISINI ===

# 1. Init repo
# 2. Commit A (README.md)
# 3. Commit B (index.html) di main
# 4. Bikin branch feature, pindah ke feature
# 5. Commit C (style.css) di feature
# 6. Balik ke main
# 7. Merge feature ke main
# 8. Cek log graph pake --graph --oneline --all
```

**Expected:** `git log --graph --oneline --all` nunjukin graph merge:
```
*   D Merge branch 'feature'
|\
| * C add style.css
* | B add index.html
|/
* A initial commit
```

## Level 2: Intermediate

### 4. Merge Conflict Resolution

Dua branch ngubah baris yang sama di file yang sama. Resolve conflict-nya.

**Skenario:**
```
main  → index.html punya <h1>Warna Favorit Saya</h1>
            daftar warna (item list)

Branch A → "biru" sebagai item pertama
Branch B → "merah" sebagai item pertama
```

**File awal (`index.html`):**
```html
<!DOCTYPE html>
<html>
<head><title>Warna</title></head>
<body>
  <h1>Warna Favorit Saya</h1>
  <ul>
    <li>kuning</li>
    <li>hijau</li>
  </ul>
</body>
</html>
```

**Branch A** tambah `<li>biru</li>` setelah `<h1>` (sebelum `<ul>`).
**Branch B** tambah `<li>merah</li>` di posisi yang sama.

```bash
# === KODE GIT LO DISINI ===
# 1. Init repo, commit index.html
# 2. Bikin branch branch-a, pindah, edit, commit (tambah "biru")
# 3. Balik main, bikin branch-b, edit, commit (tambah "merah")
# 4. Balik main, merge branch-a (harusnya OK dulu)
# 5. Merge branch-b → CONFLICT!
# 6. Buka index.html, liat conflict markers
# 7. Resolve: terima kedua perubahan (biru dulu, merah kedua)
# 8. Hapus conflict markers, stage, commit merge
```

**Expected conflict markers:**
```html
<<<<<<< HEAD
    <li>biru</li>
=======
    <li>merah</li>
>>>>>>> branch-b
```

**Resolved:**
```html
    <li>biru</li>
    <li>merah</li>
```

### 5. Pull Request Workflow

Simulasi workflow PR di GitHub (tanpa GitHub, pake branch lokal):

**Skenario:**
- Kamu contributor di repo "team-project"
- Mau nambah fitur "dark-mode"
- Harus: bikin branch → commit → push → PR → review → merge

```bash
# === KODE GIT LO DISINI ===

# Setup: repo dengan 2 commit (initial setup)
git init
echo "# Team Project" > README.md
git add README.md
git commit -m "chore: initial setup"
echo "<body>" > index.html
echo "</body>" >> index.html
git add index.html
git commit -m "feat: add index skeleton"

# Tugas:
# 1. Bikin branch fitur/dark-mode, pindah
# 2. Tambah file dark-mode.css dengan body { background: #111; color: #fff; }
# 3. Edit index.html — tambah <link> ke dark-mode.css
# 4. Stage & commit (pesan: "feat: add dark mode support")
# 5. Simulasi push: git push origin fitur/dark-mode (kalo ada remote)
#    Tanpa remote: catat commit hash untuk "pull request"
# 6. Balik ke main, merge fitur/dark-mode
# 7. Commit merge
# 8. Delete branch fitur/dark-mode (lokal)
```

**Pertanyaan (jawab di komentar):**
- Kenapa PR penting sebelum merge ke main?
- Apa yang dimaksud dengan "code review"?
- Kapan sebaiknya delete branch setelah di-merge?

### 6. Git Revert & Reset

Bikin situasi dimana kamu perlu revert commit terakhir dan reset commit yang sudah di-push.

```bash
# === KODE GIT LO DISINI ===

# Setup
git init
echo "v1" > app.js && git add . && git commit -m "feat: version 1"
echo "v2" >> app.js && git add . && git commit -m "feat: version 2"
echo "BUG: delete all data" >> app.js && git add . && git commit -m "feat: add delete feature"  # ← ini error
echo "v3" >> app.js && git add . && git commit -m "feat: version 3"

# Tugas A — Revert (commit error masih di history):
# 1. Cek log
# 2. Revert commit "feat: add delete feature" (bikin commit baru yang undo)
# 3. Cek isi app.js — baris "BUG" harus ilang
# 4. Cek log — revert commit muncul

# Tugas B — Reset (hapus dari history, HATI-HATI kalo udah di-push):
# Scenario: commit "add delete feature" belum di-push
# 1. Cek log
# 2. Reset --soft ke sebelum commit error
# 3. Cek file — app.js masih punya perubahan "BUG" di staging
# 4. Unstage, hapus baris BUG
# 5. Commit ulang dengan pesan yang bener
```

**Expected log setelah revert:**
```
*  abc123  Revert "feat: add delete feature"
*  def456  feat: version 3
*  ghi789  feat: add delete feature
*  jkl012  feat: version 2
*  mno345  feat: version 1
```

## Level 3: Challenge

### 7. Simulasi Git Flow — Team Collaboration

Simulasi kerja tim 3 orang (kamu mainkan semua peran pake branch).

**Scenario:** Tim bikin landing page.

```
Peran:
- Kamu (main): setup project + merge PR
- Andi (branch andi): bikin header + hero
- Budi (branch budi): bikin footer + kontak

Urutan kejadian:
1. Kamu init project: index.html + style.css — commit
2. Push ke remote (simulasi: catat aja)
3. Andi clone, bikin branch `fitur/header`, bikin header, push, PR
4. Budi clone, bikin branch `fitur/footer`, bikin footer, push, PR
5. Kamu merge PR Andi dulu (→ conflict mungkin?)
6. Kamu merge PR Budi (→ conflict karena sama-sama edit index.html!)
7. Resolve conflict
```

```bash
# === KODE GIT LO DISINI ===
# Implementasiin skenario di atas. Tulis semua perintah git yang dipake.
# Kalo ada conflict, tunjukin cara resolvenya.
```

**Expected:** Semua branch ter-merge ke main, file final punya header (dari Andi) + footer (dari Budi) + setup awal (dari kamu).

### 8. Debug Deploy — Vercel 404 & Environment Variable

**Skenario A — 404 di Vercel:**
Landing page static HTML di-deploy ke Vercel. Halaman index.html OK, tapi pas buka `/tentang` muncul 404. Padahal ada file `tentang.html`.

```bash
# Struktur folder:
# landing-page/
# ├── index.html
# ├── tentang.html
# ├── style.css
# └── yang-lain.html

# Masalah: Buka https://landing-page.vercel.app/tentang → 404
# Padahal https://landing-page.vercel.app/tentang.html → OK

# === JAWABAN LO DISINI ===
# 1. Apa penyebab masalah ini?
# 2. Gimana cara fix di Vercel?
#    (Hint: vercel.json, rewrites, clean URLs)
# 3. Tulis isi vercel.json yang bener
```

**Expected fix:**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/$1.html" }
  ]
}
```

**Skenario B — Environment Variable:**
Backend Express di-deploy ke Railway. Pake database PostgreSQL. Di lokal pake `DATABASE_URL=postgresql://localhost:5432/mydb`. Di Railway, `DATABASE_URL` udah di-set di dashboard. Tapi pas deploy, koneksi DB gagal.

```bash
# === JAWABAN LO DISINI ===
# 1. Apa yang mungkin salah?
#    - .env file ke-commit? (cek .gitignore)
#    - Nama env variable beda? (process.env.DATABASE_URL vs process.env.DB_URL)
#    - Railway env variable belum di-set?
# 2. Tulis checklist debugging:
#    - ...
#    - ...
# 3. Kode koneksi DB yang bener (pake fallback):
```

**Expected:** Checklist debugging:
- Cek Railway dashboard → Variables → DATABASE_URL ada?
- Cek kode: `process.env.DATABASE_URL` spelling-nya bener?
- Cek .gitignore — .env harus di-ignore
- Cek log Railway: error message-nya apa?
- Kalo perlu: `console.log("DB URL:", process.env.DATABASE_URL?.slice(0, 20))` buat debug (jangan log full URL)
