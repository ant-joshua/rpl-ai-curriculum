# Debugging & DevTools Mastery — Latihan

## Level 1: Dasar

### 1. Browser DevTools — Elements & Console
**Pertanyaan:** Kamu menemukan bug layout: tombol "Submit" tidak terlihat di mobile. Gunakan Chrome DevTools untuk debug:

1. Buka DevTools (F12) → Elements tab
2. Inspeksi tombol submit
3. Perbaiki CSS styling

```html
<!-- === LENGKAPI: Perbaiki CSS biar tombol submit visible di mobile === -->
<style>
  .btn-submit {
    /* Problem: display: none; saat width < 768px */
    /* Fix: ganti dengan properti yang bener */
    /* === LENGKAPI DI SINI === */
  }
</style>

<button class="btn-submit">Submit Order</button>
```

Tulis langkah-langkah di DevTools untuk menemukan dan fix bug ini.

**Hint:** DevTools Elements tab → Styles panel → toggle CSS properties. DevTools juga bisa emulate device dengan Device Toolbar (icon phone di sebelah kiri atas). Gunakan `display: block` atau `visibility: visible`.

---

### 2. VS Code Debugger — Breakpoint & Call Stack
**Pertanyaan:** Fungsi `calculateDiscount` kadang return NaN. Pasang breakpoint dan trace nilai variabel:

```typescript
// === LENGKAPI: Fix bug di fungsi ini ===
function calculateDiscount(price: number, discountPercent: number): number {
  const discount = price * (discountPercent / 100);
  const finalPrice = price - discount;
  
  // Bug: finalPrice NaN kalau discountPercent = undefined
  // === LENGKAPI: Tambah validation guard ===
  
  return parseFloat(finalPrice.toFixed(2));
}

// Test cases
console.log(calculateDiscount(100000, 20));  // should be 80000
console.log(calculateDiscount(50000, undefined));  // should be 50000
console.log(calculateDiscount(75000, 0));  // should be 75000
```

1. Tulis launch.json configuration untuk debug TypeScript di VS Code
2. Sebutkan jenis breakpoint yang tepat untuk trace nilai `discountPercent`
3. Fix bug dengan validation guard

**Hint:** launch.json type: `node`, `runtimeArgs: ["-r", "ts-node/register"]`. Gunakan Logpoint atau conditional breakpoint. Guard: `if (typeof discountPercent !== 'number') return price`.

---

### 3. Network Tab — Debug API Error
**Pertanyaan:** Request POST ke `/api/orders` gagal dengan status 500. Analisis pakai Network tab:

```javascript
// === LENGKAPI: Perbaiki kode berikut ===
async function createOrder(items: CartItem[], userId: string) {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // === LENGKAPI: Tambah authorization header ===
    },
    body: JSON.stringify({
      items,  // Mungkin format items salah
      userId,
      // === LENGKAPI: Tambah field yang diperlukan backend ===
    })
  });
  
  if (!response.ok) {
    // === LENGKAPI: Parse error response dari server ===
    console.error('Order failed');
  }
  
  return response.json();
}
```

Berdasarkan response Network tab, tulis:
1. Status code dan response body dari server
2. Request payload yang seharusnya
3. Fix kode di atas

**Hint:** Network tab → Headers (Request Method, Status Code, Request Headers) → Response tab. Cek juga apakah ada CORS error atau missing required fields. Status 500 biasanya server-side, tapi bisa juga karena request payload salah format.

---

### 4. Structured Logging — Pino Setup
**Pertanyaan:** Setup structured logging dengan Pino untuk Express app:

```typescript
// === LENGKAPI: Logger configuration ===
import pino from 'pino';
import express from 'express';

// === LENGKAPI: Init logger dengan level, transport, dan pretty print ===
const logger = pino({
  // Level: 'info' di production, 'debug' di development
  // === LENGKAPI ===
  transport: {
    // target: 'pino-pretty' untuk development
    // === LENGKAPI ===
  }
});

const app = express();

// === LENGKAPI: Request logging middleware ===
// Log method, url, duration, status code untuk setiap request
app.use((req, res, next) => {
  const start = Date.now();
  // === LENGKAPI ===
  next();
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await getUsers();
    res.json(users);
  } catch (error) {
    // === LENGKAPI: Log error dengan context ===
    logger.error(error);  // Belum ada context tambahan
  }
});
```

**Hint:** Pino levels: `fatal`, `error`, `warn`, `info`, `debug`, `trace`. Gunakan `pino-pretty` untuk dev, JSON untuk production. Child logger: `logger.child({ requestId })`. Log correlation ID: `crypto.randomUUID()`.

---

### 5. Stack Trace — Error Tracing Chain
**Pertanyaan:** Diberikan stack trace berikut, analisis penyebab error:

```
TypeError: Cannot read properties of null (reading 'map')
    at renderProductList (product.tsx:45:22)
    at ProductPage (product.tsx:32:12)
    at renderWithHooks (react-dom.development.js:16348:16)
    at mountIndeterminateComponent (react-dom.development.js:20078:13)
    at beginWork (react-dom.development.js:21544:16)
    at HTMLUnknownElement.callCallback (react-dom.development.js:4164:14)
```

