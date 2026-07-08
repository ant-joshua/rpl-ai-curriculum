# 1.2 GitHub — Kolaborasi & Remote

Git = lokal di laptop. GitHub = cloud tempat nyimpen git repo biar bisa kolaborasi sama tim. Alternatif lain: GitLab, Bitbucket, Gitea — tapi GitHub paling populer.

## Setup Remote — Hubungin Lokal ke GitHub

```bash
# 1. Bikin repo baru di github.com
#    JANGAN centang "Add README" (nanti conflict pas push)

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

**Apa itu `origin`?** Nama default buat remote. Bisa ganti kalo mau (tapi ga perlu). Bisa punya banyak remote: `origin` (GitHub), `backup` (GitLab), `mirror` (server sendiri).

### Authentication — Pilih yang mana?

| Metode | Cara | Kapan? |
|--------|------|--------|
| **HTTPS + Token** | Username + Personal Access Token | Paling gampang, recommended |
| **SSH** | SSH key pair | Developer advance, lebih aman |
| **GitHub CLI** | `gh auth login` | Kalo suka CLI |

**Bikin Personal Access Token (PAT):**
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token, centang `repo`, `workflow`
3. Copy token, simpen
4. Pas `git push`, masukin username + token (bukan password)

**Setup SSH (sekali doang):**
```bash
# Bikin SSH key
ssh-keygen -t ed25519 -C "email@kamu.com"
# Lokasi: ~/.ssh/id_ed25519
# Isi passphrase (kosongin kalo males, tapi kurang aman)

# Copy public key
cat ~/.ssh/id_ed25519.pub
# Buka GitHub → Settings → SSH and GPG keys → New SSH key
# Paste key, save

# Test koneksi
ssh -T git@github.com
# Output: Hi username! You've successfully authenticated...
```

## Clone — Download Repo dari GitHub

```bash
# Pertama kali: download semua kode + seluruh history
git clone https://github.com/username/nama-repo.git
cd nama-repo

# Clone pake SSH (kalo udah setup)
git clone git@github.com:username/nama-repo.git

# Clone branch tertentu aja
git clone --branch fitur-login https://github.com/username/nama-repo.git

# Shallow clone — cuma commit terakhir (cepat, hemat bandwidth)
git clone --depth 1 https://github.com/username/nama-repo.git

# Kalau udah pernah clone: ambil update terbaru
git pull origin main
```

## Branch — Kerja Paralel Tanpa Tabrakan

Branch = **pointer ke commit**. Git cuma mindahin pointer — gak ada copy file. Makanya murah & cepat.

```bash
# Lihat branch saat ini
git branch
# * main — asterisk = branch aktif

# Lihat semua branch (termasuk remote)
git branch -a
# * main
#   remotes/origin/main
#   remotes/origin/fitur-login

# Bikin branch baru
git branch fitur-login

# Pindah ke branch itu
git checkout fitur-login

# Bikin + pindah SEKALIGUS (paling sering dipake!)
git checkout -b fitur-login

# Cara baru: git switch
git switch fitur-login
git switch -c fitur-login   # bikin + pindah

# Bikin branch dari commit tertentu
git checkout -b fitur-lama abc123

# Rename branch (kalo typo)
git branch -m fitur-login fitur-auth-login

# Hapus branch — aman (kalo udah di-merge)
git branch -d nama-branch

# Hapus branch — paksa (meski belum di-merge)
git branch -D nama-branch
```

### Contoh Workflow Branch

```bash
# Main branch — kode stabil, jangan commit langsung
git checkout main
git pull origin main       # Pastiin main up-to-date

# Bikin branch fitur
git checkout -b fitur-navbar

# Kerja... edit file... commit
git add .
git commit -m "feat: tambah navbar responsive"

# Kerja lagi...
git add .
git commit -m "style: styling navbar dark mode"

# Push branch ke GitHub
git push -u origin fitur-navbar
```

## Fetch — Lihat Update Tanpa Merge

```bash
# git fetch = download info dari remote, TAPI gak merge
git fetch origin
# Output: new branch: fitur-login -> origin/fitur-login

# Bandingin local vs remote
git log --oneline main..origin/main   # Apa yang beda?
git diff main origin/main             # Lihat perubahan

# Baru kalo aman, merge
git merge origin/main

# Fetch all branch dari semua remote
git fetch --all
```

## Pull — Fetch + Merge

```bash
# git pull = fetch + merge otomatis
git pull origin main
# Sama dengan:
#   git fetch origin
#   git merge origin/main

