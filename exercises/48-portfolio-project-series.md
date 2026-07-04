# Portfolio Project Series — Latihan

## Level 1: Dasar

### 1. Landing Page — Deploy ke Vercel
**Pertanyaan:** Buat dan deploy landing page portfolio personal:

```html
<!-- === LENGKAPI: Landing page portfolio === -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Portfolio | [Nama Kamu]</title>
  
  <!-- === LENGKAPI: === -->
  <!-- 1. Tailwind CSS CDN atau custom CSS -->
  <!-- 2. Google Fonts (misal Inter atau Poppins) -->
  <!-- 3. Meta tags untuk SEO dan social sharing -->
  
  <style>
    /* === LENGKAPI: === */
    /* 1. CSS variables untuk theme (light/dark) */
    /* 2. Hero section dengan gradient background */
    /* 3. Project cards dengan hover effect */
    /* 4. Responsive grid layout */
    /* 5. Animasi smooth scroll */
  </style>
</head>
<body>
  <!-- === LENGKAPI: === -->
  <!-- 1. Navigation bar sticky -->
  <!-- 2. Hero section: nama, tagline, CTA buttons -->
  <!-- 3. About section dengan skills progress bar -->
  <!-- 4. Projects section dengan 3 project card -->
  <!-- 5. Contact form dengan validation -->
  <!-- 6. Footer dengan social links -->
</body>
</html>
```

```json
{
  "// === LENGKAPI: vercel.json untuk deploy === ": {},
  "// Konfigurasi routing, headers, dan caching": {}
}
```

1. Lengkapi HTML di atas
2. Deploy ke Vercel via `vercel --prod` atau GitHub integration
3. Setup custom domain (optional: pakai `.vercel.app`)

**Hint:** Tailwind via CDN: `<script src="https://cdn.tailwindcss.com"></script>`. vercel.json: `{ "headers": [{ "source": "/(.*)", "headers": [{ "key": "X-Frame-Options", "value": "DENY" }] }] }`. Deploy: install Vercel CLI → `vercel` → `vercel --prod`. GitHub integration: push ke repo → import di vercel.com.

---

### 2. CRUD API — Bookshelf API Test
**Pertanyaan:** Buat Bookshelf CRUD API dengan Express + TypeScript + Prisma:

```typescript
// === LENGKAPI: Prisma schema ===
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Book {
  // === LENGKAPI: Field berikut ===
  // id (UUID auto-generate)
  // title (string, required)
  // author (string, required)
  // isbn (string, unique)
  // publishedYear (integer)
  // createdAt (datetime, auto)
  // updatedAt (datetime, auto)
}
```

```typescript
// === LENGKAPI: Express CRUD routes ===
// src/routes/books.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/books — list all books (with pagination)
// === LENGKAPI ===

// GET /api/books/:id — get book by id
// === LENGKAPI ===

// POST /api/books — create book (with validation)
// === LENGKAPI ===

// PUT /api/books/:id — update book (partial update)
// === LENGKAPI ===

// DELETE /api/books/:id — delete book (soft delete recommended)
// === LENGKAPI ===
```

1. Lengkapi Prisma schema dan route handlers
2. Setup PostgreSQL via Railway atau Supabase
3. Test semua endpoint dengan curl atau Postman
4. Deploy API ke Railway

**Hint:** Prisma: `@default(uuid())`, `@updatedAt`, `@unique`. Pagination: `skip` & `take` params. Validation: Zod schema createBookSchema/updateBookSchema. Soft delete: tambah field `deletedAt: DateTime?`. Railway deploy: push ke GitHub → import project di railway.com → set DATABASE_URL.

---

### 3. Fullstack Auth Flow — JWT & OAuth
**Pertanyaan:** Implementasi fullstack authentication dengan JWT dan Google OAuth:

```typescript
// === LENGKAPI: Backend auth ===
// src/middleware/auth.ts
import jwt from 'jsonwebtoken';

// === LENGKAPI: JWT middleware ===
// 1. Extract token dari Authorization header (Bearer token)
// 2. Verify token dengan JWT_SECRET
// 3. Attach user info ke req.user
// 4. Handle expired token

export function authMiddleware(req, res, next) {
  // === LENGKAPI ===
}

// === LENGKAPI: OAuth callback handler ===
// 1. Exchange authorization code for tokens
// 2. Get user profile dari Google
// 3. Create atau find user di database
// 4. Generate JWT dan return ke client
```

```tsx
// === LENGKAPI: React login page ===
// src/pages/Login.tsx
function LoginPage() {
  // === LENGKAPI: ===
  // 1. Email/password form dengan validation
  // 2. Google OAuth button (popup/redirect)
  // 3. Store JWT di httpOnly cookie atau localStorage
  // 4. Redirect ke dashboard setelah login
  // 5. Handle error (wrong password, user not found)
  
  return (
    <div>
      {/* === LENGKAPI === */}
    </div>
  );
}
```

