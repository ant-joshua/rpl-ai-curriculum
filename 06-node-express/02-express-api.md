# 6.2 Express API — Routing & Middleware

## Apa itu Express.js?

**Express.js** — framework web minimalis buat Node.js. Express jadi standar de facto backend JavaScript karena:

- Minimalis — gak banyak boilerplate
- Fleksibel — middleware-based architecture
- Mature — dipake Google, Uber, IBM
- Komunitas gede — 2 juta+ weekly downloads

```typescript
// Tanpa Express — pake http module (ribet)
import http from 'http';
const server = http.createServer((req, res) => {
  if (req.url === '/api/users' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([{ id: 1, name: 'Budi' }]));
  }
});

// Dengan Express — clean & simple
import express from 'express';
const app = express();
app.get('/api/users', (req, res) => {
  res.json([{ id: 1, name: 'Budi' }]);
});
```

---

## Setup Express

```bash
npm install express
npm install -D @types/express
```

File: `src/index.ts`

```typescript
import express from 'express';
const app = express();

// Middleware global — parse JSON body
app.use(express.json());

// Route
app.get('/', (req, res) => {
  res.json({ message: 'Hello World' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});
```

---

## HTTP Methods & Routing

| Method | Fungsi | SQL Analogi |
|--------|--------|-------------|
| `GET` | Ambil data | SELECT |
| `POST` | Buat data baru | INSERT |
| `PUT` | Update data (full) | UPDATE |
| `PATCH` | Update sebagian | UPDATE (partial) |
| `DELETE` | Hapus data | DELETE |

### Routing Dasar

```typescript
app.get('/api/items', (req, res) => {
  res.json({ data: items });
});

app.post('/api/items', (req, res) => {
  const item = req.body;
  items.push(item);
  res.status(201).json({ data: item });
});

app.put('/api/items/:id', (req, res) => {
  const id = parseInt(req.params.id);
  // cari & update item...
  res.json({ data: updatedItem });
});

app.delete('/api/items/:id', (req, res) => {
  const id = parseInt(req.params.id);
  // hapus item...
  res.status(204).send();
});
```

---

## Request Object — `req`

Express mengumpulkan info request dan menyimpannya di objek `req`.

| Property | Contoh | Kegunaan |
|----------|--------|----------|
| `req.params` | `/users/:id` → `req.params.id` | Route parameters |
| `req.query` | `/search?q=kopi` → `req.query.q` | Query string |
| `req.body` | `{ "name": "Budi" }` → `req.body.name` | Request body (butuh middleware) |
| `req.headers` | `req.headers['authorization']` | HTTP headers |
| `req.method` | `'GET'`, `'POST'` | HTTP method |
| `req.path` | `/api/users` | Request path |
| `req.ip` | `'::1'` (localhost IPv6) | Client IP |

### Route Parameters

```typescript
// URL: /api/users/42
app.get('/api/users/:id', (req, res) => {
  const userId = req.params.id;      // "42" — string
  const userIdNum = parseInt(userId); // 42 — number
  res.json({ userId: userIdNum });
});

// Multiple params
// URL: /api/users/42/orders/5
app.get('/api/users/:userId/orders/:orderId', (req, res) => {
  const { userId, orderId } = req.params;
  res.json({ userId: parseInt(userId), orderId: parseInt(orderId) });
});
```

### Query String

```typescript
// URL: /api/search?q=kopi&page=1&limit=10
app.get('/api/search', (req, res) => {
  const { q, page, limit } = req.query;
  // q = "kopi", page = "1", limit = "10" — semua string
  res.json({
    query: q,
    page: parseInt(page as string) || 1,
    limit: parseInt(limit as string) || 10,
  });
});
```

### Request Body

```typescript
// Wajib pake middleware express.json()
app.use(express.json());

// POST /api/users dengan body: { "name": "Budi", "email": "budi@mail.com" }
app.post('/api/users', (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name dan email wajib diisi' });
  }

  res.status(201).json({
    message: 'User dibuat',
    user: { id: Date.now(), name, email },
  });
});
```

---

## Response Object — `res`

| Method | Kegunaan |
|--------|----------|
| `res.json(data)` | Kirim response JSON |
| `res.status(code)` | Set HTTP status code |
| `res.send(data)` | Kirim response (string, buffer, JSON) |
| `res.status(code).json(data)` | Chaining — status + JSON |
| `res.redirect(url)` | Redirect ke URL lain |
| `res.end()` | Akhiri response tanpa data |

### Status Code Lengkap

| Kode | Nama | Kapan Pake |
|------|------|-----------|
| 200 | OK | Sukses GET, PUT, PATCH |
| 201 | Created | Sukses POST |
| 204 | No Content | Sukses DELETE (gak ada body) |
| 400 | Bad Request | Input gak valid |
| 401 | Unauthorized | Belum login |
| 403 | Forbidden | Gak punya akses |
| 404 | Not Found | Resource gak ada |
| 409 | Conflict | Duplikat / bentrok data |
| 422 | Unprocessable Entity | Validasi logic gagal |
| 500 | Internal Server Error | Error server |

```typescript
app.get('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID harus angka' });
  }

  const user = users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'User tidak ditemukan' });
  }

  res.status(200).json({ data: user });
});

app.delete('/api/users/:id', (req, res) => {
  // ... hapus user
  res.status(204).send(); // 204 — No Content, gak ada body
});
```

