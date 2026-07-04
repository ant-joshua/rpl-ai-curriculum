# Sesi 4: AI Refactoring & Migration

**Durasi: 3 jam**

## Tujuan

Setelah sesi ini, peserta mampu:
- Mendeteksi code smell dengan AI (long function, large class, duplicated code)
- Menyusun dan menjalankan strategi refactoring (plan → execute → verify → commit)
- Melakukan migration patterns: library upgrade, framework migration, pattern change
- Mengekstrak service dari monolith dengan AI assistance
- Menangani database migration dengan rollback plan

---

## 1. AI Code Smell Detection

### 1.1 Jenis Code Smell

| Smell | Deteksi AI | Severity |
|-------|-----------|----------|
| **Long Function** | Function >50 lines | Medium |
| **Large Class** | Class >500 lines, >20 methods | High |
| **Duplicated Code** | Similar blocks >10 lines across files | High |
| **Comment-as-Doc** | Comments explaining what, not why | Low |
| **God Object** | Single class knows/does too much | Critical |
| **Shotgun Surgery** | One change requires edits in many files | High |
| **Feature Envy** | Method more interested in other class data | Medium |
| **Primitive Obsession** | Using primitives instead of value objects | Low |
| **Long Parameter List** | >4 parameters in function | Medium |
| **Dead Code** | Unused functions, variables, imports | Low |

### 1.2 AI Detection Prompt

```
Analyze this codebase for code smells. For each finding:
1. Smell type (from list above)
2. File:line
3. Severity (High/Medium/Low)
4. Why it's a problem
5. Refactoring suggestion

List smells sorted by severity.

[PASTE CODE or REPO PATH]
```

### 1.3 Example: AI Detects Long Function

```javascript
// ❌ BEFORE — Long function (72 lines)
async function processOrder(orderId, userId, paymentMethod, shippingAddress, couponCode) {
  // validation
  if (!orderId) throw new Error('Missing orderId');
  if (!userId) throw new Error('Missing userId');
  if (!paymentMethod) throw new Error('Missing payment method');
  // ... 10 more validation lines

  // fetch data
  const order = await Order.findById(orderId);
  const user = await User.findById(userId);
  const product = await Product.findById(order.productId);
  const inventory = await Inventory.findByProductId(product.id);
  // ... more fetching

  // calculate pricing
  let subtotal = product.price * order.quantity;
  let discount = 0;
  if (couponCode) {
    const coupon = await Coupon.findByCode(couponCode);
    discount = subtotal * (coupon.discountPercent / 100);
  }
  let tax = (subtotal - discount) * 0.1;
  let shipping = shippingMethod === 'express' ? 15 : 5;
  let total = subtotal - discount + tax + shipping;
  // ... 30 more lines
}
```

**AI Suggestion:**

```
Smell: Long Function (72 lines) — SEVERITY: HIGH
File: src/services/orderService.js:1
Problem: Does validation, data fetching, pricing, inventory check, payment,
         and notification in one function. Violates Single Responsibility.
Fix: Extract into methods:
  - validateInputs(orderId, userId, paymentMethod)
  - fetchOrderData(orderId, userId, productId)
  - calculatePricing(product, quantity, couponCode)
  - processPayment(order, paymentMethod)
  - sendNotifications(user, order)
```

### 1.4 Example: AI Detects Duplicated Code

```javascript
// ❌ BEFORE — Duplicated validation logic
// File 1: userController.js
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) throw new Error('Invalid email');
}

// File 2: authController.js
function checkEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) throw new Error('Email not valid');
}

// ✅ AFTER — DRY
// shared/validators.js
import { z } from 'zod';
export const emailSchema = z.string().email('Invalid email');
```

---

## 2. Refactoring Strategy

### 2.1 AI-Guided Refactoring Workflow

```
[1. PLAN]     → AI analisis code, propose refactor plan
[2. APPROVE]  → Developer review plan, approve/reject
[3. EXECUTE]  → AI execute refactoring (or pair-program)
[4. VERIFY]   → AI run tests, lint, type-check
[5. COMMIT]   → AI create structured commit message
```

### 2.2 Plan Phase — AI Output

