---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — ![Team Git Workflow Banner](https://images.pexels.com/photos"
footer: "Sesi 01: Branching Strategy"
---

<!-- _class: title -->
# Sesi 1: Branching Strategy

> Pilih strategi branch yang tepat, beri nama branch konsisten, tulis commit terstruktur, dan kelola versi rilis profesional.

**Durasi**: 4 jam | **Output**: Branching strategy dokumen + repo dengan conventional commits

---

## 1.1 Branching Strategy Overview

Tiga strategi branching utama yang dipakai tim engineering:

### GitFlow

```
main ───────●──────────●──────────●──────────
             \        / \        / \
              develop─●───●───────●───●────●
                     /      \         /      \
              feature/a      v1.0.0  release/1.1
```

- **main** — kode produksi, hanya menerima merge dari `release` atau `hotfix`
- **develop** — integration branch untuk fitur yang belum dirilis
- **feature/** — branch untuk fitur baru, branch dari `develop`, merge balik ke `develop`
- **release/** — persiapan rilis, branch dari `develop`, merge ke `main` dan `develop`
- **hotfix/** — perbaikan urgent di produksi, branch dari `main`, merge ke `main` dan `develop`

**Cocok untuk**: Proyek dengan rilis terjadwal, tim besar, produk stabil.

### GitHub Flow

```
main ───●────●────●────●────●────●────●
          \  /      /    /          /
           feature/a  fix/b      chore/c
```

- Hanya satu branch abadi: `main`
- Semua pekerjaan di branch fitur → Pull Request → review → merge ke `main`
- Deploy langsung dari `main` atau dari branch fitur

**Cocok untuk**: Tim kecil, deployment kontinu (CI/CD), startup.

### Trunk-based Development

```
main ───●──●──●──●──●──●──●──●──●──●──●
         \/     \/      \/
        short-lived feature branches (< 1 hari)
```

- Developer commit langsung ke `main` atau branch pendek (short-lived)
- Branch fitur maksimal 1-2 hari sebelum merge
- Feature flags untuk menyembunyikan kode yang belum siap

**Cocok untuk**: CI/CD intensif, tim sangat agile, deployment multiple kali sehari.

### Perbandingan

| Aspek | GitFlow | GitHub Flow | Trunk-based |
|-------|---------|-------------|-------------|
| Jumlah branch abadi | 2 (main, develop) | 1 (main) | 1 (main) |
| Umur feature branch | Hari-minggu | Hari | Jam-1 hari |
| Kompleksitas | Tinggi | Rendah | Rendah |
| Cocok untuk | Rilis terjadwal | Deploy kontinu | Deploy sangat sering |
| Release management | Release branch | Tag / branch dari main | Feature flags |

---

## 1.2 Branch Naming Convention

Format konsisten biar branch mudah dilacak:

```
<type>/<deskripsi-singkat>
```

Gunakan **kebab-case** untuk deskripsi.

### Tipe Branch

| Tipe | Prefix | Contoh |
|------|--------|--------|
| **Feature** | `feature/` | `feature/login-page`, `feature/api-user-crud` |
| **Bug Fix** | `fix/` | `fix/navbar-overflow`, `fix/null-pointer-auth` |
| **Hotfix** | `hotfix/` | `hotfix/payment-gateway-down`, `hotfix/security-patch` |
| **Chore** | `chore/` | `chore/update-deps`, `chore/refactor-db-config` |
| **Docs** | `docs/` | `docs/api-readme`, `docs/contributing-guide` |
| **Release** | `release/` | `release/v1.2.0`, `release/v2.0.0-rc.1` |

### Contoh Buruk vs Baik

| Buruk | Baik |
|-------|------|
| `my-branch` | `feature/login-page` |
| `fix-bug` | `fix/navbar-overflow-mobile` |
| `wip` | `chore/update-tailwind-v3` |
| `tes` | `docs/setup-guide` |

---

## 1.3 Conventional Commits

Format standar pesan commit yang terstruktur:

```
<type>(<optional scope>): <description>

[optional body]

[optional footer(s)]
```

### Tipe Commit

| Tipe | Kapan Pakai |
|------|-------------|
| `feat:` | Fitur baru |
| `fix:` | Perbaikan bug |
| `chore:` | Tugas rutin (update deps, config) |
| `docs:` | Dokumentasi |
| `refactor:` | Refaktor kode tanpa perubahan behavior |
| `style:` | Formatting, whitespace (bukan CSS) |
| `test:` | Nambah / update test |
| `perf:` | Optimasi performa |
| `ci:` | Config CI/CD |
| `build:` | Build system / dependencies |

### Contoh

```
feat(auth): add login page with JWT validation

Implementasi form login dengan validasi JWT token.
Email dan password divalidasi client-side sebelum dikirim.

Closes #42
```

```
fix(navbar): fix overflow on mobile viewport

Navbar item keluar layar di viewport < 375px.
Ganti flex-wrap dan tambah min-width agar responsif.

Fixes #87
```

```
chore(deps): upgrade axios from 0.27 to 1.6

Perlu update karena security vulnerability CVE-2023-XXXXX.
```

```
docs: add API endpoint documentation for /users

Lengkapi README dengan daftar endpoint, contoh request/response.
```

### BREAKING CHANGE

Gunakan `BREAKING CHANGE` di footer atau tambahkan `!` setelah type/scope:

```
feat(api)!: change user response format

BREAKING CHANGE: Field 'username' renamed to 'handle'.
Semua client perlu update mapping.
```

```
refactor!(db): migrate from MySQL to PostgreSQL

BREAKING CHANGE: Semua query SQL perlu diadaptasi ke dialect PostgreSQL.
```

---

## 1.4 Semantic Versioning (SemVer)

Format: `MAJOR.MINOR.PATCH` — `v1.4.2`

| Komponen | Increment Ketika |
|----------|------------------|
| **MAJOR** | Breaking change — API tidak backward compatible |
| **MINOR** | Fitur baru — backward compatible |
| **PATCH** | Bug fix — backward compatible |

### Pre-release Tags

```
v1.0.0-alpha.1
v1.0.0-beta.2
v1.0.0-rc.3
```

- `alpha` — pengembangan awal, fitur belum lengkap
- `beta` — fitur lengkap, masih ada bug
- `rc` (release candidate) — stabil, siap testing final

### Contoh Versioning

```
v1.0.0        ← Rilis pertama
v1.1.0        ← Tambah fitur baru (minor)
v1.1.1        ← Bug fix
v2.0.0-alpha  ← Breaking change (masih alpha)
v2.0.0-rc.1   ← Siap testing
v2.0.0        ← Rilis major
```

---

## 1.5 Tagging & Release Branch

### Membuat Tag

```bash

---

# Lightweight tag
git tag v1.0.0


---

# Annotated tag (recommended — simpan metadata)
git tag -a v1.0.0 -m "Release v1.0.0 - First stable version"


---

# Push tag ke remote
git push origin v1.0.0


---

# Push semua tag
git push --tags
```

### Release Branch Workflow (GitFlow)

```bash

---

# 1. Branch release dari develop
git checkout develop
git checkout -b release/v1.0.0


---

# 2. Final bug fix, update version
npx standard-version --release-as 1.0.0


---

# 3. Merge ke main + tag
git checkout main
git merge --no-ff release/v1.0.0
git tag -a v1.0.0 -m "Release v1.0.0"


---

# 4. Merge balik ke develop
git checkout develop
git merge --no-ff release/v1.0.0


---

# 5. Hapus release branch
git branch -d release/v1.0.0
```

### GitHub Release

Selain tag lokal, buat **GitHub Release** di UI:

1. Buka repo → **Releases** → **Create a new release**
2. Pilih tag, isi title + release notes
3. Upload binary/lampiran jika perlu
4. Publish

---

## 1.6 Diagram: Branching Strategy

### GitFlow Mermaid

```mermaid
gitGraph
   commit
   branch develop
   commit
   branch feature/login
   commit
   commit
   checkout develop
   merge feature/login
   branch release/v1.0.0
   commit
   checkout main
   merge release/v1.0.0
   tag "v1.0.0"
   checkout develop
   merge release/v1.0.0
   branch hotfix/security
   commit
   checkout main
   merge hotfix/security
   tag "v1.0.1"
   checkout develop
   merge hotfix/security
```

### GitHub Flow Mermaid

```mermaid
gitGraph
   commit
   commit
   branch feature/login
   commit
   commit
   checkout main
   merge feature/login
   commit
   tag "v1.0.0"
   branch fix/navbar
   commit
   checkout main
   merge fix/navbar
   commit
   tag "v1.0.1"
```

---

## 1.7 Latihan

### Latihan 1: Setup Branching Strategy

1. Buat repo baru di GitHub (public atau private)
2. Inisialisasi dengan README
3. Clone ke lokal

```bash
git clone https://github.com/username/latihan-git-workflow.git
cd latihan-git-workflow
```

4. Setup **GitFlow**:

```bash

---

# Install git-flow (Ubuntu/Debian)
sudo apt install git-flow


---

# Init git-flow di repo
git flow init

---

# Accept default values (Enter all)


---

# Buat feature branch dengan git-flow
git flow feature start landing-page
```

5. Alternatif setup **GitHub Flow** manual:

```bash

---

# Branch fitur langsung dari main
git checkout main
git pull origin main
git checkout -b feature/landing-page
```

### Latihan 2: Practice Conventional Commits

1. Di branch `feature/landing-page`, buat file `index.html`:

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Landing Page</title>
</head>
<body>
  <h1>Selamat Datang</h1>
  <p>Landing page kami.</p>
</body>
</html>
```

2. Stage dan commit:

```bash
git add index.html
git commit -m "feat(landing): add landing page with welcome section"
```

3. Edit file, tambah CSS:

```html
<style>
  body { font-family: sans-serif; text-align: center; padding: 2rem; }
  h1 { color: #2563eb; }
</style>
```

4. Commit kedua:

```bash
git add index.html
git commit -m "style(landing): add basic styling with blue heading"
```

5. Buat beberapa branch dan commit dengan tipe berbeda:

```bash

---

# Branch fix
git checkout main
git checkout -b fix/typo-welcome

---

# Edit perbaiki typo
git add .
git commit -m "fix(landing): fix typo in welcome message"


---

# Branch chore
git checkout main
git checkout -b chore/add-gitignore
echo "node_modules/" > .gitignore
git add .gitignore
git commit -m "chore: add node_modules to gitignore"
```

### Latihan 3: Tagging & Verifikasi

```bash

---

# Merge branch ke main
git checkout main
git merge --no-ff feature/landing-page
git merge --no-ff fix/typo-welcome


---

# Buat tag
git tag -a v0.1.0 -m "v0.1.0 - Landing page dasar"


---

# Push semua
git push origin main --tags


---

# Lihat log
git log --oneline --graph --all


---

# Lihat tag
git tag -l -n
```

### Checklist Output Sesi 1

- [ ] Repo dengan strategi branch (GitFlow/GitHub Flow) sudah diinisialisasi
- [ ] Minimal 3 branch berbeda dengan naming convention benar
- [ ] Minimal 5 commit dengan format Conventional Commits
- [ ] Minimal 2 tipe commit berbeda (feat, fix, chore, dll)
- [ ] Tag semantic versioning sudah dibuat
- [ ] Branch strategy didokumentasikan di README repo

---

## Referensi

- [GitFlow - Vincent Driessen](https://nvie.com/posts/a-successful-git-branching-model/)
- [GitHub Flow Guide](https://docs.github.com/en/get-started/using-github/github-flow)
- [Trunk-based Development](https://trunkbaseddevelopment.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [GitFlow CLI Cheatsheet](https://danielkummer.github.io/git-flow-cheatsheet/)
