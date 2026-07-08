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
turbo build --filter=$(git diff --name-only HEAD~1 | xargs -I{} dirname {} | sort -u | tr '\\n' ',')
```

### Monorepo CI dengan Nx

```yaml
name: Nx CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Nx butuh git history penuh buat affected

      - uses: actions/setup-node@v4
      - run: npm ci

      - name: Derive appropriate SHAs for nx affected
        uses: nrwl/nx-set-shas@v4

      - run: npx nx affected --target=build --parallel=3
      - run: npx nx affected --target=test --parallel=2
      - run: npx nx affected --target=lint --parallel=2
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

### Pipeline Lengkap Monorepo CI

```yaml
name: Monorepo CI

on:
  push:
    branches: [main]
  pull_request:

env:
  NODE_VERSION: 20
  PNPM_VERSION: 9

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - name: Type Check
        run: pnpm -r typecheck

      - name: Lint
        run: pnpm -r lint

  test:
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - name: Run Tests
        run: pnpm -r test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - name: Cache Turbo
        uses: actions/cache@v4
        with:
          path: .turbo
          key: ${{ runner.os }}-turbo-${{ github.sha }}
          restore-keys: |
            ${{ runner.os }}-turbo-

      - name: Build
        run: npx turbo build
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

### Release Pipeline Lengkap

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
        with:
          fetch-depth: 0
          persist-credentials: false

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - name: Build
        run: npx turbo build

      - name: Create Release Pull Request or Publish
        uses: changesets/action@v1
        with:
          publish: pnpm changeset publish
          version: pnpm changeset version
          commit: "chore: release new versions"
          title: "Publish New Release"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Semantic Release GitHub Actions

```yaml
name: Semantic Release

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          persist-credentials: false

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm ci

      - name: Semantic Release
        uses: cycjimmy/semantic-release-action@v4
        with:
          semantic_version: 21
          extra_plugins: |
            @semantic-release/git
            @semantic-release/changelog
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
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

### Analisis Circular Dependency

```bash
# Deteksi circular dependency
npx depcruise --include-only "^src" src
# Output: warning circular dependencies detected ...
```

Circular dependency bikin kode susah di-test dan rawan error. Monorepo dengan banyak package gampang kena masalah ini.

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

### Template Component Hygen

```handlebars
// _templates/component/new/index.tsx.ejs
---
to: <%= workspace %>/src/components/<%= name %>/index.tsx
---
import React from 'react';

interface <%= name %>Props {
  children?: React.ReactNode;
}

export function <%= name %>({ children }: <%= name %>Props) {
  return (
    <div className="<%= name.toLowerCase() %>">
      {children}
    </div>
  );
}
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

### Merge Multiple Repos

```bash
#!/bin/bash
# Script merge beberapa repo ke monorepo

# Clone target repo
git init monorepo
cd monorepo

# Tambah remote repo lama
git remote add -f api ../old-api-repo
git remote add -f web ../old-web-repo

# Merge dengan subtree
git merge -s ours --no-commit --allow-unrelated-histories api/main
git read-tree --prefix=apps/api -u api/main
git commit -m "Import apps/api from old-api-repo"

git merge -s ours --no-commit --allow-unrelated-histories web/main
git read-tree --prefix=apps/web -u web/main
git commit -m "Import apps/web from old-web-repo"
```

### Hal yang perlu diperhatikan

- **Jangan pindahkan semua sekaligus** — lakukan bertahap per project
- **CI harus ready sebelum migrasi** — jangan sampai build broken
- **Komunikasikan ke tim** — workflow berubah, branching strategy berubah
- **Test coverage** — pastikan test tetap jalan setelah migrasi

### Post-Migration Checklist

```markdown
- [ ] Semua CI pipeline jalan
- [ ] Import paths udah diupdate
- [ ] Shared code pindah ke packages/
- [ ] Root scripts (dev, build, test) work
- [ ] Docker build work
- [ ] Team sudah tau branching strategy baru
|- [ ] Repo lama diarchive, bukan didelete
|- [ ] Docker build dari monorepo work
|- [ ] Changesets configured
|- [ ] Shared config packages (ESLint, tsconfig) consumed by apps

---

## 8. Shared Config Packages — Inheritance Pattern

### Struktur

```
packages/
├── eslint-config/
│   ├── package.json           # @myapp/eslint-config
│   ├── index.js               # rules utama
│   ├── react.js               # extend untuk React apps
│   └── node.js                # extend untuk Node.js apps
└── tsconfig/
    ├── package.json           # @myapp/tsconfig
    ├── base.json              # base config semua
    ├── nextjs.json            # extend untuk Next.js
    └── node.json              # extend untuk Node.js
```

### ESLint Config — Multi Variant

