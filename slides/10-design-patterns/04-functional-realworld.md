---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — <img src="https://images.pexels.com/photos/7325498/pexels-ph"
footer: "Sesi 04: Functional Realworld"
---

<!-- _class: title -->
# Sesi 4 — Functional Programming & Real-World Patterns

> **Functional programming** treat function sebagai "warga negara kelas satu". Code lebih prediktabel, gampang di-test, dan jarang error misterius.

---

## 1. Pure Function

> **Fungsi murni: input sama → output sama. Nggak ada efek samping. Nggak ubah variable global.**

### ❌ Impure Function

```typescript
let totalBelanja = 0;

function tambahKeKeranjang(harga: number): number {
  totalBelanja += harga; // ⚠️ Mutasi global!
  return totalBelanja;
}

console.log(tambahKeKeranjang(10000)); // 10000
console.log(tambahKeKeranjang(10000)); // 20000 — hasil beda meski input sama!
```

### ✅ Pure Function

```typescript
function hitungTotal(keranjang: number[], itemBaru: number): number {
  return [...keranjang, itemBaru].reduce((a, b) => a + b, 0);
}

const keranjang = [10000];
console.log(hitungTotal(keranjang, 10000)); // 20000
console.log(hitungTotal(keranjang, 10000)); // 20000 — selalu sama!
console.log(keranjang); // [10000] — array asli nggak berubah
```

**Keuntungan pure function:**
- Gampang di-test (nggak perlu setup state global)
- Hasil konsisten
- Bisa di-cache (memoization)
- Thread-safe

---

## 2. Immutability

> **Data nggak boleh diubah setelah dibuat. Kalau mau "ubah", bikin salinan baru.**

### ❌ Mutasi

```typescript
const user = { name: 'Budi', address: { city: 'Jakarta' } };

function updateCity(user: any, newCity: string) {
  user.address.city = newCity; // ⚠️ Mutasi nested object!
  return user;
}

const updated = updateCity(user, 'Bandung');
console.log(user.city); // 'Bandung' — object asli berubah! 😱
```

### ✅ Immutable

```typescript
function updateCityImmutable(user: any, newCity: string) {
  return {
    ...user,
    address: {
      ...user.address,
      city: newCity, // Object asli aman
    },
  };
}

const user2 = { name: 'Budi', address: { city: 'Jakarta' } };
const updated2 = updateCityImmutable(user2, 'Bandung');

console.log(user2.address.city); // 'Jakarta' — aman
console.log(updated2.address.city); // 'Bandung'
```

### Immutability di Array

```typescript
const todos = ['Belajar TS', 'Bikin API'];

// ❌ Mutasi
todos.push('Belajar React'); // ngerusak array asli

// ✅ Immutable
const newTodos = [...todos, 'Belajar React'];
const withoutFirst = todos.slice(1);
const updatedTodos = todos.map((t, i) => (i === 0 ? `${t} ✅` : t));
```

---

## 3. Function Composition

> **Gabungin beberapa fungsi kecil jadi satu fungsi kompleks. Kayak pipa di pabrik.**

```typescript
// Fungsi kecil — masing-masing pure
const trim = (s: string): string => s.trim();
const lower = (s: string): string => s.toLowerCase();
const slugify = (s: string): string => s.replace(/\s+/g, '-');
const truncate = (max: number) => (s: string): string =>
  s.length > max ? s.slice(0, max) + '...' : s;

// Komposisi manual
function createSlug(title: string): string {
  return slugify(lower(trim(title)));
}

console.log(createSlug('  Hello World  ')); // "hello-world"

// Generic compose helper
function compose<T>(...fns: ((arg: T) => T)[]): (arg: T) => T {
  return (arg: T) => fns.reduceRight((acc, fn) => fn(acc), arg);
}

// Pipe — compose dari kiri ke kanan
function pipe<T>(...fns: ((arg: T) => T)[]): (arg: T) => T {
  return (arg: T) => fns.reduce((acc, fn) => fn(acc), arg);
}

const createNiceSlug = pipe(trim, lower, slugify, truncate(20));
console.log(createNiceSlug('  Artikel Tentang TypeScript  ')); // "artikel-tentang-type"
```

---

