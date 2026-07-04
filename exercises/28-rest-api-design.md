# REST API Design — Latihan

## Level 1: Dasar

### 1. URL Design — Resource Naming
**Pertanyaan:** Mana URL yang sesuai prinsip REST? Jelaskan kenapa yang lain salah.

1. `/getUser?id=5`
2. `/users/5`
3. `/users/show/5`
4. `/users/5/`
5. `/users?id=5`

**Hint:** REST pake noun, bukan verb. ID sebagai path parameter, bukan query string.

---

### 2. HTTP Methods — Operasi CRUD
**Pertanyaan:** Cocokkan method HTTP dengan operasi yang tepat:

| Method | Operasi |
|--------|---------|
| GET | a. Hapus resource |
| POST | b. Update sebagian resource |
| PUT | c. Buat resource baru |
| PATCH | d. Ambil resource |
| DELETE | e. Replace resource (atau buat jika belum ada) |

**Hint:** POST ≠ PUT. POST buat baru di koleksi, PUT replace entire resource.

---

### 3. Status Code — Respons yang Tepat
**Pertanyaan:** Untuk tiap skenario, pilih status code yang benar:

1. Client request user yang nggak ada di database
2. Client berhasil create user baru
3. Client request tanpa token autentikasi
4. Client request dengan token, tapi nggak punya akses
5. Server error (database down)

Pilihan: 200, 201, 400, 401, 403, 404, 500

**Hint:** 201 = Created (bukan 200). 401 = Unauthenticated, 403 = Unauthorized (forbidden).

---

### 4. Error Response — Format Konsisten
**Pertanyaan:** Desain format response error yang konsisten untuk API. Contoh kasus:

- Validasi gagal (email sudah terdaftar)
- Resource tidak ditemukan
- Internal server error

Buat struktur JSON yang mencakup: `error`, `message`, `code`, dan `details` (optional).

**Hint:** Contoh format:
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Email sudah terdaftar",
  "code": 409,
  "details": { "field": "email", "reason": "duplicate" }
}
```

---

### 5. Pagination — Dasar
**Pertanyaan:** Endpoint `GET /users` mengembalikan 1000 user. Desain response dengan pagination yang mencakup:

- Data user (halaman 1, 10 item per halaman)
- Total data
- Total halaman
- Link ke halaman berikutnya dan sebelumnya

**Hint:** Format response:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "per_page": 10,
    "total": 1000,
    "total_pages": 100,
    "next": "/users?page=2",
    "prev": null
  }
}
```

---

### 6. OpenAPI Spec — Define Endpoint Sederhana
**Pertanyaan:** Tulis OpenAPI 3.0 spec untuk endpoint `GET /api/v1/users/{id}` yang mengembalikan:

```json
{
  "id": 1,
  "name": "Budi Santoso",
  "email": "budi@email.com",
  "created_at": "2026-01-01T00:00:00Z"
}
```

**Hint:** Gunakan format YAML. Jangan lupa definisi `components/schemas/User`.

---

### 7. Versioning — Strategi
**Pertanyaan:** Ada 2 strategi versioning API yang umum:

1. **URL-based:** `/api/v1/users`, `/api/v2/users`
2. **Header-based:** `Accept: application/vnd.api+json;version=2`

**Pertanyaan:**
1. Sebutkan kelebihan dan kekurangan masing-masing
2. Mana yang lebih mudah di-debug? Kenapa?
3. Kasus mana yang cocok untuk tiap strategi?

**Hint:** URL-based lebih transparan dan mudah di-cache. Header-based lebih "bersih" secara RESTful.

---

### 8. Express — Route Definition
```javascript
const express = require('express');
const app = express();
app.use(express.json());
```

**Pertanyaan:** Tulis route handler Express untuk:
- `GET /api/items` — return array items
- `POST /api/items` — tambah item baru, return 201
- `GET /api/items/:id` — cari item by id, return 404 kalau nggak ada
- `DELETE /api/items/:id` — hapus item, return 204

**Hint:** `res.status(201).json(data)`, `res.sendStatus(204)`.

---

## Level 2: Intermediate

### 9. URL Design — Relasi Resource
**Pertanyaan:** Desain URL untuk skenario e-commerce:

