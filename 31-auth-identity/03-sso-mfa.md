# 3.1 SSO, SAML, Magic Link & MFA

## Single Sign-On (SSO) Concepts

SSO = sekali login, akses banyak aplikasi. Dua protokol utama:

| Protokol | Tipe | Kelebihan | Kekurangan |
|----------|------|-----------|------------|
| SAML 2.0 | XML-based, enterprise | Mature, banyak dukungan enterprise | Berat (XML), kompleks |
| OIDC | JWT-based, modern | Ringan, REST API friendly | Relatif baru |

### SAML Flow (Simplified)

```
User -> Service Provider (SP) -> redirect ke Identity Provider (IdP)
IdP login -> generate SAML Assertion -> POST ke SP
SP verify assertion -> buat session lokal
```

```typescript
// src/services/saml.ts
import crypto from 'crypto';
import { parseString, Builder } from 'xml2js';

export function generateSAMLResponse(assertion: SamlAssertion): string {
  const builder = new Builder({ headless: true });
  const samlResponse = {
    'samlp:Response': {
      $: {
        xmlns: 'urn:oasis:names:tc:SAML:2.0:protocol',
        'xmlns:saml': 'urn:oasis:names:tc:SAML:2.0:assertion',
        ID: `_${crypto.randomUUID()}`,
        Version: '2.0',
        IssueInstant: new Date().toISOString(),
        Destination: assertion.acsUrl,
      },
      'saml:Issuer': assertion.issuer,
      'samlp:Status': {
        'samlp:StatusCode': {
          $: { Value: 'urn:oasis:names:tc:SAML:2.0:status:Success' },
        },
      },
      'saml:Assertion': {
        $: {
          ID: `_${crypto.randomUUID()}`,
          IssueInstant: new Date().toISOString(),
          Version: '2.0',
        },
        'saml:Issuer': assertion.issuer,
        'saml:Subject': {
          'saml:NameID': {
            $: { Format: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress' },
            _: assertion.email,
          },
          'saml:SubjectConfirmation': {
            $: { Method: 'urn:oasis:names:tc:SAML:2.0:cm:bearer' },
            'saml:SubjectConfirmationData': {
              $: {
                NotOnOrAfter: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
                Recipient: assertion.acsUrl,
              },
            },
          },
        },
        'saml:Conditions': {
          $: {
            NotBefore: new Date().toISOString(),
            NotOnOrAfter: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          },
          'saml:AudienceRestriction': {
            'saml:Audience': assertion.audience,
          },
        },
        'saml:AuthnStatement': {
          $: {
            AuthnInstant: new Date().toISOString(),
            SessionIndex: `_${crypto.randomUUID()}`,
          },
          'saml:AuthnContext': {
            'saml:AuthnContextClassRef': 'urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport',
          },
        },
        'saml:AttributeStatement': {
          'saml:Attribute': [
            {
              $: { Name: 'email' },
              'saml:AttributeValue': assertion.email,
            },
            {
              $: { Name: 'name' },
              'saml:AttributeValue': assertion.name,
            },
            {
              $: { Name: 'role' },
              'saml:AttributeValue': assertion.role,
            },
          ],
        },
      },
    },
  };

  return builder.buildObject(samlResponse);
}

// Parse SAML Response dari IdP
export function parseSAMLResponse(xml: string): Promise<SamlAssertion> {
  return new Promise((resolve, reject) => {
    parseString(xml, (err: any, result: any) => {
      if (err) return reject(err);
      try {
        const assertion = result['samlp:Response']['saml:Assertion'][0];
        const subject = assertion['saml:Subject'][0]['saml:NameID'][0]._;
        const attributes = assertion['saml:AttributeStatement'][0]['saml:Attribute'];
        const attrMap: Record<string, string> = {};
        attributes.forEach((attr: any) => {
          attrMap[attr.$.Name] = attr['saml:AttributeValue'][0];
        });

        resolve({
          email: subject,
          name: attrMap['name'],
          role: attrMap['role'] || 'user',
          issuer: assertion['saml:Issuer'][0],
          audience: assertion['saml:Conditions'][0]['saml:AudienceRestriction'][0]['saml:Audience'][0],
          acsUrl: '',
        });
      } catch (e) {
        reject(e);
      }
    });
  });
}

interface SamlAssertion {
  email: string;
  name: string;
  role: string;
  issuer: string;
  audience: string;
  acsUrl: string;
}
```

