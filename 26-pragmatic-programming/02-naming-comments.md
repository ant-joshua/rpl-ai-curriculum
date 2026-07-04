# 26.2 Naming & Comments

## Naming Convention

### Variable — kata benda, jelas, hindari singkatan

```typescript
// ❌ Buruk
const d = new Date();
const u = "Budi";
const n = [1, 2, 3];
const x = 0; // ini apaan?
let flag = true; // flag apa?

// ✅ Baik
const currentDate = new Date();
const userName = "Budi";
const scores = [1, 2, 3];
const maxRetryAttempts = 3;
let isUserLoggedIn = true;
let isActive = true;
```

### Function — kata kerja, deskriptif

```typescript
// ❌ Buruk
function data() { /* ... */ }
function process() { /* ... */ }
function handler() { /* ... */ }
function doStuff(a: number) { /* ... */ }

// ✅ Baik
function fetchUserById(id: number): Promise<User> { /* ... */ }
function calculateTotalPrice(items: Item[]): number { /* ... */ }
function validateEmail(email: string): boolean { /* ... */ }
function formatCurrency(amount: number): string { /* ... */ }
```

### Boolean — beri predikat (is, has, can, should)

```typescript
// ❌ Buruk
let visible = false; // visible apa?
let edit = true;     // edit mode? bisa diedit?
let dark = false;    // dark mode?

// ✅ Baik
let isVisible = false;
let isEditable = true;
let isDarkMode = false;
let hasPermission = true;
let canDelete = false;
let shouldShowWarning = true;
```

### Class — kata benda, PascalCase

```typescript
// ❌ Buruk
class user_service { /* ... */ }
class data { /* ... */ }
class helper { /* ... */ }

// ✅ Baik
class UserRepository { /* ... */ }
class InvoiceGenerator { /* ... */ }
class EmailSender { /* ... */ }
class DatabaseConnection { /* ... */ }
```

### Constants — UPPER_SNAKE_CASE untuk nilai primitif yang benar-benar konstan

```typescript
// ✅ Constant global
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const API_BASE_URL = "https://api.example.com/v2";
const TAX_RATE = 0.11;

// ⚠️ Bukan constant: dihitung runtime atau dari config
const config = loadConfig(); // const tapi bukan constant
const user = getUser();      // const tapi beda tiap request
```

---

## Function Size & Structure

### Aturan Praktis

- **Muat di layar** — ideal ≤ 20 baris, maksimal 40
- **Satu level abstraksi** — jangan campur high-level (business logic) dengan low-level (string manipulation)
- **Early return** — handle error case duluan, kurangi nesting

```typescript
// ❌ Terlalu panjang, nested dalam, campur level abstraksi
function processOrder(order: Order): string {
  let result = "";
  if (order) {
    if (order.items && order.items.length > 0) {
      let total = 0;
      for (let i = 0; i < order.items.length; i++) {
        const item = order.items[i];
        const price = item.price * item.qty;
        total += price;
      }
      if (total > 0) {
        if (order.coupon) {
          total = applyCoupon(total, order.coupon);
        }
        result = `Total: ${formatRupiah(total)}`;
      } else {
        result = "Total tidak valid";
      }
    } else {
      result = "Order kosong";
    }
  } else {
    result = "Order tidak ditemukan";
  }
  return result;
}

// ✅ Refactor — early return, extract, satu level abstraksi
function processOrder(order: Order | null): string {
  if (!order) return "Order tidak ditemukan";
  if (!order.items?.length) return "Order kosong";

  const total = calculateTotal(order.items);
  if (total <= 0) return "Total tidak valid";

  const finalTotal = order.coupon ? applyCoupon(total, order.coupon) : total;
  return `Total: ${formatRupiah(finalTotal)}`;
}

function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}
```

---

## Comments vs Code as Documentation

### Komentar yang Baik

```typescript
/**
 * Menghitung pajak PPN untuk transaksi e-commerce.
 * PPN 11% untuk transaksi di atas Rp100.000,
 * 0% untuk kebutuhan pokok (sesuai kategori).
 *
 * @param amount - nominal transaksi dalam Rupiah
 * @param category - kategori barang
 * @returns jumlah pajak yang harus dibayar
 */
function calculatePPN(amount: number, category: Category): number {
  if (amount <= 0) return 0;
  if (category.exemptFromTax) return 0;
  if (amount <= 100_000) return 0; // di bawah batas PPN
  return Math.round(amount * 0.11);
}
```

### Komentar yang Seharusnya Kode

