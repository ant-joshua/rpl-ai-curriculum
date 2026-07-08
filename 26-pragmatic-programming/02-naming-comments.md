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

## Design Patterns — Strategy, Observer, Factory

Design pattern adalah **solusi umum untuk masalah yang sering muncul** dalam software design. Gak harus dihafal, tapi paham kapan pakenya.

### Strategy Pattern

**Masalah:** Banyak `if/else` atau `switch` untuk algoritma yang berbeda.

**Solusi:** Bungkus setiap algoritma dalam class terpisah, biar bisa ditukar kapan aja.

```typescript
// Contoh: Payment method — beda cara hitung fee
interface PaymentStrategy {
  calculateFee(amount: number): number;
  process(amount: number): Promise<string>;
}

class CreditCardPayment implements PaymentStrategy {
  calculateFee(amount: number): number {
    return amount * 0.025; // 2.5% fee
  }
  async process(amount: number): Promise<string> {
    const fee = this.calculateFee(amount);
    // Integrasi dengan payment gateway
    return `Credit card: Rp${amount + fee} processed`;
  }
}

class BankTransferPayment implements PaymentStrategy {
  calculateFee(amount: number): number {
    return amount * 0.002; // 0.2% fee
  }
  async process(amount: number): Promise<string> {
    const fee = this.calculateFee(amount);
    return `Bank transfer: Rp${amount + fee} processed`;
  }
}

class DigitalWalletPayment implements PaymentStrategy {
  calculateFee(amount: number): number {
    return 0; // Free
  }
  async process(amount: number): Promise<string> {
    return `Digital wallet: Rp${amount} processed`;
  }
}

// Context — pake strategy
class CheckoutService {
  constructor(private strategy: PaymentStrategy) {}

  async checkout(amount: number): Promise<string> {
    return this.strategy.process(amount);
  }
}

// Pemakaian:
const checkout = new CheckoutService(new CreditCardPayment());
console.log(await checkout.checkout(100000));
// Ganti ke bank transfer tinggal ganti parameter:
const checkout2 = new CheckoutService(new BankTransferPayment());
```

### Observer Pattern

**Masalah:** Satu objek berubah, banyak objek lain harus tau.

**Solusi:** Subscriber/publisher pattern — objek yang berubah (subjek) ngasih tau semua yang ngikutin (observer).

```typescript
// Event Bus sederhana
type EventHandler = (data: any) => void;

class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  subscribe(event: string, handler: EventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
  }

  unsubscribe(event: string, handler: EventHandler): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      this.handlers.set(event, handlers.filter(h => h !== handler));
    }
  }

  emit(event: string, data: any): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }
}

// Pemakaian:
const bus = new EventBus();

// Subscriber
const logHandler = (data: any) => console.log('Event:', data);
const emailHandler = (data: any) => console.log('Email sent:', data);

bus.subscribe('user.registered', logHandler);
bus.subscribe('user.registered', emailHandler);

// Publisher — tinggal emit
bus.emit('user.registered', { userId: 1, email: 'user@test.com' });
// Output:
// Event: { userId: 1, email: 'user@test.com' }
// Email sent: { userId: 1, email: 'user@test.com' }

// Contoh di React:
function useEventBus() {
  const busRef = useRef(new EventBus());
  useEffect(() => {
    const bus = busRef.current;
    const handler = (data: any) => {
      // update state atau apapun
    };
    bus.subscribe('cart.updated', handler);
    return () => bus.unsubscribe('cart.updated', handler);
  }, []);
}
```

**Kapan pake Observer:**
- Event handling system
- Notification system (email, SMS, push)
- Real-time data sync
- Plugin/extension architecture

### Factory Pattern

**Masalah:** Pembuatan objek rumit atau tergantung kondisi.

**Solusi:** Factory function/class yang handle pembuatan objek.

```typescript
// Simple Factory — function yang bikin object berdasarkan kondisi
interface User {
  id: string;
  role: string;
  permissions: string[];
}

class AdminUser implements User {
  constructor(public id: string) {}
  role = 'admin';
  permissions = ['read', 'write', 'delete', 'manage_users'];
}

class RegularUser implements User {
  constructor(public id: string) {}
  role = 'user';
  permissions = ['read', 'write'];
}

class GuestUser implements User {
  constructor(public id: string) {}
  role = 'guest';
  permissions = ['read'];
}

// Factory function
function createUser(id: string, role: string): User {
  switch (role) {
    case 'admin':
      return new AdminUser(id);
    case 'user':
      return new RegularUser(id);
    case 'guest':
      return new GuestUser(id);
    default:
      throw new Error(`Unknown role: ${role}`);
  }
}

// Pemakaian:
const user = createUser('123', 'admin');
console.log(user.permissions); // ['read', 'write', 'delete', 'manage_users']

// Factory untuk komponen React:
function createButton(variant: 'primary' | 'secondary' | 'danger') {
  const baseClasses = 'px-4 py-2 rounded font-medium';
  const variants = {
    primary: `${baseClasses} bg-blue-500 text-white`,
    secondary: `${baseClasses} bg-gray-200 text-gray-800`,
    danger: `${baseClasses} bg-red-500 text-white`,
  };
  return ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
    <button className={variants[variant]} onClick={onClick}>
      {children}
    </button>
  );
}

const PrimaryButton = createButton('primary');
// <PrimaryButton onClick={handleClick}>Simpan</PrimaryButton>
```

### Kapan Pake Design Pattern?

