# 🧠 Cheatsheet: Authentication & Identity

> Referensi cepet — 1 halaman.

## Topik Utama

**Password Auth:** Hash password (bcrypt/argon2), verify sebelum login, salt rounds ≥ 12.

**JWT:** Access token (15m) + Refresh token (7d). Access token di header `Authorization: Bearer <token>`. Refresh token di httpOnly cookie.

**OAuth2 Flows:**
- **Authorization Code + PKCE** — untuk SPA/mobile (recommended)
- **Authorization Code** — untuk server-side apps
- **Implicit** — deprecated, gak aman

**Social Login:** Google/GitHub via Passport.js → redirect → callback → create/link account.

**Session vs JWT:** Session = stateful (Redis), JWT = stateless (client hold token).

**MFA:** TOTP (authenticator app), SMS (kurang aman), WebAuthn/passkeys (most secure).

**Security:** Rate limiting, brute force protection, CSRF token, secure cookies, RBAC, audit logging.

## Command / Sintaks Penting

```typescript
// Password hashing — bcrypt
import bcrypt from 'bcrypt';
const SALT_ROUNDS = 12;
await bcrypt.hash(password, SALT_ROUNDS);       // hash
await bcrypt.compare(password, storedHash);      // verify
```

```typescript
// JWT — access + refresh
import jwt from 'jsonwebtoken';
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

function generateAccessToken(payload: TokenPayload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
}
function generateRefreshToken(payload: TokenPayload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
}
function verifyAccessToken(token: string) {
  return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
}
```

```typescript
// Refresh token rotation
app.post('/api/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  const payload = jwt.verify(refreshToken, REFRESH_SECRET);
  // Rotate: revoke old, issue new
  await revokeToken(refreshToken);
  const newRefresh = generateRefreshToken(payload);
  res.json({ accessToken: generateAccessToken(payload), refreshToken: newRefresh });
});
```

```typescript
// Rate limiting — express-rate-limit
import rateLimit from 'express-rate-limit';
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                     // 5 attempts
  message: { error: 'Too many login attempts' },
});
app.post('/api/auth/login', loginLimiter, loginHandler);
```

## Tips & Trik

- **bcrypt > MD5/SHA-256** — bcrypt built-in salt, resistant brute force
- **PKCE** wajib untuk OAuth2 di SPA/mobile (gak pake client secret)
- **httpOnly cookie** buat refresh token — gak bisa diakses JS (anti XSS)
- **CORS + SameSite=Lax/Strict** — anti CSRF
- **Audit log** catet: login success/fail, role change, password change, token refresh
- **WebAuthn/passkeys** — most secure MFA, resistant phishing

## Common Mistakes

- **Password plain text** — hash wajib! bcrypt atau argon2
- **Access token terlalu lama** — 15 menit ideal, jangan 7 hari
- **Refresh token di localStorage** — accessible by XSS, pake httpOnly cookie
- **No rate limiting di login** — brute force attack gampang
- **JWT secret hardcoded** — pake env variables, rotate periodically
- **No CSRF protection** — terutama kalau pake cookie-based auth
- **Bypass email verification** — account bisa di-spam tanpa verifikasi

## Link Cepat

- [Module README](README.md)
- [Quiz](quiz.md)
