# 04 — Monorepo CI: Pipeline, Publishing & Migration

## 🎯 Tujuan

Setelah sesi ini, kamu mampu:

- Setup **GitHub Actions CI** untuk monorepo
- Mengoptimalkan pipeline dengan **filtering by changes**
- Menerbitkan package dengan **semantic-release + changesets**
- Memvisualisasikan **dependency graph** monorepo
- Menggunakan **code generation** (plop/hygen) untuk scaffolding
- Merencanakan **migrasi dari polyrepo ke monorepo**

---

## 1. GitHub Actions untuk Monorepo

Strategi CI monorepo: **hanya build yang berubah**. Ini gak bisa pakai CI biasa yang trigger full build tiap commit. Butuh tool yang detect diff.

### Basic CI — build semua

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx turbo lint

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx turbo build
```

### Smart CI — hanya build yang berubah dalam PR

```yaml
name: PR Check

on: pull_request

jobs:
  changes:
    runs-on: ubuntu-latest
    outputs:
      shared: ${{ steps.filter.outputs.shared }}
      api: ${{ steps.filter.outputs.api }}
      web: ${{ steps.filter.outputs.web }}
    steps:
      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            shared:
              - 'packages/shared/**'
            api:
              - 'apps/api/**'
              - 'packages/shared/**'
            web:
              - 'apps/web/**'
              - 'packages/shared/**'

  build-api:
    needs: changes
    if: ${{ needs.changes.outputs.api == 'true' }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx turbo build --filter=@myapp/api
```

Pipeline ini hanya trigger `build-api` jika file di `apps/api/` atau `packages/shared/` berubah.

### Turbo filter dengan git diff

Untuk hanya build API jika file di `apps/api/` dan `packages/shared/` berubah:

```bash
turbo build --filter=$(git diff --name-only HEAD~1 | xargs -I{} dirname {} | sort -u | tr '\n' ',')
```

---

## 2. Pipeline Optimization

### Tips CI Monorepo

1. **Cache `node_modules`** — pakai `actions/cache`. Semua workspace share dep yang sama.
2. **Cache `.turbo`** — simpan cache Turborepo antar run biar build kilat.
3. **Parallel jobs** — lint, type-check, test, build bisa jalan bareng.
4. **Gunakan Turbo Filter** — `--filter=...` untuk target workspace spesifik.

### Contoh caching dengan actions/cache

```yaml
- name: Cache node_modules
  uses: actions/cache@v4
  with:
    path: node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('pnpm-lock.yaml') }}

- name: Cache Turbo
  uses: actions/cache@v4
  with:
    path: .turbo
    key: ${{ runner.os }}-turbo-${{ github.sha }}
    restore-keys: |
      ${{ runner.os }}-turbo-
```

---

## 3. Publishing Packages

### Semantic-release + Changesets

Changesets adalah standar industri untuk monorepo versioning.

```bash
pnpm add -Dw @changesets/cli
pnpm changeset init
```

Buat changeset setiap ada perubahan:

```bash
pnpm changeset
# pilih package, tipe perubahan, tulis deskripsi
```

Release pipeline:

```yaml
name: Release

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx changeset version
      - run: npx changeset publish
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
      - run: |
          git add .
          git commit -m "chore: release new versions"
          git push
```

### File changeset

```md
---
'@myapp/shared': minor
'@myapp/web': patch
---

Add pagination helper to shared utils
```

---

## 4. Dependency Graph Visualization

Memahami dependency graph penting untuk optimasi CI dan refactor.

### Turborepo

```bash
npx turbo build --dry-run
# atau
npx turbo build --graph
```

### Nx

```bash
npx nx graph
```

Ini membuka web UI interaktif yang menampilkan semua workspace dan dependensinya.

### Manual — `depcruise`

```bash
pnpm add -Dw dependency-cruiser
npx depcruise --include-only "^src" --output-type dot src | dot -T svg > graph.svg
```

---

## 5. Code Generation (Scaffolding)

### Plop

Plop adalah micro-generator. Cocok untuk generate component, page, API route secara konsisten.

```bash
pnpm add -Dw plop
```

```js
// plopfile.js
module.exports = function (plop) {
  plop.setGenerator('component', {
    description: 'Buat component React baru',
    prompts: [
      { type: 'input', name: 'name', message: 'Nama component:' },
      { type: 'input', name: 'workspace', message: 'Workspace target:' }
    ],
    actions: [
      {
        type: 'add',
        path: '{{workspace}}/src/components/{{pascalCase name}}/index.tsx',
        templateFile: 'templates/component.hbs'
      }
    ]
  });
};
```

```bash
npx plop component
```

### Hygen

Alternatif plop dengan template lebih rapi.

```bash
pnpm add -Dw hygen
npx hygen component new Button --workspace apps/web
```

---

## 6. Migrasi dari Polyrepo ke Monorepo

### Langkah-langkah

| Langkah | Aksi |
|---------|------|
| 1 | Buat repo baru untuk monorepo |
| 2 | Clone semua repo lama ke folder `apps/` atau `packages/` |
| 3 | Pertahankan git history dengan `git subtree` atau `git filter-repo` |
| 4 | Setup root `package.json` + workspace config |
| 5 | Identifikasi shared code → pindahkan ke `packages/` |
| 6 | Setup Turborepo/Nx untuk pipeline |
| 7 | Update CI jadi single pipeline |
| 8 | Update import path di semua code |
| 9 | Test build dari root |
| 10 | Hapus repo lama (arsipkan) |

### Preserve git history

```bash
# Pindahkan repo ke subfolder sambil bawa history
git filter-repo --to-subdirectory-filter apps/api
git filter-repo --to-subdirectory-filter packages/shared
```

### Hal yang perlu diperhatikan

- **Jangan pindahkan semua sekaligus** — lakukan bertahap per project
- **CI harus ready sebelum migrasi** — jangan sampai build broken
- **Komunikasikan ke tim** — workflow berubah, branching strategy berubah
- **Test coverage** — pastikan test tetap jalan setelah migrasi

---

## ✍️ Latihan

1. Setup GitHub Actions workflow untuk monorepo dengan job lint + build
2. Tambahkan path filter agar build API hanya jalan jika `apps/api/` berubah
3. Setup Changesets dan buat 1 file changeset untuk perubahan minor
4. Generate dependency graph dengan `npx turbo build --graph`
5. Buat plop generator untuk component React
6. Rencanakan migrasi: tulis 3 langkah konkret memindahkan polyrepo ke monorepo

---

## 📚 Referensi

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [dorny/paths-filter](https://github.com/dorny/paths-filter)
- [Changesets](https://github.com/changesets/changesets)
- [Plop.js](https://plopjs.com/)
- [Hygen](https://www.hygen.io/)