# Pull with rebase (lebih rapi — gak bikin merge commit)
git pull --rebase origin main

# Set biar default pull = rebase
git config --global pull.rebase true
```

## Merge — Gabung Branch Detail

```bash
# Selesai fitur, gabung ke main
git checkout main
git pull origin main
git merge fitur-navbar

# Merge dengan --no-ff (no fast-forward) — paksa bikin merge commit
git merge --no-ff fitur-navbar
# Berguna biar history keliatan jelas ada fitur branch

# Squash merge — gabungin semua commit jadi 1
git merge --squash fitur-navbar
git commit -m "feat: tambah navbar"
# Semua commit kecil di branch fitur digabung jadi 1 commit
```

## Pull Request (PR) — Kolaborasi Tim

PR = cara minta **review** sebelum kode digabung ke branch utama.

### Langkah PR Lengkap

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
5. Isi detail PR:
   - **Title**: deskripsi singkat apa yang diubah
   - **Description**: kenapa, gimana, screenshot kalo ada
   - **Reviewer**: pilih temen yang mau ngereview
   - **Labels**: bug / enhancement / documentation
   - **Projects**: konek ke project board (kalo ada)
   - **Milestone**: target rilis (kalo ada)
6. Klik **Create pull request**
7. Reviewer kasih komentar / approve / minta revisi
8. Kalo ada revisi → commit lagi di branch yang sama → push → PR auto-update
9. Kalo udah approve → klik **Merge pull request**
10. Balik ke terminal, bersihin branch:
```bash
git checkout main
git pull origin main
git branch -d fix-responsif           # Hapus branch lokal
git push origin --delete fix-responsif # Hapus branch remote
```

### 3 Opsi Merge di GitHub

| Opsi | Efek | History |
|------|------|---------|
| **Create merge commit** | Default. Bikin merge commit | Ada cabang keliatan |
| **Squash and merge** | Gabung semua commit PR jadi 1 | Rapi, 1 commit per PR |
| **Rebase and merge** | Rebase + fast-forward | Linear, gak ada merge commit |

### PR Template — `.github/pull_request_template.md`

Bikin file ini di repo, otomatis muncul tiap bikin PR:

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

### Code Review — Etika & Teknik

**Sebagai Author (yang bikin PR):**
- Bikin PR kecil & fokus (1 fitur per PR)
- Tulis deskripsi yang jelas: **kenapa** bukan cuma **apa**
- Balas komentar reviewer dengan sopan
- Jangan marah kalo dikritik — itu bikin kode lo lebih baik

**Sebagai Reviewer:**
- Baca kode dengan teliti
- Komentari **kode**, bukan **orangnya**
- "Ini bisa pake `map()` daripada `for` loop" ✅
- "Kok lo pake for loop sih? Basic banget" ❌
- Kasih **saran**, bukan perintah
- Kalo gak ngerti, tanya — bukan asumsi jelek

**Checklist Review:**
- [ ] Logic bener? Gak ada bug?
- [ ] Ada test? (kalo perlu)
- [ ] Gak ada kode mati / comment yang gak dipake
- [ ] Naming jelas? (jangan `data1`, `temp`, `foo`)
- [ ] Security? (SQL injection? hardcode secret?)
- [ ] Performance? (N+1 query? loop dalam loop?)

## Issues — Tracking Bug & Fitur

Issues = tempat ngobrolin bug, fitur, tugas, atau ide.

```bash
# via GitHub CLI
gh issue list                        # Lihat semua issue
gh issue create --title "..." --body "..."
gh issue view 123
gh issue close 123
gh issue comment 123 --body "fixed in PR #456"
```

**Format issue yang baik:**
```
## Judul: [Bug] Login gagal di Firefox

## Deskripsi
Pas klik tombol login di Firefox, gak ada response.
Di Chrome works fine.

## Steps to reproduce
1. Buka Firefox (v120+)
2. Buka https://example.com/login
3. Isi email & password bener
4. Klik Login
5. Gak terjadi apa-apa

## Expected behavior
Redirect ke dashboard

## Screenshots
[Tambah screenshot]

## Environment
- OS: Windows 11
- Browser: Firefox 120
- Device: Desktop

