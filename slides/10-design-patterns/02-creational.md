---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — <img src="https://images.pexels.com/photos/7325498/pexels-ph"
footer: "Sesi 02: Creational"
---

<!-- _class: title -->
# Sesi 2 — Creational Patterns

> **Creational patterns** ngurusin cara bikin objek. Biar pembuatan objek fleksibel, nggak kaku, dan nggak nyebarin `new` di mana-mana.

---

## 1. Singleton

> **Mastikan suatu class cuma punya satu instance sepanjang aplikasi.**

### Kapan dipakai
- Koneksi database (biar nggak boros koneksi)
- Logger global
- Konfigurasi aplikasi (config object yang sama di semua module)
- Cache service

### Contoh: DB Connection Singleton

```typescript
class DatabaseConnection {
  private static instance: DatabaseConnection;
  private connected = false;

  private constructor() {} // ⚡ Constructor private — nggak bisa new dari luar

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  connect(): void {
    if (!this.connected) {
      console.log('🔄 Koneksi ke database...');
      this.connected = true;
      console.log('✅ Database terhubung');
    } else {
      console.log('ℹ️ Pakai koneksi yang udah ada');
    }
  }

  query(sql: string): void {
    if (!this.connected) {
      throw new Error('Belum connect ke DB!');
    }
    console.log(`📊 Execute: ${sql}`);
  }
}

// Pemakaian
const db1 = DatabaseConnection.getInstance();
const db2 = DatabaseConnection.getInstance();

db1.connect(); // 🔄 Koneksi ke database... ✅ Database terhubung
db2.connect(); // ℹ️ Pakai koneksi yang udah ada

console.log(db1 === db2); // true — instance SAMA
```

### Singleton di Express (App Config)

```typescript
class AppConfig {
  private static instance: AppConfig;

  public readonly port: number;
  public readonly dbUrl: string;
  public readonly jwtSecret: string;
  public readonly environment: string;

  private constructor() {
    // Baca dari environment variable, fallback ke default
    this.port = Number(process.env.PORT) || 3000;
    this.dbUrl = process.env.DATABASE_URL || 'postgres://localhost:5432/myapp';
    this.jwtSecret = process.env.JWT_SECRET || 'default-secret';
    this.environment = process.env.NODE_ENV || 'development';
  }

  static getInstance(): AppConfig {
    if (!AppConfig.instance) {
      AppConfig.instance = new AppConfig();
    }
    return AppConfig.instance;
  }

  isProduction(): boolean {
    return this.environment === 'production';
  }
}

// Di mana aja, panggil:
// const config = AppConfig.getInstance();
```

### Singleton di Mastra (Logger Service)

```typescript
class LoggerService {
  private static instance: LoggerService;

  private constructor() {}

  static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  info(message: string, data?: any): void {
    console.log(`[INFO] ${message}`, data ?? '');
  }

  error(message: string, error?: any): void {
    console.error(`[ERROR] ${message}`, error ?? '');
  }

  warn(message: string): void {
    console.warn(`[WARN] ${message}`);
  }
}

// // Contoh Mastra tool pake logger singleton
// import { MastraTool } from '@mastra/core';
//
// export const processOrderTool = new MastraTool({
//   name: 'processOrder',
//   execute: async ({ data }) => {
//     const log = LoggerService.getInstance();
//     log.info('Processing order', data);
//     // ... logic
//     log.info('Order processed');
//     return { success: true };
//   },
// });
```

**Catatan:** Singleton sering dikritik karena bikin global state. Di TypeScript modern, sering diganti **dependency injection** atau **module-level instance** (export instance dari module — lebih aman).

---

## 2. Factory

> **Sediakan cara bikin objek tanpa sebut class spesifiknya. Class yang beda-beda bisa muncul dari satu fungsi factory.**

### Kapan dipakai
- Jenis objek ditentukan runtime (berdasarkan input user/config)
- Pembuatan objek rumit (banyak setup)
- Mau nyembunihin logika instantiasi dari consumer

### Contoh: Factory untuk Notifikasi

