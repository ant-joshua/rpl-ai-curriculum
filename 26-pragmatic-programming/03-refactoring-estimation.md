# 26.3 Refactoring & Estimation

## Refactoring Patterns

### Extract Function

Memecah blok kode besar menjadi function terpisah. Pattern paling dasar dan paling powerful.

```typescript
// SEBELUM — satu function besar, terlalu banyak tanggung jawab
async function processInvoice(invoiceId: string): Promise<InvoiceResult> {
  const invoice = await db.invoices.findUnique({ where: { id: invoiceId } });
  if (!invoice) throw new Error("Invoice not found");

  if (invoice.status !== "pending") throw new Error("Invoice already processed");

  // Kalkulasi subtotal, diskon, pajak
  let subtotal = 0;
  for (const item of invoice.items) {
    subtotal += item.price * item.qty;
  }
  let discount = 0;
  if (subtotal > 1_000_000) discount = subtotal * 0.1;
  if (invoice.coupon === "SALE50") discount = Math.max(discount, subtotal * 0.5);
  const tax = (subtotal - discount) * 0.11;
  const total = subtotal - discount + tax;

  // Simpan ke DB
  await db.invoices.update({
    where: { id: invoiceId },
    data: { subtotal, discount, tax, total, status: "processed" },
  });

  // Kirim email
  await sendEmail({
    to: invoice.customerEmail,
    subject: `Invoice ${invoice.number} — Processed`,
    html: `<p>Total: Rp${total.toLocaleString()}</p>`,
  });

  return { invoiceId, subtotal, discount, tax, total, status: "processed" };
}

// SESUDAH — extract function
async function processInvoice(invoiceId: string): Promise<InvoiceResult> {
  const invoice = await findInvoiceOrThrow(invoiceId);
  assertInvoicePending(invoice);

  const { subtotal, discount, tax, total } = calculateInvoice(invoice);
  await updateInvoiceStatus(invoiceId, { subtotal, discount, tax, total });
  await notifyCustomer(invoice, total);

  return { invoiceId, subtotal, discount, tax, total, status: "processed" };
}

async function findInvoiceOrThrow(id: string): Promise<Invoice> {
  const invoice = await db.invoices.findUnique({ where: { id } });
  if (!invoice) throw new Error("Invoice not found");
  return invoice;
}

function assertInvoicePending(invoice: Invoice): void {
  if (invoice.status !== "pending") throw new Error("Invoice already processed");
}

function calculateInvoice(invoice: Invoice) {
  const subtotal = invoice.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discount = calculateDiscount(subtotal, invoice.coupon);
  const tax = Math.round((subtotal - discount) * 0.11);
  const total = subtotal - discount + tax;
  return { subtotal, discount, tax, total };
}

function calculateDiscount(subtotal: number, coupon?: string): number {
  let discount = subtotal > 1_000_000 ? subtotal * 0.1 : 0;
  if (coupon === "SALE50") discount = Math.max(discount, subtotal * 0.5);
  return discount;
}
```

### Rename — jangan takut rename

```typescript
// SEBELUM — nama tidak jelas
function getData(id: string) {
  return db.query(`SELECT * FROM t WHERE id = $1`, [id]);
}

// SESUDAH — rename sesuai domain
function findUserById(id: string): Promise<User | null> {
  return db.query(`SELECT * FROM users WHERE id = $1`, [id]);
}

// Rename variable
const arr = [10, 20, 30];       // ❌
const temperatures = [10, 20, 30]; // ✅

const res = await fetch(url);   // ❌
const response = await fetch(url); // ✅
```

### Decompose Conditional

Ubah kondisi kompleks menjadi function bernama.

