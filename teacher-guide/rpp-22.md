# RPP Modul 22: Monorepo

**Durasi:** 2 sesi × 90 menit = 180 menit

## Tujuan Pembelajaran

Setelah modul ini, siswa mampu:
- Menjelaskan keuntungan monorepo (shared types, 1 CI/CD, refactor mudah)
- Setup NPM Workspaces + Turborepo
- Mengelola shared packages (types, utils, config)
- Optimasi build dengan caching paralel

## Tools & Bahan

- Node.js, npm workspaces
- Turborepo
- Project: FE (React) + BE (Express) + shared package
- GitHub Actions

---

## Sesi 1: NPM Workspaces + Struktur Monorepo (90 menit)

| Waktu | Aktivitas | Detail |
|-------|-----------|--------|
| 15 menit | **Teori: Monorepo Concepts** | Monorepo vs polyrepo. Keuntungan: shared types, 1 CI/CD, refactor mudah. Struktur: apps/ + packages/. NPM Workspaces hoisting. |
| 45 menit | **Coding: Setup NPM Workspaces** | Scaffold monorepo: root package.json + `"workspaces": ["apps/*", "packages/*"]`. Bikin apps/web (React) + apps/api (Express) + packages/shared (types). |
| 20 menit | **Latihan: Shared Types** | Siswa define shared types di packages/shared. Import di apps/web dan apps/api. Test type consistency. |
| 10 menit | **Review** | Kenapa hoisting hemat disk? Kapan perlu version lock per package? |

**Code demo:**

```json
// root package.json
{
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build"
  }
}
```

```text
monorepo/
├── apps/
│   ├── web/        # React / Next.js
│   └── api/        # Express
├── packages/
│   ├── shared/     # types, utils
│   └── eslint-config/
├── package.json
└── .gitignore
```

```typescript
// packages/shared/src/types.ts
export interface User {
  id: string;
  name: string;
  email: string;
}

// apps/api uses same type
import { User } from '@myapp/shared';
```

**Checklist siswa:**
- [ ] Root package.json dengan workspaces
- [ ] apps/web + apps/api berfungsi
- [ ] packages/shared dengan types
- [ ] Import shared types di kedua apps

---

## Sesi 2: Turborepo + Caching + CI/CD (90 menit)

| Waktu | Aktivitas | Detail |
|-------|-----------|--------|
| 15 menit | **Teori: Turborepo** | Pipeline, caching, paralelisasi. turbo.json: dependsOn, outputs, cache strategy. Filter build (`--filter`). |
| 45 menit | **Coding: Turbo Setup + CI** | Install turbo. Setup turbo.json pipeline. Test build cache (build 2x, lihat cache hit). Setup GitHub Actions: hanya build yang berubah. |
| 20 menit | **Latihan: Monorepo CI/CD** | Siswa setup GitHub Actions: lint → test → build. Cache turbo folder. Filter hanya app yang berubah. |
| 10 menit | **Review** | Kenapa `.turbo/` jangan di-commit? Bagaimana cache works? Kapan `--filter` berguna? |

**Code demo:**

```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {},
    "dev": { "cache": false, "persistent": true }
  }
}
```

```bash
turbo build                    # build semua, cache otomatis
turbo build --filter=apps/web  # build web saja
turbo lint                     # lint semua
```

```yaml
# .github/workflows/ci.yml
jobs:
  build:
    steps:
      - uses: actions/checkout@v4
      - uses: actions/cache@v3
        with:
          path: .turbo
          key: turbo-${{ github.sha }}
      - run: npm ci
      - run: turbo build --filter=[main]
```

**Checklist siswa:**
- [ ] turbo.json pipeline
- [ ] Build cache (2nd build faster)
- [ ] --filter untuk partial build
- [ ] GitHub Actions CI
- [ ] Turbo cache di CI

## Assessment

| Kriteria | Bobot |
|----------|-------|
| NPM Workspaces + struktur | 30% |
| Shared types & packages | 25% |
| Turborepo + caching + CI | 30% |
| Partisipasi | 15% |
