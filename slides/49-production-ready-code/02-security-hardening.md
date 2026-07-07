---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — Modul 49: Production-Ready Code"
footer: "Sesi 02: Security Hardening"
---

<!-- _class: title -->
# Sesi 2: Security Hardening

**Durasi:** 3 JP (135 menit)

## Tujuan Pembelajaran

Setelah sesi ini, peserta mampu:
- Mengimplementasikan Helmet untuk keamanan header HTTP
- Mengonfigurasi CORS dengan benar
- Menerapkan rate limiting dengan express-rate-limit
- Membersihkan input dari serangan XSS dan SQL injection
- Melakukan audit keamanan dependency

---

## 2.1 Helmet

Helmet mengamankan aplikasi Express dengan mengatur berbagai header HTTP.

### Instalasi

```bash
npm install helmet
```

### Konfigurasi Dasar

```typescript
import helmet from 'helmet';
import express from 'express';

const app = express();

// Gunakan semua middleware Helmet default
app.use(helmet());
```

### Header yang Diatur Helmet

| Header | Default | Fungsi |
|--------|---------|--------|
| `Content-Security-Policy` | `default-src 'self'` | Mencegah XSS dengan membatasi sumber konten |
| `X-Content-Type-Options` | `nosniff` | Mencegah MIME sniffing |
| `X-Frame-Options` | `SAMEORIGIN` | Mencegah clickjacking |
| `X-XSS-Protection` | `0` | Nonaktifkan XSS filter lama browser |
| `Strict-Transport-Security` | `max-age=15552000` | Memaksa HTTPS |
| `Referrer-Policy` | `no-referrer` | Mengontrol informasi referer |

### Konfigurasi Lanjutan

```typescript
app.use(
  helmet({
    // Content Security Policy kustom
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'cdn.example.com'],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'images.example.com'],
        connectSrc: ["'self'", 'api.example.com'],
        fontSrc: ["'self'", 'fonts.googleapis.com'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },

    // Frame guard — siapa yang boleh membungkus dalam iframe
    frameguard: {
      action: 'deny', // 'deny' | 'sameorigin' | 'allow-from'
    },

    // HSTS — HTTP Strict Transport Security
    hsts: {
      maxAge: 31536000,   // 1 tahun dalam detik
      includeSubDomains: true,
      preload: true,
    },

    // Nonaktifkan header yang tidak diperlukan
    xPoweredBy: false,    // Hapus header X-Powered-By
  }),
);
```

### CSP (Content Security Policy) — Penjelasan

CSP mencegah XSS dengan mendeklarasikan sumber konten yang sah.

```
Content-Security-Policy: default-src 'self'; script-src 'self' cdn.example.com; img-src 'self' data:
```

- `default-src 'self'` — semua konten hanya dari domain sendiri
- `script-src` — sumber script yang diizinkan
- `img-src` — sumber gambar yang diizinkan
- `'unsafe-inline'` — izinkan script inline (kurangi keamanan, kadang diperlukan)

---

## 2.2 CORS (Cross-Origin Resource Sharing)

CORS mengontrol domain mana yang bisa mengakses API.

### Instalasi

```bash
npm install cors
npm install -D @types/cors
```

### Konfigurasi Dasar

```typescript
import cors from 'cors';
import express from 'express';

const app = express();

// Izinkan semua origin (tidak untuk production!)
app.use(cors());
```

### Konfigurasi Production

```typescript
const allowedOrigins = [
  'https://app.example.com',
  'https://admin.example.com',
  /\.example\.com$/,  // Regex untuk subdomain
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Izinkan request tanpa origin (Postman, server-side)
      if (!origin) return callback(null, true);

      if (allowedOrigins.some(allowed => 
        allowed instanceof RegExp 
          ? allowed.test(origin) 
          : allowed === origin
      )) {
        callback(null, true);
      } else {
        callback(new Error('Tidak diizinkan oleh CORS'));
      }
    },
    credentials: true,        // Izinkan cookie/Authorization header
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Total-Count', 'X-Rate-Limit'],
    maxAge: 86400,            // Cache preflight 24 jam (dalam detik)
  }),
);
```

