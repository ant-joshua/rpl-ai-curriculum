# 01. REST Principles — Full Deep Dive

## Apa itu REST?

REST (Representational State Transfer) — gaya arsitektur API yang memanfaatkan protokol HTTP. Bukan framework/library, tapi **pola desain**. Diperkenalkan Roy Fielding di disertasi PhD-nya tahun 2000.

## 6 REST Constraints

| Constraint | Penjelasan |
|-----------|-----------|
| **Stateless** | Setiap request berdiri sendiri. Server gak nyimpen session/client context |
| **Client-Server** | Pemisahan client dan server biar masing-masing bisa develop independent |
| **Cacheable** | Response harus explicitly menyebut cacheable atau gak via `Cache-Control` |
| **Uniform Interface** | Interface konsisten: resource identification, representation manipulation, self-descriptive messages, HATEOAS |
| **Layered System** | Client gak perlu tau apakah dia ngomong langsung ke server atau lewat proxy/load balancer |
| **Code on Demand** (optional) | Server bisa kirim executable code (JS) ke client |

### Kenapa 6 Constraints Penting?

Masing-masing constraint punya tujuan:

1. **Stateless** → skalabilitas horizontal. Server mana pun bisa handle request mana pun. Gak ada session affinity.
2. **Client-Server** → frontend & backend evolve independently. Ganti tech stack salah satu gak ngaruh ke yang lain.
3. **Cacheable** → performa. Response yang bisa di-cache mengurangi beban server dan latency.
4. **Uniform Interface** → developer experience. Semua API pake pola yang sama — gampang ditebak.
5. **Layered System** → keamanan & skalabilitas. Bisa taruh load balancer, cache, CDN di antara client dan server tanpa client sadar.
6. **Code on Demand** → ekstensibilitas. Server bisa kirim logic baru ke client.

## Stateless — Contoh Lengkap

```typescript
// ❌ BAD — nyimpen state di server (stateful)
const sessions = new Map<string, { userId: number; role: string }>();

app.post('/api/login', (req, res) => {
  const user = authenticate(req.body);
  const token = crypto.randomUUID();
  sessions.set(token, { userId: user.id, role: user.role }); // State di server!
  res.json({ token });
});

app.get('/api/profile', (req, res) => {
  const token = req.headers['authorization'];
  const session = sessions.get(token); // Butuh akses shared state
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  // ...
});

// ✅ GOOD — stateless (JWT)
import jwt from 'jsonwebtoken';

app.post('/api/login', (req, res) => {
  const user = authenticate(req.body);
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
  res.json({ token }); // State di client!
});

app.get('/api/profile', (req, res) => {
  const token = req.headers['authorization'];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    res.json({ userId: payload.userId });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});
```

## Resource-Based — URL Naming Rules

### Verbs vs Nouns

```typescript
// ❌ BAD — pake verb di URL (RPC style, bukan REST)
GET /api/getUsers
POST /api/createUser
GET /api/deleteUser?id=5
POST /api/updateUser
GET /api/getUserOrders

// ✅ GOOD — pake nouns (resources) + HTTP methods
GET    /api/users              // list users
POST   /api/users              // create user
GET    /api/users/:id          // detail user
PUT    /api/users/:id          // replace user
PATCH  /api/users/:id          // partial update user
DELETE /api/users/:id          // hapus user
GET    /api/users/:id/orders   // list orders milik user
```

### Naming Conventions

```
✅ /api/users                    — Plural nouns
✅ /api/users/:id                — Specific resource
✅ /api/users/:id/orders         — Sub-resource (hierarchical)
✅ /api/products?category=elec   — Filter via query param
✅ /api/users/:id/orders/:oid    — Deep nesting
❌ /api/user                     — Singular
❌ /api/getUserOrders            — Verb in URL
❌ /api/users/userOrders         — Mixed naming
```

### Actions yang bukan CRUD

