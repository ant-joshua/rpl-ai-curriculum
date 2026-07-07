---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — <img src="https://images.pexels.com/photos/5380664/pexels-ph"
footer: "Sesi 04: Security Best Practices"
---

<!-- _class: title -->
# 4.1 Security Best Practices

## Rate Limiting per User

```typescript
// src/middleware/rate-limit.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '../lib/redis';

// Global rate limit
export const globalRateLimit = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, try again later' },
});

// Strict rate limit untuk auth endpoints
export const authRateLimit = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redis.call(...args),
  }),
  windowMs: 60 * 1000, // 1 menit
  max: 5,               // 5 percobaan per menit
  skipSuccessfulRequests: true, // Hitung cuma yang gagal
  message: { error: 'Too many login attempts, try again later' },
});

// Per-user rate limiter pake user ID (kalo udah login)
export async function checkUserRateLimit(
  userId: string,
  action: string,
  maxAttempts: number = 10,
  windowSec: number = 60
): Promise<boolean> {
  const key = `ratelimit:${action}:${userId}`;
  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, windowSec);
  }

  return current <= maxAttempts;
}

// Middleware wrapper
export function userRateLimit(action: string, max?: number, windowSec?: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    if (!userId) return next();

    const allowed = await checkUserRateLimit(userId, action, max, windowSec);
    if (!allowed) {
      return res.status(429).json({ error: 'Rate limit exceeded per user' });
    }
    next();
  };
}
```

## Brute Force Protection

```typescript
// src/services/brute-force.ts
import { redis } from '../lib/redis';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60; // 15 menit detik
const ATTEMPT_WINDOW = 60; // 1 menit

type IdentifierType = 'ip' | 'email' | 'userId';

export async function recordFailedAttempt(identifier: string, type: IdentifierType): Promise<void> {
  const key = `bruteforce:${type}:${identifier}`;
  const attempts = await redis.incr(key);

  if (attempts === 1) {
    await redis.expire(key, ATTEMPT_WINDOW);
  }

  if (attempts >= MAX_ATTEMPTS) {
    // Lockout
    const lockKey = `lockout:${type}:${identifier}`;
    await redis.set(lockKey, '1', 'EX', LOCKOUT_DURATION);
    await redis.del(key);
  }
}

export async function isLockedOut(identifier: string, type: IdentifierType): Promise<boolean> {
  const lockKey = `lockout:${type}:${identifier}`;
  const locked = await redis.get(lockKey);
  return !!locked;
}

export async function resetAttempts(identifier: string, type: IdentifierType): Promise<void> {
  const key = `bruteforce:${type}:${identifier}`;
  const lockKey = `lockout:${type}:${identifier}`;
  await redis.del(key);
  await redis.del(lockKey);
}

// Brute force middleware buat login
export async function bruteForceCheck(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const email = req.body?.email;

  // Cek IP lockout
  if (await isLockedOut(ip, 'ip')) {
    return res.status(429).json({
      error: 'Account temporarily locked. Try again in 15 minutes.',
    });
  }

  // Cek email lockout (kalo ada)
  if (email && (await isLockedOut(email, 'email'))) {
    return res.status(429).json({
      error: 'Account temporarily locked. Try again in 15 minutes.',
    });
  }

  next();
}

// Record failed login — panggil setelah verifikasi gagal
export async function recordFailedLogin(email: string, req: Request): Promise<void> {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  await recordFailedAttempt(ip, 'ip');
  await recordFailedAttempt(email, 'email');
}
```

## CSRF Tokens

```typescript
// src/middleware/csrf.ts
import csrf from 'csrf';
import { Request, Response, NextFunction } from 'express';

const tokens = new csrf();

// Pastikan ini dipasang setelah cookie-parser & session
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Bypass buat API yang pake JWT (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return next();
  }

  // Bypass buat GET/HEAD/OPTIONS (idempotent)
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    // Generate token kalo belum ada
    if (!req.session.csrfSecret) {
      req.session.csrfSecret = tokens.secretSync();
    }
    // Kirim token via cookie (dibaca frontend)
    const csrfToken = tokens.create(req.session.csrfSecret);
    res.cookie('csrf-token', csrfToken, {
      httpOnly: false, // Frontend perlu baca
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return next();
  }

  // POST/PUT/DELETE: verifikasi token
  const secret = req.session.csrfSecret;
  if (!secret) {
    return res.status(403).json({ error: 'CSRF token missing' });
  }

  const token = req.headers['x-csrf-token'] as string;
  if (!token || !tokens.verify(secret, token)) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  next();
}

// Atau pake library csurf (legacy) — alternatif:
// import csurf from 'csurf';
// export const csrfProtection = csurf({ cookie: true });
```