```
## Refactoring Plan: `processOrder` function

### Current State
- 72 lines, 5 responsibilities
- 6 parameters
- Mixed concerns: validation, data fetching, business logic, payment

### Target Architecture
```
processOrder(orderInput) → orchestrator
  ├── validateOrderInput(orderInput)
  ├── fetchOrderEntities(orderInput) → { order, user, product, inventory }
  ├── calculateOrderPricing(pricingInput) → { subtotal, discount, tax, shipping, total }
  ├── executePayment(paymentInput) → paymentResult
  ├── updateInventory(productId, quantity)
  └── notifyOrderConfirmation(userId, orderConfirmation)
```

### Steps
1. Extract `validateOrderInput()` — move validation (20 lines)
2. Extract `fetchOrderEntities()` — move DB calls (15 lines)
3. Create `PricingCalculator` class (25 lines)
4. Extract payment logic into `PaymentService`
5. Extract notification into `NotificationService`
6. Update `processOrder` to orchestrate (8 lines)

### Risk Assessment
- Medium risk: PricingCalculator changes affect order total logic
- Low risk: Other extractions are pure moves
- Mitigation: Write characterisation tests before refactoring
```

### 2.3 Execute Phase — AI Assisted

```
Execute step 1: Extract validateOrderInput.

Current code (L1-L12):
  if (!orderId) throw new Error('Missing orderId');
  if (!userId) throw new Error('Missing userId');
  ...

Refactored:
function validateOrderInput(input) {
  const schema = z.object({
    orderId: z.string().uuid(),
    userId: z.string().uuid(),
    paymentMethod: z.enum(['card', 'gopay', 'bank_transfer']),
    shippingAddress: z.string().min(10),
    couponCode: z.string().optional(),
  });
  return schema.parse(input);
}
```

### 2.4 Verify Phase

```bash
# AI runs verification suite
npm run lint          # ✅ Pass
npx tsc --noEmit      # ✅ Pass
npm run test          # ✅ All 47 tests pass
npm run test -- --coverage  # ✅ Lines: 88% (was 85%)
```

### 2.5 Commit Phase — AI-Generated Message

```
refactor(orders): extract processOrder into focused modules

- Extract validateOrderInput with zod schema
- Break up monolithic processOrder into 5 smaller functions
- Create PricingCalculator class for pricing logic
- Create PaymentService for payment processing
- Add characterisation tests for legacy behaviour
- Preserve all existing business rules

Closes #342
```

---

## 3. Migration Patterns

### 3.1 Library Upgrade (Express v4 → v5)

**AI Prompt:**

```
I need to upgrade Express from v4 to v5 in this codebase.

Current: Express v4.18.x
Target: Express v5.0.x

Breaking changes to handle:
- `app.del()` removed → use `app.delete()`
- `res.send(body)` no longer auto-ends
- Async error handling: errors must be caught explicitly
- Path route matching changes

Generate migration guide with code diffs for each change.
```

### 3.2 Framework Migration (JavaScript → TypeScript)

**AI Prompt:**

```
Migrate this JavaScript Express API to TypeScript.

Requirements:
- Add TypeScript config (strict mode)
- Type all request/response handlers
- Create shared type definitions
- Keep existing runtime behaviour unchanged

Process:
1. First, rename all .js to .ts
2. Add type annotations
3. Create interfaces for models
4. Fix any type errors
5. Run full test suite

Generate the migration step-by-step with code examples.
```

### 3.3 Pattern Change (Callback → Async/Await)

```javascript
// ❌ BEFORE: Callback hell
function getUserOrders(userId, callback) {
  db.query('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) return callback(err);
    db.query('SELECT * FROM orders WHERE user_id = ?', [user.id], (err, orders) => {
      if (err) return callback(err);
      callback(null, orders);
    });
  });
}

// ✅ AFTER: Async/await
async function getUserOrders(userId) {
  const [user] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
  const orders = await db.query('SELECT * FROM orders WHERE user_id = ?', [user.id]);
  return orders;
}
```

---

## 4. Monolith → Service Extraction

### 4.1 AI-Assisted Service Boundary Detection

**Prompt:**