| Pattern | Masalah | Solusi |
|---------|---------|--------|
| **Strategy** | Banyak if/else untuk algoritma serupa | Bungkus algoritma di class terpisah |
| **Observer** | Satu perubahan perlu kasih tau banyak pihak | Event bus / pub-sub |
| **Factory** | Pembuatan objek rumit atau tergantung kondisi | Function/class khusus pembuat objek |
| Singleton | Cuma perlu 1 instance global | `const db = new Database()` (module-level) |
| Adapter | Integrasi library eksternal dengan interface beda | Bikin wrapper |

> **Peringatan:** Jangan pake pattern kalo gak perlu. Pattern adalah alat, bukan tujuan.

---

## Code Smells — Tanda Kode Perlu Refactor

Code smell bukan error — tapi **tanda suboptimal** yang bikin kode susah di-maintain.

### 1. Long Method — Function Terlalu Panjang

```
Tanda: function > 40 baris, scroll 3 layar
Solusi: Extract function, jaga < 20 baris
```

### 2. Large Class — Class Kebanyakan Tanggung Jawab

```
Tanda: Class > 300 baris, > 10 method, > 5 field
Solusi: Extract class — pisah per tanggung jawab (SRP)
```

### 3. Duplicated Code — Kode Nyaris Identik

```
Tanda: Copy-paste dengan sedikit perubahan
Solusi: Extract function/class (DRY)
```

### 4. Long Parameter List — Parameter Kebanyakan

```typescript
// ❌ Smell: 6 parameter
function createOrder(
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  items: Item[],
  shippingAddress: string,
  paymentMethod: string
) {}

// ✅ Perbaikan: Group parameter related
interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}
interface OrderRequest {
  customer: CustomerInfo;
  items: Item[];
  shippingAddress: string;
  paymentMethod: string;
}
function createOrder(request: OrderRequest) {}
```

### 5. Feature Envy — Method Lebih Interested ke Class Lain

```typescript
// ❌ Smell: Order class lebih banyak akses data Customer
class Order {
  getCustomerFullName(customer: Customer): string {
    return `${customer.firstName} ${customer.lastName}`;
  }
  getCustomerAddress(customer: Customer): string {
    return `${customer.street}, ${customer.city}`;
  }
}
// ✅ Perbaikan: Pindahin ke Customer class
class Customer {
  get fullName(): string { return `${this.firstName} ${this.lastName}`; }
  get address(): string { return `${this.street}, ${this.city}`; }
}
```

### 6. Primitive Obsession — Pake String/Number buat Konsep Domain

```typescript
// ❌ Smell: Pake string untuk konsep yang punya aturan
function processOrder(status: string) {
  if (status === "paid") { /* ... */ }
}
// ✅ Perbaikan: Bikin type/enum
type OrderStatus = "pending" | "confirmed" | "paid" | "shipped" | "delivered";
function processOrder(status: OrderStatus) {}
```

### 7. Switch Statements — Switch/Case Berserakan

```typescript
// ❌ Smell: Switch sama di banyak tempat
function getDiscount(type: string): number {
  switch(type) {
    case "regular": return 0.05;
    case "premium": return 0.1;
  }
}
function getBadge(type: string): string {
  switch(type) {
    case "regular": return "Bronze";
    case "premium": return "Gold";
  }
}
// ✅ Perbaikan: Polymorphism (lihat Strategy Pattern)
```

### 8. Dead Code — Kode Gak Kepake

```
Tanda: Parameter ga dipake, variable ga dibaca, function gak dipanggil
Solusi: Hapus. Git nyimpen history kalo butuh lagi.
```

### 9. Comments as Crutch — Komentar Gantiin Kode Jelas

```typescript
// ❌ Smell: Komentar jelasin "apa" — kode seharusnya udah jelas
// cek apakah user aktif
if (u.s === 1) { /* ... */ }

// ✅ Perbaikan: Kode yang jelas tanpa komentar
if (user.status === UserStatus.Active) { /* ... */ }
```

### Tabel Ringkasan Code Smells

| Code Smell | Tanda | Solusi |
|-----------|-------|--------|
| Long Method | > 40 baris | Extract function |
| Large Class | > 300 baris | Extract class (SRP) |
| Duplicated Code | Copy-paste | Extract function (DRY) |
| Long Parameter List | > 3 parameter | Parameter object |
| Feature Envy | Method lebih pake data class lain | Move method |
| Primitive Obsession | String/number buat domain concept | Bikin type/enum |
| Switch Statements | Switch/case di banyak tempat | Polymorphism |
| Dead Code | Gak pernah dipanggil | Hapus |

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

5. **Design Pattern — Strategy:** Implementasi payment system dengan 3 metode (CreditCard, BankTransfer, GoPay). Masing-masing punya cara hitung fee sendiri. Gunakan Strategy Pattern. Tampilkan total yang harus dibayar setelah fee.

6. **Design Pattern — Observer:** Bikin EventBus sederhana untuk sistem notifikasi. Event: `order.created`, `payment.received`, `order.shipped`. Subscriber: EmailNotifier, SMSNotifier, PushNotifier. Tiap subscriber nge-handle event dengan caranya sendiri.

7. **Design Pattern — Factory:** Bikin factory function `createNotificationChannel(type: string)` yang return object dengan method `send(message: string)`. Channel: email, sms, push. Tiap channel implementasi `send()` beda.

8. **Code Smell Detection:** Cari code smell dalam kode berikut — minimal 4 smell berbeda. Sebutkan smell-nya dan tulis ulang kodenya:
   ```typescript
   function p(d: any, t: string, s: string, c: string, a: number, e: string) {
     let r = "";
     if (d === null) return "error";
     // proses data panjang
     if (t === "A") { r = d * 0.1 + " - A"; }
     else if (t === "B") { r = d * 0.2 + " - B"; }
     else if (t === "C") { r = d * 0.3 + " - C"; }
     // ... 40 baris lagi
     return r;
   }
   ```
