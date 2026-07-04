# 🧠 Cheatsheet: Monorepo

> Referensi cepet — 1 halaman.

## Topik Utama
- **Monorepo**: semua project (FE, BE, shared) di 1 repo — bukan monolith
- **Keuntungan**: shared types, 1 CI/CD, refactor mudah, dependency terpusat
- **NPM Workspaces**: `"workspaces": ["apps/*", "packages/*"]` di root package.json
- **Hoisting**: dependensi sama naik ke root `node_modules` — hemat disk
- **Turborepo**: build orchestrator — pipeline, caching, paralelisasi
- **Struktur**: `apps/` (aplikasi jalan) + `packages/` (library internal)
- **CI/CD**: hanya build yang berubah — filter pake turborepo hashing

## Command / Sintaks Penting

```bash
npm install                    # install semua dep (hoisted)
npm run dev                    # semua dev server (via turbo)
turbo build                    # build semua, cache otomatis
turbo build --filter=apps/web  # build web saja
turbo lint                     # lint semua
npx create-turbo@latest        # scaffold monorepo baru
```

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

```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": { "cache": false, "persistent": true },
    "lint": {}
  }
}
```

```text
# Struktur
monorepo/
├── apps/
│   ├── web/        # Next.js / React
│   └── api/        # Express / Hono
├── packages/
│   ├── shared/     # types, utils
│   └── eslint-config/
├── package.json    # root workspace
├── turbo.json
└── .gitignore
```

## Tips & Trik
- **Shared types**: 1 definisi di `packages/shared`, dipakai FE & BE — zero duplikasi.
- **Import pake alias**: `"@myapp/shared"` → `tsconfig.json` paths.
- **Commit atomic**: 1 commit bisa ubah shared + api + web — sinkron.
- **Cache `.turbo/` di CI** biar build kilat.
- **Conventional commits**: `feat(scope): message` — changelog otomatis.

## Common Mistakes
❌ Root `package.json` lupa `"private": true` — isinya bisa kepublish ke npm.
❌ `"*"` di dependency ga update — pake spesifik version atau `"workspace:*"`.
❌ `.turbo/` di-commit — cache folder, jangan.
❌ Semua dependency di root — beberapa mungkin perlu versi beda per app.
❌ Ga pake turborepo — npm workspaces doang tanpa orchestrator, ga ada cache.

## Link Cepat
- [Module README](README.md)
- [Quiz](quiz.md)
- [Turborepo Docs](https://turbo.build/repo/docs)
- [NPM Workspaces](https://docs.npmjs.com/cli/v10/using-npm/workspaces)