```js
// packages/eslint-config/index.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': 'warn',
    'eqeqeq': ['error', 'always'],
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  env: {
    node: true,
    es2022: true,
  },
};

// packages/eslint-config/react.js
module.exports = {
  extends: [
    './index.js',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
  },
  settings: {
    react: { version: 'detect' },
  },
};

// packages/eslint-config/nextjs.js
module.exports = {
  extends: [
    './react.js',
    'next/core-web-vitals',
  ],
};
```

```json
// packages/eslint-config/package.json
{
  "name": "@myapp/eslint-config",
  "version": "0.1.0",
  "main": "index.js",
  "exports": {
    ".": "./index.js",
    "./react": "./react.js",
    "./nextjs": "./nextjs.js",
    "./node": "./node.js"
  },
  "peerDependencies": {
    "eslint": "^8.0.0 || ^9.0.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "prettier": "^3.0.0"
  }
}
```

```json
// apps/web/.eslintrc.json
{
  "extends": ["@myapp/eslint-config/nextjs"],
  "rules": {
    // override spesifik untuk app ini
    "no-console": "off"
  }
}

// apps/api/.eslintrc.json
{
  "extends": ["@myapp/eslint-config/node"]
}
```

### TypeScript Config Inheritance — Multi Variant

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
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}

// packages/tsconfig/nextjs.json
{
  "extends": "./base.json",
  "compilerOptions": {
    "jsx": "preserve",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "plugins": [{ "name": "next" }],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowJs": true,
    "noEmit": true
  }
}