```
Analyze this monolithic application and propose service boundaries.

Current structure:
src/
  controllers/    # 15 controllers
  models/         # 20 models
  services/       # 8 services (tightly coupled)
  middleware/     # 5 middleware
  utils/          # 12 utilities

Business domains:
- User management (auth, profile, settings)
- Product catalog (CRUD, categories, search)
- Order processing (cart, checkout, payment, shipping)
- Inventory management (stock, warehouse, suppliers)
- Notification (email, SMS, push)

Use Domain-Driven Design principles.
Identify:
1. Which services to extract first (highest coupling)
2. Shared kernel vs anticorruption layer
3. Event-driven boundaries vs REST boundaries
4. Data ownership per service
```

### 4.2 Extraction Strategy

**Example: Extract Notification Service**

```javascript
// ❌ BEFORE: Tight coupling inside monolith
// orderService.js — directly calls email service
const nodemailer = require('nodemailer');

async function confirmOrder(order) {
  // ... business logic ...

  // Tight coupling to email implementation
  const transporter = nodemailer.createTransport({ ... });
  await transporter.sendMail({
    to: order.userEmail,
    subject: 'Order Confirmed',
    text: `Your order ${order.id} is confirmed.`,
  });
}

// ✅ AFTER: Service extraction with event
// orderService.js — publishes event only
async function confirmOrder(order) {
  // ... business logic ...

  await eventBus.publish('order.confirmed', {
    orderId: order.id,
    userEmail: order.userEmail,
    total: order.total,
  });
}

// notification-service/index.js — handles event
eventBus.subscribe('order.confirmed', async (event) => {
  await emailService.send({
    to: event.userEmail,
    template: 'order-confirmation',
    data: { orderId: event.orderId, total: event.total },
  });
});
```

### 4.3 Strangler Fig Pattern

```
[Monolith] → [Monolith + New Service (side-by-side)] → [New Service replaces monolith feature]
```

**AI Prompt:**

```
I want to extract Notification from monolith using Strangler Fig pattern.

Phase 1: Add notification-service alongside monolith
- Route notification-related requests to new service
- Keep shared database initially

Phase 2: Migrate consumers
- Monolith services publish events instead of calling email directly
- New service listens and processes

Phase 3: Remove from monolith
- Delete notification code from monolith
- Transfer ownership of notification data

Generate implementation for Phase 1.
```

---

## 5. Database Migration

### 5.1 Schema Change with AI

**Prompt:**

```
Generate a migration plan for renaming `username` to `handle` in PostgreSQL.

Requirements:
- Zero downtime migration
- Old field still readable during transition
- Rollback script included
- Handle concurrent writes safely

Migration type: Expand-Contract (Meyer's pattern)
```

### 5.2 AI-Generated Migration Script

```sql
-- Phase 1: Expand — add new column
BEGIN;
ALTER TABLE users ADD COLUMN handle VARCHAR(255);
CREATE INDEX idx_users_handle ON users(handle);
-- Backfill in batches
UPDATE users SET handle = username WHERE handle IS NULL LIMIT 1000;
COMMIT;

-- Phase 2: Migrate application code to use handle
-- (deploy application update)

-- Phase 3: Contract — drop old column when safe
BEGIN;
ALTER TABLE users DROP COLUMN username;
DROP INDEX IF EXISTS idx_users_username;
COMMIT;
```

### 5.3 Rollback Plan

```sql
-- Rollback script
BEGIN;
ALTER TABLE users ADD COLUMN username VARCHAR(255);
UPDATE users SET username = handle;
ALTER TABLE users DROP COLUMN handle;
COMMIT;
```

### 5.4 Data Migration with Verification

```javascript
// AI-generated data migration script
async function migrateEmailFormat() {
  const batchSize = 100;
  let migrated = 0;
  let errors = 0;

  while (true) {
    const users = await db.query(
      `SELECT id, email FROM users
       WHERE email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'
       LIMIT $1`, [batchSize]
    );

    if (users.rows.length === 0) break;

    for (const user of users.rows) {
      try {
        const normalized = user.email.toLowerCase().trim();
        await db.query('UPDATE users SET email = $1 WHERE id = $2', [normalized, user.id]);
        migrated++;
      } catch (err) {
        errors++;
        console.error(`Failed to migrate user ${user.id}:`, err);
      }
    }
  }

  console.log(`Migration complete: ${migrated} migrated, ${errors} errors`);
  return { migrated, errors };
}
```

