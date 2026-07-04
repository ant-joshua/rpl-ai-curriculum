# 3. CI/CD dengan GitHub Actions

## Apa itu CI/CD?

- **CI (Continuous Integration):** Setiap push kode, test otomatis dijalankan di server CI
- **CD (Continuous Deployment):** Setelah test lolos, deploy otomatis ke production

Manfaat:
- Ketauan langsung kalo ada test failure sebelum merge
- Kode selalu dalam keadaan hijau (test passing)
- Review lebih cepat — ga perlu pull & run test manual

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

Penjelasan tiap bagian:

| Bagian | Fungsi |
|--------|--------|
| `on: push` | Trigger tiap push ke branch main |
| `on: pull_request` | Trigger tiap PR ke main |
| `runs-on: ubuntu-latest` | Runner OS (Linux) |
| `actions/checkout` | Clone repo ke runner |
| `actions/setup-node` | Install Node.js + npm cache |
| `npm ci` | Install dependencies (clean install) |
| `npm test` | Jalanin test script |

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
      exclude: ["src/**/*.test.ts"],
    },
  },
});
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

Matrix bikin job terpisah buat tiap versi. Kalo salah satu fail, workflow tetap lapor partial failure.

## .env untuk CI

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

Atau bikin file `.env.test` yang di-load otomatis waktu test:

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

## Parallel Test

Vitest otomatis jalanin test file secara paralel. Konfigurasi:

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

Di GitHub Actions, cache node_modules biar install lebih cepat:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: "npm"

- run: npm ci
```

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

Alur: lint dulu → baru test (matrix) → baru build. Kalo lint gagal, test & build skip.

## Latihan

1. **Workflow dasar** — Bikin file `.github/workflows/test.yml` yang jalanin test tiap push ke branch `main` dan tiap PR ke `main`. Pake Node 20, npm ci, npm test. Push ke GitHub, pastikan workflow muncul

2. **Workflow dengan coverage** — Tambah coverage report pake `vitest run --coverage`. Konfigurasi vitest biar pake v8 provider. Kirim coverage ke Codecov (daftar dulu, dapetin token, simpan di GitHub Secrets)

3. **Workflow matrix** — Ubah workflow supaya test di Node 18, 20, dan 22 sekaligus. Tambah badge di README: `![CI](https://github.com/<user>/<repo>/actions/workflows/test.yml/badge.svg)`

4. **Workflow multi-job** — Bikin workflow dengan 3 job: `lint` (eslint), `test` (matrix 18/20 + coverage), `build` (typescript compile). Pake `needs` biar job jalan berurutan. Kalo lint gagal, test & build ga jalan
