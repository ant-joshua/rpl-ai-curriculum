# RPP: Authentication & Identity

| Info | Detail |
|------|--------|
| Kode | RPL-AI-31 |
| Durasi | 4 pertemuan × 90 menit |
| Level | Intermediate |
| Prasyarat | JavaScript Fundamentals, Node.js & Express, Database, REST API |

## Pertemuan 1: Password Auth

### Tujuan
- Implementasi password-based auth dengan bcrypt/argon2
- Membuat JWT access & refresh token rotation
- Setup session-based auth dengan Redis

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review | Tanya jawab | Slide |
| 20' | Materi inti: hashing, JWT, refresh token rotation, session Redis, email verification | Ceramah + demo | Live code |
| 25' | Praktik terbimbing: bikin register/login endpoint + JWT middleware | Hands-on | Starter code |
| 20' | Latihan mandiri: tambah refresh token rotation & forgot password | Problem solving | Soal |
| 15' | Diskusi & refleksi | Q&A | — |

### Bahan Ajar
- [Module README](../31-auth-identity/)
- [Password Auth](../31-auth-identity/01-password-auth.md)

---

## Pertemuan 2: OAuth 2.0 & OIDC

### Tujuan
- Memahami OAuth2 flows (authorization code, PKCE)
- Integrasi social login (Google, GitHub) dengan Passport.js
- Bedain OAuth2 vs OIDC

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review | Tanya jawab | Slide |
| 20' | Materi inti: OAuth2 flows, PKCE, social login, Passport.js | Ceramah + demo | Live code |
| 25' | Praktik terbimbing: setup Google & GitHub OAuth dengan Passport.js | Hands-on | Starter code |
| 20' | Latihan mandiri: implementasi PKCE flow | Problem solving | Soal |
| 15' | Diskusi & refleksi | Q&A | — |

### Bahan Ajar
- [OAuth 2.0 & OIDC](../31-auth-identity/02-oauth-oidc.md)

---

## Pertemuan 3: SSO, MFA & WebAuthn

### Tujuan
- Bangun SSO + SAML vs OIDC
- Implementasi MFA (TOTP, authenticator app)
- Magic Link / passwordless & WebAuthn passkeys

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review | Tanya jawab | Slide |
| 20' | Materi inti: SSO, SAML vs OIDC, magic link, MFA (TOTP), WebAuthn passkeys | Ceramah + demo | Live code |
| 25' | Praktik terbimbing: implementasi TOTP MFA & magic link | Hands-on | Starter code |
| 20' | Latihan mandiri: setup WebAuthn passkeys | Problem solving | Soal |
| 15' | Diskusi & refleksi | Q&A | — |

### Bahan Ajar
- [SSO, MFA & WebAuthn](../31-auth-identity/03-sso-mfa.md)

---

## Pertemuan 4: Security Best Practices

### Tujuan
- Rate limiting & brute force protection
- CSRF protection & secure cookies
- RBAC (role-based access control) & audit logging

### Kegiatan (90 menit)
| Waktu | Aktivitas | Metode | Media |
|-------|-----------|--------|-------|
| 10' | Apersepsi & review | Tanya jawab | Slide |
| 20' | Materi inti: rate limiting, brute force, CSRF, secure cookies, RBAC, audit log | Ceramah + demo | Live code |
| 25' | Praktik terbimbing: implement rate limiter & RBAC middleware | Hands-on | Starter code |
| 20' | Latihan mandiri: setup audit logging & CSRF protection | Problem solving | Soal |
| 15' | Diskusi & refleksi | Q&A | — |

### Bahan Ajar
- [Security Best Practices](../31-auth-identity/04-security-best-practices.md)
