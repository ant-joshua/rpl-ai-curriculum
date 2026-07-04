<img src="https://images.pexels.com/photos/5380664/pexels-photo-5380664.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=1" alt="Authentication & Identity" style="width:100%;border-radius:12px;margin:12px 0;">

# 31. Authentication & Identity

> **Level:** 🌱 Intermediate
> **Jam:** 8 (4 minggu × 2 sesi)
> **Prasyarat:** JavaScript Fundamentals, Node.js & Express, Database, REST API
> **Output:** Auth system — password, social login, SSO, MFA, security hardening

## Tujuan Pembelajaran

Setelah modul ini, kamu bisa:

- Menerapkan password-based auth dengan bcrypt/argon2 + JWT
- Memahami OAuth2 flows (authorization code, PKCE, implicit)
- Integrasi social login (Google, GitHub) pakai Passport.js
- Bedain session vs JWT, dan pake refresh token rotation
- Bangun SSO + SAML vs OIDC
- Implementasi MFA (TOTP, SMS, authenticator app) & WebAuthn passkeys
- Magic Link / passwordless authentication
- Rate limiting, brute force protection, CSRF, secure cookies
- RBAC (role-based access control) & audit logging

## Materi

| Sesi | Topik | File |
|------|-------|------|
| 1 | Password Auth — hashing, JWT, refresh token rotation, session (Redis), login/logout, email verification, forgot password | [01-password-auth.md](01-password-auth.md) |
| 2 | OAuth 2.0 & OIDC — flows, PKCE, social login Google/GitHub, Passport.js | [02-oauth-oidc.md](02-oauth-oidc.md) |
| 3 | SSO, SAML vs OIDC, Magic Link, MFA (TOTP/SMS/authenticator), WebAuthn passkeys | [03-sso-mfa.md](03-sso-mfa.md) |
| 4 | Security Best Practices — rate limiting, brute force, CSRF, secure cookies, RBAC, audit log | [04-security-best-practices.md](04-security-best-practices.md) |

## Output Akhir Modul

> **Auth System** — REST API autentikasi lengkap: register/login password, social login (Google + GitHub), refresh token rotation, MFA (TOTP), SSO, role-based access control, rate limiting, audit log. Siap dipasang di aplikasi Express/TypeScript mana pun.

## AI Prompt Exercises

Sepanjang modul, latihan pake AI:

- "Explain this JWT flow step by step"
- "Find security vulnerability in this auth middleware"
- "Refactor this OAuth2 callback to use PKCE"
- "Generate rate limiting config for 100 req/min per user"
- "Compare bcrypt vs argon2 for password hashing — which one should I use?"
- "Write a test case for refresh token rotation"
- "Explain OAuth2 authorization code flow like I'm 5"
