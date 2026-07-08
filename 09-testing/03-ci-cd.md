# 3. CI/CD dengan GitHub Actions

## Kenapa CI/CD Penting?

**Bayangin:** 5 developer push ke repo yang sama. Tanpa CI/CD:
- Kode Budi rusak, tapi baru ketauan 2 hari kemudian pas Rina pull
- Lupa jalanin test sebelum deploy
- Manual copy file ke server → typo → downtime

Dengan CI/CD:
- Setiap push → auto test → auto deploy
- Kalo merah, langsung tau siapa yang ngerusak
- Deploy = klik tombol atau bahkan otomatis

## Konsep Dasar

| Istilah | Arti |
|---------|------|
| **CI (Continuous Integration)** | Setiap push kode, test otomatis dijalankan |
| **CD (Continuous Deployment/Delivery)** | Setelah test lolos, deploy otomatis ke production/staging |
| **Pipeline** | Rangkaian langkah dari commit → test → deploy |
| **Runner** | Server tempat workflow jalan (bisa GitHub-hosted atau self-hosted) |
| **Trigger** | Event yang nge-start workflow (push, PR, schedule) |

## GitHub Actions Workflow Dasar

Bikin file `.github/workflows/test.yml`:

```yaml
name: Test

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"

      - run: npm ci
      - run: npm test
```

### Anatomi Workflow

| Bagian | Fungsi |
|--------|--------|
| `name` | Nama workflow (muncul di tab Actions) |
| `on: push` | Trigger tiap push ke branch main |
| `on: pull_request` | Trigger tiap PR ke main |
| `jobs:` | Definisikan job (bisa lebih dari 1) |
| `runs-on: ubuntu-latest` | Runner OS (Linux) |
| `actions/checkout` | Clone repo ke runner |
| `actions/setup-node` | Install Node.js + cache npm |
| `npm ci` | Clean install dependencies (lebih cepet dari `npm install`) |
| `npm test` | Jalanin test script |

### Perbedaan `npm ci` vs `npm install`

| `npm ci` | `npm install` |
|----------|--------------|
| Pake `package-lock.json` langsung | Generate lock file kalo belum ada |
| Hapus `node_modules` dulu, install fresh | Update yang ada |
| Gagal kalo `package.json` & lock gak cocok | Bisa ubah lock file |
| **Lebih cepet** (skip resolution) | Lebih lambat |

### Trigger Events Lainnya

```yaml
on:
  push:                     # Tiap push ke branch mana pun
  pull_request:              # Tiap PR
    types: [opened, reopened, synchronize]
  schedule:                  # Jadwal (cron)
    - cron: "0 6 * * 1"     # Setiap Senin jam 06:00
  workflow_dispatch:         # Manual trigger dari UI
    inputs:
      environment:
        description: 'Target environment'
        required: true
        default: 'staging'
  release:                   # Tag/release baru
    types: [published]
```

## Coverage Reporting

Kirim coverage ke Codecov / Coveralls:

```yaml
name: Test with Coverage

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"

      - run: npm ci
      - run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/lcov.info
```

Di `vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/**/*.spec.ts"],
    },
  },
});
```

### Badge README

```markdown
![CI](https://github.com/<user>/<repo>/actions/workflows/test.yml/badge.svg)
![Coverage](https://codecov.io/gh/<user>/<repo>/branch/main/graph/badge.svg)
```

## Test Matrix (Multi Node Version)

Jalanin test di beberapa versi Node sekaligus:

```yaml
name: Matrix Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: "npm"

      - run: npm ci
      - run: npm test
```

Matrix bikin job terpisah buat tiap versi. Berguna untuk:
- Mastiin kompatibilitas di berbagai Node.js version
- OS matrix (ubuntu, macos, windows)
- Dependency version matrix

### Multi-OS Matrix

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, macos-latest, windows-latest]
    node-version: [18, 20]
    
runs-on: ${{ matrix.os }}
```

## Environment Variables & Secrets

Jangan hardcode secret di kode. Pake GitHub Secrets + env variable:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm ci

      - name: Run tests
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
          NODE_ENV: test
        run: npm test
```

Atau bikin file `.env.test` yang di-load otomatis:

