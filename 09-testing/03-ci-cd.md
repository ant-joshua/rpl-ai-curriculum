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

## E2E Testing dengan Playwright

E2E test = test dari **pengguna akhir**. Buka browser beneran, klik tombol, isi form, verifikasi halaman.

### Kenapa Playwright?

| Fitur | Playwright | Cypress |
|-------|-----------|---------|
| **Browser** | Chromium, Firefox, Safari | Chromium-only (Electron) |
| **Bahasa** | TS/JS, Python, Java, .NET | TS/JS only |
| **Kecepatan** | ⚡ Parallel by default | Lebih lambat |
| **Network mock** | Route intercept bawaan | cy.intercept() |
| **Mobile** | ✅ Emulasi mobile | ✅ |
| **API testing** | ✅ Built-in | Butuh plugin |
| **File upload** | ✅ setInputFiles | ✅ fixture |

### Setup Playwright

```bash
npm init -y
npm install -D @playwright/test
npx playwright install  # download browser
```

### Playwright Config

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:3000',
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
});
```

### E2E Test — User Flow

```typescript
// e2e/todo.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Todo App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('menampilkan daftar todo', async ({ page }) => {
    await expect(page.getByText('Belajar Playwright')).toBeVisible();
    await expect(page.getByText('Setup E2E testing')).toBeVisible();
  });

  test('tambah todo baru', async ({ page }) => {
    await page.getByPlaceholder(/tambah|add/i).fill('Todo E2E test');
    await page.getByRole('button', { name: /tambah|add/i }).click();

    // Verifikasi muncul
    await expect(page.getByText('Todo E2E test')).toBeVisible();

    // Verifikasi API call sukses (via network)
    const response = await page.waitForResponse(
      resp => resp.url().includes('/api/todos') && resp.status() === 201
    );
    expect(response.ok()).toBeTruthy();
  });

  test('toggle todo selesai', async ({ page }) => {
    const checkbox = page.getByRole('checkbox').first();
    await checkbox.check();
    await expect(checkbox).toBeChecked();
  });

  test('hapus todo', async ({ page }) => {
    // Klik tombol delete pertama
    page.on('dialog', dialog => dialog.accept()); // handle confirm
    await page.getByRole('button', { name: /hapus|delete/i }).first().click();

    // Verifikasi item hilang
    await expect(page.getByText('Belajar Playwright')).not.toBeVisible();
  });
});
```

### Running Playwright

```bash
# Run all tests
npx playwright test

# Run with UI mode (visual debug)
npx playwright test --ui

# Run specific file
npx playwright test e2e/todo.spec.ts

# Run with headed mode (lihat browsernya)
npx playwright test --headed

# Generate report
npx playwright show-report
```

### Playwright in CI

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    timeout-minutes: 60
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci
      - run: npx playwright install --with-deps

      - name: Start dev server
        run: npm run dev &
        # Tunggu server siap
      - run: npx wait-on http://localhost:3000

      - name: Run E2E tests
        run: npx playwright test

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

## E2E Testing dengan Cypress

Alternatif populer selain Playwright:

### Setup Cypress

```bash
npm install -D cypress
npx cypress open  # pertama kali
```

### Cypress Test

```typescript
// cypress/e2e/todo.cy.ts
describe('Todo App', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('menampilkan daftar todo', () => {
    cy.contains('Belajar Cypress').should('be.visible');
  });

  it('tambah todo baru', () => {
    cy.get('[data-testid="todo-input"]').type('Todo Cypress test');
    cy.get('[data-testid="add-button"]').click();
    cy.contains('Todo Cypress test').should('be.visible');
  });

  it('API intercept mock', () => {
    cy.intercept('GET', '/api/todos', {
      fixture: 'todos.json',
    }).as('getTodos');

    cy.visit('http://localhost:3000');
    cy.wait('@getTodos');
    cy.contains('Mock Todo').should('be.visible');
  });
});
```

### Cypress vs Playwright: Kapan Pake?

| Kondisi | Pilih |
|---------|-------|
| Tim suka DX simpel, all-in-one | Cypress |
| Butuh cross-browser (Safari, Firefox) | Playwright |
| Test kompleks dengan network mock | Playwright (route API lebih powerfull) |
| Udah punya suite Cypress | Stay — migrasi mahal |
| CI parallel execution | Playwright (default parallel) |
| Mobile testing | Playwright (emulasi lebih baik) |

## Visual Regression Testing

Visual regression = deteksi perubahan visual yang gak sengaja. Bandingkan screenshot sebelum dan sesudah.

### Playwright Visual Comparison

```typescript
import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('homepage matches snapshot', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.01, // toleransi 1%
    });
  });

  test('todo list matches snapshot', async ({ page }) => {
    await page.goto('/todos');
    // Tunggu data loading selesai
    await page.waitForSelector('[data-testid="todo-list"]');
    await expect(page).toHaveScreenshot('todo-list.png');
  });

  test('form consistent across viewports', async ({ page }) => {
    // Test di multiple viewports
    const viewports = [
      { width: 375, height: 667 },  // mobile
      { width: 768, height: 1024 }, // tablet
      { width: 1280, height: 720 }, // desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/add-todo');
      await expect(page).toHaveScreenshot(
        `add-todo-${viewport.width}.png`
      );
    }
  });
});
```

### Update Visual Snapshots

```bash
# Update semua snapshot
npx playwright test --update-snapshots