1. Lihat semua order milik user dengan ID 5
2. Lihat detail item dalam order dengan ID 10
3. Tambah item ke order dengan ID 10
4. Lihat review untuk produk dengan ID 3
5. Tambah review untuk produk dengan ID 3 oleh user dengan ID 5

**Hint:** Hierarki resource: `/users/:userId/orders`, `/orders/:orderId/items`, `/products/:productId/reviews`.

---

### 10. Express + Validation — Error Handling
```javascript
// Kode yang perlu diperbaiki
app.post('/api/users', (req, res) => {
  const { name, email, age } = req.body;
  
  // Simpan ke database
  const user = db.users.create({ name, email, age });
  
  res.json({ data: user });
});
```

**Pertanyaan:** Tambahkan validasi dan error handling:
1. `name` harus string minimal 3 karakter
2. `email` harus format email valid
3. `age` harus number antara 17-99
4. Kalau validasi gagal, return 400 dengan pesan error detail per field
5. Kalau database error, return 500 dengan format error konsisten (pakai try-catch)

**Hint:** Buat fungsi `validateCreateUser` terpisah. Jangan campur validasi di route handler.

---

### 11. Pagination — Cursor-based
**Pertanyaan:** Implementasi pagination biasa (offset-based) punya kelemahan: kalau ada data baru masuk, halaman bisa geser.

Buat endpoint `GET /api/posts` yang menggunakan **cursor-based pagination** (pakai `created_at` atau `id` sebagai cursor).

**Pertanyaan:**
1. Apa perbedaan utama offset vs cursor pagination?
2. Desain request dan response untuk cursor-based pagination
3. Tulis query SQL (pseudo) untuk ambil data setelah cursor tertentu

**Hint:** Request: `GET /api/posts?cursor=1678900000&limit=10`. Response: `{ data: [...], next_cursor: 1678900123, has_more: true }`.

---

### 12. OpenAPI Spec — Full CRUD
**Pertanyaan:** Tulis OpenAPI 3.0 spec untuk resource `Task` dengan operasi:

1. `GET /tasks` — list tasks (dengan pagination query params: `page`, `per_page`)
2. `POST /tasks` — create task (body: `title` required, `description` optional)
3. `GET /tasks/{id}` — get task by id
4. `PUT /tasks/{id}` — update task (body: `title`, `description`, `completed`)
5. `DELETE /tasks/{id}` — delete task

Sertakan response 400, 404, dan 500 untuk tiap endpoint yang relevan.

**Hint:** Gunakan `components/schemas` untuk `Task`, `CreateTaskInput`, `UpdateTaskInput`, `ErrorResponse`.

---

### 13. Express — Middleware Autentikasi & Logging
**Pertanyaan:** Buat 2 middleware Express:

1. **`authMiddleware`** — Baca header `Authorization: Bearer <token>`, verifikasi JWT, set `req.user`. Return 401 kalau token invalid/missing.
2. **`loggerMiddleware`** — Catat method, URL, status code, dan response time (dalam ms) ke console.

Terapkan `authMiddleware` ke semua route `/api/protected/*`.

**Hint:** `res.on('finish', () => { ... })` untuk log setelah response terkirim. `Date.now()` untuk hitung response time.

```javascript
// Template
function authMiddleware(req, res, next) {
  // ...
}

function loggerMiddleware(req, res, next) {
  // ...
}

app.use('/api/protected', authMiddleware, protectedRouter);
```

---

### 14. Error Handling — Global Error Handler Express
**Pertanyaan:** Buat global error handler middleware yang menangani:

1. **ValidationError** (custom class) → 400
2. **NotFoundError** (custom class) → 404
3. **UnauthorizedError** (custom class) → 401
4. Error lainnya → 500

Format respons konsisten:
```json
{
  "error": "NOT_FOUND",
  "message": "User dengan id 5 tidak ditemukan",
  "timestamp": "2026-07-04T10:00:00Z"
}
```

**Hint:** Buat custom error classes: `class NotFoundError extends Error { constructor(message) { super(message); this.name = 'NotFoundError'; this.statusCode = 404; } }`

Middleware: `app.use((err, req, res, next) => { ... })`.

---

## Level 3: Challenge

