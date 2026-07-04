# AI Development Workflow — Latihan

## Level 1: Dasar

### 1. AI Coding — Prompt Engineering
**Pertanyaan:** Kamu punya fungsi JavaScript yang perlu ditulis. Buat prompt untuk AI assistant yang akan menghasilkan kode berkualitas tinggi:

```typescript
// Fungsi yang perlu ditulis:
// Mengurutkan array objek berdasarkan beberapa key secara dinamis
// Contoh: sortObjects(users, [{ key: 'age', order: 'asc' }, { key: 'name', order: 'desc' }])
```

Tulis prompt yang menghasilkan kode TypeScript dengan:
- JSDoc documentation
- Type safety
- Error handling

**Hint:** Prompt yang efektif: (1) spesifik input/output, (2) sebutkan edge cases, (3) minta type safety, (4) berikan contoh usage. Jangan bilang "buat fungsi sorting" — bilang spesifik "sort array of objects by multiple keys with type safety dan error handling untuk invalid key".

---

### 2. AI Code Review — Identifikasi Masalah
**Pertanyaan:** Review kode berikut dan identifikasi masalah keamanan, performa, dan best practices:

```typescript
// app.ts
import express from 'express';
const app = express();

app.post('/api/users', (req, res) => {
  const { name, email, password } = req.body;
  
  // Simpan user ke database
  db.query(`INSERT INTO users (name, email, password) VALUES ('${name}', '${email}', '${password}')`);
  
  // Kirim email welcome
  sendEmail(email, 'Welcome', `Hi ${name}, welcome!`);
  
  res.json({ message: 'User created', password });
});

app.get('/api/users/:id', (req, res) => {
  const user = db.query(`SELECT * FROM users WHERE id = ${req.params.id}`);
  res.json(user);
});
```

Sebutkan minimal 5 masalah dan berikan perbaikan untuk masing-masing.

**Hint:** Masalah: (1) SQL injection pada INSERT dan SELECT, (2) password dikirim ke client, (3) tidak ada input validation, (4) tidak ada try-catch, (5) tidak ada rate limiting, (6) password di-hash. Gunakan parameterized queries, `res.json({ message: 'User created' })` tanpa password, dan library seperti Zod untuk validation.

---

### 3. AI Test Generation — Unit Test
**Pertanyaan:** Berikan prompt ke AI untuk menghasilkan unit test lengkap untuk fungsi berikut:

```typescript
// price-calculator.ts
interface CartItem {
  name: string;
  price: number;
  quantity: number;
  category: 'food' | 'electronics' | 'clothing';
}

function calculateTotal(items: CartItem[], options: {
  discountCode?: string;
  memberLevel?: 'gold' | 'silver' | 'bronze';
  shipping?: 'express' | 'standard';
}): { subtotal: number; discount: number; shipping: number; total: number } {
  let subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let discount = 0;
  
  // Discount code
  if (options.discountCode === 'SAVE10') discount = subtotal * 0.10;
  if (options.discountCode === 'SAVE20') discount = subtotal * 0.20;
  
  // Member discount
  if (options.memberLevel === 'gold') discount = Math.max(discount, subtotal * 0.15);
  if (options.memberLevel === 'silver') discount = Math.max(discount, subtotal * 0.08);
  
  // Shipping
  const shipping = options.shipping === 'express' ? 25000 : 10000;
  
  return {
    subtotal,
    discount,
    shipping,
    total: subtotal - discount + shipping
  };
}
```

Tulis prompt yang meminta AI menghasilkan test untuk: happy path, edge cases (keranjang kosong), dan kombinasi discount.

**Hint:** Prompt harus spesifik: (1) sebutkan framework (Vitest), (2) minta test cases untuk setiap branch logic, (3) minta edge cases seperti items kosong, (4) minta assertion yang tepat (toBe dengan toleransi untuk floating point jika ada). Contoh: "Generate Vitest tests for calculateTotal. Test: empty cart, single item, multiple items, discount codes (SAVE10, SAVE20), member levels, shipping options, dan kombinasi discount code + member level."

---

### 4. AI Debugging — Trace Error
**Pertanyaan:** Aplikasi mengalami error berikut di production:

```
TypeError: Cannot read properties of undefined (reading 'map')
    at UserList (/app/components/UserList.tsx:15:23)
    at renderWithHooks (/node_modules/react-dom/...)
    at mountIndeterminateComponent (/node_modules/react-dom/...)

Console error sebelum crash:
API Response: { "status": "success", "data": null }
```

