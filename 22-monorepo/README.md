# 22 — Monorepo: Satu Repo Banyak Project

> **Level:** Intermediate  
> **Durasi:** 4 sesi (@ 30-45 menit)  
> **Prerequisites:** Dasar JavaScript/TypeScript, Git, CLI (npm/pnpm)  
> **Output:** Monorepo backend + frontend dengan shared types, CI pipeline, dan automated release

---

## 📖 Pengantar

Pernah kerja project web + API di repo terpisah? Repot. Tipe data beda, CI beda, refactor harus buka 2 repo. Monorepo jawabannya: **semua kode di satu repository**, tetap terisolasi per project.

Monorepo ≠ monolith. Kamu tetap punya banyak aplikasi kecil, tapi semua tinggal serumah. Digunakan oleh Google, Meta, Uber, dan tim produksi modern.

---

## 🎯 Tujuan Pembelajaran

Setelah menyelesaikan modul ini, kamu mampu:

1. **Membedakan** monorepo vs polyrepo dan memilih yang tepat sesuai kebutuhan project
2. **Merancang** struktur folder monorepo standar (`apps/`, `packages/`, `libs/`)
3. **Setup pnpm workspace** dengan dependency management antar package
4. **Mengelola versioning** dan changelog otomatis menggunakan Changesets
5. **Mengkonfigurasi Turborepo/Nx** untuk pipeline, caching, dan task orchestration
6. **Membangun CI pipeline** di GitHub Actions yang hanya build package yang berubah
7. **Menerbitkan package** ke npm secara otomatis dengan semantic-release
8. **Melakukan migrasi** dari polyrepo ke monorepo dengan preserve git history

---

## 📋 Sesi Pembelajaran

| Sesi | Topik | Durasi | Deskripsi |
|------|-------|--------|-----------|
| [01](01-monorepo-basics.md) | Monorepo Basics | 30 menit | Konsep monorepo vs polyrepo, pro/kontra, struktur folder, tools (Nx, Turborepo, Rush, pnpm), npm/yarn/pnpm workspaces |
| [02](02-pnpm-workspaces.md) | PNPM Workspaces | 35 menit | Setup pnpm workspace, `pnpm-workspace.yaml`, dependency management, hoisting, node_modules structure, versioning strategies, changesets |
| [03](03-nx-turborepo.md) | Nx & Turborepo | 45 menit | Pipeline & caching, task orchestration (`dependsOn`), parallel execution, affected commands, remote cache, caching strategies |
| [04](04-monorepo-ci.md) | Monorepo CI | 35 menit | GitHub Actions, pipeline optimization (filter by changes), semantic-release + changesets, dependency graph, code generation (plop/hygen), migration polyrepo→monorepo |

---

## 🔍 Ringkasan

### Kenapa Monorepo?

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

**Satu sumber kebenaran.** Plus:

- ✅ **Satu CI/CD** — Configure sekali, semua project kena
- ✅ **Refactor lebih mudah** — Ganti nama field sekali di root, atomic commit
- ✅ **Dependency management terpusat** — Versi TypeScript, ESLint cukup di root

### Struktur Folder Standar

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

### Shared Packages — Contoh Nyata

`packages/shared` — tempat tipe data dan utility functions:

```ts
// packages/shared/src/types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

export interface CreateUserDto {
  name: string;
  email: string;
  role?: 'admin' | 'user';
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}
```

```ts
// packages/shared/src/utils/validation.ts
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
```

Import pattern setelah setup `tsconfig.json`:

```json
// apps/web/tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@myapp/shared": ["../../packages/shared/src"],
      "@myapp/shared/*": ["../../packages/shared/src/*"]
    }
  }
}
```

```ts
// apps/web/src/pages/profile.tsx
import { User, ApiResponse, isValidEmail } from '@myapp/shared';

// apps/api/src/routes/user.ts
import { User, CreateUserDto } from '@myapp/shared';
```

### `packages/eslint-config`

Config ESLint bersama. Semua project pakai aturan yang konsisten.

```js
// packages/eslint-config/index.js
module.exports = {
  extends: ['next', 'next/core-web-vitals'],
  rules: {
    'no-console': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};
```

```json
// apps/web/package.json — cara pakai
{
  "eslintConfig": {
    "extends": ["@myapp/eslint-config"]
  },
  "devDependencies": {
    "@myapp/eslint-config": "*",
    "eslint": "^8.0.0"
  }
}
```

### Git Strategy

```
main          → production-ready
├── develop   → integration branch
├── feat/user-crud    → fitur baru
├── fix/login-bug    → perbaikan bug
└── chore/update-deps  → maintenance
```

Commit atomic — satu commit satu perubahan, walaupun menyentuh banyak workspace:

```
feat(shared): add User interface with role field
feat(api): implement user CRUD endpoints
feat(web): build user profile page
```

### Gitignore

```gitignore
node_modules/
dist/
.next/
.turbo/
*.log
.env
.env.local
```

Folder `.turbo/` berisi cache Turborepo — jangan commit.

### Ringkasan Perintah Penting

| Perintah | Fungsi |
|----------|--------|
| `npm install` / `pnpm install` | Install semua dep semua workspace |
| `npm run dev` / `pnpm dev` | Jalankan dev server semua apps |
| `turbo build` | Build semua, cache otomatis |
| `turbo build --filter=apps/web` | Build web saja |
| `turbo lint` | Lint semua workspace |
| `npx create-turbo@latest` | Scaffold monorepo baru |
| `pnpm changeset` | Buat changeset baru |
| `pnpm changeset version` | Update versi + changelog |

---

## 🧠 Kesimpulan

Monorepo dengan pnpm workspaces + Turborepo memberikan:

- **Shared types** — satu definisi, dipakai FE & BE. Zero duplikasi.
- **Satu CI** — konfigurasi sekali, jalan untuk semua.
- **Refactor cepat** — ganti nama field di shared, semua project kena. Satu commit.
- **Build cepat** — Turborepo cache & skip yang gak berubah.
- **Struktur rapi** — `apps/` untuk eksekusi, `packages/` untuk pustaka.

Cocok untuk project SMK RPL: frontend web + backend API + shared types dalam satu repo. Tim kecil bisa gercep tanpa khawatir breaking change di repo lain. Mulai dengan `npx create-turbo@latest` dan lihat sendiri bedanya.

---

## 👣 Langkah Selanjutnya

1. Mulai dari [01 — Monorepo Basics](01-monorepo-basics.md)
2. Lanjut ke [02 — PNPM Workspaces](02-pnpm-workspaces.md)
3. Atur pipeline dengan [03 — Nx & Turborepo](03-nx-turborepo.md)
4. Siapkan CI dengan [04 — Monorepo CI](04-monorepo-ci.md)

> **Next module:** Deploy Docker + Docker Compose untuk monorepo setup.
