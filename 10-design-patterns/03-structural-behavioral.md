# Sesi 3 — Structural & Behavioral Patterns

> **Structural patterns** ngatur hubungan antar class/objek biar strukturnya fleksibel.  
> **Behavioral patterns** ngatur komunikasi antar objek — gimana mereka saling kirim pesan dan koordinasi.

---

# Bagian 1 — Structural Patterns

---

## 1. Adapter

> **Jembatin dua class yang interface-nya beda biar bisa kerja sama. Kayak adaptor colokan listrik.**

### Kapan dipakai
- Integrasi library lama dengan code baru
- API eksternal yang formatnya nggak cocok
- Mau pake class yang udah ada tapi method-nya beda

### Contoh: Adapter untuk Library Pembayaran

```typescript
// Library lama — format beda
class OldPaymentGateway {
  processPayment(amount: number, currency: string): string {
    return `[OLD] Payment ${amount} ${currency} processed.`;
  }
}

// Interface baru yang kita mau pake
interface PaymentGateway {
  pay(amount: number): string;
}

// Adapter — jembatin old ke new
class PaymentAdapter implements PaymentGateway {
  constructor(private oldGateway: OldPaymentGateway) {}

  pay(amount: number): string {
    // Adapter nyembunyiin detail konversi
    return this.oldGateway.processPayment(amount, 'IDR');
  }
}

// Pemakaian
const oldGateway = new OldPaymentGateway();
const adapter = new PaymentAdapter(oldGateway);
console.log(adapter.pay(50000)); // "[OLD] Payment 50000 IDR processed."

// Kalau nanti ganti Stripe, tinggal bikin adapter baru
class StripePayment implements PaymentGateway {
  pay(amount: number): string {
    return `[Stripe] Charged $${(amount / 15000).toFixed(2)}`;
  }
}
```

---

## 2. Decorator

> **Nambahin perilaku ke objek secara dinamis tanpa ngubah class asli. Kayak topping es krim.**

### Kapan dipakai
- Middleware di Express (log, auth, rate-limit)
- Nambah fitur ke objek tanpa inheritance
- Banyak kombinasi fitur yang bisa dipilih-pilih

### Contoh: Decorator sebagai Middleware Pattern

```typescript
// Interface handler
interface RequestHandler {
  handle(req: any): string;
}

// Handler dasar
class BaseHandler implements RequestHandler {
  handle(req: any): string {
    return `Handling: ${req.url}`;
  }
}

// Decorator base
abstract class HandlerDecorator implements RequestHandler {
  constructor(protected handler: RequestHandler) {}

  abstract handle(req: any): string;
}

// Decorator: Logging
class LoggingDecorator extends HandlerDecorator {
  handle(req: any): string {
    console.log(`[LOG] ${req.method} ${req.url} — ${new Date().toISOString()}`);
    return this.handler.handle(req);
  }
}

// Decorator: Auth
class AuthDecorator extends HandlerDecorator {
  handle(req: any): string {
    if (!req.headers?.authorization) {
      throw new Error('Unauthorized!');
    }
    console.log('[AUTH] Token valid');
    return this.handler.handle(req);
  }
}

// Decorator: Rate Limiting
class RateLimitDecorator extends HandlerDecorator {
  private requestCount = 0;
  private readonly maxRequests = 100;

  handle(req: any): string {
    this.requestCount++;
    if (this.requestCount > this.maxRequests) {
      throw new Error('Rate limit exceeded!');
    }
    console.log(`[RATE] Request ${this.requestCount}/${this.maxRequests}`);
    return this.handler.handle(req);
  }
}

// Pemakaian — stack decorator kayak middleware Express
let handler: RequestHandler = new BaseHandler();
handler = new LoggingDecorator(handler);
handler = new AuthDecorator(handler);
handler = new RateLimitDecorator(handler);

handler.handle({
  method: 'GET',
  url: '/users',
  headers: { authorization: 'Bearer token123' },
});
// [LOG] GET /users — 2025-01-15T10:30:00.000Z
// [AUTH] Token valid
// [RATE] Request 1/100
// Handling: /users
```