### SAML vs OIDC — Kapan Pake?

- **Pilih SAML** kalo: enterprise, integrasi dengan Active Directory / ADFS / Okta legacy, butuh attribute-based access yang kompleks
- **Pilih OIDC** kalo: modern web/mobile apps, social login, REST API, mikroservices

## Magic Link (Passwordless)

```typescript
// src/services/magic-link.ts
import crypto from 'crypto';
import { redis } from '../lib/redis';
import { prisma } from '../lib/prisma';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { storeRefreshToken } from './auth';

const MAGIC_LINK_TTL = 15 * 60; // 15 menit

export async function sendMagicLink(email: string): Promise<void> {
  const token = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');

  // Simpan hash di Redis
  await redis.set(`magic:${hash}`, email, 'EX', MAGIC_LINK_TTL);

  // Kirim email
  const link = `${process.env.FRONTEND_URL}/auth/magic?token=${token}`;
  // await sendEmail(email, 'Your magic sign-in link', `Click: ${link}`);
  console.log(`Magic link for ${email}: ${link}`);
}

export async function verifyMagicLink(token: string): Promise<{
  accessToken: string;
  refreshToken: string;
  user: any;
} | null> {
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const email = await redis.get(`magic:${hash}`);

  if (!email) return null;

  // One-time use
  await redis.del(`magic:${hash}`);

  // Cari atau buat user
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: email.split('@')[0],
        emailVerified: true,
      },
    });
  }

  const payload = { userId: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshTokenId = await storeRefreshToken(user.id);

  return { accessToken, refreshToken: refreshTokenId, user };
}
```

```typescript
// src/routes/magic-link.ts
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { sendMagicLink, verifyMagicLink } from '../services/magic-link';

const router = Router();

// POST /api/auth/magic-link — kirim link
router.post('/magic-link', async (req: Request, res: Response) => {
  const { email } = z.object({ email: z.string().email() }).parse(req.body);
  await sendMagicLink(email);
  res.json({ message: 'Magic link sent if email exists' });
});

// GET /api/auth/magic-link/verify?token=xxx
router.get('/magic-link/verify', async (req: Request, res: Response) => {
  const { token } = z.object({ token: z.string() }).parse(req.query);
  const result = await verifyMagicLink(token);

  if (!result) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }

  res.json(result);
});
```

## Multi-Factor Authentication (MFA)

### TOTP (Time-based One-Time Password)

```typescript
// src/services/totp.ts
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';

export interface TOTPSetup {
  secret: string;
  qrCodeUrl: string;
}

// Setup TOTP untuk user
export function setupTOTP(email: string): TOTPSetup {
  const secret = speakeasy.generateSecret({
    name: `RPLApp:${email}`,
    issuer: 'RPLApp',
  });

  return {
    secret: secret.base32,
    qrCodeUrl: secret.otpauth_url || '',
  };
}

// Generate QR code data URL
export async function generateQRCode(otpauthUrl: string): Promise<string> {
  return qrcode.toDataURL(otpauthUrl);
}

// Verify TOTP code
export function verifyTOTP(token: string, secret: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 1, // ±30 detik toleransi
  });
}

// Generate QR code langsung
export async function getTOTPSetup(email: string): Promise<{
  secret: string;
  qrCode: string; // data URL
}> {
  const { secret, qrCodeUrl } = setupTOTP(email);
  const qrCode = await generateQRCode(qrCodeUrl);
  return { secret, qrCode };
}
```

### MFA — Enable & Verify Routes