---

## Middleware

**Middleware** — fungsi yang jalan di antara request masuk dan route handler. Bisa:

- Modifikasi `req` / `res`
- Akhiri request (kirim response)
- Panggil `next()` lanjut ke middleware/route berikutnya

```
Request → Middleware 1 → Middleware 2 → Route Handler → Response
                ↓              ↓
           (modify req)   (auth check)
```

### Global Middleware

```typescript
// Parse JSON body — HARUS ADA
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next(); // wajib — biar lanjut ke route
});

// CORS sederhana
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
```

### Route-Specific Middleware

```typescript
// Middleware khusus route tertentu
const validateId = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID harus angka' });
  }
  next();
};

app.get('/api/users/:id', validateId, (req, res) => {
  // Udah pasti req.params.id angka valid
  res.json({ id: parseInt(req.params.id) });
});

app.delete('/api/users/:id', validateId, (req, res) => {
  // Validasi id ulang? Gak perlu — pake middleware yang sama
  // ...
  res.status(204).send();
});
```

### Auth Middleware (Contoh Sederhana)

```typescript
const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.headers['authorization'];

  if (!token || token !== 'Bearer rahasia123') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Simpan info user di req (extend type)
  (req as any).user = { id: 1, name: 'Admin' };
  next();
};

// Protect seluruh route
app.use('/api/admin', authMiddleware);

app.get('/api/admin/dashboard', (req, res) => {
  res.json({ message: 'Welcome admin!', user: (req as any).user });
});
```

---

## Error Handling Middleware

Error handler punya **4 parameter** — Express bisa bedain dari middleware biasa dari jumlah parameter.

```typescript
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[ERROR]', err.message);

  res.status(500).json({
    error: 'Terjadi kesalahan server',
    ...(process.env.NODE_ENV === 'development' && { detail: err.message }),
  });
});
```

> **⚠️ PENTING:** Error handler middleware harus 4 parameter — walau gak pake `next`, tetep deklarasikan. Kalo cuma 3 parameter, Express nganggap itu middleware biasa.

Letakkan error handler **paling akhir** — setelah semua route:

```typescript
app.use(express.json());
app.use(logger);

// Routes
app.get('/api/users', ...);
app.post('/api/users', ...);

// Error handler — TERAKHIR
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});
```

### Async Error Handler

Express 4 gak handle promise rejection otomatis — perlu wrapper:

```typescript
const asyncHandler = (fn: Function) =>
  (req: express.Request, res: express.Response, next: express.NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Pake async handler
app.get('/api/data', asyncHandler(async (req, res) => {
  const data = await getDataFromDatabase();
  res.json({ data });
}));
```

---

## Express Router — Modular Routes

Buat file `src/routes/user.routes.ts`:

```typescript
import { Router, Request, Response } from 'express';

const router = Router();

// Data dummy
interface User {
  id: number;
  name: string;
  email: string;
}
let users: User[] = [];
let nextId = 1;

// GET /api/users
router.get('/', (req: Request, res: Response) => {
  res.json({ data: users, total: users.length });
});

// GET /api/users/:id
router.get('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const user = users.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });
  res.json({ data: user });
});

// POST /api/users
router.post('/', (req: Request, res: Response) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name dan email wajib diisi' });
  }
  const user: User = { id: nextId++, name, email };
  users.push(user);
  res.status(201).json({ data: user });
});

// PUT /api/users/:id
router.put('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ error: 'User tidak ditemukan' });

  const { name, email } = req.body;
  users[idx] = { id, name, email };
  res.json({ data: users[idx] });
});

// DELETE /api/users/:id
router.delete('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ error: 'User tidak ditemukan' });

  users.splice(idx, 1);
  res.status(204).send();
});

export default router;
```

Di `src/index.ts`:

```typescript
import userRoutes from './routes/user.routes';

app.use('/api/users', userRoutes);
```

---

## Latihan

**Latihan 1: TODO Routes**

Bikin route handler untuk TODO list:

- `GET /api/todos` — ambil semua todo
- `GET /api/todos/:id` — ambil todo by id (404 kalo gak ada)
- `POST /api/todos` — buat todo baru (validasi: title wajib, status default "pending")
- `PUT /api/todos/:id` — update todo
- `DELETE /api/todos/:id` — hapus todo (204 kalo sukses)

Gunakan Express Router.

**Latihan 2: Logger Middleware**

Buat middleware custom yang log:

```
[WIB] GET /api/users — 200 — 12ms
[WIB] POST /api/users — 400 — 3ms
```

Gunakan `res.on('finish', ...)` buat dapetin status code setelah response dikirim.

**Latihan 3: Error Handler**

Buat error handler middleware yang:

- Log error lengkap ke console
- Kirim response `{ error: "Internal Server Error" }` dengan status 500
- Di mode development, tambah field `detail` berisi `err.message`
- Uji dengan route yang sengaja throw error

**Latihan 4: Search Route**

Buat route `GET /api/search` yang terima query parameter `q`, `category`, `minPrice`, `maxPrice`. Return array hasil filter dari data dummy. Validasi: kalo `minPrice` > `maxPrice`, return 400.

```typescript
// Contoh: GET /api/search?q=kopi&category=minuman&minPrice=10000&maxPrice=50000
```
