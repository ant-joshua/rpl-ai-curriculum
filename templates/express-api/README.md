# Express + TypeScript API Starter

Template starter untuk membangun REST API dengan **Express.js** dan **TypeScript**. Udah include setup routing, middleware CORS, error handling, dan environment variables.

## Stack

| Komponen        | Versi        |
|-----------------|--------------|
| Express         | ^4.21        |
| TypeScript      | ^5.7         |
| tsx             | ^4.19        |
| cors            | ^2.8         |
| dotenv          | ^16.4        |

## Struktur Folder

```
express-api/
├── src/
│   └── index.ts              # Entry point — Express app + routes
├── .env.example              # Template environment variables
├── package.json              # Dependencies & scripts
├── tsconfig.json             # Konfigurasi TypeScript
└── README.md                 # Dokumentasi (ini)
```

## Cara Pake

```bash
# 1. Clone template
npx degit path/ke/express-api my-api
cd my-api

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env

# 4. Jalankan development (hot-reload)
npm run dev

# 5. Build & production
npm run build
npm start
```

## Environment Variables

| Variable | Default     | Deskripsi               |
|----------|-------------|-------------------------|
| `PORT`   | `3000`      | Port server             |
| `NODE_ENV` | `development` | Environment mode      |

## API Endpoints

### `GET /api/health`
Health check server. Balikin status & timestamp.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-07-08T12:00:00.000Z"
}
```

### `GET /api/hello`
Greeting sederhana.

**Response:**
```json
{
  "message": "Hello dari Express + TypeScript API!"
}
```

### Error Handling

Template ini pake global error handler middleware. Kalau ada error di route, tinggal `throw new Error()` atau `next(error)` — nanti ditangkap middleware dan balikin response JSON:

```json
{
  "error": "Internal Server Error",
  "message": "Pesan error aslinya"
}
```

## Konsep Penting

### Routing
Pake Express Router pattern. Route didefinisikan langsung di `index.ts` atau bisa dipisah ke `routes/` folder buat project yang lebih besar.

### Middleware
- **cors()** — Biar API bisa diakses dari frontend beda domain.
- **express.json()** — Parse JSON body dari request.
- **Error handler** — Middleware khusus buat tangkap error dan balikin response JSON rapi.

### TypeScript + Express
- `@types/express` — Type definitions buat Request, Response, NextFunction.
- Pake `tsx` buat run langsung TypeScript tanpa compile di development.
- Build pake `tsc` untuk production.

## Development Tips

1. **Hot reload** — `tsx watch` otomatis restart server pas file berubah.
2. **Logger** — Tambah `morgan` atau `pino` buat request logging.
3. **Validation** — Tambah `zod` buat validasi request body.
4. **Database** — Integrasi gampang dengan `prisma` atau `drizzle`.
5. **Testing** — Tambah `vitest` atau `jest` buat integration test endpoint.

## Contoh Development Workflow

```bash
# Development
npm run dev                    # Jalankan server dengan hot-reload
curl http://localhost:3000/api/health  # Cek server nyala

# Tambah route baru di src/index.ts
# app.get('/api/users', (req, res) => { ... })

# Build & production test
npm run build                  # Compile ke dist/
NODE_ENV=production node dist/index.js

# Test endpoint
curl -X POST http://localhost:3000/api/data \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'
```

## Testing

```bash
# Cek health endpoint
curl http://localhost:3000/api/health

# Cek hello endpoint
curl http://localhost:3000/api/hello
```

## Deploy

Build dulu, terus jalanin hasilnya:

```bash
npm run build
NODE_ENV=production node dist/index.js
```

Bisa deploy ke:
- **Vercel** (serverless functions)
- **Railway**
- **Render**
- **DigitalOcean App Platform**
- **Docker** (tinggal tambah Dockerfile)

## Catatan

- Semua code pake Bahasa Indonesia di komentar & response.
- Mode development pake `tsx` — ga perlu compile tiap kali ganti code.
- Mode production compile ke JavaScript dulu biar performa optimal.
- Udah include `dotenv` buat ngatur config via environment variables.