```typescript
// src/routes/mfa.ts
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { getTOTPSetup, verifyTOTP } from '../services/totp';

const router = Router();

// GET /api/mfa/setup — dapetin QR code + secret
router.get('/setup', authenticate, async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
  });

  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.totpSecret) {
    return res.status(400).json({ error: 'MFA already enabled' });
  }

  const { secret, qrCode } = await getTOTPSetup(user.email);

  // Simpan secret sementara di session / Redis
  // Jangan simpan di DB sampai diverifikasi
  req.session.pendingTotpSecret = secret;

  res.json({ qrCode, secret });
});

// POST /api/mfa/verify — verifikasi + enable MFA
router.post(
  '/verify',
  authenticate,
  async (req: Request, res: Response) => {
    const { token } = z.object({ token: z.string().length(6) }).parse(req.body);
    const secret = req.session.pendingTotpSecret;

    if (!secret) {
      return res.status(400).json({ error: 'No pending TOTP setup. Call /setup first.' });
    }

    if (!verifyTOTP(token, secret)) {
      return res.status(400).json({ error: 'Invalid token' });
    }

    // Simpan secret di DB
    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { totpSecret: secret },
    });

    delete req.session.pendingTotpSecret;

    res.json({ message: 'MFA enabled successfully' });
  }
);

// POST /api/mfa/disable — disable MFA
router.post('/disable', authenticate, async (req: Request, res: Response) => {
  const { token } = z.object({ token: z.string().length(6) }).parse(req.body);
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });

  if (!user?.totpSecret) {
    return res.status(400).json({ error: 'MFA not enabled' });
  }

  if (!verifyTOTP(token, user.totpSecret)) {
    return res.status(400).json({ error: 'Invalid token' });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { totpSecret: null },
  });

  res.json({ message: 'MFA disabled' });
});
```

### MFA — Login Flow

```typescript
// src/middleware/mfa.ts
import { Request, Response, NextFunction } from 'express';

// Extended di login: setelah password/oauth valid, cek MFA
export async function requireMFA(req: Request, res: Response, next: NextFunction) {
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });

  if (user?.totpSecret) {
    // Step 1: kirim token sementara (MFA challenge)
    const mfaToken = crypto.randomUUID();
    await redis.set(`mfa:${mfaToken}`, user.id, 'EX', 300); // 5 menit
    return res.json({
      requireMfa: true,
      mfaToken,
      // Frontend: redirect ke form input TOTP
    });
  }

  // No MFA — proceed normal
  next();
}

// POST /api/auth/mfa-challenge
router.post('/mfa-challenge', async (req: Request, res: Response) => {
  const { mfaToken, code } = z
    .object({
      mfaToken: z.string().uuid(),
      code: z.string().length(6),
    })
    .parse(req.body);

  const userId = await redis.get(`mfa:${mfaToken}`);
  if (!userId) return res.status(400).json({ error: 'MFA challenge expired' });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.totpSecret) return res.status(400).json({ error: 'MFA not configured' });

  if (!verifyTOTP(code, user.totpSecret)) {
    return res.status(401).json({ error: 'Invalid MFA code' });
  }

  // MFA passed — generate final tokens
  await redis.del(`mfa:${mfaToken}`);

  const payload = { userId: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshTokenId = await storeRefreshToken(user.id);

  res.json({ accessToken, refreshToken: refreshTokenId, user });
});
```

## SMS-based MFA (via Twilio)

```typescript
// src/services/sms-mfa.ts
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_SID!, process.env.TWILIO_AUTH_TOKEN!);

// Generate & kirim SMS
export async function sendSmsCode(phoneNumber: string): Promise<string> {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const hash = crypto.createHash('sha256').update(code).digest('hex');

  await redis.set(`sms:${hash}`, phoneNumber, 'EX', 300); // 5 menit

  await client.messages.create({
    body: `Your verification code: ${code}`,
    from: process.env.TWILIO_PHONE!,
    to: phoneNumber,
  });

  return hash; // Jangan kirim code ke response!
}

// Verifikasi
export async function verifySmsCode(hash: string, code: string): Promise<boolean> {
  const expectedHash = crypto.createHash('sha256').update(code).digest('hex');
  if (hash !== expectedHash) return false;

  const exists = await redis.get(`sms:${hash}`);
  if (!exists) return false;

  await redis.del(`sms:${hash}`);
  return true;
}
```

