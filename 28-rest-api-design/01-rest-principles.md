# 28.1 REST Principles

## Apa itu REST?

REST (Representational State Transfer) — gaya arsitektur API yang memanfaatkan protokol HTTP. Bukan framework/library, tapi **pola desain**.

## 6 REST Constraints

| Constraint | Penjelasan |
|------------|-----------|
| **Stateless** | Setiap request berdiri sendiri. Server gak nyimpen session/client context |
| **Client-Server** | Pemisahan client dan server biar masing-masing bisa develop independent |
| **Cacheable** | Response harus explicitly menyebut cacheable atau gak via `Cache-Control` |
| **Uniform Interface** | Interface konsisten: resource identification, representation manipulation, self-descriptive messages, HATEOAS |
| **Layered System** | Client gak perlu tau apakah dia ngomong langsung ke server atau lewat proxy/load balancer |
| **Code on Demand** (optional) | Server bisa kirim executable code (JS) ke client |

## Stateless — Contoh

```typescript
// ❌ BAD — nyimpen state di server
const sessions = new Map<string, { userId: number }>();

app.get('/api/profile', (req, res) => {
  const token = req.headers['authorization'];
  const session = sessions.get(token);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  // ...
});

// ✅ GOOD — semua state dikirim client tiap request (JWT)
app.get('/api/profile', (req, res) => {
  const token = req.headers['authorization'];
  const payload = verifyJwt(token); // stateless — tinggal verify
  // ...
});
```

## Resource-Based — URL Naming

```typescript
// ❌ BAD — pake verb di URL
GET /api/getUsers
POST /api/createUser
GET /api/deleteUser?id=5

// ✅ GOOD — pake nouns (resources)
GET    /api/users          // list users
POST   /api/users          // create user
DELETE /api/users/:id      // hapus user
GET    /api/users/:id      // detail user
```

## HTTP Methods & Status Codes

### Methods

| Method | Fungsi | Idempotent | Safe |
|--------|--------|-----------|------|
| `GET` | Ambil resource | ✅ | ✅ |
| `POST` | Create resource | ❌ | ❌ |
| `PUT` | Replace resource (full update) | ✅ | ❌ |
| `PATCH` | Partial update | ❌* | ❌ |
| `DELETE` | Hapus resource | ✅ | ❌ |

> *PATCH gak idempotent secara spec kalo pake JSON Patch (RFC 6902), tapi banyak implementasi bikin idempotent. Hati-hati.

### Status Codes — Lengkap

| Kode | Nama | Kapan Pake |
|------|------|-----------|
| **200** | OK | Sukses GET, PUT, PATCH |
| **201** | Created | Sukses POST (create) |
| **204** | No Content | Sukses DELETE (gak ada response body) |
| **301** | Moved Permanently | Resource pindah URL |
| **304** | Not Modified | Cache masih valid (ETag/If-None-Match) |
| **400** | Bad Request | Input gak valid |
| **401** | Unauthorized | Belom login / token gak valid |
| **403** | Forbidden | Udah login tapi gak punya akses |
| **404** | Not Found | Resource gak ditemuin |
| **405** | Method Not Allowed | Endpoint ada tapi method salah |
| **409** | Conflict | Duplicate / state conflict |
| **422** | Unprocessable Entity | Validasi logic (contoh: email udah terdaftar) |
| **429** | Too Many Requests | Rate limit exceeded |
| **500** | Internal Server Error | Error server (jangan bocorin detail) |
| **502** | Bad Gateway | Upstream server error |
| **503** | Service Unavailable | Maintenance / overload |

```typescript
// Contoh implementasi
import express, { Request, Response } from 'express';
const app = express();
app.use(express.json());

interface User {
  id: number;
  name: string;
  email: string;
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
    return res.status(400).json({ // 400 — Bad Request
      success: false,
      message: 'Name dan email wajib diisi',
    });
  }
  const newUser: User = { id: users.length + 1, name, email };
  users.push(newUser);
  res.status(201).json({ success: true, data: newUser });
});

// DELETE /api/users/:id — 204
app.delete('/api/users/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const index = users.findIndex(u => u.id === id);
  if (index === -1) {
    return res.status(404).json({ // 404 — Not Found
      success: false,
      message: 'User gak ditemuin',
    });
  }
  users.splice(index, 1);
  res.status(204).send(); // 204 — No Content
});
```

## URL Design Best Practices

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

### 3. Query params untuk filter

```
GET /api/users?role=admin&status=active
GET /api/products?category=electronics&minPrice=100000
GET /api/orders?startDate=2024-01-01&endDate=2024-12-31
```

### 4. Versioning

```
✅ /api/v1/users
✅ /api/v2/users
```

(Lebih detail di sesi 4 — Versioning & Security)

### 5. Consistent casing — pake kebab-case atau camelCase

```
✅ /api/users/:userId/order-items
✅ /api/users/:userId/orderItems
❌ /api/users/:user_id/order_items (snake_case di URL jarang dipake)
```

Tapi **camelCase** lebih umum di JSON response.

## Latihan

1. Refactor URL berikut jadi RESTful: `GET /api/getAllProducts`, `POST /api/createProduct`, `GET /api/deleteProduct?id=5`. Tulis Express route handler versi RESTful-nya.

2. Buat endpoint `GET /api/users/:id/orders` yang return orders milik user tertentu. Handle status code 200 (ketemu), 404 (user gak ada), 400 (id bukan angka valid). Tulis kode TypeScript Express.

3. Dari daftar status code: 200, 201, 204, 400, 401, 403, 404, 409, 422, 429, 500. Buat Express middleware/helper function `sendSuccess(res, data, statusCode?)` dan `sendError(res, message, statusCode?)` yang konsisten.

4. Bikin route `PATCH /api/users/:id` buat partial update user. Validasi: kalo body kosong return 400. Kalo user gak ditemuin return 404. Kalo email udah dipake user lain return 409. Pake kode TypeScript Express.
