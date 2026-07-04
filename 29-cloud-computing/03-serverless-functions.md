# 3. Serverless Functions: Cloudflare Workers, Vercel Edge, Serverless DB & Secrets

## Apa Itu Serverless?

Serverless = jalanin kode tanpa ngurus server. Provider yang handle scaling, availability, maintenance. Bayar per eksekusi + per durasi (bukan per jam VM).

### Kelebihan
- No server management
- Auto scale to zero (ga bayar kalau ga dipake)
- Scale unlimited (dalam batas provider)
- Lebih murah untuk traffic rendah

### Kekurangan
- Cold start (eksekusi pertama lambat)
- Timeout (biasanya 10-30 detik)
- Vendor lock-in
- Debugging lebih susah

## Cloudflare Workers

Workers = serverless function jalan di edge network Cloudflare (>330 kota). Runtime: Service Workers API (JavaScript/TypeScript/WASM).

```
User ──→ Edge (Jakarta) ──→ Worker ──→ fetch dari API origin
                           └── return response langsung
```

### Setup

```bash
# install wrangler CLI
npm create cloudflare@latest my-worker

# atau manual
npm install -g wrangler
wrangler init my-worker
```

### Worker Sederhana

```typescript
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const name = url.searchParams.get('name') || 'World';

    return new Response(`Hello, ${name}!`, {
      headers: { 'content-type': 'text/plain' },
    });
  },
};
```

### Worker dengan R2 (Object Storage)

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const key = url.pathname.slice(1);

    if (!key) return new Response('Not Found', { status: 404 });

    const object = await env.MY_BUCKET.get(key);

    if (!object) return new Response('Not Found', { status: 404 });

    return new Response(object.body, {
      headers: {
        'cache-control': 'public, max-age=31536000',
        'content-type': object.httpMetadata?.contentType || 'application/octet-stream',
      },
    });
  },
};
```

### Deploy

```bash
wrangler deploy
```

## Vercel Edge Functions

Vercel Edge Functions = serverless via Vercel, runtime Edge (V8 isolate). Jalan di 18+ lokasi.

### Setup

```bash
npx create-next-app@latest my-edge-app --typescript
cd my-edge-app
```

### Edge API Route (`app/api/hello/route.ts`)

```typescript
export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name') ?? 'World';

  return new Response(`Hello, ${name} from Edge!`, {
    headers: { 'content-type': 'text/plain' },
  });
}
```

### Deploy ke Vercel

```bash
npx vercel deploy --prod
```

## Railway Deploy

Railway = PaaS simpel. Connect GitHub → auto deploy. Support Node.js, Python, Go, Docker.

### Quick Deploy — Express API

```json
{
  "name": "my-api",
  "scripts": {
    "start": "tsx src/index.ts"
  }
}
```

```bash
# deploy via CLI
npm i -g @railway/cli
railway login
railway init
railway up
```

### Railway + PostgreSQL

```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// DATABASE_URL otomatis di-set oleh Railway
app.get('/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});
```

## Serverless Database

### Turso (Edge SQLite)

Turso = SQLite distributed, lebih cepat dari serverless Postgres untuk read-heavy workload.

```bash
# install turso CLI
curl -sSfL https://get.turso.tech | bash

# login
turso auth login

# create database
turso db create my-app-db

# get connection string
turso db show my-app-db --url

# create token
turso db tokens create my-app-db
```

```typescript
import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function getUsers() {
  const result = await db.execute('SELECT * FROM users LIMIT 10');
  return result.rows;
}
```

### Neon (Serverless Postgres)

Neon = Postgres serverless dengan branching (seperti git untuk DB).

```bash
# via CLI
npm i -g @neondatabase/cli

# create project
neon projects create --name my-app
neon connection-string --project-id my-app --branch main
```

```typescript
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

const rows = await sql`SELECT * FROM users LIMIT 10`;
console.log(rows);
```

### Perbandingan DB Serverless

| Fitur | Turso | Neon | PlanetScale |
|-------|-------|------|-------------|
| Engine | SQLite (libSQL) | Postgres | MySQL (Vitess) |
| Edge ready | ✅ | ✅ | ✅ |
| Cold start | ~5ms | ~50ms | ~100ms |
| Branching | ✅ (via Turso) | ✅ (git-like) | ✅ |
| Free tier | 9GB storage, 1B rows read/bln | 0.5GB storage, 100h compute | 1GB storage, 10M row reads |
| Replication | Embedded replica | Read replicas | Read replicas |

## Environment Variables & Secrets Management

### Jangan Hardcode Secrets!

```typescript
// ❌ JANGAN
const API_KEY = 'sk-12345-abcde';

// ✅ PAKAI environment variables
const API_KEY = process.env.API_KEY!;
```

### Cloudflare Workers — `wrangler.toml`

```toml
name = "my-worker"
main = "src/index.ts"

[vars]
MY_SECRET = "ini-bukan-secret"  # visible di dashboard
```

```bash
# secret (ga visible)
wrangler secret put API_KEY

# untuk local
echo "API_KEY=sk-xxxx" > .dev.vars
```

### Vercel

```bash
# CLI
vercel env add API_KEY

# dashboard: Settings → Environment Variables
```

### Railway

```bash
# CLI
railway variables --set API_KEY=sk-xxxx

# atau lewat dashboard Variables tab
```

### Docker / Node.js

```bash
# file .env (JANGAN di-commit!)
DATABASE_URL=postgres://...
JWT_SECRET=supersecret
```

```typescript
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  databaseUrl: process.env.DATABASE_URL!,
  jwtSecret: process.env.JWT_SECRET!,
};
```

### Best Practice

1. **Jangan commit .env** — tambahin ke `.gitignore`
2. **Gunakan 1Password / Doppler** untuk tim
3. **Rotate secrets** secara berkala
4. **Least privilege** — tiap service pake token sendiri

```
project/.env.local       ← local dev
project/.env.production  ← JANGAN di-commit
project/.env.example     ← template (boleh di-commit)
```

## Latihan

1. **Cloudflare Worker API**: Bikin worker yang serve API `/api/weather?city=jakarta`. Return mock data suhu + kondisi. Deploy pake wrangler. Screenshot hasil fetch.

```typescript
// response example
{
  "city": "jakarta",
  "temp": 32,
  "condition": "partly cloudy",
  "timestamp": "2026-07-04T10:00:00Z"
}
```

2. **Turso + Worker**: Integrasi Turso DB dengan Cloudflare Worker. Buat endpoint `/users`:
   - `POST /users` — tambah user baru
   - `GET /users` — list users
   - `GET /users/:id` — detail user
   Test pake curl. Screenshot hasil.

3. **Vercel Edge + Neon**: Deploy Next.js edge function dengan Neon DB. Buat API counter: `GET /api/counter` return `{ count: number }`, `POST /api/counter` increment. Deploy ke Vercel. Screenshot hasil.

4. **Secrets Management**: Bikin script bash yang:
   - Setup `.env.example` dengan template
   - Setup `.gitignore` yang include `.env`
   - Set 3 secrets di Cloudflare Workers pake wrangler
   - Verifikasi secret ga muncul di source code
   - Catat langkah-langkah di README