```typescript
// SEBELUM — kondisi complex di dalam if
function calculateDiscount(price: number, user: User, order: Order): number {
  if (
    (user.role === "premium" || user.role === "vip") &&
    user.registrationDate < new Date("2024-01-01") &&
    order.items.length >= 3 &&
    order.totalAmount > 200000 &&
    !user.hasFlag("abuse")
  ) {
    return price * 0.2;
  }
  return 0;
}

// SESUDAH — setiap kondisi jadi function
function calculateDiscount(price: number, user: User, order: Order): number {
  if (isEligibleForPremiumDiscount(user, order)) {
    return price * 0.2;
  }
  return 0;
}

function isEligibleForPremiumDiscount(user: User, order: Order): boolean {
  return (
    isPremiumMember(user) &&
    isLoyalCustomer(user) &&
    meetsMinimumOrder(order) &&
    !hasAbuseFlag(user)
  );
}

function isPremiumMember(user: User): boolean {
  return user.role === "premium" || user.role === "vip";
}

function isLoyalCustomer(user: User): boolean {
  return user.registrationDate < new Date("2024-01-01");
}

function meetsMinimumOrder(order: Order): boolean {
  return order.items.length >= 3 && order.totalAmount > 200_000;
}

function hasAbuseFlag(user: User): boolean {
  return user.hasFlag("abuse");
}
```

### Extract Class / Module

Ketika satu function/class terlalu banyak parameter atau terlalu besar.

```typescript
// SEBELUM — satu file 400 baris
function sendNotification(user: User, type: string) {
  // logic email
  // logic SMS
  // logic push notification
  // logic in-app notification
  // formatting pesan
  // template rendering
}

// SESUDAH — modular
// notifications/email.service.ts
export class EmailNotificationService { /* ... */ }

// notifications/sms.service.ts
export class SMSNotificationService { /* ... */ }

// notifications/push.service.ts
export class PushNotificationService { /* ... */ }

// notifications/factory.ts
export function createNotificationService(type: NotificationType) { /* ... */ }
```

---

## Estimation Techniques

### PERT (Program Evaluation and Review Technique)

Rumus: **Estimate = (Optimistic + 4 × Most Likely + Pessimistic) / 6**

```typescript
function pertEstimate(
  optimistic: number,
  mostLikely: number,
  pessimistic: number
): number {
  return (optimistic + 4 * mostLikely + pessimistic) / 6;
}

// Contoh: bikin fitur login
// Optimistic: 2 hari (semua lancar)
// Most likely: 4 hari
// Pessimistic: 10 hari (banyak bug & revisi)
console.log(pertEstimate(2, 4, 10)); // ~4.67 hari

// Standar deviasi
function pertStdDev(pessimistic: number, optimistic: number): number {
  return (pessimistic - optimistic) / 6;
}
// 90% yakin selesai dalam: estimate + (1.645 × stdDev)
```

### Planning Poker

Teknik estimasi tim pakai kartu Fibonacci (1, 2, 3, 5, 8, 13, 21, 34, ?, ∞).

Langkah:
1. Product owner jelaskan user story
2. Setiap anggota tim pilih kartu secara rahasia
3. Semua buka kartu bersamaan
4. Kalau ada perbedaan besar (misal 2 vs 21), diskusi kenapa
5. Voting ulang sampai mendekati konsensus

### Reference Task Method

Bandingkan task baru dengan task yang sudah pernah dikerjakan.

```typescript
// Buat reference task database
const REFERENCE_TASKS = {
  "login-form": { hours: 4, complexity: "low" },
  "crud-users": { hours: 16, complexity: "medium" },
  "payment-integration": { hours: 40, complexity: "high" },
  "export-pdf": { hours: 12, complexity: "medium" },
} as const;

function estimateFromReference(
  taskDescription: string,
  similarTask: keyof typeof REFERENCE_TASKS,
  complexityDiff: number // multiplier: 1 = sama, 2 = dua kali lebih complex
): number {
  const reference = REFERENCE_TASKS[similarTask];
  return Math.round(reference.hours * complexityDiff);
}

// Task baru: "export Excel report" mirip "export-pdf", slightly lebih sederhana
console.log(estimateFromReference("export-excel", "export-pdf", 0.8));
// ~10 jam
```

