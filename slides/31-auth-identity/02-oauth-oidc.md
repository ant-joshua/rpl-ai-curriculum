---
marp: true
theme: rpl
paginate: true
header: "RPL AI Curriculum — <img src="https://images.pexels.com/photos/5380664/pexels-ph"
footer: "Sesi 02: Oauth Oidc"
---

<!-- _class: title -->
# 2.1 OAuth 2.0 & OpenID Connect

## OAuth 2.0 Flows

OAuth 2.0 punya beberapa grant types (flows). Yang paling umum:

| Flow | Use Case | Keamanan |
|------|----------|----------|
| Authorization Code | Server-side apps (React + Express) | Paling aman |
| PKCE (Proof Key for Code Exchange) | Mobile / SPA tanpa backend rahasia | Aman |
| Client Credentials | Server-to-server (machine-to-machine) | Token aja |
| Implicit (deprecated) | SPA lama — JANGAN PAKE | Tidak aman |

### Authorization Code Flow (Web App)

```typescript
// Step 1: Redirect user ke OAuth provider
// GET https://accounts.google.com/o/oauth2/v2/auth
//   ?client_id=xxx
//   &redirect_uri=http://localhost:3000/api/auth/google/callback
//   &response_type=code
//   &scope=openid%20profile%20email
//   &state=random-state-string

// Step 2: Provider redirect balik ke callback dengan code
// Step 3: Tukar code dengan access token

// src/services/oauth.ts
interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in: number;
}

export async function exchangeCodeForToken(
  code: string,
  provider: 'google' | 'github',
  redirectUri: string
): Promise<TokenResponse> {
  const configs = {
    google: {
      tokenUrl: 'https://oauth2.googleapis.com/token',
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      tokenUrl: 'https://github.com/login/oauth/access_token',
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  };

  const config = configs[provider];
  const params = new URLSearchParams({
    code,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  });

  const res = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: params,
  });

  return res.json();
}
```

### PKCE Flow (SPA / Mobile)

```typescript
// Klien (frontend) generate code verifier + challenge
// src/utils/pkce.ts
import crypto from 'crypto';

export function generateCodeVerifier(): string {
  return base64URLEncode(crypto.randomBytes(32));
}

export function generateCodeChallenge(verifier: string): string {
  const hash = crypto.createHash('sha256').update(verifier).digest();
  return base64URLEncode(hash);
}

function base64URLEncode(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Frontend:
// 1. const verifier = generateCodeVerifier();
// 2. localStorage.setItem('pkce_verifier', verifier);
// 3. const challenge = generateCodeChallenge(verifier);
// 4. Redirect ke provider dengan &code_challenge={challenge}&code_challenge_method=S256
//
// Backend exchange:
// params.set('code_verifier', verifierFromLocalStorage);
```

### Client Credentials Flow (Server-to-Server)

```typescript
// src/services/client-credentials.ts
export async function getClientCredentialsToken(
  clientId: string,
  clientSecret: string,
  scope: string,
  tokenUrl: string
): Promise<TokenResponse> {
  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    scope,
  });

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  return res.json();
}

// Contoh: service account Google API
// const token = await getClientCredentialsToken(
//   process.env.SERVICE_CLIENT_ID!,
//   process.env.SERVICE_CLIENT_SECRET!,
//   'https://www.googleapis.com/auth/cloud-platform',
//   'https://oauth2.googleapis.com/token'
// );
```

## OpenID Connect (OIDC)

OIDC adalah lapisan identitas di atas OAuth 2.0. Bedanya: dapet `id_token` (JWT) yang isinya identitas user.

```typescript
// src/utils/oidc.ts
import jwt from 'jsonwebtoken';
import { JWKSClient } from './jwks';

interface IdTokenPayload {
  sub: string;          // Subject — user ID dari provider
  email: string;
  email_verified: boolean;
  name: string;
  picture?: string;
  iss: string;          // Issuer
  aud: string;          // Audience — client ID
  exp: number;
  iat: number;
  nonce?: string;       // Anti-replay
}

export async function verifyIdToken(
  idToken: string,
  clientId: string,
  issuer: string
): Promise<IdTokenPayload> {
  // Dapetin public key dari OIDC discovery endpoint
  const jwksClient = new JWKSClient(issuer);
  const decoded = jwt.decode(idToken, { complete: true });
  if (!decoded || !decoded.header.kid) {
    throw new Error('Invalid JWT: no kid');
  }

  const publicKey = await jwksClient.getPublicKey(decoded.header.kid);
  const payload = jwt.verify(idToken, publicKey, {
    algorithms: ['RS256'],
    issuer,
    audience: clientId,
  }) as IdTokenPayload;

  return payload;
}
```

### OIDC Discovery

```typescript
// src/utils/jwks.ts
// Fetch OpenID configuration dari .well-known endpoint
export async function getOIDCConfig(issuer: string): Promise<{
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  jwks_uri: string;
  issuer: string;
}> {
  const wellKnown = `${issuer}/.well-known/openid-configuration`;
  const res = await fetch(wellKnown);
  return res.json();
}

export class JWKSClient {
  private issuer: string;
  private keysCache: Map<string, string> = new Map();

  constructor(issuer: string) {
    this.issuer = issuer;
  }

  async getPublicKey(kid: string): Promise<string> {
    if (this.keysCache.has(kid)) {
      return this.keysCache.get(kid)!;
    }

    const config = await getOIDCConfig(this.issuer);
    const res = await fetch(config.jwks_uri);
    const { keys } = await res.json();

    const key = keys.find((k: any) => k.kid === kid);
    if (!key) throw new Error(`Key not found: ${kid}`);

    const publicKey = convertJWKToPEM(key);
    this.keysCache.set(kid, publicKey);
    return publicKey;
  }
}
```

