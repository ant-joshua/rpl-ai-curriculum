# 03 — Nx & Turborepo: Pipeline, Caching & Task Orchestration

## 🎯 Tujuan

Setelah sesi ini, kamu mampu:

- Setup **Turborepo** dalam project monorepo
- Mengkonfigurasi **pipeline** dengan `dependsOn`
- Memahami **task orchestration** dan eksekusi paralel
- Menggunakan **affected commands** (`--filter`) untuk build selektif
- Menguasai **computation caching** (lokal & remote cache)
- Menerapkan **caching strategies** optimal
- Mengenal **Nx** dengan dependency graph dan code generation

---

## 1. Turborepo: Build Orchestrator

Turborepo adalah build orchestrator dari Vercel. Dia urus urutan build, caching, dan paralelisasi.

Nx adalah alternatif dengan fitur lebih banyak: dependency graph visual, code generation, dan integrasi framework lebih dalam.

### Instalasi

```bash
npm install -D turbo
```

Atau scaffold project baru:

```bash
npx create-turbo@latest
```

### Konfigurasi — `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "test": {}
  }
}
```

| Key | Arti |
|-----|------|
| `"build"` | Nama task. Sama dengan script di `package.json` tiap workspace. |
| `"dependsOn": ["^build"]` | Build workspace dependency **sebelum** build workspace ini. `^` artinya dependency graph: `packages/shared` → `apps/web`. Turborepo build shared dulu, baru web. |
| `"outputs"` | File yang di-cache. Kalau isi source tidak berubah, Turborepo pakai cache — build jadi 1 detik. |
| `"cache": false` | `dev` tidak perlu di-cache karena persistent process. |
| `"persistent": true` | Task ini jalan terus (dev server). Jangan tunggu selesai. |

---

## 2. Task Orchestration & dependsOn

Turborepo membaca dependency graph dari `package.json` tiap workspace. Jika `apps/web` bergantung pada `packages/shared`, maka Turborepo akan:

1. Build `packages/shared` dulu
2. Baru build `apps/web`

### dependsOn options

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {},
    "typecheck": {
      "dependsOn": ["^build"]
    }
  }
}
```

- `"^build"` — tunggu task `build` dari **dependencies** selesai
- `"build"` (tanpa `^`) — tunggu task `build` di **workspace yang sama** selesai
- `[]` (kosong) — bisa jalan tanpa menunggu siapapun

### Dependency chain

```
         lint
        /    \
shared/build → web/build → web/test
        \         /
         typecheck
```

Turborepo otomatis menjalankan task paralel jika tidak ada dependensi blokir.