Kalo ada aksi yang gak cocok CREATE/READ/UPDATE/DELETE:

```
// ❌ BAD — action as resource
POST /api/users/activate
POST /api/users/deactivate
POST /api/users/reset-password

// ✅ GOOD — treat as sub-resource or use specific endpoint
POST /api/users/:id/activate
POST /api/users/:id/deactivate
POST /api/users/:id/password-reset
POST /api/auth/reset-password  (kalo bukan per-user)
```

## HTTP Methods & Status Codes

### Methods — Detail

| Method | Fungsi | Idempotent | Safe | Request Body | Response |
|--------|--------|-----------|------|-------------|----------|
| `GET` | Ambil resource | ✅ | ✅ | ❌ | 200 OK |
| `POST` | Create resource | ❌ | ❌ | ✅ | 201 Created |
| `PUT` | Replace resource (full update) | ✅ | ❌ | ✅ | 200 OK |
| `PATCH` | Partial update | ❌* | ❌ | ✅ | 200 OK |
| `DELETE` | Hapus resource | ✅ | ❌ | ❌ | 204 No Content |
| `HEAD` | Sama kaya GET, cuma header doang | ✅ | ✅ | ❌ | 200 (no body) |
| `OPTIONS` | Cek method apa aja yang didukung | ✅ | ✅ | ❌ | 200 (Allow header) |

> *PATCH gak idempotent secara spec kalo pake JSON Patch (RFC 6902), tapi banyak implementasi bikin idempotent. Hati-hati.
> HEAD dan OPTIONS jarang diimplementasi manual — Express handle otomatis.

### Status Codes — Lengkap + Contoh

| Kode | Nama | Kapan Pake | Contoh Response |
|------|------|-----------|-----------------|
| **200** | OK | Sukses GET, PUT, PATCH | `{ data: user }` |
| **201** | Created | Sukses POST (create) | `{ data: newUser }` + `Location: /api/users/42` |
| **204** | No Content | Sukses DELETE, PUT tanpa return | No body |
| **301** | Moved Permanently | Resource pindah URL permanen | `Location: /api/v2/users` |
| **304** | Not Modified | Cache masih valid (ETag) | No body |
| **400** | Bad Request | Input gak valid | `{ error: "Email harus valid" }` |
| **401** | Unauthorized | Belom login / token gak valid | `{ error: "Token expired" }` |
| **403** | Forbidden | Udah login tapi gak punya akses | `{ error: "Role admin diperlukan" }` |
| **404** | Not Found | Resource gak ditemuin | `{ error: "User ID 99 gak ada" }` |
| **405** | Method Not Allowed | Endpoint ada tapi method salah | `Allow: GET, POST` |
| **409** | Conflict | Duplicate / state conflict | `{ error: "Email udah terdaftar" }` |
| **422** | Unprocessable Entity | Validasi logic (contoh: email udah terdaftar) | `{ errors: { email: ["Sudah terdaftar"] } }` |
| **429** | Too Many Requests | Rate limit exceeded | `Retry-After: 60` |
| **500** | Internal Server Error | Error server (jangan bocorin detail) | `{ error: "Terjadi error internal" }` |
| **502** | Bad Gateway | Upstream server error | `{ error: "Service sementara gak available" }` |
| **503** | Service Unavailable | Maintenance / overload | `{ error: "Maintenance" }` |

### Implementasi Lengkap Express