## Social Login dengan Passport.js

```typescript
// src/config/passport.ts
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { prisma } from '../lib/prisma';

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: '/api/auth/google/callback',
      scope: ['profile', 'email'],
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { googleId: profile.id },
              { email: profile.emails?.[0]?.value },
            ],
          },
        });

        if (!user) {
          // Auto-register
          user = await prisma.user.create({
            data: {
              email: profile.emails?.[0]?.value || '',
              name: profile.displayName,
              googleId: profile.id,
              emailVerified: true, // Google udah verify
              avatar: profile.photos?.[0]?.value,
            },
          });
        } else if (!user.googleId) {
          // Link akun
          user = await prisma.user.update({
            where: { id: user.id },
            data: { googleId: profile.id },
          });
        }

        done(null, user);
      } catch (err) {
        done(err as Error);
      }
    }
  )
);

// GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: '/api/auth/github/callback',
      scope: ['user:email'],
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        // Dapetin email dari GitHub (profile.emails kadang kosong)
        const email =
          profile.emails?.[0]?.value || `${profile.username}@github.placeholder`;

        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { githubId: profile.id },
              { email },
            ],
          },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName || profile.username || '',
              githubId: profile.id,
              emailVerified: true,
              avatar: profile.photos?.[0]?.value,
            },
          });
        } else if (!user.githubId) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { githubId: profile.id },
          });
        }

        done(null, user);
      } catch (err) {
        done(err as Error);
      }
    }
  )
);

// Serialize user ke session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;
```

```typescript
// src/routes/oauth.ts
import { Router, Request, Response } from 'express';
import passport from 'passport';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { storeRefreshToken } from '../services/auth';

const router = Router();

// Initiate Google OAuth
router.get('/google', passport.authenticate('google', { session: false }));

// Google callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/login?error=google-auth-failed',
  }),
  async (req: Request, res: Response) => {
    const user = req.user as any;
    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshTokenId = await storeRefreshToken(user.id);

    // Redirect ke frontend dengan token
    res.redirect(
      `${process.env.FRONTEND_URL}/auth/callback?access_token=${accessToken}&refresh_token=${refreshTokenId}`
    );
  }
);

// Initiate GitHub OAuth
router.get('/github', passport.authenticate('github', { session: false }));

// GitHub callback
router.get(
  '/github/callback',
  passport.authenticate('github', {
    session: false,
    failureRedirect: '/login?error=github-auth-failed',
  }),
  async (req: Request, res: Response) => {
    const user = req.user as any;
    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshTokenId = await storeRefreshToken(user.id);

    res.redirect(
      `${process.env.FRONTEND_URL}/auth/callback?access_token=${accessToken}&refresh_token=${refreshTokenId}`
    );
  }
);

// Link akun sosial ke user yang sudah login
// POST /api/auth/link/google
router.post('/link/google', async (req: Request, res: Response) => {
  // Pake passport.authenticate dengan custom callback
  passport.authenticate('google', { session: false }, async (err: any, profile: any) => {
    if (err || !profile) {
      return res.status(400).json({ error: 'Failed to link Google account' });
    }

    const currentUser = req.user as any;
    await prisma.user.update({
      where: { id: currentUser.userId },
      data: { googleId: profile.id },
    });

    res.json({ message: 'Google account linked' });
  })(req, res);
});
```

## OAuth dengan State & Nonce

```typescript
// src/middleware/oauth-state.ts
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { redis } from '../lib/redis';

// Generate state untuk CSRF protection
export async function generateOAuthState(userId?: string): Promise<string> {
  const state = crypto.randomUUID();
  const payload = JSON.stringify({ state, userId, createdAt: Date.now() });
  await redis.set(`oauth:state:${state}`, payload, 'EX', 600); // 10 menit
  return state;
}

// Verify state saat callback
export async function verifyOAuthState(state: string): Promise<boolean> {
  const data = await redis.get(`oauth:state:${state}`);
  if (!data) return false;

  await redis.del(`oauth:state:${state}`); // One-time use
  return true;
}

// Nonce untuk OIDC (anti-replay)
export function generateNonce(): string {
  return crypto.randomUUID();
}

// Simpen nonce di session / Redis
export async function storeNonce(nonce: string): Promise<void> {
  await redis.set(`oauth:nonce:${nonce}`, '1', 'EX', 600);
}

export async function verifyNonce(nonce: string): Promise<boolean> {
  const exists = await redis.get(`oauth:nonce:${nonce}`);
  if (!exists) return false;
  await redis.del(`oauth:nonce:${nonce}`);
  return true;
}
```

## Model User (Prisma)

```prisma
// schema.prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String?
  name          String?
  avatar        String?
  role          String   @default("user")
  
  googleId      String?  @unique
  githubId      String?  @unique
  
  emailVerified Boolean  @default(false)
  totpSecret    String?  // Untuk MFA nanti
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([email])
  @@index([googleId])
  @@index([githubId])
}
```

## Latihan

1. **Google + GitHub login di satu project** — Setup Passport.js dengan kedua strategi. Buat route `/api/auth/google` dan `/api/auth/github`. Test callbalik redirect ke frontend.

2. **PKCE flow manual** — Tanpa passport, implementasi PKCE flow dari nol: generate verifier, challenge, redirect ke Google, exchange code, verifikasi id_token. Pake `node-fetch` atau `axios`.

3. **OIDC dengan provider kustom** — Integrasi OIDC dengan provider lain (Microsoft/Azure AD, Apple, atau Keycloak lokal). Pake discovery endpoint dan JWKS verification.

4. **Account linking** — Buat endpoint `POST /api/auth/link` biar user yang login bisa connect akun Google/GitHub ke akun yang udah ada. Handle duplicate email.
