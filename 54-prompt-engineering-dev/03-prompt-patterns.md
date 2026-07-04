# Sesi 3: Prompt Patterns

## Tujuan
- Menguasai 8 prompt pattern untuk task developer sehari-hari
- Mampu menyesuaikan template pattern untuk berbagai konteks
- Membangun prompt library yang reusable

## 3.1 Code Review Pattern

### Prompt Template

```text
Review this code for [CRITERIA] with severity levels.

CRITERIA:
- [CRITERION_1]
- [CRITERION_2]
- [CRITERION_3]

OUTPUT FORMAT:
| Severity | File:Line | Issue | Suggestion |
|----------|-----------|-------|------------|
| CRITICAL | | | |
| HIGH     | | | |
| MEDIUM   | | | |
| LOW      | | | |

SEVERITY DEFINITIONS:
- CRITICAL: Security vulnerability, data loss, production blocker
- HIGH: Logic error, performance bottleneck, breaking API change
- MEDIUM: Code smell, missing edge case, style violation
- LOW: Nitpick, naming suggestion, minor optimization

CODE TO REVIEW:
```[LANG]
[CODE]
```
```

### Contoh

**Prompt:**
```text
Review this code for security vulnerabilities, performance issues, and error handling with severity levels.

CODE TO REVIEW:
```typescript
app.get('/api/users/:id', async (req, res) => {
  const id = req.params.id;
  const user = await db.query(`SELECT * FROM users WHERE id = ${id}`);
  res.json(user);
});
```
```

**Expected Output:**
```
| Severity | Issue | Suggestion |
|----------|-------|------------|
| CRITICAL | SQL Injection — raw interpolation of `id` into query string | Use parameterized query: `SELECT * FROM users WHERE id = $1` with `id` as parameter |
| MEDIUM | No error handling — async handler throws uncaught errors | Wrap in try/catch or use express-async-errors |
| LOW | No input validation — `id` could be non-numeric | Validate `id` is a valid UUID or integer before querying |
```

## 3.2 Refactoring Pattern

### Prompt Template

```text
Refactor this code from [SOURCE_PATTERN] to [TARGET_PATTERN].
Keep API compatibility — public interface must not break.

CONSTRAINTS:
- Keep all existing exports and their signatures
- Maintain backward compatibility for consumers
- [ADDITIONAL_CONSTRAINTS]

SOURCE CODE:
```[LANG]
[CODE]
```

TARGET ARCHITECTURE:
Describe the target structure briefly.

REFACTORING PLAN:
1. [STEP]
2. [STEP]
3. [STEP]
```

### Contoh

**Prompt:**
```text
Refactor this Express route handler from inline logic to service layer pattern.
Keep API compatibility — route paths and response format must not change.

SOURCE CODE:
```typescript
router.post('/orders', async (req, res) => {
  const { userId, items } = req.body;
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const order = await db.orders.create({ data: { userId, items, total, status: 'PENDING' } });
  await db.inventory.updateMany(...);
  await emailService.send(emailTemplates.orderConfirmation(order));
  res.status(201).json({ data: order });
});
```
```

**Expected Output:**
```typescript
// services/order.service.ts
export class OrderService {
  async createOrder(userId: string, items: OrderItem[]) {
    const total = this.calculateTotal(items);
    const order = await this.orderRepo.create({ userId, items, total, status: 'PENDING' });
    await this.inventoryService.deductStock(items);
    await this.notificationService.sendOrderConfirmation(order);
    return order;
  }

  private calculateTotal(items: OrderItem[]): number {
    return items.reduce((sum, item) => sum + item.price * item.qty, 0);
  }
}

// routes/order.routes.ts — tetap menggunakan service
router.post('/orders', async (req, res) => {
  const { userId, items } = req.body;
  const order = await orderService.createOrder(userId, items);
  res.status(201).json({ data: order });
});
```

## 3.3 Test Generation Pattern

### Prompt Template