```typescript
import express, { Request, Response } from 'express';
const app = express();
app.use(express.json());

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

const users: User[] = [];

// GET /api/users — 200
app.get('/api/users', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: users,
    total: users.length,
  });
});

// POST /api/users — 201
app.post('/api/users', (req: Request, res: Response) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({
      success: false,
      message: 'Name dan email wajib diisi',
    });
  }
  const newUser: User = {
    id: users.length + 1,
    name,
    email,
    createdAt: new Date(),
  };
  users.push(newUser);
  res.status(201).json({
    success: true,
    data: newUser,
  });
});

// GET /api/users/:id — 200 / 404
app.get('/api/users/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID harus angka' });
  }
  const user = users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'User gak ditemuin' });
  }
  res.json({ success: true, data: user });
});

// PUT /api/users/:id — 200 / 404
app.put('/api/users/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const user = users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'User gak ditemuin' });
  }
  // PUT = replace entire resource
  user.name = req.body.name;
  user.email = req.body.email;
  res.json({ success: true, data: user });
});

// PATCH /api/users/:id — 200 / 404
app.patch('/api/users/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const user = users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'User gak ditemuin' });
  }
  // PATCH = hanya update field yang dikirim
  if (req.body.name) user.name = req.body.name;
  if (req.body.email) user.email = req.body.email;
  res.json({ success: true, data: user });
});

// DELETE /api/users/:id — 204
app.delete('/api/users/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const index = users.findIndex(u => u.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'User gak ditemuin' });
  }
  users.splice(index, 1);
  res.status(204).send();
});
```

## URL Design Best Practices — Extended

### 1. Plural nouns

```
✅ /api/users
✅ /api/products
❌ /api/user
❌ /api/product
```

### 2. Hierarchical resources

```
GET    /api/users/:id/orders          // orders milik user tertentu
GET    /api/users/:id/orders/:orderId // detail order
POST   /api/users/:id/orders          // bikin order baru
```

Maksimal 3 level nesting — lebih dari itu susah dibaca.

```
❌ /api/users/:id/orders/:oid/items/:iid/reviews
✅ /api/orders/:oid/items/:iid/reviews  (skip user, gak relevan di situ)
```

### 3. Query params untuk filter, sort, pagination

```
GET /api/users?role=admin&status=active        # Filtering
GET /api/users?sort=name&order=asc              # Sorting
GET /api/users?page=2&limit=20                  # Pagination
GET /api/products?category=elec&minPrice=100000 # Range filter
GET /api/orders?startDate=2024-01-01&endDate=2024-12-31  # Date range
GET /api/users?search=budi                      # Search
GET /api/users?fields=id,name,email             # Field selection
```

### 4. Versioning

```
✅ /api/v1/users
✅ /api/v2/users
✅ Accept: application/vnd.myapp.v1+json
```

(Lebih detail di sesi 4 — Versioning & Security)

### 5. Consistent casing

```
✅ /api/users/:userId/order-items   — kebab-case di URL
✅ /api/users/:userId/orderItems   — camelCase di URL
❌ /api/users/:user_id/order_items — snake_case di URL jarang dipake
```

Tapi **camelCase** lebih umum di JSON response. Pilih satu dan konsisten.

### 6. Trailing slashes

```
✅ /api/users        — tanpa trailing slash
❌ /api/users/       — trailing slash (bikin ambiguity)
```

Konsisten: pilih tanpa trailing slash.

### 7. Pagination Links di Response

API yang return list **wajib** sertakan pagination metadata + links:

```json
GET /api/users?page=2&limit=10
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 10,
    "total": 47,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": true
  },
  "_links": {
    "self": { "href": "/api/users?page=2&limit=10", "method": "GET" },
    "first": { "href": "/api/users?page=1&limit=10", "method": "GET" },
    "prev": { "href": "/api/users?page=1&limit=10", "method": "GET" },
    "next": { "href": "/api/users?page=3&limit=10", "method": "GET" },
    "last": { "href": "/api/users?page=5&limit=10", "method": "GET" }
  }
}
```

Pagination links penting untuk **client-side navigation** tanpa perlu client tau logika page/limit.

## HATEOAS — Hypermedia as Engine of Application State

HATEOAS = constraint REST yang paling sering diabaikan. Intinya: response API harus berisi **link** yang ngasih tau client apa yang bisa dilakukan selanjutnya.

### Tanpa HATEOAS

