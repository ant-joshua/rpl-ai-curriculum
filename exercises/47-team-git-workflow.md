# Team Git Workflow — Latihan

## Level 1: Dasar

### 1. Branching Strategy — Pilih Model
**Pertanyaan:** Tim kamu punya karakteristik berikut:
- Rilis tiap 2 minggu
- 5 developer aktif
- Perlu hotfix untuk production
- Masih belajar Git

Pilih branching strategy yang tepat dan buat branch naming convention:

```bash
# === LENGKAPI: Branch naming convention ===

# Feature branches
git checkout -b <BRANCH_NAME>  # Format: ?

# Hotfix branches
git checkout -b <BRANCH_NAME>  # Format: ?

# Release branches
git checkout -b <BRANCH_NAME>  # Format: ?

# === LENGKAPI: Git Flow vs GitHub Flow vs Trunk-based ===
# Tulis kelebihan dan kekurangan masing-masing
```

1. Strategi mana yang paling cocok? Jelaskan alasannya
2. Buat branch naming convention dengan contoh
3. Gambar diagram branching untuk 1 siklus rilis (2 minggu)

**Hint:** GitHub Flow sederhana (`feature/*` → `main`), cocok untuk CI/CD. GitFlow punya `develop`, `release/*`, `hotfix/*` — cocok untuk rilis terjadwal. Trunk-based: semua di `main`, pakai feature flags. Untuk tim belajar: GitHub Flow lebih simpel.

---

### 2. Conventional Commits — Format & Versioning
**Pertanyaan:** Tulis commit message dengan format Conventional Commits untuk skenario berikut:

```bash
# === LENGKAPI: Tulis commit message dengan format yang benar ===

# Skenario 1: Menambah fitur login dengan Google OAuth
git commit -m "<TYPE>: <DESCRIPTION>"
# === LENGKAPI ===

# Skenario 2: Memperbaiki bug di halaman checkout (issue #42)
git commit -m "<TYPE>: <DESCRIPTION>"
# === LENGKAPI ===

# Skenario 3: Mengubah API response format (breaking change)
git commit -m "<TYPE>: <DESCRIPTION>"
# === LENGKAPI ===

# Skenario 4: Menambah unit test untuk payment module
git commit -m "<TYPE>: <DESCRIPTION>"
# === LENGKAPI ===

# === LENGKAPI: Tentukan versi berikutnya dengan semantic versioning ===
CURRENT_VERSION: 2.1.3
# Skenario 1 (fitur baru): versi baru = ?
# Skenario 3 (breaking change): versi baru = ?
# Skenario 2 (bug fix): versi baru = ?
```

**Hint:** Format: `type(scope): description`. Types: `feat`, `fix`, `feat!` (breaking), `test`, `docs`, `refactor`, `chore`. Semantic versioning: MAJOR (breaking), MINOR (feature), PATCH (fix). Breaking change: `feat!: change API format` atau `feat(scope): desc\n\nBREAKING CHANGE: description`.

---

### 3. Pull Request — Review Checklist
**Pertanyaan:** Buat PR description dan code review checklist:

```markdown
<!-- === LENGKAPI: PR Description Template === -->
## Description

<!-- Jelaskan apa yang diubah dan kenapa -->
<!-- === LENGKAPI === -->

## Related Issue
<!-- Closes #issue-number -->
<!-- === LENGKAPI === -->

## Changes
<!-- List perubahan utama -->
<!-- === LENGKAPI === -->

## Screenshots (if applicable)
<!-- === LENGKAPI === -->

## Testing
<!-- Jelaskan cara testing -->
<!-- === LENGKAPI === -->

## Checklist
- [ ] Code mengikuti project coding standards
<!-- === LENGKAPI: Tambah minimal 5 checklist items === -->
```

```typescript
// === LENGKAPI: Code review — temukan masalah di PR ini ===
// File: src/services/payment.ts
// PR: Implement payment with Midtrans

async function processPayment(orderId: string, amount: number, paymentMethod: string) {
  const payment = {
    order_id: orderId,
    gross_amount: amount,
    payment_method: paymentMethod
  };
  
  const response = await fetch('https://api.midtrans.com/v2/charge', {
    method: 'POST',
    body: JSON.stringify(payment)
  });
  
  db.query(`UPDATE orders SET status = 'paid' WHERE id = '${orderId}'`);
  
  return response.json();
}
```