### CORS Preflight

Browser mengirim request `OPTIONS` sebelum request kompleks (method selain GET/HEAD/POST, atau dengan custom header).

```typescript
// CORS middleware otomatis menangani preflight
// Tapi bisa dikustomisasi:
app.options('/api/*', cors());  // Handle preflight untuk semua route API
```

---

## 2.3 Rate Limiting

Mencegah abuse dengan membatasi jumlah request per waktu.

### Instalasi

```bash
npm install express-rate-limit
```

### Konfigurasi Dasar

```typescript
import rateLimit from 'express-rate-limit';

// Global rate limit — semua route
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 menit
  max: 100,                    // maks 100 request per window
  standardHeaders: true,       // Return rate limit info di header
  legacyHeaders: false,        // Nonaktifkan header X-RateLimit-*
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT',
      message: 'Terlalu banyak request, coba lagi nanti',
    },
  },
});

app.use(globalLimiter);
```

### Sliding Window

Secara default express-rate-limit menggunakan fixed window. Untuk sliding window:

```typescript
import rateLimit from 'express-rate-limit';

const slidingLimiter = rateLimit({
  windowMs: 60 * 1000,     // 1 menit
  max: 30,
  // sliding window dengan mencatat timestamp per request
  // express-rate-limit v7+ menggunakan sliding window secara default
  standardHeaders: true,
  legacyHeaders: false,
});
```

Sliding window membagi jendela menjadi segmen-segmen kecil. Saat request masuk, sistem menghitung jumlah request dalam rentang waktu yang benar-benar bergulir, bukan reset per menit penuh.

### Per-Route vs Global

```typescript
// Global limiter — lemah, untuk semua endpoint
app.use(globalLimiter);

// Per-route limiter — ketat, untuk endpoint sensitif
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 menit
  max: 5,                       // hanya 5 percobaan login
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT',
      message: 'Terlalu banyak percobaan login',
    },
  },
});

app.post('/api/login', authLimiter, loginHandler);
app.post('/api/register', authLimiter, registerHandler);

// API limiter — untuk endpoint umum
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 menit
  max: 60,
});

app.use('/api/', apiLimiter);
```

---

## 2.4 Input Sanitization

Membersihkan input untuk mencegah XSS dan injection.

### XSS Prevention

```typescript
// Menggunakan xss (npm package)
import xss from 'xss';

function sanitizeInput(input: string): string {
  return xss(input, {
    whiteList: {},           // Tidak ada tag HTML yang diizinkan
    stripIgnoreTag: true,    // Hapus tag yang tidak dikenal
    stripIgnoreTagBody: ['script', 'style'],  // Hapus konten tag berbahaya
  });
}

// Middleware sanitasi
function sanitizeBody(req: Request, _res: Response, next: NextFunction) {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeInput(req.body[key]);
      }
    }
  }
  next();
}
```

### DOMPurify (untuk konten HTML yang diizinkan)

```bash
npm install dompurify jsdom
```

```typescript
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

const window = new JSDOM('').window;
const purify = DOMPurify(window as any);

function sanitizeHtml(html: string): string {
  return purify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
  });
}
// Input: <script>alert('xss')</script><p>Hello <b>World</b></p>
// Output: <p>Hello <b>World</b></p>
```

### SQL Injection Prevention

Di Node.js, SQL injection dicegah dengan **parameterized query / prepared statement**.

```typescript
// ❌ RENTAN — concatenation
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ AMAN — parameterized query (mysql2)
const query = 'SELECT * FROM users WHERE email = ?';
const [rows] = await connection.execute(query, [email]);

// ✅ AMAN — parameterized query (pg / node-postgres)
const query = 'SELECT * FROM users WHERE email = $1';
const result = await client.query(query, [email]);

// ✅ AMAN — Prisma ORM (prepared statement otomatis)
const user = await prisma.user.findUnique({ where: { email } });
```