### Decorator di Express — Middleware Nyata

```typescript
import { Request, Response, NextFunction } from 'express';

function logger(req: Request, _res: Response, next: NextFunction): void {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
}

function auth(req: Request, res: Response, next: NextFunction): void {
  if (!req.headers.authorization) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}

function rateLimit(max: number) {
  const counts = new Map<string, number>();
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip ?? 'unknown';
    const current = (counts.get(ip) ?? 0) + 1;
    counts.set(ip, current);
    if (current > max) {
      res.status(429).json({ error: 'Too many requests' });
      return;
    }
    next();
  };
}

// // Route pake decorator (middleware)
// app.get('/users', logger, auth, rateLimit(100), (req, res) => {
//   res.json({ users: [] });
// });
```

---

## 3. Proxy

> **Sediain pengganti atau perantara buat ngontrol akses ke objek asli.**

### Kapan dipakai
- Caching (nyimpen hasil query biar nggak hit DB terus)
- Access control (cek role sebelum akses)
- Lazy loading (bikin objek berat cuma kalau dipake)

### Contoh: Proxy untuk Caching

```typescript
interface UserRepository {
  findById(id: number): Promise<any>;
}

// Implementasi asli — akses database
class DatabaseUserRepository implements UserRepository {
  async findById(id: number): Promise<any> {
    console.log(`🔍 Query DB: SELECT * FROM users WHERE id = ${id}`);
    // Simulasi delay query
    await new Promise((r) => setTimeout(r, 1000));
    return { id, name: `User ${id}`, email: `user${id}@email.com` };
  }
}

// Proxy — tambahin cache di depan DB
class CachedUserRepository implements UserRepository {
  private cache = new Map<number, any>();

  constructor(private db: UserRepository) {}

  async findById(id: number): Promise<any> {
    if (this.cache.has(id)) {
      console.log(`⚡ Cache HIT: user ${id}`);
      return this.cache.get(id);
    }

    console.log(`💨 Cache MISS: user ${id}`);
    const user = await this.db.findById(id);
    this.cache.set(id, user);
    return user;
  }
}

// Pemakaian
async function main() {
  const db = new DatabaseUserRepository();
  const cache = new CachedUserRepository(db);

  console.log('=== Request 1 ===');
  await cache.findById(1); // 🔍 Query DB + 💨 Cache MISS

  console.log('\n=== Request 2 ===');
  await cache.findById(1); // ⚡ Cache HIT — nggak query DB!

  console.log('\n=== Request 3 ===');
  await cache.findById(2); // 🔍 Query DB (user 2 belum di-cache)
}

main();
```

### Proxy di Express (Guard/Auth Middleware)

```typescript
// Proxy pattern di Express ya... middleware! Setiap middleware
// bisa ngecek, nge-log, atau nge-cache sebelum request sampe ke handler asli.

// Contoh: Proxy untuk guard role
function roleGuard(...allowedRoles: string[]) {
  return (req: any, res: any, next: any): void => {
    const userRole = req.user?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    next();
  };
}

// // Route
// app.delete('/users/:id', auth, roleGuard('admin'), deleteUserHandler);
```

---

# Bagian 2 — Behavioral Patterns

---

## 4. Observer

> **Satu objek (subject) ngasih tau banyak objek lain (observer) kalau ada perubahan. Kayak subscribe YouTube.**

### Kapan dipakai
- Event system / EventEmitter
- UI updates (komponen A berubah, komponen B & C ikut update)
- Real-time data (WebSocket notification)

### Contoh: Observer dengan EventEmitter