---

## Legacy Code Approach

Strategi kerja dengan kode legacy (tanpa test, tanpa dokumentasi):

### 1. Characterization Test

Tulis test yang menangkap behavior *sekarang* sebelum refactor.

```typescript
describe("legacy calculateScore", () => {
  it("menghasilkan output yang sama setelah refactor", () => {
    // Arrange - bikin input sample
    const input = { a: 10, b: "x", c: true };

    // Act - jalanin legacy
    const legacyResult = calculateScoreLegacy(input.a, input.b, input.c);

    // Act - jalanin kode baru
    const newResult = calculateScore(input.a, input.b, input.c);

    // Assert - harus identik
    expect(newResult).toBe(legacyResult);
  });
});
```

### 2. Strangler Fig Pattern

Ganti komponen lama sedikit demi sedikit tanpa big bang rewrite.

```typescript
// Step 1: Tambah adapter, dua-duanya jalan
class UserService {
  find(id: string): User {
    // Legacy SQL query
    return oldDb.query(`SELECT * FROM users WHERE id = '${id}'`);
  }
}

class UserServiceNew {
  find(id: string): User {
    // New repository
    return userRepo.findById(id);
  }
}

// Step 2: Feature flag, sebagian traffic pake baru
class UserServiceRouter {
  constructor(
    private legacy: UserService,
    private modern: UserServiceNew
  ) {}

  find(id: string): User {
    // Slowly ramp up: 10% -> 50% -> 100%
    return shouldUseModernService(id)
      ? this.modern.find(id)
      : this.legacy.find(id);
  }
}
```

### 3. Refactor First, Add Feature Later

Jangan tambah fitur baru ke kode kotor — bersihin dulu, *lalu* tambah fitur.

---

## Latihan

1. **Extract Function** — Pecah function ini jadi 4+ function kecil bernama jelas:
   ```typescript
   function processPayment(order: Order, payment: Payment): string {
     if (!order || !payment) return "Invalid data";
     if (order.status !== "confirmed") return "Order not confirmed";
     if (payment.amount < order.total) return "Insufficient payment";
     const fee = payment.method === "credit_card" ? order.total * 0.025 : payment.method === "bank_transfer" ? order.total * 0.002 : 0;
     const netAmount = payment.amount - fee;
     db.orders.update({ where: { id: order.id }, data: { status: "paid", paidAt: new Date() } });
     db.transactions.create({ data: { orderId: order.id, amount: netAmount, method: payment.method } });
     sendEmail({ to: order.customerEmail, subject: "Payment received", text: `Thank you! Rp${netAmount}` });
     return "Payment successful";
   }
   ```

2. **Decompose Conditional** — Ubah kondisi kompleks jadi function-function bernama:
   ```typescript
   function canRedeemVoucher(user: User, voucher: Voucher, order: Order): boolean {
     if (
       voucher.expiresAt > new Date() &&
       !user.banned &&
       user.points >= voucher.minPoints &&
       order.total >= voucher.minPurchase &&
       (voucher.maxUsage === null || voucher.usedCount < voucher.maxUsage) &&
       (voucher.userLimit === null || !voucher.redeemedBy.includes(user.id))
     ) {
       return true;
     }
     return false;
   }
   ```

3. **PERT Estimation** — Diberikan data: Optimistic=3 hari, Most Likely=7 hari, Pessimistic=15 hari. Hitung PERT estimate dan 90% confidence interval.

4. **Legacy Refactor** — Berikut function 80 baris tanpa type, tanpa test, parameter `any`. Tulis characterization test dulu, lalu refactor:
   ```typescript
   function save(d: any) {
     let x = d.n;
     let y = d.a;
     let z = d.e;
     // ... 70 baris messy logic
     return { id: d.id, name: x, age: y, email: z };
   }
   ```