```json
GET /api/users/1
{
  "id": 1,
  "name": "Budi",
  "email": "budi@mail.com"
}
```

Client tebak sendiri: bisa GET /api/users/1/orders? bisa DELETE? gak tau.

### Dengan HATEOAS

```json
GET /api/users/1
{
  "id": 1,
  "name": "Budi",
  "email": "budi@mail.com",
  "_links": {
    "self": { "href": "/api/users/1", "method": "GET" },
    "orders": { "href": "/api/users/1/orders", "method": "GET" },
    "update": { "href": "/api/users/1", "method": "PATCH" },
    "delete": { "href": "/api/users/1", "method": "DELETE" },
    "collection": { "href": "/api/users", "method": "GET" }
  }
}
```

Client tau persis apa yang bisa dilakukan — tanpa baca dokumentasi.

### Implementasi HATEOAS

```typescript
interface Link {
  href: string;
  method: string;
  rel?: string;
}

interface HATEOASResponse<T> {
  data: T;
  _links: Record<string, Link>;
}

function addLinks<T>(data: T, links: Record<string, Link>): HATEOASResponse<T> {
  return { data, _links: links };
}

// GET /api/users/:id — dengan HATEOAS links
app.get('/api/users/:id', userMiddleware, (req: Request, res: Response) => {
  const user = req.user; // dari middleware
  const userId = user.id;

  const response = addLinks(user, {
    self: { href: `/api/users/${userId}`, method: 'GET' },
    orders: { href: `/api/users/${userId}/orders`, method: 'GET' },
    update: { href: `/api/users/${userId}`, method: 'PATCH' },
    delete: { href: `/api/users/${userId}`, method: 'DELETE' },
    collection: { href: '/api/users', method: 'GET' },
  });

  res.json(response);
});

// GET /api/users — list dengan HATEOAS
app.get('/api/users', authMiddleware, (req: Request, res: Response) => {
  const paginatedUsers = users.slice(0, 10);

  const data = paginatedUsers.map(user => addLinks(user, {
    self: { href: `/api/users/${user.id}`, method: 'GET' },
    orders: { href: `/api/users/${user.id}/orders`, method: 'GET' },
  }));

  res.json({
    data,
    total: users.length,
    _links: {
      self: { href: '/api/users?page=1', method: 'GET' },
      next: { href: '/api/users?page=2', method: 'GET' },
      create: { href: '/api/users', method: 'POST' },
    },
  });
});

// POST /api/users — dengan HATEOAS redirect
app.post('/api/users', (req, res) => {
  const newUser = createUser(req.body);
  res.status(201)
    .location(`/api/users/${newUser.id}`)
    .json(addLinks(newUser, {
      self: { href: `/api/users/${newUser.id}`, method: 'GET' },
      update: { href: `/api/users/${newUser.id}`, method: 'PATCH' },
      delete: { href: `/api/users/${newUser.id}`, method: 'DELETE' },
    }));
});
```

### Keuntungan HATEOAS

1. **Discoverability** — client tau apa yang bisa dilakukan tanpa dokumentasi
2. **Decoupling** — server bisa ubah URL structure, client tinggal ikutin `_links`
3. **State machine** — response bisa beda-beda link tergantung state (contoh: kalo order status "shipped", gak ada link "cancel")

### HATEOAS dengan Conditional Links

```typescript
app.get('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === parseInt(req.params.id));

  const links: Record<string, Link> = {
    self: { href: `/api/orders/${order.id}`, method: 'GET' },
    collection: { href: '/api/orders', method: 'GET' },
  };

  // Conditional links — tergantung state order
  if (order.status === 'pending') {
    links.pay = { href: `/api/orders/${order.id}/pay`, method: 'POST' };
    links.cancel = { href: `/api/orders/${order.id}`, method: 'DELETE' };
  } else if (order.status === 'shipped') {
    links.track = { href: `/api/orders/${order.id}/tracking`, method: 'GET' };
  }

  res.json(addLinks(order, links));
});
```

