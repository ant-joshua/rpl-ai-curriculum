---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — <img src="https://images.pexels.com/photos/1148820/pexels-ph"
footer: "Sesi 02: Sentry Error Tracking"
---

<!-- _class: title -->
# 41.2 Sentry Error Tracking

## Kenapa Sentry?

Error logging ke file aja ga cukup buat production:

- **Realtime notification** — tau error sebelum user komplen
- **Error grouping** — ribuan error yang sama => 1 issue, bukan spam
- **Context kaya** — stack trace, breadcrumbs, user, environment, browser
- **Source maps** — error dari minified code balik ke source asli
- **Performance tracing** — liat endpoint mana yang lambat
- **Release tracking** — tau error muncul di deploy mana
- **Breadcrumbs** — jejak aksi user sebelum error terjadi

## Setup Sentry di Express

### 1. Daftar & Dapatkan DSN

Buat akun di [sentry.io](https://sentry.io) → New Project → Express/Node.js → copy DSN.

DSN format: `https://<key>@<org>.ingest.sentry.io/<project>`

### 2. Install

```bash
npm install @sentry/node
npm install -D @sentry/webpack-plugin # buat source maps upload
```

### 3. Init di Entry Point

**PENTING:** Inisialisasi Sentry **sebelum** middleware/router lain.

```typescript
// src/index.ts — PALING ATAS
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  release: process.env.RELEASE_VERSION || '1.0.0',
  
  // Set tracesSampleRate — 1.0 = 100% request, 0.1 = 10%
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Profiling — optional
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  integrations: [new ProfilingIntegration()],
  
  // Attach stack trace ke semua error
  attachStacktrace: true,
  
  // Max breadcrumbs
  maxBreadcrumbs: 50,
});

// Express setup
import express from 'express';
const app = express();

// Request handler — tambahin request data ke event
app.use(Sentry.Handlers.requestHandler());

// Tracing handler — kalo pake performance monitoring
app.use(Sentry.Handlers.tracingHandler());

// Routes...
app.get('/api/users', async (req, res) => {
  // ...
});

// Error handler — WAJIB: Sentry error handler (taruh setelah routes)
app.use(Sentry.Handlers.errorHandler({
  shouldHandleError(error) {
    // Kirim ke Sentry cuma kalo 5xx
    return error.status >= 500 || error.status === undefined;
  },
}));

// Fallback error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
  });
});
```

### 4. Manual Error Reporting

```typescript
import * as Sentry from '@sentry/node';

// Capture exception — otomatis ambil stack trace
try {
  await processPayment(orderId);
} catch (err) {
  Sentry.captureException(err, {
    tags: { orderId, paymentGateway: 'stripe' },
    level: 'error',
  });
}

// Capture message — buat log penting
Sentry.captureMessage('Payment gateway timeout', {
  level: 'warning',
  tags: { gateway: 'stripe' },
  extra: { orderId, timeout: 5000 },
});

// Set user context — biar tau user mana yang kena error
Sentry.setUser({ id: req.user.id, email: req.user.email });
```

## Error Grouping & Fingerprint

Sentry group error otomatis berdasarkan stack trace. Tapi kadang satu error dikelompokin beda atau error beda dikelompokin sama.

### Custom Fingerprint

```typescript
Sentry.captureException(new Error('Database connection failed'), {
  // Paksa jadi satu grup untuk error database
  fingerprint: ['database-connection-error', process.env.DB_HOST],
});

// Atau bedain berdasarkan error code
app.use((err, req, res, next) => {
  if (err.code === 'ECONNREFUSED') {
    Sentry.setContext('Database connection refused. Check DB_HOST:', {
      dbHost: process.env.DB_HOST,
      dbPort: process.env.DB_PORT,
      service: 'payment-service',
    });
  }

  Sentry.captureException(err, {
    fingerprint: [err.code || err.name, req.path],
  });

  next(err);
});
```

### Best Practice Fingerprint

| Situasi | Fingerprint Strategy |
|---------|---------------------|
| Error external API timeout | `['external-api-timeout', apiName]` |
| Database connection error | `['db-error', dbType]` |
| Validation error | `['validation', fieldName]` |
| 404 route | `['not-found', requestPath]` — jangan per-path |
| Rate limit | `['rate-limit']` — 1 grup aja |

## Breadcrumbs

Breadcrumbs = trail aksi user sebelum error. Sentry otomatis record: HTTP request, console.log, navigation, dll. Tapi kita bisa add manual.

```typescript
import * as Sentry from '@sentry/node';

// Otomatis — Sentry record request handler
app.get('/api/checkout', async (req, res) => {
  // Manual breadcrumb
  Sentry.addBreadcrumb({
    category: 'checkout',
    message: 'Starting checkout process',
    level: 'info',
    data: { cartItems: cart.length, total: cartTotal },
  });

  try {
    await createOrder(cart);
    Sentry.addBreadcrumb({
      category: 'checkout',
      message: 'Order created',
      level: 'info',
      data: { orderId: newOrder.id },
    });
    
    await chargePayment(newOrder.id);
  } catch (err) {
    Sentry.addBreadcrumb({
      category: 'checkout',
      message: 'Payment failed',
      level: 'error',
      data: { orderId: newOrder?.id, errorMessage: err.message },
    });
    
    Sentry.captureException(err);
  }
});
```

**Breadcrumb levels:** `debug`, `info`, `warning`, `error`

**Batasan:** Default max 100 breadcrumbs. Atur lewat `maxBreadcrumbs: 50` di init.

## Performance Tracing

### Transactions & Spans

Transaction = 1 request (misal `GET /api/users`). Spans = sub-operasi dalam request (query DB, call external API).

```typescript
app.get('/api/orders/:id', async (req, res) => {
  // Transaction otomatis dari tracingHandler, tapi bisa manual:
  const transaction = Sentry.startTransaction({
    op: 'http.server',
    name: `GET /api/orders/:id`,
  });

  // Set transaction aktif
  Sentry.getCurrentHub().configureScope(scope => scope.setSpan(transaction));

  try {
    // Span 1 — database query
    const orderSpan = transaction.startChild({
      op: 'db.query',
      description: 'SELECT orders WHERE id = ?',
    });
    const order = await db.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    orderSpan.finish();

    // Span 2 — external API call
    const paymentSpan = transaction.startChild({
      op: 'http.client',
      description: 'GET payment-service/status',
    });
    await fetch(`https://payment-api/status/${order.paymentId}`);
    paymentSpan.finish();

    res.json(order);
  } catch (err) {
    Sentry.captureException(err);
    res.status(500).json({ error: 'Failed' });
  } finally {
    // WAJIB: finish transaction
    transaction.finish();
  }
});
```

### Melihat Performance di Sentry

Di Sentry dashboard → Performance → liat:

- **Response time distribution** — historis, spike detection
- **Waterfall chart** — breakdown tiap span
- **Slowest endpoints** — top N endpoint paling lambat
- **Transaction summary** — throughput, p50, p95, p99

### Automatic Instrumentation

Sentry otomatis nge-instrument:

- Express route handler (udah jadi transaction)
- Database queries (jika pake ORM yang didukung: Prisma, Sequelize, Mongoose)
- Outgoing HTTP requests (fetch, axios, got)
- `console.log` → jadi breadcrumbs

Tinggal pastiin `tracingHandler()` dipasang.

## Source Maps

Kode production biasanya di-minify/transpile. Stack trace di Sentry jadi:

```
Error: Something broke
  at o (bundle.js:1:12345)
  at n (bundle.js:1:67890)
