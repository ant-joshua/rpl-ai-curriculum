# Sesi 2: AI Testing Strategy

**Durasi: 3 jam**

## Tujuan

Setelah sesi ini, peserta mampu:
- Menerapkan AI TDD loop (Red → Green → Refactor)
- Mengenerate unit test, integration test, dan E2E test dengan AI
- Memanfaatkan AI untuk edge case detection & fuzzing
- Mengelola test maintenance otomatis saat kode berubah

---

## 1. AI TDD (Test-Driven Development with AI)

### 1.1 Siklus AI TDD

```
┌────────────────────────────────────────────────┐
│  RED                                           │
│  Write test prompt → AI generate test suite    │
│  Run → fail (red)                              │
├────────────────────────────────────────────────┤
│  GREEN                                         │
│  AI generate implementation to pass tests      │
│  Run → pass (green)                            │
├────────────────────────────────────────────────┤
│  REFACTOR                                      │
│  AI refactor code & update tests               │
│  Run → all green (refactored)                  │
└────────────────────────────────────────────────┘
```

### 1.2 Contoh AI TDD Loop

**Step 1 — RED: Prompt AI untuk generate test**

```
You are a test engineer. Write unit tests for a function `calculateDiscount(price, userType)`.
Requirements:
- Regular user: no discount
- Premium user: 20% discount
- VIP user: 50% discount with max cap $100
- Edge cases: negative price, zero price, null userType
Use Vitest (TypeScript).
```

**AI Output — Test Suite:**

```typescript
// calculateDiscount.test.ts
import { describe, it, expect } from 'vitest';
import { calculateDiscount } from './calculateDiscount';

describe('calculateDiscount', () => {
  // Happy path
  it('returns full price for regular user', () => {
    expect(calculateDiscount(100, 'regular')).toBe(100);
  });

  it('applies 20% discount for premium user', () => {
    expect(calculateDiscount(100, 'premium')).toBe(80);
  });

  it('applies 50% discount for VIP user with max $100 cap', () => {
    expect(calculateDiscount(100, 'vip')).toBe(50);
    expect(calculateDiscount(500, 'vip')).toBe(400); // 500 - 100 = 400
  });

  // Edge cases
  it('returns 0 for negative price', () => {
    expect(calculateDiscount(-10, 'regular')).toBe(0);
  });

  it('returns 0 for zero price', () => {
    expect(calculateDiscount(0, 'premium')).toBe(0);
  });

  it('throws for null userType', () => {
    expect(() => calculateDiscount(100, null)).toThrow();
  });

  it('throws for unknown userType', () => {
    expect(() => calculateDiscount(100, 'unknown')).toThrow();
  });
});
```

**Step 2 — GREEN: Prompt AI untuk generate implementation**

```
Implement calculateDiscount function to pass all tests above.
```

**AI Output — Implementation:**

```typescript
// calculateDiscount.ts
export function calculateDiscount(price: number, userType: string | null): number {
  if (price <= 0) return 0;
  if (!userType) throw new Error('userType is required');

  const discounts: Record<string, number> = {
    regular: 0,
    premium: 0.2,
    vip: 0.5,
  };

  if (!(userType in discounts)) {
    throw new Error(`Unknown userType: ${userType}`);
  }

  const discount = price * discounts[userType];

  // VIP cap
  const maxDiscount = userType === 'vip' ? 100 : Infinity;
  const appliedDiscount = Math.min(discount, maxDiscount);

  return price - appliedDiscount;
}
```

**Step 3 — REFACTOR: Prompt AI**

```
Refactor calculateDiscount — extract discount config, improve readability.
Update tests if needed. All tests must still pass.
```

---

## 2. Test Generation

### 2.1 Unit Test Generation

**Prompt:**

```
Generate unit tests for this function. Cover:
- Normal cases (happy path)
- Boundary values
- Error states
- Null/undefined inputs

function paginate<T>(items: T[], page: number, pageSize: number): { data: T[]; total: number; page: number; totalPages: number } {
  const start = (page - 1) * pageSize;
  const data = items.slice(start, start + pageSize);
  return {
    data,
    total: items.length,
    page,
    totalPages: Math.ceil(items.length / pageSize),
  };
}
```

**AI-Generated Tests:**

