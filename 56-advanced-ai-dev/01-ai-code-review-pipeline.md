# Sesi 1: AI Code Review Pipeline

**Durasi: 3 jam**

## Tujuan

Setelah sesi ini, peserta mampu:
- Memahami arsitektur AI code review pipeline
- Mengkonfigurasi GitHub Actions + AI agent untuk review otomatis
- Menentukan area review, severity level, dan auto-fix commit
- Mengintegrasikan tools seperti Cline, Codacy, SonarCloud

---

## 1. Konsep AI Code Review

### 1.1 Apa Itu AI Code Review?

AI code review adalah proses dimana agent AI (Claude, GPT, Cline) secara otomatis mereview pull request berdasarkan aturan yang telah ditentukan. Review mencakup analisis kode, saran perbaikan, hingga auto-commit fix.

### 1.2 Trigger Pipeline

Pipeline dipicu oleh event `pull_request` atau `pull_request_target`:

```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened]
```

### 1.3 Area Review

| Area | Deskripsi | Contoh |
|------|-----------|--------|
| Code Style | Konsistensi format, naming convention, imports | `snake_case` vs `camelCase` |
| Logic Bugs | Race condition, off-by-one, null pointer | Loop boundary error |
| Security Vuln | Injection, XSS, hardcoded secret | SQLi risk in raw query |
| Performance | N+1 query, memory leak, unnecessary re-render | Missing index |
| Test Coverage | Missing test, low assertion quality | Function without tests |
| API Design | RESTful compliance, breaking changes, versioning | Missing validation |

### 1.4 Severity Level

```
CRITICAL  — blocking, must fix before merge
MAJOR     — should fix, high impact
MINOR     — nice to fix, low impact
SUGGESTION — informational, optional
```

---

## 2. Pipeline Arsitektur

```
[PR Created] → [Checkout Code] → [AI Review Agent] → [Post Comment] → [Auto-fix Branch] → [Approve/Request Changes]
```

### 2.1 Workflow GitHub Actions

```yaml
# .github/workflows/ai-code-review.yml
name: AI Code Review
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: AI Review via OpenAI
        uses: openai/code-review-action@v1
        with:
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
          model: gpt-4o
          review-areas: style,security,performance,api-design
          severity-threshold: major
          auto-fix: false

      - name: Run Static Analysis
        uses: codacy/codacy-analysis-cli-action@v4

      - name: Run Linter
        run: |
          npm run lint
          npm run format:check
```

### 2.2 Integration dengan Cline (Terminal AI Agent)

Cline bisa dijalankan dalam pipeline untuk review mendalam:

```yaml
- name: Cline Review
  run: |
    cline review \
      --diff origin/main...HEAD \
      --format markdown \
      --output review.md
    cat review.md >> $GITHUB_STEP_SUMMARY
```

### 2.3 Integration dengan SonarCloud

```yaml
- name: SonarCloud Scan
  uses: SonarSource/sonarcloud-github-action@v2
  env:
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

---

## 3. Prompt AI untuk Code Review

### 3.1 System Prompt

```
You are a senior code reviewer. Analyze the diff below and provide feedback.
Focus on: code style, logic bugs, security vulnerabilities, performance issues,
test coverage gaps, and API design violations.

Use this format for each finding:

[SEVERITY: critical|major|minor|suggestion]
**File**: `path/to/file.ts`
**Line**: L12-L18
**Issue**: Description
**Suggestion**: How to fix
**Code**:
```suggestion
// fixed code here
```

Sort findings by severity (critical first).
If auto-fix enabled, include a git commit message suggestion.
```

### 3.2 Review Comment Format

Setiap finding dikirim sebagai PR comment:

```
## 🔍 AI Code Review

### Critical (2)
- [ ] **L12-L18** — SQL injection risk in `userQuery`
- [ ] **L45** — Hardcoded API key detected

### Major (3)
- [ ] **L67-L72** — N+1 query in user list endpoint
- [ ] **L89** — Missing input validation

### Minor (1)
- [ ] **L102** — Unused import `lodash`

