---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — Prompt Engineering untuk Developer"
footer: "Sesi 02: Code Generation Prompting"
---

<!-- _class: title -->
# Sesi 2: Code Generation Prompting

## Tujuan
- Menguasai few-shot prompting untuk code generation
- Menerapkan chain-of-thought untuk algoritma kompleks
- Menghasilkan structured output dengan JSON schema, TypeScript types, XML
- Mengelola context window secara efisien
- Melakukan iterative refinement dan prompt chaining

## 2.1 Few-Shot Prompting

Beri contoh input/output sebelum meminta generate. Efektif untuk task dengan pola berulang.

### Template Few-Shot

```text
Generate [KODE] untuk [TASK].

Berikut pola yang harus diikuti:

=== Contoh 1 ===
Input: [INPUT_1]
Output:
```[LANG]
[CODE_1]
```

=== Contoh 2 ===
Input: [INPUT_2]
Output:
```[LANG]
[CODE_2]
```

=== Sekarang kerjakan untuk input ini ===
Input: [TARGET_INPUT]
Output:
```

### Contoh — Generate API Handler

```text
Generate Express route handlers untuk CRUD resource.

=== Contoh 1 ===
Resource: User (fields: id, name, email, createdAt)

```typescript
// GET /api/users
export async function getUsers(req: Request, res: Response) {
  const users = await db.user.findMany({
    select: { id: true, name: true, email: true, createdAt: true }
  });
  res.json({ data: users });
}

// POST /api/users
export async function createUser(req: Request, res: Response) {
  const { name, email } = req.body;
  const user = await db.user.create({
    data: { name, email },
    select: { id: true, name: true, email: true, createdAt: true }
  });
  res.status(201).json({ data: user });
}
```

=== Contoh 2 ===
Resource: Product (fields: id, name, price, category, stock, createdAt)

```typescript
// GET /api/products
export async function getProducts(req: Request, res: Response) {
  const products = await db.product.findMany({
    select: { id: true, name: true, price: true, category: true, stock: true }
  });
  res.json({ data: products });
}

// POST /api/products
export async function createProduct(req: Request, res: Response) {
  const { name, price, category, stock } = req.body;
  const product = await db.product.create({
    data: { name, price, category, stock },
    select: { id: true, name: true, price: true, category: true, stock: true }
  });
  res.status(201).json({ data: product });
}
```

=== Sekarang ===
Resource: Order (fields: id, userId, items, total, status, createdAt)
Generate GET /api/orders dan POST /api/orders
```

## 2.2 Chain-of-Thought (CoT)

Step-by-step reasoning untuk algoritma kompleks. Minta AI berpikir sebelum menulis kode.

### Template CoT untuk Code Generation

```text
Task: [DESKRIPSI ALGORITMA]

Before writing code, think through this step by step:

1. **Understanding**: What is the input, output, and constraints?
2. **Approach**: What algorithm/data structure is appropriate?
3. **Edge cases**: What could go wrong?
4. **Complexity**: What is time/space complexity?
5. **Implementation**: Write the code.

Generate the code only after completing steps 1-4.
```

### Contoh — Rate Limiter

```text
Task: Implement sliding window rate limiter in Go.

Before writing code, think step by step:

1. **Understanding**:
   - Input: userID, timestamp, maxRequests, windowSize
   - Output: boolean (allowed/rejected)
   - Constraint: O(1) per check, minimal memory

2. **Approach**:
   - Fixed window: prone to burst at boundary
   - Sliding window log: accurate but memory-heavy
   - Sliding window counter: good balance — track current + previous window with weight
   - Will use fixed window + per-user counter (redis INCR + EXPIRE) for simplicity

3. **Edge cases**:
   - First request ever → always allowed
   - Window boundary → reset counter
   - Distributed system → use Redis atomic operations
   - Concurrent requests → handle race condition

4. **Complexity**:
   - Time: O(1) per check
   - Memory: O(n) where n = active users

5. **Implementation**:
```

### CoT Output

```go
package ratelimit

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

type SlidingWindowRateLimiter struct {
	client    *redis.Client
	maxReq    int
	windowSec int
}

func New(client *redis.Client, maxReq, windowSec int) *SlidingWindowRateLimiter {
	return &SlidingWindowRateLimiter{
		client:    client,
		maxReq:    maxReq,
		windowSec: windowSec,
	}
}

// Allow checks if request is within rate limit using fixed window + sliding count
func (rl *SlidingWindowRateLimiter) Allow(ctx context.Context, userID string) (bool, error) {
	key := fmt.Sprintf("ratelimit:%s", userID)
	now := time.Now().Unix()
	windowKey := fmt.Sprintf("%s:%d", key, now/int64(rl.windowSec))

	// Current window count
	count, err := rl.client.Incr(ctx, windowKey).Result()
	if err != nil {
		return false, err
	}

	// Set TTL on first increment
	if count == 1 {
		rl.client.Expire(ctx, windowKey, time.Duration(rl.windowSec)*time.Second)
	}

	if count <= int64(rl.maxReq) {
		return true, nil
	}

	return false, nil
}
```

## 2.3 Structured Output

Minta AI output dalam format terstruktur untuk diproses programmatically.

### JSON Schema