1. Lengkapi backend auth middleware
2. Setup Google OAuth di Google Cloud Console
3. Implementasi React login page
4. Test full flow: register → login → access protected route → logout

**Hint:** JWT: `jwt.sign({ userId, role }, secret, { expiresIn: '7d' })`. OAuth: `passport-google-oauth20` atau `next-auth`. Google Cloud Console: buat OAuth 2.0 Client ID → set redirect URI. HttpOnly cookie: `res.cookie('token', jwt, { httpOnly: true, secure: true, sameSite: 'strict' })`.

---

## Level 2: Intermediate

### 4. Mastra AI Agent — Chat Assistant
**Pertanyaan:** Bangun AI Chat Assistant dengan Mastra AI:

```typescript
// === LENGKAPI: Mastra agent definition ===
// src/agents/chat-assistant.ts
import { Agent } from '@mastra/core';

// === LENGKAPI: Definisi agent ===
const chatAssistant = new Agent({
  name: 'chat-assistant',
  instructions: `
    Kamu adalah asisten yang membantu user dengan:
    - Menjawab pertanyaan teknis programming
    - Membantu debugging kode
    - Menjelaskan konsep pemrograman
    
    === LENGKAPI: Tambah behavior rules ===
    1. Selalu berikan contoh kode jika relevan
    2. 
    3. 
  `,
  
  // === LENGKAPI: Konfigurasi model dan tools ===
  model: {
    provider: 'OPEN_AI',
    name: 'gpt-4o',
    // === LENGKAPI ===
  },
  
  tools: [
    // === LENGKAPI: Tools yang bisa dipakai agent ===
    // 1. Web search tool
    // 2. Code execution tool
    // 3. File read tool
  ]
});
```

```typescript
// === LENGKAPI: Next.js API route untuk chat ===
// src/app/api/chat/route.ts
export async function POST(req: Request) {
  const { message, context } = await req.json();
  
  // === LENGKAPI: ===
  // 1. Stream response ke client
  // 2. Maintain conversation history
  // 3. Handle rate limiting
  // 4. Log interactions untuk monitoring
}
```

1. Lengkapi agent definition dengan tools dan instructions
2. Setup streaming chat endpoint
3. Buat React chat UI component
4. Deploy ke Vercel

**Hint:** Mastra: `@mastra/core` package. Tools: `@mastra/tools-web-search`, `@mastra/tools-code-executor`. Streaming: `new ReadableStream()` dengan `res.write()`. Chat UI: `useChat` hook dari `ai/react`. Vercel deployment: `mastra deploy`.

---

### 5. Docker — Production Deploy
**Pertanyaan:** Containerize aplikasi fullstack dengan Docker:

```dockerfile
# === LENGKAPI: Dockerfile (multi-stage build) ===
# Stage 1: Build
FROM node:20-alpine AS builder
# === LENGKAPI ===
# 1. Set working directory
# 2. Copy package files
# 3. Install dependencies
# 4. Copy source code
# 5. Build aplikasi

# Stage 2: Production
FROM node:20-alpine AS production
# === LENGKAPI ===
# 1. Copy build output dari builder stage
# 2. Install production dependencies only
# 3. Expose port
# 4. Set user non-root (security)
# 5. Set health check
# 6. Set start command
```

```yaml
# === LENGKAPI: docker-compose.yml ===
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    # === LENGKAPI: ===
    # 1. Environment variables dari .env file
    # 2. Depends on database
    # 3. Volume untuk logs
    # 4. Restart policy
    
  db:
    image: postgres:16-alpine
    # === LENGKAPI: ===
    # 1. Volume untuk data persistence
    # 2. Environment variables (POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB)
    # 3. Health check
    # 4. Port mapping
```

1. Lengkapi multi-stage Dockerfile (optimasi: production dependencies only, non-root user)
2. Setup docker-compose dengan app + database + reverse proxy
3. Deploy ke VPS dengan Docker

**Hint:** Multi-stage: `COPY --from=builder /app/dist ./dist`. Production only: `npm ci --only=production`. Non-root: `USER node`. Health check: `HEALTHCHECK --interval=30s CMD node health.js`. Volume: `./data:/var/lib/postgresql/data`. Deploy: `docker compose up -d` di VPS.

---

### 6. CI/CD — Full Pipeline
**Pertanyaan:** Setup GitHub Actions CI/CD pipeline untuk portfolio project:

```yaml
# === LENGKAPI: .github/workflows/deploy.yml ===
name: Full CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      # === LENGKAPI: ===
      # 1. Checkout code
      # 2. Setup Node.js 20
      # 3. Install dependencies
      # 4. Run linter (ESLint + Prettier check)
      # 5. Run type check (TypeScript)
      # 6. Run unit tests with coverage
      # 7. Upload coverage ke Codecov
      
  security:
    needs: quality
    runs-on: ubuntu-latest
    steps:
      # === LENGKAPI: ===
      # 1. Run npm audit
      # 2. Run Snyk security scan (if configured)
      # 3. Check for secrets in code (truffleHog/gitleaks)
      
  deploy:
    needs: [quality, security]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      # === LENGKAPI: ===
      # 1. Build Docker image
      # 2. Push ke Docker Hub / GitHub Container Registry
      # 3. Deploy ke VPS via SSH
      # 4. Health check setelah deploy
      # 5. Rollback kalau health check gagal
```

1. Lengkapi semua job: quality → security → deploy
2. Tambahkan environment protection rule di GitHub
3. Setup deployment notification ke Discord/Slack

**Hint:** Actions: `actions/checkout`, `actions/setup-node`, `npm ci`, `npm run lint`, `npm run test:coverage`, `codecov-action`. Security: `snyk-actions/node`, `gitleaks-action`. Deploy: `appleboy/ssh-action` untuk SSH ke VPS, `docker/build-push-action`. Notification: `discord-webhook-notify`.

---

### 7. Monitoring & Error Tracking
**Pertanyaan:** Setup monitoring untuk production app:

```typescript
// === LENGKAPI: Sentry + monitoring setup ===
// src/lib/monitoring.ts
import * as Sentry from '@sentry/node';
import { metrics } from './metrics';

export function initMonitoring() {
  // === LENGKAPI: ===
  // 1. Init Sentry dengan DSN, environment, release version
  // 2. Set tracesSampleRate 0.2 (20%)
  // 3. Enable crash reporting
  // 4. Set beforeSend untuk filter sensitive data
  
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    // === LENGKAPI ===
  });
}

// === LENGKAPI: Health check endpoint ===
// src/api/health.ts
export async function healthCheck(req, res) {
  // === LENGKAPI: Return status ===
  // 1. Server uptime
  // 2. Database connection status
  // 3. Memory usage
  // 4. Last error timestamp
  // 5. Version info
}
```

```yaml
# === LENGKAPI: Docker monitoring stack ===
# docker-compose.monitoring.yml
services:
  prometheus:
    image: prom/prometheus
    # === LENGKAPI: Setup scraping config ===
    
  grafana:
    image: grafana/grafana
    # === LENGKAPI: Setup dashboard + datasource ===
```

1. Lengkapi Sentry integration
2. Buat health check endpoint dengan detailed status
3. Setup Prometheus + Grafana untuk metrics visualization
4. Buat alert rules (error rate > 5%, response time > 2s)

**Hint:** Sentry: `Sentry.setTag('release', pkg.version)`. Health check: return JSON `{ status: 'ok', uptime, db: 'connected', memory, version }`. Prometheus: `express-prom-bundle` untuk metrics endpoint. Grafana: import Node.js dashboard template (ID: 11159).

---

### 8. API Testing — Integration & E2E
**Pertanyaan:** Tulis integration test dan E2E test untuk CRUD API:

```typescript
// === LENGKAPI: Integration test dengan Supertest ===
// tests/integration/books.test.ts
import request from 'supertest';
import app from '../../src/app';

describe('Books API', () => {
  beforeEach(async () => {
    // === LENGKAPI: Setup test database (migration + seed) ===
  });
  
  afterEach(async () => {
    // === LENGKAPI: Cleanup test data ===
  });
  
  describe('POST /api/books', () => {
    it('should create a new book', async () => {
      // === LENGKAPI: Test create book dengan valid data ===
    });
    
    it('should reject invalid data', async () => {
      // === LENGKAPI: Test validation error ===
    });
  });
  
  describe('GET /api/books', () => {
    it('should return paginated books', async () => {
      // === LENGKAPI: Test pagination ===
    });
  });
});
```

```typescript
// === LENGKAPI: E2E test dengan Playwright ===
// tests/e2e/auth.flow.spec.ts
import { test, expect } from '@playwright/test';

test('full auth flow', async ({ page }) => {
  // === LENGKAPI: ===
  // 1. Navigasi ke login page
  // 2. Fill form email & password
  // 3. Submit form
  // 4. Verifikasi redirect ke dashboard
  // 5. Cek cookie/token tersimpan
  // 6. Test logout
  // 7. Verifikasi redirect ke login
});
```

1. Lengkapi integration test untuk semua endpoint CRUD
2. Setup test database (gunakan testcontainers atau in-memory)
3. Tulis E2E test untuk auth flow
4. Run di GitHub Actions dengan service containers

**Hint:** Supertest: `request(app).post('/api/books').send(data).expect(201)`. Setup: `beforeAll(() => prisma.$migrate())`. Playwright: `await page.goto('/login')`, `await page.fill('#email', 'test@test.com')`. Service containers di GitHub Actions: `services: { postgres: { image: postgres:16 } }`.