### Suggestion (4)
- [ ] **L120** — Consider using optional chaining
```

---

## 4. Auto-Fix

### 4.1 Suggested Fix Commit

AI dapat membuat commit fix langsung ke branch PR:

```yaml
- name: Apply AI Fixes
  if: github.event_name == 'pull_request'
  run: |
    git config user.name "ai-bot"
    git config user.email "ai-bot@example.com"
    # Apply patch files from AI review
    for patch in .ai-review/fixes/*.patch; do
      git apply "$patch"
    done
    git add -A
    git commit -m "fix: AI auto-fix applied"
    git push
```

### 4.2 Conditional Auto-Approval

```yaml
- name: Auto Approve if Critical Issues Zero
  if: steps.review.outputs.critical_count == '0'
  uses: hmarr/auto-approve-action@v4
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

---

## 5. Review Areas Detail

### 5.1 Code Style Check

```javascript
// ❌ Bad
const x = function(y){return y+1}
// ✅ Good
const increment = (num: number): number => num + 1;
```

### 5.2 Logic Bug Detection

```javascript
// ❌ Off-by-one — loop skips last element
for (let i = 0; i < arr.length - 1; i++) { ... }
// ✅ Fix
for (let i = 0; i < arr.length; i++) { ... }
```

### 5.3 Security Vulnerability

```javascript
// ❌ SQL Injection
const query = `SELECT * FROM users WHERE id = ${userId}`;
// ✅ Parameterized query
const query = 'SELECT * FROM users WHERE id = ?';
db.execute(query, [userId]);
```

### 5.4 Performance Anti-pattern

```javascript
// ❌ N+1 — query per item
const items = await Item.findAll();
for (const item of items) {
  const user = await User.findByPk(item.userId);
}
// ✅ Eager loading
const items = await Item.findAll({ include: [User] });
```

### 5.5 API Design Violation

```javascript
// ❌ Breaking change — removing field
app.put('/api/v1/users/:id', (req, res) => {
  delete req.body.username; // breaks clients
});
// ✅ Deprecate first, remove later
```

---

## 6. Tools & Integrasi

### 6.1 Codacy

```yaml
- name: Codacy Analysis
  uses: codacy/codacy-analysis-cli-action@v4
  with:
    project-token: ${{ secrets.CODACY_PROJECT_TOKEN }}
    max-allowed-issues: 50
```

### 6.2 SonarCloud

```yaml
- name: SonarCloud
  uses: SonarSource/sonarcloud-github-action@v2
  with:
    args: >
      -Dsonar.qualitygate.wait=true
      -Dsonar.qualitygate.timeout=300
```

### 6.3 ESLint + Prettier

```yaml
- name: Lint & Format Check
  run: |
    npx eslint . --max-warnings=0
    npx prettier --check .
```

### 6.4 Trivy (Security Scan)

```yaml
- name: Trivy Scan
  uses: aquasecurity/trivy-action@master
  with:
    scan-type: fs
    scan-ref: .
    severity: HIGH,CRITICAL
    exit-code: 1
```

---

## 7. Latihan: Setup AI Code Review Pipeline

### Tugas

1. Buat repository GitHub dengan project Node.js sederhana (Express API)
2. Setup **AI Code Review** workflow menggunakan OpenAI/Claude
3. Konfigurasi **area review**: security, performance, API design
4. Integrasikan **SonarCloud** untuk code quality scan
5. Tambahkan **auto-fix commit** untuk issue severity minor
6. Buat PR dengan kode yang sengaja mengandung bug untuk di-review

### Kriteria Sukses

- [ ] Workflow `.github/workflows/ai-code-review.yml` berfungsi
- [ ] AI memberikan komentar review di setiap PR
- [ ] Auto-fix berhasil membuat commit perbaikan
- [ ] SonarCloud melaporkan quality gate
- [ ] Setidaknya 1 issue critical, 2 major, 3 minor terdeteksi

### Starter Template

```javascript
// src/server.js — sengaja mengandung bug
const express = require('express');
const app = express();

// Security: SQL Injection
app.get('/user/:id', (req, res) => {
  const query = `SELECT * FROM users WHERE id = ${req.params.id}`;
  db.query(query, (err, result) => {
    res.json(result);
  });
});

// Performance: N+1
app.get('/orders', async (req, res) => {
  const users = await User.findAll();
  const orders = [];
  for (const user of users) {
    const userOrders = await Order.findAll({ where: { userId: user.id } });
    orders.push(...userOrders);
  }
  res.json(orders);
});

// API Design: No validation
app.post('/user', (req, res) => {
  User.create(req.body); // no sanitization
  res.status(201).send('OK');
});

app.listen(3000);
```

### Checklist Review

| Item | Sudah |
|------|-------|
| Workflow terdeteksi AI review | ☐ |
| Komentar review muncul di PR | ☐ |
| Issue severity terklasifikasi | ☐ |
| Auto-fix commit terbuat | ☐ |
| SonarCloud quality gate aktif | ☐ |
| Semua bug terdeteksi | ☐ |

---

## Referensi

- [OpenAI Code Review Action](https://github.com/openai/code-review-action)
- [GitHub Actions — Events that trigger workflows](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows)
- [Codacy CLI](https://github.com/codacy/codacy-analysis-cli)
- [SonarCloud Quality Gates](https://docs.sonarsource.com/sonarcloud/enriching/quality-gates/)
- [Cline Documentation](https://github.com/cline/cline)