### Contoh Pipeline Production

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", ".expo/**"],
      "inputs": ["$TURBO_DEFAULT$", "src/**", "!src/**/*.test.ts"]
    },
    "test": {
      "dependsOn": ["build"],
      "inputs": ["src/**/*.test.ts", "src/**/*.spec.ts"],
      "outputs": []
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "clean": {
      "cache": false
    }
  }
}
```

---

## 3. Cara Kerja Caching

### Flow caching

1. Turborepo hash semua input (source code + env + config).
2. Hash sama dengan sebelumnya → skip build, restore output dari cache folder.
3. Hash berubah → build ulang workspace yang berubah saja.
4. Workspace yang tidak berubah tetap pakai cache.

Ini yang bikin CI monorepo secepat multi-repo, bahkan lebih cepat karena cache lokal.

### Menjalankan Turborepo

```bash
npm run dev        # jalanin semua dev server
turbo build        # build semua
turbo build --filter=apps/web    # build web saja
turbo build --filter=@myapp/api  # build api saja
```

### `--filter` — affected commands

Hanya build workspace yang berubah:

```bash
turbo build --filter=[HEAD^1]
turbo build --filter=[main...HEAD]
turbo build --filter=./apps/web
```

Filter bisa kombinasi:

```bash
turbo build --filter=@myapp/web... --filter=@myapp/api
```

### Filter Operators Detail

| Operator | Arti | Contoh |
|----------|------|--------|
| `--filter=./apps/web` | Workspace spesifik | `turbo build --filter=./apps/web` |
| `--filter=@myapp/web` | By package name | `turbo test --filter=@myapp/web` |
| `--filter=...[HEAD^1]` | Changed since commit | `turbo build --filter=[main...HEAD]` |
| `--filter=@myapp/web...` | Web + dependencinya | `turbo build --filter=@myapp/web...` |
| `--filter=...@myapp/shared` | Semua yang depends on shared | `turbo test --filter=...@myapp/shared` |
| `--filter=./packages/*` | Glob pattern | `turbo build --filter=./packages/*` |

---

## 4. Pipeline Config Lanjutan

### Input filtering

Batasi file mana yang trigger rebuild:

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", "src/**"],
      "outputs": ["dist/**"]
    }
  }
}
```

Turborepo otomatis hash hanya file dalam glob `inputs`. File luar (README, docs) gak trigger rebuild.

### Env variables sebagai input cache

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "env": ["NEXT_PUBLIC_API_URL", "DATABASE_URL"],
      "outputs": ["dist/**"]
    }
  }
}
```

Kalau env berubah, cache dianggap invalid — rebuild otomatis.

### Global dependencies

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env", "tsconfig.json"],
  "pipeline": { ... }
}
```

### Global env

```json
{
  "globalEnv": ["CI", "NODE_ENV", "VERCEL_ENV"],
  "pipeline": { ... }
}
```

Kalo env global berubah, semua cache invalid — full rebuild.

---

## 5. Remote Cache

Turbo remote cache menyimpan cache di cloud (Vercel, atau self-hosted). Tim CI dan developer lokal bisa share cache.

### Setup Vercel Remote Cache

```bash
npx turbo login
npx turbo link
```

### Self-hosted Remote Cache

Pakai `turbo-server` atau layanan seperti:

- **Vercel Remote Caching** (gratis untuk tim kecil)
- **Turbo Server** (self-hosted)
- **Nx Cloud** (untuk Nx users)

### Custom Remote Cache dengan S3

```bash
# Pake environment variables
export TURBO_API=https://my-turbo-server.com
export TURBO_TOKEN=my-token
export TURBO_TEAM=my-team
```

### Keuntungan remote cache

- Developer lokal dapat cache dari CI
- CI dapat cache dari developer
- Build rata-rata 40-80% lebih cepat

---

## 6. Nx — Fitur Tambahan

### Setup Nx

```bash
npx create-nx-workspace@latest myapp

# Atau tambah Nx ke project existing
npm install -D nx
npx nx init
```

### Dependency Graph Visual

```bash
npx nx graph
```

Ini buka web UI interaktif yang nunjukin semua project dan dependensinya.

### Nx Generators (Code Generation)

Nx generators = scaffolding otomatis dengan template dan konfigurasi pre-built.

```bash
# Generate library baru
npx nx g @nx/js:lib shared

# Generate React component
npx nx g @nx/react:component Button --directory apps/web/src/components

# Generate Next.js page
npx nx g @nx/next:page about --directory apps/web/src/pages

# Generate Express route
npx nx g @nx/express:route users --directory apps/api/src/routes

# Generate Node.js library
npx nx g @nx/node:lib auth --directory packages/auth

# Generate NestJS module
npx nx g @nx/nest:module user --directory apps/api/src

# Generate Angular component
npx nx g @nx/angular:component header --directory apps/admin/src
```

### Nx Generator Options

```bash
# Dry run — liat hasil tanpa generate
npx nx g @nx/react:component Button --dry-run

# Dengan custom directory
npx nx g @nx/react:component Button --directory apps/web/src/components/ui

# Dengan flags
npx nx g @nx/js:lib shared-utils \
  --directory packages/shared-utils \
  --importPath @myapp/shared-utils \
  --publishable \
  --tags "scope:shared,type:util"

# Skip format
npx nx g @nx/react:component Button --skipFormat
```

### Custom Generator — Local Plugin

Bikin generator sendiri untuk standarisasi:

```bash
# Generate local plugin
npx nx g @nx/plugin:plugin my-plugin

# Generate generator dalam plugin
npx nx g @nx/plugin:generator my-generator --project my-plugin
```

```typescript
// tools/my-plugin/src/generators/my-generator/my-generator.ts
import {
  Tree,
  formatFiles,
  generateFiles,
  joinPathFragments,
  names,
} from '@nx/devkit';

export async function myGenerator(tree: Tree, options: { name: string }) {
  const substitutions = {
    ...names(options.name),
    tmpl: '',
  };

  // Generate file dari template
  generateFiles(
    tree,
    joinPathFragments(__dirname, 'files'), // template folder
    joinPathFragments('apps', options.name),
    substitutions,
  );

  await formatFiles(tree);
}

export default myGenerator;
```

```bash
npx nx generate @my-plugin/my-generator my-feature
```

### Nx Executors

```typescript
// project.json — Nx config per project
{
  "name": "web",
  "targets": {
    "build": {
      "executor": "@nx/next:build",
      "options": {
        "outputPath": "dist/apps/web"
      }
    },
    "test": {
      "executor": "@nx/vite:test",
      "options": {
        "config": "apps/web/vite.config.ts"
      }
    }
  }
}
```

### Nx Executor Options

```json
{
  "targets": {
    "build": {
      "executor": "@nx/webpack:webpack",
      "options": {
        "outputPath": "dist/apps/api",
        "main": "apps/api/src/main.ts",
        "tsConfig": "apps/api/tsconfig.app.json",
        "assets": ["apps/api/src/assets"]
      },
      "configurations": {
        "production": {
          "optimization": true,
          "extractLicenses": true,
          "inspect": false
        },
        "development": {
          "optimization": false
        }
      },
      "defaultConfiguration": "production"
    }
  }
}
```

### Nx Affected Commands

```bash
# Build hanya yang berubah
npx nx affected:build

# Test hanya yang berubah
npx nx affected:test

# Lint hanya yang berubah
npx nx affected:lint

# Dengan base branch
npx nx affected:build --base=main --head=HEAD

# Exclude project tertentu
npx nx affected:build --exclude=legacy-app

# Parallel execution
npx nx affected:build --parallel=5
```

### Nx Console (VS Code Extension)

Nx punya VS Code extension yang ngasih UI untuk generators, dependency graph, dan task running. Install `Nx Console` dari marketplace.

### Nx Cloud — Remote Caching & Distributed Task Execution

```bash
# Connect ke Nx Cloud
npx nx connect-to-nx-cloud

# Di nx.json
{
  "nxCloudAccessToken": "YOUR_TOKEN"
}
```

Nx Cloud nyediain:
- **Remote caching** — share cache antar dev dan CI
- **Distributed task execution** — pecah task ke banyak agent
- **View runs** — history dan analytics di dashboard cloud.nx.app

## 6b. Nx Buildable Libraries & Module Boundaries

### Buildable vs Publishable Libraries

```bash
# Buildable — bisa di-build independent, dipake di monorepo
npx nx g @nx/js:lib shared-utils --buildable

# Publishable — bisa di-publish ke npm
npx nx g @nx/js:lib shared-ui --publishable --importPath @myapp/shared-ui
```

| Tipe | Build | Publish ke npm | Use Case |
|------|-------|----------------|----------|
| Regular | Via parent | ❌ | Internal shared code |
| Buildable | Independent | ❌ | Library yang sering berubah |
| Publishable | Independent | ✅ | UI components, utilities |

### Module Boundary Constraints

Nx enforce dependensi antar library:

```json
// .eslintrc.json — tag-based constraint
{
  "rules": {
    "@nx/enforce-module-boundaries": [
      "error",
      {
        "depConstraints": [
          {
            "sourceTag": "scope:shared",
            "onlyDependOnLibsWithTags": ["scope:shared"]
          },
          {
            "sourceTag": "scope:api",
            "onlyDependOnLibsWithTags": ["scope:shared", "scope:api"]
          },
          {
            "sourceTag": "scope:web",
            "onlyDependOnLibsWithTags": ["scope:shared", "scope:web"]
          },
          {
            "sourceTag": "type:feature",
            "onlyDependOnLibsWithTags": ["type:feature", "type:ui", "type:util"]
          },
          {
            "sourceTag": "type:ui",
            "onlyDependOnLibsWithTags": ["type:util"]
          },
          {
            "sourceTag": "type:util",
            "onlyDependOnLibsWithTags": ["type:util"]
          }
        ]
      }
    ]
  }
}
```

Ini prevent:
- `apps/web` import langsung dari `apps/api`
- Library `type:ui` import dari `type:feature` (harusnya sebaliknya)
- Circular dependency antar domain

### Tag Convention

| Tag | Arti |
|-----|------|
| `scope:shared` | Bisa dipakai siapa aja |
| `scope:api` | Hanya untuk backend |
| `scope:web` | Hanya untuk frontend |
| `type:feature` | Use case / business logic |
| `type:ui` | Komponen UI murni |
| `type:util` | Utility functions |
| `type:data-access` | API calls, data fetching |

---

## 7. Nx vs Turborepo

| Fitur | Turborepo | Nx |
|-------|-----------|-----|
| Setup | Sederhana, minimal config | Lebih kompleks |
| Cache | Lokal + remote (Vercel) | Lokal + Nx Cloud |
| Code generation | Tidak ada | Ada (generators) |
| Dependency graph | CLI sederhana | Visual web UI |
| Plugin ecosystem | Minimal | Kaya (Next, React, Angular, Nest) |
| Task orchestration | `dependsOn` di JSON | Task graph + executors |
| Affected commands | `--filter` | `nx affected:build` |

Kapan pakai Turborepo: project JS/TS skala kecil-menengah, tim kecil.
Kapan pakai Nx: project besar, banyak framework, butuh code generation.

### Migrasi dari Turborepo ke Nx

```bash
# Tambah Nx ke project Turborepo
npm install -D nx
npx nx init

# Nx bisa baca turbo.json — gradual migration
# Nanti bisa migrate task satu per satu dari turbo.json ke project.json
```

---

## 8. Docker dalam Monorepo

### Dockerfile untuk Monorepo

```dockerfile
# Dockerfile — optimize caching
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

# Build
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter @myapp/api build

# Production
FROM base AS production
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/package.json ./
COPY --from=build /app/node_modules ./node_modules
CMD ["node", "dist/index.js"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: "3.8"
services:
  api:
    build:
      context: .
      dockerfile: Dockerfile.api
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/myapp

  web:
    build:
      context: .
      dockerfile: Dockerfile.web
    ports:
      - "5173:5173"
    depends_on:
      - api

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: myapp
```

---

## ✍️ Latihan

1. Setup Turborepo di monorepo yang sudah kamu buat

2. Konfigurasi pipeline: build harus menunggu dependency build selesai

3. Jalankan `turbo build` — amati cache hash pertama vs kedua

4. Ubah file di `packages/shared`, jalankan `turbo build` lagi — hanya shared yang rebuild

5. Coba `turbo build --filter=apps/web` — hanya web yang build

6. Tambahkan `env` di `turbo.json` dan lihat efeknya pada cache

7. Setup Nx di project baru, generate sebuah lib dengan `nx g @nx/js:lib`

8. Bikin dependency graph visual dengan `nx graph`

9. Buat Dockerfile untuk apps/api yang optimized — dependensi di-cache terpisah dari source code

10. Setup remote cache (Vercel atau self-hosted) dan test sharing cache antara 2 terminal berbeda

---

## 📚 Referensi

- [Turborepo Docs](https://turbo.build/repo/docs)
- [Nx Documentation](https://nx.dev/getting-started/intro)
- [Turborepo Pipeline Config](https://turbo.build/repo/docs/reference/configuration)
- [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Nx Generators](https://nx.dev/generators/using-generators)
