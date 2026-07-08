# 01 — Monorepo Basics: Konsep, Struktur & Workspace

## 🎯 Tujuan

Setelah sesi ini, kamu mampu:

- Menjelaskan perbedaan **monorepo vs polyrepo** serta kapan pakai masing-masing
- Memahami **pro dan kontra** monorepo untuk tim pengembangan
- Mengenal tools monorepo populer: **Nx, Turborepo, Rush, pnpm workspaces**
- Merancang **struktur folder** standar (`apps/`, `packages/`, `libs/`)
- Setup **npm/yarn/pnpm workspaces** dari nol

---

## 1. Monorepo vs Polyrepo

**Polyrepo** (multi-repo): tiap project punya repo Git sendiri.

```
github.com/
├── myapp-web/        # repo sendiri
├── myapp-api/        # repo sendiri
└── myapp-shared/     # repo sendiri
```

**Monorepo**: semua project dalam satu repository.

```
github.com/
└── myapp/            # satu repo, banyak project
    ├── apps/web/
    ├── apps/api/
    └── packages/shared/
```

| Aspek | Polyrepo | Monorepo |
|-------|----------|----------|
| Isolasi | Tinggi — tiap repo punya CI sendiri | Rendah — satu CI untuk semua |
| Refactor | Sulit — harus buka banyak repo | Mudah — atomic commit lintas project |
| Duplikasi kode | Sering terjadi | Minimal — shared package |
| Setup proyek baru | Clone repo + setup dari nol | Tinggal tambah folder |
| Skala tim | Lebih cocok tim besar terpisah | Cocok tim kecil-menengah |

> **Monorepo ≠ monolith.** Kamu tetap punya banyak aplikasi kecil, tapi semua tinggal serumah. Digunakan oleh Google, Meta, Uber, dan tim produksi modern.

### Sejarah Monorepo

Monorepo mulai populer setelah Google dan Facebook mempublikasikan pengalaman mereka. Google punya satu repository raksasa dengan 2+ miliar baris kode. Facebook pake monorepo untuk React, React Native, Jest, Flow, dan semua tool internal.

Tooling monorepo modern (Turborepo, Nx, pnpm) lahir karena kebutuhan industri — tim ingin shared code tanpa ribet publish ke npm tiap kali perubahan kecil.

---

## 2. Kenapa Monorepo?

### ✅ Shared types (tidak perlu duplikasi)

Tanpa monorepo — dua repo, dua definisi `User`:

```ts
// apps/web/types.ts
interface User { id: string; name: string; email: string; }

// apps/api/types.ts
interface User { id: string; name: string; email: string; }
```

Satu ubah field, yang lain lupa — bug runtime. Dengan monorepo:

```ts
// packages/shared/src/types.ts
export interface User {
  id: string;
  name: string;
  email: string;
}

// apps/web/ & apps/api/ — import dari satu tempat
import { User } from '@project/shared';
```

Satu sumber kebenaran.

### ✅ Satu CI/CD

Configure sekali — semua project kena. Build, lint, test otomatis. Tidak perlu setup CI 3x terpisah.

### ✅ Refactor lebih mudah

Ganti nama field `email` jadi `emailAddress`? Cari & ganti sekali di root. Git blame satu repo. Perubahan bisa atomic commit.

```bash
# Polyrepo: 3 PR, 3 review, 3 deploy
# Monorepo: 1 PR, 1 review, 1 deploy
```

### ✅ Dependency management terpusat

Versi TypeScript, ESLint, Prettier — cukup di root `package.json`. Semua project pakai sama. Zero konflik.

### ✅ Atomic Deployment

Kalo backend dan frontend perlu perubahan barengan (misal rename API field), polyrepo butuh deploy backend dulu baru frontend. Di monorepo, deploy barengan — gak ada window of inconsistency.

---

## 3. Monorepo Tools

### Turborepo

Build orchestrator dari Vercel. Cache otomatis, paralelisasi, filter per workspace. Paling populer untuk ekosistem JavaScript/TypeScript.

```bash
npm install -D turbo
```

### Nx

Tool dari Nrwl. Lebih dari build orchestrator — punya code generation, dependency graph visual, dan integrasi framework.

```bash
npx create-nx-workspace@latest myapp
```

### Rush

Dari Microsoft. Fokus pada monorepo skala besar dengan dependency management ketat. Pakai PNPM sebagai package manager.

### pnpm workspaces

Built-in pnpm. Struktur `node_modules` strict (tidak hoisting sembarangan). Hemat disk space.

### Lerna (Legacy)

Lerna dulu pioneer monorepo tool. Sejak 2023, Lerna di-maintain oleh Nx team dan integrasi dengan Nx. Kalo project baru, langsung pake Turborepo atau Nx.

| Tool | Kelebihan | Cocok untuk |
|------|-----------|-------------|
| Turborepo | Setup cepat, cache hebat | Tim kecil-menengah |
| Nx | Code gen, dependency graph, plugin | Tim besar, banyak project |
| Rush | Strict dep management, skala besar | Enterprise |
| pnpm ws | Ringan, tanpa tool tambahan | Project kecil-sedang |

---

## 4. Struktur Folder Monorepo

Struktur standar yang dipakai industri:

```
monorepo-app/
├── apps/
│   ├── web/              # Frontend (Next.js, React, dll)
│   │   ├── package.json
│   │   └── src/
│   └── api/              # Backend (Express, Hono, NestJS)
│       ├── package.json
│       └── src/
├── packages/
│   ├── shared/           # Types, utils, interfaces
│   │   ├── package.json
│   │   └── src/
│   ├── eslint-config/    # Konfigurasi ESLint bersama
│   │   ├── package.json
│   │   └── index.js
│   └── tsconfig/         # Base tsconfig bersama
│       ├── package.json
│       └── base.json
├── package.json          # Root workspace
├── turbo.json            # Turborepo config
├── .github/
│   └── workflows/
│       └── ci.yml        # GitHub Actions
└── .gitignore
```