```text
Generate CRUD API untuk resource Product.

Output dalam format JSON dengan schema berikut:

{
  "endpoints": [
    {
      "method": "string",
      "path": "string",
      "handler": "string (code)",
      "input_validation": "string (zod schema)",
      "response": "string (type definition)"
    }
  ],
  "types": {
    "CreateProductDto": "string (type)",
    "UpdateProductDto": "string (type)",
    "ProductResponse": "string (type)"
  }
}
```

### TypeScript Type Definition

```text
Generate TypeScript types untuk REST API client library.

Output ONLY TypeScript code — no explanation.

Minimal library mencakup:
- Generic ApiResponse<T>
- PaginatedResponse<T>
- ErrorResponse
- RequestOptions
- HTTP method types (GET, POST, PUT, DELETE, PATCH)
```

### XML Template

```text
Generate XML configuration untuk CI/CD pipeline.

Format output:

<ci-pipeline>
  <name>string</name>
  <trigger>on-push | on-pr | scheduled</trigger>
  <stages>
    <stage id="string">
      <name>string</name>
      <steps>
        <step>string (command)</step>
      </steps>
    </stage>
  </stages>
</ci-pipeline>
```

## 2.4 Context Window Management

Prioritaskan informasi penting, trim yang irrelevant.

### Teknik

1. **Bottom-line up front**: Letakkan instruksi paling penting di awal prompt
2. **Token budget awareness**: Ketahui batas model (4K/8K/16K/32K/128K)
3. **Selective inclusion**: Hanya sertakan file/fungsi yang relevan
4. **Summarize instead of paste**: Ringkas kode existing -> deskripsi singkat
5. **Reference docs by URL**: Daripada paste dokumentasi panjang

### Contoh

```text

---

# BAD — terlalu banyak kode tidak relevan
Here is my entire project (2000 lines). Generate a new feature.


---

# GOOD — fokus pada konteks relevan
I'm adding a payment webhook to this Express app.
Relevant files:
- src/routes/payment.ts (current handlers — see below)
- src/services/payment.ts (business logic)
- src/types/index.ts (type definitions)

Current payment handler pattern (from routes/payment.ts):
[PASTE 20-30 lines saja]
```

## 2.5 Iterative Refinement

Generate -> Review -> Refine prompt. Proses berulang untuk meningkatkan kualitas output.

### Siklus

```
1. Generate initial code
2. Review output (manual atau AI-assisted)
3. Identify gaps: missing edge cases, bugs, style issues
4. Refine prompt with specific corrections
5. Re-generate
6. Repeat
```

### Contoh Iterative Refinement

**Iterasi 1 — Prompt:**
```text
Generate a rate limiter in Go.
```

**Output:** Implementasi sederhana tanpa Redis, tanpa concurrent safety.

**Iterasi 2 — Prompt refined:**
```text
Generate a distributed rate limiter in Go using Redis.
Must handle concurrent requests safely.
Use sliding window algorithm with O(1) time complexity.
Include unit tests with table-driven test pattern.
```

**Output:** Lebih baik, tapi test coverage kurang.

**Iterasi 3 — Prompt refined:**
```text
Generate distributed rate limiter in Go (Redis, sliding window, O(1)).

Requirements:
- Implement Allow(ctx, userID) (bool, error)
- Thread-safe using redis atomic operations
- Configurable max requests per window
- Unit tests covering: normal flow, rate limit exceeded, concurrent requests, TTL expiry
- Benchmark test for concurrent performance

Add to the existing output: fix the race condition on first request (count==1 check).
```

## 2.6 Prompt Chaining

Output sesi 1 jadi input sesi 2. Berguna untuk task multi-tahap.

### Contoh Chain

```
Sesi 1: Generate API spec (OpenAPI/Swagger YAML)
         ↓
Sesi 2: Generate server code from spec
         ↓
Sesi 3: Generate client SDK from spec
         ↓
Sesi 4: Generate integration tests
```

### Template Chaining

```text
[SESSION 1 PROMPT]
Generate OpenAPI 3.0 spec for a blog API with:
- POST /posts, GET /posts, GET /posts/:id, PUT /posts/:id, DELETE /posts/:id
- Comments as sub-resource
- User authentication (JWT bearer)

Output spec as YAML.

[SESSION 2 PROMPT — menggunakan output sesi 1]
Using this OpenAPI spec [COPY SPEC HERE or REFERENCE]:
Generate Express.js server implementation with:
- All endpoints implemented
- Input validation using the spec schemas
- JWT middleware for protected routes
- Error handling middleware
- TypeScript types generated from spec
```

## 2.7 Latihan

### Latihan 1: CRUD API dengan Few-Shot + JSON Schema Output

Buat prompt yang menghasilkan CRUD API untuk resource **Invoice** dengan:
- Fields: id, invoiceNumber, customerId, items (array), subtotal, tax, total, status, dueDate, createdAt
- Teknik: few-shot (2 contoh dari resource berbeda)
- Output: JSON schema dengan endpoints, types, validations

### Latihan 2: Chain-of-Thought untuk Sorting Algorithm

Buat prompt CoT untuk implementasi **External Merge Sort** (sorting file besar yang tidak muat di memory).
- Step-by-step reasoning
- Edge case: file kosong, duplicate values, partially sorted data
- Complexity analysis
- Implementasi dalam Python

### Latihan 3: Prompt Chaining

Buat chain 3 sesi prompt untuk task berikut:
1. Generate database schema
2. Generate repository layer
3. Generate API endpoints

Gunakan output setiap sesi sebagai input sesi berikutnya.