Identifikasi minimal 5 masalah di kode di atas dan tulis perbaikannya.

**Hint:** PR checklist: (1) tidak ada console.log, (2) unit test included, (3) error handling, (4) security check (SQL injection, API key exposure), (5) type safety, (6) no magic numbers/strings. Masalah: hardcoded API URL, missing auth header, SQL injection, no error handling, no validation, missing try-catch.

---

### 4. Merge Conflict — Resolve Conflict
**Pertanyaan:** Dua developer mengubah file yang sama. Resolve conflict berikut:

```typescript
// File: src/config/api.ts
// === LENGKAPI: Resolve merge conflict ===
// <<<<<<< feature/payment
const API_BASE_URL = 'https://staging-api.example.com/v2';
const TIMEOUT = 10000;
const ENABLE_LOGGING = true;
// =======
const API_BASE_URL = 'https://api.example.com/v1';
const ENABLE_CACHE = true;
const MAX_RETRIES = 3;
// >>>>>>> main

// Tulis hasil resolve yang menggabungkan perubahan dari kedua branch
// === LENGKAPI: Hasil resolve ===
```

```bash
# === LENGKAPI: Tulis perintah Git untuk resolve conflict ===
# 1. Cek status conflict
git status

# 2. Edit file untuk resolve

# 3. Tandai resolved
# === LENGKAPI ===

# 4. Commit hasil merge
# === LENGKAPI ===
```

**Hint:** Conflict markers: `<<<<<<<` (current branch), `=======` (separator), `>>>>>>>` (incoming branch). Resolve: pilih salah satu, gabung keduanya, atau tulis ulang. Git commands: `git add <file>` untuk mark resolved, `git commit` untuk selesaikan merge.

---

## Level 2: Intermediate

### 5. GitHub Actions — CI/CD Pipeline
**Pertanyaan:** Buat workflow GitHub Actions untuk testing dan deploy:

```yaml
# === LENGKAPI: .github/workflows/ci.yml ===
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
      - uses: actions/checkout@v4
      
      # === LENGKAPI: Setup Node.js dengan matrix version ===
      
      # === LENGKAPI: Cache node_modules ===
      
      # === LENGKAPI: Install dependencies ===
      
      # === LENGKAPI: Run linter ===
      
      # === LENGKAPI: Run unit tests dengan coverage ===
      
      # === LENGKAPI: Upload coverage report ===
  
  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    
    steps:
      # === LENGKAPI: Deploy ke Railway/Vercel ===
      # Gunakan secrets untuk API keys
```

1. Lengkapi workflow YAML
2. Tambahkan job terpisah untuk build
3. Setup environment variables via GitHub Secrets
4. Tambahkan notifikasi Slack/Discord kalau pipeline gagal

**Hint:** Actions: `actions/setup-node`, `actions/cache` dengan `npm` cache key, `npm ci` untuk install, `npm run lint`, `npm run test -- --coverage`, `actions/upload-artifact`. Deploy: `vercel-action` atau `railway-action`. Secrets: `${{ secrets.RAILWAY_TOKEN }}`.

---

### 6. Protected Branches & CODEOWNERS
**Pertanyaan:** Setup branch protection rules dan CODEOWNERS:

```yaml
# === LENGKAPI: .github/CODEOWNERS ===
# Definisikan siapa yang auto-assign sebagai reviewer per path

# Root files
# === LENGKAPI: Semua file di root -> tim-lead ===

# Source code
# === LENGKAPI: File di src/ -> developer senior ===

# Configuration
# === LENGKAPI: File docker, ci/cd -> devops ===

# Documentation
# === LENGKAPI: File .md -> tech-writer ===
```

