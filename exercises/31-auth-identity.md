# Authentication & Identity — Latihan

## Level 1: Dasar

### 1. JWT — Struktur Token
**Pertanyaan:** Sebutkan 3 bagian dari JWT dan jelaskan isi masing-masing.

**Hint:** Header.Payload.Signature. Base64-encoded.

---

### 2. JWT — Generate & Verify Token
```javascript
const jwt = require('jsonwebtoken');
const SECRET = 'rahasia-super-aman';
```

**Pertanyaan:** Tulis kode untuk:
1. Generate token untuk user `{ id: 1, role: 'admin' }` yang expired dalam 1 jam
2. Verify token yang diterima, decode payload-nya
3. Tangani error kalau token expired atau signature invalid

**Hint:** `jwt.sign(payload, secret, { expiresIn: '1h' })`, `jwt.verify(token, secret)`.

---

### 3. Password Hashing — bcrypt
**Pertanyaan:** Tulis fungsi untuk:
1. Hash password dengan bcrypt (salt rounds = 12)
2. Bandingkan password plain text dengan hash
3. Kenapa salt rounds penting? Apa risiko pakai angka terlalu kecil atau terlalu besar?

**Hint:**
```javascript
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash(password, 12);
const match = await bcrypt.compare(password, hash);
```

---

### 4. HTTP Auth — Basic vs Bearer
**Pertanyaan:** Isi tabel perbandingan:

| Aspek | Basic Auth | Bearer Token (JWT) |
|-------|-----------|-------------------|
| Cara kirim credential | ? | ? |
| Keamanan | ? | ? |
| Stateful/stateless | ? | ? |
| Cocok untuk | ? | ? |

**Hint:** Basic = base64(username:password) di header. Bearer = token di header `Authorization: Bearer <token>`.

---

### 5. Session vs Token — Perbandingan
**Pertanyaan:** Pilih session-based atau token-based authentication untuk skenario:

1. Aplikasi banking web — prioritas keamanan tinggi, bisa revoke session kapan aja
2. Mobile app dengan banyak API calls — prioritas performance, stateless
3. Microservices — service A authenticate, service B verify

Jelaskan alasan tiap pilihan.

**Hint:** Session = stateful (server simpan session), mudah di-revoke. Token = stateless (client simpan token), scalable.

---

### 6. OAuth2 — Flow Diagram
**Pertanyaan:** Cocokkan OAuth2 flow dengan skenario:

| Skenario | Flow |
|----------|------|
| Aplikasi mobile login pake Google | a. Client Credentials |
| Backend service-to-service communication | b. Authorization Code + PKCE |
| Aplikasi web server-side (punya backend) | c. Authorization Code |

**Hint:** PKCE untuk public client (mobile/SPA) yang nggak bisa simpan client_secret dengan aman.

---

### 7. RBAC — Role & Permission
**Pertanyaan:** Desain RBAC untuk aplikasi e-commerce dengan role:
- `admin` — bisa apa aja
- `manager` — kelola produk, lihat order, nggak bisa kelola user
- `staff` — lihat produk, update stok, nggak bisa hapus apa pun
- `customer` — lihat produk, beli, lihat order sendiri

Tentukan permission untuk tiap role. Contoh format: `product:create`, `order:read`, dll.

**Hint:** Format: `resource:action`. Resources: `user`, `product`, `order`. Actions: `create`, `read`, `update`, `delete`.

---

### 8. CORS & CSRF — Basic Protection
**Pertanyaan:** 
1. Jelaskan perbedaan CORS dan CSRF
2. Contoh serangan CSRF dan cara mencegahnya
3. Header apa yang harus diset server untuk CORS? (kasih contoh untuk allow origin `https://app.example.com`)

**Hint:** CORS = browser policy. CSRF = serangan pake session korban. Pencegahan CSRF: SameSite cookie, CSRF token. CORS header: `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`.

---

## Level 2: Intermediate

### 9. JWT — Access Token & Refresh Token Flow
**Pertanyaan:** Implementasi token refresh flow:

1. Login → return `accessToken` (exp: 15 menit) + `refreshToken` (exp: 7 hari)
2. Access token dikirim di header `Authorization: Bearer`
3. Refresh token dikirim sebagai HTTP-only cookie
4. Endpoint `POST /auth/refresh` — terima refresh token, return access token baru
5. Rotate refresh token (refresh token lama jadi invalid setelah dipake)
6. Logout → hapus refresh token dari database

Tulis kode Express untuk endpoint login, refresh, dan logout.

**Hint:**
```javascript
// Refresh token disimpan di DB (table refresh_tokens)
app.post('/auth/refresh', async (req, res) => {
  const token = req.cookies.refreshToken;
  const stored = await db.refreshTokens.findUnique({ where: { token } });
  if (!stored || stored.expiresAt < new Date()) return res.sendStatus(401);
  // Rotate: delete old, create new
  const newAccessToken = jwt.sign({ userId: stored.userId }, ACCESS_SECRET, { expiresIn: '15m' });
  const newRefreshToken = crypto.randomUUID();
  await db.refreshTokens.create({ data: { token: newRefreshToken, userId: stored.userId, expiresAt: new Date(Date.now() + 7*24*60*60*1000) } });
  await db.refreshTokens.delete({ where: { id: stored.id } });
  res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'strict', path: '/auth/refresh' });
  res.json({ accessToken: newAccessToken });
});
```