```typescript
interface Notifikasi {
  kirim(pesan: string, tujuan: string): void;
}

class EmailNotifikasi implements Notifikasi {
  kirim(pesan: string, tujuan: string): void {
    console.log(`📧 Email ke ${tujuan}: ${pesan}`);
  }
}

class SMSNotifikasi implements Notifikasi {
  kirim(pesan: string, tujuan: string): void {
    console.log(`📱 SMS ke ${tujuan}: ${pesan}`);
  }
}

class WhatsAppNotifikasi implements Notifikasi {
  kirim(pesan: string, tujuan: string): void {
    console.log(`💬 WhatsApp ke ${tujuan}: ${pesan}`);
  }
}

// ⚡ Factory function
function buatNotifikasi(jenis: string): Notifikasi {
  switch (jenis) {
    case 'email':
      return new EmailNotifikasi();
    case 'sms':
      return new SMSNotifikasi();
    case 'wa':
      return new WhatsAppNotifikasi();
    default:
      throw new Error(`Tipe notifikasi '${jenis}' nggak dikenal`);
  }
}

// Pemakaian
const notif = buatNotifikasi('email');
notif.kirim('Pesanan kamu sudah dikirim!', 'budi@email.com');
```

### Factory di Express (Bikin Response)

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: Date;
}

class ApiResponseFactory {
  static success<T>(data: T, message = 'OK'): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
      timestamp: new Date(),
    };
  }

  static error(message: string, code?: number): ApiResponse<null> {
    return {
      success: false,
      data: null,
      message: `Error ${code ?? 500}: ${message}`,
      timestamp: new Date(),
    };
  }
}

// Router express
// router.get('/users', async (req, res) => {
//   try {
//     const users = await userRepo.findAll();
//     res.json(ApiResponseFactory.success(users));
//   } catch (err) {
//     res.status(500).json(ApiResponseFactory.error('Gagal ambil users'));
//   }
// });
```

### Factory di Mastra (Dynamic Agent)

```typescript
// Bayangin kita punya beberapa tipe Mastra agent
interface AgentConfig {
  name: string;
  model: string;
  instructions: string;
}

function createAgent(jenis: string): AgentConfig {
  switch (jenis) {
    case 'customer-support':
      return {
        name: 'customer-support-agent',
        model: 'gpt-4',
        instructions: 'Bantu customer dengan pertanyaan produk dan pesanan.',
      };
    case 'data-analyst':
      return {
        name: 'data-analyst-agent',
        model: 'gpt-4-turbo',
        instructions: 'Analisis data dan buat laporan.',
      };
    case 'translator':
      return {
        name: 'translator-agent',
        model: 'gpt-4',
        instructions: 'Terjemahkan teks ke bahasa Indonesia.',
      };
    default:
      throw new Error(`Unknown agent type: ${jenis}`);
  }
}
```

---

## 3. Builder

> **Pisahin pembuatan objek kompleks jadi langkah-langkah kecil. Biar nggak bikin constructor raksasa.**

### Kapan dipakai
- Objek punya banyak parameter opsional (> 4 parameter)
- Ada objek yang butuh konfigurasi bertahap
- Mau объект di-create dengan berbagai variasi konfigurasi tanpa bikin constructor overload

### Contoh: Builder untuk HTTP Request

```typescript
class HttpRequest {
  constructor(
    public readonly method: string,
    public readonly url: string,
    public readonly headers: Record<string, string>,
    public readonly body?: any,
    public readonly timeout?: number,
    public readonly retry?: number,
    public readonly cache?: boolean
  ) {}
}

class HttpRequestBuilder {
  private method = 'GET';
  private url = '';
  private headers: Record<string, string> = {};
  private body?: any;
  private timeout = 5000;
  private retry = 0;
  private cache = false;

  setMethod(method: string): this {
    this.method = method.toUpperCase();
    return this;
  }

  setUrl(url: string): this {
    this.url = url;
    return this;
  }

  addHeader(key: string, value: string): this {
    this.headers[key] = value;
    return this;
  }

  setBody(body: any): this {
    this.body = body;
    return this;
  }

  setTimeout(timeout: number): this {
    this.timeout = timeout;
    return this;
  }

  setRetry(retry: number): this {
    this.retry = retry;
    return this;
  }

  enableCache(): this {
    this.cache = true;
    return this;
  }

  build(): HttpRequest {
    if (!this.url) {
      throw new Error('URL wajib diisi!');
    }
    return new HttpRequest(
      this.method,
      this.url,
      this.headers,
      this.body,
      this.timeout,
      this.retry,
      this.cache
    );
  }
}

// Pemakaian — jelas dan terbaca
const request = new HttpRequestBuilder()
  .setMethod('POST')
  .setUrl('https://api.example.com/orders')
  .addHeader('Authorization', 'Bearer token123')
  .addHeader('Content-Type', 'application/json')
  .setBody({ userId: 1, items: ['item-1', 'item-2'] })
  .setTimeout(10000)
  .setRetry(3)
  .enableCache()
  .build();

