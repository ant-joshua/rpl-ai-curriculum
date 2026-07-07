---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — <img src="https://images.pexels.com/photos/5380664/pexels-ph"
footer: "Sesi 04: Devsecops"
---

<!-- _class: title -->
# Sesi 4: DevSecOps — Dependency & CI/CD Security

> **Durasi:** 2 jam
> **Tujuan:** Setup dependency scanning, secrets management, Docker security, CI/CD security pipeline

---

## Dependency Scanning

**Masalah:** 90% kode aplikasi modern berasal dari package pihak ketiga (npm). Setiap package bisa punya CVE (Common Vulnerabilities and Exposures).

### npm audit

Tool bawaan npm buat scan dependency known vulnerabilities:

```bash

---

# Audit dependency
npm audit


---

# Contoh output:

---

# ┌───────────────┬──────────────────────────────────────────────┐

---

# │ critical      │ Prototype Pollution in lodash                │

---

# │ high          │ Regular Expression DoS in validator          │

---

# │ moderate      │ Path Traversal in express                    │

---

# └───────────────┴──────────────────────────────────────────────┘
#


---

# Audit + fix otomatis (patch minor)
npm audit fix


---

# Audit + breaking changes (hati-hati)
npm audit fix --force


---

# Lihat audit JSON (buat reporting)
npm audit --json > audit-report.json
```

### Membuat Script Audit

```json
// package.json
{
  "scripts": {
    "audit": "npm audit --audit-level=high",
    "audit:fix": "npm audit fix --audit-level=moderate",
    "audit:ci": "npm audit --audit-level=high --registry=https://registry.npmjs.org"
  }
}
```

### CI/CD Failure on High Vulnerabilities

```yaml

---

# .github/workflows/audit.yml
name: Dependency Audit

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 6 * * 1' # every Monday 6 AM

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci
      - run: npm audit --audit-level=high
        # ❌ Pipeline FAIL kalo ada critical/high vuln
```

### Snyk — Advanced Scanning

Snyk lebih advanced dari npm audit — detect **licensing issues**, **code-level vulns**, dan **container vulns**.

```bash

---

# Install Snyk CLI
npm install -g snyk


---

# Login (butuh akun — free tier cukup)
snyk auth


---

# Test dependency vulnerabilities
snyk test


---

# Test dengan threshold
snyk test --severity-threshold=high


---

# Continuous monitoring
snyk monitor


---

# Ignore specific vuln (dengan alasan)
snyk ignore --id=SNYK-JS-LODASH-590103 --expiry=2025-12-31 --reason='No fix available yet'
```

### Snyk di GitHub Actions

```yaml

---

# .github/workflows/snyk.yml
name: Snyk Security Scan

on: [push, pull_request]

jobs:
  snyk:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
```

### Dependabot — Auto PR for Vulnerable Deps

GitHub built-in — otomatis bikin PR kalo ada dependency vulnerable.

```yaml

---

# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: 'npm'
    directory: '/'
    schedule:
      interval: 'weekly'
      day: 'monday'
    open-pull-requests-limit: 10
    labels:
      - 'dependencies'
      - 'security'
    reviewers:
      - 'team-lead'
    # Only bump package.json (not lockfile)
    versioning-strategy: increase
```

---

## Secrets Management

### .env — Jangan Commit ke Git

```bash

---

# ❌ SALAH — jangan pernah!
git add .env
git commit -m "add config"
git push  # 🚨 SECRET LEAKED!


---

# ✅ BENAR

---

# 1. Pastiin .env ada di .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore


---

# 2. Buat .env.example sebagai template

---

# .env.example (boleh di-commit)
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password_here
JWT_SECRET=your_jwt_secret_here


---

# 3. Kalo udah terlanjur commit — ganti semua secret!

---

# Hapus dari git history (rewrite — hati-hati!)
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env' \
  --prune-empty --tag-name-filter cat -- --all
```

### Best Practices .env

```bash

---

# .env
NODE_ENV=production
PORT=3000


---

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myapp_prod
DB_USER=myapp
DB_PASS=s3cur3P@ssw0rd!


---

# Auth
JWT_SECRET=5f8a2b1c9d3e7f4a6b0c2d8e1f4a6b0c
JWT_REFRESH_SECRET=a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6
CSRF_SECRET=9f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c


---

# External Services
REDIS_URL=redis://:password@localhost:6379
SENDGRID_API_KEY=SG.xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx


---

# Frontend
FRONTEND_URL=https://app.kamu.com
```

### Production Secrets — Jangan Pake .env!

```typescript
// ✅ AMAN — pake environment variable dari platform
const config = {
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    name: process.env.DB_NAME,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
  },
};

// Validasi config di startup
function validateConfig() {
  const required = [
    'DB_HOST', 'DB_USER', 'DB_PASS', 'JWT_SECRET', 'FRONTEND_URL',
  ];

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required env: ${key}`);
    }
  }
}