```typescript
// ❌ Komentar menjelaskan "apa" — kode seharusnya sudah jelas
// Cek apakah user admin atau bukan
if (user.role === "admin" || user.role === "superadmin") { /* ... */ }

// ✅ Tulis ulang kode biar jelas tanpa komentar
const isAdmin = user.role === "admin" || user.role === "superadmin";
if (isAdmin) { /* ... */ }

// Atau pakai helper
function isAdminUser(user: User): boolean {
  return user.role === "admin" || user.role === "superadmin";
}
```

```typescript
// ❌ Komentar karena function punya nama buruk
// apply diskon untuk member vip
function a(m: number, d: boolean): number {
  return d ? m * 0.8 : m;
}

// ✅ Perbaiki nama — komentar tidak perlu
function applyVipDiscount(price: number, isVipMember: boolean): number {
  return isVipMember ? price * 0.8 : price;
}
```

### Kapan Komentar Diperlukan

- **Mengapa** — alasan keputusan teknis (bukan apa/cara)
- **API docs** — JSDoc untuk library/publik API
- **Gotcha / edge case** — kenapa handle case aneh ini
- **Referensi** — link ke ticket, spec, atau paper

```typescript
// Kenapa pakai Math.round? Floating point di JS:
// 0.1 + 0.2 === 0.30000000000000004
// https://floating-point-gui.de/
const rounded = Math.round(amount * 100) / 100;
```

---

## Magic Numbers Elimination

Magic number = angka mentah tanpa nama, bikin kode susah dipahami dan diubah.

```typescript
// ❌ Magic numbers berserakan
function shippingCost(weight: number): number {
  if (weight <= 5) return 10000;
  if (weight <= 10) return 15000;
  if (weight <= 20) return 25000;
  return 50000;
}

function calculateLateFee(days: number): number {
  return days * 2000;
}

// ✅ Constant dengan nama jelas
const SHIPPING_TIER_1_MAX_KG = 5;
const SHIPPING_TIER_1_COST = 10_000;
const SHIPPING_TIER_2_MAX_KG = 10;
const SHIPPING_TIER_2_COST = 15_000;
const SHIPPING_TIER_3_MAX_KG = 20;
const SHIPPING_TIER_3_COST = 25_000;
const SHIPPING_TIER_4_COST = 50_000;

const DAILY_LATE_FEE = 2_000;

function shippingCost(weight: number): number {
  if (weight <= SHIPPING_TIER_1_MAX_KG) return SHIPPING_TIER_1_COST;
  if (weight <= SHIPPING_TIER_2_MAX_KG) return SHIPPING_TIER_2_COST;
  if (weight <= SHIPPING_TIER_3_MAX_KG) return SHIPPING_TIER_3_COST;
  return SHIPPING_TIER_4_COST;
}

function calculateLateFee(days: number): number {
  return days * DAILY_LATE_FEE;
}
```

### Better: Struktur Data untuk Multi-Tier

```typescript
// Saat ada banyak value terkait, pakai array of objects
const SHIPPING_TIERS = [
  { maxWeight: 5, cost: 10_000 },
  { maxWeight: 10, cost: 15_000 },
  { maxWeight: 20, cost: 25_000 },
  { maxWeight: Infinity, cost: 50_000 },
] as const;

function shippingCost(weight: number): number {
  const tier = SHIPPING_TIERS.find(t => weight <= t.maxWeight);
  return tier?.cost ?? 50_000;
}
```

---

## Latihan

1. **Rename variable** — Perbaiki semua nama variable dan function dalam kode ini:
   ```typescript
   function p(a: number, b: number, c: string) {
     let d = a * b;
     if (c === "y") return d * 1.1;
     if (c === "m") return d * 1.2;
     return d;
   }
   ```

2. **Magic numbers → constant** — Kode berikut punya 7 magic numbers (termasuk yang berulang). Eliminasi semua:
   ```typescript
   function calculatePension(age: number, yearsWorked: number, salary: number): number {
     if (age < 55) return 0;
     if (yearsWorked < 15) return salary * 0.5;
     if (yearsWorked < 25) return salary * 0.75;
     if (yearsWorked < 35) return salary * 0.9;
     return salary;
   }
   ```

3. **Komentar → kode** — Refactor tanpa komentar, pake nama yang jelas:
   ```typescript
   // Check if user can access premium content
   // by checking subscription status and age
   function ck(u: any): boolean {
     let s = u.sub;
     let a = u.age;
     if (s === "premium" || s === "vip") {
       if (a >= 18) return true;
     }
     return false;
   }
   ```

4. **Function size** — Pecah function 50+ baris ini jadi beberapa function kecil dengan single responsibility:
   ```typescript
   function handleUserRegistration(input: any) {
     // validasi input (15 baris)
     // cek duplicate email (8 baris)
     // hash password (5 baris)
     // save ke DB (10 baris)
     // generate token (5 baris)
     // kirim email verifikasi (10 baris)
     // return response (3 baris)
   }
   ```
