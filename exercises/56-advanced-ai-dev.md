# Advanced AI Development Workflow — Latihan

## Level 1: Dasar

### 1. AI Code Review Pipeline — GitHub Actions
**Pertanyaan:** Bangun AI code review pipeline otomatis di GitHub Actions:

```yaml
# === LENGKAPI: GitHub Action untuk AI code review ===
# .github/workflows/ai-review-pipeline.yml
name: AI Code Review Pipeline

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  ai-review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
      checks: write
    
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Butuh history untuk diff
      
      # === LENGKAPI: ===
      # 1. Get PR diff (files changed + line numbers)
      # 2. For each changed file, run linter + type check
      # 3. For each error/warning, generate AI explanation
      # 4. Post review comments ke PR
      # 5. Check lint errors + AI review and set status
      
      - name: Get Changed Files
        id: changed-files
        run: |
          # === LENGKAPI: Get list of changed .ts files ===
          
      - name: Run Linter
        run: |
          # === LENGKAPI: Run ESLint on changed files only ===
          # Output: lint-results.json
      
      - name: AI Review
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: |
          # === LENGKAPI: ===
          # 1. Kirim diff + lint results ke AI
          # 2. AI analyze: security, performance, best practices
          # 3. Output: structured review comments
      
      - name: Post Review Comments
        uses: actions/github-script@v7
        with:
          script: |
            // === LENGKAPI: Post comments ke PR ===
            // Format: file path, line number, severity, message, suggestion
```

```typescript
// === LENGKAPI: AI review prompt ===
const REVIEW_SYSTEM_PROMPT = `
Kamu adalah senior code reviewer. Review kode berdasarkan:

1. **Security** (CRITICAL)
   - SQL/NoSQL injection
   - XSS, CSRF
   - Hardcoded secrets
   - Insecure auth
2. **Performance** (WARNING)
   - N+1 queries
   - Memory leaks
   - Unnecessary re-renders
3. **Best Practices** (SUGGESTION)
   - Error handling
   - Type safety
   - Code organization

Format output:
[
  {
    "file": "path/to/file.ts",
    "line": 42,
    "severity": "CRITICAL" | "WARNING" | "SUGGESTION",
    "message": "SQL Injection vulnerability",
    "suggestion": "Use parameterized query instead of string interpolation"
  }
]
`;

// === LENGKAPI: Parse review results ===
function parseReviewResult(aiResponse: string): ReviewComment[] {
  // === LENGKAPI: Parse JSON dari AI response ===
}
```

1. Setup pipeline dengan 4 stage: lint → type-check → AI review → post comments
2. Buat prompt yang menghasilkan structured review output
3. Test: buat PR dengan intentional issues → pipeline harus detect

**Hint:** GitHub API: `octokit.rest.pulls.createReviewComment` untuk post comment. Diff: `git diff origin/main --name-only` untuk list changed files. ESLint: `npx eslint --format json changed-files.ts > lint-results.json`. AI prompt: minta output JSON array agar mudah di-parse. Rate limiting: batch comments (maks 10 per review). Security: API key via GitHub Secrets, jangan expose di logs.

---

### 2. AI TDD Loop — Red-Green-Refactor
**Pertanyaan:** Jalankan TDD loop dengan bantuan AI:

```typescript
// === LENGKAPI: TDD Loop — Fase 1: RED (Write Failing Test) ===
// Task: Implement function `calculateShipping(weight: number, distance: number): number`
// Rules:
// - weight <= 1kg: base price Rp 10,000
// - weight > 1kg: base + (weight - 1) * Rp 5,000
// - distance > 10km: +20%
// - Free shipping untuk weight > 10kg dan distance < 5km

// === LENGKAPI: Tulis test cases dulu (RED phase) ===
import { describe, it, expect } from 'vitest';
import { calculateShipping } from './shipping';

describe('calculateShipping', () => {
  it('should return base price for 1kg within 10km', () => {
    // === LENGKAPI: Test case ===
    expect(calculateShipping(1, 5)).toBe(10000);
  });
  
  it('should add extra weight cost for > 1kg', () => {
    // === LENGKAPI: Test case ===
  });
  
  it('should add 20% surcharge for distance > 10km', () => {
    // === LENGKAPI: Test case ===
  });
  
  it('should give free shipping for weight > 10kg and distance < 5km', () => {
    // === LENGKAPI: Test case ===
  });
  
  it('should throw error for negative weight', () => {
    // === LENGKAPI: Test case ===
  });
  
  // === LENGKAPI: 2 edge case tests ===
});

// === Fase 2: GREEN (Write minimal code to pass) ===
// === LENGKAPI: Implementasi minimal ===

// === Fase 3: REFACTOR (Improve without changing behavior) ===
// === LENGKAPI: Refactor: extract helpers, improve readability ===
```