# Atau update spesifik
npx playwright test e2e/visual.spec.ts --update-snapshots
```

### Percy — Visual Regression Cloud

```bash
npm install -D @percy/cli @percy/playwright
```

```typescript
import { percySnapshot } from '@percy/playwright';

test('homepage visual test', async ({ page }) => {
  await page.goto('/');
  await percySnapshot(page, 'Homepage');
});
```

```bash
PERCY_TOKEN=your_token npx percy exec -- npx playwright test
```

### Chromatic — Visual Regression untuk Storybook

```bash
npm install -D chromatic
npx chromatic --project-token=<token>
```

Otomatis bandingkan tiap story di Storybook antara baseline dan commit baru.

### Snapshot Thresholds

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,      // maks 100 pixel beda
      maxDiffPixelRatio: 0.02, // atau 2% dari total pixel
      threshold: 0.2,          // CSS color threshold
    },
  },
});
```

### Kapan Pake Visual Regression?

| ✅ Kondisi Cocok | ❌ Kondisi Gak Cocok |
|-----------------|-------------------|
| UI component library | Halaman dengan animasi berat |
| Landing page / marketing site | Halaman dengan data dinamis (tiap kali beda) |
| Form dengan layout kompleks | Halaman yang sering A/B testing |
| Dashboard dengan chart | Halaman dengan third-party widget (ads, embed) |
| Responsive design check | Test functional logic (tambah item, login) |

## Cypress in CI

```yaml
# .github/workflows/cypress.yml
name: Cypress Tests

on: [push]

jobs:
  cypress:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm ci

      # Start server + run Cypress
      - name: Cypress run
        uses: cypress-io/github-action@v6
        with:
          build: npm run build
          start: npm run dev
          wait-on: 'http://localhost:3000'
          browser: chrome

      - name: Upload screenshots
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: cypress-screenshots
          path: cypress/screenshots
```

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

5. **Deploy pipeline** — Bikin workflow deploy ke Vercel atau Railway yang trigger pas push ke main. Tambah environment variable `NODE_ENV=production`. Pastikan cuma trigger kalo test di CI sebelumnya lolos.

6. **Playwright E2E** — Setup Playwright di project. Bikin E2E test untuk flow: register → login → create todo → verify todo appears → delete todo → verify todo gone. Jalanin dengan headed mode, record video.

7. **Cypress E2E** — Setup Cypress di project yang sama. Bikin E2E test untuk flow yang sama dengan nomor 6. Bandingkan DX antara Playwright dan Cypress. Tulis 3 perbedaan yang kamu rasakan.

8. **Visual Regression Test** — Bikin Playwright visual test untuk homepage. Screenshot full page. Simpan sebagai baseline. Ubah CSS (misal: warna tombol). Jalanin test lagi — harus fail. Update snapshot. Tulis langkah-langkah + hasil screenshot.

9. **Multi-Viewport Test** — Bikin E2E test yang jalan di 3 viewport: mobile (375px), tablet (768px), desktop (1280px). Verifikasi bahwa layout responsive (navbar collapse, grid berubah). Pake Playwright projects atau parameterized test.

10. **E2E CI Pipeline** — Bikin GitHub Actions workflow untuk Playwright E2E test. Include: install browser, start dev server, wait for ready, run test, upload report artifact. Push ke GitHub, pastikan workflow hijau.

---

## Coverage Thresholds — Enforcement

Coverage thresholds = batas minimal coverage. Kalo dibawah threshold, CI fail.

### vitest — Threshold Config

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'json-summary'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'src/types/**'],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
        perFile: true, // setiap file harus达标
      },
    },
  },
});
```

| Threshold | Arti | Target Ideal |
|-----------|------|-------------|
| `statements` | Semua pernyataan kode | 80%+ |
| `branches` | Cabang if/else/switch | 75%+ |
| `functions` | Fungsi yang terpanggil | 80%+ |
| `lines` | Baris kode yang dieksekusi | 80%+ |
| `perFile` | Tiap file harus达标 | true untuk proyek kecil |

### GitHub Actions — Gate dengan Coverage

```yaml
- name: Run tests with coverage
  run: npm test -- --coverage