```

Source maps balikin ke source asli:

```
Error: Something broke
  at processPayment (src/services/payment.ts:42:10)
  at handler (src/routes/checkout.ts:15:3)
```

### Upload Source Maps via CI

```bash
npm install @sentry/cli


---

# Set env
export SENTRY_AUTH_TOKEN=your_auth_token
export SENTRY_ORG=your_org
export SENTRY_PROJECT=your_project


---

# Create release & upload
sentry-cli releases new "$RELEASE_VERSION"
sentry-cli releases files "$RELEASE_VERSION" upload-sourcemaps ./dist --url-prefix "~/app"
sentry-cli releases set-commits "$RELEASE_VERSION" --auto
sentry-cli releases finalize "$RELEASE_VERSION"
```

**JANGAN upload source maps ke production public — biar cuma Sentry yang pake.**

### Otomatis dengan Webpack/Vite

```javascript
// sentry.webpack.config.js
const { sentryWebpackPlugin } = require('@sentry/webpack-plugin');

module.exports = {
  // ...
  plugins: [
    sentryWebpackPlugin({
      org: 'my-org',
      project: 'my-project',
      authToken: process.env.SENTRY_AUTH_TOKEN,
      release: { name: process.env.RELEASE_VERSION },
    }),
  ],
};
```

## Release Tracking & Deploy Notification

Kasih tau Sentry tiap deploy baru — biar bisa liat error muncul di release mana.

```bash

---

# Di CI/CD pipeline (GitHub Actions, GitLab CI, dll)
sentry-cli releases new "$CI_COMMIT_TAG"
sentry-cli releases set-commits "$CI_COMMIT_TAG" --auto
sentry-cli releases finalize "$CI_COMMIT_TAG"
sentry-cli releases deploys "$CI_COMMIT_TAG" new -e production
```

### Integrasi dengan Git

Sentry connect ke GitHub/GitLab — liat suspect commit yang introduce error langsung di dashboard.

### Deploy Notifications

Di Sentry → Alerts → set aturan:

- **When:** Error rate > 10% dalam 5 menit
- **If:** Release baru
- **Then:** Kirim email, Slack, PagerDuty, dll.

## Latihan

1. Setup Sentry di Express app: inisialisasi dengan DSN, pasang requestHandler, tracingHandler, dan errorHandler. Konfigurasi: `tracesSampleRate: 0.2` di production, active `attachStacktrace`. Tulis kode lengkap dari init sampai error handler.

2. Implementasikan custom fingerprint untuk: (a) database timeout error, (b) validation error per field, (c) 404 not found. Jelaskan strategi fingerprint untuk masing-masing dan tulis kode `captureException` dengan fingerprint yang sesuai.

3. Buat manual breadcrumbs di flow checkout: cart validation → create order → charge payment. Setiap step punya breadcrumbs sendiri. Kalo payment gagal, tambah breadcrumb error + captureException. Tulis kode lengkap.

4. Setup performance tracing: buat transaction manual untuk route `POST /api/orders` yang punya 3 spans — validasi input (db query), create order (db write), kirim email (external API call). Finish transaction setelah selesai. Tampilkan kode + bagaimana cara liat waterfall chart di Sentry.