```
# === LENGKAPI: Dokumentasi TDD loop ===
# Iterasi 1: ?
# Iterasi 2: ?
# Iterasi 3: ?
# 
# Lessons learned:
# - AI lebih baik di fase GREEN atau REFACTOR?
# - Apa yang sulit di-generate AI di fase RED?
```

1. Jalankan TDD loop: RED (tulis test) → GREEN (implementasi) → REFACTOR
2. Gunakan AI untuk setiap fase (atau kombinasi)
3. Dokumentasikan berapa iterasi sampai semua test pass

**Hint:** TDD dengan AI: RED phase — AI bisa bantu generate test cases dari requirements. GREEN phase — AI bisa generate minimal implementation. REFACTOR phase — AI bisa saran improvement. Tips: phase RED paling sulit untuk AI (perlu domain understanding). GREEN paling mudah. REFACTOR butuh konteks codebase. Urutan: tulis test sendiri atau minta AI generate dari spec → implementasi pake AI → refactor pake AI.

---

### 3. Quality Gates — Security & Performance
**Pertanyaan:** Setup automated quality gates untuk PR:

```yaml
# === LENGKAPI: Quality gates pipeline ===
# .github/workflows/quality-gates.yml
name: Quality Gates

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  security-gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      # === LENGKAPI: Security checks ===
      # 1. Run npm audit (block on critical/high)
      - name: npm audit
        run: |
          # === LENGKAPI: Check for critical vulnerabilities ===
          
      # 2. Run SAST scan (Semgrep/CodeQL)
      - name: SAST Scan
        # === LENGKAPI: Run security static analysis ===
      
      # 3. Check for secrets in code (Gitleaks)
      # === LENGKAPI: Secret scanning ===
      
      # 4. AI security review
      # === LENGKAPI: Send diff to AI for security analysis ===
  
  performance-gate:
    runs-on: ubuntu-latest
    steps:
      # === LENGKAPI: Performance checks ===
      # 1. Bundle size analysis (compare with main)
      # 2. Lighthouse audit (for frontend changes)
      # 3. API response time benchmark
      # 4. Database query analysis (N+1 detection)
  
  quality-gate:
    needs: [security-gate, performance-gate]
    runs-on: ubuntu-latest
    steps:
      # === LENGKAPI: Final quality gate ===
      # 1. Code coverage check (> 80%)
      # 2. TypeScript strict check
      # 3. Lint error count (0 errors)
      # 4. AI code quality score
      
      - name: Check Quality Gate
        run: |
          # === LENGKAPI: Aggregate all gate results ===
          # Any gate FAILED → block PR from merging
```

```
# === LENGKAPI: Quality gate thresholds ===
# Security:
# - Critical vulnerabilities: 0 ❌
# - High vulnerabilities: ?
# - Secrets found: ?
#
# Performance:
# - Bundle size increase: ?
# - Lighthouse score: ?
#
# Code Quality:
# - Test coverage: ?
# - ESLint errors: ?
# - TypeScript errors: ?
```

1. Setup 3 quality gates: security, performance, code quality
2. Tentukan threshold untuk pass/fail
3. Integrasikan dengan branch protection (required checks)

**Hint:** Quality gates: automated checks yang harus pass sebelum PR bisa merge. Security gates: npm audit, Snyk, CodeQL, Gitleaks. Performance gates: Lighthouse CI, bundle size compare. Code quality gates: coverage threshold, lint errors, type errors. GitHub branch protection: Settings → Branches → Add rule → Require status checks to pass before merging. Threshold: realistis — jangan terlalu strict (block semua PR) atau terlalu longgar (gak ngaruh).

---

## Level 2: Intermediate

### 4. AI-Assisted Refactoring — Monolith to Modules
**Pertanyaan:** Refactor kode monolitik menjadi modular dengan AI assistance:

```typescript
// === BEFORE: Monolithic user handler ===
// File: src/handlers/userHandler.ts (300+ lines)

// === LENGKAPI: Refactor menjadi modular structure ===

// === LENGKAPI: Target structure ===
// src/
// ├── modules/
// │   └── user/
// │       ├── user.controller.ts    # Route handlers
// │       ├── user.service.ts       # Business logic
// │       ├── user.repository.ts    # Database access
// │       ├── user.validation.ts    # Zod schemas
// │       ├── user.types.ts         # TypeScript types
// │       ├── user.test.ts          # Unit tests
// │       └── index.ts              # Module exports
// ├── middleware/
// ├── config/
// └── app.ts

// === LENGKAPI: Extract business logic ke service ===
// user.service.ts
export class UserService {
  constructor(private readonly userRepo: UserRepository) {}
  
  async register(data: RegisterInput): Promise<User> {
    // === LENGKAPI: Business logic ===
    // 1. Check duplicate email
    // 2. Hash password
    // 3. Create user
    // 4. Send verification email
    // 5. Return user (without password)
  }
  
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    // === LENGKAPI: Login logic ===
  }
}

// === LENGKAPI: Extract database access ke repository ===
// user.repository.ts
export class UserRepository {
  // === LENGKAPI: Database operations ===
  // findByEmail, findById, create, update, softDelete
}

// === LENGKAPI: Extract validation ke schema ===
// user.validation.ts
// === LENGKAPI: Zod schemas ===
```

```
# === LENGKAPI: Refactoring plan ===
# Current state: userHandler.ts — 300 lines, mixed responsibilities
# Target state: modular user module — 6 files, single responsibility each
# 
# Steps:
# 1. Extract types → user.types.ts
# 2. Extract validation → user.validation.ts
# 3. Extract DB operations → user.repository.ts
# 4. Extract business logic → user.service.ts
# 5. Keep route handlers → user.controller.ts
# 6. Create barrel export → index.ts
#
# Migration strategy:
# - Step 1: Extract without changing behavior (safe refactor)
# - Step 2: Test after each extraction
# - Step 3: Update imports
```

1. Buat refactoring plan dari monolith ke modular structure
2. Lakukan ekstraksi bertahap: types → validation → repository → service → controller
3. Setiap langkah: test untuk memastikan behavior tidak berubah
4. Dokumentasikan sebelum/sesudah metrics (lines per file, coupling, cohesion)

**Hint:** Refactoring strategy: (1) Extract types first (safe, no behavior change), (2) Extract validation, (3) Extract data access (repository pattern), (4) Extract business logic (service pattern), (5) Keep controllers thin. Safety net: pastikan test coverage cukup sebelum refactor. AI role: generate target code dari source code, suggest interface boundaries, identify code smells. Metric: coupling (berapa banyak file import module ini), cohesion (apakah fungsi dalam module related), lines per file.

---

### 5. AI-Driven Migration — Express ke Fastify
**Pertanyaan:** Gunakan AI untuk migrasi Express.js ke Fastify:

```typescript
// === BEFORE: Express.js code ===
// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { userRouter } from './routes/user';
import { errorHandler } from './middleware/errorHandler';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/users', userRouter);
app.use(errorHandler);

app.listen(3000, () => console.log('Server running on port 3000'));

// src/routes/user.ts
import { Router } from 'express';
const router = Router();

router.get('/', async (req, res) => {
  const users = await userService.findAll();
  res.json({ success: true, data: users });
});

router.post('/', async (req, res, next) => {
  try {
    const user = await userService.create(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

export { router as userRouter };
```

```typescript
// === LENGKAPI: AFTER — Migrated to Fastify ===
// src/app.ts
import Fastify from 'fastify';
// === LENGKAPI: Fastify setup ===

// src/routes/user.ts
// === LENGKAPI: Fastify route ===
```

```
# === LENGKAPI: Migration plan ===
# 1. Express middleware → Fastify plugin: ?
#    - helmet → ?
#    - cors → ?
#    - express.json() → ?
# 
# 2. Express Router → Fastify Plugin: ?
# 3. Error handler → Fastify error handler: ?
# 4. Request/Response API differences:
#    - req.body → ?
#    - res.json() → ?
#    - next(error) → ?
# 
# 5. Testing differences: ?
```

1. Buat migration plan lengkap dengan mapping API differences
2. Migrasi Express app ke Fastify menggunakan AI
3. Test semua endpoint untuk memastikan behavior identik
4. Benchmark perbandingan performance (opsional)

**Hint:** Migration strategy: (1) Parallel run — Express dan Fastify jalan bersamaan, redirect traffic pelan-pelan. (2) Strangler fig — ganti route by route. (3) Big bang — ganti semua sekaligus (risky). Express to Fastify mapping: middleware → plugins, Router → Fastify plugin registration, error handler → `app.setErrorHandler()`, req/res API → Fastify API (reply.send(), reply.code()). AI prompt: "Migrate this Express.js route to Fastify, keeping exact same request/response behavior."

---