---

### 10. OAuth2 — Authorization Code + PKCE Flow
**Pertanyaan:** Implementasi OAuth2 Authorization Code dengan PKCE untuk SPA:

1. Client generate `code_verifier` (random string 43-128 chars) dan `code_challenge` (SHA256 hash base64url dari verifier)
2. Redirect ke authorization server: `/authorize?response_type=code&client_id=...&code_challenge=...&code_challenge_method=S256`
3. User login dan approve → redirect back dengan `code`
4. Client kirim `POST /token` dengan `code` + `code_verifier`
5. Server verify `code_verifier` cocok dengan `code_challenge` → return tokens

Jelaskan: kenapa PKCE diperlukan untuk SPA/mobile? Apa yang terjadi tanpa PKCE?

**Hint:** PKCE mencegah authorization code interception attack. Tanpa PKCE, attacker yang dapet code bisa exchange jadi token.

---

### 11. TOTP — Time-based One-Time Password
**Pertanyaan:** Implementasi 2FA dengan TOTP:

1. Generate secret (16 byte random base32)
2. Generate QR code untuk Google Authenticator (`otpauth://totp/AppName:email?secret=...&issuer=AppName`)
3. Verify TOTP token dari user (validasi dengan window 1 periode sebelum/sesudah)
4. Backup codes (10 codes, sekali pakai) kalau user kehilangan device

**Hint:**
```javascript
const speakeasy = require('speakeasy');
const secret = speakeasy.generateSecret({ length: 20 });
const verified = speakeasy.totp.verify({ secret: secret.base32, encoding: 'base32', token: userToken, window: 1 });
```

---

### 12. RBAC — Middleware Implementation
**Pertanyaan:** Buat middleware RBAC untuk Express:

```javascript
// Struktur permission
const permissions = {
  admin: ['*'],
  manager: ['product:create', 'product:read', 'product:update', 'order:read'],
  staff: ['product:read', 'product:update-stock'],
  customer: ['product:read', 'order:create', 'order:read-own'],
};

function authorize(action) {
  // return middleware yang check req.user.role
  // kalau nggak punya permission → 403
}
```

Tulis implementasi `authorize` dan contoh penggunaannya di route:
```javascript
app.delete('/api/products/:id', authenticate, authorize('product:delete'), productController.delete);
```

**Hint:**
```javascript
function authorize(action) {
  return (req, res, next) => {
    const userPermissions = permissions[req.user.role] || [];
    if (userPermissions.includes('*') || userPermissions.includes(action)) return next();
    return res.status(403).json({ error: 'FORBIDDEN', message: 'Insufficient permissions' });
  };
}
```

---

### 13. Security Headers — Hardening
**Pertanyaan:** Tulis middleware Express untuk set security headers:

1. `Content-Security-Policy`: hanya allow script dari same origin
2. `X-Content-Type-Options: nosniff`
3. `X-Frame-Options: DENY`
4. `Strict-Transport-Security: max-age=31536000; includeSubDomains`
5. `Referrer-Policy: strict-origin-when-cross-origin`
6. `Permissions-Policy: geolocation=(), microphone=(), camera=()`

**Hint:** Bisa pake library `helmet` atau set manual `res.setHeader()`.

---

### 14. Bcrypt & Timing Attack
**Pertanyaan:** 
1. Kenapa perbandingan password harus pake `bcrypt.compare()` bukan `===`?
2. Apa itu timing attack dan bagaimana bcrypt mencegahnya?
3. Kenapa salt unik per user penting?

**Hint:** `===` return false lebih cepat kalau karakter pertama beda (timing leak). Bcrypt punya constant-time comparison.

---

## Level 3: Challenge

### 15. Full Auth System — Express + JWT + RBAC + 2FA
**Skenario:** Bangun sistem autentikasi lengkap untuk aplikasi enterprise.

**Pertanyaan:** Implementasi semua endpoint berikut:

**Auth Endpoints:**
1. `POST /auth/register` — register (name, email, password) → hash password, return user
2. `POST /auth/login` — login → verifikasi password, check 2FA, return access+refresh token
3. `POST /auth/refresh` — refresh token
4. `POST /auth/logout` — hapus refresh token
5. `POST /auth/2fa/setup` — generate TOTP secret, return QR code URL
6. `POST /auth/2fa/verify` — verify TOTP, enable 2FA
7. `POST /auth/2fa/disable` — disable 2FA (pake password + TOTP)
8. `GET /auth/me` — return current user profile

**Security Requirements:**
- Password min 8 chars, harus ada huruf besar, kecil, angka
- Rate limiting: 5 attempt login per menit per IP (return 429)
- Refresh token rotation + expiry 7 hari
- 2FA wajib untuk role admin
- Semua endpoint pakai HTTPS-only cookies untuk refresh token
- Log semua event login (success & failure) ke database audit log

