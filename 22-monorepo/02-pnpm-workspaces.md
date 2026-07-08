# 02 — PNPM Workspaces: Setup, Dependency & Versioning

## 🎯 Tujuan

Setelah sesi ini, kamu mampu:

- Setup **pnpm workspace** dengan `pnpm-workspace.yaml`
- Mengelola **dependensi antar package** dalam monorepo
- Memahami perbedaan **struktur node_modules pnpm vs npm**
- Menguasai **hoisting** dan konsep strict dependency
- Menerapkan **versioning strategies** (independent vs fixed)
- Menggunakan **Changesets** untuk versioning dan changelog
- Menggunakan **Semantic Release** untuk automasi rilis

---

## 1. Setup PNPM Workspace

pnpm adalah package manager yang lebih cepat dan hemat disk. Fitur workspace-nya built-in tanpa perlu tools tambahan.

### Inisialisasi

```bash
mkdir project-saya
cd project-saya
pnpm init
```

### `pnpm-workspace.yaml`

Beda dengan npm/yarn yang pakai field `"workspaces"` di `package.json`, pnpm pakai file terpisah:

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
  - "libs/*"
```

Setiap glob pattern mendefinisikan folder mana yang merupakan workspace package.

### Root `package.json`

```json
{
  "private": true,
  "name": "project-saya",
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build"
  }
}
```

```bash
pnpm install
```

Perintah ini akan install semua dependensi dari semua workspace sekali jalan.

### Perintah Awal Setup

```bash
# Install pnpm global
npm i -g pnpm

# Init project
pnpm init

# Setup workspaces
echo 'packages:
  - "apps/*"
  - "packages/*"' > pnpm-workspace.yaml

# Buat struktur folder
mkdir -p apps/web apps/api packages/shared packages/tsconfig

# Init package.json tiap workspace
cd packages/shared && pnpm init && cd ../..
cd apps/web && pnpm init && cd ../..
cd apps/api && pnpm init && cd ../..
```

---

## 2. Dependency Management Antar Package

### Setiap workspace punya `package.json` sendiri

```json
// packages/shared/package.json
{
  "name": "@myapp/shared",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc"
  }
}
```

```json
// apps/web/package.json
{
  "name": "@myapp/web",
  "version": "1.0.0",
  "dependencies": {
    "@myapp/shared": "*",
    "react": "^18.0.0"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build"
  }
}
```

`"*"` artinya pakai versi berapa pun yang ada di lokal workspace — pnpm langsung symlink ke `packages/shared`.

### Versi Spesifik Antar Workspace

```json
// Pake range versi — biar lebih eksplisit
{
  "dependencies": {
    "@myapp/shared": "workspace:*",     // versi lokal mana pun
    "@myapp/shared": "workspace:^1.0.0" // versi spesifik
  }
}
```

Di publish, `workspace:` protocol otomatis diganti sama versi real.

### Menambah dependensi antar workspace

```bash
# apps/web bergantung pada packages/shared
pnpm --filter @myapp/web add @myapp/shared

# Atau langsung edit package.json, lalu `pnpm install`
```

### Perintah filter pnpm

```bash
pnpm --filter @myapp/shared build   # build shared saja
pnpm --filter @myapp/web dev        # dev web saja
pnpm --filter "apps/*" build        # build semua apps
pnpm --filter "@myapp/*" test       # test semua package @myapp
```

### Filter dengan Git

```bash
# Hanya workspace yang berubah sejak HEAD~1
pnpm --filter=[HEAD~1] build

# Hanya workspace yang depend on @myapp/shared
pnpm --filter "@myapp/shared..." build

# Kombinasi
pnpm --filter "@myapp/web..." --filter "@myapp/api..." build
```

---

## 3. node_modules: PNPM vs NPM

### NPM — node_modules rapatan

```
node_modules/          # semua package, tercampur
├── react/
├── next/
├── typescript/
├── @myapp/
│   ├── shared/        # symlink ke packages/shared
│   └── web/           # symlink ke apps/web
└── ...
```

NPM hoist semua dependensi ke root. Masalah: bisa akses package yang bukan dependensi langsung (phantom dependency).

### PNPM — node_modules strict

```
node_modules/
├── .pnpm/             # store semua package
├── react/             # symlink ke .pnpm
└── @myapp/
    ├── shared/ -> ../../packages/shared
    └── web/ -> ../../apps/web