```typescript
// === LENGKAPI: Fix kode yang menyebabkan error ===
interface Product {
  id: string;
  name: string;
  price: number;
}

function ProductPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  
  useEffect(() => {
    fetchProducts().then(data => {
      setProducts(data);
    });
    // Bug: data.products mungkin undefined/null
    // === LENGKAPI: Tambah null check dan default value ===
  }, []);
  
  // === LENGKAPI: Fix renderProductList ===
  function renderProductList() {
    return products.map(product => (  // ← LINE 45: error di sini
      <div key={product.id}>{product.name}</div>
    ));
  }
  
  return <div>{renderProductList()}</div>;
}
```

1. Jelaskan apa yang menyebabkan error berdasarkan stack trace
2. Tulis fix untuk setiap level chain (fetch, state initialization, render)
3. Tambahkan error boundary untuk React

**Hint:** Error chain: API return `null` → `setProducts(null)` → `products.map` crash. Fix: `const [products, setProducts] = useState<Product[]>([])`, tambah `data.products ?? []`, dan optional chaining `products?.map(...)`. Error Boundary: `componentDidCatch(error, errorInfo)`.

---

## Level 2: Intermediate

### 6. Performance Tab — Identify Bottleneck
**Pertanyaan:** Rekam performance profile dan analisis bottleneck:

```typescript
// === LENGKAPI: Optimasi fungsi lambat ini ===
function processLargeDataset(items: any[]) {
  // Problem: fungsi ini lambat, freeze UI selama 3 detik
  const result = [];
  
  for (let i = 0; i < items.length; i++) {
    // Heavy computation di main thread
    const processed = heavyComputation(items[i]);
    result.push(processed);
  }
  
  // === LENGKAPI: Refactor pake Web Worker atau chunking ===
  
  return result;
}
```

1. Langkah-langkah record performance di Chrome DevTools
2. Identifikasi: long task, forced reflow, layout thrashing
3. Tulis optimasi menggunakan:
   - Web Worker untuk heavy computation
   - `requestIdleCallback` untuk chunking
   - Debounce untuk event handler

**Hint:** Performance tab → record → stop → flame chart. Long task > 50ms di main thread. Web Worker: `new Worker('worker.js')`, postMessage API. Chunking: `requestAnimationFrame` atau `setTimeout(0)` untuk yield ke browser.

---

### 7. Lighthouse Audit — Target Score ≥ 90
**Pertanyaan:** Hasil Lighthouse audit menunjukkan skor Performance = 65. Lakukan optimasi:

```html
<!-- === LENGKAPI: Optimasi HTML untuk Lighthouse score ≥ 90 === -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My App</title>
  
  <!-- Problem: CSS blocking render -->
  <link rel="stylesheet" href="/styles/main.css">
  <link rel="stylesheet" href="/styles/theme.css">
  <link rel="stylesheet" href="/styles/components.css">
  
  <!-- Problem: JS blocking parse -->
  <script src="/js/vendor.js"></script>
  <script src="/js/app.js"></script>
  
  <!-- Problem: Font blocking render -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
  
  <!-- === LENGKAPI: === -->
  <!-- 1. Preload hero image -->
  <!-- 2. Inline critical CSS -->
  <!-- 3. Defer non-critical JS -->
  <!-- 4. Font dengan swap -->
</head>
<body>
  <!-- === LENGKAPI === -->
  <!-- Hero image dengan srcset dan sizes -->
  <img src="hero.jpg" alt="Hero">
</body>
</html>
```

1. Tulis ulang HTML dengan optimasi Lighthouse
2. Sebutkan metrik apa saja yang mempengaruhi skor Performance
3. Buat `.lighthouserc.js` untuk CI pipeline dengan target skor

**Hint:** Optimasi: preload hero image `<link rel="preload" as="image">`, inline critical CSS di `<style>`, defer JS `<script defer>`, `font-display: swap`. Budget: `{"performance": 90, "accessibility": 90, "seo": 90}`.

---

### 8. Error Monitoring — Sentry Integration
**Pertanyaan:** Integrasi error monitoring dengan Sentry di Next.js app:

```typescript
// === LENGKAPI: Sentry setup ===
// sentry.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // === LENGKAPI: ===
  // 1. Set tracesSampleRate untuk performance monitoring
  // 2. Enable error reporting untuk unhandled rejections
  // 3. Custom sebelum send callback untuk filter sensitive data
  
  beforeSend(event) {
    // === LENGKAPI: Hapus sensitive data sebelum dikirim ===
    // Filter: password, token, credit card
    return event;
  }
});

// === LENGKAPI: API route dengan error tracking ===
export default async function handler(req, res) {
  try {
    // Business logic
    // ...
  } catch (error) {
    // === LENGKAPI: ===
    // 1. Set transaction name
    // 2. Add user context
    // 3. Add breadcrumb
    // 4. Send error ke Sentry
    // 5. Return proper error response
  }
}
```

**Hint:** Sentry: `Sentry.captureException(error)`, `Sentry.setUser({ id, email })`, `Sentry.addBreadcrumb({ category, message, level })`. Filter: hapus `event.request?.data?.password`. Traces sample rate: `0.2` untuk 20% sampling di production.