```typescript
// Simple EventEmitter dari awal
type EventHandler = (...args: any[]) => void;

class EventEmitter {
  private events = new Map<string, EventHandler[]>();

  on(event: string, handler: EventHandler): void {
    const handlers = this.events.get(event) ?? [];
    handlers.push(handler);
    this.events.set(event, handlers);
  }

  off(event: string, handler: EventHandler): void {
    const handlers = this.events.get(event);
    if (!handlers) return;
    this.events.set(
      event,
      handlers.filter((h) => h !== handler)
    );
  }

  emit(event: string, ...args: any[]): void {
    const handlers = this.events.get(event);
    if (!handlers) return;
    handlers.forEach((handler) => handler(...args));
  }
}

// Pake EventEmitter buat sistem notifikasi
const eventBus = new EventEmitter();

// Observer 1 — Email Service
eventBus.on('order:created', (order: any) => {
  console.log(`📧 Email: Pesanan ${order.id} berhasil dibuat.`);
});

// Observer 2 — SMS Service
eventBus.on('order:created', (order: any) => {
  console.log(`📱 SMS: Pesanan ${order.id} diterima.`);
});

// Observer 3 — Analytics Service
eventBus.on('order:created', (order: any) => {
  console.log(`📊 Analytics: Catat order ${order.id} — Rp${order.total}`);
});

// Trigger — satu emit, tiga observer jalan
eventBus.emit('order:created', { id: 'ORD-001', total: 150000 });
// 📧 Email: Pesanan ORD-001 berhasil dibuat.
// 📱 SMS: Pesanan ORD-001 diterima.
// 📊 Analytics: Catat order ORD-001 — Rp150000
```

### Observer di Express (Event Bus untuk Webhook)

```typescript
// // Event bus global — semua modul bisa subscribe
// const eventBus = new EventEmitter();
//
// // Subscribe di module email
// eventBus.on('payment:success', async (data) => {
//   await emailService.sendInvoice(data.email, data.invoiceUrl);
// });
//
// // Subscribe di module inventory
// eventBus.on('payment:success', async (data) => {
//   await inventoryService.reduceStock(data.items);
// });
//
// // Route payment — emit event
// app.post('/payments/callback', async (req, res) => {
//   const result = await paymentService.process(req.body);
//   eventBus.emit('payment:success', result);
//   res.json({ status: 'ok' });
// });
```

---

## 5. Strategy

> **Definin grup algoritma yang bisa ditukar-tukar runtime. Keluarin logika yang berubah-ubah ke class strategy sendiri.**

### Kapan dipakai
- Banyak cara/cabang logika dalam satu proses (pembayaran, diskon, shipping)
- Mau ganti algoritma runtime tanpa if-else panjang
- Testing jadi gampang — tinggal pake mock strategy

### Contoh: Strategy untuk Shipping Cost

```typescript
interface ShippingStrategy {
  hitung(beratKg: number): number;
}

class RegularShipping implements ShippingStrategy {
  hitung(beratKg: number): number {
    return beratKg * 5000; // Rp5000/kg
  }
}

class ExpressShipping implements ShippingStrategy {
  hitung(beratKg: number): number {
    return beratKg * 10000 + 15000; // Rp10000/kg + flat Rp15000
  }
}

class SameDayShipping implements ShippingStrategy {
  hitung(beratKg: number): number {
    return beratKg * 20000 + 25000; // Mahal tapi cepet
  }
}

class FreeShipping implements ShippingStrategy {
  hitung(_beratKg: number): number {
    return 0; // Gratis!
  }
}

// Context — pake strategy
class ShippingCalculator {
  constructor(private strategy: ShippingStrategy) {}

  setStrategy(strategy: ShippingStrategy): void {
    this.strategy = strategy;
  }

  calculate(beratKg: number): number {
    const cost = this.strategy.hitung(beratKg);
    console.log(`🚚 ${this.strategy.constructor.name}: Rp${cost.toLocaleString('id-ID')}`);
    return cost;
  }
}

// User bisa milih pengiriman
const calculator = new ShippingCalculator(new RegularShipping());
calculator.calculate(2); // Rp10.000

calculator.setStrategy(new ExpressShipping());
calculator.calculate(2); // Rp35.000

calculator.setStrategy(new FreeShipping());
calculator.calculate(2); // Rp0
```

### Strategy di Express (Dynamic Response Format)

