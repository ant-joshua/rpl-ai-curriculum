# RPP Modul 14: Cybersecurity for Web Developer

**Durasi:** 3 sesi × 90 menit = 270 menit

## Tujuan Pembelajaran

Setelah modul ini, siswa mampu:
- Mengidentifikasi OWASP Top 10 vulnerabilities
- Mencegah SQLi, XSS, CSRF pada aplikasi web
- Mengamankan auth dengan JWT + bcrypt
- Setup HTTPS, CORS, Helmet, rate limiting

## Tools & Bahan

- Express.js app existing
- helmet, cors, express-rate-limit packages
- bcrypt, jsonwebtoken
- OWASP Juice Shop (opsional)
- SSL cert via Let's Encrypt

---

## Sesi 1: OWASP Top 10 + SQLi + XSS (90 menit)

| Waktu | Aktivitas | Detail |
|-------|-----------|--------|
| 15 menit | **Teori: OWASP Top 10** | 10 kerentanan web paling kritis. SQL Injection: parameterized query vs concatenation. XSS: stored, reflected, DOM-based. |
| 45 menit | **Coding: Demo SQLi & XSS + Fix** | Show vulnerable code → exploit → fix with parameterized query + sanitasi. |
| 20 menit | **Latihan: Secure Form** | Siswa bikin form login + comment. Implement parameterized query + output escaping. |
| 10 menit | **Review** | Kenapa ORM aman dari SQLi? Bedanya sanitasi input vs escape output? |

**Code demo:**

```js
// VULNERABLE — SQL Injection
const query = `SELECT * FROM users WHERE email = '${email}'`;

// FIX — parameterized query
const { rows } = await db.query(
  'SELECT * FROM users WHERE email = $1', [email]
);

// VULNERABLE — XSS
res.send(`<div>${comment}</div>`);

// FIX — escape output
res.send(`<div>${escapeHtml(comment)}</div>`);
```

**Checklist siswa:**
- [ ] Demo SQLi berhasil (login tanpa password)
- [ ] Fix parameterized query
- [ ] XSS reflected via comment form
- [ ] Sanitasi input + escape output

---

## Sesi 2: CSRF + Auth Aman + Helmet (90 menit)

| Waktu | Aktivitas | Detail |
|-------|-----------|--------|
| 15 menit | **Teori: CSRF + Auth + CORS** | CSRF token, SameSite cookie. bcrypt salt rounds. JWT access + refresh token. CORS whitelist. |
| 45 menit | **Coding: Auth Middleware + CSRF** | Bikin middleware: JWT verify, bcrypt register, httpOnly cookie. Setup CORS + Helmet. |
| 20 menit | **Latihan: Secure REST API** | Siswa secure Express API: Helmet, CORS whitelist, rate limit login, JWT middleware. |
| 10 menit | **Review** | Kenapa httpOnly cookie lebih aman? Bedanya access vs refresh token? |

**Code demo:**

```js
// Helmet + CORS + Rate limit
app.use(helmet());
app.use(cors({ origin: 'https://fe-kamu.com', credentials: true }));
app.use(rateLimit({ windowMs: 15*60*1000, max: 100 }));

// JWT middleware
function auth(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
}
```

**Checklist siswa:**
- [ ] Helmet terpasang
- [ ] CORS whitelist spesifik origin
- [ ] Rate limit login endpoint
- [ ] JWT middleware di protected routes
- [ ] bcrypt untuk password

---

## Sesi 3: HTTPS + DevSecOps + Audit (90 menit)

| Waktu | Aktivitas | Detail |
|-------|-----------|--------|
| 15 menit | **Teori: DevSecOps** | HTTPS dengan Let's Encrypt. `npm audit`, Snyk. `.env` di `.gitignore`. Security headers. |
| 45 menit | **Coding: SSL Setup + Audit** | Demo setup certbot + nginx. Jalankan `npm audit` & fix. Setup CSP header. |
| 20 menit | **Latihan: Security Hardening** | Siswa audit project sendiri: npm audit, cek .env, setup CSP, rate limit semua endpoint. |
| 10 menit | **Review** | Checklist deploy aman. Incident response plan. |

**Code demo:**

```bash
# SSL cert
sudo certbot --nginx -d domainkamu.com

# Audit
npm audit
npm audit fix

# Generate JWT secret
node -e "require('crypto').randomBytes(32).toString('hex')"
```

**Checklist siswa:**
- [ ] `npm audit` jalan & fix
- [ ] `.env` di `.gitignore`
- [ ] CSP header aktif
- [ ] Rate limit seluruh API
- [ ] HTTPS redirect

## Assessment

| Kriteria | Bobot |
|----------|-------|
| SQLi & XSS prevention | 25% |
| Auth security (JWT, bcrypt, cookie) | 30% |
| DevSecOps (audit, HTTPS, headers) | 30% |
| Partisipasi | 15% |