```typescript
// UserList.tsx
export default function UserList() {
  const { data: users } = useQuery('users', fetchUsers);
  
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

Gunakan AI assistant untuk debug. Tulis prompt yang efektif dan sebutkan informasi apa yang harus dilampirkan ke AI.

**Hint:** Prompt harus include: (1) error stack trace lengkap, (2) source code file, (3) API response yang diterima (data: null), (4) expected behavior. Fix: tambah null check `users?.map()` atau `users.map()` setelah validasi data exists. Juga perlu handle loading state dengan `useQuery` yang benar.

---

## Level 2: Menengah

### 5. AI Code Review — Pull Request Review
**Pertanyaan:** Kamu diminta mereview PR dari teammate. Berikut diff-nya:

```diff
// src/services/order.ts
+ export async function processOrder(orderId: string) {
+   const order = await db.order.findUnique({ where: { id: orderId } });
+   
+   // Check stock
+   for (const item of order.items) {
+     const product = await db.product.findUnique({ where: { id: item.productId } });
+     if (product.stock < item.quantity) {
+       throw new Error(`Insufficient stock for ${product.name}`);
+     }
+   }
+   
+   // Deduct stock
+   for (const item of order.items) {
+     await db.product.update({
+       where: { id: item.productId },
+       data: { stock: { decrement: item.quantity } }
+     });
+   }
+   
+   // Process payment
+   const payment = await midtrans.createTransaction({
+     order_id: orderId,
+     amount: order.total,
+   });
+   
+   return { orderId, paymentId: payment.id };
+ }
```

Gunakan AI untuk review. Tulis minimal 6 komentar review yang mencakup: race condition, error handling, database transactions, dan scalability.

**Hint:** Masalah: (1) race condition — cek stock dan deduct stock terpisah, bisa concurrent order mengambil stock sama, (2) tidak ada database transaction — jika pembayaran gagal setelah stock di-deduct, stock tidak dikembalikan, (3) N+1 query — loop untuk check dan update stock, (4) tidak ada logging, (5) tidak ada idempotency check, (6) error handling tidak spesifik.

---

### 6. AI CI/CD — Workflow Configuration
**Pertanyaan:** Buat prompt untuk AI generate GitHub Actions workflow yang:

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

# === LENGKAPI WORKFLOW INI ===
jobs:
  # Job 1: Lint & Type Check
  # Job 2: Unit Tests dengan coverage
  # Job 3: Build
  # Job 4: Deploy ke staging (hanya di push ke develop)
  # Job 5: Deploy ke production (hanya di push ke main, butuh approval)
```

Tulis prompt yang menghasilkan workflow lengkap dengan:
- Caching node_modules
- Matrix testing untuk Node 18 & 20
- Coverage threshold check
- Environment secrets untuk deploy

**Hint:** Prompt harus include: (1) trigger conditions, (2) job dependencies (`needs`), (3) caching strategy (`actions/cache`), (4) matrix strategy, (5) environment protection rules. Contoh prompt: "Generate GitHub Actions CI/CD for Node.js TypeScript project. Jobs: lint, test (matrix Node 18/20, coverage threshold 80%), build, deploy-staging (develop only), deploy-production (main only, requires approval). Use pnpm, cache node_modules."

---

### 7. AI Debugging — Memory Leak
**Pertanyaan:** Aplikasi Next.js mengalami memory leak di production. Request berikut dari AI assistant:

```
User: "Aplikasi saya memory usage naik terus dari 200MB sampai 1.5GB 
dalam 2 jam. Berikut kode yang suspect:"

[attach kode]
```

```typescript
// lib/cache.ts
const cache = new Map();

export function getCached(key: string, fetcher: () => Promise<any>) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const result = fetcher();
  cache.set(key, result);
  return result;
}

// lib/socket-manager.ts
const connections = new Map<string, WebSocket>();

export function addConnection(userId: string, ws: WebSocket) {
  connections.set(userId, ws);
}

export function removeConnection(userId: string) {
  connections.delete(userId);
}

// pages/api/stream.ts
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = authenticate(req);
  
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  const interval = setInterval(() => {
    const data = getDataForUser(user.id);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }, 1000);
  
  req.on('close', () => {
    // cleanup
  });
}
```

