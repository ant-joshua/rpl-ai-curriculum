# Sesi 3: AI Security & Quality Gates

**Durasi: 3 jam**

## Tujuan

Setelah sesi ini, peserta mampu:
- Melakukan AI-assisted security audit (OWASP Top 10, dependency check, SAST)
- Mengkonfigurasi quality gates pipeline (lint → type-check → test → coverage → security → build)
- Menerapkan automated gating — PR diblokir jika kualitas di bawah threshold
- Menjalankan secret detection otomatis

---

## 1. AI Security Audit

### 1.1 Arsitektur Security Pipeline

```
[Push/PR] → [SAST Scan] → [Dependency Check] → [Secret Detection] → [DAST] → [Report]
     ↑              ↑               ↑                    ↑              ↑
   ESLint         Snyk/          TruffleHog/          OWASP ZAP     AI Audit
  TypeScript    Trivy/          Gitleaks                           Summary
  (AST-based)  Dependabot
```

### 1.2 OWASP Top 10 Scanning dengan AI

**Prompt AI untuk security audit:**

```
You are a security engineer. Perform an OWASP Top 10 (2021) audit on this code.
For each vulnerability found, provide:
1. OWASP category (A01-A10)
2. Location (file:line)
3. Risk level (Critical/High/Medium/Low)
4. Remediation code
5. CWE reference if applicable

Code:
[PASTE CODE]
```

**Contoh Output AI Audit:**

| OWASP | Vulnerability | Location | Risk |
|-------|--------------|----------|------|
| A01 — Broken Access Control | No auth check on `/admin/*` | `routes/admin.js:12` | Critical |
| A03 — Injection | SQL query concatenation | `db/users.js:45` | Critical |
| A05 — Security Misconfiguration | CORS `*` in production | `app.js:8` | High |
| A06 — Vulnerable Components | Express v4.16.0 (known RCE) | `package.json` | High |
| A09 — Logging Failures | Passwords logged in plaintext | `auth.js:23` | Medium |

### 1.3 SAST (Static Application Security Testing)

```yaml
# .github/workflows/security-scan.yml
name: Security Scan
on: [pull_request]

jobs:
  sast:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: CodeQL Analysis
        uses: github/codeql-action/analyze@v3
        with:
          languages: javascript, typescript
          queries: security-extended, security-and-quality

      - name: ESLint Security Plugin
        run: |
          npx eslint . --config .eslintrc-security.js
          # .eslintrc-security.js extends 'plugin:security/recommended'

      - name: AI Security Review
        uses: openai/code-review-action@v1
        with:
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          review-areas: security
          severity-threshold: high
```

### 1.4 Dependency Check

```yaml
- name: Snyk Dependency Scan
  uses: snyk/actions/node@master
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
  with:
    args: --severity-threshold=high

- name: Trivy Filesystem Scan
  uses: aquasecurity/trivy-action@master
  with:
    scan-type: fs
    scan-ref: .
    format: sarif
    output: trivy-results.sarif
    exit-code: 1
    severity: HIGH,CRITICAL

- name: Dependabot Alerts (GitHub-native)
  # Enabled via repository Settings → Security → Dependabot
  # Automatically creates PRs for vulnerable deps
```

---

## 2. Quality Gates Pipeline

### 2.1 Pipeline Stage Definition

```
┌────────┐   ┌──────────┐   ┌──────┐   ┌──────────┐   ┌────────┐   ┌───────┐
│  Lint  →│   │Type-Check│ → │ Test │ → │ Coverage │ → │Security│ → │ Build │
│        │   │          │   │      │   │          │   │        │   │       │
│ ESLint │   │ tsc      │   │vitest│   │ >80%     │   │ Trivy  │   │ build │
│ >0 err │   │ >0 error │   │pass  │   │ lines    │   │ 0 crit │   │ pass  │
└────────┘   └──────────┘   └──────┘   └──────────┘   └────────┘   └───────┘
     │             │            │            │             │           │
     └─────────────┴────────────┴────────────┴─────────────┴───────────┘
                                      │
                                ⚠️ ALL GATES PASS?
                                      │
                            ┌─────────┴─────────┐
                            │ YES               │ NO
                            ▼                    ▼
                     Auto-approve PR     Block + Comment
                     Ready to merge     "Quality gate failed"
```

### 2.2 Quality Gate Configuration

