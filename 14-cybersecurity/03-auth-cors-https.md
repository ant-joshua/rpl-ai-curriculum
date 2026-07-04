# Sesi 3: Secure Auth, CORS & HTTPS

> **Durasi:** 2 jam
> **Tujuan:** Implementasi authentication aman (bcrypt + JWT), CORS yang benar, HTTPS, rate limiting

---

## Bcrypt — Password Hashing

**Jangan pernah simpan password dalam bentuk apapun yang bisa dibaca.** Bcrypt hash pake **salt** + **cost factor** biar lambat — brute force jadi nggak praktis.

### Kenapa Bcrypt?

| Algoritma | Waktu Hash (1M attempts) | Aman? |
|-----------|-------------------------|-------|
| MD5 | < 1 detik | ❌ Bocor |
| SHA1 | < 1 detik | ❌ Bocor |
| bcrypt (cost 12) | ~250 ms per hash | ✅ Aman |
| Argon2id | ~300 ms per hash | ✅ Paling aman |

### Implementasi Register

```typescript
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const SALT_ROUNDS = 12; // cost factor — higher = slower = safer

app.post('/api/auth/register', async (req: any, res: any) => {
  const { email, password, nama } = req.body;

  // 1. Validasi input
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Input tidak valid' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password minimal 8 karakter' });
  }

  // 2. Cek email udah terdaftar
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: 'Email sudah terdaftar' });
  }

  // 3. Hash password — otomatis generate salt + hash
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // 4. Simpan user — jangan simpan password mentah!
  const user = await prisma.user.create({
    data: { email, nama, password: hashedPassword },
    select: { id: true, email: true, nama: true, createdAt: true },
  });

  res.status(201).json({ message: 'Registrasi berhasil', user });
});
```

### Implementasi Login

```typescript
import jwt from 'jsonwebtoken';

app.post('/api/auth/login', async (req: any, res: any) => {
  const { email, password } = req.body;

  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Input tidak valid' });
  }

  // 1. Cari user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    // Jangan bilang "user not found" — kasih tau "email/password salah"
    return res.status(401).json({ error: 'Email atau password salah' });
  }

  // 2. Compare password pake bcrypt
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ error: 'Email atau password salah' });
  }

  // 3. Generate JWT
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: '15m' } // access token — short expiry
  );

  // 4. Set cookie httpOnly
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 menit
  });

  // 5. Return sukses
  res.json({
    message: 'Login berhasil',
    user: { id: user.id, email: user.email, nama: user.nama },
  });
});
```

### Best Practices Password

```typescript
// ✅ Minimum requirement
const passwordPolicy = {
  minLength: 8,
  maxLength: 128, // bcrypt punya limit 72 bytes
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSymbol: true,
};

function validatePassword(password: string): string | null {
  if (password.length < passwordPolicy.minLength) {
    return `Password minimal ${passwordPolicy.minLength} karakter`;
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password harus ada huruf besar';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password harus ada huruf kecil';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password harus ada angka';
  }
  if (!/[!@#$%^&*]/.test(password)) {
    return 'Password harus ada simbol';
  }
  return null; // valid
}
```

---

## JWT — Secure Token Management

### Generate JWT (Sign)

```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;
const REFRESH_SECRET = process.env.REFRESH_SECRET as string;

// Access token — short lived (15 menit)
function generateAccessToken(user: { id: number; role: string }) {
  return jwt.sign(
    { userId: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: '15m', issuer: 'myapp' }
  );
}

// Refresh token — long lived (7 hari)
function generateRefreshToken(user: { id: number }) {
  return jwt.sign(
    { userId: user.id, tokenVersion: Date.now() },
    REFRESH_SECRET,
    { expiresIn: '7d', issuer: 'myapp' }
  );
}
```

### Verify JWT (Auth Middleware)

```typescript
// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: { userId: number; role: string };
}

function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  // Ambil token dari cookie (priority) atau Authorization header
  const token =
    req.cookies?.token ||
    req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Akses ditolak. Login dulu.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: number;
      role: string;
    };
    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: 'Token expired',
        code: 'TOKEN_EXPIRED',
      });
    }
    return res.status(401).json({ error: 'Token tidak valid' });
  }
}

function authorize(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Belum login' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

export { authenticate, authorize, AuthRequest };
```

### Refresh Token Flow

