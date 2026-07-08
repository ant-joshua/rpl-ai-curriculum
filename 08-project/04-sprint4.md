# Sprint 4 — Polish + Deploy

> **Sesi:** 25–26 | **Durasi:** 4 jam

## Tujuan

- Error handling global di backend + frontend
- Responsive check (mobile/tablet/desktop)
- Environment variables untuk production
- Deploy backend ke Railway
- Deploy frontend ke Vercel
- Custom domain (opsional)
- Post-deploy testing
- CI/CD pipeline
- Persiapan presentasi + demo

## Global Error Handler — Backend

```typescript
// backend/src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  // Prisma error
  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      error: 'Database error',
    });
  }

  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
  });
};
```

## Production Environment Variables

```bash
# Railway — backend
DATABASE_URL=postgresql://...
JWT_SECRET=<random-64-char>
OPENWEATHER_API_KEY=...
MASTRA_API_KEY=...
OPENAI_API_KEY=...
PORT=3001
NODE_ENV=production

# Vercel — frontend
VITE_API_URL=https://backend-production.up.railway.app/api
```

## Deploy Backend ke Railway

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Init project di root backend/
cd backend
railway init

# 4. Set environment variables
railway variables set DATABASE_URL=...
railway variables set JWT_SECRET=...

# 5. Deploy
railway up

# 6. Production URL (contoh)
# https://my-project-backend.up.railway.app
```

## Deploy Frontend ke Vercel

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
cd frontend
vercel --prod

# 3. Set environment variables di Vercel dashboard
# VITE_API_URL = https://backend-production.up.railway.app/api
```

## CI/CD dengan GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
        working-directory: ./backend
      - run: npm run build
        working-directory: ./backend
      - name: Deploy to Railway
        run: npx railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    needs: deploy-backend
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
        working-directory: ./frontend
      - run: npm run build
        working-directory: ./frontend
      - name: Deploy to Vercel
        run: npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

## Post-Deploy Testing

```typescript
// backend/tests/api.test.ts
import request from 'supertest';
import app from '../src/index';

describe('API Tests', () => {
  let token: string;

  test('POST /api/auth/register — success', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  test('GET /api/trips — harusnya array kosong', async () => {
    const res = await request(app)
      .get('/api/trips')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/health — server hidup', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
```

## Responsive Check

Periksa di Chrome DevTools device toolbar:

- ✅ Mobile (375px)
- ✅ Tablet (768px)
- ✅ Desktop (1280px+)

## Checklist Final

- [ ] Semua CRUD endpoint jalan
- [ ] Auth: register, login, logout, protected routes
- [ ] AI agent bisa diakses dari frontend
- [ ] Minimal 2 tools Mastra terintegrasi
- [ ] Error handling global backend
- [ ] Error boundary frontend
- [ ] Responsive di mobile + desktop
- [ ] Deployed backend di Railway
- [ ] Deployed frontend di Vercel
- [ ] README.md lengkap (nama, stack, cara run, link deploy)
- [ ] PROMPT-LOG.md berisi prompt AI yang dipakai

## Persiapan Presentasi

Struktur presentasi 5 menit:

```
1. (30 detik) — Nama, proyek, stack
2. (1 menit) — Demo fitur utama (CRUD)
3. (1 menit) — Demo AI integration (agent + tools)
4. (1 menit) — Arsitektur (ERD, folder structure, data flow)
5. (1 menit) — Deployment + link live
6. (30 detik) — Closing + Q&A
```

## Deployment Checklist (printable)

- [ ] Backend hidup di Railway `GET /api/health → 200`
- [ ] Frontend hidup di Vercel (domain vercel.app)
- [ ] CORS hanya allow frontend domain
- [ ] Environment variables production terisi
- [ ] Database production terhubung
- [ ] Build tidak error (`npm run build`)
- [ ] README update dengan link deploy

## Latihan

1. **Fix Bug** — Inject minimal 1 bug di kode, minta teman find & fix. Dokumentasi bug di PROMPT-LOG.md
2. **Deploy Backend** — Deploy API ke Railway, pastikan `/api/health` return 200 dari public URL
3. **Deploy Frontend** — Deploy frontend ke Vercel, pastikan bisa komunikasi dengan backend production
4. **CI/CD** — Setup GitHub Actions workflow untuk auto-deploy setiap push ke main
5. **Presentasi** — Bikin slide sederhana (5 slide), latihan presentasi 5 menit, record screen + suara

6. **Monitoring Setup** — Tambah log error ke file eksternal (pake Winston atau Pino). Pastikan production errors tercatat. Tulis: setup logger, error logging middleware, log rotation.

7. **Performance Test** — Test endpoint `/api/trips` dengan k6 atau autocannon. Ukur: RPS (requests per second), latency p50/p95/p99, error rate. Tulis hasil + screenshot.

8. **Final Documentation** — Bikin file ARCHITECTURE.md yang berisi: folder structure, ERD, data flow diagram (text/ASCII), tech stack decisions, deployment architecture. Format rapi dengan markdown.

9. **Code Review + Refactor** — Minta teman review kode final. Catat 3 feedback yang diterima. Lakukan refactor minimal 1 bagian kode berdasarkan feedback. Tulis: feedback, perubahan, hasil akhir.

10. **Post-Mortem Doc** — Tulis dokumen post-mortem: apa yang berhasil, apa yang gagal, apa yang dipelajari, apa yang akan dilakukan berbeda untuk proyek selanjutnya.