```yaml
# .github/workflows/quality-gates.yml
name: Quality Gates
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Lint
        id: lint
        run: |
          npm run lint
        continue-on-error: true

      - name: TypeScript Check
        id: typecheck
        run: |
          npx tsc --noEmit
        continue-on-error: true

      - name: Test
        id: test
        run: |
          npm run test -- --coverage
        continue-on-error: true

      - name: Coverage
        id: coverage
        run: |
          npx istanbul check-coverage --statements 80 --branches 70 --functions 80 --lines 80
        continue-on-error: true

      - name: Security Scan
        id: security
        run: |
          npx trivy fs . --exit-code 1 --severity CRITICAL,HIGH
        continue-on-error: true

      - name: Build
        id: build
        run: |
          npm run build
        continue-on-error: true

      - name: Gate Check
        if: always()
        run: |
          FAILED=""
          ${{ steps.lint.outcome == 'failure' && 'FAILED+="❌ Lint "' }}
          ${{ steps.typecheck.outcome == 'failure' && 'FAILED+="❌ TypeScript "' }}
          ${{ steps.test.outcome == 'failure' && 'FAILED+="❌ Test "' }}
          ${{ steps.coverage.outcome == 'failure' && 'FAILED+="❌ Coverage "' }}
          ${{ steps.security.outcome == 'failure' && 'FAILED+="❌ Security "' }}
          ${{ steps.build.outcome == 'failure' && 'FAILED+="❌ Build "' }}
          
          if [ -n "$FAILED" ]; then
            echo "## ⛔ Quality Gates Failed" >> $GITHUB_STEP_SUMMARY
            echo "$FAILED" >> $GITHUB_STEP_SUMMARY
            exit 1
          else
            echo "## ✅ All Quality Gates Passed" >> $GITHUB_STEP_SUMMARY
          fi
```

### 2.3 Threshold Matrix

| Gate | Threshold | Action on Fail |
|------|-----------|----------------|
| Lint | Zero errors, warnings < threshold | PR labelled `blocked:lint` |
| TypeScript | Zero `tsc --noEmit` errors | PR labelled `blocked:types` |
| Unit Test | All passing | PR labelled `blocked:tests` |
| Coverage | Lines ≥80%, Branches ≥70% | PR labelled `blocked:coverage` |
| Security | Zero CRITICAL/HIGH vulnerabilities | PR labelled `blocked:security` |
| Build | Zero build errors | PR labelled `blocked:build` |

---

## 3. Automated Gating

### 3.1 PR Blocked if Below Threshold

```yaml
name: PR Gate
on:
  pull_request:
    types: [opened, synchronize, labeled, unlabeled]

jobs:
  check-gates:
    runs-on: ubuntu-latest
    outputs:
      status: ${{ steps.gate.outputs.status }}
    steps:
      - id: gate
        run: |
          # Check all gate statuses from previous workflow
          if [ "${{ needs.quality.result }}" == "success" ]; then
            echo "status=passed" >> $GITHUB_OUTPUT
          else
            echo "status=blocked" >> $GITHUB_OUTPUT
          fi

  block-pr:
    needs: check-gates
    if: needs.check-gates.outputs.status == 'blocked'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: `## ⛔ Quality Gate Blocked\n\nThis PR cannot be merged until all quality gates pass.\n\n| Gate | Status |\n|------|--------|\n| Lint | ❌ |\n| Types | ✅ |\n| Tests | ❌ |\n| Coverage | ✅ |\n| Security | ✅ |\n| Build | ✅ |\n\nFix the failing gates and push again.`
            });
```

### 3.2 Branch Protection Rule

Set branch protection rules yang membutuhkan status check:

```
Settings → Branches → Add rule:
  - Require status checks to pass before merging
  - Require branches to be up-to-date
  - Status checks: "Quality Gates / quality" must pass
  - Include administrators
```

---

## 4. Secret Detection

### 4.1 AI Scan untuk Hardcoded Secrets

**Prompt AI:**

```
Scan this repository for hardcoded secrets:
- API keys (sk-..., AKIA..., etc.)
- Database URLs with credentials
- Private keys (-----BEGIN...)
- OAuth tokens
- Passwords
- .env files committed

Report each finding with:
- File path and line
- Secret type
- Risk level
- Remediation: use GitHub Secrets / Doppler / Vault
```

### 4.2 Automated Secret Detection Pipeline

```yaml
# .github/workflows/secret-detection.yml
name: Secret Detection
on: [push, pull_request]

jobs:
  secrets:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: TruffleHog
        run: |
          trufflehog filesystem --directory=. --json | tee trufflehog-results.json
          if [ -s trufflehog-results.json ]; then
            echo "❌ Secrets detected!" >> $GITHUB_STEP_SUMMARY
            jq -r '. | "\(.SourceMetadata.Data.Filesystem.file):\(.SourceMetadata.Data.Filesystem.line) — \(.DetectorName)"' trufflehog-results.json
            exit 1
          fi

      - name: Check for .env committed
        run: |
          if git ls-files | grep -q '\.env$'; then
            echo "❌ .env file committed to repo!" >> $GITHUB_STEP_SUMMARY
            exit 1
          fi

      - name: AI Secret Review
        run: |
          cline review --target secrets --json > ai-secret-report.json