```typescript
app.post('/api/auth/refresh', async (req: any, res: any) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token tidak ada' });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_SECRET as string
    ) as { userId: number };

    // Generate new access token
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'User tidak ditemukan' });
    }

    const newAccessToken = generateAccessToken(user);

    res.cookie('token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    res.json({ message: 'Token refreshed' });
  } catch (err) {
    return res.status(401).json({ error: 'Refresh token expired. Login ulang.' });
  }
});
```

### JWT Security Checklist

| Praktik | Wajib? |
|---------|--------|
| Secret minimal 256-bit (32 bytes hex) | 🔴 WAJIB |
| Expiry singkat (15 menit access, 7 hari refresh) | 🔴 WAJIB |
| httpOnly cookie (jangan localStorage) | 🔴 WAJIB |
| Verifikasi di setiap protected endpoint | 🔴 WAJIB |
| Jangan pake `noTimestamp` | 🟡 Sangat disarankan |
| Jangan simpan sensitive data di payload | 🟡 Sangat disarankan |
| Validate issuer & audience | 🟢 Tambahan |

---

## CORS — Cross-Origin Resource Sharing

CORS = mekanisme browser buat ngontrol domain mana yang boleh akses API lo.

### Konfigurasi CORS yang Benar

```typescript
import cors from 'cors';

// ❌ RENTAN — buka untuk semua domain!
app.use(cors({ origin: '*' }));

// ✅ AMAN — whitelist origin spesifik
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'https://admin.kamu.com',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origin tidak diizinkan'));
    }
  },
  credentials: true,   // allow cookie/auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['X-Request-Id'],
  maxAge: 86400,       // cache preflight response 24 jam
}));

// Tangani CORS error
app.use((err: any, req: any, res: any, next: any) => {
  if (err.message === 'Origin tidak diizinkan') {
    return res.status(403).json({ error: 'CORS error: origin tidak dikenal' });
  }
  next(err);
});
```

### CORS & Credentials

Kalo pake cookie auth, wajib set:

```typescript
// Server
app.use(cors({
  origin: 'https://frontend-kamu.com', // spesifik — jangan '*'
  credentials: true,                    // allow cookie
}));

// Client (fetch)
fetch('https://api.kamu.com/data', {
  credentials: 'include', // kirim cookie
});

// Client (axios)
axios.get('https://api.kamu.com/data', {
  withCredentials: true,
});
```

---

## HTTPS & SSL

### Redirect HTTP → HTTPS di Express

```typescript
// ✅ AMAN — redirect semua HTTP ke HTTPS
app.use((req: any, res: any, next: any) => {
  if (
    req.headers['x-forwarded-proto'] !== 'https' &&
    process.env.NODE_ENV === 'production'
  ) {
    return res.redirect(301, `https://${req.hostname}${req.originalUrl}`);
  }
  next();
});

// Atau pake express-sslify (lebih clean)
import sslify from 'express-sslify';
app.use(sslify.HTTPS({ trustProtoHeader: true }));
```

### Certbot — SSL Gratis

```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Dapetin SSL untuk domain
sudo certbot --nginx -d domainkamu.com -d www.domainkamu.com

# Auto-renew (Certbot otomatis bikin cron)
sudo certbot renew --dry-run

# Verifikasi
sudo certbot certificates
```

### HSTS — Paksa HTTPS

```typescript
import helmet from 'helmet';

app.use(helmet({
  strictTransportSecurity: {
    maxAge: 31536000,       // 1 tahun
    includeSubDomains: true, // termasuk subdomain
    preload: true,           // register di browser HSTS preload list
  },
}));
```

---

## Rate Limiting

### Per-Endpoint Rate Limiter

```typescript
import rateLimit from 'express-rate-limit';

// Login — 5 percobaan per 15 menit
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Terlalu banyak percobaan login. Coba 15 menit lagi.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // hitung semua request
});

// Register — 3 percobaan per jam
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { error: 'Terlalu banyak registrasi. Coba 1 jam lagi.' },
});

// API umum — 100 request per menit
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'Rate limit exceeded. Coba lagi nanti.' },
});

// Apply
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/register', registerLimiter);
app.use('/api', apiLimiter);
```

### Rate Limiter by User Role

```typescript
function createRoleBasedLimiter(maxRequests: number, windowMs: number) {
  return rateLimit({
    windowMs,
    max: (req) => {
      // Admin dapet limit lebih tinggi
      if (req.user?.role === 'admin') return maxRequests * 5;
      return maxRequests;
    },
    keyGenerator: (req) => {
      // Group by IP + userId kalo ada
      return req.user?.userId
        ? `user:${req.user.userId}`
        : `ip:${req.ip}`;
    },
  });
}