**Hint:** Struktur database:
```
users: id, name, email, password_hash, role, totp_secret, totp_enabled
refresh_tokens: id, user_id, token, expires_at, created_at
audit_logs: id, user_id, action, ip, user_agent, success, created_at
login_attempts: id, ip, attempt_count, window_start
```

Middleware stack: `rateLimiter` → `authenticate` → `authorize(permission)`.

---

### 16. OAuth2 Server — Custom Implementation
**Skenario:** Kamu perlu build OAuth2 server internal untuk SSO di perusahaan.

**Pertanyaan:** Implementasi:

1. **Authorization endpoint** `GET /oauth/authorize`:
   - Validasi `client_id`, `redirect_uri`, `response_type=code`
   - Tampilkan halaman login + consent (bisa auto-approve)
   - Redirect ke `redirect_uri?code=...`

2. **Token endpoint** `POST /oauth/token`:
   - Grant types: `authorization_code`, `client_credentials`, `refresh_token`
   - Validasi `code` + `code_verifier` (PKCE)
   - Return `{ access_token, refresh_token, expires_in, token_type: 'Bearer' }`

3. **Client registration**:
   - Tiap aplikasi punya `client_id`, `client_secret` (jika confidential), `redirect_uris`
   - Public client (SPA): no secret, PKCE wajib

4. **Introspection endpoint** `POST /oauth/introspect`:
   - Resource server bisa cek validitas token
   - Return `{ active: true, sub: 'user_id', scope: 'openid profile' }`

**Hint:**
```javascript
// Authorization code flow
app.post('/oauth/token', async (req, res) => {
  const { grant_type, code, code_verifier, client_id, client_secret } = req.body;
  if (grant_type === 'authorization_code') {
    const authCode = await db.authCodes.findUnique({ where: { code } });
    if (!authCode || authCode.expiresAt < new Date()) return res.status(400).json({ error: 'invalid_grant' });
    // Verify PKCE: base64url(sha256(code_verifier)) === authCode.code_challenge
    const verifierHash = crypto.createHash('sha256').update(code_verifier).digest('base64url');
    if (verifierHash !== authCode.code_challenge) return res.status(400).json({ error: 'invalid_grant' });
    // Generate tokens...
  }
});
```

---

### 17. Security Audit — Find & Fix Vulnerabilities
**Pertanyaan:** Audit kode auth berikut, temukan minimal 6 kerentanan:

```javascript
// Auth controller — temukan celah keamanan!
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await db.query(`SELECT * FROM users WHERE email = '${email}'`); // [1]
  if (!user) return res.status(401).json({ error: 'User not found' }); // [2]
  if (password === user.password_hash) { // [3]
    const token = jwt.sign({ userId: user.id, role: user.role }, 'hardcoded-secret'); // [4]
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Wrong password' });
  }
});

app.get('/admin/users', (req, res) => {
  const token = req.headers.authorization; // [5]
  const decoded = jwt.decode(token); // [6]
  if (decoded.role === 'admin') {
    db.query('SELECT * FROM users', (err, users) => {
      res.json(users);
    });
  } else {
    res.status(403).json({ error: 'Forbidden' });
  }
});
```

**Pertanyaan:** Untuk tiap kerentanan yang ditemukan:
1. Sebutkan baris dan jenis kerentanannya
2. Jelaskan dampaknya
3. Tulis perbaikannya

**Hint:** Cari: SQL injection, user enumeration, plaintext password comparison, hardcoded secret, missing `Bearer` prefix handling, `jwt.decode()` bukan `jwt.verify()`, no input validation, error message too revealing.

---

### 18. Passwordless Authentication — Magic Link
**Skenario:** Implementasi login tanpa password pake magic link (email).

**Pertanyaan:** Desain dan implementasi:

1. **Request magic link:** User masukin email → server generate token (exp 15 menit) → kirim email link `https://app.com/auth/magic?token=...`
2. **Verify magic link:** Klik link → validasi token → login → return access + refresh token
3. **Security:**
   - Token random (crypto.randomBytes(32).toString('hex'))
   - Token sekali pakai (sudah dipakai → hapus)
   - Rate limit: max 3 request per 15 menit per email
   - Jangan expose apakah email terdaftar atau tidak (timing-safe)
4. **Device tracking:** Catat device info, kasih notifikasi kalau login dari device baru

**Hint:**
```javascript
app.post('/auth/magic-link', rateLimiter, async (req, res) => {
  const { email } = req.body;
  // Always return 200 — jangan kasih tahu email exist atau nggak
  const token = crypto.randomBytes(32).toString('hex');
  await db.magicTokens.create({ data: { email, token, expiresAt: new Date(Date.now() + 15*60*1000) } });
  // Send email (async, jangan blocking response)
  sendMagicLinkEmail(email, token);
  res.json({ message: 'Kalau email terdaftar, cek inbox kamu' });
});
```