## 4. Currying

> **Ubah fungsi dengan banyak parameter jadi rantai fungsi satu parameter.**

### Kenapa currying?
- Bikin **partial application** — set beberapa parameter dulu, sisanya belakangan
- Fungsi jadi reusable dengan konfigurasi berbeda

```typescript
// ❌ Biasa
function formatCurrency(amount: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

formatCurrency(50000, 'IDR', 'id-ID'); // "Rp50.000"
formatCurrency(150000, 'IDR', 'id-ID'); // "Rp150.000"
// Repetisi: tiap manggil harus sebut 'IDR' dan 'id-ID'

// ✅ Currying
function formatCurrencyCurried(currency: string) {
  return function (locale: string) {
    return function (amount: number): string {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
      }).format(amount);
    };
  };
}

// Set konfigurasi sekali
const formatIDR = formatCurrencyCurried('IDR')('id-ID');
const formatUSD = formatCurrencyCurried('USD')('en-US');

console.log(formatIDR(50000)); // "Rp50.000"
console.log(formatIDR(150000)); // "Rp150.000"
console.log(formatUSD(50)); // "$50.00"

// Arrow function version
const curried =
  (currency: string) => (locale: string) => (amount: number) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
```

### Currying di Express Middleware

```typescript
// Middleware dengan parameter — pake currying
function requireRole(role: string) {
  return (req: any, res: any, next: any): void => {
    if (req.user?.role !== role) {
      res.status(403).json({ error: `Must be ${role}` });
      return;
    }
    next();
  };
}

function rateLimit(maxRequests: number, windowMs: number) {
  return (req: any, res: any, next: any): void => {
    // logic rate limiting
    next();
  };
}

// // Pake di route
// app.delete('/users/:id', requireRole('admin'), deleteHandler);
// app.get('/api/*', rateLimit(100, 60000), apiHandler);
```

---

## 5. Monads — Option & Result

> **Monad = wrapper yang ngurusin efek samping (null, error) biar code tetap pure.**

### Option (Maybe) — handle null/undefined

```typescript
class Option<T> {
  private constructor(private value: T | null) {}

  static some<T>(value: T): Option<T> {
    return new Option(value);
  }

  static none<T>(): Option<T> {
    return new Option<T>(null);
  }

  isSome(): boolean {
    return this.value !== null;
  }

  isNone(): boolean {
    return this.value === null;
  }

  map<U>(fn: (value: T) => U): Option<U> {
    if (this.isNone()) return Option.none();
    return Option.some(fn(this.value!));
  }

  getOrElse(defaultValue: T): T {
    return this.value ?? defaultValue;
  }

  // Chain function yang return Option juga
  flatMap<U>(fn: (value: T) => Option<U>): Option<U> {
    if (this.isNone()) return Option.none();
    return fn(this.value!);
  }
}

// Pemakaian — tanpa null check bersarang
function findUser(id: number): Option<{ name: string; email: string }> {
  const users = [
    { id: 1, name: 'Budi', email: 'budi@email.com' },
  ];
  const user = users.find((u) => u.id === id);
  return user ? Option.some(user) : Option.none();
}

const userOption = findUser(1)
  .map((u) => u.name.toUpperCase())
  .getOrElse('USER NOT FOUND');

console.log(userOption); // "BUDI"

// Kalau user nggak ada — aman, nggak error
const userOption2 = findUser(999)
  .map((u) => u.name.toUpperCase())
  .getOrElse('USER NOT FOUND');

console.log(userOption2); // "USER NOT FOUND"
```

### Result — handle error tanpa throw