## Secure Cookies

```typescript
// src/config/cookie.ts
import { CookieOptions } from 'express';

export const secureCookieOptions: CookieOptions = {
  httpOnly: true,       // Gak bisa diakses JavaScript
  secure: process.env.NODE_ENV === 'production', // HTTPS-only di prod
  sameSite: 'strict',   // Gak dikirim dari site lain
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
  path: '/',
  // domain: '.yourdomain.com', // Kalo butuh cross-subdomain
};

export const sessionCookieOptions: CookieOptions = {
  ...secureCookieOptions,
  maxAge: 24 * 60 * 60 * 1000, // 24 jam
};

// Set cookie di response
// res.cookie('refresh_token', refreshToken, secureCookieOptions);
// res.cookie('session_id', sessionId, sessionCookieOptions);
```

### Cookie Flag Perbandingan

| Flag | Fungsi |
|------|--------|
| `HttpOnly` | Mencegah XSS — gak bisa dibaca JavaScript |
| `Secure` | Cuma dikirim via HTTPS |
| `SameSite=Strict` | Mencegah CSRF — gak dikirim dari origin lain |
| `SameSite=Lax` | CSRF protection + link bisa jalan |
| `MaxAge` | Expiry otomatis |
| `Domain` | Batasi ke domain tertentu |

## Session Fixation Protection

```typescript
// src/middleware/session-fixation.ts
import { Request, Response, NextFunction } from 'express';

// Regenerasi session ID setelah login biar attacker
// gak bisa pake session ID yang udah ditebak sebelumnya
export function regenerateSession(req: Request, res: Response, next: NextFunction) {
  if (req.session) {
    req.session.regenerate((err) => {
      if (err) return next(err);
      next();
    });
  } else {
    next();
  }
}

// Pake di route login:
// router.post('/login', regenerateSession, async (req, res) => { ... });
```

## RBAC — Role-Based Access Control

```typescript
// src/middleware/rbac.ts
import { Request, Response, NextFunction } from 'express';

// Role hierarchy
const ROLES = {
  admin: ['admin', 'moderator', 'user'],
  moderator: ['moderator', 'user'],
  user: ['user'],
} as const;

type Role = keyof typeof ROLES;

export function authorize(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role as Role;

    if (!userRole) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const hasAccess = allowedRoles.some((role) =>
      ROLES[role]?.includes(userRole)
    );

    if (!hasAccess) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

// Usage:
// router.get('/admin/users', authenticate, authorize('admin'), handler);
// router.patch('/posts/:id', authenticate, authorize('admin', 'moderator'), handler);
```

### Resource-Level Authorization

```typescript
// src/middleware/ownership.ts
import { Request, Response, NextFunction } from 'express';

// Cek kepemilikan resource
export function authorizeResource(
  getResourceOwnerId: (req: Request) => Promise<string | null>
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    // Admin always pass
    if (req.user?.role === 'admin') return next();

    const ownerId = await getResourceOwnerId(req);
    if (!ownerId || ownerId !== userId) {
      return res.status(403).json({ error: 'Not authorized for this resource' });
    }

    next();
  };
}

// Usage:
// router.delete(
//   '/posts/:id',
//   authenticate,
//   authorizeResource(async (req) => {
//     const post = await prisma.post.findUnique({ where: { id: req.params.id } });
//     return post?.authorId || null;
//   }),
//   handler
// );
```

### Permission-Based Access (lebih granular dari RBAC)

```typescript
// src/services/permissions.ts
// Define permissions
export const Permissions = {
  users: {
    read: 'users:read',
    create: 'users:create',
    update: 'users:update',
    delete: 'users:delete',
  },
  posts: {
    read: 'posts:read',
    create: 'posts:create',
    update: 'posts:update',
    delete: 'posts:delete',
  },
} as const;

// Role-permission mapping
const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: Object.values(Permissions).flatMap((p) => Object.values(p)),
  moderator: [
    Permissions.posts.read,
    Permissions.posts.create,
    Permissions.posts.update,
    Permissions.users.read,
  ],
  user: [
    Permissions.posts.read,
    Permissions.posts.create,
  ],
};

export function requirePermission(...permissions: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role || 'user';
    const userPermissions = ROLE_PERMISSIONS[role] || [];

    const hasAll = permissions.every((p) => userPermissions.includes(p));
    if (!hasAll) {
      return res.status(403).json({ error: 'Missing permission' });
    }

    next();
  };
}
```

## Audit Logging