apps/web/node_modules/
├── react/             # hanya react, strict
└── @myapp/shared/     # symlink ke packages/shared
```

pnpm pakai **content-addressable storage**. Semua file disimpan di `.pnpm/store`, lalu symlink ke tempat masing-masing. Ini:

- **Hemat disk** — package yang sama tidak di-download ulang
- **Strict** — hanya dependensi yang terdaftar di `package.json` yang bisa di-import
- **Cepat** — install paralel

### Benchmark pnpm vs npm vs yarn

| Operasi | NPM | Yarn | PNPM |
|---------|-----|------|------|
| Clean install (100 packages) | 30s | 25s | 12s |
| Update lock file | 8s | 6s | 3s |
| Disk usage (100 packages) | 250MB | 240MB | 150MB |

---

## 4. Versioning Strategies

### Fixed versioning

Semua package pakai versi yang sama. Cocok untuk aplikasi yang dirilis bersama.

```
@myapp/shared@1.2.0
@myapp/web@1.2.0
@myapp/api@1.2.0
```

Setiap rilis, semua package naik versi bareng. Sederhana, tapi kurang fleksibel.

### Independent versioning

Tiap package punya versi sendiri.

```
@myapp/shared@1.0.5
@myapp/web@2.1.0
@myapp/api@1.3.2
```

Cocok jika package punya siklus rilis berbeda. Lebih fleksibel tapi butuh disiplin tracking.

### Kapan Pake Mana?

| Approach | Cocok | Contoh |
|----------|-------|--------|
| Fixed | Aplikasi yang dirilis barengan | Mobile app + API + shared |
| Independent | Library yang dipake external | UI components, utilities |

---

## 5. Changesets

Changesets adalah tool untuk versioning dan changelog. Cocok dengan pnpm workspace.

### Setup

```bash
pnpm add -Dw @changesets/cli
pnpm changeset init
```

### Membuat changeset

```bash
pnpm changeset
```

Ini akan memandu kamu lewat CLI: pilih package mana yang berubah, tipe perubahan (major/minor/patch), dan tulis deskripsi.

### File changeset

File markdown akan tergenerate di `.changeset/`:

```md
---
'@myapp/shared': minor
'@myapp/web': patch
---

Add pagination helper to shared utils
```

### Release

```bash
pnpm changeset version   # update versi + changelog
pnpm changeset publish   # publish ke npm
```

### Changelog otomatis

Changesets generate `CHANGELOG.md` per package:

```md
# @myapp/shared

## 1.1.0

### Minor Changes

- Add pagination helper to shared utils

### Patch Changes

- Fix email validation regex
```

### Semantic Versioning dengan Changesets

```
Major — breaking changes (1.x.x → 2.0.0)
Minor — fitur baru, backward compatible (1.1.x → 1.2.0)
Patch — bug fix, backward compatible (1.1.0 → 1.1.1)
```

---

## 6. Semantic Release

Alternatif dari Changesets — fully automated publishing.

### Setup semantic-release

```bash
pnpm add -Dw semantic-release @semantic-release/git @semantic-release/changelog
```

### Konfigurasi

```json
// .releaserc.json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/github",
    "@semantic-release/npm",
    "@semantic-release/git"
  ]
}
```

### Commit Convention

Semantic-release pake conventional commits:

```
feat: Add pagination helper          → minor release
fix: Fix email validation regex      → patch release
feat!: Change API response format    → major release
fix(api)!: Drop v1 endpoints         → major release
```

### Multi-package Semantic Release

```bash
# Multi-semantic-release untuk monorepo
pnpm add -Dw multi-semantic-release

# Di CI
npx multi-semantic-release --deps.bump=satisfy
```

---

## 7. PNPM Commands Penting

| Perintah | Fungsi |
|----------|--------|
| `pnpm install` | Install semua dep semua workspace |
| `pnpm add -Dw <pkg>` | Tambah dev dependency ke root |
| `pnpm --filter <workspace> add <pkg>` | Tambah dependency ke workspace tertentu |
| `pnpm --filter <workspace> <script>` | Jalankan script di workspace tertentu |
| `pnpm changeset` | Buat changeset baru |
| `pnpm changeset version` | Update versi + changelog |
| `pnpm changeset publish` | Publish ke npm |
| `pnpm ls --depth Infinity` | Lihat dependency tree |
| `pnpm update --latest` | Update semua dependency ke latest |
| `pnpm rebuild` | Rebuild native modules |

### PNPM Runtime

```bash
# Jalanin script di semua workspace
pnpm -r build

# Jalanin script paralel
pnpm --parallel -r build

# Exclude root
pnpm -r --filter "!root" build

# Lihat dependensi workspace
pnpm ls -r --depth 1
```

---

## 8. Overrides & Resolutions

Kadang perlu paksa versi dependency tertentu.

```json
// package.json (root)
{
  "pnpm": {
    "overrides": {
      "react": "^18.2.0",
      "@types/react": "^18.2.0"
    }
  }
}
```

Ini memaksa semua workspace pake versi yang ditentukan — menghindari konflik dependency.

---

## ✍️ Latihan

1. Setup pnpm workspace dengan 3 package: `apps/web`, `apps/api`, `packages/shared`

2. Buat dependency: `web` dan `api` bergantung pada `shared`

3. Jalankan `pnpm install` dan lihat struktur `node_modules` — bedakan dengan npm

4. Buat changeset untuk perubahan minor di `shared` dan patch di `web`

5. Generate changelog dengan `pnpm changeset version`

6. Setup semantic-release dengan conventional commit. Buat commit `feat: add user endpoint` dan `fix: fix validation` — lihat hasil release

7. Praktikkan `pnpm overrides` untuk memaksa versi React di semua workspace

8. Buat shared package yang dipublish ke npm dengan `pnpm changeset publish` (ganti nama dummy)

---

## 📚 Referensi

- [pnpm Workspace Docs](https://pnpm.io/workspaces)
- [Changesets GitHub](https://github.com/changesets/changesets)
- [pnpm Filtering](https://pnpm.io/filtering)
- [Semantic Release](https://semantic-release.gitbook.io/semantic-release)
- [Conventional Commits](https://www.conventionalcommits.org/)
