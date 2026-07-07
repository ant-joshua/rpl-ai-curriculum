# Week 03: REST API — Express CRUD Buku

## Tujuan

Membangun **REST API** untuk manajemen data buku menggunakan **Express.js** dengan penyimpanan in-memory array. Challenge ini menguji pemahaman tentang routing, middleware, dan RESTful conventions.

## Acceptance Criteria

- [ ] API berjalan di port 3000
- [ ] **GET /buku** — mengembalikan array semua buku
- [ ] **GET /buku/:id** — mengembalikan satu buku berdasarkan ID
- [ ] **POST /buku** — menambahkan buku baru (validasi required fields)
- [ ] **PUT /buku/:id** — mengupdate data buku
- [ ] **DELETE /buku/:id** — menghapus buku
- [ ] Setiap buku memiliki: `id`, `judul`, `pengarang`, `tahun`, `isbn`
- [ ] Response format JSON dengan wrapper: `{ success: true, data: ... }`
- [ ] Validasi: judul dan pengarang wajib diisi → return 400 jika kosong
- [ ] Buku tidak ditemukan → return 404
- [ ] Menggunakan Express Router (bukan langsung di app.js)

## Step-by-Step

1. **Inisialisasi project**
   ```bash
   mkdir -p challenges/submissions/week-03/nama-kamu
   cd challenges/submissions/week-03/nama-kamu
   npm init -y
   npm install express
   ```
2. **Buat struktur file**
   ```
   .
   ├── app.js          (entry point)
   ├── routes/
   │   └── buku.js     (route handler)
   └── package.json
   ```
3. **Entry point** (`app.js`):
   ```js
   const express = require('express');
   const bukuRoutes = require('./routes/buku');
   const app = express();
   app.use(express.json());
   app.use('/buku', bukuRoutes);
   app.listen(3000);
   ```
4. **Route handler** (`routes/buku.js`):
   - Gunakan `express.Router()`
   - Array in-memory: `let books = []`
   - Auto-increment ID dengan counter
5. **Implementasi endpoint**
   - `GET /buku` → return semua buku
   - `GET /buku/:id` → cari buku, 404 jika tidak ada
   - `POST /buku` → validasi judul & pengarang, push ke array
   - `PUT /buku/:id` → cari, update field, return data baru
   - `DELETE /buku/:id` → filter array, return message
6. **Error handling middleware** di app.js
7. **Test manual dengan curl** atau Postman

### Contoh Request/Response

```bash
# Tambah buku
curl -X POST http://localhost:3000/buku \
  -H "Content-Type: application/json" \
  -d '{"judul":"Laskar Pelangi","pengarang":"Andrea Hirata","tahun":2005,"isbn":"9789793062790"}'

# Response
{"success":true,"data":{"id":1,"judul":"Laskar Pelangi","pengarang":"Andrea Hirata","tahun":2005,"isbn":"9789793062790"}}
```

```bash
# Cari buku tidak ada
curl http://localhost:3000/buku/999
# Response: {"success":false,"message":"Buku dengan ID 999 tidak ditemukan"}
```

## Bonus (Optional)

- ✅ Filter dan search: `GET /buku?judul=pelangi&pengarang=andrea`
- ✅ Pagination: `GET /buku?page=1&limit=10`
- ✅ Middleware logger (method, url, timestamp)
- ✅ Response time header (`X-Response-Time`)

## Submission

```
challenges/submissions/week-03/nama-kamu/
├── app.js
├── routes/
│   └── buku.js
└── package.json
```

Buat Pull Request dengan judul `[Week 03] REST API Buku - Nama Kamu` dan sertakan screenshot hasil test di terminal/Postman.