- name: Check coverage threshold
  run: |
    npx istanbul check-coverage \
      --statements 80 \
      --branches 75 \
      --functions 80 \
      --lines 80 \
      ./coverage/coverage-final.json

- name: Upload coverage
  uses: codecov/codecov-action@v4
  if: always()
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
    files: ./coverage/lcov.info
    fail_ci_if_error: true
```

### Coverage Report di PR

Codecov dan Coveralls otomatis komen di PR dengan diff coverage:

```
## Coverage Report
- Lines: 82.5% (+2.1% vs main)
- Branches: 78.3% (+1.5% vs main)
- Functions: 85.0% (+0.5% vs main)
- Files changed: 3
  - src/services/user.ts: 90.0%
  - src/controllers/auth.ts: 76.2% ← perhatikan yang rendah
```

### Strategi Coverage

| Level | Target | Notes |
|-------|--------|-------|
| Critical (auth, payment) | 95%+ | Logic sensitif, wajib coverage tinggi |
| Core business logic | 85%+ | Service layer, use cases |
| Controllers / Routes | 70%+ | Integration test lebih cocok |
| UI Components | 60%+ | Snapshot + integration lebih penting |
| Config / Types | 0% | Gak perlu test |

## CI Integration — Full Production Pipeline

### Pipeline Lengkap dengan Quality Gates

```yaml
name: Production CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: 20

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck

  unit-test:
    needs: lint
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/lcov.info
          flags: unit

  integration-test:
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run test:integration

  e2e-test:
    needs: [unit-test, integration-test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - name: Start dev server
        run: npm run dev &
      - run: npx wait-on http://localhost:3000
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

  build:
    needs: [lint, unit-test, integration-test, e2e-test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run build

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy
        run: echo "Deploy logic here"
```

**Alur Pipeline:**

```
Commit/Push → Lint+Typecheck
    ↓
Unit Test (18/20/22)   Integration Test
    ↓                          ↓
    └──── E2E Test ────┘
              ↓
           Build
              ↓
         Deploy (main only)
```

### Conditional Workflow — Skip Test Kalo Cuma Dokumentasi

```yaml
on:
  push:
    paths-ignore:
      - 'docs/**'
      - '*.md'
      - '.github/**'
    branches: [main]
```

Ini prevent workflow jalan kalo perubahan cuma README/docs — hemat action minutes.

### Workflow Status Badge

```markdown
![CI](https://github.com/<user>/<repo>/actions/workflows/ci.yml/badge.svg?branch=main)
![Coverage](https://codecov.io/gh/<user>/<repo>/branch/main/graph/badge.svg)
![E2E](https://img.shields.io/endpoint?url=https://api.playwright.dev/slack/test-report?project=myapp)
```

## Caching Strategi untuk CI Cepat

| Cache Target | Key | TTL |
|-------------|-----|-----|
| `node_modules` | Lockfile hash | ~7 hari |
| `.turbo`/`.nx` | Commit hash | Per commit |
| Playwright browsers | Lockfile version | ~30 hari |
| Docker layers | Dockerfile hash | Per image |

```yaml
- name: Cache Playwright browsers
  uses: actions/cache@v4
  id: playwright-cache
  with:
    path: ~/.cache/ms-playwright
    key: ${{ runner.os }}-playwright-${{ hashFiles('package-lock.json') }}

- name: Install Playwright (if cache miss)
  if: steps.playwright-cache.outputs.cache-hit != 'true'
  run: npx playwright install --with-deps
```

## Parallel Test Execution di CI

### Vitest — Sharding

Pecah test runner jadi beberapa job:

```yaml
strategy:
  matrix:
    shard: [1, 2, 3, 4]

steps:
  - run: npx vitest run --shard=${{ matrix.shard }}/4
```

Setiap shard jalanin subset test yang berbeda. Total waktu turun dari 20 menit jadi 5-6 menit.

### Playwright — Sharding

```yaml
strategy:
  matrix:
    shard-index: [1, 2, 3, 4]

steps:
  - run: npx playwright test --shard=${{ matrix.shard-index }}/4
```

### Merge Report

```yaml
- name: Merge reports
  if: always()
  uses: actions/upload-artifact/merge@v4
  with:
    name: all-playwright-reports
    pattern: playwright-report-*
```

## Fail-Fast vs Continue-On-Error

```yaml
jobs:
  test:
    strategy:
      fail-fast: false  # matrix: kalo 1 fail, yang lain tetap jalan
      matrix:
        node-version: [18, 20]
```

`fail-fast: true` (default) — kalo 1 versi fail, cancel semua job lain. `false` — biarin semua selesai, baru liat hasil.

## Concurrency Control — Batasi Workflow Duplikat

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

Kalo push 2x cepat, workflow yang lama di-cancel. Hemat action minutes.|