```text
Generate unit test using [TEST_FRAMEWORK] covering:

HAPPY PATH:
- Normal input, expected output
- Boundary values
- [SPECIFIC_HAPPY_CASES]

EDGE CASES:
- Empty input (null, undefined, empty string, empty array)
- Single element
- Maximum values
- [SPECIFIC_EDGE_CASES]

ERROR CASES:
- Invalid input types
- Out-of-range values
- Missing required fields
- [SPECIFIC_ERROR_CASES]

FUNCTION TO TEST:
```[LANG]
[CODE]
```
```

### Contoh

**Prompt:**
```text
Generate unit test using Vitest covering:

HAPPY PATH:
- Valid email returns true
- Valid email with subdomain (user@sub.example.com)

EDGE CASES:
- Empty string
- Very long email (254 chars)
- Email with special chars (+.-_)

ERROR CASES:
- Missing @ symbol
- Missing domain
- Invalid characters (spaces, quotes)
- Multiple @ symbols

FUNCTION TO TEST:
```typescript
export function isValidEmail(email: string): boolean {
  if (!email || email.length > 254) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```
```

**Expected Output:**
```typescript
import { describe, it, expect } from 'vitest';
import { isValidEmail } from './validation';

describe('isValidEmail', () => {
  // Happy path
  it('returns true for valid email', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });

  it('returns true for email with subdomain', () => {
    expect(isValidEmail('user@sub.example.com')).toBe(true);
  });

  // Edge cases
  it('returns false for empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });

  it('returns false for very long email (>254 chars)', () => {
    const long = 'a'.repeat(250) + '@b.co';
    expect(isValidEmail(long)).toBe(false);
  });

  it('returns true for email with plus sign', () => {
    expect(isValidEmail('user+tag@example.com')).toBe(true);
  });

  // Error cases
  it('returns false for email without @', () => {
    expect(isValidEmail('userexample.com')).toBe(false);
  });

  it('returns false for email without domain', () => {
    expect(isValidEmail('user@')).toBe(false);
  });

  it('returns false for email with spaces', () => {
    expect(isValidEmail('user @example.com')).toBe(false);
  });

  it('returns false for multiple @ symbols', () => {
    expect(isValidEmail('user@domain@example.com')).toBe(false);
  });
});
```

## 3.4 Debug Pattern

### Prompt Template

```text
Help me debug this error.

ERROR MESSAGE:
```
[ERROR_OUTPUT]
```

CODE CONTEXT:
```[LANG]
[CODE]
```

WHAT I'VE TRIED:
- [ATTEMPT_1]
- [ATTEMPT_2]

Please explain:
1. **Root cause**: What exactly is causing this error
2. **Why it happens**: The underlying mechanism
3. **Suggested fix**: Specific code changes
4. **Prevention**: How to avoid this in the future
```

### Contoh

**Prompt:**
```text
Help me debug this error.

ERROR MESSAGE:
```
TypeError: Cannot read properties of undefined (reading 'map')
    at renderItems (components/ItemList.tsx:45)
    at ItemList (components/ItemList.tsx:12)
```

CODE CONTEXT:
```typescript
// components/ItemList.tsx
interface ItemListProps {
  items?: Item[];
}

export function ItemList({ items }: ItemListProps) {
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}
```
```

**Expected Output:**
```
1. Root cause: `items` is `undefined` when the component renders. The `.map()` call on `undefined` throws TypeError.

2. Why it happens: `items` is declared as optional (`items?`), so parent can omit the prop. No default value is set.

3. Suggested fix:
   - Add default: `{items = []}`
   - Or guard: `{items?.map(...)}`

4. Prevention:
   - Always handle optional props with defaults
   - Consider making required props non-optional
   - Add runtime validation for external data
```

## 3.5 Performance Pattern

### Prompt Template

```text
Profile this code and identify bottlenecks.

CODE:
```[LANG]
[CODE]
```

CONTEXT:
- Expected load: [QPS / concurrent users]
- Data size: [AVERAGE/MAX dataset size]
- Current response time: [PERF_METRIC]
- Target: [TARGET_METRIC]

Please analyze:
1. **Bottleneck identification**: Which part is slowest
2. **Root cause analysis**: Why it's slow (algorithm, I/O, memory)
3. **Optimization suggestions**: Specific changes with expected improvement
4. **Benchmark considerations**: How to verify the fix works
```

### Contoh

**Prompt:**
```text
Profile this code and identify bottlenecks.

CODE:
```typescript
export function searchUsers(users: User[], query: string): User[] {
  const results: User[] = [];
  for (const user of users) {
    if (user.name.toLowerCase().includes(query.toLowerCase())) {
      results.push(user);
    }
  }
  return results;
}
```

CONTEXT:
- Expected load: 100 QPS
- Data size: 100,000 users in memory
- Current response time: ~200ms
- Target: <50ms
```

**Expected Output:**
```
1. Bottleneck: Linear scan O(n) with case-insensitive string matching on 100K users. `toLowerCase()` allocates new string per comparison.

2. Root cause:
   - O(n) scan on every request
   - Double `toLowerCase()` allocation (name + query) per user
   - No indexing — cannot leverage precomputed data

3. Optimization suggestions:
   - (HIGH) Build inverted index at startup: Map<string, User[]> of lowercased name prefixes
   - (MED) Pre-compute `lowercaseName` field on User object
   - (LOW) Use `Intl.Collator` for locale-aware comparison
   - (CRITICAL) If possible, move search to DB layer (PostgreSQL full-text search)
   Expected improvement: 200ms -> 1-5ms with index

4. Benchmark: Compare index build time vs query time. Test with worst-case (all users match) and best-case (no match).
```

## 3.6 Security Pattern

### Prompt Template

```text
Audit this code for OWASP Top 10 vulnerabilities.

CODE:
```[LANG]
[CODE]
```

CONTEXT:
- Application type: [WEB_API | SPA | MOBILE | CLI]
- Auth mechanism: [JWT | SESSION | API_KEY | NONE]
- Data sensitivity: [PUBLIC | INTERNAL | CONFIDENTIAL | PII]

For each finding, provide:
1. **OWASP Category**: Which OWASP Top 10 item
2. **Severity**: CRITICAL | HIGH | MEDIUM | LOW
3. **Vulnerability description**
4. **Exploitation scenario**
5. **Fix**: Specific code change with explanation
```

### Contoh

**Prompt:**
```text
Audit this code for OWASP Top 10 vulnerabilities.

CODE:
```typescript
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  const user = await db.query(query);
  if (user) {
    const token = jwt.sign({ user: user.id, role: 'admin' }, 'secret123');
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Login failed' });
  }
});
```

CONTEXT:
- Application type: WEB_API
- Auth mechanism: JWT
- Data sensitivity: PII (user credentials)
```

