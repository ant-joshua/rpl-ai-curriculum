# 03 — Nx & Turborepo: Pipeline, Caching & Task Orchestration

## 🎯 Tujuan

Setelah sesi ini, kamu mampu:

- Setup **Turborepo** dalam project monorepo
- Mengkonfigurasi **pipeline** dengan `dependsOn`
- Memahami **task orchestration** dan eksekusi paralel
- Menggunakan **affected commands** (`--filter`) untuk build selektif
- Menguasai **computation caching** (lokal & remote cache)
- Menerapkan **caching strategies** optimal

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

### Keuntungan remote cache

- Developer lokal dapat cache dari CI
- CI dapat cache dari developer
- Build rata-rata 40-80% lebih cepat

---

## 6. Nx vs Turborepo

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

---

## ✍️ Latihan

1. Setup Turborepo di monorepo yang sudah kamu buat
2. Konfigurasi pipeline: build harus menunggu dependency build selesai
3. Jalankan `turbo build` — amati cache hash pertama vs kedua
4. Ubah file di `packages/shared`, jalankan `turbo build` lagi — hanya shared yang rebuild
5. Coba `turbo build --filter=apps/web` — hanya web yang build
6. Tambahkan `env` di `turbo.json` dan lihat efeknya pada cache

---

## 📚 Referensi

- [Turborepo Docs](https://turbo.build/repo/docs)
- [Nx Documentation](https://nx.dev/getting-started/intro)
- [Turborepo Pipeline Config](https://turbo.build/repo/docs/reference/configuration)
- [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