### 15. Full Express API — E-commerce API
**Pertanyaan:** Implementasi endpoint-endpoint berikut dalam Express (tulis kode lengkap, database bisa pake array in-memory):

**Products:**
- `GET /api/v1/products` — list produk, support `?category=`, `?min_price=`, `?max_price=`, `?q=` (search), pagination
- `GET /api/v1/products/:id` — detail produk
- `POST /api/v1/products` — create produk (admin only)
- `PUT /api/v1/products/:id` — update produk (admin only)
- `DELETE /api/v1/products/:id` — soft-delete produk (admin only)

**Orders:**
- `POST /api/v1/orders` — create order dari cart
- `GET /api/v1/orders` — list orders user (user bisa lihat punya sendiri, admin lihat semua)
- `GET /api/v1/orders/:id` — detail order
- `PATCH /api/v1/orders/:id/status` — update status order (admin only)

Persyaratan:
- Middleware autentikasi (JWT)
- Middleware role-based access (admin/user)
- Validasi input
- Error handling global
- Pagination
- Response format konsisten

**Hint:** Struktur folder:
```
src/
  controllers/
  middlewares/
  routes/
  models/
  validators/
  utils/
```

---

### 16. OpenAPI Spec + Code Generation
**Pertanyaan:** Diberikan OpenAPI spec berikut:
```yaml
openapi: 3.0.0
info:
  title: Blog API
  version: 1.0.0
paths:
  /posts:
    get:
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
      responses:
        '200':
          description: Daftar posts
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Post'
    post:
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreatePostInput'
      responses:
        '201':
          description: Post created
components:
  schemas:
    Post:
      type: object
      properties:
        id:
          type: integer
        title:
          type: string
        content:
          type: string
        created_at:
          type: string
          format: date-time
    CreatePostInput:
      type: object
      required: [title, content]
      properties:
        title:
          type: string
          minLength: 5
        content:
          type: string
          minLength: 10
```

**Pertanyaan:**
1. Implementasi Express route yang SESUAI dengan spec di atas (termasuk validasi)
2. Apa yang kurang dari spec di atas? (minimal 3 kekurangan)
3. Tambahkan response docs untuk error 400 dan 500

**Hint:** Bandingkan spec dengan best practices: apakah ada definisi error? Apakah pagination response sudah di-spec? Apakah ada contoh response?

---

### 17. API Versioning & Deprecation Strategy
**Skenario:** API v1 sudah berjalan 2 tahun. Kamu mau release v2 dengan breaking changes:
- Response format berubah (field `name` dipecah jadi `firstName`, `lastName`)
- Endpoint `GET /users` sekarang pakai cursor pagination, bukan offset
- Beberapa endpoint di-rename

**Pertanyaan:**
1. Desain strategi migrasi dari v1 ke v2 yang meminimalkan dampak ke existing client
2. Tulis middleware deprecation warning untuk v1 yang kasih header `Warning: 299 - "API v1 will be deprecated on 2027-01-01"`
3. Berapa lama waktu yang ideal untuk transisi? Apa yang terjadi setelah tanggal deprecation?
4. Gimana cara komunikasi perubahan ke client?

**Hint:** Sunset header: `Sunset: Sat, 01 Jan 2027 00:00:00 GMT`. Beri minimum 6 bulan transisi. Dokumentasi perubahan di changelog.

---

### 18. Performance & Security — API Hardening
**Pertanyaan:** API kamu sekarang produksi. Tambahkan protection berikut:

1. **Rate limiting** — Max 100 request per menit per IP. Kalau exceeded, return 429 dengan header `Retry-After`
2. **Input sanitization** — Strip HTML tags dari semua input string (cegah XSS)
3. **CORS** — Hanya allow origin `https://app.example.com`
4. **Security headers** — Tambahkan `Helmet.js` atau set manual: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security: max-age=31536000`
5. **Request size limit** — Batasi body request max 1MB

**Pertanyaan:** Tulis kode Express untuk semua 5 poin di atas.

**Hint:** Pakai library: `express-rate-limit`, `helmet`, `cors`, `express.json({ limit: '1mb' })`. Untuk sanitasi, buat middleware sendiri: `function sanitize(req, res, next) { ... }`.