**Expected Output:**
```
| OWASP Category | Severity | Finding | Fix |
|----------------|----------|---------|-----|
| A03: Injection | CRITICAL | SQL Injection — raw string interpolation of `username` and `password` | Use parameterized queries: `SELECT * FROM users WHERE username = $1 AND password = $2` |
| A02: Cryptographic Failures | HIGH | Weak JWT secret 'secret123' — easily brute-forced | Use strong secret (32+ chars) stored in env variable. Consider RS256 with proper key management |
| A04: Insecure Design | HIGH | Plain-text password storage — comparing raw password against DB | Hash passwords with bcrypt/argon2. Compare hash, not plaintext |
| A07: Identification and Auth Failures | MEDIUM | No rate limiting on login endpoint — brute force attack possible | Implement rate limiting (e.g., 5 attempts per minute per IP) |
| A05: Security Misconfiguration | LOW | Hardcoded admin role assignment — every user gets 'admin' | Assign role from database, not hardcoded |
```

## 3.7 Documentation Pattern

### Prompt Template

```text
Generate documentation for this code.

Include:
1. **Architecture overview**: How the system is structured
2. **API reference**: All public functions/classes with params and return values
3. **Setup**: How to install, configure, and run
4. **Usage example**: Code snippet showing typical usage
5. **Notes**: Gotchas, limitations, migration guide

SOURCE CODE:
```[LANG]
[CODE]
```

DOCUMENTATION FORMAT: Markdown
```