// packages/tsconfig/node.json
{
  "extends": "./base.json",
  "compilerOptions": {
    "lib": ["ES2022"],
    "module": "CommonJS",
    "moduleResolution": "node",
    "types": ["node"],
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

```json
// packages/tsconfig/package.json
{
  "name": "@myapp/tsconfig",
  "version": "0.0.0",
  "private": true,
  "files": ["base.json", "nextjs.json", "node.json", "react-library.json"]
}

// apps/web/tsconfig.json
{
  "extends": "@myapp/tsconfig/nextjs.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"]
}

// apps/api/tsconfig.json
{
  "extends": "@myapp/tsconfig/node.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

### Publishing Shared Packages ke npm

```bash
# 1. Build shared package dulu
pnpm --filter @myapp/eslint-config build

# 2. Bump version
pnpm changeset
pnpm changeset version

# 3. Publish
pnpm changeset publish
```

### CI Pipeline — Publish Otomatis

```yaml
name: Publish Packages

on:
  push:
    branches: [main]
    paths:
      - 'packages/**'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: 'https://registry.npmjs.org'

      - run: pnpm install --frozen-lockfile
      - run: pnpm -r build --filter='./packages/*'

      - name: Publish changed packages
        run: |
          for pkg in packages/*/; do
            if git diff --name-only HEAD~1 | grep -q "^$pkg"; then
              cd $pkg
              npm publish --access public
              cd ../..
            fi
          done
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 9. Docker Multi-Stage Build dalam Monorepo

### Problem: Monorepo Docker Build Lambat

Tanpa optimasi, tiap build Docker harus install semua dependency monorepo — bahkan yang gak dipake service itu.

### Solusi: Builder Pattern + Layer Caching

```dockerfile
# Dockerfile.api — optimized multi-stage
# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile

# Stage 2: Build shared packages
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/pnpm-lock.yaml ./
COPY . .
RUN pnpm --filter @myapp/shared build
RUN pnpm --filter @myapp/api build

# Stage 3: Production image — minimal
FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

# Copy only the built artifacts
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=deps /app/node_modules ./node_modules

USER appuser
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
```

### Dockerfile dengan BuildKit Cache

```dockerfile
# syntax=docker/dockerfile:1.4
FROM node:20-alpine AS deps
WORKDIR /app

# Copy only dependency files — layer cache optimal
COPY --link package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --link apps/api/package.json ./apps/api/
COPY --link packages/shared/package.json ./packages/shared/
COPY --link packages/tsconfig/package.json ./packages/tsconfig/

# Mount cache untuk speed up install
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
COPY --link --from=deps /app/node_modules ./node_modules
COPY --link . .
RUN pnpm --filter @myapp/api build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --link --from=builder /app/apps/api/dist ./dist
COPY --link --from=builder /app/apps/api/package.json ./
COPY --link --from=deps /app/node_modules ./node_modules
CMD ["node", "dist/index.js"]
```

### Docker Compose dengan Monorepo

```yaml
# docker-compose.yml
version: "3.9"
services:
  api:
    build:
      context: .
      dockerfile: Dockerfile.api
      target: runner
    ports:
      - "3000:3000"
    depends_on:
      db:
        condition: service_healthy
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/myapp

  web:
    build:
      context: .
      dockerfile: Dockerfile.web
      target: runner
    ports:
      - "5173:5173"
    depends_on:
      - api

  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
```

### Docker Layer Caching di CI

```yaml
- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v3

- name: Cache Docker layers
  uses: actions/cache@v4
  with:
    path: /tmp/.buildx-cache
    key: ${{ runner.os }}-buildx-${{ github.sha }}
    restore-keys: |
      ${{ runner.os }}-buildx-

- name: Build and push
  uses: docker/build-push-action@v5
  with:
    context: .
    file: Dockerfile.api
    push: true
    tags: registry.example.com/myapp-api:latest
    cache-from: type=local,src=/tmp/.buildx-cache
    cache-to: type=local,dest=/tmp/.buildx-cache-new,mode=max
```

## 10. Publishing Strategy — Changesets Deep Dive

### Setup Changesets di Monorepo

```bash
pnpm add -Dw @changesets/cli @changesets/changelog-github
pnpm changeset init
```

`.changeset/config.json`:

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/changelog-github",
  "commit": true,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

### Fixed vs Linked Packages

**Fixed** — beberapa package selalu naik versi barengan:

```json
{
  "fixed": [
    ["@myapp/web", "@myapp/api", "@myapp/shared"]
  ]
}
```

**Linked** — package yang terhubung versinya, tapi gak harus sama:

```json
{
  "linked": [
    ["@myapp/eslint-config", "@myapp/tsconfig"]
  ]
}
```

### Private Packages — Skip Publish

Kalo ada package yang cuma internal, set `"private": true` di package.json. Changesets skip publish ke npm.

### Release Script Lengkap

```json
// package.json root
{
  "scripts": {
    "changeset": "changeset",
    "version-packages": "changeset version",
    "release": "pnpm build && changeset publish",
    "snapshot": "changeset version --snapshot canary",
    "snapshot-publish": "pnpm release --tag canary"
  }
}
```

### Snapshot Release (Canary / Beta)

```bash
# Buat snapshot untuk testing
pnpm changeset --snapshot canary
pnpm version-packages
pnpm snapshot-publish
```

Hasil: `@myapp/shared@1.0.0-canary-abc1234`

### GitHub Release Workflow — Lengkap

```yaml
name: Release

on:
  push:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      id-token: write

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
          registry-url: 'https://registry.npmjs.org'

      - run: pnpm install --frozen-lockfile

      - name: Build all packages
        run: pnpm -r build

      - name: Create Release PR or Publish
        uses: changesets/action@v1
        with:
          publish: pnpm changeset publish
          version: pnpm changeset version
          commit: "chore: version packages"
          title: "chore: release new versions"
          createGithubReleases: true
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Semantic Release untuk Monorepo

Alternatif dari Changesets — fully automated:

```bash
pnpm add -Dw multi-semantic-release
```

```json
// .releaserc.json per package
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/github",
    "@semantic-release/npm"
  ]
}
```

```yaml
# CI Semantic Release
- name: Semantic Release
  run: npx multi-semantic-release --deps.bump=satisfy
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Perbandingan Changesets vs Semantic Release

| Aspek | Changesets | Semantic Release |
|-------|-----------|-----------------|
| Approach | Manual (buat file .md) | Otomatis (dari commit message) |
| Kontrol | Tinggi — review sebelum release | Rendah — auto publish |
| Learning curve | Rendah | Sedang (conventional commits) |
| Multi-package | ✅ Built-in | Butuh multi-semantic-release |
| Changelog | Generate dari .md files | Generate dari commits |
| Cocok untuk | Tim yang suka kontrol | Tim yang suka automasi |

---

## 7. Monorepo Best Practices

1. **Root package.json** — cuma workspace declaration dan script shortcut
2. **Shared config** — ESLint, tsconfig, prettier sebagai package terpisah
3. **Lockfile di root** — satu sumber kebenaran dependency
4. **Semantic versioning** — pake Changesets atau semantic-release
5. **CI optimization** — cache, affected, parallel jobs
6. **Docker layer caching** — dependency layer dulu, baru source code
7. **Git hooks** — husky + lint-staged untuk quality gate sebelum commit

---

## ✍️ Latihan

1. Setup GitHub Actions workflow untuk monorepo dengan job lint + build

2. Tambahkan path filter agar build API hanya jalan jika `apps/api/` berubah

3. Setup Changesets dan buat 1 file changeset untuk perubahan minor

4. Generate dependency graph dengan `npx turbo build --graph`

5. Buat plop generator untuk component React

6. Rencanakan migrasi: tulis 3 langkah konkret memindahkan polyrepo ke monorepo

7. Setup semantic-release dengan GitHub Actions. Buat commit `feat: add user API` dan `fix: fix login bug` — lihat release otomatis

8. Implementasi Docker multi-stage build untuk apps/api dengan layer caching optimal

9. Buat shared ESLint config package dan setup di 2 apps berbeda

10. Setup husky + lint-staged untuk auto-lint sebelum commit

---

## 📚 Referensi

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [dorny/paths-filter](https://github.com/dorny/paths-filter)
- [Changesets](https://github.com/changesets/changesets)
- [Plop.js](https://plopjs.com/)
- [Hygen](https://www.hygen.io/)
- [Semantic Release GitHub Action](https://github.com/cycjimmy/semantic-release-action)
- [Docker Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