### 6. AI Testing Strategy — Generate Test Suite
**Pertanyaan:** Generate comprehensive test suite dengan AI:

```typescript
// === LENGKAPI: AI-generated test strategy ===
// File: src/services/payment.service.ts

interface PaymentService {
  processPayment(orderId: string, amount: number, method: PaymentMethod): Promise<PaymentResult>;
  refundPayment(paymentId: string, reason: string): Promise<RefundResult>;
  getPaymentStatus(paymentId: string): Promise<PaymentStatus>;
}

// === LENGKAPI: Generate test plan ===
// 1. Unit Tests (service logic, mocked dependencies)
//    - Test calculateFee() untuk berbagai amount
//    - Test validatePaymentMethod() untuk valid/invalid methods
//    - ...

// 2. Integration Tests (real database, mocked external API)
//    - Test processPayment flow dari controller ke database
//    - Test refund flow
//    - ...

// 3. E2E Tests (full system, real API calls)
//    - Test complete payment flow: create order → pay → verify
//    - Test error scenarios: insufficient balance, timeout, etc.
//    - ...
```

```typescript
// === LENGKAPI: Generate unit test dengan AI ===
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentService } from './payment.service';

// === LENGKAPI: Mock dependencies ===
const mockPaymentGateway = {
  charge: vi.fn(),
  refund: vi.fn(),
};

const mockOrderRepo = {
  findById: vi.fn(),
  updateStatus: vi.fn(),
};

describe('PaymentService', () => {
  let service: PaymentService;
  
  beforeEach(() => {
    vi.clearAllMocks();
    service = new PaymentService(mockPaymentGateway as any, mockOrderRepo as any);
  });
  
  describe('processPayment', () => {
    it('should process payment successfully', async () => {
      // === LENGKAPI: Test happy path ===
    });
    
    it('should throw error when payment gateway timeout', async () => {
      // === LENGKAPI: Test error path ===
    });
    
    it('should retry on transient failure', async () => {
      // === LENGKAPI: Test retry logic ===
    });
    
    // === LENGKAPI: 3 more test cases ===
  });
});
```

1. Generate test plan: unit → integration → e2e
2. Generate test code dengan AI untuk setiap layer
3. Pastikan coverage > 80% dengan AI-generated tests
4. Identifikasi gaps: test cases apa yang missed oleh AI?

**Hint:** Test strategy pyramid: Unit (70%) → Integration (20%) → E2E (10%). AI-generated tests: baik untuk boilerplate dan edge cases, tapi perlu review untuk business logic correctness. Test patterns: (1) Happy path — input valid, (2) Error path — input invalid, (3) Edge cases — boundary values, (4) Error handling — service unavailable, timeout. AI prompt: "Generate comprehensive tests for this service, include mocks for all dependencies, cover happy path, error path, and 3 edge cases." Coverage: track dengan `vitest --coverage`.

---

### 7. AI Performance Optimization — Profile & Fix
**Pertanyaan:** Gunakan AI untuk mengidentifikasi dan memperbaiki performance issues:

```typescript
// === BEFORE: Slow code ===
// src/services/product.service.ts

// === LENGKAPI: Problem identification ===
// Problems:
// 1. N+1 query: loop untuk get category tiap product
// 2. No pagination: load semua products
// 3. Heavy computation di loop
// 4. No caching

async function getProductsWithDetails(filters: ProductFilters) {
  const products = await db.query('SELECT * FROM products');
  // N+1: query category untuk setiap product
  const result = [];
  for (const product of products) {
    const category = await db.query('SELECT * FROM categories WHERE id = ?', [product.category_id]);
    const reviews = await db.query('SELECT AVG(rating) as avg FROM reviews WHERE product_id = ?', [product.id]);
    result.push({
      ...product,
      category: category[0],
      averageRating: reviews[0]?.avg || 0,
    });
  }
  return result;
}
```

```typescript
// === LENGKAPI: AFTER — Optimized code ===
// === LENGKAPI: Fix N+1, add pagination, add caching ===

async function getProductsWithFilters(filters: ProductFilters) {
  const { page = 1, limit = 20, categoryId, search } = filters;
  const offset = (page - 1) * limit;
  
  // Join query untuk eliminate N+1
  const products = await db.query(`
    SELECT p.*, c.name as category_name, COALESCE(AVG(r.rating), 0) as average_rating
    FROM products p
    JOIN categories c ON p.category_id = c.id
    LEFT JOIN reviews r ON r.product_id = p.id
    WHERE 1=1
    ${categoryId ? 'AND p.category_id = ?' : ''}
    ${search ? 'AND (p.name LIKE ? OR p.description LIKE ?)' : ''}
    GROUP BY p.id
    LIMIT ? OFFSET ?
  `, [...filters, limit, offset]);
  
  // === LENGKAPI: Add Redis caching ===
  
  return products;
}
```