```typescript
class Result<T, E = Error> {
  private constructor(
    private readonly ok: boolean,
    private readonly value?: T,
    private readonly error?: E
  ) {}

  static success<T>(value: T): Result<T, never> {
    return new Result(true, value);
  }

  static failure<E>(error: E): Result<never, E> {
    return new Result(false, undefined, error);
  }

  isSuccess(): boolean {
    return this.ok;
  }

  isFailure(): boolean {
    return !this.ok;
  }

  getOrThrow(): T {
    if (this.isFailure()) throw this.error;
    return this.value!;
  }

  getOrElse(defaultValue: T): T {
    return this.isSuccess() ? this.value! : defaultValue;
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this.isFailure()) return Result.failure(this.error!);
    return Result.success(fn(this.value!));
  }

  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this.isFailure()) return Result.failure(this.error!);
    return fn(this.value!);
  }
}

// Pemakaian — tanpa try/catch
function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return Result.failure('Division by zero!');
  return Result.success(a / b);
}

const result = divide(10, 2)
  .map((n) => n * 2)
  .map((n) => `Hasil: ${n}`)
  .getOrElse('Ada error');

console.log(result); // "Hasil: 10"

const result2 = divide(10, 0)
  .map((n) => n * 2)
  .map((n) => `Hasil: ${n}`)
  .getOrElse('Ada error');

console.log(result2); // "Ada error" — nggak throw!
```

---

## 6. Applying Patterns ke Express Routes

### Sebelum — Route biasa, campur aduk

```typescript
import express from 'express';
const app = express();

app.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Validasi
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    // Query ke DB
    const user = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (!user.rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Transform response
    const response = {
      id: user.rows[0].id,
      name: user.rows[0].name,
      email: user.rows[0].email,
      createdAt: user.rows[0].created_at,
    };
    res.json({ success: true, data: response });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### ✅ Sesudah — Refactor pake pattern

```typescript
import express from 'express';
const app = express();

// --- Pure functions ---
const validateId = (id: string): Result<number, string> => {
  const num = Number(id);
  return isNaN(num) ? Result.failure('Invalid ID') : Result.success(num);
};

const toUserResponse = (row: any) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  createdAt: row.created_at,
});

// --- Repository (DIP) ---
interface UserRepository {
  findById(id: number): Promise<any>;
}

class DBUserRepository implements UserRepository {
  async findById(id: number): Promise<any> {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] ?? null;
  }
}

// --- Service (strategy pattern) ---
class UserService {
  constructor(private repo: UserRepository) {}

  async getUser(id: string): Promise<Result<any, string>> {
    const idResult = validateId(id);
    if (idResult.isFailure()) return Result.failure(idResult.getOrElse(null));

    const user = await this.repo.findById(idResult.getOrThrow());
    if (!user) return Result.failure('User not found');

    return Result.success(toUserResponse(user));
  }
}

// --- Route handler dipisah (SRP) ---
function getUserHandler(userService: UserService) {
  return async (req: any, res: any): Promise<void> => {
    const result = await userService.getUser(req.params.id);

    if (result.isFailure()) {
      const error = result.getOrElse(null);
      const status = error === 'User not found' ? 404 : 400;
      res.status(status).json({ error });
      return;
    }

    res.json({ success: true, data: result.getOrThrow() });
  };
}

// --- Register route ---
const userRepo = new DBUserRepository();
const userService = new UserService(userRepo);
app.get('/users/:id', getUserHandler(userService));
```

---

## 7. Applying Patterns ke Mastra Tools

### Sebelum — Tool mentah

```typescript
// import { MastraTool } from '@mastra/core';

const rawTool = {
  name: 'getUserOrders',
  execute: async ({ data }: { data: { userId: string } }) => {
    // Langsung query di dalam tool
    const orders = await db.query('SELECT * FROM orders WHERE user_id = $1', [data.userId]);

    if (!orders.rows) {
      throw new Error('Failed to fetch orders');
    }

    // Format manual
    return orders.rows.map((o: any) => ({
      id: o.id,
      total: o.total,
      status: o.status,
    }));
  },
};
```

### ✅ Sesudah — Refactor pake pattern

```typescript
// --- Pure function: validasi ---
const validateUserId = (id: string): Option<string> =>
  id && id.length > 0 ? Option.some(id) : Option.none();

// --- Pure function: transformasi ---
const formatOrders = (orders: any[]) =>
  orders.map((o) => ({
    id: o.id,
    total: o.total,
    status: o.status,
    items: o.items ?? [],
  }));

// --- Repository (DIP) ---
interface OrderRepository {
  findByUserId(userId: string): Promise<any[]>;
}

class DBOrderRepository implements OrderRepository {
  async findByUserId(userId: string): Promise<any[]> {
    const result = await db.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows ?? [];
  }
}