## Additional context
Console: "Uncaught TypeError: ..."
```

**Labels umum:**
- `bug` — ada yang rusak
- `enhancement` — fitur baru
- `good first issue` — buat contributor pemula
- `help wanted` — butuh bantuan
- `question` — tanya-tanya

## Project Boards — Manajemen Tugas

GitHub Projects = papan Kanbu buat ngatur workflow.

**Kolom standar:**
```
Todo → In Progress → In Review → Done
```

**Best practice:**
- Tiap issue masuk ke kolom "Todo"
- Waktu mulai kerja → pindahin ke "In Progress"
- Kalo bikin PR → link issue → pindah ke "In Review"
- PR di-merge → otomatis pindah ke "Done"

## Fork Workflow — Kontribusi ke Repo Orang Lain

Fork = copy repo orang lain ke akun GitHub lo. Dipake kalo:
- Mau kontribusi ke open source (gak punya akses push)
- Mau modifikasi project orang buat kebutuhan sendiri
- Mau belajar dari kode orang tanpa takut ngerusak

```bash
# 1. Fork di GitHub — klik "Fork" di repo target
# 2. Clone fork punya lo
git clone https://github.com/username/repo-yang-di-fork.git
cd repo-yang-di-fork

# 3. Tambah remote "upstream" (repo asli)
git remote add upstream https://github.com/original-owner/repo.git
git remote -v
# origin     https://github.com/username/repo.git (fork punya lo)
# upstream   https://github.com/original-owner/repo.git (original)

# 4. Bikin branch fitur
git checkout -b fix-typo-readme

# 5. Edit, commit, push ke fork
git add README.md
git commit -m "docs: perbaiki typo di README"
git push -u origin fix-typo-readme

# 6. Bikin Pull Request dari branch fork ke repo asli
#    GitHub → Klik "Contribute" → "Open Pull Request"
#    Ini beda: PR dari username/fix-typo-readme ke original-owner/main

# 7. Maintainer review, approve, merge

# 8. Sync fork dengan upstream (biar gak ketinggalan)
git checkout main
git pull upstream main          # Ambil update dari repo asli
git push origin main            # Update fork punya lo
```

**Keep fork updated — penting!**
```bash
# Update fork secara rutin
git fetch upstream
git checkout main
git rebase upstream/main        # Atau git merge upstream/main
git push origin main
```

## Git Flow vs Trunk-Based Development

Dua strategi branching yang populer:

### Git Flow — Struktur Rapi

```
main ──── v1.0 ──────── v1.1 ────── v2.0
          \              /
develop ──── A ── B ── C ── D ── E
              \        /
feature/login   F ── G
                      \