```typescript
describe('paginate', () => {
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  it('returns first page', () => {
    const result = paginate(items, 1, 5);
    expect(result.data).toEqual([1, 2, 3, 4, 5]);
    expect(result.totalPages).toBe(2);
  });

  it('returns second page', () => {
    const result = paginate(items, 2, 5);
    expect(result.data).toEqual([6, 7, 8, 9, 10]);
  });

  it('handles page beyond total', () => {
    const result = paginate(items, 10, 5);
    expect(result.data).toEqual([]);
    expect(result.page).toBe(10);
  });

  it('handles pageSize larger than total', () => {
    const result = paginate(items, 1, 100);
    expect(result.data).toEqual(items);
    expect(result.totalPages).toBe(1);
  });

  it('handles empty array', () => {
    const result = paginate([], 1, 5);
    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it('handles page 0 gracefully', () => {
    const result = paginate(items, 0, 5);
    expect(result.data).toEqual([1, 2, 3, 4, 5]); // start = -5, slice handles it
  });
});
```

### 2.2 Integration Test Generation

**Prompt:**

```
Generate integration tests for this Express endpoint:

POST /api/users
Body: { name: string, email: string, role: 'admin' | 'user' }
Response: 201 { id, name, email, role, createdAt }
Errors: 400 if missing fields, 409 if email exists

Use Supertest + Vitest. Mock database calls.
```

### 2.3 E2E Test Generation

**Prompt:**

```
Generate Playwright E2E tests for:
1. User registration flow
2. Login → dashboard redirect
3. Form validation errors display
4. API error toast notification
```

**AI Output Example:**

```typescript
import { test, expect } from '@playwright/test';

test.describe('User Registration', () => {
  test('successful registration redirects to dashboard', async ({ page }) => {
    await page.goto('/register');
    await page.fill('[data-testid="name"]', 'Test User');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'SecurePass123!');
    await page.click('[data-testid="submit"]');
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="welcome"]')).toContainText('Test User');
  });

  test('shows validation errors on empty form', async ({ page }) => {
    await page.goto('/register');
    await page.click('[data-testid="submit"]');
    await expect(page.locator('[data-testid="field-error"]')).toHaveCount(3);
  });

  test('shows API error toast on duplicate email', async ({ page }) => {
    await page.goto('/register');
    await page.fill('[data-testid="name"]', 'Existing User');
    await page.fill('[data-testid="email"]', 'existing@example.com');
    await page.fill('[data-testid="password"]', 'SecurePass123!');
    await page.click('[data-testid="submit"]');
    await expect(page.locator('[data-testid="toast-error"]')).toContainText('Email already exists');
  });
});
```

---

## 3. Edge Cases & Fuzzing

### 3.1 AI-Powered Edge Case Detection

**Prompt:**

```
Analyze this function and list ALL possible edge cases I might miss.
Provide test cases for each.

function processPayment(amount: number, currency: string, method: string) {
  // ... complex logic
}
```

**AI Output — Edge Cases Found:**

| Edge Case | Why It Matters | Test |
|-----------|---------------|------|
| Amount in cents vs decimal | `100` vs `1.00` treat differently | `processPayment(0.01, 'USD', 'card')` |
| Currency with no decimals (JPY) | JPY ¥100 = integer, not 1.00 | `processPayment(100, 'JPY', 'card')` |
| Unsupported currency | Should throw, not silently fail | `processPayment(50, 'XYZ', 'card')` |
| Method null | NPE if not checked | `processPayment(50, 'USD', null)` |
| Amount = 0 | Free transaction allowed? | `processPayment(0, 'USD', 'card')` |
| Floating point precision | `0.1 + 0.2 !== 0.3` | `processPayment(0.1, 'USD', 'card')` |

### 3.2 Property-Based Testing

AI generate property tests menggunakan fast-check:

```typescript
import fc from 'fast-check';

describe('paginate property-based tests', () => {
  it('total items in all pages equals original length', () => {
    fc.assert(
      fc.property(
        fc.array(fc.anything()),
        fc.integer({ min: 1, max: 10 }),
        fc.integer({ min: 1, max: 10 }),
        (items, page, pageSize) => {
          const result = paginate(items, page, pageSize);
          const allItems = result.data; // just one page
          return true; // invariant: sum of items across all pages = total
        }
      )
    );
  });
});
```

### 3.3 Fuzzing

```bash
# AI-generated fuzz input
npm run fuzz -- --provider random --iterations 10000
```

Prompt fuzzing:

```
Generate 100 random valid and invalid JSON payloads for POST /api/users.
Include: missing fields, wrong types, XSS payloads, SQL injection, huge payloads, Unicode.
Output as JSON array.
```