```bash
# .env.test
DATABASE_URL=sqlite://:memory:
JWT_SECRET=test-secret
NODE_ENV=test
```

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: {
      DATABASE_URL: "sqlite://:memory:",
      JWT_SECRET: "test-secret",
      NODE_ENV: "test",
    },
  },
});
```

> **Cara set GitHub Secrets:** Settings → Secrets and variables → Actions → New repository secret.

## Parallel Test Optimization

Vitest otomatis jalanin test file secara paralel:

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    pool: "forks",            // pake child process (default: threads)
    poolOptions: {
      forks: {
        singleFork: false,    // multiple forks = paralel
      },
    },
    fileParallelism: true,    // jalanin file paralel
    maxConcurrency: 5,        // max 5 test concurrently
  },
});
```

Cache node_modules biar install lebih cepat:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: "npm"

- run: npm ci
```

### Perbandingan Pool

| Pool | Kelebihan | Kekurangan |
|------|-----------|------------|
| `threads` (default) | Cepet, lightweight | Isolasi kurang, memory leak bisa kena test lain |
| `forks` | Isolasi lebih baik (child process sendiri) | Lebih lambat startup |
| `vmThreads` | Isolasi palig ketat | Paling lambat |

## Workflow Lengkap: Test + Lint + Build

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm ci
      - run: npm run lint

  test:
    needs: lint
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: "npm"

      - run: npm ci
      - run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

  build:
    needs: [lint, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm ci
      - run: npm run build
```

**Alur:** lint dulu → baru test (matrix) → baru build. Kalo lint gagal, test & build skip otomatis.

## Workflow Diagram (Visual)

```
Git Push → [Lint] → Lolos? → [Test (18, 20)] → Lolos? → [Build] → ✅ Green
                ↙                      ↘
             ❌ Fail                  ❌ Fail
```

## Deploy Pipeline (CD)

Setelah CI lolos, deploy otomatis:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"

      - run: npm ci
      - run: npm run build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

Atau deploy pake SSH:

```yaml
- name: Deploy via SSH
  uses: appleboy/ssh-action@v1.0.3
  with:
    host: ${{ secrets.SERVER_HOST }}
    username: ${{ secrets.SERVER_USER }}
    key: ${{ secrets.SSH_KEY }}
    script: |
      cd /var/www/my-app
      git pull
      npm ci
      npm run build
      pm2 restart app
```

## Pitfalls CI/CD

1. **Test flaky** — Test kadang pass kadang fail. Bikin dev males. Root cause biasaya: race condition, network dependency ga di-mock, shared state
2. **CI terlalu lambat** — Kalo >10 menit, dev push jarang. Optimasi: caching, parallel jobs, split test
3. **Hardcoded secret di repo** — Jangan pernah commit `.env` atau token. Pake GitHub Secrets
4. **Ga test di staging** — Langsung deploy ke production = resep bencana. Selalu test di staging dulu
5. **Notification spam** — Kalo CI ngirim email tiap fail, dev matiin notifikasi. Pake Slack/Telegram webhook aja buat yang beneran penting

## Latihan

1. **Workflow dasar** — Bikin file `.github/workflows/test.yml` yang jalanin test tiap push ke branch `main` dan tiap PR ke `main`. Pake Node 20, npm ci, npm test. Push ke GitHub, pastikan workflow muncul di tab Actions

2. **Workflow dengan coverage** — Tambah coverage report pake `vitest run --coverage`. Konfigurasi vitest biar pake v8 provider. Kirim coverage ke Codecov (daftar dulu, dapetin token, simpan di GitHub Secrets)

3. **Workflow matrix** — Ubah workflow supaya test di Node 18, 20, dan 22 sekaligus. Tambah badge di README: `![CI](https://github.com/<user>/<repo>/actions/workflows/test.yml/badge.svg)`

4. **Workflow multi-job** — Bikin workflow dengan 3 job: `lint` (eslint), `test` (matrix 18/20 + coverage), `build` (typescript compile). Pake `needs` biar job jalan berurutan. Kalo lint gagal, test & build ga jalan

5. **Deploy pipeline** — Bikin workflow deploy ke Vercel atau Railway yang trigger pas push ke main. Tambah environment variable `NODE_ENV=production`. Pastikan cuma trigger kalo test di CI sebelumnya lolos