```bash
# === LENGKAPI: Settings branch protection untuk branch main ===
# Via GitHub UI atau API, sebutkan setting yang harus diaktifkan:
# 1. Require pull request reviews before merging
#    - Required reviewers: ?
#    - Dismiss stale reviews: ?
# 2. Require status checks to pass before merging
#    - Status checks: ?
# 3. Require up-to-date branches: ?
# 4. Include administrators: ?
# 5. Allow force pushes: ?
# 6. Allow deletions: ?
```

**Hint:** CODEOWNERS pattern: `* @tim-lead`, `src/ @senior-dev`, `docker/ @devops-team`, `*.md @tech-writer`. Branch protection: minimal 1 reviewer, dismiss stale reviews, require status checks (lint, test, build), require up-to-date branches. Jangan allow force push ke main.

---

### 7. Rebase Workflow — Clean History
**Pertanyaan:** Kamu punya branch feature dengan 6 commit berantakan. Squash dan rebase ke main:

```bash
# === LENGKAPI: Rebase workflow ===
# Kondisi: feature branch punya 6 commit:
# commit a1b2c3 - "fix typo"
# commit d4e5f6 - "wip"
# commit g7h8i9 - "fix bug"
# commit j0k1l2 - "update"
# commit m3n4o5 - "add login feature real"
# commit p6q7r8 - "add login feature"

# Tujuan: squash jadi 2 commit bersih + rebase ke main terbaru

# 1. Cek log
git log --oneline feature/login

# 2. Interactive rebase untuk squash 6 commit jadi 2
git rebase -i HEAD~6

# Dalam editor rebase, atur:
# pick p6q7r8 "feat: implement login with Google OAuth"
# squash m3n4o5 "add login feature real"
# squash j0k1l2 "update"
# === LENGKAPI: Atur sisa 3 commit ===
# squash g7h8i9 ?
# squash d4e5f6 ?
# squash a1b2c3 ?

# 3. Rebase ke main
git fetch origin main
# === LENGKAPI: Rebase feature ke main ===

# 4. Force push (karena history berubah)
# === LENGKAPI: Force push dengan aman ===
```

1. Lengkapi semua perintah Git
2. Jelaskan risiko force push dan cara aman melakukannya
3. Kapan sebaiknya pake merge vs rebase?

**Hint:** `git rebase -i HEAD~6`, squash = gabung ke commit sebelumnya, fixup = gabung tanpa pesan. `git rebase origin/main`. Force push: `git push --force-with-lease` (lebih aman dari `--force` karena cek remote). Rebase untuk local/feature, merge untuk public/shared branch.

---

### 8. GitHub Projects — Sprint Board
**Pertanyaan:** Setup GitHub Projects board untuk sprint 1 minggu:

```markdown
# === LENGKAPI: Buat issue template untuk task ===

<!-- .github/ISSUE_TEMPLATE/task.md -->
---
name: Task
about: Template task untuk sprint
title: '[TASK] '
labels: ''
assignees: ''
---

## Description
<!-- === LENGKAPI === -->

## Acceptance Criteria
<!-- === LENGKAPI: Minimal 3 criteria === -->

## Technical Notes
<!-- === LENGKAPI === -->

## Definition of Done
- [ ] Code reviewed
<!-- === LENGKAPI === -->
```

```yaml
# === LENGKAPI: GitHub Projects automation ===
# Buat workflow yang auto-assign issue ke project board

# .github/workflows/project-management.yml
name: Project Management Automation

on:
  issues:
    types: [opened, assigned, labeled]

jobs:
  add-to-project:
    runs-on: ubuntu-latest
    steps:
      # === LENGKAPI: Tambah issue baru ke "Sprint Backlog" column ===
      # === LENGKAPI: Auto-assign label "bug" ke "Bugs" column ===
```

1. Buat project board dengan columns: Backlog, Sprint Backlog, In Progress, Review, Done
2. Setup automation untuk issue lifecycle
3. Tulis sprint planning checklist (5 langkah)

**Hint:** GitHub Projects (new) vs Projects (classic). Columns: `To do`, `In progress`, `In review`, `Done`. Automation: `actions/add-to-project`. Sprint planning: (1) refine backlog, (2) estimate effort, (3) commit ke sprint, (4) assign owner, (5) setup tracking.