const userLimiter = createRoleBasedLimiter(100, 60 * 1000);
app.use('/api', userLimiter);
```

---

## Secure Headers — Complete Setup

Gabungin semua middleware keamanan:

```typescript
// middleware/security.ts
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';

export function setupSecurity(app: any) {
  // 1. Helmet — 15+ security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }));

  // 2. CORS — whitelist
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }));

  // 3. Rate limiting global
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  }));

  // 4. HTTP parameter pollution protection
  app.use(hpp());

  // 5. Trust proxy (kalo di belakang NGINX/reverse proxy)
  app.set('trust proxy', 1);
}
```

---

## Latihan

### Latihan 1: Register + Login Aman

Bikin auth system lengkap dengan best practices:

```typescript
// TODO: Lengkapi endpoint auth
// Requirements:
// 1. Register: validasi password (min 8, ada huruf besar/kecil/angka)
// 2. Hash pake bcrypt (cost 12)
// 3. Login: compare bcrypt, jangan kasih tau user mana yang salah
// 4. JWT: expiry 15 menit, httpOnly cookie, sameSite strict
// 5. Refresh token: 7 hari, endpoint /api/auth/refresh
// 6. Rate limit: 5x/15menit buat login, 100x/menit buat API

app.post('/api/auth/register', async (req: any, res: any) => {
  // ...kode lo
});

app.post('/api/auth/login', async (req: any, res: any) => {
  // ...kode lo
});

app.post('/api/auth/refresh', async (req: any, res: any) => {
  // ...kode lo
});
```

### Latihan 2: Auth Middleware + Role-based Access

Bikin middleware auth dengan role-based access:

```typescript
// TODO: Lengkapi middleware
// Requirements:
// 1. authenticate — verifikasi JWT, attach user ke req
// 2. authorize('admin') — cuma admin boleh akses
// 3. Handle TokenExpiredError dengan pesan jelas
// 4. Handle missing token dengan 401

function authenticate(req: any, res: any, next: any) {
  // ...kode lo
}

function authorize(...roles: string[]) {
  return (req: any, res: any, next: any) => {
    // ...kode lo
  };
}

// Protected route — cuma admin
app.delete('/api/users/:id', authenticate, authorize('admin'), async (req: any, res: any) => {
  // ...kode lo
});
```

### Latihan 3: CORS + Rate Limiter Config

Buat konfigurasi keamanan untuk API fintech:

```typescript
// TODO: Konfigurasi buat API fintech
// 1. CORS: cuma domain frontend (https://app.fintech.com) + dashboard admin
// 2. Rate limit:
//    - Login: 3x/15menit (brute force protection)
//    - Transfer: 5x/menit per user
//    - API umum: 60x/menit
// 3. Role-based rate limit: admin bebas
// 4. HTTPS redirect + HSTS (1 tahun)

const corsOptions = {
  // ...kode lo
};

const loginLimiter = rateLimit({
  // ...kode lo
});

// ...kode selanjutnya
```

### Latihan 4: Security Headers Audit

Audit aplikasi Express berikut dan laporan header yang kurang:

```typescript
// Aplikasi saat ini:
const express = require('express');
const app = express();

app.get('/api/users', (req, res) => {
  res.json([{ id: 1, name: 'Budi' }]);
});

app.listen(3000);
```

**Tugas:**
1. Cek header HTTP yang hilang (pake curl -I atau browser devtools)
2. Tambah: Helmet, CORS, Rate Limiter
3. Tambah: HTTPS redirect middleware
4. Verifikasi pake `curl -I http://localhost:3000`

---

## Ringkasan

| Area | Best Practice |
|------|--------------|
| **Password** | bcrypt (cost ≥ 12), validasi strength |
| **JWT** | Secret 256-bit, expiry 15m, httpOnly cookie |
| **CORS** | Whitelist origin, jangan `*` |
| **HTTPS** | Redirect HTTP→HTTPS, HSTS, Certbot |
| **Rate Limit** | Per-endpoint, role-based, standard headers |

> **Prinsip:** Authentication & transport security adalah fondasi. Kalo ini bocor, proteksi lain nggak ada artinya.
