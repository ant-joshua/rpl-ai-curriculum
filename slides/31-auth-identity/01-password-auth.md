---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — <img src="https://images.pexels.com/photos/5380664/pexels-ph"
footer: "Sesi 01: Password Auth"
---

<!-- _class: title -->
# 1.1 Password-Based Authentication

## Password Hashing

Jangan pernah simpan password mentah. Hash pake bcrypt atau argon2.

```typescript
// src/utils/hash.ts
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

```typescript
// Alternatif: argon2
import * as argon2 from 'argon2';

export async function hashPasswordArgon2(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
}

export async function verifyPasswordArgon2(password: string, hash: string): Promise<boolean> {
  return argon2.verify(hash, password);
}
```

## JWT — Access + Refresh Token

```typescript
// src/utils/jwt.ts
import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
}
```

## Refresh Token Rotation

Setiap kali refresh dipake, token lama di-revoke dan yang baru dikasih. Mencegah replay attack.

```typescript
// src/services/auth.ts
import { v4 as uuidv4 } from 'uuid';
import { redis } from '../lib/redis';

interface RefreshTokenRecord {
  tokenId: string;
  userId: string;
  expiresAt: number;
}

export async function storeRefreshToken(userId: string, ttlSec: number = 7 * 24 * 3600): Promise<string> {
  const tokenId = uuidv4();
  const record: RefreshTokenRecord = {
    tokenId,
    userId,
    expiresAt: Date.now() + ttlSec * 1000,
  };
  await redis.set(`refresh:${tokenId}`, JSON.stringify(record), 'EX', ttlSec);
  return tokenId;
}

export async function rotateRefreshToken(oldTokenId: string, userId: string): Promise<{ accessToken: string; refreshToken: string } | null> {
  // Cek old token masih valid
  const oldData = await redis.get(`refresh:${oldTokenId}`);
  if (!oldData) return null;

  // Revoke old
  await redis.del(`refresh:${oldTokenId}`);

  // Generate baru
  const tokenPayload = { userId, email: '', role: 'user' };
  const accessToken = generateAccessToken(tokenPayload);
  const newTokenId = await storeRefreshToken(userId);

  return { accessToken, refreshToken: newTokenId };
}

export async function revokeRefreshToken(tokenId: string): Promise<void> {
  await redis.del(`refresh:${tokenId}`);
}

export async function revokeAllUserTokens(userId: string): Promise<void> {
  const keys = await redis.keys(`refresh:*`);
  for (const key of keys) {
    const data = await redis.get(key);
    if (data) {
      const record: RefreshTokenRecord = JSON.parse(data);
      if (record.userId === userId) {
        await redis.del(key);
      }
    }
  }
}
```

## Session Management dengan Redis

```typescript
// src/lib/redis.ts
import Redis from 'ioredis';

export const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
});

// Session store untuk express-session
import session from 'express-session';
import RedisStore from 'connect-redis';

export const sessionMiddleware = session({
  store: new RedisStore({ client: redis }),
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 jam
  },
});
```

## Register & Login Flow

```typescript
// src/routes/auth.ts
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { hashPassword, verifyPassword } from '../utils/hash';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { storeRefreshToken, rotateRefreshToken, revokeRefreshToken } from '../services/auth';
import { prisma } from '../lib/prisma';
import { sendVerificationEmail } from '../services/email';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(2).max(100),
});

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const passwordHash = await hashPassword(data.password);
  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      name: data.name,
      emailVerified: false,
    },
  });

  // Kirim email verifikasi
  const verificationToken = crypto.randomUUID();
  await redis.set(`verify:${verificationToken}`, user.id, 'EX', 3600);
  await sendVerificationEmail(user.email, verificationToken);

  res.status(201).json({ message: 'User created. Check email to verify.' });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const data = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user || !user.passwordHash) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (!user.emailVerified) {
    return res.status(403).json({ error: 'Email not verified' });
  }

  const valid = await verifyPassword(data.password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const payload = { userId: user.id, email: user.email, role: user.role };

  // Session-based (opsional)
  req.session.userId = user.id;

  // JWT-based
  const accessToken = generateAccessToken(payload);
  const refreshTokenId = await storeRefreshToken(user.id);

  res.json({
    accessToken,
    refreshToken: refreshTokenId,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
});

// POST /api/auth/refresh
router.post('/refresh', async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token required' });
  }

  // Decode dulu buat dapet userId
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }

  const result = await rotateRefreshToken(refreshToken, payload.userId);
  if (!result) {
    return res.status(401).json({ error: 'Refresh token revoked or expired' });
  }

  res.json(result);
});

// POST /api/auth/logout
router.post('/logout', async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }

  // Hapus session
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});
```

## Email Verification

```typescript
// src/routes/verify.ts
import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';

const router = Router();

// GET /api/auth/verify?token=xxx
router.get('/verify', async (req: Request, res: Response) => {
  const { token } = req.query;
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'Verification token required' });
  }

  const userId = await redis.get(`verify:${token}`);
  if (!userId) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { emailVerified: true },
  });

  await redis.del(`verify:${token}`);

  res.json({ message: 'Email verified successfully' });
});
```

## Forgot Password / Reset Password

```typescript
// src/routes/password.ts
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { hashPassword } from '../utils/hash';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { sendResetEmail } from '../services/email';

const router = Router();

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = z.object({ email: z.string().email() }).parse(req.body);

  const user = await prisma.user.findUnique({ where: { email } });
  // Jangan bocorin apakah email terdaftar — selalu return success
  if (!user) {
    return res.json({ message: 'If email exists, reset link sent' });
  }

  const resetToken = crypto.randomUUID();
  await redis.set(`reset:${resetToken}`, user.id, 'EX', 3600); // 1 jam
  await sendResetEmail(user.email, resetToken);

  res.json({ message: 'If email exists, reset link sent' });
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req: Request, res: Response) => {
  const { token, password } = z
    .object({
      token: z.string().uuid(),
      password: z.string().min(8).max(128),
    })
    .parse(req.body);

  const userId = await redis.get(`reset:${token}`);
  if (!userId) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  await redis.del(`reset:${token}`);

  // Revoke all sessions & refresh tokens biar logout dari semua device
  await redis.keys(`refresh:*`).then((keys) => {
    keys.forEach(async (key) => {
      const data = await redis.get(key);
      if (data && JSON.parse(data).userId === userId) {
        await redis.del(key);
      }
    });
  });

  res.json({ message: 'Password reset successfully' });
});
```

## Middleware Auth Guard

```typescript
// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';

// Extend Request type
declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; email: string; role: string };
    }
  }
}

// JWT Auth Middleware
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = header.slice(7);
  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Session Auth Middleware (alternatif)
export function authenticateSession(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}
```

## Latihan

1. **Register dengan validasi** — Tambahin validasi password strength (min 1 uppercase, 1 number, 1 special char) di route register. Pake zod regex.

2. **Refresh token rotation dengan family tree** — Implementasi token family (parent-child tracking). Kalo refresh token lama dipake setelah di-rotate, revoke seluruh family (detect token theft).

3. **Rate limiter per endpoint auth** — Pake `express-rate-limit` atau `ioredis` buat rate limit: 5 percobaan login per menit per IP, 3 percobaan forgot password per jam per email.

4. **Email verification + resend** — Tambah route `POST /api/auth/resend-verification`. Kirim ulang email verifikasi dengan cooldown 60 detik. Simpan lastSent di Redis.
