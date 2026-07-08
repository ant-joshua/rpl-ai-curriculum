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

### ✅ Dependency management terpusat

Versi TypeScript, ESLint, Prettier — cukup di root `package.json`. Semua project pakai sama. Zero konflik.

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
│   └── eslint-config/    # Konfigurasi ESLint bersama
│       ├── package.json
│       └── index.js
├── package.json          # Root workspace
├── turbo.json            # Turborepo config
└── .gitignore
```

- `apps/` — aplikasi yang bisa dijalankan (web, API, mobile)
- `packages/` — pustaka internal yang dipakai oleh apps
- Root `package.json` — deklarasi workspace saja
- `turbo.json` — pipeline & caching

Beberapa project juga punya `libs/` untuk kode utilitas internal atau `tools/` untuk script CI dan code generation.

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

---

## ✍️ Latihan

1. Buat struktur folder monorepo dengan `apps/web`, `apps/api`, `packages/shared`, dan `packages/eslint-config`
2. Setup root `package.json` dengan `workspaces` dan `private: true`
3. Bedakan: kapan pakai Turborepo vs pnpm workspaces saja? Tulis 2 skenario
4. Pindahkan kode duplikat `interface User` dari 2 file terpisah ke `packages/shared`

---

## 📚 Referensi

- [Turborepo Docs](https://turbo.build/repo/docs)
- [Nx Documentation](https://nx.dev/getting-started/intro)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Yarn Workspaces](https://classic.yarnpkg.com/lang/en/docs/workspaces/)