## WebAuthn — Passkeys

WebAuthn (FIDO2) = login tanpa password pake biometric / hardware key.

```typescript
// src/services/webauthn.ts
import { generateAuthenticationOptions, generateRegistrationOptions, verifyAuthenticationResponse, verifyRegistrationResponse } from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import { redis } from '../lib/redis';

const RP_NAME = 'RPL App';
const RP_ID = process.env.DOMAIN || 'localhost';
const ORIGIN = process.env.ORIGIN || 'http://localhost:3000';

// 1. Generate registration options (untuk create passkey)
export async function generateWebAuthnRegistrationOptions(userId: string, email: string) {
  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: RP_ID,
    userName: email,
    userID: isoBase64URL.fromString(userId),
    attestationType: 'none',
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
    },
  });

  // Simpan challenge di session
  await redis.set(`webauthn:challenge:${userId}`, options.challenge, 'EX', 300);

  return options;
}

// 2. Verify registration response (simpan credential)
export async function verifyWebAuthnRegistration(
  userId: string,
  credential: any
) {
  const challenge = await redis.get(`webauthn:challenge:${userId}`);
  if (!challenge) throw new Error('Challenge not found');

  const verification = await verifyRegistrationResponse({
    response: credential,
    expectedChallenge: challenge,
    expectedOrigin: ORIGIN,
    expectedRPID: RP_ID,
  });

  if (verification.verified && verification.registrationInfo) {
    const { credentialPublicKey, credentialID, counter } = verification.registrationInfo;

    // Simpan ke DB
    // await prisma.credential.create({
    //   data: {
    //     userId,
    //     credentialId: isoBase64URL.fromBuffer(credentialID),
    //     publicKey: isoBase64URL.fromBuffer(credentialPublicKey),
    //     counter,
    //   },
    // });
  }

  await redis.del(`webauthn:challenge:${userId}`);
  return verification.verified;
}

// 3. Generate authentication options (untuk login)
export async function generateWebAuthnAuthOptions(userId: string, credentials: any[]) {
  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    allowCredentials: credentials.map((cred) => ({
      id: cred.credentialId,
      type: 'public-key',
    })),
    userVerification: 'preferred',
  });

  await redis.set(`webauthn:challenge:${userId}`, options.challenge, 'EX', 300);
  return options;
}

// 4. Verify authentication response
export async function verifyWebAuthnAuth(userId: string, credential: any) {
  const challenge = await redis.get(`webauthn:challenge:${userId}`);
  if (!challenge) throw new Error('Challenge not found');

  // Ambil credential dari DB
  // const storedCred = await prisma.credential.findUnique({
  //   where: { id: credential.id },
  // });

  const verification = await verifyAuthenticationResponse({
    response: credential,
    expectedChallenge: challenge,
    expectedOrigin: ORIGIN,
    expectedRPID: RP_ID,
    // credential: {
    //   id: storedCred.credentialId,
    //   publicKey: isoBase64URL.toBuffer(storedCred.publicKey),
    //   counter: storedCred.counter,
    // },
  } as any);

  if (verification.verified) {
    // Update counter
    // await prisma.credential.update({
    //   where: { id: credential.id },
    //   data: { counter: verification.authenticationInfo.newCounter },
    // });
  }

  await redis.del(`webauthn:challenge:${userId}`);
  return verification.verified;
}
```

## Latihan

1. **Magic Link full flow** — Buat route register+login via magic link. Generate token, kirim ke email (console aja), verify, auto-create user kalo belum ada. Include rate limit: 1 link per 60 detik per email.

2. **TOTP MFA login** — Integrasi TOTP ke login flow: user login → cek totpSecret → kalo ada, minta TOTP code → baru kasih JWT. Pake speakeasy + qrcode library.

3. **SMS MFA via mock** — Tanpa Twilio beneran, bikin mock SMS service. Simulasi kirim kode 6 digit via console. Verifikasi kode pake hash comparison.

4. **WebAuthn passkey registration** — Setup endpoint registration WebAuthn: generate options → simpan challenge di Redis → verify response → simpan credential ke DB (Prisma model Credential).