```typescript
interface ResponseStrategy {
  format(data: any, message: string): any;
}

class JSONResponse implements ResponseStrategy {
  format(data: any, message: string): any {
    return { success: true, message, data, timestamp: new Date() };
  }
}

class XMLResponse implements ResponseStrategy {
  format(data: any, message: string): string {
    let xml = `<?xml version="1.0"?>\n<response>\n`;
    xml += `  <message>${message}</message>\n`;
    xml += `  <data>${JSON.stringify(data)}</data>\n`;
    xml += `</response>`;
    return xml;
  }
}

class ResponseContext {
  constructor(private strategy: ResponseStrategy) {}

  setStrategy(strategy: ResponseStrategy): void {
    this.strategy = strategy;
  }

  send(res: any, data: any, message = 'OK'): void {
    const formatted = this.strategy.format(data, message);
    res.json(formatted);
  }
}

// // Route express
// const responseContext = new ResponseContext(new JSONResponse());
//
// app.get('/users', async (req, res) => {
//   // Kalau header Accept: application/xml, ganti strategy
//   if (req.headers.accept === 'application/xml') {
//     responseContext.setStrategy(new XMLResponse());
//   }
//   const users = await userRepo.findAll();
//   responseContext.send(res, users);
// });
```

### Strategy di Mastra (Dynamic Tool Behavior)

```typescript
// Strategy buat nentuin gimana response diformat
interface ResponseFormatStrategy {
  format(raw: any): string;
}

class ConciseFormat implements ResponseFormatStrategy {
  format(raw: any): string {
    return `Hasil: ${JSON.stringify(raw)}`;
  }
}

class DetailedFormat implements ResponseFormatStrategy {
  format(raw: any): string {
    return `Detail Lengkap:\n${JSON.stringify(raw, null, 2)}`;
  }
}

// // Mastra tool pake strategy
// const searchTool = new MastraTool({
//   name: 'searchWithFormat',
//   execute: async ({ data }) => {
//     const format = data.detailed
//       ? new DetailedFormat()
//       : new ConciseFormat();
//     const results = await searchRepo.search(data.query);
//     return format.format(results);
//   },
// });
```

---

## Ringkasan

| Pattern | Gampangnya | Kapan Pake |
|---------|------------|------------|
| **Adapter** | Jembatin interface beda | Integrasi library lama/pihak ketiga |
| **Decorator** | Nambah fitur tanpa ubah class asli | Middleware, kombinasi fitur |
| **Proxy** | Perantara buat kontrol akses | Caching, guard, lazy loading |
| **Observer** | Satu ngasih tau banyak | Event system, notifikasi, real-time |
| **Strategy** | Tukar algoritma runtime | Banyak varian algoritma dalam satu proses |

---

## Latihan

### Soal 1 — Adapter

Kamu pake library `sendEmail(from, to, subject, body)` (format lama). Interface baru yang kamu mau pake adalah `EmailService.send(EmailPayload)`. Buat adapter-nya.

```typescript
// Library lama
class OldMailer {
  sendEmail(from: string, to: string, subject: string, body: string): string {
    return `Email sent from ${from} to ${to}`;
  }
}

// Interface baru
interface EmailService {
  send(payload: { from: string; to: string; subject: string; body: string }): string;
}
```

### Soal 2 — Decorator

Buat decorator `CompressionDecorator` dan `EncryptionDecorator` yang bisa stack ke `DataService`:

```typescript
interface DataService {
  write(data: string): void;
}

class FileDataService implements DataService {
  write(data: string): void {
    console.log(`Write to file: ${data}`);
  }
}

// Bikin decorator-nya!
```

### Soal 3 — Proxy

Buat proxy `RateLimitedProxy` yang ngebatasi akses ke `ApiService` maksimal 5 request per menit per user.

```typescript
class ApiService {
  fetch(endpoint: string): string {
    return `Data dari ${endpoint}`;
  }
}

// Proxy di sini
```

### Soal 4 — Observer + Strategy

Skenario: Ada sistem **order created**. Waktu order dibuat, dua hal terjadi:
1. Observer pattern: Notifikasi (email + SMS)
2. Strategy pattern: Diskon beda-beda tergantung tipe member

Buat implementasi lengkapnya.

---

*Latihan ini real-world banget — pas kerja nanti kamu bakal nemu kombinasi pattern kayak gini setiap hari.*