// --- Service (composition + strategy) ---
class OrderService {
  constructor(private repo: OrderRepository) {}

  async getUserOrders(userId: string): Promise<Result<any[], string>> {
    // Validasi pure
    const validId = validateUserId(userId);
    if (validId.isNone()) return Result.failure('Invalid user ID');

    // Ambil data dari repository
    const orders = await this.repo.findByUserId(validId.getOrElse(''));

    // Format pake pure function
    const formatted = pipe(formatOrders)(orders);

    return Result.success(formatted);
  }
}

// --- Mastra tool dengan Service ---
const orderService = new OrderService(new DBOrderRepository());

// const getUserOrdersTool = new MastraTool({
//   name: 'getUserOrders',
//   description: 'Ambil daftar order berdasarkan user ID',
//   execute: async ({ data }: { data: { userId: string } }) => {
//     const result = await orderService.getUserOrders(data.userId);
//
//     if (result.isFailure()) {
//       return { error: result.getOrElse('Unknown error') };
//     }
//
//     return { orders: result.getOrThrow() };
//   },
// });
```

---

## Ringkasan

| Konsep | Gampangnya | Kapan Pake |
|--------|------------|------------|
| **Pure Function** | Input sama = output sama | Semua fungsi — bikin prediktabel |
| **Immutability** | Data jangan diubah, bikin baru | State management, Redux, data sharing |
| **Composition** | Gabung fungsi kecil jadi besar | Pipeline data, transformasi sequential |
| **Currying** | Set parameter dikit-dikit | Middleware factory, partial application |
| **Option/Maybe** | Handle null tanpa error | Data yang mungkin nggak ada |
| **Result** | Handle error tanpa throw | Operasi yang bisa gagal (IO, network) |

---

## Latihan

### Soal 1 — Pure Function & Immutability

Refactor fungsi ini jadi pure dan immutable:

```typescript
const cart = [];

function addItem(name: string, price: number) {
  cart.push({ name, price });
  return cart;
}

function applyDiscount(percent: number) {
  for (const item of cart) {
    item.price = item.price * (1 - percent / 100);
  }
  return cart;
}
```

### Soal 2 — Composition

Buat pipeline format teks pake `pipe`:
1. `trim` — hapus spasi ujung
2. `capitalize` — kapitalisasi huruf pertama
3. `addPeriod` — tambah titik di akhir kalau belum ada

```typescript
// Contoh: "  hello world " → "Hello world."
```

### Soal 3 — Currying

Buat curried function `createApiClient(baseURL)` → `(endpoint)` → `(token)` → `Promise<Response>` yang pake `fetch`.

```typescript
// const api = createApiClient('https://api.example.com');
// const users = await api('/users')('token123');
```

### Soal 4 — Monad

Kamu punya `getUserByEmail(email)` dan `getOrdersByUserId(id)`. Keduanya bisa return null. Pake `Option` monad buat nge-chain mereka tanpa null check bersarang.

```typescript
function getUserByEmail(email: string): Option<User> { /* ... */ }
function getOrdersByUserId(id: number): Option<Order[]> { /* ... */ }

// Chain: getUserByEmail → ambil id → getOrdersByUserId
const result = // ... implement
```

### Soal 5 — Real World: Refactor Route

Refactor route Express berikut pake pure functions + Result monad + DIP:

```typescript
app.post('/api/orders', async (req, res) => {
  try {
    const { userId, items } = req.body;

    if (!userId || !items || !items.length) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const total = items.reduce((sum: number, item: any) => sum + item.price * item.qty, 0);
    const order = await db.query(
      'INSERT INTO orders (user_id, total, status) VALUES ($1, $2, $3) RETURNING *',
      [userId, total, 'pending']
    );

    const result = await fetch('https://payment-api.com/charge', {
      method: 'POST',
      body: JSON.stringify({ orderId: order.rows[0].id, amount: total }),
    });

    if (!result.ok) throw new Error('Payment failed');

    await emailService.send(userId, 'Order confirmed');

    res.json({ success: true, data: order.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});
```

---

*Functional programming + design patterns = kode yang bersih, aman, dan gampang di-test. Latihan ini bakal sering kamu temui di kerjaan sehari-hari.*