release/v1.1          H ── I  (bugfix)
```

**Branch:**
- `main` — kode produksi (hanya rilis)
- `develop` — integrasi fitur
- `feature/*` — fitur baru (branch dari develop)
- `release/*` — persiapan rilis (branch dari develop, merge ke main & develop)
- `hotfix/*` — bug darurat di produksi (branch dari main, merge ke main & develop)

**Kapan pake:** Project besar dengan jadwal rilis terjadwal, tim 5+

### Trunk-Based Development — Simpel & Cepat

```
main ──── A ── B ── C ── D ── E
              \    /
feature/login  F  G   (short-lived, < 2 hari)
```

**Aturan:**
- Semua orang commit ke `main` (atau branch pendek yang langsung di-merge)
- Feature branch umur pendek (maks 1-2 hari)
- Banyak commit kecil, bukan PR gede
- Feature flag di kode (bukan di branch)

**Kapan pake:** Startup, CI/CD, deploy tiap hari, tim 1-10 orang

### Perbandingan

| Aspek | Git Flow | Trunk-Based |
|-------|----------|-------------|
| Kompleksitas | Tinggi | Rendah |
| Cocok untuk | Rilis besar terjadwal | Deploy kontinyu |
| Branch lifetime | Minggu-bulan | Jam-hari |
| Merge hell | Sering kalo branch lama | Jarang |
| CI/CD effort | Sedang | Mudah |

**Rekomendasi buat pemula:** Pake **Trunk-Based**. Simpel, gampang, cukup buat belajar. Git Flow nanti aja kalo udah kerja di tim besar.

## Conflict Resolution — Strategi & Tools

Conflict = 2 orang ubah **baris yang sama** di **file yang sama**.

```bash
# Situasi:
# Budi: branch ubah-warna → ubah h1 color
# Ani:  branch ubah-font  → ubah h1 font-size (baris SAMA)
# Keduanya merge ke main → CONFLICT!
```

### Tanda-tanda Conflict

Di file conflict, Git pasang penanda:

```html
<<<<<<< HEAD (main)
<h1 style="color: red; font-size: 2rem;">Selamat Datang</h1>
=======
<h1 style="color: blue; font-size: 2.5rem;">Selamat Datang</h1>
>>>>>>> ubah-font
```

- `<<<<<<< HEAD` — versi branch tujuan (yang lo checkout)
- `=======` — pemisah
- `>>>>>>> ubah-font` — versi branch yang di-merge

### Cara Resolve Conflict

```bash
# 1. Buka file di editor
# 2. Hapus: <<<<<<< HEAD, =======, >>>>>>> ubah-font
# 3. Pilih versi bener (atau gabungin):

<h1 style="color: red; font-size: 2.5rem;">Selamat Datang</h1>

# 4. Simpan, stage, commit
git add index.html
git commit -m "merge: resolve conflict di header styling"
```

### Conflict Resolution Strategies

| Strategi | Cara | Kapan |
|----------|------|-------|
| **Accept theirs** | Pake versi orang lain | Kode orang lebih baru/lebih bener |
| **Accept ours** | Pake versi kita | Kita yakin versi kita bener |
| **Manual merge** | Gabung manual | Keduanya valid, perlu digabung |
| **VSCode tri-merge** | Pake editor visual | Conflict rumit, 3 panel |

**Accept all theirs / ours:**
```bash
# Accept their version for ALL conflicts in this file
git checkout --ours index.html    # Pake versi kita
git checkout --theirs index.html  # Pake versi mereka
git add index.html
git commit -m "merge: pake versi ..."
```

### VSCode Built-in Merge Editor

VSCode (v1.72+) punya **merge editor** bawaan:
1. Pas conflict → klik "Resolve in Merge Editor"
2. 3 panel: Incoming (mereka), Current (kita), Result (hasil)
3. Pilih perubahan yang mau diterima
4. Klik "Complete Merge"

```bash
# Set VSCode sebagai default merge tool
git config --global merge.tool vscode
git config --global mergetool.vscode.cmd "code --wait --merge \$LOCAL \$REMOTE \$BASE \$MERGED"
```

### Mencegah Conflict

Conflict gak bisa dihindari 100%, tapi bisa diminimalisir:

1. **Tarik sering** — `git pull` tiap mau mulai kerja
2. **Branch pendek** — jangan biarkan branch hidup > 2 hari
3. **Komunikasi tim** — bilang kalo mau ubah file yang lagi dipake orang
4. **File kecil** — pisahin kode ke banyak file kecil, bukan 1 file gede
5. **Satu tanggung jawab** — jangan ubah formatting sama logic di 1 commit

## GitHub Actions — CI/CD Otomatis

GitHub bisa jalanin script otomatis pas ada event (push, PR, dll):

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
```

GitHub Actions jalan di **Runner** (server GitHub). Gratis 2000 menit/bulan buat repo public.

## GitHub CLI — `gh`

Tool CLI resmi dari GitHub. Install & login:

```bash
# Install
sudo apt install gh   # Linux
# Atau dari GitHub Releases

# Login
gh auth login
# Pilih: GitHub.com, HTTPS, Login with browser

# Commands penting
gh repo create nama-repo --public --source=. --remote=origin --push
gh repo view
gh pr create --title "PR Saya" --body "Deskripsi"
gh pr list
gh pr checkout 123      # Checkout PR tertentu
gh issue create
gh run list              # Lihat GitHub Actions
gh run watch             # Monitor running action
```

## Latihan

1. **Push** — push project latihan sebelumnya ke GitHub (pake PAT)
2. **SSH Setup** — setup SSH key, ganti remote dari HTTPS ke SSH
3. **Branch & PR** — bikin branch `fitur-tambah-footer`, tambah footer HTML, commit, push, bikin PR, merge
4. **Code Review** — review PR temen, kasih komentar konstruktif
5. **Conflict Simulasi** — 2 branch ubah README baris yang sama, merge, resolve conflict pake berbagai strategi
6. **Fork & PR** — fork repo temen, bikin perubahan, PR ke repo asli
7. **Issue** — bikin issue di repo, label, assign ke diri sendiri
8. **Project Board** — bikin GitHub Project, tambah issue ke kolom
9. **GitHub CLI** — install gh, login, bikin repo dari CLI
10. **Fork Sync** — fork repo open source (contoh: first-contributions), clone, sync dengan upstream
11. **Trunk-Based Practice** — sehari kerja: bikin branch, commit 3x, PR, merge, ulang — tanpa branch > 1 hari
12. **GitHub Actions** — tambah workflow CI `.github/workflows/ci.yml` ke project