validateConfig();
```

### Vault — Enterprise Secrets Management

Buat tim besar / perusahaan — pake HashiCorp Vault:

```typescript
// Di kode — jangan pake Vault di SMK, cukup tau konsepnya
// Vault = centralized secrets storage, akses via API/token
// Keuntungan:
//  - Secrets dienkripsi at-rest
//  - Audit log siapa akses apa
//  - Auto-rotate secrets
//  - Dynamic secrets (DB credentials auto-generated)

import vault from 'node-vault';

const client = vault({
  apiVersion: 'v1',
  endpoint: 'https://vault.kamu.com',
  token: process.env.VAULT_TOKEN,
});

const { data } = await client.read('secret/data/db');
const dbPassword = data.data.data.password;
```

---

## Docker Security

### Dockerfile Aman

```dockerfile

---

# ❌ RENTAN — jangan pake base image besar + root user
FROM node:20
COPY . /app
RUN npm install
CMD ["node", "dist/index.js"]
USER root  # ❌ Hacker dapet root akses!


---

# ✅ AMAN — multi-stage build + non-root user

---

# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build


---

# Stage 2: Production (minimal)
FROM node:20-alpine AS production
WORKDIR /app


---

# 1. Non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001


---

# 2. Cuma copy yang diperlukan
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./


---

# 3. Non-root
USER nodejs


---

# 4. Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/health.js || exit 1

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Docker Compose Aman

```yaml

---

# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    # Jangan expose port database!
    networks:
      - internal
    # Resource limits — cegah DDoS
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: '512M'
    # Root filesystem read-only
    read_only: true
    # Drop all capabilities
    cap_drop:
      - ALL
    # Jangan jalan sebagai root
    user: '1001:1001'

  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_PASSWORD_FILE=/run/secrets/db_password
    # Jangan expose port ke host!
    # ports: - '5432:5432' ❌
    expose:
      - '5432' # cuma container lain di network yang bisa akses
    secrets:
      - db_password
    networks:
      - internal
    volumes:
      - pgdata:/var/lib/postgresql/data

secrets:
  db_password:
    file: ./secrets/db_password.txt

volumes:
  pgdata:

networks:
  internal:
    driver: bridge
```

### Scan Docker Image for Vulns

```bash

---

# Trivy — open-source container scanner

---

# Install
sudo apt install trivy


---

# Scan image
trivy image myapp:latest


---

# Scan dengan threshold
trivy image --severity CRITICAL,HIGH myapp:latest


---

# Output JSON
trivy image --format json --output report.json myapp:latest


---

# Di CI

---

# - Fails pipeline kalo ada CRITICAL vuln
```

---

## CI/CD Security Scanning

### GitHub Actions — Complete Security Pipeline

```yaml

---

# .github/workflows/security.yml
name: Security Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # 1. Audit dependency
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm audit --audit-level=high
        continue-on-error: true # jangan block pipeline — cukup notifikasi

  # 2. Lint + SAST (Static Analysis)
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      # CodeQL — GitHub's SAST
      - uses: github/codeql-action/init@v3
        with:
          languages: javascript
      - uses: github/codeql-action/analyze@v3

  # 3. Secret leak detection
  secrets:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # full history
      - name: GitLeaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITLEAKS_LICENSE: ${{ secrets.GITLEAKS_LICENSE }}
        # Gagal kalo ada secret terdeteksi

  # 4. Docker scan (kalo pake container)
  docker-scan:
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
      - name: Build image
        run: docker build -t myapp:${{ github.sha }} .
      - name: Scan image
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'myapp:${{ github.sha }}'
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'CRITICAL,HIGH'
      - name: Upload results
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: 'trivy-results.sarif'
```

### Pre-commit Hook — Cegah Secret Leak

```bash

---

# .husky/pre-commit (pake husky)
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"


---

# Cek file yang di-stage
npx secretlint "**/*.env*"
npx lint-staged


---

# Atau pake git-secrets
git secrets --scan
```

### .gitignore Lengkap

```gitignore

---

# .gitignore

---

# === Environment ===
.env
.env.local
.env.*.local
.env.production


---

# === Dependencies ===
node_modules/


---

# === Build ===
dist/
build/
*.tsbuildinfo


---

# === Logs ===
*.log
npm-debug.log*
yarn-debug.log*
lerna-debug.log*


---

# === IDE ===
.vscode/
.idea/
*.swp
*.swo
.DS_Store


---

# === Testing ===
coverage/
.nyc_output/


---

# === Secrets (other formats) ===
*.key
*.pem
*.p12
*.pfx
secrets/
```

---

## Security Headers Checklist

### Complete Checklist

