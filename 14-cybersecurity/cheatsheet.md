# 🧠 Cheatsheet: Cybersecurity for Web Developer

> Referensi cepet — 1 halaman.

## Topik Utama
- **OWASP Top 10** — 10 kerentanan web paling kritis (SQLi, XSS, CSRF, dll)
- **SQL Injection** — parameterized query / ORM cegah input jahat
- **XSS** — sanitasi input (DOMPurify), escape output (`<%= %>`), CSP header
- **CSRF** — anti-CSRF token, `SameSite=Strict` cookie
- **Auth Aman** — bcrypt hash, JWT expiry pendek, httpOnly cookie
- **CORS** — whitelist origin spesifik, jangan `*`
- **HTTPS** — Let's Encrypt gratis, redirect HTTP→HTTPS
- **DevSecOps** — `npm audit`, Snyk, .env di .gitignore

## Command / Sintaks Penting

```bash
# Generate JWT secret
node -e "require('crypto').randomBytes(32).toString('hex')"

# Security audit
npm audit
npm audit fix

# SSL cert (Let's Encrypt)
sudo certbot --nginx -d domainkamu.com
```

```js
// Middleware keamanan Express
const helmet = require('helmet');
app.use(helmet());

app.use(cors({
  origin: 'https://frontend-kamu.com',
  credentials: true,
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
}));

// JWT verify middleware
function authMiddleware(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
}
```

## Tips & Trik
- **Jangan hardcode secret** — semua di `.env`, `.env` di `.gitignore`.
- **bcrypt salt rounds = 12** — cukup slow buat brute-force, ga terlalu berat.
- **JWT access token 15 menit**, refresh token 7 hari — kurangi risiko bocor.
- **CSP header** blokir XSS — kasih approval manual buat script external.
- **Input validation server-side** — jangan percaya frontend.

## Common Mistakes
❌ `Access-Control-Allow-Origin: *` — data bisa dicuri.
❌ Password plain text — WAJIB bcrypt / argon2.
❌ `.env` ikut commit ke GitHub — bot otomatis scan, ganti secret secepatnya.
❌ Lupa rate limit di endpoint login / OTP — brute force attack.
❌ `npm audit` ga pernah jalan — dependensi usang = security hole.

## Link Cepat
- [Module README](README.md)
- [Quiz](quiz.md)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Helmet.js](https://helmetjs.github.io/)