- `apps/` — aplikasi yang bisa dijalankan (web, API, mobile)
- `packages/` — pustaka internal yang dipakai oleh apps
- Root `package.json` — deklarasi workspace saja
- `turbo.json` — pipeline & caching

Beberapa project juga punya `libs/` untuk kode utilitas internal atau `tools/` untuk script CI dan code generation.

### Contoh Struktur Shared Config Package

```json
// packages/tsconfig/package.json
{
  "name": "@myapp/tsconfig",
  "version": "0.0.0",
  "private": true,
  "files": ["base.json", "nextjs.json", "node.json"]
}
```

```json
// packages/tsconfig/base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

```json
// packages/tsconfig/nextjs.json
{
  "extends": "@myapp/tsconfig/base.json",
  "compilerOptions": {
    "jsx": "preserve",
    "plugins": [{ "name": "next" }]
  }
}
```

---

## 5. NPM / Yarn / PNPM Workspaces

NPM Workspaces adalah fitur bawaan npm/yarn/pnpm. Membolehkan instalasi dependensi sekali untuk semua package.

### Setup workspace — `package.json` root

```json
{
  "private": true,
  "name": "monorepo-app",
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint"
  }
}
```

- `"workspaces"` — array glob pattern. `apps/*` artinya semua folder di dalam `apps/` adalah workspace.
- `"private": true` — root tidak boleh dipublish ke npm.
- Script root cukup panggil Turborepo, nanti Turborepo urus eksekusi per workspace.

### Yarn workspaces

```json
{
  "private": true,
  "workspaces": ["apps/*", "packages/*"]
}
```

### PNPM workspaces

Beda: pakai `pnpm-workspace.yaml` (bukan `package.json`).

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### Hoisting

NPM akan "menaikkan" (hoist) dependensi bersama ke `node_modules` root. Dependensi yang sama (React, TypeScript) cukup sekali download. Ini hemat disk space dan bikin install lebih cepat.

### Phantom Dependencies Problem

```typescript
// ❌ Masalah hoisting — bisa akses package yang bukan dependency
// apps/web bisa import express langsung, padahal cuma di apps/api
import express from 'express'; // Bisa jalan — tapi salah!

// ✅ Di pnpm, ini error — strict node_modules
// Hanya dependency yang terdaftar di package.json yang bisa diakses
```

pnpm solves phantom dependencies dengan struktur `node_modules` strict.

---

## 6. Shared Config Packages — Pattern Penting

### ESLint Config Package

```js
// packages/eslint-config/index.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
};
```

```json
// packages/eslint-config/package.json
{
  "name": "@myapp/eslint-config",
  "version": "0.0.0",
  "private": true,
  "main": "index.js",
  "peerDependencies": {
    "eslint": "^8.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0"
  }
}
```

```json
// apps/web/.eslintrc.json
{
  "extends": ["@myapp/eslint-config"]
}
```

### TypeScript Config Inheritance

```json
// packages/tsconfig/base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true
  }
}

// apps/web/tsconfig.json
{
  "extends": "@myapp/tsconfig/base.json",
  "compilerOptions": {
    "jsx": "preserve",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

---

## 7. Pro & Kontra Monorepo — Decision Matrix

### Kapan Pake Monorepo

| Situasi | Putusan |
|---------|---------|
| Tim kecil (1-10 dev) dengan 2-5 project | ✅ Monorepo |
| Banyak shared code antara project | ✅ Monorepo |
| Sering refactor lintas project | ✅ Monorepo |
| CI setup terbatas | ✅ Monorepo (1 config) |
| Tim besar terpisah (20+ dev) | ⚠️ Bisa monorepo, butuh tool matang |
| Project benar-benar independent | ❌ Lebih baik polyrepo |
| Client punya repo terpisah | ❌ Keep polyrepo |

### Tantangan Monorepo

1. **Ukuran repo** — clone pertama lama. Solusi: sparse checkout, shallow clone.
2. **CI bottleneck** — semua project di satu pipeline. Solusi: affected commands, path filter.
3. **Security isolation** — satu package compromised = semua kena. Solusi: npm audit, Dependabot.
4. **Tooling** — butuh Nx/Turborepo untuk scale. Jangan pake workspaces doang buat project besar.

---

## ✍️ Latihan

1. Buat struktur folder monorepo dengan `apps/web`, `apps/api`, `packages/shared`, dan `packages/eslint-config`

2. Setup root `package.json` dengan `workspaces` dan `private: true`

3. Bedakan: kapan pakai Turborepo vs pnpm workspaces saja? Tulis 2 skenario

4. Pindahkan kode duplikat `interface User` dari 2 file terpisah ke `packages/shared`

5. Buat shared config package `@myapp/tsconfig` dengan base config yang diextends oleh apps/web dan apps/api

6. Buat shared ESLint config package dengan rules standard. Setup di apps/web dan apps/api

7. Analisis phantom dependencies: bikin apps/web yang import 'lodash' tanpa declare di package.json. Catat behavior di npm vs pnpm

---

## 📚 Referensi

- [Turborepo Docs](https://turbo.build/repo/docs)
- [Nx Documentation](https://nx.dev/getting-started/intro)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Yarn Workspaces](https://classic.yarnpkg.com/lang/en/docs/workspaces/)
- [Monorepo Patterns at Google](https://cacm.acm.org/magazines/2016/7/204032-why-google-stores-billions-of-lines-of-code-in-a-single-repository/fulltext)