console.log(request);
```

### Builder di Express (Route Config)

```typescript
interface RouteOptions {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  middlewares: any[];
  handler: any;
  rateLimit?: number;
  cache?: boolean;
}

class RouteConfigurator {
  private route: Partial<RouteOptions> = {};

  path(p: string): this {
    this.route.path = p;
    return this;
  }

  method(m: RouteOptions['method']): this {
    this.route.method = m;
    return this;
  }

  middlewares(...mw: any[]): this {
    this.route.middlewares = mw;
    return this;
  }

  handler(h: any): this {
    this.route.handler = h;
    return this;
  }

  rateLimit(messagesPerMinute: number): this {
    this.route.rateLimit = messagesPerMinute;
    return this;
  }

  withCache(): this {
    this.route.cache = true;
    return this;
  }

  build(): RouteOptions {
    if (!this.route.path || !this.route.method || !this.route.handler) {
      throw new Error('path, method, handler wajib diisi');
    }
    return this.route as RouteOptions;
  }
}

// // Pemakaian di router express
// const route = new RouteConfigurator()
//   .path('/users')
//   .method('GET')
//   .middlewares(authMiddleware, rateLimiter)
//   .handler(getUsersHandler)
//   .withCache()
//   .build();
//
// router[route.method](route.path, ...route.middlewares, route.handler);
```

### Builder di Mastra (Tool Builder)

```typescript
class MastraToolBuilder {
  private config: any = {};

  name(n: string): this {
    this.config.name = n;
    return this;
  }

  description(d: string): this {
    this.config.description = d;
    return this;
  }

  schema(s: any): this {
    this.config.schema = s;
    return this;
  }

  execute(fn: (args: any) => Promise<any>): this {
    this.config.execute = fn;
    return this;
  }

  retryPolicy(maxRetries: number, delayMs: number): this {
    this.config.retryPolicy = { maxRetries, delayMs };
    return this;
  }

  cacheTTL(ms: number): this {
    this.config.cacheTTL = ms;
    return this;
  }

  build() {
    // @ts-ignore — Mastra tool constructor
    return new MastraTool(this.config);
  }
}

// // Pemakaian
// const searchTool = new MastraToolBuilder()
//   .name('searchProduct')
//   .description('Cari produk berdasarkan keyword')
//   .schema(z.object({ keyword: z.string() }))
//   .execute(async ({ keyword }) => {
//     return await productRepo.search(keyword);
//   })
//   .retryPolicy(3, 1000)
//   .build();
```

---

## Ringkasan

| Pattern | Gampangnya | Kapan Pake |
|---------|------------|------------|
| **Singleton** | Cuma satu instance sepanjang app | Koneksi DB, config global, logger |
| **Factory** | Bikin objek tanpa sebut class spesifik | Jenis objek ditentukan runtime |
| **Builder** | Bikin objek step-by-step | Constructor penuh parameter opsional |

---

## Latihan

### Soal 1 — Singleton

Buat class `CacheService` singleton yang bisa nyimpen data di memory dengan method `get(key)`, `set(key, value)`, `clear()`. Pastikan cuma ada satu instance di seluruh aplikasi.

### Soal 2 — Factory

Kamu punya beberapa metode pembayaran: `BankTransfer`, `Ewallet`, `CreditCard`. Masing-masing punya method `bayar(jumlah: number): string`. Buat factory `PaymentFactory.buat(jenis: string): Pembayaran` yang return class sesuai jenis.

Contoh:
```typescript
const pembayaran = PaymentFactory.buat('gopay');
console.log(pembayaran.bayar(50000)); // "Bayar Rp50000 via GoPay"
```

### Soal 3 — Builder

Buat class `EmailMessage` dengan properti: `to`, `cc`, `bcc`, `subject`, `body`, `attachments[]`, `priority` (low/normal/high). Terus bikin `EmailBuilder` yang bisa di-chain.

```typescript
const email = new EmailBuilder()
  .to('budi@email.com')
  .subject('Meeting Reminder')
  .body('Jangan lupa meeting jam 10')
  .addAttachment('meeting.pdf')
  .priority('high')
  .build();
```

### Soal 4 — Terapkan ke Express

Refactor route berikut pake Factory + Builder:

```typescript
app.get('/products', async (req, res) => {
  try {
    const products = await db.query('SELECT * FROM products');
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error' });
  }
});

app.post('/products', async (req, res) => {
  try {
    await db.query('INSERT INTO products ...');
    res.json({ success: true, message: 'Product created' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error' });
  }
});
```

---

*Selamat mencoba! Pattern ini alat, bukan tujuan. Pake kalau memang ada masalah yang cocok.*