**Aturan emas:** Jangan pernah menggabungkan input user langsung ke query SQL. Selalu gunakan placeholder (`?` atau `$1`).

### Validasi + Sanitasi Bersamaan

```typescript
import { z } from 'zod';

const commentSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(1000),
  authorName: z.string().min(1).max(50),
});

function sanitizeAndValidate(data: unknown) {
  const sanitized = {
    title: xss(data.title),
    content: xss(data.content),
    authorName: xss(data.authorName),
  };
  return commentSchema.parse(sanitized);
}
```

---

## 2.5 Dependency Security

### npm audit

```bash

---

# Audit dependency untuk vulnerability
npm audit


---

# Perbaiki otomatis (patch version)
npm audit fix


---

# Lihat detail
npm audit --json
```

### Snyk

```bash

---

# Instalasi
npm install -g snyk


---

# Auth
snyk auth


---

# Test project
snyk test


---

# Monitor (pantau terus)
snyk monitor
```

### Lock File

```bash

---

# Selalu commit lock file!

---

# package-lock.json — npm

---

# yarn.lock — yarn

---

# pnpm-lock.yaml — pnpm


---

# Lock file memastikan:

---

# 1. Semua developer install versi dependency yang sama

---

# 2. CI/CD menggunakan versi yang sudah terverifikasi

---

# 3. Rollback lebih mudah
```

### Semantic Version Pinning

```json
{
  "dependencies": {
    "express": "^4.18.2",     // Izinkan minor/patch update
    "helmet": "7.1.0",        // Pin exact version
    "zod": "~3.22.0",         // Hanya patch update
    "cors": "^2.8.5"
  }
}
```

| Prefix | Makna | Rentang |
|--------|-------|---------|
| `^` | Compatible | `>=3.22.0 <4.0.0` |
| `~` | Approximate | `>=3.22.0 <3.23.0` |
| no prefix | Exact | `3.22.0` saja |

### Checklist Keamanan Dependency

- [ ] Lock file di-commit
- [ ] `npm audit` jalan di CI
- [ ] Dependency tidak deprecated
- [ ] Versi pin untuk dependency kritis
- [ ] Regular update (bulanan)
- [ ] Hapus dependency tidak terpakai (`npm prune`)

---

## 2.6 Praktik Lengkap

```typescript
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import xss from 'xss';

const app = express();

// 1. Helmet — keamanan header
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
    },
  },
}));

// 2. CORS — akses terkontrol
app.use(cors({
  origin: ['https://app.example.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// 3. Body parser — sebelum rate limiter
app.use(express.json({ limit: '10kb' }));

// 4. Sanitasi input
app.use((req, _res, next) => {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      }
    }
  }
  next();
});

// 5. Rate limiting global
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
}));

// Route
app.post('/api/comment', (req, res) => {
  res.json({ success: true, data: req.body });
});

app.listen(3000);
```

---

## Latihan

### Soal 1: Implementasi Helmet

Buat konfigurasi Helmet untuk aplikasi Express dengan:

1. CSP: script hanya dari `'self'` dan `cdn.trusted.com`, style dari `'self'` dan `fonts.googleapis.com`
2. Frame guard: deny semua
3. HSTS: 1 tahun, include subdomains, preload
4. Nonaktifkan header X-Powered-By

### Soal 2: CORS Konfigurasi

Buat CORS configuration yang:

1. Izinkan origin: `https://dashboard.example.com` dan `https://api.example.com`
2. Izinkan credentials (cookie)
3. Izinkan method: GET, POST, PUT, PATCH, DELETE
4. Cache preflight 1 jam
5. Kembalikan error jika origin tidak dikenal

### Soal 3: Rate Limiting

Buat rate limiter untuk aplikasi e-commerce:

1. Global: 100 request/menit
2. Auth routes (`/api/auth/*`): 5 request/menit untuk login, 10 request/menit untuk register
3. API routes (`/api/*`): 60 request/menit
4. Format error konsisten dengan `{ success, error: { code, message } }`
