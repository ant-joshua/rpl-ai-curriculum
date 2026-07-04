# 26.1 Clean Code Basics

## Prinsip DRY (Don't Repeat Yourself)

Jangan tulis kode yang sama dua kali. Kalau ada pola berulang, bikin function/abstraksi.

```typescript
// ❌ VIOLASI DRY — duplikasi logika validasi
function saveUser(name: string, email: string) {
  if (!name || name.length < 3) throw new Error("Nama tidak valid");
  if (!email.includes("@")) throw new Error("Email tidak valid");
  // save to DB...
}

function updateUser(name: string, email: string) {
  if (!name || name.length < 3) throw new Error("Nama tidak valid");
  if (!email.includes("@")) throw new Error("Email tidak valid");
  // update DB...
}

// ✅ DRY — extract validasi ke satu function
function validateName(name: string): void {
  if (!name || name.length < 3) throw new Error("Nama tidak valid");
}

function validateEmail(email: string): void {
  if (!email.includes("@")) throw new Error("Email tidak valid");
}

function saveUser(name: string, email: string) {
  validateName(name);
  validateEmail(email);
  // save to DB...
}

function updateUser(name: string, email: string) {
  validateName(name);
  validateEmail(email);
  // update DB...
}
```

### Kapan Boleh Melanggar DRY?

- **Duplikasi yang tidak sengaja mirip** — dua function mirip secara kebetulan, beda domain. Abstraksi prematur bikin kode makin rumit.
- **Test code** — test boleh duplikasi setup demi readability. Gunakan factory function kalau setup terlalu panjang.
- **Config/boilerplate** — kadang duplikasi config lebih jelas daripada framework magic yang sulit di-debug.

---

## Prinsip KISS (Keep It Simple, Stupid)

Kode paling sederhana adalah kode paling baik. Jangan over-engineer.

```typescript
// ❌ OVER-ENGINEERED — class hierarchy tidak perlu
abstract class Greeter {
  abstract greet(): string;
}

class IndonesianGreeter extends Greeter {
  constructor(private name: string) { super(); }
  greet(): string {
    return `Halo, ${this.name}!`;
  }
}

class EnglishGreeter extends Greeter {
  constructor(private name: string) { super(); }
  greet(): string {
    return `Hello, ${this.name}!`;
  }
}

// ✅ KISS — function sederhana langsung
function greet(name: string, lang: "id" | "en"): string {
  const greetings = { id: "Halo", en: "Hello" };
  return `${greetings[lang]}, ${name}!`;
}
```

### Ciri Kode KISS
- Bisa dibaca dalam sekali baca dari atas ke bawah
- Tidak ada class/abstraction yang tidak perlu
- Nama function jelas ngapain
- Satu function ngelakuin satu hal

---

## Prinsip YAGNI (You Ain't Gonna Need It)

Jangan nambahin fitur/fungsi yang belum jelas bakal dipake. Tulis kode untuk kebutuhan *sekarang*, bukan kebutuhan imajiner.

```typescript
// ❌ YAGNI VIOLATION — bikin generic repository padahal cuma pake User
interface Repository<T> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  // ... 10 method lain yang belum kepake
}

class UserRepository implements Repository<User> {
  // implementasi 15 method...
  // tapi di app cuma kepake create() dan findAll()
}

// ✅ YAGNI — bikin spesifik dulu
interface UserRepository {
  findAll(): Promise<User[]>;
  create(data: CreateUserDto): Promise<User>;
}

class UserRepositoryImpl implements UserRepository {
  async findAll(): Promise<User[]> {
    return db.query("SELECT * FROM users");
  }
  async create(data: CreateUserDto): Promise<User> {
    // ...
  }
}
```

### Tanda-tanda YAGNI:
- Interface dengan 10+ method cuma 2 kepake
- Parameter opsional yang gak pernah dipake
- Config flags untuk fitur yang belum ada
- Abstraction "untuk jaga-jaga" tanpa use case konkret

---

## Boy Scout Rule

> "Selalu tinggalkan kode lebih bersih dari waktu kamu menemukannya."

Setiap kali menyentuh file, lakukan satu perbaikan kecil:

```typescript
// SEBELUM — kode ditemukan dalam keadaan kotor
function calc(a, b, t) {
  let r = a * b;
  if (t == 1) return r + r * .1;
  if (t == 2) return r + r * .2;
  return r;
}

// SESUDAH — diperbaiki sedikit demi sedikit
type OrderType = "regular" | "express" | "priority";

const TAX_RATES: Record<OrderType, number> = {
  regular: 0.1,
  express: 0.2,
  priority: 0,
};

function calculateTotal(price: number, qty: number, type: OrderType): number {
  const subtotal = price * qty;
  const tax = subtotal * TAX_RATES[type];
  return subtotal + tax;
}
```

### Perbaikan Kecil Tiap Sentuh:
- Rename variable `a` → `price`, `t` → `type`
- Ganti magic number dengan constant
- Tambah tipe
- Hapus code yang di-comment
- Fix indentasi

---

## Single Responsibility Principle (SRP)

Satu function/class punya satu alasan untuk berubah.

```typescript
// ❌ SRP VIOLATION — class ngurusin semuanya
class ReportService {
  generateReport(data: Sale[]) {
    // 1. hitung total
    const total = data.reduce((sum, item) => sum + item.amount, 0);
    // 2. format HTML
    const html = `<h1>Laporan</h1><p>Total: ${total}</p>`;
    // 3. simpan ke file
    fs.writeFileSync("report.html", html);
    // 4. kirim email
    email.send({ to: "admin@company.com", subject: "Laporan", html });
  }
}

// ✅ SRP — pisah tanggung jawab
class SalesCalculator {
  calculateTotal(data: Sale[]): number {
    return data.reduce((sum, item) => sum + item.amount, 0);
  }
}

class ReportRenderer {
  renderHtml(title: string, total: number): string {
    return `<h1>${title}</h1><p>Total: ${total}</p>`;
  }
}

class ReportRepository {
  save(filename: string, content: string): void {
    fs.writeFileSync(filename, content);
  }
}

class EmailService {
  sendReport(recipient: string, html: string): void {
    email.send({ to: recipient, subject: "Laporan", html });
  }
}

// Orchestrator
function generateAndSendReport(data: Sale[]) {
  const calculator = new SalesCalculator();
  const renderer = new ReportRenderer();
  const repo = new ReportRepository();
  const mailer = new EmailService();

  const total = calculator.calculateTotal(data);
  const html = renderer.renderHtml("Laporan Bulanan", total);
  repo.save("report.html", html);
  mailer.sendReport("admin@company.com", html);
}
```

---

## Latihan

1. **DRY** — Kode berikut duplikasi logika diskon 3 kali di tempat berbeda. Refactor dengan extract function:
   ```typescript
   function checkoutItems(items: Item[]) {
     let total = items.reduce((sum, i) => sum + i.price, 0);
     if (total > 500000) total = total * 0.9;
     return total;
   }
   function applyPromo(items: Item[], code: string) {
     let total = items.reduce((sum, i) => sum + i.price, 0);
     if (total > 500000 && code === "PROMO10") total = total * 0.85;
     return total;
   }
   ```

2. **KISS** — Sederhanakan kode ini tanpa mengubah behavior:
   ```typescript
   function getUserInfo(id: number): any {
     const d = fetch(`/api/users/${id}`);
     const j = d.json();
     const n = j.name;
     const e = j.email;
     const a = j.age;
     const r = { userName: n, userEmail: e, userAge: a, userType: j.type ?? "regular" };
     return r;
   }
   ```

3. **YAGNI** — Hapus parameter/code yang tidak diperlukan dari function ini (hanya 2 dari 5 parameter yang dipakai semua caller):
   ```typescript
   function renderPage(
     title: string,
     content: string,
     footer?: boolean,
     sidebar?: boolean,
     theme?: "light" | "dark",
     analytics?: boolean,
     lang?: string
   ): string { ... }
   ```

4. **SRP** — Class `OrderProcessor` handle: validasi, kalkulasi diskon, simpan ke DB, kirim email, log activity, generate invoice PDF. Pisah sesuai SRP.