```typescript
// middleware/security-headers.ts
import { Request, Response, NextFunction } from 'express';

export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // 1. X-Content-Type-Options — cegah MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // 2. X-Frame-Options — cegah clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // 3. X-XSS-Protection — disable, pake CSP
  res.setHeader('X-XSS-Protection', '0');

  // 4. Strict-Transport-Security — paksa HTTPS
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );

  // 5. Content-Security-Policy — cegah XSS
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; object-src 'none'; frame-ancestors 'none'"
  );

  // 6. Referrer-Policy — kontrol info referer
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // 7. Permissions-Policy — batasi API browser
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );

  // 8. Cross-Origin-Opener-Policy — isolasi browsing context
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');

  // 9. Cross-Origin-Resource-Policy — batasi resource sharing
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

  // 10. Remove X-Powered-By — jangan kasih tau tech stack
  res.removeHeader('X-Powered-By');

  next();
}

// Di app.ts
app.use(securityHeaders);
```

### Verifikasi Security Headers

```bash

---

# Cek header HTTP
curl -I https://api.kamu.com


---

# Contoh response yang aman:

---

# HTTP/2 200

---

# content-type: application/json; charset=utf-8

---

# x-content-type-options: nosniff

---

# x-frame-options: DENY

---

# strict-transport-security: max-age=31536000; includeSubDomains; preload

---

# content-security-policy: default-src 'self'; script-src 'self'; ...

---

# referrer-policy: strict-origin-when-cross-origin

---

# permissions-policy: camera=(), microphone=(), geolocation=()

---

# cross-origin-opener-policy: same-origin

---

# cross-origin-resource-policy: same-origin

---

# 🔴 Kalo header di atas ada yang ilang — perlu diperbaiki!
```

### Online Security Header Checker

```bash

---

# Gunakan tools berikut buat audit:

---

# - https://securityheaders.com

---

# - https://sslabs.com/ssltest

---

# - https://observatory.mozilla.org
```

---

## Latihan

### Latihan 1: Setup npm Audit + Fix

```bash

---

# TODO: Kerjain di terminal

---

# 1. Bikin project Express baru: npm init -y

---

# 2. Install package lama yang vulnerable:

---

#    npm install express@4.16.0 lodash@4.17.15

---

# 3. Jalanin npm audit — catet jumlah vuln

---

# 4. Fix pake npm audit fix

---

# 5. Bandingin jumlah vuln sebelum & sesudah

---

# 6. Buat script audit di package.json
```

### Latihan 2: Bikin Dependabot Config

Buat file `.github/dependabot.yml` untuk project Express:

```yaml

---

# TODO: Lengkapi konfigurasi Dependabot
version: 2
updates:
  # 1. npm dependency — cek tiap minggu
  # 2. GitHub Actions — cek tiap bulan
  # 3. Docker — cek tiap minggu (kalo pake Docker)
  # 4. Max 5 open PRs
  # 5. Assign reviewer ke tim-lead
```

### Latihan 3: Bikin Dockerfile Aman

Dari Dockerfile yang RENTAN ini, bikin versi aman:

```dockerfile

---

# ❌ RENTAN
FROM node:20
COPY . /app
RUN npm install
CMD ["node", "index.js"]
```

**Tugas:** Buat Dockerfile aman dengan:
1. Multi-stage build
2. Alpine base image
3. Non-root user
4. Hanya copy file yang diperlukan
5. Health check
6. Resource limits (di compose)

### Latihan 4: CI/CD Security Pipeline

Bikin GitHub Actions workflow yang:

```yaml

---

# TODO: Lengkapi
name: Security Scan

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      # 1. Checkout code
      # 2. Setup Node 20
      # 3. npm ci
      # 4. npm audit — fail kalo ada high vuln
      # 5. Secret detection (gitleaks)
      # 6. SAST (CodeQL)
      # 7. Upload SARIF results
```

### Latihan 5: Security Headers Audit

```bash

---

# TODO: Deploy app sederhana, lalu:

---

# 1. Cek response headers pake curl -I

---

# 2. Bandingin sama checklist

---

# 3. Tulis laporan: header mana yang ada, mana yang ilang

---

# 4. Tambah header yang ilang pake middleware

---

# 5. Verifikasi lagi
```

---

## Ringkasan

| Area | Tool/Action |
|------|------------|
| **Dependency scanning** | npm audit, Snyk, Dependabot |
| **Secrets management** | .env + .gitignore, env vars, Vault |
| **Container security** | Non-root user, Alpine, read-only FS, Trivy scan |
| **CI/CD security** | GitHub Actions (audit + lint + secret scan + SAST) |
| **Security headers** | Helmet + manual headers, verify pake securityheaders.com |
| **Secret leak prevention** | pre-commit hooks, gitleaks, git-secrets |

> **Prinsip:** Security bukan satu kali setup — tapi **proses berkelanjutan**. Otomasi scanning di CI biar nggak ada celah yang kelewat.