## Versioning Strategies — Overview

| Strategy | Contoh | Kelebihan | Kekurangan |
|----------|--------|-----------|------------|
| **URL Path** | `/api/v1/users` | Jelas, cacheable, bisa coexist | URL berubah |
| **Header** | `Accept: application/vnd.myapp.v1+json` | URL bersih | Susah di-cache, ribet client |
| **Query Param** | `/api/users?version=1` | Gampang di-test | Polusi query, cache buruk |

Detail implementasi di sesi 4.

## Caching — Pengantar

### Cache Headers yang Wajib Dipahami

| Header | Contoh | Fungsi |
|--------|--------|--------|
| `Cache-Control` | `public, max-age=3600` | Aturan caching utama |
| `ETag` | `"33a64df5..."` | Hash konten — validasi cache |
| `Last-Modified` | `Wed, 21 Oct 2024 07:28:00 GMT` | Timestamp — validasi cache |
| `Expires` | `Thu, 01 Dec 2024 16:00:00 GMT` | Tanggal expire (HTTP/1.0, legacy) |
| `Vary` | `Accept-Encoding` | Cache key berdasarkan header tertentu |

Detail implementasi di sesi 3.

## Latihan

1. **Refactor URL** — Ubah endpoint berikut jadi RESTful:
   - `GET /api/getAllProducts`
   - `POST /api/createProduct`
   - `GET /api/deleteProduct?id=5`
   - `POST /api/updateProduct`
   Tulis Express route handler versi RESTful-nya.

2. **Hierarchical Endpoints** — Buat endpoint `GET /api/users/:id/orders` yang return orders milik user tertentu. Handle status code 200 (ketemu), 404 (user gak ada), 400 (id bukan angka valid). Tulis kode TypeScript Express.

3. **Helper Functions** — Dari daftar status code: 200, 201, 204, 400, 401, 403, 404, 409, 422, 429, 500. Buat Express middleware/helper function `sendSuccess(res, data, statusCode?)` dan `sendError(res, message, statusCode?)` yang konsisten formatnya.

4. **PATCH Endpoint** — Bikin route `PATCH /api/users/:id` buat partial update user. Validasi: kalo body kosong return 400. Kalo user gak ditemuin return 404. Kalo email udah dipake user lain return 409. Pake kode TypeScript Express.

5. **HATEOAS Implementation** — Tambahin `_links` ke endpoint GET /api/users/:id dan POST /api/users. Include self, update, delete, collection links. Untuk endpoint list (GET /api/users), tambah pagination links (self, next, prev, first, last).

6. **Pagination Links** — Buat endpoint GET /api/users dengan pagination links di `_links`. Response harus sertakan: self, first, prev (kalo ada), next (kalo ada), last. Gunakan query params page & limit.

7. **Consistent Error Response** — Buat interface ErrorResponse `{ success: boolean, message: string, errors?: Record<string, string[]>, timestamp: string }`. Implementasikan di semua route handler Express. Pastikan format konsisten untuk semua status code (400, 404, 409, 500).

8. **Conditional HATEOAS** — Buat endpoint `GET /api/orders/:id` dengan HATEOAS conditional links. Kalo status = 'pending' → ada link 'pay' dan 'cancel'. Kalo status = 'shipped' → ada link 'track'. Kalo status = 'delivered' → ada link 'review'.

9. **REST Design Review** — Cari API publik (GitHub API, Stripe API, atau lainnya). Analisis:
   - Apakah URL structure RESTful?
   - Apakah pake HATEOAS?
   - Gimana versioning strategy-nya?
   - Status code yang dipake?
   - Tulis laporan 1 paragraf

10. **Stateless Demo** — Buat 2 versi login endpoint: stateful (session di Map server) vs stateless (JWT). Demonstrasikan bahwa server restart gak ngaruh ke JWT tapi session hilang.