```

### 4.3 Secret Detection Ruleset

```json
{
  "rules": [
    { "pattern": "sk-[a-zA-Z0-9]{20,}", "type": "OpenAI API Key", "severity": "critical" },
    { "pattern": "AKIA[0-9A-Z]{16}", "type": "AWS Access Key", "severity": "critical" },
    { "pattern": "-----BEGIN (RSA|EC|OPENSSH) PRIVATE KEY-----", "type": "Private Key", "severity": "critical" },
    { "pattern": "password\\s*[=:]\\s*['\"][^'\"]+['\"]", "type": "Password", "severity": "high" },
    { "pattern": "ghp_[a-zA-Z0-9]{36}", "type": "GitHub Token", "severity": "critical" },
    { "pattern": "postgres://\\w+:\\w+@", "type": "DB URL with Credentials", "severity": "critical" }
  ]
}
```

---

## 5. AI Security Remediation

### 5.1 Auto-Fix Security Issues

**Prompt:**

```
Generate a fix for this security vulnerability:

Vulnerability: SQL Injection in login endpoint
File: src/routes/auth.js:15-22
Code:
  const query = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;

Requirements:
1. Use parameterized query
2. Hash password comparison (bcrypt)
3. Rate limiting on failed attempts
4. Return generic error (don't reveal which field is wrong)

Output: Full fixed code with explanation.
```

### 5.2 AI Remediation Workflow

```yaml
- name: AI Security Fix
  if: steps.security.outcome == 'failure'
  run: |
    # AI generates fixes for detected issues
    cline fix --from trivy-results.sarif --output .ai-fixes/
    git apply .ai-fixes/*.patch
    git commit -m "fix: AI security remediation"
    git push
```

---

## 6. Latihan: Setup Quality Gates Pipeline

### Tugas

1. Buat GitHub Actions workflow `quality-gates.yml`
2. Konfigurasi 6 stage: lint → type-check → test → coverage → security → build
3. Set threshold: coverage ≥80%, security zero critical, lint zero errors
4. Tambahkan **secret detection** dengan Gitleaks atau TruffleHog
5. Buat **branch protection rule** yang require status check
6. Buat PR dengan kode yang mengandung:
   - Hardcoded API key
   - SQL injection
   - Coverage di bawah threshold
   - Linting error

### Kriteria Sukses

- [ ] PR otomatis diblokir saat quality gate gagal
- [ ] Secret terdeteksi dan menampilkan warning
- [ ] Coveragedi bawah 80% menyebabkan gate fail
- [ ] Linting error muncul di PR comment
- [ ] Security vulnerability (SQLi) terdeteksi
- [ ] Setelah semua gate pass, PR bisa di-merge

### Starter Template

```yaml
# Starter quality-gates.yml — isi threshold yang sesuai
name: Quality Gates
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup
        run: npm ci

      - name: Lint
        run: npm run lint
        continue-on-error: true

      - name: Test with Coverage
        run: npm run test -- --coverage

      - name: Security Scan
        run: npx trivy fs . --severity CRITICAL,HIGH
        continue-on-error: true

      - name: Secret Detection
        run: npx gitleaks detect --source . --verbose

      - name: Build
        run: npm run build
        continue-on-error: true

      - name: Gate Verdict
        if: always()
        run: |
          # TODO: implement gate logic
          echo "Gate status: pending implementation"
```

### Checklist Audit

| Item | Status |
|------|--------|
| OWASP Top 10 scan berjalan | ☐ |
| SAST (CodeQL/ESLint security) aktif | ☐ |
| Dependency check (Snyk/Trivy) aktif | ☐ |
| Secret detection aktif | ☐ |
| Branch protection rule terkonfigurasi | ☐ |
| PR otomatis blocked saat gate fail | ☐ |
| AI security report di PR comment | ☐ |

---

## Referensi

- [OWASP Top 10 (2021)](https://owasp.org/www-project-top-ten/)
- [GitHub CodeQL](https://codeql.github.com/)
- [Gitleaks](https://github.com/gitleaks/gitleaks)
- [TruffleHog](https://github.com/trufflesecurity/trufflehog)
- [Snyk Documentation](https://docs.snyk.io/)
- [Trivy](https://github.com/aquasecurity/trivy)
- [GitHub Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)