---

## 4. Test Maintenance

### 4.1 AI Update Tests When Code Changes

**Scenario:** Function signature berubah — parameter `userType` diganti `role`.

```
The function calculateDiscount changed:
- OLD: calculateDiscount(price: number, userType: string)
- NEW: calculateDiscount(price: number, role: 'customer' | 'member' | 'vip')
- Customer: 0% discount
- Member: 15% discount
- VIP: 40% discount (no cap anymore)

Update all existing tests to match new signature and behavior.
```

### 4.2 Detect and Fix Flaky Tests

```
Analyze this test output. It fails intermittently:
- PASS: 47/50 runs
- FAIL: 3/50 runs with "Element not found: #submit-btn"

Possible causes:
a) Race condition — button not rendered yet
b) Network latency — API response slow
c) Async not awaited

Fix the test with proper waits.
```

### 4.3 Coverage Gap Detection

```
Analyze test coverage report:
- Lines: 78%
- Branches: 62%
- Functions: 85%

Generate tests for uncovered branches in:
src/services/payment.ts (branches: 45%)
src/utils/validators.ts (lines: 55%)
```

---

## 5. AI Test Suite Generator

### 5.1 Prompt Template Lengkap

```
Generate a complete test suite for [component/function].

Testing framework: Vitest
Coverage threshold: 80% lines, 75% branches
Include: unit, integration (if applicable)
Edge cases: null, undefined, empty, boundary, invalid types
Mock: external API calls, database queries
Format: TypeScript

Code to test:

[PASTE CODE]
```

### 5.2 Example: Generate for API Route

```typescript
// AI-Generated: tests/api/users.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createUser } from '../api/users';
import { db } from '../lib/db';
import { sendWelcomeEmail } from '../lib/email';

vi.mock('../lib/db');
vi.mock('../lib/email');

describe('POST /api/users', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates user and sends welcome email', async () => {
    vi.mocked(db.query).mockResolvedValue({ rows: [] });
    
    const result = await createUser({
      name: 'Test',
      email: 'test@test.com',
    });

    expect(db.query).toHaveBeenCalledWith(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      ['Test', 'test@test.com']
    );
    expect(sendWelcomeEmail).toHaveBeenCalledWith('test@test.com');
    expect(result.status).toBe(201);
  });

  it('returns 409 on duplicate email', async () => {
    vi.mocked(db.query).mockRejectedValue({ code: '23505' }); // unique violation

    await expect(
      createUser({ name: 'Test', email: 'dup@test.com' })
    ).rejects.toMatchObject({ status: 409 });
  });
});
```

---

## 6. Latihan: AI TDD Loop Lengkap

### Tugas

1. Pilih satu fungsi kompleks (validasi email, parser CSV, auth middleware)
2. **RED** — Minta AI generate test suite untuk fungsi tsb
3. Simpan test, jalankan — pastikan fail
4. **GREEN** — Minta AI generate implementasi passing semua test
5. Simpan implementasi, jalankan test — pastikan pass
6. **REFACTOR** — Minta AI refactor kode, update test jika perlu
7. Generate **property-based test** untuk fungsi tsb
8. Buat **fuzz test** dengan 100 input random

### Starter

```
You are my TDD partner. I want to build a function: validatePassword(password: string).

Rules:
- Min 8 chars, max 64 chars
- At least 1 uppercase, 1 lowercase, 1 digit, 1 special char
- No spaces allowed
- Must not contain common patterns: "password", "12345", "qwerty"

Generate the test suite first (Vitest, TypeScript).
```

### Kriteria Sukses

- [ ] AI TDD loop berjalan minimal 2 iterasi
- [ ] Test suite mencakup >90% edge cases
- [ ] Property-based test menemukan minimal 1 bug
- [ ] Fuzz test tidak crash unhandled
- [ ] Test maintenance: ketika kode berubah, AI update test otomatis

### Catatan

- Gunakan `claude` atau `gpt` via terminal (Cline/Codex)
- Atau gunakan API langsung via script
- Simpan semua prompt dan output sebagai referensi

---

## Referensi

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Test Generator](https://playwright.dev/docs/codegen)
- [fast-check — Property Based Testing](https://github.com/dubzzz/fast-check)
- [OWASP Fuzzing Guide](https://owasp.org/www-community/Fuzzing)
- [WWCode — AI TDD](https://github.com/WWCodeTokyo/ai-tdd)