---

## 6. Latihan: AI Refactor Monolith ke Layered Architecture

### Tugas

Kamu diberikan kode monolitik Express.js yang menangani order management. Refactor menggunakan AI assistance.

**Current Code:**

```javascript
// monolith.js — 300+ lines, all in one file
const express = require('express');
const { Pool } = require('pg');
const app = express();
const pool = new Pool({ /* config */ });
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({ /* config */ });

// All in one: routes, validation, DB logic, email, auth
app.post('/api/orders', async (req, res) => {
  const { userId, productId, quantity, paymentMethod, couponCode } = req.body;

  // Validation inline
  if (!userId || !productId || !quantity || !paymentMethod) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  // DB query inline
  const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
  if (user.rows.length === 0) return res.status(404).json({ error: 'User not found' });

  const product = await pool.query('SELECT * FROM products WHERE id = $1', [productId]);
  if (product.rows.length === 0) return res.status(404).json({ error: 'Product not found' });

  // Business logic inline
  const subtotal = product.rows[0].price * quantity;
  let discount = 0;
  if (couponCode) {
    const coupon = await pool.query('SELECT * FROM coupons WHERE code = $1', [couponCode]);
    if (coupon.rows.length > 0) {
      discount = subtotal * (coupon.rows[0].discount_percent / 100);
    }
  }
  const tax = (subtotal - discount) * 0.11;
  const total = subtotal - discount + tax;

  // Insert inline
  const order = await pool.query(
    `INSERT INTO orders (user_id, product_id, quantity, subtotal, discount, tax, total, payment_method, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending') RETURNING *`,
    [userId, productId, quantity, subtotal, discount, tax, total, paymentMethod]
  );

  // Email inline
  await transporter.sendMail({
    to: user.rows[0].email,
    subject: 'Order Confirmation',
    text: `Order #${order.rows[0].id} confirmed. Total: $${total}`,
  });

  res.status(201).json(order.rows[0]);
});

app.listen(3000);
```

### Langkah-Langkah

1. **Deteksi smell** — Minta AI identifikasi semua code smell
2. **Buat rencana refactor** — AI usulkan arsitektur layered
3. **Ekstrak layer**:
   - `routes/orderRoutes.js` — routing
   - `controllers/orderController.js` — request handling
   - `services/orderService.js` — business logic
   - `repositories/orderRepository.js` — DB queries
   - `validators/orderValidator.js` — input validation
   - `services/emailService.js` — email sending
4. **Verifikasi** — test, lint, type-check tetap pass
5. **Commit** — AI buat commit message

### Target Architecture

```
src/
├── routes/
│   └── orderRoutes.js
├── controllers/
│   └── orderController.js
├── services/
│   ├── orderService.js
│   └── emailService.js
├── repositories/
│   └── orderRepository.js
├── validators/
│   └── orderValidator.js
├── middleware/
│   └── errorHandler.js
└── app.js
```

### Kriteria Sukses

- [ ] Semua code smell teridentifikasi (min 4 jenis)
- [ ] Refactor plan jelas dengan step-by-step
- [ ] Layered architecture terimplementasi
- [ ] Database tetap konsisten (tidak ada data loss)
- [ ] Semua endpoint berfungsi sama seperti sebelumnya
- [ ] Test suite tetap passing 100%
- [ ] Commit message terstruktur (conventional commit)

### Advanced Challenge

- **Database migration**: Tambah kolom `shipping_address` ke tabel orders dengan zero-downtime migration
- **Service extraction**: Extract `emailService` menjadi microservice terpisah (simulasi dengan event bus)
- **Pattern migration**: Ganti `pg` client dengan Prisma ORM menggunakan AI assistance

---

## Referensi

- [Martin Fowler — Refactoring](https://refactoring.com/)
- [Code Smells Catalog](https://refactoring.guru/refactoring/smells)
- [Strangler Fig Pattern](https://martinfowler.com/bliki/StranglerFigApplication.html)
- [Expand-Contract Migration Pattern](https://www.prisma.io/dataguide/types/relational/expand-and-contract-pattern)
- [Domain-Driven Design](https://www.domainlanguage.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