```
# === LENGKAPI: Performance analysis report ===
# Before:
# - Response time: 3.2s (100 products)
# - Queries: 1 + N (category) + N (reviews) = 201 queries
# - Memory: load semua products tanpa pagination
#
# After:
# - Response time: ?
# - Queries: ?
# - Memory: ?
#
# Optimizations applied:
# 1. JOIN query instead of N+1
# 2. Pagination
# 3. ?
# 4. ?
```

1. Identifikasi 3 performance issues di kode
2. Fix dengan AI assistance
3. Buat benchmark: before vs after
4. Dokumentasikan improvement metrics

**Hint:** Performance optimization tiers: (1) Query optimization (JOIN, index, pagination), (2) Caching (Redis, in-memory), (3) Algorithm optimization (reduce complexity), (4) Async/concurrent processing. AI role: identify N+1 patterns, suggest caching strategy, generate optimized queries. Tools: `clinic.js` untuk Node.js profiling, `explain analyze` untuk PostgreSQL query analysis. Metrics: response time (p50/p95/p99), queries per request, memory usage.

---

### 8. AI Ops — Monitoring & Alerting dengan AI
**Pertanyaan:** Setup AI-powered monitoring dan alerting:

```typescript
// === LENGKAPI: AI-powered log analysis ===
// src/monitoring/ai-log-analyzer.ts
import OpenAI from 'openai';

export class AILogAnalyzer {
  private openai: OpenAI;
  
  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  
  // === LENGKAPI: Analyze error logs ===
  async analyzeError(errorLog: string): Promise<Analysis> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `
            Analyze this error log and provide:
            1. Root cause (what caused the error)
            2. Severity (CRITICAL / HIGH / MEDIUM / LOW)
            3. Impact (which users/features affected)
            4. Suggested fix (step by step)
            5. Similar past occurrences
          `
        },
        { role: 'user', content: errorLog }
      ]
    });
    
    // === LENGKAPI: Parse structured analysis ===
    return parseAnalysis(response.choices[0]?.message?.content || '');
  }
  
  // === LENGKAPI: Auto-triage alert ===
  async triageAlert(alert: Alert): Promise<TriageResult> {
    // === LENGKAPI: ===
    // 1. Analyze alert context
    // 2. Determine priority
    // 3. Suggest immediate action
    // 4. Auto-assign to team member based on expertise
  }
}

// === LENGKAPI: AI-based anomaly detection ===
export class AnomalyDetector {
  // === LENGKAPI: ===
  // 1. Track metrics (response time, error rate, traffic)
  // 2. Use statistical methods to detect anomalies
  // 3. AI-enhanced: consider context (deployments, events)
  // 4. Generate alert dengan analysis
  async detectAnomalies(metrics: MetricPoint[]): Promise<Anomaly[]> {
    // === LENGKAPI: Implement anomaly detection ===
  }
}
```

```yaml
# === LENGKAPI: GitHub Action untuk auto-response on alert ===
name: Auto-Response on PagerDuty Alert

on:
  repository_dispatch:
    types: [incident.triggered]

jobs:
  analyze-incident:
    runs-on: ubuntu-latest
    steps:
      # === LENGKAPI: ===
      # 1. Fetch recent error logs from monitoring
      # 2. Send to AI for analysis
      # 3. Create GitHub issue with analysis
      # 4. Assign to appropriate team member
      # 5. Post to Slack/Discord
      # 6. If critical: rollback last deploy
```

1. Setup AI-powered log analysis untuk auto-triage
2. Implementasi anomaly detection dengan AI
3. Buat auto-response pipeline: alert → AI analyze → create issue → assign → notify
4. Test: simulate error → system harus auto-analyze dan create issue

**Hint:** AI Ops: AI untuk operational tasks — log analysis, alert triage, anomaly detection, auto-response. Log analysis: send error log ke AI, minta root cause analysis + suggested fix. Anomaly detection: bandingkan metrics dengan historical baseline, flag yang deviasi > 3 standard deviations. Auto-response: PagerDuty/Grafana alert → GitHub Action → AI analysis → create issue → assign → post to Slack. Prompt: "Analyze this error pattern and determine root cause, impact, and suggested fix. Output as JSON with fields: rootCause, severity, impact, suggestedFix, relatedIssues."