### Contoh

**Prompt:**
```text
Generate documentation for this rate limiter package.

SOURCE CODE:
```typescript
// src/ratelimit/index.ts
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export class RateLimiter {
  private store: Map<string, { count: number; resetTime: number }>;

  constructor(private config: RateLimitConfig) {
    this.store = new Map();
  }

  allow(key: string): boolean {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      this.store.set(key, { count: 1, resetTime: now + this.config.windowMs });
      return true;
    }

    if (entry.count >= this.config.maxRequests) {
      return false;
    }

    entry.count++;
    return true;
  }

  getRemaining(key: string): number {
    const entry = this.store.get(key);
    if (!entry) return this.config.maxRequests;
    return Math.max(0, this.config.maxRequests - entry.count);
  }
}
```
```

**Expected Output:**
```markdown
# RateLimiter

In-memory sliding window rate limiter for Node.js/TypeScript applications.

## Architecture

Uses an in-memory `Map` to track per-key request counts within configurable time windows. Each key maps to `{ count, resetTime }`. When `resetTime` is passed, the entry resets automatically on next request.

## API Reference

### `RateLimiter`

```typescript
constructor(config: RateLimitConfig)
```

Creates a rate limiter instance.

- `config.maxRequests` — max requests allowed per window
- `config.windowMs` — window duration in milliseconds

```typescript
allow(key: string): boolean
```

Returns `true` if request is allowed, `false` if rate limited.

- `key` — unique identifier (IP, userID, API key)

```typescript
getRemaining(key: string): number
```

Returns remaining requests for current window.

## Setup

```bash
npm install @project/ratelimit
```

```typescript
import { RateLimiter } from '@project/ratelimit';

const limiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60_000, // 1 minute
});
```

## Usage Example

```typescript
const ip = req.ip;
if (!limiter.allow(ip)) {
  return res.status(429).json({
    error: 'Too many requests',
    remaining: limiter.getRemaining(ip),
    resetIn: '...'
  });
}
```

## Notes

- In-memory store — not suitable for multi-instance deployments (use Redis store instead)
- Memory grows with unique keys — consider periodic cleanup
- Thread-safe for single process only
```

## 3.8 Latihan: Prompt Library

Buat file `prompt-library.md` berisi 8 pattern lengkap dengan:

1. **Code Review Pattern**
   - Template review untuk PR backend (Node.js + TypeScript)
   - Kriteria: security, error handling, type safety, test coverage

2. **Refactoring Pattern**
   - Template refactor dari class-based ke functional (atau sebaliknya)
   - Contoh: migrate Express route ke tRPC

3. **Test Generation Pattern**
   - Template untuk generate integration test (supertest + jest/vitest)
   - Coverage: API endpoints, middleware, error responses

4. **Debug Pattern**
   - Template debug untuk Node.js memory leak
   - Approach: heap dump analysis, async context tracking

5. **Performance Pattern**
   - Template audit performa untuk database query (N+1 problem)
   - Include: EXPLAIN ANALYZE, indexing, eager loading

6. **Security Pattern**
   - Template audit untuk authentication flow
   - Checklist: JWT validation, session management, CSRF, rate limiting

7. **Documentation Pattern**
   - Template generate README untuk open source package
   - Sections: install, usage, API, contributing, license

8. **Custom Pattern**
   - Buat 1 pattern tambahan sesuai domain kamu
   - Contoh: migration pattern, deployment pattern, monitoring pattern