```typescript
// src/middleware/audit.ts
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

// Audit log entry
interface AuditEntry {
  userId?: string;
  action: string;       // 'user.login', 'user.logout', 'user.password_reset', 'post.delete', dll
  resource: string;      // 'user', 'post', 'comment'
  resourceId?: string;
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
  success: boolean;
}

// Log ke database (via Prisma)
export async function logAudit(entry: AuditEntry): Promise<void> {
  await prisma.auditLog.create({
    data: {
      userId: entry.userId,
      action: entry.action,
      resource: entry.resource,
      resourceId: entry.resourceId,
      metadata: entry.metadata || {},
      ip: entry.ip,
      userAgent: entry.userAgent,
      success: entry.success,
    },
  });
}

// Audit middleware
export function audit(action: string, resource: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send.bind(res);

    res.send = function (body: any): Response {
      const success = res.statusCode < 400;

      logAudit({
        userId: req.user?.userId,
        action,
        resource,
        resourceId: req.params?.id || req.body?.id,
        metadata: {
          method: req.method,
          path: req.path,
          body: sanitizeBody(req.body),
        },
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        success,
      }).catch(console.error);

      return originalSend(body);
    };

    next();
  };
}

// Jangan log password
function sanitizeBody(body: any): Record<string, any> {
  if (!body) return {};
  const sanitized = { ...body };
  delete sanitized.password;
  delete sanitized.passwordHash;
  delete sanitized.token;
  delete sanitized.secret;
  return sanitized;
}

// Usage:
// router.post('/login', audit('user.login', 'user'), loginHandler);
// router.delete('/posts/:id', authenticate, audit('post.delete', 'post'), deleteHandler);
```

### Audit Log Query

```typescript
// src/services/audit-query.ts
// Admin panel — liat log
export async function getAuditLogs(options: {
  userId?: string;
  action?: string;
  resource?: string;
  from?: Date;
  to?: Date;
  page?: number;
  limit?: number;
}) {
  const { userId, action, resource, from, to, page = 1, limit = 50 } = options;

  const where: any = {};
  if (userId) where.userId = userId;
  if (action) where.action = action;
  if (resource) where.resource = resource;
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = from;
    if (to) where.createdAt.lte = to;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { user: { select: { email: true, name: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total, page, limit, pages: Math.ceil(total / limit) };
}
```

### Prisma Model untuk Audit

```prisma
model AuditLog {
  id         String   @id @default(cuid())
  userId     String?
  action     String   // 'user.login', 'post.delete', dll
  resource   String   // 'user', 'post'
  resourceId String?
  metadata   Json     @default("{}")
  ip         String?
  userAgent  String?
  success    Boolean
  createdAt  DateTime @default(now())

  user       User?    @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([action])
  @@index([resource])
  @@index([createdAt])
  @@index([action, createdAt])
}
```

## Security Headers

```typescript
// src/middleware/security-headers.ts
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

// Helmet sets these headers:
// - Content-Security-Policy
// - X-Content-Type-Options: nosniff
// - X-Frame-Options: DENY
// - X-XSS-Protection: 0
// - Strict-Transport-Security
// - Referrer-Policy

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", process.env.API_URL || ''],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
});

// CORS
import cors from 'cors';

export const corsMiddleware = cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
});
```

## Security Checklist Ringkasan

| Area | Proteksi |
|------|----------|
| Password | bcrypt/argon2, min 8 karakter, strength validation |
| JWT | Access 15m, Refresh 7d, rotation, revoke on logout |
| Session | Redis-based, httpOnly, secure, sameSite, regenerate on login |
| Rate Limit | Global + per-endpoint + per-user |
| Brute Force | Progressive delay → lockout after 5 attempts |
| CSRF | Token-based (kecuali API Bearer) |
| XSS | Helmet, CSP, sanitize input |
| CORS | Whitelist specific origin |
| Audit Log | Semua action penting di-log |
| RBAC | Role/permission check per endpoint |
| MFA | TOTP/SMS/WebAuthn untuk sensitive actions |
| Email | Verify email sebelum login, jangan bocorin existensi user |

## Latihan

1. **Rate limiter + brute force protection** — Gabungin rate limit per IP + per email di route login. Implementasi progressive delay: attempt 1-3 = no delay, 4-5 = 1 detik delay, >5 = lockout 15 menit.

2. **RBAC dengan permission system** — Bikin 3 role (admin, moderator, user) dengan permission granular. Admin bisa delete apa aja, moderator bisa edit post, user cuma bisa baca & buat post sendiri. Implementasi middleware permission check.

3. **Audit log dashboard** — Buat middleware audit logging yang nyatet action penting (login, logout, password reset, delete). Tambah route `/api/admin/audit-logs` dengan pagination + filter.

4. **CSRF + secure cookie setup** — Implementasi CSRF protection di form-based endpoints (bukan API Bearer). Set cookie dengan httpOnly, secure, sameSite strict. Test dengan dan tanpa token.
