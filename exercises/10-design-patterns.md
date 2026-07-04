# Design Patterns — Latihan

## Level 1: Dasar

### Soal 1 — Kenali Pattern
Cocokkan nama pattern di kiri dengan deskripsi di kanan:

| Pattern | Deskripsi |
|---------|-----------|
| Singleton | a) Menyediakan antarmuka untuk membuat sekelompok objek terkait |
| Factory Method | b) Menjamin sebuah class hanya punya satu instance |
| Observer | c) Mewrap object agar bisa diakses dengan seragam |
| Adapter | d) Satu objek memberi tahu objek lain saat state berubah |

### Soal 2 — Singleton Detection
Baca kode berikut. Apakah ini implementasi Singleton yang benar di JavaScript?

```js
const Database = {
  connection: null,
  connect(url) {
    if (!this.connection) {
      this.connection = { url, connected: true };
    }
    return this.connection;
  }
};
```

Jelaskan kelemahannya (jika ada) dan perbaiki.

### Soal 3 — Factory Method
Refactor kode berikut menggunakan **Factory Method pattern**:

```ts
function createNotification(type: string, message: string) {
  if (type === 'email') {
    return { send: () => console.log(`Email: ${message}`) };
  } else if (type === 'sms') {
    return { send: () => console.log(`SMS: ${message}`) };
  } else if (type === 'push') {
    return { send: () => console.log(`Push: ${message}`) };
  }
  throw new Error('Unknown type');
}
```

## Level 2: Intermediate

### Soal 4 — Observer Pattern — Event Bus
Implementasikan class `EventBus` sederhana dengan method `on(event, handler)`, `emit(event, data)`, dan `off(event, handler)`.

Gunakan untuk menghubungkan module `OrderService` (emits `order.created`) dan module `EmailService` (listener) + `Logger` (listener).

### Soal 5 — Strategy Pattern — Payment Gateway
Buat interface `PaymentStrategy` dengan method `pay(amount: number): Promise<PaymentResult>`.

Implementasikan tiga strategy:
- `GoPayStrategy` — fee 2%, timeout 30s
- `BankTransferStrategy` — fee 0, timeout 24h
- `CreditCardStrategy` — fee 3% + Rp 2000 flat, timeout 10s

Buat class `Checkout` yang menerima strategy via constructor dan memiliki method `execute(amount)`.

### Soal 6 — Refactoring ke SOLID
Kode ini melanggar prinsip SOLID. Identifikasi pelanggaran dan refactor:

```ts
class ReportService {
  generateReport(type: string, data: any) {
    if (type === 'pdf') {
      // render PDF
    } else if (type === 'csv') {
      // render CSV
    } else if (type === 'html') {
      // render HTML
    }
    // simpan ke file
    fs.writeFileSync(`report.${type}`, content);
    // kirim email
    nodemailer.send({ to: 'admin@company.com', subject: 'Report', body: content });
  }
}
```

## Level 3: Challenge

### Soal 7 — Composite Pattern — File System Tree
Implementasikan class hierarchy sederhana menggunakan **Composite pattern**:

- `FileSystemNode` (abstract): name, size()
- `File` (leaf): size tetap
- `Directory` (composite): berisi list FileSystemNode, size() = jumlah semua child

Buat tree: `root/` → `docs/` → `a.txt` (100), `b.txt` (200) , `photo.jpg` (500). Hitung total size.

### Soal 8 — Decorator Pattern — Middleware Pipeline
Implementasikan middleware pipeline menggunakan **Decorator pattern**.

Setiap middleware adalah class dengan method `handle(request, next)`. Middleware bisa:
- `LoggingMiddleware` — log request method + url
- `AuthMiddleware` — cek header `Authorization`, return 401 jika tidak ada
- `RateLimitMiddleware` — batasi 10 request per menit per IP
- `CompressionMiddleware` — compress response body

Buat pipeline yang menjalankan semua middleware secara berurutan, lalu `RequestHandler` di paling dalam.