Gunakan AI untuk menjelaskan memory leak di 3 lokasi kode di atas dan perbaikannya.

**Hint:** Leak 1: `cache` Map tidak pernah di-cleanup — tambah TTL atau max size. Leak 2: `connections` Map tidak cleanup saat user disconnect — pastikan `removeConnection` dipanggil di `close` event. Leak 3: `setInterval` tidak di-clear saat connection close — `req.on('close')` kosong, tidak ada `clearInterval(interval)`.

---

## Level 3: Lanjutan

### 8. AI-Assisted Architecture — System Design
**Pertanyaan:** Gunakan AI untuk mendesain arsitektur sistem e-commerce yang skalabel. Berikan prompt yang mencakup:

1. **Scale**: 1 juta user aktif, 10K orders/hari
2. **Requirements**: real-time inventory, payment integration, search
3. **Constraints**: budget AWS < $500/bulan, tim 3 orang

Tulis prompt untuk AI yang menghasilkan:
- High-level architecture diagram (dalam format text)
- Tech stack recommendation dengan alasan
- Database schema untuk orders, products, dan inventory
- Scaling strategy untuk search dan order processing

**Hint:** Prompt harus sangat spesifik. Contoh: "Design a scalable e-commerce architecture for 1M active users, 10K orders/day. Requirements: real-time inventory sync, Midtrans payment, product search. Budget: $500/mo AWS. Team: 3 devs. Provide: (1) architecture diagram in ASCII, (2) tech stack with cost breakdown, (3) database schema (PostgreSQL for orders/products, Redis for inventory cache, Meilisearch for search), (4) scaling strategy. Use serverless where possible to save cost."

---

### 9. AI Prompt Chaining — Multi-Step Workflow
**Pertanyaan:** Buat prompt chain (serangkaian prompt berurutan) untuk AI membangun fitur "Invoice Generator":

```
Step 1: Generate TypeScript interfaces untuk invoice data model
Step 2: Generate PostgreSQL schema dari interfaces
Step 3: Generate API endpoint (CRUD) menggunakan Prisma
Step 4: Generate unit tests untuk API endpoints
Step 5: Generate React component untuk invoice form
```

Tulis setiap prompt dalam chain dan jelaskan kenapa urutan ini penting.

**Hint:** Kenapa urutan ini: (1) Interfaces jadi kontrak data yang jelas, (2) Schema dari interfaces memastikan konsistensi, (3) API dari schema memastikan query benar, (4) Tests dari API memverifikasi logic, (5) Frontend dari API memastikan integration benar. Setiap step output jadi input untuk step berikutnya. Contoh Step 1: "Generate TypeScript interfaces for an invoice system: Invoice (id, number, customerId, items, subtotal, tax, total, status, dueDate, createdAt), InvoiceItem (id, invoiceId, productId, quantity, unitPrice, total), Customer (id, name, email, address). Include JSDoc and enums untuk InvoiceStatus."

---

### 10. AI Code Optimization — Performance
**Pertanyaan:** AI assistant memberikan kode berikut. Optimasi menggunakan AI untuk performa:

```typescript
// Slow query - fetching orders dengan items
async function getOrdersWithItems(userId: string) {
  const orders = await db.$queryRaw`
    SELECT * FROM orders WHERE user_id = ${userId} ORDER BY created_at DESC
  `;
  
  const ordersWithItems = [];
  for (const order of orders) {
    const items = await db.$queryRaw`
      SELECT * FROM order_items WHERE order_id = ${order.id}
    `;
    const products = [];
    for (const item of items) {
      const product = await db.$queryRaw`
        SELECT * FROM products WHERE id = ${item.product_id}
      `;
      products.push({ ...item, product });
    }
    ordersWithItems.push({ ...order, items: products });
  }
  
  return ordersWithItems;
}
```

Buat prompt yang meminta AI:
1. Identifikasi N+1 query dan jumlah total queries
2. Rewrite menggunakan Prisma includes
3. Tambahkan pagination dan select only needed fields
4. Tambahkan caching strategy

**Hint:** N+1: 1 query untuk orders + N queries untuk items + N*M queries untuk products. Total bisa 1 + N + N*M. Fix: gunakan Prisma `include: { items: { include: { product: true } } }` atau `$queryRaw` dengan JOIN. Pagination: tambah `skip` dan `take`. Caching: Redis cache untuk frequently accessed orders.
